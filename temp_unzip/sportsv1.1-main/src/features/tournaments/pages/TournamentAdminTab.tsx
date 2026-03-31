import React, { useState } from 'react';
import { Tournament } from '../types/tournament';
import { Match } from '@/features/matches/types/match';
import { useGlobalState } from '@/app/AppProviders';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Users, Calendar, Settings, Shield, Plus, X } from 'lucide-react';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Player } from '@/features/players/types/player';

interface TournamentAdminTabProps {
    tournament: Tournament;
    matches: Match[];
}

export const TournamentAdminTab: React.FC<TournamentAdminTabProps> = ({ tournament, matches }) => {
    const { players, addScorerToTournament, removeScorerFromTournament } = useGlobalState();
    const [isAssigningScorer, setIsAssigningScorer] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const assignedScorers = players.filter((p: Player) => tournament.scorers?.includes(p.id));

    const availablePlayers = players.filter((p: Player) =>
        !tournament.scorers?.includes(p.id) &&
        (p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5);

    const handleAssign = async (userId: string) => {
        await addScorerToTournament(tournament.id, userId);
        setIsAssigningScorer(false);
    };

    const handleRemove = async (userId: string) => {
        if (confirm('Are you sure you want to remove this scorer from the tournament?')) {
            await removeScorerFromTournament(tournament.id, userId);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Statistics Overview */}
                <Card className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Scheduled Matches</p>
                            <p className="text-2xl font-bold text-slate-900">{matches.length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Teams</p>
                            <p className="text-2xl font-bold text-slate-900">{tournament.teams?.length || 0}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <Shield size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Official Scorers</p>
                            <p className="text-2xl font-bold text-slate-900">{tournament.scorers?.length || 0}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scorer Management */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Users size={20} className="text-slate-400" />
                            <h3 className="font-bold text-slate-900">Official Scorers</h3>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setIsAssigningScorer(true)}
                            icon={<Plus size={16} />}
                        >
                            Assign New
                        </Button>
                    </div>

                    {isAssigningScorer && (
                        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold text-slate-700">Assign Scorer</h4>
                                <button onClick={() => setIsAssigningScorer(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={16} />
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 mb-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <div className="space-y-2">
                                {availablePlayers.map((player: Player) => (
                                    <div key={player.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <Avatar src={player.avatarUrl} fallback={player.firstName[0]} className="w-8 h-8 rounded-full" />
                                            <span className="text-sm font-medium">{player.firstName} {player.lastName}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => handleAssign(player.id)}>Assign</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {assignedScorers.length > 0 ? assignedScorers.map((scorer: Player) => (
                            <div key={scorer.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Avatar src={scorer.avatarUrl} fallback={scorer.firstName[0]} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{scorer.firstName} {scorer.lastName}</p>
                                        <p className="text-xs text-slate-500">Official Scorer</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleRemove(scorer.id)}>Remove</Button>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                                No scorers assigned yet.
                            </div>
                        )}
                    </div>
                </Card>

                {/* Tournament Controls */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Settings size={20} className="text-slate-400" />
                        <h3 className="font-bold text-slate-900">Tournament Controls</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Status: {tournament.status.toUpperCase()}</p>
                                <p className="text-xs text-slate-500">Current tournament state</p>
                            </div>
                            <Button variant="outline" size="sm">Transition</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl opacity-50 cursor-not-allowed">
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Manual Schedule Overrides</p>
                                <p className="text-xs text-slate-500">Modify auto-generated fixures</p>
                            </div>
                            <Button variant="outline" size="sm" disabled>Manage</Button>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-200">
                            <Button variant="danger" className="w-full">Cancel Tournament</Button>
                            <p className="text-[10px] text-slate-400 text-center mt-2">Critical actions require double confirmation</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
