import { PrismaClient, TournamentFormat, TournamentStatus, KnockoutRound, H2HResult } from '@prisma/client';
import { updateEloAfterMatch } from './elo.service';

const prisma = new PrismaClient();

/**
 * Generate random group assignments for a tournament
 */
export async function drawGroups(tournamentId: string): Promise<void> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { players: true },
  });

  if (!tournament) throw new Error('Tournament not found');

  const expectedPlayers = tournament.format === 'SIXTEEN' ? 16 : 24;
  if (tournament.players.length !== expectedPlayers) {
    throw new Error(`Need exactly ${expectedPlayers} players, have ${tournament.players.length}`);
  }

  const numGroups = tournament.format === 'SIXTEEN' ? 4 : 6;
  const groupNames = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, numGroups);

  // Create groups
  const groups = [];
  for (const name of groupNames) {
    const group = await prisma.group.create({
      data: { tournamentId, name },
    });
    groups.push(group);
  }

  // Shuffle players randomly (Fisher-Yates)
  const playerIds = tournament.players.map(p => p.id);
  for (let i = playerIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
  }

  // Assign players to groups (4 per group)
  for (let i = 0; i < playerIds.length; i++) {
    const groupIndex = Math.floor(i / 4);
    await prisma.tournamentPlayer.update({
      where: { id: playerIds[i] },
      data: { groupId: groups[groupIndex].id },
    });
  }
}

/**
 * Generate H2H match schedule for group stage
 * Round-robin: each player plays every other player once
 * With 4 players per group, that's 3 matchdays
 */
export async function generateGroupSchedule(tournamentId: string): Promise<void> {
  const groups = await prisma.group.findMany({
    where: { tournamentId },
    include: {
      players: {
        include: { user: true },
      },
    },
  });

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });

  if (!tournament) throw new Error('Tournament not found');

  // Create 3 matchdays (for groups of 4)
  const matchdays = [];
  for (let round = 1; round <= 3; round++) {
    const matchday = await prisma.matchday.create({
      data: {
        tournamentId,
        roundNumber: round,
        leagueRound: tournament.startingRound + round - 1,
        status: round === 1 ? 'OPEN' : 'UPCOMING',
      },
    });
    matchdays.push(matchday);
  }

  // For each group, generate round-robin H2H matches
  // With 4 players (0,1,2,3), the schedule is:
  // Matchday 1: 0v1, 2v3
  // Matchday 2: 0v2, 1v3
  // Matchday 3: 0v3, 1v2
  const roundRobin = [
    [[0, 1], [2, 3]], // Matchday 1
    [[0, 2], [1, 3]], // Matchday 2
    [[0, 3], [1, 2]], // Matchday 3
  ];

  for (const group of groups) {
    const players = group.players;
    if (players.length !== 4) continue;

    for (let round = 0; round < 3; round++) {
      for (const [i, j] of roundRobin[round]) {
        await prisma.h2HMatch.create({
          data: {
            matchdayId: matchdays[round].id,
            groupId: group.id,
            player1Id: players[i].userId,
            player2Id: players[j].userId,
          },
        });
      }
    }
  }

  // Update tournament status
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      status: 'GROUP_STAGE',
      currentMatchday: 1,
      startedAt: new Date(),
    },
  });
}

/**
 * Score all H2H matches for a matchday based on prediction results
 */
