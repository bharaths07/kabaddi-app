import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { TeamAnnouncement } from '../../features/kabaddi/components/posters'
import type { TeamInfo } from '../../features/kabaddi/components/posters/engine/posterTypes'
import '../../features/kabaddi/pages/leaderboards.css'
import { getTeam } from '../../shared/services/tournamentService'

export default function TeamDetailLeaderboardPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<'squad' | 'fixtures' | 'poster'>('squad')
  const [teamData, setTeamData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    (async () => {
      setLoading(true)
      const data = await getTeam(id)
      setTeamData(data)
      setLoading(false)
    })()
  }, [id])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#fff' }}>Loading team details...</div>
  if (!teamData) return <div style={{ padding: 40, textAlign: 'center', color: '#fff' }}>Team not found</div>
  
  const team: TeamInfo = { 
    name: teamData.name, 
    abbr: teamData.short || teamData.name.slice(0, 2).toUpperCase(), 
    color: teamData.color || '#0ea5e9', 
    captain: teamData.captain || '—', 
    location: teamData.city || 'Local', 
    players: teamData.squad.map((p: any) => ({ ...p, points: 0 })), // Placeholder points
    matchesPlayed: teamData.fixtures.filter((f: any) => f.status === 'completed').length
  }

  const stats = {
    played: team.matchesPlayed,
    won: teamData.fixtures.filter((f: any) => f.result === 'won').length,
    lost: teamData.fixtures.filter((f: any) => f.result === 'lost').length,
    points: teamData.fixtures.filter((f: any) => f.result === 'won').length * 2 // simple points logic
  }

  const F = "Rajdhani, sans-serif"

  return (
    <div style={{ padding: "24px 16px", maxWidth: 1000, margin: "0 auto", fontFamily: F }}>
      {/* Header Card */}
      <div style={{ 
        background: `linear-gradient(135deg, ${team.color}, #1e293b)`, 
        borderRadius: 24, padding: 30, color: '#fff', marginBottom: 24,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: -20, bottom: -20, fontSize: 150, fontWeight: 900, opacity: 0.1 }}>{team.abbr}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative', zIndex: 1 }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: 20, background: '#fff', color: team.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {team.abbr}
          </div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>{team.name}</h1>
            <div style={{ fontSize: 16, opacity: 0.8, fontWeight: 600 }}>📍 {team.location} • Captain: {team.captain}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 30, position: 'relative', zIndex: 1 }}>
          {[
            { label: 'PLAYED', val: stats.played },
            { label: 'WON', val: stats.won, color: '#22c55e' },
            { label: 'LOST', val: stats.lost, color: '#ef4444' },
            { label: 'POINTS', val: stats.points, color: '#fbbf24' }
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 8px', borderRadius: 16, textAlign: 'center', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color || '#fff' }}>{s.val}</div>
              <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'squad', label: 'SQUAD', icon: '👥' },
          { id: 'fixtures', label: 'FIXTURES', icon: '📅' },
          { id: 'poster', label: 'POSTER', icon: '🎨' }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: activeTab === t.id ? team.color : 'rgba(255,255,255,0.05)',
              color: activeTab === t.id ? '#fff' : '#64748b',
              fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: 400 }}>
        {activeTab === 'squad' && (
          <div className="squad-grid">
            {teamData.squad.map((p: any) => (
              <Link to={`/players/${p.id}`} key={p.id} className="pkl-player-card" style={{ borderBottomColor: team.color }}>
                <div className="pkl-card-content">
                  <div className="pkl-player-info">
                    <div className="pkl-player-name">{p.name}</div>
                    <div className="pkl-player-role">{p.role}</div>
                    <div className="pkl-player-country">{p.country || 'India'}</div>
                  </div>
                  <div className="pkl-player-photo">
                    <div className="pkl-photo-placeholder">
                      {p.name.split(' ').map((n:any) => n[0]).join('')}
                    </div>
                  </div>
                </div>
                <div className="pkl-card-footer">
                  <div className="pkl-view-profile">View profile</div>
                  <div className="pkl-player-pts">
                    <div className="pkl-pts-val" style={{ color: team.color }}>{p.points || 0}</div>
                    <div className="pkl-pts-lbl">PTS</div>
                  </div>
                </div>
              </Link>
            ))}
            {teamData.squad.length === 0 && <div style={{ color: 'rgba(255,255,255,0.5)', padding: 20 }}>No players in squad yet.</div>}
          </div>
        )}

        {activeTab === 'fixtures' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {teamData.fixtures.map((f: any) => (
              <div key={f.id} style={{ 
                background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #f1f5f9',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ 
                    fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 20,
                    background: f.status === 'live' ? '#fee2e2' : f.status === 'upcoming' ? '#e0f2fe' : '#f1f5f9',
                    color: f.status === 'live' ? '#ef4444' : f.status === 'upcoming' ? '#0ea5e9' : '#64748b'
                  }}>
                    {f.status.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{f.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#1e293b' }}>{team.name}</div>
                  </div>
                  <div style={{ padding: '0 20px', fontWeight: 900, fontSize: 20, color: '#cbd5e1' }}>
                    {f.score || 'VS'}
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#1e293b' }}>{f.opponent}</div>
                  </div>
                </div>
                {f.result && f.result !== 'played' && (
                  <div style={{ 
                    textAlign: 'center', marginTop: 12, fontSize: 13, fontWeight: 700, 
                    color: f.result === 'won' ? '#22c55e' : '#ef4444' 
                  }}>
                    Result: {f.result.toUpperCase()}
                  </div>
                )}
              </div>
            ))}
            {teamData.fixtures.length === 0 && <div style={{ color: 'rgba(255,255,255,0.5)', padding: 20 }}>No fixtures scheduled yet.</div>}
          </div>
        )}

        {activeTab === 'poster' && (
          <div style={{ background: '#fff', padding: 20, borderRadius: 24, border: '1px solid #f1f5f9' }}>
            <div style={{ fontWeight: 800, marginBottom: 16, fontSize: 18, color: '#1e293b' }}>Team Announcement Poster</div>
            <TeamAnnouncement team={team} />
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 20, height: 48, borderRadius: 12, fontWeight: 800 }}>
              Download Poster
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
