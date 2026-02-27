import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './matches.css'

type MatchStatus = 'live' | 'upcoming' | 'completed'
type TeamSide = { id: string; name: string; shortName: string; logo?: string; score?: number }
export type MatchListItem = {
  id: string
  tournamentName?: string
  roundName?: string
  teamA: TeamSide
  teamB: TeamSide
  status: MatchStatus
  startTime: string
  venue?: string
  currentHalf?: number
  raidInfo?: string
  resultText?: string
}

function MatchesTabs({ active, onChange }: { active: 'top'|'live'|'upcoming'|'completed'; onChange: (v:any)=>void }) {
  const tabs: Array<{k:'top'|'live'|'upcoming'|'completed'; label:string}> = [
    { k: 'top', label: 'Top Matches' },
    { k: 'live', label: 'Live' },
    { k: 'upcoming', label: 'Upcoming' },
    { k: 'completed', label: 'Completed' }
  ]
  return (
    <div className="mx-tabs">
      {tabs.map(t => (
        <button key={t.k} className={`mx-tab ${active===t.k?'active':''}`} onClick={()=>onChange(t.k)}>{t.label}</button>
      ))}
    </div>
  )
}

function MatchCard({ match }: { match: MatchListItem }) {
  const navigate = useNavigate()
  const onOpen = () => {
    if (match.status === 'live') navigate(`/kabaddi/match/${match.id}/live`)
    else if (match.status === 'completed') navigate(`/kabaddi/match/${match.id}/summary`)
    else navigate(`/kabaddi/match/${match.id}`)
  }
  return (
    <div className="mx-card" onClick={onOpen}>
      <div className="mx-topline">
        <div className={`mx-status ${match.status}`}>{match.status==='live'?'● Live': match.status[0].toUpperCase()+match.status.slice(1)}</div>
        <div className="mx-meta">{[match.tournamentName, match.roundName].filter(Boolean).join(' • ')}</div>
      </div>
      {match.venue && <div className="mx-venue">{match.venue}</div>}
      <div className="mx-versus">
        <div className="mx-side">
          <div className="mx-badge">{match.teamA.shortName}</div>
          <div className="mx-score">{match.teamA.score ?? '-'}</div>
          <div className="mx-name">{match.teamA.name}</div>
        </div>
        <div className="mx-mid">-</div>
        <div className="mx-side right">
          <div className="mx-badge">{match.teamB.shortName}</div>
          <div className="mx-score">{match.teamB.score ?? '-'}</div>
          <div className="mx-name">{match.teamB.name}</div>
        </div>
      </div>
      {match.status==='live' && (
        <div className="mx-livebar">Half {match.currentHalf} • {match.raidInfo || 'Raid in progress'}</div>
      )}
      {match.status==='upcoming' && (
        <div className="mx-subtle">{new Date(match.startTime).toLocaleString()}</div>
      )}
      {match.status==='completed' && (
        <div className="mx-subtle">{match.resultText}</div>
      )}
    </div>
  )
}

export default function KabaddiMatchesPage() {
  const [active, setActive] = useState<'top'|'live'|'upcoming'|'completed'>('top')
  const matches: MatchListItem[] = useMemo(() => [
    { id:'m2', tournamentName:'KPL 2026', roundName:'Semi Final', teamA:{id:'sk', name:'SKBC', shortName:'SK', score:18}, teamB:{id:'ra', name:'Rangers', shortName:'RA', score:15}, status:'live', startTime:new Date().toISOString(), venue:'Indoor Stadium', currentHalf:1, raidInfo:'Raid 12' },
    { id:'m3', tournamentName:'KPL 2026', teamA:{id:'sk', name:'SKBC', shortName:'SK'}, teamB:{id:'ra', name:'Rangers', shortName:'RA'}, status:'upcoming', startTime:new Date(Date.now()+20*3600*1000).toISOString(), venue:'Arena' },
    { id:'m1', tournamentName:'KPL 2026', teamA:{id:'sk', name:'SKBC', shortName:'SK', score:34}, teamB:{id:'ra', name:'Rangers', shortName:'RA', score:29}, status:'completed', startTime:new Date(Date.now()-86400000).toISOString(), resultText:'SKBC won by 5 points' }
  ], [])

  const filtered = useMemo(() => {
    if (active === 'top') {
      const live = matches.filter(m => m.status==='live')
      const upcoming = matches.filter(m => m.status==='upcoming' && new Date(m.startTime).getTime() - Date.now() <= 24*3600*1000)
      return [...live, ...upcoming]
    }
    return matches.filter(m => m.status === active)
  }, [active, matches])

  return (
    <div className="mx-page">
      <div className="mx-header">
        <h1 className="mx-title">Matches</h1>
        <div className="mx-subtitle">Top, live, upcoming and completed</div>
      </div>
      <MatchesTabs active={active} onChange={setActive} />
      <div className="mx-list">
        {filtered.map(m => <MatchCard key={m.id} match={m} />)}
      </div>
    </div>
  )
}
