import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createChallenge, acceptChallenge, rejectChallenge } from '../services/challenge.service';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// GET /api/challenges — My challenges (sent and received)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const challenges = await prisma.challenge.findMany({
    where: {
      OR: [
        { challengerId: req.user!.id },
        { challengedId: req.user!.id },
      ],
    },
    include: {
      challenger: { select: { id: true, username: true, eloRating: true, favoriteClub: true, profilePhoto: true } },
      challenged: { select: { id: true, username: true, eloRating: true, favoriteClub: true, profilePhoto: true } },
      league: { select: { name: true, logoUrl: true } },
      winner: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(challenges);
});

// GET /api/challenges/:id — Challenge details
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const challenge = await prisma.challenge.findUnique({
    where: { id: req.params.id },
    include: {
      challenger: { select: { id: true, username: true, eloRating: true, favoriteClub: true, profilePhoto: true } },
      challenged: { select: { id: true, username: true, eloRating: true, favoriteClub: true, profilePhoto: true } },
      league: { select: { name: true, logoUrl: true } },
      winner: { select: { id: true, username: true } },
      predictions: {
        include: {
          fixture: {
            include: {
              homeClub: { select: { name: true, logoUrl: true, shortName: true } },
              awayClub: { select: { name: true, logoUrl: true, shortName: true } },
            },
          },
        },
      },
    },
  });

  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  // Only show opponent predictions after completion
  if (challenge.status !== 'COMPLETED') {
    challenge.predictions = challenge.predictions.filter(p => p.userId === req.user!.id);
  }

  res.json(challenge);
});

// POST /api/challenges — Create challenge
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      challengedId: z.string().uuid(),
      leagueId: z.string().uuid(),
    });

    const data = schema.parse(req.body);
    const challenge = await createChallenge(req.user!.id, data.challengedId, data.leagueId);
    res.status(201).json(challenge);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create challenge' });
  }
});

// POST /api/challenges/:id/accept
router.post('/:id/accept', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const challenge = await acceptChallenge(req.params.id, req.user!.id);
    res.json(challenge);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/challenges/:id/reject
router.post('/:id/reject', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await rejectChallenge(req.params.id, req.user!.id);
    res.json({ message: 'Challenge rejected' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/challenges/:id/predict — Submit challenge predictions
router.post('/:id/predict', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      predictions: z.array(z.object({
        fixtureId: z.string().uuid(),
        prediction: z.enum(['HOME', 'DRAW', 'AWAY']),
      })),
    });

    const { predictions } = schema.parse(req.body);
    const challenge = await prisma.challenge.findUnique({ where: { id: req.params.id } });

    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    if (challenge.status !== 'ACCEPTED' && challenge.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Challenge is not open for predictions' });
    }
    if (req.user!.id !== challenge.challengerId && req.user!.id !== challenge.challengedId) {
      return res.status(403).json({ error: 'Not your challenge' });
    }

    const results = [];
    for (const pred of predictions) {
      const fixture = await prisma.fixture.findUnique({ where: { id: pred.fixtureId } });
      if (!fixture) continue;

      // Check lock time
      const lockMinutes = 5;
      const lockTime = new Date(fixture.kickoffTime.getTime() - lockMinutes * 60 * 1000);
      if (new Date() >= lockTime) continue;

      const prediction = await prisma.challengePrediction.upsert({
        where: {
          challengeId_fixtureId_userId: {
            challengeId: req.params.id,
            fixtureId: pred.fixtureId,
            userId: req.user!.id,
          },
        },
        update: { prediction: pred.prediction },
        create: {
          challengeId: req.params.id,
          fixtureId: pred.fixtureId,
          userId: req.user!.id,
          prediction: pred.prediction,
        },
      });
      results.push(prediction);
    }

    res.json({ submitted: results.length, predictions: results });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to submit predictions' });
  }
});

export default router;
