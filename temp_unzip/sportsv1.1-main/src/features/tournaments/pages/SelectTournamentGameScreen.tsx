import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HelpCircle, ChevronRight, Bell } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

import { GAMES, SportConfig } from '../constants/sportConfigs';
import * as LucideIcons from 'lucide-react';

const SportIcon = ({ name, className }: { name: string; className?: string }) => {
    const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
    return <Icon size={32} className={className} />;
};

export const SelectTournamentGameScreen: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [comingSoonGame, setComingSoonGame] = useState<SportConfig | null>(null);
    const [email, setEmail] = useState('');
    const [notified, setNotified] = useState(false);

    const handleGameSelect = (game: SportConfig) => {
        if (game.comingSoon) {
            setComingSoonGame(game);
            return;
        }

        const params = new URLSearchParams(searchParams);
        params.set('game', game.id);
        navigate(`/tournament/setup?${params.toString()}`);
    };

    const handleNotifyMe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // Simulate API call
        setTimeout(() => {
            setNotified(true);
            setTimeout(() => {
                setComingSoonGame(null);
                setNotified(false);
                setEmail('');
            }, 2000);
        }, 500);
    };

    return (
        <PageContainer>
            <PageHeader
                title="Select Tournament Sport"
                description="Choose a sport to organize a tournament for"
                actions={<button className="text-slate-400 hover:text-slate-600" aria-label="Help"><HelpCircle size={24} /></button>}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                {GAMES.map((game) => (
                    <Card
                        key={game.id}
                        onClick={() => handleGameSelect(game)}
                        hoverable
                        className={`p-6 flex flex-col items-center text-center transition-all duration-200 group relative overflow-hidden border-2 ${game.comingSoon
                            ? 'border-slate-100 bg-slate-50/50'
                            : 'border-transparent hover:border-blue-500/20 hover:shadow-xl cursor-pointer'
                            }`}
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${game.comingSoon ? 'bg-slate-100 grayscale opacity-70' : 'bg-blue-50 shadow-inner'
                            }`}>
                            <SportIcon name={game.iconName} className={game.id === 'cricket' ? 'text-blue-600' :
                                game.id === 'football' ? 'text-emerald-500' :
                                    game.id === 'badminton' ? 'text-amber-500' : 'text-purple-500'} />
                        </div>

                        <h3 className={`text-lg font-bold mb-2 ${game.comingSoon ? 'text-slate-500' : 'text-slate-900'}`}>
                            {game.name}
                        </h3>

                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            {game.description}
                        </p>

                        {game.comingSoon ? (
                            <div className="mt-auto">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-600 uppercase tracking-wide">
                                    Coming Soon
                                </span>
                            </div>
                        ) : (
                            <div className="mt-auto w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform translate-y-2 group-hover:translate-y-0">
                                <Button variant="primary" className="w-full justify-center" size="sm">
                                    Create Tournament <ChevronRight size={16} />
                                </Button>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Coming Soon Modal */}
            <Modal
                isOpen={!!comingSoonGame}
                onClose={() => setComingSoonGame(null)}
                title={comingSoonGame ? `${comingSoonGame.name} is coming soon!` : ''}
                size="sm"
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell size={32} className="text-blue-600" />
                    </div>
                    <p className="text-slate-600 mb-6">
                        We're working hard to bring <strong>{comingSoonGame?.name}</strong> tournament support to Play Legends.
                        Get notified when it's ready!
                    </p>

                    {notified ? (
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm font-medium animate-in fade-in zoom-in">
                            🎉 You're on the list! We'll notify you.
                        </div>
                    ) : (
                        <form onSubmit={handleNotifyMe} className="space-y-3">
                            <Input
                                placeholder="Enter your email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="text-center"
                            />
                            <Button type="submit" variant="primary" className="w-full justify-center">
                                Notify Me
                            </Button>
                        </form>
                    )}
                </div>
            </Modal>
        </PageContainer>
    );
};
