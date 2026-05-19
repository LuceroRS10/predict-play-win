'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

// Types
interface League {
  id: string;
  name: string;
  logo: string;
  shortName: string;
}

interface Match {
  id: string;
  homeTeam: string;
  homeLogo: string;
  awayTeam: string;
  awayLogo: string;
  status: 'FT' | 'LIVE' | 'HT' | 'upcoming';
  score?: string;
  minute?: string;
  kickoff?: string;
  countdown?: string;
  leagueId: string;
}

interface MatchDay {
  date: string;
  matches: Match[];
}

// Mock data
const leagues: League[] = [
  { id: 'laliga', name: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png', shortName: 'La Liga' },
  { id: 'pl', name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png', shortName: 'PL' },
  { id: 'seriea', name: 'Serie A', logo: 'https://media.api-sports.io/football/leagues/135.png', shortName: 'Serie A' },
  { id: 'ligue1', name: 'Ligue 1', logo: 'https://media.api-sports.io/football/leagues/61.png', shortName: 'Ligue 1' },
];

const mockMatchDays: MatchDay[] = [
  {
    date: 'Saturday, November 15',
    matches: [
      {
        id: 'm1',
        homeTeam: 'Real Madrid',
        homeLogo: 'https://media.api-sports.io/football/teams/541.png',
        awayTeam: 'Getafe',
        awayLogo: 'https://media.api-sports.io/football/teams/546.png',
        status: 'FT',
        score: '2 - 0',
        leagueId: 'laliga',
      },
      {
        id: 'm2',
        homeTeam: 'Barcelona',
        homeLogo: 'https://media.api-sports.io/football/teams/529.png',
        awayTeam: 'Athletic Club',
        awayLogo: 'https://media.api-sports.io/football/teams/531.png',
        status: 'LIVE',
        score: '1 - 1',
        minute: "67'",
        leagueId: 'laliga',
      },
      {
        id: 'm3',
        homeTeam: 'Villarreal',
        homeLogo: 'https://media.api-sports.io/football/teams/533.png',
        awayTeam: 'Real Betis',
        awayLogo: 'https://media.api-sports.io/football/teams/543.png',
        status: 'upcoming',
        kickoff: '21:00',
        countdown: '02:15:34',
        leagueId: 'laliga',
      },
      {
        id: 'm4',
        homeTeam: 'Atlético Madrid',
        homeLogo: 'https://media.api-sports.io/football/teams/530.png',
        awayTeam: 'Alavés',
        awayLogo: 'https://media.api-sports.io/football/teams/542.png',
        status: 'upcoming',
        kickoff: '23:15',
        countdown: '04:30:34',
        leagueId: 'laliga',
      },
      {
        id: 'm5',
        homeTeam: 'Arsenal',
        homeLogo: 'https://media.api-sports.io/football/teams/42.png',
        awayTeam: 'Chelsea',
        awayLogo: 'https://media.api-sports.io/football/teams/49.png',
        status: 'FT',
        score: '3 - 1',
        leagueId: 'pl',
      },
      {
        id: 'm6',
        homeTeam: 'Manchester City',
        homeLogo: 'https://media.api-sports.io/football/teams/50.png',
        awayTeam: 'Liverpool',
        awayLogo: 'https://media.api-sports.io/football/teams/40.png',
        status: 'LIVE',
        score: '2 - 2',
        minute: "78'",
        leagueId: 'pl',
      },
      {
        id: 'm7',
        homeTeam: 'Tottenham',
        homeLogo: 'https://media.api-sports.io/football/teams/47.png',
        awayTeam: 'Newcastle',
        awayLogo: 'https://media.api-sports.io/football/teams/34.png',
        status: 'HT',
        score: '0 - 1',
        leagueId: 'pl',
      },
      {
        id: 'm8',
        homeTeam: 'Manchester Utd',
        homeLogo: 'https://media.api-sports.io/football/teams/33.png',
        awayTeam: 'Aston Villa',
        awayLogo: 'https://media.api-sports.io/football/teams/66.png',
        status: 'upcoming',
        kickoff: '20:45',
        countdown: '01:59:34',
        leagueId: 'pl',
      },
    ],
  },
  {
    date: 'Sunday, November 16',
    matches: [
      {
        id: 'm9',
        homeTeam: 'Mallorca',
        homeLogo: 'https://media.api-sports.io/football/teams/798.png',
        awayTeam: 'Rayo Vallecano',
        awayLogo: 'https://media.api-sports.io/football/teams/728.png',
        status: 'upcoming',
        kickoff: '18:30',
        countdown: '23:45:34',
        leagueId: 'laliga',
      },
      {
        id: 'm10',
        homeTeam: 'Everton',
        homeLogo: 'https://media.api-sports.io/football/teams/45.png',
        awayTeam: 'West Ham',
        awayLogo: 'https://media.api-sports.io/football/teams/48.png',
        status: 'upcoming',
        kickoff: '16:00',
        countdown: '21:15:34',
        leagueId: 'pl',
      },
    ],
  },
];

// Calendar SVG icon component
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function LiveScoresPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [activeLeague, setActiveLeague] = useState<string | null>(null);
  const [matchday, setMatchday] = useState(14);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  // Filter matches by selected league
  const getFilteredMatchDays = (): MatchDay[] => {
    if (!activeLeague) return mockMatchDays;
    return mockMatchDays
      .map((day) => ({
        ...day,
        matches: day.matches.filter((m) => m.leagueId === activeLeague),
      }))
      .filter((day) => day.matches.length > 0);
  };

  const filteredDays = getFilteredMatchDays();

  const handleLeagueClick = (leagueId: string) => {
    setActiveLeague(activeLeague === leagueId ? null : leagueId);
  };

  const handleMatchdayPrev = () => {
    setMatchday((prev) => Math.max(1, prev - 1));
  };

  const handleMatchdayNext = () => {
    setMatchday((prev) => Math.min(38, prev + 1));
  };

  const handleMatchClick = (matchId: string) => {
    setSelectedMatch(selectedMatch === matchId ? null : matchId);
  };

  const renderStatusBadge = (match: Match) => {
    switch (match.status) {
      case 'FT':
        return (
          <div className="fx-center-v3">
            <div className="fx-score-v3">{match.score}</div>
            <div className="fx-badge ft">FT</div>
          </div>
        );
      case 'LIVE':
        return (
          <div className="fx-center-v3">
            <div className="fx-live-badge">
              <span className="fx-live-dot"></span> LIVE &nbsp;{match.minute}
            </div>
          </div>
        );
      case 'HT':
        return (
          <div className="fx-center-v3">
            <div className="fx-score-v3">{match.score}</div>
            <div className="fx-badge ht" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>HT</div>
          </div>
        );
      case 'upcoming':
        return (
          <div className="fx-center-v3">
            <div className="fx-time-v3">{match.kickoff}</div>
            <div className="fx-countdown">{match.countdown}</div>
          </div>
        );
      default:
        return null;
    }
  };

  // Simple mock stats for expanded match view
  const renderMatchStats = (match: Match) => {
    if (match.status === 'upcoming') return null;
    return (
      <div style={{
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid var(--brd)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        fontSize: '12px',
        color: 'var(--tx2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, minWidth: '30px', textAlign: 'left' }}>12</span>
          <span style={{ color: 'var(--tx3)', fontSize: '11px' }}>Shots</span>
          <span style={{ fontWeight: 600, minWidth: '30px', textAlign: 'right' }}>8</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, minWidth: '30px', textAlign: 'left' }}>58%</span>
          <span style={{ color: 'var(--tx3)', fontSize: '11px' }}>Possession</span>
          <span style={{ fontWeight: 600, minWidth: '30px', textAlign: 'right' }}>42%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, minWidth: '30px', textAlign: 'left' }}>5</span>
          <span style={{ color: 'var(--tx3)', fontSize: '11px' }}>Corners</span>
          <span style={{ fontWeight: 600, minWidth: '30px', textAlign: 'right' }}>3</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, minWidth: '30px', textAlign: 'left' }}>1</span>
          <span style={{ color: 'var(--tx3)', fontSize: '11px' }}>Yellow Cards</span>
          <span style={{ fontWeight: 600, minWidth: '30px', textAlign: 'right' }}>2</span>
        </div>
      </div>
    );
  };

  return (
    <div className="page" id="page-fixtures">
      {/* League Tabs */}
      <div className="fx-league-tabs">
        {leagues.map((league) => (
          <button
            key={league.id}
            className={`fx-ltab${activeLeague === league.id ? ' active' : ''}`}
            onClick={() => handleLeagueClick(league.id)}
          >
            <img src={league.logo} alt={league.shortName} /> {league.name}
          </button>
        ))}
      </div>

      {/* Matchday Selector */}
      <div className="fx-md-selector">
        <button className="fx-md-arrow" onClick={handleMatchdayPrev}>‹</button>
        <span className="fx-md-current">Matchday {matchday}</span>
        <button className="fx-md-arrow" onClick={handleMatchdayNext}>›</button>
      </div>

      {/* Match Days */}
      {filteredDays.map((day, dayIndex) => (
        <React.Fragment key={dayIndex}>
          {/* Date Header */}
          <div className="fx-date-header">
            <CalendarIcon />
            {day.date}
          </div>

          {/* Matches */}
          <div className="fx-matches">
            {day.matches.map((match) => (
              <div key={match.id}>
                <div
                  className={`fx-row ${
                    match.status === 'FT'
                      ? 'fx-finished'
                      : match.status === 'LIVE'
                      ? 'fx-live'
                      : match.status === 'HT'
                      ? 'fx-live'
                      : 'fx-upcoming'
                  }`}
                  onClick={() => handleMatchClick(match.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="fx-home">
                    <img className="fx-crest" src={match.homeLogo} alt={match.homeTeam} />
                    <span className="fx-name">{match.homeTeam}</span>
                  </div>
                  {renderStatusBadge(match)}
                  <div className="fx-away">
                    <span className="fx-name">{match.awayTeam}</span>
                    <img className="fx-crest" src={match.awayLogo} alt={match.awayTeam} />
                  </div>
                </div>
                {selectedMatch === match.id && renderMatchStats(match)}
              </div>
            ))}
          </div>
        </React.Fragment>
      ))}

      {/* Empty state */}
      {filteredDays.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--tx3)',
          fontSize: '14px',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.3, marginBottom: '12px' }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <div>No matches found for this league</div>
        </div>
      )}
    </div>
  );
}
