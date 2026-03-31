export interface GameProfile {
  gameProfileId: string;
  userId: string;
  sport: string; // 'cricket' | 'football' | 'kabaddi'
  createdAt: string;
  visibility: 'public' | 'private' | 'institution';
  
  // Sport Specific Details (can be typed more strictly later)
  role?: string; // e.g. "WK-Batter"
  battingStyle?: string;
  bowlingStyle?: string;
  
  // Metadata
  isPrimary?: boolean;
}
