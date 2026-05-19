'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface LiveMatch {
  league: string;
  minute: string;
  minuteColor: string;
  homeTeam: string;
  homeLogo: string;
  homeAlt: string;
  homeScore: number;
  homeScoreAccent: boolean;
  awayTeam: string;
  awayLogo: string;
  awayAlt: string;
  awayScore: number;
  awayScoreAccent: boolean;
}

interface TopPerformer {
  rank: number;
  name: string;
  elo: string;
  eloColor: string;
  clubLogo: string;
  medalColor?: string; // gold, silver, bronze — or undefined for 4+
}

interface UpcomingMatch {
  dateLabel: string;
  homeTeam: string;
  homeLogo: string;
  awayTeam: string;
  awayLogo: string;
}

// ---------------------------------------------------------------------------
// Mock data (matches the HTML prototype)
// ---------------------------------------------------------------------------
const liveMatches: LiveMatch[] = [
  {
    league: 'La Liga',
    minute: "67'",
    minuteColor: 'var(--green)',
    homeTeam: 'Real Madrid',
    homeLogo: 'https://media.api-sports.io/football/teams/541.png',
    homeAlt: 'RM',
    homeScore: 2,
    homeScoreAccent: true,
    awayTeam: 'Getafe',
    awayLogo: 'https://media.api-sports.io/football/teams/546.png',
    awayAlt: 'GET',
    awayScore: 0,
    awayScoreAccent: false,
  },
  {
    league: 'La Liga',
    minute: "54'",
    minuteColor: 'var(--green)',
    homeTeam: 'Barcelona',
    homeLogo: 'https://media.api-sports.io/football/teams/529.png',
    homeAlt: 'BAR',
    homeScore: 1,
    homeScoreAccent: true,
    awayTeam: 'Real Betis',
    awayLogo: 'https://media.api-sports.io/football/teams/543.png',
    awayAlt: 'BET',
    awayScore: 1,
    awayScoreAccent: false,
  },
  {
    league: 'Premier League',
    minute: 'HT',
    minuteColor: 'var(--green)',
    homeTeam: 'Arsenal',
    homeLogo: 'https://media.api-sports.io/football/teams/42.png',
    homeAlt: 'ARS',
    homeScore: 3,
    homeScoreAccent: true,
    awayTeam: 'Chelsea',
    awayLogo: 'https://media.api-sports.io/football/teams/49.png',
    awayAlt: 'CHE',
    awayScore: 1,
    awayScoreAccent: false,
  },
];

const topPerformers: TopPerformer[] = [
  { rank: 1, name: 'Carlos M.', elo: '1,247', eloColor: 'var(--green)', clubLogo: 'https://media.api-sports.io/football/teams/541.png', medalColor: '#DAA520' },
  { rank: 2, name: 'Sofia L.', elo: '1,231', eloColor: 'var(--tx2)', clubLogo: 'https://media.api-sports.io/football/teams/529.png', medalColor: '#C0C0C0' },
  { rank: 3, name: 'Diego R.', elo: '1,218', eloColor: 'var(--tx2)', clubLogo: 'https://media.api-sports.io/football/teams/530.png', medalColor: '#CD7F32' },
  { rank: 4, name: 'Ana P.', elo: '1,195', eloColor: 'var(--tx2)', clubLogo: 'https://media.api-sports.io/football/teams/536.png' },
  { rank: 5, name: 'James W.', elo: '1,189', eloColor: 'var(--tx2)', clubLogo: 'https://media.api-sports.io/football/teams/42.png' },
];

const upcomingMatches: UpcomingMatch[] = [
  {
    dateLabel: 'Tomorrow • 21:00',
    homeTeam: 'Atletico',
    homeLogo: 'https://media.api-sports.io/football/teams/530.png',
    awayTeam: 'Sevilla',
    awayLogo: 'https://media.api-sports.io/football/teams/536.png',
  },
  {
    dateLabel: 'Sat • 16:00',
    homeTeam: 'Liverpool',
    homeLogo: 'https://media.api-sports.io/football/teams/40.png',
    awayTeam: 'Man City',
    awayLogo: 'https://media.api-sports.io/football/teams/50.png',
  },
  {
    dateLabel: 'Sat • 18:30',
    homeTeam: 'Villarreal',
    homeLogo: 'https://media.api-sports.io/football/teams/533.png',
    awayTeam: 'R. Sociedad',
    awayLogo: 'https://media.api-sports.io/football/teams/548.png',
  },
];

