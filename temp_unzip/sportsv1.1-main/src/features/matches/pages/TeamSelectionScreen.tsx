import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, MapPin, Users, Trophy, Shield } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { Team } from '@/features/teams/types/team';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Tabs } from '@/shared/components/ui/Tabs';
import { Avatar } from '@/shared/components/ui/Avatar';
import { stringToColor } from '@/shared/utils/colors';

// type Tab = 'your-teams' | 'opponents' | 'add';

export const TeamSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const game = searchParams.get('game') || 'cricket';
  const { slot } = useParams<{ slot: string }>(); // 'A' or 'B'

  const { teams: globalTeams, addTeam, currentUser } = useGlobalState();

  const [activeTab, setActiveTab] = useState<string>('your-teams');
  const [searchQuery, setSearchQuery] = useState('');
  // const [loading, setLoading] = useState(false);

  // Filter teams based on tab and search
  const filteredTeams = globalTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Check if currentUser is a member
    const isMyTeam = team.members?.some(m => m.playerId === currentUser?.id);

    if (activeTab === 'your-teams') return isMyTeam && matchesSearch;
    if (activeTab === 'opponents') return !isMyTeam && matchesSearch;
    return false;
  });

  const handleTeamSelect = (team: Team) => {
    // Simulate slight delay for interaction feedback
    setTimeout(() => {
      const currentParams = new URLSearchParams(searchParams);
      if (slot === 'A') {
        currentParams.set('teamA', team.id);
      } else {
        currentParams.set('teamB', team.id);
      }
      navigate(`/start-match/select-teams?${currentParams.toString()}`);
    }, 300);
  };

  const handleAddTeam = (newTeam: Partial<Team>) => {
    const team: Team = {
      id: `t${Date.now()}`,
      name: newTeam.name || 'New Team',
      type: 'club',
      active: true,
      createdAt: new Date().toISOString(),
      members: currentUser ? [{ playerId: currentUser.id, role: 'captain', joinedAt: new Date().toISOString() }] : [],
      sportId: game === 'football' ? 's3' : 's1',
      ...newTeam
    } as Team;

    addTeam(team);
    setActiveTab('your-teams');
  };

  return (
    <PageContainer>
      <PageHeader
        title={`Select Team ${slot}`}
        description={`Choose a team for a ${game} match`}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate(`/start-match/select-teams?${searchParams.toString()}`)}>
            Back
          </Button>
        }
      />

      <div className="max-w-5xl mx-auto space-y-6">
        <Tabs
          tabs={[
            { id: 'your-teams', label: 'Your Teams' },
            { id: 'opponents', label: 'Opponents' },
            { id: 'add', label: 'Create New' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="pill"
        />

        {activeTab === 'add' ? (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <AddTeamForm onCancel={() => setActiveTab('your-teams')} onSubmit={handleAddTeam} />
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
            {/* Search Bar */}
            <div className="relative">
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startIcon={Search}
              />
            </div>

            {/* Quick Add Action (Mobile Prominent) */}
            <Button
              onClick={() => setActiveTab('add')}
              variant="outline"
              className="w-full md:hidden flex items-center justify-center gap-2 border-dashed border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <Plus className="h-4 w-4" />
              Create New Team
            </Button>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeams.map((team) => (
                <Card
                  key={team.id}
                  onClick={() => handleTeamSelect(team)}
                  className="group relative cursor-pointer hover:shadow-md transition-all overflow-hidden border-slate-200 hover:border-blue-300"
                >
                  <div className="p-4 flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar
                      src={team.logoUrl}
                      alt={team.name}
                      fallback={team.name.substring(0, 2).toUpperCase()}
                      className={`flex-shrink-0 h-14 w-14 rounded-xl text-xl font-bold shadow-sm ${stringToColor(team.name)}`}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                        {team.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                          <MapPin className="mr-1 h-3 w-3" />
                          Bangalore
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                          <Users className="mr-1 h-3 w-3" />
                          {team.members.length} Players
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Type</span>
                      <span className="text-xs font-semibold text-slate-700 capitalize">{team.type}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Captain</span>
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        {team.captainId ? 'Assigned' : 'None'}
                        {team.captainId && <Shield className="w-3 h-3 text-amber-500" />}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Add New Team Card (Desktop) */}
              <div
                onClick={() => setActiveTab('add')}
                className="hidden md:flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group h-full min-h-[180px]"
              >
                <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all mb-3">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-600 group-hover:text-blue-700">Create New Team</span>
              </div>
            </div>

            {filteredTeams.length === 0 && (
              <div className="mt-16 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No teams found</h3>
                <p className="text-sm text-slate-500 max-w-xs mt-2">
                  Try adjusting your search or create a new team to get started.
                </p>
                <Button
                  onClick={() => setActiveTab('add')}
                  variant="primary"
                  className="mt-6"
                >
                  Create New Team
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

interface AddTeamFormProps {
  onCancel: () => void;
  onSubmit: (team: Partial<Team>) => void;
}

const AddTeamForm: React.FC<AddTeamFormProps> = ({ onCancel, onSubmit }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, about: city });
  };

  return (
    <Card className="max-w-lg mx-auto overflow-hidden">
      <div className="bg-blue-50 p-6 flex flex-col items-center justify-center border-b border-blue-100">
        <div className="relative group cursor-pointer">
          <div className="h-24 w-24 rounded-full bg-white shadow-md flex items-center justify-center text-blue-200 border-4 border-white group-hover:border-blue-200 transition-all">
            <Trophy className="w-10 h-10" />
          </div>
          <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg transform translate-x-1 translate-y-1 group-hover:scale-110 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
        </div>
        <h3 className="mt-4 text-lg font-bold text-blue-900">Create New Team</h3>
        <p className="text-xs text-blue-600/80">Upload logo optional</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <Input
          label="Team Name *"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Royal Challengers"
        />

        <Input
          label="Home Ground / City *"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Chinnaswamy Stadium, Bangalore"
        />

        <div>
          <Input
            label="Contact Number (Optional)"
            type="tel"
            placeholder="98765 43210"
            startIcon={<span className="text-sm font-bold text-slate-500 not-italic">+91</span>}
          />
        </div>

        <div className="pt-4 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!name.trim() || !city.trim()}
            variant="primary"
            className="flex-1"
          >
            Create Team
          </Button>
        </div>
      </form>
    </Card>
  );
};
