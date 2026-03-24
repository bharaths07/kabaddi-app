import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import KabaddiLiveScorer from '../components/scorers/KabaddiLiveScorer'
import { getCurrentMatch } from '../state/matchStore'

export default function MatchScoringPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [matchData, setMatchDetails] = useState<any>(null)

  useEffect(() => {
    // 1. Try to get real-time match from local state (match creation flow)
    const m = getCurrentMatch()
    
    if (m && m.id === id) {
      setMatchDetails({
        id: m.id,
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
      setMatchDetails({
        id: id,
        homeTeam: { name: 'Home Team', short: 'HT', color: '#ef4444' },
        guestTeam: { name: 'Guest Team', short: 'GT', color: '#0ea5e9' },
        periodMins: 20
      })
      setLoading(false)
    }
  }, [id])

  if (loading) return <div style={{ padding: 40, color: '#fff', background: '#0c1832', minHeight: '100vh' }}>Loading Scorer...</div>

  return (
    <div style={{ background: '#0c1832', minHeight: '100vh' }}>
      <KabaddiLiveScorer 
        matchId={id}
        homeTeam={matchData.homeTeam}
        guestTeam={matchData.guestTeam}
        periodMins={matchData.periodMins}
      />
    </div>
  )
}
