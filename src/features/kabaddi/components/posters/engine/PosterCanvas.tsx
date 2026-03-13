import { useEffect, useRef } from 'react'
import { text, roundedRect, drawBackground, drawGridPattern, drawPlayerAvatar, drawWatermark, drawStatBox, drawPill, drawTeamBadge } from './drawHelpers'
import type { PosterRatio, PosterStyle, PosterData, PlayerMatchStats, PlayerCareerStats, TeamAnnouncement, SquadRoster, CareerStats, SeasonHighlight } from './posterTypes'

type Props = {
  data: PosterData
  ratio?: PosterRatio
  style?: PosterStyle
  width?: number
}

import './PosterCanvas.css'

export default function PosterCanvas({ data, ratio = 'square', style = 'career', width = 1080 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const height = ratio === 'story' ? Math.round(width * 16 / 9) : ratio === 'landscape' ? Math.round(width * 3 / 4) : width

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    c.width = width
    c.height = height
    const ctx = c.getContext('2d')
    if (!ctx) return
    renderBase(ctx, width, height, data, style)
  }, [data, width, height, style])

  return <canvas ref={canvasRef} className="poster-canvas" />
}

function renderBase(ctx: CanvasRenderingContext2D, w: number, h: number, data: PosterData, style: PosterStyle) {
  const brand = 'Game Legends'
  const bg = style === 'career' ? '#0ea5e9' : style === 'season' ? '#10b981' : '#8b5cf6'

  // 1. BACKGROUND LAYER
  if (data.type === 'man_of_match') {
    const base = (data as PlayerMatchStats).teamColor ?? '#f97316'
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, base)
    grad.addColorStop(0.6, '#ef4444')
    grad.addColorStop(1, '#7c2d12')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  } else {
    drawBackground(ctx, w, h, bg)
    drawGridPattern(ctx, w, h)
    // Card surface
    roundedRect(ctx, 24, 24, w - 48, h - 48, 28, '#0b1225')
    roundedRect(ctx, 30, 30, w - 60, h - 60, 24, '#f8fafc')
  }

  // 2. BRANDING
  ctx.save()
  ctx.beginPath()
  ctx.arc(70, 70, 26, 0, Math.PI * 2)
  ctx.closePath()
  ctx.fillStyle = bg
  ctx.fill()
  ctx.font = '900 20px Rajdhani'
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('GL', 70, 70)
  ctx.restore()
  text(ctx, brand, 120, 70, 28, '#0f172a', 'left')

  // 3. CONTENT RENDERING BY TYPE
  switch (data.type) {
    case 'match_victory': {
      const winner = data.winner === 'home' ? data.homeTeam : data.guestTeam
      text(ctx, 'Victory', w / 2, 160, 64, '#111', 'center')
      text(ctx, winner.name, w / 2, 220, 52, bg, 'center')
      text(ctx, `${data.homeScore ?? 0} - ${data.guestScore ?? 0}`, w / 2, 310, 72, '#111', 'center')
      
      // Stats row
      const sw = (w - 120) / 2
      drawStatBox(ctx, String(data.totalRaids || 0), 'Total Raids', bg, 60, 420, sw, 120)
      drawStatBox(ctx, String(data.allOuts || 0), 'All Outs', bg, 60 + sw + 20, 420, sw, 120)
      
      drawWatermark(ctx, w, h)
      break
    }

    case 'man_of_match': {
      const mom = data as PlayerMatchStats
      text(ctx, 'MAN OF THE MATCH', w / 2, 180, 52, '#fff', 'center')
      drawPlayerAvatar(ctx, mom.name, '#fff', w / 2, 360, 120)
      text(ctx, mom.name, w / 2, 520, 64, '#fff', 'center')
      drawPill(ctx, mom.teamName, '#fff', w / 2, 590)

      // Stats grid
      const stats = [
        { v: mom.raidPts, l: 'Raid Pts' },
        { v: mom.tacklePts, l: 'Tackle Pts' },
        { v: mom.totalPts, l: 'Total' }
      ]
      const gw = (w - 140) / 3
      stats.forEach((s, i) => {
        drawStatBox(ctx, String(s.v), s.l, '#fff', 60 + i * (gw + 10), 680, gw, 110)
      })
      
      text(ctx, mom.matchContext, w / 2, h - 80, 24, 'rgba(255,255,255,0.7)', 'center')
      drawWatermark(ctx, w, h)
      break
    }

    case 'player_performance':
    case 'trading_card': {
      const player = data as PlayerCareerStats
      const r = Math.min(w, h) * 0.18
      const cx = w / 2
      const cy = 260

      const drawContent = () => {
        text(ctx, player.name, w / 2, cy + r + 60, 56, '#111', 'center')
        if (player.seasonRank) {
          text(ctx, player.seasonRank, w / 2, cy + r + 120, 44, bg, 'center')
        }
        
        // Stats grid
        const stats = [
          { v: player.raidPts, l: 'Raid Pts' },
          { v: player.tacklePts, l: 'Tackle Pts' },
          { v: player.winRate ? `${(player.winRate * 100).toFixed(0)}%` : '0%', l: 'Win Rate' }
        ]
        const gw = (w - 140) / 3
        stats.forEach((s, i) => {
          drawStatBox(ctx, String(s.v), s.l, bg, 60 + i * (gw + 10), cy + r + 180, gw, 120)
        })

        drawWatermark(ctx, w, h)
      }

      if (player.photoUrl) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          ctx.save()
          ctx.beginPath()
          ctx.arc(cx, cy, r, 0, Math.PI * 2)
          ctx.closePath()
          ctx.clip()
          ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2)
          ctx.restore()
          ctx.strokeStyle = bg
          ctx.lineWidth = 8
          ctx.beginPath()
          ctx.arc(cx, cy, r + 4, 0, Math.PI * 2)
          ctx.stroke()
          drawContent()
        }
        img.onerror = () => {
          drawPlayerAvatar(ctx, player.name, bg, cx, cy, r)
          drawContent()
        }
        img.src = player.photoUrl
      } else {
        drawPlayerAvatar(ctx, player.name, bg, cx, cy, r)
        drawContent()
      }
      break
    }

    case 'team_announcement': {
      const team = (data as TeamAnnouncement).team
      text(ctx, 'TEAM ANNOUNCEMENT', w / 2, 180, 48, '#111', 'center')
      drawTeamBadge(ctx, team.abbr, team.color, w / 2, 380, 180)
      text(ctx, team.name, w / 2, 520, 64, team.color, 'center')
      text(ctx, `Captain: ${team.captain}`, w / 2, 590, 32, '#64748b', 'center')
      
      drawWatermark(ctx, w, h)
      break
    }

    case 'squad_roster': {
      const squad = data as SquadRoster
      text(ctx, 'SQUAD ROSTER', 60, 160, 48, '#111', 'left')
      drawTeamBadge(ctx, squad.team.abbr, squad.team.color, w - 120, 160, 100)
      
      // List players
      squad.players.slice(0, 12).forEach((p, i) => {
        const py = 260 + i * 45
        text(ctx, `${p.jersey}. ${p.name}`, 60, py, 32, '#111', 'left')
        text(ctx, p.role, w - 60, py, 24, '#64748b', 'right')
      })
      
      drawWatermark(ctx, w, h)
      break
    }
    
    default:
      // Fallback for career_stats, season_highlight or unknown types
      text(ctx, data.type.replace('_', ' ').toUpperCase(), w / 2, h / 2, 48, bg, 'center')
      drawWatermark(ctx, w, h)
  }
}
