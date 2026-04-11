import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchGlobalStandings, TeamStandingResult } from '../../shared/services/standingsService'
import './rankings.css'

type TeamStanding = TeamStandingResult & { rank: number };

export default function TeamLeaderboardsPage() {
  const [tournament, setTournament] = useState('all')
  const [teamSort, setTeamSort] = useState<'points' | 'winrate' | 'scoreDiff'>('points')
  const [loading, setLoading] = useState(true)
  const [teamStandings, setTeamStandings] = useState<TeamStandingResult[]>([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await fetchGlobalStandings(tournament === 'all' ? undefined : tournament)
      setTeamStandings(data)
      setLoading(false)
    }
    load()
  }, [tournament])

  const computePoints = (t: TeamStanding) => (t.wins * 5) + (t.draws * 3)

  const processedTeams = useMemo(() => {
    const sorted = [...teamStandings].sort((a, b) => {
      if (teamSort === 'points') return (b.points - a.points) || (b.scoreDiff - a.scoreDiff)
      if (teamSort === 'winrate') return (b.wins / b.matches) - (a.wins / a.matches)
      if (teamSort === 'scoreDiff') return b.scoreDiff - a.scoreDiff
      return 0
    })
    return sorted.map((t, i) => ({ ...t, rank: i + 1 }))
  }, [teamStandings, teamSort])

  function getForm(team: string) {
    if (team === 'Dabangg Delhi') return ['w', 'w', 'l', 'w', 'w']
    if (team === 'Puneri Paltan') return ['w', 'l', 'w', 'w', 'l']
    return ['w', 'l', 'd', 'w', 'l']
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
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Updating standings...</div>
      ) : (
        <div className="pk-rank-list">
          {processedTeams.map(s => (
            <Link
              key={s.id}
              to={`/teams/${s.id}`}
              className={`pk-team-strip rank-${s.rank <= 3 ? s.rank : 'other'}`}
              style={{ '--strip-color': s.color, '--strip-color-rgba': `${s.color}44`, display: 'flex', textDecoration: 'none' } as any}
            >
              <div className="pk-strip-accent" />
              <div className="pk-rank-huge">{s.rank}</div>

              <div className="pk-team-info-box">
                <div className="pk-team-logo-circle">
                  {s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="pk-team-name-main">{s.name}</div>
                  <div className="pk-form-row">
                    {getForm(s.name).map((f, i) => (
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
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
