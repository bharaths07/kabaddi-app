import React from 'react'
import TopNav from './TopNav'
import RightSidebar from './RightSidebar'
import './layout.css'
import { Outlet } from 'react-router-dom'
import { LayoutProvider, useLayout } from './LayoutContext'
import { applyThemeClass } from '../state/settingsStore'

function Shell() {
  const { sidebarOpen, toggleSidebar } = useLayout()
  React.useEffect(() => {
    const apply = () => applyThemeClass(document.body)
    apply()
    const onChange = () => apply()
    window.addEventListener('settings:changed', onChange as any)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener('settings:changed', onChange as any)
      window.removeEventListener('storage', onChange)
    }
  }, [])
  return (
    <div className={`gl-app ${sidebarOpen ? 'gl-drawer-open' : ''}`}>
      {sidebarOpen && <div className="gl-overlay" onClick={toggleSidebar} />}
      <TopNav />
      <div className="gl-body">
        <main className="gl-content">
          <div className="page-wrapper">
            <Outlet />
          </div>
        </main>
        <RightSidebar />
      </div>
    </div>
  )
}

export default function Layout() {
  return (
    <LayoutProvider>
      <Shell />
    </LayoutProvider>
  )
}
