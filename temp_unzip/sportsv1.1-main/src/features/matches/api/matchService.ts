import { supabase } from '@/shared/lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';
import { Match } from '@/features/matches/types/match';

interface DbTeamRef {
  name?: string;
}

interface DbMatch {
  id: string;
  tournament_id?: string;
  home_team_id: string;
  away_team_id: string;
  start_time: string;
  location: string;
  status: Match['status'];
  winner_id?: string;
  created_by: string;
  data?: Partial<Match>;
  home_team?: DbTeamRef;
  away_team?: DbTeamRef;
}

type QueryResponse<T> = { data: T | null; error: PostgrestError | null };

export async function getAllMatches(): Promise<Match[]> {
  const { data, error }: QueryResponse<DbMatch[]> = await supabase
    .from('matches')
    .select(`
      *,
      home_team:home_team_id (name),
      away_team:away_team_id (name)
    `);

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  return (data ?? []).map((m) => mapToDomain(m));
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  const { data, error }: QueryResponse<DbMatch> = await supabase
    .from('matches')
    .select(`
      *,
      home_team:home_team_id (name),
      away_team:away_team_id (name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching match:', error);
    return undefined;
  }

  return data ? mapToDomain(data) : undefined;
}

export async function createMatch(match: Match): Promise<Match> {
  const {
    homeParticipant, awayParticipant,
    tournamentId, date, location, status,
    createdByUserId, winnerId,
    ...restData
  } = match;

  const dbMatch = {
    tournament_id: tournamentId,
    home_team_id: homeParticipant.id,
    away_team_id: awayParticipant.id,
    start_time: date,
    location: location,
    status: status,
    created_by: createdByUserId,
    winner_id: winnerId,
    data: {
      homeParticipant,
      awayParticipant,
      ...restData
    }
  };

  const { data, error }: QueryResponse<DbMatch> = await supabase
    .from('matches')
    .insert(dbMatch)
    .select()
    .single();

  if (error) {
    console.error('Error creating match:', error);
    throw error;
  }

  return mapToDomain(data as DbMatch);
}

export async function updateMatch(matchId: string, updates: Partial<Match>): Promise<void> {
  const dbUpdates: { status?: Match['status']; winner_id?: string; start_time?: string } = {};
  const jsonUpdates: Partial<Pick<Match, 'events' | 'homeParticipant' | 'awayParticipant' | 'currentBattingTeamId' | 'liveState'>> = {};

  if (updates.status) dbUpdates.status = updates.status;
  if (updates.winnerId) dbUpdates.winner_id = updates.winnerId;
  if (updates.date) dbUpdates.start_time = updates.date;

  if (updates.events) jsonUpdates.events = updates.events;
  if (updates.homeParticipant) jsonUpdates.homeParticipant = updates.homeParticipant;
  if (updates.awayParticipant) jsonUpdates.awayParticipant = updates.awayParticipant;
  if (updates.currentBattingTeamId) jsonUpdates.currentBattingTeamId = updates.currentBattingTeamId;
  if (updates.liveState) jsonUpdates.liveState = updates.liveState;

  const { data: current, error: fetchError }: QueryResponse<Pick<DbMatch, 'data'>> = await supabase
    .from('matches')
    .select('data')
    .eq('id', matchId)
    .single();

  if (fetchError) throw fetchError;

  const newData = { ...(current?.data ?? {}), ...jsonUpdates };

  const { error: updateError } = await supabase
    .from('matches')
    .update({ ...dbUpdates, data: newData })
    .eq('id', matchId);

  if (updateError) throw updateError;
}

export const matchService = {
  getAllMatches,
  getMatchById,
  createMatch,
  updateMatch
};

function mapToDomain(dbMatch: DbMatch): Match {
  const jsonData = dbMatch.data || {};

  // Merge column data with JSON data
  // Columns take precedence for source of truth (status, ids)

  return {
    ...jsonData,
    id: dbMatch.id,
    tournamentId: dbMatch.tournament_id,
    sportId: jsonData.sportId || 's1', // Default to Cricket if not present
    // Ensure participants have names if they were missing in JSON but available via join
    homeParticipant: {
      ...jsonData.homeParticipant,
      id: dbMatch.home_team_id,
      name: dbMatch.home_team?.name || jsonData.homeParticipant?.name || 'Home Team',
      score: jsonData.homeParticipant?.score ?? 0
    },
    awayParticipant: {
      ...jsonData.awayParticipant,
      id: dbMatch.away_team_id,
      name: dbMatch.away_team?.name || jsonData.awayParticipant?.name || 'Away Team',
      score: jsonData.awayParticipant?.score ?? 0
    },
    date: dbMatch.start_time,
    location: dbMatch.location,
    status: dbMatch.status,
    winnerId: dbMatch.winner_id,
    createdByUserId: dbMatch.created_by,
    events: jsonData.events || [],
    officials: jsonData.officials || []
  };
}
