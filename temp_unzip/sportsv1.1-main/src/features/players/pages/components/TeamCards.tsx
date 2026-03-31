import React from 'react';
import { Avatar } from '@/shared/components/ui/Avatar';
import { CurrentTeam, PastTeam } from '@/features/players/types/player';

// --- Current Team Card ---

interface CurrentTeamCardProps {
  team: CurrentTeam;
}

export const CurrentTeamCard: React.FC<CurrentTeamCardProps> = ({ team }) => {
  return (
    <div className="mb-6">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Current Team
      </div>
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Logo */}
        <Avatar
          src={team.logoUrl}
          alt={team.teamName}
          fallback="🛡️"
          className="h-14 w-14 shrink-0 bg-slate-100 text-2xl"
        />

        {/* Details */}
        <div>
          <div className="mb-0.5 text-base font-bold leading-tight text-slate-900">
            {team.teamName}
          </div>
          {team.leagueName && (
            <div className="mb-0.5 text-[13px] text-slate-700">
              {team.leagueName}
            </div>
          )}
          <div className="text-xs text-slate-500">
            Since {team.sinceYear}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Past Team Card ---

interface PastTeamCardProps {
  team: PastTeam;
}

export const PastTeamCard: React.FC<PastTeamCardProps> = ({ team }) => {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-3">
      {/* Logo (Smaller) */}
      <Avatar
        src={team.logoUrl}
        alt={team.teamName}
        fallback={<span className="opacity-50">🛡️</span>}
        className="h-10 w-10 shrink-0 border border-slate-200 bg-slate-50 text-lg"
      />

      {/* Details */}
      <div className="flex-1">
        <div className="mb-0.5 text-sm font-semibold text-slate-700">
          {team.teamName}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{team.leagueName || 'Unknown League'}</span>
          <span className="whitespace-nowrap">{team.fromYear} – {team.toYear}</span>
        </div>
      </div>
    </div>
  );
};

// --- Main Tab Component ---

interface TeamsTabProps {
  currentTeam?: CurrentTeam;
  pastTeams?: PastTeam[];
}

export const TeamsTab: React.FC<TeamsTabProps> = ({ currentTeam, pastTeams }) => {
  const hasPastTeams = pastTeams && pastTeams.length > 0;

  if (!currentTeam && !hasPastTeams) {
    return (
      <div className="px-5 py-16 text-center text-slate-500">
        <div className="mb-2 text-base font-semibold text-slate-600">
          No teams listed
        </div>
        <div className="text-sm">
          Affiliated teams will appear here
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Current Team Section */}
      {currentTeam ? (
        <CurrentTeamCard team={currentTeam} />
      ) : (
        <div className="mb-6 rounded-xl bg-slate-100 p-5 text-center text-sm text-slate-500">
          No current team added
        </div>
      )}

      {/* Past Teams Section */}
      <div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Past Teams
        </div>
        
        {hasPastTeams ? (
          <div className="rounded-xl border border-slate-100 bg-white px-4 py-2 shadow-sm">
            {pastTeams.map((team, index) => (
              <div key={`${team.teamId}-${index}`} className={index === pastTeams.length - 1 ? 'last:border-0' : ''}>
                <PastTeamCard team={team} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-slate-400">
            No past teams
          </div>
        )}
      </div>
    </div>
  );
};

