'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

// ─── SVG Icons ─────────────────────────────────────────────
const TrophyIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" />
  </svg>
);

const GroupIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </svg>
);

const PlayIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
  </svg>
);

// ─── Types ─────────────────────────────────────────────────
type TabId = 'grpA' | 'grpB' | 'grpC' | 'grpD' | 'knockout';

interface Player {
  pos: number;
  name: string;
  crest: string;
  w: number;
  d: number;
  l: number;
  pts: number;
  form: ('w' | 'd' | 'l')[];
}

interface Fixture {
  player1: { name: string; crest: string };
  player2: { name: string; crest: string };
  score?: { s1: number; s2: number } | string; // string for draw like "3 - 3"
  winner?: 1 | 2 | null; // null for draw
  upcoming?: boolean;
}

interface MatchdayFixtures {
  matchday: string;
  status: 'upcoming' | 'completed';
  fixtures: Fixture[];
}

interface GroupData {
  label: string;
  letter: string;
  matchdayProgress: string;
  players: Player[];
  fixtures: MatchdayFixtures[];
}

interface BracketMatch {
  player1: { name: string; crest: string; score: number | null };
  player2: { name: string; crest: string; score: number | null };
  winner?: 1 | 2;
}

// ─── Mock Data ─────────────────────────────────────────────
const groupsData: Record<string, GroupData> = {
  grpA: {
    label: 'GROUP A',
    letter: 'A',
    matchdayProgress: 'Matchday 2/3',
    players: [
      { pos: 1, name: 'ViscaElBarça', crest: 'https://media.api-sports.io/football/teams/541.png', w: 2, d: 0, l: 0, pts: 6, form: ['w', 'w', 'w'] },
      { pos: 2, name: 'Madridista91', crest: 'https://media.api-sports.io/football/teams/541.png', w: 1, d: 1, l: 0, pts: 4, form: ['w', 'd', 'w'] },
      { pos: 3, name: 'AtletiForever', crest: 'https://media.api-sports.io/football/teams/530.png', w: 0, d: 1, l: 1, pts: 1, form: ['l', 'd'] },
      { pos: 4, name: 'txuri_urdin', crest: 'https://media.api-sports.io/football/teams/548.png', w: 0, d: 0, l: 2, pts: 0, form: ['l', 'l', 'l'] },
    ],
    fixtures: [
      {
        matchday: 'Matchday 3 (Upcoming)',
        status: 'upcoming',
        fixtures: [
          { player1: { name: 'ViscaElBarça', crest: 'https://media.api-sports.io/football/teams/541.png' }, player2: { name: 'Madridista91', crest: 'https://media.api-sports.io/football/teams/541.png' }, upcoming: true },
          { player1: { name: 'AtletiForever', crest: 'https://media.api-sports.io/football/teams/530.png' }, player2: { name: 'txuri_urdin', crest: 'https://media.api-sports.io/football/teams/548.png' }, upcoming: true },
        ],
      },
      {
        matchday: 'Matchday 2 (Completed)',
        status: 'completed',
        fixtures: [
          { player1: { name: 'ViscaElBarça', crest: 'https://media.api-sports.io/football/teams/541.png' }, player2: { name: 'txuri_urdin', crest: 'https://media.api-sports.io/football/teams/548.png' }, score: { s1: 6, s2: 3 }, winner: 1 },
          { player1: { name: 'Madridista91', crest: 'https://media.api-sports.io/football/teams/541.png' }, player2: { name: 'AtletiForever', crest: 'https://media.api-sports.io/football/teams/530.png' }, score: '3 - 3', winner: null },
        ],
      },
      {
        matchday: 'Matchday 1 (Completed)',
        status: 'completed',
        fixtures: [
          { player1: { name: 'ViscaElBarça', crest: 'https://media.api-sports.io/football/teams/541.png' }, player2: { name: 'AtletiForever', crest: 'https://media.api-sports.io/football/teams/530.png' }, score: { s1: 5, s2: 2 }, winner: 1 },
          { player1: { name: 'Madridista91', crest: 'https://media.api-sports.io/football/teams/541.png' }, player2: { name: 'txuri_urdin', crest: 'https://media.api-sports.io/football/teams/548.png' }, score: { s1: 4, s2: 1 }, winner: 1 },
        ],
      },
    ],
  },
  grpB: {
    label: 'GROUP B',
    letter: 'B',
    matchdayProgress: 'Matchday 2/3',
    players: [
      { pos: 1, name: 'SevillaFC_1890', crest: 'https://media.api-sports.io/football/teams/536.png', w: 2, d: 0, l: 0, pts: 6, form: ['w', 'w', 'w'] },
      { pos: 2, name: 'YellowSubmarine', crest: 'https://media.api-sports.io/football/teams/529.png', w: 1, d: 1, l: 0, pts: 4, form: ['w', 'd', 'w'] },
      { pos: 3, name: 'BetisVerdiblanco', crest: 'https://media.api-sports.io/football/teams/543.png', w: 0, d: 1, l: 1, pts: 1, form: ['l', 'd'] },
      { pos: 4, name: 'AmuntValencia', crest: 'https://media.api-sports.io/football/teams/532.png', w: 0, d: 0, l: 2, pts: 0, form: ['l', 'l', 'l'] },
    ],
    fixtures: [
      {
        matchday: 'Matchday 3 (Upcoming)',
        status: 'upcoming',
        fixtures: [
          { player1: { name: 'SevillaFC_1890', crest: 'https://media.api-sports.io/football/teams/536.png' }, player2: { name: 'YellowSubmarine', crest: 'https://media.api-sports.io/football/teams/529.png' }, upcoming: true },
          { player1: { name: 'BetisVerdiblanco', crest: 'https://media.api-sports.io/football/teams/543.png' }, player2: { name: 'AmuntValencia', crest: 'https://media.api-sports.io/football/teams/532.png' }, upcoming: true },
        ],
      },
      {
        matchday: 'Matchday 2 (Completed)',
        status: 'completed',
        fixtures: [
          { player1: { name: 'SevillaFC_1890', crest: 'https://media.api-sports.io/football/teams/536.png' }, player2: { name: 'AmuntValencia', crest: 'https://media.api-sports.io/football/teams/532.png' }, score: { s1: 5, s2: 2 }, winner: 1 },
          { player1: { name: 'YellowSubmarine', crest: 'https://media.api-sports.io/football/teams/529.png' }, player2: { name: 'BetisVerdiblanco', crest: 'https://media.api-sports.io/football/teams/543.png' }, score: '2 - 2', winner: null },
        ],
      },
      {
        matchday: 'Matchday 1 (Completed)',
        status: 'completed',
        fixtures: [
          { player1: { name: 'SevillaFC_1890', crest: 'https://media.api-sports.io/football/teams/536.png' }, player2: { name: 'BetisVerdiblanco', crest: 'https://media.api-sports.io/football/teams/543.png' }, score: { s1: 4, s2: 1 }, winner: 1 },
          { player1: { name: 'YellowSubmarine', crest: 'https://media.api-sports.io/football/teams/529.png' }, player2: { name: 'AmuntValencia', crest: 'https://media.api-sports.io/football/teams/532.png' }, score: { s1: 3, s2: 0 }, winner: 1 },
        ],
      },
    ],
  },
  grpC: {
    label: 'GROUP C',
    letter: 'C',
    matchdayProgress: 'Matchday 2/3',
    players: [
      { pos: 1, name: 'AthleticLions', crest: 'https://media.api-sports.io/football/teams/531.png', w: 2, d: 0, l: 0, pts: 6, form: ['w', 'w', 'w'] },
      { pos: 2, name: 'GironaFanatic', crest: 'https://media.api-sports.io/football/teams/547.png', w: 1, d: 0, l: 1, pts: 3, form: ['w', 'l'] },
      { pos: 3, name: 'CeltaDeVigo', crest: 'https://media.api-sports.io/football/teams/538.png', w: 0, d: 1, l: 1, pts: 1, form: ['l', 'd'] },
      { pos: 4, name: 'RayoVallecano', crest: 'https://media.api-sports.io/football/teams/535.png', w: 0, d: 1, l: 1, pts: 1, form: ['l', 'd'] },
    ],
    fixtures: [
      {
        matchday: 'Matchday 3 (Upcoming)',
        status: 'upcoming',
        fixtures: [
          { player1: { name: 'AthleticLions', crest: 'https://media.api-sports.io/football/teams/531.png' }, player2: { name: 'RayoVallecano', crest: 'https://media.api-sports.io/football/teams/535.png' }, upcoming: true },
          { player1: { name: 'GironaFanatic', crest: 'https://media.api-sports.io/football/teams/547.png' }, player2: { name: 'CeltaDeVigo', crest: 'https://media.api-sports.io/football/teams/538.png' }, upcoming: true },
        ],
      },
      {
        matchday: 'Matchday 2 (Completed)',
        status: 'completed',
        fixtures: [
          { player1: { name: 'AthleticLions', crest: 'https://media.api-sports.io/football/teams/531.png' }, player2: { name: 'CeltaDeVigo', crest: 'https://media.api-sports.io/football/teams/538.png' }, score: { s1: 5, s2: 2 }, winner: 1 },
          { player1: { name: 'GironaFanatic', crest: 'https://media.api-sports.io/football/teams/547.png' }, player2: { name: 'RayoVallecano', crest: 'https://media.api-sports.io/football/teams/535.png' }, score: { s1: 4, s2: 1 }, winner: 1 },
        ],
      },
      {
        matchday: 'Matchday 1 (Completed)',
        status: 'completed',
        fixtures: [
          { player1: { name: 'AthleticLions', crest: 'https://media.api-sports.io/football/teams/531.png' }, player2: { name: 'GironaFanatic', crest: 'https://media.api-sports.io/football/teams/547.png' }, score: { s1: 4, s2: 1 }, winner: 1 },
          { player1: { name: 'CeltaDeVigo', crest: 'https://media.api-sports.io/football/teams/538.png' }, player2: { name: 'RayoVallecano', crest: 'https://media.api-sports.io/football/teams/535.png' }, score: '3 - 3', winner: null },
        ],
      },
    ],
  },
  grpD: {
    label: 'GROUP D',
    letter: 'D',
    matchdayProgress: 'Matchday 2/3',
    players: [
      { pos: 1, name: 'LosBlancos22', crest: 'https://media.api-sports.io/football/teams/541.png', w: 2, d: 0, l: 0, pts: 6, form: ['w', 'w', 'w'] },
      { pos: 2, name: 'Osasuna1920', crest: 'https://media.api-sports.io/football/teams/727.png', w: 1, d: 0, l: 1, pts: 3, form: ['w', 'l'] },
      { pos: 3, name: 'RCDMallorca', crest: 'https://media.api-sports.io/football/teams/798.png', w: 0, d: 1, l: 1, pts: 1, form: ['l', 'd'] },
      { pos: 4, name: 'DeportivoAlaves', crest: 'https://media.api-sports.io/football/teams/542.png', w: 0, d: 1, l: 1, pts: 1, form: ['l', 'd'] },
    ],
    fixtures: [
      {
        matchday: 'Matchday 3 (Upcoming)',
        status: 'upcoming',
        fixtures: [
          { player1: { name: 'LosBlancos22', crest: 'https://media.api-sports.io/football/teams/541.png' }, player2: { name: 'DeportivoAlaves', crest: 'https://media.api-sports.io/football/teams/542.png' }, upcoming: true },
          { player1: { name: 'Osasuna1920', crest: 'https://media.api-sports.io/football/teams/727.png' }, player2: { name: 'RCDMallorca', crest: 'https://media.api-sports.io/football/teams/798.png' }, upcoming: true },
        ],
      },
      {
        matchday: 'Matchday 2 (Completed)',
        status: 'completed',
        fixtures: [
          { player1: { name: 'LosBlancos22', crest: 'https://media.api-sports.io/football/teams/541.png' }, player2: { name: 'RCDMallorca', crest: 'https://media.api-sports.io/football/teams/798.png' }, score: { s1: 4, s2: 1 }, winner: 1 },
          { player1: { name: 'Osasuna1920', crest: 'https://media.api-sports.io/football/teams/727.png' }, player2: { name: 'DeportivoAlaves', crest: 'https://media.api-sports.io/football/teams/542.png' }, score: { s1: 3, s2: 0 }, winner: 1 },
        ],
      },
      {
        matchday: 'Matchday 1 (Completed)',
        status: 'completed',
        fixtures: [
          { player1: { name: 'LosBlancos22', crest: 'https://media.api-sports.io/football/teams/541.png' }, player2: { name: 'Osasuna1920', crest: 'https://media.api-sports.io/football/teams/727.png' }, score: { s1: 5, s2: 2 }, winner: 1 },
          { player1: { name: 'RCDMallorca', crest: 'https://media.api-sports.io/football/teams/798.png' }, player2: { name: 'DeportivoAlaves', crest: 'https://media.api-sports.io/football/teams/542.png' }, score: '2 - 2', winner: null },
        ],
      },
    ],
  },
};

