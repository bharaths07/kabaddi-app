# Screen Flow: Live Scoring Screen (Screen 3)

This document defines the requirements for the Live Scoring Screen, focusing on usability and error prevention.

## 🎯 Goal
- Scorer can update scores **without thinking**.
- Viewers can understand match state **at a glance**.
- **One-handed operation** on mobile.

## Screen Layout (Top → Bottom)

### 1️⃣ Match Header (Always Visible)
- **Content:**
  - Team A vs Team B
  - Sport
  - Status: LIVE
  - Scorer Name
- **Constraint:** No buttons.

### 2️⃣ Score Summary (Big & Clear)
- **Visuals:** Largest element on screen.
- **Content (Cricket MVP):**
  - Runs / Wickets
  - Overs (Simple counter)
  - Batting team highlighted

### 3️⃣ Scoring Actions (Scorer Mode Only)
- **Controls (Cricket MVP):**
  - `+1 Run`
  - `+2 Runs`
  - `+4 Runs`
  - `+6 Runs`
  - `Wicket`
- **Constraints:**
  - No extras.
  - No undo in MVP (reduces bugs/complexity).

### 4️⃣ Live Feed Snippet (Read-Only)
- **Content:** Small vertical list of recent events (e.g., "Over 5.2 – Four by Rahul").
- **Purpose:** Builds confidence that actions are recorded.

### 5️⃣ End Match Button (Protected)
- **Visibility:** Scorer Only.
- **Action:**
  1.  Click "End Match".
  2.  **Require Confirmation**.
  3.  Move match to `Completed`.
  4.  Redirect to Match Summary.

## Modes
- **Viewer:** Sees score updates. Cannot interact.
- **Scorer:** Sees scoring buttons. Can end match.
- **Implementation:** Same screen, different permissions.

## 🚫 MUST NOT Have (MVP)
- ❌ Undo
- ❌ Edit players
- ❌ Change teams
- ❌ Ads
- ❌ Chat
- ❌ Extras (Wide/No-ball) logic

## Success Criteria
- Operable one-handed.
- No instructions needed.
- No accidental clicks.
