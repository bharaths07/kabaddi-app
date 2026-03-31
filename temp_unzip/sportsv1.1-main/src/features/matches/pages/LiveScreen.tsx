import React from 'react';
import { useGlobalState } from '@/app/AppProviders';
import { MatchListCard } from '@/shared/components/MatchListCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { Radio } from 'lucide-react';

export const LiveScreen: React.FC = () => {
  const { matches } = useGlobalState();
  const liveMatches = matches.filter(m => m.status === 'live');

  return (
    <div className="px-5 py-6 max-w-[800px] mx-auto pb-20">
      <section>
        {liveMatches.length > 0 ? (
          <MatchListCard title="Live Matches" matches={liveMatches} />
        ) : (
          <EmptyState
            icon={<Radio size={48} />}
            message="No live matches at the moment"
            description="Matches currently in progress will appear here."
          />
        )}
      </section>
    </div>
  );
}
