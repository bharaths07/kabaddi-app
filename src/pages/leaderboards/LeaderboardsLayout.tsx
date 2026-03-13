import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import '../../features/kabaddi/pages/leaderboards.css'

export default function LeaderboardsLayout() {
  const { pathname } = useLocation()

  return (
    <div className="lb-page">
      <div className="lb-header">
        <h1 className="lb-title">Leaderboards</h1>
        <div className="lb-subtitle">Official tournament standings and player rankings</div>
      </div>

      <div className="lb-tabs" style={{ marginBottom: 20 }}>
        <Link 
          to="/leaderboards" 
          className={`lb-tab ${pathname === '/leaderboards' ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          Player Rankings
        </Link>
        <Link 
          to="/leaderboards/teams" 
          className={`lb-tab ${pathname === '/leaderboards/teams' ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          Team Standings
        </Link>
      </div>

      <Outlet />
    </div>
  )
}
