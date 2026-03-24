import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './leaderboards.css'
import { getPlayer } from '../../../shared/services/tournamentService'

const CircleProgress = ({ val, label, color }: { val: number, label: string, color: string }) => (
  <div className="pp-circle-stat">
    <div className="pp-circle" style={{ 
      background: `conic-gradient(${color} ${val}%, #e2e8f0 0)`
    }}>
      <div style={{ position: 'absolute', inset: 6, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="pp-circle-val">{val}%</span>
      </div>
    </div>
    <span className="pp-stat-label">{label}</span>
  </div>
)

export default function PlayerProfilePage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'achievements' | 'bio'>('overview')
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    (async () => {
      setLoading(true)
      const data = await getPlayer(id)
      setPlayer(data)
      setLoading(false)
    })()
  }, [id])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#fff' }}>Loading player profile...</div>
  if (!player) return <div style={{ padding: 40, textAlign: 'center', color: '#fff' }}>Player not found</div>

  const defaultBio = `${player.name} is a professional Kabaddi player for ${player.teamName}. With a focus on teamwork and strategic execution, they have consistently contributed to their team's performance throughout the season.`

  return (
    <div className="pp-container">
      {/* Premium Header */}
      <div className="pp-header-new">
        {/* Background Patterns */}
        <div className="pp-header-bg-pattern"></div>

        <div className="pp-photo-cutout">
          <div className="pp-photo-placeholder-large">
            {player.name.split(' ').map((n:any)=>n[0]).join('')}
          </div>
        </div>

        <div className="pp-info-new">
          <h1 className="pp-name-new">
            {player.name.split(' ')[0]} <span style={{ fontWeight: 400 }}>{player.name.split(' ').slice(1).join(' ')}</span>
          </h1>
          <div className="pp-role-new">{player.role}</div>
          <div className="pp-country-new">{player.country}</div>
          
          <div className="pp-share-wrapper">
            <span style={{ fontSize: 12, fontWeight: 800, opacity: 0.6 }}>Share</span>
            <div className="pp-share-icon">f</div>
            <div className="pp-share-icon">𝕏</div>
            <div className="pp-share-icon">w</div>
            <div className="pp-share-icon">🔗</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Profile Chips */}
        <div className="pp-chip-row">
          <div className="pp-chips">
            <div className="pp-chip">Followers 120</div>
            <div className="pp-chip">Profile Views 40</div>
            <div className="pp-chip">Team Rank #3</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="pp-tabs-nav-new">
          {['overview', 'matches', 'achievements', 'bio'].map(t => (
            <button 
              key={t}
              className={`pp-tab-new ${activeTab === t ? 'active' : ''}`}
              onClick={() => setActiveTab(t as any)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="pp-content-new">
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
              {/* Grid Cards */}
              <div className="pp-grid-stats">
                {[
                  { label: 'Matches', val: player.stats.overall[0].value },
                  { label: 'Wins', val: Math.floor(player.stats.overall[0].value * 0.6) },
                  { label: 'Raid Pts', val: player.stats.attacking[3]?.value || 0 },
                  { label: 'Tackle Pts', val: player.stats.defensive[2]?.value || 0 },
                  { label: 'Avg Raid', val: (player.stats.attacking[3]?.value / player.stats.overall[0].value).toFixed(1) },
                  { label: 'Avg Tackle', val: (player.stats.defensive[2]?.value / player.stats.overall[0].value).toFixed(1) },
                  { label: 'Super Raids', val: player.stats.attacking[1]?.value || 0 },
                  { label: 'Super Tackles', val: player.stats.defensive[0]?.value || 0 },
                  { label: 'Super 10s', val: player.stats.attacking[2]?.value || 0 },
                  { label: 'High 5s', val: player.stats.defensive[1]?.value || 0 },
                ].map(s => (
                  <div key={s.label} className="pp-grid-card">
                    <div className="pp-grid-label">{s.label}</div>
                    <div className="pp-grid-val" style={{ color: (s as any).color }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Original Stats (Circular) */}
              <div className="pp-stats-grid">
                <div className="pp-stat-card">
                  <div className="pp-stat-card-header">Overall</div>
                  {player.stats.overall.map((s: any) => (
                    <div key={s.label} className="pp-stat-row">
                      <span className="pp-stat-label">{s.label}</span>
                      <span className="pp-stat-value">{s.value}</span>
                    </div>
                  ))}
                  <CircleProgress val={player.stats.percentages.notOut} label="Not out %" color="#f97316" />
                </div>
                <div className="pp-stat-card">
                  <div className="pp-stat-card-header">Attacking</div>
                  <div className="pp-stat-row">
                    <span className="pp-stat-label">Total Raids</span>
                    <span className="pp-stat-value">{player.stats.attacking[0].value}</span>
                  </div>
                  <CircleProgress val={player.stats.percentages.successRaid} label="Successful Raids %" color="#4c1d95" />
                  {player.stats.attacking.slice(1).map((s: any) => (
                    <div key={s.label} className="pp-stat-row">
                      <span className="pp-stat-label">{s.label}</span>
                      <span className="pp-stat-value">{s.value}</span>
                    </div>
                  ))}
                </div>
                <div className="pp-stat-card">
                  <div className="pp-stat-card-header">Defensive</div>
                  {player.stats.defensive.map((s: any) => (
                    <div key={s.label} className="pp-stat-row">
                      <span className="pp-stat-label">{s.label}</span>
                      <span className="pp-stat-value">{s.value}</span>
                    </div>
                  ))}
                  <CircleProgress val={player.stats.percentages.successTackle} label="Tackle Success %" color="#22c55e" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bio' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: '#fff', padding: 30, borderRadius: 24, border: '1px solid #f1f5f9' }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: '#1e293b' }}>About {player.name}</h2>
                <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: 15 }}>
                  {player.bio || defaultBio}
                </p>
              </div>

              {player.careerHighlights && (
                <div style={{ background: '#fff', padding: 30, borderRadius: 24, border: '1px solid #f1f5f9' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: '#1e293b' }}>Career Highlights</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {player.careerHighlights.map((h: string, idx: number) => (
                      <div key={idx} style={{ 
                        background: '#f8fafc', padding: '10px 16px', borderRadius: 12, 
                        fontSize: 14, fontWeight: 700, color: '#475569', border: '1px solid #e2e8f0'
                      }}>
                        🏆 {h}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'matches' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {player.matches.length > 0 ? player.matches.map((m: any) => (
                  <div key={m.id} style={{ 
                    background: '#fff', padding: '20px 24px', borderRadius: 20, 
                    border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', marginBottom: 4 }}>{m.date}</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#1e293b' }}>vs {m.opponent}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 30, textAlign: 'center' }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#4c1d95' }}>{m.raidPts}</div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8' }}>RAID</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#22c55e' }}>{m.tacklePts}</div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8' }}>TACKLE</div>
                      </div>
                    </div>
                    <div style={{ 
                      padding: '6px 14px', borderRadius: 10, background: m.result.includes('Won') ? '#f0fdf4' : '#fef2f2',
                      color: m.result.includes('Won') ? '#16a34a' : '#dc2626', fontSize: 13, fontWeight: 800
                    }}>
                      {m.result}
                    </div>
                  </div>
                )) : (
                  <div style={{ background: '#fff', padding: 40, borderRadius: 24, border: '1px solid #f1f5f9', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>🏟️</div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Match History</h2>
                    <p style={{ color: '#64748b' }}>No matches recorded in the current season yet.</p>
                  </div>
                )}
             </div>
          )}

          {activeTab === 'achievements' && (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {player.achievements.length > 0 ? player.achievements.map((a: any, idx: number) => (
                  <div key={idx} style={{ 
                    background: '#fff', padding: 24, borderRadius: 24, border: '1px solid #f1f5f9',
                    display: 'flex', gap: 20, alignItems: 'center'
                  }}>
                    <div style={{ fontSize: 40, width: 80, height: 80, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {a.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', margin: '0 0 4px 0' }}>{a.title}</h3>
                      <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>{a.desc}</p>
                    </div>
                  </div>
                )) : (
                  <div style={{ gridColumn: '1/-1', background: '#fff', padding: 40, borderRadius: 24, border: '1px solid #f1f5f9', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>🎖️</div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Achievements</h2>
                    <p style={{ color: '#64748b' }}>Unlock badges by participating in more matches.</p>
                  </div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
