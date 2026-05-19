import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import { initCronJobs } from './services/cron.service';

// Routes
import authRoutes from './routes/auth.routes';
import tournamentRoutes from './routes/tournament.routes';
import predictionRoutes from './routes/prediction.routes';
import challengeRoutes from './routes/challenge.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import playerRoutes from './routes/player.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// ====================
// SECURITY MIDDLEWARE
// ====================

// Trust proxy (required for rate limiting behind reverse proxy / Docker)
app.set('trust proxy', 1);

// Security headers (comprehensive)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", config.cors.frontendUrl],
    },
  },
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  // Don't reveal Express
  hidePoweredBy: true,
  // Prevent MIME type sniffing
  noSniff: true,
  // Enable HSTS in production
  hsts: config.nodeEnv === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  } : false,
  // Referrer policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// CORS (strict)
const allowedOrigins = [
  config.cors.frontendUrl,
  // Allow localhost variants in development
  ...(config.nodeEnv !== 'production' ? [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ] : []),
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // Cache preflight for 24 hours
}));

// ====================
// RATE LIMITING
// ====================

// Global API rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// Auth rate limiting (strict — brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Only 10 auth attempts per 15 min (was 20)
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Admin rate limiting (moderate)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many admin requests' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/admin/', adminLimiter);

// Password change rate limiting (strict)
const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many password change attempts' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/password', passwordLimiter);

// ====================
// BODY PARSING
// ====================
app.use(express.json({ limit: '1mb' })); // Reduced from 10mb — only need JSON
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ====================
// STATIC FILES
// ====================
// Serve uploaded files with security headers
app.use('/uploads', (req, res, next) => {
  // Prevent directory listing
  if (req.path.endsWith('/') || req.path === '') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Prevent path traversal
  if (req.path.includes('..')) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  next();
}, express.static(path.join(__dirname, '..', config.upload.dir), {
  dotfiles: 'deny',      // Deny access to hidden files
  index: false,           // Disable directory indexing
  maxAge: '7d',           // Cache static files
}));

// ====================
// API ROUTES
// ====================

app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health check (no auth required)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'Predict Play Win API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    // Don't expose environment or internal details in production
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ====================
// GLOBAL ERROR HANDLER
// ====================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log full error server-side
  console.error(`[${new Date().toISOString()}] Error:`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    error: err.message,
    stack: config.nodeEnv !== 'production' ? err.stack : undefined,
  });

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }

  // Prisma errors (don't leak database details)
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({ error: 'Database operation failed' });
  }

  // Never leak stack traces in production
  res.status(err.status || 500).json({
    error: config.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
});

// ====================
// START SERVER
// ====================

app.listen(config.port, () => {
  console.log(`
  ⚽ ═══════════════════════════════════════════ ⚽
  
     PREDICT • PLAY • WIN — API Server
     
     Port:     ${config.port}
     Env:      ${config.nodeEnv}
     Frontend: ${config.cors.frontendUrl}
     Security: Helmet ✓ | CORS ✓ | Rate Limit ✓
     
  ⚽ ═══════════════════════════════════════════ ⚽
  `);

  // Initialize cron jobs
  if (config.nodeEnv !== 'test') {
    initCronJobs();
  }
});

export default app;
