import { supabase } from '@/shared/lib/supabase';
import { MatchScorer } from '../types/scorer';

interface DbScorer {
  id: string;
  match_id: string;
  user_id: string;
  assigned_by?: string;
  assigned_at: string;
}

export const scorerService = {
  async assignScorer(scorer: MatchScorer): Promise<MatchScorer> {
    const dbScorer = {
      match_id: scorer.matchId,
      user_id: scorer.userId,
      assigned_by: scorer.assignedBy,
      assigned_at: scorer.assignedAt
    };

    const { data, error } = await supabase
      .from('match_scorers')
      .insert(dbScorer)
      .select()
      .single();

    if (error) {
      console.error('Error assigning scorer:', error);
      throw error;
    }

    return mapToDomain(data as DbScorer);
  },

  async removeScorer(matchId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('match_scorers')
      .delete()
      .match({ match_id: matchId, user_id: userId });

    if (error) {
      console.error('Error removing scorer:', error);
      throw error;
    }
  },

  async getScorersForMatch(matchId: string): Promise<MatchScorer[]> {
    const { data, error } = await supabase
      .from('match_scorers')
      .select('*')
      .eq('match_id', matchId);

    if (error) {
      console.error('Error fetching scorers:', error);
      return [];
    }

    return (data || []).map((row) => mapToDomain(row as DbScorer));
  },

  async getAllScorers(): Promise<MatchScorer[]> {
    const { data, error } = await supabase
      .from('match_scorers')
      .select('*');

    if (error) {
      console.error('Error fetching all scorers:', error);
      return [];
    }
    return (data || []).map((row) => mapToDomain(row as DbScorer));
  }
};

function mapToDomain(db: DbScorer): MatchScorer {
  return {
    id: db.id,
    matchId: db.match_id,
    userId: db.user_id,
    assignedBy: db.assigned_by,
    assignedAt: db.assigned_at
  };
}
