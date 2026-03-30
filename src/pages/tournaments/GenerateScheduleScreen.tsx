import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    getTournament, saveTournament, generateLeagueFixtures, generateKnockoutFixtures,
    type TFixture
} from '../../features/kabaddi/state/tournamentStore'
import './tournament-wizard.css'

function FixtureRow({ fixture, teams, rounds }: { fixture: TFixture; teams: any[]; rounds: any[] }) {
    const tA = teams.find(t => t.id === fixture.teamAId)
    const tB = teams.find(t => t.id === fixture.teamBId)
    const round = rounds.find(r => r.id === fixture.roundId)
    return (
        <div className="tw-fixture-row">
            <div className="tw-fixture-left">
                <div className="tw-fixture-round">{round?.name || 'Match'}</div>
                <div className="tw-fixture-teams">
                    <span className="tw-fixture-team" style={{ color: tA?.color || '#0f172a' }}>
                        {tA?.short || fixture.teamAId === 'TBD' ? 'TBD' : '?'}
                    </span>
                    <span className="tw-fixture-vs">vs</span>
                    <span className="tw-fixture-team" style={{ color: tB?.color || '#0f172a' }}>
                        {tB?.short || fixture.teamBId === 'TBD' ? 'TBD' : '?'}
                    </span>
                </div>
                <div className="tw-fixture-names">
                    {tA?.name || 'TBD'} vs {tB?.name || 'TBD'}
                </div>
            </div>
            <div className="tw-fixture-right">
                <div className="tw-fixture-date">{fixture.date}</div>
                <div className="tw-fixture-time">{fixture.time}</div>
                <div className="tw-fixture-court">{fixture.court}</div>
            </div>
        </div>
    )
}

