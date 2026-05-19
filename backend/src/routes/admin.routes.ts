import { Router, Response } from 'express';
import { PrismaClient, UserRole, FixtureStatus } from '@prisma/client';
import { authenticate, requireAdmin, requireSuperAdmin, AuthRequest } from '../middleware/auth';
import { footballApiService } from '../services/football-api.service';
import { scoreMatchday } from '../services/tournament.service';
import { logAuditEvent, getAuditLog } from '../services/audit.service';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// ==================
// SETTINGS (validated)
// ==================

const settingSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_]+$/, 'Setting key must be alphanumeric'),
  value: z.string().max(1000),
});

const batchSettingsSchema = z.object({
  settings: z.array(settingSchema).min(1).max(50),
});

// GET /api/admin/settings
router.get('/settings', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const settings = await prisma.adminSetting.findMany({ orderBy: { key: 'asc' } });
  res.json(settings);
});

// PUT /api/admin/settings
router.put('/settings', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = settingSchema.parse(req.body);
    const setting = await prisma.adminSetting.upsert({
      where: { key: data.key },
      update: { value: data.value },
      create: { key: data.key, value: data.value, label: data.key },
    });

    await logAuditEvent({
      adminId: req.user!.id,
      action: 'SETTINGS_CHANGED',
      targetType: 'setting',
      targetId: data.key,
      details: { key: data.key, value: data.value },
      ip: req.ip,
    });

    res.json(setting);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// PUT /api/admin/settings/batch
router.put('/settings/batch', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { settings } = batchSettingsSchema.parse(req.body);
    const results = [];
    for (const s of settings) {
      const setting = await prisma.adminSetting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: { key: s.key, value: s.value, label: s.key },
      });
      results.push(setting);
    }

    await logAuditEvent({
      adminId: req.user!.id,
      action: 'SETTINGS_CHANGED',
      targetType: 'setting',
      details: { count: settings.length, keys: settings.map(s => s.key) },
      ip: req.ip,
    });

    res.json(results);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ==================
// USER MANAGEMENT (validated + audited)
// ==================

const roleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

// GET /api/admin/users
router.get('/users', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true, username: true, email: true, role: true,
      eloRating: true, favoriteClub: true, country: true,
      isActive: true, createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', authenticate, requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = roleSchema.parse(req.body);

    // Prevent self-demotion
    if (req.params.id === req.user!.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: data.role },
      select: { id: true, username: true, role: true },
    });

    await logAuditEvent({
      adminId: req.user!.id,
      action: 'USER_ROLE_CHANGED',
      targetType: 'user',
      targetId: req.params.id,
      details: { username: targetUser.username, oldRole: targetUser.role, newRole: data.role },
      ip: req.ip,
    });

    res.json(user);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// PUT /api/admin/users/:id/toggle-active
router.put('/users/:id/toggle-active', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  // Prevent self-deactivation
  if (req.params.id === req.user!.id) {
    return res.status(400).json({ error: 'Cannot deactivate your own account' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: !user.isActive },
    select: { id: true, username: true, isActive: true },
  });

  await logAuditEvent({
    adminId: req.user!.id,
    action: 'USER_TOGGLED_ACTIVE',
    targetType: 'user',
    targetId: req.params.id,
    details: { username: user.username, newStatus: updated.isActive },
    ip: req.ip,
  });

  res.json(updated);
});

// ==================
// LEAGUES & CLUBS (audited)
// ==================

// GET /api/admin/leagues
router.get('/leagues', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const leagues = await prisma.league.findMany({
    include: { _count: { select: { clubs: true } } },
  });
  res.json(leagues);
});

// POST /api/admin/leagues/sync
router.post('/leagues/sync', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const leagueData = [
      { name: 'La Liga', apiId: 140, country: 'Spain' },
      { name: 'Premier League', apiId: 39, country: 'England' },
      { name: 'Serie A', apiId: 135, country: 'Italy' },
      { name: 'Ligue 1', apiId: 61, country: 'France' },
    ];

    for (const league of leagueData) {
      await prisma.league.upsert({
        where: { apiFootballId: league.apiId },
        update: { name: league.name, country: league.country },
        create: { name: league.name, apiFootballId: league.apiId, country: league.country },
      });
    }

    await logAuditEvent({
      adminId: req.user!.id,
      action: 'LEAGUES_SYNCED',
      details: { count: leagueData.length },
      ip: req.ip,
    });

    res.json({ message: 'Leagues synced', count: leagueData.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync leagues' });
  }
});

// POST /api/admin/leagues/:apiLeagueId/sync-teams
router.post('/leagues/:apiLeagueId/sync-teams', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const apiLeagueId = parseInt(req.params.apiLeagueId);
    if (isNaN(apiLeagueId) || apiLeagueId <= 0) {
      return res.status(400).json({ error: 'Invalid league ID' });
    }

    const season = parseInt(req.query.season as string) || new Date().getFullYear();
    await footballApiService.syncLeagueTeams(apiLeagueId, season);

    await logAuditEvent({
      adminId: req.user!.id,
      action: 'TEAMS_SYNCED',
      targetType: 'league',
      targetId: String(apiLeagueId),
      details: { season },
      ip: req.ip,
    });

    res.json({ message: 'Teams synced' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to sync teams' });
  }
});