const knockoutData = {
  quarterfinals: [
    {
      player1: { name: 'ViscaElBarça', crest: 'https://media.api-sports.io/football/teams/541.png', score: 2 },
      player2: { name: 'Osasuna1920', crest: 'https://media.api-sports.io/football/teams/727.png', score: 0 },
      winner: 1 as const,
    },
    {
      player1: { name: 'Madridista91', crest: 'https://media.api-sports.io/football/teams/541.png', score: 1 },
      player2: { name: 'GironaFanatic', crest: 'https://media.api-sports.io/football/teams/547.png', score: 0 },
      winner: 1 as const,
    },
    {
      player1: { name: 'AthleticLions', crest: 'https://media.api-sports.io/football/teams/531.png', score: 2 },
      player2: { name: 'YellowSubmarine', crest: 'https://media.api-sports.io/football/teams/529.png', score: 1 },
      winner: 1 as const,
    },
    {
      player1: { name: 'SevillaFC_1890', crest: 'https://media.api-sports.io/football/teams/536.png', score: 3 },
      player2: { name: 'LosBlancos22', crest: 'https://media.api-sports.io/football/teams/541.png', score: 0 },
      winner: 1 as const,
    },
  ] as BracketMatch[],
  semifinals: [
    {
      player1: { name: 'ViscaElBarça', crest: 'https://media.api-sports.io/football/teams/541.png', score: 2 },
      player2: { name: 'Madridista91', crest: 'https://media.api-sports.io/football/teams/541.png', score: 1 },
      winner: 1 as const,
    },
    {
      player1: { name: 'AthleticLions', crest: 'https://media.api-sports.io/football/teams/531.png', score: 1 },
      player2: { name: 'SevillaFC_1890', crest: 'https://media.api-sports.io/football/teams/536.png', score: 2 },
      winner: 2 as const,
    },
  ] as BracketMatch[],
  final: {
    player1: { name: 'ViscaElBarça', crest: 'https://media.api-sports.io/football/teams/541.png', score: 1 },
    player2: { name: 'SevillaFC_1890', crest: 'https://media.api-sports.io/football/teams/536.png', score: 2 },
    winner: 2 as const,
  } as BracketMatch,
  champion: {
    name: 'SevillaFC_1890',
    crest: 'https://media.api-sports.io/football/teams/536.png',
  },
};

