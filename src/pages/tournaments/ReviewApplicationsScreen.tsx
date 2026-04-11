import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { registrationService, type RegistrationRequest } from '../../shared/services/registrationService'
import { getTournament, saveTournament } from '../../features/kabaddi/state/tournamentStore'
import './tournament-wizard.css'

export default function ReviewApplicationsScreen() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [tournament, setTournament] = useState<any>(null)
    const [requests, setRequests] = useState<RegistrationRequest[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            const t = getTournament(id)
            setTournament(t)
            loadRequests()
        }
    }, [id])

    const loadRequests = async () => {
        if (!id) return
        setLoading(true)
        const data = await registrationService.getTournamentRequests(id)
        setRequests(data)
        setLoading(false)
    }

    const handleApprove = async (req: RegistrationRequest) => {
        if (!tournament || !req.id) return

        // 1. Update request status
        const updated = await registrationService.updateStatus(req.id, 'approved')
        if (!updated) return

        // 2. Add to tournament teams
        const newTeam = {
            id: `team-${Date.now()}`,
            name: req.team_name,
            short: req.team_short,
            color: req.team_color,
            captain: req.captain_name,
            players: req.players,
            registered: true
        }

        const updatedTeams = [...(tournament.teams || []), newTeam]
        saveTournament({ ...tournament, teams: updatedTeams })
        setTournament({ ...tournament, teams: updatedTeams })
        
        // Refresh requests
        loadRequests()
    }

    const handleReject = async (requestId: string) => {
        await registrationService.updateStatus(requestId, 'rejected')
        loadRequests()
    }

    if (loading) return <div className="tw-page">Loading...</div>

    return (
        <div className="tw-page">
            <div className="tw-header">
                <button className="tw-back" onClick={() => navigate(`/tournaments/${id}/setup`)}>← Dashboard</button>
                <div className="tw-header-info">
                    <div className="tw-header-title">Team Applications</div>
                    <div className="tw-header-sub">{tournament?.name}</div>
                </div>
            </div>

            <div className="tw-body">
                {requests.length === 0 ? (
                    <div className="tw-empty">
                        <div className="tw-empty-icon">📩</div>
                        <div className="tw-empty-title">No applications yet</div>
                        <div className="tw-empty-sub">Once users apply, they will appear here.</div>
                    </div>
                ) : (
                    <div className="tw-application-list">
                        {requests.map(req => (
                            <div key={req.id} className={`tw-app-card ${req.status}`}>
                                <div className="tw-app-header">
                                    <div className="tw-app-badge" style={{ background: req.team_color }}>
                                        {req.team_short}
                                    </div>
                                    <div className="tw-app-info">
                                        <div className="tw-app-team">{req.team_name}</div>
                                        <div className="tw-app-meta">By {req.captain_name} · {req.players.length} Players</div>
                                    </div>
                                    <div className={`tw-status-tag ${req.status}`}>{req.status.toUpperCase()}</div>
                                </div>

                                {req.status === 'pending' && (
                                    <div className="tw-app-actions">
                                        <button className="tw-btn-reject" onClick={() => handleReject(req.id!)}>Reject</button>
                                        <button className="tw-btn-approve" onClick={() => handleApprove(req)}>Approve & Add Team</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