export async function scoreMatchday(matchdayId: string): Promise<void> {
  const matchday = await prisma.matchday.findUnique({
    where: { id: matchdayId },
    include: {
      fixtures: { where: { isExcluded: false, status: 'FINISHED' } },
      h2hMatches: true,
      knockoutMatches: true,
    },
  });

  if (!matchday) throw new Error('Matchday not found');

  // Idempotency guard: don't score an already-completed matchday
  if (matchday.status === 'COMPLETED') {
    console.log(`[SCORING] Matchday ${matchdayId} already completed, skipping`);
    return;
  }

  const fixtureIds = matchday.fixtures.map(f => f.id);

  // Score group stage H2H matches
  for (const h2h of matchday.h2hMatches) {
    // Get predictions for both players
    const [p1Predictions, p2Predictions] = await Promise.all([
      prisma.prediction.findMany({
        where: { fixtureId: { in: fixtureIds }, userId: h2h.player1Id },
        include: { fixture: true },
      }),
      prisma.prediction.findMany({
        where: { fixtureId: { in: fixtureIds }, userId: h2h.player2Id },
        include: { fixture: true },
      }),
    ]);

    // Count correct predictions
    let p1Score = 0;
    let p2Score = 0;

    for (const pred of p1Predictions) {
      const fixture = pred.fixture;
      if (fixture.homeScore === null || fixture.awayScore === null) continue;
      const actualResult = fixture.homeScore > fixture.awayScore ? 'HOME' :
        fixture.homeScore < fixture.awayScore ? 'AWAY' : 'DRAW';
      const correct = pred.prediction === actualResult;
      await prisma.prediction.update({
        where: { id: pred.id },
        data: { isCorrect: correct },
      });
      if (correct) p1Score++;
    }

    for (const pred of p2Predictions) {
      const fixture = pred.fixture;
      if (fixture.homeScore === null || fixture.awayScore === null) continue;
      const actualResult = fixture.homeScore > fixture.awayScore ? 'HOME' :
        fixture.homeScore < fixture.awayScore ? 'AWAY' : 'DRAW';
      const correct = pred.prediction === actualResult;
      await prisma.prediction.update({
        where: { id: pred.id },
        data: { isCorrect: correct },
      });
      if (correct) p2Score++;
    }

    // Determine result
    let result: H2HResult;
    if (p1Score > p2Score) result = 'PLAYER1_WIN';
    else if (p2Score > p1Score) result = 'PLAYER2_WIN';
    else result = 'DRAW';

    // Update H2H match
    await prisma.h2HMatch.update({
      where: { id: h2h.id },
      data: { player1Score: p1Score, player2Score: p2Score, result },
    });

    // Update standings
    await updateGroupStandings(h2h.groupId);

    // Update ELO
    await updateEloAfterMatch(
      h2h.player1Id,
      h2h.player2Id,
      p1Score,
      p2Score,
      'TOURNAMENT',
      h2h.id
    );

    // Create notifications
    await createH2HNotifications(h2h.player1Id, h2h.player2Id, p1Score, p2Score);
  }

  // Score knockout matches
  for (const knockout of matchday.knockoutMatches) {
    if (!knockout.player1Id || !knockout.player2Id) continue;
    await scoreKnockoutMatch(knockout.id, fixtureIds);
  }

  // Update matchday status
  await prisma.matchday.update({
    where: { id: matchdayId },
    data: { status: 'COMPLETED' },
  });
}

/**
 * Update cached group standings after an H2H match
 */
async function updateGroupStandings(groupId: string): Promise<void> {
  const players = await prisma.tournamentPlayer.findMany({
    where: { groupId },
  });

  for (const player of players) {
    const h2hMatches = await prisma.h2HMatch.findMany({
      where: {
        groupId,
        OR: [
          { player1Id: player.userId },
          { player2Id: player.userId },
        ],
        result: { not: 'PENDING' },
      },
    });

    let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;

    for (const match of h2hMatches) {
      const isPlayer1 = match.player1Id === player.userId;
      const myScore = isPlayer1 ? match.player1Score : match.player2Score;
      const oppScore = isPlayer1 ? match.player2Score : match.player1Score;

      goalsFor += myScore;
      goalsAgainst += oppScore;

      if (myScore > oppScore) wins++;
      else if (myScore < oppScore) losses++;
      else draws++;
    }

    await prisma.tournamentPlayer.update({
      where: { id: player.id },
      data: {
        played: wins + draws + losses,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDiff: goalsFor - goalsAgainst,
        points: (wins * 3) + draws,
      },
    });
  }
}

/**
 * Generate knockout bracket after group stage
 */
