'use client';

import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

// ── Types ──────────────────────────────────────────────────────────
type MatchStatus = 'live' | 'ft' | 'upcoming';

interface MatchDetailData {
  home: string;
  away: string;
  homeLogo: string;
  awayLogo: string;
  score: string;
  status: MatchStatus;
  minute: string;
  youPick: string;
  oppPick: string;
  youCorrect: boolean | null;
  oppCorrect: boolean | null;
  youName: string;
  oppName: string;
  youInit: string;
  oppInit: string;
  h2hYou: number;
  h2hOpp: number;
  competition: string;
  matchday: string;
  kickoff: string;
}

interface MatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId?: string;
}

// ── SVG Icons ──────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const CheckIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#22C55E" strokeWidth="3">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const CrossIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#EF4444" strokeWidth="3">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// ── Mock Data ──────────────────────────────────────────────────────
const matchDetailData: Record<string, MatchDetailData> = {
  'rm-getafe': {
    home: 'Real Madrid', away: 'Getafe',
    homeLogo: 'https://media.api-sports.io/football/teams/541.png',
    awayLogo: 'https://media.api-sports.io/football/teams/546.png',
    score: '1 - 0', status: 'live', minute: "34'",
    youPick: 'Home', oppPick: 'Draw', youCorrect: null, oppCorrect: null,
    youName: 'Carlos M.', oppName: 'Diego R.', youInit: 'C', oppInit: 'D',
    h2hYou: 2, h2hOpp: 1, competition: 'Champions League 2025', matchday: 'Matchday 3', kickoff: 'Today \u2022 21:00',
  },
  'atletico-betis': {
    home: 'Atl\u00e9tico Madrid', away: 'Real Betis',
    homeLogo: 'https://media.api-sports.io/football/teams/530.png',
    awayLogo: 'https://media.api-sports.io/football/teams/543.png',
    score: '2 - 1', status: 'live', minute: "67'",
    youPick: 'Home', oppPick: 'Away', youCorrect: null, oppCorrect: null,
    youName: 'Carlos M.', oppName: 'Diego R.', youInit: 'C', oppInit: 'D',
    h2hYou: 2, h2hOpp: 1, competition: 'Champions League 2025', matchday: 'Matchday 3', kickoff: 'Today \u2022 19:00',
  },
  'barca-villarreal': {
    home: 'Barcelona', away: 'Real Sociedad',
    homeLogo: 'https://media.api-sports.io/football/teams/529.png',
    awayLogo: 'https://media.api-sports.io/football/teams/548.png',
    score: '', status: 'upcoming', minute: '',
    youPick: 'Home', oppPick: 'Home', youCorrect: null, oppCorrect: null,
    youName: 'Carlos M.', oppName: 'Diego R.', youInit: 'C', oppInit: 'D',
    h2hYou: 2, h2hOpp: 1, competition: 'Champions League 2025', matchday: 'Matchday 3', kickoff: 'Tomorrow \u2022 18:30',
  },
  'arsenal-tottenham': {
    home: 'Arsenal', away: 'Tottenham',
    homeLogo: 'https://media.api-sports.io/football/teams/42.png',
    awayLogo: 'https://media.api-sports.io/football/teams/47.png',
    score: '', status: 'upcoming', minute: '',
    youPick: 'Home', oppPick: 'Away', youCorrect: null, oppCorrect: null,
    youName: 'Carlos M.', oppName: 'Diego R.', youInit: 'C', oppInit: 'D',
    h2hYou: 2, h2hOpp: 1, competition: 'Champions League 2025', matchday: 'Matchday 3', kickoff: 'Sun, 16 Mar \u2022 17:30',
  },
  'liverpool-bournemouth': {
    home: 'Liverpool', away: 'Bournemouth',
    homeLogo: 'https://media.api-sports.io/football/teams/40.png',
    awayLogo: 'https://media.api-sports.io/football/teams/35.png',
    score: '2 - 0', status: 'ft', minute: '',
    youPick: 'Home', oppPick: 'Home', youCorrect: true, oppCorrect: true,
    youName: 'Carlos M.', oppName: 'Diego R.', youInit: 'C', oppInit: 'D',
    h2hYou: 4, h2hOpp: 2, competition: 'Champions League 2025', matchday: 'Matchday 3', kickoff: 'Today \u2022 15:00',
  },
  'mancity-newcastle': {
    home: 'Manchester City', away: 'Newcastle',
    homeLogo: 'https://media.api-sports.io/football/teams/50.png',
    awayLogo: 'https://media.api-sports.io/football/teams/34.png',
    score: '', status: 'upcoming', minute: '',
    youPick: 'Draw', oppPick: 'Home', youCorrect: null, oppCorrect: null,
    youName: 'Carlos M.', oppName: 'Diego R.', youInit: 'C', oppInit: 'D',
    h2hYou: 2, h2hOpp: 1, competition: 'Premier League 2024/25', matchday: 'Matchday 30', kickoff: 'Sat, 22 Mar \u2022 13:30',
  },
  'milan-atalanta': {
    home: 'AC Milan', away: 'Atalanta',
    homeLogo: 'https://media.api-sports.io/football/teams/489.png',
    awayLogo: 'https://media.api-sports.io/football/teams/502.png',
    score: '', status: 'upcoming', minute: '',
    youPick: 'Home', oppPick: 'Home', youCorrect: null, oppCorrect: null,
    youName: 'Carlos M.', oppName: 'Diego R.', youInit: 'C', oppInit: 'D',
    h2hYou: 2, h2hOpp: 1, competition: 'Serie A 2024/25', matchday: 'Matchday 28', kickoff: 'Sun, 23 Mar \u2022 20:45',
  },
  'inter-roma': {
    home: 'Inter Milan', away: 'AS Roma',
    homeLogo: 'https://media.api-sports.io/football/teams/505.png',
    awayLogo: 'https://media.api-sports.io/football/teams/497.png',
    score: '', status: 'upcoming', minute: '',
    youPick: 'Home', oppPick: 'Draw', youCorrect: null, oppCorrect: null,
    youName: 'Carlos M.', oppName: 'Diego R.', youInit: 'C', oppInit: 'D',
    h2hYou: 2, h2hOpp: 1, competition: 'Serie A 2024/25', matchday: 'Matchday 28', kickoff: 'Sun, 23 Mar \u2022 18:00',
  },
};

