import { useRef, useState, useEffect } from 'react'
import { exportNodePNG, shareToWhatsApp, captureNodeToCanvas } from '../components/posters'
import ManOfMatch from '../components/posters/templates/ManOfMatch'
import PlayerPerformance from '../components/posters/templates/PlayerPerformance'
import type { PlayerCareerStats, PlayerMatchStats, PosterRatio } from '../components/posters/engine/posterTypes'
import { useAuth } from '../../../shared/context/AuthContext'
import { getPlayer } from '../../../shared/services/tournamentService'
import { uploadBanner, createOrUpdateProfile } from '../../../shared/lib/auth'

export default function MyPostersPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { user, profile, refreshProfile } = useAuth()
  const [ratio, setRatio] = useState<PosterRatio>('square')
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      if (profile?.player_id) {
        const data = await getPlayer(profile.player_id!)
        if (data) setStats(data)
      }
      setLoading(false)
    }
    loadStats()
  }, [profile?.player_id])

  const player: PlayerCareerStats = {
    type: 'player_performance',
    name: profile?.full_name || user?.email?.split('@')[0] || 'Kabaddi Player',
    teamName: stats?.teamName || profile?.team_name || 'Pro Kabaddi',
    teamAbbr: (stats?.teamName || profile?.team_name || 'PK').slice(0, 2).toUpperCase(),
    teamColor: stats?.teamColor || '#0ea5e9',
    photoUrl: profile?.avatar_url || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1080&auto=format&fit=crop',
    seasonRank: stats ? `#${Math.floor(Math.random() * 50) + 1} Raider` : 'Season 2026',
    raidPts: stats?.stats?.attacking?.find((a: any) => a.label === 'Total Raid Points')?.value || 0,
    jersey: parseInt(profile?.jersey_number as string) || 0,
    position: (profile as any)?.role || 'Raider',
    matches: stats?.stats?.overall?.find((o: any) => o.label === 'Matches Played')?.value || 0,
    tacklePts: stats?.stats?.defensive?.find((d: any) => d.label === 'Total Tackle Points')?.value || 0,
    winRate: 0.75,
    superRaids: stats?.stats?.attacking?.find((a: any) => a.label === 'No. Of Super Raids')?.value || 0,
    superTackles: stats?.stats?.defensive?.find((d: any) => d.label === 'No. Of Super Tackles')?.value || 0,
    joinedDate: profile?.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : '2024-01-01',
    awards: stats?.achievements || []
  }

  const bestMatch = stats?.matches?.sort((a: any, b: any) => (b.raidPts + b.tacklePts) - (a.raidPts + a.tacklePts))[0]
  
  const playerMatchStats: PlayerMatchStats = {
    type: 'man_of_match',
    name: player.name,
    jersey: player.jersey,
    teamName: player.teamName,
    teamColor: player.teamColor,
    teamAbbr: player.teamAbbr,
    raidPts: bestMatch?.raidPts || 0,
    tacklePts: bestMatch?.tacklePts || 0,
    totalPts: (bestMatch?.raidPts || 0) + (bestMatch?.tacklePts || 0),
    raids: 15,
    superRaids: bestMatch?.raidPts >= 3 ? 1 : 0,
    tackles: 3,
    bonusPts: 2,
    isManOfMatch: true,
    matchContext: bestMatch ? `vs ${bestMatch.opponent} • Score: ${bestMatch.result}` : 'Season Highlight'
  }

  const doDownload = async () => {
    if (containerRef.current) await exportNodePNG(containerRef.current, `poster-${player.name.replace(/\s+/g, '-')}.png`)
  }

  const doShareWA = async () => {
    if (!containerRef.current) return
    const canvas = await captureNodeToCanvas(containerRef.current)
    const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    if (blob) await shareToWhatsApp(blob, `Check out my Kabaddi pulse card! 🔥`)
  }

  const setAsBanner = async () => {
    if (!containerRef.current || !user) return
    const canvas = await captureNodeToCanvas(containerRef.current, { scale: 2 })
    
    canvas.toBlob(async (blob) => {
      if (!blob) return
      try {
        const file = new File([blob], 'banner.png', { type: 'image/png' })
        const url = await uploadBanner(user.id, file)
        await createOrUpdateProfile(user.id, { banner_url: url })
        await refreshProfile()
        alert('Banner updated successfully on your profile!')
      } catch (err: any) {
        alert('Failed to update banner: ' + err.message)
      }
    }, 'image/png')
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
