import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import type { ReactElement } from 'react'

// Loading spinner shown while session is being checked on page refresh
function SessionLoader() {
  return (
    <div style={{
      background:'#0A1628', 
      height:'100vh', 
      display:'flex', 
      flexDirection:'column',
      alignItems:'center', 
      justifyContent:'center'
    }}>
      <img src="/assets/logo.png" width="220" alt="KabaddiPulse Logo" />
      <p style={{
        color:'#FFB800', 
        marginTop:12, 
        letterSpacing:3, 
        fontSize:12,
        fontWeight:800,
        fontFamily: "'Nunito', sans-serif"
      }}>
        THE HEART OF KABADDI
      </p>
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
