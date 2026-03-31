import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { teamService } from '@/features/teams/api/teamService';
import { Team } from '@/features/teams/types/team';
import { useAuth } from './AuthContext';

interface TeamContextType {
    teams: Team[];
    followedTeams: string[];
    addTeam: (team: Team) => Promise<void>;
    addTeamMember: (teamId: string, member: { playerId: string; role: 'captain' | 'vice-captain' | 'member'; joinedAt: string }) => Promise<void>;
    toggleFollowTeam: (teamId: string) => void;
    updateTeams: () => void;
    refreshTeams: () => Promise<void>;
    setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser, updateUserProfile } = useAuth();
    const [teams, setTeams] = useState<Team[]>([]);
    const [followedTeams, setFollowedTeams] = useState<string[]>(() => {
        const saved = localStorage.getItem('scoreheroes_followed_teams');
        return saved ? JSON.parse(saved) : [];
    });

    // Rehydrate followed teams from profile on login
    useEffect(() => {
        if (currentUser?.followedEntities?.teams) {
            setFollowedTeams(currentUser.followedEntities.teams);
        }
    }, [currentUser]);

    // Sync local storage to profile if missing
    useEffect(() => {
        if (currentUser && !currentUser.followedEntities?.teams && followedTeams.length > 0) {
            updateUserProfile({
                followedEntities: {
                    ...(currentUser.followedEntities || {}),
                    teams: followedTeams
                }
            });
        }
    }, [currentUser, followedTeams, updateUserProfile]);

    const refreshTeams = useCallback(async () => {
        try {
            const fetchedTeams = await teamService.getAllTeams();
            setTeams(fetchedTeams);
        } catch (error) {
            console.error('Failed to refresh teams:', error);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('scoreheroes_followed_teams', JSON.stringify(followedTeams));
    }, [followedTeams]);

    useEffect(() => {
        refreshTeams();
    }, [refreshTeams]);

    const addTeam = async (team: Team) => {
        try {
            const newTeam = await teamService.createTeam(team);
            if (newTeam) {
                setTeams(prev => [newTeam, ...prev]);
            }
        } catch (error) {
            console.error('Failed to create team:', error);
            alert('Failed to create team.');
        }
    };

    const addTeamMember = async (teamId: string, member: { playerId: string; role: 'captain' | 'vice-captain' | 'member'; joinedAt: string }) => {
        try {
            await teamService.addMember(teamId, {
                playerId: member.playerId,
                role: member.role,
                joinedAt: member.joinedAt
            });
            setTeams(prev => prev.map(t =>
                t.id === teamId
                    ? { ...t, members: [...(t.members || []), { playerId: member.playerId, role: member.role, joinedAt: member.joinedAt }] }
                    : t
            ));
        } catch (error) {
            console.error('Failed to add team member:', error);
        }
    };

    const toggleFollowTeam = (teamId: string) => {
        const next = followedTeams.includes(teamId)
            ? followedTeams.filter(id => id !== teamId)
            : [...followedTeams, teamId];

        setFollowedTeams(next);

        if (currentUser) {
            updateUserProfile({
                followedEntities: {
                    ...(currentUser.followedEntities || {}),
                    teams: next
                }
            });
        }
    };

    const updateTeams = () => { refreshTeams(); };

    return (
        <TeamContext.Provider value={{
            teams,
            followedTeams,
            addTeam,
            addTeamMember,
            toggleFollowTeam,
            updateTeams,
            refreshTeams,
            setTeams
        }}>
            {children}
        </TeamContext.Provider>
    );
};

export const useTeams = () => {
    const context = useContext(TeamContext);
    if (context === undefined) {
        throw new Error('useTeams must be used within a TeamProvider');
    }
    return context;
};
