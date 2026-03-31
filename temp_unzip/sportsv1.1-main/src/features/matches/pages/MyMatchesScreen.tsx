import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Plus, Calendar } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { MatchCard } from '@/features/matches/components/MatchCard';
import { Tabs } from '@/shared/components/ui/Tabs';

export const MyMatchesScreen: React.FC = () => {
  const { currentUser, players, matches } = useGlobalState();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('upcoming');

  const myPlayer = players.find(p => p.userId === currentUser?.id);

  const myMatches = useMemo(() => {
    if (!currentUser) return [];

    return matches.filter(match => {
      // 1. Created by me
      if (match.createdByUserId === currentUser.id) return true;

      // 2. Official (Umpire/Scorer)
      if (match.officials?.some(o => o.userId === currentUser.id)) return true;

      // 3. Player Participation (if player profile exists)
      if (myPlayer) {
        // Check Squads
        const inHomeSquad = match.homeParticipant.squad?.playerIds?.includes(myPlayer.id);
        const inAwaySquad = match.awayParticipant.squad?.playerIds?.includes(myPlayer.id);
        
        // Check Stats (for legacy/migrated matches)
        const inHomeStats = match.homeParticipant.players?.some(p => p.playerId === myPlayer.id);
        const inAwayStats = match.awayParticipant.players?.some(p => p.playerId === myPlayer.id);

        if (inHomeSquad || inAwaySquad || inHomeStats || inAwayStats) return true;
      }

      return false;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [matches, currentUser, myPlayer]);

  const filteredMatches = useMemo(() => {
    const now = new Date();
    return myMatches.filter(m => {
        const matchDate = new Date(m.date);
        if (activeTab === 'upcoming') {
            return matchDate > now || m.status === 'scheduled';
        } else if (activeTab === 'live') {
            return m.status === 'live';
        } else {
            return m.status === 'completed' || matchDate < now;
        }
    });
  }, [myMatches, activeTab]);

  const handleCreateMatch = () => {
    navigate('/create-match');
  };

  if (!currentUser) {
    return (
      <PageContainer>
         <PageHeader title="My Matches" description="Your match history and upcoming games." />
         <EmptyState 
            icon={<Activity size={48} />}
            message="Please log in"
            description="You need to be logged in to view your matches."
            actionLabel="Log In"
            onAction={() => navigate('/login')}
         />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="My Matches" 
        description="Matches you've played, scored, or organized."
        actions={
          <Button variant="primary" icon={<Plus size={18} />} onClick={handleCreateMatch}>
            Start Match
          </Button>
        }
      />

      <Tabs 
        tabs={[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'live', label: 'Live' },
            { id: 'history', label: 'History' }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-6"
      />

      {filteredMatches.length === 0 ? (
        <EmptyState 
          icon={<Calendar size={48} />}
          message={`No ${activeTab} matches found`}
          description={activeTab === 'upcoming' ? "You don't have any matches scheduled." : "No match history found."}
          actionLabel="Start a Match"
          onAction={handleCreateMatch}
        />
      ) : (
        <div className="space-y-4">
          {filteredMatches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </PageContainer>
  );
};
