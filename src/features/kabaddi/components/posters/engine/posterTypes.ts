// Every poster template receives one of these as props

export interface MatchResult {
  type:        "match_victory";
  homeTeam:    TeamInfo;
  guestTeam:   TeamInfo;
  homeScore:   number;
  guestScore:  number;
  winner:      "home" | "guest" | "tie";
  tournament:  string;
  stage:       string;         // "League" | "Semi Final" | "Final"
  venue:       string;
  date:        string;
  totalRaids:  number;
  allOuts:     number;
  home:        TeamInfo;
  guest:       TeamInfo;
}

export interface PlayerMatchStats {
  type:        "man_of_match";
  name:        string;
  jersey:      number;
  teamName:    string;
  teamColor:   string;
  teamAbbr:    string;
  raidPts:     number;
  tacklePts:   number;
  totalPts:    number;
  raids:       number;
  superRaids:  number;
  tackles:     number;
  bonusPts:    number;
  isManOfMatch: boolean;
  matchContext: string;   // "vs Rangers • KPL 2026"
}

export interface PlayerCareerStats {
  type:        "player_performance" | "trading_card";
  name:        string;
  jersey:      number;
  position:    "Raider" | "Defender" | "All-rounder";
  teamName:    string;
  teamColor:   string;
  teamAbbr:    string;
  matches:     number;
  raidPts:     number;
  tacklePts:   number;
  winRate:     number;
  superRaids:  number;
  superTackles: number;
  joinedDate:  string;
  awards:      string[];
  seasonRank:  string;     // "#1 Raider in KPL 2026"
  photoUrl?:   string;
}

export interface TeamInfo {
  name:    string;
  abbr:    string;
  color:   string;
  captain: string;
  location: string;
  players: PlayerSlot[];
  matchesPlayed: number;
}

export interface PlayerSlot {
  name:    string;
  jersey:  number;
  role:    "Raider" | "Defender" | "All-rounder";
  isCaptain: boolean;
}

export interface SquadRoster {
  type:        "squad_roster";
  team:        TeamInfo;
  players:     PlayerSlot[];
}

export interface TeamAnnouncement {
  type:        "team_announcement";
  team:        TeamInfo;
}

export interface CareerStats {
  type:        "career_stats";
  player:      PlayerCareerStats;
  stats:       Array<{ label: string; value: string | number }>;
}

export interface SeasonHighlight {
  type:        "season_highlight";
  team:        TeamInfo;
  highlights:  string[];
}

export type PosterData = MatchResult | PlayerMatchStats | PlayerCareerStats | SquadRoster | TeamAnnouncement | CareerStats | SeasonHighlight;

export type PosterStyle = "career" | "season" | "card";
export type PosterRatio = "story" | "square" | "landscape";

export interface PosterDimensions {
  width:  number;
  height: number;
}

export const POSTER_SIZES: Record<PosterRatio, PosterDimensions> = {
  story:     { width: 1080, height: 1920 },  // 9:16 Instagram Story
  square:    { width: 1080, height: 1080 },  // 1:1 Feed
  landscape: { width: 1200, height: 900  },  // 4:3 WhatsApp
};