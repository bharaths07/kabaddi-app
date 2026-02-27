export type TournamentStatus = 'draft' | 'ready' | 'live' | 'completed' | 'published';
export type MatchStatus = 'scheduled' | 'live' | 'completed';

export type FlowEvent =
  | 'create_tournament'
  | 'add_teams'
  | 'create_match'
  | 'assign_scorer'
  | 'start_match'
  | 'record_raid'
  | 'end_match'
  | 'generate_summary'
  | 'publish_leaderboard';

export const TOURNAMENT_TRANSITIONS: Record<TournamentStatus, TournamentStatus[]> = {
  draft: ['ready'],
  ready: ['live'],
  live: ['completed'],
  completed: ['published'],
  published: []
};

export const MATCH_TRANSITIONS: Record<MatchStatus, MatchStatus[]> = {
  scheduled: ['live'],
  live: ['completed'],
  completed: []
};

export function canTournamentTransition(from: TournamentStatus, to: TournamentStatus) {
  return TOURNAMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canMatchTransition(from: MatchStatus, to: MatchStatus) {
  return MATCH_TRANSITIONS[from]?.includes(to) ?? false;
}

export const CORE_FLOW = {
  steps: [
    'create_tournament',
    'add_teams',
    'create_match',
    'assign_scorer',
    'start_match',
    'record_raid',
    'end_match',
    'generate_summary',
    'publish_leaderboard'
  ] as FlowEvent[]
};
