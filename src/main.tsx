import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/tokens.css'
import './styles/global.css'
import './styles/components.css'
import './index.css'
import './styles/tokens.css'
import './styles/global.css'
import './styles/components.css'
import Layout from './shared/components/Layout'
import Home from './pages/Home'
import KabaddiMatchesPage from './features/kabaddi/components/matches/KabaddiMatchesPage'
import MatchSummary from './pages/MatchSummary'
import KabaddiLeaderboards from './features/kabaddi/pages/Leaderboards'
import Tournaments from './pages/Tournaments'
import TeamDetails from './pages/TeamDetails'
import FeedNews from './pages/FeedNews'
import ErrorPage from './pages/ErrorPage'
import Settings from './pages/Settings'
import PlanUpgrade from './pages/PlanUpgrade'
import MyStats from './pages/MyStats'
import CreateTournament from './pages/tournaments/CreateTournament'
import kabaddiRoutes from './routes/kabaddiRoutes'
import AddTeams from './pages/tournaments/AddTeams'
import AddRoundsGroups from './pages/tournaments/AddRoundsGroups'
import AddSchedule from './pages/tournaments/AddSchedule'
import TournamentDashboard from './pages/tournaments/TournamentDashboard'
import TournamentDetails from './pages/tournaments/TournamentDetails'
import AssignedMatches from './pages/scorer/AssignedMatches'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: 'matches', element: <KabaddiMatchesPage /> },
      { path: 'matches/:id/summary', element: <MatchSummary /> },
      { path: 'leaderboards', element: <KabaddiLeaderboards /> },
      { path: 'news', element: <FeedNews /> },
      { path: 'feed', element: <FeedNews /> },
      { path: 'settings', element: <Settings /> },
      { path: 'upgrade', element: <PlanUpgrade /> },
      { path: 'me/stats', element: <MyStats /> },
      { path: 'tournaments', element: <Tournaments /> },
      { path: 'tournaments', element: <Tournaments /> },
      { path: 'tournaments/:id', element: <TournamentDetails /> },
      { path: 'tournament/create', element: <CreateTournament /> },
      { path: 'tournament/:id/dashboard', element: <TournamentDashboard /> },
      { path: 'tournament/:id/add-teams', element: <AddTeams /> },
      { path: 'tournament/:id/add-rounds', element: <AddRoundsGroups /> },
      { path: 'tournament/:id/add-schedule', element: <AddSchedule /> },
      { path: 'scorer/assigned', element: <AssignedMatches /> },
      { path: 'tournaments/:id/teams/:teamId', element: <TeamDetails /> },
      ...kabaddiRoutes
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
