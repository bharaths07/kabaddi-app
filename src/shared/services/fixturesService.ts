import { supabase } from '../lib/supabase'
import { notificationService } from './notificationService'

export type AssignedFixture = {
  id: string
  home: string
  guest: string
  startsAt: string
  court?: string
  status: 'upcoming' | 'live' | 'completed'
  scorerStatus: 'assigned' | 'accepted' | 'declined' | 'scoring'
}

export async function getAssignedFixturesFor(userId: string): Promise<AssignedFixture[]> {
  const { data, error } = await supabase
    .from('fixture_scorers')
    .select(`
      fixture_id,
      status,
      fixtures (
        id, status, scheduled_at, court,
        home: teams!team_home_id (name),
        guest: teams!team_guest_id (name)
      )
    `)
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching assigned fixtures:', error)
    return []
  }

  return (data || []).map((row: any) => ({
    id: row.fixture_id,
    home: row.fixtures?.home?.name || 'Home Team',
    guest: row.fixtures?.guest?.name || 'Guest Team',
    startsAt: row.fixtures?.scheduled_at || new Date().toISOString(),
    court: row.fixtures?.court || 'Court 1',
    status: row.fixtures?.status || 'upcoming',
    scorerStatus: row.status || 'assigned',
  }))
}

export async function assignScorer(fixtureId: string, userId: string) {
  const { error } = await supabase
    .from('fixture_scorers')
    .upsert({ fixture_id: fixtureId, user_id: userId, assigned_at: new Date().toISOString() })
  if (error) throw error
  
  // Post notification to the assigned user
  await notificationService.createNotification({
    user_id: userId,
    type: 'match',
    title: 'New Scorer Assignment 📋',
    body: `You have been assigned as a scorer for match #${fixtureId}.`,
    href: `/matches/assigned`
  });

  return { ok: true }
}

export async function assignMatchScorer(matchId: string, userId: string) {
  const { error } = await supabase
    .from('match_scorers')
    .upsert({ match_id: matchId, user_id: userId, assigned_at: new Date().toISOString() })
  if (error) throw error

  // Post notification to the assigned user
  await notificationService.createNotification({
    user_id: userId,
    type: 'match',
    title: 'Match Assignment 📋',
    body: `You have been assigned as a scorer for match #${matchId}.`,
    href: `/matches/assigned`
  });

  return { ok: true }
}

export async function updateScorerStatus(
  fixtureId: string,
  userId: string,
  status: 'assigned' | 'accepted' | 'declined' | 'scoring'
) {
  const { error } = await supabase
    .from('fixture_scorers')
    .update({ status })
    .eq('fixture_id', fixtureId)
    .eq('user_id', userId)
  if (error) throw error
  return { ok: true }
}

export async function canScoreFixture(fixtureId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('fixture_scorers')
    .select('status')
    .eq('fixture_id', fixtureId)
    .eq('user_id', userId)
    .single()
  return !!data && (data.status === 'accepted' || data.status === 'scoring')
}