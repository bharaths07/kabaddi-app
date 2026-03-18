import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { supabase } from '@shared/lib/supabase'
import { getDevAuthUser } from '@shared/lib/auth'

type User = any | null
type AuthContextValue = {
  user: User
  loading: boolean
  setUser: (u: User) => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const Ctx = createContext<AuthContextValue>({
  user: null,
  loading: true,
  setUser: () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const syncUser = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const sessionUser = data?.session?.user ?? null
        if (!mounted) return
        setUser(sessionUser || getDevAuthUser())
      } catch {
        if (!mounted) return
        setUser(getDevAuthUser())
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void syncUser()

    let authSubscription: { unsubscribe: () => void } | null = null
    try {
      const { data } = (supabase as any)?.auth?.onAuthStateChange?.((_event: string, session: any) => {
        setUser(session?.user ?? getDevAuthUser())
      }) || {}
      authSubscription = data?.subscription || null
    } catch {
      authSubscription = null
    }

    const onAuthChanged = () => {
      setUser(getDevAuthUser())
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'pl.dev.user') setUser(getDevAuthUser())
    }

    window.addEventListener('auth:changed', onAuthChanged as EventListener)
    window.addEventListener('storage', onStorage)

    return () => {
      mounted = false
      authSubscription?.unsubscribe?.()
      window.removeEventListener('auth:changed', onAuthChanged as EventListener)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    setUser,
    signOut: async () => {
      try { await (supabase as any)?.auth?.signOut?.() } catch {}
      try { localStorage.removeItem('pl.dev.user') } catch {}
      setUser(null)
      try { dispatchEvent(new CustomEvent('auth:changed', { detail: null })) } catch {}
    },
    refreshProfile: async () => {
      try {
        const { data } = await supabase.auth.getUser()
        setUser(data?.user ?? getDevAuthUser())
      } catch {
        setUser(getDevAuthUser())
      }
    },
  }), [loading, user])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  return useContext(Ctx)
}
