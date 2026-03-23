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

const MOCK_AWARDS: Award[] = [
  {
    id:'mvp', icon:'⚡', title:'Most Valuable Player', subtitle:'MVP of the Season',
    color:'#f59e0b', gradient:'linear-gradient(135deg,#92400e,#b45309,#d97706)',
    glowColor:'rgba(245,158,11,0.25)', borderColor:'rgba(245,158,11,0.4)', bg:'#fffbeb',
    player:{ id: '1', name:'Pavan Kumar', initials:'PK', team:'SKBC Varadanayakanahalli', city:'Bengaluru', avatarColor:'#0ea5e9' },
    stat:{ value:'312', label:'Total Points', detail:'28 matches · Season 2024' },
    reason:'Dominant across all formats — raids, tackles and bonus points. Led SKBC to the KPL title.',
    tournament:'KPL 2024', season:'Spring Season',
  },
  {
    id:'raider', icon:'🏉', title:'Best Raider', subtitle:'Raider of the Season',
    color:'#0ea5e9', gradient:'linear-gradient(135deg,#0c4a6e,#0369a1,#0ea5e9)',
    glowColor:'rgba(14,165,233,0.25)', borderColor:'rgba(14,165,233,0.4)', bg:'#eff6ff',
    player:{ id: '2', name:'Rahul Sharma', initials:'RS', team:'CSE B Rangers', city:'Mysuru', avatarColor:'#7c3aed' },
    stat:{ value:'248', label:'Raid Points', detail:'74% success rate · 6.8 avg' },
    reason:'Unmatched raiding technique with consistent bonus points across every match.',
    tournament:'KPL 2024', season:'Spring Season',
  },
  {
    id:'defender', icon:'🛡️', title:'Best Defender', subtitle:'Defender of the Season',
    color:'#16a34a', gradient:'linear-gradient(135deg,#14532d,#15803d,#16a34a)',
    glowColor:'rgba(22,163,74,0.25)', borderColor:'rgba(22,163,74,0.4)', bg:'#f0fdf4',
    player:{ id: '3', name:'Suresh Naik', initials:'SN', team:'SKBC Varadanayakanahalli', city:'Bengaluru', avatarColor:'#ea580c' },
    stat:{ value:'92', label:'Tackle Points', detail:'14 super tackles · 3.8 avg' },
    reason:'Rock-solid defender with lightning-fast reactions. Made 14 super tackles this season.',
    tournament:'KPL 2024', season:'Spring Season',
  },
  {
    id:'allrounder', icon:'🎯', title:'Best All-Rounder', subtitle:'Complete Player Award',
    color:'#7c3aed', gradient:'linear-gradient(135deg,#3b0764,#6d28d9,#7c3aed)',
    glowColor:'rgba(124,58,237,0.25)', borderColor:'rgba(124,58,237,0.4)', bg:'#f5f3ff',
    player:{ id: '4', name:'Kiran Reddy', initials:'KR', team:'Warriors FC', city:'Hubli', avatarColor:'#16a34a' },
    stat:{ value:'178', label:'Combined Points', detail:'96 raid + 82 tackle pts' },
    reason:'Equal threat in attack and defence. Only player to score 90+ in both raid and tackle this season.',
    tournament:'Spring Cup 2024', season:'Spring Season',
  },
  {
    id:'supertackle', icon:'💪', title:'Super Tackle King', subtitle:'Most Super Tackles',
    color:'#ef4444', gradient:'linear-gradient(135deg,#7f1d1d,#b91c1c,#ef4444)',
    glowColor:'rgba(239,68,68,0.25)', borderColor:'rgba(239,68,68,0.4)', bg:'#fef2f2',
    player:{ id: '5', name:'Dev Patil', initials:'DP', team:'Titans Kabaddi', city:'Dharwad', avatarColor:'#f59e0b' },
    stat:{ value:'21', label:'Super Tackles', detail:'In 24 matches · +21 bonus pts' },
    reason:'Fearless under pressure. Consistently performed super tackles with 3 or fewer defenders on court.',
    tournament:'KPL 2024', season:'Spring Season',
  },
  {
    id:'rising', icon:'🌟', title:'Rising Star', subtitle:'Best New Player',
    color:'#db2777', gradient:'linear-gradient(135deg,#500724,#9d174d,#db2777)',
    glowColor:'rgba(219,39,119,0.25)', borderColor:'rgba(219,39,119,0.4)', bg:'#fdf2f8',
    player:{ id: '6', name:'Ajay Kumar', initials:'AK', team:'Spartans United', city:'Belgaum', avatarColor:'#0284c7' },
    stat:{ value:'142', label:'Points (Debut Season)', detail:'First year player · 18 matches' },
    reason:'Exceptional debut season for a 19-year-old. Already drawing comparisons to senior raiders.',
    tournament:'KPL 2024', season:'Spring Season',
  },
];

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
  const [season, setSeason] = useState(SEASONS[0]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const winners = await getAwards();
      if (winners.length > 0) {
        // Map service winners to Award interface
        const mappedAwards: Award[] = winners.map(w => ({
          id: w.id,
          icon: w.icon,
          title: w.title,
          subtitle: w.subtitle,
          color: w.color,
          gradient: MOCK_AWARDS.find(ma => ma.id === w.id)?.gradient || MOCK_AWARDS[0].gradient,
          glowColor: MOCK_AWARDS.find(ma => ma.id === w.id)?.glowColor || MOCK_AWARDS[0].glowColor,
          borderColor: MOCK_AWARDS.find(ma => ma.id === w.id)?.borderColor || MOCK_AWARDS[0].borderColor,
          bg: MOCK_AWARDS.find(ma => ma.id === w.id)?.bg || MOCK_AWARDS[0].bg,
          player: {
            id: w.player.id,
            name: w.player.name,
            initials: w.player.name.split(' ').map((n:any)=>n[0]).join('').toUpperCase().slice(0, 2),
            team: w.player.team,
            city: 'Local',
            avatarColor: w.player.color
          },
          stat: {
            value: w.statValue,
            label: w.statLabel,
            detail: w.statDetail
          },
          reason: w.reason,
          tournament: 'Current Season',
          season: season
        }));
        setAwards(mappedAwards);
      } else {
        setAwards(MOCK_AWARDS); // Fallback if no data exists yet
      }
      setLoading(false);
    })();
  }, [season]);

  if (loading) return <div style={{ padding: 100, textAlign: 'center', color: '#fff', background: '#0f172a', minHeight: '100vh', fontFamily: 'Rajdhani, sans-serif' }}>Calculating Season Awards...</div>

  const [mvp, ...rest] = awards.length > 0 ? awards : MOCK_AWARDS;

  return (
    <div className="awards-page">
      {/* Header */}
      <div className="awards-header">
        <div className="awards-header-decoration"/>
        <div className="awards-header-inner">
          <div className="awards-header-top">
            <div className="awards-trophy-icon">🏆</div>
            <div>
              <h1 className="awards-title">Play Kabaddi Awards</h1>
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
        <div className="awards-divider">
          <div className="awards-divider-line"/>
          <span className="awards-divider-text">{season} · 6 Awards</span>
          <div className="awards-divider-line"/>
        </div>

        {/* MVP hero */}
        <div className="awards-hero-wrap">
          <HeroAwardCard award={mvp}/>
        </div>

        {/* Grid */}
        <div className="awards-grid">
          {rest.map(a => <AwardCard key={a.id} award={a}/>)}
        </div>

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