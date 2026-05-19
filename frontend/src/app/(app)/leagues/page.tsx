'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

// ── SVG Icons ──────────────────────────────────────────────

const StandingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3V3zm0 16h18v2H3v-2zm0-8h18v2H3v-2zm0 4h12v2H3v-2zm0-8h12v2H3V7z"/></svg>
);
const FixturesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
);
const PredictionsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/></svg>
);
const HistoryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
);
const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
);
const DrawIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v-2h-2v2zm0-10v6h2V6h-2z"/></svg>
);
const CalendarTodayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
);
const HistoryClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
);
const TrophyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/></svg>
);
const CrownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD700"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1h14v1z"/></svg>
);

// ── Flag SVGs ──────────────────────────────────────────────

const flagStyle = { width: '18px', height: '14px', borderRadius: '2px', verticalAlign: 'middle' as const, flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' };

const FlagSpain = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}><rect width="640" height="480" fill="#c60b1e"/><rect width="640" height="160" y="160" fill="#ffc400"/></svg>
);
const FlagArgentina = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}><rect width="640" height="480" fill="#74ACDF"/><rect width="640" height="160" y="160" fill="#FFF"/><circle cx="320" cy="240" r="40" fill="#F6B40E"/></svg>
);
const FlagMexico = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}><rect width="213" height="480" fill="#006847"/><rect width="214" height="480" x="213" fill="#FFF"/><rect width="213" height="480" x="427" fill="#CE1126"/><circle cx="320" cy="240" r="50" fill="#8C6B30"/></svg>
);
const FlagColombia = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}><rect width="640" height="240" fill="#FCD116"/><rect width="640" height="120" y="240" fill="#003893"/><rect width="640" height="120" y="360" fill="#CE1126"/></svg>
);
const FlagBrazil = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}><rect width="640" height="480" fill="#009B3A"/><path d="M320 80L560 240 320 400 80 240Z" fill="#FEDF00"/><circle cx="320" cy="240" r="80" fill="#002776"/></svg>
);
const FlagPortugal = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}><rect width="256" height="480" fill="#006600"/><rect width="384" height="480" x="256" fill="#FF0000"/><circle cx="256" cy="240" r="64" fill="#FFCC00" stroke="#006600" strokeWidth="4"/></svg>
);
const FlagRussia = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}><rect width="640" height="240" fill="#FFF"/><rect width="640" height="240" y="240" fill="#D52B1E"/><rect width="213" height="240" fill="#0039A6"/><text x="107" y="160" textAnchor="middle" fill="#FFF" fontSize="140" fontFamily="serif">&#9733;</text></svg>
);
const FlagUruguay = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}><rect width="640" height="480" fill="#FFF"/><rect width="640" height="53" y="53" fill="#0038A8"/><rect width="640" height="53" y="160" fill="#0038A8"/><rect width="640" height="53" y="267" fill="#0038A8"/><rect width="640" height="53" y="374" fill="#0038A8"/><circle cx="120" cy="120" r="50" fill="#FCD116"/></svg>
);
const FlagPeru = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}><rect width="213" height="480" fill="#D91023"/><rect width="214" height="480" x="213" fill="#FFF"/><rect width="213" height="480" x="427" fill="#D91023"/></svg>
);
const FlagVenezuela = () => (
  <svg className="flag-svg" viewBox="0 0 640 480" style={flagStyle}><rect width="640" height="240" fill="#FFD100"/><rect width="640" height="120" y="240" fill="#0033A0"/><rect width="640" height="120" y="360" fill="#ED1C24"/></svg>
);

// ── Mock Data ──────────────────────────────────────────────

