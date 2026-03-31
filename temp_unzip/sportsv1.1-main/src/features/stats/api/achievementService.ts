import { supabase } from '@/shared/lib/supabase';
import { Achievement } from '../types/achievement';

interface DbAchievement {
  id: string;
  type: Achievement['type'];
  title: string;
  player_id: string;
  match_id?: string;
  date: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export const achievementService = {
  async createAchievement(achievement: Achievement): Promise<Achievement> {
    const dbAchievement = {
      type: achievement.type,
      title: achievement.title,
      player_id: achievement.playerId,
      match_id: achievement.matchId,
      date: achievement.date,
      description: achievement.description,
      metadata: achievement.metadata // Assuming metadata column exists for flexibility
    };

    const { data, error } = await supabase
      .from('achievements')
      .insert(dbAchievement)
      .select()
      .single();

    if (error) {
      console.error('Error creating achievement:', error);
      throw error;
    }

    return mapToDomain(data as DbAchievement);
  },

  async getAchievementsByPlayer(playerId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('player_id', playerId);

    if (error) {
      console.error('Error fetching player achievements:', error);
      return [];
    }

    return (data || []).map((row) => mapToDomain(row as DbAchievement));
  },

  async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*');

    if (error) {
      console.error('Error fetching all achievements:', error);
      return [];
    }

    return (data || []).map((row) => mapToDomain(row as DbAchievement));
  }
};

function mapToDomain(db: DbAchievement): Achievement {
  return {
    id: db.id,
    type: db.type,
    title: db.title,
    playerId: db.player_id,
    matchId: db.match_id,
    date: db.date,
    description: db.description,
    metadata: db.metadata
  };
}
