import React, { useMemo } from 'react';
import { Match } from '@/features/matches/types/match';
import { MatchCard } from '@/features/matches/components/MatchCard';
import { useGlobalState } from '@/app/AppProviders';

interface TournamentMatchesTabProps {
  matches: Match[];
}

interface StageGroup {
  name: string;
  startDate: number; // For sorting stages
  matches: Match[];
}

export const TournamentMatchesTab: React.FC<TournamentMatchesTabProps> = ({ matches }) => {
  const { followedMatches } = useGlobalState();

  // 1. Group by Stage and Sort Stages
  const stageGroups = useMemo(() => {
    const groups: Record<string, Match[]> = {};

    matches.forEach(match => {
      const stage = match.stage || 'General'; // Default if no stage
      if (!groups[stage]) groups[stage] = [];
      groups[stage].push(match);
    });

    // Convert to array and calculate start date for each stage
    const stageArray: StageGroup[] = Object.keys(groups).map(stage => {
      const stageMatches = groups[stage];
      const startDate = Math.min(...stageMatches.map(m => new Date(m.date).getTime()));
      return {
        name: stage,
        startDate,
        matches: stageMatches
      };
    });

    return stageArray.sort((a, b) => a.startDate - b.startDate);
  }, [matches]);

  // 2. Process Matches inside each Stage (Date Grouping + Sort)
  const processedStages = useMemo(() => {
    return stageGroups.map(stage => {
      // Group by Date within Stage
      const dateGroups: Record<string, Match[]> = {};

      stage.matches.forEach(match => {
        const d = new Date(match.date);
        const dateKey = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
        if (!dateGroups[dateKey]) dateGroups[dateKey] = [];
        dateGroups[dateKey].push(match);
      });

      // Sort dates
      const sortedDates = Object.keys(dateGroups).sort((a, b) => {
        // This assumes date strings are not easily sortable, but we can find a match in the group to get the timestamp
        const matchA = dateGroups[a][0];
        const matchB = dateGroups[b][0];
        return new Date(matchA.date).getTime() - new Date(matchB.date).getTime();
      });

      return {
        ...stage,
        sortedDates,
        dateGroups
      };
    });
  }, [stageGroups]);

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">No matches scheduled</h3>
        <p className="text-slate-500 mt-2">Matches will appear here once the schedule is generated.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {processedStages.map((stage) => (
        <section key={stage.name}>
          {stage.name !== 'General' && (
            <h2 className="text-xl font-bold text-slate-900 mb-4 pl-1 border-l-4 border-blue-600 ml-1">
              {stage.name}
            </h2>
          )}

          <div className="space-y-6">
            {stage.sortedDates.map(dateKey => (
              <div key={dateKey}>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 pl-1">
                  {dateKey}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stage.dateGroups[dateKey].map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      isFollowed={followedMatches.includes(match.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
