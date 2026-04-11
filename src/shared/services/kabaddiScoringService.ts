import { supabase } from '@shared/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { RaidEvent, ScoringUpdate } from '../../features/kabaddi/types/kabaddi.types'

type DBMatchRow = {
  id: string
  home_score: number | null
  guest_score: number | null
  raid_number: number | null
  current_time: number | null
  is_timer_running: boolean | null
}


type DBRaidEventRow = {
  id: string
  match_id: string
  raid_number: number
  raider_id: string
  defending_team: 'home' | 'guest'
  points_scored: number
  touch_points: number
  success: boolean
  created_at: string
}

/**
 * Kabaddi Live Scoring Service
 * Handles real-time score updates using Supabase Realtime
 */
class KabaddiScoringService {
  private channel: RealtimeChannel | null = null
  private matchId: string | null = null
  private listeners: Set<(update: ScoringUpdate) => void> = new Set()
  private currentState: ScoringUpdate['currentState'] | null = null

  /**
   * Subscribe to live match updates
   */
  subscribeToMatch(matchId: string, onUpdate: (update: ScoringUpdate) => void): () => void {
    this.matchId = matchId
    this.listeners.add(onUpdate)

    // Supabase Realtime subscription
    this.channel = supabase
      .channel(`kabaddi-match-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'kabaddi_matches',
          filter: `id=eq.${matchId}`,
        },
        (payload: { new: DBMatchRow }) => {
          this.handleMatchUpdate(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'raid_events',
          filter: `match_id=eq.${matchId}`,
        },
        (payload: { new: DBRaidEventRow }) => {
          this.handleRaidEvent(payload.new)
        }
      )
      .subscribe()

    // Return unsubscribe function
    return () => this.unsubscribe(onUpdate)
  }

  /**
   * Unsubscribe from updates
   */
  private unsubscribe(onUpdate: (update: ScoringUpdate) => void) {
    this.listeners.delete(onUpdate)
    if (this.listeners.size === 0 && this.channel) {
      supabase.removeChannel(this.channel)
      this.channel = null
    }
  }

  /**
   * Handle match update from DB row
   */
  private handleMatchUpdate(match: DBMatchRow) {
    const update: ScoringUpdate = {
      matchId: match.id,
      timestamp: new Date(),
      event: {} as any,
      currentState: {
        homeScore: match.home_score ?? 0,
        guestScore: match.guest_score ?? 0,
        currentRaid: match.raid_number ?? 0,
        currentTime: match.current_time ?? 1200,
        isTimerRunning: match.is_timer_running ?? false,
      },

    }

    this.currentState = update.currentState
    this.notifyListeners(update)
  }

  /**
   * Handle raid event from DB row
   */
  private handleRaidEvent(event: DBRaidEventRow) {
    const base = this.currentState || { homeScore: 0, guestScore: 0, currentRaid: 0 }

    const update: ScoringUpdate = {
      matchId: this.matchId || '',
      timestamp: new Date(),
      event: {
        id: event.id,
        raidNumber: event.raid_number,
        raider: {} as any,
        defendingTeam: {} as any,
        pointsScored: event.points_scored,
        touchPoints: event.touch_points,
        allOut: false,
        success: event.success,
        timestamp: new Date(event.created_at),
      },
      currentState: {
        homeScore: base.homeScore,
        guestScore: base.guestScore,
        currentRaid: event.raid_number,
      },
    }

    this.notifyListeners(update)
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(update: ScoringUpdate) {
    this.listeners.forEach(listener => {
      try {
        listener(update)
      } catch (error) {
        console.error('Error in scoring update listener:', error)
      }
    })
  }

  /**
   * Record a raid
   */
  async recordRaid(matchId: string, data: {
    raidNumber: number
    raiderId: string
    team: 'home' | 'guest'
    pointsScored: number
    touchPoints: number
    success: boolean
    type?: 'raid' | 'tackle' | 'empty' | 'technical'
    isBonus?: boolean
    isSuperRaid?: boolean
    isSuperTackle?: boolean
    isDoOrDie?: boolean
    defenderIds?: string[]
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('raid_events')
        .insert({
          match_id: matchId,
          raid_number: data.raidNumber,
          raider_id: data.raiderId,
          defending_team: data.team === 'home' ? 'guest' : 'home',
          points_scored: data.pointsScored,
          touch_points: data.touchPoints,
          success: data.success,
          type: data.type || 'raid',
          is_bonus: data.isBonus || false,
          is_super_raid: data.isSuperRaid || false,
          is_super_tackle: data.isSuperTackle || false,
          is_do_or_die: data.isDoOrDie || false,
          defender_ids: data.defenderIds || [],
          created_at: new Date().toISOString(),
        })

      if (error) throw error
    } catch (error) {
      console.error('Error recording raid:', error)
      throw error
    }
  }

  /**
   * Update match score
   */
  async updateMatchScore(matchId: string, homeScore: number, guestScore: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('kabaddi_matches')
        .update({
          home_score: homeScore,
          guest_score: guestScore,
          updated_at: new Date().toISOString(),
        })
        .eq('id', matchId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating match score:', error)
      throw error
    }
  }

  /**
   * End match
   */
  async endMatch(matchId: string, homeScore: number, guestScore: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('kabaddi_matches')
        .update({
          home_score: homeScore,
          guest_score: guestScore,
          status: 'completed',
          end_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', matchId)

      if (error) throw error

      await supabase.functions.invoke('end-match', {
        body: { matchId },
      })
    } catch (error) {
      console.error('Error ending match:', error)
      throw error
    }
  }

  /**
   * Get live match data (raw DB row)
   */
  async getLiveMatch(matchId: string): Promise<DBMatchRow | null> {
    try {
      const { data, error } = await supabase
        .from('kabaddi_matches')
        .select('id, home_score, guest_score, raid_number, current_time, is_timer_running')
        .eq('id', matchId)

        .single()

      if (error) throw error
      return data as DBMatchRow
    } catch (error) {
      console.error('Error fetching live match:', error)
      return null
    }
  }

  /**
   * Get match history
   */
  async getMatchRaidHistory(matchId: string): Promise<RaidEvent[]> {
    try {
      const { data, error } = await supabase
        .from('raid_events')
        .select('id, match_id, raid_number, raider_id, defending_team, points_scored, touch_points, success, created_at')
        .eq('match_id', matchId)
        .order('raid_number', { ascending: true })

      if (error) throw error
      const rows = (data || []) as DBRaidEventRow[]
      return rows.map(row => ({
        id: row.id,
        raidNumber: row.raid_number,
        raider: {} as any,
        defendingTeam: {} as any,
        pointsScored: row.points_scored,
        touchPoints: row.touch_points,
        allOut: false,
        success: row.success,
        timestamp: new Date(row.created_at),
      }))
    } catch (error) {
      console.error('Error fetching raid history:', error)
      return []
    }
  }

  /**
   * Get player stats for a match
   */
  async getPlayerStatsForMatch(matchId: string, playerId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('raid_events')
        .select('*')
        .eq('match_id', matchId)
        .eq('raider_id', playerId)

      if (error) throw error

      const raids = (data || []) as DBRaidEventRow[]
      const raidPoints = raids.reduce((sum: number, r: DBRaidEventRow) => sum + r.points_scored, 0)
      const raidCount = raids.length
      const successfulRaids = raids.filter((r: DBRaidEventRow) => r.success).length

      return {
        playerId,
        raids: raidCount,
        raidPoints,
        successRate: raidCount > 0 ? (successfulRaids / raidCount) * 100 : 0,
      }
    } catch (error) {
      console.error('Error fetching player stats:', error)
      return null
    }
  }

  /**
   * Update match clock
   */
  async updateMatchClock(matchId: string, currentTime: number, isRunning: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('kabaddi_matches')
        .update({
          current_time: currentTime,
          is_timer_running: isRunning,
          updated_at: new Date().toISOString(),
        })
        .eq('id', matchId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating match clock:', error)
      throw error
    }
  }

  /**
   * Disconnect from realtime

   */
  disconnect(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel)
      this.channel = null
    }
    this.listeners.clear()
    this.matchId = null
  }
}

// Export singleton instance
export const kabaddiScoringService = new KabaddiScoringService()
