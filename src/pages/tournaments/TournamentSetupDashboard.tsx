import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getTournament, type Tournament } from '../../features/kabaddi/state/tournamentStore'
import { registrationService, type RegistrationRequest } from '../../shared/services/registrationService'
import './tournament-wizard.css'

export default function TournamentSetupDashboard() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [tournament, setTournament] = useState<Tournament | null>(null)
    const [requests, setRequests] = useState<RegistrationRequest[]>([])

    useEffect(() => {
        if (id) {
            const t = getTournament(id)
            setTournament(t)
            
            // Load applications
            registrationService.getTournamentRequests(id).then(setRequests)
        }
    }, [id])

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    if (!tournament) return <div className="tw-page"><div className="tw-body">Loading...</div></div>

    // Calculate Progress
    const modules = [
        { 
            id: 'teams', 
            name: 'Teams', 
            desc: 'Register participating teams',
            status: tournament.teams.length >= 2 ? 'completed' : tournament.teams.length > 0 ? 'in_progress' : 'pending',
            info: `${tournament.teams.length} teams added`,
            cta: 'Add Teams',
            path: `/tournaments/${id}/add-teams`,
            icon: '👥'
        },
        { 
            id: 'applications', 
            name: 'Team Applications', 
            desc: 'Review incoming team requests',
            status: pendingCount > 0 ? 'in_progress' : requests.length > 0 ? 'completed' : 'pending',
            info: `${pendingCount} pending applications`,
            cta: 'Review Requests',
            path: `/tournaments/${id}/applications`,
            icon: '📩'
        },
        { 
            id: 'players', 
            name: 'Players', 
            desc: 'Manage team rosters (Optional)',
            status: tournament.teams.some(t => t.players.length > 0) ? 'completed' : 'pending',
            info: 'Optional squad entry',
            cta: 'Add Players',
            path: `/tournaments/${id}/add-teams`, // Same screen for now
            icon: '🏃'
        },
        { 
            id: 'rounds', 
            name: 'Rounds & Groups', 
            desc: 'Set format, groups & rounds',
            status: tournament.rounds.length > 0 ? 'completed' : 'pending',
            info: tournament.rounds.length > 0 ? `${tournament.format.toUpperCase()} setup` : 'Not configured',
            cta: tournament.rounds.length > 0 ? 'Edit Rounds' : 'Configure',
            path: `/tournaments/${id}/add-rounds`,
            icon: '📋'
        },
        { 
            id: 'schedule', 
            name: 'Match Schedule', 
            desc: 'Generate fixtures & timings',
            status: tournament.fixtures.length > 0 ? 'completed' : 'pending',
            info: tournament.fixtures.length > 0 ? `${tournament.fixtures.length} matches set` : 'Not generated',
            cta: tournament.fixtures.length > 0 ? 'Regenerate' : 'Generate',
            path: `/tournaments/${id}/add-schedule`,
            icon: '🗓️'
        }
    ]

    const completedCount = modules.filter(m => m.status === 'completed').length
    const progress = Math.round((completedCount / modules.length) * 100)

    return (
        <div className="tw-page">
            <div className="tw-header">
                <button className="tw-back" onClick={() => navigate('/tournaments')}>← All Tournaments</button>
                <div className="tw-header-info">
                    <div className="tw-header-title">Setup Dashboard</div>
                    <div className="tw-header-sub">{tournament.name}</div>
                </div>
                <div className="tw-status-pill draft">Setup Mode</div>
            </div>

            <div className="tw-body setup-dashboard">
                {/* 1. Progress Header */}
                <div className="tw-setup-progress-card">
                    <div className="tw-progress-info">
                        <div className="tw-progress-label">Tournament Setup Progress</div>
                        <div className="tw-progress-pct">{progress}%</div>
                    </div>
                    <div className="tw-progress-bar-lg">
                        <div className="tw-progress-fill-lg" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="tw-progress-hint">
                        {progress === 100 
                            ? "🎉 Awesome! Your tournament is fully configured and ready for the first raid." 
                            : "Complete the modules below to get your tournament match-ready."}
                    </p>
                </div>

                {/* 2. Module Cards Grid */}
                <div className="tw-modules-grid">
                    {modules.map(m => (
                        <div key={m.id} className={`tw-module-card ${m.status}`}>
                            <div className="tw-module-icon">{m.icon}</div>
                            <div className="tw-module-content">
                                <div className="tw-module-header">
                                    <h3 className="tw-module-name">{m.name}</h3>
                                    <span className={`tw-module-status-badge ${m.status}`}>{m.status.replace('_', ' ')}</span>
                                </div>
                                <p className="tw-module-desc">{m.desc}</p>
                                <div className="tw-module-footer">
                                    <span className="tw-module-info">{m.info}</span>
                                    <button 
                                        className={`tw-module-cta ${m.status === 'completed' ? 'secondary' : 'primary'}`}
                                        onClick={() => navigate(m.path)}
                                    >
                                        {m.cta} {m.status === 'completed' ? '✎' : '→'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. Dashboard CTA — always visible */}
                <div className="tw-goto-dashboard-card">
                    <div className="tw-goto-dashboard-info">
                        <div className="tw-goto-dashboard-title">
                            {progress === 100 ? '🎉 All set! Your tournament is ready.' : '⚡ Tournament created! You can always finish setup later.'}
                        </div>
                        <div className="tw-goto-dashboard-sub">
                            {progress === 100
                                ? 'Head to the live dashboard to start scoring matches or share with participants.'
                                : 'Jump into the tournament dashboard — modules can be completed anytime.'}
                        </div>
                    </div>
                    <button 
                        className="tw-goto-dashboard-btn"
                        onClick={() => navigate(`/tournaments/${id}/dashboard`)}
                    >
                        Go to Tournament Dashboard →
                    </button>
                </div>

                <div className="tw-setup-footer-links">
                    <Link to="/home" className="tw-footer-link">← Back to Home</Link>
                </div>
            </div>
        </div>
    )
}
