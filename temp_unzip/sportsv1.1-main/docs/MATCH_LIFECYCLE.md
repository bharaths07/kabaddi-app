# Match Lifecycle

This document defines the 4 non-negotiable states of a match in SportSync and their allowed transitions.

## 🟢 1. Draft
**Status:** `draft`
- **Meaning:** Match is created, teams selected, players added. Not visible to public.
- **Allowed:**
  - Edit teams
  - Edit players
  - Delete match
- **Not Allowed:**
  - Scoring
  - Certificates
  - Feed items

## 🟢 2. Live
**Status:** `live`
- **Meaning:** Match has started, scoring is in progress.
- **Allowed:**
  - Update scores
  - View live match
  - Generate live feed events
- **Not Allowed:**
  - Change teams
  - Remove players

## 🟢 3. Completed
**Status:** `completed`
- **Meaning:** Match is finished, result is declared.
- **Allowed:**
  - Auto-generate achievements
  - Auto-generate certificates
  - Public summary view
- **Not Allowed:**
  - Change scores

## 🟢 4. Locked
**Status:** `locked`
- **Meaning:** Match is frozen permanently. Protects trust and history.
- **Allowed:**
  - Read-only access forever
- **Not Allowed:**
  - Any edits by anyone

---

## 🔁 Allowed Transitions
The lifecycle must follow this strict path. No skipping, no backward movement.

`Draft` → `Live` → `Completed` → `Locked`

**Why:**
- Ensures live scoring safety.
- Guarantees trusted certificates.
- Prevents history manipulation.
