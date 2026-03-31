import { supabase } from '@/shared/lib/supabase';
import { User } from '../types/user';

interface DbProfile {
  id: string;
  name?: string;
  email?: string;
  role?: 'user' | 'admin';
  avatar_url?: string;
  username?: string;
  favorite_game?: string;
  bio?: string;
  location?: string;
  created_at?: string;
  followers_count?: number;
  following_count?: number;
  profile_views?: number;
  game_roles?: string[] | null;
  gender?: string;
  date_of_birth?: string;
  display_email?: string;
  display_phone?: string;
  phone?: string;
  updated_at?: string;
  followed_entities?: {
    teams?: string[];
    matches?: string[];
    tournaments?: string[];
  } | null;
}

export function mapProfileData(data: DbProfile): User {
  return {
    id: data.id,
    name: data.name || '',
    email: data.email || '',
    role: data.role as 'user' | 'admin',
    avatarUrl: data.avatar_url,
    username: data.username,
    favoriteGame: data.favorite_game,
    bio: data.bio,
    location: data.location,
    memberSince: data.created_at ? new Date(data.created_at).getFullYear().toString() : undefined,
    followersCount: data.followers_count,
    followingCount: data.following_count,
    profileViews: data.profile_views,
    gameRoles: data.game_roles as any,
    gender: data.gender as any,
    dateOfBirth: data.date_of_birth,
    displayEmail: data.display_email || data.email,
    displayPhone: data.display_phone || data.phone,
    followedEntities: data.followed_entities || undefined,
  };
}

export async function getProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return mapProfileData(data as DbProfile);
}

export async function getProfileByUsername(username: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    return null;
  }

  return mapProfileData(data as DbProfile);
}

export async function createProfile(profile: User): Promise<User | null> {
  const dbProfile = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role || 'user',
    avatar_url: profile.avatarUrl,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert(dbProfile)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    throw error;
  }

  return mapProfileData(data as DbProfile);
}

export async function updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  const dbUpdates: Partial<DbProfile> = {};
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
  if (updates.username) dbUpdates.username = updates.username;
  if (updates.favoriteGame) dbUpdates.favorite_game = updates.favoriteGame;
  if (updates.bio) dbUpdates.bio = updates.bio;
  if (updates.location) dbUpdates.location = updates.location;
  if (updates.gender) dbUpdates.gender = updates.gender;
  if (updates.dateOfBirth) dbUpdates.date_of_birth = updates.dateOfBirth;
  if (updates.gameRoles) dbUpdates.game_roles = updates.gameRoles as any;
  if (updates.displayEmail) dbUpdates.display_email = updates.displayEmail;
  if (updates.displayPhone) dbUpdates.display_phone = updates.displayPhone;
  if (updates.followedEntities) dbUpdates.followed_entities = updates.followedEntities;

  dbUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return mapProfileData(data as DbProfile);
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  if (!username || username.length < 3) return false;

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    console.error('Error checking username:', error);
    if (error.message.includes('column') || error.code === '42703') {
      console.warn('⚠️ WARNING: Username column missing in database. Returning available.');
      return true;
    }
    return false;
  }

  return data === null;
}

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return null;
  }
}

export async function getAllProfiles(): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error('Error fetching all profiles:', error);
    return [];
  }

  return (data || []).map((p) => mapProfileData(p as DbProfile));
}

export const profileService = {
  getProfile,
  getProfileByUsername,
  createProfile,
  updateProfile,
  checkUsernameAvailability,
  uploadAvatar,
  getAllProfiles
};
