import React from 'react';
import { Match, ScoreEvent } from '@/features/matches/types/match';
import { useGlobalState } from '@/app/AppProviders';
import { Card } from '@/shared/components/ui/Card';
// import { Link } from 'react-router-dom';

interface Props {
  match: Match;
}

export const FootballScorecard: React.FC<Props> = ({ match }) => {
  const { players } = useGlobalState();

  const getPlayerName = (id?: string) => {
    if (!id) return 'Unknown';
    const p = players.find(x => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown Player';
  };

  // Filter and sort events (Goals and Cards)
  const matchEvents = (match.events || [])
    .filter(e => e.type === 'goal' || e.type === 'card')
    .sort((a, b) => {
      // Sort by matchTime if available, else timestamp
      if (a.matchTime && b.matchTime) {
        return parseInt(a.matchTime) - parseInt(b.matchTime);
      }
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

  const renderEventIcon = (event: ScoreEvent) => {
    if (event.type === 'goal') return '⚽';
    if (event.type === 'card') {
      return event.cardType === 'red' ? '🟥' : '🟨';
    }
    return '•';
  };

  const renderEventDescription = (event: ScoreEvent) => {
    const playerName = getPlayerName(event.scorerId || event.batterId); // Fallback keys
    
    if (event.type === 'goal') {
      const assistName = event.assistId ? getPlayerName(event.assistId) : null;
      return (
        <span>
          <span className="font-bold text-slate-900">{playerName}</span>
          {assistName && <span className="text-slate-500 text-xs ml-1">(assist: {assistName})</span>}
          {event.description && <span className="text-slate-400 text-xs ml-1">({event.description})</span>}
        </span>
      );
    }
    
    if (event.type === 'card') {
      return (
        <span>
          <span className="font-bold text-slate-900">{playerName}</span>
          <span className="text-slate-500 text-xs ml-1">
            {event.cardType === 'red' ? 'Red Card' : 'Yellow Card'}
          </span>
        </span>
      );
    }
    
    return playerName;
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Match Events Timeline */}
      <Card className="overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm uppercase">Match Events</h3>
        </div>
        
        {matchEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No goals or cards recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {matchEvents.map((event, index) => {
              const isHome = event.teamId === match.homeParticipant.id;
              const teamName = isHome ? match.homeParticipant.name : match.awayParticipant.name;
              
              return (
                <div key={event.id || index} className="px-4 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-12 text-sm font-bold text-slate-500 text-right">
                    {event.matchTime || `${index + 1}'`}
                  </div>
                  <div className="text-xl">
                    {renderEventIcon(event)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">
                      {renderEventDescription(event)}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      {teamName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Lineups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Home Team */}
        <Card className="overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm uppercase truncate pr-2">
              {match.homeParticipant.name}
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {match.homeParticipant.score} Goals
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {(match.homeParticipant.players || []).length === 0 ? (
               <div className="p-4 text-center text-slate-400 text-xs">No lineup available</div>
            ) : (
              match.homeParticipant.players?.map(p => {
                const isCaptain = match.homeParticipant.squad?.captainId === p.playerId;
                const isGK = match.homeParticipant.squad?.goalkeeperId === p.playerId;
                
                return (
                  <div key={p.playerId} className="px-4 py-2 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">
                        {getPlayerName(p.playerId)}
                      </span>
                      {isCaptain && <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-1 rounded">C</span>}
                      {isGK && <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1 rounded">GK</span>}
                    </div>
                    {/* Stats badges */}
                    <div className="flex gap-1">
                      {p.goals && p.goals > 0 && (
                        <span className="bg-slate-100 text-slate-700 text-xs px-1.5 rounded-full flex items-center gap-1" title="Goals">
                          ⚽ {p.goals}
                        </span>
                      )}
                      {p.assists && p.assists > 0 && (
                         <span className="bg-blue-50 text-blue-700 text-xs px-1.5 rounded-full flex items-center gap-1" title="Assists">
                           A {p.assists}
                         </span>
                      )}
                      {p.yellowCards && p.yellowCards > 0 && <span title="Yellow Card">🟨</span>}
                      {p.redCards && p.redCards > 0 && <span title="Red Card">🟥</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Away Team */}
        <Card className="overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm uppercase truncate pr-2">
              {match.awayParticipant.name}
            </h3>
             <span className="text-xs font-bold text-slate-500">
              {match.awayParticipant.score} Goals
            </span>
          </div>
          <div className="divide-y divide-slate-100">
             {(match.awayParticipant.players || []).length === 0 ? (
               <div className="p-4 text-center text-slate-400 text-xs">No lineup available</div>
            ) : (
              match.awayParticipant.players?.map(p => {
                const isCaptain = match.awayParticipant.squad?.captainId === p.playerId;
                const isGK = match.awayParticipant.squad?.goalkeeperId === p.playerId;

                return (
                  <div key={p.playerId} className="px-4 py-2 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">
                        {getPlayerName(p.playerId)}
                      </span>
                      {isCaptain && <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-1 rounded">C</span>}
                      {isGK && <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1 rounded">GK</span>}
                    </div>
                    {/* Stats badges */}
                     <div className="flex gap-1">
                      {p.goals && p.goals > 0 && (
                        <span className="bg-slate-100 text-slate-700 text-xs px-1.5 rounded-full flex items-center gap-1" title="Goals">
                          ⚽ {p.goals}
                        </span>
                      )}
                      {p.assists && p.assists > 0 && (
                         <span className="bg-blue-50 text-blue-700 text-xs px-1.5 rounded-full flex items-center gap-1" title="Assists">
                           A {p.assists}
                         </span>
                      )}
                      {p.yellowCards && p.yellowCards > 0 && <span title="Yellow Card">🟨</span>}
                      {p.redCards && p.redCards > 0 && <span title="Red Card">🟥</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
