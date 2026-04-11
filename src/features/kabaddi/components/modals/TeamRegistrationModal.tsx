import { useState } from 'react'
import { registrationService } from '../../../../shared/services/registrationService'
import { useAuth } from '../../../../shared/context/AuthContext'
import './team-registration.css'

const COLORS = ['#0ea5e9', '#ea580c', '#16a34a', '#7c3aed', '#db2777', '#d97706', '#ef4444', '#0284c7', '#0891b2', '#65a30d']
const ROLES = ['raider', 'defender', 'all-rounder', 'captain'] as const

interface Props {
  tournamentId: string
  tournamentName: string
  onClose: () => void
  onSuccess: () => void
}

export default function TeamRegistrationModal({ tournamentId, tournamentName, onClose, onSuccess }: Props) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [short, setShort] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [captain, setCaptain] = useState('')
  const [players, setPlayers] = useState<any[]>([])
  const [pName, setPName] = useState('')
  const [pRole, setPRole] = useState<typeof ROLES[number]>('raider')
  const [error, setError] = useState<string | null>(null)

  const addPlayer = () => {
    if (!pName.trim()) return
    setPlayers(prev => [...prev, {
      id: `p-${Date.now()}`,
      name: pName.trim(),
      number: prev.length + 1,
      role: pRole,
    }])
    setPName('')
  }

  const removePlayer = (id: string) => setPlayers(prev => prev.filter(p => p.id !== id))

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Team name is required'); return }
    if (players.length < 7) { setError('A minimum of 7 players is required to apply'); return }
    if (!user) { setError('You must be logged in to apply'); return }

    setLoading(true)
    setError(null)

    const success = await registrationService.submitRequest({
      tournament_id: tournamentId,
      user_id: user.id,
      team_name: name.trim(),
      team_short: short || name.slice(0, 3).toUpperCase(),
      team_color: color,
      captain_name: captain || user.user_metadata?.full_name || 'Captain',
      players: players,
    })

    if (success) {
      onSuccess()
    } else {
      setError('Failed to submit application. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="trm-overlay">
      <div className="trm-modal">
        <div className="trm-header">
          <div className="trm-title">Apply for Tournament</div>
          <div className="trm-sub">{tournamentName}</div>
          <button className="trm-close" onClick={onClose}>✕</button>
        </div>

        <div className="trm-body">
          {error && <div className="trm-error">{error}</div>}

          <div className="trm-form-row">
            <div className="trm-form-group" style={{ flex: 2 }}>
              <label>Team Name *</label>
              <input placeholder="e.g. Haryana Lions" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="trm-form-group" style={{ flex: 1 }}>
              <label>Short Code</label>
              <input placeholder="HLNS" maxLength={5} value={short} onChange={e => setShort(e.target.value.toUpperCase())} />
            </div>
          </div>

          <div className="trm-form-group">
            <label>Team Color</label>
            <div className="trm-color-grid">
              {COLORS.map(c => (
                <div key={c} className={`trm-color-dot ${color === c ? 'active' : ''}`}
                  style={{ background: c }} onClick={() => setColor(c)} />
              ))}
            </div>
          </div>

          <div className="trm-divider" />

          <div className="trm-form-group">
            <label>Roster (Min 7 Players)</label>
            <div className="trm-player-add">
              <input placeholder="Player name" value={pName} onChange={e => setPName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPlayer())} />
              <select value={pRole} onChange={e => setPRole(e.target.value as any)}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button type="button" onClick={addPlayer}>Add</button>
            </div>

            <div className="trm-player-list">
              {players.map(p => (
                <div key={p.id} className="trm-player-chip" style={{ borderLeft: `3px solid ${color}` }}>
                  <span>#{p.number} {p.name} ({p.role[0].toUpperCase()})</span>
                  <button onClick={() => removePlayer(p.id)}>✕</button>
                </div>
              ))}
              {players.length === 0 && <div className="trm-empty">Add your squad members above</div>}
            </div>
          </div>
        </div>

        <div className="trm-footer">
          <button className="trm-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="trm-btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  )
}
