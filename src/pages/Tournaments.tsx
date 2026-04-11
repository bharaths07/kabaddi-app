import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../shared/lib/supabase'
import { useAuth } from '../shared/context/AuthContext'
import { getAllTournaments } from '../features/kabaddi/state/tournamentStore'
import { useKabaddiStore } from '../stores/useKabaddiStore'
import './tournaments.css'
import './home.css'

interface Tournament {
  id: string
  name: string
  start_date: string | null
  end_date: string | null
  status: string | null
  level: string | null
  venue_name: string | null
  city_state: string | null
  created_by?: string | null
  teamCount?: number
}

function getStatus(t: Tournament, now: Date): 'upcoming' | 'ongoing' | 'completed' {
  if (t.status === 'completed') return 'completed'
  if (!t.start_date) return 'upcoming'
  const s = new Date(t.start_date)
  const e = t.end_date ? new Date(t.end_date) : null
  if (s > now) return 'upcoming'
  if (e && e < now) return 'completed'
  return 'ongoing'
}

const placeholderImages = [
  'https://images.unsplash.com/photo-1540747913346-19e32d15e347?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1577223625816-7546f13df25d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
]

function getTournamentImage(id: string) {
  const sum = id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return placeholderImages[sum % placeholderImages.length]
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start) return 'Dates TBD'
  const s = new Date(start).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  if (!end) return s
  const e = new Date(end).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${s} - ${e}`
}

function TournamentCard({ t, userId }: { t: Tournament & { computedStatus: string }; userId: string | undefined }) {
  const bgImg = getTournamentImage(t.id)
  const isOrganizer = !!userId && t.created_by === userId
  const href = isOrganizer ? `/tournaments/${t.id}/dashboard` : `/tournaments/${t.id}`

  return (
    <Link to={href} className="hp-tourn-card">
      <div className="hp-tourn-cover" style={{ backgroundImage: `url('${bgImg}')` }}>
        <span className={`hp-tourn-badge ${t.computedStatus}`}>
          {t.computedStatus}
        </span>
        {isOrganizer && <span className="hp-tourn-organizer-badge">My Tournament</span>}
      </div>
      <div className="hp-tourn-info">
        <h3 className="hp-tourn-title">{t.name}</h3>
        <div className="hp-tourn-meta-row">
          <div className="hp-tourn-date">
            <span>🗓</span> {formatDateRange(t.start_date, t.end_date)}
          </div>
          {(t.venue_name || t.city_state) && (
            <div className="hp-tourn-location">
              <span>📍</span> {t.city_state || t.venue_name}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function Tournaments() {
  const now = new Date()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { setSearchOpen } = useKabaddiStore()
  const [tab, setTab] = useState<'all' | 'ongoing' | 'upcoming' | 'completed'>('all')
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTournaments()
  }, [])

  async function fetchTournaments() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name, start_date, end_date, status, level, venue_name, city_state, created_by')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTournaments(data || [])
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const scrollAction = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340; // Card width + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  const withStatus = tournaments.map(t => ({
    ...t,
    computedStatus: getStatus(t, now),
  }))

  const featured = withStatus.slice(0, 6)
  const filtered = withStatus.filter(t =>
    tab === 'all' ? true : t.computedStatus === tab
  )

  return (
    <div className="hp-page">
      <div className="hp-section" style={{ paddingTop: '24px' }}>
        <div className="hp-section-header" style={{ justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 900 }}>Tournaments</h1>
            <div style={{ fontSize: '14px', color: '#777', fontWeight: 600, marginTop: '4px' }}>Explore ongoing and upcoming competitions</div>
          </div>
          <div className="hp-discover-banner">
            <span className="hp-discover-text">Discover Tournaments Near You</span>
            <button className="hp-discover-btn" onClick={() => setSearchOpen(true)}>EXPLORE</button>
          </div>
        </div>

        {/* Featured Slider */}
        <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 12px 0' }}>Featured Tournaments</h2>
        <div className="hp-featured-wrapper">
          {featured.length > 0 && (
            <button className="hp-scroll-btn left" onClick={() => scrollAction('left')} aria-label="Scroll left">
              &#10094;
            </button>
          )}
          <div className="hp-featured-scroll" ref={scrollRef}>
            {loading ? (
              <div className="hp-empty-state" style={{ flex: 1 }}>Loading featured...</div>
            ) : featured.length === 0 ? (
              <div className="hp-empty-state" style={{ flex: 1 }}>No tournaments yet. <Link to="/tournament/create">Create one</Link></div>
            ) : (
              featured.map(t => <TournamentCard key={t.id} t={t} userId={user?.id} />)
            )}
          </div>
          {featured.length > 0 && (
            <button className="hp-scroll-btn right" onClick={() => scrollAction('right')} aria-label="Scroll right">
              &#10095;
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="t-tabs" style={{ marginTop: '12px' }}>
          {(['all', 'ongoing', 'upcoming', 'completed'] as const).map(k => (
            <button
              key={k}
              className={`t-tab ${tab === k ? 'active' : ''}`}
              onClick={() => setTab(k)}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="hp-empty-state">Loading tournaments...</div>
        ) : filtered.length === 0 ? (
          <div className="hp-empty-state">
            No {tab === 'all' ? '' : tab} tournaments found.
          </div>
        ) : (
          <div className="hp-tourn-grid" style={{ paddingTop: '8px' }}>
            {filtered.map(t => (
              <TournamentCard key={t.id} t={t} userId={user?.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
