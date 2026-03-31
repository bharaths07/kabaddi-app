import { createBrowserRouter, Navigate, useParams, useLocation } from 'react-router-dom'

// ── Components ──────────────────────────────────────────────────
import Layout from '../shared/components/Layout'
import { PublicOnlyRoute, ProtectedRoute } from '../shared/components/RouteGuards'

// ── Pages ──────────────────────────────────────────────────────
import Home from '../pages/Home'
import FeedPage from '../pages/feedandnews/FeedPage'
import NewsPage from '../pages/feedandnews/NewsPage'
import ErrorPage from '../pages/ErrorPage'
import Settings from '../pages/Settings'
import PlanUpgrade from '../pages/PlanUpgrade'
import MyPostersPage from '../features/kabaddi/pages/MyPostersPage'
import PlayerProfilePage from '../features/kabaddi/pages/PlayerProfilePage'
import KeyStats from '../pages/KeyStats'
import AboutProject from '../pages/AboutProject'
import IntroPage from '../pages/IntroPage'
import LoginPage from '../pages/auth/LoginPage'
import SignupPage from '../pages/auth/SignupPage'
import VerifyOTP from '../pages/auth/VerifyOTP'
import OnboardingPage from '../pages/auth/OnboardingPage'
import AuthCallback from '../pages/auth/AuthCallback'
import LogoutPage from '../pages/Logout'
import EditProfilePage from '../pages/EditProfilePage'

// ── Matches ────────────────────────────────────────────────────
import KabaddiMatchesPage from '../features/kabaddi/components/matches/KabaddiMatchesPage'
import MatchSummary from '../pages/MatchSummary'
import MatchDetailsPage from '../features/kabaddi/components/matches/MatchDetailsPage'
import MatchScoringPage from '../features/kabaddi/pages/MatchScoringPage'

// ── Leaderboards ───────────────────────────────────────────────
import LeaderboardsLayout from '../pages/leaderboards/LeaderboardsLayout'
import PlayerLeaderboardsPage from '../pages/leaderboards/PlayerLeaderboardsPage'
import TeamLeaderboardsPage from '../pages/leaderboards/TeamLeaderboardsPage'
import TeamDetailLeaderboardPage from '../pages/leaderboards/TeamDetailLeaderboardPage'

// ── Tournaments ────────────────────────────────────────────────
import Tournaments from '../pages/Tournaments'
import CreateTournament from '../pages/tournaments/CreateTournament'
import TournamentDashboard from '../pages/tournaments/TournamentDashboard'
import TournamentSetupDashboard from '../pages/tournaments/TournamentSetupDashboard'
import TournamentPublicView from '../pages/tournaments/TournamentPublicView'
import RegisterTeamsScreen from '../pages/tournaments/RegisterTeamsScreen'
import AddRoundsScreen from '../pages/tournaments/AddRoundsScreen'
import GenerateScheduleScreen from '../pages/tournaments/GenerateScheduleScreen'
import Awards from '../pages/awards/Awards'
import Notifications from '../pages/Notifications'

// ── Teams Management ──────────────────────────────────────────
import TeamsPage from '../pages/teams/TeamsPage'
import TeamDetailsPage from '../pages/teams/TeamDetailsPage'

// ── Scorer ─────────────────────────────────────────────────────
import AssignedMatches from '../pages/scorer/AssignedMatches'

// ── Kabaddi Create Match Flow ──────────────────────────────────
import KabaddiStartMatch from '../features/kabaddi/components/create/KabaddiStartMatch'
import KabaddiSelectTeam from '../features/kabaddi/components/create/KabaddiSelectTeam'
import SquadOnboarding from '../features/kabaddi/components/create/SquadOnboarding'
import KabaddiMatchPreview from '../features/kabaddi/components/create/KabaddiMatchPreview'
import KabaddiToss from '../features/kabaddi/components/create/KabaddiToss'

