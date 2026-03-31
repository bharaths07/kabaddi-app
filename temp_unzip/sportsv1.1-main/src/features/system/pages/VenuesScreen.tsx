import React, { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { EmptyState } from '@/shared/components/EmptyState';

export const VenuesScreen: React.FC = () => {
  const { matches } = useGlobalState();

  const venues = useMemo(() => {
    const venueMap = new Map<string, number>();
    
    matches.forEach(match => {
      if (match.location) {
        const count = venueMap.get(match.location) || 0;
        venueMap.set(match.location, count + 1);
      }
    });

    return Array.from(venueMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [matches]);

  return (
    <PageContainer>
      <PageHeader 
        title="Venues" 
        description="Locations where matches are played."
      />

      {venues.length === 0 ? (
        <EmptyState 
          icon={<MapPin size={48} />}
          message="No venues found"
          description="Create matches to populate the venues list."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((venue, index) => (
            <Card key={index} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{venue.name}</div>
                  <div className="text-xs text-slate-500">
                    {venue.count} Match{venue.count !== 1 ? 'es' : ''}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
