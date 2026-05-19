'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

// ── Types ──────────────────────────────────────────────────────────
type PickValue = 'H' | 'D' | 'A' | null;
type MatchStatus = 'ft' | 'live' | 'locked' | 'suspended' | 'upcoming';

interface DuelMatch {
  home: string;
  away: string;
  hCrest: string;
  aCrest: string;
  score: string | null;
  status: MatchStatus;
  minute?: string;
  kickoff?: string;
  p1pick: PickValue;
  p2pick: PickValue;
  result: PickValue;
}

interface DuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  duelId?: string;
  opponent?: { name: string; initials: string };
  competition?: {
    name: string;
    matchday: string;
    type: 'tournament' | 'league' | 'challenge';
  };
}

// ── SVG Icons ──────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const CrossIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12" style={{ opacity: 0.5 }}>
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const SaveCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const TrendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

// ── Mock data ──────────────────────────────────────────────────────
const PICK_LABEL: Record<string, string> = { H: 'HOME', D: 'DRAW', A: 'AWAY' };

const mockDuelData: Record<string, {
  p1: { name: string; avatar: string | null; elo: number; isYou: boolean };
  p2: { name: string; avatar: string | null; elo: number; isYou?: boolean };
  competition: string;
  matchday: string;
  matches: DuelMatch[];
}> = {
  carlos_ana_t: {
    p1: { name: 'Carlos M.', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', elo: 1340, isYou: true },
    p2: { name: 'Ana P.', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', elo: 1156 },
    competition: 'La Liga Cup S2',
    matchday: 'Matchday 2',
    matches: [
      { home: 'Real Madrid', away: 'Getafe', hCrest: 'https://media.api-sports.io/football/teams/541.png', aCrest: 'https://media.api-sports.io/football/teams/546.png', score: '2-0', status: 'ft', p1pick: 'H', p2pick: 'D', result: 'H' },
      { home: 'Barcelona', away: 'Real Sociedad', hCrest: 'https://media.api-sports.io/football/teams/529.png', aCrest: 'https://media.api-sports.io/football/teams/548.png', score: '1-1', status: 'ft', p1pick: 'H', p2pick: 'D', result: 'D' },
      { home: 'Atlético Madrid', away: 'Sevilla', hCrest: 'https://media.api-sports.io/football/teams/530.png', aCrest: 'https://media.api-sports.io/football/teams/536.png', score: null, status: 'live', minute: '67', p1pick: 'H', p2pick: 'A', result: null },
      { home: 'Athletic Club', away: 'Villarreal', hCrest: 'https://media.api-sports.io/football/teams/531.png', aCrest: 'https://media.api-sports.io/football/teams/533.png', score: null, status: 'locked', kickoff: '21:00', p1pick: 'D', p2pick: 'H', result: null },
      { home: 'Real Betis', away: 'Valencia', hCrest: 'https://media.api-sports.io/football/teams/543.png', aCrest: 'https://media.api-sports.io/football/teams/532.png', score: null, status: 'upcoming', kickoff: 'Sat 16:15', p1pick: 'H', p2pick: null, result: null },
      { home: 'Girona', away: 'Celta Vigo', hCrest: 'https://media.api-sports.io/football/teams/547.png', aCrest: 'https://media.api-sports.io/football/teams/538.png', score: null, status: 'upcoming', kickoff: 'Sat 18:30', p1pick: null, p2pick: null, result: null },
      { home: 'Osasuna', away: 'Mallorca', hCrest: 'https://media.api-sports.io/football/teams/727.png', aCrest: 'https://media.api-sports.io/football/teams/798.png', score: null, status: 'upcoming', kickoff: 'Sat 21:00', p1pick: null, p2pick: null, result: null },
      { home: 'Rayo Vallecano', away: 'Las Palmas', hCrest: 'https://media.api-sports.io/football/teams/728.png', aCrest: 'https://media.api-sports.io/football/teams/534.png', score: null, status: 'upcoming', kickoff: 'Sun 14:00', p1pick: null, p2pick: null, result: null },
      { home: 'Alavés', away: 'Espanyol', hCrest: 'https://media.api-sports.io/football/teams/542.png', aCrest: 'https://media.api-sports.io/football/teams/540.png', score: null, status: 'upcoming', kickoff: 'Sun 16:15', p1pick: 'A', p2pick: null, result: null },
      { home: 'Getafe', away: 'Leganés', hCrest: 'https://media.api-sports.io/football/teams/546.png', aCrest: 'https://media.api-sports.io/football/teams/745.png', score: null, status: 'upcoming', kickoff: 'Sun 21:00', p1pick: null, p2pick: null, result: null },
    ],
  },
  carlos_diego_t: {
    p1: { name: 'Carlos M.', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', elo: 1340, isYou: true },
    p2: { name: 'Diego R.', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', elo: 1205 },
    competition: 'La Liga Prediction Cup S2',
    matchday: 'Matchday 2',
    matches: [
      { home: 'Real Madrid', away: 'Getafe', hCrest: 'https://media.api-sports.io/football/teams/541.png', aCrest: 'https://media.api-sports.io/football/teams/546.png', score: '1-0', status: 'live', minute: '34', p1pick: 'H', p2pick: 'D', result: null },
      { home: 'Barcelona', away: 'Real Sociedad', hCrest: 'https://media.api-sports.io/football/teams/529.png', aCrest: 'https://media.api-sports.io/football/teams/548.png', score: null, status: 'locked', kickoff: '21:00', p1pick: 'H', p2pick: 'H', result: null },
      { home: 'Atlético Madrid', away: 'Sevilla', hCrest: 'https://media.api-sports.io/football/teams/530.png', aCrest: 'https://media.api-sports.io/football/teams/536.png', score: '2-1', status: 'ft', p1pick: 'H', p2pick: 'A', result: 'H' },
      { home: 'Athletic Club', away: 'Villarreal', hCrest: 'https://media.api-sports.io/football/teams/531.png', aCrest: 'https://media.api-sports.io/football/teams/533.png', score: '1-1', status: 'ft', p1pick: 'D', p2pick: 'H', result: 'D' },
      { home: 'Real Betis', away: 'Valencia', hCrest: 'https://media.api-sports.io/football/teams/543.png', aCrest: 'https://media.api-sports.io/football/teams/532.png', score: '0-2', status: 'ft', p1pick: 'A', p2pick: 'A', result: 'A' },
      { home: 'Girona', away: 'Celta Vigo', hCrest: 'https://media.api-sports.io/football/teams/547.png', aCrest: 'https://media.api-sports.io/football/teams/538.png', score: '3-0', status: 'ft', p1pick: 'H', p2pick: 'H', result: 'H' },
      { home: 'Osasuna', away: 'Mallorca', hCrest: 'https://media.api-sports.io/football/teams/727.png', aCrest: 'https://media.api-sports.io/football/teams/798.png', score: null, status: 'suspended', p1pick: 'D', p2pick: 'H', result: null },
      { home: 'Rayo Vallecano', away: 'Las Palmas', hCrest: 'https://media.api-sports.io/football/teams/728.png', aCrest: 'https://media.api-sports.io/football/teams/534.png', score: null, status: 'upcoming', kickoff: '18:30', p1pick: 'H', p2pick: 'D', result: null },
      { home: 'Alavés', away: 'Espanyol', hCrest: 'https://media.api-sports.io/football/teams/542.png', aCrest: 'https://media.api-sports.io/football/teams/540.png', score: '0-0', status: 'ft', p1pick: 'D', p2pick: 'D', result: 'D' },
      { home: 'Getafe', away: 'Leganés', hCrest: 'https://media.api-sports.io/football/teams/546.png', aCrest: 'https://media.api-sports.io/football/teams/745.png', score: '1-2', status: 'ft', p1pick: 'A', p2pick: 'H', result: 'A' },
    ],
  },
};

// ── Component ──────────────────────────────────────────────────────
export default function DuelModal({ isOpen, onClose, duelId, opponent, competition }: DuelModalProps) {
  const { t } = useLanguage();

  // Resolve duel data from mock store
  const duelData = useMemo(() => {
    if (duelId && mockDuelData[duelId]) return mockDuelData[duelId];
    // Fallback generic with props data
    return mockDuelData['carlos_ana_t'];
  }, [duelId]);

  const [matches, setMatches] = useState<DuelMatch[]>([]);
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialise matches from duel data
  useEffect(() => {
    if (isOpen && duelData) {
      setMatches(duelData.matches.map(m => ({ ...m })));
      setSaveState('idle');
    }
  }, [isOpen, duelData]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ── Computed stats ───────────────────────────────────────────────
  const stats = useMemo(() => {
    let p1score = 0, p2score = 0, decided = 0;
    let locked = 0, live = 0, upcoming = 0, predictable = 0, predicted = 0;
    const total = matches.length;

    matches.forEach(m => {
      if (m.status === 'ft' && m.result) {
        decided++;
        if (m.p1pick && m.p1pick === m.result) p1score++;
        if (m.p2pick && m.p2pick === m.result) p2score++;
      }
      if (m.status === 'locked') locked++;
      if (m.status === 'live') live++;
      if (m.status === 'upcoming') {
        upcoming++;
        predictable++;
        if (m.p1pick) predicted++;
      }
    });

    return { p1score, p2score, decided, locked, live, upcoming, predictable, predicted, total };
  }, [matches]);

  const canPredict = duelData.p1.isYou;

  // ── Pick handler ─────────────────────────────────────────────────
  const handlePick = useCallback((matchIdx: number, pick: PickValue) => {
    setMatches(prev => {
      const updated = [...prev];
      const m = { ...updated[matchIdx] };
      if (m.status !== 'upcoming') return prev;
      m.p1pick = m.p1pick === pick ? null : pick;
      updated[matchIdx] = m;
      return updated;
    });
    setSaveState('idle');
  }, []);

  // ── Save handler ─────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (stats.predicted === 0) return;
    setSaveState('saved');
    setToastMessage(`${stats.predicted} prediction${stats.predicted > 1 ? 's' : ''} saved successfully!`);
    setTimeout(() => {
      setSaveState('idle');
    }, 2000);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, [stats.predicted]);

  // ── Progress text ────────────────────────────────────────────────
  const progressText = useMemo(() => {
    if (stats.decided === stats.total) return 'All matches complete';
    const parts: string[] = [];
    if (stats.decided > 0) parts.push(`${stats.decided} finished`);
    if (stats.live > 0) parts.push(`${stats.live} live`);
    if (stats.locked > 0) parts.push(`${stats.locked} locked`);
    if (stats.upcoming > 0) parts.push(`${stats.upcoming} upcoming`);
    return parts.join(' \u2022 ');
  }, [stats]);

  // ── Score class helpers ──────────────────────────────────────────
  const s1class = stats.p1score > stats.p2score ? 'winning' : stats.p1score < stats.p2score ? 'losing' : 'tied';
  const s2class = stats.p2score > stats.p1score ? 'winning' : stats.p2score < stats.p1score ? 'losing' : 'tied';

  // ── Avatar renderer ──────────────────────────────────────────────
  const renderAvatar = (player: { name: string; avatar: string | null }, cls: string) => {
    if (player.avatar) {
      return <img className={`md-duel-avatar ${cls}`} src={player.avatar} alt={player.name} />;
    }
    const initial = player.name.charAt(0);
    const bg = cls === 'you'
      ? 'linear-gradient(135deg,#3B82F6,#6366f1)'
      : 'linear-gradient(135deg,#8B5CF6,#A855F7)';
    return (
      <div
        className={`md-duel-avatar ${cls}`}
        style={{ background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, color: '#fff' }}
      >
        {initial}
      </div>
    );
  };

  // ── Render match status badge ────────────────────────────────────
  const renderStatus = (m: DuelMatch) => {
    if (m.status === 'ft') return <span className="md-duel-match-status ft">FT</span>;
    if (m.status === 'live') return <span className="md-duel-match-status live">LIVE {m.minute || ''}&prime;</span>;
    if (m.status === 'locked') return <span className="md-duel-match-status locked"><LockIcon /> LOCKED</span>;
    if (m.status === 'suspended') return <span className="md-duel-match-status suspended">SUSPENDED</span>;
    return <span className="md-duel-match-status upcoming">{m.kickoff || 'TBD'}</span>;
  };

  // ── Render P1 pick column ────────────────────────────────────────
  const renderP1Pick = (m: DuelMatch, idx: number) => {
    const isRevealed = m.status === 'ft' || m.status === 'live' || m.status === 'locked';
    const isSuspended = m.status === 'suspended';
    const isUpcoming = m.status === 'upcoming';
    const canPredictThis = isUpcoming && canPredict;

    if (isSuspended) {
      return <div className="md-duel-pick-val suspended">N/A</div>;
    }

    if (canPredictThis) {
      const curPick = m.p1pick || '';
      return (
        <div className="md-pick-group">
          <div className="md-pick-btn-label">Your Pick</div>
          <div className="md-pick-btns">
            <button
              className={`md-pick-btn home-btn${curPick === 'H' ? ' selected' : ''}`}
              onClick={(e) => { e.stopPropagation(); handlePick(idx, 'H'); }}
              title={`${m.home} wins`}
            >
              1
            </button>
            <button
              className={`md-pick-btn draw-btn${curPick === 'D' ? ' selected' : ''}`}
              onClick={(e) => { e.stopPropagation(); handlePick(idx, 'D'); }}
              title="Draw"
            >
              X
            </button>
            <button
              className={`md-pick-btn away-btn${curPick === 'A' ? ' selected' : ''}`}
              onClick={(e) => { e.stopPropagation(); handlePick(idx, 'A'); }}
              title={`${m.away} wins`}
            >
              2
            </button>
          </div>
        </div>
      );
    }

    if (!m.p1pick) {
      return <div className="md-duel-pick-val nopick">NO PICK</div>;
    }

    if (m.result) {
      const cls = m.p1pick === m.result ? 'correct' : 'wrong';
      return (
        <>
          <div className={`md-duel-pick-val ${cls}`}>{PICK_LABEL[m.p1pick]}</div>
          <div className="md-duel-pick-icon left-icon">
            {m.p1pick === m.result ? <CheckIcon /> : <CrossIcon />}
          </div>
        </>
      );
    }

    if (m.status === 'live') {
      return (
        <div className="md-duel-pick-val">
          <span className="md-pick-live-dot" />
          {PICK_LABEL[m.p1pick]}
        </div>
      );
    }

    return <div className="md-duel-pick-val">{PICK_LABEL[m.p1pick]}</div>;
  };

  // ── Render P2 pick column ────────────────────────────────────────
  const renderP2Pick = (m: DuelMatch) => {
    const isRevealed = m.status === 'ft' || m.status === 'live' || m.status === 'locked';
    const isSuspended = m.status === 'suspended';

    if (isSuspended) {
      return <div className="md-duel-pick-val suspended">N/A</div>;
    }

    if (!isRevealed) {
      if (!m.p2pick && !m.p1pick && !canPredict) {
        return <div className="md-duel-pick-val nopick">NO PICK</div>;
      }
      return <div className="md-duel-pick-val hidden">???</div>;
    }

    if (!m.p2pick) {
      return <div className="md-duel-pick-val nopick">NO PICK</div>;
    }

    if (m.result) {
      const cls = m.p2pick === m.result ? 'correct' : 'wrong';
      return (
        <>
          <div className={`md-duel-pick-val ${cls}`}>{PICK_LABEL[m.p2pick]}</div>
          <div className="md-duel-pick-icon">
            {m.p2pick === m.result ? <CheckIcon /> : <CrossIcon />}
          </div>
        </>
      );
    }

    if (m.status === 'live') {
      return (
        <div className="md-duel-pick-val">
          <span className="md-pick-live-dot" />
          {PICK_LABEL[m.p2pick]}
        </div>
      );
    }

    return <div className="md-duel-pick-val">{PICK_LABEL[m.p2pick]}</div>;
  };

  // ── Render footer ────────────────────────────────────────────────
  const renderFooter = () => {
    if (stats.predictable > 0 && canPredict) {
      const pct = stats.predictable > 0 ? Math.round((stats.predicted / stats.predictable) * 100) : 0;
      return (
        <div className="md-pred-footer">
          <div className="md-pred-progress">
            <div className="md-pred-progress-text">
              <strong>{stats.predicted}</strong> of {stats.predictable} predicted
            </div>
            <div className="md-pred-progress-bar">
              <div className="md-pred-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <button
            className="md-pred-save-btn"
            onClick={handleSave}
            disabled={stats.predicted === 0}
            style={saveState === 'saved' ? { background: 'linear-gradient(135deg,#059669,#10B981)' } : undefined}
          >
            <SaveCheckIcon />
            {saveState === 'saved' ? 'Saved!' : 'Save Predictions'}
          </button>
        </div>
      );
    }

    const resultTxt = stats.p1score > stats.p2score
      ? `${duelData.p1.name} leads`
      : stats.p2score > stats.p1score
        ? `${duelData.p2.name} leads`
        : 'Tied';

    return (
      <div className="md-duel-summary">
        <div className="stat">
          <ClockIcon />
          <span>{stats.decided}/{stats.total} decided</span>
        </div>
        <div className="stat">
          <TrendIcon />
          <strong>{resultTxt}</strong>
        </div>
      </div>
    );
  };

  // ── Main render ──────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="md-duel-overlay active"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className="md-duel-modal"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Close button */}
            <button className="md-duel-close" onClick={onClose}>
              <CloseIcon />
            </button>

            {/* ── Header: Player vs Player ── */}
            <div className="md-duel-header">
              <div className="md-duel-vs-row">
                <div className="md-duel-player">
                  {renderAvatar(duelData.p1, duelData.p1.isYou ? 'you' : 'opp')}
                  <div className="md-duel-pname">{duelData.p1.name}</div>
                  {duelData.p1.isYou && <span className="md-duel-you-tag">YOU</span>}
                  <div className="md-duel-elo">ELO {duelData.p1.elo}</div>
                </div>

                <div className="md-duel-center">
                  <div className="md-duel-score-big">
                    <span className={`s1 ${s1class}`}>{stats.p1score}</span>
                    <span className="sep">{'\u2013'}</span>
                    <span className={`s2 ${s2class}`}>{stats.p2score}</span>
                  </div>
                  <div className="md-duel-meta">
                    {competition?.name || duelData.competition}
                  </div>
                  <div className="md-duel-meta" style={{ color: 'var(--accent,#3B82F6)', fontWeight: 700 }}>
                    {competition?.matchday || duelData.matchday}
                  </div>
                  <div className="md-duel-progress">{progressText}</div>
                </div>

                <div className="md-duel-player">
                  {renderAvatar(duelData.p2, duelData.p2.isYou ? 'you' : 'opp')}
                  <div className="md-duel-pname">{opponent?.name || duelData.p2.name}</div>
                  {duelData.p2.isYou && <span className="md-duel-you-tag">YOU</span>}
                  <div className="md-duel-elo">ELO {duelData.p2.elo}</div>
                </div>
              </div>
            </div>

            {/* ── Match rows (scrollable body) ── */}
            <div className="md-duel-body">
              {matches.map((m, i) => {
                const isSuspended = m.status === 'suspended';
                const isUpcoming = m.status === 'upcoming';
                const canPredictRow = isUpcoming && canPredict;

                let rowClass = 'md-duel-match';
                if (isSuspended) rowClass += ' suspended-row';
                if (canPredictRow) rowClass += ' predictable';
                if (canPredictRow && m.p1pick) rowClass += ' has-pick';

                return (
                  <div className={rowClass} key={i} data-match-idx={i}>
                    {/* P1 pick */}
                    <div className="md-duel-pick left">
                      <div className="md-duel-pick-label">
                        {duelData.p1.name.split(/[\s_]/)[0]}
                      </div>
                      {renderP1Pick(m, i)}
                    </div>

                    {/* Center: teams + score */}
                    <div className="md-duel-match-center">
                      <div className="md-duel-match-num">Match {i + 1}</div>
                      <div className="md-duel-teams">
                        <img className="md-duel-crest" src={m.hCrest} alt={m.home} title={m.home} />
                        <span className="md-duel-fscore">{m.score || 'vs'}</span>
                        <img className="md-duel-crest" src={m.aCrest} alt={m.away} title={m.away} />
                      </div>
                      {renderStatus(m)}
                    </div>

                    {/* P2 pick */}
                    <div className="md-duel-pick right">
                      <div className="md-duel-pick-label">
                        {(opponent?.name || duelData.p2.name).split(/[\s_]/)[0]}
                      </div>
                      {renderP2Pick(m)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Footer ── */}
            <div className="md-duel-footer">
              {renderFooter()}
            </div>
          </motion.div>

          {/* ── Save toast ── */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                className="md-save-toast show"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.3 }}
              >
                <SaveCheckIcon />
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
