import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import KabaddiLiveScorer from '../components/scorers/KabaddiLiveScorer'
import { getCurrentMatch } from '../state/matchStore'
import { useAuth } from '../../../shared/context/AuthContext'
import { useRole } from '../../../shared/hooks/useRole'

export default function MatchScoringPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [matchData, setMatchDetails] = useState<any>(null)

  useEffect(() => {
    // 1. Try to get real-time match from local state (match creation flow)
    const m = getCurrentMatch()
    
    if (m && m.id === id) {
      setMatchDetails({
        id: m.id,
        owner_id: user?.id, // Creators of local drafts are implicitly the owner
        scorer_id: m.scorer_id,
        tournament_organizer_id: m.tournament_organizer_id,
        homeTeam: { 
          name: m.teamAId || 'Team A', 
          short: 'A', 
          color: '#ef4444',
          squad: m.playersA?.map(p => ({ ...p, role: p.isCaptain ? 'raider' : 'defender' })) 
        },
        guestTeam: { 
          name: m.teamBId || 'Team B', 
          short: 'B', 
          color: '#0ea5e9',
          squad: m.playersB?.map(p => ({ ...p, role: p.isCaptain ? 'raider' : 'defender' })) 
        },
        periodMins: m.config?.halfDurationMinutes || 20
      })
      setLoading(false)
    } else {
      // 2. Fallback: Mock data (In a real app, fetch from Supabase by ID)
      // Since this is a fallback mock from a shareable link, it has no owner, meaning 'viewer' role!
      setMatchDetails({
        id: id,
        owner_id: 'mock_owner_id_999', 
        homeTeam: { name: 'Home Team', short: 'HT', color: '#ef4444' },
        guestTeam: { name: 'Guest Team', short: 'GT', color: '#0ea5e9' },
        periodMins: 20
      })
      setLoading(false)
    }
  }, [id, user?.id])

  const { canScore } = useRole(matchData)

  if (loading) return <div style={{ padding: 40, color: '#fff', background: '#0A1628', minHeight: '100vh' }}>Loading Scorer...</div>

  if (!canScore && matchData) {
    // Redirect normal users to the Match Center / Viewer screens!
    return <Navigate to={`/matches/${id}`} replace />
  }

  return (
    <div style={{ background: '#0A1628', minHeight: '100vh' }}>
      <KabaddiLiveScorer 
        matchId={id}
        homeTeam={matchData.homeTeam}
        guestTeam={matchData.guestTeam}
        periodMins={matchData.periodMins}
      />
    </div>
  )
}
