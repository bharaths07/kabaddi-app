import React from 'react'
import { Link } from 'react-router-dom'
import { useLayout } from './LayoutContext'
import './layout.css'

type Props = {
  role?: 'organizer' | 'scorer' | 'viewer';
  user?: { name: string; phone?: string; email?: string; avatar_url?: string | null };
}

export default function RightSidebar({ role = 'organizer', user = { name: 'User', phone: '—', email: '—' } }: Props) {
  const { toggleSidebar } = useLayout()
  const initials = (user.name || 'User').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  
  const closeSidebar = () => toggleSidebar()

  return (
    <aside className="gl-sidebar">
      <div className="gl-sidebar-header">
        <button className="gl-close-btn" onClick={closeSidebar}>✕</button>
      </div>
      
      <div className="gl-profile">
        <div className="gl-avatar">
          {user.avatar_url ? <img src={user.avatar_url} alt="avatar" style={{width:'100%', height:'100%', borderRadius:'50%'}} /> : initials}
        </div>
        <div className="gl-user">
          <div className="gl-username">{user.name}</div>
          <div className="gl-role">{user.phone} • {user.email}</div>
          <div className="gl-badges"><span className="gl-badge gl-badge-free">Free User</span></div>
        </div>
        <Link to="/profile" className="gl-profile-arrow" onClick={closeSidebar} aria-label="Go to Profile">→</Link>
      </div>

      <Link to="/upgrade" className="gl-pro-banner" onClick={closeSidebar}>
        <div className="gl-pro-title">Go PRO at ₹199</div>
        <div className="gl-pro-sub">No autopay • Unlock all features</div>
        <span className="gl-pro-pill">PRO</span>
      </Link>

      <div className="gl-menu-list">
        <Link to="/kabaddi/create" className="gl-menu-item" onClick={closeSidebar}>Start a Match <span className="gl-free-pill">Free</span></Link>
        <Link to="/tournament/create" className="gl-menu-item" onClick={closeSidebar}>Add a Tournament/Series <span className="gl-free-pill">Free</span></Link>
        <Link to="/matches" className="gl-menu-item" onClick={closeSidebar}>Top Matches</Link>
        <Link to="/profile" className="gl-menu-item" onClick={closeSidebar}>My Profile</Link>
        <Link to="/leaderboards" className="gl-menu-item" onClick={closeSidebar}>Leaderboards</Link>
        <Link to="/feed" className="gl-menu-item" onClick={closeSidebar}>📸 Feed</Link>
        <Link to="/awards" className="gl-menu-item" onClick={closeSidebar}>Play Kabaddi Awards</Link>
      </div>

      <div className="gl-section gl-bottom">
        <a href="mailto:kabaddipulse.official@gmail.com" className="gl-item" style={{ textDecoration: 'none' }}>✉️ Support Email</a>
        <a href="https://www.instagram.com/kabaddipulse_official?igsh=MWZobmQyeWpsc2dxZA==" target="_blank" rel="noreferrer" className="gl-item" style={{ textDecoration: 'none' }}>📸 Instagram</a>
        <Link to="/settings" className="gl-item" onClick={closeSidebar}>⚙️ Settings</Link>
        <Link to="/logout" className="gl-item" onClick={closeSidebar}>🚪 Logout</Link>
      </div>
    </aside>
  )
}
