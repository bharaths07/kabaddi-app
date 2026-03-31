import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getMatchDetails } from '@shared/services/tournamentService'
import { getCurrentMatch } from '../../state/matchStore'
import { supabase } from '../../../../shared/lib/supabase'
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
          {d.status === 'upcoming' && d.startsAt && <div className="md-result">Starts at {new Date(d.startsAt).toLocaleString()}</div>}
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
      {d.events.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No events recorded for this match yet.</div>
      ) : d.events.slice(0,25).map(e => (
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
    <Link to={`/players/${player.id}`} className="md-lineup-card">
      <div className="md-lineup-avatar">
        <div className="md-pavatar sm">{player.name.slice(0,2).toUpperCase()}</div>
      </div>
      <div className="md-lineup-info">
        <div className="md-lineup-name">{player.name}</div>
        <div className="md-lineup-role">{player.role}</div>
      </div>
      <div className="md-lineup-pts">
        <div className="md-pts-val" style={{ color: teamColor }}>{player.pts}</div>
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
          <div className="md-team-abbr" style={{ background: '#0ea5e9' }}>{d.teams.a.short}</div>
          <div className="md-team-name">{d.teams.a.name}</div>
        </div>
        <div className="md-lineup-team right">
          <div className="md-team-name">{d.teams.b.name}</div>
          <div className="md-team-abbr" style={{ background: '#ef4444' }}>{d.teams.b.short}</div>
        </div>
      </div>

      <div className="md-section-label">Rosters</div>
      <div className="md-lineup-grid">
        <div className="md-lineup-col">
          {d.lineups.startersA.map(p => (
            <PlayerLineupCard key={p.id} player={p} teamColor="#0ea5e9" />
          ))}
          {d.lineups.startersA.length === 0 && <div style={{ color: '#64748b', fontSize: '13px' }}>No players assigned</div>}
        </div>
        <div className="md-lineup-col">
          {d.lineups.startersB.map(p => (
            <PlayerLineupCard key={p.id} player={p} teamColor="#ef4444" />
          ))}
          {d.lineups.startersB.length === 0 && <div style={{ color: '#64748b', fontSize: '13px' }}>No players assigned</div>}
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
  return (
    <div className="md-info">
      <div className="md-infolabel">Venue</div><div className="md-infovalue">{d.venue || '—'}</div>
      <div className="md-infolabel">Date & Time</div><div className="md-infovalue">{d.startsAt ? new Date(d.startsAt).toLocaleString() : '—'}</div>
      <div className="md-infolabel">Format</div><div className="md-infovalue">{d.stage || 'League Match'}</div>
      <div className="md-infolabel">Duration</div><div className="md-infovalue">40 min (2 halves)</div>
    </div>
  )
}

function Scorecard({ d }: { d: Details }) {
  const playersA = d.lineups.startersA.map(p => ({ ...p, team: d.teams.a.short }))
  const playersB = d.lineups.startersB.map(p => ({ ...p, team: d.teams.b.short }))
  const allPlayers = [...playersA, ...playersB].filter(p => p.pts > 0).sort((a, b) => b.pts - a.pts)

  return (
    <div className="md-table">
      <div className="md-table-title">Match Scorecard</div>
      <div className="md-table-head">
        <div className="md-th player">Player</div><div className="md-th small">Pts</div>
      </div>
      {allPlayers.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>No points recorded for players yet.</div>
      ) : allPlayers.map(p=>(
        <div key={p.id} className="md-tr">
          <div className="md-td player">
            <Link to={`/players/${p.id}`} className="md-pinline" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="md-pavatar sm">{p.name.slice(0,2).toUpperCase()}</div>
              <div>
                <div className="md-pname">{p.name}</div>
                <div className="md-prole">{p.team}</div>
              </div>
            </Link>
          </div>
          <div className="md-td small">{p.pts}</div>
        </div>
      ))}
    </div>
  )
}

export default function MatchDetailsPage() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [d, setDetails] = useState<Details | null>(null)
  
  useEffect(() => {
    async function fetchMatch() {
      if (!id) return;
      setLoading(true);

      // 1. Try tournament fixtures first
      let data = await getMatchDetails(id);
      
      // 2. Try standalone matches from local storage (active session)
      if (!data) {
        const local = getCurrentMatch();
        if (local && local.id === id) {
          data = {
            id: local.id,
            status: 'live', // Default to live if in local store
            tournament: 'Standalone Match',
            teams: {
              a: { id: local.teamAId || 'A', name: local.teamAId || 'Team A', short: 'A' },
              b: { id: local.teamBId || 'B', name: local.teamBId || 'Team B', short: 'B' }
            },
            score: { a: 0, b: 0, half: 1, time: '00:00' },
            events: [],
            stats: {
              raidPointsA: 0, raidPointsB: 0, tacklePointsA: 0, tacklePointsB: 0,
              allOutsA: 0, allOutsB: 0, superRaidsA: 0, superRaidsB: 0,
              superTacklesA: 0, superTacklesB: 0, totalRaidsA: 0, totalRaidsB: 0
            },
            lineups: {
              startersA: local.playersA?.map(p => ({ ...p, pts: 0 })) || [],
              startersB: local.playersB?.map(p => ({ ...p, pts: 0 })) || [],
              subsA: [], subsB: []
            }
          }
        }
      }

      // 3. Try kabaddi_matches table in Supabase (persisted standalone)
      if (!data && id.match(/^[0-9a-fA-F-]{36}$/)) {
        const { data: dbMatch } = await supabase
          .from('kabaddi_matches')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (dbMatch) {
          data = {
            id: dbMatch.id,
            status: dbMatch.status as Status,
            tournament: 'Standalone Match',
            teams: {
              a: { id: dbMatch.team_home_id || 'A', name: dbMatch.home_team_name || 'Home', short: 'H' },
              b: { id: dbMatch.team_guest_id || 'B', name: dbMatch.guest_team_name || 'Guest', short: 'G' }
            },
            score: { 
              a: dbMatch.home_score || 0, 
              b: dbMatch.guest_score || 0,
              half: 1,
              time: '40:00'
            },
            events: [],
            stats: {
              raidPointsA: 0, raidPointsB: 0, tacklePointsA: 0, tacklePointsB: 0,
              allOutsA: 0, allOutsB: 0, superRaidsA: 0, superRaidsB: 0,
              superTacklesA: 0, superTacklesB: 0, totalRaidsA: 0, totalRaidsB: 0
            },
            lineups: { startersA: [], startersB: [], subsA: [], subsB: [] }
          }
        }
      }

      setDetails(data);
      setLoading(false);
    }
    fetchMatch();
  }, [id]);

  const defaultTab = d?.status === 'live' ? 'live' : d?.status === 'completed' ? 'scorecard' : 'info'
  const [tab, setTab] = useState<'info'|'live'|'scorecard'|'lineups'>('info')
  
  useEffect(() => { 
    if (d) setTab(defaultTab as any) 
  }, [d, defaultTab])

  if (loading) return <div className="md-page"><div className="hp-empty-state">Loading Match Details...</div></div>
  if (!d) return <div className="md-page"><div className="hp-empty-state">Match not found.</div></div>

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
