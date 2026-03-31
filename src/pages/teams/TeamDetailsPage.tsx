import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  getTeamDetail, 
  addPlayerRecord, 
  deletePlayerEntry, 
  updatePlayerRecord,
  updateTeamRecord,
  deleteTeamRecord
} from '../../shared/services/tournamentService'
import './teams.css'

export default function TeamDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<any>(null)
  const [playerForm, setPlayerForm] = useState({ name: '', role: 'raider', number: '' })
  
  const [isEditingTeam, setIsEditingTeam] = useState(false)
  const [teamForm, setTeamForm] = useState({ name: '', city: '', color: '' })

  const fetchData = async () => {
    if (!id) return
    setLoading(true)
    const res = await getTeamDetail(id)
    if (res) {
      setData(res)
      setTeamForm({ name: res.team.name, city: res.team.city || '', color: res.team.color || '#6366f1' })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !playerForm.name.trim()) return

    const payload = { 
      name: playerForm.name, 
      role: playerForm.role, 
      number: playerForm.number ? parseInt(playerForm.number) : undefined 
    }

    let success = false
    if (editingPlayer) {
      success = await updatePlayerRecord(editingPlayer.id, payload)
    } else {
      const res = await addPlayerRecord(id, payload)
      success = !!res
    }

    if (success) {
      setShowPlayerModal(false)
      setEditingPlayer(null)
      setPlayerForm({ name: '', role: 'raider', number: '' })
      fetchData()
    }
  }

  const handleDeletePlayer = async (pid: string) => {
    if (window.confirm('Are you sure you want to remove this player?')) {
      const success = await deletePlayerEntry(pid)
      if (success) fetchData()
    }
  }

  const handleUpdateTeam = async () => {
    if (!id || !teamForm.name.trim()) return
    const success = await updateTeamRecord(id, teamForm)
    if (success) {
      setIsEditingTeam(false)
      fetchData()
    }
  }

  const handleDeleteTeam = async () => {
    if (window.confirm('CRITICAL: This will delete the team and all associated players. Continue?')) {
      const success = await deleteTeamRecord(id!)
      if (success) navigate('/teams')
    }
  }

  if (loading) return <div className="team-details-page"><div className="hp-empty-state">Loading team...</div></div>
  if (!data) return <div className="team-details-page"><div className="hp-empty-state">Team not found</div></div>

  const { team, players } = data

  return (
    <div className="team-details-page">
      <div className="teams-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/teams')} className="action-btn edit-btn" style={{ width: 40, height: 40 }}>←</button>
          <div className="team-avatar" style={{ background: team.color }}>{team.name.slice(0, 2).toUpperCase()}</div>
          <div>
            {isEditingTeam ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input 
                  value={teamForm.name} 
                  onChange={e => setTeamForm({...teamForm, name: e.target.value})}
                  className="form-group" style={{ margin: 0, padding: '8px 12px' }}
                />
                <button onClick={handleUpdateTeam} className="btn-primary" style={{ padding: '8px 16px', borderRadius: 8 }}>Save</button>
                <button onClick={() => setIsEditingTeam(false)} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: 8 }}>×</button>
              </div>
            ) : (
              <>
                <h1 style={{ margin: 0, color: '#0f172a', WebkitTextFillColor: 'initial', background: 'none', fontSize: 24 }}>{team.name}</h1>
                <p style={{ margin: 0, color: '#64748b' }}>{team.city || 'Local Team'} • {players.length} Players</p>
              </>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {!isEditingTeam && <button className="btn-secondary" onClick={() => setIsEditingTeam(true)}>Edit Team</button>}
          <button className="btn-secondary" style={{ color: '#ef4444' }} onClick={handleDeleteTeam}>Delete</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Roster</h2>
        <button className="btn-create" onClick={() => { setEditingPlayer(null); setShowPlayerModal(true); }}>
          + Add Player
        </button>
      </div>

      <div className="player-list">
        {players.length === 0 ? (
          <div className="hp-empty-state" style={{ background: '#f8fafc', borderRadius: 24, padding: 40 }}>
            <p>No players in this team yet.</p>
          </div>
        ) : players.map((p: any) => (
          <div key={p.id} className="player-row">
            <div className="player-main">
              <div className="p-number">{p.number || '—'}</div>
              <div>
                <div className="p-name">{p.name}</div>
                <div className="p-role">{p.role}</div>
              </div>
            </div>
            <div className="player-actions">
              <button className="action-btn edit-btn" onClick={() => {
                setEditingPlayer(p)
                setPlayerForm({ name: p.name, role: p.role, number: p.number?.toString() || '' })
                setShowPlayerModal(true)
              }}>✎</button>
              <button className="action-btn delete-btn" onClick={() => handleDeletePlayer(p.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      {showPlayerModal && (
        <div className="modal-overlay" onClick={() => setShowPlayerModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingPlayer ? 'Edit Player' : 'Add New Player'}</h2>
            <form onSubmit={handleAddPlayer}>
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  autoFocus 
                  required 
                  value={playerForm.name} 
                  onChange={e => setPlayerForm({...playerForm, name: e.target.value})}
                  placeholder="e.g. Arjun Singh"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={playerForm.role} onChange={e => setPlayerForm({...playerForm, role: e.target.value})}>
                  <option value="raider">Raider</option>
                  <option value="defender">Defender</option>
                  <option value="all-rounder">All-rounder</option>
                </select>
              </div>
              <div className="form-group">
                <label>Jersey Number</label>
                <input 
                  type="number" 
                  value={playerForm.number} 
                  onChange={e => setPlayerForm({...playerForm, number: e.target.value})}
                  placeholder="0-99"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowPlayerModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingPlayer ? 'Update' : 'Add Player'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
