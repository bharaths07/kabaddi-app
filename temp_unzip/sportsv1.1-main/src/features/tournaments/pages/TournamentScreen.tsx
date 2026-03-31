import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    PlayCircle,
    Share2,
    Settings,
    CheckCircle2,
    ListChecks,
    Users,
    Layout,
    ArrowRight
} from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { Tournament } from '@/features/tournaments/types/tournament';
import { Match } from '@/features/matches/types/match';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { SPORT_CONFIGS } from '../constants/sportConfigs';
import * as LucideIcons from 'lucide-react';

const SportIcon = ({ name, className }: { name: string; className?: string }) => {
    const Icon = (LucideIcons as any)[name] || LucideIcons.Trophy;
    return <Icon className={className} />;
};
import { Button } from '@/shared/components/ui/Button';
import { Tabs } from '@/shared/components/ui/Tabs';
import { Card } from '@/shared/components/ui/Card';

// Tab Components
import { Avatar } from '@/shared/components/ui/Avatar';
import { TournamentMatchesTab } from './TournamentMatchesTab';
import { TournamentPointsTable } from './TournamentPointsTable';
import { TournamentSquadsTab } from './TournamentSquadsTab';
import { TournamentLeaderboard } from '../components/TournamentLeaderboard';
import { TournamentAdminTab } from './TournamentAdminTab';

