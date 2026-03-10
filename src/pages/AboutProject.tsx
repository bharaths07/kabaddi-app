import React from 'react'
import './AboutProject.css'
import { Link } from 'react-router-dom'

export default function AboutProject() {
  return (
    <div className="ap-page">
      <header className="ap-header">
        <div className="ap-header-glow" />
        <h1 className="ap-title">Play Legends (Game Legends)</h1>
        <p className="ap-subtitle">The Digital Revolution for Every Kabaddi Legend</p>
        <span className="ap-badge">Professional Ecosystem</span>
      </header>

      <section className="ap-grid">
        <div className="ap-card">
          <div className="ap-card-icon">⚡</div>
          <h2 className="ap-card-title">Live Scoring Engine</h2>
          <p className="ap-card-desc">Professional real-time scoring interface with advanced metrics (Raids, Tackles, Super Raids, All-Outs) that brings PKL-level analytics to every tournament.</p>
        </div>

        <div className="ap-card">
          <div className="ap-card-icon">🎨</div>
          <h2 className="ap-card-title">Poster Engine</h2>
          <p className="ap-card-desc">Automatic generation of high-quality social media posters, trading cards, and victory graphics for players to build their digital identity and personal brand.</p>
        </div>

        <div className="ap-card">
          <div className="ap-card-icon">🏆</div>
          <h2 className="ap-card-title">Tournament Management</h2>
          <p className="ap-card-desc">End-to-end automation for tournament organizers. From team registration to automated scheduling and leaderboard management.</p>
        </div>

        <div className="ap-card">
          <div className="ap-card-icon">📊</div>
          <h2 className="ap-card-title">Career Statistics</h2>
          <p className="ap-card-desc">A comprehensive database of player performances across multiple tournaments, creating a professional digital resume for every athlete.</p>
        </div>
      </section>

      <section className="ap-features">
        <h2 className="ap-section-title">Key Features at a Glance</h2>
        <div className="ap-features-grid">
          <div className="ap-feature-item">✓ Real-time Kabaddi Scoring</div>
          <div className="ap-feature-item">✓ Automated Player Stats</div>
          <div className="ap-feature-item">✓ Social Media Poster Generation</div>
          <div className="ap-feature-item">✓ Tournament &amp; Schedule Management</div>
          <div className="ap-feature-item">✓ Player &amp; Team Profiles</div>
          <div className="ap-feature-item">✓ Live Match Dashboard</div>
        </div>
      </section>

      <div className="ap-stats-row">
        <div className="ap-stat-item">
          <span className="ap-stat-value">#1</span>
          <span className="ap-stat-label">Most Watched Indian Sport</span>
        </div>
        <div className="ap-stat-item">
          <span className="ap-stat-value">1000+</span>
          <span className="ap-stat-label">Active Local Tournaments</span>
        </div>
        <div className="ap-stat-item">
          <span className="ap-stat-value">100%</span>
          <span className="ap-stat-label">Digital Transformation</span>
        </div>
      </div>

      <div className="ap-cta">
        <h2 className="ap-cta-title">Ready to digitize your tournament?</h2>
        <Link to="/tournaments" className="ap-cta-btn">Start Managing Now</Link>
      </div>
    </div>
  )
}
