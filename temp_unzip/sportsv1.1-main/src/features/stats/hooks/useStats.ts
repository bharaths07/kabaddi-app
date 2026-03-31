import { useMemo } from 'react';
import { useGlobalState } from '@/app/AppProviders';

export type TimeRange = 'all_time' | 'last_12_months' | 'custom';
export type StatFormat = 'all' | 't20' | 'odi' | 'test';

export interface StatsFilters {
  sportId: string;
  format: StatFormat;
  timeRange: TimeRange;
  tournamentId?: string;
  minQualification: boolean;
}

export interface BattingStat {
  playerId: string;
  matches: number;
  innings: number;
  runs: number;
  balls: number;
  average: number;
  strikeRate: number;
  highestScore: number;
  fifties: number;
  hundreds: number;
}

export interface BowlingStat {
  playerId: string;
  matches: number;
  innings: number;
  balls: number;
  overs: string; // Display string like "10.4"
  wickets: number;
  runsConceded: number;
  average: number;
  economy: number;
  bestBowlingWickets: number;
  bestBowlingRuns: number;
  threeWickets: number;
  fiveWickets: number;
}

export interface FieldingStat {
  playerId: string;
  matches: number;
  catches: number;
  runouts: number;
  stumpings: number;
  totalDismissals: number;
}

export interface FootballStat {
  playerId: string;
  matches: number;
  goals: number;
  assists: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
  goalsPerMatch: number;
  cleanSheets: number;
  hatTricks: number;
}

export interface PerformanceTrend {
  date: string;
  value: number;
}

export interface Insight {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  icon?: string;
}

export interface TeamStat {
  teamId: string;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  winPercentage: number;
  totalRunsScored: number;
  totalRunsConceded: number;
  avgRunsScored: number;
  avgRunsConceded: number;
  form: ('W' | 'L' | 'D')[];
  winStreak: number;
}

