import React, { useMemo, useState } from 'react';
import { FeedItem } from '@/features/social/types/feed';
import { formatRelativeTime } from '../utils/dateUtils';
import { Activity } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface ActivityFeedProps {
  items: FeedItem[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ items }) => {
  const [filter, setFilter] = useState<'all' | 'match_update' | 'achievement' | 'announcement' | 'news' | 'user_post' | 'highlight'>('all');
  const [visibleCount, setVisibleCount] = useState(10);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter(i => i.type === filter);
  }, [items, filter]);

  const visibleItems = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Recent Activity</h2>
        </div>
        <div className="p-8">
          <EmptyState
            icon={<Activity size={48} className="text-slate-300" />}
            message="No recent activity yet"
            description="Match updates and tournament changes will appear here once events begin."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Recent Activity</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'match_update', label: 'Match Updates' },
            { id: 'achievement', label: 'Achievements' },
            { id: 'announcement', label: 'Announcements' },
            { id: 'news', label: 'News' },
            { id: 'user_post', label: 'Posts' },
            { id: 'highlight', label: 'Highlights' },
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { setFilter(opt.id as any); setVisibleCount(10); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${filter === opt.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              aria-label={`Filter ${opt.label}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-8 py-6 space-y-6">
        {visibleItems.map((item, index) => (
          <div key={item.id} className={`group flex gap-5 ${index !== items.length - 1 ? 'pb-6 border-b border-slate-50' : ''}`}>
            <div className={`
              h-12 w-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm
              ${item.type === 'match_update' ? 'bg-blue-50 text-blue-600' :
                item.type === 'achievement' ? 'bg-amber-50 text-amber-600' :
                  'bg-slate-50 text-slate-600'}
            `}>
              {item.type === 'match_update' ? '🏏' : item.type === 'achievement' ? '🏆' : '📢'}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex justify-between items-start mb-1.5">
                <span className="font-bold text-slate-900 truncate pr-2 group-hover:text-blue-600 transition-colors">{item.title}</span>
                <span className="text-xs font-medium text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-full">{formatRelativeTime(item.publishedAt)}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.content}</p>
            </div>
          </div>
        ))}
        {visibleItems.length < filtered.length && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setVisibleCount(c => c + 10)}
              className="w-full px-4 py-2 rounded-full text-sm font-semibold bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
