# Screen Flow: Home / Public Feed (Screen 1)

This document defines the requirements for the Home Screen, which is the most critical screen for user retention.

## 🎯 Purpose
In 10–30 seconds, a user must understand:
1.  **What SportSync is** (Headline).
2.  **What’s happening right now** (Live Matches).
3.  **What they can do next** (Primary Actions).

## 1️⃣ Header (Simple)
- **App Name:** SportSync
- **Tagline:** "Live & record student sports matches nationwide"
- **Constraint:** No clutter, no complex menus yet.

## 2️⃣ Live Matches Section (Top Priority)
- **Condition:** Show ONLY if a match is currently `Live`.
- **Content:** Match Card with "LIVE" label, teams, and current score.
- **Empty State:** If no live match, **skip this section entirely** (don't show empty box).
- **Why:** Live content creates urgency.

## 3️⃣ Recent Activity Feed
- **Content:** Vertical list of system events (Match completed, Achievement unlocked, Certificate available).
- **Details per item:** Who? What happened? When?
- **Constraint:** No interactions (likes/comments).

## 4️⃣ Primary Action Buttons
Visible without scrolling:
- Create a Match
- View Matches
- Search Players
**Goal:** Answer "What can I do here?" immediately.

## 🚫 MUST NOT Have (MVP)
- ❌ Login popup
- ❌ Ads
- ❌ Filters
- ❌ Notifications
- ❌ Settings
**Goal:** Keep it clean.
