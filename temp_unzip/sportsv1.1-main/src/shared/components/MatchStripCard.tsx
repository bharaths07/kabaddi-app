import React from 'react';
import { Match, MatchParticipant } from '@/features/matches/types/match';
import { useNavigate } from 'react-router-dom';

interface MatchStripCardProps {
  match: Match;
}

export const MatchStripCard: React.FC<MatchStripCardProps> = ({ match }) => {
  const navigate = useNavigate();

  const formatScore = (p: MatchParticipant) => {
    const runs = p.score || 0;
    const wickets = p.wickets || 0;
    const balls = p.balls || 0;
    const overs = Math.floor(balls / 6);
    const ballInOver = balls % 6;
    return `${runs}/${wickets} (${overs}.${ballInOver})`;
  };

  const getStateBlock = () => {
    if (match.status === 'live') {
      return (
        <div className="flex justify-between font-semibold">
          <span>{formatScore(match.homeParticipant)}</span>
          <span>{formatScore(match.awayParticipant)}</span>
        </div>
      );
    }
    if (match.status === 'completed' || match.status === 'locked') {
      let resultText = 'Result unavailable';
      if (match.winnerId) {
        const winnerName =
          match.winnerId === match.homeParticipant.id ? match.homeParticipant.name : match.awayParticipant.name;
        resultText = `${winnerName} won`;
      } else if (match.homeParticipant.result && match.awayParticipant.result) {
        if (match.homeParticipant.result === 'draw' || match.awayParticipant.result === 'draw') {
          resultText = 'Match drawn';
        } else {
          const winnerName =
            match.homeParticipant.result === 'win' ? match.homeParticipant.name : match.awayParticipant.name;
          resultText = `${winnerName} won`;
        }
      }
      return <div className="text-slate-700 font-semibold">{resultText}</div>;
    }
    // Upcoming / Draft
    const time = new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const day = new Date(match.date).toLocaleDateString([], { month: 'short', day: 'numeric' });
    return <div className="text-slate-600 font-semibold">{day} · {time}</div>;
  };

  return (
    <div
      onClick={() => navigate(`/match/${match.id}`)}
      className="w-[260px] min-w-[260px] border border-slate-200 rounded-xl p-3.5 bg-white cursor-pointer"
    >
      {/* Tournament / Series (fallback to location) */}
      <div className="text-[11px] text-slate-600 font-bold mb-2">
        {match.location || 'Fixture'}
      </div>

      {/* Teams */}
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-slate-900">{match.homeParticipant.name}</span>
        <span className="text-slate-400 text-[12px]">vs</span>
        <span className="font-bold text-slate-900">{match.awayParticipant.name}</span>
      </div>

      {/* Single state block */}
      {getStateBlock()}
    </div>
  );
};
