import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { getChallengeEloMultiplier, updateEloAfterMatch } from './elo.service';
import { footballApiService } from './football-api.service';

const prisma = new PrismaClient();

/**
 * Create a new 1v1 challenge
 */
export async function createChallenge(
  challengerId: string,
  challengedId: string,
  leagueId: string
): Promise<any> {
  // Validate: can't challenge yourself
  if (challengerId === challengedId) {
    throw new Error('Cannot challenge yourself');
  }

  // Check if players are in the same active tournament
  const sharedTournament = await prisma.tournamentPlayer.findFirst({
    where: {
      userId: challengerId,
      tournament: {
        status: { in: ['GROUP_STAGE', 'KNOCKOUT'] },
        players: { some: { userId: challengedId } },
      },
    },
  });

  if (sharedTournament) {
    throw new Error('Cannot challenge a player in the same active tournament');
  }

  // Check active challenge limit
  const maxActiveSetting = await prisma.adminSetting.findUnique({
    where: { key: 'challenge_max_active' },
  });
  const maxActive = maxActiveSetting ? parseInt(maxActiveSetting.value) : config.defaults.challengeMaxActive;

  const activeChallenges = await prisma.challenge.count({
    where: {
      challengerId,
      status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] },
    },
  });

  if (activeChallenges >= maxActive) {
    throw new Error(`Maximum ${maxActive} active challenges allowed`);
  }

  // Get league info for determining the upcoming round
  const league = await prisma.league.findUnique({ where: { id: leagueId } });
  if (!league) throw new Error('League not found');

  const currentSeason = new Date().getFullYear();
  const currentRound = await footballApiService.getCurrentRound(league.apiFootballId, currentSeason);

  // Calculate expiry
  const expirySetting = await prisma.adminSetting.findUnique({
    where: { key: 'challenge_expiry_hours' },
  });
  const expiryHours = expirySetting ? parseInt(expirySetting.value) : config.defaults.challengeExpiryHours;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiryHours);

  // Get ELO multiplier for this matchup
  const eloMultiplier = await getChallengeEloMultiplier(challengerId, challengedId);

  // Create challenge
  const challenge = await prisma.challenge.create({
    data: {
      challengerId,
      challengedId,
      leagueId,
      leagueRound: currentRound,
      expiresAt,
      eloMultiplier,
    },
    include: {
      challenger: { select: { id: true, username: true, eloRating: true, favoriteClub: true } },
      challenged: { select: { id: true, username: true, eloRating: true, favoriteClub: true } },
      league: { select: { name: true } },
    },
  });

  // Notify challenged player
  await prisma.notification.create({
    data: {
      userId: challengedId,
      type: 'CHALLENGE_RECEIVED',
      title: 'Challenge Received! ⚔️',
      message: `${challenge.challenger.username} challenged you to a 1v1 prediction match`,
      data: { challengeId: challenge.id },
    },
  });

  return challenge;
}

/**
 * Accept a challenge
 */
export async function acceptChallenge(challengeId: string, userId: string): Promise<any> {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: { challenger: { select: { username: true } } },
  });

  if (!challenge) throw new Error('Challenge not found');
  if (challenge.challengedId !== userId) throw new Error('Not your challenge to accept');
  if (challenge.status !== 'PENDING') throw new Error('Challenge is no longer pending');
  if (new Date() > challenge.expiresAt) throw new Error('Challenge has expired');

  const updated = await prisma.challenge.update({
    where: { id: challengeId },
    data: { status: 'ACCEPTED' },
  });

  // Notify challenger
  await prisma.notification.create({
    data: {
      userId: challenge.challengerId,
      type: 'CHALLENGE_ACCEPTED',
      title: 'Challenge Accepted! ⚔️',
      message: `Your challenge has been accepted! Make your predictions.`,
      data: { challengeId },
    },
  });

  return updated;
}

/**
 * Reject a challenge
 */
