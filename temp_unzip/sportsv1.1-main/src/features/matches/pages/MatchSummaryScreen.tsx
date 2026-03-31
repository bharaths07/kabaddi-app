import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { Match } from '@/features/matches/types/match';
import { Team } from '@/features/teams/types/team';
import { MatchSummaryTab } from './MatchSummaryTab';
import { MatchInfoTab } from './MatchInfoTab';
import { MatchScorecardTab } from './MatchScorecardTab';
import { MatchCommentaryTab } from './MatchCommentaryTab';
import { MatchSquadsTab } from './MatchSquadsTab';
import { ScorerAssignment } from '@/features/matches/components/ScorerAssignment';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Button } from '@/shared/components/ui/Button';
import { Tabs } from '@/shared/components/ui/Tabs';
import { Avatar } from '@/shared/components/ui/Avatar';
import { ArrowLeft, Plus, Check } from 'lucide-react';

export const MatchSummaryScreen: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { matches, teams, followedMatches, toggleFollowMatch, currentUser } = useGlobalState();
  const [activeTab, setActiveTab] = useState('summary');

  const match = matches.find((m: Match) => m.id === matchId);
  const isFollowed = match ? followedMatches.includes(match.id) : false;

  // Resolve Team Logos
  const homeTeam = match ? teams.find((t: Team) => t.id === match.homeParticipant.id) : undefined;
  const awayTeam = match ? teams.find((t: Team) => t.id === match.awayParticipant.id) : undefined;

  // Navigation State Handling
  const navState = location.state as { returnPath?: string; tournamentId?: string; stage?: string } | null;

  if (!match) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Match not found</h2>
          <Button variant="primary" onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </PageContainer>
    );
  }

  const isAdmin = currentUser?.role === 'admin';
  const tabOptions = [
    { id: 'summary', label: 'Summary' },
    { id: 'scorecard', label: 'Scorecard' },
    { id: 'comms', label: 'Commentary' },
    { id: 'squads', label: 'Squads' },
    { id: 'info', label: 'Info' },
  ];

  if (isAdmin) {
    tabOptions.push({ id: 'settings', label: 'Settings' });
  }

  const handleBack = () => {
    if (navState?.returnPath) {
      navigate(navState.returnPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <PageContainer>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="text-slate-500 hover:text-slate-900 pl-0">
            <ArrowLeft size={18} className="mr-1" />
            {navState?.returnPath ? 'Back to Tournament' : 'Back'}
          </Button>

          <div className="flex items-center gap-3">
            {match.status !== 'completed' && match.status !== 'locked' && (
              <Button
                variant={isFollowed ? "secondary" : "outline"}
                size="sm"
                onClick={() => toggleFollowMatch(match.id)}
                className={isFollowed ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
              >
                {isFollowed ? <Check size={16} className="mr-1.5" /> : <Plus size={16} className="mr-1.5" />}
                {isFollowed ? 'Following' : 'Follow Match'}
              </Button>
            )}
            {/* <Button variant="ghost" size="icon"><MoreVertical size={18} /></Button> */}
          </div>
        </div>

        {/* Match Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {navState?.stage || match.stage || (match.tournamentId ? match.tournamentId.replace(/-/g, ' ').toUpperCase() : 'Match Details')}
            </div>
            {match.status === 'live' && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                LIVE
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {/* Home Team */}
              <div className="flex flex-col items-center gap-3 flex-1">
                <Avatar
                  src={homeTeam?.logoUrl}
                  fallback={match.homeParticipant.name?.charAt(0) || '?'}
                  className="w-16 h-16 rounded-xl bg-slate-100 text-xl font-bold text-slate-600 border border-slate-200"
                />
                <div className="text-center">
                  <div className="font-bold text-lg text-slate-900 leading-tight">{match.homeParticipant.name || 'Unknown Team'}</div>
                  {/* <div className="text-sm text-slate-500 mt-1">Home</div> */}
                </div>
              </div>

              {/* VS / Score */}
              <div className="flex flex-col items-center px-8">
                {(match.status === 'draft') ? (
                  <div className="text-2xl font-bold text-slate-300 mb-1">VS</div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {(match.sportId === 's2' || match.sportId === 's3' || match.sportId === 's4') ? (
                        // Goals/Points based (Football, Kabaddi, Badminton)
                        <span>{match.homeParticipant.score || 0} - {match.awayParticipant.score || 0}</span>
                      ) : (
                        // Cricket Score (Simplified)
                        <span>{match.homeParticipant.score || 0}/{match.homeParticipant.wickets || 0} - {match.awayParticipant.score || 0}/{match.awayParticipant.wickets || 0}</span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                      {match.status === 'live' ? 'Live' : 'Full Time'}
                    </div>
                  </div>
                )}
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center gap-3 flex-1">
                <Avatar
                  src={awayTeam?.logoUrl}
                  fallback={match.awayParticipant.name?.charAt(0) || '?'}
                  className="w-16 h-16 rounded-xl bg-slate-100 text-xl font-bold text-slate-600 border border-slate-200"
                />
                <div className="text-center">
                  <div className="font-bold text-lg text-slate-900 leading-tight">{match.awayParticipant.name || 'Unknown Team'}</div>
                  {/* <div className="text-sm text-slate-500 mt-1">Away</div> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabOptions}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="underline"
          className="mb-6"
        />
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'summary' && <MatchSummaryTab match={match} onTabChange={setActiveTab} />}
        {activeTab === 'scorecard' && <MatchScorecardTab match={match} />}
        {activeTab === 'comms' && <MatchCommentaryTab match={match} />}
        {activeTab === 'squads' && <MatchSquadsTab match={match} />}
        {activeTab === 'info' && <MatchInfoTab match={match} />}
        {activeTab === 'settings' && <ScorerAssignment matchId={match.id} />}
      </div>
    </PageContainer>
  );
};
