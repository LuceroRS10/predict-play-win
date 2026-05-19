'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Player {
  id: string;
  name: string;
  avatar: string;
  country: string;
  clubBadge: string;
  elo: number;
  rank: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  online: boolean;
  initials: string;
}

// ─── Inline SVG Flag Components ──────────────────────────────────────────────

const flagStyle: React.CSSProperties = {
  width: '18px',
  height: '14px',
  borderRadius: '2px',
  verticalAlign: 'middle',
  flexShrink: 0,
  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
};

const FlagSpain = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="480" fill="#c60b1e" />
    <rect width="640" height="160" y="160" fill="#ffc400" />
  </svg>
);

const FlagBrazil = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="480" fill="#009B3A" />
    <path d="M320 80L560 240 320 400 80 240Z" fill="#FEDF00" />
    <circle cx="320" cy="240" r="80" fill="#002776" />
  </svg>
);

const FlagGermany = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="160" fill="#000" />
    <rect width="640" height="160" y="160" fill="#DD0000" />
    <rect width="640" height="160" y="320" fill="#FFCC00" />
  </svg>
);

const FlagArgentina = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="480" fill="#74ACDF" />
    <rect width="640" height="160" y="160" fill="#FFF" />
    <circle cx="320" cy="240" r="40" fill="#F6B40E" />
  </svg>
);

const FlagUK = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="480" fill="#012169" />
    <path d="M75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" fill="#FFF" />
    <path d="M424 281l216 159v40L369 281h55zm-184 20l6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" fill="#C8102E" />
    <path d="M241 0v480h160V0H241zM0 160v160h640V160H0z" fill="#FFF" />
    <path d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" fill="#C8102E" />
  </svg>
);

const FlagItaly = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="213" height="480" fill="#009246" />
    <rect width="214" height="480" x="213" fill="#FFF" />
    <rect width="213" height="480" x="427" fill="#CE2B37" />
  </svg>
);

const FlagJapan = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="480" fill="#FFF" />
    <circle cx="320" cy="240" r="100" fill="#BC002D" />
  </svg>
);

const FlagMexico = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="213" height="480" fill="#006847" />
    <rect width="214" height="480" x="213" fill="#FFF" />
    <rect width="213" height="480" x="427" fill="#CE1126" />
    <circle cx="320" cy="240" r="45" fill="#006847" opacity="0.3" />
  </svg>
);

const FlagColombia = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="240" fill="#FCD116" />
    <rect width="640" height="120" y="240" fill="#003893" />
    <rect width="640" height="120" y="360" fill="#CE1126" />
  </svg>
);

const FlagChile = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="240" fill="#FFF" />
    <rect width="640" height="240" y="240" fill="#D52B1E" />
    <rect width="213" height="240" fill="#0039A6" />
    <polygon points="107,70 120,120 170,120 130,150 143,200 107,170 71,200 84,150 44,120 94,120" fill="#FFF" />
  </svg>
);

const FlagPeru = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="213" height="480" fill="#D91023" />
    <rect width="214" height="480" x="213" fill="#FFF" />
    <rect width="213" height="480" x="427" fill="#D91023" />
  </svg>
);

const FlagFrance = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="213" height="480" fill="#002395" />
    <rect width="214" height="480" x="213" fill="#FFF" />
    <rect width="213" height="480" x="427" fill="#ED2939" />
  </svg>
);

const FlagPortugal = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="256" height="480" fill="#006600" />
    <rect width="384" height="480" x="256" fill="#FF0000" />
    <circle cx="256" cy="240" r="60" fill="#FFDF00" stroke="#006600" strokeWidth="4" />
  </svg>
);

const FlagTurkey = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="480" fill="#E30A17" />
    <circle cx="260" cy="240" r="100" fill="#FFF" />
    <circle cx="290" cy="240" r="80" fill="#E30A17" />
    <polygon points="380,240 345,215 345,265 380,240" fill="#FFF" />
  </svg>
);

const FlagSouthKorea = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="480" fill="#FFF" />
    <circle cx="320" cy="240" r="80" fill="#C60C30" />
    <path d="M320 160a80 80 0 010 160 40 40 0 000-80 40 40 0 010-80z" fill="#003478" />
  </svg>
);