export default function GenerateScheduleScreen() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [tournament, setTournament] = useState<any>(null)
    const [fixtures, setFixtures] = useState<TFixture[]>([])
    const [generated, setGenerated] = useState(false)
    const [startTime, setStartTime] = useState('09:00')
    const [courts, setCourts] = useState(1)
    const [matchDuration, setMatchDuration] = useState(50) // 20+20+10 break
    const [filterRound, setFilterRound] = useState('all')

    useEffect(() => {
        const t = id ? getTournament(id) : null
        if (t) {
            setTournament(t)
            setCourts(t.courts || 1)
            if (t.fixtures?.length) {
                setFixtures(t.fixtures)
                setGenerated(true)
            }
        }
    }, [id])

    const generateSchedule = () => {
        if (!tournament) return
        const startDT = new Date(tournament.startDate || new Date())
        const [h, m] = startTime.split(':').map(Number)
        startDT.setHours(h, m, 0)

        let newFixtures: TFixture[] = []
        if (tournament.format === 'knockout') {
            newFixtures = generateKnockoutFixtures(tournament.teams, tournament.rounds, startDT.toISOString(), courts, matchDuration)
        } else {
            newFixtures = generateLeagueFixtures(tournament.teams, tournament.groups, tournament.rounds, startDT.toISOString(), courts, matchDuration)
        }
        setFixtures(newFixtures)
        setGenerated(true)
    }

    const handleFinish = () => {
        if (!tournament) return
        saveTournament({ ...tournament, fixtures, status: 'registration' })
        navigate(`/tournaments/${id}/dashboard`)
    }

    const rounds = tournament?.rounds || []
    const teams = tournament?.teams || []

    const filteredFixtures = filterRound === 'all'
        ? fixtures
        : fixtures.filter(f => f.roundId === filterRound)

    const matchesByDate = filteredFixtures.reduce((acc: Record<string, TFixture[]>, f) => {
        acc[f.date] = acc[f.date] || []
        acc[f.date].push(f)
        return acc
    }, {})

    return (
        <div className="tw-page">
            <div className="tw-header">
                <button className="tw-back" onClick={() => navigate(`/tournaments/${id}/add-rounds`)}>← Back</button>
                <div className="tw-header-info">
                    <div className="tw-header-title">Generate Schedule</div>
                    <div className="tw-header-sub">{tournament?.name}</div>
                </div>
                <div className="tw-step-pill">Step 3 of 3</div>
            </div>

            <div className="tw-progress-bar">
                <div className="tw-progress-fill" style={{ width: '100%', background: '#16a34a' }} />
            </div>

            <div className="tw-body">
                {/* Config */}
                <div className="tw-section">
                    <div className="tw-section-title">Schedule Settings</div>
                    <div className="tw-config-card">
                        <div className="tw-config-row">
                            <div>
                                <div className="tw-config-name">First Match Time</div>
                                <div className="tw-config-desc">When first match starts</div>
                            </div>
                            <input type="time" className="tw-time-input" value={startTime}
                                onChange={e => setStartTime(e.target.value)} />
                        </div>
                        <div className="tw-config-divider" />
                        <div className="tw-config-row">
                            <div>
                                <div className="tw-config-name">Courts Available</div>
                                <div className="tw-config-desc">Parallel matches possible</div>
                            </div>
                            <div className="tw-seg-ctrl">
                                {[1, 2, 3, 4].map(n => (
                                    <button key={n} className={`tw-seg-btn ${courts === n ? 'active' : ''}`}
                                        onClick={() => setCourts(n)}>{n}</button>
                                ))}
                            </div>
                        </div>
                        <div className="tw-config-divider" />
                        <div className="tw-config-row">
                            <div>
                                <div className="tw-config-name">Match Duration</div>
                                <div className="tw-config-desc">Including half-time break</div>
                            </div>
                            <div className="tw-seg-ctrl">
                                {[45, 50, 60, 75].map(n => (
                                    <button key={n} className={`tw-seg-btn ${matchDuration === n ? 'active' : ''}`}
                                        onClick={() => setMatchDuration(n)}>{n}m</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats preview */}
                {tournament && (
                    <div className="tw-stats-row">
                        <div className="tw-stat-box">
                            <div className="tw-stat-num" style={{ color: '#0ea5e9' }}>{teams.length}</div>
                            <div className="tw-stat-label">Teams</div>
                        </div>
                        <div className="tw-stat-box">
                            <div className="tw-stat-num" style={{ color: '#7c3aed' }}>
                                {tournament.format === 'knockout'
                                    ? teams.length - 1
                                    : Math.round((teams.length * (teams.length - 1)) / 2)}
                            </div>
                            <div className="tw-stat-label">Matches</div>
                        </div>
                        <div className="tw-stat-box">
                            <div className="tw-stat-num" style={{ color: '#ea580c' }}>{courts}</div>
                            <div className="tw-stat-label">Courts</div>
                        </div>
                        <div className="tw-stat-box">
                            <div className="tw-stat-num" style={{ color: '#16a34a' }}>
                                {Math.ceil(
                                    ((tournament.format === 'knockout' ? teams.length - 1 : Math.round((teams.length * (teams.length - 1)) / 2)) / courts)
                                    * matchDuration / 60
                                )}h
                            </div>
                            <div className="tw-stat-label">Est. Duration</div>
                        </div>
                    </div>
                )}

                {/* Generate button */}
                <button className="tw-generate-btn" onClick={generateSchedule}>
                    {generated ? '🔄 Regenerate Schedule' : '⚡ Generate Schedule'}
                </button>

                {/* Schedule display */}
                {generated && fixtures.length > 0 && (
                    <div className="tw-section">
                        <div className="tw-section-row">
                            <div className="tw-section-title">Schedule ({fixtures.length} matches)</div>
                            <select className="tw-filter-select" value={filterRound} onChange={e => setFilterRound(e.target.value)}>
                                <option value="all">All Rounds</option>
                                {rounds.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>

                        {Object.entries(matchesByDate).map(([date, dayFixtures]) => (
                            <div key={date} className="tw-day-block">
                                <div className="tw-day-header">
                                    📅 {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    <span className="tw-day-count">{dayFixtures.length} matches</span>
                                </div>
                                {dayFixtures.map(f => (
                                    <FixtureRow key={f.id} fixture={f} teams={teams} rounds={rounds} />
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                {generated && fixtures.length === 0 && (
                    <div className="tw-empty">
                        <div className="tw-empty-icon">📅</div>
                        <div className="tw-empty-title">No fixtures generated</div>
                        <div className="tw-empty-sub">Check teams and rounds configuration</div>
                    </div>
                )}
            </div>

            <div className="tw-footer">
                {!generated && (
                    <div className="tw-footer-hint">Generate schedule first to continue</div>
                )}
                <button
                    className={`tw-next-btn ${generated ? 'ready' : ''}`}
                    disabled={!generated}
                    onClick={handleFinish}
                    style={{ background: generated ? 'linear-gradient(135deg,#16a34a,#15803d)' : '' }}
                >
                    🏆 Go to Tournament Dashboard
                </button>
            </div>
        </div>
    )
}