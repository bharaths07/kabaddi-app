import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../shared/lib/supabase'
import { useAuth } from '../shared/context/AuthContext'
import './home.css'

interface LiveMatch {
  id: string
  status: string
  home: string; homeShort: string
  guest: string; guestShort: string
  homeScore: number; guestScore: number
  period: number; tournament?: string
}

interface UpcomingMatch {
  id: string
  home: string; homeShort: string
  guest: string; guestShort: string
  scheduledAt: string; tournament?: string
}

export default function Home() {
  const { user, profile } = useAuth()
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([])
  const [upcoming, setUpcoming] = useState<UpcomingMatch[]>([])
  const [news, setNews] = useState<any[]>([])
  const [feed, setFeed] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [matchRes, newsRes, feedRes] = await Promise.allSettled([
        supabase.from('kabaddi_matches')
          .select(`id,status,home_score,guest_score,period,created_at,
            scheduled_at, tournaments(name),
            home_team:teams!team_home_id(id,name,short),
            guest_team:teams!team_guest_id(id,name,short)`)
          .in('status', ['live','toss_pending','toss_completed','scheduled','completed'])
          .order('created_at', { ascending:false })
          .limit(10),
        supabase.from('news_posts').select('*').order('created_at', { ascending: false }).limit(2),
        supabase.from('feed_posts').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(3)
      ])

      if (matchRes.status === 'fulfilled' && matchRes.value.data) {
        const live: LiveMatch[] = []
        const upcom: UpcomingMatch[] = []
        matchRes.value.data.forEach((m:any) => {
          const isLive = ['live','toss_pending','toss_completed'].includes(m.status)
          if (isLive) {
            live.push({
              id: m.id,
              status: m.status,
              home: m.home_team?.name || 'Home',
              homeShort: m.home_team?.short || 'HO',
              guest: m.guest_team?.name || 'Guest',
              guestShort: m.guest_team?.short || 'GU',
              homeScore: m.home_score || 0,
              guestScore: m.guest_score || 0,
              period: m.period || 1,
              tournament: m.tournaments?.name
            })
          } else {
            upcom.push({
              id: m.id,
              home: m.home_team?.name || 'Home',
              homeShort: m.home_team?.short || 'HO',
              guest: m.guest_team?.name || 'Guest',
              guestShort: m.guest_team?.short || 'GU',
              scheduledAt: m.scheduled_at || m.created_at,
              tournament: m.tournaments?.name
            })
          }
        })
        setLiveMatches(live)
        setUpcoming(upcom)
      }

      if (newsRes.status === 'fulfilled' && newsRes.value.data) setNews(newsRes.value.data)
      if (feedRes.status === 'fulfilled' && feedRes.value.data) setFeed(feedRes.value.data)

    } catch (e) {
      console.error('Home fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="hp-page">
      {/* ── HERO ── */}
      <div className="hp-hero">
        <h1 className="hp-hero-title">KABADDIPULSE</h1>
        <div className="hp-hero-sub">The Heart of Kabaddi</div>
        <Link to="/kabaddi/create" className="hp-hero-btn">TRY NOW</Link>
      </div>

      {/* ── LIVE MATCHES ── */}
      <div className="hp-section">
        <div className="hp-section-header">
          <span className="hp-live-indicator">🔴</span> Live Matches
        </div>
        {loading ? (
          <div className="hp-empty-state">Loading...</div>
        ) : liveMatches.length === 0 ? (
          <div className="hp-empty-state">No live matches at the moment.</div>
        ) : (
          liveMatches.map(m => (
            <Link key={m.id} to={`/matches/${m.id}/live`} className="hp-live-card">
              <div className="hp-live-teams">
                <div className="hp-live-team-col">
                  <div className="hp-live-row">
                    <span className="hp-live-name">{m.home}</span>
                    <span className="hp-live-score">{m.homeScore}</span>
                  </div>
                  <div className="hp-live-row">
                    <span className="hp-live-name">{m.guest}</span>
                    <span className="hp-live-score">{m.guestScore}</span>
                  </div>
                </div>
                <div className="hp-live-vs">VS</div>
              </div>
              <div className="hp-live-meta">Raid: P{m.period} | Live</div>
            </Link>
          ))
        )}
      </div>

      {/* ── NEWS ── */}
      <div className="hp-section">
        <div className="hp-section-header">
          <span>📰 News</span>
          <Link to="/news" className="hp-see-all">See all →</Link>
        </div>
        <div className="hp-news-list">
          {news.length === 0 && !loading ? (
            <div className="hp-empty-state">No official updates yet.</div>
          ) : (
            news.map(n => (
              <Link key={n.id} to="/news" className="hp-news-preview-card">
                <div className="hp-news-type-tag">{n.type.toUpperCase()}</div>
                <div className="hp-news-card-title">{n.title}</div>
                <div className="hp-news-card-meta">{new Date(n.created_at).toLocaleDateString()}</div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* ── FEED PREVIEW ── */}
      <div className="hp-section">
        <div className="hp-section-header">
          <span>📸 Social Feed</span>
          <Link to="/feed" className="hp-see-all">See all →</Link>
        </div>
        <div className="hp-feed-grid">
          {feed.length === 0 && !loading ? (
            <div className="hp-empty-state">No social posts yet.</div>
          ) : (
            feed.map(f => (
              <Link key={f.id} to="/feed" className="hp-feed-preview-item">
                {f.image_url ? (
                  <img src={f.image_url} alt="feed" />
                ) : (
                  <div className="hp-feed-text-preview">{f.caption}</div>
                )}
                <div className="hp-feed-author-tag">@{f.profiles?.full_name?.split(' ')[0] || 'User'}</div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* ── TOP MATCHES ── */}
      <div className="hp-section">
        <div className="hp-section-header">Top Matches</div>
        {loading ? (
          <div className="hp-empty-state">Loading...</div>
        ) : upcoming.length === 0 ? (
          <div className="hp-empty-state">No other matches available.</div>
        ) : (
          upcoming.map(m => (
            <Link key={m.id} to={`/matches/${m.id}`} className="hp-top-card">
              <div className="hp-top-title">
                {m.homeShort} vs {m.guestShort}
              </div>
              <div className="hp-top-sub">
                {m.tournament || 'Local Match'} • {new Date(m.scheduledAt).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}