'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlayerData {
  rank: number;
  name: string;
  avatar: string;
  country: string;
  flag: React.ReactNode;
  elo: number;
  eloDisplay: string;
  eloColor?: string;
  winPct: number;
  winPctRingColor: string;
  record: string;
  trendPath: string;
  trendColor: string;
  streakSegments: (string | null)[]; // color string or null for empty
  isYou?: boolean;
  rankIcon?: string;
  borderColor?: string;
}

// ─── Flag SVGs ───────────────────────────────────────────────────────────────

const flagStyle: React.CSSProperties = {
  width: '18px',
  height: '14px',
  borderRadius: '2px',
  verticalAlign: 'middle',
  flexShrink: 0,
  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
};

const FlagUK = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="480" fill="#012169" />
    <path d="M75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" fill="#FFF" />
    <path d="M424 281l216 159v40L369 281h55zm-184 20l6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" fill="#C8102E" />
    <path d="M241 0v480h160V0H241zM0 160v160h640V160H0z" fill="#FFF" />
    <path d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" fill="#C8102E" />
  </svg>
);

const FlagSpain = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="480" fill="#c60b1e" />
    <rect width="640" height="160" y="160" fill="#ffc400" />
  </svg>
);

const FlagGermany = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="160" fill="#000" />
    <rect width="640" height="160" y="160" fill="#DD0000" />
    <rect width="640" height="160" y="320" fill="#FFCC00" />
  </svg>
);

const FlagBrazil = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="480" fill="#009B3A" />
    <path d="M320 80L560 240 320 400 80 240Z" fill="#FEDF00" />
    <circle cx="320" cy="240" r="80" fill="#002776" />
  </svg>
);

const FlagItaly = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="213" height="480" fill="#009246" />
    <rect width="214" height="480" x="213" fill="#FFF" />
    <rect width="213" height="480" x="427" fill="#CE2B37" />
  </svg>
);

const FlagSouthKorea = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="480" fill="#FFF" />
    <circle cx="320" cy="240" r="100" fill="#CD2E3A" />
    <path d="M320 240a50 50 0 0 1 0 100a50 50 0 0 0 0-100" fill="#0047A0" />
  </svg>
);

const FlagFrance = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="213" height="480" fill="#002395" />
    <rect width="214" height="480" x="213" fill="#FFF" />
    <rect width="213" height="480" x="427" fill="#ED2939" />
  </svg>
);

const FlagArgentina = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="480" fill="#74ACDF" />
    <rect width="640" height="160" y="160" fill="#FFF" />
    <circle cx="320" cy="240" r="40" fill="#F6B40E" />
  </svg>
);

const FlagTurkey = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="480" fill="#E30A17" />
    <circle cx="280" cy="240" r="100" fill="#FFF" />
    <circle cx="308" cy="240" r="80" fill="#E30A17" />
  </svg>
);

