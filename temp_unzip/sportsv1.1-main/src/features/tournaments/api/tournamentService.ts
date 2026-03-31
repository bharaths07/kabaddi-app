import { supabase } from '@/shared/lib/supabase';
import { Tournament } from '@/features/tournaments/types/tournament';

interface DbTournament {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  status?: Tournament['status'];
  location?: string;
  description?: string;
  banner_url?: string;
  organizer_id?: string;
  organizer?: { name?: string } | null;
  structure?: unknown;
  teams?: string[];
  scorers?: string[];
  schedule_mode?: 'AUTO' | 'MANUAL' | 'LATER';
}

type DbTournamentInsert = {
  name?: string;
  start_date?: string;
  end_date?: string;
  status?: Tournament['status'];
  location?: string;
  description?: string;
  banner_url?: string;
  organizer_id?: string;
  structure?: unknown;
  teams?: string[];
  scorers?: string[];
};

type DbTournamentUpdate = Partial<{
  name: string;
  status: Tournament['status'];
  start_date: string;
  end_date: string;
  location: string;
  description: string;
  banner_url: string;
  structure: unknown;
  teams: string[];
  scorers: string[];
  schedule_mode: 'AUTO' | 'MANUAL' | 'LATER';
}>;

export async function getAllTournaments(): Promise<Tournament[]> {
  const { data, error } = await supabase
    .from('tournaments')
    .select(`
      *,
      organizer:organizer_id (name)
    `);

  if (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }

  return (data || []).map((t) => mapToDomain(t as DbTournament));
}

export async function createTournament(tournament: Partial<Tournament>): Promise<Tournament> {
  const dbTournament: DbTournamentInsert = {
    name: tournament.name,
    start_date: tournament.startDate,
    end_date: tournament.endDate,
    status: tournament.status || 'upcoming',
    location: tournament.location,
    description: tournament.description,
    banner_url: tournament.bannerUrl,
    organizer_id: tournament.organizerId,
    structure: tournament.structure,
    teams: tournament.teams || [],
    scorers: tournament.scorers || []
  };

  const { data, error } = await supabase
    .from('tournaments')
    .insert(dbTournament)
    .select()
    .single();

  if (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }

  return mapToDomain(data as DbTournament);
}

export async function updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament> {
  const dbUpdates: DbTournamentUpdate = {};
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.startDate) dbUpdates.start_date = updates.startDate;
  if (updates.endDate) dbUpdates.end_date = updates.endDate;
  if (updates.location) dbUpdates.location = updates.location;
  if (updates.description) dbUpdates.description = updates.description;
  if (updates.bannerUrl) dbUpdates.banner_url = updates.bannerUrl;
  if (updates.structure) dbUpdates.structure = updates.structure;
  if (updates.teams) dbUpdates.teams = updates.teams;
  if (updates.scorers) dbUpdates.scorers = updates.scorers;
  if (updates.scheduleMode) dbUpdates.schedule_mode = updates.scheduleMode;

  const { data, error } = await supabase
    .from('tournaments')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating tournament:', error);
    throw error;
  }

  return mapToDomain(data as DbTournament);
}

export async function addTeam(tournamentId: string, teamId: string): Promise<void> {
  // 1. Fetch current teams
  const { data: tournament, error: fetchError } = await supabase
    .from('tournaments')
    .select('teams')
    .eq('id', tournamentId)
    .single();

  if (fetchError) throw fetchError;

  const currentTeams = tournament.teams || [];
  if (currentTeams.includes(teamId)) return;

  const newTeams = [...currentTeams, teamId];

  // 2. Update teams array
  const { error: updateError } = await supabase
    .from('tournaments')
    .update({ teams: newTeams })
    .eq('id', tournamentId);

  if (updateError) throw updateError;
}

export async function removeTeam(tournamentId: string, teamId: string): Promise<void> {
  const { data: tournament, error: fetchError } = await supabase
    .from('tournaments')
    .select('teams')
    .eq('id', tournamentId)
    .single();

  if (fetchError) throw fetchError;

  const currentTeams = tournament.teams || [];
  const newTeams = currentTeams.filter((id: string) => id !== teamId);

  const { error: updateError } = await supabase
    .from('tournaments')
    .update({ teams: newTeams })
    .eq('id', tournamentId);

  if (updateError) throw updateError;
}

export async function addScorer(tournamentId: string, userId: string): Promise<void> {
  const { data: tournament, error: fetchError } = await supabase
    .from('tournaments')
    .select('scorers')
    .eq('id', tournamentId)
    .single();

  if (fetchError) throw fetchError;

  const currentScorers = tournament.scorers || [];
  if (currentScorers.includes(userId)) return;

  const newScorers = [...currentScorers, userId];

  const { error: updateError } = await supabase
    .from('tournaments')
    .update({ scorers: newScorers })
    .eq('id', tournamentId);

  if (updateError) throw updateError;
}

export async function removeScorer(tournamentId: string, userId: string): Promise<void> {
  const { data: tournament, error: fetchError } = await supabase
    .from('tournaments')
    .select('scorers')
    .eq('id', tournamentId)
    .single();

  if (fetchError) throw fetchError;

  const currentScorers = tournament.scorers || [];
  const newScorers = currentScorers.filter((id: string) => id !== userId);

  const { error: updateError } = await supabase
    .from('tournaments')
    .update({ scorers: newScorers })
    .eq('id', tournamentId);

  if (updateError) throw updateError;
}


export const tournamentService = {
  getAllTournaments,
  createTournament,
  updateTournament,
  addTeam,
  removeTeam,
  addScorer,
  removeScorer
};

function mapToDomain(dbT: DbTournament): Tournament {
  const start = dbT.start_date || '';
  const end = dbT.end_date || '';
  const dateString = end ? `${start} - ${end}` : start;

  return {
    id: dbT.id,
    name: dbT.name,
    organizer: dbT.organizer?.name || 'Organizer',
    organizerId: dbT.organizer_id,
    dates: dateString,
    location: dbT.location || '',
    description: dbT.description || '',
    bannerUrl: dbT.banner_url || '',
    status: dbT.status || 'upcoming',
    structure: dbT.structure as Tournament['structure'],
    startDate: dbT.start_date,
    endDate: dbT.end_date,
    teams: dbT.teams || [],
    scorers: dbT.scorers || [],
    scheduleMode: dbT.schedule_mode
  };
}
