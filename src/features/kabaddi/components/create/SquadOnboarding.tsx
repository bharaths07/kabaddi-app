import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    getCreationState, saveLineup, getStoredPlayers, getDefaultPlayers,
    savePlayerToStore, type PlayerData, type TeamData
} from '../../state/matchCreationStore'
import { setSquad as saveDraftSquad } from '../../state/createDraft'
import './create-match.css'

const ROLES: PlayerData['role'][] = ['raider', 'defender', 'all-rounder', 'captain']
const ROLE_COLORS: Record<string, string> = {
    raider: '#0ea5e9',
    defender: '#16a34a',
    'all-rounder': '#7c3aed',
    captain: '#d97706',
}

function PlayerRow({
    player, state, onToggle
}: {
    player: PlayerData
    state: 'starter' | 'sub' | 'bench'
    onToggle: (id: string, to: 'starter' | 'sub' | 'bench') => void
}) {
    return (
        <div className={`cm-player-row ${state}`}>
            <div className="cm-player-num" style={{ color: ROLE_COLORS[player.role] }}>
                #{player.number}
            </div>
            <div className="cm-player-info">
                <div className="cm-player-name">{player.name}</div>
                <div className="cm-player-role" style={{ color: ROLE_COLORS[player.role] }}>
                    {player.role}
                </div>
            </div>
            <div className="cm-player-actions">
                <button
                    className={`cm-player-btn start ${state === 'starter' ? 'active' : ''}`}
                    onClick={() => onToggle(player.id, state === 'starter' ? 'bench' : 'starter')}
                >
                    {state === 'starter' ? '✓ Start' : 'Start'}
                </button>
                <button
                    className={`cm-player-btn sub ${state === 'sub' ? 'active' : ''}`}
                    onClick={() => onToggle(player.id, state === 'sub' ? 'bench' : 'sub')}
                >
                    {state === 'sub' ? '✓ Sub' : 'Sub'}
                </button>
            </div>
        </div>
    )
}

function AddPlayerForm({ teamId, onAdd, onClose }: {
    teamId: string; onAdd: (p: PlayerData) => void; onClose: () => void
}) {
    const [name, setName] = useState('')
    const [role, setRole] = useState<PlayerData['role']>('raider')
    const [num, setNum] = useState('')

    return (
        <div className="cm-add-player-form">
            <div className="cm-create-form-title">Add Player</div>
            <input className="cm-input" placeholder="Player name" value={name} onChange={e => setName(e.target.value)} autoFocus />
            <input className="cm-input" placeholder="Jersey number" type="number" value={num} onChange={e => setNum(e.target.value)} min={1} max={99} />
            <div className="cm-role-select">
                {ROLES.map(r => (
                    <button key={r} className={`cm-role-btn ${role === r ? 'active' : ''}`}
                        style={role === r ? { background: ROLE_COLORS[r], color: '#fff', borderColor: ROLE_COLORS[r] } : {}}
                        onClick={() => setRole(r)}>
                        {r}
                    </button>
                ))}
            </div>
            <div className="cm-create-form-actions">
                <button className="cm-btn-secondary" onClick={onClose}>Cancel</button>
                <button className="cm-btn-primary" onClick={() => {
                    if (!name.trim()) return
                    const p: PlayerData = {
                        id: `p-${Date.now()}`,
                        name: name.trim(),
                        role,
                        number: parseInt(num) || Math.floor(Math.random() * 99) + 1,
                        teamId,
                    }
                    savePlayerToStore(p)
                    onAdd(p)
                    onClose()
                }}>Add Player</button>
            </div>
        </div>
    )
}

