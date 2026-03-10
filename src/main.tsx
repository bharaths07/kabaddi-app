import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './styles/tokens.css'
import './styles/global.css'
import './styles/components.css'
import './index.css'
import Layout from './shared/components/Layout'

// ── Pages ──────────────────────────────────────────────────────
import Home              from './pages/Home'
import FeedNews          from './pages/feedandnews/FeedNews'
import ErrorPage         from './pages/ErrorPage'
import Settings          from './pages/Settings'
import PlanUpgrade       from './pages/PlanUpgrade'
import MyStats           from './pages/MyStats'
import MyPostersPage     from './features/kabaddi/pages/MyPostersPage'
import PlayerProfilePage from './features/kabaddi/pages/PlayerProfilePage'
import TeamPage          from './features/kabaddi/pages/TeamPage'
import TeamDetails       from './pages/TeamDetails'
import KeyStats          from './pages/KeyStats'
import AboutProject      from './pages/AboutProject'

// ── Matches ────────────────────────────────────────────────────
import KabaddiMatchesPage from './features/kabaddi/components/matches/KabaddiMatchesPage'
import MatchSummary       from './pages/MatchSummary'

// ── Leaderboards ───────────────────────────────────────────────
import KabaddiLeaderboards from './features/kabaddi/pages/Leaderboards'

// ── Tournaments ────────────────────────────────────────────────
import Tournaments         from './pages/Tournaments'
import CreateTournament    from './pages/tournaments/CreateTournament'
import TournamentDetails   from './pages/tournaments/TournamentDetails'
import TournamentDashboard from './pages/tournaments/TournamentDashboard'
import AddTeams            from './pages/tournaments/AddTeams'
import AddRoundsGroups     from './pages/tournaments/AddRoundsGroups'
import AddSchedule         from './pages/tournaments/AddSchedule'
import Awards              from './pages/awards/Awards'
import Notifications       from './pages/Notifications'
import TeamLeaderboards    from './features/kabaddi/pages/TeamLeaderboards'

// ── Scorer ─────────────────────────────────────────────────────
import AssignedMatches from './pages/scorer/AssignedMatches'

// ── Kabaddi feature routes ─────────────────────────────────────
import kabaddiRoutes from './routes/kabaddiRoutes'

// ── Poster demo / extra pages ──────────────────────────────────
import MatchScoringPage    from './features/kabaddi/pages/MatchScoringPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [

      // ── Home ─────────────────────────────────────────────────
      { index: true, element: <Home /> },
      { path: 'about', element: <AboutProject /> },

      // ── Leaderboards ──────────────────────────────────────────
      { path: 'leaderboards', element: <KabaddiLeaderboards /> },
      { path: 'leaderboards/teams', element: <TeamLeaderboards /> },
      { path: 'key-stats', element: <KeyStats /> },
      { path: 'awards', element: <Awards /> },
      { path: 'notifications', element: <Notifications /> },

      // ── News / Feed (both paths → same page) ──────────────────
      { path: 'news', element: <FeedNews /> },
      { path: 'feed', element: <FeedNews /> },

      // ── User ──────────────────────────────────────────────────
      { path: 'me/stats', element: <MyStats /> },
      { path: 'me/posters', element: <MyPostersPage /> },
      { path: 'players/:id', element: <PlayerProfilePage /> },
      { path: 'teams/:id', element: <TeamPage /> },
      { path: 'settings', element: <Settings /> },
      { path: 'upgrade',  element: <PlanUpgrade /> },

      // ── Scorer ────────────────────────────────────────────────
      { path: 'scorer/assigned', element: <AssignedMatches /> },

      // ── Extra poster-enabled pages ────────────────────────────
      { path: 'kabaddi/match/:id/score', element: <MatchScoringPage /> },

      // ── Tournaments ───────────────────────────────────────────
      { path: 'tournaments',                   element: <Tournaments /> },
      { path: 'tournament/create',             element: <CreateTournament /> },
      { path: 'tournaments/:id',               element: <TournamentDetails /> },
      { path: 'tournaments/:id/teams/:teamId', element: <TeamDetails /> },

      // Tournament wizard (singular /tournament/:id/...)
      { path: 'tournament/:id/add-teams',    element: <AddTeams /> },
      { path: 'tournament/:id/add-rounds',   element: <AddRoundsGroups /> },
      { path: 'tournament/:id/add-schedule', element: <AddSchedule /> },
      { path: 'tournament/:id/dashboard',    element: <TournamentDashboard /> },

      // ── Auth ──────────────────────────────────────────────────
      { path: 'logout', element: <Navigate to="/" replace /> },

      // ── Kabaddi feature routes ────────────────────────────────
      ...kabaddiRoutes,
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