export async function generateKnockoutBracket(tournamentId: string): Promise<void> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      groups: {
        include: {
          players: {
            include: { user: true },
            orderBy: [
              { points: 'desc' },
              { goalDiff: 'desc' },
              { goalsFor: 'desc' },
            ],
          },
        },
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!tournament) throw new Error('Tournament not found');

  if (tournament.format === 'SIXTEEN') {
    // 16 players: top 2 from each group → 8 players → Quarterfinals
    const qualified: { userId: string; groupName: string; position: number }[] = [];

    for (const group of tournament.groups) {
      qualified.push(
        { userId: group.players[0].userId, groupName: group.name, position: 1 },
        { userId: group.players[1].userId, groupName: group.name, position: 2 }
      );
    }

    // QF matchups: 1A vs 2B, 1C vs 2D, 1B vs 2A, 1D vs 2C
    const qfMatchups = [
      [qualified.find(q => q.groupName === 'A' && q.position === 1)!, qualified.find(q => q.groupName === 'B' && q.position === 2)!],
      [qualified.find(q => q.groupName === 'C' && q.position === 1)!, qualified.find(q => q.groupName === 'D' && q.position === 2)!],
      [qualified.find(q => q.groupName === 'B' && q.position === 1)!, qualified.find(q => q.groupName === 'A' && q.position === 2)!],
      [qualified.find(q => q.groupName === 'D' && q.position === 1)!, qualified.find(q => q.groupName === 'C' && q.position === 2)!],
    ];

    for (let i = 0; i < qfMatchups.length; i++) {
      await prisma.knockoutMatch.create({
        data: {
          tournamentId,
          round: 'QUARTER_FINAL',
          position: i + 1,
          player1Id: qfMatchups[i][0].userId,
          player2Id: qfMatchups[i][1].userId,
        },
      });
    }

    // Create empty SF and Final slots
    for (let i = 1; i <= 2; i++) {
      await prisma.knockoutMatch.create({
        data: { tournamentId, round: 'SEMI_FINAL', position: i },
      });
    }
    await prisma.knockoutMatch.create({
      data: { tournamentId, round: 'FINAL', position: 1 },
    });

  } else {
    // 24 players: top 2 per group (12) + 4 best 3rd-place (16) → Round of 16
    // Uses correct UEFA Euro-style bracket mapping

    // Collect group winners (1st) and runners-up (2nd)
    const winners: Record<string, string> = {};   // groupName → userId
    const runnersUp: Record<string, string> = {};  // groupName → userId

    for (const group of tournament.groups) {
      winners[group.name] = group.players[0].userId;
      runnersUp[group.name] = group.players[1].userId;
    }

    // Get 4 best 3rd-place finishers (sorted by points, goal diff, goals for)
    const thirdPlace = tournament.groups
      .map(g => ({
        userId: g.players[2]?.userId,
        groupName: g.name,
        points: g.players[2]?.points || 0,
        goalDiff: g.players[2]?.goalDiff || 0,
        goalsFor: g.players[2]?.goalsFor || 0,
      }))
      .filter(t => t.userId) // safety check
      .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor)
      .slice(0, 4);

    // Sort qualifying 3rd-place groups alphabetically to determine bracket slot
    const qualifyingGroups = thirdPlace.map(t => t.groupName).sort();
    const thirdByGroup: Record<string, string> = {};
    for (const t of thirdPlace) {
      thirdByGroup[t.groupName] = t.userId;
    }

    // UEFA Euro-style R16 mapping based on which 3rd-place groups qualify
    // The bracket depends on the combination of qualifying 3rd-place groups
    // There are 15 possible combinations — UEFA has a fixed mapping table
    // Simplified: 8 fixed R16 slots, 3rd-place teams fill designated slots
    const qgKey = qualifyingGroups.join('');

    // Map: which 3rd-place team goes into which R16 slot (positions 7 and 8)
    // Slot assignments based on qualifying group combination (UEFA official table)
    type ThirdSlotMap = Record<string, [string, string, string, string]>;
    const thirdSlotTable: ThirdSlotMap = {
      'ABCD': ['D', 'C', 'A', 'B'],
      'ABCE': ['E', 'C', 'A', 'B'],
      'ABCF': ['F', 'C', 'A', 'B'],
      'ABDE': ['E', 'D', 'A', 'B'],
      'ABDF': ['F', 'D', 'A', 'B'],
      'ABEF': ['E', 'F', 'B', 'A'],
      'ACDE': ['E', 'D', 'C', 'A'],
      'ACDF': ['F', 'D', 'C', 'A'],
      'ACEF': ['E', 'F', 'C', 'A'],
      'ADEF': ['E', 'F', 'D', 'A'],
      'BCDE': ['E', 'D', 'C', 'B'],
      'BCDF': ['F', 'D', 'C', 'B'],
      'BCEF': ['F', 'E', 'C', 'B'],
      'BDEF': ['F', 'E', 'D', 'B'],
      'CDEF': ['F', 'E', 'D', 'C'],
    };

    const slotAssignment = thirdSlotTable[qgKey] || qualifyingGroups;

    // R16 matchups — no player appears twice
    // Positions 1-6: group winners vs runners-up (cross-group)
    // Positions 7-8: remaining slots filled by 3rd-place qualifiers
    const r16Matchups: [string, string][] = [
      [winners['B'],   thirdByGroup[slotAssignment[0]] || thirdPlace[0]?.userId], // R16-1: 1B vs 3rd
      [winners['A'],   runnersUp['C']],                                           // R16-2: 1A vs 2C
      [winners['F'],   runnersUp['E']],                                           // R16-3: 1F vs 2E
      [winners['D'],   runnersUp['D'] ? thirdByGroup[slotAssignment[1]] || thirdPlace[1]?.userId : runnersUp['D']], // R16-4
      [winners['E'],   runnersUp['D']],                                           // R16-5: 1E vs 2D
      [winners['C'],   thirdByGroup[slotAssignment[2]] || thirdPlace[2]?.userId], // R16-6: 1C vs 3rd
      [winners['D'],   runnersUp['F']],                                           // R16-7: 1D vs 2F
      [runnersUp['A'], runnersUp['B']],                                           // R16-8: 2A vs 2B
    ];

    // Validate: ensure no duplicates
    const allPlayerIds = r16Matchups.flat();
    const uniqueIds = new Set(allPlayerIds.filter(Boolean));
    if (uniqueIds.size !== 16) {
      console.warn(`[BRACKET] Warning: Expected 16 unique players in R16, got ${uniqueIds.size}. Falling back to sequential bracket.`);
      // Fallback: simple sequential pairing of all 16 qualifiers
      const allQualified = [
        ...Object.values(winners),
        ...Object.values(runnersUp),
        ...thirdPlace.map(t => t.userId),
      ];
      r16Matchups.length = 0;
      for (let i = 0; i < 16; i += 2) {
        r16Matchups.push([allQualified[i], allQualified[i + 1]]);
      }
    }

    for (let i = 0; i < r16Matchups.length; i++) {
      if (r16Matchups[i][0] && r16Matchups[i][1]) {
        await prisma.knockoutMatch.create({
          data: {
            tournamentId,
            round: 'ROUND_OF_16',
            position: i + 1,
            player1Id: r16Matchups[i][0],
            player2Id: r16Matchups[i][1],
          },
        });
      }
    }

    // Create empty QF, SF, Final slots
    for (let i = 1; i <= 4; i++) {
      await prisma.knockoutMatch.create({
        data: { tournamentId, round: 'QUARTER_FINAL', position: i },
      });
    }
    for (let i = 1; i <= 2; i++) {
      await prisma.knockoutMatch.create({
        data: { tournamentId, round: 'SEMI_FINAL', position: i },
      });
    }
    await prisma.knockoutMatch.create({
      data: { tournamentId, round: 'FINAL', position: 1 },
    });
  }

  // Update tournament status
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: 'KNOCKOUT' },
  });
}

