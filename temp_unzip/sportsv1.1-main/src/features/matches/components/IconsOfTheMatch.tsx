import React from 'react';
import { useGlobalState } from '@/app/AppProviders';
import { ImpactScore } from '@/shared/utils/cricketMetrics';
import { useNavigate } from 'react-router-dom';

interface Props {
  icons: ImpactScore[];
  onGeneratePoster: (player: ImpactScore, type: 'icon' | 'performance') => void;
}

export const IconsOfTheMatch: React.FC<Props> = ({ icons, onGeneratePoster }) => {
  const { players } = useGlobalState();
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="text-base">🏆</span> Icons of the Match
        </h3>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 [scroll-snap-type:x_mandatory] pr-5">
        {icons.slice(0, 3).map((icon, index) => {
            const player = players.find(p => p.id === icon.playerId);
            const isMVP = index === 0; // Assumption: Sorted by impact
            
            // Dynamic Gradient based on rank
            const bgGradient = isMVP 
                ? 'bg-gradient-to-br from-[#FFD700] to-[#B8860B]'
                : index === 1 
                    ? 'bg-gradient-to-br from-[#C0C0C0] to-[#718096]'
                    : 'bg-gradient-to-br from-[#CD7F32] to-[#8B4513]';

            return (
                <div 
                    key={icon.playerId}
                    className={`min-w-[240px] h-80 rounded-2xl relative overflow-hidden [scroll-snap-align:start] shadow-xl cursor-pointer flex flex-col ${bgGradient}`}
                    onClick={() => navigate(`/player/${icon.playerId}`)}
                >
                    {/* Background Pattern/Noise */}
                    <div className="absolute inset-0 z-[1] [background-image:radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3)_0%,transparent_70%)]" />

                    {/* Award Tag */}
                    <div className="absolute top-4 left-4 right-4 z-10 flex justify-center">
                        <span className="bg-black/60 text-white px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20">
                            {isMVP ? 'Player of the Match' : index === 1 ? 'Top Performer' : 'Impact Player'}
                        </span>
                    </div>

                    {/* Player Visual (Cutout Placeholder) */}
                    <div className="flex-1 flex items-end justify-center z-[5] mt-10">
                        {/* Placeholder for Cutout */}
                        <div className="w-40 h-40 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-6xl mb-5 text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.3)]">
                             {player?.firstName[0]}{player?.lastName[0]}
                        </div>
                    </div>

                    {/* Content Overlay */}
                    <div className="p-4 [background:linear-gradient(to_top,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0)_100%)] z-10 text-white text-center">
                        <div className="text-lg font-extrabold [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                            {player?.firstName} {player?.lastName}
                        </div>
                        
                        <div className="mt-2 flex justify-center gap-3 text-sm font-semibold">
                             {icon.details.runs > 0 && (
                                 <span>{icon.details.runs} <span className="text-[10px] opacity-80">RUNS</span></span>
                             )}
                             {icon.details.wicketsTaken > 0 && (
                                 <span>{icon.details.wicketsTaken} <span className="text-[10px] opacity-80">WKTS</span></span>
                             )}
                        </div>

                        {/* Share / Poster Action */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onGeneratePoster(icon, 'icon');
                            }}
                            className="mt-3 bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white text-xs font-semibold w-full flex items-center justify-center gap-1.5 hover:bg-white/30 transition-colors"
                        >
                            <span>✨</span> Generate Poster
                        </button>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
