import React from 'react';
import { MatchState } from '@/features/system/types/cardScoring';

type Props = {
  state: MatchState | null;
};

export const Scoreboard: React.FC<Props> = ({ state }) => {
  if (!state) return <div className="text-sm text-slate-500">No match initialized</div>;
  const round = state.rounds[state.currentRound - 1];
  const totals = new Map<string, number>();
  state.players.forEach(p => totals.set(p, 0));
  state.rounds.forEach(r => r.scores.forEach(s => totals.set(s.playerId, (totals.get(s.playerId) || 0) + s.points)));

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm">
          <div className="font-bold text-slate-900">Round {state.currentRound}</div>
          <div className="text-xs text-slate-500">Game: {state.gameId} • Started: {new Date(state.startedAt).toLocaleString()}</div>
        </div>
        <div>
          {state.endedAt ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
              Completed
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700">
              Live
            </span>
          )}
        </div>
      </div>
      {state.winnerIds && state.winnerIds.length > 0 && (
        <div className="mb-3 text-sm">
          <span className="font-semibold text-green-700">Winners:</span>{' '}
          <span className="text-slate-800">{state.winnerIds.join(', ')}</span>
        </div>
      )}
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="px-2 py-2">Player</th>
            <th className="px-2 py-2">Round</th>
            <th className="px-2 py-2">Bonus</th>
            <th className="px-2 py-2">Penalty</th>
            <th className="px-2 py-2">Rounds Won</th>
            <th className="px-2 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {round.scores.map(row => (
            <tr key={row.playerId} className="border-t border-slate-200">
              <td className="px-2 py-2">{row.playerId}</td>
              <td className="px-2 py-2">{row.points}</td>
              <td className="px-2 py-2 text-green-600">{row.bonuses}</td>
              <td className="px-2 py-2 text-red-600">{row.penalties}</td>
              <td className="px-2 py-2">{row.roundsWon}</td>
              <td className="px-2 py-2 font-semibold">{totals.get(row.playerId) || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
