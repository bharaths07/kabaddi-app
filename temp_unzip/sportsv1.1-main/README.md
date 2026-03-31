# Play Legends

A professional sports platform dashboard for managing tournaments, matches, teams, and live scoring.

## Features

- **Dashboard**: Read-only overview of live and upcoming matches.
- **Action Hub**: Dedicated sidebar for creating matches, tournaments, and teams.
- **Live Scoring**: Real-time cricket and football scoring engine.
- **Tournament Management**: Brackets, schedules, and leaderboards.
- **Team Management**: Roster management and player profiles.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context (Global State)
- **Backend**: Supabase (Mocked for development)
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/            # App entry and providers
├── components/     # Shared UI components
│   ├── layout/     # Layout components (MainLayout, TopNavbar, RightSidebar)
│   └── ui/         # Atomic UI components (Button, Card, Input)
├── domain/         # TypeScript interfaces and domain models
├── modules/        # Feature-based modules (home, match, tournament, etc.)
├── services/       # API and business logic services
├── styles/         # Global styles and tokens
└── utils/          # Helper functions
docs/               # Project documentation and rules
```

## Setup & Installation

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
    Update the values if you have a real Supabase project.

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Build for Production**:
    ```bash
    npm run build
    ```

## Navigation Philosophy

- **Top Navbar**: Global navigation (Home, Matches, Tournaments). Read-only.
- **Right Sidebar**: Action hub (Create, Settings, Profile). Hidden by default.
- **Main Content**: Route-specific working canvas.
