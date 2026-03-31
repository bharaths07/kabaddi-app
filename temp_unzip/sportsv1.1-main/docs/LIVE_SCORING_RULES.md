# Live Scoring Rules (MVP)

This document defines the rules for live scoring in the MVP phase of SportSync.

## 🎯 Purpose
Live scoring records the match as it happens, allows visibility for viewers, and creates a trusted final record. It is not about broadcast-level perfection.

## 1️⃣ Who can do live scoring?
**Rule:** Only ONE person per match (Match creator or designated scorer).
**Why:** Prevents conflicts, simplifies logic, and builds trust.
**Constraint:** No co-scorers in MVP.

## 2️⃣ What does “Live” mean?
**Rule:** "Live" simply means scores are still changing.
- Scores can be updated manually.
- Updates are visible to viewers.
- Feed events are generated automatically.
**Constraint:** No streaming, no sockets, no chat.

## 3️⃣ Internet Connectivity (Offline Support)
**Rule:** Scorer can continue scoring locally if internet is lost. Data syncs when internet returns.
**Why:** Realistic for school grounds and avoids data loss.
**Implication:** Viewers may see delayed updates.

## 4️⃣ Restrictions during Live
Once a match is Live, the following are **NOT allowed**:
- ❌ Changing teams
- ❌ Adding/removing players
- ❌ Changing sport
**Why:** Protects fairness and data integrity.

## 5️⃣ End of Live Scoring
Live scoring ends when the scorer clicks "End Match" and the status moves to `Completed`.
**Aftermath:**
- Scores are frozen.
- Achievements are calculated.
- Certificates are prepared.
