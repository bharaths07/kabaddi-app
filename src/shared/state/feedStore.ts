type FeedType = 'update' | 'announcement' | 'highlight' | 'result'
type FeedItem = {
  id: string
  type: FeedType
  title: string
  sub: string
  date: string
  match?: { id: string; teams: string; status: 'live'|'completed'|'upcoming'; meta?: string }
}

const KEY = 'gl.feed.items'

function read(): FeedItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) as FeedItem[] : []
  } catch { return [] }
}

function write(items: FeedItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items.slice(0,200))) } catch {}
}

export function getItems(): FeedItem[] {
  return read().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function upsert(item: FeedItem) {
  const items = read()
  if (items.some(i => i.id === item.id)) return
  items.unshift(item)
  write(items)
}

export function addAnnouncement(title: string, sub: string) {
  const it: FeedItem = { id:`a${Date.now()}`, type:'announcement', title, sub, date: new Date().toISOString() }
  upsert(it)
}

export function addResult(args: { matchId:string; teams:string; resultText:string; date?: string }) {
  const it: FeedItem = {
    id:`r-${args.matchId}-${Date.now()}`,
    type:'result',
    title:'Match Result',
    sub: args.resultText,
    date: args.date || new Date().toISOString(),
    match: { id: args.matchId, teams: args.teams, status:'completed' }
  }
  upsert(it)
}

export function addEvent(args: { matchId:string; teams:string; status:'live'|'upcoming'|'completed'; half?: number; time?: string; eventId:string; type:'successful_raid'|'unsuccessful_raid'|'super_raid'|'super_tackle'|'all_out'|'substitution'|'timeout'; note?: string; ts?: number }) {
  const isHighlight = args.type === 'super_raid' || args.type === 'super_tackle'
  const type: FeedType = isHighlight ? 'highlight' : 'update'
  const title = isHighlight ? (args.type==='super_raid'?'Super Raid!':'Super Tackle!') : 'LIVE UPDATE'
  const it: FeedItem = {
    id:`e-${args.matchId}-${args.eventId}`,
    type,
    title,
    sub: args.note || '',
    date: new Date(args.ts || Date.now()).toISOString(),
    match: { id: args.matchId, teams: args.teams, status: args.status, meta: args.half && args.time ? `Half ${args.half} • ${args.time}` : undefined }
  }
  upsert(it)
}
