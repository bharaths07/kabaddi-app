import { Match } from '@/features/matches/types/match';

export interface CalculatedProfileStats {
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  formGuide: ('W' | 'L' | 'D')[]; // Last 5 matches
  bestStreak: number;
  totalRuns?: number;
  totalWickets?: number;
  averageScore?: number;
}

export const calculatePlayerStatsFromMatches = (matches: Match[], playerId: string): CalculatedProfileStats => {
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let totalRuns = 0;
  let totalWickets = 0;
  const form: ('W' | 'L' | 'D')[] = [];

  // Sort matches by date (descending for form guide)
  const sortedMatches = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Completed matches only for stats
  const completedMatches = sortedMatches.filter(m => m.status === 'completed' || m.status === 'locked');

  completedMatches.forEach(match => {
    // Determine player's team efficiently
    const isHome = match.homeParticipant.players?.some(p => p.playerId === playerId) || match.homeParticipant.id === playerId;
    const isAway = !isHome && (match.awayParticipant.players?.some(p => p.playerId === playerId) || match.awayParticipant.id === playerId);

    const myTeamId = isHome ? match.homeParticipant.id : isAway ? match.awayParticipant.id : undefined;

    if (!myTeamId) return; // Player not part of this match (sanity check)

    let result: 'W' | 'L' | 'D' = 'D';

    if (match.winnerId) {
      if (match.winnerId === myTeamId) {
        wins++;
        result = 'W';
        currentStreak++;
      } else {
        losses++;
        result = 'L';
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 0;
      }
    } else {
      draws++;
      result = 'D';
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 0;
    }

    if (form.length < 5) {
      form.push(result);
    }

    // Aggregate deep stats
    const pStats = isHome
      ? match.homeParticipant.players?.find(p => p.playerId === playerId)
      : match.awayParticipant.players?.find(p => p.playerId === playerId);

    if (pStats) {
      totalRuns += (pStats.runs || 0);
      totalWickets += (pStats.wickets || 0);
    }
  });

  // Final streak check
  maxStreak = Math.max(maxStreak, currentStreak);

  // Calculate Win Rate
  const totalCompleted = wins + losses + draws;
  const winRate = totalCompleted > 0 ? Math.round((wins / totalCompleted) * 100) : 0;

  return {
    matchesPlayed: totalCompleted,
    wins,
    losses,
    draws,
    winRate,
    formGuide: form,
    bestStreak: maxStreak,
    totalRuns,
    totalWickets,
    averageScore: totalCompleted > 0 ? totalRuns / totalCompleted : 0
  };
};

import { TeamStats } from '@/features/teams/types/team';

export const calculateTeamStatsFromMatches = (matches: Match[], teamId: string, sportId: string): TeamStats => {
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let goalsScored = 0;
  let goalsConceded = 0;
  let runsScored = 0;
  let wicketsLost = 0;
  const form: ('W' | 'L' | 'D')[] = [];

  const completedMatches = matches.filter(m => m.status === 'completed' || m.status === 'locked');
  const sortedMatches = [...completedMatches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  sortedMatches.forEach(match => {
    const isHome = match.homeParticipant.id === teamId;
    const isAway = match.awayParticipant.id === teamId;
    if (!isHome && !isAway) return;

    let result: 'W' | 'L' | 'D' = 'D';
    if (match.winnerId) {
      if (match.winnerId === teamId) {
        wins++;
        result = 'W';
      } else {
        losses++;
        result = 'L';
      }
    } else {
      draws++;
      result = 'D';
    }

    if (form.length < 5) {
      form.push(result);
    }

    // Sport specific stats
    if (sportId === 's2') { // Football
      goalsScored += (isHome ? match.homeParticipant.score : match.awayParticipant.score) || 0;
      goalsConceded += (isHome ? match.awayParticipant.score : match.homeParticipant.score) || 0;
    } else if (sportId === 's1') { // Cricket
      runsScored += (isHome ? match.homeParticipant.score : match.awayParticipant.score) || 0;
      const myTeam = isHome ? match.homeParticipant : match.awayParticipant;
      wicketsLost += myTeam.wickets || 0;
    }
  });

  const totalPlayed = wins + losses + draws;
  const winRate = totalPlayed > 0 ? Math.round((wins / totalPlayed) * 100) : 0;

  return {
    matchesPlayed: totalPlayed,
    wins,
    losses,
    draws,
    winRate,
    goalsScored: sportId === 's2' ? goalsScored : undefined,
    goalsConceded: sportId === 's2' ? goalsConceded : undefined,
    goalDifference: sportId === 's2' ? (goalsScored - goalsConceded) : undefined,
    runsScored: sportId === 's1' ? runsScored : undefined,
    wicketsLost: sportId === 's1' ? wicketsLost : undefined,
    formGuide: form,
  };
};
