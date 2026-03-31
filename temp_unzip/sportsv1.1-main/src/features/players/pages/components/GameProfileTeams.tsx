import React from 'react';
import { Users, Shield, ChevronRight } from 'lucide-react';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Team } from '@/features/teams/types/team';
import { useNavigate } from 'react-router-dom';

interface GameProfileTeamsProps {
  teams: Team[];
  playerId: string;
}

export const GameProfileTeams: React.FC<GameProfileTeamsProps> = ({ teams, playerId }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Create / Join Actions */}
      <div className="flex gap-4">
        <button 
          onClick={() => navigate('/teams/create')}
          className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 transition-colors group text-left"
        >
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Users size={20} />
          </div>
          <h3 className="font-bold text-slate-900">Create Team</h3>
          <p className="text-xs text-slate-500 mt-1">Start your own squad</p>
        </button>
        
        <button 
          onClick={() => navigate('/teams')} // Navigate to team list to join
          className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-green-200 transition-colors group text-left"
        >
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Shield size={20} />
          </div>
          <h3 className="font-bold text-slate-900">Join Team</h3>
          <p className="text-xs text-slate-500 mt-1">Find existing teams</p>
        </button>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 px-1">My Teams</h3>
        
        {teams.length > 0 ? (
          teams.map((team) => {
            const memberRecord = team.members.find(m => m.playerId === playerId);
            const role = memberRecord ? memberRecord.role.charAt(0).toUpperCase() + memberRecord.role.slice(1) : 'Member';
            
            return (
              <div 
                key={team.id} 
                onClick={() => navigate(`/team/${team.id}`)}
                className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <Avatar 
                    src={team.logoUrl} 
                    fallback={team.name[0]} 
                    className="w-14 h-14 rounded-xl bg-slate-100 text-slate-600 font-bold text-xl"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900">{team.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      {/* Sport ID to Name mapping could be improved with a utility, simplistic fallback here */}
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                        {team.sportId === 's1' ? 'Cricket' : 'Sports'}
                      </span>
                      <span>•</span>
                      <span>{role}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden sm:block text-right">
                      <div className="text-sm font-bold text-slate-900">{team.members.length} Members</div>
                      {/* Wins could be calculated if we linked matches to teams fully, defaulting for now */}
                  </div>
                  <ChevronRight size={20} className="text-slate-300" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
             <p className="text-slate-500 text-sm">You haven't joined any teams yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
