import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../../../shared/lib/supabase'
import './MatchSummary.css'

interface SummaryData {
  id: string
  home: { id: string; name: string; score: number; color: string; city: string }
  guest: { id: string; name: string; score: number; color: string; city: string }
  status: string
  period: number
  winner?: string
  topPerformers: any[]
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
            home_team:teams!team_home_id(id, name, color, city),
            guest_team:teams!team_guest_id(id, name, color, city)
          `)
          .eq('id', id)
          .single()

        if (error) throw error

        const home = m.home_team as any
        const guest = m.guest_team as any
        const homeName = home?.name || 'Home'
        const guestName = guest?.name || 'Guest'
        const winner = m.home_score > m.guest_score ? homeName : m.guest_score > m.home_score ? guestName : 'Draw'

        // Fetch player stats for "Star of the Match"
        const { data: stats } = await supabase
          .from('player_match_stats')
          .select('*, players(name)')
          .eq('match_id', id)
          .order('total_points', { ascending: false })
          .limit(3)

        setData({
          id: m.id,
          home: { id: home.id, name: homeName, score: m.home_score || 0, color: home.color || '#0ea5e9', city: home.city || '' },
          guest: { id: guest.id, name: guestName, score: m.guest_score || 0, color: guest.color || '#ef4444', city: guest.city || '' },
          status: m.status,
          period: m.period,
          winner: m.status === 'completed' ? winner : undefined,
          topPerformers: (stats || []).map((s: any) => ({
            name: s.players?.name || 'Unknown',
            raidPts: s.raid_points,
            tacklePts: s.tackle_points,
            total: s.total_points
          }))
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

  const homePts = data.home.score > data.guest.score ? 2 : data.home.score === data.guest.score ? 1 : 0
  const guestPts = data.guest.score > data.home.score ? 2 : data.home.score === data.guest.score ? 1 : 0

  return (
    <div className="ms-container">
      <div className="ms-glow home" style={{ background: data.home.color }} />
      <div className="ms-glow guest" style={{ background: data.guest.color }} />

      <div className="ms-card glass">
        <div className="ms-header">
          <div className="ms-status-chip">{data.status.toUpperCase()}</div>
          <h1 className="ms-title">Match Report</h1>
        </div>

        <div className="ms-scoreboard-premium">
          <div className="ms-team-panel">
            <div className="ms-team-avatar" style={{ background: data.home.color }}>{data.home.name.slice(0, 2).toUpperCase()}</div>
            <div className="ms-team-info">
              <div className="ms-team-name-lg">{data.home.name}</div>
              <div className="ms-league-pts">+{homePts} LEAGUE POINTS</div>
            </div>
            <div className="ms-score-lg" style={{ color: data.home.color }}>{data.home.score}</div>
          </div>

          <div className="ms-divider-vs">
             <div className="ms-line" />
             <div className="ms-vs-badge">VS</div>
             <div className="ms-line" />
          </div>

          <div className="ms-team-panel reverse">
            <div className="ms-score-lg" style={{ color: data.guest.color }}>{data.guest.score}</div>
            <div className="ms-team-info right">
              <div className="ms-team-name-lg">{data.guest.name}</div>
              <div className="ms-league-pts">+{guestPts} LEAGUE POINTS</div>
            </div>
            <div className="ms-team-avatar" style={{ background: data.guest.color }}>{data.guest.name.slice(0, 2).toUpperCase()}</div>
          </div>
        </div>

        {data.winner && (
          <div className={`ms-winner-card ${data.winner === 'Draw' ? 'is-draw' : ''}`}>
             <div className="ms-winner-label">{data.winner === 'Draw' ? '🤝 MATCH TIED' : '🏆 MATCH WINNER'}</div>
             <div className="ms-winner-name">{data.winner === 'Draw' ? 'Honours Even' : data.winner}</div>
          </div>
        )}

        {data.topPerformers.length > 0 && (
          <div className="ms-stats-preview">
            <div className="ms-section-label">🌟 STAR PERFORMERS</div>
            <div className="ms-stars-list">
              {data.topPerformers.map((p, i) => (
                <div key={i} className="ms-star-item">
                   <div className="ms-star-info">
                     <div className="ms-star-name">{p.name}</div>
                     <div className="ms-star-detail">{p.raidPts} R | {p.tacklePts} T</div>
                   </div>
                   <div className="ms-star-pts">{p.total} <span>PTS</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="ms-actions-grid">
          <Link to="/" className="ms-btn-pro primary">FINAL MATCH CENTER</Link>
          <Link to="/matches" className="ms-btn-pro secondary">TOURNAMENT FIXTURES</Link>
        </div>
      </div>
    </div>
  )
}
