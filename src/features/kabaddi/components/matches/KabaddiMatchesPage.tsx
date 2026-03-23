import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@shared/lib/supabase'
import './matches.css'

type MatchStatus = 'live' | 'upcoming' | 'completed' | 'toss_pending' | 'toss_completed'

type MatchListItem = {
  id: string
  teamA: { id: string; name: string; shortName: string; score?: number }
  teamB: { id: string; name: string; shortName: string; score?: number }
  status: MatchStatus
  startTime: string
  venue?: string
  currentHalf?: number
  resultText?: string
}

function MatchesTabs({ active, onChange }: { active: string; onChange: (v: any) => void }) {
  const tabs = [
    { k: 'top',       label: 'Top Matches' },
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

function MatchCard({ match }: { match: MatchListItem }) {
  const navigate = useNavigate()
  const displayStatus = match.status === 'toss_pending' || match.status === 'toss_completed' ? 'upcoming' : match.status
  const onOpen = () => {
    if (match.status === 'completed') navigate(`/matches/${match.id}/summary`)
    else if (match.status === 'live') navigate(`/matches/${match.id}/live`)
    else navigate(`/matches/${match.id}`)
  }
  return (
    <div className="mx-card" onClick={onOpen}>
      <div className="mx-topline">
        <div className={`mx-status ${displayStatus}`}>
          {displayStatus === 'live' ? '● Live' : displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
        </div>
      </div>
      <div className="mx-versus">
        <div className="mx-side">
          <div className="mx-badge">{match.teamA.shortName}</div>
          <div className="mx-score">{match.teamA.score ?? '-'}</div>
          <div className="mx-name">{match.teamA.name}</div>
        </div>
        <div className="mx-mid">-</div>
        <div className="mx-side right">
          <div className="mx-badge">{match.teamB.shortName}</div>
          <div className="mx-score">{match.teamB.score ?? '-'}</div>
          <div className="mx-name">{match.teamB.name}</div>
        </div>
      </div>
      {match.status === 'live' && (
        <div className="mx-livebar">Half {match.currentHalf || 1} • Live</div>
      )}
      {match.status === 'completed' && match.resultText && (
        <div className="mx-subtle">{match.resultText}</div>
      )}
    </div>
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
          id, status, home_score, guest_score, period, created_at,
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
        const isLive      = m.status === 'live'

        return {
          id: m.id,
          teamA: { id: m.home_team?.id || '', name: homeName,  shortName: homeShort,  score: m.home_score  ?? undefined },
          teamB: { id: m.guest_team?.id || '', name: guestName, shortName: guestShort, score: m.guest_score ?? undefined },
          status: m.status as MatchStatus,
          startTime: m.created_at,
          currentHalf: m.period,
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
      const upcoming = matches.filter(m => m.status === 'toss_pending' || m.status === 'toss_completed' || m.status === 'upcoming')
      return [...live, ...upcoming.slice(0, 3)]
    }
    if (active === 'live')      return matches.filter(m => m.status === 'live')
    if (active === 'upcoming')  return matches.filter(m => ['toss_pending','toss_completed','upcoming'].includes(m.status))
    if (active === 'completed') return matches.filter(m => m.status === 'completed')
    return matches
  }, [active, matches])

  return (
    <div className="mx-page">
      <div className="mx-header">
        <h1 className="mx-title">Matches</h1>
        <div className="mx-subtitle">Live, upcoming and completed</div>
      </div>
      <MatchesTabs active={active} onChange={setActive} />
      <div className="mx-list">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mx-card" style={{ opacity: 0.5 }}>
              <div style={{ height: 12, background: '#e2e8f0', borderRadius: 6, width: '40%', marginBottom: 12 }} />
              <div style={{ height: 40, background: '#e2e8f0', borderRadius: 8 }} />
            </div>
          ))
        ) : filtered.length > 0
          ? filtered.map(m => <MatchCard key={m.id} match={m} />)
          : (
            <div className="mx-empty">
              <div className="mx-empty-icon">📅</div>
              <div className="mx-empty-title">No {active === 'top' ? '' : active} matches yet</div>
              <div className="mx-empty-text">Start a match to see it here.</div>
            </div>
          )
        }
      </div>
    </div>
  )
}