import { useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Share2, QrCode, SlidersHorizontal, ChevronLeft } from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Player } from '@/features/players/types/player';
import { calculatePlayerStatsFromMatches } from '@/shared/utils/statsCalculator';

// Components
import { GameProfileMatches } from './components/GameProfileMatches';
import { GameProfileStats } from './components/GameProfileStats';
import { GameProfileTeams } from './components/GameProfileTeams';
import { GameProfileHighlights } from './components/GameProfileHighlights';
import { GameProfilePhotos } from './components/GameProfilePhotos';
import { GameProfileFriends } from './components/GameProfileFriends';

type Tab = 'matches' | 'stats' | 'teams' | 'highlights' | 'photos' | 'friends';

const SPORT_NAMES: Record<string, string> = {
  's1': 'Cricket',
  's2': 'Badminton',
  's3': 'Football',
  's4': 'Tennis',
  's5': 'Kabaddi'
};

const getSportName = (id?: string) => id ? (SPORT_NAMES[id] || 'Sports') : 'Sports';

// --- Sub-Components for Clean Architecture ---

import type { NavigateFunction } from 'react-router-dom';
const GameProfileHeader = ({ player, navigate }: { player: Player, navigate: NavigateFunction }) => {
  const sportName = getSportName(player.primarySportId);
  // Default text from image if role not present, or use player's role
  const roleText = player.role 
    ? `${sportName} • ${player.role}` 
    : "Wicket-keeper batter, RHB, Right-arm medium";

  return (
    <div className="relative bg-gradient-to-b from-[#990000] to-black pb-4 pt-safe-top text-white">
      {/* Top Actions Container */}
      <div className="mx-auto max-w-[1200px] px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 transition-all hover:bg-white/10 rounded-full hover:scale-110 active:scale-95">
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/profile/qr')} className="transition-all hover:text-gray-200 hover:scale-110 active:scale-95">
              <QrCode className="h-6 w-6 text-white" />
            </button>
            <button onClick={() => navigate('/coming-soon')} className="transition-all hover:text-gray-200 hover:scale-110 active:scale-95">
              <Share2 className="h-6 w-6 text-white" />
            </button>
            <button onClick={() => navigate('/settings')} className="transition-all hover:text-gray-200 hover:scale-110 active:scale-95">
              <SlidersHorizontal className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content Container */}
      <div className="mx-auto max-w-[1200px] px-4 pt-2 sm:px-5 lg:px-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar 
              src={player.cricketAvatarUrl || player.avatarUrl} 
              fallback={`${player.firstName[0]}${player.lastName[0]}`}
              className="h-20 w-20 rounded-full border-2 border-white/50 object-cover shadow-lg"
            />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-medium text-white truncate">{`${player.firstName} ${player.lastName}`}</h1>
            
            <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
              <span>{player.location || 'Bengaluru (Bangalore)'}</span>
              <span>{player.profileViews || 40} views</span>
            </div>
            
            <div className="text-xs text-gray-300 mt-1 truncate">
              {roleText}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
            <button onClick={() => navigate('/top-players')} className="flex-1 flex items-center justify-center gap-2 bg-[#1a1a1a] border border-[#00bfa5] text-[#00bfa5] py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-[#00bfa5]/10 active:scale-95 hover:shadow-lg hover:shadow-[#00bfa5]/20">
                <span className="text-base animate-pulse">☆</span>
                Top players
            </button>
            <button onClick={() => navigate('/insights')} className="flex-1 flex items-center justify-center gap-2 bg-[#00bfa5] text-white py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-[#00a08b] active:scale-95 hover:shadow-lg hover:shadow-[#00bfa5]/40">
                <span className="text-base">📊</span>
                Insights
            </button>
        </div>
      </div>
    </div>
  );
};

