import React, { useState } from 'react';
import { Match, ScoreEvent } from '@/features/matches/types/match';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { useGlobalState } from '@/app/AppProviders';

interface Props {
  match: Match;
  onEndMatch: () => void;
  isEnding: boolean;
  onScore: (event: ScoreEvent) => void;
}

export const BasketballLiveScorer: React.FC<Props> = ({ match, onEndMatch, isEnding, onScore }) => {
  const { undoMatchEvent, players } = useGlobalState();
  const [teamId, setTeamId] = useState<string>(match.homeParticipant.id);
  const [scorerId, setScorerId] = useState<string>('');
  const [assistId, setAssistId] = useState<string>('');

  const currentPeriod = match.liveState?.currentPeriod || 1;

  const getPlayerName = (id: string) => {
    const p = players.find((player: any) => player.id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
  };

  const currentSquad = (match.homeParticipant.id === teamId ? match.homeParticipant : match.awayParticipant).squad?.playerIds || [];

  const handleScoreAction = (type: ScoreEvent['type'], points: number = 0) => {
    onScore({
      id: `bball_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      teamId,
      points,
      scorerId: scorerId || undefined,
      assistId: assistId || undefined,
      period: currentPeriod,
      description: type === 'basket' ? `${points}-point basket` : type === 'foul' ? 'Personal foul' : type === 'timeout' ? 'Timeout' : 'Event'
    });
    setAssistId('');
  };

  const nextPeriod = () => {
    if (currentPeriod >= 4) return;
    onScore({
      id: `period_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'period_start',
      period: currentPeriod + 1,
      points: 0,
      description: `Start of Quarter ${currentPeriod + 1}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Period Header */}
      <div className="flex items-center justify-between bg-slate-100 p-3 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700">Quarter {currentPeriod}</span>
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
        {currentPeriod < 4 && (
          <Button size="sm" variant="outline" onClick={nextPeriod}>
            Start Next Quarter
          </Button>
        )}
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Select Team</label>
          <div className="grid grid-cols-2 gap-2">
            {[match.homeParticipant, match.awayParticipant].map(t => (
              <button
                key={t.id}
                onClick={() => { setTeamId(t.id); setScorerId(''); }}
                className={`p-3 rounded-lg border text-sm font-bold transition-all ${teamId === t.id ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-600 border-slate-200'}`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Select Player</label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {currentSquad.map(pid => (
              <button
                key={pid}
                onClick={() => setScorerId(pid)}
                className={`p-2 rounded border text-xs text-left truncate transition-all ${scorerId === pid ? 'bg-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
              >
                {getPlayerName(pid)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase">Points</h4>
          <div className="grid grid-cols-1 gap-2">
            <Button className="bg-orange-600 hover:bg-orange-700 h-12" onClick={() => handleScoreAction('basket', 1)}>1 PT (FT)</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 h-12" onClick={() => handleScoreAction('basket', 2)}>2 PT</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 h-12" onClick={() => handleScoreAction('basket', 3)}>3 PT</Button>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase">Other</h4>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" className="h-12 border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleScoreAction('foul')}>Foul</Button>
            <Button variant="outline" className="h-12 border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => handleScoreAction('timeout')}>Timeout</Button>
          </div>
        </Card>
      </div>

      <div className="pt-4 border-t">
        <Button variant="danger" className="w-full" onClick={onEndMatch} disabled={isEnding}>
          {isEnding ? 'Ending Match...' : 'End Match'}
        </Button>
      </div>
    </div>
  );
};
