import React from 'react';
import { MatchState } from '@/features/system/types/cardScoring';

type Props = {
  state: MatchState | null;
  height?: number;
};

const colors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0ea5e9'];

export const ScoreChart: React.FC<Props> = ({ state, height = 180 }) => {
  if (!state) return <div className="text-sm text-slate-500">No data</div>;
  const rounds = state.rounds.length;
  const players = state.players;

  const cumulative: Record<string, number[]> = {};
  players.forEach(p => (cumulative[p] = []));

  let maxTotal = 0;
  for (let r = 0; r < rounds; r++) {
    const totals = new Map<string, number>();
    players.forEach(p => totals.set(p, 0));
    for (let i = 0; i <= r; i++) {
      state.rounds[i].scores.forEach(s => totals.set(s.playerId, (totals.get(s.playerId) || 0) + s.points));
    }
    players.forEach(p => {
      const val = totals.get(p) || 0;
      cumulative[p].push(val);
      maxTotal = Math.max(maxTotal, val);
    });
  }

  const width = 600;
  const padding = 24;
  const contentW = width - padding * 2;
  const contentH = height - padding * 2;
  const xStep = rounds > 1 ? contentW / (rounds - 1) : 0;
  const yScale = maxTotal > 0 ? contentH / maxTotal : 1;

  const toX = (idx: number) => padding + idx * xStep;
  const toY = (val: number) => height - padding - val * yScale;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" height={height}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" />

        {players.map((p, idx) => {
          const points = cumulative[p];
          const d = points
            .map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`)
            .join(' ');
          return (
            <g key={p}>
              <path d={d} fill="none" stroke={colors[idx % colors.length]} strokeWidth={2} />
              {points.map((v, i) => (
                <circle key={`${p}-${i}`} cx={toX(i)} cy={toY(v)} r={3} fill={colors[idx % colors.length]} />
              ))}
            </g>
          );
        })}

        {Array.from({ length: rounds }).map((_, i) => (
          <text key={`x-${i}`} x={toX(i)} y={height - padding + 14} fontSize="10" textAnchor="middle" fill="#64748b">
            R{i + 1}
          </text>
        ))}
        <text x={padding} y={padding - 8} fontSize="10" fill="#64748b">
          Total
        </text>
      </svg>
      <div className="flex gap-3 mt-2 flex-wrap">
        {players.map((p, idx) => (
          <div key={p} className="flex items-center gap-2 text-xs">
            <span className={`inline-block w-3 h-3 rounded [background-color:${colors[idx % colors.length]}]`} />
            <span className="text-slate-700">{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
