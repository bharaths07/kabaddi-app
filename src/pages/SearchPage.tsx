import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../shared/lib/supabase'
import { getTopPlayers } from '../shared/services/tournamentService'
import './search.css'

/* ── Types ────────────────────────────────────────────────────── */
type SearchTab = 'tournaments' | 'players' | 'teams' | 'scorers'

interface TournamentResult {
  id: string
  name: string
  status: string | null
  level: string | null
  city_state: string | null
  start_date: string | null
  end_date: string | null
}

interface TeamResult {
  id: string
  name: string
  color: string | null
  city: string | null
  tournament_id: string | null
  tournament_name?: string | null
}

interface PlayerResult {
  id: string
  name: string
  raidPoints: number
  tacklePoints: number
  totalPts: number
  team: string
  team_color: string
  matches: number
  role: string
}

interface ScorerResult {
  id: string
  full_name: string | null
  username: string | null
  phone: string | null
  avatar_url: string | null
}

/* ── Constants ────────────────────────────────────────────────── */
const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh',
]

const MEDAL_EMOJI = ['🥇', '🥈', '🥉']

/* ── Tab placeholders ─────────────────────────────────────────── */
const PLACEHOLDERS: Record<SearchTab, string> = {
  tournaments: 'Search tournaments by name or city...',
  players: 'Search players by name...',
  teams: 'Search teams by name or city...',
  scorers: 'Search scorers, coaches, streamers...',
}

