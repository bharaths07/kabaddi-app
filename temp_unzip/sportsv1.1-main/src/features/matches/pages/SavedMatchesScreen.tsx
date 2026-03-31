import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
// import { Button } from '@/shared/components/ui/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { MatchCard } from '@/features/matches/components/MatchCard';

export const SavedMatchesScreen: React.FC = () => {
  const { matches, followedMatches } = useGlobalState();
  const navigate = useNavigate();

  const savedMatchesList = useMemo(() => {
    return matches
        .filter(m => followedMatches.includes(m.id))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [matches, followedMatches]);

  return (
    <PageContainer>
      <PageHeader 
        title="Saved Matches" 
        description="Matches you are following."
      />

      {savedMatchesList.length === 0 ? (
        <EmptyState 
          icon={<Bookmark size={48} />}
          message="No saved matches"
          description="Follow matches to see them here."
          actionLabel="Find Matches"
          onAction={() => navigate('/matches')}
        />
      ) : (
        <div className="space-y-4">
          {savedMatchesList.map(match => (
            <MatchCard key={match.id} match={match} isFollowed={true} />
          ))}
        </div>
      )}
    </PageContainer>
  );
};
