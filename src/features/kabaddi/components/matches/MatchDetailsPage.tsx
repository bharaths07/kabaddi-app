import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import './match-details.css'
import { addEvent as feedAddEvent, addResult as feedAddResult } from '../../../../shared/state/feedStore'

type Status = 'live' | 'upcoming' | 'completed'
type Team = { id: string; name: string; short: string; logo?: string }
type EventType = 'successful_raid' | 'unsuccessful_raid' | 'super_raid' | 'super_tackle' | 'all_out' | 'substitution' | 'timeout'
type Event = { id: string; type: EventType; teamId: string; half: number; ts: number; note?: string }

type Details = {
  id: string
  status: Status
  tournament: string
  stage?: string
  venue?: string
  teams: { a: Team; b: Team }
  score: { a: number; b: number; half?: number; time?: string }
  events: Event[]
  stats: {
    raidPointsA: number; raidPointsB: number;
    tacklePointsA: number; tacklePointsB: number;
    allOutsA: number; allOutsB: number;
    superRaidsA: number; superRaidsB: number;
    superTacklesA: number; superTacklesB: number;
    totalRaidsA: number; totalRaidsB: number;
  }
  lineups: {
    startersA: Array<{ id:string; name:string; role:string; pts:number }>
    startersB: Array<{ id:string; name:string; role:string; pts:number }>
    subsA: Array<{ id:string; name:string; role:string; pts:number }>
    subsB: Array<{ id:string; name:string; role:string; pts:number }>
  }
  startsAt?: string
  resultText?: string
}

function useMockDetails(id: string | undefined): Details {
  const now = new Date()
  const base: Omit<Details,'status'|'id'> = {
    tournament: 'KPL 2026',
    stage: 'Semi Final',
    venue: 'Indoor Stadium',
    teams: { a: { id: 'sk', name: 'SKBC', short: 'SK' }, b: { id: 'ra', name: 'Rangers', short: 'RA' } },
    score: { a: 31, b: 28, half: 2, time: '04:22' },
    events: [
      { id:'e1', type:'successful_raid', teamId:'sk', half:2, ts: Date.now()-20000, note:'Raider: Ajay • Defenders Out: 2' },
      { id:'e2', type:'timeout', teamId:'ra', half:2, ts: Date.now()-40000 },
    ],
    stats: { raidPointsA:18, raidPointsB:12, tacklePointsA:9, tacklePointsB:10, allOutsA:1, allOutsB:1, superRaidsA:2, superRaidsB:1, superTacklesA:1, superTacklesB:1, totalRaidsA:42, totalRaidsB:40 },
    lineups: {
      startersA: [{id:'p1', name:'Ajay', role:'Raider', pts:10}], startersB:[{id:'q1', name:'Nitin', role:'Raider', pts:8}],
      subsA: [{id:'p2', name:'Ravi', role:'Defender', pts:2}], subsB:[{id:'q2', name:'Manu', role:'Defender', pts:1}]
    },
    startsAt: new Date(now.getTime()+3600_000).toISOString(),
    resultText: 'SKBC won by 3 points'
  }
  if (id === 'm2') return { id:'m2', status:'live', ...base }
  if (id === 'm1') return { id:'m1', status:'completed', ...base }
  return { id: id || 'm3', status:'upcoming', ...base }
}

