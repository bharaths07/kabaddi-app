import { supabase } from '../lib/supabase'

type AssignedFixture = {
  id: string
  home: string
  guest: string
  startsAt: string
  court?: string
  status: 'upcoming' | 'live' | 'completed'
  scorerStatus: 'assigned' | 'accepted' | 'declined' | 'scoring'
}

export async function getAssignedFixturesFor(userId: string): Promise<AssignedFixture[]> {
  const mock: AssignedFixture[] = [
    { id:'m1', home:'SKBC', guest:'Rangers', startsAt:new Date().toISOString(), court:'Court 1', status:'upcoming', scorerStatus:'assigned' },
    { id:'m2', home:'Warriors', guest:'Titans', startsAt:new Date(Date.now()+3600e3).toISOString(), court:'Court 2', status:'live', scorerStatus:'accepted' },
    { id:'m3', home:'Rangers', guest:'Warriors', startsAt:new Date(Date.now()-86400e3).toISOString(), court:'Court 1', status:'completed', scorerStatus:'accepted' }
  ]
  return mock
}

// Local storage keys for demo persistence
const K_ASSIGNMENTS = 'mock-fixture-assignments'

type AssignmentRecord = { fixtureId: string; userId: string; status: 'assigned' | 'accepted' | 'declined' | 'scoring' }

function readAssignments(): AssignmentRecord[] {
  try {
    const raw = localStorage.getItem(K_ASSIGNMENTS)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}
function writeAssignments(rows: AssignmentRecord[]) {
  localStorage.setItem(K_ASSIGNMENTS, JSON.stringify(rows))
}

export async function assignScorer(fixtureId: string, userId: string) {
  const rows = readAssignments().filter(r => !(r.fixtureId === fixtureId))
  rows.push({ fixtureId, userId, status: 'assigned' })
  writeAssignments(rows)
  return { ok: true }
}

export async function updateScorerStatus(fixtureId: string, userId: string, status: AssignmentRecord['status']) {
  const rows = readAssignments()
  const idx = rows.findIndex(r => r.fixtureId === fixtureId && r.userId === userId)
  if (idx >= 0) rows[idx].status = status
  else rows.push({ fixtureId, userId, status })
  writeAssignments(rows)
  return { ok: true }
}

export async function canScoreFixture(fixtureId: string, userId: string): Promise<boolean> {
  const rows = readAssignments()
  const r = rows.find(x => x.fixtureId === fixtureId && x.userId === userId)
  return !!r && (r.status === 'accepted' || r.status === 'scoring')
}
