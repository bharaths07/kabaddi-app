import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import KabaddiLiveScorer from '../components/scorers/KabaddiLiveScorer'
import { getCurrentMatch } from '../state/matchStore'
import { useAuth } from '../../../shared/context/AuthContext'
import { useRole } from '../../../shared/hooks/useRole'
import { supabase } from '../../../shared/lib/supabase'

export default function MatchScoringPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [matchData, setMatchDetails] = useState<any>(null)

  useEffect(() => {
    async function loadMatch() {
      setLoading(true)
      
      // 1. Try to get from local state first (for immediate navigation after creation)
      const m = getCurrentMatch()
      if (m && m.id === id) {
        setMatchDetails({
          id: m.id,
          owner_id: user?.id || 'local_owner',
          homeTeam: { 
            name: m.playersA?.[0]?.name ? (m.teamAId || 'Team A') : 'Home Team', 
            squad: m.playersA?.map(p => ({ id: p.id, name: p.name, jerseyNumber: p.jerseyNumber, role: p.isCaptain ? 'captain' : 'player' })) 
          },
          guestTeam: { 
            name: m.playersB?.[0]?.name ? (m.teamBId || 'Team B') : 'Guest Team', 
            squad: m.playersB?.map(p => ({ id: p.id, name: p.name, jerseyNumber: p.jerseyNumber, role: p.isCaptain ? 'captain' : 'player' })) 
          },
          periodMins: m.config?.halfDurationMinutes || 20
        })
        setLoading(false)
        return
      }

      // 2. Fetch from Supabase
      const { data: dbMatch, error } = await supabase
        .from('kabaddi_matches')
        .select(`
          id, status, home_score, guest_score, period, created_by, owner_id,
          home_team:teams!team_home_id(id, name, color, players(*)),
          guest_team:teams!team_guest_id(id, name, color, players(*))
        `)
        .eq('id', id)
        .single()

      if (dbMatch && !error) {
        setMatchDetails({
          id: dbMatch.id,
          owner_id: dbMatch.owner_id || dbMatch.created_by,
          homeTeam: {
            name: dbMatch.home_team?.name || dbMatch.home_team_name,
            color: dbMatch.home_team?.color || '#ef4444',
            squad: (dbMatch.home_team?.players || []).map((p: any) => ({
              id: p.id,
              name: p.name,
              jerseyNumber: p.number || p.jersey_number || 0,
              role: p.role || 'player'
            }))
          },
          guestTeam: {
            name: dbMatch.guest_team?.name || dbMatch.guest_team_name,
            color: dbMatch.guest_team?.color || '#0ea5e9',
            squad: (dbMatch.guest_team?.players || []).map((p: any) => ({
              id: p.id,
              name: p.name,
              jerseyNumber: p.number || p.jersey_number || 0,
              role: p.role || 'player'
            }))
          },
          periodMins: 20 // Default or from tournament config
        })
      }
      setLoading(false)
    }

    if (id) loadMatch()
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