function MatchHeroHeader({ d }: { d: Details }) {
  return (
    <div className="md-hero">
      <div className="md-topmeta">{[d.tournament, d.stage, d.venue].filter(Boolean).join(' • ')}</div>
      <div className="md-row">
        <Link to={`/teams/${d.teams.a.name.toLowerCase().replace(/\s+/g, '-')}`} className="md-team" style={{ textDecoration: 'none' }}>
          <div className="md-avatar">{d.teams.a.short}</div>
          <div className="md-name" style={{ color: '#fff' }}>{d.teams.a.name}</div>
        </Link>
        <div className="md-score">
          <div className="md-scoreline">{d.score.a} <span className="md-sep">-</span> {d.score.b}</div>
          <div className={`md-status ${d.status}`}>{d.status === 'live' ? 'Live' : d.status === 'completed' ? 'Completed' : 'Upcoming'}</div>
          {d.status === 'live' && <div className="md-liveinfo">Half {d.score.half} • {d.score.time} • Raid: {d.teams.b.short}</div>}
          {d.status === 'completed' && <div className="md-result">{d.resultText}</div>}
          {d.status === 'upcoming' && <div className="md-result">Starts at {new Date(d.startsAt || '').toLocaleString()}</div>}
        </div>
        <Link to={`/teams/${d.teams.b.name.toLowerCase().replace(/\s+/g, '-')}`} className="md-team right" style={{ textDecoration: 'none' }}>
          <div className="md-avatar">{d.teams.b.short}</div>
          <div className="md-name" style={{ color: '#fff' }}>{d.teams.b.name}</div>
        </Link>
      </div>
    </div>
  )
}

function Tabs({ active, onChange }: { active: 'info'|'live'|'scorecard'|'lineups'; onChange:(t:any)=>void }) {
  const tabs = [
    {k:'info', label:'Info'},
    {k:'live', label:'Live'},
    {k:'scorecard', label:'Scorecard'},
    {k:'lineups', label:'Lineups'},
  ] as const
  return (
    <div className="md-tabs">
      {tabs.map(t => <button key={t.k} className={`md-tab ${active===t.k?'active':''}`} onClick={()=>onChange(t.k)}>{t.label}</button>)}
    </div>
  )
}

function Live({ d }: { d: Details }) {
  useEffect(() => {
    d.events.forEach(e => {
      feedAddEvent({
        matchId: d.id,
        teams: `${d.teams.a.name} vs ${d.teams.b.name}`,
        status: d.status,
        half: d.score.half,
        time: d.score.time,
        eventId: e.id,
        type: e.type,
        note: e.note,
        ts: e.ts
      })
    })
    if (d.status === 'completed' && d.resultText) {
      feedAddResult({ matchId: d.id, teams: `${d.teams.a.name} vs ${d.teams.b.name}`, resultText: d.resultText })
    }
  }, [d.events, d.status, d.resultText, d.id, d.teams, d.score])
  return (
    <div className="md-feed">
      {d.events.slice(0,12).map(e => (
        <div key={e.id} className="md-event">
          <div className="md-event-title">{String(e.type).replace(/_/g,' ').toUpperCase()}</div>
          <div className="md-event-sub">{e.note || '—'}</div>
          <div className="md-event-meta">{`Half ${e.half} • ${new Date(e.ts).toLocaleTimeString()}`}</div>
        </div>
      ))}
    </div>
  )
}

function PlayerLineupCard({ player, teamColor }: { player: any, teamColor: string }) {
  return (
    <Link to={`/players/${player.name.toLowerCase().replace(/\s+/g, '-')}`} className="md-lineup-card">
      <div className="md-lineup-avatar">
        <div className="md-pavatar sm">{player.name.slice(0,2).toUpperCase()}</div>
      </div>
      <div className="md-lineup-info">
        <div className="md-lineup-name">{player.name}</div>
        <div className="md-lineup-role">{player.role}</div>
      </div>
      <div className="md-lineup-pts">
        <div className="md-pts-val" style={{ color: teamColor }}>{player.pts}</div>
        {player.subTime && (
          <div className="md-sub-status">
            <span className="md-sub-icon">🔄</span>
            <span className="md-sub-time">{player.subTime}'</span>
          </div>
        )}
      </div>
    </Link>
  )
}

