import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { TeamStat } from '../hooks/useStats';
import { EmptyState } from '@/shared/components/EmptyState';
import { BarChart2 } from 'lucide-react';

interface TeamStatsTableProps {
  stats: TeamStat[];
  minQualification: boolean;
  sportId?: string;
}

type SortField = 'winPercentage' | 'wins' | 'matches' | 'avgRunsScored' | 'points' | 'goalsFor' | 'goalsDiff' | 'draws' | 'losses' | 'goalsAgainst';
type SortOrder = 'asc' | 'desc';

export const TeamStatsTable: React.FC<TeamStatsTableProps> = ({ stats, minQualification, sportId = 's1' }) => {
  const { teams } = useGlobalState();
  const isFootball = sportId === 's3';
  const [sortField, setSortField] = useState<SortField>(isFootball ? 'points' : 'winPercentage');
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
      // Example: Min 1 match
      data = data.filter(s => s.matches > 0);
    }

    return data.sort((a, b) => {
      let valA: number, valB: number;

      // Helper for dynamic fields
      const getPoints = (t: TeamStat) => (t.wins * 3) + (t.draws * 1); // Standard Football Points
      const getGD = (t: TeamStat) => t.totalRunsScored - t.totalRunsConceded;

      switch (sortField) {
        case 'points':
          valA = getPoints(a);
          valB = getPoints(b);
          break;
        case 'goalsFor':
          valA = a.totalRunsScored;
          valB = b.totalRunsScored;
          break;
        case 'goalsAgainst':
          valA = a.totalRunsConceded;
          valB = b.totalRunsConceded;
          break;
        case 'goalsDiff':
          valA = getGD(a);
          valB = getGD(b);
          break;
        case 'winPercentage':
          valA = a.winPercentage;
          valB = b.winPercentage;
          break;
        case 'wins':
          valA = a.wins;
          valB = b.wins;
          break;
        case 'matches':
          valA = a.matches;
          valB = b.matches;
          break;
        case 'avgRunsScored':
          valA = a.avgRunsScored;
          valB = b.avgRunsScored;
          break;
        case 'draws':
          valA = a.draws;
          valB = b.draws;
          break;
        case 'losses':
          valA = a.losses;
          valB = b.losses;
          break;
      }
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [stats, sortField, sortOrder, minQualification]);

  const getTeamName = (id: string) => {
    const team = teams.find(t => t.id === id);
    return team ? team.name : 'Unknown Team';
  };

  if (sortedStats.length === 0) {
    return (
      <EmptyState 
        icon={<BarChart2 size={48} />}
        message="No team stats available"
        description="Team rankings will appear here once matches are completed."
      />
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none">Team</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('matches')}>Mat</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-green-700 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('wins')}>Won</th>
            {isFootball && (
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('draws')}>Drw</th>
            )}
            <th className="px-4 py-3 text-center text-xs font-semibold text-red-700 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('losses')}>Lost</th>
            
            {isFootball ? (
              <>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('goalsFor')}>GF</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('goalsAgainst')}>GA</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('goalsDiff')}>GD</th>
                <th 
                  className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider cursor-pointer select-none ${sortField === 'points' ? 'text-slate-900 font-bold' : 'text-slate-500'}`} 
                  onClick={() => handleSort('points')}
                >
                  Pts
                </th>
              </>
            ) : (
              <>
                <th 
                  className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider cursor-pointer select-none ${sortField === 'winPercentage' ? 'text-slate-900' : 'text-slate-500'}`} 
                  onClick={() => handleSort('winPercentage')}
                >
                  Win %
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('avgRunsScored')}>Avg Score</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none">Avg Conceded</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedStats.length === 0 ? (
            <tr>
              <td colSpan={isFootball ? 9 : 7} className="px-4 py-10 text-center text-slate-400">
                No team stats available.
              </td>
            </tr>
          ) : (
            sortedStats.map((stat) => (
              <tr key={stat.teamId} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  <Link to={`/team/${stat.teamId}`} className="hover:text-blue-600 transition-colors">
                    {getTeamName(stat.teamId)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.matches}</td>
                <td className="px-4 py-3 text-sm text-center font-semibold text-green-700">{stat.wins}</td>
                {isFootball && (
                  <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.draws}</td>
                )}
                <td className="px-4 py-3 text-sm text-center font-semibold text-red-700">{stat.losses}</td>
                
                {isFootball ? (
                  <>
                    <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.totalRunsScored}</td>
                    <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.totalRunsConceded}</td>
                    <td className={`px-4 py-3 text-sm text-center font-medium ${(stat.totalRunsScored - stat.totalRunsConceded) > 0 ? 'text-green-600' : (stat.totalRunsScored - stat.totalRunsConceded) < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                      {(stat.totalRunsScored - stat.totalRunsConceded) > 0 ? '+' : ''}{stat.totalRunsScored - stat.totalRunsConceded}
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-slate-900">{(stat.wins * 3) + (stat.draws * 1)}</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-sm text-center font-bold text-slate-900">{stat.winPercentage}%</td>
                    <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.avgRunsScored}</td>
                    <td className="px-4 py-3 text-sm text-center text-slate-600">{stat.avgRunsConceded}</td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
