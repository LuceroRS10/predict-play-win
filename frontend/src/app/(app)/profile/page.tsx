'use client';

import React, { useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

/* ─── Mock Data ─── */
const MOCK_PROFILE = {
  id: 'u1',
  name: 'Carlos Martinez',
  country: 'Spain',
  club: 'Real Madrid',
  clubLogo: 'https://media.api-sports.io/football/teams/541.png',
  memberSince: 'Jan 2024',
  elo: 1247,
  rank: 3,
  winRate: 68,
  avatarUrl: 'https://i.pravatar.cc/150?img=59',
  frameName: 'Champion Frame',
};

const STAT_CARDS = [
  {
    key: 'elo',
    color: '#3B82F6',
    label: 'ELO RATING',
    value: '1,247',
    sub: 'Top 0.3% of players',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B82F6">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    key: 'winrate',
    color: '#22C55E',
    label: 'WIN RATE',
    value: '68%',
    sub: '45 Wins · Top 12% of players',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#22C55E">
        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
      </svg>
    ),
  },
  {
    key: 'record',
    color: '#F59E0B',
    label: 'RECORD',
    value: null, // custom render
    sub: 'Total 65 Matches',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
      </svg>
    ),
  },
  {
    key: 'tournaments',
    color: '#DAA520',
    label: 'TOURNAMENTS WON',
    value: '3',
    sub: 'Current: Quarterfinals',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#DAA520">
        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" />
      </svg>
    ),
  },
];

interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: 'gold' | 'red' | 'purple' | 'green' | 'blue';
  locked: boolean;
  icon: React.ReactNode;
  gradient: string;
}

const ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'a1',
    title: 'Tournament Champion',
    description: 'Win a tournament',
    category: 'gold',
    locked: false,
    gradient: 'linear-gradient(135deg, #DAA520, #FFD700, #B8860B)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" />
      </svg>
    ),
  },
  {
    id: 'a2',
    title: 'Streak Master',
    description: '5 wins in a row',
    category: 'red',
    locked: false,
    gradient: 'linear-gradient(135deg, #EF4444, #F97316, #DC2626)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
      </svg>
    ),
  },
  {
    id: 'a3',
    title: 'Prediction Guru',
    description: '70%+ accuracy over 50 matches',
    category: 'purple',
    locked: false,
    gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA, #6D28D9)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
  },
  {
    id: 'a4',
    title: 'League Warrior',
    description: 'Play 50 league matches',
    category: 'green',
    locked: false,
    gradient: 'linear-gradient(135deg, #22C55E, #4ADE80, #16A34A)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
      </svg>
    ),
  },
  {
    id: 'a5',
    title: 'Community Star',
    description: 'Challenge 20 different players',
    category: 'green',
    locked: false,
    gradient: 'linear-gradient(135deg, #10B981, #34D399, #059669)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
  {
    id: 'a6',
    title: 'Rising Star',
    description: 'Reach 1200 ELO',
    category: 'blue',
    locked: false,
    gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA, #2563EB)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: 'a7',
    title: 'Unstoppable',
    description: '10 wins in a row',
    category: 'red',
    locked: true,
    gradient: 'linear-gradient(135deg, #EF4444, #F97316, #DC2626)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" />
      </svg>
    ),
  },
  {
    id: 'a8',
    title: 'Grand Master',
    description: 'Reach 1500 ELO',
    category: 'gold',
    locked: true,
    gradient: 'linear-gradient(135deg, #DAA520, #FFD700, #B8860B)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
];

const TOURNAMENT_HISTORY = [
  {
    name: 'La Liga Pred. Cup S2',
    status: 'Active - QF',
    badge: 'IN PROGRESS',
    badgeColor: '#DAA520',
    leagueLogo: 'https://media.api-sports.io/football/leagues/140.png',
    bgColor: 'rgba(218,165,32,0.1)',
  },
  {
    name: 'La Liga Pred. Cup S1',
    status: 'Champion',
    badge: 'trophy',
    badgeColor: '#DAA520',
    leagueLogo: 'https://media.api-sports.io/football/leagues/140.png',
    bgColor: 'rgba(34,197,94,0.05)',
  },
  {
    name: 'PL Prediction Cup',
    status: 'Semifinal',
    badge: '3rd',
    badgeColor: '#C0C0C0',
    leagueLogo: 'https://media.api-sports.io/football/leagues/39.png',
    bgColor: 'rgba(255,255,255,0.02)',
  },
];

