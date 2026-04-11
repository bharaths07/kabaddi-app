import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@shared/lib/supabase'
import '../../../../pages/home.css' 
import './matches.css'

type MatchStatus = 'live' | 'upcoming' | 'completed' | 'toss_pending' | 'toss_completed' | 'scheduled'

type MatchListItem = {
  id: string
  teamA: { id: string; name: string; shortName: string; score?: number }
  teamB: { id: string; name: string; shortName: string; score?: number }
  status: MatchStatus
  startTime: string
  currentHalf?: number
  tournament?: string
}

function MatchesTabs({ active, onChange }: { active: string; onChange: (v: any) => void }) {
  const tabs = [
    { k: 'top',       label: 'Top Picks' },
    { k: 'live',      label: 'Live Now' },
    { k: 'upcoming',  label: 'Upcoming' },
    { k: 'completed', label: 'Results' },
  ]
  return (
    <div className="mx-tabs">
      {tabs.map(t => (
        <button key={t.k} className={`mx-tab ${active === t.k ? 'active' : ''}`} onClick={() => onChange(t.k)}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

function MatchCard({ match }: { match: MatchListItem }) {
  const isLive = match.status === 'live' || match.status.includes('toss')
  const isCompleted = match.status === 'completed'
  const navUrl = `/matches/${match.id}${isCompleted ? '/summary' : isLive ? '/live' : ''}`

  return (
    <Link to={navUrl} className={`mx-card ${isLive ? 'is-live' : ''}`}>
      {isLive ? (
        <div className="mx-badge live"><span className="mx-live-dot"></span> Live Now</div>
      ) : isCompleted ? (
        <div className="mx-badge completed">Final Result</div>
      ) : (
        <div className="mx-badge upcoming">Coming Up</div>
      )}

      <div className="mx-teams-row">
        <div className="mx-team-block">
          <div className="mx-team-name">{match.teamA.name}</div>
          <div className="mx-team-short">{match.teamA.shortName}</div>
        </div>

        <div className="mx-score-block">
          <span className="mx-vs-label">{isLive ? `P${match.currentHalf || 1}` : 'VS'}</span>
          <div className="mx-score-val">
            {(isLive || isCompleted) ? `${match.teamA.score ?? 0} : ${match.teamB.score ?? 0}` : '-- : --'}
          </div>
        </div>

        <div className="mx-team-block guest">
          <div className="mx-team-name">{match.teamB.name}</div>
          <div className="mx-team-short">{match.teamB.shortName}</div>
        </div>
      </div>

      <div className="mx-footer-row">
        <div className="mx-meta-item">
          <span style={{ fontSize: '1rem' }}>🏆</span> {match.tournament || 'Season match'}
        </div>
        <div className="mx-meta-item" style={{ gap: '1rem' }}>
          {!isCompleted && !isLive && (
            <span>{new Date(match.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          )}
          <span className="mx-btn-link">{isLive ? 'Watch Live →' : isCompleted ? 'Summary →' : 'Match Info →'}</span>
        </div>
      </div>
    </Link>
  )
}

export default function KabaddiMatchesPage() {
  const [active, setActive] = useState<'top' | 'live' | 'upcoming' | 'completed'>('top')
  const [matches, setMatches] = useState<MatchListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  async function fetchMatches() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('kabaddi_matches')
        .select('id, status, home_score, guest_score, period, created_at, home_team:teams!team_home_id(id, name, short), guest_team:teams!team_guest_id(id, name, short)')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const mapped: MatchListItem[] = (data || []).map((m: any) => {
        const homeName  = m.home_team?.name  || 'Home Team'
        const guestName = m.guest_team?.name || 'Guest Team'
        const homeShort = m.home_team?.short  || homeName.slice(0, 2).toUpperCase()
        const guestShort = m.guest_team?.short || guestName.slice(0, 2).toUpperCase()

        return {
          id: m.id,
          teamA: { id: m.home_team?.id || '', name: homeName,  shortName: homeShort,  score: m.home_score  ?? undefined },
          teamB: { id: m.guest_team?.id || '', name: guestName, shortName: guestShort, score: m.guest_score ?? undefined },
          status: m.status as MatchStatus,
          startTime: m.created_at,
          currentHalf: m.period,
          tournament: 'Season Match',
        }
      })

      setMatches(mapped)
    } catch (e) {
      console.error('Matches fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (active === 'top') {
      const live     = matches.filter(m => m.status === 'live' || m.status.includes('toss'))
      const upcoming = matches.filter(m => ['upcoming','scheduled'].includes(m.status))
      return [...live, ...upcoming.slice(0, 5)]
    }
    if (active === 'live')      return matches.filter(m => m.status === 'live' || m.status.includes('toss'))
    if (active === 'upcoming')  return matches.filter(m => ['upcoming','scheduled'].includes(m.status))
    if (active === 'completed') return matches.filter(m => m.status === 'completed')
    return matches
  }, [active, matches])

  return (
    <div className="mx-overhaul">
      <header className="mx-header">
        <div className="mx-header-content">
          <div className="mx-header-sub">International Arena</div>
          <h1>Matches</h1>
        </div>
      </header>
      
      <MatchesTabs active={active} onChange={setActive} />
      
      <div className="mx-container">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#B0A89C' }}>Searching for matches...</div>
        ) : filtered.length > 0 ? (
          filtered.map(m => <MatchCard key={m.id} match={m} />)
        ) : (
          <div className="mx-empty-card">
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📡</div>
            <strong style={{ display: 'block' }}>No {active === 'top' ? '' : active} matches found</strong>
            <span style={{ color: '#7A746A', fontSize: '0.9rem' }}>Check back later or explore other tournaments.</span>
          </div>
        )}
      </div>
    </div>
  )
}