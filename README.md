# Play Legends (Game Legends) 🏆

### _The Ultimate Kabaddi Tournament Management & Scoring Ecosystem_

Play Legends is a professional-grade platform designed to digitize and revolutionize the Kabaddi tournament experience. It bridges the gap between local grassroots tournaments and the professional league standards seen in the Pro Kabaddi League (PKL).

---

## 🚀 The Vision

To empower every Kabaddi player, organizer, and fan with professional-level tools, real-time analytics, and high-quality social engagement.

## 🔑 Key Roles & Flow

- **Organizers**: Effortlessly manage tournament structures, team onboarding, schedules, and prize pools.
- **Scorers**: Professional live-scoring interface to track raids, tackles, super-tackles, and all-outs in real-time.
- **Viewers/Players**: Access live match updates, detailed player stats, leaderboards, and exclusive seasonal awards.

## 🌟 Standout Features

### 1. **Live Scoring Engine**

A real-time scoring system specifically built for Kabaddi's unique rules (Standard and Short formats). Tracks detailed metrics like raid points, tackle points, super raids, and bonus points.

### 2. **Automated Leaderboards & Stats**

Performance-based rankings that update in real-time. Includes specialized leaderboards for "Top Raiders", "Top Defenders", and "Man of the Match" accolades.

### 3. **The "Poster Engine" (Social Branding)**

A unique feature that generates professional-grade social media posters, trading cards, and match victory announcements for players. This allows players to build their digital identity and brand.

### 4. **Tournament Management Suite**

End-to-end management from creating groups/rounds to automating the schedule and team registration.

---

## 🛠 Tech Stack

- **Frontend**: React (Vite) + TypeScript
- **State Management**: Custom LocalStorage & SessionStorage stores for high-performance offline-first scoring.
- **Styling**: Modern CSS with custom properties for a professional "Dark/Light" theme.
- **Routing**: `react-router-dom` for seamless page transitions.

### Environment Variables

- `VITE_SUPABASE_URL` – Supabase project URL
- `VITE_SUPABASE_ANON_KEY` – Supabase anon key

Copy `.env.example` to `.env.local` (or `.env`) and fill these values before running the app.

## 📂 Project Structure

- `/src/features/kabaddi`: The core Kabaddi domain logic, scoring, and poster engine.
- `/src/shared`: Global components (Layout, TopNav, Sidebar) and shared constants (Roles, Core Flow).
- `/src/pages`: Individual feature pages like Leaderboards, Matches, and Tournaments.

---

_Built for the legends of Kabaddi._
