import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/leaderboard/global — Global ELO rankings (rolling 365 days)
router.get('/global', authenticate, async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const [players, total] = await Promise.all([
    prisma.user.findMany({
      where: { isActive: true, role: 'PLAYER' },
      select: {
        id: true,
        username: true,
        eloRating: true,
        favoriteClub: true,
        profilePhoto: true,
        country: true,
      },
      orderBy: { eloRating: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: { isActive: true, role: 'PLAYER' } }),
  ]);

  // Get weekly ELO changes
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const playersWithChanges = await Promise.all(
    players.map(async (player, index) => {
      const weeklyHistory = await prisma.eloHistory.findMany({
        where: {
          userId: player.id,
          createdAt: { gte: oneWeekAgo },
        },
        orderBy: { createdAt: 'asc' },
      });

      const weeklyChange = weeklyHistory.reduce((sum, h) => sum + h.eloChange, 0);

      return {
        ...player,
        rank: skip + index + 1,
        weeklyChange,
      };
    })
  );

  res.json({
    players: playersWithChanges,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// GET /api/leaderboard/top-performers
router.get('/top-performers', authenticate, async (req: AuthRequest, res: Response) => {
  // Most goals scored (correct predictions in H2H)
  const topScorers = await prisma.$queryRaw`
    SELECT u.id, u.username, u."favorite_club", u."profile_photo",
      COALESCE(SUM(CASE WHEN h."player1_id" = u.id THEN h."player1_score" ELSE h."player2_score" END), 0) as total_goals
    FROM users u
    LEFT JOIN h2h_matches h ON (h."player1_id" = u.id OR h."player2_id" = u.id) AND h.result != 'PENDING'
    WHERE u."is_active" = true AND u.role = 'PLAYER'
    GROUP BY u.id
    ORDER BY total_goals DESC
    LIMIT 5
  `;

  // Best win rate
  const bestWinRate = await prisma.$queryRaw`
    SELECT u.id, u.username, u."favorite_club", u."profile_photo",
      COUNT(CASE WHEN
        (h."player1_id" = u.id AND h.result = 'PLAYER1_WIN') OR
        (h."player2_id" = u.id AND h.result = 'PLAYER2_WIN')
        THEN 1 END) as wins,
      COUNT(*) as total_matches,
      ROUND(
        COUNT(CASE WHEN
          (h."player1_id" = u.id AND h.result = 'PLAYER1_WIN') OR
          (h."player2_id" = u.id AND h.result = 'PLAYER2_WIN')
          THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1
      ) as win_rate
    FROM users u
    INNER JOIN h2h_matches h ON (h."player1_id" = u.id OR h."player2_id" = u.id) AND h.result != 'PENDING'
    WHERE u."is_active" = true AND u.role = 'PLAYER'
    GROUP BY u.id
    HAVING COUNT(*) >= 3
    ORDER BY win_rate DESC
    LIMIT 5
  `;

  // Best current streak
  const biggestEloGains = await prisma.$queryRaw`
    SELECT u.id, u.username, u."favorite_club", u."profile_photo",
      SUM(eh."elo_change") as total_gain
    FROM users u
    INNER JOIN elo_history eh ON eh."user_id" = u.id
    WHERE u."is_active" = true AND eh."created_at" >= NOW() - INTERVAL '30 days'
    GROUP BY u.id
    ORDER BY total_gain DESC
    LIMIT 5
  `;

  res.json({ topScorers, bestWinRate, biggestEloGains });
});

// GET /api/leaderboard/tournament/:id — Tournament-specific leaderboard
router.get('/tournament/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const players = await prisma.tournamentPlayer.findMany({
    where: { tournamentId: req.params.id },
    include: {
      user: {
        select: { id: true, username: true, eloRating: true, favoriteClub: true, profilePhoto: true },
      },
    },
    orderBy: [{ points: 'desc' }, { goalDiff: 'desc' }, { goalsFor: 'desc' }],
  });

  res.json(players);
});

export default router;
