export type SportType = 'team' | 'individual' | 'duo';

export interface ScoringRule {
  name: string;
  pointsPerScore: number;
  description?: string;
}

export interface SportConfig {
  matchDurationMinutes?: number;
  playersPerTeam?: number;
  scoringRules?: ScoringRule[];
}

export interface Sport {
  id: string;
  name: string; // e.g., "Cricket", "Football"
  type: SportType;
  iconUrl?: string;
  config?: SportConfig;
}
