/* Kabaddi Match Types and Interfaces */

export type KabaddiFormat = 'thirty' | 'forty' | 'fifty' // in minutes
export type RaidResult = 'success' | 'fail' | 'bonus'
export type KabaddiSport = 'kabaddi' // MVP focuses only on Kabaddi

/**
 * Player Profile in a Kabaddi Match
 */
export interface KabaddiPlayer {
  id: string
  userId: string
  name: string
  role: 'raider' | 'defender' | 'all-rounder'
  jerseyNumber: number
  isActive: boolean
  stats: KabaddiPlayerStats
}

/**
 * Kabaddi Player Statistics
 */
export interface KabaddiPlayerStats {
  raids: number
  raidPoints: number
  raidSuccessRate: number // 0-100%
  tackles: number
  tacklePoints: number
  touchPoints: number
  bonusPointsContributed: number
  matchesPlayed: number
  totalPoints: number
}

/**
 * Team Information
 */
export interface KabaddiTeam {
  id: string
  name: string
  city: string
  coach: string
  players: KabaddiPlayer[]
  teamStats: KabaddiTeamStats
}

/**
 * Team Statistics
 */
export interface KabaddiTeamStats {
  matchesPlayed: number
  wins: number
  losses: number
  draws: number
  totalPoints: number
  avgPointsPerMatch: number
  winRate: number
}

/**
 * Raid Event - Core Action in Kabaddi
 */
export interface RaidEvent {
  id: string
  raidNumber: number
  raider: KabaddiPlayer
  defendingTeam: KabaddiTeam
  pointsScored: number // 0, 1, 2, 3, 4, 5
  touchPoints: number // 0-4 defenders touched
  allOut: boolean
  success: boolean
  timestamp: Date
  videoUrl?: string // For future implementation
}

/**
 * Tackle Event - Defense Action
 */
export interface TackleEvent {
  id: string
  raidNumber: number
  defenders: KabaddiPlayer[]
  raider: KabaddiPlayer
  pointsEarned: number
  timestamp: Date
}

/**
 * Bonus Point Event
 */
export interface BonusPointEvent {
  id: string
  raidNumber: number
  team: 'home' | 'guest'
  pointsEarned: number
  reason: 'line' | 'allOut'
  timestamp: Date
}

/**
 * Main Kabaddi Match Interface
 */
export interface KabaddiMatch {
  id: string
  homeTeam: KabaddiTeam
  guestTeam: KabaddiTeam

  // Match Format
  format: KabaddiFormat
  halfDuration: number // seconds (duration / 2)
  totalDuration: number // seconds

  // Scoring
  homeScore: number
  guestScore: number
  homeBonus: number
  guestBonus: number

  // Time & Status
  startTime: Date
  endTime?: Date
  currentTime: number // seconds elapsed
  currentPeriod: 'first' | 'second' | 'halftime'
  timeRemaining: number
  status: 'scheduled' | 'live' | 'paused' | 'completed'

  // Raids
  raidNumber: number
  currentRaider: 'home' | 'guest'
  raidHistory: RaidEvent[]

  // Events
  events: Array<RaidEvent | TackleEvent | BonusPointEvent>

  // Venue & Details
  venue: string
  city: string
  date: Date
  referee?: string
  umpire?: string

  // Tournament Context
  tournamentId?: string
  isLiveMatch: boolean
}

/**
 * Live Scorer State (Component State)
 */
export interface LiveScorerState {
  homeScore: number
  guestScore: number
  homeBonus: number
  guestBonus: number
  currentRaid: number
  timeElapsed: number
  isRunning: boolean
  currentRaider: 'home' | 'guest'
  raidHistory: RaidEvent[]
}

/**
 * Scoring Update - For WebSocket updates
 */
export interface ScoringUpdate {
  matchId: string
  timestamp: Date
  event: RaidEvent | TackleEvent | BonusPointEvent
  currentState: {
    homeScore: number
    guestScore: number
    currentRaid: number
  }
}

/**
 * Match Summary
 */
