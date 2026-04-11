import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../shared/lib/supabase'
import { useAuth } from '../shared/context/AuthContext'
import { fetchGlobalStandings, TeamStandingResult } from '../shared/services/standingsService'
import { getTopPlayers } from '../shared/services/tournamentService'
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
  const [standings, setStandings] = useState<TeamStandingResult[]>([])
  const [topRaiders, setTopRaiders] = useState<any[]>([])
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [matchRes, newsRes, feedRes, standingsData, playersData, tournamentRes] = await Promise.allSettled([
        supabase.from('kabaddi_matches')
          .select(`id,status,home_score,guest_score,period,created_at,
            home_team:teams!team_home_id(id,name),
            guest_team:teams!team_guest_id(id,name)`)
          .in('status', ['live','toss_pending','toss_completed','scheduled','completed'])
          .order('created_at', { ascending:false })
          .limit(10),
        supabase.from('news_posts').select('*').order('created_at', { ascending: false }).limit(4),
        supabase.from('feed_posts').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(3),
        fetchGlobalStandings(),
        getTopPlayers(),
        supabase.from('tournaments').select('*').eq('status', 'ongoing').limit(3)
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
              homeShort: m.home_team?.short || m.home_team?.name?.slice(0, 2).toUpperCase() || 'HO',
              guest: m.guest_team?.name || 'Guest',
              guestShort: m.guest_team?.short || m.guest_team?.name?.slice(0, 2).toUpperCase() || 'GU',
              homeScore: m.home_score || 0,
              guestScore: m.guest_score || 0,
              period: m.period || 1
            })
          } else {
            upcom.push({
              id: m.id,
              home: m.home_team?.name || 'Home',
              homeShort: m.home_team?.short || m.home_team?.name?.slice(0, 2).toUpperCase() || 'HO',
              guest: m.guest_team?.name || 'Guest',
              guestShort: m.guest_team?.short || m.guest_team?.name?.slice(0, 2).toUpperCase() || 'GU',
              scheduledAt: m.created_at
            })
          }
        })
        setLiveMatches(live)
        setUpcoming(upcom.slice(0, 3))
      }

      if (newsRes.status === 'fulfilled' && newsRes.value.data) setNews(newsRes.value.data)
      if (feedRes.status === 'fulfilled' && feedRes.value.data) setFeed(feedRes.value.data)
      if (standingsData.status === 'fulfilled') setStandings(standingsData.value.slice(0, 5))
      if (playersData.status === 'fulfilled') setTopRaiders(playersData.value.sort((a:any, b:any) => b.score - a.score).slice(0, 3))
      if (tournamentRes.status === 'fulfilled' && tournamentRes.value.data) setTournaments(tournamentRes.value.data)

    } catch (e) {
      console.error('Home fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="hp-overhaul">
      {/* ── HERO ── */}
      <section className="hp-hero">
        <div className="hp-hero-pattern"></div>
        <div className="hp-hero-content">
          <div className="hp-hero-eyebrow">Season 2025 · Pro Kabaddi League</div>
          <h1>The Heart<em>of Kabaddi</em></h1>
          <p>Live scores, real-time stats, tournament brackets, and every raid — all in one place.</p>
          <div className="hp-hero-cta-row">
            <Link to="/matches" className="hp-btn-white">Watch Live →</Link>
            <Link to="/matches" className="hp-btn-outline-white">View Schedule</Link>
          </div>
        </div>
        <div className="hp-hero-card">
          <div className="hp-hero-card-label"><span className="hp-live-dot"></span> Live Now</div>
          {liveMatches.length === 0 ? (
            <div className="hp-hero-card-empty">No live matches at the moment.<br />Next match is tomorrow.</div>
          ) : (
            <div className="hp-hero-next-match">
              <div className="hp-hero-next-teams">
                <span>{liveMatches[0].home}</span>
                <span className="hp-hero-next-vs">VS</span>
                <span>{liveMatches[0].guest}</span>
              </div>
              <div className="hp-hero-next-meta">Live Now · Period {liveMatches[0].period}</div>
              <Link to={`/matches/${liveMatches[0].id}/live`} className="hp-btn-white" style={{ fontSize: '0.75rem', padding: '0.5rem 1.2rem', display: 'inline-block', marginTop: '8px' }}>Watch Match</Link>
            </div>
          )}
          <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px' }}>
            <div className="hp-hero-card-label" style={{ marginBottom: '8px' }}>Up Next</div>
            {upcoming.length > 0 ? (
              <div className="hp-hero-next-match">
                <div className="hp-hero-next-teams">
                  <span>{upcoming[0].homeShort}</span>
                  <span className="hp-hero-next-vs">VS</span>
                  <span>{upcoming[0].guestShort}</span>
                </div>
                <div className="hp-hero-next-meta">Scheduled · {new Date(upcoming[0].scheduledAt).toLocaleDateString()}</div>
              </div>
            ) : (
              <div className="hp-hero-card-empty" style={{ padding: '0.5rem 0' }}>Stay tuned for more.</div>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="hp-stats-bar">
        <div className="hp-stat-item">
          <div className="hp-stat-num">12</div>
          <div className="hp-stat-label">Teams<br />competing</div>
        </div>
        <div className="hp-stat-item">
          <div className="hp-stat-num">{liveMatches.length}</div>
          <div className="hp-stat-label">Live<br />matches</div>
        </div>
        <div className="hp-stat-item">
          <div className="hp-stat-num">138+</div>
          <div className="hp-stat-label">Matches<br />this season</div>
        </div>
        <div className="hp-stat-item">
          <div className="hp-stat-num">{tournaments.length || 4}</div>
          <div className="hp-stat-label">Active<br />tournaments</div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="hp-main">
        <div className="hp-content">
          {/* LIVE MATCHES */}
          <div className="hp-section">
            <div className="hp-section-header">
              <div className="hp-section-title"><span className="hp-live-dot"></span> Live Matches</div>
              <Link to="/matches" className="hp-section-see-all">See all →</Link>
            </div>
            {liveMatches.length === 0 ? (
              <div className="hp-empty-state">
                <div style={{ fontSize: '1.8rem', opacity: 0.5 }}>📡</div>
                <strong>No live matches right now</strong>
                <span>We'll update instantly when a match goes live.</span>
              </div>
            ) : (
              liveMatches.map(m => (
                <Link key={m.id} to={`/matches/${m.id}/live`} className="hp-match-card">
                  <div className="hp-match-badge">Live Now · Period {m.period}</div>
                  <div className="hp-match-teams">
                    <div className="hp-match-versus">
                      <span>{m.home}</span>
                      <span className="hp-vs">VS</span>
                      <span>{m.guest}</span>
                    </div>
                    <div className="hp-match-meta">{m.homeScore} - {m.guestScore}</div>
                  </div>
                  <div style={{ color: '#B0A89C', fontSize: '1.1rem' }}>›</div>
                </Link>
              ))
            )}
          </div>

          {/* UPCOMING */}
          <div className="hp-section">
            <div className="hp-section-header">
              <div className="hp-section-title">Upcoming Matches</div>
              <Link to="/matches" className="hp-section-see-all">Full schedule →</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="hp-empty-state">No upcoming matches scheduled.</div>
            ) : (
              upcoming.map(m => (
                <Link key={m.id} to={`/matches/${m.id}`} className="hp-match-card">
                  <div className="hp-match-badge">{new Date(m.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · Scheduled</div>
                  <div className="hp-match-teams">
                    <div className="hp-match-versus">
                      <span>{m.home}</span>
                      <span className="hp-vs">VS</span>
                      <span>{m.guest}</span>
                    </div>
                    <div className="hp-match-meta">League Match</div>
                  </div>
                  <div style={{ color: '#B0A89C', fontSize: '1.1rem' }}>›</div>
                </Link>
              ))
            )}
          </div>

          {/* NEWS */}
          <div className="hp-section">
            <div className="hp-section-header">
              <div className="hp-section-title">📰 News</div>
              <Link to="/news" className="hp-section-see-all">See all →</Link>
            </div>
            <div className="hp-news-grid">
              {news.length === 0 ? (
                <div className="hp-empty-state" style={{ gridColumn: 'span 2' }}>No news updates yet.</div>
              ) : (
                news.map(n => (
                  <Link key={n.id} to="/news" className="hp-news-card">
                    <div className="hp-news-thumb">{n.type === 'tournament' ? '🏆' : (n.type === 'player' ? '⚡' : '📊')}</div>
                    <div className="hp-news-body">
                      <div className="hp-news-tag">{n.type?.toUpperCase() || 'UPDATE'}</div>
                      <div className="hp-news-title">{n.title}</div>
                      <div className="hp-news-date">{new Date(n.created_at).toLocaleDateString()}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* SOCIAL FEED */}
          <div className="hp-section">
            <div className="hp-section-header">
              <div className="hp-section-title">📣 Social Feed</div>
              <Link to="/feed" className="hp-section-see-all">See all →</Link>
            </div>
            <div className="hp-feed-grid">
              {feed.length === 0 ? (
                <div className="hp-empty-state" style={{ gridColumn: 'span 2' }}>No social posts available.</div>
              ) : (
                feed.map(f => (
                  <div key={f.id} className="hp-feed-card">
                    <div className="hp-feed-header">
                      <div className="hp-feed-avatar">{f.profiles?.full_name?.slice(0, 2).toUpperCase() || 'KP'}</div>
                      <div>
                        <div className="hp-feed-user">{f.profiles?.full_name || 'User'}</div>
                        <div className="hp-feed-handle">@{f.profiles?.full_name?.split(' ')[0].toLowerCase() || 'user'}</div>
                      </div>
                    </div>
                    <div className="hp-feed-text">{f.caption || f.content}</div>
                    {f.match_id && (
                      <div className="hp-feed-result">
                        <span style={{ color: '#F07800' }}>Match Result</span>
                        <span>Click to view</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="hp-sidebar">
          <div className="hp-sidebar-section">
            <div className="hp-sidebar-title">Team Rankings</div>
            {standings.length === 0 ? (
              <div className="hp-empty-state" style={{ padding: '1rem' }}>No data.</div>
            ) : (
              standings.map((s, idx) => (
                <div key={s.id} className="hp-rank-row">
                  <div className={`hp-rank-num ${idx < 3 ? 'hp-top' : ''}`}>{idx + 1}</div>
                  <div className="hp-rank-team">
                    <div className="hp-rank-team-name">{s.name}</div>
                  </div>
                  <div className="hp-rank-pts">{s.points}</div>
                </div>
              ))
            )}
            <div style={{ marginTop: '12px' }}>
              <Link to="/leaderboards" className="hp-section-see-all">Full standings →</Link>
            </div>
          </div>

          <div className="hp-sidebar-section">
            <div className="hp-sidebar-title">Active Tournaments</div>
            {tournaments.length === 0 ? (
              <div className="hp-empty-state" style={{ padding: '1rem' }}>No active tournaments.</div>
            ) : (
              tournaments.map(t => (
                <div key={t.id} className="hp-tournament-card">
                  <div className="hp-tournament-name">{t.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#7A746A' }}>{t.location || 'India'}</div>
                  <span className="hp-tournament-badge">Ongoing</span>
                </div>
              ))
            )}
          </div>

          <div className="hp-sidebar-section">
            <div className="hp-sidebar-title">Top Raiders This Week</div>
            {topRaiders.length === 0 ? (
              <div className="hp-empty-state" style={{ padding: '1rem' }}>No raider data.</div>
            ) : (
              topRaiders.map((p, idx) => (
                <div key={p.id} className="hp-rank-row">
                  <div className={`hp-rank-num ${idx < 3 ? 'hp-top' : ''}`}>{idx + 1}</div>
                  <div className="hp-rank-team">
                    <div className="hp-rank-team-name">{p.name}</div>
                    <div style={{ fontSize: '0.65rem', color: '#B0A89C' }}>{p.team}</div>
                  </div>
                  <div className="hp-rank-pts">{p.score}</div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}