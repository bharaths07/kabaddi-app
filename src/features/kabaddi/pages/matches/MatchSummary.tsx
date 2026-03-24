import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../../../shared/lib/supabase'
import './MatchSummary.css'

interface SummaryData {
  id: string
  home: { name: string; score: number; color: string }
  guest: { name: string; score: number; color: string }
  status: string
  period: number
  events: any[]
  winner?: string
}

export default function MatchSummary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSummary() {
      try {
        const { data: m, error } = await supabase
          .from('kabaddi_matches')
          .select(`
            id, status, home_score, guest_score, period,
            home_team:teams!team_home_id(name),
            guest_team:teams!team_guest_id(name)
          `)
          .eq('id', id)
          .single()

        if (error) throw error

        const homeName = (m.home_team as any)?.name || 'Home'
        const guestName = (m.guest_team as any)?.name || 'Guest'
        const winner = m.home_score > m.guest_score ? homeName : m.guest_score > m.home_score ? guestName : 'Draw'

        setData({
          id: m.id,
          home: { name: homeName, score: m.home_score || 0, color: '#0ea5e9' },
          guest: { name: guestName, score: m.guest_score || 0, color: '#ef4444' },
          status: m.status,
          period: m.period,
          events: [], // Fetching events would require match_events table
          winner: m.status === 'completed' ? winner : undefined
        })
      } catch (e) {
        console.error('Summary fetch error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [id])

  if (loading) return <div className="ms-loading">Loading Summary...</div>
  if (!data) return <div className="ms-error">Match not found</div>

  return (
    <div className="ms-container">
      <div className="ms-card">
        <div className="ms-header">
          <div className="ms-status-badge">{data.status.replace('_', ' ').toUpperCase()}</div>
          <h2 className="ms-title">Match Summary</h2>
        </div>

        <div className="ms-score-board">
          <div className="ms-team home">
            <div className="ms-team-name">{data.home.name}</div>
            <div className="ms-team-score" style={{ color: data.home.color }}>{data.home.score}</div>
          </div>
          <div className="ms-vs">VS</div>
          <div className="ms-team guest">
            <div className="ms-team-score" style={{ color: data.guest.color }}>{data.guest.score}</div>
            <div className="ms-team-name">{data.guest.name}</div>
          </div>
        </div>

        {data.winner && (
          <div className="ms-winner-banner">
            🏆 {data.winner === 'Draw' ? "It's a Draw!" : `${data.winner} Wins!`}
          </div>
        )}

        <div className="ms-actions">
          <Link to="/" className="ms-btn primary">Go Home</Link>
          <Link to="/matches" className="ms-btn secondary">View All Matches</Link>
        </div>
      </div>
    </div>
  )
}
