import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { drawGroups, generateGroupSchedule, generateKnockoutBracket, scoreMatchday } from '../services/tournament.service';
import { footballApiService } from '../services/football-api.service';
import { z } from 'zod';
import { logAuditEvent } from '../services/audit.service';

const router = Router();
const prisma = new PrismaClient();

// GET /api/tournaments — List all tournaments
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const tournaments = await prisma.tournament.findMany({
    include: {
      league: { select: { name: true, logoUrl: true } },
      _count: { select: { players: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(tournaments);
});

// GET /api/tournaments/:id — Tournament details
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const tournament = await prisma.tournament.findUnique({
    where: { id: req.params.id },
    include: {
      league: true,
      groups: {
        include: {
          players: {
            include: {
              user: {
                select: { id: true, username: true, eloRating: true, favoriteClub: true, profilePhoto: true, country: true },
              },
            },
            orderBy: [{ points: 'desc' }, { goalDiff: 'desc' }, { goalsFor: 'desc' }],
          },
        },
        orderBy: { name: 'asc' },
      },
      matchdays: {
        include: {
          fixtures: {
            include: {
              homeClub: { select: { id: true, name: true, logoUrl: true, shortName: true } },
              awayClub: { select: { id: true, name: true, logoUrl: true, shortName: true } },
            },
            orderBy: { kickoffTime: 'asc' },
          },
          h2hMatches: {
            include: {
              player1: { select: { id: true, username: true, favoriteClub: true, profilePhoto: true } },
              player2: { select: { id: true, username: true, favoriteClub: true, profilePhoto: true } },
            },
          },
        },
        orderBy: { roundNumber: 'asc' },
      },
      knockouts: {
        include: {
          player1: { select: { id: true, username: true, eloRating: true, favoriteClub: true, profilePhoto: true } },
          player2: { select: { id: true, username: true, eloRating: true, favoriteClub: true, profilePhoto: true } },
          winner: { select: { id: true, username: true } },
        },
        orderBy: [{ round: 'asc' }, { position: 'asc' }],
      },
    },
  });

  if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
  res.json(tournament);
});

// POST /api/tournaments — Create tournament (Admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(3).max(100),
      leagueId: z.string().uuid(),
      format: z.enum(['SIXTEEN', 'TWENTY_FOUR']),
      startingRound: z.number().int().min(1),
    });

    const data = schema.parse(req.body);

    const tournament = await prisma.tournament.create({
      data: {
        name: data.name,
        leagueId: data.leagueId,
        format: data.format,
        startingRound: data.startingRound,
        createdById: req.user!.id,
        status: 'REGISTRATION',
      },
      include: { league: true },
    });

    res.status(201).json(tournament);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// POST /api/tournaments/:id/add-player — Add player (Admin)
router.post('/:id/add-player', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body;

    const tournament = await prisma.tournament.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { players: true } } },
    });

    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.status !== 'REGISTRATION' && tournament.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Tournament is not in registration phase' });
    }

    const maxPlayers = tournament.format === 'SIXTEEN' ? 16 : 24;
    if (tournament._count.players >= maxPlayers) {
      return res.status(400).json({ error: `Tournament is full (${maxPlayers} players)` });
    }

    // Check if already in tournament
    const existing = await prisma.tournamentPlayer.findUnique({
      where: { tournamentId_userId: { tournamentId: req.params.id, userId } },
    });
    if (existing) return res.status(400).json({ error: 'Player already in tournament' });

    const player = await prisma.tournamentPlayer.create({
      data: { tournamentId: req.params.id, userId },
      include: { user: { select: { id: true, username: true, eloRating: true, favoriteClub: true } } },
    });

    res.status(201).json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add player' });
  }
});

// DELETE /api/tournaments/:id/remove-player/:userId — Remove player (Admin)
router.delete('/:id/remove-player/:userId', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.tournamentPlayer.delete({
      where: { tournamentId_userId: { tournamentId: req.params.id, userId: req.params.userId } },
    });
    res.json({ message: 'Player removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove player' });
  }
});

// POST /api/tournaments/:id/start — Draw groups & start (Admin)
router.post('/:id/start', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { players: true } }, league: true },
    });

    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    const expectedPlayers = tournament.format === 'SIXTEEN' ? 16 : 24;
    if (tournament._count.players !== expectedPlayers) {
      return res.status(400).json({ error: `Need exactly ${expectedPlayers} players, have ${tournament._count.players}` });
    }

    // Draw groups randomly
    await drawGroups(req.params.id);

    // Generate group stage schedule with H2H matchups
    await generateGroupSchedule(req.params.id);

    // Sync fixtures from API for the first 3 matchdays
    for (let round = 0; round < 3; round++) {
      const matchday = await prisma.matchday.findFirst({
        where: { tournamentId: req.params.id, roundNumber: round + 1 },
      });
      if (matchday) {
        try {
          const season = new Date().getFullYear();
          await footballApiService.syncMatchdayFixtures(
            matchday.id,
            tournament.league.apiFootballId,
            season,
            tournament.startingRound + round
          );
        } catch (apiError) {
          console.warn(`API sync failed for matchday ${round + 1}, fixtures can be synced later`);
        }
      }
    }

    // Notify all players
    const players = await prisma.tournamentPlayer.findMany({
      where: { tournamentId: req.params.id },
      select: { userId: true },
    });

    await prisma.notification.createMany({
      data: players.map(p => ({
        userId: p.userId,
        type: 'TOURNAMENT_STARTED' as const,
        title: 'Tournament Started! ⚽',
        message: `${tournament.name} has begun. Groups have been drawn. Make your predictions!`,
        data: { tournamentId: req.params.id },
      })),
    });

    // Fetch updated tournament
    const updated = await prisma.tournament.findUnique({
      where: { id: req.params.id },
      include: {
        groups: {
          include: { players: { include: { user: { select: { id: true, username: true, favoriteClub: true } } } } },
          orderBy: { name: 'asc' },
        },
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to start tournament' });
  }
});

// POST /api/tournaments/:id/advance-to-knockout — Generate knockout bracket (Admin)
router.post('/:id/advance-to-knockout', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await generateKnockoutBracket(req.params.id);
    const tournament = await prisma.tournament.findUnique({
      where: { id: req.params.id },
      include: { knockouts: { include: { player1: true, player2: true }, orderBy: [{ round: 'asc' }, { position: 'asc' }] } },
    });
    res.json(tournament);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate bracket' });
  }
});

// POST /api/tournaments/:id/cancel — Cancel tournament (Admin)
router.post('/:id/cancel', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  await prisma.tournament.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED' },
  });
  await logAuditEvent({
      adminId: req.user!.id,
      action: 'TOURNAMENT_CANCELLED',
      targetType: 'tournament',
      targetId: req.params.id,
      ip: req.ip,
    });
    res.json({ message: 'Tournament cancelled' });
});

// GET /api/tournaments/:id/standings — Group standings
router.get('/:id/standings', authenticate, async (req: AuthRequest, res: Response) => {
  const groups = await prisma.group.findMany({
    where: { tournamentId: req.params.id },
    include: {
      players: {
        include: {
          user: { select: { id: true, username: true, eloRating: true, favoriteClub: true, profilePhoto: true } },
        },
        orderBy: [{ points: 'desc' }, { goalDiff: 'desc' }, { goalsFor: 'desc' }],
      },
    },
    orderBy: { name: 'asc' },
  });
  res.json(groups);
});

export default router;
