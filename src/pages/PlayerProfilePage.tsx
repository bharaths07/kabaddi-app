import React, { useState } from 'react';
import './player-profile.css';

const player = {
  name: "Ayan Lohchab",
  role: "Raider",
  team: "Jaipur Warriors",
  location: "Jaipur, India",
  matches: 45,
  totalPoints: 520,
  avgPoints: 11.6,
  avatar: "https://i.pravatar.cc/150?u=ayan",
  matchesHistory: [
    { id: '#78', opponent: 'Pune Dynamos', pts: 14, result: 'WIN', rating: 9.1, logo: '🦁', oppLogo: '👺' },
    { id: '#64', opponent: 'Patna Knights', pts: 7, result: 'LOSS', rating: 7.5, logo: '🛡️', oppLogo: '⚔️' },
    { id: '#52', opponent: 'Mumbai Tigers', pts: 10, result: 'WIN', rating: 8.3, logo: '🐅', oppLogo: '👺' },
  ]
};

export default function PlayerProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'advanced' | 'matches' | 'achievements'>('overview');

  return (
    <div className="hp-page" style={{ paddingTop: '32px', paddingBottom: '80px', background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div className="prf-container">
        
        {/* Hero Card */}
        <div className="prf-hero-card">
          <div className="prf-fire-banner"></div>
          
          <div className="prf-hero-body">
            {/* Top Row: Avatar + Name + Rating */}
            <div className="prf-hero-top-row">
              <div className="prf-avatar-circle">
                <img src={player.avatar} alt={player.name} />
              </div>
              
              <div className="prf-hero-info">
                <div className="prf-name-and-rating">
                  <div className="prf-name-team">
                    <h1>{player.name}</h1>
                    <div className="prf-role-row">
                      <span className="prf-badge-orange">{player.role}</span>
                      <span className="prf-team">{player.team}</span>
                    </div>
                    <div className="prf-location">📍 {player.location}</div>
                  </div>
                  <div className="prf-rating-pill">
                    <span className="prf-score">92.4</span>
                    <span className="prf-trend">+5 ↑</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Middle Row: The 3 KPI Capsules */}
            <div className="prf-kpi-row">
              {/* Capsule 1: Orange tint */}
              <div className="prf-kpi-capsule stat-cap-1">
                 <div className="prf-kpi-block">
                   <div className="prf-kpi-val"><span className="kpi-icon-star">⭐</span> 5.9</div>
                   <div className="prf-kpi-lbl">NPpR</div>
                 </div>
                 <div className="prf-kpi-divider"></div>
                 <div className="prf-kpi-block">
                   <div className="prf-kpi-val"><span className="kpi-icon-shield">🛡️</span> 137</div>
                   <div className="prf-kpi-lbl">Strike Rate</div>
                 </div>
              </div>

              {/* Capsule 2: Blue tint */}
              <div className="prf-kpi-capsule stat-cap-2">
                 <div className="prf-kpi-block">
                   <div className="prf-kpi-val"><span style={{color:'#64748b', fontSize:'22px'}}>65.7%</span></div>
                   <div className="prf-kpi-lbl">Strike Rate</div>
                 </div>
                 <div className="prf-kpi-divider"></div>
                 <div className="prf-kpi-block">
                   <div className="prf-kpi-val"><span className="kpi-icon-check">✔</span> 76%</div>
                   <div className="prf-kpi-lbl">Pressure</div>
                 </div>
                 <div className="prf-kpi-divider"></div>
                 <div className="prf-kpi-block">
                   <div className="prf-kpi-val"><span className="kpi-icon-pink">💠</span> 302</div>
                   <div className="prf-kpi-lbl">DOD Success</div>
                 </div>
              </div>

              {/* Capsule 3: Purple tint with Trophy */}
              <div className="prf-kpi-capsule stat-cap-3">
                 <div className="prf-kpi-block" style={{alignItems: 'flex-start'}}>
                   <div className="prf-kpi-val"><span className="kpi-icon-purple">🎯</span> 41%</div>
                   <div className="prf-kpi-lbl" style={{marginTop:'4px'}}>DOD Success</div>
                 </div>
                 <div className="prf-kpi-block">
                   <span className="kpi-trophy-icon">🏆</span>
                 </div>
              </div>
            </div>
          
            {/* Tabs Row */}
            <div className="prf-tabs-row">
              <button className={`prf-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
              <button className={`prf-tab ${activeTab === 'advanced' ? 'active' : ''}`} onClick={() => setActiveTab('advanced')}>Advanced Stats</button>
              <button className={`prf-tab ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}>Match History</button>
              <button className={`prf-tab ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')}>Achievements</button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'overview' && (
          <div className="prf-content-grid">
            {/* Left Column Card */}
            <div className="prf-left-card">
              <div className="prf-stats-header">
                 <div className="prf-stat-box">
                    <span className="lbl">Total Matches</span>
                    <span className="val"><span style={{color:'#f59e0b', fontSize:'20px'}}>🛡️</span> {player.matches}</span>
                 </div>
                 <div className="prf-stat-box">
                    <span className="lbl">Total Points</span>
                    <span className="val" style={{color:'#ea580c'}}>{player.totalPoints}</span>
                 </div>
                 <div className="prf-stat-box">
                    <span className="lbl">Avg Points</span>
                    <span className="val" style={{color:'#84cc16'}}>{player.avgPoints} <span style={{fontSize:'16px', color:'#94a3b8'}}>📊</span></span>
                 </div>
              </div>
              
              <div className="prf-mh-fat-list">
                 {player.matchesHistory.map((m, i) => (
                   <div key={i} className="row">
                     <div className="team"><span style={{fontSize:'22px'}}>{m.logo}</span> {m.id} {m.opponent}</div>
                     <div className="pts">{m.pts}</div>
                     <div className="badge-wrap"><span className={`badge ${m.result.toLowerCase()}`}>{m.result}</span></div>
                     <div className="rating">⭐ {m.rating}</div>
                   </div>
                 ))}
                 <div className="view-more-wrap">
                   <button className="view-more">View More {'>'}</button>
                 </div>
              </div>
            </div>
            
            {/* Right Column Card */}
            <div className="prf-right-card">
               <h3 className="right-card-title">Match History</h3>
               <div className="prf-mh-thin-list">
                 {player.matchesHistory.map((m, i) => (
                   <div key={i} className="thin-row">
                     <div className="col1">
                       <span style={{color:'#64748b'}}>{m.id}</span>
                       <br/>
                       <span style={{color:'#1e293b', fontWeight:700}}>{m.opponent}</span>
                     </div>
                     <div className="col2">
                       <div className="logos-mini">{m.logo} <span style={{color:'#cbd5e1'}}>|</span> {m.oppLogo}</div>
                       <div className="rating-mini">{m.rating}</div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}