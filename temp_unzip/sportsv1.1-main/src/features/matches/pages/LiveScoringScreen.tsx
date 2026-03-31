import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, StopCircle, Trophy, ChevronLeft, AlertCircle } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth';
import { Match } from '@/features/matches/types/match';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { FootballLiveScorer } from '@/features/matches/components/FootballLiveScorer';
import { BasketballLiveScorer } from '@/features/matches/components/BasketballLiveScorer';
import { MatchSyncIndicator } from '@/features/matches/components/MatchSyncIndicator';

export const LiveScoringScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const requireAuth = useRequireAuth();
  const { matches, currentUser, scoreMatch, undoMatchEvent, endMatch, startMatch, canScoreMatch } = useGlobalState();
  const match = matches.find((m: Match) => m.id === id);
  const [isEnding, setIsEnding] = useState(false); // Double-click protection

  // Dev toggle for Viewer/Scorer mode verification
  // const [isSimulatingViewer, setIsSimulatingViewer] = useState(false);

  // Route Protection
  useEffect(() => {
    requireAuth(currentUser);
  }, [currentUser, requireAuth]);

  if (!match) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-bold text-slate-900">Match not found</h2>
          <Button variant="outline" onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Determine permissions
  const hasPermission = canScoreMatch(match.id);
  const canScore = hasPermission;

  if (!canScore) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-slate-500 max-w-md text-center">
            You are not assigned as a scorer for this match. Only official scorers can access this page.
          </p>

          <div className="flex gap-3 mt-4">
            {!currentUser && (
              <Button onClick={() => requireAuth(null)}>
                Login to Score
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(`/matches/${match.id}`)}>
              Go to Match Summary
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  const handleEndMatch = () => {
    if (isEnding) return;
    if (window.confirm('Are you sure you want to end the match? This action cannot be undone.')) {
      setIsEnding(true);
      endMatch(match.id);
      navigate(`/matches/${match.id}`);
    }
  };

  // --- Cricket Logic Implementation ---
  const handleStartMatch = () => {
    startMatch(match.id);
  };

  // Determine Batting/Bowling (Simple fallback)
  const battingTeamId = match.currentBattingTeamId || match.homeParticipant.id;
  const battingParticipant = match.homeParticipant.id === battingTeamId ? match.homeParticipant : match.awayParticipant;

  const runs = battingParticipant.score || 0;
  const wickets = battingParticipant.wickets || 0;

  const totalOvers = battingParticipant.overs || 0;
  const oversCount = Math.floor(totalOvers);
  const ballsInOver = Math.round((totalOvers - oversCount) * 10);

  const handleScore = (runValue: number, isWicket: boolean) => {
    scoreMatch(match.id, {
      type: isWicket ? 'wicket' : 'delivery',
      teamId: battingParticipant.id,
      runsScored: runValue,
      points: runValue, // Total points added
      description: isWicket ? 'Wicket Fall' : `${runValue} runs`,
      timestamp: new Date().toISOString()
    });
  };

  // Football Scoring Interface
  if (match.sportId === 's3') {
    return (
      <PageContainer>
        <div className="max-w-md mx-auto space-y-4">
          <PageHeader
            title="Live Scoring - Football"
            actions={
              <div className="flex items-center gap-4">
                <MatchSyncIndicator />
                <Button variant="ghost" size="sm" onClick={() => navigate(`/matches/${match.id}`)}>
                  Back
                </Button>
              </div>
            }
          />
          <FootballLiveScorer
            match={match}
            onEndMatch={handleEndMatch}
            isEnding={isEnding}
          />
        </div>
      </PageContainer>
    );
  }

  // Basketball Scoring Interface
  if (match.sportId === 's5') {
    return (
      <PageContainer>
        <div className="max-w-md mx-auto space-y-4">
          <PageHeader
            title="Live Scoring - Basketball"
            actions={
              <div className="flex items-center gap-4">
                <MatchSyncIndicator />
                <Button variant="ghost" size="sm" onClick={() => navigate(`/matches/${match.id}`)}>
                  Back
                </Button>
              </div>
            }
          />
          <BasketballLiveScorer
            match={match}
            onEndMatch={handleEndMatch}
            isEnding={isEnding}
            onScore={(event) => scoreMatch(match.id, event)}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Back & Status */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/matches/${match.id}`)} icon={<ChevronLeft className="w-4 h-4" />}>
            Back to Summary
          </Button>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${match.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' :
              match.status === 'completed' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-600'
              }`}>
              {match.status}
            </span>
            <MatchSyncIndicator />
          </div>
        </div>

        {/* Scoreboard Card */}
        <Card className="bg-slate-900 text-white border-slate-800 p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Batting Team */}
            <div className="text-center md:text-left">
              <div className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2 justify-center md:justify-start">
                {battingParticipant.name} <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              <div className="text-5xl md:text-6xl font-bold tracking-tight">
                {runs}<span className="text-slate-500">/</span>{wickets}
              </div>
              <div className="text-lg text-slate-400 mt-1 font-mono">
                {oversCount}.{ballsInOver} Overs
              </div>
            </div>

            {/* VS / Quarter Info */}
            <div className="flex flex-col items-center">
              <div className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-1">
                {match.sportId === 's1' ? `Over ${oversCount + 1}` : `Period ${match.liveState?.currentPeriod || 1}`}
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold border border-slate-700 mb-2">
                VS
              </div>
              <div className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">
                {match.status === 'live' ? 'Live' : 'Match Info'}
              </div>
            </div>
          </div>
        </Card>

        {/* Controls */}
        {match.status === 'live' ? (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Runs</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[0, 1, 2, 3, 4, 6].map(run => (
                  <button
                    key={run}
                    onClick={() => handleScore(run, false)}
                    className={`
                                    h-16 rounded-xl font-bold text-2xl transition-all active:scale-95 shadow-sm border
                                    ${run === 4 ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' :
                        run === 6 ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' :
                          'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}
                                `}
                  >
                    {run}
                  </button>
                ))}
              </div>

              <h3 className="text-sm font-bold text-slate-500 uppercase mt-6 mb-4">Extras & Wickets</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => handleScore(0, true)}
                  className="h-14 rounded-xl font-bold text-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-95 transition-all"
                >
                  OUT (W)
                </button>
                <button
                  onClick={() => handleScore(1, false)} // Simple WD implementation for now
                  className="h-14 rounded-xl font-bold text-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 active:scale-95 transition-all"
                >
                  Wide (+1)
                </button>
                <button
                  onClick={() => handleScore(1, false)} // Simple NB implementation for now
                  className="h-14 rounded-xl font-bold text-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 active:scale-95 transition-all"
                >
                  No Ball (+1)
                </button>
                <button
                  onClick={() => undoMatchEvent(match.id)}
                  className="h-14 rounded-xl font-bold text-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all"
                  disabled={!match.events?.length}
                >
                  Undo
                </button>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button
                variant="danger"
                size="lg"
                onClick={handleEndMatch}
                isLoading={isEnding}
                icon={<StopCircle className="w-5 h-5" />}
              >
                End Match
              </Button>
            </div>
          </div>
        ) : match.status === 'scheduled' || match.status === 'created' ? (
          <Card className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 ml-1" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Ready to start?</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Starting the match will enable the scoring interface and notify followers that the match is live.
            </p>
            <div className="pt-4">
              <Button size="lg" onClick={handleStartMatch}>
                Start Match
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center bg-slate-50 border-dashed">
            <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">Match Completed</h3>
            <p className="text-slate-500 mb-6">
              This match has ended. Final scores have been recorded.
            </p>
            <Button variant="outline" onClick={() => navigate(`/matches/${match.id}`)}>
              View Scorecard
            </Button>
          </Card>
        )}
      </div>
    </PageContainer >
  );
};

// Helper Icon
const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
