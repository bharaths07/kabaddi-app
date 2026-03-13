import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../features/kabaddi/pages/leaderboards.css'

type TabKey = 'raiders' | 'defenders' | 'allrounders'

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

type PlayerRow = {
  rank: number
  name: string
  team: string
  matches: number
  raidPoints?: number
  superRaids?: number
  raidSuccessPct?: number
  doOrDieSuccessPct?: number
  tackles?: number
  tacklePoints?: number
  superTackles?: number
  tackleSuccessPct?: number
  totalPoints: number
}

export default function PlayerLeaderboardsPage() {
  const [tab, setTab] = useState<TabKey>('raiders')
  const [tournament, setTournament] = useState('all')
  const [season, setSeason] = useState('KPL 2026')
  const [narrowLossBonus, setNarrowLossBonus] = useState(true)
  const [playerSort, setPlayerSort] = useState<'raidPoints' | 'tacklePoints' | 'totalPoints' | 'successRate' | 'avg'>('totalPoints')
  const [time, setTime] = useState<'season' | 'month' | 'week'>('season')
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showMoreFilters, setShowMoreFilters] = useState(false)

  const teamStandings = useMemo<TeamStanding[]>(
    () => [
      { rank: 1, team: 'Dabangg Delhi', matches: 10, wins: 8, losses: 2, draws: 0, points: 0, scoreDiff: 58, narrowLosses: 1, color: '#ef4444' },
      { rank: 2, team: 'Puneri Paltan', matches: 10, wins: 7, losses: 3, draws: 0, points: 0, scoreDiff: 41, narrowLosses: 0, color: '#f97316' },
      { rank: 3, team: 'Wolves', matches: 10, wins: 6, losses: 3, draws: 1, points: 0, scoreDiff: 24, narrowLosses: 1, color: '#64748b' },
      { rank: 4, team: 'Falcons', matches: 10, wins: 5, losses: 4, draws: 1, points: 0, scoreDiff: 12, narrowLosses: 0, color: '#0ea5e9' },
      { rank: 5, team: 'Spartans', matches: 10, wins: 3, losses: 6, draws: 1, points: 0, scoreDiff: -8, narrowLosses: 1, color: '#8b5cf6' }
    ],
    []
  )

  const raiders = useMemo<PlayerRow[]>(
    () => [
      { rank: 1, name: 'R. Singh', team: 'Dabangg Delhi', matches: 10, raidPoints: 98, superRaids: 6, raidSuccessPct: 54.5, doOrDieSuccessPct: 62, totalPoints: 104 },
      { rank: 2, name: 'A. Kumar', team: 'Puneri Paltan', matches: 10, raidPoints: 92, superRaids: 5, raidSuccessPct: 51.8, doOrDieSuccessPct: 59, totalPoints: 96 },
      { rank: 3, name: 'P. Yadav', team: 'Wolves', matches: 10, raidPoints: 86, superRaids: 4, raidSuccessPct: 50.9, doOrDieSuccessPct: 57, totalPoints: 90 },
      { rank: 4, name: 'K. Reddy', team: 'Falcons', matches: 10, raidPoints: 80, superRaids: 3, raidSuccessPct: 49.1, doOrDieSuccessPct: 55, totalPoints: 83 },
      { rank: 5, name: 'S. Patil', team: 'Spartans', matches: 10, raidPoints: 74, superRaids: 3, raidSuccessPct: 47.6, doOrDieSuccessPct: 53, totalPoints: 77 }
    ],
    []
  )

  const defenders = useMemo<PlayerRow[]>(
    () => [
      { rank: 1, name: 'V. Rao', team: 'Puneri Paltan', matches: 10, tacklePoints: 64, superTackles: 5, tackleSuccessPct: 57.1, totalPoints: 66 },
      { rank: 2, name: 'M. Khan', team: 'Dabangg Delhi', matches: 10, tacklePoints: 60, superTackles: 4, tackleSuccessPct: 55.9, totalPoints: 62 },
      { rank: 3, name: 'D. Singh', team: 'Wolves', matches: 10, tacklePoints: 56, superTackles: 4, tackleSuccessPct: 54.5, totalPoints: 57 },
      { rank: 4, name: 'H. Das', team: 'Falcons', matches: 10, tacklePoints: 52, superTackles: 3, tackleSuccessPct: 53.1, totalPoints: 53 },
      { rank: 5, name: 'J. Mehta', team: 'Spartans', matches: 10, tacklePoints: 48, superTackles: 3, tackleSuccessPct: 51.6, totalPoints: 49 }
    ],
    []
  )

  const allRounders = useMemo<PlayerRow[]>(
    () => [
      { rank: 1, name: 'N. Sharma', team: 'Rangers', matches: 8, raidPoints: 28, tacklePoints: 18, totalPoints: 46 },
      { rank: 2, name: 'A. Roy', team: 'Titans', matches: 8, raidPoints: 27, tacklePoints: 17, totalPoints: 44 },
      { rank: 3, name: 'K. Gupta', team: 'Wolves', matches: 8, raidPoints: 25, tacklePoints: 16, totalPoints: 41 },
      { rank: 4, name: 'S. Iyer', team: 'Falcons', matches: 8, raidPoints: 24, tacklePoints: 15, totalPoints: 39 },
      { rank: 5, name: 'B. Gill', team: 'Spartans', matches: 8, raidPoints: 23, tacklePoints: 14, totalPoints: 37 }
    ],
    []
  )

  const boards: Array<{ key: TabKey; label: string }> = [
    { key: 'raiders', label: 'Raiders' },
    { key: 'defenders', label: 'Defenders' },
    { key: 'allrounders', label: 'All-Rounders' }
  ]

  const playerRows = useMemo(() => {
    let rows: PlayerRow[] = tab === 'raiders' ? raiders : tab === 'defenders' ? defenders : allRounders
    if (teamFilter !== 'all') rows = rows.filter(r => r.team === teamFilter)
    const sorted = rows.slice().sort((a, b) => {
      if (playerSort === 'raidPoints') return (b.raidPoints || 0) - (a.raidPoints || 0)
      if (playerSort === 'tacklePoints') return (b.tacklePoints || 0) - (a.tacklePoints || 0)
      if (playerSort === 'totalPoints') return (b.totalPoints || 0) - (a.totalPoints || 0)
      if (playerSort === 'successRate') {
        const sa = tab === 'defenders' ? (a.tackleSuccessPct || 0) : (a.raidSuccessPct || 0)
        const sb = tab === 'defenders' ? (b.tackleSuccessPct || 0) : (b.raidSuccessPct || 0)
        return sb - sa
      }
      if (playerSort === 'avg') {
        const aa = (a.totalPoints || 0) / (a.matches || 1)
        const ab = (b.totalPoints || 0) / (b.matches || 1)
        return ab - aa
      }
      return 0
    }).map((r, i) => ({ ...r, rank: i + 1 }))
    return sorted
  }, [tab, raiders, defenders, allRounders, playerSort, teamFilter])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <div className="lb-tabs" style={{ background: 'none', padding: 0 }}>
        {boards.map(b => (
          <button key={b.key} className={`lb-tab ${tab === b.key ? 'active' : ''}`} onClick={() => setTab(b.key)}>
            {b.label}
          </button>
        ))}
      </div>

      <div className="lb-filters">
        <div className="lb-filter">
          <label className="lb-label">Tournament</label>
          <select className="lb-select" value={tournament} onChange={e => setTournament(e.target.value)}>
            <option value="all">All Tournaments</option>
            <option value="spring-cup">Spring Kabaddi Cup</option>
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

        {(showMoreFilters || window.innerWidth > 768) && (
          <>
            <div className="lb-filter">
              <label className="lb-label">Team</label>
              <select className="lb-select" value={teamFilter} onChange={e => setTeamFilter(e.target.value)}>
                <option value="all">All Teams</option>
                {teamStandings.map(t => <option key={t.team} value={t.team}>{t.team}</option>)}
              </select>
            </div>
            <div className="lb-filter">
              <label className="lb-label">Sort By</label>
              <select className="lb-select" value={playerSort} onChange={e => setPlayerSort(e.target.value as any)}>
                <option value="totalPoints">Total Points</option>
                <option value="raidPoints">Raid Points</option>
                <option value="tacklePoints">Tackle Points</option>
                <option value="successRate">Success Rate</option>
              </select>
            </div>
            <div className="lb-filter">
              <label className="lb-label">Time Period</label>
              <select className="lb-select" value={time} onChange={e => setTime(e.target.value as any)}>
                <option value="season">Full Season</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
              </select>
            </div>
          </>
        )}

        <button 
          className="btn btn-ghost btn-sm" 
          style={{ alignSelf: 'flex-end', height: 38, display: window.innerWidth <= 768 ? 'block' : 'none' }}
          onClick={() => setShowMoreFilters(!showMoreFilters)}
        >
          {showMoreFilters ? '✕' : '⚡ More'}
        </button>
      </div>

      {loading ? (
        <div className="lb-table">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="lb-row raiders" style={{ opacity: 0.5 }}>
              <div className="lb-cell rank">#</div>
              <div className="lb-cell player">Loading...</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="lb-table">
          <div className={`lb-row lb-head ${tab}`}>
            <div className="lb-cell rank">#</div>
            <div className="lb-cell player">Player</div>
            <div className="lb-cell team">Team</div>
            <div className="lb-cell">{tab === 'raiders' ? 'Raid Pts' : tab === 'defenders' ? 'Tackle Pts' : 'Total Pts'}</div>
            <div className="lb-cell">{tab === 'raiders' ? 'Super Raids' : tab === 'defenders' ? 'Super Tackles' : 'Raid Pts'}</div>
            <div className="lb-cell">Success %</div>
          </div>
          {playerRows.map(p => (
            <div key={p.rank} className={`lb-row ${tab}`}>
              <div className="lb-cell rank">{p.rank}</div>
              <div className="lb-cell player">
                <div className="lb-player-cell">
                  <div className="lb-avatar">{p.name.split(' ').map(n => n[0]).join('')}</div>
                  <Link to={`/players/${p.name.toLowerCase().replace(/\s+/g, '-')}`} style={{ textDecoration:'none', color: 'inherit' }}>{p.name}</Link>
                </div>
              </div>
              <div className="lb-cell team">
                <Link to={`/teams/${p.team.toLowerCase().replace(/\s+/g, '-')}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {p.team}
                </Link>
              </div>
              <div className="lb-cell" style={{ fontWeight: 800 }}>
                {tab === 'raiders' ? p.raidPoints : tab === 'defenders' ? p.tacklePoints : p.totalPoints}
              </div>
              <div className="lb-cell">
                {tab === 'raiders' ? p.superRaids : tab === 'defenders' ? p.superTackles : p.raidPoints}
              </div>
              <div className="lb-cell">
                {(tab === 'defenders' ? p.tackleSuccessPct : p.raidSuccessPct || 0).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
