import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { Avatar } from '@/shared/components/ui/Avatar';

// Sport ID Mapping
const SPORT_MAP: Record<string, string> = {
  's1': 'Cricket',
  's2': 'Football',
  's3': 'Kabaddi',
  's4': 'Badminton'
};

export const MyTeamsScreen: React.FC = () => {
  const { currentUser, players, teams } = useGlobalState();
  const navigate = useNavigate();

  // 1. Find the player profile associated with the current user
  const myPlayer = players.find(p => p.userId === currentUser?.id);

  // 2. Filter teams where the user is a member
  const myTeams = useMemo(() => {
    if (!myPlayer) return [];
    return teams.filter(t => t.members.some(m => m.playerId === myPlayer.id));
  }, [teams, myPlayer]);

  const handleCreateTeam = () => {
    console.log('[MyTeams] Navigating to create team...');
    navigate('/teams/create');
  };

  if (!currentUser) {
    return (
      <PageContainer>
        <PageHeader title="My Teams" description="Manage your squads and memberships." />
        <EmptyState
          icon={<Users size={48} />}
          message="Please log in"
          description="You need to be logged in to view your teams."
          actionLabel="Log In"
          onAction={() => navigate('/login')}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="My Teams"
        description="Teams you are part of."
        actions={
          <Button variant="primary" icon={<Plus size={18} />} onClick={handleCreateTeam}>
            Create Team
          </Button>
        }
      />

      {myTeams.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          message="You haven't joined any teams yet"
          description="Create a new team or join an existing one to get started."
          actionLabel="Create Team"
          onAction={handleCreateTeam}
        />
      ) : (
        <div className="grid [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] gap-[var(--space-4)]">
          {myTeams.map(team => (
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
                {SPORT_MAP[team.sportId] || 'Unknown Sport'} • {team.members.length} Members
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {team.members.find(m => m.playerId === myPlayer?.id)?.role.toUpperCase() || 'MEMBER'}
                </div>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

import { useMemo } from 'react';