const RECENT_H2H = [
  { opponent: 'AlexGamer7', scoreA: 3, scoreB: 1, result: 'W' as const, date: 'May 18' },
  { opponent: 'FUT_King', scoreA: 4, scoreB: 2, result: 'W' as const, date: 'May 15' },
  { opponent: 'TheStriker10', scoreA: 1, scoreB: 3, result: 'L' as const, date: 'May 12' },
];

const H2H_RECORDS = [
  { opponent: 'AlexGamer7', m: 8, w: 6, d: 1, l: 1, pct: '75%' },
  { opponent: 'FUT_King', m: 7, w: 4, d: 2, l: 1, pct: '57%' },
  { opponent: 'TheStriker10', m: 6, w: 4, d: 0, l: 2, pct: '67%' },
];

/* ─── ELO Chart Sub-Component ─── */
function EloChart() {
  const points = '0,100 40,95 80,85 120,90 160,70 200,60 240,40 280,35 320,25 360,20 400,15';
  const areaPoints = points + ' 400,120 0,120';

  return (
    <svg viewBox="0 0 400 120" style={{ width: '100%', height: '120px' }}>
      <defs>
        <linearGradient id="eloGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline fill="url(#eloGrad)" stroke="none" points={areaPoints} />
      <polyline fill="none" stroke="var(--accent)" strokeWidth={2} points={points} />
      <text x="0" y="115" fill="var(--tx3)" fontSize="8">Nov &apos;24</text>
      <text x="100" y="115" fill="var(--tx3)" fontSize="8">Jan &apos;25</text>
      <text x="200" y="115" fill="var(--tx3)" fontSize="8">Mar &apos;25</text>
      <text x="320" y="115" fill="var(--tx3)" fontSize="8">May &apos;25</text>
    </svg>
  );
}

/* ─── Spain Flag SVG ─── */
function SpainFlag({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ borderRadius: '50%', flexShrink: 0 }}>
      <rect width="32" height="32" fill="#C60B1E" />
      <rect y="8" width="32" height="16" fill="#FFC400" />
      <rect y="24" width="32" height="8" fill="#C60B1E" />
    </svg>
  );
}

/* ─── Lock Icon ─── */
function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  );
}

/* ─── Trophy Icon ─── */
function TrophyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#DAA520">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" />
    </svg>
  );
}

