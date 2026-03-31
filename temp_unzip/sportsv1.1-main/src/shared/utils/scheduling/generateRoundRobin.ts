import { Team } from '@/features/teams/types/team';
import { Match } from '@/features/matches/types/match';

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export function generateRoundRobinMatches(
  teams: Team[],
  tournamentId: string,
  sportId: string = 's1'
): Match[] {
  const matches: Match[] = [];

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: generateId(),
        tournamentId,
        sportId,
        date: new Date().toISOString(), // Default date
        status: 'scheduled',
        stage: 'League',
        homeParticipant: {
          id: teams[i].id,
          name: teams[i].name,
          score: 0
        },
        awayParticipant: {
          id: teams[j].id,
          name: teams[j].name,
          score: 0
        },
        events: [],
        officials: [],
        createdByUserId: 'system',
        location: 'TBD'
      });
    }
  }

  return matches;
}
