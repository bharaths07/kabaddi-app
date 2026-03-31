import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { BattingStat } from '../hooks/useStats';
import { EmptyState } from '@/shared/components/EmptyState';
import { BarChart2 } from 'lucide-react';

interface BattingStatsTableProps {
  stats: BattingStat[];
  minQualification: boolean;
}

type SortField = 'runs' | 'average' | 'strikeRate' | 'highestScore' | 'innings' | 'matches';
type SortOrder = 'asc' | 'desc';

export const BattingStatsTable: React.FC<BattingStatsTableProps> = ({ stats, minQualification }) => {
  const { players } = useGlobalState();
  const [sortField, setSortField] = useState<SortField>('runs');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedStats = useMemo(() => {
    let data = [...stats];
    
    // Filter based on qualification (Example: > 0 runs or > 0 innings)
    if (minQualification) {
      // Basic rule: Must have played at least 2 innings or scored > 50 runs? 
      // User said "min innings / overs". Let's say min 1 inning for now if qualification is on.
      // Or maybe average calculation requires some minimums.
      // For V1, let's just hide those with 0 runs if qualification is on.
      data = data.filter(s => s.runs > 0);
    }

    return data.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [stats, sortField, sortOrder, minQualification]);

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : 'Unknown Player';
  };

  if (sortedStats.length === 0) {
    return (
      <EmptyState 
        icon={<BarChart2 size={48} />}
        message="No batting stats available"
        description="Try changing the filters or ensure matches have been scored."
      />
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none">Player</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('matches')}>Mat</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('innings')}>Inns</th>
            <th 
              className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider cursor-pointer select-none ${sortField === 'runs' ? 'text-slate-900' : 'text-slate-500'}`} 
              onClick={() => handleSort('runs')}
            >
              Runs
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('highestScore')}>HS</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('average')}>Avg</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('strikeRate')}>SR</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none">100s</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none">50s</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedStats.map((stat) => (
            <tr key={stat.playerId} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  <Link to={`/player/${stat.playerId}`} className="hover:text-blue-600 transition-colors">
                    {getPlayerName(stat.playerId)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.matches}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.innings}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-slate-900">{stat.runs}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.highestScore}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.average.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.strikeRate.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.hundreds}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.fifties}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};
