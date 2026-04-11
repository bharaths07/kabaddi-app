import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useKabaddiStore } from '../../stores/useKabaddiStore'
import type { Team } from '../../data/teams'
import type { Player } from '../../data/players'
import '../../features/kabaddi/pages/leaderboards.css'

export default function TeamDetailLeaderboardPage() {
  const { teamSlug } = useParams()
  const { fetchTeamBySlug, fetchPlayersByTeamSlug, activeTeamSlug, setActiveTeamSlug } = useKabaddiStore()
  
  const [activeTab, setActiveTab] = useState<'roster' | 'form' | 'schedule'>('roster')
  const [team, setTeam] = useState<Team | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!teamSlug) return
    (async () => {
      setLoading(true)
      setActiveTeamSlug(teamSlug)
      
      const teamData = await fetchTeamBySlug(teamSlug)
      if (teamData) {
        setTeam(teamData)
        const squadData = await fetchPlayersByTeamSlug(teamSlug)
        setPlayers(squadData)
      }
      
      setLoading(false)
    })()
    
    return () => setActiveTeamSlug(null)
  }, [teamSlug, fetchTeamBySlug, fetchPlayersByTeamSlug, setActiveTeamSlug])

  if (loading) {
    return (
      <div className="hp-page" style={{ paddingBottom: '80px' }}>
        <div className="hp-shimmer" style={{ height: '300px' }} />
        <div style={{ maxWidth: 1000, margin: '-40px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', gap: 12 }}>
                {[1,2,3].map(i => <div key={i} className="hp-shimmer" style={{ width: '100px', height: '40px', borderRadius: '20px', border: '1px solid var(--bg-border)' }} />)}
            </div>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1,2,3,4].map(i => <div key={i} className="hp-shimmer" style={{ height: '80px', borderRadius: '16px', border: '1px solid var(--bg-border)' }} />)}
            </div>
        </div>
      </div>
    )
  }
  if (!team) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Franchise not found. Please check the URL.</div>
  
  return (
    <div className="hp-page" style={{ paddingBottom: '80px', background: 'var(--bg-page)' }}>
      {/* Blurred Visual Header */}
      <div style={{ 
        position: 'relative', 
        height: '280px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${team.primaryColor}dd, var(--color-navy))`
      }}>
        <div style={{ 
            position: 'absolute', inset: -20, background: `url(${team.logo}) center/cover`, 
            filter: 'blur(30px) opacity(0.3)', mixBlendMode: 'overlay'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={team.logo} alt={team.name} style={{ width: '100px', height: '100px', borderRadius: '24px', background: team.primaryColor, boxShadow: '0 8px 30px rgba(0,0,0,0.3)', marginBottom: '16px' }} />
            <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#fff', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                {team.name}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', fontWeight: 600, marginTop: '4px' }}>
                📍 {team.city} &nbsp;•&nbsp; 👔 Coach: {team.coach}
            </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px' }}>
        
        {/* Sticky Tab Bar */}
        <div className="hp-sticky-tabs">
          {[
            { id: 'roster', label: 'Roster', icon: '👥' },
            { id: 'form', label: 'Recent Form', icon: '📈' },
            { id: 'schedule', label: 'Schedule', icon: '📅' }
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: '10px 20px', borderRadius: 'var(--radius-full)', border: activeTab === t.id ? `1.5px solid ${team.primaryColor}` : '1.5px solid var(--bg-border)', cursor: 'pointer',
                background: activeTab === t.id ? team.primaryColor : 'var(--bg-surface)',
                color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
                fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
                transition: 'var(--ease)', whiteSpace: 'nowrap', boxShadow: 'var(--shadow-xs)'
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: 400, paddingTop: '24px' }}>
          
          {/* Roster Tab */}
          {activeTab === 'roster' && (
            <div className="squad-grid">
              {players.map(p => (
                <Link to={`/${teamSlug}/player/${p.slug}`} key={p.id} className="pkl-player-card" style={{ borderBottomColor: team.primaryColor }}>
                  <div className="pkl-card-content" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <img src={p.avatar} alt={p.name} style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-elevated)', objectFit: 'cover' }} />
                        {p.isStar && <div style={{ position: 'absolute', top: -8, right: -8, background: '#fbbf24', color: '#000', fontSize: '10px', fontWeight: 900, padding: '2px 6px', borderRadius: '8px', zIndex: 2 }}>STAR</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '2px' }}>{p.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                          <span style={{ color: p.role === 'Raider' ? '#ef4444' : p.role === 'Defender' ? '#3b82f6' : '#f59e0b' }}>●</span> {p.role}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', background: 'var(--bg-elevated)', padding: '8px 12px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 900, color: team.primaryColor }}>{p.powerScore}</div>
                        <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)' }}>OVR</div>
                    </div>
                  </div>
                </Link>
              ))}
              {players.length === 0 && <div style={{ color: 'var(--text-muted)', padding: 20, textAlign: 'center', fontWeight: 600 }}>Roster data unavailable.</div>}
            </div>
          )}

          {/* Form Tab */}
          {activeTab === 'form' && (
            <div style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--bg-border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--color-navy)', marginBottom: '24px', marginTop: 0 }}>Last 5 Matches</h3>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center' }}>
                    {team.recentForm.map((match: any, idx: number) => {
                        const bg = match.result === 'W' ? '#22c55e' : match.result === 'L' ? '#ef4444' : '#f59e0b';
                        return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ 
                                    width: '48px', height: '48px', borderRadius: '50%', background: bg, color: '#fff', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-display)',
                                    boxShadow: `0 4px 12px ${bg}44`
                                }}>
                                    {match.result}
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>vs {match.opponent}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                    { id: 'm1', opp: 'Puneri Paltan', date: 'Oct 28', time: '8:00 PM IST', type: 'Pro Kabaddi League' },
                    { id: 'm2', opp: 'UP Yoddhas', date: 'Nov 02', time: '9:00 PM IST', type: 'Pro Kabaddi League' }
                ].map(f => (
                    <div key={f.id} style={{ 
                        background: 'var(--bg-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--bg-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: team.primaryColor, marginBottom: '6px' }}>{f.date} • {f.time}</div>
                            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>vs {f.opp}</div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>{f.type}</div>
                        </div>
                        <button style={{ 
                            padding: '10px 20px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', 
                            borderRadius: '12px', cursor: 'pointer', fontWeight: 800, color: 'var(--text-secondary)', fontSize: '13px'
                        }}>
                            🔔 Notify Me
                        </button>
                    </div>
                ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
