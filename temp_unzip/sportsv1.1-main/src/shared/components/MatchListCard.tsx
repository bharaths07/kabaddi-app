import React from 'react';
import { Match } from '@/features/matches/types/match';
import { MatchCard } from './MatchCard';

interface MatchListCardProps {
  title: string;
  matches: Match[];
}

export const MatchListCard: React.FC<MatchListCardProps> = ({ title, matches }) => {
  if (matches.length === 0) return null;

  return (
    <div className="match-list-card mb-6">
      <h3 className="list-card-title text-lg font-bold mb-4 text-slate-900 pl-1">
        {title}
      </h3>
      <div className="list-card-content flex flex-col gap-0 rounded-xl overflow-hidden border border-slate-200 shadow">
        {matches.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
};