const FlagEcuador = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="240" fill="#FFD100" />
    <rect width="640" height="120" y="240" fill="#0038A8" />
    <rect width="640" height="120" y="360" fill="#CE1126" />
  </svg>
);

const countryFlagMap: Record<string, React.FC> = {
  Spain: FlagSpain,
  Brazil: FlagBrazil,
  Germany: FlagGermany,
  Argentina: FlagArgentina,
  UK: FlagUK,
  Italy: FlagItaly,
  Japan: FlagJapan,
  Mexico: FlagMexico,
  Colombia: FlagColombia,
  Chile: FlagChile,
  Peru: FlagPeru,
  France: FlagFrance,
  Portugal: FlagPortugal,
  Turkey: FlagTurkey,
  'South Korea': FlagSouthKorea,
  Ecuador: FlagEcuador,
};

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg
    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--tx3)' }}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChallengeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
    <path d="M14.5 17.5L3 6V1h5l11.5 11.5M15 8l4 4M8 2l2 2M2 8l2 2" />
  </svg>
);

const ClubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" fill="currentColor" opacity="0.1" />
  </svg>
);

// ─── Win Rate Ring Component ─────────────────────────────────────────────────

const WinRateRing = ({ winRate }: { winRate: number }) => (
  <div className="pc3-winring">
    <svg viewBox="0 0 36 36" className="pc3-ring-svg">
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
        strokeDasharray={`${winRate}, 100`}
        strokeLinecap="round"
      />
    </svg>
    <div className="pc3-winpct">{winRate}%</div>
    <div className="pc3-winlbl">WIN RATE</div>
  </div>
);

// ─── Mock Data (16 Players) ─────────────────────────────────────────────────