export interface KabaddiMatchSummary {
  matchId: string
  homeTeam: string
  guestTeam: string
  finalScore: {
    home: number
    guest: number
  }
  winnerTeam: string
  duration: number // seconds
  totalRaids: number
  totalTackles: number
  manOfTheMatch?: KabaddiPlayer
  topRaider?: {
    player: KabaddiPlayer
    raids: number
    points: number
  }
  topDefender?: {
    player: KabaddiPlayer
    tackles: number
    points: number
  }
  createdAt: Date
}

/**
 * Leaderboard Entry
 */
export interface KabaddiLeaderboardEntry {
  rank: number
  player: KabaddiPlayer
  stat: 'raids' | 'raidPoints' | 'tackles' | 'totalPoints'
  value: number
  matchesPlayed: number
  team: KabaddiTeam
}

/**
 * Tournament Leaderboard
 */
export interface KabaddiTournamentStanding {
  rank: number
  team: KabaddiTeam
  matchesPlayed: number
  wins: number
  losses: number
  points: number
  pointsFor: number
  pointsAgainst: number
  pointDifference: number
}

/**
 * API Request/Response Types
 */

export interface CreateMatchRequest {
  homeTeamId: string
  guestTeamId: string
  format: KabaddiFormat
  venue: string
  city: string
  date: Date
  homeSquad: string[] // Player IDs
  guestSquad: string[] // Player IDs
}

export interface UpdateScoringRequest {
  matchId: string
  action: 'raid' | 'tackle' | 'bonus'
  team: 'home' | 'guest'
  points: number
  raidNumber: number
  playerId?: string
}

export interface RaidStatistic {
  raidNumber: number
  raider: KabaddiPlayer
  pointsScored: number
  defenders: KabaddiPlayer[]
  success: boolean
  timestamp: Date
}

/**
 * Kabaddi Rules Constant
 */
export const KABADDI_RULES = {
  TOUCH_POINT_VALUE: 1,
  RAID_POINT_MIN: 1,
  RAID_POINT_MAX: 5,
  TACKLE_POINT_VALUE: 1,
  BONUS_POINT_THRESHOLD: 30, // Points required to earn bonus
  BONUS_POINT_VALUE: 1,
  DEFENDERS_FOR_ALLOUT: 0, // All defenders out
  HALF_DURATION_30_MIN: 30 * 60, // seconds
  HALF_DURATION_40_MIN: 40 * 60, // seconds
  HALF_DURATION_50_MIN: 50 * 60, // seconds
} as const

/**
 * Helper function to calculate raid points
 */
export const calculateRaidPoints = (
  touchCount: number,
  defenderCount: number,
  defendersOut: number
): number => {
  if (defendersOut === defenderCount) {
    const base = Math.min(touchCount, 5)
    return base + 2
  }
  return Math.min(touchCount, 5) // Max 5 points
}

/**
 * Helper to get match duration in seconds
 */
export const getMatchDuration = (format: KabaddiFormat): number => {
  switch (format) {
    case 'thirty':
      return KABADDI_RULES.HALF_DURATION_30_MIN * 2
    case 'forty':
      return KABADDI_RULES.HALF_DURATION_40_MIN * 2
    case 'fifty':
      return KABADDI_RULES.HALF_DURATION_50_MIN * 2
    default:
      return KABADDI_RULES.HALF_DURATION_40_MIN * 2
  }
}

/**
 * Helper to format time
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Tournament Types
 */

export interface Tournament {
  id: string;
  name: string;
  venue: string;
  level: string;
  status: "Registration Open" | "Live" | "Upcoming" | "Completed";
  startDate: string;
  endDate: string;
  totalTeams: number;
  confirmedTeams: number;
  totalMatches: number;
  completedMatches: number;
  joinCode: string;
}

export interface TournamentTeam {
  id: number;
  name: string;
  color: string;
  captain: string;
  players: number;
  status: "confirmed" | "invited" | "pending";
}

export interface TournamentFixture {
  id: number;
  round: string;
  teamA: string;
  teamB: string;
  date: string;
  time: string;
  court: string;
  scorer: string | null;
  scorerStatus: "confirmed" | "pending" | "unassigned";
  status: "scheduled" | "live" | "completed";
  result?: string;
}

export interface TournamentStandingRow {
  rank: number;
  team: string;
  color: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  diff: string;
}

export interface TournamentPlayerStat {
  name: string;
  team: string;
  value: number;
}
