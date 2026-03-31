import React from 'react';
import { Trophy, Badge } from '@/features/players/types/player';

// --- Trophy Components ---

interface TrophyCardProps {
  trophy: Trophy;
}

export const TrophyCard: React.FC<TrophyCardProps> = ({ trophy }) => {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm">
      <div className="mb-1 text-3xl">
        {trophy.icon || '🏆'}
      </div>
      <div className="line-clamp-2 overflow-hidden text-sm font-semibold leading-tight text-slate-900">
        {trophy.tournamentName}
      </div>
      <div className="text-xs text-slate-500">
        {trophy.year} · <span className={trophy.position === 'Winner' ? 'font-semibold text-amber-500' : 'text-slate-500'}>{trophy.position}</span>
      </div>
    </div>
  );
};

export const TrophiesTab: React.FC<{ trophies?: Trophy[] }> = ({ trophies }) => {
  if (!trophies || trophies.length === 0) {
    return (
      <div className="px-5 py-16 text-center text-slate-500">
        <div className="mb-2 text-base font-semibold text-slate-600">
          No trophies yet
        </div>
        <div className="text-sm">
          Win tournaments to earn trophies
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 pb-5 sm:grid-cols-2">
      {trophies.map(t => (
        <TrophyCard key={t.id} trophy={t} />
      ))}
    </div>
  );
};

// --- Badge Components ---

interface BadgeCardProps {
  badge: Badge;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const isLocked = badge.isLocked;
  
  return (
    <div className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center ${
      isLocked 
        ? 'border-slate-200 bg-slate-50 opacity-70' 
        : 'border-slate-100 bg-white shadow-sm'
    }`}>
      <div className={`text-3xl ${isLocked ? 'opacity-50 grayscale' : ''}`}>
        {badge.icon}
      </div>
      <div className={`text-xs font-semibold leading-tight ${isLocked ? 'text-slate-400' : 'text-slate-700'}`}>
        {badge.name}
      </div>
    </div>
  );
};

export const BadgesTab: React.FC<{ badges?: Badge[] }> = ({ badges }) => {
  if (!badges || badges.length === 0) {
    return (
      <div className="px-5 py-16 text-center text-slate-500">
        <div className="mb-2 text-base font-semibold text-slate-600">
          No badges yet
        </div>
        <div className="text-sm">
          Badges will appear as you play more matches
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 pb-5 sm:grid-cols-4">
      {badges.map(b => (
        <BadgeCard key={b.id} badge={b} />
      ))}
    </div>
  );
};