const mockPlayers: Player[] = [
  {
    id: 'alexr10',
    name: 'AlexR10',
    avatar: 'https://i.pravatar.cc/150?img=12',
    country: 'Spain',
    clubBadge: 'https://media.api-sports.io/football/teams/541.png',
    elo: 1864,
    rank: 3,
    wins: 47,
    draws: 10,
    losses: 8,
    winRate: 72,
    online: true,
    initials: 'AL',
  },
  {
    id: 'dribbleking',
    name: 'DribbleKing',
    avatar: 'https://i.pravatar.cc/150?img=33',
    country: 'Brazil',
    clubBadge: 'https://media.api-sports.io/football/teams/529.png',
    elo: 1827,
    rank: 7,
    wins: 45,
    draws: 12,
    losses: 9,
    winRate: 68,
    online: false,
    initials: 'DR',
  },
  {
    id: 'tikitaka21',
    name: 'TikiTaka21',
    avatar: 'https://i.pravatar.cc/150?img=22',
    country: 'Germany',
    clubBadge: 'https://media.api-sports.io/football/teams/487.png',
    elo: 1793,
    rank: 11,
    wins: 42,
    draws: 14,
    losses: 9,
    winRate: 65,
    online: true,
    initials: 'TI',
  },
  {
    id: 'messimagic',
    name: 'MessiMagic',
    avatar: 'https://i.pravatar.cc/150?img=15',
    country: 'Argentina',
    clubBadge: 'https://media.api-sports.io/football/teams/496.png',
    elo: 1750,
    rank: 15,
    wins: 49,
    draws: 17,
    losses: 12,
    winRate: 63,
    online: false,
    initials: 'ME',
  },
  {
    id: 'nordicstriker',
    name: 'NordicStriker',
    avatar: 'https://i.pravatar.cc/150?img=52',
    country: 'UK',
    clubBadge: 'https://media.api-sports.io/football/teams/50.png',
    elo: 1732,
    rank: 18,
    wins: 45,
    draws: 14,
    losses: 15,
    winRate: 61,
    online: true,
    initials: 'NO',
  },
  {
    id: 'thewall',
    name: 'TheWall',
    avatar: 'https://i.pravatar.cc/150?img=41',
    country: 'Italy',
    clubBadge: 'https://media.api-sports.io/football/teams/487.png',
    elo: 1698,
    rank: 23,
    wins: 46,
    draws: 15,
    losses: 17,
    winRate: 59,
    online: false,
    initials: 'TH',
  },
  {
    id: 'goalmachine',
    name: 'GoalMachine',
    avatar: 'https://i.pravatar.cc/150?img=8',
    country: 'UK',
    clubBadge: 'https://media.api-sports.io/football/teams/497.png',
    elo: 1681,
    rank: 27,
    wins: 45,
    draws: 16,
    losses: 17,
    winRate: 58,
    online: true,
    initials: 'GO',
  },
  {
    id: 'predator9',
    name: 'Predator9',
    avatar: 'https://i.pravatar.cc/150?img=25',
    country: 'Spain',
    clubBadge: 'https://media.api-sports.io/football/teams/489.png',
    elo: 1664,
    rank: 31,
    wins: 44,
    draws: 18,
    losses: 18,
    winRate: 55,
    online: false,
    initials: 'PR',
  },
  {
    id: 'samuraiftbl',
    name: 'SamuraiFTBL',
    avatar: 'https://i.pravatar.cc/150?img=68',
    country: 'Japan',
    clubBadge: 'https://media.api-sports.io/football/teams/85.png',
    elo: 1642,
    rank: 36,
    wins: 44,
    draws: 17,
    losses: 21,
    winRate: 54,
    online: true,
    initials: 'SA',
  },
  {
    id: 'carlos_m',
    name: 'Carlos_M',
    avatar: 'https://i.pravatar.cc/150?img=36',
    country: 'Mexico',
    clubBadge: 'https://media.api-sports.io/football/teams/541.png',
    elo: 1547,
    rank: 38,
    wins: 42,
    draws: 18,
    losses: 20,
    winRate: 52,
    online: false,
    initials: 'CA',
  },
  {
    id: 'sofia_l',
    name: 'Sofia_L',
    avatar: 'https://i.pravatar.cc/150?img=45',
    country: 'Colombia',
    clubBadge: 'https://media.api-sports.io/football/teams/529.png',
    elo: 1523,
    rank: 40,
    wins: 40,
    draws: 20,
    losses: 20,
    winRate: 50,
    online: true,
    initials: 'SO',
  },
  {
    id: 'diego_r',
    name: 'Diego_R',
    avatar: 'https://i.pravatar.cc/150?img=17',
    country: 'Chile',
    clubBadge: 'https://media.api-sports.io/football/teams/496.png',
    elo: 1498,
    rank: 42,
    wins: 38,
    draws: 21,
    losses: 21,
    winRate: 48,
    online: false,
    initials: 'DI',
  },
  {
    id: 'ana_p',
    name: 'Ana_P',
    avatar: 'https://i.pravatar.cc/150?img=55',
    country: 'Peru',
    clubBadge: 'https://media.api-sports.io/football/teams/497.png',
    elo: 1476,
    rank: 44,
    wins: 37,
    draws: 20,
    losses: 23,
    winRate: 46,
    online: true,
    initials: 'AN',
  },
  {
    id: 'james_w',
    name: 'James_W',
    avatar: 'https://i.pravatar.cc/150?img=30',
    country: 'France',
    clubBadge: 'https://media.api-sports.io/football/teams/85.png',
    elo: 1451,
    rank: 46,
    wins: 35,
    draws: 22,
    losses: 23,
    winRate: 44,
    online: false,
    initials: 'JA',
  },
  {
    id: 'pablo_m',
    name: 'Pablo_M',
    avatar: 'https://i.pravatar.cc/150?img=60',
    country: 'Portugal',
    clubBadge: 'https://media.api-sports.io/football/teams/489.png',
    elo: 1432,
    rank: 48,
    wins: 34,
    draws: 21,
    losses: 25,
    winRate: 42,
    online: true,
    initials: 'PA',
  },
  {
    id: 'maria_s',
    name: 'Maria_S',
    avatar: 'https://i.pravatar.cc/150?img=19',
    country: 'Turkey',
    clubBadge: 'https://media.api-sports.io/football/teams/50.png',
    elo: 1418,
    rank: 50,
    wins: 32,
    draws: 22,
    losses: 26,
    winRate: 40,
    online: false,
    initials: 'MA',
  },
];

// ─── Player Card Component ──────────────────────────────────────────────────

