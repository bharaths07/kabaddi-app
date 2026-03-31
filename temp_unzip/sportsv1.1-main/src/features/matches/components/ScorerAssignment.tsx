import React, { useState } from 'react';
import { useGlobalState } from '@/app/AppProviders';
// import { User } from '@/features/players/types/user';

interface ScorerAssignmentProps {
  matchId: string;
}

export const ScorerAssignment: React.FC<ScorerAssignmentProps> = ({ matchId }) => {
  const { 
    users, 
    // matchScorers, 
    assignScorer, 
    removeScorer, 
    getMatchScorers,
    currentUser
  } = useGlobalState();

  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const assignedScorers = getMatchScorers(matchId);
  
  // Filter users who are eligible to score (role='scorer' or 'admin')
  // and not already assigned
  const availableUsers = users.filter(u => 
    (u.role === 'admin') && 
    !assignedScorers.some(as => as.userId === u.id)
  );

  const handleAssign = () => {
    if (selectedUserId) {
      assignScorer(matchId, selectedUserId);
      setSelectedUserId('');
    }
  };

  const handleRemove = (userId: string) => {
    if (window.confirm('Are you sure you want to remove this scorer?')) {
      removeScorer(matchId, userId);
    }
  };

  if (currentUser?.role !== 'admin') {
    return null;
  }

  return (
    <div className="p-5 bg-white rounded-lg border border-slate-200">
      <h3 className="text-lg font-bold mb-4">Manage Scorers</h3>
      
      {/* List Assigned Scorers */}
      <div className="mb-6">
        <h4 className="text-xs text-slate-600 mb-3 uppercase tracking-wide">Assigned Scorers</h4>
        {assignedScorers.length === 0 ? (
          <p className="text-slate-400 italic">No scorers assigned yet.</p>
        ) : (
          <ul className="list-none p-0 m-0">
            {assignedScorers.map(assignment => {
              const user = users.find(u => u.id === assignment.userId);
              if (!user) return null;
              return (
                <li key={assignment.id} className="flex justify-between items-center p-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemove(user.id)}
                    className="text-red-600 bg-transparent border-none cursor-pointer text-sm px-2 py-1 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Assign New Scorer */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <h4 className="text-xs text-slate-600 mb-3 uppercase tracking-wide">Assign New Scorer</h4>
        <div className="flex gap-3">
          <select 
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="flex-1 px-3 py-2 rounded-md border border-slate-300 text-sm"
          >
            <option value="">Select a user...</option>
            {availableUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.role})
              </option>
            ))}
          </select>
          <button 
            onClick={handleAssign}
            disabled={!selectedUserId}
            className={`px-4 py-2 rounded-md text-white text-sm font-medium ${!selectedUserId ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'}`}
          >
            Assign
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Only users with 'scorer' or 'admin' role can be assigned.
        </p>
      </div>
    </div>
  );
};
