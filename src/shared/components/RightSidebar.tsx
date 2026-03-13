import React from 'react'
import { Link } from 'react-router-dom'
import './layout.css'

type Props = {
  role?: 'organizer' | 'scorer' | 'viewer';
  user?: { name: string; phone?: string; email?: string };
}

export default function RightSidebar({ role = 'organizer', user = { name: 'User', phone: '—', email: '—' } }: Props) {
  const initials = (user.name || 'User').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  return (
    <aside className="gl-sidebar">
      <div className="gl-profile">
        <div className="gl-avatar">{initials}</div>
        <div className="gl-user">
          <div className="gl-username">{user.name}</div>
          <div className="gl-role">{user.phone} • {user.email}</div>
          <div className="gl-badges"><span className="gl-badge gl-badge-free">Free User</span></div>
        </div>
        <Link to="/me/stats" className="gl-profile-arrow" aria-label="Go to Profile">→</Link>
      </div>

      <Link to="/upgrade" className="gl-pro-banner">
        <div className="gl-pro-title">Go PRO at ₹199</div>
        <div className="gl-pro-sub">No autopay • Unlock all features</div>
        <span className="gl-pro-pill">PRO</span>
      </Link>

      <div className="gl-menu-list">
        <Link to="/about" className="gl-menu-item" style={{ color: 'var(--color-sky)', fontWeight: 800 }}>✨ About Project (Pitch)</Link>
        <Link to="/kabaddi/create" className="gl-menu-item">Start a Match <span className="gl-free-pill">Free</span></Link>
        <Link to="/tournament/create" className="gl-menu-item">Add a Tournament/Series <span className="gl-free-pill">Free</span></Link>
        <Link to="/matches" className="gl-menu-item">Go Live</Link>
        <Link to="/me/stats" className="gl-menu-item">My Kabaddi</Link>
        <Link to="/leaderboards" className="gl-menu-item">Leaderboards</Link>
        <Link to="/awards" className="gl-menu-item">Play Kabaddi Awards</Link>
      </div>

      <div className="gl-section gl-bottom">
        <Link to="/settings" className="gl-item">Settings</Link>
        <Link to="/upgrade" className="gl-item">Plan Upgrade</Link>
        <Link to="/logout" className="gl-item">Logout</Link>
      </div>
    </aside>
  )
}
