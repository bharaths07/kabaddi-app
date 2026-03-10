import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAssignedFixturesFor, updateScorerStatus, canScoreFixture } from '../../shared/services/fixturesService'

type AssignedFixture = {
  id: string
  home: string
  guest: string
  startsAt: string
  court?: string
  status: 'upcoming' | 'live' | 'completed'
  scorerStatus: 'assigned' | 'confirmed' | 'accepted' | 'declined' | 'scoring'
}

export default function AssignedMatches() {
  const userId = 'current-user'
  const [items, setItems] = useState<AssignedFixture[]>([])
  const [filter, setFilter] = useState<'all'|'upcoming'|'live'|'completed'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAssignedFixturesFor(userId)
      .then(data => setItems(data))
      .finally(() => setLoading(false))
  }, [userId])

  const visible = useMemo(() => {
    return items.filter(m => filter === 'all' ? true : m.status === filter)
  }, [items, filter])

  const onAccept = async (m: AssignedFixture) => {
    await updateScorerStatus(m.id, userId, 'accepted')
    setItems(prev => prev.map(x => x.id === m.id ? { ...x, scorerStatus: 'accepted' } : x))
  }
  const onDecline = async (m: AssignedFixture) => {
    await updateScorerStatus(m.id, userId, 'declined')
    setItems(prev => prev.map(x => x.id === m.id ? { ...x, scorerStatus: 'declined' } : x))
  }
  const onStartScoring = async (m: AssignedFixture) => {
    const ok = await canScoreFixture(m.id, userId)
    if (!ok) return
    await updateScorerStatus(m.id, userId, 'scoring')
    setItems(prev => prev.map(x => x.id === m.id ? { ...x, scorerStatus: 'scoring', status: 'live' } : x))
  }

  return (
    <div>
      <div className="page-header">
        <h1>My Assigned Matches</h1>
        <p>Matches you have been assigned to score</p>
      </div>

      <div className="filter-pills">
        {['all','upcoming','live','completed'].map(k => (
          <button
            key={k}
            className={`pill ${filter===k?'active':''}`}
            onClick={() => setFilter(k as any)}
          >
            {k[0].toUpperCase()+k.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
        {loading && (
          <>
            {[1,2,3].map(i => (
              <div key={i} className="card card--clickable">
                <div style={{ height:16, borderRadius:6, background:'var(--bg-elevated)', marginBottom:6 }} />
                <div style={{ height:12, borderRadius:6, background:'var(--bg-elevated)', width:'70%' }} />
                <div style={{ height:12, borderRadius:6, background:'var(--bg-elevated)', width:'50%', marginTop:8 }} />
              </div>
            ))}
          </>
        )}
        {!loading && visible.map(m => (
          <div key={m.id} className="card card--clickable">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontWeight:700 }}>{m.home} <span style={{ color:'var(--text-muted)' }}>vs</span> {m.guest}</div>
              <span className="badge">{m.scorerStatus==='confirmed'?'✅ Confirmed':'⏳ Assigned'}</span>
            </div>
            <div style={{ color:'var(--text-secondary)', fontSize:12 }}>
              📅 {new Date(m.startsAt).toLocaleDateString()} &nbsp; ⏰ {new Date(m.startsAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })} &nbsp; 🏟 {m.court || '—'}
            </div>
            <div style={{ display:'flex', gap:8, marginTop:8, alignItems:'center' }}>
              {m.scorerStatus === 'assigned' && (
                <>
                  <button className="btn btn-primary" onClick={() => onAccept(m)}>Accept</button>
                  <button className="btn" onClick={() => onDecline(m)}>Decline</button>
                </>
              )}
              {m.scorerStatus === 'accepted' && (
                <button className="btn btn-primary" onClick={() => onStartScoring(m)}>Start Scoring</button>
              )}
              {m.status==='live' && (
                <Link to={`/matches/${m.id}/live`} className="btn btn-primary">Continue Scoring</Link>
              )}
              {m.status==='completed' && (
                <Link to={`/matches/${m.id}/summary`} className="btn">View Summary</Link>
              )}
              <span className="badge">{m.status}</span>
            </div>
          </div>
        ))}
        {!loading && visible.length === 0 && <div className="muted">No matches for this filter</div>}
      </div>
    </div>
  )
}
