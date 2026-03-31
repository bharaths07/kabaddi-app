import { supabase } from '@/shared/lib/supabase';
import { Player } from '../types/player';

interface DbPlayer {
  id: string;
  user_id?: string;
  first_name: string;
  last_name?: string;
  active: boolean;
  status?: string;
  stats?: Player['stats'];
  history?: Player['history'];
  avatar_url?: string;
  photos?: Player['photos'];
  highlights?: Player['highlights'];
}

type DbPlayerInsert = {
  user_id?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  stats?: Player['stats'];
  history?: Player['history'];
  active?: boolean;
  status?: string;
  avatar_url?: string;
};

type DbPlayerUpdate = Partial<{
  first_name: string;
  last_name: string;
  stats: Player['stats'];
  history: Player['history'];
  active: boolean;
  status: string;
  avatar_url: string;
  photos: Player['photos'];
  highlights: Player['highlights'];
}>;

export async function getAllPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*');

  if (error) {
    console.error('Error fetching players:', error);
    return [];
  }

  return (data || []).map((p) => mapToDomain(p as DbPlayer));
}

export async function getPlayer(id: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching player:', error);
    return null;
  }

  return mapToDomain(data as DbPlayer);
}

export async function createPlayer(player: Partial<Player>): Promise<Player> {
  const dbPlayer: DbPlayerInsert = {
    user_id: player.userId,
    first_name: player.firstName,
    last_name: player.lastName,
    stats: player.stats,
    history: player.history,
    active: player.active ?? true,
    status: player.status ?? 'active',
    avatar_url: player.avatarUrl
  };

  const { data, error } = await supabase
    .from('players')
    .insert(dbPlayer)
    .select()
    .single();

  if (error) {
    console.error('Error creating player:', error);
    throw error;
  }

  return mapToDomain(data as DbPlayer);
}

export async function updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
  const dbUpdates: DbPlayerUpdate = {};
  if (updates.firstName) dbUpdates.first_name = updates.firstName;
  if (updates.lastName) dbUpdates.last_name = updates.lastName;
  if (updates.stats) dbUpdates.stats = updates.stats;
  if (updates.history) dbUpdates.history = updates.history;
  if (updates.active !== undefined) dbUpdates.active = updates.active;
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
  if (updates.photos) dbUpdates.photos = updates.photos;
  if (updates.highlights) dbUpdates.highlights = updates.highlights;

  const { data, error } = await supabase
    .from('players')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating player:', error);
    throw error;
  }

  return mapToDomain(data as DbPlayer);
}

export const playerService = {
  getAllPlayers,
  getPlayer,
  createPlayer,
  updatePlayer
};

function mapToDomain(dbPlayer: DbPlayer): Player {
  return {
    id: dbPlayer.id,
    userId: dbPlayer.user_id,
    firstName: dbPlayer.first_name,
    lastName: dbPlayer.last_name || '',
    active: dbPlayer.active,
    status: dbPlayer.status as Player['status'],
    stats: dbPlayer.stats || {
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      scoreAccumulated: 0
    },
    history: dbPlayer.history || [],
    avatarUrl: dbPlayer.avatar_url,
    photos: dbPlayer.photos || [],
    highlights: dbPlayer.highlights || [],
    // Map other fields as necessary
  };
}
