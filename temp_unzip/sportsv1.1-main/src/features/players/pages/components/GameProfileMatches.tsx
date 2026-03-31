import React from 'react';
import { Match } from '@/features/matches/types/match';
import { useNavigate } from 'react-router-dom';

interface GameProfileMatchesProps {
    matches: Match[];
}

const MatchListItem: React.FC<{ match: Match }> = ({ match }) => {
    const navigate = useNavigate();
    const date = new Date(match.date);
    const dateText = date.toLocaleDateString([], { day: '2-digit', month: 'short', year: '2-digit' });
    // Assuming overs logic or hardcoding for display matching the image if data missing
    const overs = "6 Ov.";
    const location = "Bengaluru (Bangalore)";


    return (
        <div
            onClick={() => navigate(`/matches/${match.id}`)}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-blue-100 hover:scale-[1.01] group"
        >
            {/* Header: Tournament & Result Badge */}
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xs text-gray-500 font-medium truncate max-w-[70%] uppercase tracking-wide group-hover:text-blue-600 transition-colors">
                    {/* Mock Tournament Name if missing in match object or use match.tournamentId */}
                    Final, HASIRUVALLI PANCHAYATH PREMIER LEAGUE
                </h3>
                <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    Result
                </span>
            </div>

            {/* Meta Info */}
            <div className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                <span>{dateText}</span>
                <span>|</span>
                <span>{overs}</span>
                <span>|</span>
                <span className="truncate max-w-[150px]">{location}</span>
            </div>

            {/* Teams & Scores */}
            <div className="space-y-3 mb-4">
                {/* Team 1 */}
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 uppercase truncate max-w-[60%]">
                        {match.homeParticipant.name}
                    </span>
                    <div className="text-sm text-gray-500">
                        <span className="font-medium">52/9</span> <span className="text-xs">(6.0 Ov)</span>
                    </div>
                </div>

                {/* Team 2 (Winner Highlight) */}
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-black uppercase truncate max-w-[60%]">
                        {match.awayParticipant.name}
                    </span>
                    <div className="text-sm text-black font-bold">
                        <span className="font-bold">54/2</span> <span className="text-xs font-normal">(5.0 Ov)</span>
                    </div>
                </div>
            </div>

            {/* Result Text */}
            <div className="text-xs text-gray-500 mb-3 border-b border-gray-100 pb-3">
                {match.awayParticipant.name} won by 8 wickets
            </div>

            {/* Action Links */}
            <div className="flex justify-end gap-4 text-xs font-medium text-[#00bfa5]">
                <button onClick={(e: any) => { e.stopPropagation(); navigate(`/matches/${match.id}/insights`); }} className="hover:underline hover:text-[#008f7a] transition-colors p-1 rounded hover:bg-[#00bfa5]/10">Insights</button>
                <button onClick={(e: any) => { e.stopPropagation(); navigate(`/matches/${match.id}/table`); }} className="hover:underline hover:text-[#008f7a] transition-colors p-1 rounded hover:bg-[#00bfa5]/10">Table</button>
                <button onClick={(e: any) => { e.stopPropagation(); navigate(`/matches/${match.id}/leaderboard`); }} className="hover:underline hover:text-[#008f7a] transition-colors p-1 rounded hover:bg-[#00bfa5]/10">Leaderboard</button>
            </div>
        </div>
    );
};

export const GameProfileMatches: React.FC<GameProfileMatchesProps> = ({ matches }) => {
    // Use mock matches if empty for visualization of the UI
    const displayMatches = matches.length > 0 ? matches : [
        {
            id: 'mock1',
            date: new Date().toISOString(),
            status: 'completed',
            homeParticipant: { id: 't1', name: 'BAJARANGI CRICKETERS BYRANAYAKANAHALLI', type: 'team' },
            awayParticipant: { id: 't2', name: 'SKBC VARADANAYAKANAHALLI', type: 'team' },
            tournamentId: 'tour1',
            sportId: 's1',
            location: 'Bengaluru',
            events: [],
            officials: [],
            createdByUserId: 'mock'
        },
        {
            id: 'tempId',
            url: '',
            caption: 'Uploading...',
            date: new Date().toISOString().split('T')[0],
        } as any,
        {
            id: 'mock2',
            date: new Date().toISOString(),
            status: 'completed',
            homeParticipant: { id: 't3', name: 'GOLDEN BULLS CRICKETERS LAKKAP...', type: 'team' },
            awayParticipant: { id: 't2', name: 'SKBC VARADANAYAKANAHALLI', type: 'team' },
            tournamentId: 'tour1',
            sportId: 's1',
            location: 'Bengaluru',
            events: [],
            officials: [],
            createdByUserId: 'mock'
        }
    ] as Match[];

    return (
        <div className="pb-20">
            {/* Match List */}
            <div className="space-y-2">
                {displayMatches.map((match) => (
                    <MatchListItem key={match.id} match={match} />
                ))}
            </div>
        </div>
    );
};
