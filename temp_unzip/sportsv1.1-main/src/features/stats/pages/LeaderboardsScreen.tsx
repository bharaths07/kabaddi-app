import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { Trophy, ChevronRight, Search, Calendar, MapPin } from 'lucide-react';
import { calculateTournamentStats, sortLeaderboard, filterMatchesForStats, StatFilters } from '@/features/tournaments/api/statsService';
import { LeaderboardCategory, TournamentPlayerStats } from '@/features/tournaments/types/stats';
import { Skeleton } from '@/shared/components/ui/Skeleton';

export const LeaderboardsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { players, matches, teams, isLoading } = useGlobalState();

  const [filters, setFilters] = React.useState<StatFilters>({
    sportId: 's1', // Default to Cricket
    season: new Date().getFullYear().toString(),
  });

  const [category, setCategory] = React.useState<LeaderboardCategory>('BAT');

  const filteredMatches = useMemo(() => {
    return filterMatchesForStats(matches, filters).filter(m => m.status === 'completed');
  }, [matches, filters]);

  const stats = useMemo(() => {
    return calculateTournamentStats(filteredMatches, teams, players);
  }, [filteredMatches, teams, players]);

  const leaderboard = useMemo(() => {
    return sortLeaderboard(stats, category).slice(0, 50);
  }, [stats, category]);

  const sports = [
    { id: 's1', name: 'Cricket', categories: ['BAT', 'BOWL', 'FIELD', 'MVP'] as LeaderboardCategory[] },
    { id: 's2', name: 'Football', categories: ['GOALS', 'ASSISTS', 'MVP'] as LeaderboardCategory[] },
  ];

  const currentSport = sports.find(s => s.id === filters.sportId) || sports[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="text-yellow-500 w-6 h-6" />
            Hall of Legends
          </h1>
          <button
            type="button"
            onClick={() => navigate('/stats')}
            className="text-sm font-semibold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-blue-100"
          >
            My Stats
          </button>
        </div>

        {/* Sport & Category Tabs */}
        <div className="px-6 pb-2 space-y-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
            {sports.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setFilters({ ...filters, sportId: s.id });
                  setCategory(s.categories[0]);
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filters.sportId === s.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {currentSport.categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-none px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${category === cat
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg min-w-fit">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            className="bg-transparent text-xs font-bold text-slate-700 outline-none"
            value={filters.season || ''}
            onChange={(e) => setFilters({ ...filters, season: e.target.value })}
          >
            <option value="2026">2026 Season</option>
            <option value="2025">2025 Season</option>
            <option value="2024">2024 Season</option>
          </select>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg min-w-fit">
          <MapPin className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Region..."
            className="bg-transparent text-xs font-bold text-slate-700 outline-none placeholder:text-slate-400 w-32"
            value={filters.region || ''}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="space-y-1 text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                    <Skeleton className="h-2 w-12 ml-auto" />
                  </div>
                  <Skeleton className="w-10 h-10 rounded-xl" />
                </div>
              </div>
            ))
          ) : leaderboard.map((row: TournamentPlayerStats, idx: number) => {
            const displayValue =
              category === 'BAT' ? `${row.runs} Runs` :
                category === 'BOWL' ? `${row.wickets} Wkts` :
                  category === 'GOALS' ? `${row.goals} Goals` :
                    category === 'ASSISTS' ? `${row.assists} Assists` :
                      `${row.mvpPoints.toFixed(0)} Pts`;

            const detailValue =
              category === 'BAT' ? `Avg ${row.battingAvg.toFixed(1)} • SR ${row.battingSr.toFixed(1)}` :
                category === 'BOWL' ? `Econ ${row.economy.toFixed(2)}` :
                  category === 'GOALS' ? `${row.hatTricks} Hat-tricks` :
                    `${row.matches} Matches`;

            return (
              <div
                key={row.id}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg rotate-3 group-hover:rotate-0 transition-transform ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-200' :
                        idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                          idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                            'bg-slate-100 !text-slate-400'
                        }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-900 text-base">{row.name}</p>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">
                          {row.teamCode}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mt-0.5 capitalize">
                        {detailValue}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-black text-blue-600 tabular-nums">{displayValue}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current Rank</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/players/${row.id}`)}
                      className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {leaderboard.length === 0 && (
            <div className="text-center py-20 px-10 bg-white border border-slate-200 rounded-3xl space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Search className="text-slate-300 w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">No Legends Found</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  We couldn't find any rankings matching these filters. Try adjusting your search or category.
                </p>
              </div>
              <button
                onClick={() => {
                  setFilters({ sportId: 's1', season: '2026' });
                  setCategory('BAT');
                }}
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
