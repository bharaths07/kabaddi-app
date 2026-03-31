import React from 'react';
import { Tournament } from '@/features/tournaments/types/tournament';
import { Avatar } from '@/shared/components/ui/Avatar';

interface TournamentHeaderProps {
  tournament: Tournament;
}

export const TournamentHeader: React.FC<TournamentHeaderProps> = ({ tournament }) => {
  return (
    <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* Left Side: Navigation + Info */}
        <div className="flex items-center gap-6">
          {/* Left Arrow */}
          <button className="w-8 h-8 rounded border border-slate-600 bg-transparent text-slate-400 cursor-pointer flex items-center justify-center hover:bg-slate-800">
            ←
          </button>

          {/* Tournament Info */}
          <div className="flex gap-5 items-center">
            {/* Logo */}
            <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg bg-slate-800">
              <Avatar
                src={tournament.bannerUrl}
                alt={tournament.name}
                fallback={tournament.name.charAt(0)}
                className="w-full h-full rounded-none"
              />
            </div>

            {/* Text */}
            <div>
              <h1 className="text-2xl font-bold mb-2 text-white">
                {tournament.name}
              </h1>
              <div className="text-sm text-slate-400">
                {tournament.dates}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Next Tournament Preview + Arrow */}
        <div className="flex items-center gap-4">
          <div className="text-right flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-500">Up Next</span>
              <span className="text-sm text-slate-200 font-medium">World Legends</span>
              <span className="text-xs text-slate-400">T20 2026</span>
            </div>
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800">
              <Avatar
                src="https://placehold.co/100x100/4f46e5/ffffff?text=WL"
                alt="Next"
                fallback="WL"
                className="w-full h-full rounded-none"
              />
            </div>
          </div>

          {/* Right Arrow */}
          <button className="w-8 h-8 rounded border border-slate-600 bg-transparent text-slate-400 cursor-pointer flex items-center justify-center hover:bg-slate-800">
            →
          </button>
        </div>

      </div>
    </div>
  );
};
