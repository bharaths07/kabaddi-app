import React, { useMemo } from 'react'
import './home.css'
import { Link } from 'react-router-dom'

export default function Home() {
  const live = useMemo(() => [
    { id: 'm2', tournament: 'SKBC', home: 'SKBC', guest: 'Rangers', score: { h: 18, g: 15 }, half: 1, time: '05:21', raid: 7 },
    { id: 'm3', tournament: 'Warriors Cup', home: 'Warriors', guest: 'Titans', score: { h: 12, g: 10 }, half: 1, time: '03:02', raid: 3 }
  ], [])
  const upcoming = useMemo(() => [
    { id: 'u1', dateLabel: 'Today', time: '7:00 PM', home: 'SKBC', guest: 'Rangers' },
    { id: 'u2', dateLabel: 'Tomorrow', time: '6:00 PM', home: 'Falcons', guest: 'Spartans' },
    { id: 'u3', dateLabel: 'Feb 28', time: '5:30 PM', home: 'Wolves', guest: 'Titans' }
  ], [])
  const feed = useMemo(() => [
    { id: 'f1', title: 'SKBC defeated Rangers (34–29)', date: 'Feb 10, 2026', sub: 'Ashu Malik scored 12 raid points.' },
    { id: 'f2', title: 'Super Raid!', date: 'Feb 12, 2026', sub: 'Ajay scored 3 points in a single raid.' },
    { id: 'f3', title: 'Tournament Announcement', date: 'Feb 15, 2026', sub: 'Spring Kabaddi Cup starts Mar 1.' }
  ], [])

  const featuredLive = live[0]
  const otherLive = live.slice(1)
  const hasLive = live.length > 0
  const hero = hasLive ? featuredLive : upcoming[0]

  return (
    <div className="home-page">
      <div className="home-hero">
        {hasLive ? (
          <div className="hero-card live">
            <div className="hero-top">
              <div className="hero-badge">LIVE NOW</div>
              <div className="hero-title">{hero.tournament}</div>
            </div>
            <div className="hero-score">
              <div className="hero-team">{hero.home}</div>
              <div className="hero-scoreline">{hero.score.h} <span className="hero-sep">-</span> {hero.score.g}</div>
              <div className="hero-team">{hero.guest}</div>
            </div>
            <div className="hero-meta">1st Half • {hero.time}</div>
            <Link to={`/kabaddi/match/${hero.id}/live`} className="hero-cta">View Live</Link>
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
            <Link to={`/kabaddi/match/${hero.id}`} className="hero-cta">View Match</Link>
          </div>
        )}
      </div>

      {otherLive.length > 0 && (
        <div className="home-section">
          <div className="section-title">Live Matches</div>
          <div className="live-cards">
            {otherLive.map(m => (
              <Link key={m.id} to={`/kabaddi/match/${m.id}/live`} className="live-card">
                <div className="live-row">
                  <div className="live-left">{m.home} <span className="live-sep">-</span> {m.guest}</div>
                  <div className="live-score">{m.score.h}-{m.score.g}</div>
                </div>
                <div className="live-meta">Half {m.half} • Raid {m.raid}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="home-section">
        <div className="section-title">Upcoming Matches</div>
        <div className="upcoming-list">
          {upcoming.slice(0, 5).map(m => (
            <Link key={m.id} to={`/kabaddi/match/${m.id}`} className="up-card">
              <div className="up-date">{m.dateLabel}</div>
              <div className="up-versus">{m.home} vs {m.guest}</div>
              <div className="up-time">{m.time}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="home-section">
        <div className="section-title">News & Updates</div>
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