const GameProfileTabs = ({ activeTab, onTabChange }: { activeTab: Tab, onTabChange: (tab: Tab) => void }) => {
  const tabs: { id: Tab, label: string }[] = [
    { id: 'matches', label: 'Matches' },
    { id: 'stats', label: 'Stats' },
    { id: 'teams', label: 'Teams' }, // "Trophies", "Badges" mapped to relevant sections if needed, staying with current structure for now but styling
    { id: 'highlights', label: 'Highlights' },
    { id: 'photos', label: 'Photos' },
    { id: 'friends', label: 'Friends' },
  ];

  return (
    <div className="sticky top-0 z-10 bg-white shadow-sm w-full border-b border-gray-200 overflow-x-auto px-4 no-scrollbar">
      <div className="mx-auto max-w-[1200px] flex min-w-max space-x-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-black border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Main Screen Component ---

export const GameProfileScreen = () => {
  const { userId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, players, matches, teams } = useGlobalState();
  
  const isMeRoute = !userId; 
  
  const player = useMemo(() => {
    // 1. Try finding in players list
    let found = isMeRoute 
      ? players?.find(p => p.userId === currentUser?.id)
      : players?.find(p => p.id === userId);

    // 2. If not found, but it's "Me" and I am logged in, construct from User
    if (!found && isMeRoute && currentUser) {
        found = {
            id: currentUser.id, // Use User ID as fallback Player ID
            userId: currentUser.id,
            firstName: currentUser.name?.split(' ')[0] || 'User',
            lastName: currentUser.name?.split(' ').slice(1).join(' ') || '',
            active: true,
            status: 'active',
            stats: { matchesPlayed: 0, wins: 0, losses: 0, draws: 0, scoreAccumulated: 0 },
            history: [],
            avatarUrl: currentUser.avatarUrl,
            location: currentUser.location,
            role: undefined, // Default to undefined to trigger the "Wicket-keeper..." fallback text
            profileViews: currentUser.profileViews || 0
        } as unknown as Player; // Cast to satisfy type if strictness varies
    }
    
    return found;
  }, [players, isMeRoute, currentUser, userId]);
  
  const playerMatches = useMemo(() => {
    if (!player || !matches) return [];
    try {
        return matches.filter(m => 
            m.homeParticipant?.players?.some(p => p.playerId === player.id) ||
            m.awayParticipant?.players?.some(p => p.playerId === player.id)
        );
    } catch (error) {
        console.error("Error filtering matches:", error);
        return [];
    }
  }, [player, matches]);

  const calculatedStats = useMemo(() => {
    if (!playerMatches || !player) return {
        matchesPlayed: 0, wins: 0, losses: 0, draws: 0, winRate: 0, formGuide: [], bestStreak: 0
    };
    return calculatePlayerStatsFromMatches(playerMatches, player.id);
  }, [playerMatches, player]);

  const playerTeams = useMemo(() => {
    if (!teams || !player) return [];
    return teams.filter(team => team.members.some(m => m.playerId === player.id));
  }, [teams, player]);

  const activeTab = (searchParams.get('tab') as Tab) || 'matches';

  const handleTabChange = (tab: Tab) => {
    setSearchParams({ tab });
  };

  if (!players || !currentUser) {
     return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-500">Loading profile...</p>
            </div>
        </div>
     );
  }

  if (!player) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900">Player Not Found</h2>
                <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">
                    We couldn't find a player profile associated with this account.
                </p>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-medium">Go Back</button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <GameProfileHeader player={player} navigate={navigate} />
      
      <GameProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        
        {/* Mobile Stats Summary */}
        <div className="md:hidden grid grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="text-center">
                <div className="text-xl font-bold text-slate-900">{player.stats?.matchesPlayed || 0}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Matches</div>
            </div>
            <div className="text-center border-l border-slate-100">
                <div className="text-xl font-bold text-slate-900">{player.stats?.wins || 0}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Wins</div>
            </div>
            <div className="text-center border-l border-slate-100">
                <div className="text-xl font-bold text-slate-900">{player.trophies?.length || 0}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Trophies</div>
            </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'matches' && <GameProfileMatches matches={playerMatches} />}
            {activeTab === 'stats' && <GameProfileStats stats={calculatedStats} />}
            {activeTab === 'teams' && <GameProfileTeams teams={playerTeams} playerId={player.id} />}
            {activeTab === 'highlights' && <GameProfileHighlights />}
            {activeTab === 'photos' && <GameProfilePhotos />}
            {activeTab === 'friends' && <GameProfileFriends />}
        </div>

      </div>
    </div>
  );
};
