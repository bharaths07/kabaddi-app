import { Team } from '@/features/teams/types/team';
import { Match } from '@/features/matches/types/match';

const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export function generateKnockoutMatches(
    teams: Team[],
    tournamentId: string,
    sportId: string = 's1'
): Match[] {
    const matches: Match[] = [];
    const n = teams.length;

    if (n < 2) return [];

    // Find nearest power of 2 smaller than or equal to n
    let p = 1;
    while (p * 2 <= n) {
        p *= 2;
    }

    // Number of matches in the first round to reach exactly p teams in the next round
    // knockoutMatches = n - p
    const numFirstRoundMatches = n - p;

    // Shuffle teams for fairness
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

    // 1. Create matches for the first round
    for (let i = 0; i < numFirstRoundMatches; i++) {
        const team1 = shuffledTeams[i * 2];
        const team2 = shuffledTeams[i * 2 + 1];

        matches.push({
            id: generateId(),
            tournamentId,
            sportId,
            date: new Date().toISOString(),
            status: 'scheduled',
            stage: 'Round 1',
            homeParticipant: {
                id: team1.id,
                name: team1.name,
                score: 0
            },
            awayParticipant: {
                id: team2.id,
                name: team2.name,
                score: 0
            },
            events: [],
            officials: [],
            createdByUserId: 'system',
            location: 'TBD'
        });
    }

    // Note: Byes don't need "matches", they just advance.
    // In a real system, we might create "Bye" matches or just handle placeholders.
    // For now, we only generate the ACTIVE matches for the first level.

    return matches;
}
