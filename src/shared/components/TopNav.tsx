import React from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useLayout } from './LayoutContext'
import './layout.css'

export default function TopNav() {
  const { toggleSidebar } = useLayout()
  const location = useLocation()
  const navigate = useNavigate()

  // Define sub-pages that should show a back button instead of the logo
  const subPagePaths = [
    '/profile/edit',
    '/settings',
    '/awards',
    '/notifications',
    '/teams/',
    '/players/',
    '/matches/',
    '/about',
    '/kabaddi/create',
    '/tournament/create',
    '/verify-otp'
  ]

  const isSubPage = subPagePaths.some(p => location.pathname.startsWith(p)) && location.pathname !== '/'

  return (
    <header className="gl-topnav">
      <div className="gl-brand">
        {isSubPage ? (
          <button className="gl-back-nav-btn" onClick={() => navigate(-1)}>
            <span className="gl-back-arrow">←</span>
            <span className="gl-back-text">Back</span>
          </button>
        ) : (
          <Link to="/" className="gl-logo">
            <img src="/assets/logo.png" alt="KabaddiPulse" height="40" style={{ objectFit: 'contain' }} />
          </Link>
        )}
      </div>
      {!isSubPage && (
        <nav className="gl-primary-nav">
          <NavLink to="/" end className="gl-nav-link">Home</NavLink>
          <NavLink to="/matches" className="gl-nav-link">Matches</NavLink>
          <NavLink to="/leaderboards" className="gl-nav-link">Leaderboards</NavLink>
          <NavLink to="/tournaments" className="gl-nav-link">Tournaments</NavLink>
        </nav>
      )}
      <div className="gl-right">
        <button className="gl-menu" aria-label="Toggle menu" onClick={toggleSidebar}>☰</button>
      </div>
    </header>
  )
}
