import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTournament, saveTournament, type TGroup, type TRound, type TTeam } from '../../features/kabaddi/state/tournamentStore'
import './tournament-wizard.css'

const FORMAT_OPTIONS = [
    { id: 'league', label: 'League', sub: 'All teams play each other', emoji: '📋', best: '4-10 teams' },
    { id: 'knockout', label: 'Knockout', sub: 'Single elimination bracket', emoji: '⚡', best: '4/8/16 teams' },
    { id: 'league_ko', label: 'League + Knockout', sub: 'Group stage then knockout', emoji: '🏆', best: '8-16 teams' },
    { id: 'double_elim', label: 'Double Elimination', sub: 'Losers get a second chance', emoji: '🔄', best: '8+ teams' },
]

const KO_ROUND_NAMES = ['Final', 'Semi Final', 'Quarter Final', 'Round of 16', 'Round of 32']

export default function AddRoundsScreen() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [tournament, setTournament] = useState<any>(null)
    const [teams, setTeams] = useState<TTeam[]>([])
    const [format, setFormat] = useState<string>('league')
    const [groups, setGroups] = useState<TGroup[]>([])
    const [rounds, setRounds] = useState<TRound[]>([])
    const [numGroups, setNumGroups] = useState(2)
    const [koRounds, setKoRounds] = useState<string[]>(['Semi Final', 'Final'])

    useEffect(() => {
        const t = id ? getTournament(id) : null
        if (t) {
            setTournament(t)
            setTeams(t.teams || [])
            setFormat(t.format || 'league')
            if (t.groups?.length) setGroups(t.groups)
            if (t.rounds?.length) setRounds(t.rounds)
        }
    }, [id])

    // Auto-generate groups when numGroups or teams change
    useEffect(() => {
        if (format !== 'league' && format !== 'league_ko') return
        if (teams.length === 0) return
        const newGroups: TGroup[] = Array.from({ length: numGroups }, (_, i) => ({
            id: groups[i]?.id || `g-${i}`,
            name: String.fromCharCode(65 + i), // A, B, C...
            teamIds: groups[i]?.teamIds || [],
        }))
        setGroups(newGroups)
    }, [numGroups, teams.length, format])

    const assignTeamToGroup = (teamId: string, groupId: string) => {
        setGroups(prev => prev.map(g => {
            // Remove from all groups first
            const without = g.teamIds.filter(t => t !== teamId)
            if (g.id === groupId) return { ...g, teamIds: [...without, teamId] }
            return { ...g, teamIds: without }
        }))
    }

    const autoAssignGroups = () => {
        const shuffled = [...teams].sort(() => Math.random() - 0.5)
        const newGroups = groups.map((g, i) => ({ ...g, teamIds: [] as string[] }))
        shuffled.forEach((team, i) => {
            newGroups[i % numGroups].teamIds.push(team.id)
        })
        setGroups(newGroups)
    }

    const buildRounds = (): TRound[] => {
        const result: TRound[] = []
        if (format === 'league') {
            result.push({ id: 'r-league', name: 'League Stage', type: 'league', order: 1 })
        } else if (format === 'knockout') {
            koRounds.forEach((name, i) => {
                result.push({ id: `r-ko-${i}`, name, type: name.toLowerCase().replace(/\s/g, '') as any, order: koRounds.length - i })
            })
        } else if (format === 'league_ko') {
            result.push({ id: 'r-league', name: 'Group Stage', type: 'league', order: 1 })
            koRounds.forEach((name, i) => {
                result.push({ id: `r-ko-${i}`, name, type: name.toLowerCase().replace(/\s/g, '') as any, order: koRounds.length - i + 1 })
            })
        }
        return result
    }

    const handleNext = () => {
        if (!tournament) return
        const finalRounds = buildRounds()
        saveTournament({ ...tournament, format: format as any, groups, rounds: finalRounds })
        navigate(`/tournaments/${id}/add-schedule`)
    }

    const unassignedTeams = teams.filter(t => !groups.some(g => g.teamIds.includes(t.id)))
    const showGroups = (format === 'league' && numGroups > 1) || format === 'league_ko'

    return (
        <div className="tw-page">
            <div className="tw-header">
                <button className="tw-back" onClick={() => navigate(`/tournaments/${id}/add-teams`)}>← Back</button>
                <div className="tw-header-info">
                    <div className="tw-header-title">Rounds & Groups</div>
                    <div className="tw-header-sub">{tournament?.name}</div>
                </div>
                <div className="tw-step-pill">Step 2 of 3</div>
            </div>

            <div className="tw-progress-bar">
                <div className="tw-progress-fill" style={{ width: '66%' }} />
            </div>

            <div className="tw-body">
                {/* Format selection */}
                <div className="tw-section">
                    <div className="tw-section-title">Tournament Format</div>
                    <div className="tw-format-grid">
                        {FORMAT_OPTIONS.map(f => (
                            <div
                                key={f.id}
                                className={`tw-format-card ${format === f.id ? 'active' : ''}`}
                                onClick={() => setFormat(f.id)}
                            >
                                <div className="tw-format-emoji">{f.emoji}</div>
                                <div className="tw-format-label">{f.label}</div>
                                <div className="tw-format-sub">{f.sub}</div>
                                <div className="tw-format-best">Best for {f.best}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* League settings */}
                {(format === 'league' || format === 'league_ko') && (
                    <div className="tw-section">
                        <div className="tw-section-title">Group Stage</div>
                        <div className="tw-config-card">
                            <div className="tw-config-row">
                                <div>
                                    <div className="tw-config-name">Number of Groups</div>
                                    <div className="tw-config-desc">Teams split into groups</div>
                                </div>
                                <div className="tw-seg-ctrl">
                                    {[1, 2, 3, 4].map(n => (
                                        <button key={n} className={`tw-seg-btn ${numGroups === n ? 'active' : ''}`}
                                            onClick={() => setNumGroups(n)} disabled={n > teams.length}>
                                            {n === 1 ? 'None' : n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Group assignment */}
                {showGroups && groups.length > 1 && (
                    <div className="tw-section">
                        <div className="tw-section-row">
                            <div className="tw-section-title">Assign Teams to Groups</div>
                            <button className="tw-auto-assign-btn" onClick={autoAssignGroups}>
                                🎲 Auto Assign
                            </button>
                        </div>

                        <div className="tw-groups-grid">
                            {groups.map(g => (
                                <div key={g.id} className="tw-group-col">
                                    <div className="tw-group-header">Group {g.name}</div>
                                    <div className="tw-group-teams">
                                        {g.teamIds.map(tid => {
                                            const team = teams.find(t => t.id === tid)
                                            if (!team) return null
                                            return (
                                                <div key={tid} className="tw-group-team-chip"
                                                    style={{ borderColor: team.color, background: `${team.color}15` }}>
                                                    <span style={{ color: team.color, fontWeight: 800, fontSize: 12 }}>{team.short}</span>
                                                    <span style={{ fontSize: 12, marginLeft: 4 }}>{team.name}</span>
                                                </div>
                                            )
                                        })}
                                        {g.teamIds.length === 0 && (
                                            <div className="tw-group-empty">No teams yet</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Unassigned teams */}
                        {unassignedTeams.length > 0 && (
                            <div className="tw-unassigned">
                                <div className="tw-unassigned-label">Unassigned ({unassignedTeams.length})</div>
                                <div className="tw-unassigned-teams">
                                    {unassignedTeams.map(team => (
                                        <div key={team.id} className="tw-unassigned-team">
                                            <div className="tw-team-dot" style={{ background: team.color }} />
                                            <span>{team.name}</span>
                                            <div className="tw-assign-btns">
                                                {groups.map(g => (
                                                    <button key={g.id} className="tw-assign-btn"
                                                        onClick={() => assignTeamToGroup(team.id, g.id)}>
                                                        {g.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Knockout rounds */}
                {(format === 'knockout' || format === 'league_ko' || format === 'double_elim') && (
                    <div className="tw-section">
                        <div className="tw-section-title">Knockout Rounds</div>
                        <div className="tw-rounds-list">
                            {KO_ROUND_NAMES.slice(0, Math.ceil(Math.log2(teams.length || 2))).reverse().map(name => {
                                const active = koRounds.includes(name)
                                return (
                                    <div
                                        key={name}
                                        className={`tw-round-chip ${active ? 'active' : ''}`}
                                        onClick={() => setKoRounds(prev =>
                                            active ? prev.filter(r => r !== name) : [...prev, name]
                                        )}
                                    >
                                        {active ? '✓ ' : ''}{name}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="tw-rounds-preview">
                            {buildRounds().map((r, i) => (
                                <div key={r.id} className="tw-round-preview-item">
                                    <div className="tw-round-preview-num">{i + 1}</div>
                                    <div className="tw-round-preview-name">{r.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Matches preview */}
                <div className="tw-matches-preview">
                    <div className="tw-matches-preview-title">📊 Schedule Preview</div>
                    {format === 'league' && (
                        <div className="tw-matches-preview-text">
                            {teams.length} teams {numGroups === 1 ? 'League' : `${numGroups} Groups`} =
                            <strong> ~{numGroups === 1 ? (teams.length * (teams.length - 1)) / 2 : (numGroups * Math.floor(teams.length / numGroups) * (Math.floor(teams.length / numGroups) - 1)) / 2} matches</strong>
                        </div>
                    )}
                    {format === 'knockout' && (
                        <div className="tw-matches-preview-text">
                            {teams.length} teams Knockout = <strong>{teams.length - 1} matches</strong>
                        </div>
                    )}
                    {format === 'league_ko' && (
                        <div className="tw-matches-preview-text">
                            Group Stage ({numGroups} groups) + {koRounds.length} rounds = 
                            <strong> ~{((numGroups * Math.floor(teams.length / numGroups) * (Math.floor(teams.length / numGroups) - 1)) / 2) + Math.pow(2, koRounds.length) - 1} matches</strong>
                        </div>
                    )}
                </div>
            </div>

            <div className="tw-footer">
                <button className="tw-next-btn ready" onClick={handleNext}>
                    Next: Generate Schedule →
                </button>
            </div>
        </div>
    )
}