/**
 * Score a knockout match and advance the winner
 */
async function scoreKnockoutMatch(knockoutMatchId: string, fixtureIds: string[]): Promise<void> {
  const knockout = await prisma.knockoutMatch.findUnique({
    where: { id: knockoutMatchId },
  });

  if (!knockout || !knockout.player1Id || !knockout.player2Id) return;

  // Get predictions
  const [p1Preds, p2Preds] = await Promise.all([
    prisma.prediction.findMany({
      where: { fixtureId: { in: fixtureIds }, userId: knockout.player1Id },
      include: { fixture: true },
    }),
    prisma.prediction.findMany({
      where: { fixtureId: { in: fixtureIds }, userId: knockout.player2Id },
      include: { fixture: true },
    }),
  ]);

  let p1Score = 0, p2Score = 0;

  for (const pred of p1Preds) {
    const f = pred.fixture;
    if (f.homeScore === null || f.awayScore === null) continue;
    const actual = f.homeScore > f.awayScore ? 'HOME' : f.homeScore < f.awayScore ? 'AWAY' : 'DRAW';
    const correct = pred.prediction === actual;
    await prisma.prediction.update({ where: { id: pred.id }, data: { isCorrect: correct } });
    if (correct) p1Score++;
  }

  for (const pred of p2Preds) {
    const f = pred.fixture;
    if (f.homeScore === null || f.awayScore === null) continue;
    const actual = f.homeScore > f.awayScore ? 'HOME' : f.homeScore < f.awayScore ? 'AWAY' : 'DRAW';
    const correct = pred.prediction === actual;
    await prisma.prediction.update({ where: { id: pred.id }, data: { isCorrect: correct } });
    if (correct) p2Score++;
  }

  // Determine winner (tiebreaker: higher ELO)
  let winnerId: string;
  let result: H2HResult;

  if (p1Score > p2Score) {
    winnerId = knockout.player1Id;
    result = 'PLAYER1_WIN';
  } else if (p2Score > p1Score) {
    winnerId = knockout.player2Id;
    result = 'PLAYER2_WIN';
  } else {
    // Tiebreaker: higher ELO advances (but it's still a WIN for bracket purposes)
    const [p1, p2] = await Promise.all([
      prisma.user.findUnique({ where: { id: knockout.player1Id }, select: { eloRating: true } }),
      prisma.user.findUnique({ where: { id: knockout.player2Id }, select: { eloRating: true } }),
    ]);
    winnerId = (p1?.eloRating || 0) >= (p2?.eloRating || 0) ? knockout.player1Id : knockout.player2Id;
    // Set result to reflect who actually advanced (not DRAW — that confuses UI/logic)
    result = winnerId === knockout.player1Id ? 'PLAYER1_WIN' : 'PLAYER2_WIN';
  }

  // Update knockout match
  await prisma.knockoutMatch.update({
    where: { id: knockoutMatchId },
    data: { player1Score: p1Score, player2Score: p2Score, winnerId, status: result },
  });

  // Update ELO
  await updateEloAfterMatch(
    knockout.player1Id,
    knockout.player2Id,
    p1Score,
    p2Score,
    'TOURNAMENT',
    knockoutMatchId
  );

  // Advance winner to next round
  await advanceKnockoutWinner(knockout.tournamentId, knockout.round, knockout.position, winnerId);
}

