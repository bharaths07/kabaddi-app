import { RouteObject, Navigate } from "react-router-dom";
import KabaddiCreateMatch from "../features/kabaddi/components/create/KabaddiCreateMatch";
import KabaddiSelectTeam  from "../features/kabaddi/components/create/KabaddiSelectTeam";
import KabaddiStartMatch  from "../features/kabaddi/components/create/KabaddiStartMatch";
import SquadOnboarding    from "../features/kabaddi/components/create/SquadOnboarding";
import KabaddiToss        from "../features/kabaddi/components/create/KabaddiToss";
import KabaddiMatchesPage from "../features/kabaddi/components/matches/KabaddiMatchesPage";
import MatchDetailsPage   from "../features/kabaddi/components/matches/MatchDetailsPage";
import MatchSummary       from "../pages/MatchSummary";
import MatchScoringPage   from "../features/kabaddi/pages/MatchScoringPage";

export const kabaddiRoutes: RouteObject[] = [

  // ── Match list (Canonical: /matches) ─────────────────────────
  { path: "/matches",      element: <KabaddiMatchesPage /> },

  // ── Match detail (Canonical: /matches/:id) ───────────────────
  { path: "/matches/:id",  element: <MatchDetailsPage /> },

  // ── Match summary (Canonical: /matches/:id/summary) ──────────
  { path: "/matches/:id/summary", element: <MatchSummary /> },

  // ── Redirects for old/alias paths ────────────────────────────
  { path: "/kabaddi/matches",         element: <Navigate to="/matches" replace /> },
  { path: "/kabaddi/matches/:id",     element: <Navigate to="/matches/:id" replace /> },
  { path: "/kabaddi/match/:id",       element: <Navigate to="/matches/:id" replace /> },
  { path: "/kabaddi/matches/:id/summary", element: <Navigate to="/matches/:id/summary" replace /> },
  { path: "/kabaddi/match/:id/summary",   element: <Navigate to="/matches/:id/summary" replace /> },

  // ── Create match flow ─────────────────────────────────────────
  { path: "/kabaddi/create",                    element: <KabaddiCreateMatch /> },
  { path: "/kabaddi/create/select-team/:slot",  element: <KabaddiSelectTeam /> },
  { path: "/kabaddi/create/start",              element: <KabaddiStartMatch /> },
  { path: "/kabaddi/create/squad",              element: <SquadOnboarding /> },
  { path: "/kabaddi/create/toss",               element: <KabaddiToss /> },
];

export default kabaddiRoutes;
