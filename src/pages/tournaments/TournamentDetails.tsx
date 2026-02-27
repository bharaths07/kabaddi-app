import React, { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './tournament-details.css'

type MatchItem = { id:string; home:string; guest:string; startsAt:string; status:'live'|'upcoming'|'completed'; score?:string; stage:'league'|'semi'|'final'; half?:number; time?:string }
type TeamItem = { id:string; name:string; short:string }
type PlayerItem = { id:string; name:string; role:'raider'|'defender'|'all-rounder' }
type StandingRow = { team:string; played:number; won:number; lost:number; tie:number; points:number; diff:number }

export default function TournamentDetails() {
  const { id } = useParams()
  const now = useMemo(() => new Date(), [])
  const data = useMemo(() => {
    const tournaments = [
      { id: 'kpl2026', name: 'KPL 2026', start: '2026-01-10', end: '2026-02-20', indoor: true, teams: 12 },
      { id: 'skbc2026', name: 'Spring Kabaddi Cup', start: '2026-03-01', end: '2026-03-05', indoor: true, teams: 8 },
      { id: 'monsoon2026', name: 'Monsoon League', start: '2026-02-01', end: '2026-02-28', indoor: false, teams: 12 }
    ]
    const t = tournaments.find(x => x.id === id) || tournaments[0]
    const s = new Date(t.start)
    const e = new Date(t.end)
    const status = s > now ? 'upcoming' : (e < now ? 'completed' : 'ongoing')
    const teams: TeamItem[] = [
      { id:'skbc', name:'SKBC', short:'SK' }, { id:'rangers', name:'Rangers', short:'RG' },
      { id:'warriors', name:'Warriors', short:'WR' }, { id:'titans', name:'Titans', short:'TT' }
    ]
    const squads: Record<string, PlayerItem[]> = {
      skbc: [
        { id:'p1', name:'Ashu Malik', role:'raider' },
        { id:'p2', name:'Surjeet', role:'defender' },
        { id:'p3', name:'Naveen', role:'all-rounder' }
      ],
      rangers: [
        { id:'p4', name:'Ajay', role:'raider' },
        { id:'p5', name:'Abinesh', role:'defender' }
      ],
      warriors: [
        { id:'p6', name:'Rahul', role:'raider' },
        { id:'p7', name:'Fazel', role:'defender' }
      ],
      titans: [
        { id:'p8', name:'Manjeet', role:'raider' },
        { id:'p9', name:'Sandeep', role:'defender' }
      ]
    }
    const matches: MatchItem[] = [
      { id:'m1', home:'SKBC', guest:'Rangers', startsAt:'2026-01-12T19:00:00', status:'live', score:'18–15', stage:'league', half:1, time:'04:12' },
      { id:'m2', home:'Warriors', guest:'Titans', startsAt:'2026-01-11T19:00:00', status:'completed', score:'28–31', stage:'league' },
      { id:'m3', home:'SKBC', guest:'Titans', startsAt:'2026-01-09T19:00:00', status:'completed', score:'34–29', stage:'semi' },
      { id:'m4', home:'Rangers', guest:'Warriors', startsAt:'2026-01-15T19:00:00', status:'upcoming', stage:'league' }
    ]
    const standings: StandingRow[] = [
      { team:'SKBC', played:6, won:5, lost:1, tie:0, points:0, diff:58 },
      { team:'Titans', played:6, won:4, lost:2, tie:0, points:0, diff:41 },
      { team:'Rangers', played:6, won:3, lost:2, tie:1, points:0, diff:24 },
      { team:'Warriors', played:6, won:2, lost:3, tie:1, points:0, diff:12 }
    ].map(r => ({ ...r, points: r.won*5 + r.tie*3 }))
    return { tournament:t, status, teams, squads, matches, standings }
  }, [id, now])

  const [tab, setTab] = useState<'overview'|'matches'|'squads'|'points'>('overview')
  const [stage, setStage] = useState<'all'|'league'|'semi'|'final'>('all')
  const isOrganizer = false

  const featuredMatches = useMemo(() => {
    const sorted = [...data.matches].sort((a,b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
    return sorted.slice(0,3)
  }, [data.matches])
  const filteredMatches = useMemo(() => {
    return data.matches.filter(m => stage === 'all' ? true : m.stage === stage)
  }, [data.matches, stage])

  return (
    <div className="tdp-page">
      <div className="tdp-hero">
        <div className="tdp-left">
          <div className="tdp-logo">{data.tournament.name.slice(0,3).toUpperCase()}</div>
          <div className="tdp-title">{data.tournament.name}</div>
          <div className="tdp-sub">{new Date(data.tournament.start).toLocaleDateString()} – {new Date(data.tournament.end).toLocaleDateString()}</div>
          <div className="tdp-sub">{data.tournament.indoor ? 'Indoor' : 'Outdoor'} • {data.tournament.teams} Teams</div>
        </div>
        <div className="tdp-right">
          <span className={`tdp-badge t-${data.status}`}>{data.status}</span>
        </div>
      </div>

      <div className="tdp-tabs">
        {['overview','matches','squads','points'].map(k => (
          <button key={k} className={`tdp-tab ${tab===k?'active':''}`} onClick={()=>setTab(k as any)}>
            {k==='overview'?'Overview':k==='matches'?'Matches':k==='squads'?'Squads':'Points Table'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="tdp-content">
          <div className="tdp-row">
            <div className="tdp-col">
              <div className="tdp-section-head">
                <div className="tdp-section-title">Featured Matches</div>
                <button className="tdp-secondary" onClick={()=>setTab('matches')}>All Matches</button>
              </div>
              <div className="tdp-match-list">
                {featuredMatches.map(m => (
                  <Link key={m.id} to={`/kabaddi/match/${m.id}${m.status==='live'?'/live':''}`} className="tdp-match-card">
                    <div className="tdp-mtop">
                      {m.status==='live' && <span className="tdp-live">LIVE</span>}
                      <div className="tdp-stage">{m.stage.toUpperCase()}</div>
                    </div>
                    <div className="tdp-versus">
                      <span>{m.home}</span>
                      <span className="tdp-vs">vs</span>
                      <span>{m.guest}</span>
                    </div>
                    <div className="tdp-mmeta">{new Date(m.startsAt).toLocaleString()}</div>
                    {m.status!=='upcoming' && <div className="tdp-score">{m.score || ''}</div>}
                    {m.status==='live' && <div className="tdp-livebar">Half {m.half} • {m.time}</div>}
                  </Link>
                ))}
              </div>

              {isOrganizer && (
                <div className="tdp-section">
                  <div className="tdp-section-head">
                    <div className="tdp-section-title">Manage</div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <Link to={`/tournament/${data.tournament.id}/dashboard`} className="tdp-secondary">Manage Tournament</Link>
                  </div>
                </div>
              )}

              <div className="tdp-section">
                <div className="tdp-section-title">Teams</div>
                <div className="tdp-team-scroll">
                  {data.teams.map(t => (
                    <Link key={t.id} to={`/tournaments/${data.tournament.id}/teams/${t.id}`} className="tdp-team">
                      <div className="tdp-teamlogo">{t.short}</div>
                      <div className="tdp-teamname">{t.name}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="tdp-side">
              <div className="tdp-sidecard">
                <div className="tdp-side-title">Top Raiders</div>
                <div className="tdp-side-row"><span className="tdp-name">Ashu Malik</span><span className="tdp-val">82 pts</span></div>
              </div>
              <div className="tdp-sidecard">
                <div className="tdp-side-title">Top Defender</div>
                <div className="tdp-side-row"><span className="tdp-name">Fazel</span><span className="tdp-val">36 tackle pts</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'matches' && (
        <div className="tdp-content">
          <div className="tdp-tabs sub">
            {['all','league','semi','final'].map(k => (
              <button key={k} className={`tdp-tab ${stage===k?'active':''}`} onClick={()=>setStage(k as any)}>
                {k==='all'?'All':k==='league'?'League':'Semi Final'===k?'Semi Final':'Final'}
              </button>
            ))}
          </div>
          <div className="tdp-match-list">
            {filteredMatches.map(m => (
              <Link key={m.id} to={`/kabaddi/match/${m.id}${m.status==='live'?'/live':''}`} className="tdp-match-card">
                <div className="tdp-versus">
                  <span>{m.home}</span>
                  <span className="tdp-vs">vs</span>
                  <span>{m.guest}</span>
                </div>
                <div className="tdp-mmeta">{new Date(m.startsAt).toLocaleString()}</div>
                {m.status!=='upcoming' && <div className="tdp-score">{m.score || ''}</div>}
                {m.status==='live' && <div className="tdp-livebar">Half {m.half} • {m.time}</div>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {tab === 'points' && (
        <div className="tdp-content">
          <div className="tdp-table">
            <div className="tdp-row head">
              <div className="tdp-cell rank">#</div>
              <div className="tdp-cell team">Team</div>
              <div className="tdp-cell">P</div>
              <div className="tdp-cell">W</div>
              <div className="tdp-cell">L</div>
              <div className="tdp-cell">Tie</div>
              <div className="tdp-cell">Pts</div>
              <div className="tdp-cell">Diff</div>
            </div>
            {data.standings.map((s, i) => (
              <div key={s.team} className="tdp-row">
                <div className="tdp-cell rank">{i+1}</div>
                <div className="tdp-cell team">{s.team}</div>
                <div className="tdp-cell">{s.played}</div>
                <div className="tdp-cell">{s.won}</div>
                <div className="tdp-cell">{s.lost}</div>
                <div className="tdp-cell">{s.tie}</div>
                <div className="tdp-cell">{s.points}</div>
                <div className="tdp-cell">{s.diff>=0?`+${s.diff}`:s.diff}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'squads' && (
        <div className="tdp-content">
          <div className="tdp-squads">
            {data.teams.map(t => (
              <div key={t.id} className="tdp-teamblock">
                <div className="tdp-teamhead">
                  <div className="tdp-teamlogo">{t.short}</div>
                  <div className="tdp-teamname">{t.name}</div>
                </div>
                <div className="tdp-playerlist">
                  {data.squads[t.id]?.map(p => (
                    <div key={p.id} className="tdp-player">
                      <div className="tdp-pname">{p.name}</div>
                      <div className="tdp-prole">{p.role}</div>
                    </div>
                  )) || <div className="tdp-empty">No players</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

