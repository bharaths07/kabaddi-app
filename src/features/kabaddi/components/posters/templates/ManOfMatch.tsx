import React from 'react'
import PosterCanvas from '../engine/PosterCanvas'
import type { PlayerMatchStats, PosterRatio } from '../engine/posterTypes'

export default function ManOfMatch({ ...player }: PlayerMatchStats, ratio: PosterRatio = 'square') {
  const { type, ...rest } = player
  return <PosterCanvas data={{ type: 'man_of_match', ...rest }} ratio={ratio} />
}
