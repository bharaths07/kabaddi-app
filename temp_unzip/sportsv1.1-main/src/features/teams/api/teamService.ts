import { supabase } from '@/shared/lib/supabase';
import { Team, TeamMember } from '../types/team';

interface DbTeamMember {
  player_id?: string;
  user_id?: string;
  role: TeamMember['role'];
  joined_at: string;
}

interface DbTeam {
  id: string;
  name: string;
  sport_id?: string;
  type?: Team['type'];
  captain_id?: string;
  logo_url?: string;
  created_at?: string;
  active: boolean;
  team_members?: DbTeamMember[];
}

type DbTeamInsert = {
  name?: string;
  type?: Team['type'];
  captain_id?: string;
  logo_url?: string;
  active?: boolean;
  created_by?: string;
  sport_id?: string;
};

export async function getAllTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      team_members (*)
    `);

  if (error) {
    console.error('Error fetching teams:', error);
    return [];
  }

  return (data || []).map((t) => mapToDomain(t as DbTeam));
}

export async function createTeam(team: Partial<Team>): Promise<Team | null> {
  const { data: { user } } = await supabase.auth.getUser();

  const dbTeam: DbTeamInsert = {
    name: team.name,
    type: team.type,
    captain_id: team.captainId,
    logo_url: team.logoUrl,
    active: true,
    created_by: user?.id,
    sport_id: team.sportId
  };

  const { data, error } = await supabase
    .from('teams')
    .insert(dbTeam)
    .select()
    .single();

  if (error) {
    console.error('Error creating team:', error);
    throw error;
  }

  if (team.members && team.members.length > 0) {
    const membersToInsert = team.members.map(m => ({
      team_id: data.id,
      player_id: m.playerId,
      role: m.role,
      joined_at: new Date().toISOString()
    }));

    const { error: membersError } = await supabase
      .from('team_members')
      .insert(membersToInsert);

    if (membersError) {
      console.error('Error adding team members:', membersError);
    }
  }

  return mapToDomain({ ...(data as DbTeam), team_members: [] });
}

export async function addMember(teamId: string, member: TeamMember): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      player_id: member.playerId,
      role: member.role,
      joined_at: member.joinedAt || new Date().toISOString()
    });

  if (error) throw error;
}

export const teamService = {
  getAllTeams,
  createTeam,
  addMember
};

function mapToDomain(dbTeam: DbTeam): Team {
  return {
    id: dbTeam.id,
    name: dbTeam.name,
    sportId: dbTeam.sport_id || 'Cricket',
    type: dbTeam.type as Team['type'],
    members: (dbTeam.team_members || []).map((m: DbTeamMember) => ({
      playerId: m.player_id || m.user_id || 'unknown',
      role: m.role,
      joinedAt: m.joined_at
    })),
    captainId: dbTeam.captain_id || '',
    logoUrl: dbTeam.logo_url,
    createdAt: dbTeam.created_at || new Date().toISOString(),
    active: dbTeam.active,
    about: '',
    coach: '',
    achievements: []
  };
}
