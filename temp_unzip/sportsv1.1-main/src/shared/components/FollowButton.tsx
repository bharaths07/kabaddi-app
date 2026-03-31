import React from 'react';
import { useGlobalState } from '@/app/AppProviders';

interface FollowButtonProps {
  id: string;
  type: 'team' | 'tournament';
  label?: boolean; // If true, show text "Follow"/"Following"
  style?: React.CSSProperties;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ id, type, label = false, style }) => {
  const { followedTeams, followedTournaments, toggleFollowTeam, toggleFollowTournament } = useGlobalState();

  const isFollowing = type === 'team' 
    ? followedTeams.includes(id) 
    : followedTournaments.includes(id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card clicks if placed inside cards
    if (type === 'team') {
      toggleFollowTeam(id);
    } else {
      toggleFollowTournament(id);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 ${label ? 'px-4 py-2' : 'p-2'} rounded-full border transition-all text-sm font-semibold ${
        isFollowing ? 'border-red-600 text-red-600 bg-red-50 hover:bg-red-100' : 'border-slate-300 text-slate-600 bg-white hover:bg-slate-50'
      }`}
      style={style}
    >
      <span className={label ? 'text-base' : 'text-lg'}>
        {isFollowing ? '❤️' : '🤍'}
      </span>
      {label && (
        <span>{isFollowing ? 'Following' : 'Follow'}</span>
      )}
    </button>
  );
};
