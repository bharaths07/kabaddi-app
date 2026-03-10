import React, { useEffect, useMemo, useState } from 'react'
import './leaderboards.css'

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
}

export default function TeamLeaderboards() {
  const [tournament, setTournament] = useState('all')
  const [season, setSeason] = useState('KPL 2026')
  const [time, setTime] = useState<'season' | 'month' | 'week'>('season')
  const [narrowLossBonus, setNarrowLossBonus] = useState(true)
  const [teamSort, setTeamSort] = useState<'points' | 'winrate' | 'wins' | 'scoreDiff' | 'streak' | 'avg'>('points')
  const [live, setLive] = useState(false)
  const [loading, setLoading] = useState(true)

  const [teamStandings, setTeamStandings] = useState<TeamStanding[]>([
    { rank: 1, team: 'Dabangg Delhi', matches: 10, wins: 8, losses: 2, draws: 0, points: 0, scoreDiff: 58, narrowLosses: 1 },
    { rank: 2, team: 'Puneri Paltan', matches: 10, wins: 7, losses: 3, draws: 0, points: 0, scoreDiff: 41, narrowLosses: 0 },
    { rank: 3, team: 'Wolves', matches: 10, wins: 6, losses: 3, draws: 1, points: 0, scoreDiff: 24, narrowLosses: 1 },
    { rank: 4, team: 'Falcons', matches: 10, wins: 5, losses: 4, draws: 1, points: 0, scoreDiff: 12, narrowLosses: 0 },
    { rank: 5, team: 'Spartans', matches: 10, wins: 3, losses: 6, draws: 1, points: 0, scoreDiff: -8, narrowLosses: 1 }
  ])

  useEffect(() => {
    if (season === 'KPL 2025') {
      setTeamStandings([
        { rank: 1, team: 'Puneri Paltan', matches: 12, wins: 9, losses: 3, draws: 0, points: 0, scoreDiff: 66, narrowLosses: 1 },
        { rank: 2, team: 'Dabangg Delhi', matches: 12, wins: 8, losses: 4, draws: 0, points: 0, scoreDiff: 44, narrowLosses: 0 },
        { rank: 3, team: 'Falcons', matches: 12, wins: 7, losses: 4, draws: 1, points: 0, scoreDiff: 22, narrowLosses: 1 },
        { rank: 4, team: 'Wolves', matches: 12, wins: 6, losses: 5, draws: 1, points: 0, scoreDiff: 10, narrowLosses: 2 },
        { rank: 5, team: 'Spartans', matches: 12, wins: 4, losses: 7, draws: 1, points: 0, scoreDiff: -14, narrowLosses: 1 }
      ])
    } else if (season === 'KPL 2024') {
      setTeamStandings([
        { rank: 1, team: 'Wolves', matches: 10, wins: 7, losses: 2, draws: 1, points: 0, scoreDiff: 36, narrowLosses: 0 },
        { rank: 2, team: 'Falcons', matches: 10, wins: 7, losses: 3, draws: 0, points: 0, scoreDiff: 28, narrowLosses: 1 },
        { rank: 3, team: 'Puneri Paltan', matches: 10, wins: 6, losses: 4, draws: 0, points: 0, scoreDiff: 16, narrowLosses: 1 },
        { rank: 4, team: 'Dabangg Delhi', matches: 10, wins: 5, losses: 4, draws: 1, points: 0, scoreDiff: 4, narrowLosses: 1 },
        { rank: 5, team: 'Spartans', matches: 10, wins: 3, losses: 6, draws: 1, points: 0, scoreDiff: -12, narrowLosses: 2 }
      ])
    } else {
      setTeamStandings([
        { rank: 1, team: 'Dabangg Delhi', matches: 10, wins: 8, losses: 2, draws: 0, points: 0, scoreDiff: 58, narrowLosses: 1 },
        { rank: 2, team: 'Puneri Paltan', matches: 10, wins: 7, losses: 3, draws: 0, points: 0, scoreDiff: 41, narrowLosses: 0 },
        { rank: 3, team: 'Wolves', matches: 10, wins: 6, losses: 3, draws: 1, points: 0, scoreDiff: 24, narrowLosses: 1 },
        { rank: 4, team: 'Falcons', matches: 10, wins: 5, losses: 4, draws: 1, points: 0, scoreDiff: 12, narrowLosses: 0 },
        { rank: 5, team: 'Spartans', matches: 10, wins: 3, losses: 6, draws: 1, points: 0, scoreDiff: -8, narrowLosses: 1 }
      ])
    }
  }, [season])

  useEffect(() => {
    let t: any
    if (live) {
      t = setInterval(() => {
        setTeamStandings(prev => {
          const idx = Math.floor(Math.random() * prev.length)
          const delta = Math.random() > 0.5 ? 1 : -1
          return prev.map((row, i) => i === idx ? { ...row, scoreDiff: (row.scoreDiff || 0) + delta } : row)
        })
      }, 4000)
    }
    return () => { if (t) clearInterval(t) }
  }, [live])

  const computePoints = (t: TeamStanding) => (t.wins * 5) + (t.draws * 3) + (t.losses * 0) + (narrowLossBonus ? (t.narrowLosses || 0) : 0)
  const processedTeams = useMemo(() => {
    const rows = teamStandings.map(t => ({ ...t, points: computePoints(t) }))
    const sorted = rows.sort((a, b) => {
      if (teamSort === 'points') return (b.points - a.points) || ((b.scoreDiff || 0) - (a.scoreDiff || 0))
      if (teamSort === 'winrate') return ((b.wins / b.matches) - (a.wins / a.matches))
      if (teamSort === 'wins') return (b.wins - a.wins)
      if (teamSort === 'scoreDiff') return ((b.scoreDiff || 0) - (a.scoreDiff || 0))
      if (teamSort === 'streak') return ((b.narrowLosses || 0) - (a.narrowLosses || 0))
      if (teamSort === 'avg') return ((b.points / b.matches) - (a.points / a.matches))
      return 0
    })
    return sorted.map((t, i) => ({ ...t, rank: i + 1 }))
  }, [teamStandings, narrowLossBonus, teamSort])

  const [lastTeams, setLastTeams] = useState<TeamStanding[]>([])
  useEffect(() => { setLastTeams(processedTeams) }, [processedTeams])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="lb-page">
      <div className="lb-header">
        <h1 className="lb-title">Team Leaderboard</h1>
        <div className="lb-subtitle">Wins, win rate, points difference</div>
      </div>

      <div className="lb-filters">
        <div className="lb-filter">
          <label className="lb-label">Tournament</label>
          <select className="lb-select" value={tournament} onChange={e => setTournament(e.target.value)} aria-label="Select Tournament">
            <option value="all">All</option>
            <option value="spring-cup">Spring Kabaddi Cup</option>
            <option value="monsoon-league">Monsoon League</option>
          </select>
        </div>
        <div className="lb-filter">
          <label className="lb-label">Season</label>
          <select className="lb-select" value={season} onChange={e => setSeason(e.target.value)} aria-label="Select Season">
            <option value="KPL 2026">KPL 2026</option>
            <option value="KPL 2025">KPL 2025</option>
            <option value="KPL 2024">KPL 2024</option>
          </select>
        </div>
        <div className="lb-filter">
          <label className="lb-label">Time</label>
          <select className="lb-select" value={time} onChange={e => setTime(e.target.value as any)} aria-label="Select Timeframe">
            <option value="season">Season</option>
            <option value="month">Month</option>
            <option value="week">Week</option>
          </select>
        </div>
        <div className="lb-filter">
          <label className="lb-label">Narrow loss bonus</label>
          <select className="lb-select" value={narrowLossBonus ? 'on' : 'off'} onChange={e => setNarrowLossBonus(e.target.value === 'on')} aria-label="Narrow Loss Bonus">
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>
        </div>
        <div className="lb-filter">
          <label className="lb-label">Sort</label>
          <select className="lb-select" value={teamSort} onChange={e => setTeamSort(e.target.value as any)} aria-label="Sort By">
            <option value="points">Points</option>
            <option value="winrate">Win rate</option>
            <option value="wins">Total wins</option>
            <option value="scoreDiff">Points difference</option>
            <option value="streak">Win streak</option>
            <option value="avg">Avg points/match</option>
          </select>
        </div>
        <button className="btn btn-outline-sky btn-sm" onClick={() => setLive(v => !v)}>{live ? 'Stop Live' : 'Start Live'}</button>
      </div>

      <div className="lb-table">
        <div className="lb-row lb-head teams">
          <div className="lb-cell rank">#</div>
          <div className="lb-cell team">Team</div>
          <div className="lb-cell">Played</div>
          <div className="lb-cell">Won</div>
          <div className="lb-cell">Lost</div>
          <div className="lb-cell">Tie</div>
          <div className="lb-cell">Points</div>
          <div className="lb-cell">Score Diff</div>
        </div>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="lb-row teams">
                <div className="lb-cell rank"> </div>
                <div className="lb-cell team" style={{ background:'var(--bg-elevated)', borderRadius:6, height:12 }} />
                <div className="lb-cell" style={{ background:'var(--bg-elevated)', borderRadius:6, height:12 }} />
                <div className="lb-cell" style={{ background:'var(--bg-elevated)', borderRadius:6, height:12 }} />
                <div className="lb-cell" style={{ background:'var(--bg-elevated)', borderRadius:6, height:12 }} />
                <div className="lb-cell" style={{ background:'var(--bg-elevated)', borderRadius:6, height:12 }} />
                <div className="lb-cell" style={{ background:'var(--bg-elevated)', borderRadius:6, height:12 }} />
                <div className="lb-cell" style={{ background:'var(--bg-elevated)', borderRadius:6, height:12 }} />
              </div>
            ))
          : processedTeams.map(s => {
              const prev = lastTeams.find(x => x.team === s.team)?.rank || s.rank
              const delta = prev - s.rank
              const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→'
              const aClass = delta > 0 ? 'lb-arrow up' : delta < 0 ? 'lb-arrow down' : 'lb-arrow stable'
              return (
                <div key={s.rank} className="lb-row teams">
                  <div className="lb-cell rank">{s.rank}<span className={aClass}>{arrow}</span></div>
                  <div className="lb-cell team">{s.team}</div>
                  <div className="lb-cell">{s.matches}</div>
                  <div className="lb-cell">{s.wins}</div>
                  <div className="lb-cell">{s.losses}</div>
                  <div className="lb-cell">{s.draws}</div>
                  <div className="lb-cell">{s.points}</div>
                  <div className="lb-cell">{(s.scoreDiff ?? 0) >= 0 ? `+${s.scoreDiff}` : s.scoreDiff}</div>
                </div>
              )
            })}
      </div>
    </div>
  )
}
