export interface BattingStats {
  matches: number;
  runs: number;
  average: number;
  strikeRate: number;
  highestScore: string;
  fifties: number;
  hundreds: number;
}

export interface BowlingStats {
  matches: number;
  wickets: number;
  economy: number;
  average: number;
  bestFigures: string;
  threeWickets: number; // 3w
  fiveWickets: number; // 5w
}

export interface FieldingStats {
  catches: number;
  runOuts: number;
  stumpings: number;
}

export interface FootballStats {
  matches: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cleanSheets: number;
  hatTricks: number;
}

export interface PlayerStats {
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  scoreAccumulated: number; // Generic score
  batting?: BattingStats;
  bowling?: BowlingStats;
  fielding?: FieldingStats;
  football?: FootballStats;
  // Sport specific stats could be extended or stored in a flexible map
  customStats?: Record<string, number | string>;
}

export interface PlayerHistoryEntry {
  matchId: string;
  date: string;
  result: 'win' | 'loss' | 'draw';
  performanceSummary?: string;
}

export interface Trophy {
  id: string;
  tournamentName: string;
  year: number;
  position: 'Winner' | 'Runner-up';
  icon?: string; // Optional custom icon URL, default will be used otherwise
}

export interface Badge {
  id: string;
  name: string;
  icon: string; // Emoji or URL
  description?: string;
  isLocked?: boolean;
}

export interface CurrentTeam {
  teamId: string;
  teamName: string;
  leagueName?: string;
  sinceYear: number;
  logoUrl?: string;
}

export interface PastTeam {
  teamId: string;
  teamName: string;
  leagueName?: string;
  fromYear: number;
  toYear: number;
  logoUrl?: string;
}

export interface Highlight {
  id: string;
  title: string;
  game: string;
  thumbnailUrl: string;
  isVideoUrl: boolean;
  bucket?: string;
  path?: string;
  duration: string;
  date: string;
  views: number;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  date: string;
  bucket?: string;
  path?: string;
}

export interface Player {
  id: string;
  userId?: string; // Link to auth user
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  institutionId?: string;
  primarySportId?: string;
  role?: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket Keeper';
  battingStyle?: string; // e.g., "Right-hand bat"
  bowlingStyle?: string; // e.g., "Right-arm fast"
  jerseyNumber?: number;
  avatarUrl?: string; // Account avatar
  cricketAvatarUrl?: string; // Cricket profile avatar
  location?: string;
  profileViews?: number;
  stats: PlayerStats;
  history: PlayerHistoryEntry[];
  trophies?: Trophy[];
  badges?: Badge[];
  currentTeam?: CurrentTeam;
  pastTeams?: PastTeam[];
  highlights?: Highlight[];
  photos?: Photo[];
  active: boolean;
  status?: 'invited' | 'active' | 'inactive';
}
