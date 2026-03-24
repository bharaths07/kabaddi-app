import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../shared/lib/supabase'
import { useAuth } from '../shared/context/AuthContext'
import './home.css'

// ── Types ─────────────────────────────────────────────────────────
interface LiveMatch {
  id: string
  home: string; homeShort: string; homeScore: number
  guest: string; guestShort: string; guestScore: number
  period: number; tournament: string
}
interface UpcomingMatch {
  id: string
  home: string; homeShort: string
  guest: string; guestShort: string
  scheduledAt: string; tournament: string
}
interface FeedPost {
  id: string
  type: 'photo' | 'announcement' | 'achievement' | 'result'
  caption: string
  image_url?: string
  author: string; authorInitials: string; authorColor: string
  createdAt: string; likes: number; liked: boolean
  tournament?: string
}
interface Stats { tournaments: number; teams: number; players: number; matches: number }

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const TYPE_CONFIG = {
  photo:        { emoji:'📸', label:'Photo',        bg:'#eff6ff', color:'#0ea5e9' },
  announcement: { emoji:'📢', label:'Announcement', bg:'#fff7ed', color:'#ea580c' },
  achievement:  { emoji:'🏆', label:'Achievement',  bg:'#fefce8', color:'#d97706' },
  result:       { emoji:'⚡', label:'Result',        bg:'#f0fdf4', color:'#16a34a' },
}

// ── Feed Post Card ────────────────────────────────────────────────
function FeedCard({ post, onLike }: { post: FeedPost; onLike: (id: string) => void }) {
  const cfg = TYPE_CONFIG[post.type] || TYPE_CONFIG.result
  return (
    <div className="feed-card">
      <div className="feed-card-header">
        <div className="feed-avatar" style={{ background: `linear-gradient(135deg,${post.authorColor},${post.authorColor}bb)` }}>
          {post.authorInitials}
        </div>
        <div className="feed-meta">
          <div className="feed-author">{post.author}</div>
          <div className="feed-time">
            {post.tournament && <span className="feed-tournament">🏉 {post.tournament} · </span>}
            {timeAgo(post.createdAt)}
          </div>
        </div>
        <div className="feed-type-badge" style={{ background: cfg.bg, color: cfg.color }}>
          {cfg.emoji} {cfg.label}
        </div>
      </div>
      {post.image_url && (
        <div className="feed-image-wrap">
          <img src={post.image_url} alt="" className="feed-image"/>
        </div>
      )}
      <p className="feed-caption">{post.caption}</p>
      <div className="feed-actions">
        <button className={`feed-like-btn ${post.liked ? 'liked' : ''}`} onClick={() => onLike(post.id)}>
          {post.liked ? '❤️' : '🤍'} <span>{post.likes}</span>
        </button>
        <button className="feed-comment-btn">💬 Comment</button>
        <button className="feed-share-btn">↗ Share</button>
      </div>
    </div>
  )
}

// ── Live Match Card ───────────────────────────────────────────────
function LiveCard({ match }: { match: LiveMatch }) {
  const navigate = useNavigate()
  return (
    <div className="live-match-card" onClick={() => navigate(`/matches/${match.id}/live`)}>
      <div className="live-pulse-row">
        <span className="live-dot"/>
        <span className="live-label">LIVE</span>
        <span className="live-period">Period {match.period}</span>
        {match.tournament && <span className="live-tourn">{match.tournament}</span>}
      </div>
      <div className="live-score-row">
        <div className="live-team">
          <div className="live-team-badge">{match.homeShort}</div>
          <div className="live-team-name">{match.home}</div>
        </div>
        <div className="live-scoreline">
          <span className="live-score-num">{match.homeScore}</span>
          <span className="live-score-sep">-</span>
          <span className="live-score-num">{match.guestScore}</span>
        </div>
        <div className="live-team right">
          <div className="live-team-badge">{match.guestShort}</div>
          <div className="live-team-name">{match.guest}</div>
        </div>
      </div>
      <div className="live-view-btn">View Live →</div>
    </div>
  )
}

