import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { BowlingStat } from '../hooks/useStats';
import { EmptyState } from '@/shared/components/EmptyState';
import { BarChart2 } from 'lucide-react';

interface BowlingStatsTableProps {
  stats: BowlingStat[];
  minQualification: boolean;
}

type SortField = 'wickets' | 'economy' | 'average' | 'matches' | 'bestBowlingWickets';
type SortOrder = 'asc' | 'desc';

export const BowlingStatsTable: React.FC<BowlingStatsTableProps> = ({ stats, minQualification }) => {
  const { players } = useGlobalState();
  const [sortField, setSortField] = useState<SortField>('wickets');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'economy' || field === 'average' ? 'asc' : 'desc'); // Lower eco/avg is better
    }
  };

  const sortedStats = useMemo(() => {
    let data = [...stats];
    
    if (minQualification) {
      data = data.filter(s => s.wickets > 0);
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
        message="No bowling stats available"
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
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none">Overs</th>
            <th 
              className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider cursor-pointer select-none ${sortField === 'wickets' ? 'text-slate-900' : 'text-slate-500'}`} 
              onClick={() => handleSort('wickets')}
            >
              Wkts
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('average')}>Avg</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('economy')}>Eco</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('bestBowlingWickets')}>BBI</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none">3W</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none">5W</th>
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
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.overs}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-slate-900">{stat.wickets}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.average.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.economy.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.bestBowlingWickets}/{stat.bestBowlingRuns}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.threeWickets}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.fiveWickets}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};
