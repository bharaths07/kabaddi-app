import React from 'react'
import { Outlet } from 'react-router-dom'

// Note: Stripped redundant layout wrapping since PlayerLeaderboardsPage provides the full premium UI
export default function LeaderboardsLayout() {
  return <Outlet />
}
