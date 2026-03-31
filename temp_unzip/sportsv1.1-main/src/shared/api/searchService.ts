import { supabase } from '@/shared/lib/supabase';
import { Match } from '@/features/matches/types/match';
import { Team } from '@/features/teams/types/team';
import { Tournament } from '@/features/tournaments/types/tournament';

export interface SearchResults {
    matches: Match[];
    teams: Team[];
    tournaments: Tournament[];
}

export const searchService = {
    async globalSearch(term: string, limit: number = 5): Promise<SearchResults> {
        if (!term || term.trim().length < 2) {
            return { matches: [], teams: [], tournaments: [] };
        }

        const cleanTerm = term.trim();
        const ilikeTerm = `%${cleanTerm}%`;

        try {
            // Check for mock mode implicitly via supabase response or env
            // If we are in mock mode, this will return empty or throw if not handled
            const [matchesRes, teamsRes, tournamentsRes] = await Promise.all([
                supabase.from('matches').select('*').or(`location.ilike.${ilikeTerm},status.ilike.${ilikeTerm}`).limit(limit),
                supabase.from('teams').select('*').ilike('name', ilikeTerm).limit(limit),
                supabase.from('tournaments').select('*').or(`name.ilike.${ilikeTerm},location.ilike.${ilikeTerm}`).limit(limit)
            ]);

            // Note: Since 'matches' table structure for home/away name might be complex 
            // (JSONB or joined), basic ilike might not catch match names if they aren't stored 
            // as top-level searchable columns. For now, we search location/status/description.

            return {
                matches: (matchesRes.data || []) as Match[],
                teams: (teamsRes.data || []) as Team[],
                tournaments: (tournamentsRes.data || []) as Tournament[]
            };
        } catch (error) {
            console.error('[SearchService] Search failed:', error);
            return { matches: [], teams: [], tournaments: [] };
        }
    }
};
