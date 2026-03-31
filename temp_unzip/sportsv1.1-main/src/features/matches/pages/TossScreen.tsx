import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { Match, Toss } from '@/features/matches/types/match';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';

export const TossScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId');
  const navigate = useNavigate();
  const { matches, updateMatch } = useGlobalState();
  const [match, setMatch] = useState<Match | null>(null);

  const [tossWinnerTeamId, setTossWinnerTeamId] = useState<string>('');
  const [tossDecision, setTossDecision] = useState<Toss['decision'] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (matchId && matches.length > 0) {
      const foundMatch = matches.find(m => m.id === matchId);
      if (foundMatch) {
        setMatch(foundMatch);
        if (foundMatch.toss) {
          setTossWinnerTeamId(foundMatch.toss.winnerTeamId);
          setTossDecision(foundMatch.toss.decision);
        }
      } else {
        console.error('Match not found');
      }
    }
  }, [matchId, matches]);

  const handleConfirmToss = () => {
    if (!match || !tossWinnerTeamId || !tossDecision) return;

    setIsSubmitting(true);

    const tossDetails: Toss = {
      winnerTeamId: tossWinnerTeamId,
      decision: tossDecision
    };

    // Simulate network delay
    setTimeout(() => {
      updateMatch(match.id, {
        toss: tossDetails,
      });
      setIsSubmitting(false);
      navigate(`/start-match/squads?matchId=${match.id}`);
    }, 500);
  };

  if (!match) {
    return <div className="p-4">Loading match details...</div>;
  }

  const isComplete = tossWinnerTeamId && tossDecision;

  return (
    <PageContainer>
      <PageHeader
        title="Toss"
        description="Who won the toss and what did they choose?"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/create-match?tournamentId=${match.tournamentId || ''}`)}>
              Back
            </Button>
            <Button
              onClick={handleConfirmToss}
              disabled={!isComplete || isSubmitting}
              variant="primary"
              className="gap-2"
            >
              {isSubmitting ? 'Saving...' : 'Confirm Toss'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      <div className="max-w-lg mx-auto space-y-8">

        {/* Section 1: Who won the toss? */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Who won the toss?</h2>
          <div className="grid grid-cols-2 gap-4">
            {[match.homeParticipant, match.awayParticipant].map((team) => (
              <Card
                key={team.id}
                onClick={() => setTossWinnerTeamId(team.id)}
                className={`
                  relative flex flex-col items-center justify-center p-6 cursor-pointer border-2 transition-all
                  ${tossWinnerTeamId === team.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-transparent hover:border-slate-300'}
                `}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-3 shadow-sm ${tossWinnerTeamId === team.id ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                  {team.name.substring(0, 2).toUpperCase()}
                </div>
                <span className={`font-bold text-center ${tossWinnerTeamId === team.id ? 'text-blue-900' : 'text-slate-700'}`}>
                  {team.name}
                </span>
                {tossWinnerTeamId === team.id && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Section 2: Toss Decision */}
        <section className={`animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 ${!tossWinnerTeamId ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Elected to</h2>
          <div className="flex gap-4">
            {(match.sportId === 's1' ? [
              { id: 'BAT', label: 'Bat First', icon: '🏏' },
              { id: 'BOWL', label: 'Bowl First', icon: '🥎' }
            ] : [
              { id: 'KICK_OFF', label: 'Kick Off', icon: '⚽' },
              { id: 'DEFEND_GOAL', label: 'Defend Goal', icon: '🥅' }
            ]).map((option) => (
              <Card
                key={option.id}
                onClick={() => setTossDecision(option.id as any)}
                className={`
                  flex-1 py-4 px-6 font-bold text-center cursor-pointer transition-all border-2
                  ${tossDecision === option.id
                    ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105'
                    : 'bg-white text-slate-600 border-transparent hover:bg-slate-50 hover:border-slate-200'}
                `}
              >
                <div className="text-2xl mb-1">{option.icon}</div>
                <div>{option.label}</div>
              </Card>
            ))}
          </div>
        </section>

      </div>
    </PageContainer>
  );
};
