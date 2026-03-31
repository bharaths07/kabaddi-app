import React from 'react';
import { useGlobalState } from '@/app/AppProviders';
import { ImpactScore } from '@/shared/utils/cricketMetrics';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/shared/components/ui/Avatar';

interface Props {
  performances: ImpactScore[];
  onGeneratePoster: (player: ImpactScore, type: 'performance') => void;
}

export const IconPerformances: React.FC<Props> = ({ performances, onGeneratePoster }) => {
  const { players } = useGlobalState();
  const navigate = useNavigate();

  return (
    <div className="mb-8">
       <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="text-base">⚡</span> Icon Performances
        </h3>

        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
            {performances.map((perf, index) => {
                const player = players.find(p => p.id === perf.playerId);
                
                return (
                    <div 
                        key={perf.playerId}
                        className="bg-white rounded-xl border border-slate-200 p-3 relative shadow-sm flex flex-col items-center cursor-pointer hover:-translate-y-0.5 transition-transform"
                        onClick={() => navigate(`/player/${perf.playerId}`)}
                    >
                         {/* Rank Badge */}
                         <div className="absolute top-2 left-2 text-[10px] font-bold text-slate-400">
                             #{index + 4}
                         </div>

                         {/* Avatar */}
                         <Avatar
                            src={player?.avatarUrl}
                            fallback={`${player?.firstName?.[0] || ''}${player?.lastName?.[0] || ''}`}
                            className="w-12 h-12 mb-3 bg-slate-100 text-slate-500 text-lg font-bold"
                         />

                         {/* Name */}
                         <div className="text-sm font-bold text-slate-900 mb-1 text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                             {player?.firstName} {player?.lastName}
                         </div>

                         {/* Stat Line */}
                         <div className="text-xs text-slate-500 mb-3 flex gap-2 font-medium">
                             {perf.details.runs > 0 && <span>{perf.details.runs} R</span>}
                             {perf.details.wicketsTaken > 0 && <span>{perf.details.wicketsTaken} W</span>}
                         </div>

                         {/* Action */}
                         <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onGeneratePoster(perf, 'performance');
                            }}
                            className="w-full px-2 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-600 text-[11px] font-semibold hover:bg-slate-100"
                         >
                             Create Poster
                         </button>
                    </div>
                );
            })}
        </div>
    </div>
  );
};
