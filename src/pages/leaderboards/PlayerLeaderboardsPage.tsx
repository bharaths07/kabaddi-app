import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTopPlayers } from '@shared/services/tournamentService'
import './rankings.css'
import '../../pages/home.css'
import PlayerCard from '@shared/components/PlayerCard'

type TabKey = 'raiders' | 'defenders' | 'allrounders'

export type PlayerRow = {
  rank: number
  id: string
  name: string
  role: string
  team: string
  team_id: string
  matches: number
  totalPts: number
  raidPoints: number
  totalRaids: number
  successfulRaids: number
  superRaids: number
  tackles: number
  tacklePoints: number
  superTackles: number

  // New Metrics from the JS Formula
  nppr: number
  strikeRate: number
  dodSuccessRate: number
  allOutContributions: number
  score: number // Combined 5-factor rating
  trend: number
}

export default function PlayerLeaderboardsPage() {
  const [tab, setTab] = useState<TabKey>('raiders')
  const [playerSort, setPlayerSort] = useState<'score' | 'efficiency' | 'pressure'>('score')
  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState<PlayerRow[]>([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const data = await getTopPlayers()
        // Map service results to the local PlayerRow structure
        const mapped = data.map((p, i) => ({
          ...p,
          rank: i + 1,
          role: p.role?.toLowerCase().includes('raider') ? 'raiders' : 
                p.role?.toLowerCase().includes('defender') ? 'defenders' : 'allrounders'
        }))
        setPlayers(mapped)

      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const displayPlayers: PlayerRow[] = players.length > 0 ? players : [
    {
      id: 'p-1',
      rank: 1,
      name: 'Pawan Sehrawat',
      team: 'Mumbai Mavericks',
      team_id: 'mock-1',
      role: 'raiders',
      raidPoints: 240,
      successfulRaids: 180,
      tackles: 15,
      superRaids: 12,
      score: 9.8,
      nppr: 8.5,
      strikeRate: 75,
      dodSuccessRate: 68,
      trend: 2,
      matches: 10,
      totalPts: 255,
      totalRaids: 300,
      tacklePoints: 15,
      superTackles: 2,
      allOutContributions: 4
    },
    {
      id: 'p-2',
      rank: 2,
      name: 'Fazel Atrachali',
      team: 'Bengal Tigers',
      team_id: 'mock-2',
      role: 'defenders',
      raidPoints: 0,
      successfulRaids: 0,
      tackles: 85,
      superRaids: 0, 
      score: 9.6,
      nppr: 7.2,
      strikeRate: 0,
      dodSuccessRate: 45,
      trend: 1,
      matches: 10,
      totalPts: 90,
      totalRaids: 5,
      tacklePoints: 85,
      superTackles: 15,
      allOutContributions: 3
    },
    {
      id: 'p-3',
      rank: 3,
      name: 'Naveen Kumar',
      team: 'Delhi Bulls',
      team_id: 'mock-3',
      role: 'raiders',
      raidPoints: 210,
      successfulRaids: 165,
      tackles: 8,
      superRaids: 15,
      score: 9.5,
      nppr: 8.2,
      strikeRate: 72,
      dodSuccessRate: 70,
      trend: 3,
      matches: 8,
      totalPts: 218,
      totalRaids: 250,
      tacklePoints: 8,
      superTackles: 0,
      allOutContributions: 2
    }
  ];

  const filteredAndSortedPlayers = useMemo(() => {
    let list = [...displayPlayers]

    // Tab filtering: if looking at all or specific roles
    if (tab === 'raiders') {
      list = list.filter(p => p.role === 'raiders')
    } else if (tab === 'defenders') {
      list = list.filter(p => p.role === 'defenders')
    } else {
      list = list.filter(p => p.role === 'allrounders')
    }

    // Default sorting for mock or real
    list.sort((a, b) => b.score - a.score)

    return list.map((p, i) => ({ ...p, rank: i + 1 }))
  }, [displayPlayers, tab, playerSort])

  function getBadge(p: PlayerRow) {
    if (p.superRaids >= 8) return <span className="pk-badge">SR King</span>
    if (p.superTackles >= 14) return <span className="pk-badge wall">Wall</span>
    if (p.dodSuccessRate > 65) return <span className="pk-badge clutch">Clutch</span>
    return null
  }

  // Calculate top contextual stats
  const totalLeagueRaidPts = players.reduce((sum, p) => sum + p.raidPoints, 0)
  const avgLeagueStrikeRate = players.length ? (players.reduce((sum, p) => sum + p.strikeRate, 0) / players.length).toFixed(1) : 0
  const avgPressure = players.length ? (players.reduce((sum, p) => sum + p.dodSuccessRate, 0) / players.length).toFixed(0) : 0

  return (
    <div className="hp-page" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      <div className="pk-rankings-container">

        {/* Header Block */}
        <div className="pk-header-row">
          <div>
            <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 900, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Player Rankings</h1>
            <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '15px' }}>Top performer rankings mapped by our 5-factor scoring model.</div>
          </div>
        </div>

        {/* Top Feature Stats */}
        <div className="pk-top-stats">
          <div className="pk-top-stat-card">
            <div className="pk-tsc-icon" style={{ color: '#F59E0B' }}>🏃</div>
            <div className="pk-tsc-info">
              <span className="pk-tsc-label">Total Raid Points</span>
              <span className="pk-tsc-val">{totalLeagueRaidPts}</span>
            </div>
          </div>
          <div className="pk-top-stat-card">
            <div className="pk-tsc-icon" style={{ color: '#0ea5e9' }}>🎯</div>
            <div className="pk-tsc-info">
              <span className="pk-tsc-label">Avg Strike Rate</span>
              <span className="pk-tsc-val">{avgLeagueStrikeRate}%</span>
            </div>
          </div>
          <div className="pk-top-stat-card">
            <div className="pk-tsc-icon" style={{ color: '#ea580c' }}>💪</div>
            <div className="pk-tsc-info">
              <span className="pk-tsc-label">Pressure Perform</span>
              <span className="pk-tsc-val">{avgPressure}%</span>
            </div>
          </div>
          <div className="pk-top-stat-card">
            <div className="pk-tsc-icon" style={{ color: '#10b981' }}>💀</div>
            <div className="pk-tsc-info">
              <span className="pk-tsc-label">Do-or-Die Avg</span>
              <span className="pk-tsc-val">{avgPressure}%</span> {/* Duplicated intention for UI density */}
            </div>
          </div>
        </div>

        {/* Filters and Tabs */}
        <div className="pk-filters-bar">
          <div className="pk-tabs">
            <button className={`pk-tab ${tab === 'raiders' ? 'active' : ''}`} onClick={() => setTab('raiders')}>RAIDERS</button>
            <button className={`pk-tab ${tab === 'defenders' ? 'active' : ''}`} onClick={() => setTab('defenders')}>DEFENDERS</button>
            <button className={`pk-tab ${tab === 'allrounders' ? 'active' : ''}`} onClick={() => setTab('allrounders')}>ALL-ROUNDERS</button>
          </div>

          <div className="pk-selects">
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>Sort by:</span>
            <select className="pk-select" style={{ background: playerSort === 'score' ? 'var(--color-primary)' : 'var(--bg-surface)', color: playerSort === 'score' ? '#fff' : 'var(--text-secondary)', borderColor: playerSort === 'score' ? 'var(--color-primary)' : 'var(--bg-border)' }} value={playerSort} onChange={e => setPlayerSort(e.target.value as any)}>
              <option value="score">SCORE</option>
              <option value="efficiency">EFFICIENCY</option>
              <option value="pressure">PRESSURE</option>
            </select>
          </div>
        </div>

        {/* Leaderboard Table / Interactive Grid */}
        {loading ? (
          <div className="hp-empty-state">Compiling Rankings...</div>
        ) : filteredAndSortedPlayers.length === 0 ? (
          <div className="hp-empty-state">No players found in this category.</div>
        ) : (
          <div>
            {/* Podium Rendering (Top 3) */}
            <div className="pk-podium-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {filteredAndSortedPlayers.slice(0, 3).map(p => (
                <PlayerCard 
                  key={p.id} 
                  player={{
                    id: p.id,
                    name: p.name,
                    role: p.role === 'raiders' ? 'Raider' : p.role === 'defenders' ? 'Defender' : 'All-Rounder',
                    teamName: p.team,
                    stats: {
                      successfulRaids: p.successfulRaids,
                      tackles: p.tackles,
                      super10s: p.superRaids // Using superRaids as proxy for super10s in this demo
                    }
                  }} 
                />
              ))}
            </div>

            {/* List Headers */}
            {filteredAndSortedPlayers.length > 3 && (
              <div className="pk-list-header">
                <div className="pk-list-col col-rank">#</div>
                <div className="pk-list-col col-player">Player</div>
                <div className="pk-list-col col-stat">NPpR</div>
                <div className="pk-list-col col-stat" style={{ minWidth: '100px' }}>Strike Rate</div>
                <div className="pk-list-col col-stat" style={{ flex: 1, textAlign: 'right' }}>Score</div>
              </div>
            )}

            {/* Normal Rows (4th onwards) */}
            {filteredAndSortedPlayers.slice(3).map(p => (
              <Link to={`/players/${p.id}`} key={p.id} className="pk-list-row">
                <div className="pk-list-col col-rank">{p.rank}.</div>
                <div className="pk-list-col col-player">
                  <div className="pk-list-avatar">{p.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div className="pk-list-name">{p.name} {getBadge(p)}</div>
                    <div className="pk-list-role">{tab === 'raiders' ? 'Raider' : tab === 'defenders' ? 'Defender' : 'All-Rounder'}</div>
                  </div>
                </div>
                <div className="pk-list-col col-stat">{p.nppr}</div>
                <div className="pk-list-col col-stat" style={{ minWidth: '100px' }}>{p.strikeRate}%</div>
                <div className="pk-list-col col-stat" style={{ flex: 1, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900 }}>{p.score}</span>
                  <span className={`pk-trend ${p.trend > 0 ? 'up' : p.trend < 0 ? 'down' : 'neutral'}`}>
                    {Math.abs(p.trend)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
