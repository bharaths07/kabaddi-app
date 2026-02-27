import React, { useMemo, useState } from 'react'
import './leaderboards.css'

type TabKey = 'teams' | 'raiders' | 'defenders' | 'allrounders'

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

export default function Leaderboards() {
  const [tab, setTab] = useState<TabKey>('teams')
  const [tournament, setTournament] = useState('all')
  const [season, setSeason] = useState('KPL 2026')
  const [narrowLossBonus, setNarrowLossBonus] = useState(true)

  const teamStandings = useMemo<TeamStanding[]>(
    () => [
      { rank: 1, team: 'Dabangg Delhi', matches: 10, wins: 8, losses: 2, draws: 0, points: 0, scoreDiff: 58, narrowLosses: 1 },
      { rank: 2, team: 'Puneri Paltan', matches: 10, wins: 7, losses: 3, draws: 0, points: 0, scoreDiff: 41, narrowLosses: 0 },
      { rank: 3, team: 'Wolves', matches: 10, wins: 6, losses: 3, draws: 1, points: 0, scoreDiff: 24, narrowLosses: 1 },
      { rank: 4, team: 'Falcons', matches: 10, wins: 5, losses: 4, draws: 1, points: 0, scoreDiff: 12, narrowLosses: 0 },
      { rank: 5, team: 'Spartans', matches: 10, wins: 3, losses: 6, draws: 1, points: 0, scoreDiff: -8, narrowLosses: 1 }
    ],
    []
  )
  const computePoints = (t: TeamStanding) => (t.wins * 5) + (t.draws * 3) + (t.losses * 0) + (narrowLossBonus ? (t.narrowLosses || 0) : 0)
  const processedTeams = useMemo(() => {
    const rows = teamStandings.map(t => ({ ...t, points: computePoints(t) }))
    return rows.sort((a, b) => (b.points - a.points) || ((b.scoreDiff || 0) - (a.scoreDiff || 0))).map((t, i) => ({ ...t, rank: i + 1 }))
  }, [teamStandings, narrowLossBonus])

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
      { rank: 1, name: 'N. Sharma', team: 'Rangers', matches: 8, raids: 80, raidPoints: 28, tackles: 40, tacklePoints: 18, totalPoints: 46 },
      { rank: 2, name: 'A. Roy', team: 'Titans', matches: 8, raids: 78, raidPoints: 27, tackles: 38, tacklePoints: 17, totalPoints: 44 },
      { rank: 3, name: 'K. Gupta', team: 'Wolves', matches: 8, raids: 75, raidPoints: 25, tackles: 36, tacklePoints: 16, totalPoints: 41 },
      { rank: 4, name: 'S. Iyer', team: 'Falcons', matches: 8, raids: 70, raidPoints: 24, tackles: 34, tacklePoints: 15, totalPoints: 39 },
      { rank: 5, name: 'B. Gill', team: 'Spartans', matches: 8, raids: 68, raidPoints: 23, tackles: 32, tacklePoints: 14, totalPoints: 37 }
    ],
    []
  )

  const boards: Array<{ key: TabKey; label: string }> = [
    { key: 'teams', label: 'Teams' },
    { key: 'raiders', label: 'Raiders' },
    { key: 'defenders', label: 'Defenders' },
    { key: 'allrounders', label: 'All-Rounders' }
  ]

  return (
    <div className="lb-page">
      <div className="lb-header">
        <h1 className="lb-title">Leaderboards</h1>
        <div className="lb-subtitle">Top raiders, best defenders, leading teams.</div>
      </div>

      <div className="lb-tabs">
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
            <option value="all">All</option>
            <option value="spring-cup">Spring Kabaddi Cup</option>
            <option value="monsoon-league">Monsoon League</option>
          </select>
        </div>
        <div className="lb-filter">
          <label className="lb-label">Season</label>
          <select className="lb-select" value={season} onChange={e => setSeason(e.target.value)}>
            <option value="KPL 2026">KPL 2026</option>
            <option value="KPL 2025">KPL 2025</option>
            <option value="KPL 2024">KPL 2024</option>
          </select>
        </div>
        <div className="lb-filter">
          <label className="lb-label">Narrow loss bonus</label>
          <select className="lb-select" value={narrowLossBonus ? 'on' : 'off'} onChange={e => setNarrowLossBonus(e.target.value === 'on')}>
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>
        </div>
      </div>

      {tab === 'teams' && (
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
          {processedTeams.map(s => (
            <div key={s.rank} className="lb-row teams">
              <div className="lb-cell rank">{s.rank}</div>
              <div className="lb-cell team">{s.team}</div>
              <div className="lb-cell">{s.matches}</div>
              <div className="lb-cell">{s.wins}</div>
              <div className="lb-cell">{s.losses}</div>
              <div className="lb-cell">{s.draws}</div>
              <div className="lb-cell">{s.points}</div>
              <div className="lb-cell">{(s.scoreDiff ?? 0) >= 0 ? `+${s.scoreDiff}` : s.scoreDiff}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'raiders' && (
        <div className="lb-table">
          <div className="lb-row lb-head raiders">
            <div className="lb-cell rank">#</div>
            <div className="lb-cell player">Player</div>
            <div className="lb-cell team">Team</div>
            <div className="lb-cell">Raid Pts</div>
            <div className="lb-cell">Super Raids</div>
            <div className="lb-cell">Success %</div>
            <div className="lb-cell">Do-or-die %</div>
          </div>
          {raiders.map(p => (
            <div key={p.rank} className="lb-row raiders">
              <div className="lb-cell rank">{p.rank}</div>
              <div className="lb-cell player">{p.name}</div>
              <div className="lb-cell team">{p.team}</div>
              <div className="lb-cell">{p.raidPoints}</div>
              <div className="lb-cell">{p.superRaids}</div>
              <div className="lb-cell">{(p.raidSuccessPct || 0).toFixed(1)}%</div>
              <div className="lb-cell">{(p.doOrDieSuccessPct || 0).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'defenders' && (
        <div className="lb-table">
          <div className="lb-row lb-head defenders">
            <div className="lb-cell rank">#</div>
            <div className="lb-cell player">Player</div>
            <div className="lb-cell team">Team</div>
            <div className="lb-cell">Tackle Pts</div>
            <div className="lb-cell">Super Tackles</div>
            <div className="lb-cell">Success %</div>
          </div>
          {defenders.map(p => (
            <div key={p.rank} className="lb-row defenders">
              <div className="lb-cell rank">{p.rank}</div>
              <div className="lb-cell player">{p.name}</div>
              <div className="lb-cell team">{p.team}</div>
              <div className="lb-cell">{p.tacklePoints}</div>
              <div className="lb-cell">{p.superTackles}</div>
              <div className="lb-cell">{(p.tackleSuccessPct || 0).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'allrounders' && (
        <div className="lb-table">
          <div className="lb-row lb-head allrounders">
            <div className="lb-cell rank">#</div>
            <div className="lb-cell player">Player</div>
            <div className="lb-cell team">Team</div>
            <div className="lb-cell">Raid Pts</div>
            <div className="lb-cell">Tackle Pts</div>
            <div className="lb-cell">Total</div>
          </div>
          {allRounders.map(p => (
            <div key={p.rank} className="lb-row allrounders">
              <div className="lb-cell rank">{p.rank}</div>
              <div className="lb-cell player">{p.name}</div>
              <div className="lb-cell team">{p.team}</div>
              <div className="lb-cell">{p.raidPoints}</div>
              <div className="lb-cell">{p.tacklePoints}</div>
              <div className="lb-cell">{p.totalPoints}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
