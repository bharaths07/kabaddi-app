export type UserType = 'player' | 'organizer' | 'viewer';
export type MatchStatus = 'draft' | 'live' | 'completed' | 'locked' | 'cancelled';
export type FeedItemType = 'match' | 'certificate' | 'news';

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  district: string;
  institution: string;
  profilePhoto?: string | null;
}

export interface Sport {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  sportId: string;
}

export interface Match {
  id: string;
  sportId: string;
  teamAId: string;
  teamBId: string;
  date: string;
  location: string;
  status: MatchStatus;
  score?: string; // e.g., "2 - 1" or "120/4 - 115/8"
  createdByUserId: string;
  scorerIds: string[];
}

export interface Certificate {
  id: string;
  userId: string;
  matchId: string;
  title: string;
  achievement: string;
  date: string;
}

export interface FeedItem {
  id: string;
  type: FeedItemType;
  source: string; // e.g., "Match Update", "System", "News"
  title: string;
  description: string;
  time: string; // e.g., "2 hours ago"
}

export interface Tournament {
  id: string;
  name: string;
  sportId: string;
  location: string;
  organizerUserId: string;
  createdAt: string;
}
