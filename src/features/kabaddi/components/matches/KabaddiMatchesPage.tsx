import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@shared/lib/supabase'
import '../../../../pages/home.css' // Import the global SVG layout styles
import './matches.css'

type MatchStatus = 'live' | 'upcoming' | 'completed' | 'toss_pending' | 'toss_completed' | 'scheduled'

type MatchListItem = {
  id: string
  teamA: { id: string; name: string; shortName: string; score?: number }
  teamB: { id: string; name: string; shortName: string; score?: number }
  status: MatchStatus
  startTime: string
  venue?: string
  currentHalf?: number
  resultText?: string
  tournament?: string
}

function MatchesTabs({ active, onChange }: { active: string; onChange: (v: any) => void }) {
  const tabs = [
    { k: 'top',       label: 'Top' },
    { k: 'live',      label: 'Live' },
    { k: 'upcoming',  label: 'Upcoming' },
    { k: 'completed', label: 'Completed' },
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

function LiveCard({ match }: { match: MatchListItem }) {
  return (
    <Link to={`/matches/${match.id}/live`} className="hp-live-card">
      <div className="hp-live-teams">
        <div className="hp-live-team-col">
          <div className="hp-live-row">
            <span className="hp-live-name">{match.teamA.name}</span>
            <span className="hp-live-score">{match.teamA.score ?? '-'}</span>
          </div>
          <div className="hp-live-row">
            <span className="hp-live-name">{match.teamB.name}</span>
            <span className="hp-live-score">{match.teamB.score ?? '-'}</span>
          </div>
        </div>
        <div className="hp-live-vs">VS</div>
      </div>
      <div className="hp-live-meta">Raid: P{match.currentHalf || 1} | Live</div>
    </Link>
  )
}

function RegularCard({ match }: { match: MatchListItem }) {
  const isCompleted = match.status === 'completed'
  const navUrl = `/matches/${match.id}${isCompleted ? '/summary' : ''}`
  return (
    <Link to={navUrl} className="hp-top-card">
      <div className="hp-top-title">
        {match.teamA.shortName} vs {match.teamB.shortName}
      </div>
      <div className="hp-top-sub">
        {isCompleted 
          ? `Completed • ${match.resultText || match.tournament || 'Match'}`
          : `${match.tournament || 'Scheduled'} • ${new Date(match.startTime).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}`
        }
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
        .select(`
          id, status, home_score, guest_score, period, created_at, scheduled_at,
          tournaments(name),
          home_team:teams!team_home_id(id, name, short),
          guest_team:teams!team_guest_id(id, name, short)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const mapped: MatchListItem[] = (data || []).map((m: any) => {
        const homeName  = m.home_team?.name  || 'Home Team'
        const guestName = m.guest_team?.name || 'Guest Team'
        const homeShort = m.home_team?.short  || homeName.slice(0, 2).toUpperCase()
        const guestShort = m.guest_team?.short || guestName.slice(0, 2).toUpperCase()

        const isCompleted = m.status === 'completed'

        return {
          id: m.id,
          teamA: { id: m.home_team?.id || '', name: homeName,  shortName: homeShort,  score: m.home_score  ?? undefined },
          teamB: { id: m.guest_team?.id || '', name: guestName, shortName: guestShort, score: m.guest_score ?? undefined },
          status: m.status as MatchStatus,
          startTime: m.scheduled_at || m.created_at,
          currentHalf: m.period,
          tournament: m.tournaments?.name,
          resultText: isCompleted
            ? `${(m.home_score || 0) > (m.guest_score || 0) ? homeName : guestName} won`
            : undefined,
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
      const live     = matches.filter(m => m.status === 'live')
      const upcoming = matches.filter(m => ['toss_pending','toss_completed','upcoming','scheduled'].includes(m.status))
      return [...live, ...upcoming.slice(0, 5)]
    }
    if (active === 'live')      return matches.filter(m => m.status === 'live')
    if (active === 'upcoming')  return matches.filter(m => ['toss_pending','toss_completed','upcoming','scheduled'].includes(m.status))
    if (active === 'completed') return matches.filter(m => m.status === 'completed')
    return matches
  }, [active, matches])

  return (
    <div className="hp-page">
      <div className="mx-header">
        <h1 className="mx-title">Matches</h1>
      </div>
      
      <MatchesTabs active={active} onChange={setActive} />
      
      <div className="hp-section" style={{ paddingTop: '16px' }}>
        {loading ? (
          <div className="hp-empty-state">Loading matches...</div>
        ) : filtered.length > 0
          ? filtered.map(m => m.status === 'live' ? <LiveCard key={m.id} match={m} /> : <RegularCard key={m.id} match={m} />)
          : (
            <div className="hp-empty-state">
              No {active === 'top' ? '' : active} matches yet.
            </div>
          )
        }
      </div>
    </div>
  )
}