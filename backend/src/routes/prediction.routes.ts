import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// GET /api/predictions/matchday/:matchdayId — Get my predictions for a matchday
router.get('/matchday/:matchdayId', authenticate, async (req: AuthRequest, res: Response) => {
  const predictions = await prisma.prediction.findMany({
    where: { userId: req.user!.id, fixture: { matchdayId: req.params.matchdayId } },
    include: {
      fixture: {
        include: {
          homeClub: { select: { id: true, name: true, logoUrl: true, shortName: true } },
          awayClub: { select: { id: true, name: true, logoUrl: true, shortName: true } },
        },
      },
    },
  });
  res.json(predictions);
});

// POST /api/predictions — Submit prediction
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      fixtureId: z.string().uuid(),
      prediction: z.enum(['HOME', 'DRAW', 'AWAY']),
    });

    const data = schema.parse(req.body);

    // Get fixture with lock check
    const fixture = await prisma.fixture.findUnique({
      where: { id: data.fixtureId },
      include: { matchday: true },
    });

    if (!fixture) return res.status(404).json({ error: 'Fixture not found' });

    // Check if prediction is locked (5 min before kickoff)
    const lockSetting = await prisma.adminSetting.findUnique({ where: { key: 'prediction_lock_minutes_before' } });
    const lockMinutes = lockSetting ? parseInt(lockSetting.value) : 5;
    const lockTime = new Date(fixture.kickoffTime.getTime() - lockMinutes * 60 * 1000);

    if (new Date() >= lockTime) {
      return res.status(400).json({ error: 'Predictions are locked for this match' });
    }

    if (fixture.isExcluded) {
      return res.status(400).json({ error: 'This match has been excluded' });
    }

    // Check if user is in the tournament
    const isPlayer = await prisma.tournamentPlayer.findFirst({
      where: { tournament: { matchdays: { some: { id: fixture.matchdayId } } }, userId: req.user!.id },
    });

    if (!isPlayer) return res.status(403).json({ error: 'You are not in this tournament' });

    // Upsert prediction
    const prediction = await prisma.prediction.upsert({
      where: { fixtureId_userId: { fixtureId: data.fixtureId, userId: req.user!.id } },
      update: { prediction: data.prediction },
      create: {
        fixtureId: data.fixtureId,
        userId: req.user!.id,
        prediction: data.prediction,
      },
    });

    res.json(prediction);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Failed to submit prediction' });
  }
});

// POST /api/predictions/batch — Submit multiple predictions at once
router.post('/batch', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      predictions: z.array(z.object({
        fixtureId: z.string().uuid(),
        prediction: z.enum(['HOME', 'DRAW', 'AWAY']),
      })),
    });

    const { predictions } = schema.parse(req.body);
    const results = [];

    for (const pred of predictions) {
      const fixture = await prisma.fixture.findUnique({ where: { id: pred.fixtureId } });
      if (!fixture || fixture.isExcluded) continue;

      const lockSetting = await prisma.adminSetting.findUnique({ where: { key: 'prediction_lock_minutes_before' } });
      const lockMinutes = lockSetting ? parseInt(lockSetting.value) : 5;
      const lockTime = new Date(fixture.kickoffTime.getTime() - lockMinutes * 60 * 1000);

      if (new Date() >= lockTime) continue;

      const prediction = await prisma.prediction.upsert({
        where: { fixtureId_userId: { fixtureId: pred.fixtureId, userId: req.user!.id } },
        update: { prediction: pred.prediction },
        create: {
          fixtureId: pred.fixtureId,
          userId: req.user!.id,
          prediction: pred.prediction,
        },
      });
      results.push(prediction);
    }

    res.json({ submitted: results.length, predictions: results });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Failed to submit predictions' });
  }
});

// GET /api/predictions/h2h/:matchId — Get detailed H2H prediction breakdown
router.get('/h2h/:matchId', authenticate, async (req: AuthRequest, res: Response) => {
  const h2h = await prisma.h2HMatch.findUnique({
    where: { id: req.params.matchId },
    include: {
      player1: { select: { id: true, username: true, favoriteClub: true } },
      player2: { select: { id: true, username: true, favoriteClub: true } },
      matchday: {
        include: {
          fixtures: {
            where: { isExcluded: false },
            include: {
              homeClub: { select: { name: true, logoUrl: true, shortName: true } },
              awayClub: { select: { name: true, logoUrl: true, shortName: true } },
            },
            orderBy: { kickoffTime: 'asc' },
          },
        },
      },
    },
  });

  if (!h2h) return res.status(404).json({ error: 'Match not found' });

  // Only show predictions if matchday is completed or user is one of the players
  const canView = h2h.matchday.status === 'COMPLETED' ||
    req.user!.id === h2h.player1Id || req.user!.id === h2h.player2Id;

  if (!canView) {
    return res.status(403).json({ error: 'Predictions are not yet visible' });
  }

  // Get predictions for both players
  const fixtureIds = h2h.matchday.fixtures.map(f => f.id);

  const [p1Preds, p2Preds] = await Promise.all([
    prisma.prediction.findMany({
      where: { fixtureId: { in: fixtureIds }, userId: h2h.player1Id },
    }),
    prisma.prediction.findMany({
      where: { fixtureId: { in: fixtureIds }, userId: h2h.player2Id },
    }),
  ]);

  const breakdown = h2h.matchday.fixtures.map(fixture => ({
    fixture: {
      id: fixture.id,
      homeClub: fixture.homeClub,
      awayClub: fixture.awayClub,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      status: fixture.status,
    },
    player1Prediction: p1Preds.find(p => p.fixtureId === fixture.id)?.prediction || null,
    player1Correct: p1Preds.find(p => p.fixtureId === fixture.id)?.isCorrect || null,
    player2Prediction: p2Preds.find(p => p.fixtureId === fixture.id)?.prediction || null,
    player2Correct: p2Preds.find(p => p.fixtureId === fixture.id)?.isCorrect || null,
  }));

  res.json({
    match: h2h,
    breakdown,
  });
});

export default router;
