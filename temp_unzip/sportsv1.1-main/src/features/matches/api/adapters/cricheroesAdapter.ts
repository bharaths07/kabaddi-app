import { Match } from '@/features/matches/types/match';
import { Tournament } from '@/features/tournaments/types/tournament';
import { Team } from '@/features/teams/types/team';

// --- Cricheroes External API Interfaces (Simulated) ---

export interface CricheroesPlayer {
    player_id: string;
    name: string;
    role: string;
}

export interface CricheroesTeam {
    team_id: string;
    team_name: string;
    players: CricheroesPlayer[];
}

export interface CricheroesMatchConfig {
    match_id: string;
    tournament_id?: string;
    home_team: CricheroesTeam;
    away_team: CricheroesTeam;
    match_date: string;
    venue: string;
    overs_limit: number;
    ball_type: string;
}

export interface CricheroesTournamentConfig {
    tournament_id: string;
    tournament_name: string;
    organizer_id: string;
    start_date: string;
    end_date: string;
    teams_count: number;
    match_format: string; // T20, ODI, Test
}

// --- Adapter Class ---

export class CricheroesAdapter {
    /**
     * Converts an internal Match object to a Cricheroes-compatible payload.
     * Use this to validate that our match data meets external requirements.
     */
    static toMatchPayload(match: Match, homeTeam: Team, awayTeam: Team): CricheroesMatchConfig {
        return {
            match_id: match.id,
            tournament_id: match.tournamentId,
            home_team: {
                team_id: homeTeam.id,
                team_name: homeTeam.name,
                players: homeTeam.members.map(m => ({
                    player_id: m.playerId,
                    name: 'Unknown', // We would need player lookups here in a real scenario
                    role: m.role
                }))
            },
            away_team: {
                team_id: awayTeam.id,
                team_name: awayTeam.name,
                players: awayTeam.members.map(m => ({
                    player_id: m.playerId,
                    name: 'Unknown',
                    role: m.role
                }))
            },
            match_date: match.date,
            venue: match.location,
            overs_limit: 20, // Default to T20 for now
            ball_type: 'tennis' // Default
        };
    }

    /**
     * Converts an internal Tournament object to a Cricheroes-compatible payload.
     */
    static toTournamentPayload(tournament: Tournament): CricheroesTournamentConfig {
        return {
            tournament_id: tournament.id,
            tournament_name: tournament.name,
            organizer_id: tournament.organizer,
            start_date: tournament.dates.split(' - ')[0] || new Date().toISOString(),
            end_date: tournament.dates.split(' - ')[1] || new Date().toISOString(),
            teams_count: tournament.teams?.length || 0,
            match_format: tournament.matchType || 'T20'
        };
    }

    /**
     * Validates if a match payload is ready for "Cricheroes Start".
     * Checks for critical missing fields.
     */
    static validateMatchReady(payload: CricheroesMatchConfig): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        if (!payload.match_id) errors.push('Missing match_id');
        if (!payload.home_team.team_id) errors.push('Missing home_team_id');
        if (!payload.away_team.team_id) errors.push('Missing away_team_id');
        if (!payload.home_team.players.length) errors.push('Home team has no players');
        if (!payload.away_team.players.length) errors.push('Away team has no players');

        return {
            valid: errors.length === 0,
            errors
        };
    }
}
