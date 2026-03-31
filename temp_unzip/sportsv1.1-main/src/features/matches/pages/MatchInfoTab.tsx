import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Match } from '@/features/matches/types/match';
import { useGlobalState } from '@/app/AppProviders';
import { Card } from '@/shared/components/ui/Card';

interface Props {
  match: Match;
}

const formatCountdown = (dateISO: string) => {
  const now = new Date();
  const start = new Date(dateISO);
  const diffMs = start.getTime() - now.getTime();
  if (diffMs <= 0) return 'Toss delayed';
  const h = Math.floor(diffMs / (1000 * 60 * 60));
  const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `Match starts in ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
};

const computeStatusLine = (match: Match) => {
  if (match.status === 'cancelled') return 'Match abandoned';
  if (match.status === 'live') {
    const hasXI =
      (match.homeParticipant.players && match.homeParticipant.players.length > 0) ||
      (match.awayParticipant.players && match.awayParticipant.players.length > 0);
    return hasXI ? 'Playing XI announced' : 'Match is live';
  }
  if (match.status === 'completed' || match.status === 'locked') {
    return 'Match completed';
  }
  return formatCountdown(match.date);
};

const resultChar = (m: Match, teamId: string) => {
  if (m.status !== 'completed' && m.status !== 'locked') return '•';
  if (!m.winnerId) return 'D';
  return m.winnerId === teamId ? 'W' : 'L';
};

export const MatchInfoTab: React.FC<Props> = ({ match }) => {
  const { matches } = useGlobalState();

  const statusLine = computeStatusLine(match);

  const homeForm = useMemo(() => {
    const list = matches
      .filter(x => x.homeParticipant.id === match.homeParticipant.id || x.awayParticipant.id === match.homeParticipant.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(m => resultChar(m, match.homeParticipant.id));
    return list;
  }, [matches, match.homeParticipant.id]);

  const awayForm = useMemo(() => {
    const list = matches
      .filter(x => x.homeParticipant.id === match.awayParticipant.id || x.awayParticipant.id === match.awayParticipant.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(m => resultChar(m, match.awayParticipant.id));
    return list;
  }, [matches, match.awayParticipant.id]);

  const matchType = match.status === 'draft' ? 'Warm-up' : 'League';
  const pointsAtStake = match.status === 'draft' ? 'No' : 'Yes';
  const tournamentName = match.tournamentId ? 'Tournament Match' : 'Friendly Match';

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white px-4 py-3 rounded-xl font-semibold shadow-sm text-center">
        {statusLine}
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-slate-900 mb-4">Match Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Match Type</div>
            <div className="font-semibold text-slate-900">{matchType}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Points at Stake</div>
            <div className="font-semibold text-slate-900">{pointsAtStake}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Tournament</div>
            <div className="font-semibold text-blue-600">
                {match.tournamentId ? (
                   <Link to={`/tournament/${match.tournamentId}`} className="hover:underline">{tournamentName}</Link>
                ) : 'N/A'}
            </div>
          </div>
           <div>
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Date & Time</div>
            <div className="font-semibold text-slate-900">
                {new Date(match.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>
           <div className="md:col-span-2">
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Venue</div>
            <div className="font-semibold text-slate-900">{match.location || 'Not specified'}</div>
          </div>
        </div>
      </Card>

      {/* Form Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  {match.homeParticipant.name} Form
              </h4>
              <div className="flex gap-2">
                  {homeForm.map((result, i) => (
                      <div key={i} className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${result === 'W' ? 'bg-green-100 text-green-700' : 
                            result === 'L' ? 'bg-red-100 text-red-700' : 
                            'bg-slate-100 text-slate-500'}
                      `}>
                          {result}
                      </div>
                  ))}
                  {homeForm.length === 0 && <span className="text-slate-400 text-sm">No recent matches</span>}
              </div>
          </Card>

          <Card className="p-6">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  {match.awayParticipant.name} Form
              </h4>
              <div className="flex gap-2">
                  {awayForm.map((result, i) => (
                      <div key={i} className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${result === 'W' ? 'bg-green-100 text-green-700' : 
                            result === 'L' ? 'bg-red-100 text-red-700' : 
                            'bg-slate-100 text-slate-500'}
                      `}>
                          {result}
                      </div>
                  ))}
                  {awayForm.length === 0 && <span className="text-slate-400 text-sm">No recent matches</span>}
              </div>
          </Card>
      </div>
    </div>
  );
};
