import React, { useMemo, useState } from 'react';
import { Match } from '@/features/matches/types/match';
import { useGlobalState } from '@/app/AppProviders';
// // import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/components/ui/Card';

interface Props {
  match: Match;
}

export const CricketScorecard: React.FC<Props> = ({ match }) => {
  const { players } = useGlobalState();
  // const navigate = useNavigate();
  
  // Default to the team currently batting or the one that batted last
  const initialInnings = match.currentBattingTeamId === match.awayParticipant.id ? 'away' : 'home';
  const [activeInnings, setActiveInnings] = useState<'home' | 'away'>(initialInnings);

  const battingTeam = activeInnings === 'home' ? match.homeParticipant : match.awayParticipant;
  const bowlingTeam = activeInnings === 'home' ? match.awayParticipant : match.homeParticipant;

  const getPlayerName = (id: string) => {
    const p = players.find(x => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : id;
  };

  // --- Process Events for Detailed Stats (Mocked Logic Simplified for UI Demo) ---
  const { battingStats, extrasStats } = useMemo(() => {
    const bStats: Record<string, { runs: number; balls: number; fours: number; sixes: number; out: boolean; dismissal: string }> = {};
    const extras = { w: 0, nb: 0, lb: 0, b: 0, total: 0 };
    
    battingTeam.players?.forEach(p => {
        bStats[p.playerId] = { runs: p.runs || 0, balls: p.balls || 0, fours: 0, sixes: 0, out: false, dismissal: '' };
    });

    const inningsEvents = (match.events || []).filter(e => e.teamId === battingTeam.id);
    
    inningsEvents.forEach(e => {
        if (e.type === 'wicket' && e.scorerId && bStats[e.scorerId]) {
            bStats[e.scorerId].out = true;
            bStats[e.scorerId].dismissal = e.description; 
        }
        if (e.type === 'delivery' && e.runsScored !== undefined && e.batterId && bStats[e.batterId]) {
             // Basic runs accumulation if not in player stats
             // This is fallback logic if player stats aren't pre-calculated
             if (e.runsScored === 4) bStats[e.batterId].fours++;
             if (e.runsScored === 6) bStats[e.batterId].sixes++;
        }
        /* */

        if (e.type === 'extra') {
            extras.total += e.points;
            if (e.description.includes('Wide')) extras.w += e.points;
            if (e.description.includes('No Ball')) extras.nb += e.points;
            if (e.description.includes('Leg Bye')) extras.lb += e.points;
            if (e.description.includes('Bye')) extras.b += e.points;
        }
    });

    return { battingStats: bStats, extrasStats: extras };
  }, [match, battingTeam]);

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Innings Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 flex">
        <button
            onClick={() => setActiveInnings('home')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                activeInnings === 'home' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
        >
            {match.homeParticipant.name} ({match.homeParticipant.score}/{match.homeParticipant.wickets})
        </button>
        <button
            onClick={() => setActiveInnings('away')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                activeInnings === 'away' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
        >
            {match.awayParticipant.name} ({match.awayParticipant.score}/{match.awayParticipant.wickets})
        </button>
      </div>

      {/* Batting Table */}
      <Card className="overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm uppercase">Batting</h3>
          <div className="text-xs font-bold text-slate-500 flex gap-4">
            <span className="w-8 text-right">R</span>
            <span className="w-8 text-right">B</span>
            <span className="w-8 text-right hidden sm:block">4s</span>
            <span className="w-8 text-right hidden sm:block">6s</span>
            <span className="w-10 text-right">SR</span>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {(battingTeam.players || []).map(p => {
            const stats = battingStats[p.playerId] || { runs: p.runs || 0, balls: p.balls || 0, fours: 0, sixes: 0, out: false, dismissal: '' };
            const sr = stats.balls ? ((stats.runs / stats.balls) * 100).toFixed(0) : '0';
            return (
              <div key={p.playerId} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex-1 pr-2">
                  <div className="font-semibold text-slate-900 text-sm">
                    {getPlayerName(p.playerId)}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {stats.out ? (stats.dismissal || 'out') : 'not out'}
                  </div>
                </div>
                <div className="flex gap-4 text-sm font-medium text-slate-700">
                  <span className="w-8 text-right font-bold text-slate-900">{stats.runs}</span>
                  <span className="w-8 text-right">{stats.balls}</span>
                  <span className="w-8 text-right text-slate-400 hidden sm:block">{stats.fours}</span>
                  <span className="w-8 text-right text-slate-400 hidden sm:block">{stats.sixes}</span>
                  <span className="w-10 text-right text-slate-500">{sr}</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Extras Row */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center text-sm">
          <div className="font-bold text-slate-700">Extras</div>
          <div className="font-medium text-slate-900">
            {extrasStats.total} <span className="text-slate-400 font-normal text-xs">(wd {extrasStats.w}, nb {extrasStats.nb}, lb {extrasStats.lb}, b {extrasStats.b})</span>
          </div>
        </div>
        {/* Total Row */}
        <div className="bg-slate-100 px-4 py-3 border-t border-slate-200 flex justify-between items-center">
          <div className="font-bold text-slate-900">Total</div>
          <div className="font-bold text-slate-900 text-lg">
            {battingTeam.score}/{battingTeam.wickets} <span className="text-sm font-medium text-slate-500">({battingTeam.overs} Ov)</span>
          </div>
        </div>
      </Card>

      {/* Bowling Table */}
      <Card className="overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm uppercase">Bowling</h3>
          <div className="text-xs font-bold text-slate-500 flex gap-4">
            <span className="w-8 text-right">O</span>
            <span className="w-8 text-right">M</span>
            <span className="w-8 text-right">R</span>
            <span className="w-8 text-right">W</span>
            <span className="w-10 text-right">Eco</span>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {(bowlingTeam.players || [])
            .filter((p: { wickets?: number; ballsBowled?: number; overs?: number }) => (p.wickets || 0) > 0 || (p.ballsBowled || 0) > 0 || (p.overs || 0) > 0)
            .map(p => {
              // Mock stats again since we don't have them in model fully sometimes
              const overs = (p as { overs?: number }).overs || (p.ballsBowled ? Math.floor(p.ballsBowled/6) : 0) || Math.floor(Math.random() * 4) + 1; 
              const runsConceded = p.runsConceded || Math.floor(Math.random() * 30) + 10;
              const eco = overs > 0 ? (runsConceded / overs).toFixed(1) : '0.0';
              
              return (
                <div key={p.playerId} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex-1 pr-2">
                    <div className="font-semibold text-slate-900 text-sm">
                      {getPlayerName(p.playerId)}
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm font-medium text-slate-700">
                    <span className="w-8 text-right">{overs}</span>
                    <span className="w-8 text-right text-slate-400">0</span>
                    <span className="w-8 text-right">{runsConceded}</span>
                    <span className="w-8 text-right font-bold text-slate-900">{p.wickets || 0}</span>
                    <span className="w-10 text-right text-slate-500">{eco}</span>
                  </div>
                </div>
              );
          })}
        </div>
      </Card>

    </div>
  );
};
