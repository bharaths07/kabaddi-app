import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@shared/lib/supabase'
import '../../features/kabaddi/pages/leaderboards.css'

type TabKey = 'raiders' | 'defenders' | 'allrounders'

type PlayerRow = {
  rank: number
  id: string
  name: string
  team: string
  team_id: string
  matches: number
  raidPoints: number
  superRaids: number
  raidSuccessPct: number
  tackles: number
  tacklePoints: number
  superTackles: number
  tackleSuccessPct: number
  totalPoints: number
}

export default function PlayerLeaderboardsPage() {
  const [tab, setTab] = useState<TabKey>('raiders')
  const [tournament, setTournament] = useState('all')
  const [season, setSeason] = useState('KPL 2026')
  const [playerSort, setPlayerSort] = useState<'raidPoints' | 'tacklePoints' | 'totalPoints' | 'successRate' | 'avg'>('totalPoints')
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState<PlayerRow[]>([])
  const [teams, setTeams] = useState<{id: string, name: string}[]>([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // 1. Fetch teams for filter
        const { data: teamsData } = await supabase.from('teams').select('id, name')
        if (teamsData) setTeams(teamsData)

        // 2. Fetch aggregated stats
        // In a production app, we'd use a database view or a more complex query
        // For now, we'll fetch all player_match_stats and aggregate in JS for accuracy
        let query = supabase
          .from('player_match_stats')
          .select(`
            player_id, raid_points, tackle_points, super_raids, super_tackles,
            player:players(name, team:teams(name, id))
          `)

        const { data: statsData, error } = await query
        if (error) throw error

        if (statsData) {
          const aggregation: Record<string, any> = {}
          
          statsData.forEach((s: any) => {
            const pid = s.player_id
            if (!aggregation[pid]) {
              aggregation[pid] = {
                id: pid,
                name: s.player?.name || 'Unknown',
                team: s.player?.team?.name || 'No Team',
                team_id: s.player?.team?.id || '',
                matches: 0,
                raidPoints: 0,
                superRaids: 0,
                tackles: 0,
                tacklePoints: 0,
                superTackles: 0,
                totalPoints: 0
              }
            }
            const p = aggregation[pid]
            p.matches += 1
            p.raidPoints += (s.raid_points || 0)
            p.superRaids += (s.super_raids || 0)
            p.tacklePoints += (s.tackle_points || 0)
            p.superTackles += (s.super_tackles || 0)
            p.totalPoints += (s.raid_points || 0) + (s.tackle_points || 0)
          })

          const result: PlayerRow[] = Object.values(aggregation).map(p => ({
            ...p,
            rank: 0,
            raidSuccessPct: p.matches > 0 ? (p.raidPoints / (p.matches * 10)) * 100 : 0, // Mock calculation
            tackleSuccessPct: p.matches > 0 ? (p.tacklePoints / (p.matches * 5)) * 100 : 0 // Mock calculation
          }))

          setPlayers(result)
        }
      } catch (err) {
        console.error('Leaderboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tournament, season])

  const boards: Array<{ key: TabKey; label: string }> = [
    { key: 'raiders', label: 'Raiders' },
    { key: 'defenders', label: 'Defenders' },
    { key: 'allrounders', label: 'All-Rounders' }
  ]

  const filteredAndSortedPlayers = useMemo(() => {
    let list = [...players]
    
    // Filter by team
    if (teamFilter !== 'all') {
      list = list.filter(p => p.team_id === teamFilter)
    }

    // Filter by tab (basic role filter if needed, but here we just sort by primary stat)
    if (tab === 'raiders') {
      list = list.filter(p => p.raidPoints > 0)
    } else if (tab === 'defenders') {
      list = list.filter(p => p.tacklePoints > 0)
    }

    // Sort
    list.sort((a, b) => {
      if (playerSort === 'raidPoints') return b.raidPoints - a.raidPoints
      if (playerSort === 'tacklePoints') return b.tacklePoints - a.tacklePoints
      if (playerSort === 'successRate') {
        const sa = tab === 'defenders' ? a.tackleSuccessPct : a.raidSuccessPct
        const sb = tab === 'defenders' ? b.tackleSuccessPct : b.raidSuccessPct
        return sb - sa
      }
      if (playerSort === 'avg') return (b.totalPoints / b.matches) - (a.totalPoints / a.matches)
      return b.totalPoints - a.totalPoints
    })

    return list.map((p, i) => ({ ...p, rank: i + 1 }))
  }, [players, teamFilter, tab, playerSort])

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
          </select>
        </div>
        <div className="lb-filter">
          <label className="lb-label">Season</label>
          <select className="lb-select" value={season} onChange={e => setSeason(e.target.value)}>
            <option value="KPL 2026">KPL 2026</option>
          </select>
        </div>

        <div className="lb-filter">
          <label className="lb-label">Team</label>
          <select className="lb-select" value={teamFilter} onChange={e => setTeamFilter(e.target.value)}>
            <option value="all">All Teams</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="lb-filter">
          <label className="lb-label">Sort By</label>
          <select className="lb-select" value={playerSort} onChange={e => setPlayerSort(e.target.value as any)}>
            <option value="totalPoints">Total Points</option>
            <option value="raidPoints">Raid Points</option>
            <option value="tacklePoints">Tackle Points</option>
            <option value="successRate">Success Rate</option>
            <option value="avg">Avg. Points</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="lb-table">
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Updating Leaderboards...</div>
        </div>
      ) : (
        <div className="lb-table">
          <div className={`lb-row lb-head ${tab}`}>
            <div className="lb-cell rank">#</div>
            <div className="lb-cell player">Player</div>
            <div className="lb-cell team">Team</div>
            <div className="lb-cell">
              {tab === 'raiders' ? 'Raid Pts' : tab === 'defenders' ? 'Tackle Pts' : 'Total Pts'}
            </div>
            <div className="lb-cell">
              {tab === 'raiders' ? 'Super Raids' : tab === 'defenders' ? 'Super Tackles' : 'Raid Pts'}
            </div>
            <div className="lb-cell">Matches</div>
          </div>

          {filteredAndSortedPlayers.length > 0 ? (
            filteredAndSortedPlayers.map(p => (
              <div key={p.id} className={`lb-row ${tab}`}>
                <div className="lb-cell rank">{p.rank}</div>
                <div className="lb-cell player">
                  <div className="lb-player-cell">
                    <div className="lb-avatar">{p.name.slice(0, 2).toUpperCase()}</div>
                    <Link to={`/players/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {p.name}
                    </Link>
                  </div>
                </div>
                <div className="lb-cell team">
                  <Link to={`/teams/${p.team_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {p.team}
                  </Link>
                </div>
                <div className="lb-cell" style={{ fontWeight: 800 }}>
                  {tab === 'raiders' ? p.raidPoints : tab === 'defenders' ? p.tacklePoints : p.totalPoints}
                </div>
                <div className="lb-cell">
                  {tab === 'raiders' ? p.superRaids : tab === 'defenders' ? p.superTackles : p.raidPoints}
                </div>
                <div className="lb-cell">{p.matches}</div>
              </div>
            ))
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
              No player stats found for the selected filters.
            </div>
          )}
        </div>
      )}
    </>
  )
}
