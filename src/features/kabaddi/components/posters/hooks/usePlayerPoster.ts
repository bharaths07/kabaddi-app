import { useMemo } from 'react'
import type { PosterData, PlayerCareerStats } from '../engine/posterTypes'

export default function usePlayerPoster(player: PlayerCareerStats) {
  return useMemo<PosterData>(() => ({
    ...player,
    type: 'player_performance',
  }), [player])
}
