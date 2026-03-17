import React, { createContext, useContext, useState, useMemo } from 'react'

type User = any | null
type AuthContextValue = {
  user: User
  setUser: (u: User) => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const Ctx = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const value = useMemo<AuthContextValue>(() => ({
    user,
    setUser,
    signOut: async () => { setUser(null) },
    refreshProfile: async () => {},
  }), [user])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  return useContext(Ctx)
}
