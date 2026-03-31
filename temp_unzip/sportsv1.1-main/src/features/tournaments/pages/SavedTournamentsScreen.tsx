import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { Card } from '@/shared/components/ui/Card';

export const SavedTournamentsScreen: React.FC = () => {
  const { tournaments, followedTournaments } = useGlobalState();
  const navigate = useNavigate();

  const savedTournamentsList = useMemo(() => {
    return tournaments
      .filter(t => followedTournaments.includes(t.id))
      .sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime());
  }, [tournaments, followedTournaments]);

  return (
    <PageContainer>
      <PageHeader
        title="Saved Tournaments"
        description="Tournaments you are following."
      />

      {savedTournamentsList.length === 0 ? (
        <EmptyState
          icon={<Trophy size={48} />}
          message="No saved tournaments"
          description="Follow tournaments to track their progress here."
          actionLabel="Find Tournaments"
          onAction={() => navigate('/tournaments')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedTournamentsList.map(tournament => (
            <Card
              key={tournament.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/tournament/${tournament.id}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-bold text-lg text-slate-900">{tournament.name}</div>
                {tournament.sportId && (
                  <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded uppercase text-slate-500">
                    {tournament.sportId === 's1' ? 'Cricket' : 'Sport'}
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-500 mb-4">
                {tournament.location}
              </div>
              <div className="text-xs text-blue-600 font-medium uppercase">
                View Tournament
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
