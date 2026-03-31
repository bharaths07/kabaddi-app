import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTopPlayers } from '@shared/services/tournamentService'
import './rankings.css'
import '../../pages/home.css'

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

      } catch (err) {
        console.error('Leaderboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredAndSortedPlayers = useMemo(() => {
    let list = [...players]

    // Tab filtering logically isolates players making contributions in that specific category
    if (tab === 'raiders') {
      list = list.filter(p => p.role === 'raiders')
    } else if (tab === 'defenders') {
      list = list.filter(p => p.role === 'defenders')
    } else {
      list = list.filter(p => p.role === 'allrounders')
    }

    // Advanced Sorting Dropdown
    list.sort((a, b) => {
      if (playerSort === 'efficiency') return b.nppr - a.nppr
      if (playerSort === 'pressure') return b.dodSuccessRate - a.dodSuccessRate
      return b.score - a.score // Default to primary 'score'
    })

    return list.map((p, i) => ({ ...p, rank: i + 1 }))
  }, [players, tab, playerSort])

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
            <h1 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 6px 0', color: '#0f172a' }}>Player Rankings</h1>
            <div style={{ color: '#64748b', fontWeight: 600, fontSize: '15px' }}>Top performer rankings mapped by our 5-factor scoring model.</div>
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
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center' }}>Sort by:</span>
            <select className="pk-select" style={{ background: playerSort === 'score' ? '#FF6B35' : '#fff', color: playerSort === 'score' ? '#fff' : '#475569', borderColor: playerSort === 'score' ? '#FF6B35' : '#e2e8f0' }} value={playerSort} onChange={e => setPlayerSort(e.target.value as any)}>
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
            {filteredAndSortedPlayers.slice(0, 3).map(p => (
              <Link to={`/players/${p.id}`} key={p.id} className={`pk-podium-row rank-${p.rank}`}>
                <div className="pk-podium-rank"><span>#</span>{p.rank}</div>
                <div className="pk-podium-avatar">{p.name.slice(0, 2).toUpperCase()}</div>
                <div className="pk-podium-info">
                  <h3 className="pk-podium-name">
                    {p.name}
                    {getBadge(p)}
                  </h3>
                  <div className="pk-podium-role">{tab === 'raiders' ? 'Raider' : tab === 'defenders' ? 'Defender' : 'All-Rounder'} • {p.team}</div>
                </div>

                <div className="pk-podium-stats">
                  <div className="pk-podium-stat">
                    <span className="pk-podium-stat-val">{p.nppr}</span>
                    <span className="pk-podium-stat-label">NPpR</span>
                  </div>
                  <div className="pk-podium-stat">
                    <span className="pk-podium-stat-val">{p.strikeRate}%</span>
                    <span className="pk-podium-stat-label">Strike Rate</span>
                  </div>
                  <div className="pk-podium-stat" style={{ minWidth: '90px', alignItems: 'flex-end' }}>
                    <span className="pk-podium-stat-label">Rating</span>
                    <span className="pk-podium-stat-val" style={{ display: 'flex', alignItems: 'center' }}>
                      {p.score}
                      <span className={`pk-trend ${p.trend > 0 ? 'up' : p.trend < 0 ? 'down' : 'neutral'}`}>
                        {Math.abs(p.trend)}
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}

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
