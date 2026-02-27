import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './tournaments.css'

export default function Tournaments() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all')
  const data = useMemo(
    () => [
      { id: '1', name: 'Spring Kabaddi Cup', location: 'Bengaluru', start: '2026-03-01', end: '2026-03-05', status: 'upcoming', teams: 8, matches: 16 },
      { id: '2', name: 'Monsoon League', location: 'Mumbai', start: '2026-02-01', end: '2026-02-28', status: 'ongoing', teams: 12, matches: 24 },
      { id: '3', name: 'Winter Championship', location: 'Delhi', start: '2025-12-10', end: '2025-12-20', status: 'completed', teams: 10, matches: 20 }
    ],
    []
  )
  const filtered = useMemo(() => {
    return data.filter(t => {
      const nameOk = t.name.toLowerCase().includes(q.toLowerCase())
      const statusOk = status === 'all' ? true : t.status === status
      return nameOk && statusOk
    })
  }, [data, q, status])
  return (
    <div className="t-page">
      <div className="t-header">
        <div>
          <h1 className="t-title">Tournaments</h1>
          <div className="t-subtitle">Manage and track competitions</div>
        </div>
      </div>

      <div className="t-filters">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by name"
          className="t-input"
        />
        <select value={status} onChange={e => setStatus(e.target.value as any)} className="t-select">
          <option value="all">All</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="t-empty">
          <div>No tournaments created yet.</div>
        </div>
      ) : (
        <div className="t-grid">
          {filtered.map(t => (
            <div key={t.id} className="t-card">
              <div className="t-card-head">
                <div className="t-card-title">{t.name}</div>
                <span className={`t-badge t-${t.status}`}>{t.status}</span>
              </div>
              <div className="t-meta">{t.location}</div>
              <div className="t-meta">{t.start} – {t.end}</div>
              <div className="t-stats">
                <span>{t.teams} teams</span>
                <span>{t.matches} matches</span>
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
