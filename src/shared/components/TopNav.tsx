import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useLayout } from './LayoutContext'
import './layout.css'

export default function TopNav() {
  const { toggleSidebar } = useLayout()
  return (
    <header className="gl-topnav">
      <div className="gl-brand">
        <Link to="/" className="gl-logo">Game Legends</Link>
      </div>
      <nav className="gl-primary-nav">
        <NavLink to="/" end className="gl-nav-link">Home</NavLink>
        <NavLink to="/matches" className="gl-nav-link">Matches</NavLink>
        <NavLink to="/leaderboards" className="gl-nav-link">Leaderboards</NavLink>
        <NavLink to="/tournaments" className="gl-nav-link">Tournaments</NavLink>
      </nav>
      <div className="gl-right">
        <button className="gl-menu" aria-label="Toggle menu" onClick={toggleSidebar}>☰</button>
      </div>
    </header>
  )
}
