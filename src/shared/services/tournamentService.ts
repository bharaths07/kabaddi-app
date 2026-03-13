import { supabase } from '../lib/supabase'
import type { Tournament, TournamentTeam, TournamentFixture } from '../../features/kabaddi/types/kabaddi.types'

export async function getTournament(id: string): Promise<Tournament | null> {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching tournament:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    venue: data.venue,
    level: data.level,
    status: data.status as any,
    startDate: data.start_date,
    endDate: data.end_date,
    totalTeams: 8, // Placeholder
    confirmedTeams: 5, // Placeholder
    totalMatches: 14, // Placeholder
    completedMatches: 2, // Placeholder
    joinCode: data.join_code,
  }
}

export async function getTournamentTeams(tournamentId: string): Promise<TournamentTeam[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('tournament_id', tournamentId)

  if (error) {
    console.error('Error fetching tournament teams:', error)
    return []
  }

  return data.map(t => ({
    id: t.id,
    name: t.name,
    color: t.color || '#0ea5e9',
    captain: '—', // Placeholder
    players: 0, // Placeholder
    status: t.status as any || 'confirmed',
  }))
}

export async function getTournamentFixtures(tournamentId: string): Promise<TournamentFixture[]> {
  const { data, error } = await supabase
    .from('fixtures')
    .select('*')
    .eq('tournament_id', tournamentId)

  if (error) {
    console.error('Error fetching tournament fixtures:', error)
    return []
  }

  return data.map(f => ({
    id: f.id,
    round: `Round ${f.round}`,
    teamA: f.team_home_id, // Need to join with teams
    teamB: f.team_guest_id, // Need to join with teams
    date: f.ts ? new Date(f.ts).toLocaleDateString() : '—',
    time: f.ts ? new Date(f.ts).toLocaleTimeString() : '—',
    court: f.court || 'Court 1',
    scorer: null,
    scorerStatus: 'unassigned',
    status: f.status as any || 'scheduled',
  }))
}
