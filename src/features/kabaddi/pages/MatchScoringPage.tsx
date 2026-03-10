import React, { useMemo } from 'react'
import KabaddiLiveScorer, { MatchTeam } from '../components/scorers/KabaddiLiveScorer'
import { getCurrentMatch } from '../state/matchStore'
import { getDraft } from '../state/createDraft'

export default function MatchScoringPage() {
  const data = useMemo(() => {
    const match = getCurrentMatch()
    const draft = getDraft()

    const home: MatchTeam = {
      name: draft.teamA?.name || 'Team A',
      abbr: (draft.teamA?.name || 'T1').slice(0, 2).toUpperCase(),
      color: '#0ea5e9'
    }
    const guest: MatchTeam = {
      name: draft.teamB?.name || 'Team B',
      abbr: (draft.teamB?.name || 'T2').slice(0, 2).toUpperCase(),
      color: '#ef4444'
    }

    return { home, guest, mins: match?.config.halfDurationMinutes || 20, id: match?.id }
  }, [])

  return (
    <div style={{ padding: 12 }}>
      <KabaddiLiveScorer 
        homeTeam={data.home} 
        guestTeam={data.guest} 
        periodMins={data.mins}
        matchId={data.id}
      />
    </div>
  )
}
