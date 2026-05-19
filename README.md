# ⚽ Predict • Play • Win

**Football Prediction Tournament Platform**

A modern dark-themed football prediction tournament platform where players compete against each other in Head-to-Head (H2H) prediction matches using real football fixtures.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Docker & Docker Compose (recommended)

### Option 1: Docker (Recommended)

```bash
# Clone the project
cd predict-play-win-app

# Set your API Football key
export API_FOOTBALL_KEY=your-key-here

# Start everything
docker-compose up -d

# Seed the database
docker exec ppw-backend npm run db:seed
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Admin login: admin@predictplaywin.com / admin123

### Option 2: Manual Setup

```bash
# 1. Start PostgreSQL (ensure it's running on port 5432)

# 2. Backend
cd backend
cp .env.example .env
# Edit .env with your database URL and API key
npm install
npx prisma migrate dev
npm run db:seed
npm run dev

# 3. Frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## 📁 Project Structure

```
predict-play-win-app/
├── docker-compose.yml
├── backend/
│   ├── prisma/schema.prisma     # Database schema (16 models)
│   ├── src/
│   │   ├── index.ts             # Express server entry
│   │   ├── seed.ts              # Database seeder
│   │   ├── config/              # Environment config
│   │   ├── middleware/           # Auth, upload middleware
│   │   ├── routes/              # API endpoints
│   │   │   ├── auth.routes.ts
│   │   │   ├── tournament.routes.ts
│   │   │   ├── prediction.routes.ts
│   │   │   ├── challenge.routes.ts
│   │   │   ├── leaderboard.routes.ts
│   │   │   ├── player.routes.ts
│   │   │   ├── notification.routes.ts
│   │   │   └── admin.routes.ts
│   │   └── services/            # Business logic
│   │       ├── elo.service.ts
│   │       ├── tournament.service.ts
│   │       ├── challenge.service.ts
│   │       ├── football-api.service.ts
│   │       └── cron.service.ts
│   └── Dockerfile
└── frontend/                    # React/Next.js (Phase 7)
    └── Dockerfile
```

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| users | Player accounts, ELO ratings, profiles |
| leagues | La Liga, Premier League, Serie A, Ligue 1 |
| clubs | Teams with API-Football integration |
| tournaments | Tournament management (16 or 24 players) |
| groups | Group A-F assignments |
| tournament_players | Player stats (W/D/L/GF/GA/GD/PTS) |
| matchdays | League round tracking |
| fixtures | Real football matches |
| predictions | Home/Draw/Away predictions |
| h2h_matches | Head-to-head scorelines |
| knockout_matches | Bracket progression |
| elo_history | ELO rating changes over time |
| challenges | 1v1 challenge system |
| challenge_predictions | Challenge match predictions |
| notifications | Bell icon notifications |
| admin_settings | Configurable platform settings |

## 🎮 API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user
- `PUT /api/auth/profile` — Update profile
- `POST /api/auth/profile-photo` — Upload photo

### Tournaments
- `GET /api/tournaments` — List tournaments
- `GET /api/tournaments/:id` — Tournament details
- `POST /api/tournaments` — Create (Admin)
- `POST /api/tournaments/:id/add-player` — Add player (Admin)
- `POST /api/tournaments/:id/start` — Draw groups & start (Admin)
- `POST /api/tournaments/:id/advance-to-knockout` — Generate bracket (Admin)
- `GET /api/tournaments/:id/standings` — Group standings

### Predictions
- `GET /api/predictions/matchday/:id` — My predictions
- `POST /api/predictions` — Submit prediction
- `POST /api/predictions/batch` — Submit multiple
- `GET /api/predictions/h2h/:matchId` — H2H breakdown

### Challenges (1v1 Arena)
- `GET /api/challenges` — My challenges
- `POST /api/challenges` — Challenge a player
- `POST /api/challenges/:id/accept` — Accept
- `POST /api/challenges/:id/reject` — Reject
- `POST /api/challenges/:id/predict` — Submit predictions

### Leaderboard
- `GET /api/leaderboard/global` — Global ELO rankings
- `GET /api/leaderboard/top-performers` — Top stats
- `GET /api/leaderboard/tournament/:id` — Tournament rankings

### Players
- `GET /api/players` — Search players
- `GET /api/players/:id` — Player profile & stats

### Notifications
- `GET /api/notifications` — My notifications
- `PUT /api/notifications/read-all` — Mark all read

### Admin
- `GET /api/admin/dashboard` — Platform stats
- `GET/PUT /api/admin/settings` — Platform settings
- `GET /api/admin/users` — User management
- `POST /api/admin/leagues/sync` — Sync leagues
- `PUT /api/admin/fixtures/:id` — Override results
- `POST /api/admin/fixtures/:id/exclude` — Exclude suspended match
- `POST /api/admin/matchdays/:id/score` — Score matchday

## ⚙️ Admin Settings

| Key | Default | Description |
|-----|---------|-------------|
| challenge_max_active | 3 | Max simultaneous challenges |
| challenge_expiry_hours | 24 | Hours before challenge expires |
| challenge_elo_diminish_window_days | 21 | Reset window for repeated matchups |
| challenge_elo_match2_multiplier | 0.80 | 2nd match ELO multiplier |
| challenge_elo_match3_multiplier | 0.50 | 3rd match ELO multiplier |
| challenge_elo_match4plus_multiplier | 0.25 | 4th+ match ELO multiplier |
| tournament_elo_multiplier | 1.00 | Tournament match ELO multiplier |
| prediction_lock_minutes_before | 5 | Lock predictions before kickoff |
| elo_starting_rating | 1000 | New player starting ELO |
| elo_k_factor | 32 | ELO calculation K-factor |

## 📄 License

Private — All rights reserved.
