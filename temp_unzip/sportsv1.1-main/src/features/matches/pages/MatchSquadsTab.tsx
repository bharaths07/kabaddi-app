import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Match } from '@/features/matches/types/match';
import { useGlobalState } from '@/app/AppProviders';
import { Card } from '@/shared/components/ui/Card';
import { Tabs } from '@/shared/components/ui/Tabs';

interface Props {
  match: Match;
}

export const MatchSquadsTab: React.FC<Props> = ({ match }) => {
  const { players, teams } = useGlobalState();
  
  // Initialize with team batting in the latest innings (or home if match just started)
  const initialTeamId = match.currentBattingTeamId || match.homeParticipant.id;
  const [activeTeamId, setActiveTeamId] = useState(initialTeamId);

  // Helper to get team details
  const getTeamDetails = (participantId: string) => {
    return {
      id: participantId,
      name: participantId === match.homeParticipant.id ? match.homeParticipant.name : match.awayParticipant.name,
      participant: participantId === match.homeParticipant.id ? match.homeParticipant : match.awayParticipant
    };
  };

  const activeTeam = getTeamDetails(activeTeamId);
  const homeTeam = getTeamDetails(match.homeParticipant.id);
  const awayTeam = getTeamDetails(match.awayParticipant.id);

  const teamTabs = [
      { id: homeTeam.id, label: homeTeam.name },
      { id: awayTeam.id, label: awayTeam.name }
  ];

  // Helper to find Captain/WK roles from Global Team Data
  const teamData = teams.find(t => t.id === activeTeamId);

  const getPlayerRoleBadge = (playerId: string) => {
    const p = players.find(x => x.id === playerId);
    if (!p || !p.role) return null;
    
    const roleMap: Record<string, string> = {
        'Batsman': 'BAT',
        'Bowler': 'BOWL',
        'All-Rounder': 'AR',
        'Wicket Keeper': 'WK'
    };
    return roleMap[p.role] || p.role.substring(0, 3).toUpperCase();
  };

  const getPlayerLeadership = (playerId: string) => {
    if (!teamData) return null;
    const member = teamData.members.find(m => m.playerId === playerId);
    if (member?.role === 'captain') return 'C';
    return null;
  };

  const getPlayerDetails = (playerId: string) => {
      return players.find(p => p.id === playerId);
  };

  // Get players list from participant or fallback to team data if participant player list is empty (draft mode)
  const playerList = (activeTeam.participant.players && activeTeam.participant.players.length > 0) 
      ? activeTeam.participant.players.map(p => ({ playerId: p.playerId }))
      : (teamData?.members || []);

  return (
    <div className="space-y-6">
      {/* Team Switcher */}
      <Tabs 
        tabs={teamTabs} 
        activeTab={activeTeamId} 
        onTabChange={setActiveTeamId}
        variant="pill"
        className="w-full sm:w-auto"
      />

      {/* Squad List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playerList.map((member) => {
              const player = getPlayerDetails(member.playerId);
              const leadership = getPlayerLeadership(member.playerId);
              const roleBadge = player ? getPlayerRoleBadge(player.id) : null;
              
              if (!player) return null;

              return (
                  <Card key={member.playerId} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                          {player.firstName.charAt(0)}{player.lastName.charAt(0)}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                          <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {player.firstName} {player.lastName}
                              </h4>
                              {leadership && (
                                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold" title="Captain">
                                      {leadership}
                                  </span>
                              )}
                          </div>
                          <div className="text-xs text-slate-500 font-medium mt-0.5">
                              {roleBadge || 'Player'}
                          </div>
                      </div>

                      {/* Batting/Bowling Style (Optional) */}
                      <div className="text-right hidden sm:block">
                          <div className="text-xs text-slate-400">{player.battingStyle || 'RHB'}</div>
                      </div>
                  </Card>
              );
          })}
          
          {playerList.length === 0 && (
              <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
                  No players added to this squad yet.
              </div>
          )}
      </div>
    </div>
  );
};
