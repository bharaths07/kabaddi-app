import { create } from 'zustand';
import { TEAMS, Team } from '../data/teams';
import { PLAYERS, Player } from '../data/players';
import { supabase } from '../shared/lib/supabase';

interface KabaddiState {
    teams: Team[];
    players: Player[];
    loading: boolean;
    isSearchOpen: boolean;
    activeTeamSlug: string | null;
    activePlayerSlug: string | null;
    
    // Actions
    fetchTeams: () => Promise<void>;
    fetchTeamBySlug: (slug: string) => Promise<Team | null>;
    fetchPlayersByTeamSlug: (teamSlug: string) => Promise<Player[]>;
    fetchPlayerBySlug: (slug: string) => Promise<Player | null>;
    setActiveTeamSlug: (slug: string | null) => void;
    setActivePlayerSlug: (slug: string | null) => void;
    setSearchOpen: (open: boolean) => void;
    claimPlayer: (playerSlug: string, userId: string) => Promise<boolean>;
    searchEntities: (query: string) => Promise<{ type: 'team' | 'player' | 'tournament', id: string, name: string, image?: string, slug: string, subtitle?: string }[]>;
}

// Simulate network latency for realism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useKabaddiStore = create<KabaddiState>((set, get) => ({
    teams: [],
    players: [],
    loading: false,
    isSearchOpen: false,
    activeTeamSlug: null,
    activePlayerSlug: null,

    fetchTeams: async () => {
        set({ loading: true });
        const { data, error } = await supabase.from('teams').select('*');
        if (data) {
            const mapped = data.map((t: any) => ({
                id: t.id,
                slug: t.slug || t.id,
                name: t.name,
                shortName: t.short || t.name.slice(0, 3).toUpperCase(),
                logo: t.logo || `https://api.dicebear.com/7.x/shapes/svg?seed=${t.id}&backgroundColor=1e293b`,
                city: t.city || 'Kabaddi Hub',
                primaryColor: t.color || '#1e293b',
                stats: { matches: 0, wins: 0, losses: 0, draws: 0, points: 0, rank: 0 }
            })) as any[];
            set({ teams: mapped });
        }
        set({ loading: false });
    },

    fetchTeamBySlug: async (slug: string) => {
        set({ loading: true });
        const { data, error } = await supabase.from('teams').select('*').or(`slug.eq.${slug},id.eq.${slug}`).maybeSingle();
        set({ loading: false });
        if (data) {
            return {
                id: data.id,
                slug: data.slug || data.id,
                name: data.name,
                shortName: data.short || data.name.slice(0, 3).toUpperCase(),
                logo: data.logo || `https://api.dicebear.com/7.x/shapes/svg?seed=${data.id}&backgroundColor=1e293b`,
                city: data.city || 'Kabaddi Hub',
                primaryColor: data.color || '#1e293b',
                stats: { matches: 0, wins: 0, losses: 0, draws: 0, points: 0, rank: 0 }
            } as any;
        }
        return null;
    },

    fetchPlayersByTeamSlug: async (teamSlug: string) => {
        set({ loading: true });
        // First find team
        const { data: team } = await supabase.from('teams').select('id').or(`slug.eq.${teamSlug},id.eq.${teamSlug}`).maybeSingle();
        if (!team) {
            set({ loading: false });
            return [];
        }

        const { data, error } = await supabase.from('players').select('*').eq('team_id', team.id);
        if (data) {
            const mapped = data.map((p: any) => ({
                id: p.id,
                slug: p.slug || p.id,
                name: p.name,
                number: p.number || 0,
                role: (p.role || 'Player').toLowerCase(),
                teamSlug,
                avatar: p.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
                powerScore: 70
            })) as any[];
            
            const { players } = get();
            const merged = [...players];
            mapped.forEach(mp => {
                if (!merged.find(ext => ext.id === mp.id)) merged.push(mp);
            });
            set({ players: merged, loading: false });
            return mapped;
        }

        set({ loading: false });
        return [];
    },

    fetchPlayerBySlug: async (slug: string) => {
        const { players } = get();
        const cached = players.find(p => p.slug === slug || p.id === slug);
        if (cached) return cached;

        set({ loading: true });
        const { data } = await supabase.from('players').select('*, teams(slug)').or(`slug.eq.${slug},id.eq.${slug}`).maybeSingle();
        set({ loading: false });

        if (data) {
            const player = {
                id: data.id,
                slug: data.slug || data.id,
                name: data.name,
                number: data.number || 0,
                role: (data.role || 'Player').toLowerCase(),
                teamSlug: (data.teams as any)?.slug || 'pro-kabaddi',
                avatar: data.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id}`,
                powerScore: 75
            } as any;
            set((state) => ({ players: [...state.players, player] }));
            return player;
        }
        return null;
    },


    setActiveTeamSlug: (slug) => set({ activeTeamSlug: slug }),
    setActivePlayerSlug: (slug) => set({ activePlayerSlug: slug }),
    setSearchOpen: (open) => set({ isSearchOpen: open }),

    claimPlayer: async (playerSlug: string, userId: string) => {
        set({ loading: true });
        await delay(800); // simulate verification
        
        const { players } = get();
        const pIdx = players.findIndex(p => p.slug === playerSlug);
        if (pIdx >= 0) {
            const updated = [...players];
            updated[pIdx] = { ...updated[pIdx], is_claimed: true, user_id: userId };
            set({ players: updated, loading: false });
            return true;
        }
        
        set({ loading: false });
        return false;
    },

    searchEntities: async (query: string) => {
        if (!query || query.trim().length === 0) return [];
        const q = query.toLowerCase();
        
        const results: any[] = [];
        
        // 1. SEARCH TEAMS
        try {
            const { data: dbTeams } = await supabase
                .from('teams')
                .select('id, name, slug, color, city')
                .ilike('name', `%${q}%`)
                .limit(5);

            if (dbTeams) {
                dbTeams.forEach((team: any) => {
                    results.push({ 
                        type: 'team', 
                        id: team.id, 
                        name: team.name, 
                        slug: `/${team.slug || team.id}`, 
                        image: `https://api.dicebear.com/7.x/shapes/svg?seed=${team.id}&backgroundColor=1e293b`, 
                        subtitle: `Franchise • ${team.city || 'Kabaddi Hub'}` 
                    });
                });
            }
        } catch (e) { console.warn("Team search failed, likely schema mismatch:", e); }

        // 2. SEARCH PLAYERS
        try {
            const { data: dbPlayers } = await supabase
                .from('players')
                .select('id, name, slug, role, photo')
                .ilike('name', `%${q}%`)
                .limit(5);

            if (dbPlayers) {
                dbPlayers.forEach((player: any) => {
                    results.push({ 
                        type: 'player', 
                        id: player.id, 
                        name: player.name, 
                        slug: `/players/${player.slug || player.id}`, 
                        image: player.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.id}`, 
                        subtitle: `${player.role || 'Player'} • Verified Pro` 
                    });
                });
            }
        } catch (e) { console.warn("Player search failed, likely schema mismatch:", e); }


        // 3. SEARCH TOURNAMENTS
        const { data: dbTournaments } = await supabase
            .from('tournaments')
            .select('id, name, city_state')
            .or(`name.ilike.%${q}%,city_state.ilike.%${q}%`)
            .limit(5);

        if (dbTournaments) {
            dbTournaments.forEach((t: { id: string; name: string; city_state: string | null }) => {
                results.push({ 
                    type: 'tournament', 
                    id: t.id, 
                    name: t.name, 
                    slug: `/tournaments/${t.id}`, 
                    subtitle: `Tournament • Location: ${t.city_state || 'TBD'}` 
                });
            });
        }

        return results;
    },

}));
