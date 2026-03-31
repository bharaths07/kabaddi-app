# State & Data Flow Rules (Step 16)

## 🎯 Goal

- **One source of truth**
- **Predictable updates**
- **Easy backend replacement**
- **Offline capable (MVP)**

## 🧠 Core Principle

**Screens never own data.**
They only request and display data. Data lives "above" screens.

## 1️⃣ Types of State

### A. Global State

_Used across many screens._

- **Data**: Matches, Players, Teams, Feed, Logged-in user
- **Location**: App-level providers (`src/app/AppProviders.tsx`)

### B. Feature State

_Used inside one feature._

- **Data**: Live scoring temporary values, Create match form inputs
- **Location**: Module screen only

### C. UI State

_Pure UI behavior._

- **Data**: Loading, Error, Modal open/close
- **Location**: Component local state

## 2️⃣ Data Source Strategy (MVP)

**Current Flow**: UI → Shared Hook → `data/` (mock)
**Future Flow**: UI → Shared Hook → API / Firebase

_The UI layer remains unchanged when the data source changes._

## 3️⃣ Required Shared Hooks

_Located in `src/shared/hooks/`_

| Hook         | Responsibility                |
| ------------ | ----------------------------- |
| `useAuth`    | Manage logged-in user session |
| `useMatches` | Read/Update match data        |
| `usePlayers` | Read/Update player data       |
| `useTeams`   | Read/Update team data         |
| `useFeed`    | Read/Update feed items        |

**Contract**: Each hook must Read data, Update data, and Notify UI.

## 4️⃣ Live Scoring Data Flow

1. **During Match**: Live score updates → Feature state (local)
2. **On "End Match"**:
   - Persist final result
   - Generate achievements
   - Generate feed items
   - Trigger certificates
     _One action → many controlled side effects._

## ❌ Anti-Patterns (What NOT to Do)

- ❌ Do not pass data through props deeply
- ❌ Do not duplicate match data in screens
- ❌ Do not store logic in UI components
