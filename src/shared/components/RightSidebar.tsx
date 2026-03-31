import React from 'react'
import { Link } from 'react-router-dom'
import { useLayout } from './LayoutContext'
import './layout.css'

type Props = {
  role?: 'organizer' | 'scorer' | 'viewer';
  user?: { name: string; phone?: string; email?: string; avatar_url?: string | null };
}

export default function RightSidebar({ 
  role = 'organizer', 
  user = { name: 'bh', phone: '91991688167', email: 'Bggwads496@Gmail.Com' } 
}: Props) {
  const { toggleSidebar } = useLayout()
  const initials = (user.name || 'User').split(' ').map(w => w[0]).join('').slice(0,2).toLowerCase()
  
  const closeSidebar = () => toggleSidebar()

  return (
    <aside className="sb-container">
      {/* Header Profile Identity */}
      <div className="sb-header">
        <button className="sb-close" onClick={closeSidebar}>✕</button>
        
        <Link to="/profile" className="sb-profile-block" onClick={closeSidebar} style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className="sb-avatar-wrapper">
            <div className="sb-avatar">
              {user.avatar_url ? <img src={user.avatar_url} alt="avatar" style={{width:'100%', height:'100%', borderRadius:'50%'}} /> : initials}
            </div>
            <div className="sb-status-dot"></div>
          </div>
          <div className="sb-user-info">
            <h2 className="sb-user-name">{user.name}</h2>
            <div className="sb-user-phone">
              {user.phone} <span style={{fontSize: '10px', color: '#94a3b8'}}>▼</span>
            </div>
            <div className="sb-user-email">{user.email}</div>
            <div className="sb-user-badge">Free User</div>
          </div>
          <button className="sb-menu-dots">•••</button>
        </Link>
      </div>

      {/* Sections Body */}
      <div className="sb-body">
        
        <div className="sb-section">
          <div className="sb-section-title">ACTIONS</div>
          <Link to="/kabaddi/create" className="sb-btn sb-btn-orange" onClick={closeSidebar}>
            <div className="sb-btn-left">
              <span className="sb-btn-icon">✚</span>
              <span>Start Match</span>
            </div>
            <span className="sb-btn-arrow">›</span>
          </Link>
          <Link to="/tournament/create" className="sb-btn sb-btn-gold" onClick={closeSidebar}>
            <div className="sb-btn-left">
              <span className="sb-btn-icon">🏆</span>
              <span>Create Tournament</span>
            </div>
            <span className="sb-btn-arrow">›</span>
          </Link>
        </div>

        <div className="sb-section">
          <div className="sb-section-title">COMMUNITY</div>
          <Link to="/feed" className="sb-pill" onClick={closeSidebar}>
            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
              <span className="sb-pill-icon">📸</span>
              <span>Feed</span>
            </div>
            <span className="sb-pill-arrow">›</span>
          </Link>
          <Link to="/news" className="sb-pill" onClick={closeSidebar}>
            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
              <span className="sb-pill-icon">📰</span>
              <span>News</span>
            </div>
            <span className="sb-pill-arrow">›</span>
          </Link>
        </div>

        <div className="sb-section">
          <div className="sb-section-title">INSIGHTS</div>
          <Link to="/leaderboards/teams" className="sb-pill" onClick={closeSidebar}>
            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
              <span className="sb-pill-icon">👥</span>
              <span>Teams</span>
            </div>
            <span className="sb-pill-arrow">›</span>
          </Link>
        </div>

        <div className="sb-section">
          <div className="sb-section-title">ACCOUNT</div>
          <Link to="/settings" className="sb-pill" onClick={closeSidebar}>
            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
              <span className="sb-pill-icon" style={{color:'#64748b'}}>⚙️</span>
              <span>Settings</span>
            </div>
          </Link>
          <Link to="/logout" className="sb-pill" onClick={closeSidebar}>
            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
              <span className="sb-pill-icon" style={{color:'#dc2626', opacity:0.8}}>🚪</span>
              <span>Logout</span>
            </div>
          </Link>
        </div>

      </div>
    </aside>
  )
}
