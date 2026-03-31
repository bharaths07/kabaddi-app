import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Zap, Plus, Clock, ArrowRight } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';

type ScheduleMode = 'AUTO' | 'MANUAL' | 'LATER';

export const TournamentScheduleScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tournaments, updateTournamentScheduleMode } = useGlobalState();

  const tournament = tournaments.find(t => t.id === id);

  const [scheduleMode, setScheduleMode] = useState<ScheduleMode | null>(null);

  const handleSave = () => {
    if (!id || !scheduleMode) return;

    updateTournamentScheduleMode(id, scheduleMode);

    if (scheduleMode === 'AUTO') {
      navigate(`/tournament/${id}/schedule/auto`);
    } else if (scheduleMode === 'MANUAL') {
      // Navigate to start match flow with tournament context
      navigate(`/start-match?context=tournament&tournamentId=${id}`);
    } else {
      // LATER -> Dashboard
      navigate(`/tournament/${id}`);
    }
  };

  if (!tournament) return <div>Tournament not found</div>;

  return (
    <PageContainer>
      <PageHeader
        title="Schedule"
        description="Create fixtures for this tournament"
        actions={
          <Button
            onClick={handleSave}
            disabled={!scheduleMode}
            variant="primary"
            className="gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        }
      />

      <div className="max-w-2xl mx-auto space-y-6">

        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 uppercase">How do you want to add matches?</label>

          <div className="grid grid-cols-1 gap-3">
            {/* 1. Auto-Generate */}
            <Card
              onClick={() => setScheduleMode('AUTO')}
              className={`p-4 cursor-pointer transition-all flex items-center gap-4 border-2
                ${scheduleMode === 'AUTO'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-transparent hover:border-slate-300'}
              `}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                ${scheduleMode === 'AUTO' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}
              `}>
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-bold ${scheduleMode === 'AUTO' ? 'text-blue-900' : 'text-slate-800'}`}>Auto-generate fixtures</h3>
                <p className="text-xs text-slate-500">Create matches automatically based on teams and format</p>
              </div>
            </Card>

            {/* 2. Manual */}
            <Card
              onClick={() => setScheduleMode('MANUAL')}
              className={`p-4 cursor-pointer transition-all flex items-center gap-4 border-2
                ${scheduleMode === 'MANUAL'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-transparent hover:border-slate-300'}
              `}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                ${scheduleMode === 'MANUAL' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}
              `}>
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-bold ${scheduleMode === 'MANUAL' ? 'text-blue-900' : 'text-slate-800'}`}>Add matches manually</h3>
                <p className="text-xs text-slate-500">Create matches one by one</p>
              </div>
            </Card>

            {/* 3. Later */}
            <Card
              onClick={() => setScheduleMode('LATER')}
              className={`p-4 cursor-pointer transition-all flex items-center gap-4 border-2
                ${scheduleMode === 'LATER'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-transparent hover:border-slate-300'}
              `}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                ${scheduleMode === 'LATER' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}
              `}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-bold ${scheduleMode === 'LATER' ? 'text-blue-900' : 'text-slate-800'}`}>Do this later</h3>
                <p className="text-xs text-slate-500">You can add matches anytime</p>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </PageContainer>
  );
};
