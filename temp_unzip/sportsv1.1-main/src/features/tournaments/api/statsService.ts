import { Match } from '@/features/matches/types/match';
import { Team } from '@/features/teams/types/team';
import { Player } from '@/features/players/types/player';
import { TournamentPlayerStats, LeaderboardCategory } from '../types/stats';

// Helper to get initials
const getTeamCode = (name: string) => {
  if (!name) return 'UNK';
  return name.substring(0, 3).toUpperCase();
};

export const calculateTournamentStats = (
  matches: Match[],
  teams: Team[],
  players: Player[]
): TournamentPlayerStats[] => {
  const statsMap = new Map<string, TournamentPlayerStats>();

  // Helper to initialize or get player stats
  const getStats = (playerId: string, teamId: string): TournamentPlayerStats => {
    if (!statsMap.has(playerId)) {
      const player = players.find(p => p.id === playerId);
      const team = teams.find(t => t.id === teamId);

      statsMap.set(playerId, {
        id: playerId,
        name: player ? `${player.firstName} ${player.lastName}` : 'Unknown Player',
        teamId: teamId,
        teamName: team?.name || 'Unknown Team',
        teamCode: getTeamCode(team?.name || ''),
        avatar: player?.avatarUrl,
        matches: 0,
        innings: 0,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        notOuts: 0,
        highestScore: 0,
        wickets: 0,
        overs: 0,
        ballsBowled: 0,
        runsConceded: 0,
        maidens: 0, // Not tracked in basic stats yet
        bestBowlingWickets: 0,
        bestBowlingRuns: 0,
        catches: 0,
        runOuts: 0,
        stumpings: 0,
        battingAvg: 0,
        battingSr: 0,
        bowlingAvg: 0,
        economy: 0,
        mvpPoints: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        cleanSheets: 0,
        hatTricks: 0
      });
    }
    return statsMap.get(playerId)!;
  };

  matches.forEach(match => {
    if (match.status !== 'completed') return;

    // We process both sides
    const participants = [match.homeParticipant, match.awayParticipant];

    participants.forEach(participant => {
      if (!participant.players) return;

      participant.players.forEach(pStats => {
        const stats = getStats(pStats.playerId, participant.id);
        stats.matches += 1;

        if (match.sportId === 's2' || match.sportId === 'football') {
          // Football Stats
          stats.goals += (pStats.goals || 0);
          stats.assists += (pStats.assists || 0);
          stats.yellowCards += (pStats.yellowCards || 0);
          stats.redCards += (pStats.redCards || 0);

          // Clean Sheets (Team conceded 0 goals)
          const isHome = participant.id === match.homeParticipant.id;
          const opponentScore = isHome ? match.awayParticipant.score : match.homeParticipant.score;
          if (opponentScore === 0) {
            stats.cleanSheets += 1;
          }

          // Hat-Tricks (3+ goals in a match)
          if ((pStats.goals || 0) >= 3) {
            stats.hatTricks += 1;
          }

          // MVP Calc for Football
          const mvp = ((pStats.goals || 0) * 20) +
            ((pStats.assists || 0) * 10) +
            ((pStats.yellowCards || 0) * -5) +
            ((pStats.redCards || 0) * -20);

          stats.mvpPoints += mvp;

        } else if (match.sportId === 's3' || match.sportId === 'kabaddi') {
          // Kabaddi Stats - Use Points
          stats.runs += (pStats.runs || 0);
          stats.mvpPoints += (pStats.runs || 0);
        } else if (match.sportId === 's4' || match.sportId === 'badminton') {
          // Badminton Stats
          stats.goals += (pStats.goals || 0); // Sets won
          stats.mvpPoints += (pStats.goals || 0) * 10;
        } else {
          // Cricket (Default)
          // Cricket Batting
          if ((pStats.runs || 0) > 0 || (pStats.balls || 0) > 0) {
            stats.innings += 1;
            stats.runs += (pStats.runs || 0);
            stats.ballsFaced += (pStats.balls || 0);
            stats.highestScore = Math.max(stats.highestScore, (pStats.runs || 0));

            const isOut = match.events.some(e =>
              e.type === 'wicket' && e.scorerId === pStats.playerId
            );
            if (!isOut) {
              stats.notOuts += 1;
            }

            const foursCount = (pStats.fours !== undefined) ? pStats.fours : match.events.filter(e =>
              e.type === 'delivery' && e.runsScored === 4 && e.scorerId === pStats.playerId
            ).length;

            const sixesCount = (pStats.sixes !== undefined) ? pStats.sixes : match.events.filter(e =>
              e.type === 'delivery' && e.runsScored === 6 && e.scorerId === pStats.playerId
            ).length;

            stats.fours += foursCount;
            stats.sixes += sixesCount;
          }

          // Bowling
          if (pStats.ballsBowled && pStats.ballsBowled > 0) {
            stats.ballsBowled += pStats.ballsBowled;
            stats.wickets += (pStats.wickets || 0);
            stats.runsConceded += (pStats.runsConceded || 0);
            stats.overs = Math.floor(stats.ballsBowled / 6) + (stats.ballsBowled % 6) / 10;

            if ((pStats.wickets || 0) > stats.bestBowlingWickets) {
              stats.bestBowlingWickets = (pStats.wickets || 0);
              stats.bestBowlingRuns = pStats.runsConceded || 0;
            } else if ((pStats.wickets || 0) === stats.bestBowlingWickets) {
              if ((pStats.runsConceded || 0) < stats.bestBowlingRuns) {
                stats.bestBowlingRuns = pStats.runsConceded || 0;
              }
            }
          }

          // Fielding
          stats.catches += (pStats.catches || 0);
          stats.runOuts += (pStats.runouts || 0);

          // Calculate MVP (Cricket)
          stats.mvpPoints += (pStats.runs || 0) +
            ((pStats.wickets || 0) * 20) +
            ((pStats.catches || 0) * 10) +
            ((pStats.runouts || 0) * 10);
        }

      });
    });
  });

  // Calculate Derived Stats
  return Array.from(statsMap.values()).map(s => {
    // Batting Avg
    const dismissals = s.innings - s.notOuts;
    s.battingAvg = dismissals > 0 ? s.runs / dismissals : s.runs; // If never out, avg = runs (classic cricket convention varies, usually undefined, but for sorting we use runs)

    // Strike Rate
    s.battingSr = s.ballsFaced > 0 ? (s.runs / s.ballsFaced) * 100 : 0;

    // Bowling Avg
    s.bowlingAvg = s.wickets > 0 ? s.runsConceded / s.wickets : 0;

    // Economy
    const trueOvers = s.ballsBowled / 6;
    s.economy = trueOvers > 0 ? s.runsConceded / trueOvers : 0;

    return s;
  });
};

