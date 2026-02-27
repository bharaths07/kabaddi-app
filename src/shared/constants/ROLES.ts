export type UserRole = 'organizer' | 'scorer' | 'viewer';

export type Permission =
  | 'tournament:create'
  | 'team:create'
  | 'match:create'
  | 'match:assign_scorer'
  | 'scoring:update'
  | 'raid:record'
  | 'match:end'
  | 'view:live'
  | 'view:leaderboard'
  | 'view:summary';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  organizer: [
    'tournament:create',
    'team:create',
    'match:create',
    'match:assign_scorer',
    'view:live',
    'view:leaderboard',
    'view:summary'
  ],
  scorer: [
    'scoring:update',
    'raid:record',
    'match:end',
    'view:live',
    'view:leaderboard',
    'view:summary'
  ],
  viewer: ['view:live', 'view:leaderboard', 'view:summary']
};

export function can(role: UserRole, permission: Permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
