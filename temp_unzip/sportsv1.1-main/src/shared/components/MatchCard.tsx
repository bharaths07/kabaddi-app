import React from 'react';
import { Match, MatchParticipant } from '@/features/matches/types/match';
import { useNavigate } from 'react-router-dom';

interface MatchCardProps {
  match: Match;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const navigate = useNavigate();

  // Helper to format score for a participant
  const getScore = (participant: MatchParticipant) => {
    // If match is draft (upcoming), usually no score, but we handle just in case
    if (match.status === 'draft' && !participant.score) return '';

    const runs = participant.score || 0;
    const wickets = participant.wickets || 0;
    const balls = participant.balls || 0;
    const overs = Math.floor(balls / 6);
    const ballInOver = balls % 6;

    return `${runs}/${wickets} (${overs}.${ballInOver})`;
  };

  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed' || match.status === 'locked';
  const isUpcoming = match.status === 'draft';

  // Determine status text
  let statusText = '';

  if (isLive) {
    statusText = 'LIVE';
  } else if (isCompleted) {
    statusText = 'FINAL';
  } else if (isUpcoming) {
    // Show time for upcoming
    statusText = new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div
      className="match-card p-4 bg-white border-b border-slate-200 cursor-pointer transition-colors hover:bg-slate-50"
      onClick={() => navigate(isLive ? `/live/${match.id}` : `/matches/${match.id}`)}
    >
      {/* A. Match Context (Small, Top) */}
      <div className="flex justify-between text-[11px] text-slate-600 mb-2 font-medium uppercase tracking-[0.5px]">
        <span>{match.location || 'Unknown Location'}</span>
        {/* Optional: Add Tournament Name if available in future */}
      </div>

      {/* B. Teams (Main Focus) & C. Score (Integrated for side-by-side comparison) */}
      <div className="flex items-center justify-between">

        {/* Home Team */}
        <div className="flex-1 flex flex-col">
          <span className="font-semibold text-[15px] text-slate-900">
            {match.homeParticipant.name}
          </span>
          {(isLive || isCompleted) && (
            <span className="text-[14px] font-mono text-slate-700 mt-0.5">
              {getScore(match.homeParticipant)}
            </span>
          )}
        </div>

        {/* VS or Divider */}
        <div className="px-3 text-[12px] text-slate-400 font-medium">
          {isUpcoming ? 'vs' : ''}
        </div>

        {/* Away Team (Right Aligned) */}
        <div className="flex-1 flex flex-col items-end text-right">
          <span className="font-semibold text-[15px] text-slate-900">
            {match.awayParticipant.name}
          </span>
          {(isLive || isCompleted) && (
            <span className="text-[14px] font-mono text-slate-700 mt-0.5">
              {getScore(match.awayParticipant)}
            </span>
          )}
        </div>
      </div>

      {/* C. Status & D. Action Hint (Bottom Row) */}
      <div className="flex justify-between items-center mt-2.5">
        {/* Status */}
        <div className={`${isLive ? 'font-bold text-red-700' : 'font-medium text-slate-700'} text-[12px] flex items-center gap-1.5`}>
          {isLive && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-700 mb-[1px]"></span>
          )}
          {statusText}
          {/* Add result text for completed matches if available */}
          {isCompleted && match.homeParticipant.result && (
            <span className="font-normal text-slate-600 ml-1">
              • {match.homeParticipant.result === 'win' ? match.homeParticipant.name : match.awayParticipant.name} won
            </span>
          )}
        </div>

        {/* D. Action Hint */}
        <div className="text-slate-300 text-[18px] leading-none">
          ›
        </div>
      </div>
    </div>
  );
};
