import React from 'react'
import PosterCanvas from '../engine/PosterCanvas'
import type { TeamInfo, PlayerSlot } from '../engine/posterTypes'

export default function SquadRoster({ team, players }: { team: TeamInfo; players: PlayerSlot[] }) {
  return <PosterCanvas data={{ type: 'squad_roster', team, players }} />
}
