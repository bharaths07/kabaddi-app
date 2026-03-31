export interface MatchScorer {
  id: string;
  matchId: string;
  userId: string;
  assignedBy?: string; // Admin user ID
  assignedAt: string; // ISO timestamp
}
