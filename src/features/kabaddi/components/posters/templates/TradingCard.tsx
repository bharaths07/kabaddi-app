import React from 'react'
import PosterCanvas from '../engine/PosterCanvas'
import type { PlayerCareerStats } from '../engine/posterTypes'

export default function TradingCard({ ...player }: PlayerCareerStats) {
  const { type, ...rest } = player
  return <PosterCanvas data={{ type: 'trading_card', ...rest }} />
}
