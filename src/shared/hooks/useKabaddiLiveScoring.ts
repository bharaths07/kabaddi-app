import { useState, useEffect } from 'react'
import { kabaddiScoringService } from '../services/kabaddiScoringService'

/**
 * Hook for using Kabaddi scoring in React components
 */
export function useKabaddiLiveScoring(matchId: string) {
  const [score, setScore] = useState({
    homeScore: 0,
    guestScore: 0,
    currentRaid: 0,
  })

  useEffect(() => {
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
