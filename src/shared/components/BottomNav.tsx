import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Calendar, Trophy, Menu } from 'lucide-react'
import './bottom-nav.css'

export default function BottomNav() {
  const location = useLocation()
  
  const navItems = [
    { label: 'Home', icon: Home, path: '/home' },
    { label: 'Schedule', icon: Calendar, path: '/matches' },
    { label: 'Standings', icon: Trophy, path: '/leaderboards' },
    { label: 'More', icon: Menu, path: '/settings' }, // Using settings for "More"
  ]

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path)
        const Icon = item.icon
        
        return (
          <Link 
            key={item.label} 
            to={item.path} 
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