export const router = createBrowserRouter([
  // ── Public intro routes ─────────────────────────────────────────
  { path: '/intro', element: <PublicOnlyRoute><IntroPage /></PublicOnlyRoute> },
  { path: '/', element: <PublicOnlyRoute><IntroPage /></PublicOnlyRoute> },

  // ── Public auth routes ──────────────────────────────────────────
  { path: '/login', element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute> },
  { path: '/signup', element: <PublicOnlyRoute><SignupPage /></PublicOnlyRoute> },
  { path: '/verify-otp', element: <PublicOnlyRoute><VerifyOTP /></PublicOnlyRoute> },
  { path: '/onboarding', element: <ProtectedRoute><OnboardingPage /></ProtectedRoute> },
  { path: '/auth/callback', element: <AuthCallback /> },

  // ── Public Player Profiles (no auth required) ───────────────────
  { path: '/player/:id', element: <PlayerProfilePage /> },

  // ── Standalone / Full-Screen Routes (No Layout) ─────────────────
  { path: '/matches/:id/live', element: <ProtectedRoute><MatchScoringPage /></ProtectedRoute> },
  { path: '/kabaddi/match/:id/score', element: <ProtectedRoute><MatchScoringPage /></ProtectedRoute> },

  // Redirects for legacy scoring paths
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
      { path: 'news', element: <NewsPage /> },
      { path: 'feed', element: <FeedPage /> },

      // ── User ──────────────────────────────────────────────────
      { path: 'profile', element: <PlayerProfilePage /> },
      { path: 'me/posters', element: <MyPostersPage /> },
      { path: 'players/:id', element: <PlayerProfilePage /> },
      { path: 'profile/edit', element: <EditProfilePage /> },
      { path: 'teams', element: <TeamsPage /> },
      { path: 'teams/:id/manage', element: <TeamDetailsPage /> },
      { path: 'teams/:id', element: <TeamDetailLeaderboardPage /> },
      { path: 'settings', element: <Settings /> },
      { path: 'upgrade', element: <PlanUpgrade /> },

      // ── Scorer ────────────────────────────────────────────────
      { path: 'scorer/assigned', element: <AssignedMatches /> },

      // ── Matches ───────────────────────────────────────────────
      { path: 'matches', element: <KabaddiMatchesPage /> },
      { path: 'matches/:id', element: <MatchDetailsPage /> },
      { path: 'matches/:id/summary', element: <MatchSummary /> },

      // Redirects for old/alias match paths
      { path: 'kabaddi/matches', element: <Navigate to="/matches" replace /> },
      { path: 'kabaddi/matches/:id', element: <Navigate to="/matches/:id" replace /> },
      { path: 'kabaddi/match/:id', element: <Navigate to="/matches/:id" replace /> },
      { path: 'kabaddi/matches/:id/summary', element: <Navigate to="/matches/:id/summary" replace /> },
      { path: 'kabaddi/match/:id/summary', element: <Navigate to="/matches/:id/summary" replace /> },

      // ── Create match flow ─────────────────────────────────────────
      { path: 'kabaddi/create', element: <Navigate to="/kabaddi/create/teams" replace /> },
      { path: 'kabaddi/create/teams', element: <KabaddiSelectTeam /> },
      { path: 'kabaddi/create/setup', element: <KabaddiStartMatch /> },
      { path: 'kabaddi/create/lineup', element: <SquadOnboarding /> },
      { path: 'kabaddi/create/preview', element: <KabaddiMatchPreview /> },
      { path: 'kabaddi/create/toss', element: <KabaddiToss /> },

      // ── Tournaments ───────────────────────────────────────────
      { path: 'tournaments', element: <Tournaments /> },
      { path: 'tournaments/:id', element: <TournamentPublicView /> },
      { path: 'tournaments/:id/dashboard', element: <TournamentDashboard /> },
      { path: 'tournaments/:id/teams/:teamId', element: <TeamDetailLeaderboardPage /> },

      // Tournament Wizard paths
      { path: 'tournaments/:id/add-teams', element: <RegisterTeamsScreen /> },
      { path: 'tournaments/:id/setup', element: <TournamentSetupDashboard /> },
      { path: 'tournaments/:id/add-rounds', element: <AddRoundsScreen /> },
      { path: 'tournaments/:id/add-schedule', element: <GenerateScheduleScreen /> },

      { path: 'tournament/create', element: <CreateTournament /> }, // Keep this singular for create
      { path: 'tournament/:id/*', element: <RedirectWithId /> },

      // ── Auth Back-compat ──────────────────────────────────────
      { path: 'logout', element: <LogoutPage /> },
      { path: 'auth/login', element: <Navigate to="/login" replace /> },
      { path: 'auth/signup', element: <Navigate to="/signup" replace /> },
      { path: 'auth/verify-otp', element: <Navigate to="/verify-otp" replace /> },
      { path: 'auth/onboarding', element: <Navigate to="/onboarding" replace /> },
      { path: 'auth/callback', element: <AuthCallback /> },
    ]
  },
  // Fallback
  { path: '*', element: <Navigate to="/intro" replace /> }
])

function RedirectWithId() {
  const { id } = useParams();
  const location = useLocation();
  // If e.g. /tournament/t-123/add-rounds, we want /tournaments/t-123/add-rounds
  // Handle both with and without trailing slash after ID
  const tournamentBase = `/tournament/${id}/`;
  const subPath = location.pathname.includes(tournamentBase) 
    ? location.pathname.split(tournamentBase)[1] 
    : '';
  return <Navigate to={`/tournaments/${id}/${subPath}`} replace />;
}
