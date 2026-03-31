import React, { useState, useEffect, useMemo } from 'react';
import { StatsFilterBar } from '../components/StatsFilterBar';
import { BattingStatsTable } from '../components/BattingStatsTable';
import { BowlingStatsTable } from '../components/BowlingStatsTable';
import { FieldingStatsTable } from '../components/FieldingStatsTable';
import { TeamStatsTable } from '../components/TeamStatsTable';
import { FootballStatsTable } from '../components/FootballStatsTable';
import { StatsInsightsTab } from '../components/StatsInsightsTab';
import { useStats, StatsFilters } from '../hooks/useStats';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Tabs } from '@/shared/components/ui/Tabs';
import { Card } from '@/shared/components/ui/Card';

// import { TabType } from './types'; // Removed unused type definition

export const StatsScreen: React.FC = () => {
  const [filters, setFilters] = useState<StatsFilters>({
    sportId: 's1', // Default Cricket
    format: 'all',
    timeRange: 'all_time',
    minQualification: false
  });

  const [activeTab, setActiveTab] = useState<string>('batting');

  const { battingStats, bowlingStats, fieldingStats, footballStats, teamStats, insights } = useStats(filters);

  const tabs = useMemo(() => {
    if (filters.sportId === 's3') {
      return [
        { id: 'football', label: 'Player Stats' },
        { id: 'teams', label: 'Team Standings' }
      ];
    }
    return [
      { id: 'batting', label: 'Batting' },
      { id: 'bowling', label: 'Bowling' },
      { id: 'fielding', label: 'Fielding' },
      { id: 'teams', label: 'Teams' },
      { id: 'insights', label: 'Insights' }
    ];
  }, [filters.sportId]);

  // Reset active tab if not valid for current sport
  useEffect(() => {
    if (!tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [filters.sportId, tabs, activeTab]);

  return (
    <PageContainer>
      <PageHeader title="Statistics" description="Overview of performance and results" />

      {/* 1. Global Filter Bar (Sticky Top) */}
      <StatsFilterBar filters={filters} onFilterChange={setFilters} />

      {/* 2. Stats Category Tabs */}
      <div className="mb-8 sticky top-[88px] z-10 bg-slate-50/95 backdrop-blur-sm pt-2 -mx-4 px-4 border-b border-slate-200">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="underline"
        />
      </div>

      <section>
        {/* 3. Content Area */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <h2 className="text-lg font-bold text-slate-900">
              {activeTab === 'batting' && 'Batting Statistics'}
              {activeTab === 'bowling' && 'Bowling Statistics'}
              {activeTab === 'fielding' && 'Fielding Statistics'}
              {activeTab === 'football' && 'Player Statistics'}
              {activeTab === 'teams' && 'Team Standings'}
              {activeTab === 'insights' && 'Performance Insights'}
            </h2>
            <span className="text-sm text-slate-500 font-medium">
              Showing {
                activeTab === 'batting' ? battingStats.length :
                  activeTab === 'bowling' ? bowlingStats.length :
                    activeTab === 'fielding' ? fieldingStats.length :
                      activeTab === 'football' ? footballStats.length :
                        activeTab === 'insights' ? insights.length :
                          teamStats.length
              } records
            </span>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'batting' && (
              <BattingStatsTable stats={battingStats} minQualification={filters.minQualification} />
            )}
            {activeTab === 'bowling' && (
              <BowlingStatsTable stats={bowlingStats} minQualification={filters.minQualification} />
            )}
            {activeTab === 'fielding' && (
              <FieldingStatsTable stats={fieldingStats} minQualification={filters.minQualification} />
            )}
            {activeTab === 'football' && (
              <FootballStatsTable stats={footballStats} minQualification={filters.minQualification} />
            )}
            {activeTab === 'teams' && (
              <TeamStatsTable stats={teamStats} minQualification={filters.minQualification} sportId={filters.sportId} />
            )}
            {activeTab === 'insights' && (
              <StatsInsightsTab insights={insights} />
            )}
          </div>
        </Card>
      </section>
    </PageContainer>
  );
};
