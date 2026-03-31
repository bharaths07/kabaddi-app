import React from 'react';
import { Match } from '@/features/matches/types/match';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { Card } from '@/shared/components/ui/Card';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { Avatar } from '@/shared/components/ui/Avatar';

interface Props {
  match: Match;
  isFollowed?: boolean;
  className?: string;
  showTournamentContext?: boolean;
  variant?: 'default' | 'horizontal';
}

export const MatchCard: React.FC<Props> = ({ match, className = '', showTournamentContext = true, variant = 'default' }) => {
  const navigate = useNavigate();
  const { tournaments } = useGlobalState();

  const isLive = match.status === 'live';
  const isFinished = match.status === 'completed' || match.status === 'locked' || match.status === 'cancelled';
  const isUpcoming = match.status === 'draft' || match.status === 'scheduled' || match.status === 'created';

  const date = new Date(match.date);
  const timeText = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateText = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  // Resolve Tournament Name
  const tournament = tournaments.find(t => t.id === match.tournamentId);
  const tournamentName = tournament ? tournament.name : "Friendly Match";
  const isFootball = match.sportId === 's3';

  const formatScore = (p: { score?: number; wickets?: number }) => {
    if (p.score === undefined) return '-';
    if (isFootball) return `${p.score}`;
    return p.wickets !== undefined ? `${p.score}/${p.wickets}` : `${p.score}/0`;
  };

  const formatOvers = (p: { overs?: number }) => {
    if (isFootball) return null;
    return p.overs !== undefined ? `${p.overs} ov` : '0.0 ov';
  };

  if (variant === 'horizontal') {
    return (
      <div 
        onClick={() => navigate(`/match/${match.id}`)}
        className={`bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Teams Section */}
          <div className="flex items-center gap-4 flex-1">
            {/* Home Team */}
            <div className="flex items-center gap-3">
              <Avatar 
                fallback={match.homeParticipant.name.charAt(0)}
                className="w-10 h-10 bg-slate-100 text-slate-600 font-bold"
              />
              <div className="text-right">
                <div className="font-bold text-slate-900">{match.homeParticipant.name}</div>
                <div className="text-sm font-medium text-slate-900">{formatScore(match.homeParticipant)}</div>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-400 uppercase px-2">VS</div>

            {/* Away Team */}
            <div className="flex items-center gap-3 flex-row-reverse text-right">
              <Avatar 
                fallback={match.awayParticipant.name.charAt(0)}
                className="w-10 h-10 bg-slate-100 text-slate-600 font-bold"
              />
              <div className="text-left">
                <div className="font-bold text-slate-900">{match.awayParticipant.name}</div>
                <div className="text-sm font-medium text-slate-900">{formatScore(match.awayParticipant)}</div>
              </div>
            </div>
          </div>

          {/* Meta / Status */}
          <div className="flex flex-col items-center md:items-end gap-1 min-w-[140px] border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
             {isLive && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold animate-pulse mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                LIVE
              </span>
            )}
            {!isLive && (
              <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {isFinished ? 'FINISHED' : 'UPCOMING'}
              </div>
            )}
            
            <div className="text-xs text-slate-500 font-medium mt-1">
               {timeText} • {dateText}
            </div>
            {showTournamentContext && (
               <div className="text-xs text-slate-400 truncate max-w-[150px]">
                 {tournamentName}
               </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <Card 
      onClick={() => navigate(`/match/${match.id}`)}
      hoverable
      className={`relative overflow-hidden flex flex-col ${className}`}
    >
      {/* Header: Status & Tournament */}
      <div className="flex justify-between items-start mb-4">
        <div>
          {showTournamentContext && (
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              {tournamentName} {match.stage && <span className="text-slate-400">• {match.stage}</span>}
            </div>
          )}
          {isLive && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              LIVE
            </span>
          )}
          {isFinished && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600">
              FINISHED
            </span>
          )}
          {isUpcoming && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-600">
              UPCOMING
            </span>
          )}
        </div>
        
        {/* Follow Button (Optional) */}
        {/* <button onClick={(e) => { e.stopPropagation(); toggleFollowMatch(match.id); }}>...</button> */}
      </div>

      {/* Teams & Scores */}
      <div className="flex-1 space-y-3">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
              {match.homeParticipant.name.charAt(0)}
            </div>
            <span className={`font-semibold ${match.winnerId === match.homeParticipant.id ? 'text-slate-900' : 'text-slate-600'}`}>
              {match.homeParticipant.name}
            </span>
          </div>
          <div className="text-right">
            <div className="font-bold text-slate-900">
              {formatScore(match.homeParticipant)}
            </div>
            {!isFootball && (
              <div className="text-xs text-slate-500">
                {formatOvers(match.homeParticipant)}
              </div>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
              {match.awayParticipant.name.charAt(0)}
            </div>
            <span className={`font-semibold ${match.winnerId === match.awayParticipant.id ? 'text-slate-900' : 'text-slate-600'}`}>
              {match.awayParticipant.name}
            </span>
          </div>
          <div className="text-right">
            <div className="font-bold text-slate-900">
              {formatScore(match.awayParticipant)}
            </div>
            {!isFootball && (
              <div className="text-xs text-slate-500">
                {formatOvers(match.awayParticipant)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Result / Context */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Calendar size={14} className="text-slate-400" />
          <span>{dateText}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} className="text-slate-400" />
          <span>{timeText}</span>
        </div>
        {match.location && (
          <div className="flex items-center gap-1 ml-auto">
            <MapPin size={14} className="text-slate-400" />
            <span className="truncate max-w-[100px]">{match.location}</span>
          </div>
        )}
      </div>
      
      {isFinished && match.winnerId && (
        <div className="mt-2 text-xs font-medium text-blue-600">
          {match.winnerId === match.homeParticipant.id ? match.homeParticipant.name : match.awayParticipant.name} won
        </div>
      )}
    </Card>
  );
};
