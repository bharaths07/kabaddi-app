export type MatchStatus = 'draft' | 'live' | 'completed' | 'locked' | 'cancelled' | 'scheduled' | 'created';


export interface ScoreEvent {
  id: string;
  timestamp: string; // ISO time
  matchTime?: string; // Game clock time (e.g. "45:00")
  scorerId?: string; // Player who scored
  teamId?: string; // Team that scored

  // -- Detailed Scoring Fields --
  type: 'delivery' | 'extra' | 'wicket' | 'milestone' | 'period_start' | 'period_end' | 'info' | 'goal' | 'card' | 'substitution' | 'basket' | 'foul' | 'timeout';

  // Context
  batterId?: string;      // The striker
  nonStrikerId?: string;  // The partner
  bowlerId?: string;      // The bowler

  // Football/Basketball Context
  cardType?: 'yellow' | 'red';
  assistId?: string;
  playerInId?: string;    // Substitution
  playerOutId?: string;   // Substitution
  foulType?: string;      // Basketball/Football fouls

  // Outcome
  runsScored?: number;    // Runs off the bat (0-6)
  extras?: {
    type: 'wide' | 'no_ball' | 'bye' | 'leg_bye' | 'penalty';
    runs: number;        // Runs from the extra itself
  };
  isWicket?: boolean;
  dismissal?: {
    type: 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 'hit_wicket' | 'retired' | 'other';
    fielderId?: string;  // Who took the catch/runout
    batsmanId?: string;   // Who got out
  };

  // Metadata
  overNumber?: number;
  ballInOver?: number;
  period?: number;        // Half (1, 2) or Quarter (1, 2, 3, 4)

  // Legacy/Generic fields
  points: number; // For basketball (1, 2, 3) or legacy total
  description: string;
}

export interface MatchLiveState {
  // Cricket specific
  strikerId?: string;
  nonStrikerId?: string;
  bowlerId?: string;
  currentOver: number;
  ballsInCurrentOver: number;

  // General sport metadata
  currentPeriod: number; // 1 (1st Half/Quarter), 2, etc.
  clockTime: string; // "MM:SS"
  isPaused: boolean;
  lastEventTimestamp?: string;
}

export interface MatchOfficial {
  userId: string;
  role: 'referee' | 'umpire' | 'scorer' | 'judge';
}

export interface PlayerStats {
  playerId: string;
  // Cricket
  runs?: number;
  balls?: number; // Balls faced
  wickets?: number; // Wickets taken
  ballsBowled?: number;
  runsConceded?: number;
  catches?: number;
  runouts?: number;
  fours?: number;
  sixes?: number;

  // Football / General
  goals?: number;
  assists?: number;
  minutesPlayed?: number;
  yellowCards?: number;
  redCards?: number;

  // Basketball
  points?: number;
  fouls?: number;
}

export interface MatchParticipant {
  id: string; // Team ID or Player ID
  name: string;
  score: number; // Current score
  wickets?: number; // Added for Cricket
  balls?: number;   // Added for Cricket
  overs?: number;   // Added for Cricket
  result?: 'win' | 'loss' | 'draw';
  players?: PlayerStats[]; // Added for detailed stats tracking
  squad?: {
    playerIds: string[];
    captainId?: string;
    wicketKeeperId?: string;
    goalkeeperId?: string; // Football
  };
}

export interface Toss {
  winnerTeamId: string;
  decision: 'BAT' | 'BOWL' | 'KICK_OFF' | 'DEFEND_GOAL';
}

export interface Match {
  id: string;
  sportId: string;
  tournamentId?: string; // Link to Tournament
  stage?: string; // e.g., "Group Stage", "Final"
  homeParticipant: MatchParticipant;
  awayParticipant: MatchParticipant;
  currentBattingTeamId?: string; // Tracks who is currently batting
  toss?: Toss;
  liveState?: MatchLiveState; // Tracks striker, non-striker, bowler, over count
  date: string; // Scheduled start time
  actualStartTime?: string;
  actualEndTime?: string;
  location: string;
  status: MatchStatus;
  events: ScoreEvent[];
  officials: MatchOfficial[];
  winnerId?: string;
  createdByUserId: string;
}
