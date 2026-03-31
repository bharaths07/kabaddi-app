export interface TournamentPlayerStats {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  teamCode: string;
  avatar?: string;
  
  matches: number;
  
  // Batting
  innings: number;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  notOuts: number;
  highestScore: number;
  
  // Bowling
  wickets: number;
  overs: number;
  ballsBowled: number;
  runsConceded: number;
  maidens: number;
  bestBowlingWickets: number;
  bestBowlingRuns: number;
  
  // Fielding
  catches: number;
  runOuts: number;
  stumpings: number;
  
  // Derived
  battingAvg: number;
  battingSr: number;
  bowlingAvg: number;
  economy: number;
  
  // MVP
  mvpPoints: number;

  // Football
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cleanSheets: number;
  hatTricks: number;
}

export type LeaderboardCategory = 'BAT' | 'BOWL' | 'FIELD' | 'MVP' | 'GOALS' | 'ASSISTS';
