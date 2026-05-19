'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';

// ── SVG Icon Components ──────────────────────────────────────────────

const CrossedSwordsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path d="M6.92 5L5.5 6.42 10.08 11 5.5 15.58 6.92 17 13 11 6.92 5zm6 0L11.5 6.42 16.08 11 11.5 15.58 12.92 17 19 11 12.92 5z" />
  </svg>
);

const ClockIcon = ({ fill = '#F59E0B' }: { fill?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={fill} style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
  </svg>
);

// ── Flag SVGs ────────────────────────────────────────────────────────

const flagStyle: React.CSSProperties = {
  width: '18px',
  height: '14px',
  borderRadius: '2px',
  verticalAlign: 'middle',
  flexShrink: 0,
  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
};

const SpainFlag = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="480" fill="#c60b1e" />
    <rect width="640" height="160" y="160" fill="#ffc400" />
  </svg>
);

const EnglandFlag = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="640" height="480" fill="#FFF" />
    <rect width="640" height="96" y="192" fill="#C8102E" />
    <rect width="96" height="480" x="272" fill="#C8102E" />
  </svg>
);

const ItalyFlag = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="213" height="480" fill="#009246" />
    <rect width="214" height="480" x="213" fill="#FFF" />
    <rect width="213" height="480" x="427" fill="#CE2B37" />
  </svg>
);

const FranceFlag = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}>
    <rect width="213" height="480" fill="#002395" />
    <rect width="214" height="480" x="213" fill="#FFF" />
    <rect width="213" height="480" x="427" fill="#ED2939" />
  </svg>
);

const LeagueFlag = ({ league }: { league: string }) => {
  switch (league) {
    case 'La Liga': return <SpainFlag />;
    case 'Premier League': return <EnglandFlag />;
    case 'Serie A': return <ItalyFlag />;
    case 'Ligue 1': return <FranceFlag />;
    default: return <SpainFlag />;
  }
};

// ── Types ────────────────────────────────────────────────────────────

interface IncomingChallenge {
  id: string;
  name: string;
  initials: string;
  elo: string;
  gradient: string;
  league: string;
  round: string;
  timeLeft: string;
  urgent?: boolean;
  critical?: boolean;
}

interface SentChallenge {
  id: string;
  name: string;
  initials: string;
  elo: string;
  gradient: string;
  league: string;
  round: string;
  timeLeft: string;
}

interface HistoryChallenge {
  id: string;
  name: string;
  initials: string;
  gradient: string;
  league: string;
  round: string;
  myScore: number;
  theirScore: number;
  result: 'win' | 'loss' | 'draw';
  eloChange: number;
}

interface Player {
  name: string;
  elo: string;
  initials: string;
  color1: string;
  color2: string;
}

// ── Mock Data ────────────────────────────────────────────────────────

const mockIncoming: IncomingChallenge[] = [
  {
    id: 'inc-1',
    name: 'Diego R.',
    initials: 'DR',
    elo: '1,189',
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    league: 'La Liga',
    round: 'Round 28',
    timeLeft: '6h left',
    urgent: true,
  },
  {
    id: 'inc-2',
    name: 'María L.',
    initials: 'ML',
    elo: '1,312',
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    league: 'Premier League',
    round: 'GW 30',
    timeLeft: '2h left',
    critical: true,
  },
];

const mockSent: SentChallenge[] = [
  {
    id: 'sent-1',
    name: 'Ana P.',
    initials: 'AP',
    elo: '1,156',
    gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
    league: 'Serie A',
    round: 'MD 28',
    timeLeft: '22h left',
  },
];

const mockHistory: HistoryChallenge[] = [
  {
    id: 'hist-1',
    name: 'Ana P.',
    initials: 'AP',
    gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
    league: 'La Liga',
    round: 'MD 1',
    myScore: 7,
    theirScore: 4,
    result: 'win',
    eloChange: 18,
  },
  {
    id: 'hist-2',
    name: 'Hugo D.',
    initials: 'HD',
    gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)',
    league: 'Premier League',
    round: 'GW 10',
    myScore: 3,
    theirScore: 6,
    result: 'loss',
    eloChange: -12,
  },
];

const mockPlayers: Player[] = [
  { name: 'Diego R.', elo: '1,189', initials: 'DR', color1: '#8B5CF6', color2: '#7C3AED' },
  { name: 'Sofia L.', elo: '1,231', initials: 'SL', color1: '#3B82F6', color2: '#2563EB' },
  { name: 'Ana P.', elo: '1,156', initials: 'AP', color1: '#EC4899', color2: '#DB2777' },
  { name: 'James W.', elo: '1,189', initials: 'JW', color1: '#22C55E', color2: '#16A34A' },
  { name: 'Elena S.', elo: '1,176', initials: 'ES', color1: '#F59E0B', color2: '#D97706' },
  { name: 'Hugo D.', elo: '1,168', initials: 'HD', color1: '#14B8A6', color2: '#0D9488' },
  { name: 'Marco T.', elo: '1,154', initials: 'MT', color1: '#EF4444', color2: '#DC2626' },
];

