import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cricheroesIntegrationService } from '@/features/matches/api/cricheroesIntegrationService';
import { matchService } from '@/features/matches/api/matchService';
import { tournamentService } from '@/features/tournaments/api/tournamentService';
import { CricheroesAdapter } from '@/features/matches/api/adapters/cricheroesAdapter';
import { Tournament } from '@/features/tournaments/types/tournament';
import { Team } from '@/features/teams/types/team';
import { Match } from '@/features/matches/types/match';

// Mocks
vi.mock('@/features/matches/api/matchService', () => ({
    matchService: {
        getMatchById: vi.fn(),
        createMatch: vi.fn(),
        getAllMatches: vi.fn()
    }
}));

vi.mock('@/features/tournaments/api/tournamentService', () => ({
    tournamentService: {
        getAllTournaments: vi.fn(),
        updateTournament: vi.fn()
    }
}));

describe('CricheroesIntegrationService', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('startTournament', () => {
        const mockTournamentId = 'tour_123';
        const mockTeams = [
            { id: 'team_1', name: 'Team 1', members: [], type: 'club' as const, createdAt: '', active: true, sportId: 's1' },
            { id: 'team_2', name: 'Team 2', members: [], type: 'club' as const, createdAt: '', active: true, sportId: 's1' }
        ];

        it('should successfully start a tournament and generate schedule', async () => {
            // Setup
            const mockTournament: Tournament = {
                id: mockTournamentId,
                name: 'Test Tour',
                organizer: 'org_1',
                status: 'upcoming',
                teams: ['team_1', 'team_2'],
                scheduleMode: 'AUTO',
                dates: '2025-01-01 - 2025-01-31',
                location: '',
                description: '',
                bannerUrl: '',
                sportId: 's1'
            };

            vi.mocked(tournamentService.getAllTournaments).mockResolvedValue([mockTournament]);
            vi.mocked(matchService.createMatch).mockResolvedValue({
                id: 'm1',
                sportId: 's1',
                tournamentId: mockTournamentId,
                homeParticipant: { id: 'team_1', name: 'Team 1', score: 0 },
                awayParticipant: { id: 'team_2', name: 'Team 2', score: 0 },
                date: '2025-01-15',
                location: '',
                status: 'created',
                events: [],
                officials: [],
                createdByUserId: 'system'
            });
            vi.mocked(tournamentService.updateTournament).mockResolvedValue({
                ...mockTournament,
                status: 'ongoing'
            });

            // Execute
            const result = await cricheroesIntegrationService.startTournament(mockTournamentId, mockTeams);

            // Assert
            expect(result.success).toBe(true);
            expect(result.matchesGenerated).toBe(1); // 2 teams = 1 match
            expect(tournamentService.updateTournament).toHaveBeenCalledWith(mockTournamentId, expect.objectContaining({ status: 'ongoing' }));
        });

        it('should fail if tournament has fewer than 2 teams', async () => {
            // Setup
            const mockTournament: Tournament = {
                id: mockTournamentId,
                name: 'Test Tour',
                organizer: 'org_1',
                status: 'upcoming',
                teams: ['team_1'],
                scheduleMode: 'AUTO',
                dates: '2025-01-01 - 2025-01-31',
                location: '',
                description: '',
                bannerUrl: '',
                sportId: 's1'
            };

            vi.mocked(tournamentService.getAllTournaments).mockResolvedValue([mockTournament]);

            // Execute
            const result = await cricheroesIntegrationService.startTournament(mockTournamentId, [mockTeams[0]]);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('At least 2 teams');
        });
    });

    describe('validateMatchStart', () => {
        const mockMatchId = 'match_123';
        const mockHomeTeam: Team = { id: 'team_1', name: 'Team 1', sportId: 's1', type: 'club', members: [{ playerId: 'p1', role: 'member', joinedAt: '2025-01-01' }], createdAt: '2025-01-01', active: true };
        const mockAwayTeam: Team = { id: 'team_2', name: 'Team 2', sportId: 's1', type: 'club', members: [{ playerId: 'p2', role: 'member', joinedAt: '2025-01-01' }], createdAt: '2025-01-01', active: true };

        it('should validate a correct match payload', async () => {
            // Setup
            vi.mocked(matchService.getMatchById).mockResolvedValue({
                id: mockMatchId,
                sportId: 's1',
                tournamentId: 'tour_1',
                homeParticipant: { id: 'team_1', name: 'Team 1', score: 0 },
                awayParticipant: { id: 'team_2', name: 'Team 2', score: 0 },
                date: '2025-01-01',
                location: 'Stadium',
                status: 'scheduled',
                events: [],
                officials: [],
                createdByUserId: 'system'
            } as Match);

            // Execute
            const result = await cricheroesIntegrationService.validateMatchStart(mockMatchId, mockHomeTeam, mockAwayTeam);

            // Assert
            expect(result.valid).toBe(true);
        });

        it('should fail validation if teams have no players', async () => {
            // Setup
            vi.mocked(matchService.getMatchById).mockResolvedValue({
                id: mockMatchId,
                sportId: 's1',
                tournamentId: 'tour_1',
                homeParticipant: { id: 'team_1', name: 'Team 1', score: 0 },
                awayParticipant: { id: 'team_2', name: 'Team 2', score: 0 },
                date: '2025-01-01',
                location: '',
                status: 'scheduled',
                events: [],
                officials: [],
                createdByUserId: 'system'
            } as Match);

            const emptyHomeTeam = { ...mockHomeTeam, members: [] };

            // Execute
            const result = await cricheroesIntegrationService.validateMatchStart(mockMatchId, emptyHomeTeam, mockAwayTeam);

            // Assert
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Home team has no players');
        });
    });

    describe('CricheroesAdapter', () => {
        it('should correctly map internal Match to Cricheroes payload', () => {
            const match: Match = { id: 'm1', sportId: 's1', tournamentId: 't1', date: '2025-01-01', location: 'Ground', status: 'scheduled', homeParticipant: { id: 'h1', name: 'Home', score: 0 }, awayParticipant: { id: 'a1', name: 'Away', score: 0 }, events: [], officials: [], createdByUserId: 'system' };
            const home: Team = { id: 'h1', name: 'Home', sportId: 's1', type: 'club', members: [], createdAt: '2025-01-01', active: true };
            const away: Team = { id: 'a1', name: 'Away', sportId: 's1', type: 'club', members: [], createdAt: '2025-01-01', active: true };

            const payload = CricheroesAdapter.toMatchPayload(match, home, away);

            expect(payload.match_id).toBe('m1');
            expect(payload.home_team.team_id).toBe('h1');
            expect(payload.overs_limit).toBe(20); // Default
        });
    });
});
