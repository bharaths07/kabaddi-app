import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Share2, Trophy, Calendar, History, Users, MapPin, UserCircle,
  Heart, Edit, Plus, ArrowRight, Star, Shield, BarChart2, CheckCircle,
  AlertCircle, TrendingUp, Target, Award, Zap
} from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Avatar } from '@/shared/components/ui/Avatar';
import { calculateTeamStatsFromMatches } from '@/shared/utils/statsCalculator';
import { TeamStats, Team } from '../types/team';
import { Match } from '@/features/matches/types/match';
import { Tournament } from '@/features/tournaments/types/tournament';
import { Player } from '@/features/players/types/player';

// ─── Sport Config ──────────────────────────────────────────────────────────────
const SPORTS_MAP: Record<string, { name: string; emoji: string; color: string }> = {
  's1': { name: 'Cricket', emoji: '🏏', color: 'bg-emerald-100 text-emerald-700' },
  's2': { name: 'Football', emoji: '⚽', color: 'bg-blue-100 text-blue-700' },
  's3': { name: 'Badminton', emoji: '🏸', color: 'bg-amber-100 text-amber-700' },
  's4': { name: 'Tennis', emoji: '🎾', color: 'bg-orange-100 text-orange-700' },
  's5': { name: 'Kabaddi', emoji: '🤸', color: 'bg-purple-100 text-purple-700' },
};

type TabType = 'overview' | 'squad' | 'matches' | 'tournaments' | 'stats';

// ─── Sub-components ────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string; value: string | number; sublabel?: string;
  color?: string; icon?: React.ReactNode;
}> = ({ label, value, sublabel, color = 'text-slate-900', icon }) => (
  <Card className="p-5 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</span>
      {icon && <span className="text-slate-300">{icon}</span>}
    </div>
    <div className={`text-3xl font-black leading-none ${color}`}>{value}</div>
    {sublabel && <div className="text-xs text-slate-400 font-medium">{sublabel}</div>}
  </Card>
);

const SectionHeader: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-base font-bold text-slate-800 pl-3 border-l-4 border-slate-800">{title}</h3>
    {action}
  </div>
);

const EmptyCard: React.FC<{ icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }> = ({
  icon, title, description, action
}) => (
  <Card className="p-10 flex flex-col items-center text-center gap-4 bg-slate-50/60">
    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 border border-slate-100">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-slate-700 mb-1">{title}</h4>
      <p className="text-sm text-slate-400 max-w-xs">{description}</p>
    </div>
    {action}
  </Card>
);