// ==================
// FIXTURE MANAGEMENT (validated + audited)
// ==================

const fixtureOverrideSchema = z.object({
  homeScore: z.number().int().min(0).max(99).optional(),
  awayScore: z.number().int().min(0).max(99).optional(),
  status: z.string().max(20).optional(),
  isExcluded: z.boolean().optional(),
});

// POST /api/admin/matchdays/:id/sync-fixtures
router.post('/matchdays/:id/sync-fixtures', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const matchday = await prisma.matchday.findUnique({
      where: { id: req.params.id },
      include: { tournament: { include: { league: true } } },
    });

    if (!matchday) return res.status(404).json({ error: 'Matchday not found' });

    const season = parseInt(req.query.season as string) || new Date().getFullYear();
    await footballApiService.syncMatchdayFixtures(
      matchday.id,
      matchday.tournament.league.apiFootballId,
      season,
      matchday.leagueRound
    );

    await logAuditEvent({
      adminId: req.user!.id,
      action: 'FIXTURES_SYNCED',
      targetType: 'matchday',
      targetId: req.params.id,
      details: { season },
      ip: req.ip,
    });

    res.json({ message: 'Fixtures synced' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to sync fixtures' });
  }
});

// PUT /api/admin/fixtures/:id — Override fixture result (validated + audited)
router.put('/fixtures/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = fixtureOverrideSchema.parse(req.body);

    const existingFixture = await prisma.fixture.findUnique({ where: { id: req.params.id } });
    if (!existingFixture) return res.status(404).json({ error: 'Fixture not found' });

    const fixture = await prisma.fixture.update({
      where: { id: req.params.id },
      data: {
        ...(data.homeScore !== undefined && { homeScore: data.homeScore }),
        ...(data.awayScore !== undefined && { awayScore: data.awayScore }),
        ...(data.status && { status: data.status as FixtureStatus }),
        ...(data.isExcluded !== undefined && { isExcluded: data.isExcluded }),
      },
    });

    await logAuditEvent({
      adminId: req.user!.id,
      action: 'FIXTURE_OVERRIDDEN',
      targetType: 'fixture',
      targetId: req.params.id,
      details: {
        before: { homeScore: existingFixture.homeScore, awayScore: existingFixture.awayScore, status: existingFixture.status },
        after: data,
      },
      ip: req.ip,
    });

    res.json(fixture);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Failed to update fixture' });
  }
});

// POST /api/admin/fixtures/:id/exclude
router.post('/fixtures/:id/exclude', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const fixture = await prisma.fixture.update({
    where: { id: req.params.id },
    data: { isExcluded: true, status: 'EXCLUDED' },
  });

  await logAuditEvent({
    adminId: req.user!.id,
    action: 'FIXTURE_EXCLUDED',
    targetType: 'fixture',
    targetId: req.params.id,
    ip: req.ip,
  });

  res.json(fixture);
});

// POST /api/admin/fixtures/:id/include
router.post('/fixtures/:id/include', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const fixture = await prisma.fixture.update({
    where: { id: req.params.id },
    data: { isExcluded: false, status: 'SCHEDULED' },
  });

  await logAuditEvent({
    adminId: req.user!.id,
    action: 'FIXTURE_INCLUDED',
    targetType: 'fixture',
    targetId: req.params.id,
    ip: req.ip,
  });

  res.json(fixture);
});

// ==================
// SCORING & RESULTS (audited)
// ==================

router.post('/matchdays/:id/update-results', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const result = await footballApiService.updateFixtureResults(req.params.id);

    await logAuditEvent({
      adminId: req.user!.id,
      action: 'MATCHDAY_RESULTS_UPDATED',
      targetType: 'matchday',
      targetId: req.params.id,
      ip: req.ip,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update results' });
  }
});

router.post('/matchdays/:id/score', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await scoreMatchday(req.params.id);

    await logAuditEvent({
      adminId: req.user!.id,
      action: 'MATCHDAY_SCORED',
      targetType: 'matchday',
      targetId: req.params.id,
      ip: req.ip,
    });

    res.json({ message: 'Matchday scored successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to score matchday' });
  }
});

// ==================
// AUDIT LOG (super admin only)
// ==================

router.get('/audit-log', authenticate, requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const logs = await getAuditLog(limit, offset);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// ==================
// DASHBOARD STATS
// ==================

router.get('/dashboard', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const [
    totalUsers,
    activeTournaments,
    totalTournaments,
    totalPredictions,
    totalChallenges,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.tournament.count({ where: { status: { in: ['GROUP_STAGE', 'KNOCKOUT'] } } }),
    prisma.tournament.count(),
    prisma.prediction.count(),
    prisma.challenge.count({ where: { status: 'COMPLETED' } }),
  ]);

  const recentUsers = await prisma.user.findMany({
    select: { username: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  res.json({
    totalUsers,
    activeTournaments,
    totalTournaments,
    totalPredictions,
    totalChallenges,
    recentUsers,
  });
});

export default router;
