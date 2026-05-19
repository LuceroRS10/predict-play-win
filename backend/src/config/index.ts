import dotenv from 'dotenv';
dotenv.config();

// ============================================================
// SECURITY: Validate critical environment variables at startup
// ============================================================
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error(`FATAL: Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Warn about weak JWT secret
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.warn('WARNING: JWT_SECRET should be at least 32 characters for production security');
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-only-change-in-production-' + Date.now(),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',   // Short-lived access token
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',  // Long-lived refresh token
    // Legacy: kept for backward compat during migration
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },

  apiFootball: {
    key: process.env.API_FOOTBALL_KEY || '',
    baseUrl: process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io',
  },

  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
  },

  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  security: {
    bcryptRounds: 12,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumber: true,
    maxLoginAttempts: 10,        // per 15min window (handled by rate limiter)
    accountLockoutMinutes: 30,
  },

  // Default game settings (overridable via admin_settings table)
  defaults: {
    eloStarting: 1000,
    eloKFactor: 32,
    predictionLockMinutes: 5,
    challengeMaxActive: 3,
    challengeExpiryHours: 24,
    challengeEloDiminishWindowDays: 21,
    challengeEloMultipliers: {
      1: 1.0,
      2: 0.80,
      3: 0.50,
      4: 0.25,
    },
    tournamentEloMultiplier: 1.0,
  },
};
