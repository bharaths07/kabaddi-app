import React from 'react'
import PosterCanvas from '../engine/PosterCanvas'
import type { PlayerCareerStats } from '../engine/posterTypes'

export default function CareerStats({ player, stats }: { player: PlayerCareerStats; stats: Array<{ label: string; value: string | number }> }) {
  return <PosterCanvas data={{ type: 'career_stats', player, stats }} />
}
