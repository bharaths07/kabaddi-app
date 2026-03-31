import { useMemo } from 'react';
import { useGlobalState } from '@/app/AppProviders';
import { calculateTournamentStats, sortLeaderboard } from '../api/statsService';
import { LeaderboardCategory } from '../types/stats';

export const useTournamentStats = (tournamentId: string, category: LeaderboardCategory = 'BAT') => {
  const { matches, teams, players } = useGlobalState();

  const tournamentMatches = useMemo(() => {
    return matches.filter(m =>
      m.tournamentId === tournamentId &&
      m.status === 'completed'
    );
  }, [matches, tournamentId]);

  const stats = useMemo(() => {
    return calculateTournamentStats(tournamentMatches, teams, players);
  }, [tournamentMatches, teams, players]);

  const leaderboardData = useMemo(() => {
    return sortLeaderboard(stats, category);
  }, [stats, category]);

  return {
    stats,
    leaderboardData,
    matchCount: tournamentMatches.length,
    isLoading: false // Since it's local state for now
  };
};
