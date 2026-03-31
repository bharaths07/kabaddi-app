# Feed & News Rules (MVP)

This document defines the rules for the Feed & News system in the MVP phase of SportSync.

## 🎯 Purpose
The Feed displays real-time and recent activity to show what is happening and who achieved what. It is NOT a social network.

## 1️⃣ Content Source
**Rule:** Only **System-Generated Events** appear in the feed.
**Allowed Events:**
- Match Started
- Match Ended
- Result Declared
- Achievement Unlocked
- Certificate Available
**Constraint:** No manual posts by users.

## 2️⃣ Definition of "News"
**Rule:** News is simply a subset of important feed items.
**Examples:**
- "ABC College vs XYZ College completed"
- "Rahul scored 72 runs"
**Constraint:** No separate news creation system.

## 3️⃣ Visibility
**Rule:** Public by default.
- Anyone can view.
- No login required to read.
**Future Scope:** Personal/Institution-specific feeds.

## 4️⃣ Ordering
**Rule:** Strictly **Newest First** (Time-based).
**Constraint:** No trending algorithms or ranking logic.

## 5️⃣ Restrictions (MVP)
To keep the platform clean and safe, the following are **NOT allowed**:
- ❌ Likes
- ❌ Comments
- ❌ Shares (WhatsApp/Instagram integration)
- ❌ User-generated text posts