function Lineups({ d }: { d: Details }) {
  return (
    <div className="md-lineups-container">
      {/* Team Headers */}
      <div className="md-lineup-header">
        <div className="md-lineup-team">
          <div className="md-team-abbr" style={{ background: d.teams.a.logo || '#1e293b' }}>{d.teams.a.short}</div>
          <div className="md-team-name">{d.teams.a.name}</div>
        </div>
        <div className="md-lineup-team right">
          <div className="md-team-name">{d.teams.b.name}</div>
          <div className="md-team-abbr" style={{ background: d.teams.b.logo || '#1e293b' }}>{d.teams.b.short}</div>
        </div>
      </div>

      {/* Starters Section */}
      <div className="md-section-label">Starters</div>
      <div className="md-lineup-grid">
        <div className="md-lineup-col">
          {d.lineups.startersA.map(p => (
            <PlayerLineupCard key={p.id} player={p} teamColor="#0ea5e9" />
          ))}
        </div>
        <div className="md-lineup-col">
          {d.lineups.startersB.map(p => (
            <PlayerLineupCard key={p.id} player={p} teamColor="#ef4444" />
          ))}
        </div>
      </div>

      {/* Substitutes Section */}
      <div className="md-section-label">Substitutes</div>
      <div className="md-lineup-grid">
        <div className="md-lineup-col">
          {d.lineups.subsA.map(p => (
            <PlayerLineupCard key={p.id} player={p} teamColor="#0ea5e9" />
          ))}
        </div>
        <div className="md-lineup-col">
          {d.lineups.subsB.map(p => (
            <PlayerLineupCard key={p.id} player={p} teamColor="#ef4444" />
          ))}
        </div>
      </div>
    </div>
  )
}

function Bar({ left, right, label }: { left: number; right: number; label: string }) {
  const total = Math.max(left+right, 1)
  const l = Math.round((left/total)*100)
  const r = 100 - l
  return (
    <div className="md-bar">
      <div className="md-bar-label">{label}</div>
      <div className="md-bar-track"><div className="md-bar-left" style={{width:`${l}%`}} /><div className="md-bar-right" style={{width:`${r}%`}} /></div>
      <div className="md-bar-num">{left} • {right}</div>
    </div>
  )
}

function Stats({ d }: { d: Details }) {
  const s = d.stats
  return (
    <div className="md-stats">
      <Bar left={s.raidPointsA} right={s.raidPointsB} label="Raid Points" />
      <Bar left={s.tacklePointsA} right={s.tacklePointsB} label="Tackle Points" />
      <Bar left={s.allOutsA} right={s.allOutsB} label="All Outs" />
      <Bar left={s.superRaidsA} right={s.superRaidsB} label="Super Raids" />
      <Bar left={s.superTacklesA} right={s.superTacklesB} label="Super Tackles" />
      <Bar left={s.totalRaidsA} right={s.totalRaidsB} label="Total Raids" />
    </div>
  )
}

function Info({ d }: { d: Details }) {
  const raidLeaders = [
    { name:'Bharath Gowda', team:d.teams.a.name, raids:12, sr:6, pts:8 },
    { name:'Ashu Malik', team:d.teams.b.name, raids:10, sr:4, pts:6 },
  ]
  const tackleLeaders = [
    { name:'Fazel Atrachali', team:d.teams.b.name, tackles:9, tt:3, pts:6 },
    { name:'Rahul Sharma', team:d.teams.a.name, tackles:7, tt:2, pts:5 },
  ]
  return (
    <>
      <div className="md-info">
        <div className="md-infolabel">Venue</div><div className="md-infovalue">{d.venue || '—'}</div>
        <div className="md-infolabel">Date & Time</div><div className="md-infovalue">{d.startsAt ? new Date(d.startsAt).toLocaleString() : '—'}</div>
        <div className="md-infolabel">Format</div><div className="md-infovalue">{d.stage || 'League Stage'}</div>
        <div className="md-infolabel">Duration</div><div className="md-infovalue">40 min (2 halves)</div>
        <div className="md-infolabel">Referee</div><div className="md-infovalue">Kumar Raj</div>
      </div>
      <div className="md-table">
        <div className="md-table-title">Raid Leaders</div>
        <div className="md-table-head">
          <div className="md-th player">Player</div><div className="md-th small">Raids</div><div className="md-th small">SR</div><div className="md-th small">Pts</div>
        </div>
        {raidLeaders.map(r=>(
          <div key={r.name} className="md-tr">
            <div className="md-td player"><div className="md-pinline"><div className="md-pavatar sm">{r.name.slice(0,2).toUpperCase()}</div><div><div className="md-pname">{r.name}</div><div className="md-prole">{r.team}</div></div></div></div>
            <div className="md-td small">{r.raids}</div><div className="md-td small">{r.sr}</div><div className="md-td small">{r.pts}</div>
          </div>
        ))}
      </div>
      <div className="md-table">
        <div className="md-table-title">Tackle Leaders</div>
        <div className="md-table-head">
          <div className="md-th player">Player</div><div className="md-th small">Tackles</div><div className="md-th small">TT</div><div className="md-th small">Pts</div>
        </div>
        {tackleLeaders.map(r=>(
          <div key={r.name} className="md-tr">
            <div className="md-td player"><div className="md-pinline"><div className="md-pavatar sm">{r.name.slice(0,2).toUpperCase()}</div><div><div className="md-pname">{r.name}</div><div className="md-prole">{r.team}</div></div></div></div>
            <div className="md-td small">{r.tackles}</div><div className="md-td small">{r.tt}</div><div className="md-td small">{r.pts}</div>
          </div>
        ))}
      </div>
    </>
  )
}

