import React from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useLayout } from './LayoutContext'
import { useKabaddiStore } from '../../stores/useKabaddiStore'
import { Search, Bell, Menu, ArrowLeft } from 'lucide-react'
import './layout.css'

export default function TopNav() {
  const { toggleSidebar } = useLayout()
  const location = useLocation()
  const navigate = useNavigate()
  const { setSearchOpen } = useKabaddiStore()

  // Define sub-pages that should show a back button instead of the logo
  const subPagePaths = [
    '/profile/',
    '/profile/edit',
    '/settings',
    '/awards',
    '/notifications',
    '/teams/',
    '/players/',
    '/matches/',
    '/tournaments/',
    '/about',
    '/kabaddi/create',
    '/tournament/create',
    '/verify-otp',
    '/me/posters',
    '/upgrade',
    '/scorer/',
    '/key-stats',
    '/news',
    '/feed',
    '/search'
  ]

  const isSubPage = subPagePaths.some(p => location.pathname.startsWith(p)) && location.pathname !== '/'

  return (
    <header className="gl-topnav">
      <div className="gl-topnav-top">
        <div className="gl-brand">
          {isSubPage ? (
            <button className="gl-back-nav-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
              <span className="gl-back-text">Back</span>
            </button>
          ) : (
            <Link to="/" className="gl-logo" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '20px' }}>
              KabaddiPulse
            </Link>
          )}
        </div>
        {!isSubPage && (
          <div className="gl-icons">
            <button 
              onClick={() => setSearchOpen(true)} 
              style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', cursor: 'pointer', outline: 'none', padding: '4px' }} 
              title="Search"
            >
              <Search size={22} />
            </button>
            <Link to="/notifications" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '4px' }}>
              <Bell size={22} />
            </Link>
            <button className="gl-menu" aria-label="Toggle menu" onClick={toggleSidebar} style={{ padding: '4px' }}>
              <Menu size={24} />
            </button>
          </div>
        )}
      </div>
      
      {!isSubPage && (
        <nav className="gl-primary-nav">
          <NavLink to="/" end className="gl-nav-link">HOME</NavLink>
          <NavLink to="/matches" className="gl-nav-link">MATCHES</NavLink>
          <NavLink to="/tournaments" className="gl-nav-link">TOURNAMENT</NavLink>
          <NavLink to="/leaderboards" className="gl-nav-link">RANKINGS</NavLink>
        </nav>
      )}
    </header>
  )
}