/* ─── Main Profile Page ─── */
function ProfilePageInner() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const achScrollRef = useRef<HTMLDivElement>(null);
  const [showCompare, setShowCompare] = useState(false);

  const playerId = searchParams.get('id');
  const isOwnProfile = !playerId || playerId === user?.id;
  const profile = MOCK_PROFILE;

  const scrollAch = useCallback((dir: number) => {
    achScrollRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' });
  }, []);

  const handleChallenge = useCallback(() => {
    // TODO: Open challenge modal for this player
    router.push(`/arena?challenge=${profile.name}`);
  }, [router, profile.name]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back Button */}
      <button
        className="btn btn-o mb-16"
        onClick={() => router.push('/players')}
        style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px' }}
      >
        ← {t.back_to_players || 'Back to Players'}
      </button>

      {/* ═══════ CONCEPT B: Card Showcase Hero ═══════ */}
      <div className="pf-card-hero">
        <div className="pf-card-layout">
          {/* Avatar Ring */}
          <div className="pf-avatar-ring">
            <img src={profile.avatarUrl} alt={profile.name} />
            <div className="pf-frame-label">{t.champion_frame || 'Champion Frame'}</div>
          </div>

          {/* Info Column */}
          <div className="pf-info-col">
            <div className="pf-name">{profile.name}</div>
            <div className="pf-meta">
              <SpainFlag size={14} /> {profile.country} | {profile.club} | {t.member_since || 'Member since'} {profile.memberSince}
            </div>
            <div className="pf-actions">
              {isOwnProfile ? (
                <button
                  className="pf-btn-challenge"
                  onClick={() => router.push('/settings')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                  {' '}{t.edit_profile || 'Edit Profile'}
                </button>
              ) : (
                <button className="pf-btn-challenge" onClick={handleChallenge}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.92 5L5.5 6.42 10.08 11 5.5 15.58 6.92 17 13 11 6.92 5zm6 0L11.5 6.42 16.08 11 11.5 15.58 12.92 17 19 11 12.92 5z" />
                  </svg>
                  {' '}{t.challenge_btn || 'Challenge'}
                </button>
              )}
              <button className="pf-btn-compare" onClick={() => setShowCompare(!showCompare)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v-2H5V5h5V3zm4 18h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-5v2h5v14h-5v2z" />
                </svg>
                {' '}{t.compare_btn || 'Compare'}
              </button>
            </div>
          </div>

          {/* Stats Row (ELO / Rank / Win Rate pills) */}
          <div className="pf-stats-row">
            <div className="pf-stat-pill">
              <div className="pf-stat-val" style={{ color: '#22C55E' }}>{profile.elo.toLocaleString()}</div>
              <div className="pf-stat-label">ELO</div>
            </div>
            <div className="pf-stat-divider" />
            <div className="pf-stat-pill">
              <div className="pf-stat-val" style={{ color: 'var(--accent)' }}>#{profile.rank}</div>
              <div className="pf-stat-label">Rank</div>
            </div>
            <div className="pf-stat-divider" />
            <div className="pf-stat-pill">
              <div className="pf-stat-val">{profile.winRate}%</div>
              <div className="pf-stat-label">{t.win_rate_label || 'Win Rate'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ Stat Cards ═══════ */}
      <div className="pf-stat-cards">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.key}
            className="pf-stat-card"
            style={{ borderTopColor: card.color }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="pf-stat-card-title">
              {card.icon} {card.label}
            </div>
            {card.key === 'record' ? (
              <div className="pf-stat-card-val" style={{ fontSize: '22px' }}>
                <span style={{ color: '#22C55E' }}>45W</span>
                {' - '}
                <span style={{ color: 'var(--tx3)' }}>12D</span>
                {' - '}
                <span style={{ color: '#EF4444' }}>8L</span>
              </div>
            ) : (
              <div className="pf-stat-card-val">{card.value}</div>
            )}
            <div className="pf-stat-card-sub">{card.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ═══════ Achievements ═══════ */}
      <div className="pf-ach-section">
        <div className="pf-ach-header">
          <div className="pf-ach-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#DAA520">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {' '}{t.achievements || 'ACHIEVEMENTS'}
          </div>
          <div className="pf-ach-count">
            {ACHIEVEMENTS.filter(a => !a.locked).length}/{ACHIEVEMENTS.length} Unlocked
          </div>
        </div>

        <div className="pf-ach-scroll-wrap">
          <button className="pf-ach-arrow left" onClick={() => scrollAch(-1)}>&lt;</button>
          <div className="pf-ach-scroll" ref={achScrollRef}>
            {ACHIEVEMENTS.map((ach) => (
              <div key={ach.id} className={`pf-ach-card cat-${ach.category}${ach.locked ? ' locked' : ''}`}>
                <div className="pf-ach-icon">
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: ach.locked ? 'rgba(128,128,128,0.3)' : ach.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: ach.locked ? 'none' : `0 4px 16px rgba(0,0,0,0.3)`,
                      position: 'relative',
                      opacity: ach.locked ? 0.5 : 1,
                    }}
                  >
                    {ach.locked ? <LockIcon /> : ach.icon}
                  </div>
                </div>
                <div className="pf-ach-name" style={{ fontSize: '11px', fontWeight: 700, marginTop: '8px', textAlign: 'center' }}>
                  {ach.title}
                </div>
                <div className="pf-ach-desc" style={{ fontSize: '9px', color: 'var(--tx3)', textAlign: 'center', marginTop: '2px' }}>
                  {ach.description}
                </div>
              </div>
            ))}
          </div>
          <button className="pf-ach-arrow right" onClick={() => scrollAch(1)}>&gt;</button>
        </div>
      </div>

      {/* ═══════ ELO History + Tournament History (2-col grid) ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* ELO History Chart */}
        <div className="crd" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
            {t.elo_history || 'ELO History'}
          </h3>
          <div style={{ textAlign: 'right', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--green)' }}>1,247</span>
            {' '}
            <span style={{ fontSize: '11px', color: 'var(--tx3)' }}>Current ELO</span>
          </div>
          <EloChart />
        </div>

        {/* Tournament History */}
        <div className="crd" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
            {t.tournament_history || 'Tournament History'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TOURNAMENT_HISTORY.map((th, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  borderRadius: '8px',
                  background: th.bgColor,
                }}
              >
                <div className="badge-c badge-sm">
                  <img src={th.leagueLogo} alt={th.name} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{th.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--tx3)' }}>{th.status}</div>
                </div>
                {th.badge === 'trophy' ? (
                  <span style={{ color: '#DAA520', fontWeight: 700, fontSize: '14px' }}>
                    <TrophyIcon />
                  </span>
                ) : (
                  <span style={{
                    color: th.badgeColor,
                    fontSize: th.badge === 'IN PROGRESS' ? '10px' : '11px',
                    fontWeight: th.badge === 'IN PROGRESS' ? 700 : 600,
                  }}>
                    {th.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ Recent H2H + Head-to-Head Record (2-col grid) ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Recent H2H Results */}
        <div className="crd" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{t.recent_h2h || 'Recent H2H Results'}</h3>
            <a href="#" style={{ fontSize: '11px', color: 'var(--accent)' }}>{t.view_all_btn || 'View All'}</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {RECENT_H2H.map((match, i) => {
              const isWin = match.result === 'W';
              const bgColor = isWin ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)';
              const scoreColor = isWin ? '#22C55E' : '#EF4444';
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px',
                    borderRadius: '8px',
                    background: bgColor,
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>vs {match.opponent}</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: scoreColor }}>
                    {match.scoreA} - {match.scoreB}
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--tx3)' }}>{match.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Head-to-Head Record Table */}
        <div className="crd" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
            {t.h2h_records || 'Head-to-Head Record'}
          </h3>
          <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'var(--tx3)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '6px 4px' }}>OPPONENT</th>
                <th>M</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {H2H_RECORDS.map((rec, i) => (
                <tr key={i} style={{ borderBottom: i < H2H_RECORDS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '6px 4px', fontWeight: 600 }}>{rec.opponent}</td>
                  <td>{rec.m}</td>
                  <td style={{ color: '#22C55E' }}>{rec.w}</td>
                  <td>{rec.d}</td>
                  <td style={{ color: '#EF4444' }}>{rec.l}</td>
                  <td style={{ color: '#22C55E' }}>{rec.pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════ Compare Panel (Animated) ═══════ */}
      <AnimatePresence>
        {showCompare && (
          <motion.div
            className="crd"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            style={{ padding: '20px', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Compare Players</h3>
              <button
                onClick={() => setShowCompare(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--tx3)',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center' }}>
              {/* Player 1 */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    margin: '0 auto 8px',
                    border: '2px solid var(--accent)',
                  }}
                >
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>{profile.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>ELO {profile.elo.toLocaleString()}</div>
              </div>

              {/* VS */}
              <div style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--accent)',
                padding: '0 12px',
              }}>
                VS
              </div>

              {/* Player 2 (placeholder) */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    margin: '0 auto 8px',
                    border: '2px dashed var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--tx3)',
                    fontSize: '24px',
                    background: 'var(--bg-card)',
                  }}
                >
                  +
                </div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--tx3)' }}>Select Player</div>
                <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>Search to compare</div>
              </div>
            </div>

            {/* Compare Stats Preview */}
            <div style={{ marginTop: '16px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '8px',
                fontSize: '12px',
              }}>
                {[
                  { label: 'ELO', left: '1,247', right: '—' },
                  { label: 'Win Rate', left: '68%', right: '—' },
                  { label: 'Matches', left: '65', right: '—' },
                  { label: 'Tournaments', left: '3', right: '—' },
                ].map((row) => (
                  <React.Fragment key={row.label}>
                    <div style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>{row.left}</div>
                    <div style={{ textAlign: 'center', fontWeight: 600, color: 'var(--tx3)', fontSize: '10px', textTransform: 'uppercase' }}>{row.label}</div>
                    <div style={{ textAlign: 'center', fontWeight: 700, color: 'var(--tx3)' }}>{row.right}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" /></div>}>
      <ProfilePageInner />
    </Suspense>
  );
}
