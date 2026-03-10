import { useMemo } from 'react'
import type { PosterData, TeamInfo } from '../engine/posterTypes'

export default function useTeamPoster(team: TeamInfo) {
  return useMemo<PosterData>(() => ({
    type: 'team_announcement',
    team
  }), [team])
}
