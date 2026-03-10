import React, { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import './team-details.css'

type Player = { id:string; name:string; role:'raider'|'defender'|'all-rounder' }
type MatchItem = { id:string; home:string; guest:string; startsAt:string; status:'live'|'upcoming'|'completed'; score?:string }

export default function TeamDetails() {
  const { id, teamId } = useParams()
  const data = useMemo(() => {
    const teams = [
      { id:'skbc', name:'SKBC', short:'SK' },
      { id:'rangers', name:'Rangers', short:'RG' },
      { id:'warriors', name:'Warriors', short:'WR' },
      { id:'titans', name:'Titans', short:'TT' }
    ]
    const team = teams.find(t => t.id === teamId) || teams[0]
    const squad: Player[] = [
      { id:'p1', name:'Ashu Malik', role:'raider' },
      { id:'p2', name:'Surjeet', role:'defender' },
      { id:'p3', name:'Naveen', role:'all-rounder' }
    ]
    const matches: MatchItem[] = [
      { id:'m1', home:team.name, guest:'Rangers', startsAt:'2026-01-12T19:00:00', status:'live', score:'18–15' },
      { id:'m2', home:'Warriors', guest:team.name, startsAt:'2026-01-11T19:00:00', status:'completed', score:'28–31' },
      { id:'m3', home:team.name, guest:'Titans', startsAt:'2026-01-09T19:00:00', status:'completed', score:'34–29' }
    ]
    const summary = { wins: 5, losses: 2, ties: 1, raidPts: 82, tacklePts: 36 }
    return { team, squad, matches, summary }
  }, [teamId])

  const [tab, setTab] = useState<'overview'|'squad'|'matches'>('overview')

  return (
    <div className="tm-page">
      <div className="tm-hero">
        <div className="tm-left">
          <div className="tm-logo">{data.team.short}</div>
          <div className="tm-title">{data.team.name}</div>
          <div className="tm-sub">Tournament: {id?.toUpperCase()}</div>
        </div>
      </div>

      <div className="tm-tabs">
        {['overview','squad','matches'].map(k => (
          <button key={k} className={`tm-tab ${tab===k?'active':''}`} onClick={()=>setTab(k as any)}>
            {k.charAt(0).toUpperCase()+k.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="tm-content">
          <div className="tm-stats">
            <div className="tm-stat"><div className="tm-label">Wins</div><div className="tm-val">{data.summary.wins}</div></div>
            <div className="tm-stat"><div className="tm-label">Losses</div><div className="tm-val">{data.summary.losses}</div></div>
            <div className="tm-stat"><div className="tm-label">Ties</div><div className="tm-val">{data.summary.ties}</div></div>
            <div className="tm-stat"><div className="tm-label">Raid Points</div><div className="tm-val">{data.summary.raidPts}</div></div>
            <div className="tm-stat"><div className="tm-label">Tackle Points</div><div className="tm-val">{data.summary.tacklePts}</div></div>
          </div>
        </div>
      )}

      {tab === 'squad' && (
        <div className="tm-content">
          <div className="tm-squad">
            {data.squad.map(p => (
              <div key={p.id} className="tm-player">
                <div className="tm-pname">{p.name}</div>
                <div className="tm-prole">{p.role}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'matches' && (
        <div className="tm-content">
          <div className="tm-match-list">
            {data.matches.map(m => (
              <Link key={m.id} to={`/matches/${m.id}`} className="tm-match-card">
                <div className="tm-versus">
                  <span>{m.home}</span>
                  <span className="tm-vs">vs</span>
                  <span>{m.guest}</span>
                </div>
                <div className="tm-mmeta">{new Date(m.startsAt).toLocaleString()}</div>
                {m.status!=='upcoming' && <div className="tm-score">{m.score || ''}</div>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
