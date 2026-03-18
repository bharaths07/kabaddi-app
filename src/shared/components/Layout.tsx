import React from 'react'
import TopNav from './TopNav'
import RightSidebar from './RightSidebar'
import './layout.css'
import { Outlet } from 'react-router-dom'
import { LayoutProvider, useLayout } from './LayoutContext'
import { applyThemeClass } from '../state/settingsStore'
import { useAuth } from '../context/AuthContext'

type ErrorBoundaryState = { hasError: boolean }

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: unknown, info: unknown) { console.error('UI error:', error, info) }
  render() {
    if (this.state.hasError) {
      return (
        <div className="page-wrapper">
          <div>Something went wrong. Please refresh the page.</div>
        </div>
      )
    }
    return this.props.children
  }
}

function Shell() {
  const { sidebarOpen, toggleSidebar } = useLayout()
  const { user, profile } = useAuth()

  React.useEffect(() => {
    const apply = () => applyThemeClass(document.body)
    apply()
    window.addEventListener('settings:changed', apply as any)
    window.addEventListener('storage', apply)
    return () => {
      window.removeEventListener('settings:changed', apply as any)
      window.removeEventListener('storage', apply)
    }
  }, [])

  // Build user object for sidebar from real profile data
  const sidebarUser = {
    name:  profile?.full_name  || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
    phone: profile?.phone      || user?.phone || '—',
    email: profile?.email      || user?.email || '—',
    avatar_url: profile?.avatar_url || null,
  }

  return (
    <div className={`gl-app ${sidebarOpen ? 'gl-drawer-open' : ''}`}>
      {sidebarOpen && <div className="gl-overlay" onClick={toggleSidebar} />}
      <TopNav />
      <div className="gl-body">
        <main className="gl-content">
          <ErrorBoundary>
            <div className="page-wrapper">
              <Outlet />
            </div>
          </ErrorBoundary>
        </main>
        <RightSidebar user={sidebarUser} />
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