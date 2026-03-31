import { supabase } from '@/shared/lib/supabase';
import { MatchState, ScoreEvent } from '../types/cardScoring';

export const cardMatchSupabaseService = {
  async saveState(matchId: string, gameId: string, state: MatchState) {
    try {
      const payload = {
        id: matchId,
        game_id: gameId,
        state_json: state,
        updated_at: new Date().toISOString()
      };
      await supabase.from('card_matches').upsert(payload);
    } catch (e) {
      console.warn('[CardMatchSupabase] saveState failed', e);
    }
  },

  async loadState(matchId: string): Promise<MatchState | null> {
    try {
      const { data } = await supabase
        .from('card_matches')
        .select('state_json')
        .eq('id', matchId)
        .single();
      return data?.state_json ?? null;
    } catch {
      return null;
    }
  },

  async appendEvent(matchId: string, event: ScoreEvent) {
    try {
      const payload = {
        id: event.id,
        match_id: matchId,
        type: event.type,
        player_id: event.playerId ?? null,
        payload_json: event.payload,
        timestamp: event.timestamp
      };
      await supabase.from('card_match_events').insert(payload);
    } catch (e) {
      console.warn('[CardMatchSupabase] appendEvent failed', e);
    }
  },

  async loadEvents(matchId: string): Promise<ScoreEvent[]> {
    try {
      const { data } = await supabase
        .from('card_match_events')
        .select('*')
        .eq('match_id', matchId)
        .order('timestamp', { ascending: true });
      return (data || []).map((row) => ({
        id: row.id,
        type: row.type,
        playerId: row.player_id ?? undefined,
        payload: row.payload_json ?? {},
        timestamp: row.timestamp
      }));
    } catch {
      return [];
    }
  }
  ,
  async listMatches(): Promise<Array<{ id: string; game_id: string; updated_at: string }>> {
    try {
      const { data } = await supabase
        .from('card_matches')
        .select('id, game_id, updated_at')
        .order('updated_at', { ascending: false });
      return data || [];
    } catch {
      return [];
    }
  },
  async deleteMatch(matchId: string) {
    try {
      await supabase.from('card_match_events').delete().eq('match_id', matchId);
      await supabase.from('card_matches').delete().eq('id', matchId);
    } catch (e) {
      console.warn('[CardMatchSupabase] deleteMatch failed', e);
    }
  }
};
