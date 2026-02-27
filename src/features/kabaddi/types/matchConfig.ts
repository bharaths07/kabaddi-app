export type KabaddiFormat = 'standard' | 'short' | 'tournament' | 'custom'
export type TieBreakerMode = 'extra_time' | 'golden_raid'

export interface KabaddiMatchConfig {
  format: KabaddiFormat
  halfDurationMinutes: number
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
    technicalOfficial?: string
  }
}
