# User Roles & Permissions (MVP)

This document defines the 4 user roles and their permissions in the MVP phase of SportSync.

## 🎯 Goal
Roles exist to prevent disputes, protect match integrity, and keep the system simple.

## 1️⃣ User Roles
### 🟢 1. Guest (Public User)
**Who:** Anyone without login.
- **Can:** View matches, player profiles, feed & news, certificates.
- **Cannot:** Create anything, edit anything, score matches.

### 🟢 2. Player
**Who:** A logged-in student user.
- **Can:** Have a profile, appear in matches, view own history & certificates.
- **Cannot:** Edit match scores, create matches (unless also organizer).

### 🟢 3. Organizer (Match Creator)
**Who:** User who creates a match.
- **Can:** Create match, select teams & players, assign scorer (can be self), end match, lock match.
- **Cannot:** Change match after lock.

### 🟢 4. Scorer
**Who:** User responsible for live scoring.
- **Can:** Update live scores, end live scoring.
- **Cannot:** Change teams, edit after completion.

## 2️⃣ Important MVP Rules
- One match → one organizer.
- One match → one scorer.
- Organizer can be a Player.
- Organizer can be the Scorer.

## 3️⃣ No Admin Role (By Design)
**Decision:** No global admin, no institution admin, no moderator in MVP.
**Why:** Keeps app open, reduces complexity, matches national vision.

## 4️⃣ Permission Summary

| Action | Guest | Player | Organizer | Scorer |
| :--- | :---: | :---: | :---: | :---: |
| View match | ✅ | ✅ | ✅ | ✅ |
| Create match | ❌ | ❌ | ✅ | ❌ |
| Score match | ❌ | ❌ | ❌ | ✅ |
| End match | ❌ | ❌ | ✅ | ✅ |
| Edit after lock | ❌ | ❌ | ❌ | ❌ |
