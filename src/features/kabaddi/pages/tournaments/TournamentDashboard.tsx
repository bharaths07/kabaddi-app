import React, { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import './tournament-detail.css'

export default function TournamentDashboard() {
  const { id } = useParams()
  const tournament = useMemo(() => {
    const all = [
      { id: '1', name: 'Spring Kabaddi Cup', location: 'Bengaluru', start: '2026-03-01', end: '2026-03-05', status: 'upcoming', teams: 8, matches: 6 },
      { id: '2', name: 'Monsoon League', location: 'Mumbai', start: '2026-02-01', end: '2026-02-28', status: 'ongoing', teams: 12, matches: 12 },
      { id: '3', name: 'Winter Championship', location: 'Delhi', start: '2025-12-10', end: '2025-12-20', status: 'completed', teams: 10, matches: 20 }
    ]
    return all.find(t => t.id === id) || all[0]
  }, [id])

  const matches = useMemo(
    () => [
      { id: 'm1', home: 'Rangers', guest: 'Titans', date: '2026-03-01', status: 'scheduled' as const },
      { id: 'm2', home: 'Wolves', guest: 'Falcons', date: '2026-03-02', status: 'live' as const },
      { id: 'm3', home: 'Spartans', guest: 'Knights', date: '2026-03-03', status: 'completed' as const, score: '31–27' }
    ],
    []
  )
  const completed = matches.filter(m => m.status === 'completed').length
  const ongoing = matches.filter(m => m.status === 'live').length

  return (
    <div className="td-page">
      <div className="td-header">
        <div>
          <h1 className="td-title">{tournament.name}</h1>
          <div className="td-subtitle">{tournament.location} • {tournament.start} – {tournament.end}</div>
        </div>
        <div className="td-header-actions">
          <span className={`td-badge td-${tournament.status}`}>{tournament.status}</span>
          <button className="td-edit">Edit</button>
          <button className="td-danger">Delete</button>
        </div>
      </div>

      <div className="td-stats-row">
        <div className="td-stat-card"><div className="td-stat-num">{tournament.teams}</div><div className="td-stat-label">Total Teams</div></div>
        <div className="td-stat-card"><div className="td-stat-num">{matches.length}</div><div className="td-stat-label">Total Matches</div></div>
        <div className="td-stat-card"><div className="td-stat-num">{completed}</div><div className="td-stat-label">Completed</div></div>
        <div className="td-stat-card"><div className="td-stat-num">{ongoing}</div><div className="td-stat-label">Ongoing</div></div>
      </div>

      <div className="td-section">
        <div className="td-section-head">
          <div className="td-section-title">Matches</div>
          <Link to="/kabaddi/create" className="td-primary">Create Match</Link>
        </div>
        {matches.length === 0 ? (
          <div className="td-empty">No matches yet.</div>
        ) : (
          <div className="td-match-grid">
            {matches.map(m => (
              <div key={m.id} className="td-match-card">
                <div className="td-versus">
                  <span>{m.home}</span>
                  <span className="td-vs">vs</span>
                  <span>{m.guest}</span>
                </div>
                <div className="td-meta">{m.date}</div>
                {m.status === 'completed' && <div className="td-score">{m.score}</div>}
                <span className={`td-badge td-${m.status}`}>{m.status}</span>
                <div className="td-actions">
                  {m.status === 'live' && <Link to={`/kabaddi/matches/${m.id}/live`} className="td-primary">Live Scorer</Link>}
                  {m.status === 'scheduled' && <Link to={`/kabaddi/matches/${m.id}/live`} className="td-secondary">Start</Link>}
                  {m.status === 'completed' && <Link to={`/matches/${m.id}/summary`} className="td-secondary">View</Link>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="td-section">
        <div className="td-section-head">
          <div className="td-section-title">Leaderboard Preview</div>
          <Link to="/leaderboards" className="td-secondary">View Full Leaderboard</Link>
        </div>
        <div className="td-leaderboards">
          <div className="td-board">
            <div className="td-board-title">Top Players</div>
            <ol className="td-list">
              <li>R. Singh – 48 pts</li>
              <li>A. Kumar – 46 pts</li>
              <li>P. Yadav – 42 pts</li>
              <li>K. Reddy – 39 pts</li>
              <li>S. Patil – 36 pts</li>
            </ol>
          </div>
          <div className="td-board">
            <div className="td-board-title">Top Teams</div>
            <ol className="td-list">
              <li>Rangers</li>
              <li>Titans</li>
              <li>Wolves</li>
              <li>Falcons</li>
              <li>Spartans</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
