import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { UserPlus, Phone, Share2, Plus } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { Player } from '@/features/players/types/player';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

export const AddPlayerOptionsScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get('teamId');
  const matchId = searchParams.get('matchId');
  const navigate = useNavigate();
  const { addPlayer, addTeamMember } = useGlobalState();

  const [view, setView] = useState<'options' | 'phone'>('options');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleBack = () => {
    if (view === 'phone') {
      setView('options');
    } else {
      navigate(-1);
    }
  };

  const handleAddByPhone = () => {
    if (!name || !phone || !teamId) return;

    const newPlayer: Player = {
      id: `new-${Date.now()}`,
      firstName: name,
      lastName: '',
      active: true,
      status: 'invited',
      // Default stats
      stats: {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        scoreAccumulated: 0
      },
      history: []
    } as Player;

    addPlayer(newPlayer);
    addTeamMember(teamId, {
      playerId: newPlayer.id,
      role: 'member',
      joinedAt: new Date().toISOString()
    });

    navigate(-1);
  };

  const handleAddByContacts = () => {
    // Simulate contact picker
    if (!teamId) return;

    // Simulate picking a contact
    const randomName = "Contact " + Math.floor(Math.random() * 100);
    const newPlayer: Player = {
      id: `contact-${Date.now()}`,
      firstName: randomName,
      lastName: '',
      active: true,
      status: 'invited',
      stats: {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        scoreAccumulated: 0
      },
      history: []
    } as Player;

    addPlayer(newPlayer);
    addTeamMember(teamId, {
      playerId: newPlayer.id,
      role: 'member',
      joinedAt: new Date().toISOString()
    });

    navigate(-1);
  };

  const handleShareLink = () => {
    // Just simulation
    if (navigator.share) {
      navigator.share({
        title: 'Join Team',
        text: 'Join my team on Play Legends!',
        url: window.location.origin + `/join-team?teamId=${teamId}`
      }).catch(console.error);
    } else {
      alert(`Link copied: ${window.location.origin}/join-team?teamId=${teamId}`);
    }
  };

  if (!teamId || !matchId) return <div>Invalid parameters</div>;

  return (
    <PageContainer>
      <PageHeader
        title="Add Player"
        description="Invite players to join your team"
        actions={
          <Button variant="ghost" size="sm" onClick={handleBack}>
            Back
          </Button>
        }
      />

      <div className="max-w-lg mx-auto">
        {view === 'options' ? (
          <div className="space-y-4">
            <Card
              onClick={handleAddByContacts}
              className="p-6 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Add via contacts</h3>
                  <p className="text-sm text-slate-500">Select directly from your phone book</p>
                </div>
              </div>
            </Card>

            <Card
              onClick={() => setView('phone')}
              className="p-6 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Add via phone number</h3>
                  <p className="text-sm text-slate-500">Enter name and mobile number</p>
                </div>
              </div>
            </Card>

            <Card
              onClick={handleShareLink}
              className="p-6 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                  <Share2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Share invite link</h3>
                  <p className="text-sm text-slate-500">Send link via WhatsApp or other apps</p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <Input
                label="Player Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
              />

              <div>
                <Input
                  label="Phone Number"
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  startIcon={Phone}
                  helperText="Enter 10-digit mobile number"
                />
              </div>
            </div>

            <Button
              onClick={handleAddByPhone}
              disabled={!name || !phone}
              variant="primary"
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Player
            </Button>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};