// ---------------------------------------------------------------------------
// Medal SVG for top 3
// ---------------------------------------------------------------------------
const MedalIcon: React.FC<{ color: string; number: number }> = ({ color, number }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={color} style={{ display: 'inline', verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="10" />
    <text x="12" y="16" textAnchor="middle" fill="#000" fontSize="12" fontWeight="bold">
      {number}
    </text>
  </svg>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const RightSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  // Determine if "Your Position" card should show
  const showYourPosition = pathname === '/rankings' || pathname === '/leaderboard' || pathname === '/leagues';

  // Hide entire sidebar on admin page
  const isAdminPage = pathname === '/admin';
  if (isAdminPage) return null;

  return (
    <aside className="ppw-right" id="rightbar">
      {/* ============================================================= */}
      {/* LIVE SCORES                                                    */}
      {/* ============================================================= */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <div className="live-dot" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--tx)' }}>
            {t.live_scores}
          </span>
        </div>

        {liveMatches.map((m, idx) => (
          <div key={idx} className="crd" style={{ padding: '10px', marginBottom: '8px' }}>
            {/* League + minute */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--tx3)', marginBottom: '4px' }}>
              <span>{m.league}</span>
              <span style={{ color: m.minuteColor }}>{m.minute}</span>
            </div>
            {/* Home team */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="rs-team-logo">
                  <img src={m.homeLogo} alt={m.homeAlt} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{m.homeTeam}</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 800, ...(m.homeScoreAccent ? { color: 'var(--accent)' } : {}) }}>
                {m.homeScore}
              </span>
            </div>
            {/* Away team */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="rs-team-logo">
                  <img src={m.awayLogo} alt={m.awayAlt} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{m.awayTeam}</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 800, ...(m.awayScoreAccent ? { color: 'var(--accent)' } : {}) }}>
                {m.awayScore}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================= */}
      {/* YOUR POSITION (shown only on Rankings / Leagues pages)         */}
      {/* ============================================================= */}
      {showYourPosition && (
        <div id="rsb-your-position" className="rsb-your-pos" style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            YOUR POSITION
          </div>

          {/* Rank badge with star SVG */}
          <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 10px' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="4" />
              <path
                d="M50 10 L56 30 L76 30 L60 42 L66 62 L50 50 L34 62 L40 42 L24 30 L44 30 Z"
                fill="rgba(251,191,36,0.2)"
                stroke="#FBBF24"
                strokeWidth="1.5"
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 900, color: '#FBBF24' }}>
              #3
            </div>
          </div>

          {/* Player name */}
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#FBBF24', marginBottom: '2px' }}>
            Carlos M.
          </div>

          {/* Country */}
          <div style={{ fontSize: '12px', color: 'var(--tx3)', marginBottom: '14px' }}>
            <svg className="flag-svg" viewBox="0 0 640 480" style={{ width: '18px', height: '14px', borderRadius: '2px', verticalAlign: 'middle', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
              <rect width="640" height="480" fill="#c60b1e" />
              <rect width="640" height="160" y="160" fill="#ffc400" />
            </svg>{' '}
            Spain
          </div>

          {/* ELO Rating */}
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', marginBottom: '4px' }}>
            ELO RATING
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--tx)' }}>1,247</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#22C55E' }}>↑28</span>
          </div>

          {/* Win Rate */}
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', marginBottom: '4px' }}>
            WIN RATE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--tx)' }}>61%</span>
            <svg viewBox="0 0 36 36" style={{ width: '28px', height: '28px' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#22C55E"
                strokeWidth="3"
                strokeDasharray="61, 100"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Record */}
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', marginBottom: '4px' }}>
            RECORD
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--tx)', marginBottom: '14px' }}>
            <span style={{ color: '#22C55E' }}>49W</span> - 17D - <span style={{ color: '#EF4444' }}>12L</span>
          </div>

          {/* Trend (Last 10) */}
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', marginBottom: '4px' }}>
            TREND (LAST 10)
          </div>
          <div style={{ height: '36px', marginBottom: '14px' }}>
            <svg viewBox="0 0 100 36" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="trendGradRsb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <path
                d="M0,30 L11,25 L22,32 L33,20 L44,15 L55,22 L66,12 L77,8 L88,10 L100,4 L100,36 L0,36Z"
                fill="url(#trendGradRsb)"
              />
              <path
                d="M0,30 L11,25 L22,32 L33,20 L44,15 L55,22 L66,12 L77,8 L88,10 L100,4"
                fill="none"
                stroke="#22C55E"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* View Full Profile button */}
          <button
            className="btn btn-o"
            onClick={() => router.push('/profile')}
            style={{ width: '100%', borderRadius: '8px', fontSize: '12px', padding: '8px 0' }}
          >
            View Full Profile
          </button>
        </div>
      )}

      {/* ============================================================= */}
      {/* YOUR LEAGUE                                                    */}
      {/* ============================================================= */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#22C55E">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--tx)' }}>YOUR LEAGUE</span>
        </div>
        <div
          className="crd"
          style={{ padding: '14px', cursor: 'pointer', borderLeft: '3px solid #22C55E' }}
          onClick={() => router.push('/leagues')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <img
              src="https://media.api-sports.io/football/leagues/140.png"
              style={{ width: '28px', height: '28px' }}
              alt="La Liga"
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--tx)' }}>Division 1</div>
              <div style={{ fontSize: '10px', color: 'var(--tx3)' }}>La Liga · Season 3</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#22C55E' }}>#3</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--tx3)', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <span>14 pts · MD 7/9</span>
            <span style={{ color: 'var(--accent)' }}>Next: vs TheStriker10</span>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* TOP PERFORMERS                                                 */}
      {/* ============================================================= */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--tx)', marginBottom: '12px' }}>
          {t.top_performers}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {topPerformers.map((p) => (
            <div
              key={p.rank}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px',
                borderRadius: '6px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Rank indicator */}
              {p.medalColor ? (
                <span style={{ fontSize: '14px' }}>
                  <MedalIcon color={p.medalColor} number={p.rank} />
                </span>
              ) : (
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tx3)', width: '20px', textAlign: 'center' }}>
                  {p.rank}
                </span>
              )}

              {/* Club logo */}
              <div className="rs-team-logo">
                <img src={p.clubLogo} alt="" />
              </div>

              {/* Name */}
              <span style={{ fontSize: '12px', fontWeight: 600, flex: 1 }}>{p.name}</span>

              {/* ELO */}
              <span style={{ fontSize: '11px', color: p.eloColor, fontWeight: 700 }}>{p.elo}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================= */}
      {/* UPCOMING MATCHES                                               */}
      {/* ============================================================= */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--tx)', marginBottom: '12px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
          </svg>{' '}
          {t.upcoming}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {upcomingMatches.map((m, idx) => (
            <div key={idx} className="crd" style={{ padding: '8px' }}>
              <div style={{ fontSize: '10px', color: 'var(--tx3)', marginBottom: '4px' }}>
                {m.dateLabel}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                {/* Home */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div className="rs-team-logo">
                    <img src={m.homeLogo} alt="" />
                  </div>
                  <span style={{ fontWeight: 600 }}>{m.homeTeam}</span>
                </div>
                {/* vs */}
                <span style={{ color: 'var(--tx3)', fontSize: '10px' }}>vs</span>
                {/* Away */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: 600 }}>{m.awayTeam}</span>
                  <div className="rs-team-logo">
                    <img src={m.awayLogo} alt="" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