export default function PlayerLineupScreen() {
    const navigate = useNavigate()
    const state = getCreationState()
    const [activeTeam, setActiveTeam] = useState<'A' | 'B'>('A')
    const [playersA, setPlayersA] = useState<PlayerData[]>([])
    const [playersB, setPlayersB] = useState<PlayerData[]>([])
    const [startersA, setStartersA] = useState<Set<string>>(new Set())
    const [subsA, setSubsA] = useState<Set<string>>(new Set())
    const [startersB, setStartersB] = useState<Set<string>>(new Set())
    const [subsB, setSubsB] = useState<Set<string>>(new Set())
    const [showAddA, setShowAddA] = useState(false)
    const [showAddB, setShowAddB] = useState(false)

    useEffect(() => {
        if (!state?.teamA || !state?.teamB) { navigate('/kabaddi/create/teams'); return }
        // Load players for each team
        let pA = getStoredPlayers(state.teamA.id)
        let pB = getStoredPlayers(state.teamB.id)
        // If no players, use defaults
        if (pA.length === 0) pA = getDefaultPlayers(state.teamA.id, state.teamA.name)
        if (pB.length === 0) pB = getDefaultPlayers(state.teamB.id, state.teamB.name)
        setPlayersA(pA)
        setPlayersB(pB)
        // restore saved lineup
        if (state.lineup) {
            setStartersA(new Set(state.lineup.teamAStarters))
            setSubsA(new Set(state.lineup.teamASubs))
            setStartersB(new Set(state.lineup.teamBStarters))
            setSubsB(new Set(state.lineup.teamBSubs))
        }
    }, [])

    const togglePlayer = (
        id: string, to: 'starter' | 'sub' | 'bench',
        starters: Set<string>, setStarters: any,
        subs: Set<string>, setSubs: any,
        maxStarters = 7, maxSubs = 5
    ) => {
        const newS = new Set(starters)
        const newSub = new Set(subs)
        newS.delete(id); newSub.delete(id)
        if (to === 'starter' && newS.size < maxStarters) newS.add(id)
        if (to === 'sub' && newSub.size < maxSubs) newSub.add(id)
        setStarters(newS); setSubs(newSub)
    }

    const getState = (id: string, starters: Set<string>, subs: Set<string>) =>
        starters.has(id) ? 'starter' : subs.has(id) ? 'sub' : 'bench'

    const canProceed = startersA.size === 7 && startersB.size === 7

    const handleNext = () => {
        saveLineup({
            teamAStarters: [...startersA],
            teamASubs: [...subsA],
            teamBStarters: [...startersB],
            teamBSubs: [...subsB],
        })

        // Sync with createDraft for the scoring system
        const mapPlayer = (id: string, list: PlayerData[]) => {
            const p = list.find(x => x.id === id)
            return {
                id: p?.id || id,
                name: p?.name || 'Player',
                jerseyNumber: p?.number,
                isCaptain: p?.role === 'captain'
            }
        }

        saveDraftSquad('a', [
            ...[...startersA].map(id => mapPlayer(id, playersA)),
            ...[...subsA].map(id => mapPlayer(id, playersA))
        ])
        saveDraftSquad('b', [
            ...[...startersB].map(id => mapPlayer(id, playersB)),
            ...[...subsB].map(id => mapPlayer(id, playersB))
        ])

        navigate('/kabaddi/create/preview')
    }

    const team = activeTeam === 'A' ? state?.teamA : state?.teamB
    const players = activeTeam === 'A' ? playersA : playersB
    const starters = activeTeam === 'A' ? startersA : startersB
    const subs = activeTeam === 'A' ? subsA : subsB
    const setStarters = activeTeam === 'A' ? setStartersA : setStartersB
    const setSubs = activeTeam === 'A' ? setSubsA : setSubsB

    return (
        <div className="cm-page">
            <div className="cm-header">
                <button className="cm-back" onClick={() => navigate('/kabaddi/create/setup')}>← Back</button>
                <div className="cm-header-title">Player Lineup</div>
                <div className="cm-step-badge">3 of 4</div>
            </div>

            <div className="cm-steps">
                {['Teams', 'Setup', 'Lineup', 'Toss'].map((s, i) => (
                    <div key={s} className={`cm-step ${i === 2 ? 'active' : i < 2 ? 'done' : ''}`}>
                        <div className="cm-step-dot">{i < 2 ? '✓' : i + 1}</div>
                        <div className="cm-step-label">{s}</div>
                    </div>
                ))}
            </div>

            {/* Team tabs */}
            <div className="cm-team-tabs">
                {(['A', 'B'] as const).map(t => {
                    const tm = t === 'A' ? state?.teamA : state?.teamB
                    const sc = t === 'A' ? startersA.size : startersB.size
                    return (
                        <button
                            key={t}
                            className={`cm-team-tab ${activeTeam === t ? 'active' : ''}`}
                            style={activeTeam === t ? { borderBottomColor: tm?.color || '#0ea5e9' } : {}}
                            onClick={() => setActiveTeam(t)}
                        >
                            <span className="cm-team-tab-name">{tm?.name || `Team ${t}`}</span>
                            <span className={`cm-team-tab-count ${sc === 7 ? 'full' : ''}`}>
                                {sc}/7 starters
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Counter bar */}
            <div className="cm-lineup-bar">
                <div className="cm-lineup-stat">
                    <span className="cm-lineup-stat-num" style={{ color: starters.size === 7 ? '#16a34a' : '#0ea5e9' }}>
                        {starters.size}/7
                    </span>
                    <span className="cm-lineup-stat-label">Starters</span>
                </div>
                <div className="cm-lineup-divider" />
                <div className="cm-lineup-stat">
                    <span className="cm-lineup-stat-num" style={{ color: '#7c3aed' }}>
                        {subs.size}/5
                    </span>
                    <span className="cm-lineup-stat-label">Substitutes</span>
                </div>
                <button
                    className="cm-add-player-btn"
                    onClick={() => activeTeam === 'A' ? setShowAddA(true) : setShowAddB(true)}
                >
                    + Add Player
                </button>
            </div>

            <div className="cm-body">
                {/* Add player forms */}
                {showAddA && activeTeam === 'A' && state?.teamA && (
                    <AddPlayerForm
                        teamId={state.teamA.id}
                        onAdd={p => setPlayersA(prev => [...prev, p])}
                        onClose={() => setShowAddA(false)}
                    />
                )}
                {showAddB && activeTeam === 'B' && state?.teamB && (
                    <AddPlayerForm
                        teamId={state.teamB.id}
                        onAdd={p => setPlayersB(prev => [...prev, p])}
                        onClose={() => setShowAddB(false)}
                    />
                )}

                {/* Players list */}
                {players.length === 0 ? (
                    <div className="cm-empty">
                        <div className="cm-empty-icon">👤</div>
                        <div className="cm-empty-text">No players added yet</div>
                        <button className="cm-btn-primary" onClick={() => activeTeam === 'A' ? setShowAddA(true) : setShowAddB(true)}>
                            Add Players
                        </button>
                    </div>
                ) : (
                    <div className="cm-player-list">
                        {/* Starters section */}
                        {players.filter(p => starters.has(p.id)).length > 0 && (
                            <div className="cm-player-section-label">Starting 7</div>
                        )}
                        {players.filter(p => starters.has(p.id)).map(p => (
                            <PlayerRow key={p.id} player={p} state="starter"
                                onToggle={(id, to) => togglePlayer(id, to, starters, setStarters, subs, setSubs)} />
                        ))}
                        {/* Subs section */}
                        {players.filter(p => subs.has(p.id)).length > 0 && (
                            <div className="cm-player-section-label">Substitutes</div>
                        )}
                        {players.filter(p => subs.has(p.id)).map(p => (
                            <PlayerRow key={p.id} player={p} state="sub"
                                onToggle={(id, to) => togglePlayer(id, to, starters, setStarters, subs, setSubs)} />
                        ))}
                        {/* Bench */}
                        {players.filter(p => !starters.has(p.id) && !subs.has(p.id)).length > 0 && (
                            <div className="cm-player-section-label">Available</div>
                        )}
                        {players.filter(p => !starters.has(p.id) && !subs.has(p.id)).map(p => (
                            <PlayerRow key={p.id} player={p} state="bench"
                                onToggle={(id, to) => togglePlayer(id, to, starters, setStarters, subs, setSubs)} />
                        ))}
                    </div>
                )}
            </div>

            <div className="cm-footer">
                {!canProceed && (
                    <div className="cm-footer-hint">
                        {startersA.size < 7 && `${state?.teamA?.name}: need ${7 - startersA.size} more starters`}
                        {startersA.size === 7 && startersB.size < 7 && `${state?.teamB?.name}: need ${7 - startersB.size} more starters`}
                    </div>
                )}
                <button
                    className={`cm-next-btn ${canProceed ? 'ready' : ''}`}
                    disabled={!canProceed}
                    onClick={handleNext}
                >
                    Next: Toss →
                </button>
            </div>
        </div>
    )
}