export async function rejectChallenge(challengeId: string, userId: string): Promise<void> {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });

  if (!challenge) throw new Error('Challenge not found');
  if (challenge.challengedId !== userId) throw new Error('Not your challenge to reject');
  if (challenge.status !== 'PENDING') throw new Error('Challenge is no longer pending');

  await prisma.challenge.update({
    where: { id: challengeId },
    data: { status: 'REJECTED' },
  });

  await prisma.notification.create({
    data: {
      userId: challenge.challengerId,
      type: 'CHALLENGE_REJECTED',
      title: 'Challenge Declined',
      message: 'Your challenge was declined.',
      data: { challengeId },
    },
  });
}

/**
 * Score a completed challenge
 */
export async function scoreChallenge(challengeId: string): Promise<void> {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      predictions: { include: { fixture: true } },
    },
  });

  if (!challenge) throw new Error('Challenge not found');

  // Idempotency guard: don't score an already-completed challenge
  if (challenge.status === 'COMPLETED') {
    console.log(`[SCORING] Challenge ${challengeId} already completed, skipping`);
    return;
  }

  // Count correct predictions for each player
  let challengerScore = 0;
  let challengedScore = 0;

  for (const pred of challenge.predictions) {
    const f = pred.fixture;
    if (f.homeScore === null || f.awayScore === null || f.isExcluded) continue;

    const actual = f.homeScore > f.awayScore ? 'HOME' : f.homeScore < f.awayScore ? 'AWAY' : 'DRAW';
    const correct = pred.prediction === actual;

    await prisma.challengePrediction.update({
      where: { id: pred.id },
      data: { isCorrect: correct },
    });

    if (pred.userId === challenge.challengerId && correct) challengerScore++;
    if (pred.userId === challenge.challengedId && correct) challengedScore++;
  }

  // Determine winner
  let winnerId: string | null = null;
  if (challengerScore > challengedScore) winnerId = challenge.challengerId;
  else if (challengedScore > challengerScore) winnerId = challenge.challengedId;
  // Draw = no winner

  // Update challenge
  await prisma.challenge.update({
    where: { id: challengeId },
    data: {
      challengerScore,
      challengedScore,
      winnerId,
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  // Update ELO with multiplier
  await updateEloAfterMatch(
    challenge.challengerId,
    challenge.challengedId,
    challengerScore,
    challengedScore,
    'CHALLENGE',
    challengeId,
    challenge.eloMultiplier
  );

  // Notifications
  const [challenger, challenged] = await Promise.all([
    prisma.user.findUnique({ where: { id: challenge.challengerId }, select: { username: true } }),
    prisma.user.findUnique({ where: { id: challenge.challengedId }, select: { username: true } }),
  ]);

  const scoreText = `${challengerScore}–${challengedScore}`;

  await prisma.notification.createMany({
    data: [
      {
        userId: challenge.challengerId,
        type: 'CHALLENGE_RESULT',
        title: winnerId === challenge.challengerId ? 'Challenge Won! 🏆' : winnerId ? 'Challenge Lost' : 'Challenge Draw 🤝',
        message: `${challenger?.username} ${scoreText} ${challenged?.username}`,
        data: { challengeId, score: scoreText },
      },
      {
        userId: challenge.challengedId,
        type: 'CHALLENGE_RESULT',
        title: winnerId === challenge.challengedId ? 'Challenge Won! 🏆' : winnerId ? 'Challenge Lost' : 'Challenge Draw 🤝',
        message: `${challenger?.username} ${scoreText} ${challenged?.username}`,
        data: { challengeId, score: scoreText },
      },
    ],
  });
}

/**
 * Expire old pending challenges (run via cron)
 */
export async function expirePendingChallenges(): Promise<number> {
  const expired = await prisma.challenge.updateMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: new Date() },
    },
    data: { status: 'EXPIRED' },
  });

  // Notify challengers
  const expiredChallenges = await prisma.challenge.findMany({
    where: { status: 'EXPIRED', expiresAt: { lt: new Date() } },
    select: { id: true, challengerId: true },
  });

  for (const ch of expiredChallenges) {
    await prisma.notification.create({
      data: {
        userId: ch.challengerId,
        type: 'CHALLENGE_EXPIRED',
        title: 'Challenge Expired',
        message: 'Your challenge expired without a response.',
        data: { challengeId: ch.id },
      },
    });
  }

  return expired.count;
}
