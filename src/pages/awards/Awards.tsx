import { useState, useEffect } from 'react';
import './awards.css';
import { getAwards } from '../../shared/services/tournamentService';

// ── Types ─────────────────────────────────────────────────────────
interface AwardPlayer {
  id: string;
  name: string;
  initials: string;
  team: string;
  city: string;
  avatarColor: string;
}
interface AwardStat {
  value: string;
  label: string;
  detail: string;
}
interface Award {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  gradient: string;
  glowColor: string;
  borderColor: string;
  bg: string;
  player: AwardPlayer;
  stat: AwardStat;
  reason: string;
  tournament: string;
  season: string;
}

const SEASONS = ['KPL 2024', 'Spring Cup 2024', 'Winter Championship 2023'];

// ── Avatar ────────────────────────────────────────────────────────
function Avatar({ initials, color, size = 52 }: { initials: string; color: string; size?: number }) {
  return (
    <div className="award-avatar" style={{
      width: size, height: size, fontSize: size * 0.3,
      background: `linear-gradient(135deg,${color},${color}cc)`,
      boxShadow: `0 3px 12px ${color}44`,
    }}>
      {initials}
    </div>
  );
}

// ── Trophy badge ──────────────────────────────────────────────────
function TrophyBadge({ gradient, icon, color, size = 48 }: { gradient: string; icon: string; color: string; size?: number }) {
  return (
    <div className="trophy-badge" style={{
      width: size, height: size, fontSize: size * 0.42,
      background: gradient,
      borderRadius: size * 0.28,
      boxShadow: `0 4px 16px ${color}55`,
    }}>
      {icon}
    </div>
  );
}

// ── Hero MVP Card ─────────────────────────────────────────────────
function HeroAwardCard({ award }: { award: Award }) {
  const { icon, title, subtitle, color, gradient, glowColor, borderColor, player, stat, reason, tournament, season } = award;
  return (
    <div className="hero-award-card" style={{ 
      borderColor: 'rgba(255,255,255,0.1)', 
      boxShadow: `0 20px 50px ${glowColor}` 
    }}>
      <div className="hero-award-banner" style={{ background: gradient }}>
        <div className="hero-award-banner-circles"/>
        <div className="hero-award-top-row">
          <TrophyBadge gradient="rgba(255,255,255,0.15)" icon={icon} color={color} size={52}/>
          <div className="hero-award-title-block">
            <div className="hero-award-title" style={{ color: '#fff' }}>{title}</div>
            <div className="hero-award-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>{subtitle}</div>
          </div>
          <div className="hero-award-crown-badge">👑 Season Award</div>
        </div>
        <div className="hero-award-player-row">
          <Avatar initials={player.initials} color={player.avatarColor} size={80}/>
          <div className="hero-award-player-info">
            <div className="hero-award-player-name" style={{ color: '#fff' }}>{player.name}</div>
            <div className="hero-award-player-team" style={{ color: 'rgba(255,255,255,0.9)' }}>{player.team}</div>
            <div className="hero-award-player-city" style={{ color: 'rgba(255,255,255,0.6)' }}>📍 {player.city}</div>
          </div>
          <div className="hero-award-stat-block">
            <div className="hero-award-stat-value" style={{ color: '#fff' }}>{stat.value}</div>
            <div className="hero-award-stat-label" style={{ color: 'rgba(255,255,255,0.7)' }}>{stat.label}</div>
            <div className="hero-award-stat-detail" style={{ color: 'rgba(255,255,255,0.5)' }}>{stat.detail}</div>
          </div>
        </div>
      </div>
      <div className="hero-award-bottom" style={{ background: '#1e293b' }}>
        <p className="hero-award-reason" style={{ color: '#94a3b8' }}>"{reason}"</p>
        <div className="hero-award-meta">
          <div className="hero-award-tournament" style={{ color }}>{tournament}</div>
          <div className="hero-award-season" style={{ color: '#64748b' }}>{season}</div>
        </div>
      </div>
    </div>
  );
}

