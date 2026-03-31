import React from 'react';
import { Avatar } from '@/shared/components/ui/Avatar';

// Simple match interface for display
export interface FeaturedMatch {
  id: string;
  team1: { name: string; code: string; flag: string; score?: string; overs?: string };
  team2: { name: string; code: string; flag: string; score?: string; overs?: string };
  status: string; // e.g., "Toss Delayed", "NAM Won", "Feb 4, 3:00 PM"
  resultNote?: string; // e.g., "6th T20 WC Warm up 2026"
}

interface FeaturedMatchesProps {
  matches: FeaturedMatch[];
  onViewAllClick?: () => void;
  onMatchClick?: (matchId: string) => void;
}

export const FeaturedMatches: React.FC<FeaturedMatchesProps> = ({ matches, onViewAllClick, onMatchClick }) => {
  const displayMatches = matches.slice(0, 3);
  
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800 m-0">Featured Matches</h2>
        <div 
          onClick={onViewAllClick}
          className="text-sm text-blue-500 font-medium cursor-pointer hover:underline"
        >
          All Matches {'>'}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {displayMatches.map(match => (
          <div
          key={match.id}
          className="bg-white rounded-xl px-6 py-4 shadow-sm border border-slate-200 flex items-center justify-between cursor-pointer transition-shadow hover:shadow-lg"
          onClick={() => onMatchClick?.(match.id)}
          >
            {/* Team 1 */}
            <div className="flex items-center gap-3 w-[30%]">
              <Avatar
                src={match.team1.flag}
                alt={match.team1.code}
                fallback={match.team1.code.charAt(0)}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <div className="font-semibold text-slate-900">{match.team1.code}</div>
                {match.team1.score && (
                  <div className="text-sm text-slate-700 mt-0.5">
                    {match.team1.score} <span className="text-xs text-slate-500">{match.team1.overs}</span>
                  </div>
                )}
                {!match.team1.score && <div className="text-xs text-slate-400">Yet to bat</div>}
              </div>
            </div>

            {/* Status / Info Center */}
            <div className="text-center flex-1">
              <div className={`text-sm font-semibold mb-1 ${
                match.status.includes('Won') ? 'text-red-500' : 'text-amber-500'
              }`}>
                {match.status}
              </div>
              {match.resultNote && (
                <div className="text-xs text-slate-500">{match.resultNote}</div>
              )}
            </div>

            {/* Team 2 */}
            <div className="flex items-center gap-3 w-[30%] flex-row-reverse text-right">
              <Avatar
                src={match.team2.flag}
                alt={match.team2.code}
                fallback={match.team2.code.charAt(0)}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <div className="font-semibold text-slate-900">{match.team2.code}</div>
                {match.team2.score && (
                  <div className="text-sm text-slate-700 mt-0.5">
                    {match.team2.score} <span className="text-xs text-slate-500">{match.team2.overs}</span>
                  </div>
                )}
                {!match.team2.score && <div className="text-xs text-slate-400">Yet to bat</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