function Scorecard({ d }: { d: Details }) {
  const halves = [
    { label:'Half 1', a: 15, b: 12 },
    { label:'Half 2', a: d.score.a-15, b: d.score.b-12 },
  ]
  const players = [
    { name:'Ajay', team:d.teams.a.short, raid:6, tackle:4 },
    { name:'Ravi', team:d.teams.a.short, raid:2, tackle:2 },
    { name:'Nitin', team:d.teams.b.short, raid:5, tackle:3 },
    { name:'Manu', team:d.teams.b.short, raid:2, tackle:1 },
  ]
  return (
    <>
      <div className="md-halves">
        {halves.map(h=>(
          <div key={h.label} className="md-half">
            <div className="md-half-title">{h.label}</div>
            <div className="md-half-scores"><span>{d.teams.a.name}</span><span className="md-vs">vs</span><span>{d.teams.b.name}</span></div>
            <div className="md-half-values"><span className="md-half-a">{h.a}</span><span className="md-sep">-</span><span className="md-half-b">{h.b}</span></div>
          </div>
        ))}
      </div>
      <div className="md-table">
        <div className="md-table-title">Player Scorecard</div>
        <div className="md-table-head">
          <div className="md-th player">Player</div><div className="md-th small">Raid</div><div className="md-th small">Tackle</div><div className="md-th small">Total</div>
        </div>
        {players.map(p=>(
          <div key={p.name} className="md-tr">
            <div className="md-td player">
              <Link to={`/players/${p.name.toLowerCase().replace(/\s+/g, '-')}`} className="md-pinline" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="md-pavatar sm">{p.name.slice(0,2).toUpperCase()}</div>
                <div>
                  <div className="md-pname">{p.name}</div>
                  <div className="md-prole">{p.team}</div>
                </div>
              </Link>
            </div>
            <div className="md-td small">{p.raid}</div><div className="md-td small">{p.tackle}</div><div className="md-td small">{p.raid+p.tackle}</div>
          </div>
        ))}
      </div>
    </>
  )
}

export default function MatchDetailsPage() {
  const { id } = useParams()
  const d = useMockDetails(id)
  const defaultTab = d.status === 'live' ? 'live' : d.status === 'completed' ? 'scorecard' : 'info'
  const [tab, setTab] = useState<'info'|'live'|'scorecard'|'lineups'>(defaultTab as any)
  useEffect(() => { setTab(defaultTab as any) }, [defaultTab])
  return (
    <div className="md-page">
      <MatchHeroHeader d={d} />
      <Tabs active={tab} onChange={setTab} />
      <div className="md-content">
        {tab === 'live' && <Live d={d} />}
        {tab === 'scorecard' && (
          <>
            <Stats d={d} />
            <Scorecard d={d} />
          </>
        )}
        {tab === 'lineups' && <Lineups d={d} />}
        {tab === 'info' && <Info d={d} />}
      </div>
    </div>
  )
}
