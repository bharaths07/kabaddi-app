import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { generateRoundRobinMatches } from '@/shared/utils/scheduling/generateRoundRobin';
import { generateKnockoutMatches } from '@/shared/utils/scheduling/generateKnockout';
import { generateGroupsMatches } from '@/shared/utils/scheduling/generateGroups';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Match } from '@/features/matches/types/match';

import { Tournament } from '@/features/tournaments/types/tournament';
import { Team } from '@/features/teams/types/team';

type ProcessingStatus = 'processing' | 'success' | 'error';

export const TournamentAutoScheduleScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tournaments, teams: allTeams, matches, addMatch } = useGlobalState();

  const [status, setStatus] = useState<ProcessingStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processSchedule = async () => {
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      const tournament = (tournaments as Tournament[]).find(t => t.id === id);

      if (!tournament) {
        setErrorMessage('Tournament not found');
        setStatus('error');
        return;
      }

      // Guardrail: Check existing matches
      const existingMatches = (matches as Match[]).filter(m => m.tournamentId === id);
      if (existingMatches.length > 0) {
        setErrorMessage('Matches already exist for this tournament. Clear them first to auto-schedule.');
        setStatus('error');
        return;
      }

      const tournamentTeams = (allTeams as Team[]).filter(team => tournament.teams?.includes(team.id));

      if (tournamentTeams.length < 2) {
        setErrorMessage('At least 2 teams are required to generate fixtures.');
        setStatus('error');
        return;
      }

      try {
        let generatedMatches: Match[] = [];
        const format = tournament.structure?.format || 'LEAGUE';

        // Choose generator based on format
        if (format === 'LEAGUE') {
          generatedMatches = generateRoundRobinMatches(tournamentTeams, tournament.id, tournament.sportId);
        } else if (format === 'KNOCKOUT') {
          generatedMatches = generateKnockoutMatches(tournamentTeams, tournament.id, tournament.sportId);
        } else if (format === 'GROUP_KNOCKOUT') {
          const numGroups = tournament.structure?.groups || 2;
          generatedMatches = generateGroupsMatches(tournamentTeams, tournament.id, numGroups, tournament.sportId);
        } else {
          setErrorMessage(`Format ${format} is not yet supported for auto-scheduling.`);
          setStatus('error');
          return;
        }

        if (generatedMatches.length === 0) {
          setErrorMessage('Failed to generate any matches. Please check your tournament setup.');
          setStatus('error');
          return;
        }

        // Persist
        generatedMatches.forEach(addMatch);

        setStatus('success');

        // Redirect after success
        setTimeout(() => {
          navigate(`/tournament/${id}`);
        }, 1500);
      } catch (error) {
        console.error("Scheduling error:", error);
        setErrorMessage('An unexpected error occurred while generating fixtures.');
        setStatus('error');
      }
    };

    processSchedule();
  }, [id, tournaments, allTeams, matches, addMatch, navigate]);

  return (
    <PageContainer className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        {status === 'processing' && (
          <>
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Generating Fixtures...</h2>
              <p className="text-slate-500">Please wait while we schedule matches for your tournament.</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Schedule Created!</h2>
              <p className="text-slate-500">Redirecting to tournament dashboard...</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Scheduling Failed</h2>
              <p className="text-slate-500 mb-6">{errorMessage}</p>
              <Button
                onClick={() => navigate(`/tournament/${id}`)}
                variant="outline"
                className="w-full gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Tournament
              </Button>
            </div>
          </>
        )}
      </Card>
    </PageContainer>
  );
};
