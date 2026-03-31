export interface TeamStanding {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  points: number;
  netRunRate: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number;
}
