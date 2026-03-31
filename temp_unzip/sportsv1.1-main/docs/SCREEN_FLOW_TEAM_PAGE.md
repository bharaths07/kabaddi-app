# Screen Flow: Team Page (Screen 6)

This document defines the requirements for the Team Page, focusing on collective identity and history.

## 🎯 Goal
A team page should answer:
- Who are we?
- Who has played for us?
- What have we achieved together?
**Tone:** Simple, proud, factual.

## Screen Structure (Top → Bottom)

### 1️⃣ Team Header
- **Content:**
  - Team Name
  - Institution (if any)
  - City / State
- **Future:** Team Logo.

### 2️⃣ Team Snapshot
- **Quick Stats:**
  - Matches Played
  - Matches Won
  - Sports Played
- **Constraint:** No charts, no trends.

### 3️⃣ Current & Past Players
- **Content:** List of players (Name, Role).
- **Interaction:** Clickable -> Links to Player Profile.
- **Rule:** Players remain visible even if they leave. History is preserved.

### 4️⃣ Match History
- **Content:** List of matches.
  - Opponent
  - Date
  - Result
- **Interaction:** Links to Match Summary.

### 5️⃣ Achievements (Optional in MVP)
- **Content:** Tournament wins, Notable matches.
- **Empty State:** Clean message if no achievements yet.

## 🚫 MUST NOT Have (MVP)
- ❌ Team chat
- ❌ Invitations
- ❌ Editing roster
- ❌ Admin controls
**Constraint:** Roster is inferred from matches only.

## Success Criteria
- Team feels real and credible.
- Alumni players are visible.
- History feels permanent.
