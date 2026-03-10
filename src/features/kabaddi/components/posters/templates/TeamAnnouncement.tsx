import React from 'react'
import PosterCanvas from '../engine/PosterCanvas'
import type { TeamInfo } from '../engine/posterTypes'

export default function TeamAnnouncement({ team }: { team: TeamInfo }) {
  return <PosterCanvas data={{ type: 'team_announcement', team }} />
}
