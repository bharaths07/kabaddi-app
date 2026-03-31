import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './rankings.css'

type TeamStanding = {
  rank: number
  team: string
  matches: number
  wins: number
  losses: number
  draws: number
  points: number
  scoreDiff: number
  color: string
}

export default function TeamLeaderboardsPage() {
  const [tournament, setTournament] = useState('all')
  const [season, setSeason] = useState('KPL 2026')
  const [teamSort, setTeamSort] = useState<'points' | 'winrate' | 'scoreDiff'>('points')
  const [loading, setLoading] = useState(true)

  const [teamStandings] = useState<TeamStanding[]>([
    { rank: 1, team: 'Dabangg Delhi', matches: 10, wins: 8, losses: 2, draws: 0, points: 0, scoreDiff: 58, color: '#ef4444' },
    { rank: 2, team: 'Puneri Paltan', matches: 10, wins: 7, losses: 3, draws: 0, points: 0, scoreDiff: 41, color: '#f97316' },
    { rank: 3, team: 'Wolves', matches: 10, wins: 6, losses: 3, draws: 1, points: 0, scoreDiff: 24, color: '#64748b' },
    { rank: 4, team: 'Falcons', matches: 10, wins: 5, losses: 4, draws: 1, points: 0, scoreDiff: 12, color: '#0ea5e9' },
    { rank: 5, team: 'Spartans', matches: 10, wins: 3, losses: 6, draws: 1, points: 0, scoreDiff: -8, color: '#8b5cf6' }
  ])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])

  const computePoints = (t: TeamStanding) => (t.wins * 5) + (t.draws * 3)
  
  const processedTeams = useMemo(() => {
    const rows = teamStandings.map(t => ({ ...t, points: computePoints(t) }))
    const sorted = rows.sort((a, b) => {
      if (teamSort === 'points') return (b.points - a.points) || (b.scoreDiff - a.scoreDiff)
      if (teamSort === 'winrate') return (b.wins / b.matches) - (a.wins / a.matches)
      if (teamSort === 'scoreDiff') return b.scoreDiff - a.scoreDiff
      return 0
    })
    return sorted.map((t, i) => ({ ...t, rank: i + 1 }))
  }, [teamStandings, teamSort])

  function getForm(team: string) {
    if (team === 'Dabangg Delhi') return ['w','w','l','w','w']
    if (team === 'Puneri Paltan') return ['w','l','w','w','l']
    return ['w','l','d','w', 'l']
  }

  return (
    <div className="pk-rankings-container">
      <div className="pk-filters-bar">
        <div style={{ display: 'flex', gap: 16 }}>
          <div className="lb-filter">
            <label className="lb-label">Tournament</label>
            <select className="lb-select" value={tournament} onChange={e => setTournament(e.target.value)}>
              <option value="all">All Tournaments</option>
              <option value="spring-cup">Spring Cup</option>
            </select>
          </div>
          <div className="lb-filter">
            <label className="lb-label">Sort By</label>
            <select className="lb-select" value={teamSort} onChange={e => setTeamSort(e.target.value as any)}>
              <option value="points">Match Points</option>
              <option value="winrate">Win Rate</option>
              <option value="scoreDiff">Score Diff</option>
            </select>
          </div>
        </div>
        <div className="pk-header-badge">
          🏆 LIVE STANDINGS • {season}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Updating standings...</div>
      ) : (
        <div className="pk-rank-list">
          {processedTeams.map(s => (
            <div 
              key={s.team} 
              className={`pk-team-strip rank-${s.rank <= 3 ? s.rank : 'other'}`}
              style={{ '--strip-color': s.color, '--strip-color-rgba': `${s.color}44` } as any}
            >
              <div className="pk-strip-accent" />
              <div className="pk-rank-huge">{s.rank}</div>
              
              <div className="pk-team-info-box">
                <div className="pk-team-logo-circle">
                  {s.team.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="pk-team-name-main">{s.team}</div>
                  <div className="pk-form-row">
                    {getForm(s.team).map((f, i) => (
                      <div key={i} className={`pk-form-dot ${f}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pk-stats-chips">
                <div className="pk-stat-chip">
                  <div className="pk-stat-chip__val">{s.matches}</div>
                  <div className="pk-stat-chip__label">PLD</div>
                </div>
                <div className="pk-stat-chip">
                  <div className="pk-stat-chip__val">{s.wins}</div>
                  <div className="pk-stat-chip__label">WON</div>
                </div>
                <div className="pk-stat-chip">
                  <div className="pk-stat-chip__val">{s.losses}</div>
                  <div className="pk-stat-chip__label">LST</div>
                </div>
                <div className="pk-stat-chip">
                  <div className="pk-stat-chip__val" style={{ color: s.scoreDiff >= 0 ? '#10b981' : '#ef4444' }}>
                    {s.scoreDiff > 0 ? `+${s.scoreDiff}` : s.scoreDiff}
                  </div>
                  <div className="pk-stat-chip__label">DIFF</div>
                </div>
              </div>

              <div className="pk-points-box">
                <div className="pk-points-val">{s.points}</div>
                <div className="pk-points-label">PTS</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
