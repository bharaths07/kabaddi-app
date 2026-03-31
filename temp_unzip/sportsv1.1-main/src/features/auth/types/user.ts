export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role?: 'user' | 'admin';
  avatarUrl?: string;
  
  // Legacy / Extended fields (kept for compatibility with existing UI)
  firstName?: string;
  lastName?: string;
  location?: string;
  bio?: string;
  memberSince?: string;
  followersCount?: number;
  followingCount?: number;
  profileViews?: number;
  type?: 'user' | 'organizer' | 'admin';
  plan?: 'free' | 'premium' | 'enterprise';
  
  // New Onboarding Fields
  username?: string;
  favoriteGame?: string;

  // Enhanced Profile Fields
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  dateOfBirth?: string; // ISO date string (YYYY-MM-DD)
  gameRoles?: Record<string, string[]>; // e.g. { "Cricket": ["Batsman", "Wicket Keeper"] }
  displayEmail?: string;
  displayPhone?: string;
}
