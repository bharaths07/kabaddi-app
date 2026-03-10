import React, { useState } from 'react'
import { PosterPreview, PlayerPerformance } from '../components/posters'
import type { PlayerCareerStats } from '../components/posters/engine/posterTypes'

export default function PlayerProfilePage() {
  const [show, setShow] = useState(false)
  const player: PlayerCareerStats = {
    type: 'player_performance',
    name: 'Bharath Gowda',
    jersey: 10,
    position: 'Raider',
    teamName: 'SKBC',
    teamColor: '#0ea5e9',
    teamAbbr: 'SK',
    matches: 12,
    raidPts: 123,
    tacklePts: 23,
    winRate: 75,
    superRaids: 5,
    superTackles: 2,
    joinedDate: '2025-01-01',
    awards: ['MVP'],
    seasonRank: '#1 Raider in KPL 2026'
  }
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontWeight:900, fontSize:18 }}>Player Profile</div>
        <button onClick={() => setShow(true)} style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #0ea5e9', color:'#0ea5e9', background:'transparent', fontWeight:800 }}>Generate My Poster</button>
      </div>
      {show && <PosterPreview data={player} onClose={() => setShow(false)} />}
      <div style={{ marginTop:12 }}>
        <PlayerPerformance {...player} />
      </div>
    </div>
  )
}
