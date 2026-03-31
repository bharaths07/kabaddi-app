import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Match } from '@/features/matches/types/match';
import { Player } from '@/features/players/types/player';
import { Team } from '@/features/teams/types/team';
import { Skeleton } from '@/shared/components/ui/Skeleton';

export const PlayerProfileScreen: React.FC = () => {
    const { playerId } = useParams<{ playerId: string }>();
    const navigate = useNavigate();
    const { players, matches, teams, isLoading } = useGlobalState();
    const [activeTab, setActiveTab] = useState<'overview' | 'batting' | 'bowling' | 'fielding' | 'stats'>('overview');

    const player = players.find((p: Player) => p.id === playerId);

    // --- Aggregation Logic ---
    const stats = useMemo(() => {
        if (!player) return null;

        // Filter matches where this player participated
        const playerMatches = matches.filter((m: Match) =>
            (m.homeParticipant.players?.some((p) => p.playerId === player.id) ||
                m.awayParticipant.players?.some((p) => p.playerId === player.id)) &&
            m.status === 'completed'
        ).sort((a: Match, b: Match) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Determine Sport (Use most recent match or default to Cricket)
        const sportId = playerMatches.length > 0 ? playerMatches[0].sportId : 's1';
        const isFootball = sportId === 's3';

        // Cricket Stats
        let totalMatches = 0;
        let runs = 0;
        let ballsFaced = 0;
        let wickets = 0;
        let fours = 0;
        let sixes = 0;
        let highestScore = 0;
        let bestBowlingWickets = 0;
        let bestBowlingRuns = 0;

        // Football Stats
        let goals = 0;
        let assists = 0;
        let yellowCards = 0;
        let redCards = 0;
        // let minutesPlayed = 0;

        totalMatches = playerMatches.length;

        // Iterate matches to sum stats
        playerMatches.forEach((m: Match) => {
            const homeP = m.homeParticipant.players?.find((p) => p.playerId === player.id);
            const awayP = m.awayParticipant.players?.find((p) => p.playerId === player.id);
            const pStats = homeP || awayP;

            if (pStats) {
                if (isFootball) {
                    goals += pStats.goals || 0;
                    assists += pStats.assists || 0;
                    yellowCards += pStats.yellowCards || 0;
                    redCards += pStats.redCards || 0;
                    // minutesPlayed += pStats.minutesPlayed || 0;
                    // Mock clean sheets if GK and conceded 0 (logic needed, or rely on stored stat)
                } else {
                    runs += pStats.runs || 0;
                    ballsFaced += pStats.balls || 0;
                    wickets += pStats.wickets || 0;

                    if ((pStats.runs || 0) > highestScore) highestScore = pStats.runs || 0;

                    if ((pStats.wickets || 0) > bestBowlingWickets) {
                        bestBowlingWickets = pStats.wickets || 0;
                        bestBowlingRuns = 20; // Mock placeholder
                    }
                }
            }

            // Scan events for boundaries (Cricket) or other details
            m.events?.forEach((e) => {
                if (e.scorerId === player.id) {
                    if (!isFootball) {
                        if (e.type === 'delivery' && e.runsScored === 4) fours++;
                        if (e.type === 'delivery' && e.runsScored === 6) sixes++;
                    }
                }
            });
        });

        // Calculations
        const battingAvg = totalMatches > 0 ? (runs / totalMatches).toFixed(1) : '0.0';
        const strikeRate = ballsFaced > 0 ? ((runs / ballsFaced) * 100).toFixed(1) : '0.0';
        const goalsPerMatch = totalMatches > 0 ? (goals / totalMatches).toFixed(2) : '0.0';

        return {
            isFootball,
            totalMatches,
            // Cricket
            runs,
            wickets,
            battingAvg,
            strikeRate,
            highestScore,
            bestBowling: `${bestBowlingWickets}/${bestBowlingRuns}`,
            fours,
            sixes,
            // Football
            goals,
            assists,
            yellowCards,
            redCards,
            goalsPerMatch,
            recentMatches: playerMatches.slice(0, 5)
        };
    }, [player, matches]);

    React.useEffect(() => {
        if (stats?.isFootball && activeTab === 'batting') {
            setActiveTab('overview');
        }
    }, [stats?.isFootball, activeTab]);

    if (isLoading) {
        return (
            <div className="pb-10 bg-slate-50 min-h-screen">
                <div className="bg-white px-5 py-6 sticky top-0 z-10 border-b border-slate-200 shadow">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-5 max-w-[800px] mx-auto space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                        <Skeleton className="h-24 rounded-xl" />
                        <Skeleton className="h-24 rounded-xl" />
                        <Skeleton className="h-24 rounded-xl" />
                    </div>
                    <Skeleton className="h-64 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!player) {
        return <div className="p-5 text-center">Player not found</div>;
    }

    const teamIds = teams.filter((t: Team) => t.members.some((m) => m.playerId === player.id)).map((t: Team) => t.name);


    return (
        <div className="pb-10 bg-slate-50 min-h-screen">
            {/* 1. Header (Soft Sticky) */}
            <div className="bg-white px-5 py-6 sticky top-0 z-10 border-b border-slate-200 shadow">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar
                        src={player.avatarUrl}
                        fallback={`${player.firstName[0]}${player.lastName[0]}`}
                        className="w-16 h-16 border-4 border-slate-200 text-2xl font-bold bg-slate-200 text-slate-500"
                    />

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="text-[20px] font-extrabold text-slate-900 mb-1">
                            {player.firstName} {player.lastName}
                        </h1>
                        <div className="text-[14px] text-slate-500 mb-2">
                            {teamIds.join(', ') || 'Free Agent'}
                        </div>
                        <div className="flex gap-2">
                            <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-1 rounded-full uppercase">
                                {player.role || 'Player'}
                            </span>
                            {stats?.isFootball && (
                                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-1 rounded-full uppercase">
                                    Football
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Jersey Number */}
                    {player.jerseyNumber && (
                        <div className="text-[32px] font-black text-slate-200 leading-none">
                            {player.jerseyNumber}
                        </div>
                    )}
                </div>

                <div className="mt-4 text-[13px] text-slate-600 flex gap-4">
                    {!stats?.isFootball ? (
                        <>
                            <div>🏏 {player.battingStyle || 'Right-hand bat'}</div>
                            <div>🥎 {player.bowlingStyle || 'Right-arm medium'}</div>
                        </>
                    ) : (
                        <div>⚽ Football Player</div>
                    )}
                </div>
            </div>

            <div className="p-5 max-w-[800px] mx-auto">

                {/* 2. Career Summary */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                        <div className="text-[24px] font-extrabold text-slate-900">{stats?.totalMatches}</div>
                        <div className="text-[12px] font-semibold text-slate-500 uppercase">Matches</div>
                    </div>

                    {stats?.isFootball ? (
                        <>
                            <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                                <div className="text-[24px] font-extrabold text-slate-900">{stats?.goals}</div>
                                <div className="text-[12px] font-semibold text-slate-500 uppercase">Goals</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                                <div className="text-[24px] font-extrabold text-slate-900">{stats?.assists}</div>
                                <div className="text-[12px] font-semibold text-slate-500 uppercase">Assists</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                                <div className="text-[24px] font-extrabold text-slate-900">{stats?.runs}</div>
                                <div className="text-[12px] font-semibold text-slate-500 uppercase">Runs</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                                <div className="text-[24px] font-extrabold text-slate-900">{stats?.wickets}</div>
                                <div className="text-[12px] font-semibold text-slate-500 uppercase">Wickets</div>
                            </div>
                        </>
                    )}
                </div>

                {/* 3. Detailed Stats Tabs */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
                    <div className="flex border-b border-slate-100">
                        {stats?.isFootball ? (
                            (['overview', 'stats'] as Array<'overview' | 'stats'>).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 capitalize ${activeTab === tab ? 'bg-slate-50 border-b-2 border-slate-900 font-bold text-slate-900' : 'bg-white border-b-2 border-transparent font-medium text-slate-500'}`}
                                >
                                    {tab}
                                </button>
                            ))
                        ) : (
                            (['batting', 'bowling', 'fielding'] as Array<'batting' | 'bowling' | 'fielding'>).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 capitalize ${activeTab === tab ? 'bg-slate-50 border-b-2 border-slate-900 font-bold text-slate-900' : 'bg-white border-b-2 border-transparent font-medium text-slate-500'}`}
                                >
                                    {tab}
                                </button>
                            ))
                        )}
                    </div>

                    <div className="p-5">
                        {/* Football Content */}
                        {stats?.isFootball && activeTab === 'overview' && (
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <div className="text-[12px] text-slate-500 mb-1">Goals/Match</div>
                                    <div className="text-[18px] font-bold">{stats?.goalsPerMatch}</div>
                                </div>
                                <div>
                                    <div className="text-[12px] text-slate-500 mb-1">Discipline</div>
                                    <div className="text-[18px] font-bold">
                                        <span className="text-yellow-600 mr-2">🟨 {stats?.yellowCards}</span>
                                        <span className="text-red-600">🟥 {stats?.redCards}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {stats?.isFootball && activeTab === 'stats' && (
                            <div className="text-center text-slate-400 p-5">
                                Detailed football stats coming soon.
                            </div>
                        )}

                        {/* Cricket Content */}
                        {!stats?.isFootball && activeTab === 'batting' && (
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <div className="text-[12px] text-slate-500 mb-1">Average</div>
                                    <div className="text-[18px] font-bold">{stats?.battingAvg}</div>
                                </div>
                                <div>
                                    <div className="text-[12px] text-slate-500 mb-1">Strike Rate</div>
                                    <div className="text-[18px] font-bold">{stats?.strikeRate}</div>
                                </div>
                                <div>
                                    <div className="text-[12px] text-slate-500 mb-1">Highest Score</div>
                                    <div className="text-[18px] font-bold">{stats?.highestScore}</div>
                                </div>
                                <div>
                                    <div className="text-[12px] text-slate-500 mb-1">Boundaries</div>
                                    <div className="text-[18px] font-bold">{stats?.fours} (4s) / {stats?.sixes} (6s)</div>
                                </div>
                            </div>
                        )}
                        {!stats?.isFootball && activeTab === 'bowling' && (
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <div className="text-[12px] text-slate-500 mb-1">Wickets</div>
                                    <div className="text-[18px] font-bold">{stats?.wickets}</div>
                                </div>
                                <div>
                                    <div className="text-[12px] text-slate-500 mb-1">Best Figures</div>
                                    <div className="text-[18px] font-bold">{stats?.bestBowling}</div>
                                </div>
                            </div>
                        )}
                        {!stats?.isFootball && activeTab === 'fielding' && (
                            <div className="text-center text-slate-400 p-5">
                                Fielding stats not yet available
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Recent Form */}
                <div className="mb-10">
                    <h3 className="text-[16px] font-bold text-slate-900 mb-3">Recent Form</h3>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                        {stats?.recentMatches.length === 0 ? (
                            <div className="p-5 text-center text-slate-400">No recent matches</div>
                        ) : (
                            stats?.recentMatches.map((m: Match) => {
                                const isHome = m.homeParticipant.players?.some((p) => p.playerId === player.id);
                                const opponent = isHome ? m.awayParticipant.name : m.homeParticipant.name;
                                const pStats = isHome
                                    ? m.homeParticipant.players?.find((p) => p.playerId === player.id)
                                    : m.awayParticipant.players?.find((p) => p.playerId === player.id);

                                return (
                                    <div
                                        key={m.id}
                                        onClick={() => navigate(`/matches/${m.id}`)}
                                        className="p-4 border-b border-slate-100 flex justify-between items-center cursor-pointer"
                                    >
                                        <div>
                                            <div className="text-[14px] font-semibold text-slate-700">vs {opponent}</div>
                                            <div className="text-[12px] text-slate-400">{new Date(m.date).toLocaleDateString()}</div>
                                        </div>
                                        <div className="text-right">
                                            {stats.isFootball ? (
                                                <div className="text-[16px] font-extrabold text-slate-900">
                                                    {pStats?.goals || 0} G, {pStats?.assists || 0} A
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-[16px] font-extrabold text-slate-900">
                                                        {pStats?.runs} <span className="text-[12px] font-normal text-slate-500">({pStats?.balls})</span>
                                                    </div>
                                                    {pStats?.wickets ? (
                                                        <div className="text-[12px] font-semibold text-purple-700">
                                                            {pStats.wickets} Wkts
                                                        </div>
                                                    ) : null}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