const standingsDiv1 = [
  { pos: 1, badge: 'gold' as const, name: 'Carlos_M', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', Flag: FlagSpain, club: 'https://media.api-sports.io/football/teams/541.png', isYou: false, zone: 'promo' as const, p: 7, w: 6, d: 0, l: 1, gf: 24, ga: 12, gd: '+12', gdClass: 'positive', pts: 18, form: ['w','w','w','d','w'] as const },
  { pos: 2, badge: 'silver' as const, name: 'Diego_R', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', Flag: FlagArgentina, club: 'https://media.api-sports.io/football/teams/530.png', isYou: false, zone: 'promo' as const, p: 7, w: 5, d: 1, l: 1, gf: 22, ga: 11, gd: '+11', gdClass: 'positive', pts: 16, form: ['w','l','w','w','w'] as const },
  { pos: 3, badge: 'bronze' as const, name: 'AlexGamer7', avatar: 'https://randomuser.me/api/portraits/men/22.jpg', Flag: FlagMexico, club: 'https://media.api-sports.io/football/teams/529.png', isYou: true, zone: null, p: 7, w: 4, d: 2, l: 1, gf: 19, ga: 10, gd: '+9', gdClass: 'positive', pts: 14, form: ['w','d','w','w','d'] as const },
  { pos: 4, badge: null, name: 'FUT_King', avatar: 'https://randomuser.me/api/portraits/men/55.jpg', Flag: FlagColombia, club: 'https://media.api-sports.io/football/teams/548.png', isYou: false, zone: null, p: 7, w: 4, d: 1, l: 2, gf: 18, ga: 13, gd: '+5', gdClass: 'positive', pts: 13, form: ['l','w','w','d','w'] as const },
  { pos: 5, badge: null, name: 'TheStriker10', avatar: 'https://randomuser.me/api/portraits/men/67.jpg', Flag: FlagBrazil, club: 'https://media.api-sports.io/football/teams/536.png', isYou: false, zone: null, p: 7, w: 3, d: 2, l: 2, gf: 15, ga: 12, gd: '+3', gdClass: 'positive', pts: 11, form: ['d','w','l','w','d'] as const },
  { pos: 6, badge: null, name: 'ViniPlayz', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', Flag: FlagPortugal, club: 'https://media.api-sports.io/football/teams/543.png', isYou: false, zone: null, p: 7, w: 3, d: 1, l: 3, gf: 14, ga: 14, gd: '0', gdClass: 'neutral', pts: 10, form: ['w','l','w','l','w'] as const },
  { pos: 7, badge: null, name: 'GoalMachine', avatar: 'https://randomuser.me/api/portraits/men/71.jpg', Flag: FlagRussia, club: 'https://media.api-sports.io/football/teams/532.png', isYou: false, zone: null, p: 7, w: 2, d: 2, l: 3, gf: 12, ga: 15, gd: '-3', gdClass: 'negative', pts: 8, form: ['l','d','w','l','d'] as const },
  { pos: 8, badge: null, name: 'El_Crack', avatar: 'https://randomuser.me/api/portraits/men/36.jpg', Flag: FlagUruguay, club: 'https://media.api-sports.io/football/teams/533.png', isYou: false, zone: null, p: 7, w: 2, d: 1, l: 4, gf: 11, ga: 17, gd: '-6', gdClass: 'negative', pts: 7, form: ['l','l','w','d','l'] as const },
  { pos: 9, badge: 'releg' as const, name: 'FootyPro99', avatar: 'https://randomuser.me/api/portraits/men/48.jpg', Flag: FlagPeru, club: 'https://media.api-sports.io/football/teams/728.png', isYou: false, zone: 'releg' as const, p: 7, w: 1, d: 2, l: 4, gf: 9, ga: 19, gd: '-10', gdClass: 'negative', pts: 5, form: ['l','l','d','l','l'] as const },
  { pos: 10, badge: 'releg' as const, name: 'NovaPredicts', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', Flag: FlagVenezuela, club: 'https://media.api-sports.io/football/teams/798.png', isYou: false, zone: 'releg' as const, p: 7, w: 1, d: 0, l: 6, gf: 7, ga: 23, gd: '-16', gdClass: 'negative', pts: 3, form: ['l','l','l','d','l'] as const },
];

interface FixturePlayerData {
  name: string;
  avatar: string;
  pos: number;
  posTier: 'top' | 'mid' | 'bottom';
  elo: string;
  record: { w: number; d: number; l: number };
}

const currentWeekFixtures: { home: FixturePlayerData; away: FixturePlayerData }[] = [
  {
    home: { name: 'Carlos_M', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', pos: 1, posTier: 'top', elo: '1,247', record: { w: 6, d: 0, l: 1 } },
    away: { name: 'TheStriker10', avatar: 'https://randomuser.me/api/portraits/men/67.jpg', pos: 5, posTier: 'mid', elo: '1,189', record: { w: 3, d: 2, l: 2 } },
  },
  {
    home: { name: 'Diego_R', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', pos: 2, posTier: 'top', elo: '1,218', record: { w: 5, d: 1, l: 1 } },
    away: { name: 'El_Crack', avatar: 'https://randomuser.me/api/portraits/men/36.jpg', pos: 8, posTier: 'bottom', elo: '1,102', record: { w: 2, d: 1, l: 4 } },
  },
  {
    home: { name: 'AlexGamer7', avatar: 'https://randomuser.me/api/portraits/men/22.jpg', pos: 3, posTier: 'mid', elo: '1,195', record: { w: 4, d: 2, l: 1 } },
    away: { name: 'ViniPlayz', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', pos: 6, posTier: 'mid', elo: '1,156', record: { w: 3, d: 1, l: 3 } },
  },
  {
    home: { name: 'FUT_King', avatar: 'https://randomuser.me/api/portraits/men/55.jpg', pos: 4, posTier: 'mid', elo: '1,178', record: { w: 4, d: 1, l: 2 } },
    away: { name: 'GoalMachine', avatar: 'https://randomuser.me/api/portraits/men/71.jpg', pos: 7, posTier: 'bottom', elo: '1,134', record: { w: 2, d: 2, l: 3 } },
  },
  {
    home: { name: 'FootyPro99', avatar: 'https://randomuser.me/api/portraits/men/48.jpg', pos: 9, posTier: 'bottom', elo: '1,067', record: { w: 1, d: 2, l: 4 } },
    away: { name: 'NovaPredicts', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', pos: 10, posTier: 'bottom', elo: '1,023', record: { w: 1, d: 0, l: 6 } },
  },
];

interface CompletedFixtureDetailed {
  home: FixturePlayerData;
  away: FixturePlayerData;
  homeGoals: number;
  awayGoals: number;
  resultText: string;
  eloChange: string;
  eloClass: 'positive' | 'neutral';
  isDraw: boolean;
}

interface CompletedFixtureSimple {
  homeName: string;
  homeAvatar: string;
  awayName: string;
  awayAvatar: string;
  homeGoals: number;
  awayGoals: number;
  resultText: string;
  isDraw: boolean;
}

const pastMatchday6Detailed: CompletedFixtureDetailed[] = [
  {
    home: { name: 'Carlos_M', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', pos: 1, posTier: 'top', elo: '1,247', record: { w: 6, d: 0, l: 1 } },
    away: { name: 'El_Crack', avatar: 'https://randomuser.me/api/portraits/men/36.jpg', pos: 8, posTier: 'bottom', elo: '1,102', record: { w: 2, d: 1, l: 4 } },
    homeGoals: 5, awayGoals: 2, resultText: 'Carlos_M wins', eloChange: '+15 ELO', eloClass: 'positive', isDraw: false,
  },
  {
    home: { name: 'Diego_R', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', pos: 2, posTier: 'top', elo: '1,218', record: { w: 5, d: 1, l: 1 } },
    away: { name: 'GoalMachine', avatar: 'https://randomuser.me/api/portraits/men/71.jpg', pos: 7, posTier: 'bottom', elo: '1,134', record: { w: 2, d: 2, l: 3 } },
    homeGoals: 4, awayGoals: 3, resultText: 'Diego_R wins', eloChange: '+12 ELO', eloClass: 'positive', isDraw: false,
  },
  {
    home: { name: 'AlexGamer7', avatar: 'https://randomuser.me/api/portraits/men/22.jpg', pos: 3, posTier: 'mid', elo: '1,195', record: { w: 4, d: 2, l: 1 } },
    away: { name: 'FUT_King', avatar: 'https://randomuser.me/api/portraits/men/55.jpg', pos: 4, posTier: 'mid', elo: '1,178', record: { w: 4, d: 1, l: 2 } },
    homeGoals: 3, awayGoals: 3, resultText: 'Draw', eloChange: '+0 ELO', eloClass: 'neutral', isDraw: true,
  },
  {
    home: { name: 'TheStriker10', avatar: 'https://randomuser.me/api/portraits/men/67.jpg', pos: 5, posTier: 'mid', elo: '1,189', record: { w: 3, d: 2, l: 2 } },
    away: { name: 'NovaPredicts', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', pos: 10, posTier: 'bottom', elo: '1,023', record: { w: 1, d: 0, l: 6 } },
    homeGoals: 6, awayGoals: 4, resultText: 'TheStriker10 wins', eloChange: '+18 ELO', eloClass: 'positive', isDraw: false,
  },
  {
    home: { name: 'FootyPro99', avatar: 'https://randomuser.me/api/portraits/men/48.jpg', pos: 9, posTier: 'bottom', elo: '1,067', record: { w: 1, d: 2, l: 4 } },
    away: { name: 'ViniPlayz', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', pos: 6, posTier: 'mid', elo: '1,156', record: { w: 3, d: 1, l: 3 } },
    homeGoals: 2, awayGoals: 5, resultText: 'ViniPlayz wins', eloChange: '+14 ELO', eloClass: 'positive', isDraw: false,
  },
];

const pastMatchdaysSimple: { id: number; label: string; dropdownLabel: string; fixtures: CompletedFixtureSimple[] }[] = [
  {
    id: 5, label: 'Matchday 5 \u00b7 Completed', dropdownLabel: 'Matchday 5 \u2014 La Liga Round 26',
    fixtures: [
      { homeName: 'Carlos_M', homeAvatar: 'https://randomuser.me/api/portraits/men/32.jpg', awayName: 'NovaPredicts', awayAvatar: 'https://randomuser.me/api/portraits/women/65.jpg', homeGoals: 7, awayGoals: 3, resultText: 'Carlos_M wins \u00b7 +20 ELO', isDraw: false },
      { homeName: 'Diego_R', homeAvatar: 'https://randomuser.me/api/portraits/men/45.jpg', awayName: 'FUT_King', awayAvatar: 'https://randomuser.me/api/portraits/men/55.jpg', homeGoals: 3, awayGoals: 4, resultText: 'FUT_King wins \u00b7 +11 ELO', isDraw: false },
      { homeName: 'AlexGamer7', homeAvatar: 'https://randomuser.me/api/portraits/men/22.jpg', awayName: 'GoalMachine', awayAvatar: 'https://randomuser.me/api/portraits/men/71.jpg', homeGoals: 5, awayGoals: 1, resultText: 'AlexGamer7 wins \u00b7 +14 ELO', isDraw: false },
      { homeName: 'TheStriker10', homeAvatar: 'https://randomuser.me/api/portraits/men/67.jpg', awayName: 'ViniPlayz', awayAvatar: 'https://randomuser.me/api/portraits/women/44.jpg', homeGoals: 4, awayGoals: 4, resultText: 'Draw \u00b7 +0 ELO', isDraw: true },
      { homeName: 'El_Crack', homeAvatar: 'https://randomuser.me/api/portraits/men/36.jpg', awayName: 'FootyPro99', awayAvatar: 'https://randomuser.me/api/portraits/men/48.jpg', homeGoals: 2, awayGoals: 3, resultText: 'FootyPro99 wins \u00b7 +8 ELO', isDraw: false },
    ],
  },
  {
    id: 4, label: 'Matchday 4 \u00b7 Completed', dropdownLabel: 'Matchday 4 \u2014 La Liga Round 25',
    fixtures: [
      { homeName: 'Carlos_M', homeAvatar: 'https://randomuser.me/api/portraits/men/32.jpg', awayName: 'ViniPlayz', awayAvatar: 'https://randomuser.me/api/portraits/women/44.jpg', homeGoals: 6, awayGoals: 2, resultText: 'Carlos_M wins \u00b7 +16 ELO', isDraw: false },
      { homeName: 'Diego_R', homeAvatar: 'https://randomuser.me/api/portraits/men/45.jpg', awayName: 'TheStriker10', awayAvatar: 'https://randomuser.me/api/portraits/men/67.jpg', homeGoals: 5, awayGoals: 4, resultText: 'Diego_R wins \u00b7 +9 ELO', isDraw: false },
      { homeName: 'AlexGamer7', homeAvatar: 'https://randomuser.me/api/portraits/men/22.jpg', awayName: 'FootyPro99', awayAvatar: 'https://randomuser.me/api/portraits/men/48.jpg', homeGoals: 3, awayGoals: 4, resultText: 'FootyPro99 wins \u00b7 +13 ELO', isDraw: false },
      { homeName: 'FUT_King', homeAvatar: 'https://randomuser.me/api/portraits/men/55.jpg', awayName: 'El_Crack', awayAvatar: 'https://randomuser.me/api/portraits/men/36.jpg', homeGoals: 4, awayGoals: 1, resultText: 'FUT_King wins \u00b7 +14 ELO', isDraw: false },
      { homeName: 'GoalMachine', homeAvatar: 'https://randomuser.me/api/portraits/men/71.jpg', awayName: 'NovaPredicts', awayAvatar: 'https://randomuser.me/api/portraits/women/65.jpg', homeGoals: 3, awayGoals: 2, resultText: 'GoalMachine wins \u00b7 +7 ELO', isDraw: false },
    ],
  },
  {
    id: 3, label: 'Matchday 3 \u00b7 Completed', dropdownLabel: 'Matchday 3 \u2014 La Liga Round 24',
    fixtures: [
      { homeName: 'Carlos_M', homeAvatar: 'https://randomuser.me/api/portraits/men/32.jpg', awayName: 'FUT_King', awayAvatar: 'https://randomuser.me/api/portraits/men/55.jpg', homeGoals: 5, awayGoals: 3, resultText: 'Carlos_M wins \u00b7 +12 ELO', isDraw: false },
      { homeName: 'Diego_R', homeAvatar: 'https://randomuser.me/api/portraits/men/45.jpg', awayName: 'AlexGamer7', awayAvatar: 'https://randomuser.me/api/portraits/men/22.jpg', homeGoals: 4, awayGoals: 4, resultText: 'Draw \u00b7 +0 ELO', isDraw: true },
      { homeName: 'TheStriker10', homeAvatar: 'https://randomuser.me/api/portraits/men/67.jpg', awayName: 'El_Crack', awayAvatar: 'https://randomuser.me/api/portraits/men/36.jpg', homeGoals: 6, awayGoals: 2, resultText: 'TheStriker10 wins \u00b7 +16 ELO', isDraw: false },
      { homeName: 'ViniPlayz', homeAvatar: 'https://randomuser.me/api/portraits/women/44.jpg', awayName: 'NovaPredicts', awayAvatar: 'https://randomuser.me/api/portraits/women/65.jpg', homeGoals: 2, awayGoals: 3, resultText: 'NovaPredicts wins \u00b7 +5 ELO', isDraw: false },
      { homeName: 'GoalMachine', homeAvatar: 'https://randomuser.me/api/portraits/men/71.jpg', awayName: 'FootyPro99', awayAvatar: 'https://randomuser.me/api/portraits/men/48.jpg', homeGoals: 4, awayGoals: 1, resultText: 'GoalMachine wins \u00b7 +10 ELO', isDraw: false },
    ],
  },
  {
    id: 2, label: 'Matchday 2 \u00b7 Completed', dropdownLabel: 'Matchday 2 \u2014 La Liga Round 23',
    fixtures: [
      { homeName: 'Carlos_M', homeAvatar: 'https://randomuser.me/api/portraits/men/32.jpg', awayName: 'GoalMachine', awayAvatar: 'https://randomuser.me/api/portraits/men/71.jpg', homeGoals: 4, awayGoals: 2, resultText: 'Carlos_M wins \u00b7 +11 ELO', isDraw: false },
      { homeName: 'Diego_R', homeAvatar: 'https://randomuser.me/api/portraits/men/45.jpg', awayName: 'FootyPro99', awayAvatar: 'https://randomuser.me/api/portraits/men/48.jpg', homeGoals: 6, awayGoals: 1, resultText: 'Diego_R wins \u00b7 +18 ELO', isDraw: false },
      { homeName: 'AlexGamer7', homeAvatar: 'https://randomuser.me/api/portraits/men/22.jpg', awayName: 'NovaPredicts', awayAvatar: 'https://randomuser.me/api/portraits/women/65.jpg', homeGoals: 5, awayGoals: 3, resultText: 'AlexGamer7 wins \u00b7 +9 ELO', isDraw: false },
      { homeName: 'TheStriker10', homeAvatar: 'https://randomuser.me/api/portraits/men/67.jpg', awayName: 'ViniPlayz', awayAvatar: 'https://randomuser.me/api/portraits/women/44.jpg', homeGoals: 3, awayGoals: 3, resultText: 'Draw \u00b7 +0 ELO', isDraw: true },
      { homeName: 'FUT_King', homeAvatar: 'https://randomuser.me/api/portraits/men/55.jpg', awayName: 'El_Crack', awayAvatar: 'https://randomuser.me/api/portraits/men/36.jpg', homeGoals: 5, awayGoals: 2, resultText: 'FUT_King wins \u00b7 +13 ELO', isDraw: false },
    ],
  },
  {
    id: 1, label: 'Matchday 1 \u00b7 Completed', dropdownLabel: 'Matchday 1 \u2014 La Liga Round 22',
    fixtures: [
      { homeName: 'Carlos_M', homeAvatar: 'https://randomuser.me/api/portraits/men/32.jpg', awayName: 'Diego_R', awayAvatar: 'https://randomuser.me/api/portraits/men/45.jpg', homeGoals: 3, awayGoals: 2, resultText: 'Carlos_M wins \u00b7 +10 ELO', isDraw: false },
      { homeName: 'AlexGamer7', homeAvatar: 'https://randomuser.me/api/portraits/men/22.jpg', awayName: 'TheStriker10', awayAvatar: 'https://randomuser.me/api/portraits/men/67.jpg', homeGoals: 2, awayGoals: 4, resultText: 'TheStriker10 wins \u00b7 +15 ELO', isDraw: false },
      { homeName: 'FUT_King', homeAvatar: 'https://randomuser.me/api/portraits/men/55.jpg', awayName: 'ViniPlayz', awayAvatar: 'https://randomuser.me/api/portraits/women/44.jpg', homeGoals: 3, awayGoals: 3, resultText: 'Draw \u00b7 +0 ELO', isDraw: true },
      { homeName: 'GoalMachine', homeAvatar: 'https://randomuser.me/api/portraits/men/71.jpg', awayName: 'El_Crack', awayAvatar: 'https://randomuser.me/api/portraits/men/36.jpg', homeGoals: 4, awayGoals: 1, resultText: 'GoalMachine wins \u00b7 +12 ELO', isDraw: false },
      { homeName: 'FootyPro99', homeAvatar: 'https://randomuser.me/api/portraits/men/48.jpg', awayName: 'NovaPredicts', awayAvatar: 'https://randomuser.me/api/portraits/women/65.jpg', homeGoals: 1, awayGoals: 5, resultText: 'NovaPredicts wins \u00b7 +6 ELO', isDraw: false },
    ],
  },
];

const predictionMatches = [
  { id: 1, homeCrest: 'https://media.api-sports.io/football/teams/541.png', homeName: 'Barcelona', awayCrest: 'https://media.api-sports.io/football/teams/541.png', awayName: 'Real Madrid', status: 'live' as const, statusText: 'LIVE 52\'', score: '2 - 1', locked: true, defaultSelection: '1' },
  { id: 2, homeCrest: 'https://media.api-sports.io/football/teams/530.png', homeName: 'Atl. Madrid', awayCrest: 'https://media.api-sports.io/football/teams/536.png', awayName: 'Sevilla', status: 'ft' as const, statusText: 'FT', score: '1 - 0', locked: true, defaultSelection: '2' },
  { id: 3, homeCrest: 'https://media.api-sports.io/football/teams/529.png', homeName: 'Villarreal', awayCrest: 'https://media.api-sports.io/football/teams/543.png', awayName: 'Real Betis', status: 'upcoming' as const, kickoff: 'Sun 16:00', locked: false, defaultSelection: 'X' },
  { id: 4, homeCrest: 'https://media.api-sports.io/football/teams/548.png', homeName: 'Real Sociedad', awayCrest: 'https://media.api-sports.io/football/teams/532.png', awayName: 'Valencia', status: 'upcoming' as const, kickoff: 'Sun 21:00', locked: false, defaultSelection: '1' },
  { id: 5, homeCrest: 'https://media.api-sports.io/football/teams/533.png', homeName: 'Celta Vigo', awayCrest: 'https://media.api-sports.io/football/teams/728.png', awayName: 'Rayo Vallecano', status: 'upcoming' as const, kickoff: 'Mon 21:00', locked: false, defaultSelection: null },
];

const historySeasons = [
  {
    name: 'Season 2', dateRange: 'Jan 2025 \u2014 Apr 2025',
    champion: { name: 'Carlos_M', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', pts: 25 },
    table: [
      { pos: '1', name: 'Carlos_M', pts: '25', tag: '\u2191 Promoted', tagClass: 'up', rowClass: 'promo' },
      { pos: '2', name: 'Sofia_L', pts: '22', tag: '\u2191 Promoted', tagClass: 'up', rowClass: 'promo' },
      { pos: '3', name: 'AlexGamer7', pts: '20', tag: '\u2014', tagClass: '', rowClass: '' },
      { pos: '...', name: '', pts: '', tag: '', tagClass: '', rowClass: '' },
      { pos: '9', name: 'OscarM', pts: '6', tag: '\u2193 Relegated', tagClass: 'down', rowClass: 'releg' },
      { pos: '10', name: 'NovaPredicts', pts: '4', tag: '\u2193 Relegated', tagClass: 'down', rowClass: 'releg' },
    ],
  },
  {
    name: 'Season 1', dateRange: 'Sep 2024 \u2014 Dec 2024',
    champion: { name: 'Diego_R', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', pts: 23 },
    table: [
      { pos: '1', name: 'Diego_R', pts: '23', tag: '\u2191 Promoted', tagClass: 'up', rowClass: 'promo' },
      { pos: '2', name: 'FUT_King', pts: '21', tag: '\u2191 Promoted', tagClass: 'up', rowClass: 'promo' },
      { pos: '3', name: 'Carlos_M', pts: '19', tag: '\u2014', tagClass: '', rowClass: '' },
      { pos: '...', name: '', pts: '', tag: '', tagClass: '', rowClass: '' },
      { pos: '9', name: 'El_Crack', pts: '5', tag: '\u2193 Relegated', tagClass: 'down', rowClass: 'releg' },
      { pos: '10', name: 'GoalMachine', pts: '3', tag: '\u2193 Relegated', tagClass: 'down', rowClass: 'releg' },
    ],
  },
];

// ── Tab animation config ───────────────────────────────────

const tabVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

// ── Main Component ─────────────────────────────────────────

export default function LeaguesPage() {
  const { t } = useLanguage();
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState<'standings' | 'fixtures' | 'predictions' | 'history'>('standings');
  const [activeDivision, setActiveDivision] = useState(1);
  const [fixtureSubTab, setFixtureSubTab] = useState<'current' | 'past'>('current');
  const [selectedPastMatchday, setSelectedPastMatchday] = useState(6);
  const [selectedSeason, setSelectedSeason] = useState('Season 3 (Current)');
  const [predictions, setPredictions] = useState<Record<number, string | null>>({
    1: '1', 2: '2', 3: 'X', 4: '1', 5: null,
  });

  // Handlers
  const handlePlayerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push('/profile');
  };

  const handleDuelClick = () => {
    // TODO: Open matchday duel modal
  };

  const handlePredictionSelect = (matchId: number, selection: string) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: prev[matchId] === selection ? null : selection,
    }));
  };

  const handleSubmitPredictions = () => {
    // TODO: Submit predictions to API
  };

  const predictedCount = Object.values(predictions).filter(v => v !== null).length;

  // ── Render Helpers ─────────────────────────────────────

  const renderStandings = () => (
    <div className="league-table-wrap">
      <table className="league-table">
        <thead>
          <tr>
            <th className="lt-pos">#</th>
            <th className="lt-player">PLAYER</th>
            <th className="lt-stat">P</th>
            <th className="lt-stat">W</th>
            <th className="lt-stat">D</th>
            <th className="lt-stat">L</th>
            <th className="lt-stat">GF</th>
            <th className="lt-stat">GA</th>
            <th className="lt-stat lt-gd">GD</th>
            <th className="lt-stat lt-pts">PTS</th>
            <th className="lt-form">FORM</th>
          </tr>
        </thead>
        <tbody>
          {standingsDiv1.map((row) => {
            const rowClasses = [
              'lt-row',
              row.zone === 'promo' ? 'promo-zone' : '',
              row.zone === 'releg' ? 'releg-zone' : '',
              row.isYou ? 'your-row' : '',
            ].filter(Boolean).join(' ');

            const badgeClass = row.badge === 'gold' ? 'gold' : row.badge === 'silver' ? 'silver' : row.badge === 'bronze' ? 'bronze' : row.badge === 'releg' ? 'releg' : '';

            return (
              <tr key={row.pos} className={rowClasses}>
                <td className="lt-pos">
                  <span className={`lt-pos-badge ${badgeClass}`}>{row.pos}</span>
                </td>
                <td className="lt-player-cell">
                  <img
                    src={row.avatar}
                    className={`lt-avatar${row.isYou ? ' you-avatar' : ''}`}
                    alt=""
                  />
                  <div className="lt-player-info">
                    <span className="lt-name clickable-name" onClick={handlePlayerClick}>
                      {row.name}
                    </span>
                    {row.isYou && <span className="lt-you-badge">YOU</span>}
                    <span className="lt-meta">
                      <row.Flag /> <img src={row.club} className="lt-club-badge" alt="" />
                    </span>
                  </div>
                </td>
                <td className="lt-stat">{row.p}</td>
                <td className="lt-stat">{row.w}</td>
                <td className="lt-stat">{row.d}</td>
                <td className="lt-stat">{row.l}</td>
                <td className="lt-stat">{row.gf}</td>
                <td className="lt-stat">{row.ga}</td>
                <td className={`lt-stat lt-gd ${row.gdClass}`}>{row.gd}</td>
                <td className="lt-stat lt-pts">{row.pts}</td>
                <td className="lt-form-cell">
                  {row.form.map((f, i) => (
                    <span key={i} className={`lt-form-dot ${f}`} />
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="league-zone-legend">
        <span className="zone-indicator promo"><span className="zone-dot promo" /> Promotion Zone</span>
        <span className="zone-indicator releg"><span className="zone-dot releg" /> Relegation Zone</span>
      </div>
    </div>
  );

  const renderFixturePlayer = (player: FixturePlayerData, side: 'left' | 'right') => (
    <div className={`lf-player${side === 'right' ? ' right' : ''}`}>
      <img src={player.avatar} className="lf-avatar" alt="" />
      <div className="lf-player-info">
        <span className="lf-name clickable-name" onClick={handlePlayerClick}>{player.name}</span>
        <div className="lf-player-meta">
          <span className={`lf-pos ${player.posTier}`}>#{player.pos}</span>
          <span className="lf-elo">{player.elo}</span>
          <span className="lf-record">
            <span className="w">{player.record.w}W</span>
            <span className="d">{player.record.d}D</span>
            <span className="l">{player.record.l}L</span>
          </span>
        </div>
      </div>
    </div>
  );

  const renderCurrentWeek = () => (
    <div className="lf-sub-content active" id="lf-current">
      <div className="lf-current-hero">
        <div className="lf-current-title">
          <span className="lf-dot" />
          <span>Matchday 7 of 9</span>
          <span className="lf-current-sub">{'\u00b7'} La Liga Round 28</span>
        </div>
        <span className="lf-predict-badge">{t?.predict_now_upper || 'PREDICT NOW'}</span>
      </div>

      {currentWeekFixtures.map((fix, i) => (
        <div key={i} className="lf-card upcoming" onClick={handleDuelClick} style={{ cursor: 'pointer' }}>
          <div className="lf-status"><span className="lf-badge upcoming-badge">UPCOMING</span></div>
          <div className="lf-match">
            {renderFixturePlayer(fix.home, 'left')}
            <div className="lf-score">
              <span className="lf-vs">VS</span>
            </div>
            {renderFixturePlayer(fix.away, 'right')}
          </div>
          <div className="lf-card-footer">
            <span className="lf-countdown"><ClockIcon /> 2d 14h 30m</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPastResultsDetailed = () => (
    <div className="lf-past-matchday">
      <div className="lf-past-label">
        <span className="lf-past-dot" />
        Matchday 6 {'\u00b7'} Completed
      </div>
      {pastMatchday6Detailed.map((fix, i) => (
        <div key={i} className="lf-card completed" onClick={handleDuelClick} style={{ cursor: 'pointer' }}>
          <div className="lf-status"><span className="lf-badge ft">FT</span></div>
          <div className="lf-match">
            {renderFixturePlayer(fix.home, 'left')}
            <div className="lf-score">
              <span className={`lf-goals${fix.homeGoals > fix.awayGoals ? ' winner' : ''}`}>{fix.homeGoals}</span>
              <span className="lf-vs">-</span>
              <span className={`lf-goals${fix.awayGoals > fix.homeGoals ? ' winner' : ''}`}>{fix.awayGoals}</span>
            </div>
            {renderFixturePlayer(fix.away, 'right')}
          </div>
          <div className="lf-card-footer">
            <span className={`lf-result-tag${fix.isDraw ? ' draw-tag' : ''}`}>
              {fix.isDraw ? <DrawIcon /> : <CheckCircleIcon />} {fix.resultText}
            </span>
            <span className={`lf-elo-change ${fix.eloClass}`}>{fix.eloChange}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPastResultsSimple = (md: typeof pastMatchdaysSimple[0]) => (
    <div className="lf-past-matchday" key={md.id}>
      <div className="lf-past-label">
        <span className="lf-past-dot" />
        {md.label}
      </div>
      {md.fixtures.map((fix, i) => (
        <div key={i} className="lf-card completed" onClick={handleDuelClick} style={{ cursor: 'pointer' }}>
          <div className="lf-status"><span className="lf-badge ft">FT</span></div>
          <div className="lf-match">
            <div className="lf-player">
              <img src={fix.homeAvatar} className="lf-avatar" alt="" />
              <span className="lf-name clickable-name" onClick={handlePlayerClick}>{fix.homeName}</span>
            </div>
            <div className="lf-score">
              <span className={`lf-goals${fix.homeGoals > fix.awayGoals ? ' winner' : ''}`}>{fix.homeGoals}</span>
              <span className="lf-vs">-</span>
              <span className={`lf-goals${fix.awayGoals > fix.homeGoals ? ' winner' : ''}`}>{fix.awayGoals}</span>
            </div>
            <div className="lf-player right">
              <span className="lf-name clickable-name" onClick={handlePlayerClick}>{fix.awayName}</span>
              <img src={fix.awayAvatar} className="lf-avatar" alt="" />
            </div>
          </div>
          <div className={`lf-result-tag${fix.isDraw ? ' draw-tag' : ''}`}>{fix.resultText}</div>
        </div>
      ))}
    </div>
  );

  const renderPastResults = () => {
    const activeMd = selectedPastMatchday === 6
      ? null
      : pastMatchdaysSimple.find(md => md.id === selectedPastMatchday);

    return (
      <div className="lf-sub-content active" id="lf-past">
        <div className="lf-md-selector">
          <label>Select Matchday</label>
          <select
            className="lf-md-dropdown"
            value={selectedPastMatchday}
            onChange={(e) => setSelectedPastMatchday(Number(e.target.value))}
          >
            <option value={6}>Matchday 6 {'\u2014'} La Liga Round 27</option>
            {pastMatchdaysSimple.map(md => (
              <option key={md.id} value={md.id}>{md.dropdownLabel}</option>
            ))}
          </select>
        </div>

        {selectedPastMatchday === 6 && renderPastResultsDetailed()}
        {activeMd && renderPastResultsSimple(activeMd)}
      </div>
    );
  };

  const renderFixtures = () => (
    <div>
      <div className="lf-sub-tabs">
        <button
          className={`lf-sub-tab${fixtureSubTab === 'current' ? ' active' : ''}`}
          onClick={() => setFixtureSubTab('current')}
        >
          <CalendarTodayIcon />
          Current Week
        </button>
        <button
          className={`lf-sub-tab${fixtureSubTab === 'past' ? ' active' : ''}`}
          onClick={() => setFixtureSubTab('past')}
        >
          <HistoryClockIcon />
          Past Results
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={fixtureSubTab}
          variants={tabVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          {fixtureSubTab === 'current' ? renderCurrentWeek() : renderPastResults()}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const renderPredictions = () => (
    <div>
      <div className="lp-header">
        <div className="lp-vs-card" onClick={handleDuelClick} style={{ cursor: 'pointer' }}>
          <div className="lp-vs-player">
            <img src="https://randomuser.me/api/portraits/men/22.jpg" className="lp-vs-avatar" alt="" />
            <div className="lp-vs-name">AlexGamer7</div>
            <div className="lp-vs-sub">YOU {'\u00b7'} 1,186 ELO</div>
          </div>
          <div className="lp-vs-center">
            <div className="lp-vs-badge">VS</div>
            <div className="lp-vs-matchday">League Matchday 8</div>
          </div>
          <div className="lp-vs-player">
            <img src="https://randomuser.me/api/portraits/men/67.jpg" className="lp-vs-avatar" alt="" />
            <div className="lp-vs-name">TheStriker10</div>
            <div className="lp-vs-sub">1,142 ELO</div>
          </div>
        </div>
      </div>

      <div className="lp-matches-title">
        <img src="https://media.api-sports.io/football/leagues/140.png" style={{ width: '20px', height: '20px' }} alt="" />
        La Liga {'\u2014'} Round 32 {'\u00b7'} 5 matches
      </div>

      {predictionMatches.map((match) => {
        const statusClasses = [
          'lp-match-card',
          match.status === 'live' ? 'match-live' : '',
          match.status === 'ft' ? 'match-ft' : '',
        ].filter(Boolean).join(' ');

        return (
          <div key={match.id} className={statusClasses}>
            <div className="lp-match-num">{match.id}</div>
            <div className="lp-match-teams">
              <img src={match.homeCrest} className="lp-crest" alt="" />
              <span className="lp-team-name">{match.homeName}</span>
              <span className="lp-team-vs">vs</span>
              <span className="lp-team-name">{match.awayName}</span>
              <img src={match.awayCrest} className="lp-crest" alt="" />
            </div>
            <div className="lp-match-btns">
              {['1', 'X', '2'].map((opt) => (
                <button
                  key={opt}
                  className={`lp-btn${predictions[match.id] === opt ? ' selected' : ''}`}
                  disabled={match.locked}
                  onClick={() => !match.locked && handlePredictionSelect(match.id, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="lp-kickoff">
              {match.status === 'live' && (
                <><span className="match-status-pill live">{match.statusText}</span> <span className="match-score-inline">{match.score}</span></>
              )}
              {match.status === 'ft' && (
                <><span className="match-status-pill ft">{match.statusText}</span> <span className="match-score-inline">{match.score}</span></>
              )}
              {match.status === 'upcoming' && match.kickoff}
            </div>
          </div>
        );
      })}

      <div className="lp-submit-area">
        <button className="lp-submit-btn" onClick={handleSubmitPredictions}>
          <CheckIcon />
          Submit Predictions
        </button>
        <div className="lp-submit-info">{predictedCount} of 5 predicted {'\u00b7'} Locks in 1d 8h</div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div>
      {historySeasons.map((season, si) => (
        <div key={si} className="lh-season-card">
          <div className="lh-season-header">
            <div className="lh-season-title">
              <TrophyIcon />
              {season.name} {'\u2014'} Completed
            </div>
            <span className="lh-season-date">{season.dateRange}</span>
          </div>
          <div className="lh-season-body">
            <div className="lh-champion-card">
              <div className="lh-champion-crown"><CrownIcon /></div>
              <img src={season.champion.avatar} className="lh-champion-avatar" alt="" />
              <div className="lh-champion-name">{season.champion.name}</div>
              <div className="lh-champion-label">CHAMPION {'\u00b7'} {season.champion.pts} pts</div>
            </div>
            <div className="lh-final-table-mini">
              {season.table.map((row, ri) => (
                <div key={ri} className={`lh-mini-row ${row.rowClass}`}>
                  <span className="lh-mini-pos">{row.pos}</span>
                  <span className="lh-mini-name">{row.name}</span>
                  <span className="lh-mini-pts">{row.pts}</span>
                  <span className={`lh-mini-tag ${row.tagClass}`}>{row.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── Main Render ──────────────────────────────────────────

  const tabs = [
    { key: 'standings' as const, label: 'Standings', Icon: StandingsIcon },
    { key: 'fixtures' as const, label: 'Fixtures', Icon: FixturesIcon },
    { key: 'predictions' as const, label: 'Predictions', Icon: PredictionsIcon },
    { key: 'history' as const, label: 'History', Icon: HistoryIcon },
  ];

  return (
    <div className="page" id="page-leagues">
      {/* League Hero Banner */}
      <div className="league-hero">
        <div className="league-hero-bg" />
        <div className="league-hero-content">
          <div className="league-hero-left">
            <div className="league-shield-wrap">
              <img
                src="https://media.api-sports.io/football/leagues/140.png"
                alt="La Liga"
                className="league-shield-img"
              />
            </div>
            <div className="league-hero-info">
              <div className="league-hero-title">DIVISION 1</div>
              <div className="league-hero-sub">La Liga {'\u00b7'} Season 3</div>
            </div>
          </div>
          <div className="league-hero-right">
            <div className="league-hero-matchday">Matchday 7 of 9</div>
            <div className="league-progress-bar">
              <div className="league-progress-fill" style={{ width: '78%' }} />
            </div>
            <select
              className="league-season-select"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
            >
              <option>Season 3 (Current)</option>
              <option>Season 2</option>
              <option>Season 1</option>
            </select>
          </div>
        </div>
      </div>

      {/* League Main Tabs */}
      <div className="league-tabs-bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`league-tab${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.Icon />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Division Tabs */}
      <div className="division-tabs-bar">
        <button
          className={`div-tab${activeDivision === 1 ? ' active' : ''}`}
          onClick={() => setActiveDivision(1)}
        >
          <span className="div-tab-badge div1">1</span> Division 1
        </button>
        <button
          className={`div-tab${activeDivision === 2 ? ' active' : ''}`}
          onClick={() => setActiveDivision(2)}
        >
          <span className="div-tab-badge div2">2</span> Division 2
        </button>
      </div>

      {/* Tab Content with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="league-tab-content active"
          variants={tabVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'standings' && renderStandings()}
          {activeTab === 'fixtures' && renderFixtures()}
          {activeTab === 'predictions' && renderPredictions()}
          {activeTab === 'history' && renderHistory()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
