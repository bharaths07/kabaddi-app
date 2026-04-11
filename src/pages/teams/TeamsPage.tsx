import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useKabaddiStore } from '../../stores/useKabaddiStore'
import './teams.css'

export default function TeamsPage() {
  const navigate = useNavigate()
  const { teams, loading, fetchTeams } = useKabaddiStore()
  const [showModal, setShowModal] = useState(false)
  
  useEffect(() => {
    fetchTeams()
  }, [])

  const displayTeams = teams.length > 0 ? teams : [
    {
      id: 'mock-1',
      name: 'Mumbai Mavericks',
      slug: 'mumbai-mavericks',
      primaryColor: '#FF6B35',
      city: 'Mumbai',
      logo: '/mascot_lion_logo_1775195654362.png',
      stats: { wins: 12, losses: 4, points: 64, rank: 1 }
    },
    {
      id: 'mock-2',
      name: 'Bengal Tigers',
      slug: 'bengal-tigers',
      primaryColor: '#10B981',
      city: 'Bengal',
      logo: '/mascot_tiger_logo_1775195671659.png',
      stats: { wins: 10, losses: 6, points: 52, rank: 3 }
    },
    {
      id: 'mock-3',
      name: 'Delhi Bulls',
      slug: 'delhi-bulls',
      primaryColor: '#EF4444',
      city: 'Delhi',
      logo: '/mascot_bull_logo_1775195685783.png',
      stats: { wins: 11, losses: 5, points: 58, rank: 2 }
    }
  ];

  return (
    <div className="teams-page">
      <div className="teams-header">
        <h1>Teams Hub</h1>
      </div>

      {loading ? (
        <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: '140px', background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '18px', animation: 'pulse 1.5s infinite ease-in-out' }} />
          ))}
        </div>
      ) : displayTeams.length === 0 ? (
        <div className="hp-empty-state" style={{ padding: '80px 0' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛡️</div>
          <h2 style={{ fontWeight: 900, fontSize: '24px' }}>No Teams Available</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto' }}>
            Check back later for updated franchise rosters.
          </p>
        </div>
      ) : (
        <div className="teams-grid">
          {displayTeams.map(team => (
            <Link 
              key={team.id} 
              to={`/${team.slug}`} 
              className="team-card card-glass"
              style={{ 
                '--team-color': team.primaryColor, 
                '--team-color-rgba': `${team.primaryColor}15`,
                borderLeft: `4px solid ${team.primaryColor}`
              } as any}
            >
              <div className="team-card-header">
                <div className="team-avatar" style={{ background: team.primaryColor }}>
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    team.name.charAt(0)
                  )}
                </div>
                <div className="team-info">
                  <h3>{team.name}</h3>
                  <p>{team.city} • Rank #{team.stats.rank}</p>
                </div>
              </div>

              <div className="team-card-stats">
                <div className="tc-stat">
                  <div className="tc-stat-val">{team.stats.wins}</div>
                  <div className="tc-stat-label">Wins</div>
                </div>
                <div className="tc-stat">
                  <div className="tc-stat-val">{team.stats.losses}</div>
                  <div className="tc-stat-label">Losses</div>
                </div>
                <div className="tc-stat">
                  <div className="tc-stat-val">{team.stats.points}</div>
                  <div className="tc-stat-label">Points</div>
                </div>
              </div>

              <div className="team-card-footer">
                <span className="manage-link">View Franchise Profile</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
