import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import type { ReactElement } from 'react'

// Loading spinner shown while session is being checked on page refresh
function SessionLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      gap: 16,
    }}>
      {/* Spinning ring */}
      <div style={{
        width: 44, height: 44,
        border: '3px solid #e2e8f0',
        borderTopColor: '#0ea5e9',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}/>
      <div style={{
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 700,
        fontSize: 14,
        color: '#94a3b8',
      }}>
        Loading Play Legends...
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export function RequireAuth({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show spinner while session is being restored — never redirect yet
  if (loading) return <SessionLoader />

  // Session confirmed as empty — redirect to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export const ProtectedRoute = RequireAuth

export function PublicOnlyRoute({
  children,
  redirectTo = '/home',
}: {
  children: ReactElement
  redirectTo?: string
}) {
  const { user, loading } = useAuth()

  // Don't redirect while still checking
  if (loading) return null

  if (user) return <Navigate to={redirectTo} replace />

  return children
}
