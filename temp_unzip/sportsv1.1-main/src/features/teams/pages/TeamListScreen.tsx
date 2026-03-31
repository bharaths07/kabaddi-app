import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { Input } from '@/shared/components/ui/Input';
import { Avatar } from '@/shared/components/ui/Avatar';
import { EmptyState } from '@/shared/components/EmptyState';

// Sport ID Mapping
const SPORT_MAP: Record<string, string> = {
  's1': 'Cricket',
  's2': 'Football',
  's3': 'Badminton',
  's4': 'Tennis',
  's5': 'Kabaddi'
};

export const TeamListScreen: React.FC = () => {
  const { teams } = useGlobalState();
  const navigate = useNavigate();

  // -- Filter States --
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('active');

  // -- Filter & Sort Logic --
  const filteredAndSortedTeams = useMemo(() => {
    let result = [...teams];

    // 1. Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(q));
    }

    // 2. Sport
    if (selectedSport !== 'All') {
      const sportId = Object.keys(SPORT_MAP).find(key => SPORT_MAP[key] === selectedSport);
      if (sportId) {
        result = result.filter(t => t.sportId === sportId);
      }
    }

    // 3. Type
    if (selectedType !== 'All') {
      result = result.filter(t => t.type === selectedType);
    }

    // 4. Sort
    result.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'members':
          return (b.members?.length || 0) - (a.members?.length || 0);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'alpha':
          return a.name.localeCompare(b.name);
        case 'active':
        default:
          // Mock "active" as recent creation or random for now
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return result;
  }, [teams, searchQuery, selectedSport, selectedType, sortBy]);

  const sportOptions = [{ value: 'All', label: 'All Sports' }, ...Object.values(SPORT_MAP).map(s => ({ value: s, label: s }))];
  const typeOptions = [
    { value: 'All', label: 'All Types' },
    { value: 'club', label: 'Club' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'street', label: 'Street' },
    { value: 'school', label: 'School' }
  ];
  const sortOptions = [
    { value: 'active', label: 'Recently Active' },
    { value: 'members', label: 'Most Members' },
    { value: 'newest', label: 'Newest First' },
    { value: 'alpha', label: 'A-Z' }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Teams"
        description="Find and join teams, or create your own."
        actions={
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate('/teams/create')}>
            Create Team
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-8 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              startIcon={<Search size={18} className="text-slate-400" />}
              className="w-full"
            />
          </div>
          <Select
            options={sportOptions}
            value={selectedSport}
            onChange={(e: any) => setSelectedSport(e.target.value)}
          />
          <Select
            options={typeOptions}
            value={selectedType}
            onChange={(e: any) => setSelectedType(e.target.value)}
          />
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
          />
        </div>
      </Card>

      {/* Team Grid */}
      {filteredAndSortedTeams.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          message="No teams found"
          description="Try adjusting your filters or search query to find what you're looking for."
          actionLabel="Create New Team"
          onAction={() => navigate('/teams/create')}
        />
      ) : (
        <div className="[display:grid] [grid-template-columns:repeat(auto-fill,_minmax(280px,_1fr))] gap-4">
          {filteredAndSortedTeams.map(team => (
            <Card key={team.id} className="p-6 flex flex-col hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(`/team/${team.id}`)}>
              <div className="flex items-start justify-between mb-4">
                <Avatar
                  src={team.logoUrl}
                  fallback={team.name.charAt(0)}
                  className="w-16 h-16 rounded-xl bg-slate-100 text-2xl font-bold text-slate-600 border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors"
                />
                {team.type && (
                  <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold uppercase">
                    {team.type}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                {team.name}
              </h3>
              <div className="text-sm text-slate-500 mb-4">
                {SPORT_MAP[team.sportId] || 'Unknown Sport'} • {team.location || 'No Location'}
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-1 text-sm text-slate-600 font-medium">
                  <Users size={16} className="text-slate-400" />
                  {team.members.length} Members
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
