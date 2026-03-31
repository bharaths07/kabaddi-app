import React, { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@shared/lib/supabase'
import './match-summary.css'

interface MatchData {
  id: string
  tournament_name: string
  home_team: { id: string; name: string; short: string; color: string }
  guest_team: { id: string; name: string; short: string; color: string }
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
        // 1. Try kabaddi_matches first
        const { data: matchData, error: matchError } = await supabase
          .from('kabaddi_matches')
          .select(`
            id, home_score, guest_score, status, created_at,
            home_team:teams!team_home_id(id, name, short, color),
            guest_team:teams!team_guest_id(id, name, short, color),
            tournament:tournaments!tournament_id(name)
          `)
          .eq('id', id)
          .maybeSingle()

        if (matchData) {
          setMatch({
            id: matchData.id,
            tournament_name: (matchData.tournament as any)?.name || 'Standalone Match',
            home_team: (matchData.home_team as any),
            guest_team: (matchData.guest_team as any),
            home_score: matchData.home_score || 0,
            guest_score: matchData.guest_score || 0,
            status: matchData.status,
            created_at: matchData.created_at
          })
        } else {
          // 2. Try fixtures (Tournament)
          const { data: fixture } = await supabase
            .from('fixtures')
            .select(`
              id, status, scheduled_at, result,
              home:teams!team_home_id(id, name, short, color),
              guest:teams!team_guest_id(id, name, short, color),
              tournaments(name)
            `)
            .eq('id', id)
            .maybeSingle();
          
          if (fixture) {
            const scores = fixture.result?.split('-') || [0, 0];
            setMatch({
              id: fixture.id,
              tournament_name: fixture.tournaments?.name || 'Tournament',
              home_team: (fixture.home as any),
              guest_team: (fixture.guest as any),
              home_score: parseInt(scores[0]) || 0,
              guest_score: parseInt(scores[1]) || 0,
              status: fixture.status,
              created_at: fixture.scheduled_at
            });
          }
        }

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
          setStats(mappedStats.sort((a: PlayerStat, b: PlayerStat) => b.total_points - a.total_points))
        }
      } catch (err) {
        console.error('Error fetching match summary:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const mvp = useMemo(() => stats.length > 0 ? stats[0] : null, [stats])

  const teamStats = useMemo(() => {
    if (!match || stats.length === 0) return null
    return {
      home: {
        raid: stats.filter(s => s.team_id === match.home_team.id).reduce((acc, s) => acc + s.raid_points, 0),
        tackle: stats.filter(s => s.team_id === match.home_team.id).reduce((acc, s) => acc + s.tackle_points, 0),
      },
      guest: {
        raid: stats.filter(s => s.team_id === match.guest_team.id).reduce((acc, s) => acc + s.raid_points, 0),
        tackle: stats.filter(s => s.team_id === match.guest_team.id).reduce((acc, s) => acc + s.tackle_points, 0),
      }
    }
  }, [match, stats])

  if (loading) return <div className="ms-page"><div className="hp-empty-state">Loading summary...</div></div>
  if (!match) return <div className="ms-page"><div className="hp-empty-state">Match not found</div></div>

  const isHomeWinner = match.home_score > match.guest_score
  const isGuestWinner = match.guest_score > match.home_score
  const isDraw = match.home_score === match.guest_score

  return (
    <div className="ms-page">
      <div className="ms-hero">
        <div className="ms-result-badge">Match Finished</div>
        <div className="ms-score-row">
          <div className="ms-team-box">
            <div className="ms-avatar" style={{ background: match.home_team.color }}>{match.home_team.short}</div>
            <div className="ms-team-name">{match.home_team.name}</div>
          </div>
          <div className="ms-score-display">
            <div className="ms-score-numbers">
              <span>{match.home_score}</span>
              <span className="ms-score-sep">-</span>
              <span>{match.guest_score}</span>
            </div>
            <div className="ms-winner-text" style={{ color: isDraw ? '#94a3b8' : (isHomeWinner ? '#4ade80' : '#4ade80') }}>
              {isDraw ? 'Match Drawn' : `🏆 ${isHomeWinner ? match.home_team.name : match.guest_team.name} Wins!`}
            </div>
          </div>
          <div className="ms-team-box">
            <div className="ms-avatar" style={{ background: match.guest_team.color }}>{match.guest_team.short}</div>
            <div className="ms-team-name">{match.guest_team.name}</div>
          </div>
        </div>
      </div>

      <div className="ms-container">
        {mvp && (
          <div className="ms-card ms-mvp-card">
            <div className="ms-mvp-avatar">👑</div>
            <div className="ms-mvp-info">
              <h4>Top Performer</h4>
              <h2>{mvp.player_name}</h2>
              <p>{mvp.total_points} Total Points • {mvp.raid_points} Raid • {mvp.tackle_points} Tackle</p>
            </div>
          </div>
        )}

        <div className="ms-card">
          <div className="ms-section-title">📊 TEAM PERFORMANCE</div>
          {teamStats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="ms-stats-grid">
                <div className="stat-val">{teamStats.home.raid}</div>
                <div className="stat-label">RAID POINTS</div>
                <div className="stat-val">{teamStats.guest.raid}</div>
              </div>
              <div className="ms-stats-grid">
                <div className="stat-val">{teamStats.home.tackle}</div>
                <div className="stat-label">TACKLE POINTS</div>
                <div className="stat-val">{teamStats.guest.tackle}</div>
              </div>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Standard team stats not available.</p>
          )}
        </div>

        <div className="ms-card">
          <div className="ms-section-title">👤 PLAYER STATISTICS</div>
          <div className="ms-player-list">
            {stats.length > 0 ? stats.map((s, idx) => (
              <div key={s.player_id} className="ms-player-row">
                <div className="p-rank">#{idx + 1}</div>
                <div className="p-info">
                  <div className="p-name">{s.player_name}</div>
                  <div className="p-details">
                    {s.raid_points} Raid • {s.tackle_points} Tackle
                    {s.super_10 && <span style={{ color: '#f59e0b', fontWeight: 800, marginLeft: 8 }}>SUPER 10</span>}
                    {s.high_5 && <span style={{ color: '#f59e0b', fontWeight: 800, marginLeft: 8 }}>HIGH 5</span>}
                  </div>
                </div>
                <div className="p-score">{s.total_points}</div>
              </div>
            )) : (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No player data recorded.</p>
            )}
          </div>
        </div>

        <div className="ms-actions">
          <button className="btn-ms btn-ms-secondary" onClick={() => navigate('/home')}>Back to Home</button>
          <button className="btn-ms btn-ms-primary" onClick={() => window.print()}>Share Summary</button>
        </div>
      </div>
    </div>
  )
}
