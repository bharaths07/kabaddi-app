import { Team } from '@/features/teams/types/team';
import { Match } from '@/features/matches/types/match';
import { generateRoundRobinMatches } from './generateRoundRobin';

export function generateGroupsMatches(
    teams: Team[],
    tournamentId: string,
    numGroups: number,
    sportId: string = 's1'
): Match[] {
    if (teams.length < 2 || numGroups < 1) return [];

    // Shuffle teams
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

    // Divide into groups
    const groups: Team[][] = Array.from({ length: numGroups }, () => []);
    shuffledTeams.forEach((team, index) => {
        groups[index % numGroups].push(team);
    });

    // Generate round robin for each group
    let allMatches: Match[] = [];
    groups.forEach((groupTeams, groupIndex) => {
        const groupName = String.fromCharCode(65 + groupIndex); // Group A, B, C...
        const groupMatches = generateRoundRobinMatches(groupTeams, tournamentId, sportId);

        // Tag matches with group name
        groupMatches.forEach(m => {
            m.stage = `Group ${groupName}`;
        });

        allMatches = [...allMatches, ...groupMatches];
    });

    return allMatches;
}
