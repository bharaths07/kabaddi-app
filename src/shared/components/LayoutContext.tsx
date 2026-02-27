import React, { createContext, useContext, useState } from 'react'

type LayoutState = {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

const Ctx = createContext<LayoutState | null>(null)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggleSidebar = () => setSidebarOpen(s => !s)
  return <Ctx.Provider value={{ sidebarOpen, toggleSidebar }}>{children}</Ctx.Provider>
}

export function useLayout() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useLayout must be used within LayoutProvider')
  return v
}
