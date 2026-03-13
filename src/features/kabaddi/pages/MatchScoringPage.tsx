import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import KabaddiLiveScorer from '../components/scorers/KabaddiLiveScorer'
import { getMatchDetails } from '../../shared/services/matchService'

export default function MatchScoringPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [matchData, setMatchDetails] = useState<any>(null)

  useEffect(() => {
    // In a real app, fetch real match data
    // For now, we use the ID to set up the scorer
    setMatchDetails({
      id: id,
      homeTeam: { name: 'Home Team', short: 'HT', color: '#ef4444' },
      guestTeam: { name: 'Guest Team', short: 'GT', color: '#0ea5e9' },
      periodMins: 20
    })
    setLoading(false)
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
