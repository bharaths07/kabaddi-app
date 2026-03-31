import { CricheroesAdapter } from './adapters/cricheroesAdapter';
import { matchService } from './matchService';
import { tournamentService } from '@/features/tournaments/api/tournamentService';
import { Team } from '@/features/teams/types/team';
import { generateRoundRobinMatches } from '@/shared/utils/scheduling/generateRoundRobin';

/**
 * Service to handle the integration of "Start Match" and "Start Tournament"
 * functionalities, adhering to the Cricheroes-style workflow.
 */
export const cricheroesIntegrationService = {

    /**
     * Initiates the tournament start process.
     * 1. Validates tournament state.
     * 2. Generates schedule if in AUTO mode.
     * 3. Updates status to ONGOING.
     */
    async startTournament(
        tournamentId: string,
        teams: Team[],
        options: { scheduleMode?: 'AUTO' | 'MANUAL' } = {}
    ): Promise<{ success: boolean; message: string; matchesGenerated?: number }> {
        try {
            console.log(`[CricheroesIntegration] Starting tournament ${tournamentId}`);

            // 1. Fetch Tournament
            const tournamentList = await tournamentService.getAllTournaments();
            const tournament = tournamentList.find(t => t.id === tournamentId);

            if (!tournament) {
                throw new Error('Tournament not found');
            }

            // 2. Validate using Adapter
            const payload = CricheroesAdapter.toTournamentPayload(tournament);
            if (payload.teams_count < 2) {
                return { success: false, message: 'At least 2 teams are required to start a tournament.' };
            }

            // 3. Generate Schedule (if AUTO)
            let matchesGenerated = 0;
            if (options.scheduleMode === 'AUTO' || tournament.scheduleMode === 'AUTO') {
                const matches = generateRoundRobinMatches(teams, tournamentId);

                // Persist matches
                for (const match of matches) {
                    await matchService.createMatch(match);
                }
                matchesGenerated = matches.length;
            }

            // 4. Update Status
            await tournamentService.updateTournament(tournamentId, {
                status: 'ongoing',
                startDate: new Date().toISOString()
            });

            console.log(`[CricheroesIntegration] Tournament started successfully. Matches: ${matchesGenerated}`);
            return { success: true, message: 'Tournament started successfully', matchesGenerated };

        } catch (error) {
            console.error('[CricheroesIntegration] Error starting tournament:', error);
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },

    /**
     * Prepares a match for live scoring.
     * Validates requirements before transition to LIVE.
     */
    async validateMatchStart(matchId: string, homeTeam: Team, awayTeam: Team): Promise<{ valid: boolean; errors: string[] }> {
        try {
            const match = await matchService.getMatchById(matchId);
            if (!match) return { valid: false, errors: ['Match not found'] };

            // Use Adapter to validate
            const payload = CricheroesAdapter.toMatchPayload(match, homeTeam, awayTeam);
            const validation = CricheroesAdapter.validateMatchReady(payload);

            if (!validation.valid) {
                console.warn(`[CricheroesIntegration] Match start validation failed:`, validation.errors);
            }

            return validation;

        } catch (error) {
            console.error('[CricheroesIntegration] Validation error:', error);
            return { valid: false, errors: ['Internal validation error'] };
        }
    }
};
