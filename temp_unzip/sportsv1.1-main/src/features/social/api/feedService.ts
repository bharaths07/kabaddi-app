import { supabase } from '@/shared/lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';
import { FeedItem } from '@/features/social/types/feed';

interface DbFeedItem {
  id: string;
  type: FeedItem['type'];
  title: string;
  content: string;
  published_at: string;
  related_entity_id?: string;
  visibility: FeedItem['visibility'];
  metadata?: Record<string, unknown>;
  author_id?: string;
  author_name?: string;
  author_type?: string;
  media?: unknown[];
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  hashtags?: string[];
}

type QueryResponse<T> = { data: T | null; error: PostgrestError | null };

export const feedService = {
  async createFeedItem(item: FeedItem): Promise<FeedItem> {
    const dbItem = {
      type: item.type,
      title: item.title,
      content: item.content,
      published_at: item.publishedAt,
      related_entity_id: item.relatedEntityId,
      visibility: item.visibility,
      metadata: item.metadata
    };

    const { data, error }: QueryResponse<DbFeedItem> = await supabase
      .from('feed_items')
      .insert(dbItem)
      .select()
      .single();

    if (error) {
      console.error('Error creating feed item:', error);
      throw error;
    }

    return mapToDomain(data as DbFeedItem);
  },

  async getAllFeedItems(): Promise<FeedItem[]> {
    const { data, error }: QueryResponse<DbFeedItem[]> = await supabase
      .from('feed_items')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50); // Limit for performance

    if (error) {
      console.error('Error fetching feed items:', error);
      return [];
    }

    return (data ?? []).map(mapToDomain);
  }
};

function mapToDomain(db: DbFeedItem): FeedItem {
  return {
    id: db.id,
    type: db.type,
    title: db.title,
    content: db.content,
    publishedAt: db.published_at,
    relatedEntityId: db.related_entity_id,
    visibility: db.visibility,
    metadata: db.metadata,

    // Defaults for missing DB fields
    authorId: db.author_id || 'system',
    authorName: db.author_name || 'System',
    authorType: (db.author_type || 'system') as FeedItem['authorType'],
    media: (db.media || []) as FeedItem['media'],
    likesCount: db.likes_count || 0,
    commentsCount: db.comments_count || 0,
    sharesCount: db.shares_count || 0,
    hashtags: db.hashtags || []
  };
}
