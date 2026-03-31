import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Image } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { FeedItem } from '@/features/social/types/feed';
import { formatRelativeTime } from '@/shared/utils/dateUtils';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

// Mock Data for Demo
const MOCK_FEED: FeedItem[] = [
  {
    id: 'f1',
    type: 'match_update',
    title: 'Match Result',
    content: 'Royal Challengers Bangalore defeated Chennai Super Kings by 14 runs in a thriller!',
    authorId: 'sys',
    authorName: 'System',
    authorType: 'system',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80' }],
    likesCount: 1240,
    commentsCount: 45,
    sharesCount: 12,
    hashtags: ['#RCBvCSK', '#IPL2026', '#Cricket'],
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    visibility: 'public',
    isLikedByCurrentUser: false
  },
  {
    id: 'f2',
    type: 'user_post',
    content: 'Just scored my first century of the season! Feeling pumped! 🏏💪',
    authorId: 'u1',
    authorName: 'Virat Kohli',
    authorAvatar: undefined,
    authorType: 'user',
    media: [],
    likesCount: 5600,
    commentsCount: 320,
    sharesCount: 500,
    hashtags: ['#Century', '#FormIsTemporaryClassIsPermanent'],
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    visibility: 'public',
    isLikedByCurrentUser: true
  },
  {
    id: 'f3',
    type: 'announcement',
    title: 'Tournament Registration Open',
    content: 'Registration for the Monsoon Cup 2026 is now open. Register your team before July 15th!',
    authorId: 't1',
    authorName: 'Karnataka State Cricket Association',
    authorType: 'institution',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80' }],
    likesCount: 89,
    commentsCount: 12,
    sharesCount: 34,
    hashtags: ['#MonsoonCup', '#CricketTournament'],
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    visibility: 'public',
    isLikedByCurrentUser: false
  }
];

export const SocialFeedScreen: React.FC = () => {
  const { currentUser } = useGlobalState();
  const [items, setItems] = useState<FeedItem[]>(MOCK_FEED);
  const [loading, setLoading] = useState(false);

  // Interaction Handlers
  const handleLike = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isLikedByCurrentUser: !item.isLikedByCurrentUser,
          likesCount: item.isLikedByCurrentUser ? item.likesCount - 1 : item.likesCount + 1
        };
      }
      return item;
    }));
  };

  const handleLoadMore = () => {
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      const moreItems = MOCK_FEED.map(item => ({ ...item, id: item.id + Math.random() }));
      setItems(prev => [...prev, ...moreItems]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-50 min-h-screen pb-20">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-600 bg-clip-text text-transparent">
          Social Feed
        </h1>
        <div className="flex gap-2">
          <button className="p-2 rounded-full hover:bg-slate-100">
            <MessageCircle className="w-6 h-6 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Create Post Input (Mock) */}
      <div className="bg-white p-4 mb-2 shadow-sm">
        <div className="flex gap-3">
          <Avatar
            src={currentUser?.avatarUrl}
            fallback={currentUser?.firstName?.[0] || 'Me'}
            className="w-10 h-10"
          />
          <div className="flex-1">
            <Input
              type="text"
              placeholder="What's happening on the field?"
              className="rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-violet-500"
              containerClassName="mb-0"
            />
            <div className="flex justify-between items-center mt-3 px-1">
              <button className="text-slate-500 hover:text-violet-600 flex items-center gap-1 text-xs font-medium">
                <Image className="w-4 h-4" /> Photo/Video
              </button>
              <Button size="sm" className="rounded-full px-4 py-1.5 h-auto text-xs">
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {items.map(item => (
          <article key={item.id} className="bg-white shadow-sm border-y border-slate-100 sm:border sm:rounded-xl sm:mx-2 overflow-hidden">

            {/* Post Header */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  src={item.authorAvatar}
                  fallback={item.authorName[0]}
                  className="w-10 h-10 border border-slate-100"
                />
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 leading-tight flex items-center gap-1">
                    {item.authorName}
                    {item.authorType === 'institution' && <span className="text-blue-500 text-[10px]">☑</span>}
                  </h3>
                  <p className="text-xs text-slate-500">{formatRelativeTime(item.publishedAt)}</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="px-3 pb-2">
              {item.title && <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>}
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{item.content}</p>
              {item.hashtags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.hashtags.map(tag => (
                    <span key={tag} className="text-violet-600 text-xs font-medium">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Media */}
            {item.media.length > 0 && (
              <div className="mt-2">
                <img src={item.media[0].url} alt="Post content" className="w-full object-cover max-h-[500px]" />
              </div>
            )}

            {/* Engagement Bar */}
            <div className="px-3 py-3">
              <div className="flex items-center justify-between text-slate-500 text-sm mb-3">
                <span>{item.likesCount} likes</span>
                <div className="flex gap-3">
                  <span>{item.commentsCount} comments</span>
                  <span>{item.sharesCount} shares</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <button
                  onClick={() => handleLike(item.id)}
                  className={`flex items-center gap-2 text-sm font-medium ${item.isLikedByCurrentUser ? 'text-red-500' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Heart className={`w-5 h-5 ${item.isLikedByCurrentUser ? 'fill-current' : ''}`} />
                  Like
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                  <MessageCircle className="w-5 h-5" />
                  Comment
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>

          </article>
        ))}
      </div>

      {/* Infinite Scroll Loader */}
      <div className="p-4 text-center">
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="text-sm text-violet-600 font-semibold hover:text-violet-700 disabled:opacity-50"
        >
          {loading ? 'Loading updates...' : 'Load more'}
        </button>
      </div>

    </div>
  );
};
