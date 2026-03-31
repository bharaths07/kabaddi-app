import React, { useEffect } from 'react';
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { MainLayout } from '@/shared/components/MainLayout';
import { HomeScreen } from '@/features/system/pages/HomeScreen';
import { LiveScreen } from '@/features/matches/pages/LiveScreen';
import { MatchSummaryScreen } from '@/features/matches/pages/MatchSummaryScreen';
import { MatchesScreen } from '@/features/matches/pages/MatchesScreen';
import { LiveScoringScreen } from '@/features/matches/pages/LiveScoringScreen';
import { PlayerProfileScreen } from '@/features/players/pages/PlayerProfileScreen';
import { TeamScreen } from '@/features/teams/pages/TeamScreen';
import { CreateMatchScreen } from '@/features/matches/pages/CreateMatchScreen';
import { SelectTeamsScreen } from '@/features/matches/pages/SelectTeamsScreen';
import { SelectGameScreen } from '@/features/matches/pages/SelectGameScreen';
import { TeamSelectionScreen } from '@/features/matches/pages/TeamSelectionScreen';
import { TossScreen } from '@/features/matches/pages/TossScreen';
import { SquadSelectionScreen } from '@/features/matches/pages/SquadSelectionScreen';
import { SelectOpenersScreen } from '@/features/matches/pages/SelectOpenersScreen';
import { AddPlayerOptionsScreen } from '@/features/matches/pages/AddPlayerOptionsScreen';
import { MyCertificatesScreen } from '@/features/certificates/pages/MyCertificatesScreen';
import { TournamentScreen } from '@/features/tournaments/pages/TournamentScreen';
import { TeamListScreen } from '@/features/teams/pages/TeamListScreen';
import { CreateTeamScreen } from '@/features/teams/pages/CreateTeamScreen';
import { SelectTeamGameScreen } from '@/features/teams/pages/SelectTeamGameScreen';
import { StatsScreen } from '@/features/stats/pages/StatsScreen';
import { LeaderboardsScreen } from '@/features/stats/pages/LeaderboardsScreen';
import { TournamentListScreen } from '@/features/tournaments/pages/TournamentListScreen';
import { CreateTournamentScreen } from '@/features/tournaments/pages/CreateTournamentScreen';
import { SelectTournamentGameScreen } from '@/features/tournaments/pages/SelectTournamentGameScreen';
import { TournamentTeamsScreen } from '@/features/tournaments/pages/TournamentTeamsScreen';
import { TournamentStructureScreen } from '@/features/tournaments/pages/TournamentStructureScreen';
import { TournamentScheduleScreen } from '@/features/tournaments/pages/TournamentScheduleScreen';
import { TournamentAutoScheduleScreen } from '@/features/tournaments/pages/TournamentAutoScheduleScreen';
import { NotificationsScreen } from '@/features/system/pages/NotificationsScreen';
import { SettingsScreen } from '@/features/system/pages/SettingsScreen';
import { ProfileScreen } from '@/features/players/pages/ProfileScreen';
import { GameProfileScreen } from '@/features/players/pages/GameProfileScreen';
import { MyProfileDetailsScreen } from '@/features/players/pages/MyProfileDetailsScreen';
import { EditProfileScreen } from '@/features/players/pages/EditProfileScreen';
import { PublicProfileScreen } from '@/features/players/pages/PublicProfileScreen';
import { MyQRCodeScreen } from '@/features/players/pages/MyQRCodeScreen';
import { SocialFeedScreen } from '@/features/social/pages/SocialFeedScreen';
import { CertificateGeneratorScreen } from '@/features/certificates/pages/CertificateGeneratorScreen';
import { PosterGeneratorScreen } from '@/features/system/pages/PosterGeneratorScreen';
import { CardScoringDemoScreen } from '@/features/system/pages/CardScoringDemoScreen';

import { ComingSoonScreen } from '@/shared/components/ComingSoonScreen';
import { PlaceholderScreen } from '@/shared/components/PlaceholderScreen';
import { SearchResultsScreen } from '@/features/system/pages/SearchResultsScreen';

import { LoginPage } from '@/features/auth/pages/LoginPage';
import { OtpVerificationScreen } from '@/features/auth/pages/OtpVerificationScreen';
import { AuthSuccessScreen } from '@/features/auth/pages/AuthSuccessScreen';
import { AuthCallbackScreen } from '@/features/auth/pages/AuthCallbackScreen';

import { VenuesScreen } from '@/features/system/pages/VenuesScreen';
import { OfficialsScreen } from '@/features/system/pages/OfficialsScreen';
import { MyTeamsScreen } from '@/features/teams/pages/MyTeamsScreen';
import { MyMatchesScreen } from '@/features/matches/pages/MyMatchesScreen';
import { SavedMatchesScreen } from '@/features/matches/pages/SavedMatchesScreen';
import { SavedTournamentsScreen } from '@/features/tournaments/pages/SavedTournamentsScreen';
import { MediaViewerScreen } from '@/features/system/pages/MediaViewerScreen';
import { PricingScreen } from '@/features/system/pages/PricingScreen';

// 🔐 Auth Guard Component
const ProtectedRoute = () => {
  const { currentUser } = useGlobalState();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout><Outlet /></MainLayout>;
};

// 🔓 Public Route Component (redirects to home if already logged in)
const PublicRoute = () => {
  const { currentUser } = useGlobalState();

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const DevAuthEnable: React.FC = () => {
  const { setCurrentUser } = useGlobalState();
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.setItem('scoreheroes_dev_auth_bypass', 'true');
    setCurrentUser({
      id: 'dev-bypass-user',
      name: 'Developer Mode',
      email: 'dev@local',
      role: 'admin',
      type: 'admin'
    });
    navigate('/', { replace: true });
  }, [setCurrentUser, navigate]);
  return null;
};

