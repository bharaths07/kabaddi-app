import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Trophy, Plus, HelpCircle, X } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { TeamConfirmAnimation } from '@/shared/components/TeamConfirmAnimation/TeamConfirmAnimation';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Avatar } from '@/shared/components/ui/Avatar';

export const SelectTeamsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { teams } = useGlobalState();
  const [searchParams] = useSearchParams();
  // const game = searchParams.get('game') || 'cricket';
  const teamAId = searchParams.get('teamA');
  const teamBId = searchParams.get('teamB');

  const [showAnimation, setShowAnimation] = useState(false);

  const teamA = teamAId ? teams.find(t => t.id === teamAId) : undefined;
  const teamB = teamBId ? teams.find(t => t.id === teamBId) : undefined;

  const handleSelectTeam = (slot: 'A' | 'B') => {
    if (showAnimation) return;
    // Preserve existing params
    const currentParams = new URLSearchParams(searchParams);
    navigate(`/start-match/select-team/${slot}?${currentParams.toString()}`);
  };

  const handleClearTeam = (e: React.MouseEvent, slot: 'A' | 'B') => {
    e.stopPropagation();
    if (showAnimation) return;
    const newParams = new URLSearchParams(searchParams);
    if (slot === 'A') newParams.delete('teamA');
    else newParams.delete('teamB');
    navigate(`?${newParams.toString()}`, { replace: true });
  };

  const handleNext = () => {
    if (teamA && teamB) {
      setShowAnimation(true);
    }
  };

  const handleAnimationComplete = () => {
    // Navigate to CreateMatchScreen with pre-filled data and query params as backup
    // Initialize with existing params to preserve tournamentId/context
    const params = new URLSearchParams(searchParams);
    if (teamA) params.set('teamA', teamA.id);
    if (teamB) params.set('teamB', teamB.id);

    // Map game to sportId
    if (!params.has('sportId')) {
      const game = searchParams.get('game');
      if (game === 'football') {
        params.set('sportId', 's3');
      } else {
        params.set('sportId', 's1'); // Default Cricket
      }
    }

    navigate(`/create-match?${params.toString()}`, {
      state: {
        teamA,
        teamB,
        sportId: 's1' // Defaulting to cricket for now
      }
    });
  };

  const renderTeamSlot = (slot: 'A' | 'B', team?: typeof teamA) => {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => handleSelectTeam(slot)}
          className={`
            relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300
            ${team
              ? 'bg-white shadow-xl ring-4 ring-white'
              : 'bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 group'
            }
          `}
        >
          {team ? (
            <>
              <Avatar
                src={team.logoUrl}
                alt={team.name}
                fallback={team.name.substring(0, 2).toUpperCase()}
                className="w-full h-full text-3xl"
              />
              <div
                onClick={(e) => handleClearTeam(e, slot)}
                className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors border border-slate-100 z-10"
              >
                <X className="w-4 h-4" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-blue-500">
              <Plus className="w-8 h-8" />
              <span className="text-xs font-bold uppercase tracking-wider">Select</span>
            </div>
          )}
        </button>
        <div className="text-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {slot === 'A' ? 'Home Team' : 'Away Team'}
          </div>
          <h3 className={`font-bold text-lg ${team ? 'text-slate-900' : 'text-slate-300'}`}>
            {team ? team.name : 'No Team Selected'}
          </h3>
        </div>
      </div>
    );
  };

  return (
    <PageContainer>
      {/* Animation Overlay */}
      {showAnimation && teamA && teamB && (
        <TeamConfirmAnimation
          teamA={teamA}
          teamB={teamB}
          matchId={`temp-${Date.now()}`}
          onComplete={handleAnimationComplete}
        />
      )}

      <PageHeader
        title="Select Teams"
        description="Choose two teams to start a match"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/start-match')}>
              Back
            </Button>
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-5 h-5 text-slate-400" />
            </Button>
          </div>
        }
      />

      <div className="max-w-4xl mx-auto mt-8">
        <Card className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">

            {/* Team A */}
            {renderTeamSlot('A', teamA)}

            {/* VS Badge */}
            <div className="relative z-10">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl rotate-45 flex items-center justify-center shadow-lg shadow-slate-200 ring-8 ring-white">
                <span className="-rotate-45 text-xl font-black text-white">VS</span>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-100 -z-10 scale-x-[3] md:scale-x-[6]" />
            </div>

            {/* Team B */}
            {renderTeamSlot('B', teamB)}

          </div>

          <div className="mt-12 flex justify-center">
            <Button
              size="lg"
              className="px-12 h-14 text-lg gap-3 rounded-full shadow-lg shadow-blue-200"
              disabled={!teamA || !teamB}
              onClick={handleNext}
            >
              Start Match
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            <Trophy className="w-4 h-4" />
            <span>Pro Tip: Create teams first to track player stats properly</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

