import { useEffect, useRef } from 'react'
import { text, roundedRect, drawBackground, drawGridPattern, drawPlayerAvatar, drawWatermark } from './drawHelpers'
import type { PosterRatio, PosterStyle, PosterData, PlayerMatchStats, PlayerCareerStats } from './posterTypes'

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
  // Background and pattern
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
  // Brand icon + name
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
  if (data.type === 'match_victory') {
    const winner = data.winner === 'home' ? data.homeTeam : data.guestTeam
    text(ctx, 'Victory', w / 2, 160, 64, '#111', 'center')
    text(ctx, winner.name, w / 2, 220, 52, bg, 'center')
    text(ctx, `${data.homeScore ?? 0} - ${data.guestScore ?? 0}`, w / 2, 310, 72, '#111', 'center')
  } else if (data.type === 'player_performance' || data.type === 'trading_card') {
    const photoUrl = (data as PlayerCareerStats).photoUrl
    if (photoUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const r = Math.min(w, h) * 0.18
        const cx = w / 2
        const cy = 260
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
        text(ctx, data.name, w / 2, cy + r + 60, 56, '#111', 'center')
        if ((data as PlayerCareerStats).seasonRank) {
          text(ctx, (data as PlayerCareerStats).seasonRank, w / 2, cy + r + 120, 44, bg, 'center')
        }
        drawWatermark(ctx, w, h)
      }
      img.onerror = () => {
        drawPlayerAvatar(ctx, data.name, bg, w / 2, 260, Math.min(w, h) * 0.18)
      }
      img.src = photoUrl
    } else {
      drawPlayerAvatar(ctx, data.name, bg, w / 2, 260, Math.min(w, h) * 0.18)
      text(ctx, data.name, w / 2, 260 + Math.min(w, h) * 0.18 + 60, 56, '#111', 'center')
    }
  }
}
