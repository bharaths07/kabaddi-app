import React from 'react'
import PosterCanvas from '../engine/PosterCanvas'
import type { TeamInfo } from '../engine/posterTypes'

export default function SeasonHighlight({ team, highlights }: { team: TeamInfo; highlights: string[] }) {
  return <PosterCanvas data={{ type: 'season_highlight', team, highlights }} />
}
