import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { tournamentService } from '@/features/tournaments/api/tournamentService';
import { Tournament } from '@/features/tournaments/types/tournament';
import { useAuth } from './AuthContext';

interface TournamentContextType {
    tournaments: Tournament[];
    followedTournaments: string[];
    addTournament: (tournament: Tournament) => Promise<void>;
    updateTournament: (tournament: Tournament) => Promise<void>;
    addTeamToTournament: (tournamentId: string, teamId: string) => Promise<void>;
    removeTeamFromTournament: (tournamentId: string, teamId: string) => Promise<void>;
    updateTournamentStructure: (tournamentId: string, structure: any) => Promise<void>;
    updateTournamentScheduleMode: (tournamentId: string, scheduleMode: 'AUTO' | 'MANUAL' | 'LATER') => Promise<void>;
    addScorerToTournament: (tournamentId: string, userId: string) => Promise<void>;
    removeScorerFromTournament: (tournamentId: string, userId: string) => Promise<void>;
    startTournament: (tournamentId: string) => Promise<void>;
    toggleFollowTournament: (tournamentId: string) => void;
    refreshTournaments: () => Promise<void>;
    setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser, updateUserProfile } = useAuth();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [followedTournaments, setFollowedTournaments] = useState<string[]>(() => {
        const saved = localStorage.getItem('scoreheroes_followed_tournaments');
        return saved ? JSON.parse(saved) : [];
    });

    // Rehydrate followed tournaments from profile on login
    useEffect(() => {
        if (currentUser?.followedEntities?.tournaments) {
            setFollowedTournaments(currentUser.followedEntities.tournaments);
        }
    }, [currentUser]);

    // Sync local storage to profile if missing
    useEffect(() => {
        if (currentUser && !currentUser.followedEntities?.tournaments && followedTournaments.length > 0) {
            updateUserProfile({
                followedEntities: {
                    ...(currentUser.followedEntities || {}),
                    tournaments: followedTournaments
                }
            });
        }
    }, [currentUser, followedTournaments, updateUserProfile]);

    const refreshTournaments = useCallback(async () => {
        try {
            const fetchedTournaments = await tournamentService.getAllTournaments();
            setTournaments(fetchedTournaments);
        } catch (error) {
            console.error('Failed to refresh tournaments:', error);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('scoreheroes_followed_tournaments', JSON.stringify(followedTournaments));
    }, [followedTournaments]);

    useEffect(() => {
        refreshTournaments();
    }, [refreshTournaments]);

    const addTournament = async (tournament: Tournament) => {
        try {
            await tournamentService.createTournament(tournament);
            await refreshTournaments();
        } catch (error) {
            console.error('Failed to create tournament:', error);
            alert('Failed to create tournament.');
        }
    };

    const updateTournament = async (tournament: Tournament) => {
        try {
            await tournamentService.updateTournament(tournament.id, tournament);
            await refreshTournaments();
        } catch (error) {
            console.error('Failed to update tournament:', error);
        }
    };

    const addTeamToTournament = async (tournamentId: string, teamId: string) => {
        try {
            // Assuming tournamentService has addTeam method, if not we update via updateTournament
            const tournament = tournaments.find(t => t.id === tournamentId);
            if (tournament) {
                const updatedTeams = [...(tournament.teams || []), teamId];
                await tournamentService.updateTournament(tournamentId, { teams: updatedTeams });
                await refreshTournaments();
            }
        } catch (error) {
            console.error('Failed to add team to tournament:', error);
        }
    };

    const removeTeamFromTournament = async (tournamentId: string, teamId: string) => {
        try {
            const tournament = tournaments.find(t => t.id === tournamentId);
            if (tournament) {
                const updatedTeams = (tournament.teams || []).filter(id => id !== teamId);
                await tournamentService.updateTournament(tournamentId, { teams: updatedTeams });
                await refreshTournaments();
            }
        } catch (error) {
            console.error('Failed to remove team from tournament:', error);
        }
    };

    const updateTournamentStructure = async (tournamentId: string, structure: any) => {
        try {
            await tournamentService.updateTournament(tournamentId, { structure });
            await refreshTournaments();
        } catch (error) {
            console.error('Failed to update tournament structure:', error);
        }
    };

    const updateTournamentScheduleMode = async (tournamentId: string, scheduleMode: 'AUTO' | 'MANUAL' | 'LATER') => {
        try {
            await tournamentService.updateTournament(tournamentId, { scheduleMode });
            await refreshTournaments();
        } catch (error) {
            console.error('Failed to update tournament schedule mode:', error);
        }
    };

    const startTournament = async (tournamentId: string) => {
        try {
            await tournamentService.updateTournament(tournamentId, { status: 'ongoing' });
            await refreshTournaments();
        } catch (error) {
            console.error('Failed to start tournament:', error);
        }
    };

    const addScorerToTournament = async (tournamentId: string, userId: string) => {
        try {
            await tournamentService.addScorer(tournamentId, userId);
            await refreshTournaments();
        } catch (error) {
            console.error('Failed to add scorer to tournament:', error);
        }
    };

    const removeScorerFromTournament = async (tournamentId: string, userId: string) => {
        try {
            await tournamentService.removeScorer(tournamentId, userId);
            await refreshTournaments();
        } catch (error) {
            console.error('Failed to remove scorer from tournament:', error);
        }
    };

    const toggleFollowTournament = (tournamentId: string) => {
        const next = followedTournaments.includes(tournamentId)
            ? followedTournaments.filter(id => id !== tournamentId)
            : [...followedTournaments, tournamentId];

        setFollowedTournaments(next);

        if (currentUser) {
            updateUserProfile({
                followedEntities: {
                    ...(currentUser.followedEntities || {}),
                    tournaments: next
                }
            });
        }
    };

    return (
        <TournamentContext.Provider value={{
            tournaments,
            followedTournaments,
            addTournament,
            updateTournament,
            addTeamToTournament,
            removeTeamFromTournament,
            updateTournamentStructure,
            updateTournamentScheduleMode,
            startTournament,
            addScorerToTournament,
            removeScorerFromTournament,
            toggleFollowTournament,
            refreshTournaments,
            setTournaments
        }}>
            {children}
        </TournamentContext.Provider>
    );
};

export const useTournaments = () => {
    const context = useContext(TournamentContext);
    if (context === undefined) {
        throw new Error('useTournaments must be used within a TournamentProvider');
    }
    return context;
};
