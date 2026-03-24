import type { KabaddiMatchConfig } from '../types/matchConfig'
export type TeamSummary = { id: string; name: string; location?: string }
export type PlayerSummary = { id: string; name: string; phone?: string; isCaptain?: boolean; jerseyNumber?: number }
export type CreateDraft = { teamA?: TeamSummary; teamB?: TeamSummary; playersA?: PlayerSummary[]; playersB?: PlayerSummary[]; config?: KabaddiMatchConfig }

const KEY = 'kabaddi.create.draft'

function read(): CreateDraft {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function write(draft: CreateDraft) {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft))
  } catch {
    // ignore
  }
}

export function getDraft(): CreateDraft {
  return read()
}

export function setTeam(slot: 'a' | 'b', team: TeamSummary) {
  const current = read()
  if (slot === 'a') current.teamA = team
  else current.teamB = team
  write(current)
}

export function setConfig(config: KabaddiMatchConfig) {
  const current = read()
  current.config = config
  write(current)
}

export function getConfig(): KabaddiMatchConfig | undefined {
  return read().config
}

export function setSquad(slot: 'a' | 'b', players: PlayerSummary[]) {
  const current = read()
  if (slot === 'a') current.playersA = players
  else current.playersB = players
  write(current)
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY)
  } catch {
  }
}
