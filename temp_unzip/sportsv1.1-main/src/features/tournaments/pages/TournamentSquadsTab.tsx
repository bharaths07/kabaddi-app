import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { Avatar } from '@/shared/components/ui/Avatar';

interface SquadPlayer {
  id: string;
  name: string;
  role: 'Batter' | 'Bowler' | 'All-Rounder' | 'Wicket Keeper';
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  avatarUrl?: string;
}

interface TeamSquad {
  id: string;
  name: string;
  code: string;
  logo: string;
  squadSize: number;
  coach?: string;
  captainName?: string;
  note?: string;
  players: SquadPlayer[];
}

interface TournamentSquadsTabProps {
  initialSelectedTeamId?: string;
}

export const TournamentSquadsTab: React.FC<TournamentSquadsTabProps> = ({ initialSelectedTeamId }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tournaments, teams: allTeams, players: allPlayers } = useGlobalState();

  const tournament = tournaments.find(t => t.id === id);

  // Derive Squads from Real Data
  const squads: TeamSquad[] = useMemo(() => {
    if (!tournament || !tournament.teams) return [];

    const tournamentTeams = allTeams.filter(t => tournament.teams?.includes(t.id));

    return tournamentTeams.map(team => {
      // Map members to players
      const squadPlayers: SquadPlayer[] = team.members.map(member => {
        const playerProfile = allPlayers.find(p => p.id === member.playerId);

        // Map backend role to UI role
        let uiRole: SquadPlayer['role'] = 'All-Rounder';
        if (playerProfile?.role === 'Batsman') uiRole = 'Batter';
        else if (playerProfile?.role === 'Bowler') uiRole = 'Bowler';
        else if (playerProfile?.role === 'Wicket Keeper') uiRole = 'Wicket Keeper';

        return {
          id: member.playerId,
          name: playerProfile ? `${playerProfile.firstName} ${playerProfile.lastName}` : 'Unknown Player',
          role: uiRole,
          isCaptain: member.role === 'captain',
          isViceCaptain: member.role === 'vice-captain',
          avatarUrl: playerProfile?.avatarUrl
        };
      });

      // Find Captain Name
      const captain = squadPlayers.find(p => p.isCaptain);

      return {
        id: team.id,
        name: team.name,
        code: team.name.substring(0, 3).toUpperCase(), // Fallback code
        logo: team.logoUrl || '',
        squadSize: squadPlayers.length,
        coach: team.coach,
        captainName: captain?.name,
        note: team.achievements?.[0]?.title, // Use most recent achievement as note
        players: squadPlayers
      };
    });
  }, [tournament, allTeams, allPlayers]);

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(initialSelectedTeamId || (squads.length > 0 ? squads[0].id : null));

  // Update selected team if squads change (e.g. data load) and nothing selected
  React.useEffect(() => {
    if (!selectedTeamId && squads.length > 0) {
      setSelectedTeamId(squads[0].id);
    }
  }, [squads, selectedTeamId]);

  const selectedTeam = squads.find(t => t.id === selectedTeamId) || squads[0];

  if (!tournament) return <div>Tournament not found</div>;

  if (squads.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="text-5xl mb-4">👥</div>
        <h3 className="text-lg font-semibold text-slate-900">No Teams Added Yet</h3>
        <p className="text-sm">Teams participating in this tournament will appear here.</p>
      </div>
    );
  }


  // Group players by role for better readability
  const groupedPlayers = {
    'Batters': selectedTeam.players.filter(p => p.role === 'Batter'),
    'Wicket Keepers': selectedTeam.players.filter(p => p.role === 'Wicket Keeper'),
    'All-Rounders': selectedTeam.players.filter(p => p.role === 'All-Rounder'),
    'Bowlers': selectedTeam.players.filter(p => p.role === 'Bowler'),
  };

  const roleOrder = ['Batters', 'Wicket Keepers', 'All-Rounders', 'Bowlers'];

  return (
    <div className="flex flex-col gap-8">

      {/* 1. Team List (Entry Level) */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Participating Teams</h3>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
          {squads.map((team) => {
            const isSelected = team.id === selectedTeamId;
            return (
              <div
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className={`rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center gap-3 ${isSelected
                    ? 'bg-blue-50 border-2 border-blue-600 shadow-md shadow-blue-500/10'
                    : 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
              >
                <Avatar
                  src={team.logo}
                  alt={team.name}
                  fallback="🛡️"
                  className="w-12 h-12 bg-slate-200 text-xl"
                />
                <div className="text-center">
                  <div className="font-bold text-slate-900 text-[15px]">{team.name}</div>
                  <div className="text-xs text-slate-500">{team.squadSize} Players</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Selected Team Details (Master-Detail View) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Team Context Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              src={selectedTeam.logo}
              alt={selectedTeam.name}
              fallback="🛡️"
              className="w-16 h-16 border-2 border-white shadow-sm bg-slate-200 text-2xl"
            />
            <div>
              <h2 className="m-0 text-2xl font-extrabold text-slate-900">{selectedTeam.name}</h2>
              {selectedTeam.note && (
                <div className="mt-1 inline-block bg-sky-100 text-sky-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {selectedTeam.note}
                </div>
              )}
            </div>
          </div>

          <div className="text-right flex flex-col gap-1">
            {selectedTeam.captainName && (
              <div className="text-sm text-slate-600">
                Captain: <span className="font-semibold text-slate-900">{selectedTeam.captainName}</span>
              </div>
            )}
            {selectedTeam.coach && (
              <div className="text-sm text-slate-600">
                Coach: <span className="font-semibold text-slate-900">{selectedTeam.coach}</span>
              </div>
            )}

            {/* 5. Team Page Link */}
            <button
              onClick={() => navigate(`/team/${selectedTeam.id}`)}
              className="mt-2 bg-none border-none text-blue-600 text-xs font-semibold underline text-right p-0"
            >
              View Team Profile →
            </button>
          </div>
        </div>

        {/* 3. Squad List */}
        <div className="p-6">
          {selectedTeam.players.length === 0 ? (
            <div className="text-center p-6 text-slate-400">
              <div className="text-2xl mb-2">🤷‍♂️</div>
              <p>No players added to this team yet.</p>
            </div>
          ) : (
            roleOrder.map((role) => {
              const players = groupedPlayers[role as keyof typeof groupedPlayers];
              if (!players || players.length === 0) return null;

              return (
                <div key={role} className="mb-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
                    {role}
                  </h4>
                  <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
                    {players.map(player => (
                      <div key={player.id} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                        <Avatar
                          src={player.avatarUrl}
                          alt={player.name}
                          fallback={player.name.charAt(0)}
                          className="w-8 h-8 bg-slate-200 text-xs text-slate-500 font-semibold"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                            {player.name}
                            {player.isCaptain && (
                              <span className="bg-slate-900 text-white text-[10px] px-1.5 py-[1px] rounded">C</span>
                            )}
                            {player.role === 'Wicket Keeper' && (
                              <span className="bg-slate-600 text-white text-[10px] px-1.5 py-[1px] rounded">WK</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">{player.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
