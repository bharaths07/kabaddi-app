import { supabase } from '@shared/lib/supabase'

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
  config: any
  toss?: TossDetails
  status: MatchStatus
  supabaseId?: string  // real UUID from kabaddi_matches table
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

export function clearCurrentMatch() {
  try { localStorage.removeItem(KEY) } catch {}
}

// Called from KabaddiStartMatch — saves to BOTH localStorage AND Supabase
export async function upsertFromDraft(args: {
  teamAId: string
  teamBId: string
  config: any
}): Promise<Match> {
  const existing = getCurrentMatch()

  // Get current user
  let userId: string | null = null
  try {
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
  } catch {}

  // Save to Supabase
  try {
    const insertData: any = {
      status: 'toss_pending',
      created_by: userId,
      format: args.config.format || 'standard',
      half_duration_min: args.config.halfDurationMinutes || 20,
      break_duration_min: args.config.breakDurationMinutes || 5,
      raid_time_seconds: args.config.raidTimeSeconds || 30,
      bonus_line_enabled: args.config.bonusLineEnabled ?? true,
      do_or_die_enabled: args.config.doOrDieEnabled ?? true,
      super_tackle_enabled: args.config.superTackleEnabled ?? true,
      all_out_points: args.config.allOutPoints || 2,
    }

    // Only add team IDs if they are real UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-/i
    if (uuidRegex.test(args.teamAId)) insertData.team_home_id = args.teamAId
    if (uuidRegex.test(args.teamBId)) insertData.team_guest_id = args.teamBId

    const { data, error } = await supabase
      .from('kabaddi_matches')
      .insert(insertData)
      .select('id')
      .single()

    if (!error && data) {
      const match: Match = {
        id: data.id,  // use real UUID as the match ID
        supabaseId: data.id,
        teamAId: args.teamAId,
        teamBId: args.teamBId,
        config: args.config,
        status: 'toss_pending',
        toss: existing?.toss,
      }
      saveCurrentMatch(match)

      // Auto-assign scorer
      if (userId) {
        try {
          await supabase.from('match_scorers').upsert({
            match_id: data.id,
            user_id: userId,
          })
        } catch {}
      }

      return match
    }
  } catch (e) {
    console.warn('Supabase match save failed, using local:', e)
  }

  // Fallback to localStorage only
  const id = existing?.id || String(Date.now())
  const match: Match = {
    id,
    teamAId: args.teamAId,
    teamBId: args.teamBId,
    config: args.config,
    status: 'toss_pending',
    toss: existing?.toss,
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

// Called when toss is done and match starts — updates Supabase status to 'live'
export async function setStatus(status: MatchStatus) {
  const m = getCurrentMatch()
  if (!m) return
  m.status = status
  saveCurrentMatch(m)

  // Update in Supabase if we have a real UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-/i
  if (uuidRegex.test(m.id)) {
    try {
      const updateData: any = { status }

      // Also save toss data when going live
      if (status === 'live' && m.toss) {
        updateData.toss_winner_id = uuidRegex.test(m.toss.winnerTeamId) ? m.toss.winnerTeamId : null
        updateData.raiding_first_id = uuidRegex.test(m.toss.firstRaidTeamId) ? m.toss.firstRaidTeamId : null
      }

      await supabase
        .from('kabaddi_matches')
        .update(updateData)
        .eq('id', m.id)
    } catch (e) {
      console.warn('Status update failed:', e)
    }
  }
}

export async function saveToss(matchId: string, toss: TossDetails) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-/i
  if (!uuidRegex.test(matchId)) return

  await supabase
    .from('kabaddi_matches')
    .update({
      toss_decision: toss.decision,
      status: 'toss_completed',
    })
    .eq('id', matchId)
}