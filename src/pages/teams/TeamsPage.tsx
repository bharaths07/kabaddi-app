import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllTeams, createTeamRecord } from '../../shared/services/tournamentService'
import './teams.css'

export default function TeamsPage() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', city: '', color: '#6366f1' })
  const [creating, setCreating] = useState(false)

  const fetchTeams = async () => {
    setLoading(true)
    const data = await getAllTeams()
    setTeams(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeam.name.trim()) return
    
    setCreating(true)
    const result = await createTeamRecord(newTeam.name, newTeam.city, newTeam.color)
    if (result) {
      setShowModal(false)
      setNewTeam({ name: '', city: '', color: '#6366f1' })
      fetchTeams()
    }
    setCreating(false)
  }

  return (
    <div className="teams-page">
      <div className="teams-header">
        <h1>Teams Hub</h1>
        <button className="btn-create" onClick={() => setShowModal(true)}>
          <span style={{ fontSize: '20px' }}>+</span> Create Team
        </button>
      </div>

      {loading ? (
        <div className="hp-empty-state">Loading your roster...</div>
      ) : teams.length === 0 ? (
        <div className="hp-empty-state" style={{ padding: '80px 0' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛡️</div>
          <h2 style={{ fontWeight: 900, fontSize: '24px' }}>Build Your Dynasty</h2>
          <p style={{ color: '#64748b', maxWidth: '300px', margin: '0 auto 24px' }}>
            Every great tournament starts with managed teams. Create your first one to get started.
          </p>
          <button className="btn-create" onClick={() => setShowModal(true)}>
            Create New Team
          </button>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map(team => (
            <Link 
              key={team.id} 
              to={`/teams/${team.id}/manage`} 
              className="team-card"
              style={{ '--team-color': team.color || '#6366f1', '--team-color-rgba': `${team.color || '#6366f1'}44` } as any}
            >
              <div className="team-card-header">
                <div className="team-avatar" style={{ background: team.color || '#6366f1' }}>
                  {team.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="team-info">
                  <h3>{team.name}</h3>
                  <p>{team.city || 'India'} • Active Roster</p>
                </div>
              </div>

              <div className="team-card-stats">
                <div className="tc-stat">
                  <div className="tc-stat-val">{team.playerCount || 0}</div>
                  <div className="tc-stat-label">Players</div>
                </div>
                <div className="tc-stat">
                  <div className="tc-stat-val">100%</div>
                  <div className="tc-stat-label">Stability</div>
                </div>
              </div>

              <div className="team-card-footer">
                <span className="manage-link">Manage Roster</span>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800 }}>ID: {team.id.slice(0, 8)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>New Team Identity</h2>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Define the core details of your team</p>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Official Team Name</label>
                <input 
                  autoFocus
                  required
                  placeholder="e.g. Bangalore Warriors"
                  value={newTeam.name}
                  onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Home Location</label>
                <input 
                  placeholder="e.g. Karnataka, India"
                  value={newTeam.city}
                  onChange={e => setNewTeam({ ...newTeam, city: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Jersey Color Theme</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="color"
                    value={newTeam.color}
                    onChange={e => setNewTeam({ ...newTeam, color: e.target.value })}
                    style={{ width: '60px', height: '44px', padding: '4px', cursor: 'pointer' }}
                  />
                  <div style={{ 
                    flex: 1, height: '44px', borderRadius: '12px', background: newTeam.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    fontWeight: 800, fontSize: '12px', textShadow: '0 1px 4px rgba(0,0,0,0.2)'
                  }}>
                    Primary Accent
                  </div>
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: '32px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Discard</button>
                <button type="submit" className="btn-primary" disabled={creating || !newTeam.name.trim()}>
                  {creating ? 'Establishing...' : 'Confirm & Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
