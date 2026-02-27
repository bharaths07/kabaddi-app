import React from 'react'
import { Link } from 'react-router-dom'
import './layout.css'

type Props = { role?: 'organizer' | 'scorer' | 'viewer'; user?: { name: string } }

export default function RightSidebar({ role = 'organizer', user = { name: 'User' } }: Props) {
  return (
    <aside className="gl-sidebar">
      <div className="gl-profile">
        <div className="gl-avatar">GL</div>
        <div className="gl-user">
          <div className="gl-username">{user.name}</div>
          <div className="gl-role">{role}</div>
        </div>
      </div>
      <div className="gl-actions">
        <Link to="/kabaddi/create" className="gl-action-btn">Start a Match</Link>
        <Link to="/tournament/create" className="gl-action-btn">Create Tournament</Link>
        {role === 'scorer' && <Link to="/scorer/assigned" className="gl-action-btn">My Assigned Matches</Link>}
      </div>
      <div className="gl-section">
        <Link to="/me/stats" className="gl-item">My Stats</Link>
        <Link to="/feed" className="gl-item">Feed & News</Link>
      </div>
      <div className="gl-section gl-bottom">
        <Link to="/settings" className="gl-item">Settings</Link>
        <Link to="/upgrade" className="gl-item">Plan Upgrade</Link>
        <Link to="/logout" className="gl-item">Logout</Link>
      </div>
    </aside>
  )
}
