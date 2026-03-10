import React from 'react'
import { TeamAnnouncement } from '../components/posters'
import type { TeamInfo } from '../components/posters/engine/posterTypes'

export default function TeamPage() {
  const team: TeamInfo = { name: 'SKBC', abbr: 'SK', color: '#0ea5e9', captain: 'Bharath Gowda', location: 'Bengaluru', players: [], matchesPlayed: 0 }
  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight:900, fontSize:18, marginBottom:8 }}>Team</div>
      <TeamAnnouncement team={team} />
    </div>
  )
}
