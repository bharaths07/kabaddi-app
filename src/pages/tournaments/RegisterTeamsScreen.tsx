import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTournament, saveTournament, type TTeam, type TPlayer } from '../../features/kabaddi/state/tournamentStore'
import './tournament-wizard.css'

const COLORS = ['#0ea5e9', '#ea580c', '#16a34a', '#7c3aed', '#db2777', '#d97706', '#ef4444', '#0284c7', '#0891b2', '#65a30d']
const ROLES = ['raider', 'defender', 'all-rounder', 'captain'] as const

function TeamCard({ team, onEdit, onRemove }: {
    team: TTeam
    onEdit: () => void
    onRemove: () => void
}) {
    return (
        <div className="tw-team-card">
            <div className="tw-team-card-left">
                <div className="tw-team-badge" style={{ background: team.color }}>{team.short}</div>
                <div>
                    <div className="tw-team-card-meta">
                        {team.players.length} players {team.players.length === 0 && '· Add later'}
                    </div>
                </div>
            </div>
            <div className="tw-team-card-actions">
                <button className="tw-action-btn edit" onClick={onEdit}>Edit</button>
                <button className="tw-action-btn remove" onClick={onRemove}>✕</button>
            </div>
        </div>
    )
}

function AddTeamModal({ onSave, onClose, existing }: {
    onSave: (team: TTeam) => void
    onClose: () => void
    existing?: TTeam
}) {
    const [name, setName] = useState(existing?.name || '')
    const [short, setShort] = useState(existing?.short || '')
    const [color, setColor] = useState(existing?.color || COLORS[0])
    const [captain, setCaptain] = useState(existing?.captain || '')
    const [players, setPlayers] = useState<TPlayer[]>(existing?.players || [])
    const [pName, setPName] = useState('')
    const [pNum, setPNum] = useState('')
    const [pRole, setPRole] = useState<typeof ROLES[number]>('raider')

    const addPlayer = () => {
        if (!pName.trim()) return
        setPlayers(prev => [...prev, {
            id: `p-${Date.now()}`,
            name: pName.trim(),
            number: parseInt(pNum) || prev.length + 1,
            role: pRole,
        }])
        setPName(''); setPNum('')
    }

    const removePlayer = (id: string) => setPlayers(prev => prev.filter(p => p.id !== id))

    const handleSave = () => {
        if (!name.trim()) return
        onSave({
            id: existing?.id || `team-${Date.now()}`,
            name: name.trim(),
            short: short || name.slice(0, 3).toUpperCase(),
            color,
            captain,
            players,
            registered: true,
        })
        onClose()
    }

    return (
        <div className="tw-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="tw-modal">
                <div className="tw-modal-header">
                    <div className="tw-modal-title">{existing ? 'Edit Team' : 'Add Team'}</div>
                    <button className="tw-modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="tw-modal-body">
                    {/* Team basics */}
                    <div className="tw-form-row">
                        <div className="tw-form-group" style={{ flex: 2 }}>
                            <label className="tw-label">Team Name *</label>
                            <input className="tw-input" placeholder="e.g. SKBC Warriors" value={name} onChange={e => setName(e.target.value)} autoFocus />
                        </div>
                        <div className="tw-form-group" style={{ flex: 1 }}>
                            <label className="tw-label">Short (max 5)</label>
                            <input className="tw-input" placeholder="SKBC" maxLength={5} value={short} onChange={e => setShort(e.target.value.toUpperCase())} />
                        </div>
                    </div>

                    <div className="tw-form-group">
                        <label className="tw-label">Captain Name</label>
                        <input className="tw-input" placeholder="Captain's name" value={captain} onChange={e => setCaptain(e.target.value)} />
                    </div>

                    <div className="tw-form-group">
                        <label className="tw-label">Team Color</label>
                        <div className="tw-color-grid">
                            {COLORS.map(c => (
                                <div key={c} className={`tw-color-dot ${color === c ? 'active' : ''}`}
                                    style={{ background: c }} onClick={() => setColor(c)} />
                            ))}
                        </div>
                    </div>

                    {/* Players */}
                    <div className="tw-form-group">
                        <label className="tw-label">Players ({players.length} added)</label>
                        <div className="tw-player-add-row">
                            <input className="tw-input" style={{ flex: 2 }} placeholder="Player name" value={pName} onChange={e => setPName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addPlayer()} />
                            <input className="tw-input" style={{ flex: 1 }} placeholder="#" type="number" value={pNum} onChange={e => setPNum(e.target.value)} min={1} max={99} />
                            <select className="tw-input" style={{ flex: 1 }} value={pRole} onChange={e => setPRole(e.target.value as any)}>
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <button className="tw-add-player-btn" onClick={addPlayer}>Add</button>
                        </div>

                        {players.length > 0 && (
                            <div className="tw-player-chips">
                                {players.map(p => (
                                    <div key={p.id} className="tw-player-chip">
                                        <span className="tw-chip-num">#{p.number}</span>
                                        <span className="tw-chip-name">{p.name}</span>
                                        <span className="tw-chip-role">{p.role[0].toUpperCase()}</span>
                                        <button className="tw-chip-remove" onClick={() => removePlayer(p.id)}>✕</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="tw-player-hint">
                            {players.length === 0
                                ? `💡 Optional: You can add players now or later`
                                : players.length < 7
                                    ? `⚠️ ${players.length} players added. (Min. 7 for a match)`
                                    : `✅ ${players.length} players — good squad`}
                        </div>
                    </div>
                </div>

                <div className="tw-modal-footer">
                    <button className="tw-btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="tw-btn-primary" onClick={handleSave}>
                        {existing ? 'Save Changes' : 'Add Team'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function RegisterTeamsScreen() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [tournament, setTournament] = useState<any>(null)
    const [teams, setTeams] = useState<TTeam[]>([])
    const [showAdd, setShowAdd] = useState(false)
    const [editTeam, setEditTeam] = useState<TTeam | undefined>()

    useEffect(() => {
        const t = id ? getTournament(id) : null
        if (t) { setTournament(t); setTeams(t.teams || []) }
    }, [id])

    const handleSaveTeam = (team: TTeam) => {
        setTeams(prev => {
            const idx = prev.findIndex(t => t.id === team.id)
            if (idx >= 0) { const n = [...prev]; n[idx] = team; return n }
            return [...prev, team]
        })
    }

    const handleRemove = (teamId: string) => {
        setTeams(prev => prev.filter(t => t.id !== teamId))
    }

    const handleNext = () => {
        if (!tournament) return
        saveTournament({ ...tournament, teams })
        navigate(`/tournaments/${id}/add-rounds`)
    }

    const maxTeams = tournament?.maxTeams || 8

    return (
        <div className="tw-page">
            <div className="tw-header">
                <button className="tw-back" onClick={() => navigate(-1)}>← Back</button>
                <div className="tw-header-info">
                    <div className="tw-header-title">Register Teams</div>
                    <div className="tw-header-sub">{tournament?.name}</div>
                </div>
                <div className="tw-step-pill">Step 1 of 3</div>
            </div>

            <div className="tw-progress-bar">
                <div className="tw-progress-fill" style={{ width: '33%' }} />
            </div>

            <div className="tw-body">
                {/* Stats */}
                <div className="tw-stats-row">
                    <div className="tw-stat-box">
                        <div className="tw-stat-num" style={{ color: teams.length >= maxTeams ? '#16a34a' : '#0ea5e9' }}>
                            {teams.length}
                        </div>
                        <div className="tw-stat-label">Teams Added</div>
                    </div>
                    <div className="tw-stat-box">
                        <div className="tw-stat-num" style={{ color: '#94a3b8' }}>{maxTeams}</div>
                        <div className="tw-stat-label">Max Teams</div>
                    </div>
                    <div className="tw-stat-box">
                        <div className="tw-stat-num" style={{ color: '#7c3aed' }}>
                            {teams.reduce((sum, t) => sum + t.players.length, 0)}
                        </div>
                        <div className="tw-stat-label">Total Players</div>
                    </div>
                </div>

                {/* Capacity bar */}
                <div className="tw-capacity-bar">
                    <div className="tw-capacity-fill" style={{ width: `${Math.min(100, (teams.length / maxTeams) * 100)}%` }} />
                </div>
                <div className="tw-capacity-label">
                    {maxTeams - teams.length > 0
                        ? `${maxTeams - teams.length} slots remaining`
                        : '✅ Tournament full'}
                </div>

                {/* Team list */}
                {teams.length === 0 ? (
                    <div className="tw-empty">
                        <div className="tw-empty-icon">👥</div>
                        <div className="tw-empty-title">No teams yet</div>
                        <div className="tw-empty-sub">Add at least 2 teams to continue</div>
                    </div>
                ) : (
                    <div className="tw-team-list">
                        {teams.map(team => (
                            <TeamCard
                                key={team.id}
                                team={team}
                                onEdit={() => { setEditTeam(team); setShowAdd(true) }}
                                onRemove={() => handleRemove(team.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Add button */}
                {teams.length < maxTeams && (
                    <button className="tw-add-team-btn" onClick={() => { setEditTeam(undefined); setShowAdd(true) }}>
                        + Add Team
                    </button>
                )}
            </div>

            <div className="tw-footer">
                {teams.length < 2 && (
                    <div className="tw-footer-hint">Add at least 2 teams to continue</div>
                )}
                <button
                    className={`tw-next-btn ${teams.length >= 2 ? 'ready' : ''}`}
                    disabled={teams.length < 2}
                    onClick={handleNext}
                >
                    Next: Add Rounds →
                </button>
            </div>

            {showAdd && (
                <AddTeamModal
                    existing={editTeam}
                    onSave={handleSaveTeam}
                    onClose={() => { setShowAdd(false); setEditTeam(undefined) }}
                />
            )}
        </div>
    )
}