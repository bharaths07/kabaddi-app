import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './add-teams.css'

type RegisteredUser = { id: string; name: string; phone: string }
type Player = { id: string; name: string; number: number; isCaptain?: boolean }
type TeamStatus = 'confirmed' | 'invited' | 'pending'
type Team = { id: string; name: string; short?: string; jerseyColor?: string; captainId?: string; players: Player[]; status: TeamStatus }

export default function AddTeams() {
  const { id } = useParams()
  const navigate = useNavigate()

  const tournament = useMemo(() => {
    const all = [
      { id: 'kpl2026', name: 'KPL 2026', teams: 12 },
      { id: 'skbc2026', name: 'Spring Kabaddi Cup', teams: 8 },
      { id: 'monsoon2026', name: 'Monsoon League', teams: 12 }
    ]
    return all.find(t => t.id === id) || all[0]
  }, [id])

  const registeredUsers = useMemo<RegisteredUser[]>(
    () => [
      { id: 'u1', name: 'Ajay Kumar', phone: '9876543210' },
      { id: 'u2', name: 'Rahul Singh', phone: '9876501234' },
      { id: 'u3', name: 'Pawan Yadav', phone: '9876512345' },
      { id: 'u4', name: 'Kiran Reddy', phone: '9876523456' }
    ],
    []
  )

  const [teams, setTeams] = useState<Team[]>([
    { id: 't1', name: 'Rangers', short: 'RG', jerseyColor: '#1f77b4', players: [], status: 'confirmed' },
    { id: 't2', name: 'Titans', short: 'TT', jerseyColor: '#ff7f0e', players: [], status: 'confirmed' },
    { id: 't3', name: 'Wolves', short: 'WV', jerseyColor: '#2ca02c', players: [], status: 'invited' },
    { id: 't4', name: 'Falcons', short: 'FC', jerseyColor: '#d62728', players: [], status: 'pending' }
  ])

  const [tab, setTab] = useState<'invite' | 'direct'>('invite')

  const addedCount = teams.length
  const totalTeams = tournament.teams
  const minRequired = 4
  const hasMin = addedCount >= minRequired

  const [q, setQ] = useState('')
  const filteredUsers = useMemo(() => {
    const x = q.trim().toLowerCase()
    if (!x) return registeredUsers
    return registeredUsers.filter(u => u.name.toLowerCase().includes(x) || u.phone.includes(x))
  }, [registeredUsers, q])

  const inviteAsCaptain = (user: RegisteredUser) => {
    const newTeam: Team = {
      id: `t_${Date.now()}`,
      name: `${user.name.split(' ')[0]}'s Team`,
      short: user.name.split(' ')[0].slice(0, 2).toUpperCase(),
      jerseyColor: '#6c5ce7',
      captainId: user.id,
      players: [{ id: `p_${user.id}`, name: user.name, number: 1, isCaptain: true }],
      status: 'invited'
    }
    setTeams(prev => [newTeam, ...prev])
  }

  const [tName, setTName] = useState('')
  const [tColor, setTColor] = useState('#1e90ff')
  const [players, setPlayers] = useState<Player[]>([])

  const addPlayerRow = () => {
    const newP: Player = { id: `p_${Date.now()}`, name: '', number: players.length + 1 }
    setPlayers(prev => [...prev, newP])
  }
  const updatePlayer = (idp: string, patch: Partial<Player>) => {
    setPlayers(prev => prev.map(p => (p.id === idp ? { ...p, ...patch } : p)))
  }
  const markCaptain = (idp: string) => {
    setPlayers(prev => prev.map(p => ({ ...p, isCaptain: p.id === idp })))
  }
  const saveDirectTeam = () => {
    if (!tName.trim()) return
    const captain = players.find(p => p.isCaptain)
    const newTeam: Team = {
      id: `t_${Date.now()}`,
      name: tName.trim(),
      short: tName.trim().slice(0, 2).toUpperCase(),
      jerseyColor: tColor,
      captainId: captain?.id,
      players,
      status: 'confirmed'
    }
    setTeams(prev => [newTeam, ...prev])
    setTName('')
    setTColor('#1e90ff')
    setPlayers([])
  }

  const joinCode = useMemo(() => 'ABCD1234', [])
  const joinLink = useMemo(() => `https://playlegends.app/join?tournament=${tournament.id}&code=${joinCode}`, [tournament.id, joinCode])

  return (
    <div className="teams-page">
      <div className="teams-head">
        <div>
          <div className="teams-title">Add Teams</div>
          <div className="teams-sub">Tournament: {tournament.name}</div>
        </div>
        <div className="teams-progress">Teams Added: {addedCount} / {totalTeams}</div>
      </div>

      {!hasMin && (
        <div className="teams-warning">Need at least {minRequired} teams to continue</div>
      )}

      <div className="teams-tabs">
        {['invite', 'direct'].map(k => (
          <button key={k} className={`teams-tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k as any)}>
            {k === 'invite' ? 'Option A — Invite by Phone/Name' : 'Option B — Organizer adds directly'}
          </button>
        ))}
      </div>

      {tab === 'invite' && (
        <div className="teams-section">
          <div className="teams-row">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search registered users by name or phone"
              className="teams-input"
            />
          </div>
          <div className="teams-user-list">
            {filteredUsers.map(u => (
              <div key={u.id} className="teams-user-card">
                <div className="teams-user-name">{u.name}</div>
                <div className="teams-user-phone">{u.phone}</div>
                <button className="teams-primary" onClick={() => inviteAsCaptain(u)}>Send Invite as Captain</button>
              </div>
            ))}
            {filteredUsers.length === 0 && <div className="teams-empty">No registered users found</div>}
          </div>
        </div>
      )}

      {tab === 'direct' && (
        <div className="teams-section">
          <div className="teams-form">
            <div className="teams-field">
              <label className="teams-label">Team name</label>
              <input value={tName} onChange={e => setTName(e.target.value)} placeholder="e.g., Spartans" className="teams-input" />
            </div>
            <div className="teams-field">
              <label className="teams-label">Jersey color</label>
              <input type="color" value={tColor} onChange={e => setTColor(e.target.value)} className="teams-color" />
            </div>
          </div>

          <div className="teams-form">
            <div className="teams-field">
              <div className="teams-label">Players</div>
              <div className="teams-players">
                {players.map(p => (
                  <div key={p.id} className="teams-player-row">
                    <input
                      value={p.name}
                      onChange={e => updatePlayer(p.id, { name: e.target.value })}
                      placeholder="Player name"
                      className="teams-input small"
                    />
                    <input
                      value={p.number}
                      onChange={e => {
                        const n = parseInt(e.target.value || '0', 10)
                        updatePlayer(p.id, { number: isNaN(n) ? 0 : n })
                      }}
                      placeholder="Jersey #"
                      className="teams-input small"
                    />
                    <button className={`teams-captain ${p.isCaptain ? 'active' : ''}`} onClick={() => markCaptain(p.id)}>
                      {p.isCaptain ? 'Captain' : 'Mark Captain'}
                    </button>
                  </div>
                ))}
                <button className="teams-secondary" onClick={addPlayerRow}>Add Player</button>
              </div>
            </div>
          </div>

          <div className="teams-actions">
            <button className="teams-primary" onClick={saveDirectTeam}>Save Team</button>
            <button className="teams-secondary" onClick={() => { setTName(''); setTColor('#1e90ff'); setPlayers([]) }}>+ Add Another Team</button>
          </div>
        </div>
      )}

      <div className="teams-section">
        <div className="teams-section-head">
          <div className="teams-section-title">Teams</div>
        </div>
        <div className="teams-list">
          {teams.map(t => (
            <div key={t.id} className="teams-card">
              <div className="teams-card-left">
                <div className="teams-logo" style={{ background: t.jerseyColor || '#888' }}>{(t.short || t.name).slice(0, 2).toUpperCase()}</div>
                <div className="teams-name">{t.name}</div>
              </div>
              <span className={`teams-badge s-${t.status}`}>{t.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="teams-section">
        <div className="teams-section-head">
          <div className="teams-section-title">Tournament Join Link/Code</div>
        </div>
        <div className="teams-join">
          <div className="teams-join-row">
            <div className="teams-join-label">Join Link</div>
            <div className="teams-join-value">{joinLink}</div>
            <button
              className="teams-secondary"
              onClick={() => navigator.clipboard?.writeText(joinLink)}
            >
              Copy
            </button>
          </div>
          <div className="teams-join-row">
            <div className="teams-join-label">Join Code</div>
            <div className="teams-join-value">{joinCode}</div>
            <button
              className="teams-secondary"
              onClick={() => navigator.clipboard?.writeText(joinCode)}
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      <div className="teams-foot">
        <button className="teams-outline" onClick={() => navigate(`/tournament/${tournament.id}/dashboard`)}>Back to Dashboard</button>
        <button className="teams-primary" disabled={!hasMin} onClick={() => navigate(`/tournament/${tournament.id}/add-rounds`)}>Continue</button>
      </div>
    </div>
  )
}