const DevAuthDisable: React.FC = () => {
  const { setCurrentUser } = useGlobalState();
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.removeItem('scoreheroes_dev_auth_bypass');
    setCurrentUser(null);
    navigate('/login', { replace: true });
  }, [setCurrentUser, navigate]);
  return null;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 🔓 Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/verify" element={<OtpVerificationScreen />} />
        <Route path="/auth/callback" element={<AuthCallbackScreen />} />
        <Route path="/dev-auth/enable" element={<DevAuthEnable />} />
        <Route path="/dev-auth/disable" element={<DevAuthDisable />} />
      </Route>

      {/* 🔐 Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/auth/success" element={<AuthSuccessScreen />} />
        <Route path="/" element={<HomeScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/live" element={<LiveScreen />} />

        {/* Top Nav Destinations */}
        <Route path="/matches" element={<MatchesScreen />} />
        <Route path="/tournaments" element={<TournamentListScreen />} />
        <Route path="/teams" element={<TeamListScreen />} />
        <Route path="/stats" element={<StatsScreen />} />
        <Route path="/leaderboards" element={<LeaderboardsScreen />} />

        {/* Search Results */}
        <Route path="/search" element={<SearchResultsScreen />} />

        <Route path="/my-teams" element={<MyTeamsScreen />} />
        <Route path="/my-matches" element={<MyMatchesScreen />} />
        <Route path="/saved-matches" element={<SavedMatchesScreen />} />
        <Route path="/saved-tournaments" element={<SavedTournamentsScreen />} />

        {/* Management */}
        <Route path="/start-match" element={<SelectGameScreen />} />
        <Route path="/start-match/select-teams" element={<SelectTeamsScreen />} />
        <Route path="/start-match/select-team/:slot" element={<TeamSelectionScreen />} />
        <Route path="/start-match/toss" element={<TossScreen />} />
        <Route path="/start-match/squads" element={<SquadSelectionScreen />} />
        <Route path="/start-match/openers" element={<SelectOpenersScreen />} />
        <Route path="/start-match/add-player" element={<AddPlayerOptionsScreen />} />
        <Route path="/create-match" element={<CreateMatchScreen />} />
        <Route path="/teams/create" element={<SelectTeamGameScreen />} />
        <Route path="/teams/setup" element={<CreateTeamScreen />} />
        <Route path="/tournament/create" element={<SelectTournamentGameScreen />} />
        <Route path="/tournament/setup" element={<CreateTournamentScreen />} />
        <Route path="/venues" element={<VenuesScreen />} />
        <Route path="/officials" element={<OfficialsScreen />} />

        {/* System */}
        <Route path="/notifications" element={<NotificationsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/social" element={<SocialFeedScreen />} />
        <Route path="/pricing" element={<PricingScreen />} />
        <Route path="/card-scoring" element={<CardScoringDemoScreen />} />

        {/* Profile Routes */}
        <Route path="/u/:username" element={<PublicProfileScreen />} />
        <Route path="/profile/me" element={<MyProfileDetailsScreen />} />
        <Route path="/profile/game" element={<GameProfileScreen />} />
        <Route path="/profile/qr" element={<MyQRCodeScreen />} />
        <Route path="/profile/edit" element={<EditProfileScreen />} />
        <Route path="/profile/:userId" element={<ProfileScreen />} />

        {/* Certificates & Posters */}
        <Route path="/certificates" element={<MyCertificatesScreen />} />
        <Route path="/certificates/generate" element={<CertificateGeneratorScreen />} />
        <Route path="/posters/generate" element={<PosterGeneratorScreen />} />

        {/* Dynamic Routes */}
        <Route path="/matches/:matchId" element={<MatchSummaryScreen />} />
        <Route path="/matches/:matchId/score" element={<LiveScoringScreen />} />
        <Route path="/players/:playerId" element={<PlayerProfileScreen />} />
        <Route path="/teams/:teamId" element={<TeamScreen />} />
        <Route path="/tournaments/:tournamentId" element={<TournamentScreen />} />
        <Route path="/tournaments/:tournamentId/teams" element={<TournamentTeamsScreen />} />
        <Route path="/tournaments/:tournamentId/structure" element={<TournamentStructureScreen />} />
        <Route path="/tournaments/:tournamentId/schedule" element={<TournamentScheduleScreen />} />
        <Route path="/tournaments/:tournamentId/auto-schedule" element={<TournamentAutoScheduleScreen />} />

        {/* Placeholders for New Features */}
        <Route path="/top-players" element={<ComingSoonScreen title="Top Players" />} />
        <Route path="/insights" element={<ComingSoonScreen title="Insights" />} />
        <Route path="/coming-soon" element={<ComingSoonScreen title="Coming Soon" />} />
        <Route path="/messages/:id" element={<ComingSoonScreen title="Messages" />} />
        <Route path="/media/:id" element={<MediaViewerScreen />} />
        <Route path="/matches/:matchId/insights" element={<ComingSoonScreen title="Match Insights" />} />
        <Route path="/matches/:matchId/table" element={<ComingSoonScreen title="Points Table" />} />
        <Route path="/matches/:matchId/leaderboard" element={<ComingSoonScreen title="Leaderboard" />} />

        {/* Fallback */}
        <Route path="*" element={<PlaceholderScreen />} />
      </Route>
    </Routes>
  );
};
