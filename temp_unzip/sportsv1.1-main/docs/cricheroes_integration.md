# Cricheroes Integration Documentation

## Overview
This document outlines the integration of "Start Match" and "Start Tournament" functionalities, extracted and adapted from the Cricheroes test environment concepts. The integration ensures compatibility with the existing `scoreheroes-v1` architecture while maintaining the business logic of the original Cricheroes workflows.

## 1. Migration Plan

### Data Structures
The integration maps internal domain models to a standardized "Cricheroes-compatible" schema to ensure data integrity before critical state transitions.

| Internal Model | Cricheroes Concept | Key Mapped Fields |
|---|---|---|
| `Match` | `MatchConfig` | `match_id`, `date`, `venue`, `overs_limit` |
| `Tournament` | `TournamentConfig` | `tournament_id`, `teams_count`, `match_format` |
| `Team` | `Team` | `team_id`, `team_name`, `players` (mapped from members) |

### Authentication & Permissions
- **Start Match**: Requires `SCORER` or `ORGANIZER` role.
- **Start Tournament**: Requires `ORGANIZER` role.
- **Validation**: Performed via `CricheroesAdapter` before any database writes.

## 2. Adapter Modules

### `src/services/adapters/cricheroesAdapter.ts`
This module acts as the bridge between internal domain objects and the validation logic required for the Cricheroes-style workflows.

**Key Methods:**
- `toMatchPayload(match, homeTeam, awayTeam)`: Converts internal match data to validation payload.
- `toTournamentPayload(tournament)`: Converts internal tournament data.
- `validateMatchReady(payload)`: Checks for critical readiness (e.g., player presence).

## 3. Integration Service

### `src/services/cricheroesIntegrationService.ts`
The core service orchestration the "Start" workflows.

**Start Tournament Flow:**
1. **Validation**: Checks if tournament exists and has at least 2 teams.
2. **Scheduling**: If `scheduleMode` is 'AUTO', invokes `generateRoundRobinMatches` to create fixtures.
3. **State Update**: Updates tournament status to `ongoing`.
4. **Notification**: Triggers system notification.

**Start Match Flow:**
1. **Validation**: Ensures squads are populated and required metadata exists.
2. **Toss Integration**: (Handled in `TossScreen`, validated here) Ensures toss winner is set.
3. **Live State**: Initializes `striker`, `nonStriker`, and `bowler` (via `startMatch` in `AppProviders`).

## 4. Error Handling & Logging
- All integration methods return a standardized result object: `{ success: boolean; message: string; }`.
- Errors are logged to the console with the prefix `[CricheroesIntegration]`.
- UI feedback is provided via system notifications (`maybeNotify`).

## 5. Deployment & Configuration

### Environment Variables
No new environment variables are strictly required, but the following are assumed for the `supabase` client:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Configuration Requirements
- **Tournament**: Must have `teams` array populated before starting.
- **Match**: Must be in `draft` status.

### Deployment Procedure
1. **Build**: Run `npm run build`.
2. **Test**: Ensure `src/test/cricheroesIntegration.test.ts` passes.
3. **Deploy**: Push changes to main branch. The new `startTournament` function in `AppProviders` is non-breaking and backward compatible.

## 6. Usage Guide (Developers)

To start a tournament programmatically:
```typescript
import { cricheroesIntegrationService } from '../services/cricheroesIntegrationService';

const result = await cricheroesIntegrationService.startTournament(tournamentId, teamsList);
if (result.success) {
    console.log("Tournament started!");
}
```
