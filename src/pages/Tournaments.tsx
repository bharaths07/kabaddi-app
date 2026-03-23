import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../shared/lib/supabase'
import './tournaments.css'

interface Tournament {
  id: string
  name: string
  start_date: string | null
  end_date: string | null
  status: string | null
  level: string | null
  venue_name: string | null
  city_state: string | null
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

export default function Tournaments() {
  const now = new Date()
  const [tab, setTab]               = useState<'all'|'ongoing'|'upcoming'|'completed'>('all')
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  useEffect(() => {
    fetchTournaments()
  }, [])

  async function fetchTournaments() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name, start_date, end_date, status, level, venue_name, city_state')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTournaments(data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const withStatus = tournaments.map(t => ({
    ...t,
    computedStatus: getStatus(t, now),
  }))

  const featured  = withStatus.slice(0, 6)
  const filtered  = withStatus.filter(t =>
    tab === 'all' ? true : t.computedStatus === tab
  )

  const posterText = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3)

  return (
    <div className="t-page">
      <div className="t-header">
        <div>
          <h1 className="t-title">Tournaments</h1>
          <div className="t-subtitle">Explore ongoing and upcoming competitions</div>
        </div>
        <Link to="/tournament/create" className="t-create-btn">
          + Create Tournament
        </Link>
      </div>

      {error && (
        <div className="t-error">
          ⚠️ {error}
        </div>
      )}

      {/* Featured scroll */}
      <div className="t-featured">
        <div className="t-featured-scroll">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="t-fcard">
                  <div className="t-fposter t-skeleton-poster" />
                  <div className="t-skeleton-line t-skeleton-line--primary" />
                  <div className="t-skeleton-line t-skeleton-line--secondary" />
                </div>
              ))
            : featured.length === 0
              ? (
                <div className="t-featured-empty">
                  No tournaments yet.{" "}
                  <Link to="/tournament/create" className="t-link-primary">
                    Create one →
                  </Link>
                </div>
              )
              : featured.map(t => (
                  <Link key={t.id} to={`/tournament/${t.id}/dashboard`} className="t-fcard">
                    <div className="t-fposter">{posterText(t.name)}</div>
                    <div className="t-fname">{t.name}</div>
                    <div className="t-fmeta">
                      {t.start_date ? new Date(t.start_date).toLocaleDateString() : 'TBD'}
                      {t.end_date ? ` – ${new Date(t.end_date).toLocaleDateString()}` : ''}
                    </div>
                    <span className={`t-badge t-${t.computedStatus}`}>{t.computedStatus}</span>
                  </Link>
                ))
          }
        </div>
      </div>

      {/* Tabs */}
      <div className="t-tabs">
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
        <div className="t-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="t-card">
              <div className="t-skeleton-line t-skeleton-card-title" />
              <div className="t-skeleton-line t-skeleton-card-sub" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="t-empty">
          <div>
            {tab === 'all'
              ? (
                <>
                  No tournaments yet.{" "}
                  <Link to="/tournament/create" className="t-link-primary">
                    Create your first one →
                  </Link>
                </>
              )
              : `No ${tab} tournaments.`
            }
          </div>
        </div>
      ) : (
        <div className="t-grid">
          {filtered.map(t => (
            <div key={t.id} className="t-card">
              <div className="t-card-head">
                <div className="t-card-title">{t.name}</div>
                <span className={`t-badge t-${t.computedStatus}`}>{t.computedStatus}</span>
              </div>        
              <div className="t-meta">
                {t.start_date ? new Date(t.start_date).toLocaleDateString() : 'TBD'}
                {t.end_date ? ` – ${new Date(t.end_date).toLocaleDateString()}` : ''}
              </div>
              {(t.venue_name || t.city_state) && (
                <div className="t-meta t-meta--location">
                  📍 {[t.venue_name, t.city_state].filter(Boolean).join(', ')}
                </div>
              )}
              {t.level && (
                <div className="t-stats">
                  <span>{t.level}</span>
                </div>
              )}
              <div className="t-actions">
                <Link to={`/tournament/${t.id}/dashboard`} className="t-secondary">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
