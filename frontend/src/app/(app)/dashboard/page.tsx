'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PredictionCard {
  id: number;
  type: 'tournament' | 'league' | 'challenge';
  typeLabel: string;
  comp: string;
  matchday: string;
  standing: string;
  standingDetail: string;
  opponent: string;
  opponentElo: number;
  opponentClub: number;
  opponentStanding: string;
  opponentInitials: string;
  lockTime: string;
  matchCount: number;
  urgent: boolean;
  done: boolean;
}

interface RecentResult {
  id: number;
  result: 'win' | 'draw' | 'loss';
  resultLabel: string;
  opponent: string;
  opponentCrest: string;
  opponentCrestAlt: string;
  compType: 'tournament' | 'league' | 'challenge';
  compTypeLabel: string;
  compName: string;
  scoreUser: number;
  scoreOpp: number;
  eloChange: number;
}

interface ActiveChallenge {
  id: number;
  name: string;
  elo: number;
  clubLogo: string;
  clubAlt: string;
  leagueLogo: string;
  leagueAlt: string;
  leagueLabel: string;
  timeRemaining: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockPredictions: PredictionCard[] = [
  {
    id: 1,
    type: 'tournament',
    typeLabel: 'Tournament',
    comp: 'La Liga Cup S2',
    matchday: 'Matchday 2',
    standing: 'Group A \u2022 2nd Place',
    standingDetail: 'W1 D0 L0 \u2022 3 pts',
    opponent: 'Diego R.',
    opponentElo: 1218,
    opponentClub: 530,
    opponentStanding: '1st in Group A',
    opponentInitials: 'DR',
    lockTime: '2h 15m',
    matchCount: 10,
    urgent: true,
    done: false,
  },
  {
    id: 2,
    type: 'league',
    typeLabel: 'League',
    comp: 'PPW Division S1',
    matchday: 'Week 7',
    standing: 'Division 1 \u2022 3rd Place',
    standingDetail: 'W4 D1 L1 \u2022 13 pts',
    opponent: 'SofiaL',
    opponentElo: 1185,
    opponentClub: 536,
    opponentStanding: '1st in Division 1',
    opponentInitials: 'SL',
    lockTime: '4h 30m',
    matchCount: 10,
    urgent: false,
    done: true,
  },
  {
    id: 3,
    type: 'tournament',
    typeLabel: 'Tournament',
    comp: 'La Liga Cup S2',
    matchday: 'Matchday 2',
    standing: 'Group A \u2022 2nd Place',
    standingDetail: 'W1 D0 L0 \u2022 3 pts',
    opponent: 'Ana P.',
    opponentElo: 1156,
    opponentClub: 548,
    opponentStanding: '4th in Group A',
    opponentInitials: 'AP',
    lockTime: '2h 15m',
    matchCount: 10,
    urgent: true,
    done: false,
  },
  {
    id: 4,
    type: 'challenge',
    typeLabel: 'Challenge',
    comp: '1v1 Challenge',
    matchday: 'La Liga R28',
    standing: 'Ranked #3 Global',
    standingDetail: 'ELO 1,247',
    opponent: 'Javier S.',
    opponentElo: 1134,
    opponentClub: 529,
    opponentStanding: 'Ranked #12 Global',
    opponentInitials: 'JS',
    lockTime: '1d 6h',
    matchCount: 10,
    urgent: false,
    done: false,
  },
];

const mockResults: RecentResult[] = [
  {
    id: 1,
    result: 'win',
    resultLabel: 'W',
    opponent: 'Ana P.',
    opponentCrest: 'https://media.api-sports.io/football/teams/536.png',
    opponentCrestAlt: 'SEV',
    compType: 'tournament',
    compTypeLabel: 'Tournament',
    compName: 'La Liga Cup S2',
    scoreUser: 7,
    scoreOpp: 4,
    eloChange: 18,
  },
  {
    id: 2,
    result: 'draw',
    resultLabel: 'D',
    opponent: 'Marco T.',
    opponentCrest: 'https://media.api-sports.io/football/teams/533.png',
    opponentCrestAlt: 'VIL',
    compType: 'league',
    compTypeLabel: 'League',
    compName: 'Division S1',
    scoreUser: 5,
    scoreOpp: 5,
    eloChange: 0,
  },
  {
    id: 3,
    result: 'win',
    resultLabel: 'W',
    opponent: 'Lucia V.',
    opponentCrest: 'https://media.api-sports.io/football/teams/548.png',
    opponentCrestAlt: 'RSO',
    compType: 'challenge',
    compTypeLabel: 'Challenge',
    compName: '1v1',
    scoreUser: 8,
    scoreOpp: 3,
    eloChange: 24,
  },
  {
    id: 4,
    result: 'loss',
    resultLabel: 'L',
    opponent: 'Sofia L.',
    opponentCrest: 'https://media.api-sports.io/football/teams/536.png',
    opponentCrestAlt: 'SEV',
    compType: 'tournament',
    compTypeLabel: 'Tournament',
    compName: 'La Liga Cup S2',
    scoreUser: 3,
    scoreOpp: 6,
    eloChange: -22,
  },
];

const mockChallenges: ActiveChallenge[] = [
  {
    id: 1,
    name: 'Javier S.',
    elo: 1134,
    clubLogo: 'https://media.api-sports.io/football/teams/529.png',
    clubAlt: 'BAR',
    leagueLogo: 'https://media.api-sports.io/football/leagues/140.png',
    leagueAlt: 'La Liga',
    leagueLabel: 'La Liga \u2022 Round 28',
    timeRemaining: '23h 48m remaining',
  },
  {
    id: 2,
    name: 'Luc\u00eda G.',
    elo: 1089,
    clubLogo: 'https://media.api-sports.io/football/teams/530.png',
    clubAlt: 'ATM',
    leagueLogo: 'https://media.api-sports.io/football/leagues/39.png',
    leagueAlt: 'PL',
    leagueLabel: 'Premier League \u2022 Round 35',
    timeRemaining: '1d 6h remaining',
  },
];

// ─── SVG Icon Components ─────────────────────────────────────────────────────

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74L12 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const BarChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 20V10" />
    <path d="M18 20V4" />
    <path d="M6 20v-4" />
  </svg>
);

const SwordIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.5 17.5L3 6V1h5l11.5 11.5" />
    <path d="M13 7L8 2" />
    <path d="M16 16l6 6" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const TrendUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 11, height: 11, opacity: 0.6 }}>
    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
  </svg>
);

const AllDoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <path d="M22 4L12 14.01l-3-3" />
  </svg>
);

// Type icons for prediction cards (filled style)
const TypeIcons: Record<string, React.ReactNode> = {
  tournament: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  ),
  league: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z" />
    </svg>
  ),
  challenge: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.04 4.55l-1.42 1.42a8.001 8.001 0 01-.15 11.18 7.99 7.99 0 01-11.18.15L4.87 18.72A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10 0-2.94-1.28-5.59-3.31-7.41l.35-.04zM12 2C6.48 2 2 6.48 2 12c0 2.94 1.28 5.59 3.31 7.41l1.42-1.42a7.987 7.987 0 01.15-11.18 7.99 7.99 0 0111.18-.15l1.42-1.42A9.96 9.96 0 0012 2zm3.44 8.56L12 7.12 8.56 10.56 12 14l3.44-3.44z" />
    </svg>
  ),
};

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: 'easeOut' },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

// ─── Helper ──────────────────────────────────────────────────────────────────

function typeColor(type: string): string {
  return type === 'tournament' ? '#3B82F6' : type === 'league' ? '#22C55E' : '#F59E0B';
}

function eloChangeClass(val: number): string {
  if (val > 0) return 'positive';
  if (val < 0) return 'negative';
  return 'neutral';
}

