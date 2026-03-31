import React, { useMemo, useState } from 'react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { listGames, createMatch, getEngine } from '@/api/cardScoring';
import { ScoreEventType } from '@/features/system/types/cardScoring';

export const CardScoringDemoScreen: React.FC = () => {
  const games = useMemo(() => listGames(), []);
  const [gameId, setGameId] = useState<string>(games[0]?.id || 'hearts');
  const [playersInput, setPlayersInput] = useState('p1,p2,p3,p4');
  const [matchId, setMatchId] = useState<string>('demo_match');
  const [initialized, setInitialized] = useState(false);
  type EngineState = {
    players: string[];
    rounds: Array<{ scores: Array<{ playerId: string; points: number }> }>;
    currentRound: number;
  } | null;
  const [state, setState] = useState<EngineState>(null);

  const init = () => {
    const players = playersInput.split(',').map(s => s.trim()).filter(Boolean);
    const eng = createMatch(gameId, matchId, players);
    eng.onUpdate((next) => setState({ ...next }));
    setState(eng.getState());
    setInitialized(true);
  };

  const submit = (type: ScoreEventType, payload: Record<string, unknown> = {}, playerId?: string) => {
    const eng = getEngine(matchId);
    eng.submitEvent({ id: `${Date.now()}`, type, playerId, payload });
    setState(eng.getState());
  };

  return (
    <PageContainer>
      <PageHeader title="Card Scoring Demo" description="Simulate events and observe scoring updates" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Game</label>
              <select
                value={gameId}
                onChange={e => setGameId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {games.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Players (comma separated)</label>
              <input
                value={playersInput}
                onChange={e => setPlayersInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Match ID</label>
              <input
                value={matchId}
                onChange={e => setMatchId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm"
              />
            </div>
            <Button onClick={init} disabled={initialized} className="w-full">
              {initialized ? 'Initialized' : 'Initialize'}
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-3">
            <div className="text-sm font-bold text-slate-900">Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => submit('card', { rank: 'Q', suit: 'spades' }, state?.players[0])}>Hearts: Q♠ to P1</Button>
              <Button variant="secondary" onClick={() => submit('card', { suit: 'hearts', rank: '5' }, state?.players[0])}>Hearts: ♥ to P1</Button>
              <Button variant="secondary" onClick={() => submit('bid', { value: 3 }, state?.players[0])}>Spades: Bid 3 (P1)</Button>
              <Button variant="secondary" onClick={() => submit('trick', {}, state?.players[0])}>Spades: Trick (P1)</Button>
              <Button variant="secondary" onClick={() => submit('meld', { cards: [{ rank: 'A' }, { rank: 'K' }, { rank: 'Q' }] }, state?.players[0])}>Rummy: Meld AKQ (P1)</Button>
              <Button variant="secondary" onClick={() => submit('round_end', { playerId: state?.players[0] })}>Round End</Button>
              <Button variant="secondary" onClick={() => submit('match_end', {})}>Match End</Button>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-bold text-slate-900 mb-2">Current State</div>
          <pre className="text-xs bg-slate-50 p-3 rounded border border-slate-200 overflow-auto max-h-[50vh]">
            {JSON.stringify(state, null, 2)}
          </pre>
        </Card>
      </div>
    </PageContainer>
  );
};
