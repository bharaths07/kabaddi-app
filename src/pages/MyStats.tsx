import React, { useMemo, useState } from 'react'
import './my-stats.css'
import { getItems as feedGetItems } from '../shared/state/feedStore'
import { getSettings } from '../shared/state/settingsStore'
import { getPlan } from '../shared/state/planStore'
import { Link } from 'react-router-dom'

export default function MyStats() {
  const feed = useMemo(() => feedGetItems(), [])
  const settings = useMemo(() => getSettings(), [])
  const plan = useMemo(() => getPlan(), [])

  const announcements = feed.filter(f => f.type === 'announcement').length
  const highlights = feed.filter(f => f.type === 'highlight').length
  const updates = feed.filter(f => f.type === 'update').length

  const recent = feed.slice(0, 8)
  const [tab, setTab] = useState<'matches'|'stats'|'trophies'|'badges'|'teams'|'highlights'|'photos'|'connections'>('matches')
  const views = 40
  const profile = { name: 'Player', location: 'Bengaluru (Karnataka)', role: 'Raider, Right-arm medium' }
  const matches = [
    {
      id:'mA', stage:'Final', tournament:'KPL 2026', result:'Result', date:'2026-02-13T18:00:00', venue:'Indoor Stadium',
      home:'SKBC', guest:'Rangers', homeScore:54, guestScore:52, overs:'', summary:'SKBC won by 2 points'
    },
    {
      id:'mB', stage:'Qualifier 1', tournament:'KPL 2026', result:'Result', date:'2026-02-11T18:00:00', venue:'City Arena',
      home:'Golden Bulls', guest:'SKBC', homeScore:34, guestScore:35, overs:'', summary:'SKBC won by 1 point'
    },
    {
      id:'mC', stage:'League', tournament:'KPL 2026', result:'Result', date:'2026-02-09T18:00:00', venue:'Open Ground',
      home:'Bajarangi', guest:'SKBC', homeScore:29, guestScore:34, overs:'', summary:'SKBC won by 5 points'
    }
  ]

  return (
    <div className="ms-page">
      <div className="ms-hero">
        <div className="ms-avatar">18</div>
        <div className="ms-pinfo">
          <div className="ms-pname">{profile.name}</div>
          <div className="ms-pmeta">{profile.location} • {views} views</div>
          <div className="ms-prole">{profile.role}</div>
        </div>
        <div className="ms-actions">
          <Link to="/leaderboards" className="ms-primary">Top players</Link>
          <Link to="/leaderboards" className="ms-secondary">Insights</Link>
        </div>
      </div>

      <div className="ms-tabs">
        {['matches','stats','trophies','badges','teams','highlights','photos','connections'].map(k=>(
          <button key={k} className={`ms-tab ${tab===k?'active':''}`} onClick={()=>setTab(k as any)}>{k.charAt(0).toUpperCase()+k.slice(1)}</button>
        ))}
      </div>

      {tab==='matches' && (
        <div className="ms-listcards">
          {matches.map(m => (
            <div key={m.id} className="ms-mcard">
              <div className="ms-mtop">
                <div className="ms-mmeta">{m.stage}, {m.tournament}</div>
                <span className="ms-mbadge">{m.result}</span>
              </div>
              <div className="ms-msub">{new Date(m.date).toLocaleDateString()} • {m.venue}</div>
              <div className="ms-scores">
                <div className="ms-side">
                  <div className="ms-sname">{m.home}</div>
                  <div className="ms-sval">{m.homeScore}</div>
                </div>
                <div className="ms-sep">-</div>
                <div className="ms-side right">
                  <div className="ms-sname">{m.guest}</div>
                  <div className="ms-sval">{m.guestScore}</div>
                </div>
              </div>
              <div className="ms-resultline">{m.summary}</div>
              <div className="ms-links">
                <Link to={`/matches/${m.id}/summary`} className="ms-linkbtn">Insights</Link>
                <Link to="/leaderboards" className="ms-linkbtn">Table</Link>
                <Link to="/leaderboards" className="ms-linkbtn">Leaderboard</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab!=='matches' && (
        <div className="ms-cards">
          <div className="ms-card"><div className="ms-label">Plan</div><div className="ms-value">{plan.toUpperCase()}</div></div>
          <div className="ms-card"><div className="ms-label">Theme</div><div className="ms-value">{settings.theme === 'light' ? 'Light' : 'Dark'}</div></div>
          <div className="ms-card"><div className="ms-label">Feed refresh</div><div className="ms-value">{settings.newsRefreshMs} ms</div></div>
          <div className="ms-card"><div className="ms-label">Announcements</div><div className="ms-value">{announcements}</div></div>
          <div className="ms-card"><div className="ms-label">Highlights</div><div className="ms-value">{highlights}</div></div>
          <div className="ms-card"><div className="ms-label">Match Updates</div><div className="ms-value">{updates}</div></div>
          <div className="ms-empty">More in {tab} coming soon.</div>
        </div>
      )}
    </div>
  )
}
