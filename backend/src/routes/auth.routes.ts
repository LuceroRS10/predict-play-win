import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { authenticate, AuthRequest } from '../middleware/auth';
import { uploadProfilePhoto } from '../middleware/upload';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// ============================================================
// VALIDATION SCHEMAS (strict)
// ============================================================

const passwordSchema = z.string()
  .min(config.security.passwordMinLength, `Password must be at least ${config.security.passwordMinLength} characters`)
  .max(128, 'Password must be at most 128 characters')
  .refine(
    (val) => !config.security.passwordRequireUppercase || /[A-Z]/.test(val),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (val) => !config.security.passwordRequireNumber || /[0-9]/.test(val),
    'Password must contain at least one number'
  );

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .transform(val => val.trim()),
  email: z.string().email('Invalid email address').transform(val => val.toLowerCase().trim()),
  password: passwordSchema,
  favoriteClub: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email').transform(val => val.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});

const profileUpdateSchema = z.object({
  username: z.string()
    .min(3).max(20)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  favoriteClub: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
}).refine(
  (data) => data.currentPassword !== data.newPassword,
  { message: 'New password must be different from current password', path: ['newPassword'] }
);

// ============================================================
// TOKEN HELPERS
// ============================================================

function generateAccessToken(userId: string): string {
  return jwt.sign({ id: userId, type: 'access' }, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiresIn as any,
  });
}

function generateRefreshToken(userId: string): string {
  return jwt.sign({ id: userId, type: 'refresh' }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  });
}

// ============================================================
// ROUTES
// ============================================================

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check existing user (case-insensitive)
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: { equals: data.username, mode: 'insensitive' } },
        ],
      },
    });
    if (existing) {
      // Don't reveal which field matched (security best practice)
      // But for UX, we do tell them — acceptable for this app type
      return res.status(400).json({
        error: existing.email === data.email ? 'Email already registered' : 'Username taken',
      });
    }

    const passwordHash = await bcrypt.hash(data.password, config.security.bcryptRounds);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        favoriteClub: data.favoriteClub,
        country: data.country,
      },
      select: { id: true, username: true, email: true, role: true, eloRating: true },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      user,
      token: accessToken,        // Short-lived access token
      refreshToken,               // Long-lived refresh token
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('[AUTH] Registration error:', error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });

    // Use constant-time comparison pattern — always hash even if user not found
    if (!user) {
      // Prevent timing attacks: hash anyway so response time is consistent
      await bcrypt.hash('dummy-password', config.security.bcryptRounds);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated. Contact an administrator.' });
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        eloRating: user.eloRating,
        favoriteClub: user.favoriteClub,
        country: user.country,
        profilePhoto: user.profilePhoto,
      },
      token: accessToken,
      refreshToken,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('[AUTH] Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/refresh — Refresh access token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, config.jwt.secret) as { id: string; type: string };
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Issue new tokens (rotation)
    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true, username: true, email: true, role: true,
      eloRating: true, favoriteClub: true, country: true,
      profilePhoto: true, createdAt: true,
    },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// PUT /api/auth/profile — Update profile (validated)
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = profileUpdateSchema.parse(req.body);

    // Check username uniqueness if changing
    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: {
          username: { equals: data.username, mode: 'insensitive' },
          id: { not: req.user!.id },
        },
      });
      if (existing) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(data.username && { username: data.username }),
        ...(data.favoriteClub !== undefined && { favoriteClub: data.favoriteClub }),
        ...(data.country !== undefined && { country: data.country }),
      },
      select: {
        id: true, username: true, email: true, role: true,
        eloRating: true, favoriteClub: true, country: true, profilePhoto: true,
      },
    });

    res.json(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// POST /api/auth/profile-photo
router.post('/profile-photo', authenticate, uploadProfilePhoto, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const photoUrl = `/uploads/profiles/${req.file.filename}`;

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { profilePhoto: photoUrl },
    });

    res.json({ profilePhoto: photoUrl });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// PUT /api/auth/password — Change password (validated)
router.put('/password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = passwordChangeSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const newHash = await bcrypt.hash(data.newPassword, config.security.bcryptRounds);
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { passwordHash: newHash },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Password change failed' });
  }
});

export default router;