function eloChangeStr(val: number): string {
  if (val > 0) return `+${val}`;
  if (val === 0) return '+0';
  return `${val}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  // Derived counts
  const doneCount = useMemo(() => mockPredictions.filter((p) => p.done).length, []);
  const totalCount = mockPredictions.length;
  const pendingCount = totalCount - doneCount;

  // Progress ring calculation
  const circumference = 2 * Math.PI * 45;
  const ringOffset = circumference - (doneCount / totalCount) * circumference;

  const userName = user?.username ?? 'Carlos';

  // Handlers
  const handlePredictNow = (predId: number) => {
    // TODO: Open duel modal for this prediction
    console.log('Open prediction duel:', predId);
  };

  const handleResultClick = (resultId: number) => {
    // TODO: Open matchday duel detail
    console.log('Open result detail:', resultId);
  };

  const handleProfileClick = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    console.log('Navigate to profile:', name);
    router.push('/players');
  };

  const handleAcceptChallenge = (challengeId: number) => {
    console.log('Accept challenge:', challengeId);
  };

  const handleDeclineChallenge = (challengeId: number) => {
    console.log('Decline challenge:', challengeId);
  };

  return (
    <div className="page active" id="page-dashboard">
      {/* ────── Welcome Header ────── */}
      <motion.div
        className="dash-welcome"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="dash-welcome-left">
          <h1 className="dash-welcome-greeting">
            {t.good_evening} <span className="dash-welcome-name">{userName}</span>
          </h1>
          <p className="dash-welcome-sub">
            {/* i18n: predictions_waiting */}
            You have <span className="dash-pending-count">{pendingCount}</span> predictions waiting
          </p>
        </div>
        <div className="dash-welcome-stats">
          {/* ELO quick stat */}
          <div className="dash-qstat">
            <div className="dash-qstat-icon qs-blue">
              <BoltIcon />
            </div>
            <div className="dash-qstat-info">
              <span className="dash-qstat-val qs-blue-text">1,247</span>
              <span className="dash-qstat-label">{t.elo_label || 'ELO'}</span>
            </div>
          </div>
          {/* Rank quick stat */}
          <div className="dash-qstat">
            <div className="dash-qstat-icon qs-gold">
              <StarIcon />
            </div>
            <div className="dash-qstat-info">
              <span className="dash-qstat-val qs-gold-text">#3</span>
              <span className="dash-qstat-label">{t.rank_label || 'Rank'}</span>
            </div>
          </div>
          {/* Win Rate quick stat */}
          <div className="dash-qstat">
            <div className="dash-qstat-icon qs-green">
              <ClockIcon />
            </div>
            <div className="dash-qstat-info">
              <span className="dash-qstat-val qs-green-text">68%</span>
              <span className="dash-qstat-label">{t.win_rate_label || 'Win Rate'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ────── Predictions Tracker ────── */}
      <motion.div
        className="predictions-tracker"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Header */}
        <div className="predictions-tracker-header">
          <div className="predictions-tracker-title">
            <div className="tracker-icon">
              <EditIcon />
            </div>
            <h2>{t.predictions_due || 'Predictions Due'}</h2>
          </div>
          <div className="tracker-progress">
            <div className="tracker-progress-ring">
              <svg viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="trackerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#4ADE80" />
                  </linearGradient>
                </defs>
                <circle className="ring-bg" cx="50" cy="50" r="45" />
                <circle
                  className="ring-fill"
                  cx="50"
                  cy="50"
                  r="45"
                  style={{ strokeDashoffset: ringOffset }}
                />
              </svg>
              <div className="tracker-progress-center">
                <div className="prog-num">{doneCount}</div>
                <div className="prog-of">of {totalCount}</div>
              </div>
            </div>
            <div className="tracker-progress-text">
              <strong>{doneCount}</strong> of <span>{totalCount}</span> completed
            </div>
          </div>
        </div>

        {/* Tracker Cards */}
        <div className="tracker-cards">
          {mockPredictions.map((pred, idx) => {
            const stateClass = pred.done ? 'done' : 'pending';
            const tColor = typeColor(pred.type);
            const clubUrl = `https://media.api-sports.io/football/teams/${pred.opponentClub}.png`;
            const lockClass = pred.done ? 'done' : pred.urgent ? 'urgent' : 'normal';
            const lockLabel = pred.done ? 'STATUS' : (t.locks_in || 'LOCKS IN');
            const lockTimeStr = pred.done ? 'Submitted' : pred.lockTime;

            return (
              <motion.div
                key={pred.id}
                className={`tc2-card ${stateClass}`}
                style={{ '--type-color': tColor } as React.CSSProperties}
                onClick={() => handlePredictNow(pred.id)}
                custom={idx}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
              >
                {/* Number badge */}
                <div className="tc2-num-section">
                  <div className="tc2-number">{pred.id}</div>
                </div>

                {/* Info section */}
                <div className="tc2-info-section">
                  <div className="tc2-info-row1">
                    <div className="tc2-comp-badge" style={{ '--comp-color': tColor } as React.CSSProperties}>
                      {TypeIcons[pred.type]} {pred.typeLabel}
                    </div>
                    <span className="tc2-comp-name">
                      {pred.comp} &bull; {pred.matchday}
                    </span>
                  </div>
                  <div className="tc2-info-row2">
                    <div className="tc2-standing">
                      <TrendUpIcon />
                      {pred.standing}
                    </div>
                    <div className="tc2-standing-sep" />
                    <div className="tc2-standing-detail">{pred.standingDetail}</div>
                  </div>
                  <div className="tc2-vs-inline">
                    <div className="tc2-avatar-mini you">
                      <img src="https://i.pravatar.cc/150?img=59" alt="You" />
                    </div>
                    <span className="tc2-vs-text">vs</span>
                    <div className="tc2-avatar-mini opp">
                      <img
                        src={clubUrl}
                        alt={pred.opponent}
                        style={{ padding: 2, borderRadius: 0, objectFit: 'contain' }}
                      />
                    </div>
                    <span className="tc2-opp-name">{pred.opponent}</span>
                    <span className="tc2-opp-standing">{pred.opponentStanding}</span>
                  </div>
                </div>

                {/* Action section */}
                <div className="tc2-action-section">
                  <div className={`tc2-lock ${lockClass}`}>
                    <div className="tc2-lock-label">{lockLabel}</div>
                    <div className="tc2-lock-time">
                      {pred.done ? <CheckIcon /> : <LockIcon />} {lockTimeStr}
                    </div>
                  </div>
                  {pred.done ? (
                    <button className="tc2-action completed" onClick={(e) => e.stopPropagation()}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        style={{ width: 12, height: 12 }}
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Done
                    </button>
                  ) : (
                    <button
                      className="tc2-action predict"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePredictNow(pred.id);
                      }}
                    >
                      {t.predict_now || 'Predict Now'}{' '}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        style={{ width: 12, height: 12 }}
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* All done celebration (shows when all predictions are submitted) */}
          {doneCount === totalCount && (
            <motion.div
              className="tc2-all-done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="tc2-done-icon">
                <AllDoneIcon />
              </div>
              <h3>All Predictions Made!</h3>
              <p>You are all caught up. Sit back and wait for the results.</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ────── Bottom Grid: Recent Results + Active Challenges ────── */}
      <div className="dash-bottom-grid">
        {/* ── Recent Results Panel ── */}
        <motion.div
          className="dash-panel"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeIn}
        >
          <div className="dash-panel-header">
            <div className="dash-panel-title">
              <div className="dph-icon results-icon">
                <BarChartIcon />
              </div>
              <h3>{t.recent_results || 'Recent Results'}</h3>
            </div>
            <a
              className="dash-panel-link"
              onClick={() => router.push('/leaderboard')}
              style={{ cursor: 'pointer' }}
            >
              {t.view_all || 'View All'}{' '}
              <ArrowRightIcon />
            </a>
          </div>
          <div className="dash-results-list">
            {mockResults.map((res, idx) => (
              <motion.div
                key={res.id}
                className="dash-result-card"
                onClick={() => handleResultClick(res.id)}
                style={{ cursor: 'pointer' }}
                custom={idx + 1}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
              >
                <div className={`drc-result-badge ${res.result}`}>{res.resultLabel}</div>
                <div className="drc-center">
                  <div className="drc-opponent-row">
                    <span className="drc-vs-label">vs</span>
                    <img className="drc-crest" src={res.opponentCrest} alt={res.opponentCrestAlt} />
                    <span
                      className="drc-opp-name clickable-name"
                      onClick={(e) => handleProfileClick(e, res.opponent)}
                    >
                      {res.opponent}
                    </span>
                  </div>
                  <div className="drc-meta">
                    <span className={`drc-comp-pill ${res.compType}`}>{res.compTypeLabel}</span>{' '}
                    {res.compName}
                    {res.compType === 'league' && ' \u2022 Wk 6'}
                    {res.compType === 'challenge' && ' \u2022 La Liga R27'}
                  </div>
                </div>
                <div className="drc-score-block">
                  <div className="drc-score">
                    <span className={`drc-score-val ${res.scoreUser >= res.scoreOpp ? (res.scoreUser === res.scoreOpp ? 'draw' : 'win') : 'loss'}`}>
                      {res.scoreUser}
                    </span>
                    <span className="drc-score-dash">-</span>
                    <span className={`drc-score-val ${res.scoreOpp >= res.scoreUser ? (res.scoreOpp === res.scoreUser ? 'draw' : 'win') : 'loss'}`}>
                      {res.scoreOpp}
                    </span>
                  </div>
                  <span className={`drc-elo-change ${eloChangeClass(res.eloChange)}`}>
                    {eloChangeStr(res.eloChange)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Active Challenges Panel ── */}
        <motion.div
          className="dash-panel"
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeIn}
        >
          <div className="dash-panel-header">
            <div className="dash-panel-title">
              <div className="dph-icon challenges-icon">
                <SwordIcon />
              </div>
              <h3>{t.active_challenges || 'Active Challenges'}</h3>
            </div>
            <a
              className="dash-panel-link"
              onClick={() => router.push('/arena')}
              style={{ cursor: 'pointer' }}
            >
              {t.view_all || 'View All'}{' '}
              <ArrowRightIcon />
            </a>
          </div>
          <div className="dash-challenges-list">
            {mockChallenges.map((ch, idx) => (
              <motion.div
                key={ch.id}
                className="dash-challenge-card"
                custom={idx + 2}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
              >
                <div className="dcc-avatar-wrap">
                  <img className="dcc-avatar" src={ch.clubLogo} alt={ch.clubAlt} />
                  <div className="dcc-status-dot" />
                </div>
                <div className="dcc-info">
                  <div className="dcc-name-row">
                    <span
                      className="dcc-name clickable-name"
                      onClick={() => router.push('/players')}
                    >
                      {ch.name}
                    </span>
                    <span className="dcc-elo-pill">ELO {ch.elo.toLocaleString()}</span>
                  </div>
                  <div className="dcc-league-row">
                    <img className="dcc-league-logo" src={ch.leagueLogo} alt={ch.leagueAlt} /> {ch.leagueLabel}
                  </div>
                  <div className="dcc-timer">
                    <ClockIcon />
                    <span>{ch.timeRemaining}</span>
                  </div>
                </div>
                <div className="dcc-actions">
                  <button
                    className="dcc-btn accept"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptChallenge(ch.id);
                    }}
                  >
                    {t.accept || 'Accept'}
                  </button>
                  <button
                    className="dcc-btn decline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeclineChallenge(ch.id);
                    }}
                  >
                    {t.decline || 'Decline'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
