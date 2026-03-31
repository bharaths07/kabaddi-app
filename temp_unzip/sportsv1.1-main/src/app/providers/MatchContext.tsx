import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { matchService } from '@/features/matches/api/matchService';
import { scorerService } from '@/features/stats/api/scorerService';
import { feedService } from '@/features/social/api/feedService';
import { scoreEngine } from '@/features/matches/api/scoreEngine';
import { achievementService } from '@/features/stats/api/achievementService';
import { Match, ScoreEvent, PlayerStats } from '@/features/matches/types/match';
import { MatchScorer } from '@/features/stats/types/scorer';
import { FeedItem } from '@/features/social/types/feed';
import { Achievement } from '@/features/stats/types/achievement';
import { Player } from '@/features/players/types/player';
import { Team } from '@/features/teams/types/team';
import { useAuth } from './AuthContext';
import { useToast } from '@/shared/components/ui/Toast';
import { matchNotificationService } from '@/features/social/api/matchNotificationService';

interface MatchContextType {
    matches: Match[];
    followedMatches: string[];
    matchScorers: MatchScorer[];
    addMatch: (match: Match) => Promise<void>;
    updateMatch: (matchId: string, updates: Partial<Match>) => Promise<void>;
    scoreMatch: (matchId: string, eventOrRuns: number | Partial<ScoreEvent>, isWicketLegacy?: boolean) => Promise<void>;
    undoMatchEvent: (matchId: string) => Promise<void>;
    startMatch: (matchId: string, initialData?: { strikerId: string; nonStrikerId: string; bowlerId: string }) => Promise<void>;
    endMatch: (matchId: string, players: Player[], teams: Team[], achievements: Achievement[]) => Promise<void>;
    toggleFollowMatch: (matchId: string) => void;
    updateMatches: () => void;
    assignScorer: (matchId: string, userId: string) => Promise<void>;
    removeScorer: (matchId: string, userId: string) => Promise<void>;
    getMatchScorers: (matchId: string) => MatchScorer[];
    canScoreMatch: (matchId: string) => boolean;
    refreshMatches: () => Promise<void>;
    syncStatus: 'synced' | 'syncing' | 'error';
    setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
    setMatchScorers: React.Dispatch<React.SetStateAction<MatchScorer[]>>;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser, updateUserProfile } = useAuth();
    const [matches, setMatches] = useState<Match[]>([]);
    const [matchScorers, setMatchScorers] = useState<MatchScorer[]>([]);
    const [followedMatches, setFollowedMatches] = useState<string[]>(() => {
        const saved = localStorage.getItem('scoreheroes_followed_matches');
        return saved ? JSON.parse(saved) : [];
    });
    const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

    const refreshMatches = useCallback(async () => {
        try {
            const [fetchedMatches, fetchedScorers] = await Promise.all([
                matchService.getAllMatches(),
                scorerService.getAllScorers()
            ]);

            // Self-healing: Recalculate all matches to ensure derived state matches event log
            const healedMatches = fetchedMatches.map(m => {
                if (m.status === 'live' || m.status === 'completed') {
                    return scoreEngine.recalculateMatch(m);
                }
                return m;
            });

            setMatches(healedMatches);
            setMatchScorers(fetchedScorers);
        } catch (error) {
            console.error('Failed to refresh matches:', error);
        }
    }, []);


    useEffect(() => {
        localStorage.setItem('scoreheroes_followed_matches', JSON.stringify(followedMatches));
    }, [followedMatches]);

    useEffect(() => {
        refreshMatches();
    }, [refreshMatches]);

    const { showToast } = useToast();

    // Setup Real-time Subscriptions for Followed Matches
    useEffect(() => {
        const handleMatchUpdate = (updatedMatch: Match, updateType: 'score' | 'status' | 'general') => {
            console.log('[MatchProvider] Received realtime update:', updatedMatch.id, updateType);

            // Update local state
            setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));

            // Show notification if it's a significant update
            if (updateType === 'score') {
                const message = `${updatedMatch.homeParticipant.name} ${updatedMatch.homeParticipant.score}/${updatedMatch.homeParticipant.wickets} vs ${updatedMatch.awayParticipant.name} ${updatedMatch.awayParticipant.score}/${updatedMatch.awayParticipant.wickets}`;
                showToast(message, 'message', 'Match Score Update');
            } else if (updateType === 'status') {
                const matchName = `${updatedMatch.homeParticipant.name} vs ${updatedMatch.awayParticipant.name}`;
                showToast(`Match status changed to ${updatedMatch.status}`, 'info', matchName);
            }
        };

        // Subscribe to all followed matches
        followedMatches.forEach(id => {
            matchNotificationService.subscribeToMatch(id, handleMatchUpdate);
        });

        // Cleanup: Unsubscribe from all when followedMatches change or unmount
        // Note: For efficiency, we could only unsubscribe from ones removed, 
        // but matchNotificationService.subscribeToMatch already prevents duplicates.
        return () => {
            // No need to unsubscribe all every time, 
            // but we should probably have a way to unsubscribe individual matches.
            // For now, this is fine for a demo/POC.
        };
    }, [followedMatches, showToast]);

    const addMatch = async (match: Match) => {
        try {
            const newMatch = await matchService.createMatch(match);
            setMatches(prev => [newMatch, ...prev]);
        } catch (error) {
            console.error('Failed to create match:', error);
            alert('Failed to create match. Please try again.');
        }
    };

    const updateMatch = async (matchId: string, updates: Partial<Match>) => {
        try {
            await matchService.updateMatch(matchId, updates);
            setMatches(prev => prev.map(m => m.id === matchId ? { ...m, ...updates } : m));
        } catch (error) {
            console.error('Failed to update match:', error);
        }
    };

    const toggleFollowMatch = (matchId: string) => {
        const next = followedMatches.includes(matchId)
            ? followedMatches.filter(id => id !== matchId)
            : [...followedMatches, matchId];

        setFollowedMatches(next);

        if (currentUser) {
            updateUserProfile({
                followedEntities: {
                    ...(currentUser.followedEntities || {}),
                    matches: next
                }
            });
        }
    };

    const updateMatches = () => { refreshMatches(); };

    const assignScorer = async (matchId: string, userId: string) => {
        if (currentUser?.role !== 'admin') return;
        if (matchScorers.some(ms => ms.matchId === matchId && ms.userId === userId)) return;

        const newAssignment: MatchScorer = {
            id: `ms_${Date.now()}`,
            matchId,
            userId,
            assignedBy: currentUser.id,
            assignedAt: new Date().toISOString()
        };

        try {
            const createdScorer = await scorerService.assignScorer(newAssignment);
            setMatchScorers(prev => [...prev, createdScorer]);
        } catch (error) {
            console.error('Failed to assign scorer:', error);
        }
    };

    const removeScorer = async (matchId: string, userId: string) => {
        if (currentUser?.role !== 'admin') return;
        try {
            await scorerService.removeScorer(matchId, userId);
            setMatchScorers(prev => prev.filter(ms => !(ms.matchId === matchId && ms.userId === userId)));
        } catch (error) {
            console.error('Failed to remove scorer:', error);
        }
    };

    const getMatchScorers = (matchId: string) => {
        return matchScorers.filter(ms => ms.matchId === matchId);
    };

    const canScoreMatch = (matchId: string) => {
        if (!currentUser) return false;
        const match = matches.find(m => m.id === matchId);
        if (match?.createdByUserId === currentUser.id) return true;
        return matchScorers.some(ms => ms.matchId === matchId && ms.userId === currentUser.id);
    };

    const startMatch = async (matchId: string, initialData?: { strikerId: string; nonStrikerId: string; bowlerId: string }) => {
        const match = matches.find(m => m.id === matchId);
        if (!match || match.status !== 'draft') return;

        const updates: Partial<Match> = {
            status: 'live' as const,
            actualStartTime: new Date().toISOString()
        };

        if (initialData) {
            updates.liveState = {
                strikerId: initialData.strikerId,
                nonStrikerId: initialData.nonStrikerId,
                bowlerId: initialData.bowlerId,
                currentOver: 0,
                ballsInCurrentOver: 0,
                currentPeriod: 1,
                clockTime: '00:00',
                isPaused: false
            };
            if (!match.currentBattingTeamId && match.toss) {
                updates.currentBattingTeamId = match.toss.decision === 'BAT'
                    ? match.toss.winnerTeamId
                    : (match.toss.winnerTeamId === match.homeParticipant.id ? match.awayParticipant.id : match.homeParticipant.id);
            }
        }

        await updateMatch(matchId, updates);
    };

    const scoreMatch = async (matchId: string, eventOrRuns: number | Partial<ScoreEvent>, isWicketLegacy?: boolean) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;

        let newEvent: ScoreEvent;
        if (typeof eventOrRuns === 'number') {
            const battingTeamId = match.currentBattingTeamId || match.homeParticipant.id;
            const balls = (match.homeParticipant.id === battingTeamId ? match.homeParticipant.balls || 0 : match.awayParticipant.balls || 0);
            const over = Math.floor(balls / 6);
            const ballInOver = (balls % 6) + 1;
            const runs = eventOrRuns;
            const isWicket = isWicketLegacy || false;
            let desc = `Over ${over}.${ballInOver} - ${runs} runs`;
            if (isWicket) desc = `Over ${over}.${ballInOver} - WICKET!`;
            else if (runs === 4) desc = `Over ${over}.${ballInOver} - FOUR!`;
            else if (runs === 6) desc = `Over ${over}.${ballInOver} - SIX!`;

            newEvent = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date().toISOString(),
                points: runs,
                description: desc,
                type: isWicket ? 'wicket' : 'delivery',
                teamId: battingTeamId,
                runsScored: runs,
                isWicket: isWicket
            };
        } else {
            newEvent = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date().toISOString(),
                description: 'Ball bowled',
                points: 0,
                type: 'delivery',
                ...eventOrRuns
            } as ScoreEvent;
            if (newEvent.points === 0) newEvent.points = (newEvent.runsScored || 0) + (newEvent.extras?.runs || 0);
            if (!newEvent.description) {
                if (newEvent.isWicket) newEvent.description = "Wicket";
                else newEvent.description = `${newEvent.points} runs`;
            }
        }

        const updatedMatch = scoreEngine.applyEvent(match, newEvent);
        const subjectTeamName = (newEvent.teamId || updatedMatch.currentBattingTeamId) === updatedMatch.homeParticipant.id
            ? updatedMatch.homeParticipant.name
            : updatedMatch.awayParticipant.name;

        const feedItem: FeedItem = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'match_update',
            title: `${subjectTeamName}: ${newEvent.description}`,
            publishedAt: new Date().toISOString(),
            relatedEntityId: matchId,
            content: newEvent.description,
            visibility: 'public',
            authorId: 'system',
            authorName: 'System',
            authorType: 'system',
            media: [],
            likesCount: 0,
            commentsCount: 0,
            sharesCount: 0,
            hashtags: [],
            isLikedByCurrentUser: false
        };

        setSyncStatus('syncing');
        try {
            await matchService.updateMatch(matchId, {
                homeParticipant: updatedMatch.homeParticipant,
                awayParticipant: updatedMatch.awayParticipant,
                events: updatedMatch.events,
                currentBattingTeamId: updatedMatch.currentBattingTeamId,
                liveState: updatedMatch.liveState
            });
            await feedService.createFeedItem(feedItem);
            setMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));
            setSyncStatus('synced');
        } catch (error) {
            console.error('Failed to score match:', error);
            setSyncStatus('error');
        }
    };

    const endMatch = async (
        matchId: string,
        players: Player[],
        teams: Team[],
        achievements: Achievement[]
    ) => {
        const match = matches.find(m => m.id === matchId);
        if (!match || match.status === 'completed') return;
        if (achievements.some(a => a.matchId === matchId)) return;

        const homeScore = match.homeParticipant.score || 0;
        const awayScore = match.awayParticipant.score || 0;
        let winnerId: string | undefined;
        let homeResult: 'win' | 'loss' | 'draw' | undefined;
        let awayResult: 'win' | 'loss' | 'draw' | undefined;

        if (homeScore > awayScore) {
            winnerId = match.homeParticipant.id;
            homeResult = 'win';
            awayResult = 'loss';
        } else if (awayScore > homeScore) {
            winnerId = match.awayParticipant.id;
            homeResult = 'loss';
            awayResult = 'win';
        } else {
            homeResult = 'draw';
            awayResult = 'draw';
        }

        const teamA = teams.find((t: any) => t.id === match.homeParticipant.id);
        const teamB = teams.find((t: any) => t.id === match.awayParticipant.id);
        const teamAPlayers = teamA?.members ?? [];
        const teamBPlayers = teamB?.members ?? [];
        const homeMatchStats = match.homeParticipant.players || [];
        const awayMatchStats = match.awayParticipant.players || [];

        const mapStats = (teamPlayers: any[], matchStats: PlayerStats[]) => {
            return teamPlayers.map(m => {
                const stat = matchStats.find(s => s.playerId === m.playerId);
                return {
                    playerId: m.playerId,
                    runs: stat?.runs || 0,
                    balls: stat?.balls || 0,
                    wickets: stat?.wickets || 0,
                    catches: stat?.catches || 0,
                    ballsBowled: stat?.ballsBowled || 0,
                    runsConceded: stat?.runsConceded || 0,
                    runouts: stat?.runouts || 0,
                    goals: stat?.goals || 0,
                    assists: stat?.assists || 0,
                    yellowCards: stat?.yellowCards || 0,
                    redCards: stat?.redCards || 0
                };
            });
        };

        const homeStats = mapStats(teamAPlayers, homeMatchStats);
        const awayStats = mapStats(teamBPlayers, awayMatchStats);
        const allStats = [...homeStats, ...awayStats];

        const newAchievements: Achievement[] = [];
        if (allStats.length > 0) {
            const topScorer = allStats.reduce((prev, current) => {
                let prevImpact = match.sportId === 's3'
                    ? (prev.goals || 0) * 20 + (prev.assists || 0) * 10
                    : (prev.runs || 0) + ((prev.wickets || 0) * 20);
                let currentImpact = match.sportId === 's3'
                    ? (current.goals || 0) * 20 + (current.assists || 0) * 10
                    : (current.runs || 0) + ((current.wickets || 0) * 20);
                return (prevImpact > currentImpact) ? prev : current;
            });

            let impact = match.sportId === 's3'
                ? (topScorer.goals || 0) * 20 + (topScorer.assists || 0) * 10
                : (topScorer.runs || 0) + ((topScorer.wickets || 0) * 20);

            if (impact >= 20) {
                const player = players.find(p => p.id === topScorer.playerId);
                if (player) {
                    const desc = [];
                    if (match.sportId === 's3') {
                        if ((topScorer.goals || 0) > 0) desc.push(`${topScorer.goals} goals`);
                        if ((topScorer.assists || 0) > 0) desc.push(`${topScorer.assists} assists`);
                    } else {
                        if ((topScorer.runs || 0) > 0) desc.push(`${topScorer.runs} runs`);
                        if ((topScorer.wickets || 0) > 0) desc.push(`${topScorer.wickets} wickets`);
                    }
                    newAchievements.push({
                        id: Date.now().toString() + '_potm',
                        type: 'player_of_the_match',
                        title: 'Player of the Match',
                        playerId: player.id,
                        matchId: match.id,
                        date: new Date().toISOString(),
                        description: desc.join(' & ') || 'All-round performance'
                    });
                }
            }

            allStats.forEach(stat => {
                if (match.sportId === 's3') {
                    if ((stat.goals || 0) >= 3) {
                        newAchievements.push({
                            id: Date.now().toString() + '_' + stat.playerId + '_hattrick',
                            type: 'hat_trick',
                            title: 'Hat-Trick',
                            playerId: stat.playerId,
                            matchId: match.id,
                            date: new Date().toISOString(),
                            description: `Scored ${stat.goals} goals`
                        });
                    }
                } else {
                    if ((stat.runs || 0) >= 100) {
                        newAchievements.push({ id: Date.now().toString() + '_' + stat.playerId + '_100', type: 'century', title: 'Century', playerId: stat.playerId, matchId: match.id, date: new Date().toISOString(), description: `Scored ${stat.runs} runs` });
                    } else if ((stat.runs || 0) >= 50) {
                        newAchievements.push({ id: Date.now().toString() + '_' + stat.playerId + '_50', type: 'half_century', title: 'Half Century', playerId: stat.playerId, matchId: match.id, date: new Date().toISOString(), description: `Scored ${stat.runs} runs` });
                    }
                    if ((stat.wickets || 0) >= 5) {
                        newAchievements.push({ id: Date.now().toString() + '_' + stat.playerId + '_5w', type: 'five_wickets', title: 'Five Wickets', playerId: stat.playerId, matchId: match.id, date: new Date().toISOString(), description: `Taken ${stat.wickets} wickets` });
                    }
                }
            });
        }

        if (newAchievements.length > 0) {
            try {
                await Promise.all(newAchievements.map(a => achievementService.createAchievement(a)));
                // Update local achievements (ideally via a StatContext)
            } catch (error) {
                console.error('Failed to save achievements:', error);
            }
        }

        // For now, let's update match status
        await updateMatch(match.id, {
            status: 'completed',
            winnerId,
            homeParticipant: { ...match.homeParticipant, result: homeResult, players: homeStats },
            awayParticipant: { ...match.awayParticipant, result: awayResult, players: awayStats },
            actualEndTime: new Date().toISOString()
        });
    };

    const undoMatchEvent = async (matchId: string) => {
        const match = matches.find(m => m.id === matchId);
        if (!match || !match.events || match.events.length === 0) return;

        // 1. Remove the most recent event (first in list)
        const remainingEvents = match.events.slice(1);

        // 2. Recalculate state from scratch
        const recalculated = scoreEngine.recalculateMatch({ ...match, events: remainingEvents });

        // 3. Persist to Supabase
        setSyncStatus('syncing');
        try {
            await matchService.updateMatch(matchId, {
                homeParticipant: recalculated.homeParticipant,
                awayParticipant: recalculated.awayParticipant,
                events: recalculated.events,
                liveState: recalculated.liveState,
                currentBattingTeamId: recalculated.currentBattingTeamId
            });
            setMatches(prev => prev.map(m => m.id === matchId ? recalculated : m));
            setSyncStatus('synced');
        } catch (error) {
            console.error('Failed to undo match event:', error);
            setSyncStatus('error');
            alert('Undo failed. Please check your connection.');
        }
    };

    return (
        <MatchContext.Provider value={{
            matches,
            followedMatches,
            matchScorers,
            addMatch,
            updateMatch,
            scoreMatch,
            undoMatchEvent,
            startMatch,
            endMatch,
            toggleFollowMatch,
            updateMatches,
            assignScorer,
            removeScorer,
            getMatchScorers,
            canScoreMatch,
            refreshMatches,
            syncStatus,
            setMatches,
            setMatchScorers
        }}>
            {children}
        </MatchContext.Provider>
    );
};

export const useMatches = () => {
    const context = useContext(MatchContext);
    if (context === undefined) {
        throw new Error('useMatches must be used within a MatchProvider');
    }
    return context;
};
