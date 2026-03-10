import React from 'react'
import PosterCanvas from '../engine/PosterCanvas'
import type { PlayerCareerStats, PosterRatio } from '../engine/posterTypes'

export default function PlayerPerformance({ ...player }: PlayerCareerStats, ratio: PosterRatio = 'square') {
  const { type, ...rest } = player
  return <PosterCanvas data={{ type: 'player_performance', ...rest }} ratio={ratio} />
}