export const TournamentScreen: React.FC = () => {
    const { tournamentId } = useParams<{ tournamentId: string }>();
    const navigate = useNavigate();
    const { tournaments, currentUser, matches, startTournament } = useGlobalState();

    const tournament = tournaments.find((t: Tournament) => t.id === tournamentId);
    const tournamentMatches = matches.filter((m: Match) => m.tournamentId === tournamentId);

    const [activeTab, setActiveTab] = useState('overview');
    const [role, setRole] = useState<'ORGANIZER' | 'SCORER' | 'PUBLIC'>('PUBLIC');

    // Dynamic Sport Config
    const sportConfig = Object.values(SPORT_CONFIGS).find(s => s.sportId === tournament?.sportId) || SPORT_CONFIGS['cricket'];

    useEffect(() => {
        if (tournament && currentUser) {
            if (tournament.organizerId === currentUser.id) {
                setRole('ORGANIZER');
            } else if (tournament.scorers?.includes(currentUser.id)) {
                setRole('SCORER');
            } else {
                setRole('PUBLIC');
            }
        } else {
            setRole('PUBLIC');
        }
    }, [tournament, currentUser]);

    const handleStartTournament = async () => {
        if (!tournament) return;
        if (confirm('Are you sure you want to start this tournament? This will generate the schedule.')) {
            await startTournament(tournament.id);
        }
    };

    if (!tournament) return (
        <PageContainer>
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-slate-900">Tournament not found</h2>
                <Button variant="primary" className="mt-4" onClick={() => navigate('/tournaments')}>
                    Back to Tournaments
                </Button>
            </div>
        </PageContainer>
    );

    const tabs = [
        { id: 'overview', label: 'Matches' },
        { id: 'table', label: 'Points Table' },
        { id: 'squads', label: 'Squads' },
        { id: 'stats', label: 'Stats' },
    ];

    if (role === 'ORGANIZER') {
        tabs.push({ id: 'admin', label: 'Admin' });
    }

    const renderStatusBadge = (status: Tournament['status']) => {
        const styles: Record<string, string> = {
            draft: 'bg-amber-100 text-amber-700',
            upcoming: 'bg-blue-100 text-blue-700',
            ongoing: 'bg-green-100 text-green-700',
            completed: 'bg-slate-100 text-slate-700',
        };

        return (
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${styles[status] || 'bg-slate-100'}`}>
                {status}
            </span>
        );
    };

    const SetupWizard = () => {
        if (role !== 'ORGANIZER' || (tournament.status !== 'draft' && tournament.status !== 'upcoming')) return null;

        const steps = [
            {
                id: 'teams',
                label: 'Add Teams',
                description: 'At least 2 teams required',
                completed: (tournament.teams?.length || 0) >= 2,
                path: `/tournaments/${tournamentId}/teams`
            },
            {
                id: 'structure',
                label: 'Define Structure',
                description: 'Format, groups & rounds',
                completed: !!tournament.structure,
                path: `/tournaments/${tournamentId}/structure`
            },
            {
                id: 'schedule',
                label: 'Generate Schedule',
                description: 'Create match fixtures',
                completed: tournamentMatches.length > 0,
                path: `/tournaments/${tournamentId}/auto-schedule`
            }
        ];

        const completedSteps = steps.filter(s => s.completed).length;
        const progress = (completedSteps / steps.length) * 100;

        if (completedSteps === steps.length && tournament.status !== 'draft') return null;

        return (
            <Card className="mb-8 overflow-hidden border-blue-100 bg-blue-50/30">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <ListChecks size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Setup Progress</h3>
                                <p className="text-xs text-slate-500">{completedSteps} of {steps.length} steps completed</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-200 rounded-full mb-8 overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {steps.map((step, idx) => (
                            <div
                                key={step.id}
                                onClick={() => navigate(step.path)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group
                                    ${step.completed
                                        ? 'bg-white border-green-100'
                                        : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'}
                                `}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className={`p-1.5 rounded-lg ${step.completed ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                                        {step.id === 'teams' && <Users size={16} />}
                                        {step.id === 'structure' && <Layout size={16} />}
                                        {step.id === 'schedule' && <Calendar size={16} />}
                                    </div>
                                    {step.completed ? (
                                        <CheckCircle2 size={18} className="text-green-500" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                            {idx + 1}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className={`text-sm font-bold ${step.completed ? 'text-slate-700' : 'text-slate-900'}`}>{step.label}</h4>
                                    <p className="text-[11px] text-slate-500">{step.description}</p>
                                </div>
                                {!step.completed && (
                                    <div className="mt-3 flex items-center text-[11px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        SETUP NOW <ArrowRight size={10} className="ml-1" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Hero Header (Custom, not standard PageHeader due to banner) */}
            <div className="relative bg-white border-b border-slate-200 mb-6">
                {/* Banner */}
                <div className="h-48 md:h-64 w-full bg-slate-900 relative overflow-hidden">
                    {tournament.bannerUrl ? (
                        <img
                            src={tournament.bannerUrl}
                            alt="Banner"
                            className="w-full h-full object-cover opacity-80"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-900 to-slate-900 flex items-center justify-center">
                            <SportIcon name={sportConfig.iconName} className="text-white/10 w-32 h-32" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Back Button Overlay */}
                    <button
                        onClick={() => navigate('/tournaments')}
                        className="absolute top-4 left-4 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors z-10"
                    >
                        <Share2 className="w-5 h-5" /> {/* Using Share as placeholder for Back/Share actions */}
                    </button>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 md:-mt-16 mb-6 gap-6">
                        {/* Logo */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-1 shadow-lg flex-shrink-0">
                            <Avatar
                                src={tournament.logoUrl}
                                alt={tournament.name}
                                fallback={tournament.name.charAt(0)}
                                className="w-full h-full rounded-xl text-3xl md:text-4xl font-bold"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-white md:text-slate-900 pb-2">
                            <div className="flex items-center gap-2 mb-2">
                                {renderStatusBadge(tournament.status)}
                                <span className="text-xs font-bold uppercase tracking-wide opacity-90 md:text-slate-500">
                                    {sportConfig.name}
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-bold mb-2 text-white md:text-slate-900 drop-shadow-md md:drop-shadow-none">
                                {tournament.name}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-sm font-medium opacity-90 md:text-slate-600">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={16} />
                                    {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBD'} - {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : 'TBD'}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={16} />
                                    {tournament.location || 'Multiple Venues'}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-4 md:mt-0 pb-2">
                            {role === 'ORGANIZER' && (
                                <Button variant="outline" onClick={() => navigate(`/tournament/${tournamentId}/edit`)}>
                                    <Settings size={18} className="mr-2" /> Settings
                                </Button>
                            )}
                            {role === 'ORGANIZER' && tournament.status === 'draft' && (
                                <Button variant="primary" onClick={handleStartTournament}>
                                    <PlayCircle size={18} className="mr-2" /> Start Tournament
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        variant="underline"
                    />
                </div>
            </div>

            <PageContainer>
                <SetupWizard />
                {activeTab === 'overview' && <TournamentMatchesTab matches={tournamentMatches} />}
                {activeTab === 'table' && <TournamentPointsTable />}
                {activeTab === 'squads' && <TournamentSquadsTab />}
                {activeTab === 'stats' && <TournamentLeaderboard />}
                {activeTab === 'admin' && (
                    <TournamentAdminTab tournament={tournament} matches={tournamentMatches} />
                )}
            </PageContainer>
        </div>
    );
};
