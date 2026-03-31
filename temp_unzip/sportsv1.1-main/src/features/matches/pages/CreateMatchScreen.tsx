import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Calendar, ChevronRight, MapPin, Clock, Plus } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Match } from '@/features/matches/types/match';
import { Team } from '@/features/teams/types/team';
import { stringToColor } from '@/shared/utils/colors';

export const CreateMatchScreen: React.FC = () => {
    const navigate = useNavigate();
    const requireAuth = useRequireAuth();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const tournamentId = searchParams.get('tournamentId');
    const context = searchParams.get('context');
    const { addMatch, currentUser, teams } = useGlobalState();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Route Protection
    useEffect(() => {
        requireAuth(currentUser);
    }, [currentUser, requireAuth]);

    // Get pre-filled state or resolve from query params
    const state = location.state as { teamA?: Team, teamB?: Team, sportId?: string } | null;
    const initialSportId = state?.sportId || searchParams.get('sportId') || 's1';

    let teamA = state?.teamA;
    let teamB = state?.teamB;

    // Fallback to finding by ID if not in state
    if (!teamA) {
        const id = searchParams.get('teamA');
        if (id) teamA = teams.find(t => t.id === id);
    }

    if (!teamB) {
        const id = searchParams.get('teamB');
        if (id) teamB = teams.find(t => t.id === id);
    }

    const [matchType, setMatchType] = useState<'limited' | 'box' | 'pair' | 'test' | 'hundred'>('limited');
    const [overs, setOvers] = useState<string>('');
    const [oversPerBowler, setOversPerBowler] = useState<string>('');
    // Football specific
    const [halfDuration, setHalfDuration] = useState<string>('45');

    const [city, setCity] = useState('Bengaluru (Bangalore)');
    const [ground, setGround] = useState('');

    // Default date: Current time + 15 minutes
    const [date, setDate] = useState(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 15);
        // Adjust to local ISO string for input[type="datetime-local"]
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    });

    const [ballType, setBallType] = useState<'TENNIS' | 'LEATHER' | 'OTHER'>('TENNIS');
    const [pitchType, setPitchType] = useState<'TURF' | 'MAT' | 'CEMENT' | 'OTHER'>('TURF');

    const [errors, setErrors] = useState<{
        city?: string;
        ground?: string;
        overs?: string;
        teamA?: string;
        teamB?: string;
    }>({});

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!teamA) newErrors.teamA = 'Select Team A';
        if (!teamB) newErrors.teamB = 'Select Team B';
        if (teamA && teamB && teamA.id === teamB.id) newErrors.teamB = 'Teams must be different';
        if (!city.trim()) newErrors.city = 'City is required';
        if (!ground.trim()) newErrors.ground = 'Ground is required';

        if (initialSportId === 's1' && matchType === 'limited') {
            if (!overs) newErrors.overs = 'Overs required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleMatchCreation = (action: 'schedule' | 'toss') => {
        if (!currentUser) return; // Ensure user is logged in
        if (!requireAuth(currentUser)) return;

        if (!validate()) return;

        if (!teamA || !teamB) return;

        setIsSubmitting(true);

        // Create match synchronously
        const newMatchId = `m-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newMatch: Match = {
            id: newMatchId,
            tournamentId: context === 'tournament' ? tournamentId ?? undefined : undefined,
            sportId: initialSportId || 's1',
            date: date,
            status: action === 'schedule' ? 'scheduled' : 'created',
            location: `${ground}, ${city}`,
            createdByUserId: currentUser.id,
            homeParticipant: {
                id: teamA.id,
                name: teamA.name,
                score: 0,
                wickets: initialSportId === 's1' ? 0 : undefined,
                balls: initialSportId === 's1' ? 0 : undefined
            },
            awayParticipant: {
                id: teamB.id,
                name: teamB.name,
                score: 0,
                wickets: initialSportId === 's1' ? 0 : undefined,
                balls: initialSportId === 's1' ? 0 : undefined
            },
            events: [],
            officials: [{ userId: currentUser.id, role: 'scorer' }]
        };

        addMatch(newMatch);

        if (context === 'tournament' && tournamentId) {
            navigate(`/tournament/${tournamentId}`);
        } else if (action === 'schedule') {
            navigate(`/matches/${newMatchId}`);
        } else {
            navigate(`/start-match/toss?matchId=${newMatchId}`);
        }
    };

    // Helper for colors


    const TeamDisplay = ({ team, error, label, onClick }: { team?: Team, error?: string, label: string, onClick?: () => void }) => (
        <div className="flex flex-col items-center flex-1 p-4 cursor-pointer group" onClick={onClick}>
            {team ? (
                <Avatar
                    src={team.logoUrl}
                    alt={team.name}
                    fallback={team.name.substring(0, 2).toUpperCase()}
                    className={`w-20 h-20 text-2xl font-bold mb-3 shadow-md border-4 border-white ${stringToColor(team.name)}`}
                />
            ) : (
                <div className="w-20 h-20 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center mb-3 group-hover:border-blue-500 group-hover:bg-blue-50 group-hover:scale-105 transition-all duration-200">
                    <Plus className="w-8 h-8 text-slate-400 group-hover:text-blue-500" />
                </div>
            )}

            <h3 className={`font-bold text-center line-clamp-1 ${team ? 'text-slate-900' : 'text-slate-400 group-hover:text-blue-600'}`}>
                {team?.name || `Select ${label}`}
            </h3>

            {error && (
                <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
            )}

            <div className="mt-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    Squad (0)
                </span>
            </div>
        </div>
    );

    return (
        <PageContainer>
            <PageHeader
                title="Start a match"
                description="Set up teams and match details"
            />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Teams Header Section */}
                <Card className="overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-100 py-3 px-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase">Teams</h3>
                    </div>
                    <div className="flex items-center justify-between relative p-2">
                        <TeamDisplay
                            team={teamA}
                            error={errors.teamA}
                            label="Team A"
                            onClick={() => navigate('/start-match/select-team/A')}
                        />

                        {/* VS Badge */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                            <div className="w-10 h-10 bg-white border border-slate-200 rotate-45 flex items-center justify-center shadow-sm rounded-lg">
                                <span className="-rotate-45 text-xs font-bold text-slate-400">VS</span>
                            </div>
                        </div>

                        <TeamDisplay
                            team={teamB}
                            error={errors.teamB}
                            label="Team B"
                            onClick={() => navigate('/start-match/select-team/B')}
                        />
                    </div>
                </Card>

                {/* Match Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Core Settings */}
                    <div className="space-y-6">
                        {initialSportId === 's1' ? (
                            <Card className="p-5 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    <h3 className="font-bold text-slate-900">Match Type</h3>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { id: 'limited', label: 'Limited Overs' },
                                        { id: 'box', label: 'Box / Turf' },
                                        { id: 'pair', label: 'Pair Cricket' },
                                        { id: 'test', label: 'Test Match' },
                                        { id: 'hundred', label: 'The Hundred' }
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => setMatchType(type.id as any)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${matchType === type.id
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>

                                {matchType === 'limited' && (
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <Input
                                            label="No. of overs"
                                            value={overs}
                                            onChange={(e) => setOvers(e.target.value)}
                                            placeholder="e.g. 20"
                                            type="number"
                                            error={errors.overs}
                                        />
                                        <Input
                                            label="Overs / bowler"
                                            value={oversPerBowler}
                                            onChange={(e) => setOversPerBowler(e.target.value)}
                                            placeholder="e.g. 4"
                                            type="number"
                                        />
                                    </div>
                                )}
                            </Card>
                        ) : (
                            <Card className="p-5 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-emerald-500" />
                                    <h3 className="font-bold text-slate-900">Match Format</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Half Duration (mins)"
                                        value={halfDuration}
                                        onChange={(e) => setHalfDuration(e.target.value)}
                                        type="number"
                                    />
                                    <div className="flex items-center mt-6 text-sm text-slate-500">
                                        Standard Football Match
                                    </div>
                                </div>
                            </Card>
                        )}

                        <Card className="p-5 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <h3 className="font-bold text-slate-900">Venue</h3>
                            </div>
                            <Input
                                label="City / town"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                error={errors.city}
                            />
                            <Input
                                label="Ground"
                                value={ground}
                                onChange={(e) => setGround(e.target.value)}
                                placeholder="Enter ground name"
                                error={errors.ground}
                            />
                        </Card>
                    </div>

                    {/* Right Column: Conditions & Time */}
                    <div className="space-y-6">
                        <Card className="p-5 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <h3 className="font-bold text-slate-900">Date & Time</h3>
                            </div>

                            <div className="relative">
                                <Input
                                    type="datetime-local"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </Card>

                        <Card className="p-5 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Ball Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { id: 'TENNIS', label: 'Tennis' },
                                        { id: 'LEATHER', label: 'Leather' },
                                        { id: 'OTHER', label: 'Other' }
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => setBallType(type.id as any)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${ballType === type.id
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Pitch Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { id: 'TURF', label: 'Turf' },
                                        { id: 'MAT', label: 'Mat' },
                                        { id: 'CEMENT', label: 'Cement' },
                                        { id: 'OTHER', label: 'Other' }
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => setPitchType(type.id as any)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${pitchType === type.id
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-4 pt-4 border-t border-slate-200">
                    <Button
                        onClick={() => handleMatchCreation('schedule')}
                        disabled={isSubmitting}
                        variant="secondary"
                        className="flex-1"
                        isLoading={isSubmitting}
                    >
                        Schedule for later
                    </Button>
                    <Button
                        onClick={() => handleMatchCreation('toss')}
                        disabled={isSubmitting}
                        className="flex-[2]"
                        isLoading={isSubmitting}
                        icon={<ChevronRight className="w-4 h-4" />}
                    >
                        Next (Toss)
                    </Button>
                </div>
            </div>
        </PageContainer>
    );
};
