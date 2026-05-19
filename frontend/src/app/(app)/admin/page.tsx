'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

// ── Types ──────────────────────────────────────────────────────────────────
interface Player {
  id: number;
  name: string;
  elo: number;
  role: string;
  status: string;
  joinDate: string;
}

interface Tournament {
  id: number;
  name: string;
  format: string;
  status: 'active' | 'completed' | 'upcoming';
  players: number;
  startDate: string;
}

interface League {
  id: number;
  name: string;
  divisions: number;
  status: 'active' | 'completed' | 'upcoming';
  players: number;
  season: string;
}

interface Match {
  id: number;
  home: string;
  away: string;
  score: string;
  status: string;
  tournament: string;
  date: string;
  excluded: boolean;
}

interface Challenge {
  id: number;
  challenger: string;
  opponent: string;
  stake: number;
  status: string;
  createdAt: string;
}

interface StandingRow {
  player: string;
  w: number;
  d: number;
  l: number;
  gd: number;
  pts: number;
  modified?: boolean;
}

interface CronJob {
  name: string;
  schedule: string;
  lastRun: string;
  status: 'ok' | 'error' | 'running';
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const mockPlayers: Player[] = [
  { id: 1, name: 'Marcus R.', elo: 1847, role: 'admin', status: 'active', joinDate: '2024-01-15' },
  { id: 2, name: 'James K.', elo: 1792, role: 'user', status: 'active', joinDate: '2024-01-20' },
  { id: 3, name: 'David M.', elo: 1756, role: 'user', status: 'active', joinDate: '2024-02-01' },
  { id: 4, name: 'Chris P.', elo: 1734, role: 'user', status: 'active', joinDate: '2024-02-10' },
  { id: 5, name: 'Alex T.', elo: 1721, role: 'user', status: 'active', joinDate: '2024-02-15' },
  { id: 6, name: 'Ryan S.', elo: 1698, role: 'moderator', status: 'active', joinDate: '2024-03-01' },
  { id: 7, name: 'Tom W.', elo: 1687, role: 'user', status: 'banned', joinDate: '2024-03-10' },
  { id: 8, name: 'Ben H.', elo: 1665, role: 'user', status: 'active', joinDate: '2024-03-15' },
];

const mockTournaments: Tournament[] = [
  { id: 1, name: 'Champions Cup #4', format: '16 Players', status: 'active', players: 16, startDate: '2025-05-01' },
  { id: 2, name: 'Grand Slam Series', format: '24 Players', status: 'active', players: 24, startDate: '2025-04-15' },
  { id: 3, name: 'Spring Invitational', format: '16 Players', status: 'completed', players: 16, startDate: '2025-03-01' },
  { id: 4, name: 'Summer Cup 2025', format: '24 Players', status: 'upcoming', players: 0, startDate: '2025-06-01' },
];

const mockLeagues: League[] = [
  { id: 1, name: 'Premier Prediction League', divisions: 3, status: 'active', players: 24, season: '2024/25' },
  { id: 2, name: 'Championship League', divisions: 2, status: 'active', players: 16, season: '2024/25' },
  { id: 3, name: 'Europa League Fantasy', divisions: 2, status: 'upcoming', players: 0, season: '2025/26' },
];

const mockMatches: Match[] = [
  { id: 1, home: 'Arsenal', away: 'Chelsea', score: '2-1', status: 'completed', tournament: 'Champions Cup #4', date: '2025-05-10', excluded: false },
  { id: 2, home: 'Liverpool', away: 'Man City', score: '1-1', status: 'completed', tournament: 'Champions Cup #4', date: '2025-05-10', excluded: false },
  { id: 3, home: 'Real Madrid', away: 'Barcelona', score: '3-2', status: 'completed', tournament: 'Grand Slam', date: '2025-05-11', excluded: true },
  { id: 4, home: 'Bayern', away: 'Dortmund', score: '-', status: 'suspended', tournament: 'Grand Slam', date: '2025-05-12', excluded: false },
  { id: 5, home: 'PSG', away: 'Marseille', score: '-', status: 'upcoming', tournament: 'Champions Cup #4', date: '2025-05-15', excluded: false },
];

const mockChallenges: Challenge[] = [
  { id: 1, challenger: 'Marcus R.', opponent: 'James K.', stake: 25, status: 'pending', createdAt: '2025-05-14' },
  { id: 2, challenger: 'David M.', opponent: 'Chris P.', stake: 50, status: 'active', createdAt: '2025-05-13' },
  { id: 3, challenger: 'Alex T.', opponent: 'Ryan S.', stake: 10, status: 'pending', createdAt: '2025-05-12' },
  { id: 4, challenger: 'Ben H.', opponent: 'Tom W.', stake: 30, status: 'disputed', createdAt: '2025-05-11' },
  { id: 5, challenger: 'James K.', opponent: 'David M.', stake: 20, status: 'active', createdAt: '2025-05-10' },
];

const mockStandings: StandingRow[] = [
  { player: 'Marcus R.', w: 5, d: 1, l: 0, gd: 12, pts: 16 },
  { player: 'James K.', w: 4, d: 1, l: 1, gd: 8, pts: 13 },
  { player: 'David M.', w: 3, d: 2, l: 1, gd: 5, pts: 11 },
  { player: 'Chris P.', w: 2, d: 2, l: 2, gd: 0, pts: 8 },
];

const mockCronJobs: CronJob[] = [
  { name: 'Fetch Live Scores', schedule: 'Every 1 min', lastRun: '2 min ago', status: 'ok' },
  { name: 'Update Standings', schedule: 'Every 5 min', lastRun: '3 min ago', status: 'ok' },
  { name: 'Process Predictions', schedule: 'Every 5 min', lastRun: '4 min ago', status: 'ok' },
  { name: 'ELO Recalculation', schedule: 'Daily 03:00', lastRun: '18h ago', status: 'ok' },
  { name: 'Cleanup Old Sessions', schedule: 'Daily 04:00', lastRun: '17h ago', status: 'error' },
];

// ── Tab definitions ────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'create-tournament', label: 'Create Tournament', icon: 'trophy' },
  { id: 'create-league', label: 'Create League', icon: 'league' },
  { id: 'manage-tournaments', label: 'Manage Tournaments', icon: 'manage-trophy' },
  { id: 'manage-leagues', label: 'Manage Leagues', icon: 'manage-league' },
  { id: 'players', label: 'Players', icon: 'players' },
  { id: 'matches', label: 'Matches', icon: 'matches' },
  { id: 'standings', label: 'Standings Editor', icon: 'standings' },
  { id: 'challenges', label: 'Challenges', icon: 'challenges' },
  { id: 'api-settings', label: 'API Settings', icon: 'api' },
  { id: 'broadcast', label: 'Broadcast', icon: 'broadcast' },
  { id: 'system', label: 'System', icon: 'system' },
] as const;

