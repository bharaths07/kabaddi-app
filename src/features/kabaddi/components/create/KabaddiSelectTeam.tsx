import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getStoredTeams, saveTeams, startNewMatch, getCreationState,
  type TeamData
} from '../../state/matchCreationStore'
import { setTeam } from '../../state/createDraft'
import './create-match.css'

function TeamAvatar({ team, size = 52 }: { team: TeamData; size?: number }) {
  return (
    <div className="cm-team-avatar" style={{
      width: size, height: size, fontSize: size * 0.28,
      background: `linear-gradient(135deg,${team.color},${team.color}bb)`,
      boxShadow: `0 4px 14px ${team.color}44`,
    }}>
      {team.short}
    </div>
  )
}

export default function SelectTeamsScreen() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState<TeamData[]>([])
  const [teamA, setTeamA] = useState<TeamData | null>(null)
  const [teamB, setTeamB] = useState<TeamData | null>(null)
  const [search, setSearch] = useState('')
  const [selecting, setSelecting] = useState<'A' | 'B' | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newShort, setNewShort] = useState('')
  const [newColor, setNewColor] = useState('#0ea5e9')

  useEffect(() => {
    const t = getStoredTeams()
    setTeams(t)
    // restore if coming back
    const state = getCreationState()
    if (state?.teamA) setTeamA(state.teamA)
    if (state?.teamB) setTeamB(state.teamB)
  }, [])

  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.short.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (team: TeamData) => {
    if (selecting === 'A') {
      if (teamB?.id === team.id) return // can't pick same
      setTeamA(team)
      setSelecting(null)
    } else if (selecting === 'B') {
      if (teamA?.id === team.id) return
      setTeamB(team)
      setSelecting(null)
    }
    setSearch('')
  }

  const handleNext = () => {
    if (!teamA || !teamB) return
    startNewMatch()
    saveTeams(teamA, teamB)
    setTeam('a', { id: teamA.id, name: teamA.name })
    setTeam('b', { id: teamB.id, name: teamB.name })
    navigate('/kabaddi/create/setup')
  }

  const COLORS = ['#0ea5e9', '#7c3aed', '#16a34a', '#ea580c', '#db2777', '#d97706', '#0284c7', '#ef4444']

  return (
    <div className="cm-page">
      {/* Header */}
      <div className="cm-header">
        <button className="cm-back" onClick={() => navigate(-1)}>← Back</button>
        <div className="cm-header-title">Select Teams</div>
        <div className="cm-step-badge">1 of 4</div>
      </div>

      {/* Step bar */}
      <div className="cm-steps">
        {['Teams', 'Setup', 'Lineup', 'Toss'].map((s, i) => (
          <div key={s} className={`cm-step ${i === 0 ? 'active' : ''}`}>
            <div className="cm-step-dot">{i + 1}</div>
            <div className="cm-step-label">{s}</div>
          </div>
        ))}
      </div>

      <div className="cm-body">
        {/* VS card */}
        <div className="cm-vs-card">
          <div className="cm-team-slot" onClick={() => setSelecting('A')}>
            {teamA ? (
              <>
                <TeamAvatar team={teamA} />
                <div className="cm-team-slot-name">{teamA.name}</div>
                <div className="cm-team-slot-change">Tap to change</div>
              </>
            ) : (
              <>
                <div className="cm-team-slot-empty">A</div>
                <div className="cm-team-slot-name">Select Team A</div>
              </>
            )}
          </div>

          <div className="cm-vs-badge">VS</div>

          <div className="cm-team-slot" onClick={() => setSelecting('B')}>
            {teamB ? (
              <>
                <TeamAvatar team={teamB} />
                <div className="cm-team-slot-name">{teamB.name}</div>
                <div className="cm-team-slot-change">Tap to change</div>
              </>
            ) : (
              <>
                <div className="cm-team-slot-empty">B</div>
                <div className="cm-team-slot-name">Select Team B</div>
              </>
            )}
          </div>
        </div>

        {/* Team picker */}
        {selecting && (
          <div className="cm-picker">
            <div className="cm-picker-header">
              <span className="cm-picker-title">
                Selecting Team {selecting}
              </span>
              <button className="cm-picker-close" onClick={() => setSelecting(null)}>✕</button>
            </div>

            <div className="cm-search-wrap">
              <input
                className="cm-search"
                placeholder="Search teams..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="cm-team-list">
              {filtered.map(team => {
                const disabled = (selecting === 'A' && teamB?.id === team.id) || (selecting === 'B' && teamA?.id === team.id)
                return (
                  <div
                    key={team.id}
                    className={`cm-team-row ${disabled ? 'disabled' : ''}`}
                    onClick={() => !disabled && handleSelect(team)}
                  >
                    <TeamAvatar team={team} size={40} />
                    <div className="cm-team-row-info">
                      <div className="cm-team-row-name">{team.name}</div>
                      <div className="cm-team-row-short">{team.short}</div>
                    </div>
                    {disabled && <span className="cm-team-row-taken">Already selected</span>}
                  </div>
                )
              })}

              {/* Create new team */}
              <div className="cm-team-row create-row" onClick={() => setShowCreate(true)}>
                <div className="cm-create-icon">+</div>
                <div className="cm-team-row-info">
                  <div className="cm-team-row-name">Create New Team</div>
                  <div className="cm-team-row-short">Add a team quickly</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create team mini form */}
        {showCreate && (
          <div className="cm-create-form">
            <div className="cm-create-form-title">Create Team</div>
            <input className="cm-input" placeholder="Team name e.g. SKBC Warriors" value={newName} onChange={e => setNewName(e.target.value)} />
            <input className="cm-input" placeholder="Short name e.g. SKBC" maxLength={5} value={newShort} onChange={e => setNewShort(e.target.value.toUpperCase())} />
            <div className="cm-color-label">Team Color</div>
            <div className="cm-color-row">
              {COLORS.map(c => (
                <div key={c} className={`cm-color-dot ${newColor === c ? 'selected' : ''}`}
                  style={{ background: c }} onClick={() => setNewColor(c)} />
              ))}
            </div>
            <div className="cm-create-form-actions">
              <button className="cm-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="cm-btn-primary" onClick={() => {
                if (!newName.trim()) return
                const team: TeamData = {
                  id: `t-${Date.now()}`,
                  name: newName.trim(),
                  short: newShort || newName.slice(0, 3).toUpperCase(),
                  color: newColor,
                }
                const updated = [...teams, team]
                setTeams(updated)
                try { localStorage.setItem('pl.teams', JSON.stringify(updated)) } catch { }
                handleSelect(team)
                setShowCreate(false)
                setNewName(''); setNewShort(''); setNewColor('#0ea5e9')
              }}>Create & Select</button>
            </div>
          </div>
        )}
      </div>

      {/* Next button */}
      <div className="cm-footer">
        {teamA && teamB && (
          <div className="cm-footer-preview">
            <TeamAvatar team={teamA} size={32} />
            <span className="cm-footer-vs">vs</span>
            <TeamAvatar team={teamB} size={32} />
            <span className="cm-footer-names">{teamA.short} vs {teamB.short}</span>
          </div>
        )}
        <button
          className={`cm-next-btn ${teamA && teamB ? 'ready' : ''}`}
          disabled={!teamA || !teamB}
          onClick={handleNext}
        >
          Next: Match Setup →
        </button>
      </div>
    </div>
  )
}