import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import type { ReactElement } from 'react'

export function RequireAuth({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Nunito, sans-serif' }}>
          Checking session...
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/intro" replace state={{ from: location }} />
  }

  return children
}

export function PublicOnlyRoute({
  children,
  redirectTo = '/home',
}: {
  children: ReactElement
  redirectTo?: string
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