function PlayerCard({
  player,
  onViewProfile,
  onChallenge,
}: {
  player: Player;
  onViewProfile: (name: string) => void;
  onChallenge: (name: string, initials: string) => void;
}) {
  const FlagComponent = countryFlagMap[player.country];

  return (
    <div className="player-card-v3">
      <div className="pc3-top">
        <div className="pc3-avatar-wrap">
          <img className="pc3-avatar" src={player.avatar} alt={player.name} />
          {player.online && <div className="pc3-online" />}
        </div>
        <div className="pc3-info">
          <div
            className="pc3-name clickable-name"
            onClick={() => onViewProfile(player.name)}
          >
            {player.name}
          </div>
          <div className="pc3-flags">
            {FlagComponent && <FlagComponent />}{' '}
            <img
              className="pc3-club-badge"
              src={player.clubBadge}
              alt={`${player.name} club`}
            />
          </div>
          <div className="pc3-elo">
            <span style={{ color: 'var(--accent)', fontWeight: 800 }}>
              ELO {player.elo.toLocaleString()}
            </span>{' '}
            <span className="pc3-rank">#{player.rank}</span>
          </div>
        </div>
        <WinRateRing winRate={player.winRate} />
      </div>
      <div className="pc3-record">
        <span style={{ color: '#22C55E' }}>{player.wins}W</span> -{' '}
        <span style={{ color: 'var(--tx2)' }}>{player.draws}D</span> -{' '}
        <span style={{ color: '#EF4444' }}>{player.losses}L</span>
      </div>
      <div className="pc3-actions">
        <button
          className="pc3-btn-profile"
          onClick={() => onViewProfile(player.name)}
        >
          <ProfileIcon />
          View Profile
        </button>
        <button
          className="pc3-btn-challenge"
          onClick={() => onChallenge(player.name, player.initials)}
        >
          <ChallengeIcon />
          Challenge
        </button>
      </div>
    </div>
  );
}

// ─── Filter Tabs ─────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'online' | 'country' | 'club';

interface TabConfig {
  id: FilterTab;
  label: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

const tabs: TabConfig[] = [
  { id: 'all', label: 'All' },
  {
    id: 'online',
    label: '🟢 Online',
    style: { color: '#22C55E', borderColor: 'rgba(34,197,94,0.3)' },
  },
  { id: 'country', label: '🌐 By Country' },
  {
    id: 'club',
    label: 'By Club',
    icon: <ClubIcon />,
  },
];

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function PlayersPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Filter players based on search query and active tab
  const filteredPlayers = useMemo(() => {
    let players = mockPlayers;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      players = players.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.country.toLowerCase().includes(query)
      );
    }

    // Tab filter
    if (activeTab === 'online') {
      players = players.filter((p) => p.online);
    }

    return players;
  }, [searchQuery, activeTab]);

  const handleViewProfile = (playerName: string) => {
    router.push('/profile');
  };

  const handleChallenge = (playerName: string, initials: string) => {
    // TODO: Open challenge modal with this player pre-selected
    router.push('/challenge');
  };

  return (
    <div className="page" id="page-players">
      {/* Search + Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            flex: 1,
            minWidth: '200px',
            maxWidth: '400px',
            position: 'relative',
          }}
        >
          <SearchIcon />
          <input
            type="text"
            className="ppw-input"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: '36px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--bg2)',
            }}
          />
        </div>

        {/* Filter Tabs */}
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab${activeTab === tab.id ? ' on' : ''}`}
            style={{
              padding: '8px 20px',
              fontSize: '13px',
              borderRadius: '20px',
              ...(activeTab !== tab.id && tab.style ? tab.style : {}),
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon && <>{tab.icon} </>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Players Count */}
      <div style={{ fontSize: '14px', marginBottom: '16px' }}>
        <span style={{ color: 'var(--accent)', fontWeight: 800 }}>
          {filteredPlayers.length}
        </span>{' '}
        <span style={{ color: 'var(--tx2)' }}>
          {filteredPlayers.length === mockPlayers.length
            ? 'registered players'
            : `of ${mockPlayers.length} players`}
        </span>
      </div>

      {/* Players Grid */}
      <div className="players-grid-v3">
        {filteredPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onViewProfile={handleViewProfile}
            onChallenge={handleChallenge}
          />
        ))}

        {/* Empty state */}
        {filteredPlayers.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '48px 16px',
              color: 'var(--tx3)',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 12px',
                opacity: 0.5,
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
              No players found
            </div>
            <div style={{ fontSize: '13px' }}>
              Try adjusting your search or filters
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
