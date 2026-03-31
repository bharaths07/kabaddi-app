
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { Match } from '@/features/matches/types/match';
import { Player } from '@/features/players/types/player';
import { Play } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';

export const SelectOpenersScreen: React.FC = () => {
    const [searchParams] = useSearchParams();
    const matchId = searchParams.get('matchId');
    const navigate = useNavigate();
    const { matches, players, startMatch } = useGlobalState();
    const [match, setMatch] = useState<Match | null>(null);

    const [strikerId, setStrikerId] = useState<string>('');
    const [nonStrikerId, setNonStrikerId] = useState<string>('');
    const [bowlerId, setBowlerId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (matchId && matches.length > 0) {
            const foundMatch = matches.find(m => m.id === matchId);
            if (foundMatch) {
                setMatch(foundMatch);
            }
        }
    }, [matchId, matches]);

    if (!match) {
        return <div className="p-4">Loading match details...</div>;
    }

    // Determine Batting/Bowling Teams
    let battingTeamId = match.homeParticipant.id; // Default
    if (match.toss) {
        if (match.toss.decision === 'BAT') {
            battingTeamId = match.toss.winnerTeamId;
        } else {
            battingTeamId = match.toss.winnerTeamId === match.homeParticipant.id
                ? match.awayParticipant.id
                : match.homeParticipant.id;
        }
    }

    const isHomeBatting = battingTeamId === match.homeParticipant.id;
    const battingSide = isHomeBatting ? match.homeParticipant : match.awayParticipant;
    const bowlingSide = isHomeBatting ? match.awayParticipant : match.homeParticipant;

    // Resolve Squads
    // We need to resolve player details for the dropdowns
    const resolveSquad = (squadIds: string[] | undefined): Player[] => {
        if (!squadIds) return [];
        return squadIds.map(id => players.find(p => p.id === id)).filter((p): p is Player => !!p);
    };

    const battingSquad = resolveSquad(battingSide.squad?.playerIds);
    const bowlingSquad = resolveSquad(bowlingSide.squad?.playerIds);

    const canStart = strikerId && nonStrikerId && bowlerId && strikerId !== nonStrikerId;

    const handleStartMatch = () => {
        if (!canStart || isSubmitting) return;

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            startMatch(match.id, {
                strikerId,
                nonStrikerId,
                bowlerId
            });
            setIsSubmitting(false);
            navigate(`/match/${match.id}/live`);
        }, 500);
    };

    return (
        <PageContainer>
            <PageHeader
                title="Select Openers"
                description={`${battingSide.name} to bat first`}
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/start-match/squads?matchId=${match.id}`)}>
                            Back
                        </Button>
                        <Button
                            onClick={handleStartMatch}
                            disabled={!canStart || isSubmitting}
                            variant="primary"
                            className="gap-2"
                        >
                            {isSubmitting ? 'Starting...' : 'Start Match'}
                            <Play className="w-4 h-4 fill-current" />
                        </Button>
                    </div>
                }
            />

            <div className="max-w-lg mx-auto space-y-6">

                {/* Batting Section */}
                <Card className="p-6">
                    <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">B</span>
                        Batters
                    </h2>

                    <div className="space-y-4">
                        <Select
                            label="Striker"
                            value={strikerId}
                            onChange={(e) => setStrikerId(e.target.value)}
                            options={[
                                { value: '', label: 'Select Striker' },
                                ...battingSquad.map(p => ({
                                    value: p.id,
                                    label: `${p.firstName} ${p.lastName}`,
                                    disabled: p.id === nonStrikerId
                                }))
                            ]}
                        />

                        <Select
                            label="Non-Striker"
                            value={nonStrikerId}
                            onChange={(e) => setNonStrikerId(e.target.value)}
                            options={[
                                { value: '', label: 'Select Non-Striker' },
                                ...battingSquad.map(p => ({
                                    value: p.id,
                                    label: `${p.firstName} ${p.lastName}`,
                                    disabled: p.id === strikerId
                                }))
                            ]}
                        />
                    </div>
                </Card>

                {/* Bowling Section */}
                <Card className="p-6">
                    <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">F</span>
                        Opening Bowler
                    </h2>

                    <div>
                        <Select
                            label="Bowler"
                            value={bowlerId}
                            onChange={(e) => setBowlerId(e.target.value)}
                            options={[
                                { value: '', label: 'Select Bowler' },
                                ...bowlingSquad.map(p => ({
                                    value: p.id,
                                    label: `${p.firstName} ${p.lastName}`
                                }))
                            ]}
                        />
                    </div>
                </Card>

            </div>
        </PageContainer>
    );
};