export const useStats = (filters: StatsFilters) => {
  const { matches } = useGlobalState();

  const filteredMatches = useMemo(() => {
    return matches.filter((m: any) => {
      // 1. Sport Filter
      if (m.sportId !== filters.sportId) return false;

      // 2. Tournament Filter
      if (filters.tournamentId && m.tournamentId !== filters.tournamentId) return false;

      // 3. Time Range Filter (Basic implementation)
      if (filters.timeRange === 'last_12_months') {
        const date = new Date(m.date);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        if (date < oneYearAgo) return false;
      }

      // 4. Format Filter (Mock logic as format is not in data)
      // In real app, check m.format === filters.format

      // Only include completed matches for stats? 
      // User said "Stats MUST be derived from: Match results". 
      // Usually live matches are included in some stats, but for "Trusted" stats, completed is safer.
      // However, for "Live" tab compatibility, maybe we include live? 
      // Let's stick to 'completed' and 'live' (if innings done) for now, but to be safe and consistent, 
      // let's use all matches that have scores. 
      // Actually, user said "Matches include completed games only" for Team Stats.
      // For Player Stats, usually includes live. 
      // Let's filter by status 'completed' | 'live'.
      return m.status === 'completed' || m.status === 'live';
    });
  }, [matches, filters]);

  // Aggregation
  const stats = useMemo<{
    battingStats: BattingStat[];
    bowlingStats: BowlingStat[];
    fieldingStats: FieldingStat[];
    footballStats: FootballStat[];
    teamStats: TeamStat[];
    insights: Insight[];
  }>(() => {
    const battingMap = new Map<string, BattingStat>();
    const bowlingMap = new Map<string, BowlingStat>();
    const fieldingMap = new Map<string, FieldingStat>();
    const footballMap = new Map<string, FootballStat>();
    const teamMap = new Map<string, TeamStat>();

    // Helper to get or init
    const getBatting = (pid: string) => battingMap.get(pid) || {
      playerId: pid, matches: 0, innings: 0, runs: 0, balls: 0, average: 0, strikeRate: 0, highestScore: 0, fifties: 0, hundreds: 0
    };
    const getBowling = (pid: string) => bowlingMap.get(pid) || {
      playerId: pid, matches: 0, innings: 0, balls: 0, overs: '0.0', wickets: 0, runsConceded: 0, average: 0, economy: 0, bestBowlingWickets: 0, bestBowlingRuns: 0, threeWickets: 0, fiveWickets: 0
    };
    const getFielding = (pid: string) => fieldingMap.get(pid) || {
      playerId: pid, matches: 0, catches: 0, runouts: 0, stumpings: 0, totalDismissals: 0
    };
    const getFootball = (pid: string) => footballMap.get(pid) || {
      playerId: pid, matches: 0, goals: 0, assists: 0, minutesPlayed: 0, yellowCards: 0, redCards: 0, goalsPerMatch: 0, cleanSheets: 0, hatTricks: 0
    };
    const getTeam = (tid: string) => teamMap.get(tid) || {
      teamId: tid, matches: 0, wins: 0, losses: 0, draws: 0, winPercentage: 0, totalRunsScored: 0, totalRunsConceded: 0, avgRunsScored: 0, avgRunsConceded: 0,
      form: [] as ('W' | 'L' | 'D')[],
      winStreak: 0
    };

    filteredMatches.forEach((m: any) => {
      const participants = [m.homeParticipant, m.awayParticipant];

      // Team Stats Processing
      if (m.status === 'completed') {
        participants.forEach(p => {
          if (!p.id) return;
          const t = getTeam(p.id);
          t.matches += 1;

          // Result
          if (m.winnerId === p.id) t.wins += 1;
          else if (m.winnerId) t.losses += 1;
          else t.draws += 1; // Tie or Draw

          // Runs (or Goals)
          t.totalRunsScored += p.score || 0;
          // Runs Conceded (Opponent score)
          const opponent = participants.find(op => op.id !== p.id);
          if (opponent) {
            t.totalRunsConceded += opponent.score || 0;
          }

          teamMap.set(p.id, t);
        });
      }

      // Player Stats Processing
      participants.forEach(p => {
        if (p.players) {
          p.players.forEach((ps: any) => {
            // Batting (Cricket)
            if ((ps.balls || 0) > 0 || (ps.runs || 0) > 0) { // Assume batted if faced balls or scored runs (even 0 balls if runout without facing?)
              const b = getBatting(ps.playerId);
              b.matches += 1; // Note: This might overcount matches if player bowled but didn't bat. 
              // But usually aggregated independently. 
              // For simplicity, we increment matches in each domain if they appeared in the list.
              b.innings += 1;
              b.runs += ps.runs || 0;
              b.balls += ps.balls || 0;
              if ((ps.runs || 0) > b.highestScore) b.highestScore = ps.runs || 0;
              if ((ps.runs || 0) >= 100) b.hundreds += 1;
              else if ((ps.runs || 0) >= 50) b.fifties += 1;
              battingMap.set(ps.playerId, b);
            }

            // Bowling (Cricket)
            if (ps.ballsBowled && ps.ballsBowled > 0) {
              const bo = getBowling(ps.playerId);
              bo.matches += 1;
              bo.innings += 1;
              bo.balls += ps.ballsBowled;
              bo.wickets += ps.wickets || 0;
              bo.runsConceded += ps.runsConceded || 0;

              // Best Bowling
              const wkts = ps.wickets || 0;
              const runs = ps.runsConceded || 0;
              if (wkts > bo.bestBowlingWickets || (wkts === bo.bestBowlingWickets && runs < bo.bestBowlingRuns)) {
                bo.bestBowlingWickets = wkts;
                bo.bestBowlingRuns = runs;
              }

              if (wkts >= 5) bo.fiveWickets += 1;
              else if (wkts >= 3) bo.threeWickets += 1;

              bowlingMap.set(ps.playerId, bo);
            }

            // Fielding (Cricket)
            if ((ps.catches && ps.catches > 0) || (ps.runouts && ps.runouts > 0)) {
              const f = getFielding(ps.playerId);
              f.matches += 1; // Again, approx match count logic
              f.catches += ps.catches || 0;
              f.runouts += ps.runouts || 0;
              f.totalDismissals += (ps.catches || 0) + (ps.runouts || 0);
              fieldingMap.set(ps.playerId, f);
            }

            // Football
            if (filters.sportId === 's3' || (ps.goals || 0) > 0 || (ps.assists || 0) > 0 || (ps.minutesPlayed || 0) > 0) {
              // Only process if we have football data or we are in football mode (to show 0 stats)
              if ((ps.goals !== undefined) || (ps.assists !== undefined) || (ps.minutesPlayed !== undefined)) {
                const f = getFootball(ps.playerId);
                f.matches += 1;
                f.goals += ps.goals || 0;
                f.assists += ps.assists || 0;
                f.minutesPlayed += ps.minutesPlayed || 0;
                f.yellowCards += ps.yellowCards || 0;
                f.redCards += ps.redCards || 0;

                // Clean Sheets
                const opponent = participants.find(op => op.id !== p.id);
                if (opponent && (opponent.score || 0) === 0) {
                  f.cleanSheets += 1;
                }

                // Hat Tricks
                if ((ps.goals || 0) >= 3) {
                  f.hatTricks += 1;
                }

                footballMap.set(ps.playerId, f);
              }
            }
          });
        }
      });
    });

    // Final Calculations (Averages, Rates)
    const battingList = Array.from(battingMap.values()).map(b => {
      // Avg: Runs / (Innings - NotOuts). We don't have NotOuts in mock data. 
      // We'll assume Dismissals = Innings for V1 or assume Average = Runs / Innings (gross approximation but safe for now).
      // User said "Derived strictly". Without "wicket" info in batting stats, we can't calculate true average.
      // But `PlayerStats` has `wickets` (bowling). It doesn't say if the batter was out.
      // I will assume Innings = Dismissals for now to avoid Infinity.
      b.average = b.innings > 0 ? parseFloat((b.runs / b.innings).toFixed(2)) : 0;
      b.strikeRate = b.balls > 0 ? parseFloat(((b.runs / b.balls) * 100).toFixed(2)) : 0;
      return b;
    });

    const bowlingList = Array.from(bowlingMap.values()).map(b => {
      const totalOvers = Math.floor(b.balls / 6);
      const balls = b.balls % 6;
      b.overs = `${totalOvers}.${balls}`;

      b.average = b.wickets > 0 ? parseFloat((b.runsConceded / b.wickets).toFixed(2)) : 0;
      // Economy: Runs / Overs. (Overs as float for calculation)
      const oversFloat = b.balls / 6;
      b.economy = oversFloat > 0 ? parseFloat((b.runsConceded / oversFloat).toFixed(2)) : 0;
      return b;
    });

    const footballList = Array.from(footballMap.values()).map(f => {
      f.goalsPerMatch = f.matches > 0 ? parseFloat((f.goals / f.matches).toFixed(2)) : 0;
      return f;
    });

    const teamList = Array.from(teamMap.values()).map(t => {
      t.winPercentage = t.matches > 0 ? parseFloat(((t.wins / t.matches) * 100).toFixed(1)) : 0;
      t.avgRunsScored = t.matches > 0 ? parseFloat((t.totalRunsScored / t.matches).toFixed(1)) : 0;
      t.avgRunsConceded = t.matches > 0 ? parseFloat((t.totalRunsConceded / t.matches).toFixed(1)) : 0;

      // Calculate form from filtered matches
      const teamMatches = filteredMatches
        .filter((m: any) => m.homeParticipant.id === t.teamId || m.awayParticipant.id === t.teamId)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      t.form = teamMatches.slice(0, 5).map((m: any) => {
        if (!m.winnerId) return 'D';
        return m.winnerId === t.teamId ? 'W' : 'L';
      });

      // Calculate Win Streak
      let streak = 0;
      for (const m of teamMatches) {
        if (m.winnerId === t.teamId) streak++;
        else break;
      }
      t.winStreak = streak;

      return t;
    });

    // Generate Insights
    const insights: Insight[] = [];

    // 1. Hot Streaks
    const topStreakTeam = [...teamList].sort((a, b) => b.winStreak - a.winStreak)[0];
    if (topStreakTeam && topStreakTeam.winStreak >= 3) {
      const teamMatch = matches.find((m: any) => m.homeParticipant.id === topStreakTeam.teamId || m.awayParticipant.id === topStreakTeam.teamId);
      const teamName = teamMatch?.homeParticipant.id === topStreakTeam.teamId ? teamMatch.homeParticipant.name : (teamMatch?.awayParticipant.name || 'Team');

      insights.push({
        id: 'streak-' + topStreakTeam.teamId,
        type: 'positive',
        title: `${teamName} is Unstoppable`,
        description: `Currently on a ${topStreakTeam.winStreak} match winning streak.`
      });
    }

    // 2. High Scorers
    const topScorer = [...battingList].sort((a, b) => b.runs - a.runs)[0];
    if (topScorer && topScorer.runs > 200) {
      insights.push({
        id: 'scorer-' + topScorer.playerId,
        type: 'positive',
        title: 'Run Machine',
        description: `Top performer has accumulated ${topScorer.runs} runs this season.`
      });
    }

    const fieldingList = Array.from(fieldingMap.values());

    return {
      battingStats: battingList,
      bowlingStats: bowlingList,
      fieldingStats: fieldingList,
      footballStats: footballList,
      teamStats: teamList,
      insights
    };
  }, [filteredMatches, filters.sportId, matches]);

  const { battingStats, bowlingStats, fieldingStats, footballStats, teamStats, insights } = stats;

  return {
    battingStats,
    bowlingStats,
    fieldingStats,
    footballStats,
    teamStats,
    insights
  };
};
