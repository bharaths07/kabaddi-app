export type KabaddiFormat = 'standard' | 'short' | 'tournament' | 'custom' | 'quick'
export type TieBreakerMode = 'extra_time' | 'golden_raid'

export interface KabaddiMatchConfig {
  title?: string
  format: KabaddiFormat
  halfDurationMinutes: number
  periodMins?: number
  breakDurationMinutes: number
  playersOnCourt: number
  substitutesAllowed: number
  raidTimeSeconds: number
  bonusLineEnabled: boolean
  doOrDieEnabled: boolean
  superTackleEnabled: boolean
  allOutPoints: number
  goldenRaidEnabled: boolean
  tieBreakerMode: TieBreakerMode
  venue: {
    city: string
    stadium: string
    surface: 'mat' | 'mud'
    indoor: boolean
  }
  officials: {
    referee?: string
    umpire?: string
    scorer?: string
    timekeeper?: string
  }
}
