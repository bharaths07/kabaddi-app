export type FeedType = 'news' | 'match_update' | 'achievement' | 'announcement' | 'user_post' | 'highlight';

export interface FeedComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface FeedItem {
  id: string;
  type: FeedType;
  title?: string;
  content: string;
  
  // Author Details
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorType: 'user' | 'system' | 'team' | 'tournament' | 'institution';

  // Context
  relatedEntityId?: string; // MatchID, PlayerID, etc.
  institutionId?: string;
  
  // Media
  media: {
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
    aspectRatio?: number;
  }[];

  // Engagement
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hashtags: string[];
  
  // User Context (computed)
  isLikedByCurrentUser?: boolean;
  
  // Metadata
  publishedAt: string;
  visibility: 'public' | 'institution' | 'private';
  location?: string;
  metadata?: any;
}

export interface FeedFilter {
  hashtag?: string;
  authorId?: string;
  type?: FeedType;
}
