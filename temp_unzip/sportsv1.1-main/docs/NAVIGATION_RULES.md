# Navigation & Routing Rules (MVP)

This document defines the routing strategy, access control, URL structure, and navigation style for SportSync.

## 🎯 Core Philosophy

- **Viewing sports data should never require login.**
- **Login is a gate for responsibility, not curiosity.**

## 1️⃣ Default Entry Route

- **URL:** `/`
- **Destination:** Home / Public Feed
- **Constraint:** This never changes.

## 2️⃣ Public Routes (Final URLs)

Must work without login. Short, shareable, easy to remember.

- **Home / Feed:** `/`
- **Live / Completed Match:** `/match/:matchId`
- **Player Profile:** `/player/:playerId`
- **Team Page:** `/team/:teamId`

## 3️⃣ Action Routes (Login Required)

Require login only to perform actions.

- **Create Match:** `/create-match`
- **Live Scoring:** `/match/:matchId/live`
- **Certificates (My Certificates):** `/my-certificates`

## 4️⃣ Role Enforcement Rule

- **Routes are NOT hidden.**
- **Behavior:**
  - User can open route.
  - If not allowed -> Show "You don’t have permission to do this action."
- **Why:** Avoids broken links and blind redirects.

## 5️⃣ Share Link Behavior

Shared links **always open in public view** and **never require login**.

- **Match:** `/match/:matchId`
- **Player:** `/player/:playerId`
  **Goal:** Drives organic growth.

## 6️⃣ Navigation Style (Mobile-First)

- **Top Navigation:**
  - App Name (Home)
  - Create Match (Primary Action)
- **Constraint:** No hamburger menu yet.

## 7️⃣ Back Navigation

Every screen must have clear back behavior. No dead ends.

- **Match Summary** → Home
- **Player Profile** → Previous Screen

## 🚫 MUST NOT Add Yet

- ❌ `/login` page first
- ❌ `/admin`
- ❌ Deep nested URLs
- ❌ Query-heavy routes