const leagues = ['La Liga', 'Premier League', 'Serie A', 'Ligue 1'];

// ── Component ────────────────────────────────────────────────────────

export default function ChallengesPage() {
  const { t } = useLanguage();

  // Tab state
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Active challenges state (track hidden cards)
  const [hiddenCards, setHiddenCards] = useState<Set<string>>(new Set());

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedLeague, setSelectedLeague] = useState('La Liga');

  // Derived counts
  const visibleIncoming = mockIncoming.filter(c => !hiddenCards.has(c.id));
  const visibleSent = mockSent.filter(c => !hiddenCards.has(c.id));
  const activeCount = visibleIncoming.length + visibleSent.length;
  const slotsUsed = activeCount;

  // Filtered players for modal search
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return mockPlayers;
    const q = searchQuery.toLowerCase();
    return mockPlayers.filter(p => p.name.toLowerCase().includes(q));
  }, [searchQuery]);

  // Handlers
  const hideCard = (id: string) => {
    setHiddenCards(prev => new Set(prev).add(id));
  };

  const handleTabSwitch = (tab: 'active' | 'history') => {
    setActiveTab(tab);
  };

  const openModal = () => {
    setModalOpen(true);
    setSearchQuery('');
    setSelectedPlayer(null);
    setSelectedLeague('La Liga');
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
  };

  const clearSelectedPlayer = () => {
    setSelectedPlayer(null);
    setSearchQuery('');
  };

  const handleSendChallenge = () => {
    // In the future this would fire an API call
    closeModal();
  };

  // ── Render ──

  return (
    <div className="page" id="page-arena">

      {/* ── Header ── */}
      <div className="section-head">
        <div className="section-title">
          <CrossedSwordsIcon /> {t?.arena_title ?? '1v1 Arena'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="ch-slots">{slotsUsed}/3 slots used</span>
          <button className="btn btn-p" onClick={openModal}>
            {t?.new_challenge ?? '+ Challenge'}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="ch-tabs">
        <button
          className={`ch-tab${activeTab === 'active' ? ' ch-tab-active' : ''}`}
          onClick={() => handleTabSwitch('active')}
        >
          Active <span className="ch-tab-count">{activeCount}</span>
        </button>
        <button
          className={`ch-tab${activeTab === 'history' ? ' ch-tab-active' : ''}`}
          onClick={() => handleTabSwitch('history')}
        >
          History <span className="ch-tab-count">{mockHistory.length}</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════
          ACTIVE TAB
          ══════════════════════════════════════════════ */}
      {activeTab === 'active' && (
        <div className="ch-tab-content" id="ch-tab-active">

          {/* ── Incoming Section ── */}
          {visibleIncoming.length > 0 && (
            <>
              <div className="ch-label">📥 Incoming</div>
              {visibleIncoming.map(ch => (
                <div className="ch-card-v2 ch-incoming" key={ch.id}>
                  <div className="ch-card-left">
                    <div className="ch-av" style={{ background: ch.gradient }}>{ch.initials}</div>
                    <div className="ch-card-info">
                      <div className="ch-card-name">
                        {ch.name} <span className="ch-card-elo">{ch.elo}</span>
                      </div>
                      <div className="ch-card-meta">
                        <LeagueFlag league={ch.league} /> {ch.league} · {ch.round} ·{' '}
                        <span className={ch.critical ? 'ch-critical' : 'ch-urgent'}>
                          <ClockIcon /> {ch.timeLeft}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ch-card-actions">
                    <button className="ch-accept" onClick={() => hideCard(ch.id)}>Accept</button>
                    <button className="ch-decline" onClick={() => hideCard(ch.id)}>Decline</button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── Sent Section ── */}
          {visibleSent.length > 0 && (
            <>
              <div className="ch-label" style={{ marginTop: '24px' }}>📤 Sent</div>
              {visibleSent.map(ch => (
                <div className="ch-card-v2 ch-sent" key={ch.id}>
                  <div className="ch-card-left">
                    <div className="ch-av" style={{ background: ch.gradient }}>{ch.initials}</div>
                    <div className="ch-card-info">
                      <div className="ch-card-name">
                        {ch.name} <span className="ch-card-elo">{ch.elo}</span>
                      </div>
                      <div className="ch-card-meta">
                        <LeagueFlag league={ch.league} /> {ch.league} · {ch.round} ·{' '}
                        <ClockIcon /> {ch.timeLeft}
                      </div>
                    </div>
                  </div>
                  <div className="ch-card-status">
                    <span className="ch-waiting-badge">⏳ Waiting</span>
                    <button className="ch-cancel" onClick={() => hideCard(ch.id)}>Cancel</button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Empty state */}
          {activeCount === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--tx3)' }}>
              <p style={{ fontSize: '14px' }}>No active challenges</p>
              <button className="btn btn-p" style={{ marginTop: '12px' }} onClick={openModal}>
                + New Challenge
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          HISTORY TAB
          ══════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div className="ch-tab-content" id="ch-tab-history">
          {mockHistory.map(ch => (
            <div className={`ch-card-v2 ch-history ch-${ch.result === 'win' ? 'won' : ch.result === 'loss' ? 'lost' : 'drew'}`} key={ch.id}>
              <div className="ch-card-left">
                <div className="ch-av" style={{ background: ch.gradient }}>{ch.initials}</div>
                <div className="ch-card-info">
                  <div className="ch-card-name">vs {ch.name}</div>
                  <div className="ch-card-meta">
                    <LeagueFlag league={ch.league} /> {ch.league} · {ch.round}
                  </div>
                </div>
              </div>
              <div className="ch-result">
                <div className="ch-score">
                  <span className={ch.result === 'win' ? 'ch-score-win' : 'ch-score-lose'}>{ch.myScore}</span>
                  {' – '}
                  <span className={ch.result === 'loss' ? 'ch-score-win' : 'ch-score-lose'}>{ch.theirScore}</span>
                </div>
                <span className={`ch-result-badge ch-result-${ch.result}`}>
                  {ch.result === 'win' ? 'Won' : ch.result === 'loss' ? 'Lost' : 'Draw'}{' '}
                  {ch.eloChange > 0 ? '+' : ''}{ch.eloChange} ELO
                </span>
              </div>
            </div>
          ))}

          {mockHistory.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--tx3)' }}>
              <p style={{ fontSize: '14px' }}>No challenge history yet</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          CHALLENGE MODAL
          ══════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="modal" id="challengeModal" style={{ display: 'block' }}>
          {/* Modal Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
              <CrossedSwordsIcon /> New Challenge
            </h3>
            <button
              onClick={closeModal}
              style={{ background: 'transparent', border: 'none', color: 'var(--tx3)', cursor: 'pointer', fontSize: '20px' }}
            >
              ✕
            </button>
          </div>

          {/* Step 1: Search Player */}
          <div style={{ marginBottom: '16px' }}>
            <label className="ppw-label">Who do you want to challenge?</label>

            {!selectedPlayer ? (
              <>
                <input
                  type="text"
                  className="ppw-input"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                />
                <div className="ch-player-list" id="challengePlayerList">
                  {filteredPlayers.map(player => (
                    <div
                      className="ch-player-option"
                      key={player.initials}
                      onClick={() => handleSelectPlayer(player)}
                    >
                      <div
                        className="ch-av"
                        style={{
                          background: `linear-gradient(135deg, ${player.color1}, ${player.color2})`,
                          width: '28px',
                          height: '28px',
                          fontSize: '10px',
                        }}
                      >
                        {player.initials}
                      </div>
                      <span>{player.name}</span>
                      <span className="ch-card-elo">{player.elo}</span>
                    </div>
                  ))}
                  {filteredPlayers.length === 0 && (
                    <div style={{ padding: '12px', textAlign: 'center', color: 'var(--tx3)', fontSize: '13px' }}>
                      No players found
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="ch-selected-player" id="challengeSelectedPlayer">
                <div
                  className="ch-av"
                  id="chSelAv"
                  style={{
                    background: `linear-gradient(135deg, ${selectedPlayer.color1}, ${selectedPlayer.color2})`,
                    width: '28px',
                    height: '28px',
                    fontSize: '10px',
                  }}
                >
                  {selectedPlayer.initials}
                </div>
                <span id="chSelName">{selectedPlayer.name}</span>
                <span className="ch-card-elo" id="chSelElo">{selectedPlayer.elo}</span>
                <button className="ch-change-btn" onClick={clearSelectedPlayer}>Change</button>
              </div>
            )}
          </div>

          {/* Step 2: Pick League */}
          <div style={{ marginBottom: '20px' }}>
            <label className="ppw-label">Pick a league</label>
            <div className="ch-league-grid">
              {leagues.map(league => (
                <button
                  className={`ch-league-btn${selectedLeague === league ? ' ch-league-selected' : ''}`}
                  key={league}
                  onClick={() => setSelectedLeague(league)}
                >
                  <LeagueFlag league={league} /> {league}
                </button>
              ))}
            </div>
            <div className="ch-matchday-info">
              <CalendarIcon /> Next: Round 29 · Starts May 17
            </div>
          </div>

          {/* Send Button */}
          <button
            className="btn btn-p w-full"
            style={{ justifyContent: 'center', padding: '14px', fontSize: '15px' }}
            onClick={handleSendChallenge}
          >
            {t?.send_challenge ?? 'Send Challenge'} <CrossedSwordsIcon />
          </button>
          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '11px', color: 'var(--tx3)' }}>
            {3 - slotsUsed}/3 challenge slots remaining
          </div>
        </div>
      )}
    </div>
  );
}
