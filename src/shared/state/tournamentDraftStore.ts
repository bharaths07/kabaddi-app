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
