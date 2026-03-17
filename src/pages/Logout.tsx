import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../shared/lib/supabase'
import { useAuth } from '../shared/context/AuthContext'

export default function LogoutPage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  useEffect(() => {
    (async () => {
      try {
        await (supabase as any)?.auth?.signOut?.()
      } catch {
        // ignore if Supabase not configured
      }
      try {
        await signOut()
      } catch {
        // ignore
      }
      navigate('/intro', { replace: true })
    })()
  }, [navigate, signOut])

  return null
}
