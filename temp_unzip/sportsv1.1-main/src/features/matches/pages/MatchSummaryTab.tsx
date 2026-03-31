import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Match } from '@/features/matches/types/match';
// import { getMatchImpactRankings, ImpactScore } from '../../utils/cricketMetrics';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Share, Trophy, Activity } from 'lucide-react';

interface Props {
  match: Match;
  onTabChange: (tab: string) => void;
}

export const MatchSummaryTab: React.FC<Props> = ({ match, onTabChange }) => {
  const navigate = useNavigate();

  // --- 1. Match Status Logic ---
  const statusText = useMemo(() => {
    const isFootball = match.sportId === 's3';
    const isBasketball = match.sportId === 's5';

    if (match.status === 'draft' || match.status === 'locked') {
      const start = new Date(match.date);
      const now = new Date();
      if (now < start) return `Starts at ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      return (isFootball || isBasketball) ? 'Match delayed' : 'Toss delayed';
    }
    if (match.status === 'completed') {
      if (match.winnerId) {
        const winner = match.winnerId === match.homeParticipant.id ? match.homeParticipant.name : match.awayParticipant.name;
        return `${winner} won the match`;
      }
      return isFootball ? 'Match Drawn' : 'Match Tied';
    }

    // Live status with period info
    const period = match.liveState?.currentPeriod || 1;
    if (isFootball) return `${period}${period === 1 ? 'st' : '2nd'} Half in progress`;
    if (isBasketball) return `Quarter ${period} in progress`;
    return 'Match is Live';
  }, [match]);

  // --- 2. Score Snapshot Logic ---
  const isFootball = match.sportId === 's3';
  const isBasketball = match.sportId === 's5';
  const isCricket = match.sportId === 's1';

  const homeScore = match.homeParticipant.score || 0;
  const homeWickets = match.homeParticipant.wickets || 0;
  const homeOvers = match.homeParticipant.overs || 0;

  const awayScore = match.awayParticipant.score || 0;
  const awayWickets = match.awayParticipant.wickets || 0;
  const awayOvers = match.awayParticipant.overs || 0;

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* 1. Status Strip */}
      <div
        onClick={() => match.status === 'live' && onTabChange('comms')}
        className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${match.status === 'live'
            ? 'bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100'
            : 'bg-white border-slate-200'
          }`}
      >
        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${match.status === 'live' ? 'bg-red-500 text-white' :
            (match.status === 'draft' || match.status === 'locked') ? 'bg-amber-500 text-white' :
              'bg-slate-500 text-white'
          }`}>
          {match.status === 'live' ? 'LIVE' : (match.status === 'draft' || match.status === 'locked') ? 'UPCOMING' : 'COMPLETED'}
        </span>
        <span className={`font-semibold text-sm ${match.status === 'live' ? 'text-blue-800' : 'text-slate-600'}`}>
          {statusText}
        </span>
        {match.status === 'live' && <Activity size={16} className="ml-auto text-blue-500 animate-pulse" />}
      </div>

      {/* 2. Score Snapshot Card */}
      <Card
        onClick={() => onTabChange('scorecard')}
        className="cursor-pointer hover:border-blue-300 transition-colors p-6"
      >
        <div className="flex justify-between items-center mb-6">
          {/* Home */}
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900 mb-1">{match.homeParticipant.name}</div>
            <div className="text-3xl font-extrabold text-slate-900 leading-none">
              {(isFootball || isBasketball) ? homeScore : `${homeScore}/${homeWickets}`}
            </div>
            {isCricket && <div className="text-sm font-medium text-slate-500 mt-1">({homeOvers} ov)</div>}
            {isBasketball && <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Points</div>}
          </div>

          <div className="w-px h-16 bg-slate-200 mx-4"></div>

          {/* Away */}
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900 mb-1">{match.awayParticipant.name}</div>
            <div className="text-3xl font-extrabold text-slate-900 leading-none">
              {(isFootball || isBasketball) ? awayScore : `${awayScore}/${awayWickets}`}
            </div>
            {isCricket && <div className="text-sm font-medium text-slate-500 mt-1">({awayOvers} ov)</div>}
            {isBasketball && <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Points</div>}
          </div>
        </div>

        {match.winnerId && (
          <div className="bg-green-50 rounded-lg p-3 flex items-center justify-between border border-green-100">
            <div className="flex items-center gap-2 font-bold text-green-700 text-sm">
              <Trophy size={16} />
              {match.winnerId === match.homeParticipant.id ? match.homeParticipant.name : match.awayParticipant.name} won
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-green-700 hover:text-green-800 hover:bg-green-100 h-7 text-xs"
              onClick={(e) => { e.stopPropagation(); /* Share logic */ }}
            >
              <Share size={14} className="mr-1.5" /> Share
            </Button>
          </div>
        )}
      </Card>

      {/* 3. Highlights / Key Stats (Placeholder for now, can be expanded) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="justify-center h-auto py-4"
          onClick={() => navigate(`/tournament/${match.tournamentId || 't1'}`, { state: { activeTab: 'Points Table' } })}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-slate-900">Points Table</span>
            <span className="text-xs text-slate-500 font-normal">View tournament standings</span>
          </div>
        </Button>
        <Button
          variant="outline"
          className="justify-center h-auto py-4"
          onClick={() => navigate(`/tournament/${match.tournamentId || 't1'}`, { state: { activeTab: 'Leaderboard' } })}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-slate-900">Leaderboard</span>
            <span className="text-xs text-slate-500 font-normal">Top run scorers & wicket takers</span>
          </div>
        </Button>
      </div>

      {/* 4. Match Info (Venue, Toss) */}
      <Card className="p-4 space-y-3">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-2">Match Info</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-500 mb-1">Toss</div>
            <div className="font-medium text-slate-900">
              {match.toss?.winnerTeamId ? (
                <>
                  {match.toss.winnerTeamId === match.homeParticipant.id ? match.homeParticipant.name : match.awayParticipant.name} opt to {match.toss.decision}
                </>
              ) : 'Yet to be decided'}
            </div>
          </div>
          <div>
            <div className="text-slate-500 mb-1">Venue</div>
            <div className="font-medium text-slate-900">{match.location || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-slate-500 mb-1">Date</div>
            <div className="font-medium text-slate-900">{new Date(match.date).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-slate-500 mb-1">Time</div>
            <div className="font-medium text-slate-900">{new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      </Card>

    </div>
  );
};
