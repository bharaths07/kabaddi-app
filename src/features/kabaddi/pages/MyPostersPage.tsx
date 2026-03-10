import { useRef, useState } from 'react'
import { exportNodePNG, shareToWhatsApp, captureNodeToCanvas } from '../components/posters'
import ManOfMatch from '../components/posters/templates/ManOfMatch'
import PlayerPerformance from '../components/posters/templates/PlayerPerformance'
import type { PlayerCareerStats, PlayerMatchStats, PosterRatio } from '../components/posters/engine/posterTypes'

export default function MyPostersPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [ratio, setRatio] = useState<PosterRatio>('square')
  const player: PlayerCareerStats = {
    type: 'player_performance',
    name: 'Bharath Gowda',
    teamName: 'SKBC',
    teamAbbr: 'SK',
    teamColor: '#0ea5e9',
    photoUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1080&auto=format&fit=crop',
    seasonRank: '#1 Raider in KPL 2026',
    raidPts: 182,
    jersey: 10,
    position: 'Raider',
    matches: 12,
    tacklePts: 23,
    winRate: 0.75,
    superRaids: 12,
    superTackles: 4,
    joinedDate: '2024-01-01',
    awards: ['MVP', 'Top Raider']
  }
  const playerMatchStats: PlayerMatchStats = {
    type: 'man_of_match',
    name: 'Bharath Gowda',
    jersey: 10,
    teamName: 'SKBC',
    teamColor: '#0ea5e9',
    teamAbbr: 'SK',
    raidPts: 12,
    tacklePts: 2,
    totalPts: 14,
    raids: 15,
    superRaids: 1,
    tackles: 3,
    bonusPts: 2,
    isManOfMatch: true,
    matchContext: 'vs Rangers • KPL 2026'
  }
  const doDownload = async () => {
    if (containerRef.current) await exportNodePNG(containerRef.current, 'my-trading-card.png')
  }
  const doShareWA = async () => {
    if (!containerRef.current) return
    const canvas = await captureNodeToCanvas(containerRef.current)
    const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    if (blob) await shareToWhatsApp(blob, 'My Kabaddi Trading Card 🔥')
  }
  const setAsBanner = async () => {
    if (!containerRef.current) return
    const canvas = await captureNodeToCanvas(containerRef.current, { scale: 2 })
    const dataUrl = canvas.toDataURL('image/png')
    try { localStorage.setItem('gl.profile.banner', dataUrl) } catch {}
    alert('Saved as profile banner!')
  }
  return (
    <div className="mp-page">
      <div className="mp-header">
        <div className="mp-title">My Posters</div>
        <div className="mp-actions">
          <button type="button" onClick={doDownload} className="btn btn-outline-sky btn-sm">Download</button>
          <button type="button" onClick={doShareWA} className="btn btn-success btn-sm">Share WhatsApp</button>
          <button type="button" onClick={setAsBanner} className="btn btn-purple btn-sm">Set as Profile Banner</button>
        </div>
      </div>
      <div className="mp-tabs">
        <button type="button" className={`btn btn-ghost btn-sm ${ratio==='story'?'btn-outline-sky':''}`} onClick={() => setRatio('story')}>Story</button>
        <button type="button" className={`btn btn-ghost btn-sm ${ratio==='square'?'btn-outline-sky':''}`} onClick={() => setRatio('square')}>Square</button>
        <button type="button" className={`btn btn-ghost btn-sm ${ratio==='landscape'?'btn-outline-sky':''}`} onClick={() => setRatio('landscape')}>Landscape</button>
      </div>
      <div ref={containerRef} className="mp-grid">
        <div>
          <div className="mp-section-title">Player Performance</div>
          <PlayerPerformance {...player} />
        </div>
        <div>
          <div className="mp-section-title">Man of the Match (Raider style)</div>
          <ManOfMatch {...playerMatchStats} />
        </div>
      </div>
    </div>
  )
}