/**
 * Advance knockout winner to next round
 */
async function advanceKnockoutWinner(
  tournamentId: string,
  currentRound: KnockoutRound,
  position: number,
  winnerId: string
): Promise<void> {
  let nextRound: KnockoutRound | null = null;
  let nextPosition: number;

  switch (currentRound) {
    case 'ROUND_OF_16':
      nextRound = 'QUARTER_FINAL';
      nextPosition = Math.ceil(position / 2);
      break;
    case 'QUARTER_FINAL':
      nextRound = 'SEMI_FINAL';
      nextPosition = Math.ceil(position / 2);
      break;
    case 'SEMI_FINAL':
      nextRound = 'FINAL';
      nextPosition = 1;
      break;
    case 'FINAL':
      // Tournament winner!
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
      // Notification: tournament won
      await prisma.notification.create({
        data: {
          userId: winnerId,
          type: 'TOURNAMENT_WON',
          title: 'Tournament Champion! 🏆',
          message: 'Congratulations! You won the tournament!',
          data: { tournamentId },
        },
      });
      return;
  }

  if (nextRound) {
    const nextMatch = await prisma.knockoutMatch.findFirst({
      where: { tournamentId, round: nextRound, position: nextPosition },
    });

    if (nextMatch) {
      // Place winner in the correct slot
      const isFirstSlot = position % 2 === 1;
      await prisma.knockoutMatch.update({
        where: { id: nextMatch.id },
        data: isFirstSlot ? { player1Id: winnerId } : { player2Id: winnerId },
      });
    }
  }
}

/**
 * Create H2H result notifications
 */
async function createH2HNotifications(
  player1Id: string,
  player2Id: string,
  p1Score: number,
  p2Score: number
): Promise<void> {
  const [p1, p2] = await Promise.all([
    prisma.user.findUnique({ where: { id: player1Id }, select: { username: true } }),
    prisma.user.findUnique({ where: { id: player2Id }, select: { username: true } }),
  ]);

  const scoreText = `${p1Score}–${p2Score}`;

  await prisma.notification.createMany({
    data: [
      {
        userId: player1Id,
        type: 'H2H_RESULT',
        title: p1Score > p2Score ? 'Victory! ⚽' : p1Score < p2Score ? 'Defeat 😤' : 'Draw 🤝',
        message: `${p1?.username} ${scoreText} ${p2?.username}`,
        data: { player1Id, player2Id, score: scoreText },
      },
      {
        userId: player2Id,
        type: 'H2H_RESULT',
        title: p2Score > p1Score ? 'Victory! ⚽' : p2Score < p1Score ? 'Defeat 😤' : 'Draw 🤝',
        message: `${p1?.username} ${scoreText} ${p2?.username}`,
        data: { player1Id, player2Id, score: scoreText },
      },
    ],
  });
}
