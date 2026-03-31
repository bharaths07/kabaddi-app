import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { Match } from '@/features/matches/types/match';
import { Team } from '@/features/teams/types/team';
import { CheckCircle2, Crown, Shield, Plus, ArrowRight } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';

export const SquadSelectionScreen: React.FC = () => {
    const [searchParams] = useSearchParams();
    const matchId = searchParams.get('matchId');
    const navigate = useNavigate();
    const { matches, teams, players, updateMatch } = useGlobalState();
    const [match, setMatch] = useState<Match | null>(null);

    // Team A State
    const [teamASquad, setTeamASquad] = useState<Set<string>>(new Set());
    const [teamACaptainId, setTeamACaptainId] = useState<string | undefined>();
    const [teamAWicketKeeperId, setTeamAWicketKeeperId] = useState<string | undefined>();
    const [teamAGoalkeeperId, setTeamAGoalkeeperId] = useState<string | undefined>();

    // Team B State
    const [teamBSquad, setTeamBSquad] = useState<Set<string>>(new Set());
    const [teamBCaptainId, setTeamBCaptainId] = useState<string | undefined>();
    const [teamBWicketKeeperId, setTeamBWicketKeeperId] = useState<string | undefined>();
    const [teamBGoalkeeperId, setTeamBGoalkeeperId] = useState<string | undefined>();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Resolved Data
    const [teamA, setTeamA] = useState<Team | undefined>();
    const [teamB, setTeamB] = useState<Team | undefined>();

    useEffect(() => {
        if (matchId && matches.length > 0) {
            const foundMatch = matches.find(m => m.id === matchId);
            if (foundMatch) {
                setMatch(foundMatch);
                const tA = teams.find(t => t.id === foundMatch.homeParticipant.id);
                const tB = teams.find(t => t.id === foundMatch.awayParticipant.id);
                setTeamA(tA);
                setTeamB(tB);

                // Pre-fill if already exists
                if (foundMatch.homeParticipant.squad) {
                    setTeamASquad(new Set(foundMatch.homeParticipant.squad.playerIds));
                    setTeamACaptainId(foundMatch.homeParticipant.squad.captainId);
                    setTeamAWicketKeeperId(foundMatch.homeParticipant.squad.wicketKeeperId);
                    setTeamAGoalkeeperId(foundMatch.homeParticipant.squad.goalkeeperId);
                }
                if (foundMatch.awayParticipant.squad) {
                    setTeamBSquad(new Set(foundMatch.awayParticipant.squad.playerIds));
                    setTeamBCaptainId(foundMatch.awayParticipant.squad.captainId);
                    setTeamBWicketKeeperId(foundMatch.awayParticipant.squad.wicketKeeperId);
                    setTeamBGoalkeeperId(foundMatch.awayParticipant.squad.goalkeeperId);
                }
            }
        }
    }, [matchId, matches, teams]);

    const togglePlayer = (teamId: string, playerId: string) => {
        if (!match) return;

        if (teamId === match.homeParticipant.id) {
            const newSet = new Set(teamASquad);
            if (newSet.has(playerId)) {
                newSet.delete(playerId);
                if (teamACaptainId === playerId) setTeamACaptainId(undefined);
                if (teamAWicketKeeperId === playerId) setTeamAWicketKeeperId(undefined);
                if (teamAGoalkeeperId === playerId) setTeamAGoalkeeperId(undefined);
            } else {
                newSet.add(playerId);
            }
            setTeamASquad(newSet);
        } else {
            const newSet = new Set(teamBSquad);
            if (newSet.has(playerId)) {
                newSet.delete(playerId);
                if (teamBCaptainId === playerId) setTeamBCaptainId(undefined);
                if (teamBWicketKeeperId === playerId) setTeamBWicketKeeperId(undefined);
                if (teamBGoalkeeperId === playerId) setTeamBGoalkeeperId(undefined);
            } else {
                newSet.add(playerId);
            }
            setTeamBSquad(newSet);
        }
    };

    const setCaptain = (teamId: string, playerId: string) => {
        if (!match) return;
        if (teamId === match.homeParticipant.id) {
            setTeamACaptainId(prev => prev === playerId ? undefined : playerId);
        } else {
            setTeamBCaptainId(prev => prev === playerId ? undefined : playerId);
        }
    };

    const setWicketKeeper = (teamId: string, playerId: string) => {
        if (!match) return;
        if (teamId === match.homeParticipant.id) {
            setTeamAWicketKeeperId(prev => prev === playerId ? undefined : playerId);
        } else {
            setTeamBWicketKeeperId(prev => prev === playerId ? undefined : playerId);
        }
    };

    const setGoalkeeper = (teamId: string, playerId: string) => {
        if (!match) return;
        if (teamId === match.homeParticipant.id) {
            setTeamAGoalkeeperId(prev => prev === playerId ? undefined : playerId);
        } else {
            setTeamBGoalkeeperId(prev => prev === playerId ? undefined : playerId);
        }
    };

    const handleConfirmSquads = () => {
        if (!match) return;
        setIsSubmitting(true);

        const updatedMatch = {
            ...match,
            homeParticipant: {
                ...match.homeParticipant,
                squad: {
                    playerIds: Array.from(teamASquad),
                    captainId: teamACaptainId,
                    wicketKeeperId: teamAWicketKeeperId,
                    goalkeeperId: teamAGoalkeeperId
                }
            },
            awayParticipant: {
                ...match.awayParticipant,
                squad: {
                    playerIds: Array.from(teamBSquad),
                    captainId: teamBCaptainId,
                    wicketKeeperId: teamBWicketKeeperId,
                    goalkeeperId: teamBGoalkeeperId
                }
            }
        };

        setTimeout(() => {
            updateMatch(match.id, {
                homeParticipant: updatedMatch.homeParticipant,
                awayParticipant: updatedMatch.awayParticipant
            });
            setIsSubmitting(false);

            if (match.sportId === 's3') {
                // Football skips openers and goes to live scoring
                navigate(`/match/${match.id}/live`);
            } else {
                // Cricket goes to openers selection
                navigate(`/start-match/openers?matchId=${match.id}`);
            }
        }, 500);
    };

    if (!match || !teamA || !teamB) {
        return <div className="p-4">Loading squads...</div>;
    }

    const isTeamAValid = teamASquad.size >= 7;
    const isTeamBValid = teamBSquad.size >= 7;
    const canConfirm = isTeamAValid && isTeamBValid;

    const renderTeamSection = (team: Team, squad: Set<string>, captainId: string | undefined, wkId: string | undefined, gkId: string | undefined) => {
        // Resolve players
        const teamPlayers = team.members.map(m => {
            const p = players.find(pl => pl.id === m.playerId);
            return { ...m, details: p };
        }).filter(m => m.details);

        const isCricket = match.sportId === 's1';
        const isFootball = match.sportId === 's3';

        return (
            <Card className="mb-6 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-bold text-slate-800">{team.name} <span className="font-normal text-slate-500 text-sm">— Squad</span></h2>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${squad.size >= 7 ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                        Selected: {squad.size} / {isFootball ? '11' : '11'}
                    </span>
                </div>
                <div className="divide-y divide-slate-100">
                    {teamPlayers.map(member => {
                        const isSelected = squad.has(member.playerId);
                        const isCaptain = captainId === member.playerId;
                        const isWK = wkId === member.playerId;
                        const isGK = gkId === member.playerId;
                        const isInvited = member.details?.status === 'invited';

                        return (
                            <div key={member.playerId} className={`flex items-center justify-between p-4 transition-colors ${isSelected ? 'bg-white' : 'bg-slate-50/50 hover:bg-slate-50'}`}>
                                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => togglePlayer(team.id, member.playerId)}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <div>
                                        <div className={`font-medium flex items-center gap-2 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                                            {member.details?.firstName} {member.details?.lastName}
                                            {isInvited && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 font-bold uppercase tracking-wider">Invited</span>}
                                        </div>
                                        <div className="text-xs text-slate-400 capitalize">{member.role}</div>
                                    </div>
                                </div>

                                {isSelected && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCaptain(team.id, member.playerId)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${isCaptain ? 'bg-amber-100 border-amber-400 text-amber-700 shadow-sm' : 'border-slate-200 text-slate-300 hover:border-slate-300'}`}
                                            title="Captain"
                                        >
                                            <Crown className="w-4 h-4" />
                                        </button>

                                        {isCricket && (
                                            <button
                                                onClick={() => setWicketKeeper(team.id, member.playerId)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${isWK ? 'bg-blue-100 border-blue-400 text-blue-700 shadow-sm' : 'border-slate-200 text-slate-300 hover:border-slate-300'}`}
                                                title="Wicket Keeper"
                                            >
                                                <Shield className="w-4 h-4" />
                                            </button>
                                        )}

                                        {isFootball && (
                                            <button
                                                onClick={() => setGoalkeeper(team.id, member.playerId)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${isGK ? 'bg-emerald-100 border-emerald-400 text-emerald-700 shadow-sm' : 'border-slate-200 text-slate-300 hover:border-slate-300'}`}
                                                title="Goalkeeper"
                                            >
                                                <Shield className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <button
                        onClick={() => navigate(`/start-match/add-player?teamId=${team.id}&matchId=${match?.id}`)}
                        className="w-full py-4 text-blue-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add player
                    </button>
                </div>
            </Card>
        );
    };

    return (
        <PageContainer>
            <PageHeader
                title="Select squads"
                description="Select players who will play this match"
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/start-match/toss?matchId=${match.id}`)}>
                            Back
                        </Button>
                        <Button
                            onClick={handleConfirmSquads}
                            disabled={!canConfirm || isSubmitting}
                            variant="primary"
                            className="gap-2"
                        >
                            {isSubmitting ? 'Saving...' : 'Confirm Squads'}
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                }
            />

            <div className="space-y-6">
                {renderTeamSection(teamA, teamASquad, teamACaptainId, teamAWicketKeeperId, teamAGoalkeeperId)}
                {renderTeamSection(teamB, teamBSquad, teamBCaptainId, teamBWicketKeeperId, teamBGoalkeeperId)}

                {!canConfirm && (
                    <p className="text-center text-xs text-slate-400">
                        Select at least 7 players for both teams to continue
                    </p>
                )}
            </div>
        </PageContainer>
    );
};