const tournamentInfo = {
  name: 'La Liga Prediction Cup Season 2',
  organizer: 'Organized by Admin • Started May 1, 2026',
  status: 'Active — Group Stage',
  stats: { players: 16, groups: 4, matchdays: 3, fixturesPerMD: 10 },
  progress: { pct: 66, label: 'Group Stage Progress', completed: '2 of 3 Matchdays Completed' },
};

const schedule = [
  { status: 'COMPLETED', color: 'var(--green)', label: 'Matchday 1 — Group Stage', date: 'May 1–4, 2026' },
  { status: 'ACTIVE', color: 'var(--accent)', label: 'Matchday 2 — Group Stage', date: 'May 8–11, 2026' },
  { status: 'UPCOMING', color: 'var(--tx3)', label: 'Matchday 3 — Group Stage', date: 'May 15–18, 2026' },
  { status: 'UPCOMING', color: 'var(--tx3)', label: 'Quarter-Finals', date: 'May 22–25, 2026' },
  { status: 'UPCOMING', color: 'var(--tx3)', label: 'Semi-Finals', date: 'May 29 – Jun 1, 2026' },
  { status: 'FINAL', color: 'var(--yellow)', label: 'Grand Final', date: 'Jun 5–8, 2026', isFinal: true },
];

const groupDraw = [
  { group: 'Group A', players: [
    { name: 'Carlos M.', crest: 'https://media.api-sports.io/football/teams/541.png' },
    { name: 'Diego R.', crest: 'https://media.api-sports.io/football/teams/529.png' },
    { name: 'Ana P.', crest: 'https://media.api-sports.io/football/teams/536.png' },
    { name: 'Marco T.', crest: 'https://media.api-sports.io/football/teams/533.png' },
  ]},
  { group: 'Group B', players: [
    { name: 'Sofia L.', crest: 'https://media.api-sports.io/football/teams/530.png' },
    { name: 'James W.', crest: 'https://media.api-sports.io/football/teams/42.png' },
    { name: 'Pablo H.', crest: 'https://media.api-sports.io/football/teams/50.png' },
    { name: 'Lucia V.', crest: 'https://media.api-sports.io/football/teams/548.png' },
  ]},
  { group: 'Group C', players: [
    { name: 'Elena S.', crest: 'https://media.api-sports.io/football/teams/40.png' },
    { name: 'Raul K.', crest: 'https://media.api-sports.io/football/teams/47.png' },
    { name: 'Maria J.', crest: 'https://media.api-sports.io/football/teams/34.png' },
    { name: 'Oscar M.', crest: 'https://media.api-sports.io/football/teams/33.png' },
  ]},
  { group: 'Group D', players: [
    { name: 'Hugo D.', crest: 'https://media.api-sports.io/football/teams/532.png' },
    { name: 'Nina G.', crest: 'https://media.api-sports.io/football/teams/543.png' },
    { name: 'Tomas F.', crest: 'https://media.api-sports.io/football/teams/531.png' },
    { name: 'Ines C.', crest: 'https://media.api-sports.io/football/teams/546.png' },
  ]},
];

