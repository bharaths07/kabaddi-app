import React from 'react';
import { Match } from '@/features/matches/types/match';
import { Card } from '@/shared/components/ui/Card';
import { useGlobalState } from '@/app/AppProviders';

interface Props {
    match: Match;
}

export const BasketballScorecard: React.FC<Props> = ({ match }) => {
    const { players } = useGlobalState();

    const getPlayerName = (id?: string) => {
        if (!id) return 'Unknown Player';
        const p = players.find((player: any) => player.id === id);
        return p ? `${p.firstName} ${p.lastName}` : 'Unknown Player';
    };

    const baskets = match.events?.filter(e => e.type === 'basket') || [];

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Points Summary</h3>
                <div className="grid grid-cols-2 gap-8">
                    {/* Home Points */}
                    <div className="space-y-4">
                        <div className="pb-2 border-b font-bold text-slate-700">{match.homeParticipant.name}</div>
                        <div className="space-y-2">
                            {baskets.filter(e => e.teamId === match.homeParticipant.id).map(e => (
                                <div key={e.id} className="flex justify-between text-sm">
                                    <span className="text-slate-600">Q{e.period}: {getPlayerName(e.scorerId)}</span>
                                    <span className="font-bold">+{e.points}</span>
                                </div>
                            ))}
                            {baskets.filter(e => e.teamId === match.homeParticipant.id).length === 0 && (
                                <div className="text-xs text-slate-400 italic">No points recorded</div>
                            )}
                        </div>
                    </div>

                    {/* Away Points */}
                    <div className="space-y-4">
                        <div className="pb-2 border-b font-bold text-slate-700">{match.awayParticipant.name}</div>
                        <div className="space-y-2">
                            {baskets.filter(e => e.teamId === match.awayParticipant.id).map(e => (
                                <div key={e.id} className="flex justify-between text-sm">
                                    <span className="text-slate-600">Q{e.period}: {getPlayerName(e.scorerId)}</span>
                                    <span className="font-bold">+{e.points}</span>
                                </div>
                            ))}
                            {baskets.filter(e => e.teamId === match.awayParticipant.id).length === 0 && (
                                <div className="text-xs text-slate-400 italic">No points recorded</div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Fouls & Events</h3>
                <div className="space-y-3">
                    {match.events?.filter(e => e.type === 'foul' || e.type === 'timeout' || e.type === 'period_start').map(e => (
                        <div key={e.id} className="flex items-center gap-3 text-sm p-2 bg-slate-50 rounded border border-slate-100">
                            <span className="text-slate-400 font-mono text-[10px]">P{e.period}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${e.type === 'foul' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                {e.type}
                            </span>
                            <span className="text-slate-700">
                                {e.type === 'foul' ? `${getPlayerName(e.scorerId)} committed a foul` : e.description}
                            </span>
                        </div>
                    ))}
                    {match.events?.length === 0 && <div className="text-sm text-slate-500 italic">No events recorded.</div>}
                </div>
            </Card>
        </div>
    );
};
