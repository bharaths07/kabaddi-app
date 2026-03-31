import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { calculateStandings } from '@/shared/utils/tournament/calculateStandings';
import { Card } from '@/shared/components/ui/Card';

export const TournamentPointsTable: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { tournaments, teams: allTeams, matches: allMatches } = useGlobalState();

    const tournament = tournaments.find(t => t.id === id);

    const tableData = useMemo(() => {
        if (!tournament) return [];

        const teamIds = tournament.teams || [];
        const tournamentTeams = allTeams.filter(t => teamIds.includes(t.id));
        const tournamentMatches = allMatches.filter(m => m.tournamentId === id);

        const standings = calculateStandings(tournamentTeams, tournamentMatches);

        const isCricket = tournament.sportId === 's1' || tournament.sportId === 'cricket';
        const isFootball = tournament.sportId === 's2' || tournament.sportId === 'football';

        const enhancedStandings = standings.map(s => {
            const team = tournamentTeams.find(t => t.id === s.teamId);
            return {
                ...s,
                teamCode: team?.name.substring(0, 3).toUpperCase() || s.teamName.substring(0, 3).toUpperCase(),
                nrr: s.netRunRate.toFixed(3),
                status: 'contention',
                logoUrl: team?.logoUrl
            };
        });

        return [{
            groupName: "Standings",
            qualificationRule: "League Table",
            cutoffPosition: 0,
            isCricket,
            isFootball,
            teams: enhancedStandings
        }];
    }, [tournament, allTeams, allMatches, id]);

    const hasCompletedMatches = useMemo(() => {
        return allMatches.some(m => m.tournamentId === id && (m.status === 'completed' || m.status === 'locked'));
    }, [allMatches, id]);

    if (!tournament) return <div>Tournament not found</div>;

    if (!tournament.teams || tournament.teams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 bg-white rounded-xl border border-slate-200">
                <div className="text-4xl">📊</div>
                <h3 className="text-slate-900 font-medium">No standings available</h3>
                <p className="text-slate-500 text-sm">Add teams to see the table.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {tableData.map((group, idx) => (
                <Card key={idx} className="overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h3 className="font-bold text-slate-900">{group.groupName}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 font-bold w-16">Pos</th>
                                    <th className="px-6 py-3 font-bold">Team</th>
                                    <th className="px-4 py-3 font-bold text-center">P</th>
                                    <th className="px-4 py-3 font-bold text-center">W</th>
                                    <th className="px-4 py-3 font-bold text-center">L</th>
                                    <th className="px-4 py-3 font-bold text-center">T</th>
                                    {group.isCricket && <th className="px-4 py-3 font-bold text-center hidden sm:table-cell">NRR</th>}
                                    {group.isFootball && (
                                        <>
                                            <th className="px-4 py-3 font-bold text-center hidden md:table-cell">GF</th>
                                            <th className="px-4 py-3 font-bold text-center hidden md:table-cell">GA</th>
                                            <th className="px-4 py-3 font-bold text-center hidden sm:table-cell">GD</th>
                                        </>
                                    )}
                                    <th className="px-4 py-3 font-bold text-center">Pts</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {group.teams.map((team, index) => (
                                    <tr key={team.teamId} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                                                    {team.teamName.charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-900">{team.teamName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center text-slate-600">{team.played}</td>
                                        <td className="px-4 py-4 text-center font-medium text-green-600">{team.won}</td>
                                        <td className="px-4 py-4 text-center font-medium text-red-600">{team.lost}</td>
                                        <td className="px-4 py-4 text-center text-slate-600">{team.tied}</td>
                                        {group.isCricket && <td className="px-4 py-4 text-center text-slate-600 hidden sm:table-cell">{team.nrr}</td>}
                                        {group.isFootball && (
                                            <>
                                                <td className="px-4 py-4 text-center text-slate-600 hidden md:table-cell">{team.goalsFor}</td>
                                                <td className="px-4 py-4 text-center text-slate-600 hidden md:table-cell">{team.goalsAgainst}</td>
                                                <td className="px-4 py-4 text-center text-slate-600 hidden sm:table-cell">{team.goalDifference}</td>
                                            </>
                                        )}
                                        <td className="px-4 py-4 text-center font-bold text-slate-900">{team.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!hasCompletedMatches && (
                        <div className="px-6 py-8 text-center border-t border-slate-100">
                            <p className="text-slate-500 text-sm">Standings will update automatically as matches are completed.</p>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
};
