import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../features/kabaddi/pages/leaderboards.css'

type TeamStanding = {
  rank: number
  team: string
  matches: number
  wins: number
  losses: number
  draws: number
  points: number
  scoreDiff?: number
  narrowLosses?: number
  color?: string
}

export default function TeamLeaderboardsPage() {
  const [tournament, setTournament] = useState('all')
  const [season, setSeason] = useState('KPL 2026')
  const [time, setTime] = useState<'season' | 'month' | 'week'>('season')
  const [narrowLossBonus, setNarrowLossBonus] = useState(true)
  const [teamSort, setTeamSort] = useState<'points' | 'winrate' | 'wins' | 'scoreDiff' | 'streak' | 'avg'>('points')
  const [loading, setLoading] = useState(true)

  const [teamStandings, setTeamStandings] = useState<TeamStanding[]>([
    { rank: 1, team: 'Dabangg Delhi', matches: 10, wins: 8, losses: 2, draws: 0, points: 0, scoreDiff: 58, narrowLosses: 1, color: '#ef4444' },
    { rank: 2, team: 'Puneri Paltan', matches: 10, wins: 7, losses: 3, draws: 0, points: 0, scoreDiff: 41, narrowLosses: 0, color: '#f97316' },
    { rank: 3, team: 'Wolves', matches: 10, wins: 6, losses: 3, draws: 1, points: 0, scoreDiff: 24, narrowLosses: 1, color: '#64748b' },
    { rank: 4, team: 'Falcons', matches: 10, wins: 5, losses: 4, draws: 1, points: 0, scoreDiff: 12, narrowLosses: 0, color: '#0ea5e9' },
    { rank: 5, team: 'Spartans', matches: 10, wins: 3, losses: 6, draws: 1, points: 0, scoreDiff: -8, narrowLosses: 1, color: '#8b5cf6' }
  ])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])

  const computePoints = (t: TeamStanding) => (t.wins * 5) + (t.draws * 3) + (t.losses * 0) + (narrowLossBonus ? (t.narrowLosses || 0) : 0)
  
  const processedTeams = useMemo(() => {
    const rows = teamStandings.map(t => ({ ...t, points: computePoints(t) }))
    const sorted = rows.sort((a, b) => {
      if (teamSort === 'points') return (b.points - a.points) || ((b.scoreDiff || 0) - (a.scoreDiff || 0))
      if (teamSort === 'winrate') return ((b.wins / b.matches) - (a.wins / a.matches))
      if (teamSort === 'scoreDiff') return ((b.scoreDiff || 0) - (a.scoreDiff || 0))
      return 0
    })
    return sorted.map((t, i) => ({ ...t, rank: i + 1 }))
  }, [teamStandings, narrowLossBonus, teamSort])

  return (
    <>
      <div className="lb-filters">
        <div className="lb-filter">
          <label className="lb-label">Tournament</label>
          <select className="lb-select" value={tournament} onChange={e => setTournament(e.target.value)}>
            <option value="all">All Tournaments</option>
            <option value="spring-cup">Spring Cup</option>
            <option value="monsoon-league">Monsoon League</option>
          </select>
        </div>
        <div className="lb-filter">
          <label className="lb-label">Season</label>
          <select className="lb-select" value={season} onChange={e => setSeason(e.target.value)}>
            <option value="KPL 2026">KPL 2026</option>
            <option value="KPL 2025">KPL 2025</option>
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
        <div className="lb-filter">
          <label className="lb-label">Narrow Loss Bonus</label>
          <select className="lb-select" value={narrowLossBonus ? 'on' : 'off'} onChange={e => setNarrowLossBonus(e.target.value === 'on')}>
            <option value="on">Enabled</option>
            <option value="off">Disabled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="lb-table">
          <div className="lb-row teams" style={{ opacity: 0.5 }}>
            <div className="lb-cell">Loading team standings...</div>
          </div>
        </div>
      ) : (
        <div className="lb-table">
          <div className="lb-row lb-head teams">
            <div className="lb-cell rank">#</div>
            <div className="lb-cell team">Team</div>
            <div className="lb-cell">Played</div>
            <div className="lb-cell">Won</div>
            <div className="lb-cell">Lost</div>
            <div className="lb-cell">Tie</div>
            <div className="lb-cell">
              Points
              <span className="lb-points-info">Win=5, Tie=3</span>
            </div>
            <div className="lb-cell">Score Diff</div>
          </div>
          {processedTeams.map(s => (
            <div key={s.rank} className="lb-row teams">
              <div className="lb-cell rank">{s.rank}</div>
              <div className="lb-cell team">
                <div className="lb-team-cell">
                  <div className="lb-team-logo" style={{ background: s.color || '#64748b' }}>
                    {s.team.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <Link to={`/teams/${s.team.toLowerCase().replace(/\s+/g, '-')}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {s.team}
                  </Link>
                </div>
              </div>
              <div className="lb-cell">{s.matches}</div>
              <div className="lb-cell">{s.wins}</div>
              <div className="lb-cell">{s.losses}</div>
              <div className="lb-cell">{s.draws}</div>
              <div className="lb-cell" style={{ fontWeight: 900, color: 'var(--color-sky)' }}>{s.points}</div>
              <div className="lb-cell">{(s.scoreDiff ?? 0) >= 0 ? `+${s.scoreDiff}` : s.scoreDiff}</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
