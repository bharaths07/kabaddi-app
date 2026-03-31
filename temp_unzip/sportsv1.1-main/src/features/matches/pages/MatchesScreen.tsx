import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { MatchCard } from '@/features/matches/components/MatchCard';
import { Match } from '@/features/matches/types/match';
import { Tournament } from '@/features/tournaments/types/tournament';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Tabs } from '@/shared/components/ui/Tabs';
import { Select } from '@/shared/components/ui/Select';
import { Button } from '@/shared/components/ui/Button';
import { X, Trophy, Layers, Activity } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';

// --- Components ---

// Grouped Matches List
interface GroupedMatchesListProps {
  matches: Match[];
  followedMatches: string[];
  activeTab: string;
  groupByTournament: boolean;
  tournaments: Tournament[];
  followedTournaments: string[];
  onReset: () => void;
  hasFilters: boolean;
}

const GroupedMatchesList: React.FC<GroupedMatchesListProps> = ({
  matches,
  followedMatches,
  activeTab,
  groupByTournament,
  tournaments,
  followedTournaments,
  onReset,
  hasFilters
}) => {
  const navigate = useNavigate();

  // Tournament Grouping Logic
  const tournamentGroups = useMemo(() => {
    if (!groupByTournament) return null;

    const groups: Record<string, Match[]> = {};
    matches.forEach(match => {
      const tId = match.tournamentId || 'other';
      if (!groups[tId]) groups[tId] = [];
      groups[tId].push(match);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'other') return 1;
      if (b === 'other') return -1;

      const tA = tournaments.find(t => t.id === a);
      const tB = tournaments.find(t => t.id === b);

      // Followed Priority
      const isFollowedA = followedTournaments.includes(a);
      const isFollowedB = followedTournaments.includes(b);
      if (isFollowedA && !isFollowedB) return -1;
      if (!isFollowedA && isFollowedB) return 1;

      // Status Priority: Ongoing > Upcoming > Completed
      const statusScore = (s?: string) => {
        if (s === 'ongoing') return 0;
        if (s === 'upcoming') return 1;
        if (s === 'completed') return 2;
        return 3;
      };

      const scoreA = statusScore(tA?.status);
      const scoreB = statusScore(tB?.status);

      return scoreA - scoreB;
    });

    return sortedKeys.map(key => {
      const t = tournaments.find(tour => tour.id === key);
      return {
        id: key,
        name: t?.name || 'Friendly Matches',
        status: t?.status,
        matches: groups[key]
      };
    });
  }, [matches, groupByTournament, tournaments, followedTournaments]);

  // Date Grouping Logic
  const dateGroups = useMemo(() => {
    if (groupByTournament) return null;

    // Define group keys based on tab requirements
    const groups: Record<string, Match[]> = {
      'LIVE NOW': [],
      'TODAY': [],
      'TOMORROW': [],
      'YESTERDAY': [],
      'THIS WEEK': [],
      'LATER': [],
      'EARLIER': []
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    matches.forEach(match => {
      // Special Case: LIVE NOW
      if (match.status === 'live') {
        groups['LIVE NOW'].push(match);
        return;
      }

      // For non-live matches, group by date
      const matchDate = new Date(match.date);
      const matchDateOnly = new Date(matchDate);
      matchDateOnly.setHours(0, 0, 0, 0);

      if (matchDateOnly.getTime() === today.getTime()) {
        groups['TODAY'].push(match);
      } else if (matchDateOnly.getTime() === tomorrow.getTime()) {
        groups['TOMORROW'].push(match);
      } else if (matchDateOnly.getTime() === yesterday.getTime()) {
        groups['YESTERDAY'].push(match);
      } else if (matchDateOnly > tomorrow && matchDateOnly <= nextWeek) {
        groups['THIS WEEK'].push(match);
      } else if (matchDateOnly > nextWeek) {
        groups['LATER'].push(match);
      } else {
        groups['EARLIER'].push(match);
      }
    });

    // Apply sorting within groups
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        // Live matches always stay at top
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (b.status === 'live' && a.status !== 'live') return 1;

        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();

        // Finished matches sort by most recent first
        if (activeTab === 'Finished' || key === 'YESTERDAY' || key === 'EARLIER') {
          return timeB - timeA;
        }

        // Upcoming/Live/Today/Tomorrow sort by start time
        return timeA - timeB;
      });
    });

    return groups;
  }, [matches, activeTab, groupByTournament]);

  if (matches.length === 0) {
    return (
      <EmptyState
        icon={<Activity size={48} />}
        message="No matches found"
        description="Try changing your filters or create a new match."
        actionLabel="Create Match"
        actionLink="/create-match"
      />
    );
  }
  if (matches.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-100 flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
          <Trophy className="w-8 h-8 text-slate-300" />
        </div>
        <div className="text-lg font-semibold text-slate-900">No matches found</div>
        <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your filters or check back later for new matches.</p>
        {hasFilters && (
          <Button
            variant="outline"
            onClick={onReset}
            size="sm"
          >
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  // Render Tournament Groups
  if (groupByTournament && tournamentGroups) {
    return (
      <div className="flex flex-col gap-8">
        {tournamentGroups.map(group => (
          <div key={group.id} className="flex flex-col gap-4">
            {/* Tournament Header */}
            <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3
                  className="text-base font-bold text-slate-900 m-0 cursor-pointer flex items-center hover:text-blue-600 transition-colors"
                  onClick={() => group.id !== 'other' && navigate(`/tournament/${group.id}`)}
                >
                  {group.name}
                  <span className="font-normal text-slate-500 text-sm ml-2">({group.matches.length})</span>
                </h3>
                {group.status && (
                  <span className={`
                     text-[11px] font-bold uppercase px-2 py-0.5 rounded
                     ${group.status === 'ongoing' ? 'bg-red-100 text-red-700' :
                      group.status === 'upcoming' ? 'bg-blue-50 text-blue-600' :
                        'bg-slate-100 text-slate-600'}
                   `}>
                    {group.status === 'ongoing' ? 'Active' : group.status}
                  </span>
                )}
              </div>

              {group.id !== 'other' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/tournament/${group.id}`)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  View Tournament →
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {group.matches.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  isFollowed={followedMatches.includes(match.id)}
                  className="w-full"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render Date Groups (Default)
  let sections: string[] = [];

  if (activeTab === 'Live') {
    sections = ['LIVE NOW'];
  } else if (activeTab === 'Upcoming') {
    sections = ['TODAY', 'TOMORROW', 'THIS WEEK', 'LATER'];
  } else if (activeTab === 'Finished') {
    sections = ['TODAY', 'YESTERDAY', 'EARLIER'];
  } else {
    sections = ['LIVE NOW', 'TODAY', 'TOMORROW', 'THIS WEEK', 'LATER', 'EARLIER'];
  }

  return (
    <div className="flex flex-col gap-8">
      {sections.map(section => {
        const sectionMatches = dateGroups?.[section];
        if (!sectionMatches || sectionMatches.length === 0) return null;

        return (
          <div key={section} className="flex flex-col gap-4">
            <h3 className={`
              text-sm font-bold uppercase tracking-wider sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm py-2
              ${section === 'LIVE NOW' ? 'text-red-600' : 'text-slate-500'}
            `}>
              {section}
            </h3>
            <div
              className="grid [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] gap-[var(--space-4)]"
            >
              {sectionMatches.map((match) => {
                const isFollowed = followedMatches.includes(match.id);
                return (
                  <MatchCard
                    key={match.id}
                    match={match}
                    isFollowed={isFollowed}
                    className="w-full h-full"
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Main Screen ---

export const MatchesScreen: React.FC = () => {
  const { matches, followedMatches, tournaments, followedTournaments, currentUser, getMatchScorers } = useGlobalState();
  const [activeTab, setActiveTab] = useState('Top Matches');

  // Filters
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);
  const [activeFormat, setActiveFormat] = useState('All');
  const [activeLevel, setActiveLevel] = useState('All');
  const [activeTournamentId, setActiveTournamentId] = useState('All');

  const [groupByTournament, setGroupByTournament] = useState(false);

  // Reset filters when tab changes
  useEffect(() => {
    setActiveFormat('All');
    setActiveLevel('All');
    setActiveTournamentId('All');
    setShowFollowedOnly(false);
  }, [activeTab]);

  const hasActiveFilters = activeFormat !== 'All' || activeLevel !== 'All' || activeTournamentId !== 'All' || showFollowedOnly;

  const resetFilters = () => {
    setActiveFormat('All');
    setActiveLevel('All');
    setActiveTournamentId('All');
    setShowFollowedOnly(false);
  };

  const filteredMatches = useMemo(() => {
    let result = [...matches];

    // 1. Tab Context
    if (activeTab === 'Assigned') {
      result = result.filter(m => {
        if (!currentUser) return false;
        const scorers = getMatchScorers(m.id);
        return scorers.some((s: any) => s.userId === currentUser.id);
      });
    } else if (activeTab === 'Live') {
      result = result.filter(m => m.status === 'live');
    } else if (activeTab === 'Upcoming') {
      result = result.filter(m => m.status === 'draft');
    } else if (activeTab === 'Finished') {
      result = result.filter(m => m.status === 'completed' || m.status === 'locked' || m.status === 'cancelled');
    }

    // 2. Filters
    if (showFollowedOnly) {
      result = result.filter(m => followedMatches.includes(m.id));
    }
    if (activeTournamentId !== 'All') {
      result = result.filter(m => m.tournamentId === activeTournamentId);
    }
    if (activeFormat !== 'All') {
      // Map format name to logic (simplified for now)
      // Assuming 'Cricket', 'Football' are sports, or formats like 'T20'
      // This logic might need to be adjusted based on actual data
      const sportId = activeFormat === 'Cricket' ? 's1' :
        activeFormat === 'Football' ? 's2' :
          activeFormat === 'Kabaddi' ? 's3' :
            activeFormat === 'Badminton' ? 's4' : '';
      if (sportId) result = result.filter(m => m.sportId === sportId);
    }
    // Note: activeLevel filtering implementation depends on match data having level info
    // For now we'll skip it as it wasn't clear in original code where level comes from
    // except maybe tournament metadata, but we'll leave the placeholder

    // Sorting (Top Matches)
    if (activeTab === 'Top Matches') {
      result = result.sort((a, b) => {
        const getScore = (m: Match) => {
          if (m.status === 'live') return 3;
          if (followedMatches.includes(m.id)) return 2.5;
          if (m.status === 'draft') return 2;
          return 1;
        };
        return getScore(b) - getScore(a);
      });
    }

    return result;
  }, [matches, activeTab, activeFormat, activeTournamentId, showFollowedOnly, followedMatches, currentUser, getMatchScorers]);

  const tabs = [
    { id: 'Top Matches', label: 'Top Matches' },
    { id: 'Live', label: 'Live' },
    { id: 'Upcoming', label: 'Upcoming' },
    { id: 'Finished', label: 'Finished' },
    ...(currentUser ? [{ id: 'Assigned', label: 'Assigned' }] : [])
  ];

  return (
    <PageContainer>
      <PageHeader title="Matches" description="Live scores, upcoming fixtures, and results" />

      {/* Tabs */}
      <div className="mb-8">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="underline"
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Sport"
          value={activeFormat}
          onChange={(e) => setActiveFormat(e.target.value)}
          options={[
            { value: 'All', label: 'All Sports' },
            { value: 'Cricket', label: 'Cricket' },
            { value: 'Football', label: 'Football' },
            { value: 'Kabaddi', label: 'Kabaddi' },
            { value: 'Badminton', label: 'Badminton' },
          ]}
        />

        <Select
          label="Tournament"
          value={activeTournamentId}
          onChange={(e) => setActiveTournamentId(e.target.value)}
          options={[
            { value: 'All', label: 'All Tournaments' },
            ...tournaments.map((t: any) => ({ value: t.id, label: t.name }))
          ]}
        />

        <Select
          label="Type"
          value={activeLevel}
          onChange={(e) => setActiveLevel(e.target.value)}
          options={[
            { value: 'All', label: 'All Types' },
            { value: 'Institute', label: 'Institute' },
            { value: 'City', label: 'City' },
            { value: 'State', label: 'State' },
            { value: 'Country', label: 'Country' },
          ]}
        />
      </div>

      <div className="flex flex-col gap-6">

        {/* Matches List Container */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showFollowedOnly}
                  onChange={(e) => setShowFollowedOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Show only followed</span>
              </label>

              {/* Group Toggle */}
              <button
                onClick={() => setGroupByTournament(!groupByTournament)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${groupByTournament ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Layers size={16} />
                {groupByTournament ? 'Grouped by Tournament' : 'Group by Tournament'}
              </button>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-slate-500 hover:text-red-600 h-8"
              >
                <X size={14} className="mr-1.5" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Matches List */}
          <GroupedMatchesList
            matches={filteredMatches}
            followedMatches={followedMatches}
            activeTab={activeTab}
            groupByTournament={groupByTournament}
            tournaments={tournaments}
            followedTournaments={followedTournaments}
            onReset={resetFilters}
            hasFilters={hasActiveFilters}
          />
        </div>

      </div>
    </PageContainer>
  );
};
