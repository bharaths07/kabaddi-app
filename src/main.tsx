import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './styles/tokens.css'
import './styles/global.css'
import './styles/components.css'
import './index.css'
import Layout from './shared/components/Layout'
import { PublicOnlyRoute, ProtectedRoute } from './shared/components/RouteGuards'

// ── Pages ──────────────────────────────────────────────────────
import Home              from './pages/Home'
import FeedPage          from './pages/feedandnews/FeedPage'
import ErrorPage         from './pages/ErrorPage'
import Settings          from './pages/Settings'
import PlanUpgrade       from './pages/PlanUpgrade'
import MyPostersPage     from './features/kabaddi/pages/MyPostersPage'
import PlayerProfilePage from './features/kabaddi/pages/PlayerProfilePage'
import TeamDetails       from './pages/TeamDetails'
import KeyStats          from './pages/KeyStats'
import AboutProject      from './pages/AboutProject'
import IntroPage         from './pages/IntroPage'
import LoginPage         from './pages/auth/LoginPage'
import SignupPage        from './pages/auth/SignupPage'
import VerifyOTP         from './pages/auth/VerifyOTP'
import OnboardingPage    from './pages/auth/OnboardingPage'
import AuthCallback      from './pages/auth/AuthCallback'
import { AuthProvider }  from './shared/context/AuthContext'
import ProfilePage       from './pages/PlayerProfilePage'
import LogoutPage        from './pages/Logout'
import EditProfilePage   from './pages/EditProfilePage'

// ── Matches ────────────────────────────────────────────────────
import KabaddiMatchesPage from './features/kabaddi/components/matches/KabaddiMatchesPage'
import MatchSummary       from './pages/MatchSummary'

// ── Leaderboards ───────────────────────────────────────────────
import LeaderboardsLayout from './pages/leaderboards/LeaderboardsLayout'
import PlayerLeaderboardsPage from './pages/leaderboards/PlayerLeaderboardsPage'
import TeamLeaderboardsPage from './pages/leaderboards/TeamLeaderboardsPage'
import TeamDetailLeaderboardPage from './pages/leaderboards/TeamDetailLeaderboardPage'

// ── Tournaments ────────────────────────────────────────────────
import Tournaments         from './pages/Tournaments'
import CreateTournament    from './pages/tournaments/CreateTournament'
import TournamentDashboard from './pages/tournaments/TournamentDashboard'
import AddTeams            from './pages/tournaments/AddTeams'
import AddRoundsGroups     from './pages/tournaments/AddRoundsGroups'
import AddSchedule         from './pages/tournaments/AddSchedule'
import Awards              from './pages/awards/Awards'
import Notifications       from './pages/Notifications'

// ── Scorer ─────────────────────────────────────────────────────
import AssignedMatches from './pages/scorer/AssignedMatches'

// ── Kabaddi feature routes ─────────────────────────────────────
import kabaddiRoutes from './routes/kabaddiRoutes'

// ── Poster demo / extra pages ──────────────────────────────────
import MatchScoringPage    from './features/kabaddi/pages/MatchScoringPage'

const router = createBrowserRouter([
  // ── Public intro routes ─────────────────────────────────────────
  { path: '/intro', element: <PublicOnlyRoute><IntroPage /></PublicOnlyRoute> },
  { path: '/', element: <PublicOnlyRoute><IntroPage /></PublicOnlyRoute> },
  // ── Public auth routes (short paths) ────────────────────────────
  { path: '/login', element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute> },
  { path: '/signup', element: <PublicOnlyRoute><SignupPage /></PublicOnlyRoute> },
  { path: '/verify-otp', element: <PublicOnlyRoute><VerifyOTP /></PublicOnlyRoute> },
  { path: '/onboarding', element: <ProtectedRoute><OnboardingPage /></ProtectedRoute> },
  { path: '/auth/callback', element: <AuthCallback /> },
  // ── Standalone / Full-Screen Routes (No Layout) ─────────────────
  { path: '/matches/:id/live', element: <ProtectedRoute><MatchScoringPage /></ProtectedRoute> },
  { path: '/kabaddi/match/:id/score', element: <ProtectedRoute><MatchScoringPage /></ProtectedRoute> },
  { path: '/kabaddi/matches/:id/live', element: <Navigate to="/matches/:id/live" replace /> },
  { path: '/kabaddi/match/:id/live', element: <Navigate to="/matches/:id/live" replace /> },

  {
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    errorElement: <ErrorPage />,
    children: [

      // ── Home ─────────────────────────────────────────────────
      { path: 'home', element: <Home /> },
      { path: 'about', element: <AboutProject /> },

      // ── Leaderboards ──────────────────────────────────────────
      { 
        path: 'leaderboards', 
        element: <LeaderboardsLayout />,
        children: [
          { index: true, element: <PlayerLeaderboardsPage /> },
          { path: 'teams', element: <TeamLeaderboardsPage /> },
        ]
      },
      { path: 'key-stats', element: <KeyStats /> },
      { path: 'awards', element: <Awards /> },
      { path: 'notifications', element: <Notifications /> },

      // ── News / Feed ──────────────────────────────────────────
      { path: 'news', element: <FeedPage /> },
      { path: 'feed', element: <FeedPage /> },
      { path: 'feed/create', element: <FeedPage /> },

      // ── User ──────────────────────────────────────────────────
      { path: 'profile', element: <ProfilePage /> },
      { path: 'me/stats', element: <Navigate to="/profile" replace /> },
      { path: 'me/posters', element: <MyPostersPage /> },
      { path: 'players/:id', element: <PlayerProfilePage /> },
      { path: 'profile/edit', element: <EditProfilePage /> },
      { path: 'teams/:id', element: <TeamDetailLeaderboardPage /> },
      { path: 'settings', element: <Settings /> },
      { path: 'upgrade',  element: <PlanUpgrade /> },

      // ── Scorer ────────────────────────────────────────────────
      { path: 'scorer/assigned', element: <AssignedMatches /> },

      // ── Tournaments ───────────────────────────────────────────
      { path: 'tournaments',                   element: <Tournaments /> },
      { path: 'tournament/create',             element: <CreateTournament /> },
      { path: 'tournaments/:id',               element: <TournamentDashboard /> },
      { path: 'tournaments/:id/teams/:teamId', element: <TeamDetailLeaderboardPage /> },

      // Tournament wizard (singular /tournament/:id/...)
      { path: 'tournament/:id/add-teams',    element: <AddTeams /> },
      { path: 'tournament/:id/add-rounds',   element: <AddRoundsGroups /> },
      { path: 'tournament/:id/add-schedule', element: <AddSchedule /> },
      { path: 'tournament/:id/dashboard',    element: <TournamentDashboard /> },

      // ── Auth ──────────────────────────────────────────────────
      { path: 'logout', element: <LogoutPage /> },
      // Back-compat auth paths
      { path: 'auth/login', element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute> },
      { path: 'auth/signup', element: <PublicOnlyRoute><SignupPage /></PublicOnlyRoute> },
      { path: 'auth/verify-otp', element: <PublicOnlyRoute><VerifyOTP /></PublicOnlyRoute> },
      { path: 'auth/onboarding', element: <ProtectedRoute><OnboardingPage /></ProtectedRoute> },
      { path: 'auth/callback', element: <AuthCallback /> },

      // ── Kabaddi feature routes ────────────────────────────────
      ...kabaddiRoutes,
    ]
  },
  // Fallback
  { path: '*', element: <Navigate to="/intro" replace /> }
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
)
