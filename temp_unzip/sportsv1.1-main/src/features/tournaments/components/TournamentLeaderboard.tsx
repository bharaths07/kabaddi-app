import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { Avatar } from '@/shared/components/ui/Avatar';
import { useTournamentStats } from '../hooks/useTournamentStats';
import { LeaderboardCategory } from '../types/stats';

export const TournamentLeaderboard: React.FC<{ tournamentId?: string }> = ({ tournamentId: propTournamentId }) => {
  const { tournamentId: paramTournamentId } = useParams();
  const tournamentId = propTournamentId || paramTournamentId || '';
  const { tournaments } = useGlobalState();
  const tournament = tournaments.find((t: any) => t.id === tournamentId);
  const isFootball = tournament?.sportId === 's2' || tournament?.sportId === 'football';
  const isKabaddi = tournament?.sportId === 's3' || tournament?.sportId === 'kabaddi';
  const isBadminton = tournament?.sportId === 's4' || tournament?.sportId === 'badminton';

  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>(
    isFootball || isBadminton ? 'GOALS' : // For Badminton, 'GOALS' is used for Sets won
      isKabaddi ? 'BAT' : // For Kabaddi, 'BAT' is used for Raid Points
        'BAT'
  );
  const [teamFilter, setTeamFilter] = useState<string>('All');
  const [minInnings, setMinInnings] = useState<number>(1);
  const [minOvers, setMinOvers] = useState<number>(1);
  const [minMatches, setMinMatches] = useState<number>(1);

  const { leaderboardData, matchCount } = useTournamentStats(tournamentId, activeCategory);

  // Filter Logic
  const filteredData = leaderboardData.filter(p => {
    if (teamFilter !== 'All' && p.teamName !== teamFilter) return false;
    if (activeCategory === 'BAT' && p.innings < minInnings) return false;
    if (activeCategory === 'BOWL' && p.overs < minOvers) return false;
    if ((activeCategory === 'GOALS' || activeCategory === 'ASSISTS') && p.matches < minMatches) return false;
    return true;
  });

  const topPerformer = filteredData[0];
  const otherPerformers = filteredData.slice(1, 10); // Top 10

  // Extract unique teams from data for filter
  const uniqueTeams = Array.from(new Set(leaderboardData.map(p => p.teamName)));
  const isTournamentEnded = false; // Could be derived from tournament status

  // Empty State: No matches
  if (matchCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-text-muted">
        <div className="text-5xl mb-4">{isFootball ? '⚽' : '🏏'}</div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {isFootball ? 'Waiting for the kickoff' : 'Waiting for the first ball'}
        </h3>
        <p>{isFootball ? 'Stats will appear after the first match.' : 'Batting leaderboard will appear after the first match.'}</p>
      </div>
    );
  }

  const categories: LeaderboardCategory[] = isFootball
    ? ['GOALS', 'ASSISTS', 'MVP']
    : isBadminton
      ? ['GOALS', 'MVP']
      : isKabaddi
        ? ['BAT', 'MVP']
        : ['BAT', 'BOWL', 'FIELD', 'MVP'];

  return (
    <div className="max-w-3xl mx-auto">
      {/* 1. Category Switcher */}
      <div className="flex justify-center gap-2 mb-6 bg-surface p-1.5 rounded-xl shadow-sm border border-border">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${activeCategory === cat
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:bg-muted hover:text-text-secondary'
              }`}
          >
            {cat === 'BAT' && (isKabaddi ? '🏃 RAID' : '🏏 BAT')}
            {cat === 'BOWL' && '🎯 BOWL'}
            {cat === 'FIELD' && '🧤 FIELD'}
            {cat === 'MVP' && '🏆 MVP'}
            {cat === 'GOALS' && (isBadminton ? '🏸 SETS' : '⚽ GOALS')}
            {cat === 'ASSISTS' && '👟 ASSISTS'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex justify-end gap-3 mb-6">
        <select
          aria-label="Team Filter"
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="px-3 py-1.5 rounded-md border border-border text-sm text-text-secondary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="All">All Teams</option>
          {uniqueTeams.map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>

        {activeCategory === 'BAT' && (
          <select
            aria-label="Minimum Innings"
            value={minInnings}
            onChange={(e) => setMinInnings(Number(e.target.value))}
            className="px-3 py-1.5 rounded-md border border-border text-sm text-text-secondary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value={1}>Min Innings: 1</option>
            <option value={3}>Min Innings: 3</option>
            <option value={5}>Min Innings: 5</option>
          </select>
        )}

        {activeCategory === 'BOWL' && (
          <select
            aria-label="Minimum Overs"
            value={minOvers}
            onChange={(e) => setMinOvers(Number(e.target.value))}
            className="px-3 py-1.5 rounded-md border border-border text-sm text-text-secondary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value={1}>Min Overs: 1</option>
            <option value={10}>Min Overs: 10</option>
            <option value={20}>Min Overs: 20</option>
          </select>
        )}

        {(activeCategory === 'GOALS' || activeCategory === 'ASSISTS') && (
          <select
            aria-label="Minimum Matches"
            value={minMatches}
            onChange={(e) => setMinMatches(Number(e.target.value))}
            className="px-3 py-1.5 rounded-md border border-border text-sm text-text-secondary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value={1}>Min Matches: 1</option>
            <option value={3}>Min Matches: 3</option>
            <option value={5}>Min Matches: 5</option>
          </select>
        )}
      </div>

      {/* 2. Top Performer Card */}
      {topPerformer ? (
        <div
          className={`relative mb-8 rounded-2xl p-6 text-white overflow-hidden shadow-lg cursor-pointer transition-transform duration-200 hover:-translate-y-1 ${activeCategory === 'BAT' ? 'bg-gradient-to-br from-orange-500 to-orange-700' :
            activeCategory === 'BOWL' ? 'bg-gradient-to-br from-violet-600 to-violet-900' :
              activeCategory === 'FIELD' ? 'bg-gradient-to-br from-emerald-600 to-emerald-800' :
                activeCategory === 'MVP' ? 'bg-gradient-to-br from-yellow-500 to-yellow-700' :
                  activeCategory === 'GOALS' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                    activeCategory === 'ASSISTS' ? 'bg-gradient-to-br from-cyan-500 to-cyan-700' :
                      'bg-gradient-to-br from-slate-800 to-slate-900'
            }`}
          onClick={() => console.log(`Navigate to player: ${topPerformer.name}`)}
        >
          {/* Badge */}
          <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider border border-white/30 uppercase">
            {activeCategory === 'BAT' && (isTournamentEnded ? 'BEST BATTER – TOURNAMENT' : 'ORANGE CAP HOLDER')}
            {activeCategory === 'BOWL' && (isTournamentEnded ? 'BEST BOWLER – TOURNAMENT' : 'PURPLE CAP HOLDER')}
            {activeCategory === 'FIELD' && (isTournamentEnded ? 'BEST FIELDER – TOURNAMENT' : 'BEST FIELDER')}
            {activeCategory === 'MVP' && 'TOURNAMENT MVP'}
            {activeCategory === 'GOALS' && 'GOLDEN BOOT'}
            {activeCategory === 'ASSISTS' && 'PLAYMAKER'}
          </div>

          <div className="flex items-center gap-6">
            <Avatar
              src={topPerformer.avatar}
              alt={topPerformer.name}
              fallback={topPerformer.name ? topPerformer.name.charAt(0) : 'P'}
              className="w-[90px] h-[90px] border-4 border-white/30"
            />
            <div className="flex-1">
              <div className="text-2xl font-extrabold mb-0.5 leading-tight">{topPerformer.name}</div>
              <div className="text-sm text-white/90 font-medium mb-4">{topPerformer.teamName}</div>

              <div className="flex gap-8 items-end">
                <div>
                  <div className="text-4xl font-extrabold leading-none">
                    {activeCategory === 'BAT' && topPerformer.runs}
                    {activeCategory === 'BOWL' && topPerformer.wickets}
                    {activeCategory === 'FIELD' && (topPerformer.catches + topPerformer.runOuts + topPerformer.stumpings)}
                    {activeCategory === 'MVP' && topPerformer.mvpPoints}
                    {activeCategory === 'GOALS' && topPerformer.goals}
                    {activeCategory === 'ASSISTS' && topPerformer.assists}
                  </div>
                  <div className="text-[11px] text-white/80 mt-1 uppercase tracking-widest font-semibold">
                    {activeCategory === 'BAT' && 'Total Runs'}
                    {activeCategory === 'BOWL' && 'Wickets'}
                    {activeCategory === 'FIELD' && 'Points'}
                    {activeCategory === 'MVP' && 'Points'}
                    {activeCategory === 'GOALS' && 'Goals'}
                    {activeCategory === 'ASSISTS' && 'Assists'}
                  </div>
                </div>

                {/* Secondary Stats */}
                <div className="flex gap-6 border-l border-white/20 pl-6 pb-1">
                  {activeCategory === 'BAT' && (
                    <>
                      <div>
                        <div className="text-base font-bold">{topPerformer.matches}</div>
                        <div className="text-[11px] text-white/80">Mat</div>
                      </div>
                      <div>
                        <div className="text-base font-bold">{topPerformer.innings}</div>
                        <div className="text-[11px] text-white/80">Inns</div>
                      </div>
                      <div>
                        <div className="text-base font-bold">{topPerformer.battingAvg.toFixed(1)}</div>
                        <div className="text-[11px] text-white/80">Avg</div>
                      </div>
                    </>
                  )}
                  {activeCategory === 'BOWL' && (
                    <>
                      <div>
                        <div className="text-base font-bold">{topPerformer.overs}</div>
                        <div className="text-[11px] text-white/80">Overs</div>
                      </div>
                      <div>
                        <div className="text-base font-bold">{topPerformer.bowlingAvg.toFixed(1)}</div>
                        <div className="text-[11px] text-white/80">Avg</div>
                      </div>
                      <div>
                        <div className="text-base font-bold">{topPerformer.economy.toFixed(1)}</div>
                        <div className="text-[11px] text-white/80">Econ</div>
                      </div>
                    </>
                  )}
                  {activeCategory === 'FIELD' && (
                    <>
                      <div>
                        <div className="text-base font-bold">{topPerformer.catches}</div>
                        <div className="text-[11px] text-white/80">Ct</div>
                      </div>
                      <div>
                        <div className="text-base font-bold">{topPerformer.runOuts}</div>
                        <div className="text-[11px] text-white/80">RO</div>
                      </div>
                      <div>
                        <div className="text-base font-bold">{topPerformer.stumpings}</div>
                        <div className="text-[11px] text-white/80">St</div>
                      </div>
                    </>
                  )}
                  {(activeCategory === 'GOALS' || activeCategory === 'ASSISTS') && (
                    <>
                      <div>
                        <div className="text-base font-bold">{topPerformer.matches}</div>
                        <div className="text-[11px] text-white/80">Mat</div>
                      </div>
                      <div>
                        <div className="text-base font-bold">{topPerformer.goals}</div>
                        <div className="text-[11px] text-white/80">Goals</div>
                      </div>
                      <div>
                        <div className="text-base font-bold">{topPerformer.assists}</div>
                        <div className="text-[11px] text-white/80">Ast</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-text-muted">
          No players match the current filters.
        </div>
      )}

      {/* 3. Ranked List Table */}
      {otherPerformers.length > 0 && (
        <div className="flex flex-col gap-0">

          {/* Table Header */}
          <div
            className={`grid px-6 pb-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider [grid-template-columns:${(activeCategory === 'BAT' || activeCategory === 'BOWL' || activeCategory === 'FIELD' || activeCategory === 'MVP' || activeCategory === 'GOALS' || activeCategory === 'ASSISTS')
              ? '40px_3fr_1fr_1fr_1fr_1fr'
              : '40px_3fr_1fr'
              }]`}
          >
            <div>#</div>
            <div>Player</div>
            {activeCategory === 'BAT' && (
              <>
                <div className="text-right">Runs</div>
                <div className="text-right">Avg</div>
                <div className="text-right">SR</div>
                <div className="text-right">Inns</div>
              </>
            )}
            {activeCategory === 'BOWL' && (
              <>
                <div className="text-right">Wkts</div>
                <div className="text-right">Avg</div>
                <div className="text-right">Eco</div>
                <div className="text-right">Overs</div>
              </>
            )}
            {activeCategory === 'FIELD' && (
              <>
                <div className="text-right">Pts</div>
                <div className="text-right">Ct</div>
                <div className="text-right">RO</div>
                <div className="text-right">St</div>
              </>
            )}
            {activeCategory === 'MVP' && (
              <>
                <div className="text-right">Pts</div>
                <div className="text-right">{isFootball ? 'Goals' : 'Runs'}</div>
                <div className="text-right">{isFootball ? 'Asts' : 'Wkts'}</div>
                <div className="text-right">{isFootball ? 'Cards' : 'Field'}</div>
              </>
            )}
            {(activeCategory === 'GOALS' || activeCategory === 'ASSISTS') && (
              <>
                <div className="text-right">{activeCategory === 'GOALS' ? 'Goals' : 'Asts'}</div>
                <div className="text-right">{activeCategory === 'GOALS' ? 'Asts' : 'Goals'}</div>
                <div className="text-right">Mat</div>
                <div className="text-right">Y/R</div>
              </>
            )}
          </div>

          {otherPerformers.map((player, index) => (
            <div
              key={player.id}
              onClick={() => console.log(`Navigate to player: ${player.name}`)}
              className={`bg-surface px-6 py-4 border-b border-border grid items-center cursor-pointer transition-colors duration-200 hover:bg-muted [grid-template-columns:${(activeCategory === 'BAT' || activeCategory === 'BOWL' || activeCategory === 'FIELD' || activeCategory === 'MVP' || activeCategory === 'GOALS' || activeCategory === 'ASSISTS')
                ? '40px_3fr_1fr_1fr_1fr_1fr'
                : '40px_3fr_1fr'
                }]`}
            >
              <div className="text-sm font-semibold text-text-muted">{index + 2}</div>

              <div className="flex items-center gap-3">
                <Avatar
                  src={player.avatar}
                  alt={player.name}
                  fallback={player.name.charAt(0)}
                  className="w-8 h-8 bg-muted"
                />
                <div>
                  <div className="text-sm font-semibold text-text-primary">{player.name}</div>
                  <div className="text-xs text-text-muted">{player.teamName}</div>
                </div>
              </div>

              {activeCategory === 'BAT' && (
                <>
                  <div className="text-right text-sm font-bold text-text-primary">{player.runs}</div>
                  <div className="text-right text-xs text-text-secondary">{player.battingAvg.toFixed(1)}</div>
                  <div className="text-right text-xs text-text-secondary">{player.battingSr.toFixed(0)}</div>
                  <div className="text-right text-xs text-text-secondary">{player.innings}</div>
                </>
              )}

              {activeCategory === 'BOWL' && (
                <>
                  <div className="text-right text-sm font-bold text-text-primary">{player.wickets}</div>
                  <div className="text-right text-xs text-text-secondary">{player.bowlingAvg.toFixed(1)}</div>
                  <div className="text-right text-xs text-text-secondary">{player.economy.toFixed(1)}</div>
                  <div className="text-right text-xs text-text-secondary">{player.overs}</div>
                </>
              )}

              {activeCategory === 'FIELD' && (
                <>
                  <div className="text-right text-sm font-bold text-text-primary">{player.catches + player.runOuts + player.stumpings}</div>
                  <div className="text-right text-xs text-text-secondary">{player.catches}</div>
                  <div className="text-right text-xs text-text-secondary">{player.runOuts}</div>
                  <div className="text-right text-xs text-text-secondary">{player.stumpings}</div>
                </>
              )}

              {activeCategory === 'MVP' && (
                <>
                  <div className="text-right text-sm font-bold text-text-primary">{player.mvpPoints}</div>
                  {isFootball ? (
                    <>
                      <div className="text-right text-xs text-text-secondary">{player.goals}</div>
                      <div className="text-right text-xs text-text-secondary">{player.assists}</div>
                      <div className="text-right text-xs text-text-secondary">{player.yellowCards}/{player.redCards}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-right text-xs text-text-secondary">{player.runs}</div>
                      <div className="text-right text-xs text-text-secondary">{player.wickets}</div>
                      <div className="text-right text-xs text-text-secondary">{player.catches + player.runOuts + player.stumpings}</div>
                    </>
                  )}
                </>
              )}

              {(activeCategory === 'GOALS' || activeCategory === 'ASSISTS') && (
                <>
                  <div className="text-right text-sm font-bold text-text-primary">
                    {activeCategory === 'GOALS' ? player.goals : player.assists}
                  </div>
                  <div className="text-right text-xs text-text-secondary">
                    {activeCategory === 'GOALS' ? player.assists : player.goals}
                  </div>
                  <div className="text-right text-xs text-text-secondary">{player.matches}</div>
                  <div className="text-right text-xs text-text-secondary">{player.yellowCards}/{player.redCards}</div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MVP Transparency Section */}
      {activeCategory === 'MVP' && (
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
          <div className="font-bold mb-2 text-slate-800">🏆 MVP SCORING MODEL</div>
          <div className="flex flex-wrap gap-4">
            {isFootball ? (
              <>
                <div>Goal: <span className="font-semibold">20 pts</span></div>
                <div>Assist: <span className="font-semibold">10 pts</span></div>
                <div>Clean Sheet: <span className="font-semibold">10 pts</span></div>
                <div>Yellow Card: <span className="font-semibold">-5 pts</span></div>
                <div>Red Card: <span className="font-semibold">-20 pts</span></div>
              </>
            ) : (
              <>
                <div>Runs: <span className="font-semibold">1 pt</span></div>
                <div>Wickets: <span className="font-semibold">25 pts</span></div>
                <div>Catches: <span className="font-semibold">10 pts</span></div>
                <div>Run-outs: <span className="font-semibold">10 pts</span></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
