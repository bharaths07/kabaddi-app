import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';
import { supabase } from '../shared/lib/supabase';
import './player-profile.css';

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  city?: string;
  state?: string;
  created_at: string;
}

interface PlayerStats {
  matches: number;
  wins: number;
  raidPts: number;
  tacklePts: number;
  avgRaid: number;
  avgTackle: number;
  followers: number;
  profileViews: number;
  teamRank: number;
  tournaments: number;
}

interface MatchRecord {
  id: string;
  opponent: string;
  result: 'W' | 'L';
  score: string;
  raids: number;
  tackles: number;
  pts: number;
  date: string;
}

// ── Fallback mock (until Supabase connected) ──────────────────────
const MOCK_STATS: PlayerStats = {
  matches:42, wins:28, raidPts:312, tacklePts:146,
  avgRaid:7.4, avgTackle:3.6, followers:120, profileViews:40,
  teamRank:3, tournaments:6,
};
const MOCK_MATCHES: MatchRecord[] = [
  { id:'1', opponent:'CSE B',      result:'W', score:'36-28', raids:8, tackles:3, pts:18, date:'Mar 10' },
  { id:'2', opponent:'Rangers FC', result:'W', score:'42-31', raids:6, tackles:5, pts:14, date:'Mar 7'  },
  { id:'3', opponent:'Warriors',   result:'L', score:'24-29', raids:4, tackles:2, pts:9,  date:'Mar 3'  },
  { id:'4', opponent:'Titans',     result:'W', score:'38-22', raids:9, tackles:4, pts:21, date:'Feb 28' },
  { id:'5', opponent:'Spartans',   result:'W', score:'31-25', raids:7, tackles:6, pts:16, date:'Feb 24' },
];
const MOCK_ACHIEVEMENTS = [
  { icon:'⚡', title:'Raid Master',   desc:'100+ raid points in a season',    earned:true,  date:'Mar 2024' },
  { icon:'🏆', title:'Champion',      desc:'Won a tournament as team captain', earned:true,  date:'Feb 2024' },
  { icon:'💪', title:'Super Tackler', desc:'5 super tackles in one match',     earned:true,  date:'Jan 2024' },
  { icon:'🎯', title:'Bonus Hunter',  desc:'10 bonus points in a season',      earned:true,  date:'Dec 2023' },
  { icon:'🔥', title:'Unstoppable',   desc:'Win 10 matches in a row',          earned:false, date:null       },
  { icon:'👑', title:'Legend',        desc:'500+ total points career',         earned:false, date:null       },
];

// ── Helper: initials from name ────────────────────────────────────
function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ── Win rate ring ─────────────────────────────────────────────────
function WinRing({ wins, total }: { wins: number; total: number }) {
  const pct = total > 0 ? Math.round((wins / total) * 100) : 0;
  const r = 38, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="win-ring-wrap">
      <div className="win-ring-svg-wrap">
        <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="48" cy="48" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <circle cx="48" cy="48" r={r} fill="none" stroke="#0ea5e9" strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="win-ring-label">
          <div className="win-ring-pct">{pct}%</div>
          <div className="win-ring-sub">WIN RATE</div>
        </div>
      </div>
      <div className="win-ring-count">{wins}/{total} matches</div>
    </div>
  );
}