// ── Upcoming Match Strip ──────────────────────────────────────────
function UpcomingStrip({ match }: { match: UpcomingMatch }) {
  const d = new Date(match.scheduledAt)
  const timeStr = d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })
  const dateStr = d.toLocaleDateString('en-IN', { day:'numeric', month:'short' })
  return (
    <Link to={`/matches/${match.id}`} className="upcoming-strip">
      <div className="upcoming-date-block">
        <div className="upcoming-time">{timeStr}</div>
        <div className="upcoming-date">{dateStr}</div>
      </div>
      <div className="upcoming-teams">
        <span className="upcoming-badge">{match.homeShort}</span>
        <span className="upcoming-vs">vs</span>
        <span className="upcoming-badge">{match.guestShort}</span>
      </div>
      <div className="upcoming-names">
        {match.home} vs {match.guest}
      </div>
      {match.tournament && (
        <div className="upcoming-tourn">{match.tournament}</div>
      )}
      <div className="upcoming-arrow">›</div>
    </Link>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN HOME PAGE
// ═══════════════════════════════════════════════════════════════════
export default function Home() {
  const { user, profile } = useAuth()
  const [feedTab, setFeedTab]           = useState<'all'|'my-team'|'tournaments'>('all')
  const [liveMatches, setLiveMatches]   = useState<LiveMatch[]>([])
  const [upcoming, setUpcoming]         = useState<UpcomingMatch[]>([])
  const [stats, setStats]               = useState<Stats>({ tournaments:0, teams:0, players:0, matches:0 })
  const [feed, setFeed]                 = useState<FeedPost[]>([])
  const [tournaments, setTournaments]   = useState<any[]>([])
  const [loading, setLoading]           = useState(true)

  const firstName = profile?.full_name?.split(' ')[0]
    || user?.user_metadata?.full_name?.split(' ')[0]
    || user?.phone?.slice(-4)
    || 'Player'

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [matchRes, statsRes, tournRes, feedRes] = await Promise.allSettled([
        // Live + upcoming matches
        supabase.from('kabaddi_matches')
          .select(`id,status,home_score,guest_score,period,created_at,
            home_team:teams!team_home_id(id,name,short),
            guest_team:teams!team_guest_id(id,name,short)`)
          .in('status', ['live','toss_pending','toss_completed'])
          .order('created_at', { ascending:false })
          .limit(10),

        // Counts
        Promise.allSettled([
          supabase.from('tournaments').select('*', { count:'exact', head:true }),
          supabase.from('teams').select('*', { count:'exact', head:true }),
          supabase.from('players').select('*', { count:'exact', head:true }),
          supabase.from('kabaddi_matches').select('*', { count:'exact', head:true }),
        ]),

        // Recent tournaments
        supabase.from('tournaments')
          .select('id,name,status,level,start_date')
          .order('created_at', { ascending:false })
          .limit(5),

        // Real feed data
        supabase.from('feed_posts')
          .select('*, profiles(full_name)')
          .order('created_at', { ascending: false })
          .limit(10)
      ])

      // Matches
      if (matchRes.status === 'fulfilled' && !matchRes.value.error) {
        const data = matchRes.value.data as any[]
        const live: LiveMatch[] = []
        const upcom: UpcomingMatch[] = []
        data.forEach(m => {
          const hName = m.home_team?.name || 'Home'
          const gName = m.guest_team?.name || 'Guest'
          const hShort = m.home_team?.short || hName.slice(0,2).toUpperCase()
          const gShort = m.guest_team?.short || gName.slice(0,2).toUpperCase()
          if (m.status === 'live') {
            live.push({ id:m.id, home:hName, homeShort:hShort, homeScore:m.home_score||0, guest:gName, guestShort:gShort, guestScore:m.guest_score||0, period:m.period||1, tournament:'' })
          } else {
            upcom.push({ id:m.id, home:hName, homeShort:hShort, guest:gName, guestShort:gShort, scheduledAt:m.created_at, tournament:'' })
          }
        })
        setLiveMatches(live)
        setUpcoming(upcom)
      }

      // Stats
      if (statsRes.status === 'fulfilled') {
        const results = statsRes.value as any[]
        const getCount = (res: any) => (res.status === 'fulfilled' && !res.value.error) ? (res.value.count || 0) : 0
        setStats({ 
          tournaments: getCount(results[0]), 
          teams: getCount(results[1]), 
          players: getCount(results[2]), 
          matches: getCount(results[3]) 
        })
      }

      // Tournaments
      if (tournRes.status === 'fulfilled' && !tournRes.value.error) {
        setTournaments(tournRes.value.data || [])
      }

      // Feed
      if (feedRes.status === 'fulfilled' && !feedRes.value.error) {
        const posts = (feedRes.value.data || []).map((p: any) => ({
          id: p.id,
          type: p.type || 'result',
          caption: p.caption || '',
          image_url: p.image_url,
          author: p.profiles?.full_name || 'Official',
          authorInitials: (p.profiles?.full_name || 'PL').split(' ').map((n:any)=>n[0]).join('').slice(0,2).toUpperCase(),
          authorColor: '#0ea5e9',
          createdAt: p.created_at,
          likes: p.likes_count || 0,
          liked: false
        }))
        setFeed(posts)
      }

    } catch (e) {
      console.error('Home fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  function toggleLike(id: string) {
    setFeed(prev => prev.map(p => p.id === id
      ? { ...p, liked:!p.liked, likes: p.liked ? p.likes-1 : p.likes+1 }
      : p
    ))
  }

  return (
    <div className="hp-page">

      {/* ── TOP BAR ── */}
      <div className="hp-topbar">
        <div className="hp-greeting">
          Hey {firstName} 👋
        </div>
        <div className="hp-topbar-actions">
          <Link to="/notifications" className="hp-notif-btn">
            🔔
            <span className="hp-notif-dot"/>
          </Link>
        </div>
      </div>

      {/* ── LIVE MATCHES ── */}
      {liveMatches.length > 0 && (
        <div className="hp-section">
          <div className="hp-section-header">
            <div className="hp-section-title">
              <span className="hp-live-indicator"/>
              Live Now
            </div>
            <Link to="/matches" className="hp-see-all">See all →</Link>
          </div>
          <div className="hp-live-scroll">
            {liveMatches.map(m => <LiveCard key={m.id} match={m}/>)}
          </div>
        </div>
      )}

      {/* ── STATS STRIP ── */}
      <div className="hp-stats-strip">
        {[
          { label:'Tournaments', value: loading?'—':stats.tournaments, color:'#0ea5e9', emoji:'🏆' },
          { label:'Teams',       value: loading?'—':stats.teams,       color:'#16a34a', emoji:'👥' },
          { label:'Matches',     value: loading?'—':stats.matches,     color:'#ea580c', emoji:'🏉' },
          { label:'Players',     value: loading?'—':stats.players,     color:'#7c3aed', emoji:'⚡' },
        ].map(s => (
          <div key={s.label} className="hp-stat-pill">
            <div className="hp-stat-emoji">{s.emoji}</div>
            <div className="hp-stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="hp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── FEED ── */}
      <div className="hp-section">
        <div className="hp-section-header">
          <div className="hp-section-title">📸 Feed</div>
          <Link to="/feed" className="hp-see-all">See all →</Link>
        </div>

        {/* Feed tabs */}
        <div className="hp-feed-tabs">
          {(['all','my-team','tournaments'] as const).map(t => (
            <button key={t} className={`hp-feed-tab ${feedTab===t?'active':''}`} onClick={() => setFeedTab(t)}>
              {t === 'all' ? '🌍 All' : t === 'my-team' ? '👥 My Team' : '🏆 Tournaments'}
            </button>
          ))}
        </div>

        {/* Post button */}
        <Link to="/feed/create" className="hp-create-post-btn">
          <div className="hp-create-post-avatar" style={{ background: profile?.avatar_url ? `url(${profile.avatar_url})` : 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}>
            {!profile?.avatar_url && (firstName[0] || 'P')}
          </div>
          <div className="hp-create-post-placeholder">Share a winning moment, result or announcement...</div>
          <div className="hp-create-post-icon">📸</div>
        </Link>

        {/* Feed posts */}
        <div className="hp-feed-list">
          {feed.map(post => <FeedCard key={post.id} post={post} onLike={toggleLike}/>)}
        </div>
      </div>

      {/* ── UPCOMING MATCHES ── */}
      <div className="hp-section">
        <div className="hp-section-header">
          <div className="hp-section-title">📅 Upcoming Matches</div>
          <Link to="/matches" className="hp-see-all">See all →</Link>
        </div>

        {loading ? (
          <div className="hp-loading-strip">Loading...</div>
        ) : upcoming.length === 0 ? (
          <div className="hp-empty-state">
            <div className="hp-empty-icon">📅</div>
            <div className="hp-empty-text">No upcoming matches</div>
            <Link to="/kabaddi/create" className="hp-empty-link">Start a match →</Link>
          </div>
        ) : (
          <div className="hp-upcoming-list">
            {upcoming.slice(0,5).map(m => <UpcomingStrip key={m.id} match={m}/>)}
          </div>
        )}
      </div>

      {/* ── MY TOURNAMENTS ── */}
      <div className="hp-section">
        <div className="hp-section-header">
          <div className="hp-section-title">🏆 My Tournaments</div>
          <Link to="/tournaments" className="hp-see-all">See all →</Link>
        </div>

        {loading ? (
          <div className="hp-loading-strip">Loading...</div>
        ) : tournaments.length === 0 ? (
          <div className="hp-empty-state">
            <div className="hp-empty-icon">🏆</div>
            <div className="hp-empty-text">No tournaments yet</div>
            <Link to="/tournament/create" className="hp-empty-link">Create one →</Link>
          </div>
        ) : (
          <div className="hp-tourn-list">
            {tournaments.map(t => (
              <Link key={t.id} to={`/tournament/${t.id}/dashboard`} className="hp-tourn-row">
                <div className="hp-tourn-icon">{t.name.charAt(0).toUpperCase()}</div>
                <div className="hp-tourn-info">
                  <div className="hp-tourn-name">{t.name}</div>
                  <div className="hp-tourn-meta">{t.level || 'Local'}{t.start_date ? ` · ${new Date(t.start_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}` : ''}</div>
                </div>
                <div className={`hp-tourn-status hp-status-${(t.status||'draft').toLowerCase()}`}>
                  {t.status || 'draft'}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}