import { useAuth } from '../context/AuthContext'

export type AppRole = 'organizer' | 'league_admin' | 'owner' | 'scorer' | 'viewer'

export interface MatchRoleContext {
  owner_id?: string
  scorer_id?: string
  tournament_organizer_id?: string
}

export function useRole(match?: MatchRoleContext | null) {
  const { user } = useAuth()

  if (!user || !match) return { role: 'viewer' as AppRole, canScore: false, canEdit: false }

  const uid = user.id

  if (match.tournament_organizer_id && match.tournament_organizer_id === uid) {
    return { role: 'organizer' as AppRole, canScore: true, canEdit: true }
  }

  if (match.owner_id && match.owner_id === uid) {
    return { role: 'owner' as AppRole, canScore: true, canEdit: true }
  }

  if (match.scorer_id && match.scorer_id === uid) {
    return { role: 'scorer' as AppRole, canScore: true, canEdit: false }
  }

  return { role: 'viewer' as AppRole, canScore: false, canEdit: false }
}