export const sortLeaderboard = (
  data: TournamentPlayerStats[],
  category: LeaderboardCategory
): TournamentPlayerStats[] => {
  const sorted = [...data];

  switch (category) {
    case 'BAT':
      return sorted.sort((a, b) => {
        if (b.runs !== a.runs) return b.runs - a.runs;
        if (b.battingAvg !== a.battingAvg) return b.battingAvg - a.battingAvg;
        return b.battingSr - a.battingSr;
      });
    case 'BOWL':
      return sorted.sort((a, b) => {
        if (b.wickets !== a.wickets) return b.wickets - a.wickets;
        if (a.bowlingAvg !== b.bowlingAvg) return a.bowlingAvg - b.bowlingAvg; // Lower better
        return a.economy - b.economy; // Lower better
      });
    case 'FIELD':
      return sorted.sort((a, b) => {
        const ptsA = a.catches + a.runOuts + a.stumpings;
        const ptsB = b.catches + b.runOuts + b.stumpings;
        if (ptsB !== ptsA) return ptsB - ptsA;
        return b.catches - a.catches;
      });
    case 'GOALS':
      return sorted.sort((a, b) => {
        if (b.goals !== a.goals) return b.goals - a.goals;
        return b.assists - a.assists;
      });
    case 'ASSISTS':
      return sorted.sort((a, b) => {
        if (b.assists !== a.assists) return b.assists - a.assists;
        return b.goals - a.goals;
      });
    case 'MVP':
      return sorted.sort((a, b) => b.mvpPoints - a.mvpPoints);
    default:
      return sorted;
  }
};

export interface StatFilters {
  season?: string;
  region?: string;
  sportId?: string;
}

export const filterMatchesForStats = (
  matches: Match[],
  filters: StatFilters
): Match[] => {
  return matches.filter(match => {
    // Sport Filter
    if (filters.sportId && match.sportId !== filters.sportId) return false;

    // Region Filter (using location)
    if (filters.region && !match.location?.toLowerCase().includes(filters.region.toLowerCase())) return false;

    // Season Filter (Year from date)
    if (filters.season) {
      const matchYear = new Date(match.date).getFullYear().toString();
      if (matchYear !== filters.season) return false;
    }

    return true;
  });
};
