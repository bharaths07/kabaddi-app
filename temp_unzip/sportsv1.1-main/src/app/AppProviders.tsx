import React, { createContext, useContext, useEffect, ReactNode, useCallback } from 'react';
import { AuthProvider, useAuth } from './providers/AuthContext';
import { MatchProvider, useMatches } from './providers/MatchContext';
import { TeamProvider, useTeams } from './providers/TeamContext';
import { TournamentProvider, useTournaments } from './providers/TournamentContext';
import { PlayerProvider, usePlayers } from './providers/PlayerContext';
import { SocialProvider, useSocial } from './providers/SocialContext';
import { SystemProvider, useSystem } from './providers/SystemContext';

import { matchService } from '@/features/matches/api/matchService';
import { teamService } from '@/features/teams/api/teamService';
import { tournamentService } from '@/features/tournaments/api/tournamentService';
import { profileService } from '@/features/players/api/profileService';
import { achievementService } from '@/features/stats/api/achievementService';
import { certificateService } from '@/features/certificates/api/certificateService';
import { feedService } from '@/features/social/api/feedService';
import { scorerService } from '@/features/stats/api/scorerService';
import { playerService } from '@/features/players/api/playerService';

import { Player } from '@/features/players/types/player';

// Bridge to maintain backward compatibility
const GlobalContext = createContext<any>(undefined);

const GlobalBridge: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const matches = useMatches();
  const teams = useTeams();
  const tournaments = useTournaments();
  const players = usePlayers();
  const social = useSocial();
  const system = useSystem();

  const [isLoading, setIsLoading] = React.useState(true);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        fetchedMatches,
        fetchedTeams,
        fetchedTournaments,
        fetchedProfiles,
        fetchedAchievements,
        fetchedCertificates,
        fetchedFeedItems,
        fetchedScorers,
        fetchedPlayers
      ] = await Promise.all([
        matchService.getAllMatches().catch(e => { console.error('Matches fetch fail:', e); return []; }),
        teamService.getAllTeams().catch(e => { console.error('Teams fetch fail:', e); return []; }),
        tournamentService.getAllTournaments().catch(e => { console.error('Tournaments fetch fail:', e); return []; }),
        profileService.getAllProfiles().catch(e => { console.error('Profiles fetch fail:', e); return []; }),
        achievementService.getAllAchievements().catch(e => { console.error('Achievements fetch fail:', e); return []; }),
        certificateService.getAllCertificates().catch(e => { console.error('Certificates fetch fail:', e); return []; }),
        feedService.getAllFeedItems().catch(e => { console.error('FeedItems fetch fail:', e); return []; }),
        scorerService.getAllScorers().catch(e => { console.error('Scorers fetch fail:', e); return []; }),
        playerService.getAllPlayers().catch(e => { console.error('Players fetch fail:', e); return []; })
      ]);

      matches.setMatches(fetchedMatches);
      teams.setTeams(fetchedTeams);
      tournaments.setTournaments(fetchedTournaments);
      social.setAchievements(fetchedAchievements);
      social.setCertificates(fetchedCertificates);
      social.setFeedItems(fetchedFeedItems);
      matches.setMatchScorers(fetchedScorers);

      if (fetchedPlayers.length > 0) {
        players.setPlayers(fetchedPlayers);
      } else {
        const mappedPlayers: Player[] = fetchedProfiles.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: undefined,
          firstName: u.name?.split(' ')[0] || '',
          lastName: u.name?.split(' ').slice(1).join(' ') || '',
          active: true,
          status: 'active' as const,
          stats: { matchesPlayed: 0, wins: 0, losses: 0, draws: 0, scoreAccumulated: 0 },
          history: []
        }));
        players.setPlayers(mappedPlayers);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [matches, teams, tournaments, social, players]);

  useEffect(() => {
    refreshData();
  }, []);

  const value = {
    ...auth,
    ...matches,
    ...teams,
    ...tournaments,
    ...players,
    ...social,
    ...system,
    isLoading,
    refreshData,
    updateMatches: matches.updateMatches,
    updatePlayers: players.updatePlayers,
    updateTeams: teams.updateTeams,
    updateFeed: social.updateFeed,
    addScorerToTournament: tournaments.addScorerToTournament,
    removeScorerFromTournament: tournaments.removeScorerFromTournament,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { ToastProvider } from '@/shared/components/ui/Toast';

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <SystemProvider>
            <PlayerProvider>
              <TeamProvider>
                <TournamentProvider>
                  <MatchProvider>
                    <SocialProvider>
                      <GlobalBridge>
                        {children}
                      </GlobalBridge>
                    </SocialProvider>
                  </MatchProvider>
                </TournamentProvider>
              </TeamProvider>
            </PlayerProvider>
          </SystemProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within AppProviders');
  }
  return context;
};