type TabId = typeof TABS[number]['id'];

// ── SVG Icons ──────────────────────────────────────────────────────────────

function TabIcon({ icon }: { icon: string }) {
  const size = 18;
  const svgProps = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  
  switch (icon) {
    case 'dashboard':
      return <svg {...svgProps}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
    case 'trophy':
    case 'manage-trophy':
      return <svg {...svgProps}><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>;
    case 'league':
    case 'manage-league':
      return <svg {...svgProps}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" /><path d="M2 12h20" /></svg>;
    case 'players':
      return <svg {...svgProps}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
    case 'matches':
      return <svg {...svgProps}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>;
    case 'standings':
      return <svg {...svgProps}><path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-10" /></svg>;
    case 'challenges':
      return <svg {...svgProps}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>;
    case 'api':
      return <svg {...svgProps}><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>;
    case 'broadcast':
      return <svg {...svgProps}><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>;
    case 'system':
      return <svg {...svgProps}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>;
    default:
      return <svg {...svgProps}><circle cx="12" cy="12" r="10" /></svg>;
  }
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const tabBarRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  
  // Create Tournament state
  const [tournamentName, setTournamentName] = useState('');
  const [tournamentFormat, setTournamentFormat] = useState('16');
  const [tournamentLeague, setTournamentLeague] = useState('');
  const [tournamentDesc, setTournamentDesc] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [playerSearch, setPlayerSearch] = useState('');
  
  // Create League state
  const [leagueName, setLeagueName] = useState('');
  const [footballLeague, setFootballLeague] = useState('');
  const [divisionCount, setDivisionCount] = useState('2');
  const [matchesPerPair, setMatchesPerPair] = useState('1');
  const [promoSpots, setPromoSpots] = useState('2');
  const [relegSpots, setRelegSpots] = useState('2');
  
  // Players tab state
  const [playerSearchFilter, setPlayerSearchFilter] = useState('');
  
  // Matches tab state
  const [matchFilter, setMatchFilter] = useState('all');
  
  // Standings editor state
  const [standingsSource, setStandingsSource] = useState('tournament-1');
  const [standingsGroup, setStandingsGroup] = useState('group-a');
  const [editableStandings, setEditableStandings] = useState<StandingRow[]>(mockStandings.map(s => ({ ...s })));
  
  // Broadcast state
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState('normal');
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  
  // API Settings state
  const [apiKey, setApiKey] = useState('sk-****-****-****-abc123');
  const [apiRateLimit, setApiRateLimit] = useState('100');
  
  // ─── Access check ──────────────────────────────────────────────────────
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--tx3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <h2 style={{ color: 'var(--tx)', marginTop: '16px' }}>Access Denied</h2>
          <p style={{ color: 'var(--tx3)' }}>You need administrator privileges to access this page.</p>
          <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  // ─── Handlers ──────────────────────────────────────────────────────────
  
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
  };
  
  const togglePlayer = (id: number) => {
    setSelectedPlayers(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };
  
  const handleCreateTournament = () => {
    alert(`Tournament "${tournamentName}" created with ${selectedPlayers.length} players!`);
  };
  
  const handleCreateLeague = () => {
    alert(`League "${leagueName}" created with ${divisionCount} divisions!`);
  };
  
  const handleStandingChange = (index: number, field: keyof StandingRow, value: string) => {
    setEditableStandings(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: field === 'player' ? value : parseInt(value) || 0, modified: true };
      return updated;
    });
  };
  
  const handleSaveStandings = () => {
    alert('Standings saved successfully!');
    setEditableStandings(prev => prev.map(s => ({ ...s, modified: false })));
  };
  
  const handleSendBroadcast = () => {
    alert(`Broadcast sent: "${broadcastMessage}" (${broadcastPriority}) to ${broadcastTarget}`);
    setBroadcastMessage('');
  };
  
  const filteredPlayers = mockPlayers.filter(p =>
    p.name.toLowerCase().includes(playerSearch.toLowerCase())
  );
  
  const filteredPlayersList = mockPlayers.filter(p =>
    p.name.toLowerCase().includes(playerSearchFilter.toLowerCase())
  );
  
  const filteredMatches = matchFilter === 'all' 
    ? mockMatches 
    : mockMatches.filter(m => m.status === matchFilter);
  
  // ─── Tab content renderers ─────────────────────────────────────────────
  
  const renderOverview = () => (
    <div className="admin-tab-content">
      <div className="admin-stat-cards">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--blue)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">24</span>
            <span className="admin-stat-label">Total Players</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--yellow)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M18 2H6v7a6 6 0 0012 0V2z" />
            </svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">3</span>
            <span className="admin-stat-label">Active Tournaments</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--green)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" /><path d="M2 12h20" />
            </svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">2</span>
            <span className="admin-stat-label">Active Leagues</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">5</span>
            <span className="admin-stat-label">Pending Challenges</span>
          </div>
        </div>
      </div>
      
      <div className="admin-card" style={{ marginTop: '20px' }}>
        <h3 className="admin-card-title">Recent Activity</h3>
        <div className="admin-activity-list">
          {[
            { text: 'Marcus R. created Champions Cup #4', time: '2 hours ago', color: 'var(--blue)' },
            { text: 'James K. joined Grand Slam Series', time: '3 hours ago', color: 'var(--green)' },
            { text: 'David M. challenged Chris P. (50 ELO)', time: '5 hours ago', color: 'var(--yellow)' },
            { text: 'Match suspended: Bayern vs Dortmund', time: '6 hours ago', color: 'var(--red)' },
            { text: 'System: ELO recalculation completed', time: '18 hours ago', color: 'var(--tx3)' },
          ].map((item, i) => (
            <div key={i} className="admin-activity-item">
              <div className="admin-activity-dot" style={{ background: item.color }} />
              <div className="admin-activity-text">
                <span>{item.text}</span>
                <span className="admin-activity-time">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="admin-card" style={{ marginTop: '16px' }}>
        <h3 className="admin-card-title">Quick Actions</h3>
        <div className="admin-quick-actions">
          <button className="admin-action-btn primary" onClick={() => setActiveTab('create-tournament')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Tournament
          </button>
          <button className="admin-action-btn success" onClick={() => setActiveTab('create-league')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New League
          </button>
          <button className="admin-action-btn warning" onClick={() => setActiveTab('broadcast')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            Broadcast
          </button>
        </div>
      </div>
    </div>
  );

  const renderCreateTournament = () => (
    <div className="admin-tab-content">
      <div className="admin-card">
        <h3 className="admin-card-title">Create New Tournament</h3>
        <div className="admin-form">
          <div className="admin-form-group">
            <label className="admin-label">Tournament Name</label>
            <input 
              className="admin-input"
              type="text"
              placeholder="e.g. Champions Cup #5"
              value={tournamentName}
              onChange={e => setTournamentName(e.target.value)}
            />
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Format</label>
              <select className="admin-select" value={tournamentFormat} onChange={e => setTournamentFormat(e.target.value)}>
                <option value="16">16 Players (4 Groups)</option>
                <option value="24">24 Players (6 Groups)</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Football League</label>
              <select className="admin-select" value={tournamentLeague} onChange={e => setTournamentLeague(e.target.value)}>
                <option value="">Select league...</option>
                <option value="premier-league">Premier League</option>
                <option value="la-liga">La Liga</option>
                <option value="bundesliga">Bundesliga</option>
                <option value="serie-a">Serie A</option>
                <option value="ligue-1">Ligue 1</option>
              </select>
            </div>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Description</label>
            <textarea 
              className="admin-textarea"
              placeholder="Tournament description..."
              value={tournamentDesc}
              onChange={e => setTournamentDesc(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="admin-form-group" style={{ marginTop: '20px' }}>
            <label className="admin-label">
              Select Players ({selectedPlayers.length}/{tournamentFormat})
            </label>
            <input 
              className="admin-input"
              type="text"
              placeholder="Search players..."
              value={playerSearch}
              onChange={e => setPlayerSearch(e.target.value)}
              style={{ marginBottom: '12px' }}
            />
            <div className="admin-player-checklist">
              {filteredPlayers.map(player => (
                <label key={player.id} className="admin-player-check-item">
                  <input
                    type="checkbox"
                    checked={selectedPlayers.includes(player.id)}
                    onChange={() => togglePlayer(player.id)}
                  />
                  <span className="admin-player-check-name">{player.name}</span>
                  <span className="admin-player-check-elo">ELO: {player.elo}</span>
                </label>
              ))}
            </div>
          </div>
          
          <button 
            className="btn-primary admin-submit-btn"
            onClick={handleCreateTournament}
            disabled={!tournamentName || selectedPlayers.length < 2}
            style={{ marginTop: '20px', width: '100%' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>
            Start Tournament (Random Draw)
          </button>
        </div>
      </div>
    </div>
  );

  const renderCreateLeague = () => (
    <div className="admin-tab-content">
      <div className="admin-card">
        <h3 className="admin-card-title">Create New League</h3>
        <div className="admin-form">
          <div className="admin-form-group">
            <label className="admin-label">League Name</label>
            <input 
              className="admin-input"
              type="text"
              placeholder="e.g. Premier Prediction League"
              value={leagueName}
              onChange={e => setLeagueName(e.target.value)}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Football League</label>
            <select className="admin-select" value={footballLeague} onChange={e => setFootballLeague(e.target.value)}>
              <option value="">Select football league...</option>
              <option value="premier-league">Premier League</option>
              <option value="la-liga">La Liga</option>
              <option value="bundesliga">Bundesliga</option>
              <option value="serie-a">Serie A</option>
              <option value="ligue-1">Ligue 1</option>
            </select>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Number of Divisions</label>
              <select className="admin-select" value={divisionCount} onChange={e => setDivisionCount(e.target.value)}>
                <option value="1">1 Division</option>
                <option value="2">2 Divisions</option>
                <option value="3">3 Divisions</option>
                <option value="4">4 Divisions</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Matches Per Pair</label>
              <select className="admin-select" value={matchesPerPair} onChange={e => setMatchesPerPair(e.target.value)}>
                <option value="1">1× (Single)</option>
                <option value="2">2× (Home & Away)</option>
                <option value="3">3× (Triple)</option>
              </select>
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Promotion Spots</label>
              <select className="admin-select" value={promoSpots} onChange={e => setPromoSpots(e.target.value)}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Relegation Spots</label>
              <select className="admin-select" value={relegSpots} onChange={e => setRelegSpots(e.target.value)}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
          </div>
          <button 
            className="btn-primary admin-submit-btn"
            onClick={handleCreateLeague}
            disabled={!leagueName}
            style={{ marginTop: '20px', width: '100%' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 000 20" /><path d="M2 12h20" /></svg>
            Create League
          </button>
        </div>
      </div>
    </div>
  );

  const renderManageTournaments = () => (
    <div className="admin-tab-content">
      <div className="admin-card">
        <h3 className="admin-card-title">Manage Tournaments</h3>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Format</th>
                <th>Status</th>
                <th>Players</th>
                <th>Start Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockTournaments.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.name}</strong></td>
                  <td>{t.format}</td>
                  <td>
                    <span className={`admin-status-badge ${t.status}`}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </td>
                  <td>{t.players}</td>
                  <td>{t.startDate}</td>
                  <td className="admin-actions-cell">
                    <button className="admin-action-btn view" title="View">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>
                    <button className="admin-action-btn edit" title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    {t.status !== 'completed' && (
                      <button className="admin-action-btn cancel" title="Cancel">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                      </button>
                    )}
                    <button className="admin-action-btn delete" title="Delete">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderManageLeagues = () => (
    <div className="admin-tab-content">
      <div className="admin-card">
        <h3 className="admin-card-title">Manage Leagues</h3>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Divisions</th>
                <th>Status</th>
                <th>Players</th>
                <th>Season</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockLeagues.map(l => (
                <tr key={l.id}>
                  <td><strong>{l.name}</strong></td>
                  <td>{l.divisions}</td>
                  <td>
                    <span className={`admin-status-badge ${l.status}`}>
                      {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                    </span>
                  </td>
                  <td>{l.players}</td>
                  <td>{l.season}</td>
                  <td className="admin-actions-cell">
                    <button className="admin-action-btn view" title="View">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>
                    <button className="admin-action-btn edit" title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button className="admin-action-btn delete" title="Delete">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPlayers = () => (
    <div className="admin-tab-content">
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Player Management</h3>
          <input 
            className="admin-input"
            type="text"
            placeholder="Search players..."
            value={playerSearchFilter}
            onChange={e => setPlayerSearchFilter(e.target.value)}
            style={{ maxWidth: '250px' }}
          />
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ELO</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayersList.map(p => (
                <tr key={p.id} className={p.status === 'banned' ? 'row-banned' : ''}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.elo}</td>
                  <td>
                    <span className={`admin-role-badge ${p.role}`}>
                      {p.role.charAt(0).toUpperCase() + p.role.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-status-badge ${p.status}`}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </td>
                  <td>{p.joinDate}</td>
                  <td className="admin-actions-cell">
                    <button className="admin-action-btn edit" title="Edit Role">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button className={`admin-action-btn ${p.status === 'banned' ? 'success' : 'danger'}`} title={p.status === 'banned' ? 'Unban' : 'Ban'}>
                      {p.status === 'banned' ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M9 12l2 2 4-4" /></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                      )}
                    </button>
                    <button className="admin-action-btn warning" title="Reset ELO">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,4 1,10 7,10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMatches = () => (
    <div className="admin-tab-content">
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Match Management</h3>
          <select className="admin-select" value={matchFilter} onChange={e => setMatchFilter(e.target.value)} style={{ maxWidth: '200px' }}>
            <option value="all">All Matches</option>
            <option value="completed">Completed</option>
            <option value="suspended">Suspended</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Match</th>
                <th>Score</th>
                <th>Status</th>
                <th>Tournament</th>
                <th>Date</th>
                <th>Excluded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map(m => (
                <tr key={m.id} className={m.excluded ? 'row-excluded' : ''}>
                  <td><strong>{m.home} vs {m.away}</strong></td>
                  <td>{m.score}</td>
                  <td>
                    <span className={`admin-status-badge ${m.status}`}>
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </span>
                  </td>
                  <td>{m.tournament}</td>
                  <td>{m.date}</td>
                  <td>
                    <span className={`admin-excluded-badge ${m.excluded ? 'yes' : 'no'}`}>
                      {m.excluded ? 'Excluded' : 'Included'}
                    </span>
                  </td>
                  <td className="admin-actions-cell">
                    <button className="admin-action-btn edit" title="Override Result">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button className={`admin-action-btn ${m.excluded ? 'success' : 'warning'}`} title={m.excluded ? 'Include' : 'Exclude'}>
                      {m.excluded ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                      )}
                    </button>
                    <button className="admin-action-btn danger" title="Suspend">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStandingsEditor = () => (
    <div className="admin-tab-content">
      <div className="admin-card">
        <h3 className="admin-card-title">Standings Editor</h3>
        <div className="admin-warning-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          <span>Manual changes will override calculated standings</span>
        </div>
        <div className="admin-form-row" style={{ marginBottom: '16px', marginTop: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-label">Tournament / League</label>
            <select className="admin-select" value={standingsSource} onChange={e => setStandingsSource(e.target.value)}>
              <option value="tournament-1">Champions Cup #4</option>
              <option value="tournament-2">Grand Slam Series</option>
              <option value="league-1">Premier Prediction League</option>
              <option value="league-2">Championship League</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Group / Division</label>
            <select className="admin-select" value={standingsGroup} onChange={e => setStandingsGroup(e.target.value)}>
              <option value="group-a">Group A</option>
              <option value="group-b">Group B</option>
              <option value="group-c">Group C</option>
              <option value="group-d">Group D</option>
            </select>
          </div>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table admin-table-editable">
            <thead>
              <tr>
                <th>Player</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GD</th>
                <th>PTS</th>
              </tr>
            </thead>
            <tbody>
              {editableStandings.map((row, i) => (
                <tr key={i} className={row.modified ? 'row-modified' : ''}>
                  <td>{row.player}</td>
                  <td>
                    <input
                      className="admin-input admin-input-small"
                      type="number"
                      value={row.w}
                      onChange={e => handleStandingChange(i, 'w', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="admin-input admin-input-small"
                      type="number"
                      value={row.d}
                      onChange={e => handleStandingChange(i, 'd', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="admin-input admin-input-small"
                      type="number"
                      value={row.l}
                      onChange={e => handleStandingChange(i, 'l', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="admin-input admin-input-small"
                      type="number"
                      value={row.gd}
                      onChange={e => handleStandingChange(i, 'gd', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="admin-input admin-input-small"
                      type="number"
                      value={row.pts}
                      onChange={e => handleStandingChange(i, 'pts', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className="btn-primary admin-submit-btn"
          onClick={handleSaveStandings}
          disabled={!editableStandings.some(s => s.modified)}
          style={{ marginTop: '16px', width: '100%' }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderChallenges = () => (
    <div className="admin-tab-content">
      <div className="admin-card">
        <h3 className="admin-card-title">Challenge Management</h3>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Challenger</th>
                <th>Opponent</th>
                <th>Stake (ELO)</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockChallenges.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.challenger}</strong></td>
                  <td>{c.opponent}</td>
                  <td>{c.stake}</td>
                  <td>
                    <span className={`admin-status-badge ${c.status}`}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </td>
                  <td>{c.createdAt}</td>
                  <td className="admin-actions-cell">
                    <button className="admin-action-btn success" title="Force Resolve">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                    </button>
                    <button className="admin-action-btn danger" title="Cancel Challenge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAPISettings = () => (
    <div className="admin-tab-content">
      <div className="admin-card">
        <h3 className="admin-card-title">API-Football Configuration</h3>
        <div className="admin-form">
          <div className="admin-form-group">
            <label className="admin-label">API Key</label>
            <div className="admin-input-group">
              <input 
                className="admin-input"
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
              <button className="admin-action-btn edit" style={{ marginLeft: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              </button>
            </div>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Rate Limit (requests/min)</label>
            <input 
              className="admin-input"
              type="number"
              value={apiRateLimit}
              onChange={e => setApiRateLimit(e.target.value)}
            />
          </div>
          <div className="admin-api-stats">
            <div className="admin-api-stat">
              <span className="admin-api-stat-label">Requests Today</span>
              <span className="admin-api-stat-value">1,247</span>
            </div>
            <div className="admin-api-stat">
              <span className="admin-api-stat-label">Daily Limit</span>
              <span className="admin-api-stat-value">10,000</span>
            </div>
            <div className="admin-api-stat">
              <span className="admin-api-stat-label">Usage</span>
              <span className="admin-api-stat-value" style={{ color: 'var(--green)' }}>12.5%</span>
            </div>
            <div className="admin-api-stat">
              <span className="admin-api-stat-label">Status</span>
              <span className="admin-api-stat-value" style={{ color: 'var(--green)' }}>Connected</span>
            </div>
          </div>
          <button className="btn-primary admin-submit-btn" style={{ marginTop: '16px', width: '100%' }}>
            Save API Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderBroadcast = () => (
    <div className="admin-tab-content">
      <div className="admin-card">
        <h3 className="admin-card-title">Send Broadcast</h3>
        <div className="admin-form">
          <div className="admin-form-group">
            <label className="admin-label">Message</label>
            <textarea 
              className="admin-textarea"
              placeholder="Type your broadcast message..."
              value={broadcastMessage}
              onChange={e => setBroadcastMessage(e.target.value)}
              rows={5}
            />
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Priority</label>
              <select className="admin-select" value={broadcastPriority} onChange={e => setBroadcastPriority(e.target.value)}>
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Send To</label>
              <select className="admin-select" value={broadcastTarget} onChange={e => setBroadcastTarget(e.target.value)}>
                <option value="all">All Users</option>
                <option value="tournament-1">Champions Cup #4</option>
                <option value="tournament-2">Grand Slam Series</option>
                <option value="league-1">Premier Prediction League</option>
                <option value="league-2">Championship League</option>
              </select>
            </div>
          </div>
          <button
            className="btn-primary admin-submit-btn"
            onClick={handleSendBroadcast}
            disabled={!broadcastMessage.trim()}
            style={{ marginTop: '16px', width: '100%' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            Send Broadcast
          </button>
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="admin-tab-content">
      <div className="admin-card">
        <h3 className="admin-card-title">System Status</h3>
        <div className="admin-system-stats">
          <div className="admin-system-stat">
            <span className="admin-system-stat-label">Database Size</span>
            <span className="admin-system-stat-value">247 MB</span>
          </div>
          <div className="admin-system-stat">
            <span className="admin-system-stat-label">Total Records</span>
            <span className="admin-system-stat-value">15,432</span>
          </div>
          <div className="admin-system-stat">
            <span className="admin-system-stat-label">Uptime</span>
            <span className="admin-system-stat-value">14d 7h 23m</span>
          </div>
          <div className="admin-system-stat">
            <span className="admin-system-stat-label">Memory Usage</span>
            <span className="admin-system-stat-value">68%</span>
          </div>
        </div>
      </div>
      
      <div className="admin-card" style={{ marginTop: '16px' }}>
        <h3 className="admin-card-title">Cron Jobs</h3>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Job Name</th>
                <th>Schedule</th>
                <th>Last Run</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockCronJobs.map((job, i) => (
                <tr key={i}>
                  <td><strong>{job.name}</strong></td>
                  <td>{job.schedule}</td>
                  <td>{job.lastRun}</td>
                  <td>
                    <span className={`admin-status-badge ${job.status === 'ok' ? 'active' : job.status === 'error' ? 'error' : 'running'}`}>
                      {job.status === 'ok' ? 'OK' : job.status === 'error' ? 'Error' : 'Running'}
                    </span>
                  </td>
                  <td className="admin-actions-cell">
                    <button className="admin-action-btn success" title="Run Now">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5,3 19,12 5,21 5,3" /></svg>
                    </button>
                    <button className="admin-action-btn view" title="View Logs">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10,9 9,9 8,9" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="admin-card" style={{ marginTop: '16px' }}>
        <h3 className="admin-card-title">Error Logs</h3>
        <div className="admin-error-logs">
          {[
            { level: 'error', message: 'Cleanup Old Sessions: Permission denied on /tmp/sessions', time: '2025-05-18 04:00:12' },
            { level: 'warn', message: 'API rate limit reached temporarily (retry in 60s)', time: '2025-05-18 02:14:33' },
            { level: 'info', message: 'ELO recalculation completed for 24 players', time: '2025-05-18 03:00:08' },
          ].map((log, i) => (
            <div key={i} className={`admin-log-entry ${log.level}`}>
              <span className="admin-log-level">{log.level.toUpperCase()}</span>
              <span className="admin-log-message">{log.message}</span>
              <span className="admin-log-time">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  // ─── Tab content router ──────────────────────────────────────────────
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'create-tournament': return renderCreateTournament();
      case 'create-league': return renderCreateLeague();
      case 'manage-tournaments': return renderManageTournaments();
      case 'manage-leagues': return renderManageLeagues();
      case 'players': return renderPlayers();
      case 'matches': return renderMatches();
      case 'standings': return renderStandingsEditor();
      case 'challenges': return renderChallenges();
      case 'api-settings': return renderAPISettings();
      case 'broadcast': return renderBroadcast();
      case 'system': return renderSystem();
      default: return renderOverview();
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────
  
  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1 className="admin-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          Admin Panel
        </h1>
      </div>
      
      {/* Scrollable Tab Bar */}
      <div className="admin-tabs" ref={tabBarRef}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <TabIcon icon={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Tab Content with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
