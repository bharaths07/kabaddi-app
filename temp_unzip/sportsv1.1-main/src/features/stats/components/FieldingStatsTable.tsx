import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { FieldingStat } from '../hooks/useStats';
import { EmptyState } from '@/shared/components/EmptyState';
import { BarChart2 } from 'lucide-react';

interface FieldingStatsTableProps {
  stats: FieldingStat[];
  minQualification: boolean;
}

type SortField = 'totalDismissals' | 'catches' | 'runouts' | 'stumpings' | 'matches';
type SortOrder = 'asc' | 'desc';

export const FieldingStatsTable: React.FC<FieldingStatsTableProps> = ({ stats, minQualification }) => {
  const { players } = useGlobalState();
  const [sortField, setSortField] = useState<SortField>('totalDismissals');
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
    
    // Apply qualification filter when enabled
    if (minQualification) {
      data = data.filter(s => s.totalDismissals > 0);
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
        message="No fielding stats available"
        description="Stats will appear here once catches, run-outs, or stumpings are recorded."
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
            <th 
              className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider cursor-pointer select-none ${sortField === 'totalDismissals' ? 'text-slate-900' : 'text-slate-500'}`} 
              onClick={() => handleSort('totalDismissals')}
            >
              Dismissals
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('catches')}>Catches</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('runouts')}>Run Outs</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('stumpings')}>Stumpings</th>
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
                <td className="px-4 py-3 text-sm text-center font-bold text-slate-900">{stat.totalDismissals}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.catches}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.runouts}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.stumpings}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};