export default function SearchPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<SearchTab>(() => {
    const t = searchParams.get('tab')
    return (t as SearchTab) || 'tournaments'
  })
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  /* Tournaments state */
  const [tournResults, setTournResults] = useState<TournamentResult[]>([])
  const [showGeoFilter, setShowGeoFilter] = useState(() => searchParams.get('filter') === 'geo')
  const [geoState, setGeoState] = useState('')
  const [geoCity, setGeoCity] = useState('')

  /* Players state */
  const [playerLeaderboard, setPlayerLeaderboard] = useState<PlayerResult[]>([])
  const [playerTab, setPlayerTab] = useState<'raiders' | 'defenders'>('raiders')
  const [playerQuery, setPlayerQuery] = useState('')
  const [playerLoading, setPlayerLoading] = useState(false)

  /* Teams state */
  const [teamResults, setTeamResults] = useState<TeamResult[]>([])

  /* Scorers state */
  const [scorerResults, setScorerResults] = useState<ScorerResult[]>([])

  /* ── Focus input on mount ──────────────────────────────────── */
  useEffect(() => {
    inputRef.current?.focus()
  }, [tab])

  /* ── Fetch player leaderboard once ──────────────────────────── */
  useEffect(() => {
    if (tab !== 'players') return
    setPlayerLoading(true)
    getTopPlayers().then(data => {
      const mapped: PlayerResult[] = data.map(p => ({
        id: p.id,
        name: p.name,
        raidPoints: p.raidPoints ?? 0,
        tacklePoints: p.tacklePoints ?? 0,
        totalPts: p.totalPts ?? 0,
        team: p.team ?? '',
        team_color: p.team_color ?? '#0A1628',
        matches: p.matches ?? 0,
        role: (p.role ?? '').toLowerCase().includes('defender') ? 'defenders' : 'raiders',
      }))
      setPlayerLeaderboard(mapped)
    }).finally(() => setPlayerLoading(false))
  }, [tab])

  /* ── Derived player list ─────────────────────────────────────── */
  const filteredPlayers = useMemo(() => {
    let list = playerLeaderboard.filter(p => p.role === playerTab)
    if (playerQuery.trim()) {
      const q = playerQuery.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q))
    }
    return list.sort((a, b) =>
      playerTab === 'raiders' ? b.raidPoints - a.raidPoints : b.tacklePoints - a.tacklePoints
    )
  }, [playerLeaderboard, playerTab, playerQuery])

  /* ── Show toast helper ───────────────────────────────────────── */
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  /* ── Tournament search ──────────────────────────────────────── */
  async function searchTournaments(q: string, state?: string, city?: string) {
    setLoading(true)
    try {
      let dbQ = supabase
        .from('tournaments')
        .select('id, name, status, level, city_state, start_date, end_date')
        .order('created_at', { ascending: false })
        .limit(30)

      if (q.trim()) {
        dbQ = dbQ.ilike('name', `%${q.trim()}%`)
      }
      if (city && city.trim()) {
        dbQ = dbQ.ilike('city_state', `%${city.trim()}%`)
      } else if (state && state.trim()) {
        dbQ = dbQ.ilike('city_state', `%${state.trim()}%`)
      }

      const { data, error } = await dbQ
      if (error) throw error
      setTournResults(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  /* ── Teams search ───────────────────────────────────────────── */
  async function searchTeams(q: string) {
    if (!q.trim()) { setTeamResults([]); return }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, color, city, tournament_id, tournaments(name)')
        .ilike('name', `%${q.trim()}%`)
        .limit(20)
      if (error) throw error
      const mapped: TeamResult[] = (data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        city: t.city,
        tournament_id: t.tournament_id,
        tournament_name: t.tournaments?.name ?? null,
      }))
      setTeamResults(mapped)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  /* ── Scorers search ─────────────────────────────────────────── */
  async function searchScorers(q: string) {
    if (!q.trim()) { setScorerResults([]); return }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, phone, avatar_url')
        .or(`full_name.ilike.%${q.trim()}%,username.ilike.%${q.trim()}%`)
        .limit(15)
      if (error) throw error
      setScorerResults(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  /* ── Search dispatcher ──────────────────────────────────────── */
  function handleSearch() {
    if (tab === 'tournaments') {
      searchTournaments(query, geoState, geoCity)
    } else if (tab === 'teams') {
      searchTeams(query)
    } else if (tab === 'scorers') {
      searchScorers(query)
    }
  }

  /* ── Live search as typing ──────────────────────────────────── */
  useEffect(() => {
    const id = setTimeout(() => {
      if (tab === 'teams') searchTeams(query)
      if (tab === 'scorers') searchScorers(query)
    }, 380)
    return () => clearTimeout(id)
  }, [query, tab])

  /* Load tournaments on mount */
  useEffect(() => {
    if (tab === 'tournaments') searchTournaments('', geoState, geoCity)
  }, [tab])

  function handleGeoSearch() {
    if (!geoState && !geoCity) { showToast('Select state first'); return }
    searchTournaments(query, geoState, geoCity)
    setShowGeoFilter(false)
  }

  /* ── Tab switch ─────────────────────────────────────────────── */
  function switchTab(t: SearchTab) {
    setTab(t)
    setQuery('')
    setTournResults([])
    setTeamResults([])
    setScorerResults([])
    setShowGeoFilter(false)
  }

  function getTournStatus(t: TournamentResult) {
    if (!t.status) return 'upcoming'
    const s = t.status.toLowerCase()
    if (s === 'completed') return 'completed'
    if (s === 'ongoing' || s === 'live') return 'ongoing'
    return 'upcoming'
  }

  /* ── Avatar initial ─────────────────────────────────────────── */
  function initials(name: string) {
    return name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  }

  return (
    <div className="sp-page">

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="sp-header">
        <button className="sp-back-btn" onClick={() => navigate(-1)}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h1 className="sp-title">Search</h1>
      </div>

      {/* ── SEARCH INPUT ────────────────────────────────────────── */}
      <div className="sp-input-row">
        <div className="sp-input-wrap">
          <svg className="sp-search-icon" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            className="sp-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={PLACEHOLDERS[tab]}
          />
          {query && (
            <button className="sp-input-clear" onClick={() => setQuery('')}>✕</button>
          )}
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────────── */}
      <div className="sp-tabs-row">
        {(['tournaments', 'players', 'teams', 'scorers'] as SearchTab[]).map(t => (
          <button
            key={t}
            className={`sp-tab ${tab === t ? 'active' : ''}`}
            onClick={() => switchTab(t)}
          >
            {tab === t && <span className="sp-tab-check">✓</span>}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════
          TOURNAMENTS TAB
         ════════════════════════════════════════════════════════ */}
      {tab === 'tournaments' && (
        <div className="sp-content">

          {/* Geo Filter Header */}
          <div className="sp-geo-header">
            <span className="sp-geo-label">Select Country, State &amp; City</span>
            <button className="sp-filter-btn" onClick={() => setShowGeoFilter(v => !v)}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="9" y1="18" x2="3" y2="18"/>
              </svg>
              Filter
            </button>
          </div>

          {/* Geo Filter Panel */}
          {showGeoFilter && (
            <div className="sp-geo-panel">
              <div className="sp-geo-field">
                <span className="sp-geo-country">
                  🇮🇳 India
                </span>
              </div>
              <div className="sp-geo-row">
                <div className="sp-geo-select-wrap">
                  <select
                    className="sp-geo-select"
                    value={geoState}
                    onChange={e => { setGeoState(e.target.value); setGeoCity('') }}
                  >
                    <option value="">Select State</option>
                    {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <svg className="sp-select-arrow" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
              <div className="sp-geo-select-wrap sp-geo-city">
                <input
                  className="sp-geo-city-input"
                  type="text"
                  placeholder="Select City"
                  value={geoCity}
                  onChange={e => setGeoCity(e.target.value)}
                  disabled={!geoState}
                />
              </div>
              <button className="sp-geo-search-btn" onClick={handleGeoSearch}>
                Search
              </button>
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="sp-loading">
              <div className="sp-spinner" />
              <span>Searching tournaments...</span>
            </div>
          ) : tournResults.length === 0 ? (
            <div className="sp-empty">No results found</div>
          ) : (
            <div className="sp-list">
              {tournResults.map(t => {
                const s = getTournStatus(t)
                return (
                  <Link key={t.id} to={`/tournaments/${t.id}`} className="sp-tourn-card">
                    <div className="sp-tourn-left">
                      <div className="sp-tourn-avatar">
                        {t.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="sp-tourn-info">
                        <div className="sp-tourn-name">{t.name}</div>
                        <div className="sp-tourn-meta">
                          {t.city_state && <span>📍 {t.city_state}</span>}
                          {t.level && <span>· {t.level}</span>}
                        </div>
                      </div>
                    </div>
                    <span className={`sp-status-badge sp-status-${s}`}>{s}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          PLAYERS TAB
         ════════════════════════════════════════════════════════ */}
      {tab === 'players' && (
        <div className="sp-content">
          <div className="sp-leaderboard-card">
            <div className="sp-lb-header">
              <span className="sp-lb-title">Leaderboard</span>
            </div>

            {/* Raiders / Defenders toggle */}
            <div className="sp-lb-toggle">
              <button
                className={`sp-lb-toggle-btn ${playerTab === 'raiders' ? 'active' : ''}`}
                onClick={() => setPlayerTab('raiders')}
              >
                Raiders
              </button>
              <button
                className={`sp-lb-toggle-btn ${playerTab === 'defenders' ? 'active' : ''}`}
                onClick={() => setPlayerTab('defenders')}
              >
                Defenders
              </button>
            </div>

            {/* Player search within leaderboard */}
            <div className="sp-lb-search-wrap">
              <input
                className="sp-lb-search"
                type="text"
                placeholder="Filter by name..."
                value={playerQuery}
                onChange={e => setPlayerQuery(e.target.value)}
              />
            </div>

            {playerLoading ? (
              <div className="sp-loading">
                <div className="sp-spinner" />
                <span>Loading leaderboard...</span>
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="sp-empty" style={{ padding: '24px' }}>No players found</div>
            ) : (
              <>
                {filteredPlayers.slice(0, 3).map((p, i) => (
                  <Link key={p.id} to={`/players/${p.id}`} className="sp-player-row sp-player-podium">
                    <div
                      className="sp-player-avatar"
                      style={{ background: p.team_color || '#0A1628' }}
                    >
                      {initials(p.name)}
                    </div>
                    <div className="sp-player-info">
                      <div className="sp-player-name">{p.name}</div>
                      <div className="sp-player-pts">
                        {playerTab === 'raiders' ? `Raid Points : ${p.raidPoints}` : `Tackle Points : ${p.tacklePoints}`}
                      </div>
                    </div>
                    <span className="sp-player-medal">{MEDAL_EMOJI[i]}</span>
                  </Link>
                ))}

                {filteredPlayers.length > 3 && (
                  <>
                    <div className="sp-lb-divider" />
                    {filteredPlayers.slice(3).map((p, i) => (
                      <Link key={p.id} to={`/players/${p.id}`} className="sp-player-row">
                        <div className="sp-player-rank">#{i + 4}</div>
                        <div
                          className="sp-player-avatar sp-player-avatar--sm"
                          style={{ background: p.team_color || '#0A1628' }}
                        >
                          {initials(p.name)}
                        </div>
                        <div className="sp-player-info">
                          <div className="sp-player-name">{p.name}</div>
                          <div className="sp-player-pts">
                            {playerTab === 'raiders' ? `${p.raidPoints} Raid Pts` : `${p.tacklePoints} Tackle Pts`}
                          </div>
                        </div>
                        <span className="sp-player-pts-badge">
                          {playerTab === 'raiders' ? p.raidPoints : p.tacklePoints}
                        </span>
                      </Link>
                    ))}
                  </>
                )}
              </>
            )}

            <Link to="/leaderboards" className="sp-view-all-btn">
              View All
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
            </Link>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          TEAMS TAB
         ════════════════════════════════════════════════════════ */}
      {tab === 'teams' && (
        <div className="sp-content">
          {loading ? (
            <div className="sp-loading">
              <div className="sp-spinner" />
              <span>Searching teams...</span>
            </div>
          ) : !query.trim() ? (
            <div className="sp-empty-hint">
              <div className="sp-empty-hint-icon">🏐</div>
              <div className="sp-empty-hint-text">Type a team name to search</div>
            </div>
          ) : teamResults.length === 0 ? (
            <div className="sp-empty">No results found</div>
          ) : (
            <div className="sp-list">
              {teamResults.map(t => (
                <Link key={t.id} to={`/teams/${t.id}`} className="sp-team-card">
                  <div
                    className="sp-team-avatar"
                    style={{ background: t.color || '#0A1628' }}
                  >
                    {initials(t.name)}
                  </div>
                  <div className="sp-team-info">
                    <div className="sp-team-name">{t.name}</div>
                    <div className="sp-team-meta">
                      {t.tournament_name && <span>🏆 {t.tournament_name}</span>}
                      {t.city && <span>📍 {t.city}</span>}
                    </div>
                  </div>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          SCORERS TAB
         ════════════════════════════════════════════════════════ */}
      {tab === 'scorers' && (
        <div className="sp-content">
          {loading ? (
            <div className="sp-loading">
              <div className="sp-spinner" />
              <span>Searching...</span>
            </div>
          ) : !query.trim() ? (
            <div className="sp-empty-hint">
              <div className="sp-empty-hint-icon">👤</div>
              <div className="sp-empty-hint-text">Search registered scorers &amp; coaches</div>
            </div>
          ) : scorerResults.length === 0 ? (
            <div className="sp-empty">No results found</div>
          ) : (
            <div className="sp-list">
              {scorerResults.map(s => (
                <div key={s.id} className="sp-scorer-card">
                  <div className="sp-scorer-avatar">
                    {s.avatar_url
                      ? <img src={s.avatar_url} alt={s.full_name ?? ''} />
                      : initials(s.full_name || s.username || '?')
                    }
                  </div>
                  <div className="sp-scorer-info">
                    <div className="sp-scorer-name">{s.full_name || 'Unknown'}</div>
                    <div className="sp-scorer-meta">
                      {s.username && <span>@{s.username}</span>}
                      {s.phone && <span>📞 {s.phone}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TOAST ───────────────────────────────────────────────── */}
      {toast && (
        <div className="sp-toast">
          {toast}
        </div>
      )}
    </div>
  )
}