// ─── Toast ─────────────────────────────────────────────────────────────────────
const SuccessToast: React.FC<{ visible: boolean }> = ({ visible }) => (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
    <div className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl shadow-slate-900/30 font-semibold text-sm">
      <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
      Team created successfully!
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export const TeamScreen: React.FC = () => {
  const { teamId: id } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { teams, matches, players, tournaments, currentUser, followedTeams, toggleFollowTeam } = useGlobalState();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showToast, setShowToast] = useState(false);

  // Success Toast on create redirect
  const showCelebrate = searchParams.get('celebrate') === 'true';
  useEffect(() => {
    if (showCelebrate) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showCelebrate]);

  const team = teams.find((t: Team) => t.id === id);
  const sport = team ? (SPORTS_MAP[team.sportId] || { name: 'Sports', emoji: '🏅', color: 'bg-slate-100 text-slate-600' }) : null;
  const isOwner = currentUser?.id === team?.ownerId;
  const teamOwner = useMemo(() => players.find((p: Player) => p.id === team?.ownerId), [players, team]);
  const ownerName = teamOwner ? `${teamOwner.firstName} ${teamOwner.lastName}` : (isOwner ? currentUser?.name : 'Coach / Owner');
  const isFollowing = followedTeams.includes(id || '');

  // ── Data Derivation ───────────────────────────────────
  const teamMatches = useMemo(() => {
    if (!team) return [];
    return matches.filter((m: Match) =>
      m.homeParticipant?.id === team.id || m.awayParticipant?.id === team.id
    ).sort((a: Match, b: Match) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [matches, team]);

  const teamStats: TeamStats | null = useMemo(() => {
    if (!team) return null;
    return calculateTeamStatsFromMatches(matches, team.id, team.sportId);
  }, [matches, team]);

  const completedMatches = useMemo(() => teamMatches.filter((m: Match) => m.status === 'completed'), [teamMatches]);
  const upcomingMatches = useMemo(() => teamMatches.filter((m: Match) => m.status === 'draft' || m.status === 'locked' || m.status === 'scheduled'), [teamMatches]);

  const matchesPlayed = teamStats?.matchesPlayed || 0;
  const wins = teamStats?.wins || 0;
  const losses = teamStats?.losses || 0;
  const winRate = teamStats?.winRate || 0;
  const isFootball = team?.sportId === 's2';
  const isCricket = team?.sportId === 's1';

  // Football: Goal Differential
  const goalDiff = teamStats?.goalDifference || 0;

  // Squad
  const squad = useMemo(() => {
    if (!team) return [];
    return (team.members || []).map((member: any) => {
      const p = players.find((pl: Player) => pl.id === member.playerId);
      return {
        ...member,
        name: p ? `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown Player' : 'Unknown Player',
      };
    }).sort((a: any, b: any) => {
      const rank = (r: string) => r === 'captain' ? 0 : r === 'vice-captain' ? 1 : 2;
      return rank(a.role) - rank(b.role);
    });
  }, [team, players]);

  // Tournaments
  const teamTournaments = useMemo(() => {
    if (!team) return [];
    return tournaments.filter((t: Tournament) => t.teams?.includes(team.id));
  }, [tournaments, team]);

  // Top performers (stats tab)
  const topPerformers = useMemo(() => {
    if (!team || squad.length === 0) return [];
    return squad.slice(0, 5); // Simplified — expand later with real stats
  }, [squad, team]);

  // ── Guards ────────────────────────────────────────────
  if (!team) {
    return (
      <PageContainer>
        <EmptyCard
          icon={<Shield size={28} />}
          title="Team Not Found"
          description="This team may have been removed or the link is incorrect."
          action={<Button variant="outline" onClick={() => navigate('/teams')}>Browse Teams</Button>}
        />
      </PageContainer>
    );
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={14} /> },
    { id: 'squad', label: 'Squad', icon: <Users size={14} /> },
    { id: 'matches', label: 'Matches', icon: <Calendar size={14} /> },
    { id: 'tournaments', label: 'Tournaments', icon: <Trophy size={14} /> },
    { id: 'stats', label: 'Stats', icon: <TrendingUp size={14} /> },
  ];

  return (
    <PageContainer>
      <SuccessToast visible={showToast} />

      {/* ═══ 1. IDENTITY HEADER ═══════════════════════════════════════════════ */}
      <Card className="mb-6 overflow-hidden border-slate-100">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-400" />

        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Logo */}
            <div className="relative flex-shrink-0">
              <Avatar
                src={team.logoUrl}
                fallback={team.name ? team.name.substring(0, 2).toUpperCase() : 'TM'}
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-100 border border-slate-200 text-3xl font-black text-slate-600 shadow-sm"
              />
              <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" title="Active" />
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${sport?.color}`}>
                  <span>{sport?.emoji}</span> {sport?.name}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-500 border border-slate-200">
                  {team.type}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight truncate">{team.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-sm text-slate-500">
                {team.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" /> {team.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <UserCircle size={13} className="text-slate-400" />
                  {ownerName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart size={13} className="text-slate-400" />
                  {followedTeams.filter((fid: string) => fid === team.id).length > 0 ? 'You follow this' : `${Math.floor(Math.random() * 80 + 5)} followers`}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isOwner ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 font-semibold border-slate-200 rounded-xl"
                  onClick={() => navigate(`/teams/${team.id}/edit`)}
                >
                  <Edit size={14} /> Edit Team
                </Button>
              ) : (
                <button
                  onClick={() => toggleFollowTeam(team.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${isFollowing
                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <Heart size={14} className={isFollowing ? 'fill-red-500 text-red-500' : ''} />
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
              <button
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
                title="Share team"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* ═══ 2. NAVIGATION TABS ═══════════════════════════════════════════════ */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${activeTab === tab.id
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ 3. TAB CONTENT ═══════════════════════════════════════════════════ */}
      <div className="space-y-6">

        {/* ─── OVERVIEW TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">

            {/* Section A: Quick Stats */}
            <div>
              <SectionHeader title="Season Summary" />
              <div className={`grid gap-4 ${isFootball || isCricket ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'}`}>
                <StatCard label="Played" value={matchesPlayed} icon={<Calendar size={16} />} />
                <StatCard label="Wins" value={wins} color="text-emerald-600" icon={<CheckCircle size={16} />} />
                <StatCard label="Losses" value={losses} color="text-red-500" icon={<AlertCircle size={16} />} />
                <StatCard label="Win Rate" value={`${winRate}%`} color="text-blue-600" sublabel={matchesPlayed === 0 ? 'No matches yet' : undefined} icon={<Target size={16} />} />
                {isFootball && (
                  <StatCard
                    label="Goal Diff"
                    value={goalDiff >= 0 ? `+${goalDiff}` : `${goalDiff}`}
                    color={goalDiff >= 0 ? 'text-emerald-600' : 'text-red-500'}
                    icon={<Zap size={16} />}
                  />
                )}
                {isCricket && (
                  <StatCard
                    label="Runs"
                    value={teamStats?.runsScored || 0}
                    color="text-amber-600"
                    icon={<Zap size={16} />}
                  />
                )}
              </div>
            </div>

            {/* Section B: Recent Matches */}
            <div>
              <SectionHeader
                title="Recent Matches"
                action={
                  <Link to="/create-match">
                    <Button size="sm" variant="outline" className="flex items-center gap-1.5 text-xs rounded-lg border-slate-200">
                      <Plus size={13} /> New Match
                    </Button>
                  </Link>
                }
              />
              {completedMatches.length === 0 ? (
                <EmptyCard
                  icon={<History size={24} />}
                  title="No matches yet"
                  description="Create your first match to start tracking your performance."
                  action={
                    <Link to="/create-match">
                      <Button size="sm" className="flex items-center gap-2 mt-2">
                        <Plus size={14} /> Create Match
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {/* Recent matches logic update */}
                  {completedMatches.slice(0, 5).map((m: Match) => {
                    const isHome = m.homeParticipant?.id === team.id;
                    const opponentPart = isHome ? m.awayParticipant : m.homeParticipant;
                    const opponentTeam = teams.find((t: Team) => t.id === opponentPart?.id);
                    const myScore = isHome ? m.homeParticipant?.score : m.awayParticipant?.score;
                    const oppScore = isHome ? m.awayParticipant?.score : m.homeParticipant?.score;
                    const isWin = m.winnerId === team.id;
                    const isDraw = m.status === 'completed' && !m.winnerId;
                    const result = isWin ? 'W' : isDraw ? 'D' : 'L';
                    const resultColor = isWin
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isDraw
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : 'bg-red-50 text-red-700 border-red-200';

                    return (
                      <Card key={m.id} className="p-4 flex items-center gap-4 hover:shadow-sm transition-shadow border-slate-100">
                        {/* Result badge */}
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border flex-shrink-0 ${resultColor}`}>
                          {result}
                        </span>

                        {/* Opponent Logo */}
                        <Avatar
                          src={opponentTeam?.logoUrl}
                          fallback={opponentPart?.name?.[0] || '?'}
                          className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold"
                        />

                        {/* Opponent Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 text-sm truncate">vs {opponentPart?.name || 'Unknown'}</div>
                          <div className="text-xs text-slate-400">{new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>

                        {/* Score */}
                        <div className="text-sm font-bold text-slate-700 text-right flex-shrink-0">
                          {myScore !== undefined ? myScore : '—'} - {oppScore !== undefined ? oppScore : '—'}
                        </div>

                        {/* View */}
                        <Link to={`/matches/${m.id}`}>
                          <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                            <ArrowRight size={14} />
                          </button>
                        </Link>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section C: About Team */}
            <div>
              <SectionHeader
                title="About"
                action={isOwner ? (
                  <button className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors">
                    <Edit size={12} /> Edit
                  </button>
                ) : undefined}
              />
              <Card className="p-5 border-slate-100">
                <p className="text-slate-600 leading-relaxed text-sm">
                  {team.about || `A dedicated ${sport?.name || 'sports'} collective founded in ${team.foundedYear || new Date().getFullYear()}.`}
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* ─── SQUAD TAB ────────────────────────────────────────────────────── */}
        {activeTab === 'squad' && (
          <div className="space-y-4">
            <SectionHeader
              title={`Squad (${squad.length})`}
              action={isOwner ? (
                <Button size="sm" className="flex items-center gap-1.5 text-xs rounded-lg" onClick={() => navigate(`/teams/${team.id}/edit`)}>
                  <Plus size={13} /> Add Player
                </Button>
              ) : undefined}
            />
            {squad.length === 0 ? (
              <EmptyCard
                icon={<Users size={24} />}
                title="No players yet"
                description="Add players to your squad to start participating in matches and tournaments."
                action={isOwner ? (
                  <Button size="sm" className="mt-2 flex items-center gap-2" onClick={() => navigate(`/teams/${team.id}/edit`)}>
                    <Plus size={14} /> Add Players
                  </Button>
                ) : undefined}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {squad.map(member => {
                  const roleLabel = member.role === 'captain' ? 'Captain' : member.role === 'vice-captain' ? 'Vice Captain' : 'Player';
                  const roleColor = member.role === 'captain' ? 'bg-amber-50 text-amber-700 border-amber-200' : member.role === 'vice-captain' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200';
                  const initials = member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

                  return (
                    <Link to={`/players/${member.playerId}`} key={member.playerId}>
                      <Card className="p-4 flex items-center gap-4 hover:shadow-sm transition-shadow border-slate-100 group">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm border border-slate-200 flex-shrink-0 group-hover:bg-slate-200 transition-colors">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 text-sm truncate">
                            {member.role === 'captain' && <span className="ml-1.5 text-amber-500">©</span>}
                          </div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border mt-1 ${roleColor}`}>
                            {roleLabel}
                          </span>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── MATCHES TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'matches' && (
          <div className="space-y-8">
            {/* Upcoming */}
            <div>
              <SectionHeader
                title="Upcoming"
                action={
                  <Link to="/create-match">
                    <Button size="sm" variant="outline" className="text-xs rounded-lg border-slate-200 flex items-center gap-1.5">
                      <Plus size={12} /> Schedule
                    </Button>
                  </Link>
                }
              />
              {upcomingMatches.length === 0 ? (
                <EmptyCard
                  icon={<Calendar size={24} />}
                  title="No upcoming matches"
                  description="Schedule a match to build your fixture list."
                  action={
                    <Link to="/create-match">
                      <Button size="sm" className="mt-2 flex items-center gap-2">
                        <Plus size={14} /> Schedule Match
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {upcomingMatches.map((m: Match) => {
                    const opponent = m.homeParticipant?.id === team.id ? m.awayParticipant : m.homeParticipant;
                    return (
                      <Card key={m.id} className="p-4 flex items-center gap-4 border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                          <Calendar size={18} className="text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 text-sm">vs {opponent?.name || 'TBD'}</div>
                          <div className="text-xs text-slate-400">{new Date(m.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wide border border-amber-200">
                          Upcoming
                        </span>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Results */}
            <div>
              <SectionHeader title="Past Results" />
              {completedMatches.length === 0 ? (
                <EmptyCard
                  icon={<History size={24} />}
                  title="No completed matches"
                  description="Results will appear here after matches are completed."
                />
              ) : (
                <div className="space-y-2">
                  {completedMatches.map((m: Match) => {
                    const isHome = m.homeParticipant?.id === team.id;
                    const opponentPart = isHome ? m.awayParticipant : m.homeParticipant;
                    const opponentTeam = teams.find((t: Team) => t.id === opponentPart?.id);
                    const myScore = isHome ? m.homeParticipant?.score : m.awayParticipant?.score;
                    const oppScore = isHome ? m.awayParticipant?.score : m.homeParticipant?.score;
                    const isWin = m.winnerId === team.id;
                    const isDraw = !m.winnerId;
                    const result = isWin ? 'WON' : isDraw ? 'DRAW' : 'LOST';
                    const rColor = isWin ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isDraw ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-red-50 text-red-700 border-red-200';

                    return (
                      <Link to={`/matches/${m.id}`} key={m.id}>
                        <Card className="p-4 flex items-center gap-4 hover:shadow-sm transition-shadow border-slate-100 group">
                          <Avatar
                            src={opponentTeam?.logoUrl}
                            fallback={opponentPart?.name?.[0] || '?'}
                            className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 text-sm">vs {opponentPart?.name || 'Unknown'}</div>
                            <div className="text-xs text-slate-400">{new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          </div>
                          <div className="text-sm font-bold text-slate-700 flex-shrink-0">
                            {myScore ?? '—'} - {oppScore ?? '—'}
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${rColor}`}>
                            {result}
                          </span>
                          <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TOURNAMENTS TAB ──────────────────────────────────────────────── */}
        {activeTab === 'tournaments' && (
          <div className="space-y-8">
            <SectionHeader
              title="Tournaments"
              action={
                <Link to="/tournaments">
                  <Button size="sm" className="text-xs rounded-lg flex items-center gap-1.5">
                    <Plus size={12} /> Register
                  </Button>
                </Link>
              }
            />
            {teamTournaments.length === 0 ? (
              <EmptyCard
                icon={<Trophy size={24} />}
                title="Not in any tournament"
                description="Register your team for a tournament to compete and track standings."
                action={
                  <Link to="/tournaments">
                    <Button size="sm" className="mt-2 flex items-center gap-2">
                      <Trophy size={14} /> Browse Tournaments
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {teamTournaments.map((t: Tournament) => (
                  <Link to={`/tournaments/${t.id}`} key={t.id}>
                    <Card className="p-5 flex items-center gap-4 hover:shadow-sm transition-shadow border-slate-100 group">
                      <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                        <Trophy size={20} className="text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">{t.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400">{(t as any).stage || 'Group Stage'} • {t.sportId || 'Multi-sport'}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-xs font-bold text-amber-600">Pos: 4th</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${t.status === 'ongoing'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                        {t.status || 'Active'}
                      </span>
                      <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── STATS TAB ────────────────────────────────────────────────────── */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            {/* Team Aggregates & Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <SectionHeader title="Performance Analytics" />
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Season:</span>
                <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900 transition-all">
                  <option>Current (2026)</option>
                  <option>Season 2025</option>
                  <option>All Time</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Played" value={matchesPlayed} icon={<Calendar size={16} />} />
              <StatCard label="Win Rate" value={`${winRate}%`} color="text-blue-600" icon={<Target size={16} />} />
              <StatCard label="Wins" value={wins} color="text-emerald-600" icon={<CheckCircle size={16} />} />
              {isFootball
                ? <StatCard label="GD" value={goalDiff >= 0 ? `+${goalDiff}` : `${goalDiff}`} color={goalDiff >= 0 ? 'text-emerald-600' : 'text-red-500'} icon={<Zap size={16} />} />
                : <StatCard label="Losses" value={losses} color="text-red-500" icon={<AlertCircle size={16} />} />
              }
            </div>
            {/* Top Performers */}
            <div>
              <SectionHeader title="Top Performers" />
              {topPerformers.length === 0 ? (
                <EmptyCard
                  icon={<Star size={24} />}
                  title="No performers yet"
                  description="Play matches to unlock performance statistics for your squad."
                />
              ) : (
                <div className="space-y-2">
                  {topPerformers.map((member: any, idx: number) => (
                    <Card key={member.playerId} className="p-4 flex items-center gap-4 border-slate-100">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-600 flex-shrink-0">
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 text-sm">{member.name}</div>
                        <div className="text-xs text-slate-400 capitalize">{member.role}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Role</div>
                        <div className="text-sm font-bold text-slate-700 capitalize">{member.role === 'captain' ? '© Captain' : member.role.replace('-', ' ')}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming: Season Filter */}
            <Card className="p-5 border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <Award size={18} className="text-slate-400" />
                <div>
                  <div className="font-semibold text-slate-700 text-sm">Advanced Stats</div>
                  <div className="text-xs text-slate-400">Detailed ball-by-ball and performance analytics — coming soon.</div>
                </div>
              </div>
            </Card>
          </div>
        )}

      </div>

      {/* ═══ Quick Action Bar (Owner only) ════════════════════════════════════ */}
      {isOwner && squad.length === 0 && activeTab === 'overview' && (
        <div className="mt-8 p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-base">Your team is ready — what's next?</p>
            <p className="text-sm text-slate-400">Add players, then schedule your first match.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 rounded-xl text-xs"
              onClick={() => navigate(`/teams/${team.id}/edit`)}
            >
              <Users size={13} className="mr-1.5" /> Add Players
            </Button>
            <Link to="/create-match">
              <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold">
                <Calendar size={13} className="mr-1.5" /> Schedule Match
              </Button>
            </Link>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
