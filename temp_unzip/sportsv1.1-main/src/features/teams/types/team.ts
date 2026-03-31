export type TeamType = 'club' | 'corporate' | 'street' | 'school' | 'other';

export interface TeamMember {
  playerId: string;
  role: 'captain' | 'vice-captain' | 'member';
  joinedAt: string;
}

export interface TeamStats {
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  goalsScored?: number; // For football
  goalsConceded?: number; // For football
  goalDifference?: number; // For football
  runsScored?: number; // For cricket
  wicketsLost?: number; // For cricket
  nrr?: number; // Net Run Rate for cricket
  formGuide: ('W' | 'L' | 'D')[];
}

export interface Team {
  id: string;
  name: string;
  sportId: string;
  ownerId?: string;
  institutionId?: string;
  type: TeamType;
  members: TeamMember[];
  captainId?: string;
  coach?: string;
  about?: string;
  achievements?: {
    title: string;
    season: string;
    tournamentName: string;
  }[];
  logoUrl?: string;
  createdAt: string;
  foundedYear?: number;
  lastMatchAt?: string;
  active: boolean;
  location?: string;
  stats?: TeamStats;
}
