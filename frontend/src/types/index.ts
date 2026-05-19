// Predict Play Win — Type Definitions

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'super_admin';
  avatar?: string;
  favoriteClub?: string;
  country?: string;
  elo: number;
  initials?: string;
  rank: number;
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  format: '16' | '24';
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  leagueId: string;
  currentMatchday: number;
  totalMatchdays: number;
  groups: Group[];
  createdAt: string;
}

export interface Group {
  id: string;
  name: string; // "A", "B", "C", "D"
  players: GroupPlayer[];
}

export interface GroupPlayer {
  userId: string;
  username: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface League {
  id: string;
  name: string;
  footballLeagueId: number;
  status: 'active' | 'completed' | 'upcoming';
  season: string;
  divisions: Division[];
  matchesPerPair: 1 | 2 | 3;
  promotionSpots: number;
  relegationSpots: number;
}

export interface Division {
  id: string;
  name: string; // "Division 1", "Division 2"
  players: DivisionPlayer[];
}

export interface DivisionPlayer extends GroupPlayer {
  elo: number;
  initials?: string;
  winRate: number;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  status: 'upcoming' | 'live' | 'halftime' | 'finished' | 'suspended';
  minute?: number;
  kickoff: string;
  league: string;
  matchday: number;
}

export interface Team {
  id: number;
  name: string;
  logo: string; // URL to team logo
}

export interface Prediction {
  id: string;
  matchId: string;
  duelId: string;
  userId: string;
  pick: '1' | 'X' | '2' | null;
  isCorrect?: boolean;
  locked: boolean;
}

export interface Duel {
  id: string;
  player1Id: string;
  player2Id: string;
  competitionType: 'tournament' | 'league' | 'challenge';
  competitionId: string;
  matchday: number;
  player1Score: number;
  player2Score: number;
  status: 'upcoming' | 'active' | 'completed';
  matches: Match[];
}

export interface Challenge {
  id: string;
  challengerId: string;
  challengedId: string;
  leagueId: string;
  matchday: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'completed';
  expiresAt: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'challenge' | 'prediction' | 'matchday' | 'broadcast' | 'result';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface EloHistory {
  date: string;
  elo: number;
  initials?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'tournament' | 'league' | 'streak' | 'elo';
  icon: string;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
  target?: number;
}
