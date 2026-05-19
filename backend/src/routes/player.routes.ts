import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Security: Max pagination limits
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;

// GET /api/players — List all players
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : undefined;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE));

  const where: any = { isActive: true, role: 'PLAYER' };
  if (search && search.length >= 2) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      // Don't search by email — privacy
    ];
  }

  const [players, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, username: true, eloRating: true,
        favoriteClub: true, profilePhoto: true, country: true,
        createdAt: true,
        // Never expose: email, passwordHash, role
      },
      orderBy: { eloRating: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ players, pagination: { page, limit, total } });
});

// GET /api/players/:id — Player profile
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const player = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true, username: true, eloRating: true,
      favoriteClub: true, profilePhoto: true, country: true,
      createdAt: true, role: true,
      // Never expose: email, passwordHash
    },
  });

  if (!player) return res.status(404).json({ error: 'Player not found' });

  // Career stats
  const totalPredictions = await prisma.prediction.count({
    where: { userId: req.params.id },
  });

  const correctPredictions = await prisma.prediction.count({
    where: { userId: req.params.id, isCorrect: true },
  });

  const tournamentsPlayed = await prisma.tournamentPlayer.count({
    where: { userId: req.params.id },
  });

  // H2H record
  const h2hMatches = await prisma.h2HMatch.findMany({
    where: {
      OR: [{ player1Id: req.params.id }, { player2Id: req.params.id }],
      result: { not: 'PENDING' },
    },
  });

  let wins = 0, draws = 0, losses = 0;
  for (const match of h2hMatches) {
    const isP1 = match.player1Id === req.params.id;
    if (match.result === 'DRAW') draws++;
    else if ((isP1 && match.result === 'PLAYER1_WIN') || (!isP1 && match.result === 'PLAYER2_WIN')) wins++;
    else losses++;
  }

  const challengeWins = await prisma.challenge.count({
    where: { winnerId: req.params.id, status: 'COMPLETED' },
  });

  const totalChallenges = await prisma.challenge.count({
    where: {
      OR: [{ challengerId: req.params.id }, { challengedId: req.params.id }],
      status: 'COMPLETED',
    },
  });

  // ELO history (last 365 days)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const eloHistory = await prisma.eloHistory.findMany({
    where: { userId: req.params.id, createdAt: { gte: oneYearAgo } },
    orderBy: { createdAt: 'asc' },
    select: { eloAfter: true, eloChange: true, matchType: true, createdAt: true },
  });

  // Recent H2H matches (limit 10)
  const recentMatches = await prisma.h2HMatch.findMany({
    where: {
      OR: [{ player1Id: req.params.id }, { player2Id: req.params.id }],
      result: { not: 'PENDING' },
    },
    include: {
      player1: { select: { id: true, username: true, favoriteClub: true } },
      player2: { select: { id: true, username: true, favoriteClub: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  res.json({
    player,
    stats: {
      totalPredictions,
      correctPredictions,
      accuracy: totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 0,
      tournamentsPlayed,
      h2hRecord: { wins, draws, losses, total: wins + draws + losses },
      challengeRecord: { wins: challengeWins, total: totalChallenges },
    },
    eloHistory,
    recentMatches,
  });
});

export default router;
