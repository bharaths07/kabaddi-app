import React from "react";
import { RouteObject } from "react-router-dom";
import KabaddiLiveScorer from "../features/kabaddi/components/scorers/KabaddiLiveScorer";
import KabaddiCreateMatch from "../features/kabaddi/components/create/KabaddiCreateMatch";
import KabaddiSelectTeam from "../features/kabaddi/components/create/KabaddiSelectTeam";
import KabaddiStartMatch from "../features/kabaddi/components/create/KabaddiStartMatch";
import KabaddiToss from "../features/kabaddi/components/create/KabaddiToss";
import KabaddiMatchesPage from "../features/kabaddi/components/matches/KabaddiMatchesPage";
import MatchDetailsPage from "../features/kabaddi/components/matches/MatchDetailsPage";

const KabaddiMatches: React.FC = () => <KabaddiMatchesPage />;
const KabaddiCreate: React.FC = () => <KabaddiCreateMatch />;
const KabaddiSummary: React.FC = () => <div>Match summary</div>;
const KabaddiLeaderboard: React.FC = () => <div>Kabaddi leaderboard</div>;
const KabaddiMatchDetails: React.FC = () => <MatchDetailsPage />;

export const kabaddiRoutes: RouteObject[] = [
  { path: "/kabaddi/matches", element: <KabaddiMatches /> },
  { path: "/kabaddi/matches/:id", element: <KabaddiMatchDetails /> },
  // singular aliases
  { path: "/kabaddi/match/:id", element: <KabaddiMatchDetails /> },
  { path: "/kabaddi/create", element: <KabaddiCreate /> },
  { path: "/kabaddi/create/select-team/:slot", element: <KabaddiSelectTeam /> },
  { path: "/kabaddi/create/start", element: <KabaddiStartMatch /> },
  { path: "/kabaddi/create/toss", element: <KabaddiToss /> },
  { path: "/kabaddi/matches/:id/live", element: <KabaddiLiveScorer /> },
  { path: "/kabaddi/match/:id/live", element: <KabaddiLiveScorer /> },
  { path: "/kabaddi/matches/:id/summary", element: <KabaddiSummary /> },
  { path: "/kabaddi/match/:id/summary", element: <KabaddiSummary /> },
  // Leaderboards are available globally at /leaderboards
];

export default kabaddiRoutes;
