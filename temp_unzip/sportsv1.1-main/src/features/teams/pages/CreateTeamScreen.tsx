import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, Shield } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { Team } from '@/features/teams/types/team';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Button } from '@/shared/components/ui/Button';
import { Avatar } from '@/shared/components/ui/Avatar';
import { SuccessOverlay } from '@/shared/components/ui/SuccessOverlay';
import { supabase } from '@/shared/lib/supabase';

const DEFAULT_SPORTS = [
  { id: 's1', name: 'Cricket' },
  { id: 's2', name: 'Football' },
  { id: 's3', name: 'Kabaddi' },
  { id: 's4', name: 'Badminton' }
];

export const CreateTeamScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addTeam, addTeamToTournament, currentUser } = useGlobalState();

  const context = searchParams.get('context');
  const tournamentId = searchParams.get('tournamentId');
  const gameId = searchParams.get('game');

  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingNavigate, setPendingNavigate] = useState<string | null>(null);

  // Sports Fetching
  const [sports, setSports] = useState<{ id: string; name: string }[]>([]);
  const [selectedSportId, setSelectedSportId] = useState<string>(gameId || '');

  useEffect(() => {
    const fetchSports = async () => {
      try {
        // Note: Assuming 'sports' table exists as per instruction. 
        // If not, we might need to use a hardcoded list temporarily, but instructions say it exists.
        const { data, error } = await supabase
          .from('sports') // Ensure table name is correct (sports or sport?)
          .select('id, name');

        if (error) {
          console.error('Error fetching sports:', error);
          // Fallback for dev if table missing
          setSports(DEFAULT_SPORTS);
        } else if (data) {
          // If Supabase returns empty array (mock mode), use defaults
          const list = Array.isArray(data) && data.length > 0 ? data : DEFAULT_SPORTS;
          setSports(list);
          // Auto-select if gameId matches name or id? 
          // gameId from URL is likely 'cricket' (name) or an ID.
          // Let's try to find a match.
          if (gameId) {
            const match = list.find(s => s.name.toLowerCase() === gameId.toLowerCase() || s.id === gameId);
            if (match) setSelectedSportId(match.id);
          }
        }
      } catch (e) {
        console.error('Fetch sports exception:', e);
        // Hard fallback
        setSports(DEFAULT_SPORTS);
        if (gameId) {
          const match = DEFAULT_SPORTS.find(s => s.name.toLowerCase() === gameId.toLowerCase() || s.id === gameId);
          if (match) setSelectedSportId(match.id);
        }
      }
    };
    fetchSports();
  }, [gameId]);

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [about, setAbout] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sportName = (() => {
    const found = sports.find(s => s.id === selectedSportId);
    if (found) return found.name;
    if (gameId) return gameId.charAt(0).toUpperCase() + gameId.slice(1);
    return '';
  })();
  const goSelectSport = () => {
    const params = new URLSearchParams();
    if (context) params.set('context', context);
    if (tournamentId) params.set('tournamentId', tournamentId);
    navigate(`/teams/create?${params.toString()}`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setLogoUrl(fakeUrl);
    }
  };

  const handleLogoUploadClick = () => {
    document.getElementById('logo-upload')?.click();
  };

  const handleSubmit = async () => {
    if (!name.trim() || !city.trim() || !selectedSportId) return;
    setIsSubmitting(true);

    if (!currentUser) {
      console.error("No current user found");
      setIsSubmitting(false);
      return;
    }
    if (!selectedSportId) {
      console.error("No sport ID selected");
      alert("Please choose a sport from the list before creating your team.");
      setIsSubmitting(false);
      goSelectSport();
      return;
    }

    // Create new team object
    const newTeam: Team = {
      id: `team_${Date.now()}`, // Frontend ID, will be replaced by DB usually, or used as is if UUID gen
      name: name.trim(),
      type: 'club', // Default
      sportId: selectedSportId, // UUID from sports table
      ownerId: currentUser.id,
      active: true,
      members: [],
      createdAt: new Date().toISOString(),
      location: city.trim(),
      about: about.trim(),
      logoUrl: logoUrl || undefined,
    };

    console.log("Creating team with:", {
      name: newTeam.name,
      sport_id: newTeam.sportId,
      owner_id: newTeam.ownerId
    });

    try {
      // Add to global state (which calls backend)
      await addTeam(newTeam);

      // Logic for context
      if (context === 'tournament' && tournamentId) {
        addTeamToTournament(tournamentId, newTeam.id);
        setPendingNavigate(`/tournament/${tournamentId}/teams`);
      } else {
        console.log('[CreateTeam] Direct redirect to team profile:', newTeam.id);
        setPendingNavigate(`/teams/${newTeam.id}?celebrate=true`);
      }
      setShowSuccess(true);
    } catch (error) {
      console.error("Team creation failed", error);
      // Alert handled by provider, but we stop loading state
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = name.trim().length > 0 && city.trim().length > 0 && !!selectedSportId;

  return (
    <PageContainer>
      <SuccessOverlay
        isVisible={showSuccess}
        message="Team created successfully!"
        onClose={() => pendingNavigate && navigate(pendingNavigate)}
      />
      <PageHeader
        title="Create Team"
        description="Add a new team to your collection"
      />

      <div className="max-w-2xl mx-auto space-y-6 pb-20">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Sport</label>
              {sportName ? (
                <div className="flex items-center justify-between">
                  <div className="h-11 flex items-center px-3 rounded-md border border-slate-300 bg-white text-sm">
                    {sportName}
                  </div>
                  <Button variant="outline" onClick={goSelectSport}>Change</Button>
                </div>
              ) : (
                <Button className="h-11" onClick={goSelectSport}>Choose Sport</Button>
              )}
            </div>

            {/* Team Logo */}
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={handleLogoUploadClick}>
              <input
                type="file"
                id="logo-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                aria-label="Upload Team Logo"
                title="Upload Team Logo"
              />
              {logoUrl ? (
                <div className="relative w-24 h-24">
                  <Avatar src={logoUrl} alt="Logo" size="xl" className="w-full h-full" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                    <Upload className="text-white w-6 h-6" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <Shield className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-sm font-medium">Upload Team Logo</span>
                </div>
              )}
            </div>

            {/* Team Name */}
            <Input
              label="Team Name"
              placeholder="e.g. Mumbai Indians"
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              required
            />

            {/* City */}
            <Input
              label="Home City"
              placeholder="e.g. Mumbai"
              value={city}
              onChange={(e: any) => setCity(e.target.value)}
              required
            />

            {/* About */}
            <Textarea
              label="About Team"
              placeholder="Tell us about your team..."
              value={about}
              onChange={(e: any) => setAbout(e.target.value)}
              rows={3}
            />
          </div>
        </Card>

        <Button
          className="w-full h-12 text-lg"
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          isLoading={isSubmitting}
        >
          Create Team
        </Button>
      </div>
    </PageContainer>
  );
};