// ─── Sub-Components ────────────────────────────────────────

function FixtureCard({ fixture, onDuelClick, onProfileClick }: {
  fixture: Fixture;
  onDuelClick: () => void;
  onProfileClick: () => void;
}) {
  const renderScore = () => {
    if (fixture.upcoming) {
      return <div className="grp-fix-center"><div className="grp-fix-vs">VS</div></div>;
    }
    if (typeof fixture.score === 'string') {
      return <div className="grp-fix-center"><div className="grp-fix-score">{fixture.score}</div></div>;
    }
    if (fixture.score) {
      const { s1, s2 } = fixture.score;
      return (
        <div className="grp-fix-center">
          <div className="grp-fix-score">
            <span className={fixture.winner === 1 ? 'score-w' : fixture.winner === 2 ? 'score-l' : ''}>{s1}</span>
            {' - '}
            <span className={fixture.winner === 2 ? 'score-w' : fixture.winner === 1 ? 'score-l' : ''}>{s2}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const p1Class = fixture.winner === 1 ? 'winner' : fixture.winner === 2 ? 'loser' : '';
  const p2Class = fixture.winner === 2 ? 'winner' : fixture.winner === 1 ? 'loser' : '';

  return (
    <div className="grp-fix-card" onClick={onDuelClick} style={{ cursor: 'pointer' }}>
      <div className={`grp-fix-player ${p1Class}`}>
        <img src={fixture.player1.crest} alt={fixture.player1.name} />
        <span
          className="fix-pname clickable-name"
          onClick={(e) => { e.stopPropagation(); onProfileClick(); }}
        >
          {fixture.player1.name}
        </span>
      </div>
      {renderScore()}
      <div className={`grp-fix-player right ${p2Class}`}>
        <span
          className="fix-pname clickable-name"
          onClick={(e) => { e.stopPropagation(); onProfileClick(); }}
        >
          {fixture.player2.name}
        </span>
        <img src={fixture.player2.crest} alt={fixture.player2.name} />
      </div>
      <div className="grp-fix-click-hint"><PlayIcon /> View Duel</div>
    </div>
  );
}

function GroupStagePanel({ group, onProfileClick, onDuelClick }: {
  group: GroupData;
  onProfileClick: () => void;
  onDuelClick: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div>
      {/* Group Table Card */}
      <div className="group-card-full">
        <div className="gc-header" data-group={group.letter}>
          <h4><GroupIcon /> {group.label}</h4>
          <span className="gc-md">{group.matchdayProgress}</span>
        </div>
        <table className="gc-table">
          <thead>
            <tr>
              <th>POS</th>
              <th>PLAYER</th>
              <th>W-D-L</th>
              <th>PTS</th>
              <th>FORM</th>
            </tr>
          </thead>
          <tbody>
            {group.players.map((player) => (
              <tr key={player.name}>
                <td>
                  <span className={`gc-pos p${player.pos}`}>{player.pos}</span>
                </td>
                <td>
                  <div className="gc-player-cell">
                    <img className="gc-crest" src={player.crest} alt={player.name} />
                    <span className="gc-pname clickable-name" onClick={onProfileClick}>
                      {player.name}
                    </span>
                  </div>
                </td>
                <td className="gc-wdl">
                  <span className="wdl-w">{player.w}</span>
                  <span className="wdl-sep">-</span>
                  <span className="wdl-d">{player.d}</span>
                  <span className="wdl-sep">-</span>
                  <span className="wdl-l">{player.l}</span>
                </td>
                <td className="gc-pts">{player.pts}</td>
                <td>
                  <div className="gc-form">
                    {player.form.map((f, i) => (
                      <span key={i} className={`gc-form-dot ${f}`} />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="gc-qualify-zone">
          <CheckIcon /> Top 2 qualify<span className="zone-line" />
        </div>
      </div>

      {/* Fixtures */}
      {group.fixtures.map((md, mdIdx) => (
        <div className="grp-fixtures-section" key={mdIdx}>
          <div className="grp-fix-header">
            <span className={`fix-status-dot ${md.status}`} />
            <span className="fix-label">{md.matchday}</span>
            {md.status === 'upcoming' ? (
              <span className="fix-badge upcoming">{t.predict_now_upper || 'PREDICT NOW'}</span>
            ) : (
              <span className="fix-badge completed">FINISHED</span>
            )}
          </div>
          {md.fixtures.map((fixture, fIdx) => (
            <FixtureCard
              key={fIdx}
              fixture={fixture}
              onDuelClick={onDuelClick}
              onProfileClick={onProfileClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function KnockoutBracket({ onProfileClick, onDuelClick }: {
  onProfileClick: () => void;
  onDuelClick: () => void;
}) {
  const renderBracketPlayer = (
    player: { name: string; crest: string; score: number | null },
    isWinner: boolean
  ) => (
    <div className={`bv2-player ${isWinner ? 'winner' : 'loser'}`}>
      <img className="bv2-crest" src={player.crest} alt={player.name} />
      <span className="bv2-name clickable-name" onClick={(e) => { e.stopPropagation(); onProfileClick(); }}>
        {player.name}
      </span>
      <span className="bv2-score">{player.score}</span>
    </div>
  );

  return (
    <div className="bracket-v2">
      {/* Quarterfinals */}
      <div className="bv2-round">
        <div className="bv2-round-label">Quarterfinals</div>
        {knockoutData.quarterfinals.map((match, i) => (
          <div key={i} className="bv2-match" onClick={onDuelClick} style={{ cursor: 'pointer' }}>
            {renderBracketPlayer(match.player1, match.winner === 1)}
            {renderBracketPlayer(match.player2, match.winner === 2)}
          </div>
        ))}
      </div>

      {/* Connector QF → SF */}
      <div className="bv2-connector"><div className="bv2-connector-dot" /></div>

      {/* Semifinals */}
      <div className="bv2-round" style={{ justifyContent: 'center', gap: '60px', paddingTop: '30px' }}>
        <div className="bv2-round-label">Semifinals</div>
        {knockoutData.semifinals.map((match, i) => (
          <div
            key={i}
            className="bv2-match"
            onClick={onDuelClick}
            style={{ cursor: 'pointer', animationDelay: '0.2s' }}
          >
            {renderBracketPlayer(match.player1, match.winner === 1)}
            {renderBracketPlayer(match.player2, match.winner === 2)}
          </div>
        ))}
      </div>

      {/* Connector SF → Final */}
      <div className="bv2-connector"><div className="bv2-connector-dot" /></div>

      {/* Final */}
      <div className="bv2-round" style={{ justifyContent: 'center', paddingTop: '80px' }}>
        <div className="bv2-round-label">Final</div>
        <div
          className="bv2-match bv2-final-match"
          onClick={onDuelClick}
          style={{ cursor: 'pointer', animationDelay: '0.4s' }}
        >
          {renderBracketPlayer(knockoutData.final.player1, knockoutData.final.winner === 1)}
          {renderBracketPlayer(knockoutData.final.player2, knockoutData.final.winner === 2)}
        </div>
      </div>

      {/* Connector Final → Champion */}
      <div className="bv2-connector"><div className="bv2-connector-dot" /></div>

      {/* Champion */}
      <div className="bv2-round" style={{ justifyContent: 'center', paddingTop: '60px' }}>
        <div className="bv2-round-label">Champion</div>
        <div className="bv2-champion">
          <div className="champ-trophy">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <img className="champ-crest" src={knockoutData.champion.crest} alt={knockoutData.champion.name} />
          <div className="champ-name clickable-name" onClick={onProfileClick}>
            {knockoutData.champion.name}
          </div>
          <div className="champ-label">Champion</div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div className="bracket-footer">Top 2 from each group advance to the Knockout Stage</div>
      </div>
    </div>
  );
}

// ─── Tab config ────────────────────────────────────────────
const tabs: { id: TabId; label: string; letter?: string }[] = [
  { id: 'grpA', label: 'Group A', letter: 'A' },
  { id: 'grpB', label: 'Group B', letter: 'B' },
  { id: 'grpC', label: 'Group C', letter: 'C' },
  { id: 'grpD', label: 'Group D', letter: 'D' },
  { id: 'knockout', label: 'Knockout' },
];

// ─── Main Page Component ───────────────────────────────────
export default function TournamentsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('grpA');

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleDuelClick = () => {
    router.push('/matchday');
  };

  return (
    <div className="page" id="page-standings">
      {/* ── Hero Banner ── */}
      <div className="standings-hero">
        <div className="standings-hero-left">
          <div className="standings-hero-trophy"><TrophyIcon /></div>
          <div className="standings-hero-text">
            <h1>{tournamentInfo.name}</h1>
            <div className="sh-stage">Group Stage <span>• Matchday 2 of 3</span></div>
          </div>
        </div>
        <div className="standings-hero-right">
          <div className="sh-progress-label">{t.group_stage_progress || 'Group Stage Progress'}</div>
          <div className="sh-progress-pct">{tournamentInfo.progress.pct}%</div>
          <div className="sh-progress-bar">
            <div className="sh-progress-bar-fill" style={{ width: `${tournamentInfo.progress.pct}%` }} />
          </div>
          <div className="sh-progress-sub">{tournamentInfo.progress.completed}</div>
        </div>
      </div>

      {/* ── Tournament Selector Tabs ── */}
      <div className="tabs mb-16">
        <button className="tab on">La Liga Cup #3</button>
        <button className="tab">Premier League S2</button>
      </div>

      {/* ── Stage Tabs ── */}
      <div className="tourn-stage-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tourn-stage-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.letter ? (
              <><span className="tst-letter">{tab.letter}</span> {tab.label}</>
            ) : (
              <><TrophyIcon /> {tab.label}</>
            )}
          </button>
        ))}
      </div>

      {/* ── Stage Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="tourn-stage-content active"
        >
          {activeTab !== 'knockout' ? (
            <GroupStagePanel
              group={groupsData[activeTab]}
              onProfileClick={handleProfileClick}
              onDuelClick={handleDuelClick}
            />
          ) : (
            <KnockoutBracket
              onProfileClick={handleProfileClick}
              onDuelClick={handleDuelClick}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Tournament Info Card ── */}
      <div className="section-head" style={{ marginTop: '24px' }}>
        <div className="section-title">
          <TrophyIcon /> {t.tournament_info || 'Tournament Info'}
        </div>
      </div>

      <div className="crd mb-16" style={{ borderLeft: '3px solid var(--accent)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>
              {t.tourney_info_name || tournamentInfo.name}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--tx2)' }}>
              {t.tourney_info_org || tournamentInfo.organizer}
            </div>
          </div>
          <div style={{ padding: '4px 12px', background: 'var(--green-dim)', color: 'var(--green)', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
            {tournamentInfo.status}
          </div>
        </div>
        <div className="grid-4 mt-16" style={{ maxWidth: '600px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>{tournamentInfo.stats.players}</div>
            <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>{t.players_label || 'Players'}</div>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>{tournamentInfo.stats.groups}</div>
            <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>{t.groups_count_label || 'Groups'}</div>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>{tournamentInfo.stats.matchdays}</div>
            <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>{t.matchdays_label || 'Matchdays'}</div>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>{tournamentInfo.stats.fixturesPerMD}</div>
            <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>{t.fixtures_per_md || 'Fixtures/MD'}</div>
          </div>
        </div>
      </div>

      {/* ── Group Draw ── */}
      <div className="section-title mb-12" style={{ fontSize: '15px' }}>
        {t.group_draw || 'Group Draw'}
      </div>
      <div className="grid-2 mb-16">
        {groupDraw.map((g) => (
          <div className="crd" key={g.group}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent)', marginBottom: '8px' }}>{g.group}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {g.players.map((p) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <div className="badge-c badge-sm">
                    <img src={p.crest} alt={p.name} />
                  </div>
                  <span style={{ fontWeight: 600 }} className="clickable-name" onClick={handleProfileClick}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Schedule ── */}
      <div className="section-title mb-12" style={{ fontSize: '15px' }}>
        <CalendarIcon /> {t.schedule_title || 'Schedule'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {schedule.map((item, i) => (
          <div
            key={i}
            className="crd"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: `3px solid ${item.color}` }}
          >
            <div style={{ fontSize: '10px', color: item.color, fontWeight: 700, minWidth: '60px' }}>
              {item.status}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px' }}>
                {item.isFinal && <TrophyIcon />} {item.label}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>{item.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
