import React from 'react';
import { StatsFilters, StatFormat, TimeRange } from '../hooks/useStats';
import { Select } from '@/shared/components/ui/Select';

interface StatsFilterBarProps {
  filters: StatsFilters;
  onFilterChange: (filters: StatsFilters) => void;
}

export const StatsFilterBar: React.FC<StatsFilterBarProps> = ({ filters, onFilterChange }) => {
  const updateFilter = <K extends keyof StatsFilters>(key: K, value: StatsFilters[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-4 flex flex-wrap items-center gap-4 shadow-sm mb-8">
      {/* Sport Filter */}
      <div className="w-full sm:w-48">
        <Select
          value={filters.sportId}
          onChange={(e) => updateFilter('sportId', e.target.value)}
          options={[
            { value: 's1', label: 'Cricket' },
            { value: 's3', label: 'Football' }
          ]}
        />
      </div>

      {/* Format Filter */}
      {filters.sportId !== 's3' && (
        <div className="w-full sm:w-48">
          <Select
            value={filters.format}
            onChange={(e) => updateFilter('format', e.target.value as StatFormat)}
            options={[
              { value: 'all', label: 'All Formats' },
              { value: 't20', label: 'T20' },
              { value: 'odi', label: 'ODI' },
              { value: 'test', label: 'Test' }
            ]}
          />
        </div>
      )}

      {/* Time Range Filter */}
      <div className="w-full sm:w-48">
        <Select
          value={filters.timeRange}
          onChange={(e) => updateFilter('timeRange', e.target.value as TimeRange)}
          options={[
            { value: 'all_time', label: 'All Time' },
            { value: 'last_12_months', label: 'Last 12 Months' }
          ]}
        />
      </div>

      {/* Qualification Toggle */}
      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer ml-auto select-none">
        <input 
          type="checkbox" 
          checked={filters.minQualification}
          onChange={(e) => updateFilter('minQualification', e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
        />
        <span>Min Qualification</span>
      </label>
    </div>
  );
};
