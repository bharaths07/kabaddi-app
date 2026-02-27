import type { KabaddiMatchConfig } from '../types/matchConfig'

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
