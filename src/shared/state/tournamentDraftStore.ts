import { supabase } from '@shared/lib/supabase'

export type TournamentDraft = {
  id?: string
  name?: string
  logo?: string
  organizer?: string
  contact?: string
  level?: 'local'|'district'|'state'|'national'
  entryFee?: string
  prize?: string
  format?: 'league'|'knockout'|'league_knockout'
  halfDuration?: number
  playersOnCourt?: number
  squadSize?: number
  timeoutsPerHalf?: number
  superTackleEnabled?: boolean
  bonusPointEnabled?: boolean
  scoringNotes?: string
  registrationDeadline?: string
  startDate?: string
  endDate?: string
  venueName?: string
  cityState?: string
  mapsLink?: string
  courtsAvailable?: number
}

export async function saveTournamentDraft(patch: Partial<TournamentDraft>): Promise<string> {
  let userId: string | null = null
  try {
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
  } catch {
    userId = null
  }

  const base = {
    status: 'draft',
    name: patch.name || 'Untitled',
    ...mapDraftToRow(patch),
  } as any

  if (userId) {
    base.organizer_id = userId
    base.created_by = userId
  }

  const { data, error } = await supabase
    .from('tournaments')
    .upsert(base)
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

function mapDraftToRow(draft: Partial<TournamentDraft>) {
  const row: any = {
    level: draft.level,
    format: draft.format,
    entry_fee: draft.entryFee,
    prize: draft.prize,
    venue_name: draft.venueName,
    city_state: draft.cityState,
    maps_link: draft.mapsLink,
    courts_available: draft.courtsAvailable,
    half_duration_min: draft.halfDuration,
    players_on_court: draft.playersOnCourt,
    squad_size: draft.squadSize,
    timeouts_per_half: draft.timeoutsPerHalf,
    super_tackle_enabled: draft.superTackleEnabled,
    bonus_point_enabled: draft.bonusPointEnabled,
    scoring_notes: draft.scoringNotes,
    contact: draft.contact,
  }

  // Only add dates if they are non-empty strings
  if (draft.registrationDeadline) row.registration_deadline = draft.registrationDeadline;
  if (draft.startDate) row.start_date = draft.startDate;
  if (draft.endDate) row.end_date = draft.endDate;

  return row;
}

const KEY = 'gl.tournament.draft'

export function getDraft(): TournamentDraft {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) as TournamentDraft : {}
  } catch { return {} }
}

export function saveDraft(patch: TournamentDraft) {
  const curr = getDraft()
  const next = { ...curr, ...patch }
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
}
