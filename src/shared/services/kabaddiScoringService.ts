import React from 'react'
import { supabase } from '@shared/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { KabaddiMatch, RaidEvent, ScoringUpdate } from '../../features/kabaddi/types/kabaddi.types'

/**
 * Kabaddi Live Scoring Service
 * Handles real-time score updates using Supabase Realtime
 */
class KabaddiScoringService {
  private channel: RealtimeChannel | null = null
  private matchId: string | null = null
  private listeners: Set<(update: ScoringUpdate) => void> = new Set()

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
        (payload) => {
          this.handleMatchUpdate(payload.new as KabaddiMatch)
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
        (payload) => {
          this.handleRaidEvent(payload.new as RaidEvent)
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
   * Handle match update
   */
  private handleMatchUpdate(match: KabaddiMatch) {
    const update: ScoringUpdate = {
      matchId: match.id,
      timestamp: new Date(),
      event: {} as any,
      currentState: {
        homeScore: match.homeScore,
        guestScore: match.guestScore,
        currentRaid: match.raidNumber,
      },
    }

    this.notifyListeners(update)
  }

  /**
   * Handle raid event
   */
  private handleRaidEvent(event: RaidEvent) {
    const update: ScoringUpdate = {
      matchId: this.matchId || '',
      timestamp: new Date(),
      event,
      currentState: {
        homeScore: 0, // Will be updated by component
        guestScore: 0,
        currentRaid: event.raidNumber,
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
    } catch (error) {
      console.error('Error ending match:', error)
      throw error
    }
  }

  /**
   * Get live match data
   */
  async getLiveMatch(matchId: string): Promise<KabaddiMatch | null> {
    try {
      const { data, error } = await supabase
        .from('kabaddi_matches')
        .select('*')
        .eq('id', matchId)
        .single()

      if (error) throw error
      return data as KabaddiMatch
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
        .select('*')
        .eq('match_id', matchId)
        .order('raid_number', { ascending: true })

      if (error) throw error
      return (data || []) as RaidEvent[]
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

      const raids = data || []
      const raidPoints = raids.reduce((sum, r) => sum + r.points_scored, 0)
      const raidCount = raids.length
      const successfulRaids = raids.filter(r => r.success).length

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

/**
 * Hook for using Kabaddi scoring in React components
 */
export function useKabaddiLiveScoring(matchId: string) {
  const [score, setScore] = React.useState({
    homeScore: 0,
    guestScore: 0,
    currentRaid: 0,
  })

  React.useEffect(() => {
    const unsubscribe = kabaddiScoringService.subscribeToMatch(matchId, (update) => {
      setScore(update.currentState)
    })

    return () => {
      unsubscribe()
    }
  }, [matchId])

  return {
    ...score,
    recordRaid: (data: any) => kabaddiScoringService.recordRaid(matchId, data),
    updateScore: (home: number, guest: number) =>
      kabaddiScoringService.updateMatchScore(matchId, home, guest),
    endMatch: (home: number, guest: number) =>
      kabaddiScoringService.endMatch(matchId, home, guest),
  }
}
