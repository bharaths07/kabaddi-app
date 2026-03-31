import React from 'react';
import { Avatar } from '@/shared/components/ui/Avatar';

interface StatItem {
  id: string;
  category: string;
  player: {
    name: string;
    team: string;
    avatar: string;
  };
  value: string;
  label: string; // e.g. "Runs"
}

interface KeyStatsProps {
  stats: StatItem[];
  variant?: 'sidebar' | 'full';
}

export const KeyStats: React.FC<KeyStatsProps> = ({ stats, variant = 'sidebar' }) => {
  const displayStats = variant === 'full' ? stats : stats.slice(0, 3);

  return (
    <div>
      {variant === 'sidebar' && (
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Key Stats</h2>
      )}
      
      <div
        className={
          variant === 'full'
            ? 'grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]'
            : 'flex flex-col gap-4'
        }
      >
        {displayStats.map(stat => (
          <div 
            key={stat.id} 
            title="Stats update as tournament progresses"
            className={`bg-white rounded-xl border border-slate-200 overflow-hidden cursor-help transition-transform transition-shadow duration-200 ${
              variant === 'full' ? 'shadow-sm hover:-translate-y-0.5 hover:shadow-lg' : ''
            }`}
          >
            <div className="px-4 py-2 border-b border-slate-100 text-xs font-medium text-slate-500 flex justify-between items-center">
              <span>{stat.category}</span>
              {variant === 'full' && <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded">TOP PERFORMER</span>}
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  src={stat.player.avatar}
                  alt={stat.player.name}
                  fallback={stat.player.name.charAt(0)}
                  className="w-12 h-12 rounded-full bg-slate-50"
                />
                <div>
                  <div className="text-sm font-semibold text-slate-900">{stat.player.name}</div>
                  <div className="text-xs text-slate-500">{stat.player.team}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-[11px] text-slate-500">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
