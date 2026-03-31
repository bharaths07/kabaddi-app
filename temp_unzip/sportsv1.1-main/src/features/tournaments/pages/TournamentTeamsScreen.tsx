import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, Search, Users, ArrowRight, Share2 } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { Team } from '@/features/teams/types/team';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Avatar } from '@/shared/components/ui/Avatar';

export const TournamentTeamsScreen: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const { tournaments, teams, addTeamToTournament, removeTeamFromTournament } = useGlobalState();

  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showExistingTeamSearch, setShowExistingTeamSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tournament = tournaments.find((t: any) => t.id === tournamentId);

  // Derived state: Get full team objects for added teams
  const addedTeams = (tournament?.teams || []).map((teamId: string) =>
    teams.find((t: any) => t.id === teamId)
  ).filter(Boolean) as Team[];

  const isNextEnabled = addedTeams.length >= 2;

  // Teams available to add (user's teams or all public teams for demo)
  // Filtering out already added teams AND ensuring sportId matches
  const availableTeams = teams.filter((t: any) =>
    t.sportId === tournament?.sportId &&
    !addedTeams.some((at: any) => at.id === t.id) &&
    (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.institutionId?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddExistingTeam = (team: Team) => {
    if (tournamentId) {
      addTeamToTournament(tournamentId, team.id);
      setShowExistingTeamSearch(false);
      setShowAddOptions(false);
    }
  };

  const handleRemoveTeam = (teamId: string) => {
    if (window.confirm('Are you sure you want to remove this team?')) {
      if (tournamentId) {
        removeTeamFromTournament(tournamentId, teamId);
      }
    }
  };

  const handleCreateNewTeam = () => {
    // Pass the tournament's sportId as the 'game' param
    const sportId = tournament?.sportId || 's1';
    navigate(`/teams/setup?game=${sportId}&context=tournament&tournamentId=${tournamentId}`);
  };

  const handleInviteTeam = () => {
    const link = `${window.location.origin}/tournament/${tournamentId}/join-team`;
    if (navigator.share) {
      navigator.share({
        title: `Join ${tournament?.name}`,
        text: 'Register your team for this tournament!',
        url: link,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(link);
      alert('Invite link copied to clipboard!');
    }
  };

  if (!tournament) return <div>Tournament not found</div>;

  return (
    <PageContainer>
      <PageHeader
        title="Add Teams"
        description="Manage participating teams for this tournament"
        actions={
          <Button
            onClick={() => navigate(`/tournament/${tournamentId}/structure`)}
            disabled={!isNextEnabled}
            variant="primary"
            className="gap-2"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        }
      />

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Added Teams List */}
        <Card className="min-h-[300px]">
          {addedTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-slate-900 font-medium">No teams added yet</h3>
                <p className="text-slate-500 text-sm mt-1">Add at least 2 teams to proceed</p>
              </div>
              <Button
                onClick={() => setShowAddOptions(true)}
                variant="outline"
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Team
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Participating Teams ({addedTeams.length})</h3>
                <Button
                  onClick={() => setShowAddOptions(true)}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add More
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {addedTeams.map((team: Team) => (
                  <div key={team.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={team.logoUrl}
                        alt={team.name}
                        fallback={team.name.charAt(0)}
                        className="w-10 h-10 rounded-lg bg-white shadow-sm"
                      />
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{team.name}</h3>
                        <p className="text-xs text-slate-500">{team.institutionId || 'City'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveTeam(team.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove team"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

      </div>

      {/* Add Team Options Modal */}
      {showAddOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl scale-100">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Add Team</h3>
              <button onClick={() => setShowAddOptions(false)} className="p-1 rounded-full hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-2 space-y-1">
              <button
                onClick={() => setShowExistingTeamSearch(true)}
                className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 rounded-xl transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Add existing team</div>
                  <div className="text-xs text-slate-500">Search from your teams or public teams</div>
                </div>
              </button>

              <button
                onClick={handleCreateNewTeam}
                className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 rounded-xl transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Create new team</div>
                  <div className="text-xs text-slate-500">Register a new team for this tournament</div>
                </div>
              </button>

              <button
                onClick={handleInviteTeam}
                className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 rounded-xl transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Invite team via link</div>
                  <div className="text-xs text-slate-500">Share a link to join this tournament</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Existing Team Search Overlay */}
      {showExistingTeamSearch && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in slide-in-from-bottom-10 duration-200">
          <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <button onClick={() => setShowExistingTeamSearch(false)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
                <ArrowRight className="w-6 h-6 text-slate-700 rotate-180" />
              </button>
              <div className="flex-1">
                <Input
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startIcon={Search}
                  autoFocus
                  className="bg-slate-100 border-transparent focus:bg-white focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              {availableTeams.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  {searchQuery ? 'No teams found matching your search.' : 'Type to search for teams.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableTeams.map((team: Team) => (
                    <button
                      key={team.id}
                      onClick={() => handleAddExistingTeam(team)}
                      className="w-full p-3 flex items-center gap-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left group"
                    >
                      <Avatar
                        src={team.logoUrl}
                        alt={team.name}
                        fallback={team.name.charAt(0)}
                        className="w-12 h-12 rounded-lg bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
                      />
                      <div>
                        <h4 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{team.name}</h4>
                        <p className="text-xs text-slate-500">{team.institutionId || 'City'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </PageContainer>
  );
};
