import type { KabaddiMatchConfig } from '../types/matchConfig'
import { supabase } from '@shared/lib/supabase'
import { assignScorer } from '@shared/services/fixturesService'

export type MatchStatus = 'draft' | 'toss_pending' | 'toss_completed' | 'live' | 'completed'
export type TossDetails = {
  calledByTeamId: string
  calledChoice: 'heads' | 'tails'
  result: 'heads' | 'tails'
  winnerTeamId: string
  decision: 'raid_first' | 'court_side'
  firstRaidTeamId: string
  courtSideChoice?: 'left' | 'right'
}
export type Match = {
  id: string
  teamAId: string
  teamBId: string
  config: KabaddiMatchConfig
  toss?: TossDetails
  status: MatchStatus
}

const KEY = 'kabaddi.current.match'

export function getCurrentMatch(): Match | undefined {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) as Match : undefined
  } catch { return undefined }
}

export function saveCurrentMatch(m: Match) {
  try { localStorage.setItem(KEY, JSON.stringify(m)) } catch {}
}

export function upsertFromDraft(args: { teamAId: string; teamBId: string; config: KabaddiMatchConfig }): Match {
  const existing = getCurrentMatch()
  const id = existing?.id || String(Date.now())
  const match: Match = {
    id,
    teamAId: args.teamAId,
    teamBId: args.teamBId,
    config: args.config,
    status: 'toss_pending',
    toss: existing?.toss
  }
  saveCurrentMatch(match)
  return match
}

export function setToss(toss: TossDetails) {
  const m = getCurrentMatch()
  if (!m) return
  m.toss = toss
  m.status = 'toss_completed'
  saveCurrentMatch(m)
}

export function setStatus(status: MatchStatus) {
  const m = getCurrentMatch()
  if (!m) return
  m.status = status
  saveCurrentMatch(m)
}

export async function createKabaddiMatch(fixtureId: string, config: KabaddiMatchConfig) {
  let userId: string | null = null
  try {
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
  } catch {
    userId = null
  }

  const { data, error } = await supabase
    .from('kabaddi_matches')
    .insert({
      fixture_id: fixtureId,
      created_by: userId,
      format: config.format,
      half_duration_min: config.halfDurationMinutes,
      break_duration_min: config.breakDurationMinutes,
      players_on_court: config.playersOnCourt,
      substitutes_allowed: config.substitutesAllowed,
      raid_time_seconds: config.raidTimeSeconds,
      bonus_line_enabled: config.bonusLineEnabled,
      do_or_die_enabled: config.doOrDieEnabled,
      super_tackle_enabled: config.superTackleEnabled,
      all_out_points: config.allOutPoints,
      golden_raid_enabled: config.goldenRaidEnabled,
      tie_breaker_mode: config.tieBreakerMode,
      surface: config.venue.surface,
      indoor: config.venue.indoor,
      status: 'toss_pending',
    })
    .select()
    .single()

  if (error) throw error
  if (userId) {
    try { await assignScorer(fixtureId, userId) } catch {}
  }
  return data
}

export async function saveToss(matchId: string, toss: TossDetails) {
  const { error } = await supabase
    .from('kabaddi_matches')
    .update({
      toss_called_by_team_id: toss.calledByTeamId,
      toss_called_choice: toss.calledChoice,
      toss_result: toss.result,
      toss_winner_team_id: toss.winnerTeamId,
      toss_decision: toss.decision,
      first_raid_team_id: toss.firstRaidTeamId,
      status: 'toss_completed',
    })
    .eq('id', matchId)

  if (error) throw error
}
