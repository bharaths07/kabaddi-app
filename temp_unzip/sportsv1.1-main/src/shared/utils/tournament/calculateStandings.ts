import { Match } from '@/features/matches/types/match';
import { Team } from '@/features/teams/types/team';
import { TeamStanding } from '@/types/tournament';

export function calculateStandings(
  teams: Team[],
  matches: Match[]
): TeamStanding[] {
  const table: Record<string, TeamStanding> = {};

  // Initialize table for all teams
  teams.forEach(team => {
    table[team.id] = {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      points: 0,
      netRunRate: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    };
    // Temporal storage for NRR calculation
    (table[team.id] as any)._totalRunsScored = 0;
    (table[team.id] as any)._totalOversFaced = 0;
    (table[team.id] as any)._totalRunsConceded = 0;
    (table[team.id] as any)._totalOversBowled = 0;
  });

  // Process completed matches
  matches
    .filter(m => m.status === 'completed' || m.status === 'locked')
    .forEach(match => {
      const homeId = match.homeParticipant.id;
      const awayId = match.awayParticipant.id;

      // Ensure teams exist in the table (defensive check)
      const teamA = table[homeId];
      const teamB = table[awayId];

      if (!teamA || !teamB) return;

      teamA.played++;
      teamB.played++;

      // Check winner
      if (match.winnerId === homeId) {
        teamA.won++;
        teamA.points += 2;
        teamB.lost++;
      } else if (match.winnerId === awayId) {
        teamB.won++;
        teamB.points += 2;
        teamA.lost++;
      } else {
        // Tie or Draw (if winnerId is missing but status is completed)
        teamA.tied++;
        teamB.tied++;
        teamA.points += 1;
        teamB.points += 1;
      }

      // -- Multi-sport Stats --

      // Cricket (NRR)
      const isCricket = match.sportId === 's1' || match.sportId === 'cricket';
      if (isCricket) {
        const homeOvers = match.homeParticipant.overs || (match.homeParticipant.balls ? match.homeParticipant.balls / 6 : 0);
        const awayOvers = match.awayParticipant.overs || (match.awayParticipant.balls ? match.awayParticipant.balls / 6 : 0);

        (teamA as any)._totalRunsScored += match.homeParticipant.score;
        (teamA as any)._totalOversFaced += homeOvers;
        (teamA as any)._totalRunsConceded += match.awayParticipant.score;
        (teamA as any)._totalOversBowled += awayOvers;

        (teamB as any)._totalRunsScored += match.awayParticipant.score;
        (teamB as any)._totalOversFaced += awayOvers;
        (teamB as any)._totalRunsConceded += match.homeParticipant.score;
        (teamB as any)._totalOversBowled += homeOvers;
      }

      // Football (GD)
      const isFootball = match.sportId === 's2' || match.sportId === 'football';
      if (isFootball) {
        teamA.goalsFor = (teamA.goalsFor || 0) + match.homeParticipant.score;
        teamA.goalsAgainst = (teamA.goalsAgainst || 0) + match.awayParticipant.score;
        teamB.goalsFor = (teamB.goalsFor || 0) + match.awayParticipant.score;
        teamB.goalsAgainst = (teamB.goalsAgainst || 0) + match.homeParticipant.score;
      }
    });

  // Calculate final NRR and GD
  Object.values(table).forEach(team => {
    const t = team as any;
    if (t._totalOversFaced > 0 && t._totalOversBowled > 0) {
      team.netRunRate = (t._totalRunsScored / t._totalOversFaced) - (t._totalRunsConceded / t._totalOversBowled);
    }
    if (team.goalsFor !== undefined) {
      team.goalDifference = (team.goalsFor || 0) - (team.goalsAgainst || 0);
    }
  });

  const sportId = matches[0]?.sportId;
  const isCricket = sportId === 's1' || sportId === 'cricket';
  const isFootball = sportId === 's2' || sportId === 'football';

  // Return sorted array
  return Object.values(table).sort((a, b) => {
    // 1. Points (Descending)
    if (b.points !== a.points) return b.points - a.points;

    if (isCricket) {
      // 2. Wins (Descending)
      if (b.won !== a.won) return b.won - a.won;
      // 3. NRR (Descending)
      return b.netRunRate - a.netRunRate;
    }

    if (isFootball) {
      // 2. GD (Descending)
      if ((b.goalDifference || 0) !== (a.goalDifference || 0)) {
        return (b.goalDifference || 0) - (a.goalDifference || 0);
      }
      // 3. Goals For (Descending)
      return (b.goalsFor || 0) - (a.goalsFor || 0);
    }

    // Default sorting
    if (b.won !== a.won) return b.won - a.won;
    return a.teamName.localeCompare(b.teamName);
  });
}
