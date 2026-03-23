import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { supabase } from '@shared/lib/supabase'
import { getProfile } from '@shared/lib/auth'

export interface Profile {
  id: string
  full_name?: string
  phone?: string
  email?: string
  avatar_url?: string
  city?: string
  state?: string
  date_of_birth?: string
  is_profile_complete?: boolean
}

type AuthContextValue = {
  user: any | null
  profile: Profile | null
  loading: boolean
  profileLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const Ctx = createContext<AuthContextValue>({
  user: null, profile: null, loading: true,
  profileLoading: false,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]                     = useState<any | null>(null)
  const [profile, setProfile]               = useState<Profile | null>(null)
  const [loading, setLoading]               = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  const loadProfile = async (userId: string) => {
    setProfileLoading(true)
    try {
      const data = await getProfile(userId)
      setProfile(data ?? null)
    } catch (e) {
      console.warn('Profile load failed:', e)
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user?.id) await loadProfile(user.id)
  }

  useEffect(() => {
    let mounted = true

    // FIX: Always call setLoading(false) via finally — even if getSession or
    // loadProfile throws. Without this, a single network error causes a
    // permanent blank screen that forces the user to re-login.
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        const u = session?.user ?? null
        setUser(u)
        // FIX: Don't await loadProfile here — load it in background so the
        // page shows immediately after session is confirmed
        if (u) loadProfile(u.id)  // no await — runs in background
      } catch (e) {
        console.warn('getSession error:', e)
      } finally {
        // FIX: This ALWAYS runs, so loading never gets stuck
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          loadProfile(u.id)  // background, no await
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user, profile, loading, profileLoading,
    signOut: async () => {
      try { await supabase.auth.signOut() } catch {}
      setUser(null)
      setProfile(null)
    },
    refreshProfile,
  }), [user, profile, loading, profileLoading])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  return useContext(Ctx)
}