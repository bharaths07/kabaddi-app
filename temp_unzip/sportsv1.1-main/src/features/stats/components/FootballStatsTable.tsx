import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { FootballStat } from '../hooks/useStats';
import { EmptyState } from '@/shared/components/EmptyState';
import { BarChart2 } from 'lucide-react';

interface FootballStatsTableProps {
  stats: FootballStat[];
  minQualification: boolean;
}

type SortField = 'goals' | 'assists' | 'minutesPlayed' | 'yellowCards' | 'redCards' | 'goalsPerMatch' | 'matches' | 'cleanSheets' | 'hatTricks';
type SortOrder = 'asc' | 'desc';

export const FootballStatsTable: React.FC<FootballStatsTableProps> = ({ stats, minQualification }) => {
  const { players } = useGlobalState();
  const [sortField, setSortField] = useState<SortField>('goals');
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
    
    if (minQualification) {
      // Must have played at least 1 match
      data = data.filter(s => s.matches > 0);
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
        message="No football stats available"
        description="Player stats will appear here once matches are recorded."
      />
    );
  }

  if (sortedStats.length === 0) {
    return (
      <EmptyState 
        icon={<BarChart2 size={48} />}
        message="No football stats available"
        description="Player stats will appear here once matches are recorded."
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
              className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider cursor-pointer select-none ${sortField === 'goals' ? 'text-slate-900' : 'text-slate-500'}`} 
              onClick={() => handleSort('goals')}
            >
              Goals
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('assists')}>Assists</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('hatTricks')}>HT</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('cleanSheets')}>CS</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('goalsPerMatch')}>G/M</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('minutesPlayed')}>Mins</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('yellowCards')}>YC</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('redCards')}>RC</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedStats.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                No football stats available for current filters.
              </td>
            </tr>
          ) : (
            sortedStats.map((stat) => (
              <tr key={stat.playerId} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  <Link to={`/player/${stat.playerId}`} className="hover:text-blue-600 transition-colors">
                    {getPlayerName(stat.playerId)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.matches}</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-slate-900">{stat.goals}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.assists}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.hatTricks}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.cleanSheets}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.goalsPerMatch.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.minutesPlayed}</td>
                <td className="px-4 py-3 text-sm text-center text-yellow-600 font-medium">{stat.yellowCards}</td>
                <td className="px-4 py-3 text-sm text-center text-red-600 font-medium">{stat.redCards}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
