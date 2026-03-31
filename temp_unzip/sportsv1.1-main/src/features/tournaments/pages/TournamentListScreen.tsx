import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { extractMonthYear } from '@/shared/utils/dateUtils';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Tabs } from '@/shared/components/ui/Tabs';
import { Select } from '@/shared/components/ui/Select';
import { EmptyState } from '@/shared/components/EmptyState';
import { Plus, Trophy, Calendar, MapPin, Users } from 'lucide-react';

export const TournamentListScreen: React.FC = () => {
  const navigate = useNavigate();
  const { tournaments, currentUser } = useGlobalState();

  // Tabs: 'active' (Ongoing), 'upcoming', 'completed'
  const [activeTab, setActiveTab] = useState('ongoing');

  // Filters
  const [gameFilter, setGameFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Helpers
  // const myPlayerId = useMemo(() => players.find(p => p.userId === currentUser?.id)?.id, [players, currentUser]);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t: any) => {
      // Tab Filter
      if (activeTab === 'ongoing' && t.status !== 'ongoing') return false;
      if (activeTab === 'upcoming' && t.status !== 'upcoming') return false;
      if (activeTab === 'completed' && t.status !== 'completed') return false;

      // Search
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;

      // Game Filter
      if (gameFilter !== 'all') {
        const sportId = gameFilter === 'cricket' ? 's1' :
          gameFilter === 'football' ? 's2' :
            gameFilter === 'kabaddi' ? 's3' :
              gameFilter === 'badminton' ? 's4' : '';
        if (sportId && t.sportId !== sportId) return false;
      }

      // Type Filter
      if (typeFilter !== 'all') {
        if (t.level !== typeFilter) return false;
      }

      return true;
    });
  }, [tournaments, activeTab, gameFilter, typeFilter, search]);

  const tabs = [
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Tournaments"
        description="Manage and participate in sports tournaments"
        actions={
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => navigate('/tournament/create')}
          >
            Create Tournament
          </Button>
        }
      />

      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="underline"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tournaments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <Select
          value={gameFilter}
          onChange={(e) => setGameFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Sports' },
            { value: 'cricket', label: 'Cricket' },
            { value: 'football', label: 'Football' },
            { value: 'kabaddi', label: 'Kabaddi' },
            { value: 'badminton', label: 'Badminton' },
          ]}
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'Institute', label: 'Institute' },
            { value: 'City', label: 'City' },
            { value: 'State', label: 'State' },
            { value: 'Country', label: 'Country' },
          ]}
        />
      </div>

      {/* List */}
      <div className="[display:grid] [grid-template-columns:repeat(auto-fill,_minmax(280px,_1fr))] gap-4">
        {filteredTournaments.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={<Trophy size={48} />}
              message="No tournaments found"
              description="Try adjusting your filters or create a new one."
              actionLabel="Create Tournament"
              actionLink="/tournament/create"
            />
          </div>
        ) : (
          filteredTournaments.map((tournament: any) => (
            <Card
              key={tournament.id}
              className="flex flex-col h-full hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/tournaments/${tournament.id}`)}
            >
              <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800 relative p-4">
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium uppercase tracking-wide">
                  {tournament.status}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
                  {tournament.name}
                </h3>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center text-sm text-slate-500">
                    <Calendar size={16} className="mr-2 text-slate-400" />
                    <span>{extractMonthYear(tournament.dates)}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <MapPin size={16} className="mr-2 text-slate-400" />
                    <span>{tournament.location || 'Multiple Venues'}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <Users size={16} className="mr-2 text-slate-400" />
                    <span>{tournament.teams?.length || 0} Teams</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {tournament.structure?.format || 'Standard'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Organized by {tournament.organizerId === currentUser?.id ? 'You' : 'Others'}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </PageContainer>
  );
};
