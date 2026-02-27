import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../features/kabaddi/pages/tournaments/tournaments.css'

export default function Tournaments() {
  const now = useMemo(() => new Date(), [])
  const [tab, setTab] = useState<'all'|'ongoing'|'upcoming'|'completed'>('all')

  const tournaments = useMemo(() => [
    { id: 'kpl2026', name: 'KPL 2026', start: '2026-01-10', end: '2026-02-20', teams: 12, matches: 48, poster: 'KPL' },
    { id: 'skbc2026', name: 'Spring Kabaddi Cup', start: '2026-03-01', end: '2026-03-05', teams: 8, matches: 16, poster: 'SKBC' },
    { id: 'monsoon2026', name: 'Monsoon League', start: '2026-02-01', end: '2026-02-28', teams: 12, matches: 24, poster: 'ML' },
    { id: 'winter2025', name: 'Winter Championship', start: '2025-12-10', end: '2025-12-20', teams: 10, matches: 20, poster: 'WC' }
  ], [])

  const withStatus = useMemo(() => {
    return tournaments.map(t => {
      const s = new Date(t.start)
      const e = new Date(t.end)
      const status = s > now ? 'upcoming' : (e < now ? 'completed' : 'ongoing')
      return { ...t, status }
    })
  }, [tournaments, now])

  const featured = useMemo(() => withStatus.slice(0, 6), [withStatus])
  const filtered = useMemo(() => withStatus.filter(t => tab === 'all' ? true : t.status === tab), [withStatus, tab])

  return (
    <div className="t-page">
      <div className="t-header">
        <div>
          <h1 className="t-title">Tournaments</h1>
          <div className="t-subtitle">Explore ongoing and upcoming competitions</div>
        </div>
      </div>

      <div className="t-featured">
        <div className="t-featured-scroll">
          {featured.map(t => (
            <Link key={t.id} to={`/tournaments/${t.id}`} className="t-fcard">
              <div className="t-fposter">{t.poster}</div>
              <div className="t-fname">{t.name}</div>
              <div className="t-fmeta">{new Date(t.start).toLocaleDateString()} – {new Date(t.end).toLocaleDateString()}</div>
              <span className={`t-badge t-${t.status}`}>{t.status}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="t-tabs">
        {['all','ongoing','upcoming','completed'].map(k => (
          <button key={k} className={`t-tab ${tab===k?'active':''}`} onClick={()=>setTab(k as any)}>
            {k.charAt(0).toUpperCase()+k.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="t-empty"><div>No tournaments found.</div></div>
      ) : (
        <div className="t-grid">
          {filtered.map(t => (
            <div key={t.id} className="t-card">
              <div className="t-card-head">
                <div className="t-card-title">{t.name}</div>
                <span className={`t-badge t-${t.status}`}>{t.status}</span>
              </div>
              <div className="t-meta">{new Date(t.start).toLocaleDateString()} – {new Date(t.end).toLocaleDateString()}</div>
              <div className="t-stats">
                <span>{t.teams} Teams</span>
                <span>{t.matches} Matches</span>
              </div>
              <div className="t-actions">
                <Link to={`/tournaments/${t.id}`} className="t-secondary">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
