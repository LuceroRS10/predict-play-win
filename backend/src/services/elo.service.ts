import { PrismaClient, EloMatchType } from '@prisma/client';
import { config } from '../config';

const prisma = new PrismaClient();

interface EloResult {
  player1NewElo: number;
  player2NewElo: number;
  player1Change: number;
  player2Change: number;
}

/**
 * Calculate expected score using ELO formula
 */
function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate new ELO ratings after a match
 * @param player1Elo - Current ELO of player 1
 * @param player2Elo - Current ELO of player 2
 * @param player1Score - H2H score for player 1
 * @param player2Score - H2H score for player 2
 * @param kFactor - Base K-factor (default 32)
 * @param multiplier - ELO multiplier (for diminishing in challenges)
 */
export function calculateElo(
  player1Elo: number,
  player2Elo: number,
  player1Score: number,
  player2Score: number,
  kFactor: number = 32,
  multiplier: number = 1.0
): EloResult {
  // Determine actual score (1 = win, 0.5 = draw, 0 = loss)
  let actualScoreP1: number;
  let actualScoreP2: number;

  if (player1Score > player2Score) {
    actualScoreP1 = 1;
    actualScoreP2 = 0;
  } else if (player1Score < player2Score) {
    actualScoreP1 = 0;
    actualScoreP2 = 1;
  } else {
    actualScoreP1 = 0.5;
    actualScoreP2 = 0.5;
  }

  // Calculate expected scores
  const expectedP1 = expectedScore(player1Elo, player2Elo);
  const expectedP2 = expectedScore(player2Elo, player1Elo);

  // Margin bonus: larger wins get slight ELO boost
  // Max bonus is 50% extra for dominant wins
  const totalPredictions = player1Score + player2Score;
  let marginBonus = 1.0;
  if (totalPredictions > 0) {
    const scoreDiff = Math.abs(player1Score - player2Score);
    const marginRatio = scoreDiff / totalPredictions;
    marginBonus = 1 + (marginRatio * 0.5); // Up to 1.5x for total domination
  }

  // Apply K-factor with margin bonus and multiplier
  const adjustedK = kFactor * marginBonus * multiplier;

  // Calculate ELO changes — use single change to prevent drift from independent rounding
  const player1Change = Math.round(adjustedK * (actualScoreP1 - expectedP1));
  const player2Change = -player1Change; // Zero-sum: no ELO inflation/deflation

  // Apply minimum ELO floor of 100
  const player1NewElo = Math.max(100, player1Elo + player1Change);
  const player2NewElo = Math.max(100, player2Elo + player2Change);

  // Adjust changes to reflect floor clamping
  return {
    player1NewElo,
    player2NewElo,
    player1Change: player1NewElo - player1Elo,
    player2Change: player2NewElo - player2Elo,
  };
}

/**
 * Get the diminishing ELO multiplier for challenge matches
 * Based on how many times these two players have faced each other recently
 */
export async function getChallengeEloMultiplier(
  player1Id: string,
  player2Id: string
): Promise<number> {
  // Get admin settings
  const windowSetting = await prisma.adminSetting.findUnique({
    where: { key: 'challenge_elo_diminish_window_days' },
  });
  const windowDays = windowSetting ? parseInt(windowSetting.value) : config.defaults.challengeEloDiminishWindowDays;

  // Count recent challenges between these two players
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - windowDays);

  const recentChallenges = await prisma.challenge.count({
    where: {
      status: 'COMPLETED',
      completedAt: { gte: windowStart },
      OR: [
        { challengerId: player1Id, challengedId: player2Id },
        { challengerId: player2Id, challengedId: player1Id },
      ],
    },
  });

  // Get multiplier settings
  const matchNumber = recentChallenges + 1; // This will be their Nth match

  if (matchNumber <= 1) return 1.0;

  // Check admin settings for custom multipliers
  // Keys: challenge_elo_match2_multiplier, challenge_elo_match3_multiplier, challenge_elo_match4plus_multiplier
  const keyName = matchNumber >= 4
    ? 'challenge_elo_match4plus_multiplier'
    : `challenge_elo_match${matchNumber}_multiplier`;
  const multiplierSetting = await prisma.adminSetting.findUnique({
    where: { key: keyName },
  });

  if (multiplierSetting) {
    return parseFloat(multiplierSetting.value);
  }

  // Use defaults
  const defaults = config.defaults.challengeEloMultipliers;
  if (matchNumber === 2) return defaults[2];
  if (matchNumber === 3) return defaults[3];
  return defaults[4]; // 4th+ match
}

/**
 * Update ELO ratings after a match and record history
 */
export async function updateEloAfterMatch(
  player1Id: string,
  player2Id: string,
  player1Score: number,
  player2Score: number,
  matchType: EloMatchType,
  matchId: string,
  multiplier: number = 1.0
): Promise<void> {
  // Get current ELO ratings
  const [player1, player2] = await Promise.all([
    prisma.user.findUnique({ where: { id: player1Id }, select: { eloRating: true } }),
    prisma.user.findUnique({ where: { id: player2Id }, select: { eloRating: true } }),
  ]);

  if (!player1 || !player2) throw new Error('Players not found');

  // Get K-factor from admin settings
  const kFactorSetting = await prisma.adminSetting.findUnique({ where: { key: 'elo_k_factor' } });
  const kFactor = kFactorSetting ? parseInt(kFactorSetting.value) : config.defaults.eloKFactor;

  // Get tournament multiplier from admin settings if tournament match
  let finalMultiplier = multiplier;
  if (matchType === 'TOURNAMENT') {
    const tournMultSetting = await prisma.adminSetting.findUnique({ where: { key: 'tournament_elo_multiplier' } });
    finalMultiplier = tournMultSetting ? parseFloat(tournMultSetting.value) : config.defaults.tournamentEloMultiplier;
  }

  // Calculate new ELO
  const result = calculateElo(
    player1.eloRating,
    player2.eloRating,
    player1Score,
    player2Score,
    kFactor,
    finalMultiplier
  );

  // Update in transaction
  await prisma.$transaction([
    // Update player 1 ELO
    prisma.user.update({
      where: { id: player1Id },
      data: { eloRating: result.player1NewElo },
    }),
    // Update player 2 ELO
    prisma.user.update({
      where: { id: player2Id },
      data: { eloRating: result.player2NewElo },
    }),
    // Record player 1 history
    prisma.eloHistory.create({
      data: {
        userId: player1Id,
        eloBefore: player1.eloRating,
        eloAfter: result.player1NewElo,
        eloChange: result.player1Change,
        matchType,
        matchId,
        opponentId: player2Id,
        multiplier: finalMultiplier,
      },
    }),
    // Record player 2 history
    prisma.eloHistory.create({
      data: {
        userId: player2Id,
        eloBefore: player2.eloRating,
        eloAfter: result.player2NewElo,
        eloChange: result.player2Change,
        matchType,
        matchId,
        opponentId: player1Id,
        multiplier: finalMultiplier,
      },
    }),
  ]);
}