const FlagIndonesia = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="240" fill="#FF0000" />
    <rect width="640" height="240" y="240" fill="#FFF" />
  </svg>
);

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockPlayers: PlayerData[] = [
  {
    rank: 1,
    name: 'PredatorX',
    avatar: 'https://i.pravatar.cc/150?img=12',
    country: 'United Kingdom',
    flag: <FlagUK />,
    elo: 1582,
    eloDisplay: '1,582',
    winPct: 68,
    winPctRingColor: '#22C55E',
    record: '68-12-10',
    trendPath: 'M0,25 L11,22 L22,18 L33,20 L44,15 L55,12 L66,8 L77,10 L88,6 L100,3',
    trendColor: '#22C55E',
    streakSegments: ['#EF4444', '#F97316', '#EAB308', '#EAB308', '#84CC16', '#22C55E', '#22C55E', '#22C55E', null, null],
    rankIcon: '👑',
    borderColor: '#FBBF24',
  },
  {
    rank: 2,
    name: 'Maverick',
    avatar: 'https://i.pravatar.cc/150?img=33',
    country: 'Spain',
    flag: <FlagSpain />,
    elo: 1426,
    eloDisplay: '1,426',
    winPct: 64,
    winPctRingColor: '#22C55E',
    record: '56-14-10',
    trendPath: 'M0,20 L11,22 L22,18 L33,15 L44,17 L55,12 L66,14 L77,8 L88,10 L100,5',
    trendColor: '#22C55E',
    streakSegments: ['#EF4444', '#F97316', '#EAB308', '#84CC16', '#22C55E', '#22C55E', '#22C55E', null, null, null],
    borderColor: '#C0C0C0',
  },
  {
    rank: 3,
    name: 'You',
    avatar: 'https://i.pravatar.cc/150?img=59',
    country: 'Germany',
    flag: <FlagGermany />,
    elo: 1247,
    eloDisplay: '1,247',
    winPct: 61,
    winPctRingColor: '#22C55E',
    record: '49-17-12',
    trendPath: 'M0,22 L11,20 L22,24 L33,18 L44,15 L55,20 L66,12 L77,8 L88,10 L100,4',
    trendColor: '#22C55E',
    streakSegments: ['#EF4444', '#F97316', '#EAB308', '#84CC16', '#84CC16', '#22C55E', null, null, null, null],
    isYou: true,
    borderColor: '#FBBF24',
  },
  {
    rank: 4,
    name: 'GoalWizard',
    avatar: 'https://i.pravatar.cc/150?img=15',
    country: 'Brazil',
    flag: <FlagBrazil />,
    elo: 1198,
    eloDisplay: '1,198',
    winPct: 58,
    winPctRingColor: '#22C55E',
    record: '47-15-18',
    trendPath: 'M0,18 L11,20 L22,15 L33,22 L44,18 L55,14 L66,16 L77,10 L88,12 L100,8',
    trendColor: '#22C55E',
    streakSegments: ['#EF4444', '#F97316', '#EAB308', '#84CC16', null, null, null, null, null, null],
  },
  {
    rank: 5,
    name: 'TikiTaka',
    avatar: 'https://i.pravatar.cc/150?img=22',
    country: 'Italy',
    flag: <FlagItaly />,
    elo: 1153,
    eloDisplay: '1,153',
    winPct: 57,
    winPctRingColor: '#22C55E',
    record: '44-16-20',
    trendPath: 'M0,15 L11,18 L22,12 L33,20 L44,22 L55,16 L66,14 L77,18 L88,10 L100,12',
    trendColor: '#F97316',
    streakSegments: ['#EF4444', '#F97316', '#EAB308', null, null, null, null, null, null, null],
  },
  {
    rank: 6,
    name: 'SilentStriker',
    avatar: 'https://i.pravatar.cc/150?img=41',
    country: 'South Korea',
    flag: <FlagSouthKorea />,
    elo: 1102,
    eloDisplay: '1,102',
    winPct: 54,
    winPctRingColor: '#22C55E',
    record: '42-18-20',
    trendPath: 'M0,12 L11,16 L22,14 L33,18 L44,15 L55,20 L66,18 L77,14 L88,16 L100,10',
    trendColor: '#F97316',
    streakSegments: ['#EF4444', '#EAB308', null, null, null, null, null, null, null, null],
  },
  {
    rank: 7,
    name: 'NetBuster',
    avatar: 'https://i.pravatar.cc/150?img=52',
    country: 'France',
    flag: <FlagFrance />,
    elo: 1056,
    eloDisplay: '1,056',
    winPct: 53,
    winPctRingColor: '#22C55E',
    record: '40-16-24',
    trendPath: 'M0,10 L11,14 L22,12 L33,18 L44,22 L55,20 L66,24 L77,18 L88,20 L100,16',
    trendColor: '#EF4444',
    streakSegments: ['#EF4444', '#EAB308', null, null, null, null, null, null, null, null],
  },
  {
    rank: 8,
    name: 'CrossKing',
    avatar: 'https://i.pravatar.cc/150?img=8',
    country: 'Argentina',
    flag: <FlagArgentina />,
    elo: 1012,
    eloDisplay: '1,012',
    winPct: 51,
    winPctRingColor: '#22C55E',
    record: '38-20-22',
    trendPath: 'M0,14 L11,12 L22,16 L33,14 L44,18 L55,22 L66,20 L77,16 L88,14 L100,18',
    trendColor: '#EF4444',
    streakSegments: ['#EF4444', null, null, null, null, null, null, null, null, null],
  },
  {
    rank: 9,
    name: 'StreetPoet',
    avatar: 'https://i.pravatar.cc/150?img=25',
    country: 'Turkey',
    flag: <FlagTurkey />,
    elo: 972,
    eloDisplay: '972',
    eloColor: '#EF4444',
    winPct: 49,
    winPctRingColor: '#F97316',
    record: '35-18-27',
    trendPath: 'M0,8 L11,12 L22,10 L33,16 L44,20 L55,18 L66,22 L77,20 L88,24 L100,22',
    trendColor: '#EF4444',
    streakSegments: [null, null, null, null, null, null, null, null, null, null],
  },
  {
    rank: 10,
    name: 'DribbleGod',
    avatar: 'https://i.pravatar.cc/150?img=68',
    country: 'Indonesia',
    flag: <FlagIndonesia />,
    elo: 918,
    eloDisplay: '918',
    eloColor: '#EF4444',
    winPct: 47,
    winPctRingColor: '#EF4444',
    record: '33-17-30',
    trendPath: 'M0,6 L11,10 L22,14 L33,12 L44,18 L55,22 L66,20 L77,26 L88,24 L100,22',
    trendColor: '#EF4444',
    streakSegments: [null, null, null, null, null, null, null, null, null, null],
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Win-rate ring SVG */
function WinRateRing({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="lb-winrate-cell">
      <span className="lb-winpct">{pct}%</span>
      <svg className="lb-ring" viewBox="0 0 36 36">
        <path
          className="lb-ring-bg"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3"
        />
        <path
          className="lb-ring-fill"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${pct}, 100`}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/** Trend sparkline SVG */
function TrendSparkline({ path, color }: { path: string; color: string }) {
  return (
    <div className="lb-trend-chart">
      <svg viewBox="0 0 100 30" preserveAspectRatio="none">
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/** Streak bar with colored segments */
function StreakBar({ segments }: { segments: (string | null)[] }) {
  const filledCount = segments.filter(Boolean).length;
  const isPulsing = filledCount >= 10;
  return (
    <div className={`streak-bar-v3${isPulsing ? ' streak-pulse' : ''}`}>
      {segments.map((color, i) => (
        <span
          key={i}
          className={`sb-seg${color ? ' sb-filled' : ''}`}
          style={color ? { background: color } : undefined}
        />
      ))}
    </div>
  );
}

/** Podium card for top-3 player */
function PodiumCard({ player, size }: { player: PlayerData; size: 'gold' | 'silver' | 'bronze' }) {
  const glowColors = {
    gold: '#FBBF24',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
  };
  const gradients = {
    gold: 'linear-gradient(135deg, #FBBF24, #F59E0B, #D97706)',
    silver: 'linear-gradient(135deg, #E5E7EB, #9CA3AF, #6B7280)',
    bronze: 'linear-gradient(135deg, #CD7F32, #B8860B, #8B6914)',
  };
  const rankLabels = { gold: '1st', silver: '2nd', bronze: '3rd' };
  const heights = { gold: '180px', silver: '160px', bronze: '150px' };

  return (
    <div
      className={`lb-podium-card lb-podium-${size}`}
      style={{
        flex: 1,
        background: 'var(--card)',
        border: `1px solid ${glowColors[size]}33`,
        borderRadius: '16px',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        minHeight: heights[size],
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gradient glow top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: gradients[size],
        }}
      />

      {/* Rank badge */}
      <div
        style={{
          fontSize: '12px',
          fontWeight: 800,
          color: glowColors[size],
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {rankLabels[size]}
      </div>

      {/* Avatar with glow ring */}
      <div
        style={{
          width: size === 'gold' ? '72px' : '60px',
          height: size === 'gold' ? '72px' : '60px',
          borderRadius: '50%',
          padding: '3px',
          background: gradients[size],
          boxShadow: `0 0 20px ${glowColors[size]}40`,
        }}
      >
        <img
          src={player.avatar}
          alt={player.name}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--bg)',
          }}
        />
      </div>

      {/* Name */}
      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--tx)' }}>
        {player.name}
      </div>

      {/* Country */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--tx3)' }}>
        {player.flag}
        <span>{player.country}</span>
      </div>

      {/* ELO */}
      <div
        style={{
          fontSize: size === 'gold' ? '24px' : '20px',
          fontWeight: 900,
          background: gradients[size],
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {player.eloDisplay}
      </div>

      {/* Record */}
      <div style={{ fontSize: '12px', color: 'var(--tx3)' }}>
        {player.record}
      </div>
    </div>
  );
}

// ─── Tabs Config ─────────────────────────────────────────────────────────────

const tabs = [
  { key: 'global_elo', label: 'Global ELO' },
  { key: 'tournament_tab', label: 'Tournament' },
  { key: 'league_tab', label: 'League' },
  { key: 'monthly_tab', label: 'Monthly' },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RankingsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [leagueFilter, setLeagueFilter] = useState('all');

  const isGlobalElo = activeTab === 0;

  // Filter players by search query
  const filteredPlayers = mockPlayers.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlayerClick = (playerName: string) => {
    router.push(`/players/${playerName.toLowerCase()}`);
  };

  return (
    <div className="page" id="page-leaderboard">
      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '20px' }}>
        {tabs.map((tab, i) => {
          const isFirst = i === 0;
          const isLast = i === tabs.length - 1;
          return (
            <button
              key={tab.key}
              className={`tab${activeTab === i ? ' on' : ''}`}
              style={{
                padding: '10px 28px',
                borderRadius: isFirst
                  ? '8px 0 0 8px'
                  : isLast
                  ? '0 8px 8px 0'
                  : '0',
                fontSize: '14px',
                fontWeight: activeTab === i ? 700 : 600,
              }}
              onClick={() => setActiveTab(i)}
            >
              {t?.[tab.key] || tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Search + Filters ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', maxWidth: '400px', position: 'relative' }}>
          <svg
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: 'var(--tx3)',
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="ppw-input"
            placeholder={t?.search_players || 'Search players...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: '36px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--bg2)',
              borderColor: 'var(--border2)',
            }}
          />
        </div>
        <select
          className="tpl-select"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          style={{
            height: '40px',
            padding: '0 16px',
            borderRadius: '10px',
            fontSize: '13px',
            minWidth: '140px',
            background: 'var(--bg2)',
            border: '1px solid var(--border2)',
          }}
        >
          <option value="all">🌐 All Regions</option>
          <option value="europe">Europe</option>
          <option value="americas">Americas</option>
          <option value="asia">Asia</option>
        </select>
        <select
          className="tpl-select"
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          style={{
            height: '40px',
            padding: '0 16px',
            borderRadius: '10px',
            fontSize: '13px',
            minWidth: '140px',
            background: 'var(--bg2)',
            border: '1px solid var(--border2)',
          }}
        >
          <option value="all">All Countries</option>
          <option value="spain">Spain</option>
          <option value="england">England</option>
          <option value="argentina">Argentina</option>
        </select>
        <select
          className="tpl-select"
          value={leagueFilter}
          onChange={(e) => setLeagueFilter(e.target.value)}
          style={{
            height: '40px',
            padding: '0 16px',
            borderRadius: '10px',
            fontSize: '13px',
            minWidth: '140px',
            background: 'var(--bg2)',
            border: '1px solid var(--border2)',
          }}
        >
          <option value="all">All Leagues</option>
          <option value="laliga">La Liga</option>
          <option value="premier">Premier League</option>
        </select>
      </div>

      {/* ── Podium (Top 3 cards — Global ELO tab only) ─────────────────── */}
      {isGlobalElo && (
        <div
          className="lb-podium"
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          {/* #2 Silver — left */}
          <PodiumCard player={mockPlayers[1]} size="silver" />
          {/* #1 Gold — center (tallest) */}
          <PodiumCard player={mockPlayers[0]} size="gold" />
          {/* #3 Bronze — right */}
          <PodiumCard player={mockPlayers[2]} size="bronze" />
        </div>
      )}

      {/* ── Leaderboard Table ──────────────────────────────────────────── */}
      <div
        className="lb-table-wrap"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="lb-th" style={{ width: '60px', textAlign: 'center' }}>
                RANK
              </th>
              <th className="lb-th" style={{ textAlign: 'left' }}>
                PLAYER
              </th>
              <th className="lb-th" style={{ textAlign: 'center', cursor: 'pointer' }}>
                ELO RATING ↕
              </th>
              <th className="lb-th" style={{ textAlign: 'center' }}>
                WIN RATE
              </th>
              <th className="lb-th" style={{ textAlign: 'center' }}>
                RECORD
              </th>
              <th className="lb-th" style={{ textAlign: 'center', minWidth: '100px' }}>
                TREND (LAST 10)
              </th>
              {isGlobalElo && (
                <th className="lb-th" style={{ textAlign: 'center', minWidth: '120px' }}>
                  STREAK
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player) => {
              const isTop3 = player.rank <= 3;
              const rowClasses = [
                'lb-row-v3',
                isTop3 ? 'lb-top' : '',
                player.isYou ? 'lb-you' : '',
              ]
                .filter(Boolean)
                .join(' ');

              const rowStyle: React.CSSProperties = {};
              if (player.borderColor) {
                rowStyle.borderLeft = `3px solid ${player.borderColor}`;
              }
              if (player.isYou) {
                rowStyle.background = 'rgba(251,191,36,0.06)';
              }

              return (
                <tr key={player.rank} className={rowClasses} style={rowStyle}>
                  {/* Rank */}
                  <td style={{ textAlign: 'center', padding: '14px 10px' }}>
                    {player.rankIcon ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                        <span style={{ fontSize: '12px' }}>{player.rankIcon}</span>
                        <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--tx)' }}>
                          {player.rank}
                        </span>
                      </div>
                    ) : (
                      <span
                        style={{
                          fontSize: isTop3 ? '20px' : '18px',
                          fontWeight: isTop3 ? 900 : 800,
                          color: isTop3 ? 'var(--tx)' : 'var(--tx3)',
                        }}
                      >
                        {player.rank}
                      </span>
                    )}
                  </td>

                  {/* Player */}
                  <td style={{ padding: '14px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="lb-photo">
                        <img src={player.avatar} alt={player.name} />
                      </div>
                      <div>
                        <div
                          className="lb-pname clickable-name"
                          onClick={() => handlePlayerClick(player.name)}
                          style={player.isYou ? { color: '#FBBF24' } : undefined}
                        >
                          {player.name}
                        </div>
                        <div className="lb-country">
                          {player.flag} {player.country}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* ELO Rating */}
                  <td style={{ textAlign: 'center', padding: '14px 10px' }}>
                    <span
                      className="lb-elo"
                      style={player.eloColor ? { color: player.eloColor } : undefined}
                    >
                      {player.eloDisplay}
                    </span>
                  </td>

                  {/* Win Rate */}
                  <td style={{ textAlign: 'center', padding: '14px 10px' }}>
                    <WinRateRing pct={player.winPct} color={player.winPctRingColor} />
                  </td>

                  {/* Record */}
                  <td style={{ textAlign: 'center', padding: '14px 10px', fontSize: '13px', color: 'var(--tx2)' }}>
                    {player.record}
                  </td>

                  {/* Trend Sparkline */}
                  <td style={{ textAlign: 'center', padding: '14px 10px' }}>
                    <TrendSparkline path={player.trendPath} color={player.trendColor} />
                  </td>

                  {/* Streak (Global ELO tab only) */}
                  {isGlobalElo && (
                    <td style={{ padding: '14px 10px' }}>
                      <StreakBar segments={player.streakSegments} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
