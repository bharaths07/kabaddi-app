import React, { useMemo, useState } from 'react'
import './home.css'
import { Link } from 'react-router-dom'

export default function Home() {
  const live = useMemo(() => [
    { id: 'm2', tournament: 'SKBC', home: 'SKBC', guest: 'Rangers', score: { h: 18, g: 15 }, half: 1, time: '05:21', raid: 7, dateLabel: 'Today' },
    { id: 'm3', tournament: 'Warriors Cup', home: 'Warriors', guest: 'Titans', score: { h: 12, g: 10 }, half: 1, time: '03:02', raid: 3, dateLabel: 'Today' },
  ], [])

  const upcoming = useMemo(() => [
    { id: 'u1', dateLabel: 'Today',    time: '7:00 PM', home: 'SKBC',   guest: 'Rangers', tournament: 'SKBC', score: { h: 0, g: 0 }  },
    { id: 'u2', dateLabel: 'Tomorrow', time: '6:00 PM', home: 'Falcons', guest: 'Spartans', tournament: 'Warriors Cup', score: { h: 0, g: 0 } },
    { id: 'u3', dateLabel: 'Feb 28',   time: '5:30 PM', home: 'Wolves', guest: 'Titans', tournament: 'Warriors Cup', score: { h: 0, g: 0 }   },
  ], [])

  const feed = useMemo(() => [
    { id: 'f1', title: 'SKBC defeated Rangers (34–29)',   date: 'Feb 10, 2026', sub: 'Ashu Malik scored 12 raid points.' },
    { id: 'f2', title: 'Super Raid!',                     date: 'Feb 12, 2026', sub: 'Ajay scored 3 points in a single raid.' },
    { id: 'f3', title: 'Tournament Announcement',         date: 'Feb 15, 2026', sub: 'Spring Kabaddi Cup starts Mar 1.' },
  ], [])

  const [featuredLive, ...otherLive] = live
  const hasLive = live.length > 0
  const hero = hasLive ? featuredLive : upcoming[0]
  const [q, setQ] = useState('')
  const stats = useMemo(() => ([
    { label: 'Tournaments', value: 12, sub: 'Active this season', tone: 'sky' },
    { label: 'Teams',       value: 38, sub: 'Across tournaments', tone: 'green' },
    { label: 'Players',     value: 524, sub: 'Registered',        tone: 'gold' },
  ]), [])
  const trending = useMemo(() => [
    { id: 'tm1', home: 'Titans', guest: 'Wolves', score: '34–32', tag: 'Completed' },
    { id: 'tm2', home: 'SKBC', guest: 'Rangers', score: '29–27', tag: 'Completed' },
    { id: 'tm3', home: 'Falcons', guest: 'Spartans', score: 'Live', tag: 'Live' },
  ], [])
  const shortcuts = [
    { href: '/matches', label: 'Matches', emoji: '📅' },
    { href: '/leaderboards',    label: 'Leaderboards', emoji: '🏆' },
    { href: '/tournaments',     label: 'Tournaments', emoji: '🎟️' },
    { href: '/me/posters',      label: 'Posters', emoji: '🖼️' },
  ]

  // Mock data for search
  const ALL_PLAYERS = [
    { id: 'p1', name: 'Pradeep Narwal', team: 'Wolves' },
    { id: 'p2', name: 'Maninder Singh', team: 'Rangers' },
    { id: 'p3', name: 'Fazel Atrachali', team: 'Titans' },
    { id: 'p4', name: 'Pawan Sehrawat', team: 'Wolves' },
  ]
  const ALL_TEAMS = [
    { id: 't1', name: 'Rangers', short: 'RG' },
    { id: 't2', name: 'Titans', short: 'TT' },
    { id: 't3', name: 'Wolves', short: 'WV' },
  ]

  const searchResults = useMemo(() => {
    if (!q.trim()) return null
    const query = q.toLowerCase()
    return {
      players: ALL_PLAYERS.filter(p => p.name.toLowerCase().includes(query)),
      teams: ALL_TEAMS.filter(t => t.name.toLowerCase().includes(query))
    }
  }, [q])

  const filteredUpcoming = useMemo(() => {
    if (!q.trim()) return upcoming;
    const query = q.toLowerCase();
    return upcoming.filter(m => 
      m.home.toLowerCase().includes(query) || 
      m.guest.toLowerCase().includes(query)
    );
  }, [q, upcoming]);

  return (
    <div className="home-page">

      {/* ── TOP BAR ── */}
      <div className="home-section" style={{ gap: 10 }}>
        <div className="section-header" style={{ justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
          <div className="section-title">Dashboard</div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ position:'relative' }}>
              <Link to="/notifications" className="btn btn-ghost btn-sm">🔔</Link>
              <span style={{ position:'absolute', right:-6, top:-6, background:'#ef4444', color:'#fff', borderRadius:999, fontSize:10, fontWeight:900, padding:'2px 6px' }}>3</span>
            </div>
          </div>
        </div>
        <div className="input-wrapper" style={{ position: 'relative' }}>
          <span className="input-icon">🔎</span>
          <input value={q} onChange={e=>setQ(e.target.value)} className="input" placeholder="Search teams, players, matches" />
          
          {/* Search Dropdown */}
          {searchResults && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderRadius: 16, marginTop: 8, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 100, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
              {searchResults.players.length > 0 && (
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Players</div>
                  {searchResults.players.map(p => (
                    <Link key={p.id} to={`/players/${p.name.toLowerCase().replace(/\s+/g, '-')}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', textDecoration: 'none' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🏃</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{p.team}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {searchResults.teams.length > 0 && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Teams</div>
                  {searchResults.teams.map(t => (
                    <Link key={t.id} to={`/teams/${t.name.toLowerCase().replace(/\s+/g, '-')}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', textDecoration: 'none' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🛡️</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>{t.name}</div>
                    </Link>
                  ))}
                </div>
              )}
              {searchResults.players.length === 0 && searchResults.teams.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                  No results found for "{q}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="home-hero">
        {hasLive ? (
          <div className="hero-card live">
            <div className="hero-top">
              <div className="hero-badge">LIVE NOW</div>
              <div className="hero-title">{hero.tournament}</div>
            </div>
            <div className="hero-score">
              <Link to={`/teams/${hero.home.toLowerCase().replace(/\s+/g, '-')}`} className="hero-team" style={{ textDecoration: 'none', color: 'inherit' }}>{hero.home}</Link>
              <div className="hero-scoreline">
                {hero.score.h} <span className="hero-sep">-</span> {hero.score.g}
              </div>
              <Link to={`/teams/${hero.guest.toLowerCase().replace(/\s+/g, '-')}`} className="hero-team" style={{ textDecoration: 'none', color: 'inherit' }}>{hero.guest}</Link>
            </div>
            <div className="hero-meta">1st Half • {hero.time}</div>
            <Link to={`/matches/${hero.id}`} className="hero-cta">
              View Live
            </Link>
          </div>
        ) : (
          <div className="hero-card upcoming">
            <div className="hero-top">
              <div className="hero-badge upcoming">Next Match</div>
            </div>
            <div className="hero-versus">
              <div className="hero-team">{hero.home}</div>
              <div className="hero-vs">vs</div>
              <div className="hero-team">{hero.guest}</div>
            </div>
            <div className="hero-meta">{hero.dateLabel} • {hero.time}</div>
            <Link to={`/matches/${hero.id}`} className="hero-cta">
              View Match
            </Link>
          </div>
        )}
      </div>

      {/* ── QUICK STATS ── */}
      <div className="home-section">
        <div className="section-label sky">Quick Stats</div>
        <div className="stats-row">
          {stats.map(s => (
            <div key={s.label} className={`stat-card ${s.tone}`}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── OTHER LIVE MATCHES ── */}
      {otherLive.length > 0 && (
        <div className="home-section">
          <div className="section-header">
            <div className="section-title">Live Matches</div>
            <Link to="/kabaddi/matches" className="section-link">See all</Link>
          </div>
          <div className="live-cards">
            {otherLive.map(m => (
              <Link key={m.id} to={`/matches/${m.id}`} className="live-card">
                <div className="live-left">
                  {m.home} <span className="live-sep">-</span> {m.guest}
                </div>
                <div className="live-right">
                  <div className="live-meta">Half {m.half} • Raid {m.raid}</div>
                  <div className="live-score">{m.score.h}–{m.score.g}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── TRENDING MATCHES ── */}
      <div className="home-section">
        <div className="section-header">
          <div className="section-title">Trending Matches</div>
          <Link to="/matches" className="section-link">See all</Link>
        </div>
        <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom: 4 }}>
          {trending.map(t => (
            <Link key={t.id} to={`/matches/${t.id}`} style={{ flex:'0 0 auto', minWidth: 220, background:'var(--bg-surface)', border:'1px solid var(--bg-border)', borderRadius:12, padding:'12px 14px', textDecoration:'none', boxShadow:'var(--shadow-xs)' }}>
              <div style={{ fontWeight:800, color:'var(--text-primary)' }}>{t.home} vs {t.guest}</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:700 }}>{t.tag}</div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:900, color:'var(--color-orange)', marginTop:6 }}>{t.score}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── UPCOMING ── */}
      <div className="home-section">
        <div className="section-header">
          <div className="section-title">Upcoming Matches</div>
          <Link to="/matches" className="section-link">See all</Link>
        </div>
        <div className="upcoming-list">
          {filteredUpcoming.map(m => (
            <Link key={m.id} to={`/matches/${m.id}`} className="up-card">
              <div className="up-date">{m.dateLabel}</div>
              <div className="up-versus">{m.home} vs {m.guest}</div>
              <div className="up-time">{m.time}</div>
            </Link>
          ))}
          {filteredUpcoming.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              No matches found for "{q}"
            </div>
          )}
        </div>
      </div>

      {/* ── SHORTCUTS ── */}
      <div className="home-section">
        <div className="section-header">
          <div className="section-title">Quick Access</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:10 }}>
          {shortcuts.map(s => (
            <Link key={s.href} to={s.href} className="btn btn-ghost" style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontWeight:900 }}>{s.label}</span>
              <span>{s.emoji}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── NEWS ── */}
      <div className="home-section">
        <div className="section-header">
          <div className="section-title">News & Updates</div>
          <Link to="/feed" className="section-link">See all</Link>
        </div>
        <div className="feed-list">
          {feed.map(f => (
            <div key={f.id} className="feed-card">
              <div className="feed-title">{f.title}</div>
              <div className="feed-date">{f.date}</div>
              <div className="feed-sub">{f.sub}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