// ── Match row ─────────────────────────────────────────────────────
function MatchRow({ match }: { match: MatchRecord }) {
  const won = match.result === 'W';
  return (
    <div className="match-row">
      <div className={`match-result-badge ${won ? 'match-win' : 'match-loss'}`}>{match.result}</div>
      <div className="match-info">
        <div className="match-opp">vs {match.opponent}</div>
        <div className="match-date">{match.date}</div>
      </div>
      <div className="match-score-col">
        <div className="match-score">{match.score}</div>
        <div className="match-score-label">score</div>
      </div>
      <div className="match-stats-cols">
        {[
          { label: 'raids',   val: match.raids,   cls: 'stat-blue'   },
          { label: 'tackles', val: match.tackles, cls: 'stat-purple' },
          { label: 'pts',     val: match.pts,     cls: 'stat-green'  },
        ].map(s => (
          <div key={s.label} className="match-stat-col">
            <div className={`match-stat-val ${s.cls}`}>{s.val}</div>
            <div className="match-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Achievement card ──────────────────────────────────────────────
function AchievementCard({ icon, title, desc, earned, date }: {
  icon: string; title: string; desc: string; earned: boolean; date: string | null;
}) {
  return (
    <div className={`achievement-card ${earned ? 'achievement-earned' : 'achievement-locked'}`}>
      <div className={`achievement-icon ${earned ? 'achievement-icon-earned' : 'achievement-icon-locked'}`}>
        {earned ? icon : '🔒'}
      </div>
      <div className="achievement-body">
        <div className="achievement-title">{title}</div>
        <div className="achievement-desc">{desc}</div>
      </div>
      {earned && date && <div className="achievement-date">{date}</div>}
      {!earned && <div className="achievement-locked-label">Locked</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
export default function PlayerProfilePage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'matches' | 'achievements'>('overview');

  // TODO: Replace with real Supabase queries when connected
  const stats   = MOCK_STATS;
  const matches = MOCK_MATCHES;
  const achievements = MOCK_ACHIEVEMENTS;

  const initials = profile?.full_name ? getInitials(profile.full_name) : 'PL';
  const name     = profile?.full_name || 'Player';
  const city     = profile?.city || '—';
  const state    = profile?.state || '';
  const since    = profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024';

  return (
    <div className="profile-page">

      {/* ── HERO ── */}
      <div className="profile-hero">
        <div className="profile-hero-inner">
          <div className="profile-hero-top">
            {/* Avatar */}
            <div className="profile-avatar-wrap">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="profile-avatar-img" alt={name} />
              ) : (
                <div className="profile-avatar-initials">{initials}</div>
              )}
              <div className="profile-verified-badge">✓</div>
            </div>

            {/* Info */}
            <div className="profile-hero-info">
              <div className="profile-name-row">
                <h1 className="profile-name">{name}</h1>
                <span className="profile-role-badge">All-Rounder</span>
              </div>
              <div className="profile-meta-row">
                <span className="profile-meta-item">📍 {city}{state ? `, ${state}` : ''}</span>
                <span className="profile-meta-item">🏉 SKBC Varadanayakanahalli</span>
                <span className="profile-meta-item">📅 Since {since}</span>
              </div>
            </div>

            {/* Edit button */}
            <button className="profile-edit-btn" onClick={() => navigate('/profile/edit')}>
              ✏️ Edit Profile
            </button>
          </div>

          {/* Quick stats bar */}
          <div className="profile-quick-stats">
            {[
              { label: 'Followers',    value: stats.followers    },
              { label: 'Profile Views', value: stats.profileViews },
              { label: 'Team Rank',    value: `#${stats.teamRank}` },
              { label: 'Tournaments',  value: stats.tournaments  },
            ].map((s, i) => (
              <div key={i} className="profile-quick-stat">
                <div className="profile-quick-val">{s.value}</div>
                <div className="profile-quick-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="profile-tabs-bar">
        <div className="profile-tabs-inner">
          {(['overview', 'matches', 'achievements'] as const).map(t => (
            <button key={t} className={`profile-tab ${tab === t ? 'profile-tab-active' : ''}`}
              onClick={() => setTab(t)}>
              {t === 'overview' ? '📊 Overview' : t === 'matches' ? '🏉 Matches' : '🏆 Achievements'}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="profile-content">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="profile-tab-content">
            <div className="profile-top-row">
              {/* Win ring */}
              <div className="profile-win-card">
                <WinRing wins={stats.wins} total={stats.matches} />
                <div className="profile-season-label">Season 2024</div>
                <div className="profile-season-sub">KPL · Spring Cup</div>
              </div>

              {/* Top 3 stats */}
              <div className="profile-top-stats">
                {[
                  { label:'Matches',  value:stats.matches,  icon:'🏉', color:'#0ea5e9', bg:'#eff6ff' },
                  { label:'Wins',     value:stats.wins,     icon:'🏆', color:'#16a34a', bg:'#f0fdf4' },
                  { label:'Raid Pts', value:stats.raidPts,  icon:'⚡', color:'#ea580c', bg:'#fff7ed' },
                ].map((s, i) => (
                  <div key={i} className="profile-big-stat" style={{ '--accent': s.color, '--bg': s.bg } as any}>
                    <div className="profile-big-stat-icon">{s.icon}</div>
                    <div className="profile-big-stat-val" style={{ color: s.color }}>{s.value}</div>
                    <div className="profile-big-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary stats */}
            <div className="profile-secondary-stats">
              {[
                { label:'Tackle Pts', value:stats.tacklePts, icon:'🛡️', color:'#7c3aed', bg:'#f5f3ff' },
                { label:'Avg Raid',   value:stats.avgRaid,   icon:'📈', color:'#0284c7', bg:'#f0f9ff' },
                { label:'Avg Tackle', value:stats.avgTackle, icon:'💪', color:'#b45309', bg:'#fffbeb' },
              ].map((s, i) => (
                <div key={i} className="profile-sec-stat" style={{ '--accent': s.color } as any}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = s.color; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; }}>
                  <div className="profile-sec-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                  <div className="profile-sec-stat-val" style={{ color: s.color }}>{s.value}</div>
                  <div className="profile-sec-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent form */}
            <div className="profile-recent-card">
              <div className="profile-card-header">
                <div className="profile-card-title">Recent Form</div>
                <button className="profile-see-all" onClick={() => setTab('matches')}>See all →</button>
              </div>
              <div className="profile-form-dots">
                {matches.map(m => (
                  <div key={m.id} title={`vs ${m.opponent} · ${m.score}`}
                    className={`form-dot ${m.result === 'W' ? 'form-dot-win' : 'form-dot-loss'}`}>
                    {m.result}
                  </div>
                ))}
                <span className="form-dot-label">Last 5 matches</span>
              </div>
              {matches.slice(0, 3).map(m => <MatchRow key={m.id} match={m} />)}
            </div>
          </div>
        )}

        {/* MATCHES */}
        {tab === 'matches' && (
          <div className="profile-tab-content">
            <div className="profile-matches-card">
              <div className="profile-card-title">All Matches</div>
              <div className="profile-matches-sub">{matches.length} matches this season</div>
              {matches.map(m => <MatchRow key={m.id} match={m} />)}
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS */}
        {tab === 'achievements' && (
          <div className="profile-tab-content">
            <div className="profile-ach-summary">
              <div className="ach-summary-card ach-earned">
                <div className="ach-summary-val">4</div>
                <div className="ach-summary-label">EARNED</div>
              </div>
              <div className="ach-summary-card ach-locked">
                <div className="ach-summary-val">2</div>
                <div className="ach-summary-label">LOCKED</div>
              </div>
            </div>
            <div className="profile-ach-list">
              {achievements.map((a, i) => <AchievementCard key={i} {...a} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}