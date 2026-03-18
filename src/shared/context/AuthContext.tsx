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
  user: null,
  profile: null,
  loading: true,
  profileLoading: false,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<any | null>(null)
  const [profile, setProfile]         = useState<Profile | null>(null)
  const [loading, setLoading]         = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  const loadProfile = async (userId: string) => {
    setProfileLoading(true)
    try {
      const data = await getProfile(userId)
      setProfile(data ?? null)
    } catch (e) {
      console.error('Profile load error:', e)
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      const u = session?.user ?? null
      setUser(u)
      if (u) loadProfile(u.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          await loadProfile(u.id)
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
    user,
    profile,
    loading,
    profileLoading,
    signOut: async () => {
      await supabase.auth.signOut()
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