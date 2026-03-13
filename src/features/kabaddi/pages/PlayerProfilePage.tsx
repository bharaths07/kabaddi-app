import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import './leaderboards.css'

// Mock Detailed Player Data
const PLAYER_DATA: Record<string, any> = {
  'pawan-sehrawat': {
    name: 'Pawan Sehrawat',
    role: 'Raider',
    country: 'India',
    team: 'Wolves',
    teamColor: '#64748b',
    bio: 'Pawan Kumar Sehrawat is an Indian professional Kabaddi player who plays as a raider. He is widely considered one of the most explosive raiders in the history of the sport, known for his signature "Lion Jump" and incredible speed. He has captained the Indian national team and several franchise teams to victory.',
    careerHighlights: [
      'Most Valuable Player (Season 6)',
      'Best Raider (Season 7, 8, 9)',
      'Gold Medal - South Asian Games 2019',
      'Highest points in a single match (39)'
    ],
    stats: {
      overall: [
        { label: 'Matches Played', value: 116 },
        { label: 'Total Points Earned', value: 1202 },
        { label: 'Raid Points Per Match', value: 9.85 },
      ],
      attacking: [
        { label: 'Total Raids', value: 1845 },
        { label: 'No. Of Super Raids', value: 32 },
        { label: 'Super 10s', value: 55 },
        { label: 'Total Raid Points', value: 1189 },
      ],
      defensive: [
        { label: 'No. Of Super Tackles', value: 2 },
        { label: 'High 5s', value: 1 },
        { label: 'Total Tackle Points', value: 13 },
        { label: 'Average Successful Tackles/Match', value: 0.11 },
        { label: 'Total Tackles', value: 45 },
      ],
      percentages: {
        notOut: 76.08,
        successRaid: 64.44,
        successTackle: 28.89
      }
    },
    matches: [
      { id: 'm1', opponent: 'Rangers', date: '2026-03-01', raidPts: 12, tacklePts: 1, result: 'Won 34-29' },
      { id: 'm2', opponent: 'Titans', date: '2026-02-25', raidPts: 15, tacklePts: 0, result: 'Won 42-38' },
      { id: 'm3', opponent: 'Falcons', date: '2026-02-18', raidPts: 8, tacklePts: 2, result: 'Lost 31-35' },
    ],
    achievements: [
      { title: 'Super 10 Machine', icon: '🔥', desc: 'Scored 10+ points in 5 consecutive matches' },
      { title: 'Lion Jump', icon: '🦁', desc: 'Executed 10 successful escape jumps' },
      { title: 'Team Backbone', icon: '🛡️', desc: 'Played 100% of match minutes in a season' },
    ]
  },
  'v-rao': {
    name: 'V. Rao',
    role: 'Defender',
    country: 'India',
    team: 'Puneri Paltan',
    teamColor: '#f97316',
    bio: 'V. Rao is a tactical defender specializing in the Left Corner position. Known for his "Ankle Hold" and "Dash", he is the backbone of the Puneri Paltan defense. His ability to read the raider\'s mind makes him one of the most feared defenders in the league.',
    careerHighlights: [
      'Best Defender (Season 10)',
      'Most Super Tackles in a Season',
      'Asian Games Bronze Medalist'
    ],
    stats: {
      overall: [
        { label: 'Matches Played', value: 84 },
        { label: 'Total Points Earned', value: 245 },
        { label: 'Tackle Points Per Match', value: 2.91 },
      ],
      attacking: [
        { label: 'Total Raids', value: 12 },
        { label: 'No. Of Super Raids', value: 0 },
        { label: 'Super 10s', value: 0 },
        { label: 'Total Raid Points', value: 4 },
      ],
      defensive: [
        { label: 'No. Of Super Tackles', value: 15 },
        { label: 'High 5s', value: 12 },
        { label: 'Total Tackle Points', value: 241 },
        { label: 'Average Successful Tackles/Match', value: 2.86 },
        { label: 'Total Tackles', value: 420 },
      ],
      percentages: {
        notOut: 85.00,
        successRaid: 33.33,
        successTackle: 57.38
      }
    },
    matches: [
      { id: 'm1', opponent: 'Spartans', date: '2026-03-05', raidPts: 0, tacklePts: 5, result: 'Won 28-24' },
      { id: 'm2', opponent: 'Vipers', date: '2026-02-28', raidPts: 1, tacklePts: 3, result: 'Lost 22-30' },
    ],
    achievements: [
      { title: 'Wall of Steel', icon: '🧱', desc: '5 clean sheets in a row' },
      { title: 'Ankle King', icon: '👑', desc: '50 successful ankle holds' },
    ]
  }
}

// Fallback generator for other players
const getPlayerData = (id: string) => {
  if (PLAYER_DATA[id]) return PLAYER_DATA[id]
  
  // Handle simple IDs like p1, p2, etc.
  const nameMap: Record<string, string> = {
    'p1': 'Pradeep Narwal',
    'p2': 'Maninder Singh',
    'p3': 'Fazel Atrachali',
    'p4': 'Rahul Chaudhari',
    'p5': 'Deepak Hooda',
    'p6': 'Sandeep Narwal',
    'p7': 'Pawan Sehrawat',
    'p8': 'Sagar',
    'p9': 'Ajit Pawar',
  }
  
  const name = nameMap[id] || id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
  return {
    name,
    role: id.includes('rao') || id.includes('khan') ? 'Defender' : 'Raider',
    country: 'India',
    team: 'Pro Kabaddi',
    teamColor: '#1e293b',
    bio: `${name} is a dedicated professional Kabaddi player. With a focus on teamwork and strategic execution, they have consistently contributed to their team's performance throughout the season.`,
    careerHighlights: ['Professional League Debut 2024'],
    stats: {
      overall: [
        { label: 'Matches Played', value: 10 },
        { label: 'Total Points Earned', value: 45 },
        { label: 'Points Per Match', value: 4.5 },
      ],
      attacking: [
        { label: 'Total Raids', value: 85 },
        { label: 'No. Of Super Raids', value: 2 },
        { label: 'Super 10s', value: 1 },
        { label: 'Total Raid Points', value: 42 },
      ],
      defensive: [
        { label: 'No. Of Super Tackles', value: 1 },
        { label: 'High 5s', value: 0 },
        { label: 'Total Tackle Points', value: 3 },
        { label: 'Average Successful Tackles/Match', value: 0.3 },
        { label: 'Total Tackles', value: 12 },
      ],
      percentages: {
        notOut: 70,
        successRaid: 45,
        successTackle: 25
      }
    },
    matches: [],
    achievements: []
  }
}

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
  
  const player = getPlayerData(id || 'pawan-sehrawat')

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
                    <div className="pp-grid-val" style={{ color: s.color }}>{s.val}</div>
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
                  {player.bio}
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
