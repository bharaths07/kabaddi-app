import React, { useState } from 'react';
import { Match } from '@/features/matches/types/match';
import { useGlobalState } from '@/app/AppProviders';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Activity, Clock } from 'lucide-react';

interface FootballLiveScorerProps {
  match: Match;
  onEndMatch: () => void;
  isEnding: boolean;
}

export const FootballLiveScorer: React.FC<FootballLiveScorerProps> = ({ match, onEndMatch, isEnding }) => {
  const { scoreMatch, undoMatchEvent, players } = useGlobalState();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'goal' | 'card' | 'substitution' | null>(null);
  const [cardType, setCardType] = useState<'yellow' | 'red'>('yellow');

  const currentPeriod = match.liveState?.currentPeriod || 1;

  const getPlayer = (id: string) => players.find((p: any) => p.id === id);

  const handleActionInitiate = (teamId: string, type: 'goal' | 'card' | 'substitution') => {
    setSelectedTeamId(teamId);
    setActionType(type);
    if (type === 'card') setCardType('yellow');
  };

  const confirmGoal = (scorerId?: string, assistId?: string) => {
    if (!selectedTeamId) return;
    scoreMatch(match.id, {
      id: `goal_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'goal',
      teamId: selectedTeamId,
      points: 1,
      scorerId: scorerId,
      assistId: assistId,
      period: currentPeriod,
      description: 'Goal'
    });
    resetSelection();
  };

  const confirmCard = (playerId: string) => {
    if (!selectedTeamId) return;
    scoreMatch(match.id, {
      id: `card_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'card',
      teamId: selectedTeamId,
      cardType: cardType,
      scorerId: playerId,
      points: 0,
      period: currentPeriod,
      description: `${cardType === 'yellow' ? 'Yellow' : 'Red'} Card`
    });
    resetSelection();
  };

  const confirmSubstitution = (playerInId: string, playerOutId: string) => {
    if (!selectedTeamId) return;
    scoreMatch(match.id, {
      id: `sub_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'substitution',
      teamId: selectedTeamId,
      playerInId,
      playerOutId,
      points: 0,
      period: currentPeriod,
      description: 'Substitution'
    });
    resetSelection();
  };

  const resetSelection = () => {
    setSelectedTeamId(null);
    setActionType(null);
  };

  const nextPeriod = () => {
    if (currentPeriod >= 2) return; // Simplified for 2 halves
    scoreMatch(match.id, {
      id: `period_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'period_start',
      period: currentPeriod + 1,
      points: 0,
      description: `Start of ${currentPeriod === 1 ? 'Second' : 'Next'} Half`
    });
  };

  const getSquad = (teamId: string) => {
    const participant = match.homeParticipant.id === teamId ? match.homeParticipant : match.awayParticipant;
    return participant.squad?.playerIds || [];
  };

  return (
    <div className="space-y-6">
      {/* Period & Time */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <span className="font-bold text-slate-800">{currentPeriod === 1 ? '1st Half' : '2nd Half'}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => undoMatchEvent(match.id)}
            disabled={!match.events?.length}
            className="text-xs h-8"
          >
            Undo Last
          </Button>
        </div>
        {currentPeriod < 2 && (
          <Button size="sm" variant="outline" onClick={nextPeriod}>End Half</Button>
        )}
      </div>

      {/* Scoreboard */}
      <Card className="bg-slate-900 text-white border-slate-800 p-6">
        <div className="flex justify-between items-center text-center">
          <div className="flex-1">
            <h3 className="text-slate-400 text-xs font-bold uppercase mb-2 truncate">{match.homeParticipant.name}</h3>
            <div className="text-5xl font-bold">{match.homeParticipant.score || 0}</div>
          </div>
          <div className="px-4 text-slate-500 font-bold text-xl">VS</div>
          <div className="flex-1">
            <h3 className="text-slate-400 text-xs font-bold uppercase mb-2 truncate">{match.awayParticipant.name}</h3>
            <div className="text-5xl font-bold">{match.awayParticipant.score || 0}</div>
          </div>
        </div>
      </Card>

      {/* Action Selection */}
      {selectedTeamId ? (
        <Card className="p-6 space-y-4 shadow-lg border-blue-100">
          <div className="flex justify-between items-center pb-2 border-b">
            <h3 className="text-lg font-bold text-slate-800">
              {actionType === 'goal' ? 'Select Scorer' : actionType === 'card' ? 'Select Player' : 'Substitution'}
            </h3>
            <Button variant="ghost" size="sm" onClick={resetSelection}>Cancel</Button>
          </div>

          {actionType === 'card' && (
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setCardType('yellow')}
                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${cardType === 'yellow' ? 'bg-yellow-400 text-yellow-900 shadow-sm' : 'text-slate-500'}`}
              >
                Yellow
              </button>
              <button
                onClick={() => setCardType('red')}
                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${cardType === 'red' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500'}`}
              >
                Red
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
            {getSquad(selectedTeamId).map(playerId => {
              const player = getPlayer(playerId);
              return (
                <button
                  key={playerId}
                  onClick={() => {
                    if (actionType === 'goal') confirmGoal(playerId);
                    else if (actionType === 'card') confirmCard(playerId);
                    else if (actionType === 'substitution') confirmSubstitution(playerId, 'placeholder_out_id');
                  }}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-left border border-slate-200 transition-all flex flex-col"
                >
                  <span className="font-bold text-slate-800 text-sm truncate">{player ? `${player.firstName} ${player.lastName}` : 'Unknown'}</span>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {playerId.slice(0, 4)}</span>
                </button>
              );
            })}
            {actionType === 'goal' && (
              <button
                onClick={() => confirmGoal(undefined)}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-left border border-slate-200 border-dashed text-slate-500 text-sm italic py-4"
              >
                Unknown / Own Goal
              </button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {[match.homeParticipant, match.awayParticipant].map((team, idx) => (
            <div key={team.id} className="space-y-3">
              <div className="text-center font-bold text-slate-400 text-[10px] uppercase tracking-wider">{team.name}</div>
              <Button
                className={`w-full h-16 text-xl shadow-md ${idx === 0 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-800 hover:bg-slate-900'}`}
                onClick={() => handleActionInitiate(team.id, 'goal')}
                icon={<Activity className="w-5 h-5 mr-1" />}
              >
                GOAL
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200 text-xs font-bold h-10"
                  onClick={() => handleActionInitiate(team.id, 'card')}
                >
                  Card
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 text-xs font-bold h-10"
                  onClick={() => handleActionInitiate(team.id, 'substitution')}
                >
                  Sub
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Control & Feed */}
      <div className="pt-6 border-t border-slate-100 space-y-4">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => resetSelection()}>Refresh</Button>
          <Button variant="danger" className="flex-1" onClick={onEndMatch} isLoading={isEnding}>End Match</Button>
        </div>

        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Events</h4>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {match.events?.slice(0, 5).map(event => (
              <div key={event.id} className="text-xs p-3 bg-white border border-slate-100 rounded-lg flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${event.type === 'goal' ? 'bg-green-500' : event.type === 'card' ? (event.cardType === 'red' ? 'bg-red-500' : 'bg-yellow-400') : 'bg-slate-300'}`} />
                  <span className="font-medium text-slate-700">{event.description}</span>
                  {event.scorerId && <span className="text-slate-400">- {players.find((p: any) => p.id === event.scorerId)?.lastName}</span>}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{event.matchTime || 'LIVE'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
