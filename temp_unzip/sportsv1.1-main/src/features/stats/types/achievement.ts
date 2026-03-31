export type AchievementType = 'player_of_the_match' | 'half_century' | 'century' | 'five_wickets' | 'hat_trick' | 'clean_sheet';

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  playerId: string;
  matchId?: string;
  date: string;
  description?: string;
  metadata?: any;
}
