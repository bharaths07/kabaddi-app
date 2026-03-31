import React, { useRef } from 'react';
import { Avatar } from '@/shared/components/ui/Avatar';

interface Squad {
  id: string;
  name: string;
  code: string;
  flag: string;
}

interface SquadListProps {
  squads: Squad[];
  onTeamClick?: (teamId: string) => void;
}

export const SquadList: React.FC<SquadListProps> = ({ squads, onTeamClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Team Squads</h2>
      
      <div className="relative">
        {/* Scroll Left Button - Only visible if needed in real app, keeping simple for now */}
        {/* <button onClick={() => scroll('left')} ... /> */}

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 [scrollbar-width:none]"
        >
          {squads.map(squad => (
            <div 
              key={squad.id} 
              onClick={() => onTeamClick?.(squad.id)}
              className="flex flex-col items-center min-w-16 cursor-pointer"
            >
              <Avatar
                src={squad.flag}
                alt={squad.name}
                fallback={squad.code.charAt(0)}
                className="w-16 h-16 border-2 border-white shadow-sm mb-2"
              />
              <div className="text-sm font-semibold text-slate-600">{squad.code}</div>
            </div>
          ))}
          
          {/* See All Arrow Circle */}
          <div className="flex flex-col items-center min-w-16 justify-center">
            <button className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-500 cursor-pointer flex items-center justify-center shadow-sm">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