// ── Component ──────────────────────────────────────────────────────
export default function MatchDetailModal({ isOpen, onClose, matchId }: MatchDetailModalProps) {
  const { t } = useLanguage();

  const data = useMemo<MatchDetailData | null>(() => {
    if (!matchId) return null;
    return matchDetailData[matchId] || null;
  }, [matchId]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ── Derived values ───────────────────────────────────────────────
  const statusBadgeClass = data ? `md-status-badge ${data.status}` : 'md-status-badge';

  const statusText = useMemo(() => {
    if (!data) return '';
    if (data.status === 'live') return `LIVE ${data.minute}`;
    if (data.status === 'ft') return 'FULL TIME';
    return 'UPCOMING';
  }, [data]);

  const h2hYouClass = useMemo(() => {
    if (!data) return 'md-h2h-player-score tied';
    if (data.h2hYou > data.h2hOpp) return 'md-h2h-player-score winning';
    if (data.h2hOpp > data.h2hYou) return 'md-h2h-player-score losing';
    return 'md-h2h-player-score tied';
  }, [data]);

  const h2hOppClass = useMemo(() => {
    if (!data) return 'md-h2h-player-score tied';
    if (data.h2hOpp > data.h2hYou) return 'md-h2h-player-score winning';
    if (data.h2hYou > data.h2hOpp) return 'md-h2h-player-score losing';
    return 'md-h2h-player-score tied';
  }, [data]);

  // Prediction display logic
  const oppChoiceDisplay = useMemo(() => {
    if (!data) return '';
    if (data.status === 'upcoming') return '???';
    return data.oppPick;
  }, [data]);

  // ── Render result icon ───────────────────────────────────────────
  const renderResultIcon = (correct: boolean | null) => {
    if (correct === true) return <CheckIcon />;
    if (correct === false) return <CrossIcon />;
    return null;
  };

  const youPickClass = useMemo(() => {
    if (!data) return 'md-pred-pick';
    let cls = 'md-pred-pick';
    if (data.status === 'ft') {
      if (data.youCorrect === true) cls += ' correct';
      else if (data.youCorrect === false) cls += ' wrong';
    }
    return cls;
  }, [data]);

  const oppPickClass = useMemo(() => {
    if (!data) return 'md-pred-pick';
    let cls = 'md-pred-pick';
    if (data.status === 'ft') {
      if (data.oppCorrect === true) cls += ' correct';
      else if (data.oppCorrect === false) cls += ' wrong';
    }
    return cls;
  }, [data]);

  const youResultClass = useMemo(() => {
    if (!data || data.status !== 'ft') return 'md-pred-result-icon';
    if (data.youCorrect === true) return 'md-pred-result-icon correct';
    if (data.youCorrect === false) return 'md-pred-result-icon wrong';
    return 'md-pred-result-icon';
  }, [data]);

  const oppResultClass = useMemo(() => {
    if (!data || data.status !== 'ft') return 'md-pred-result-icon';
    if (data.oppCorrect === true) return 'md-pred-result-icon correct';
    if (data.oppCorrect === false) return 'md-pred-result-icon wrong';
    return 'md-pred-result-icon';
  }, [data]);

  return (
    <AnimatePresence>
      {isOpen && data && (
        <motion.div
          className="md-overlay open"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className="md-modal"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* ── Header ── */}
            <div className="md-header">
              <button className="md-close" onClick={onClose}>
                <CloseIcon />
              </button>

              <div className="md-status">
                <span className={statusBadgeClass}>
                  <span className="md-status-dot" />
                  <span>{statusText}</span>
                </span>
              </div>

              <div className="md-teams">
                <div className="md-team">
                  <div className="md-team-logo">
                    <img src={data.homeLogo} alt={data.home} />
                  </div>
                  <div className="md-team-name">{data.home}</div>
                </div>

                <div className="md-score-center">
                  {data.status === 'upcoming' ? (
                    <>
                      <div className="md-vs">VS</div>
                      <div className="md-score-label" />
                    </>
                  ) : (
                    <>
                      <div className="md-score">{data.score}</div>
                      <div className="md-score-label">
                        {data.status === 'live' ? data.minute : 'Full Time'}
                      </div>
                    </>
                  )}
                </div>

                <div className="md-team">
                  <div className="md-team-logo">
                    <img src={data.awayLogo} alt={data.away} />
                  </div>
                  <div className="md-team-name">{data.away}</div>
                </div>
              </div>
            </div>

            {/* ── Duel section ── */}
            <div className="md-duel">
              <div className="md-duel-title">Your H2H Prediction Duel</div>
              <div className="md-duel-card">
                <div className="md-duel-players">
                  <div className="md-duel-player">
                    <div className="md-duel-avatar you">{data.youInit}</div>
                    <div className="md-duel-name">{data.youName}</div>
                    <div className="md-duel-you-tag">You</div>
                  </div>
                  <div className="md-duel-vs">VS</div>
                  <div className="md-duel-player">
                    <div className="md-duel-avatar opp">{data.oppInit}</div>
                    <div className="md-duel-name">{data.oppName}</div>
                  </div>
                </div>

                <div className="md-pred-compare">
                  <div className={youPickClass}>
                    <div className="md-pred-label">Your Pick</div>
                    <div className="md-pred-choice">{data.youPick}</div>
                    <div className={youResultClass}>
                      {data.status === 'ft' && renderResultIcon(data.youCorrect)}
                    </div>
                  </div>
                  <div className="md-pred-vs">VS</div>
                  <div className={oppPickClass}>
                    <div className="md-pred-label">Their Pick</div>
                    <div className="md-pred-choice">{oppChoiceDisplay}</div>
                    <div className={oppResultClass}>
                      {data.status === 'ft' && renderResultIcon(data.oppCorrect)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── H2H Score ── */}
            <div className="md-h2h-score">
              <div className="md-h2h-bar">
                <div className="md-h2h-title">Matchday H2H Score</div>
                <div className="md-h2h-display">
                  <div className="md-h2h-player">
                    <div className="md-h2h-player-name">{data.youName}</div>
                    <div className={h2hYouClass}>{data.h2hYou}</div>
                  </div>
                  <div className="md-h2h-dash">&ndash;</div>
                  <div className="md-h2h-player">
                    <div className="md-h2h-player-name">{data.oppName}</div>
                    <div className={h2hOppClass}>{data.h2hOpp}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Match Info ── */}
            <div className="md-info">
              <div className="md-info-row">
                <span className="md-info-label">Competition</span>
                <span className="md-info-value">{data.competition}</span>
              </div>
              <div className="md-info-row">
                <span className="md-info-label">Matchday</span>
                <span className="md-info-value">{data.matchday}</span>
              </div>
              <div className="md-info-row">
                <span className="md-info-label">Kickoff</span>
                <span className="md-info-value">{data.kickoff}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
