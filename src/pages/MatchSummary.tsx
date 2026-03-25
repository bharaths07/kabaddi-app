import React, { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@shared/lib/supabase'
import '../features/kabaddi/components/matches/match-details.css'

interface MatchData {
  id: string
  tournament_name: string
  home_team: { name: string; short: string; color: string }
  guest_team: { name: string; short: string; color: string }
  home_score: number
  guest_score: number
  status: string
  created_at: string
}

interface PlayerStat {
  player_id: string
  player_name: string
  team_id: string
  raid_points: number
  tackle_points: number
  total_points: number
  super_10: boolean
  high_5: boolean
}

export default function MatchSummary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [match, setMatch] = useState<MatchData | null>(null)
  const [stats, setStats] = useState<PlayerStat[]>([])

  useEffect(() => {
    async function fetchData() {
      if (!id) return
      setLoading(true)
      try {
        // 1. Fetch match details
        const { data: matchData, error: matchError } = await supabase
          .from('kabaddi_matches')
          .select(`
            id, home_score, guest_score, status, created_at,
            home_team:teams!team_home_id(name, short, color),
            guest_team:teams!team_guest_id(name, short, color),
            tournament:tournaments!tournament_id(name)
          `)
          .eq('id', id)
          .single()

        if (matchError) throw matchError

        setMatch({
          id: matchData.id,
          tournament_name: (matchData.tournament as any)?.name || 'Local Tournament',
          home_team: (matchData.home_team as any) || { name: 'Home Team', short: 'HT', color: '#ef4444' },
          guest_team: (matchData.guest_team as any) || { name: 'Guest Team', short: 'GT', color: '#0ea5e9' },
          home_score: matchData.home_score || 0,
          guest_score: matchData.guest_score || 0,
          status: matchData.status,
          created_at: matchData.created_at
        })

        // 2. Fetch player stats for this match
        const { data: statsData, error: statsError } = await supabase
          .from('player_match_stats')
          .select(`
            player_id, raid_points, tackle_points, super_10, high_5,
            player:players(name, team_id)
          `)
          .eq('match_id', id)

        if (!statsError && statsData) {
          const mappedStats = statsData.map((s: any) => ({
            player_id: s.player_id,
            player_name: s.player?.name || 'Unknown Player',
            team_id: s.player?.team_id,
            raid_points: s.raid_points || 0,
            tackle_points: s.tackle_points || 0,
            total_points: (s.raid_points || 0) + (s.tackle_points || 0),
            super_10: s.super_10 || false,
            high_5: s.high_5 || false
          }))
          setStats(mappedStats.sort((a: any, b: any) => b.total_points - a.total_points))
        }
      } catch (err) {
        console.error('Error fetching match summary:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const resultText = useMemo(() => {
    if (!match) return ''
    if (match.home_score > match.guest_score) return `${match.home_team.name} won`
    if (match.guest_score > match.home_score) return `${match.guest_team.name} won`
    return 'Match Drawn'
  }, [match])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading summary...</div>
  if (!match) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Match not found</div>

  return (
    <div className="md-page" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 40 }}>
      {/* Header / Hero */}
      <div className="md-hero" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)', padding: '40px 20px', borderRadius: 0 }}>
        <div className="md-topmeta" style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
          {match.tournament_name} • {new Date(match.created_at).toLocaleDateString()}
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: 20, width: 'fit-content', margin: '16px auto', fontSize: 12, fontWeight: 900, color: '#fbbf24' }}>
          {match.status.toUpperCase()}
        </div>

        <div className="md-row" style={{ marginTop: 20 }}>
          <div className="md-team">
            <div className="md-avatar" style={{ background: match.home_team.color, width: 80, height: 80, fontSize: 28 }}>{match.home_team.short}</div>
            <div className="md-name" style={{ color: '#fff', fontSize: 20, marginTop: 12 }}>{match.home_team.name}</div>
          </div>
          
          <div className="md-score">
            <div className="md-scoreline" style={{ color: '#fff', fontSize: 52, letterSpacing: -2 }}>
              {match.home_score} <span className="md-sep" style={{ opacity: 0.3 }}>-</span> {match.guest_score}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 800, fontSize: 14, marginTop: 10 }}>
              {resultText}
            </div>
          </div>

          <div className="md-team right">
            <div className="md-avatar" style={{ background: match.guest_team.color, width: 80, height: 80, fontSize: 28 }}>{match.guest_team.short}</div>
            <div className="md-name" style={{ color: '#fff', fontSize: 20, marginTop: 12 }}>{match.guest_team.name}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Top Performers */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 900, color: '#1e293b', borderLeft: '4px solid #f97316', paddingLeft: 12 }}>Top Performers</h3>
          
          {stats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.slice(0, 5).map((p, idx) => (
                <Link to={`/players/${p.player_id}`} key={idx} className="md-lineup-card" style={{ padding: 16 }}>
                  <div className="md-lineup-avatar">
                    <div className="md-pavatar sm" style={{ background: '#6366f1', color: '#fff' }}>
                      {p.player_name.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="md-lineup-info">
                    <div className="md-lineup-name" style={{ fontSize: 16 }}>{p.player_name}</div>
                    <div className="md-lineup-role">
                      {p.raid_points} Raid • {p.tackle_points} Tackle
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: 18, color: '#1e293b' }}>{p.total_points}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8' }}>TOTAL PTS</div>
                  </div>
                  {(p.super_10 || p.high_5) && (
                    <div style={{ marginLeft: 12, background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: 8, fontSize: 10, fontWeight: 900 }}>
                      {p.super_10 ? 'SUPER 10' : 'HIGH 5'}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 14 }}>
              Detailed player stats not available for this match.
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <button 
            onClick={() => navigate(`/matches/${match.id}/live`)}
            style={{ flex: 1, height: 52, borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}
          >
            Match Timeline
          </button>
          <button 
            style={{ flex: 1, height: 52, borderRadius: 16, border: 'none', background: '#f97316', color: '#fff', fontWeight: 900, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)' }}
          >
            Share Summary
          </button>
        </div>

        <button 
          onClick={() => navigate('/')}
          style={{ height: 52, borderRadius: 16, border: 'none', background: 'transparent', color: '#64748b', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
        >
          ← Back to Dashboard
        </button>

      </div>
    </div>
  )
}
