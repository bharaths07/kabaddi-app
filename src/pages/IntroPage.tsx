import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './IntroPage.css';

const FEATURES = [
  {
    icon: '⚡',
    title: 'Start a Match Instantly',
    desc: 'Pick two teams, configure your rules, and go live in under 60 seconds. No paperwork, no delays.',
    color: '#0ea5e9',
    bg: '#eff6ff',
  },
  {
    icon: '📊',
    title: 'Live Scoring with Player Stats',
    desc: 'Track every raid, tackle, and All-Out in real time. Know your top raider and best defender after every match.',
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  {
    icon: '🏆',
    title: 'Tournament Management',
    desc: 'Create full tournaments with teams, fixtures, and schedules. Manage everything from one dashboard.',
    color: '#ea580c',
    bg: '#fff7ed',
  },
  {
    icon: '📋',
    title: 'Leaderboards & Rankings',
    desc: 'Season stats, team standings, top raiders and defenders — all updated automatically after every match.',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    icon: '🎨',
    title: 'Match Posters & Sharing',
    desc: 'Auto-generate beautiful match posters, player cards, and victory announcements. Share on WhatsApp in one tap.',
    color: '#db2777',
    bg: '#fdf2f8',
  },
  {
    icon: '🛡️',
    title: 'Full Kabaddi Rule Engine',
    desc: 'Super Tackle, Do-or-Die raids, Bonus line, All-Out revival — every official rule built in correctly.',
    color: '#d97706',
    bg: '#fffbeb',
  },
];

const STEPS = [
  { n: '01', title: 'Create Account', desc: 'Sign up with phone, email, or Google in 30 seconds.' },
  { n: '02', title: 'Start a Match', desc: 'Select teams, set match type and duration, do the toss.' },
  { n: '03', title: 'Score Live', desc: 'Tap to record every raid and tackle. Stats update instantly.' },
  { n: '04', title: 'Share Results', desc: 'Generate a match poster and share with your team on WhatsApp.' },
];

const STATS = [
  { value: '100%', label: 'Kabaddi Rules', sub: 'All official rules built in' },
  { value: '30s', label: 'Raid Clock', sub: 'Auto-enforced per raid' },
  { value: 'Live', label: 'Real-time Sync', sub: 'Scores update instantly' },
  { value: 'Free', label: 'To Start', sub: 'No credit card needed' },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

export default function IntroPage() {
  const navigate = useNavigate();
  const featRef  = useInView();
  const stepsRef = useInView();
  const statsRef = useInView();
  const ctaRef   = useInView();

  return (
    <div className="intro-page">

      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav className="intro-nav">
        <div className="intro-nav-inner">
          <div className="intro-nav-logo">
            <img src="/assets/logo.png" alt="KabaddiPulse" height="32" style={{ objectFit: 'contain', marginRight: '8px' }} />
            <span className="intro-nav-brand">KabaddiPulse</span>
          </div>
          <button className="intro-nav-btn" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="intro-hero">
        <div className="intro-hero-bg">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-grid" />
        </div>

        <div className="intro-hero-content">
          <div className="intro-badge">
            <span className="intro-badge-dot" />
            India's Kabaddi Management Platform
          </div>

          <h1 className="intro-hero-title">
            Score Every Raid.<br />
            <span className="intro-hero-accent">Win Every Match.</span>
          </h1>

          <p className="intro-hero-sub">
            KabaddiPulse is the complete kabaddi scoring app — start a match in seconds,
            score every raid with full player stats, manage tournaments, and share
            results with your team instantly.
          </p>

          <div className="intro-hero-actions">
            <button
              className="intro-cta-primary"
              onClick={() => navigate('/login')}
            >
              Get Started Free →
            </button>
            <button
              className="intro-cta-demo"
              onClick={() => navigate('/demo')}
            >
              🚀 Explore Demo
            </button>
            <button
              className="intro-cta-secondary"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </button>
          </div>

          <p className="intro-hero-note">
            No credit card · Works on mobile · Free to start
          </p>
        </div>

        {/* Hero visual — mini scorer mockup */}
        <div className="intro-hero-visual">
          <div className="hero-card hero-card-main">
            <div className="hero-card-top">
              <span className="hero-live-dot" />
              <span className="hero-live-label">LIVE · Raid 14</span>
              <span className="hero-half">Half 1 · 12:34</span>
            </div>
            <div className="hero-score-row">
              <div className="hero-team">
                <div className="hero-team-avatar" style={{ background: '#0ea5e9' }}>SK</div>
                <div className="hero-team-name">SKBC</div>
                <div className="hero-team-score" style={{ color: '#0ea5e9' }}>24</div>
              </div>
              <div className="hero-vs">VS</div>
              <div className="hero-team">
                <div className="hero-team-avatar" style={{ background: '#ef4444' }}>CB</div>
                <div className="hero-team-name">CSE B</div>
                <div className="hero-team-score" style={{ color: '#ef4444' }}>18</div>
              </div>
            </div>
            <div className="hero-event-row">
              <span className="hero-event">⚡ Pavan Kumar +2 pts</span>
              <span className="hero-event-time">Just now</span>
            </div>
          </div>

          <div className="hero-card hero-card-stat">
            <div className="hero-stat-label">Top Raider</div>
            <div className="hero-stat-name">Pavan Kumar</div>
            <div className="hero-stat-pts">14 raid pts</div>
          </div>

          <div className="hero-card hero-card-alert">
            <span>💪</span>
            <span>Super Tackle! +2 to CSE B</span>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────── */}
      <div ref={statsRef.ref} className={`intro-stats ${statsRef.inView ? 'in-view' : ''}`}>
        {STATS.map((s, i) => (
          <div key={i} className="intro-stat-item" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="intro-stat-value">{s.value}</div>
            <div className="intro-stat-label">{s.label}</div>
            <div className="intro-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section id="features" className="intro-section">
        <div ref={featRef.ref} className={`intro-section-inner ${featRef.inView ? 'in-view' : ''}`}>
          <div className="intro-section-label">Everything You Need</div>
          <h2 className="intro-section-title">Built for Kabaddi.<br />From the ground up.</h2>
          <p className="intro-section-sub">
            Every feature is designed around how kabaddi is actually played —
            not adapted from cricket or football.
          </p>

          <div className="intro-features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="intro-feature-card"
                style={{ animationDelay: `${i * 0.08}s`, '--accent': f.color, '--bg': f.bg } as any}
              >
                <div className="intro-feature-icon">{f.icon}</div>
                <h3 className="intro-feature-title">{f.title}</h3>
                <p className="intro-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="intro-section intro-section-alt">
        <div ref={stepsRef.ref} className={`intro-section-inner ${stepsRef.inView ? 'in-view' : ''}`}>
          <div className="intro-section-label">How It Works</div>
          <h2 className="intro-section-title">From signup to<br />live score in minutes.</h2>

          <div className="intro-steps">
            {STEPS.map((s, i) => (
              <div key={i} className="intro-step" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="intro-step-num">{s.n}</div>
                <div className="intro-step-connector" />
                <div className="intro-step-body">
                  <div className="intro-step-title">{s.title}</div>
                  <div className="intro-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RULE ENGINE HIGHLIGHT ────────────────────────────────── */}
      <section className="intro-section">
        <div className="intro-section-inner">
          <div className="intro-section-label">Rule Engine</div>
          <h2 className="intro-section-title">Every kabaddi rule.<br />Handled automatically.</h2>
          <p className="intro-section-sub">
            The umpire doesn't need to know tech. The app knows the rules.
          </p>

          <div className="intro-rules-grid">
            {[
              { icon: '⚡', rule: 'Raid Points', detail: '+1, +2, +3 per defender tagged' },
              { icon: '🛡️', rule: 'Tackle Points', detail: '+1 or +2 per tackle' },
              { icon: '💪', rule: 'Super Tackle', detail: 'Auto +1 bonus when ≤3 defenders' },
              { icon: '🎯', rule: 'Bonus Line', detail: 'Awarded when 6+ defenders on court' },
              { icon: '💥', rule: 'All-Out / Lona', detail: '+2 bonus, all 7 players revived' },
              { icon: '⚠️', rule: 'Do-or-Die Raid', detail: 'Auto-enforced after 2 empty raids' },
              { icon: '🔄', rule: 'Player Revival', detail: '1 player revives per point scored' },
              { icon: '⏱️', rule: '30s Raid Clock', detail: 'Auto empty raid on timeout' },
            ].map((r, i) => (
              <div key={i} className="intro-rule-chip">
                <span className="intro-rule-icon">{r.icon}</span>
                <div>
                  <div className="intro-rule-name">{r.rule}</div>
                  <div className="intro-rule-detail">{r.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section ref={ctaRef.ref} className={`intro-cta-section ${ctaRef.inView ? 'in-view' : ''}`}>
        <div className="intro-cta-inner">
          <div className="intro-cta-icon">🏉</div>
          <h2 className="intro-cta-title">Ready to score your first match?</h2>
          <p className="intro-cta-sub">
            Join kabaddi organizers, scorers, and players across Karnataka.<br />
            Free to start. No setup required.
          </p>
          <button
            className="intro-cta-primary intro-cta-large"
            onClick={() => navigate('/login')}
          >
            Start for Free →
          </button>
          <p className="intro-cta-note">Sign up with phone, email, or Google</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="intro-footer">
        <div className="intro-footer-inner">
          <div className="intro-footer-logo">
            <div className="intro-nav-icon" style={{ width: 28, height: 28, fontSize: 14 }}>🏉</div>
            <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 900, fontSize: 16, color: '#1e293b' }}>
              KabaddiPulse
            </span>
          </div>
          <div className="intro-footer-tagline">
            Kabaddi Tournament & Scoring Platform
          </div>
          <div className="intro-footer-links" style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
            <a href="mailto:kabaddipulse.official@gmail.com" className="intro-footer-link" style={{ textDecoration: 'none' }}>✉️ kabaddipulse.official@gmail.com</a>
            <a href="https://www.instagram.com/kabaddipulse_official?igsh=MWZobmQyeWpsc2dxZA==" target="_blank" rel="noreferrer" className="intro-footer-link" style={{ textDecoration: 'none' }}>📸 Instagram</a>
          </div>
          <div className="intro-footer-links">
            <button className="intro-footer-link" onClick={() => navigate('/login')}>Sign In</button>
            <button className="intro-footer-link" onClick={() => navigate('/signup')}>Create Account</button>
          </div>
          <div className="intro-footer-copy">
            Built with ❤️ for kabaddi players across India
          </div>
        </div>
      </footer>

    </div>
  );
}