// ── Regular Award Card ────────────────────────────────────────────
function AwardCard({ award }: { award: Award }) {
  const { icon, title, subtitle, color, gradient, glowColor, borderColor, bg, player, stat, reason, tournament } = award;
  return (
    <div className="award-card"
      style={{ background: '#1e293b', borderColor: 'rgba(255,255,255,0.05)' }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = borderColor;
        el.style.boxShadow = `0 12px 36px ${glowColor}`;
        el.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'rgba(255,255,255,0.05)';
        el.style.boxShadow = 'none';
        el.style.transform = 'translateY(0)';
      }}
    >
      <div className="award-card-top-strip" style={{ background: gradient }}/>
      <div className="award-card-header">
        <div className="award-card-title-row">
          <TrophyBadge gradient={gradient} icon={icon} color={color} size={44}/>
          <div>
            <div className="award-card-title" style={{ color: '#fff' }}>{title}</div>
            <div className="award-card-subtitle" style={{ color: '#64748b' }}>{subtitle}</div>
          </div>
        </div>
        <div className="award-card-player-row">
          <Avatar initials={player.initials} color={player.avatarColor} size={48}/>
          <div className="award-card-player-info">
            <div className="award-card-player-name" style={{ color: '#fff' }}>{player.name}</div>
            <div className="award-card-player-team" style={{ color: '#64748b' }}>{player.team}</div>
          </div>
          <div className="award-card-stat">
            <div className="award-card-stat-value" style={{ color }}>{stat.value}</div>
            <div className="award-card-stat-label" style={{ color: '#64748b' }}>{stat.label}</div>
          </div>
        </div>
      </div>
      <div className="award-card-footer" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
        <p className="award-card-reason" style={{ color: '#94a3b8' }}>"{reason}"</p>
        <div className="award-card-meta-row">
          <div className="award-card-detail" style={{ color: '#64748b' }}>{stat.detail}</div>
          <div className="award-card-tournament-badge" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}>
            {tournament}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(SEASONS[0]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getAwards();
      setAwards(data || []);
      setLoading(false);
    })();
  }, [season]);

  if (loading) return <div style={{ padding: 100, textAlign: 'center', color: '#fff', background: '#0f172a', minHeight: '100vh', fontFamily: 'Rajdhani, sans-serif' }}>Calculating Season Awards...</div>

  const mvp = awards.find(a => a.id === 'mvp');
  const rest = awards.filter(a => a.id !== 'mvp');

  return (
    <div className="awards-page">
      {/* Header section */}
      <div className="awards-header">
        <div className="awards-header-content">
          <div className="awards-header-top">
            <div className="awards-logo-wrap">
              <div className="awards-logo">🏆</div>
            </div>
            <div className="awards-header-text">
              <h1 className="awards-title">Play Legends Awards</h1>
              <p className="awards-subtitle">Recognising the best talent across Karnataka's kabaddi leagues</p>
            </div>
          </div>
          <div className="awards-season-tabs">
            {SEASONS.map(s => (
              <button key={s} className={`awards-season-tab ${season === s ? 'awards-season-tab-active' : ''}`}
                onClick={() => setSeason(s)}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="awards-content">
        {awards.length === 0 ? (
          <div className="awards-empty">
            <div className="awards-empty-icon">🏆</div>
            <h2 className="awards-empty-title">No awards found for {season}</h2>
            <p className="awards-empty-sub">Awards are announced at the end of each tournament season.</p>
          </div>
        ) : (
          <>
            <div className="awards-divider">
              <div className="awards-divider-line"/>
              <span className="awards-divider-text">{season} · {awards.length} Awards</span>
              <div className="awards-divider-line"/>
            </div>

            {/* MVP hero */}
            {mvp && (
              <div className="awards-hero-wrap">
                <HeroAwardCard award={mvp}/>
              </div>
            )}

            {/* Grid */}
            <div className="awards-grid">
              {rest.map(a => <AwardCard key={a.id} award={a}/>)}
            </div>
          </>
        )}

        {/* Info note */}
        <div className="awards-info-note">
          <div className="awards-info-icon">ℹ️</div>
          <div>
            <div className="awards-info-title">How Awards Are Determined</div>
            <div className="awards-info-body">
              Awards are calculated automatically from live match data at the end of each season.
              Stats include all matches within the selected tournament or season.
              Only players who participated in 5+ matches are eligible.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}