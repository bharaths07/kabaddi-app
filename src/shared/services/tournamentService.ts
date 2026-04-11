import { supabase } from '../lib/supabase'
import type { Tournament, TournamentTeam, TournamentFixture } from '../../features/kabaddi/types/kabaddi.types'

/** Supabase Database Types (Internal) **/
interface DBTeam {
  id: string
  name: string
  color?: string
  city?: string
  tournament_id?: string
  tournaments?: { name: string }
  status?: string
}

interface DBPlayer {
  id: string
  name: string
  team_id: string
  number?: number
  role?: string
  teams?: { name: string; color: string }
}

interface DBFixture {
  id: string
  tournament_id: string
  team_home_id: string
  team_guest_id: string
  scheduled_at: string | null
  round: number
  court?: string
  status: string
  result?: string
  home?: { name: string }
  guest?: { name: string }
}

interface DBPlayerMatchStat {
  id: string
  player_id: string
  fixture_id: string
  raid_points: number
  tackle_points: number
  super_raids: number
  super_tackles: number
  total_raids: number
  total_tackles: number
  fixtures: DBFixture
  players?: {
    id: string
    name: string
    role?: string
    teams?: { id: string; name: string; color: string }
  }
}

interface DBEvent {
  id: string
  fixture_id: string
  type: string
  team_id: string
  half: number
  ts: string
  note?: string
}

export async function getTournament(slugOrId: string): Promise<Tournament | null> {
  const column = slugOrId.match(/^[0-9a-fA-F-]{36}$/) ? 'id' : 'slug';
  
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq(column, slugOrId)
      .maybeSingle()

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching tournament:', error)
      return null
    }

    if (!data) return null;

    // Fetch metric counts
    const { count: teamCount } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', data.id)

    const { count: confirmedCount } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', data.id)
      .eq('status', 'confirmed')

    const { count: fixtureCount } = await supabase
      .from('fixtures')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', data.id)

    const { count: completedCount } = await supabase
      .from('fixtures')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', data.id)
      .eq('status', 'completed')

    let status = data.status;
    if (status === 'draft') status = 'Upcoming';
    if (status === 'ongoing') status = 'Live';

    return {
      id: data.id,
      name: data.name,
      venue: data.venue || data.venue_name || 'TBD',
      level: data.level || 'Local',
      status: status as Tournament['status'],
      startDate: data.start_date,
      endDate: data.end_date,
      totalTeams: teamCount || 0,
      confirmedTeams: confirmedCount || 0,
      totalMatches: fixtureCount || 0,
      completedMatches: completedCount || 0,
      joinCode: data.join_code,
    }
  } catch (err) {
    console.error('Unexpected error in getTournament:', err);
    return null;
  }
}

export async function getTeam(teamIdOrSlug: string): Promise<any | null> {
  const isUuid = teamIdOrSlug.match(/^[0-9a-fA-F-]{36}$/);
  
  try {
    let query = supabase.from('teams').select('*, tournaments(name)');
    
    if (isUuid) {
      query = query.eq('id', teamIdOrSlug);
    } else {
      const nameMatch = teamIdOrSlug.replace(/-/g, ' ');
      query = query.ilike('name', nameMatch);
    }

    const { data: team, error: teamError } = await query.maybeSingle() as { data: DBTeam | null, error: any };

    if (teamError || !team) return null;

    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', team.id);

    const { data: fixtures } = await supabase
      .from('fixtures')
      .select(`
        *,
        home: teams!team_home_id (name),
        guest: teams!team_guest_id (name)
      `)
      .or(`team_home_id.eq.${team.id},team_guest_id.eq.${team.id}`) as { data: DBFixture[] | null };

    return {
      ...team,
      tournamentName: team.tournaments?.name,
      squad: players || [],
      fixtures: (fixtures || []).map((f) => ({
        id: f.id,
        opponent: f.team_home_id === team.id ? f.guest?.name : f.home?.name,
        date: f.scheduled_at ? new Date(f.scheduled_at).toLocaleDateString() : '—',
        time: f.scheduled_at ? new Date(f.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        status: f.status,
        score: f.result || '',
        result: f.result ? (f.status === 'completed' ? 'played' : '') : ''
      }))
    };
  } catch (err) {
    console.error('Error fetching team:', err);
    return null;
  }
}

export async function getPlayer(playerIdOrSlug: string): Promise<any | null> {
  const isUuid = playerIdOrSlug.match(/^[0-9a-fA-F-]{36}$/);
  
  try {
    let query = supabase.from('players').select('*, teams(name, color)');
    
    if (isUuid) {
      query = query.eq('id', playerIdOrSlug);
    } else {
      const nameMatch = playerIdOrSlug.replace(/-/g, ' ');
      query = query.ilike('name', nameMatch);
    }

    const { data: player, error: playerError } = await query.maybeSingle() as { data: DBPlayer | null, error: any };

    if (playerError || !player) return null;

    const { data: matchStats, error: statsError } = await supabase
      .from('player_match_stats')
      .select(`
        *,
        fixtures (
          id,
          scheduled_at,
          status,
          result,
          home: teams!team_home_id (name),
          guest: teams!team_guest_id (name)
        )
      `)
      .eq('player_id', player.id) as { data: DBPlayerMatchStat[] | null, error: any };

    if (statsError) console.error('Error fetching player match stats:', statsError);

    const totalMatches = matchStats?.length || 0;
    const totalRaidPts = matchStats?.reduce((sum, s) => sum + (s.raid_points || 0), 0) || 0;
    const totalTacklePts = matchStats?.reduce((sum, s) => sum + (s.tackle_points || 0), 0) || 0;
    const superRaids = matchStats?.reduce((sum, s) => sum + (s.super_raids || 0), 0) || 0;
    const superTackles = matchStats?.reduce((sum, s) => sum + (s.super_tackles || 0), 0) || 0;
    const super10s = matchStats?.filter((s) => (s.raid_points || 0) >= 10).length || 0;
    const high5s = matchStats?.filter((s) => (s.tackle_points || 0) >= 5).length || 0;

    return {
      ...player,
      teamName: player.teams?.name,
      teamColor: player.teams?.color || '#1e293b',
      stats: {
        overall: [
          { label: 'Matches Played', value: totalMatches },
          { label: 'Total Points Earned', value: totalRaidPts + totalTacklePts },
          { label: 'Points Per Match', value: totalMatches > 0 ? ((totalRaidPts + totalTacklePts) / totalMatches).toFixed(1) : 0 },
        ],
        attacking: [
          { label: 'Total Raids', value: matchStats?.reduce((sum, s) => sum + (s.total_raids || 0), 0) || 0 },
          { label: 'No. Of Super Raids', value: superRaids },
          { label: 'Super 10s', value: super10s },
          { label: 'Total Raid Points', value: totalRaidPts },
        ],
        defensive: [
          { label: 'No. Of Super Tackles', value: superTackles },
          { label: 'High 5s', value: high5s },
          { label: 'Total Tackle Points', value: totalTacklePts },
          { label: 'Average Successful Tackles/Match', value: totalMatches > 0 ? (totalTacklePts / totalMatches).toFixed(2) : 0 },
          { label: 'Total Tackles', value: matchStats?.reduce((sum, s) => sum + (s.total_tackles || 0), 0) || 0 },
        ],
        percentages: {
          notOut: 75,
          successRaid: 60,
          successTackle: 30
        }
      },
      matches: (matchStats || []).map((s) => {
        const f = s.fixtures;
        const isHome = f.home?.name === player.teams?.name;
        return {
          id: f.id,
          opponent: isHome ? f.guest?.name : f.home?.name,
          date: f.scheduled_at ? new Date(f.scheduled_at).toLocaleDateString() : '—',
          raidPts: s.raid_points || 0,
          tacklePts: s.tackle_points || 0,
          result: f.result || (f.status === 'completed' ? 'Played' : f.status)
        };
      }),
      achievements: []
    };
  } catch (err) {
    console.error('Error fetching player:', err);
    return null;
  }
}

export async function getTournamentTeams(tournamentId: string): Promise<TournamentTeam[]> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('tournament_id', tournamentId)

    if (error) {
      console.warn('Error fetching tournament teams:', error.message)
      return []
    }

    return (data || []).map((t: DBTeam) => ({
      id: parseInt(t.id) || 0,
      name: t.name,
      color: t.color || '#0ea5e9',
      captain: '—',
      players: 0,
      status: (t.status as TournamentTeam['status']) || 'confirmed',
    }))
  } catch (err) {
    console.error('Unexpected error in getTournamentTeams:', err)
    return []
  }
}

export async function getTournamentFixtures(tournamentId: string): Promise<TournamentFixture[]> {
  try {
    const { data, error } = await supabase
      .from('fixtures')
      .select(`
        *,
        home: teams!team_home_id (name),
        guest: teams!team_guest_id (name)
      `)
      .eq('tournament_id', tournamentId) as { data: DBFixture[] | null, error: any };

    if (error) {
      console.warn('Error fetching tournament fixtures:', error.message)
      return []
    }

    return (data || []).map((f) => ({
      id: parseInt(f.id) || 0,
      round: f.round.toString(),
      teamA: f.home?.name || f.team_home_id,
      teamB: f.guest?.name || f.team_guest_id,
      teamAId: f.team_home_id,
      teamBId: f.team_guest_id,
      date: f.scheduled_at ? new Date(f.scheduled_at).toLocaleDateString() : '—',
      time: f.scheduled_at ? new Date(f.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
      ts: f.scheduled_at ? new Date(f.scheduled_at).getTime() : undefined,
      court: f.court || 'Court 1',
      scorer: null,
      scorerStatus: 'unassigned' as const,
      status: (f.status as TournamentFixture['status']) || 'scheduled',
      result: f.result
    }))
  } catch (err) {
    console.error('Unexpected error in getTournamentFixtures:', err)
    return []
  }
}

export async function getAwards(): Promise<any[]> {
  try {
    const { data: allStats, error } = await supabase
      .from('player_match_stats')
      .select(`
        *,
        players (
          id,
          name,
          teams (name, color)
        )
      `) as { data: DBPlayerMatchStat[] | null, error: any };

    if (error) throw error;
    if (!allStats || allStats.length === 0) return [];

    const playerAgg: Record<string, any> = {};
    allStats.forEach((s) => {
      const pid = s.player_id;
      if (!playerAgg[pid]) {
        playerAgg[pid] = {
          id: pid,
          name: s.players?.name,
          team: s.players?.teams?.name || 'Pro Kabaddi',
          color: s.players?.teams?.color || '#1e293b',
          matches: 0,
          raidPts: 0,
          tacklePts: 0,
          superRaids: 0,
          superTackles: 0,
          totalPts: 0
        };
      }
      playerAgg[pid].matches += 1;
      playerAgg[pid].raidPts += (s.raid_points || 0);
      playerAgg[pid].tacklePts += (s.tackle_points || 0);
      playerAgg[pid].superRaids += (s.super_raids || 0);
      playerAgg[pid].superTackles += (s.super_tackles || 0);
      playerAgg[pid].totalPts = playerAgg[pid].raidPts + playerAgg[pid].tacklePts;
    });

    const playersSorted = Object.values(playerAgg);
    if (playersSorted.length === 0) return [];

    const mvpWinner = [...playersSorted].sort((a, b) => b.totalPts - a.totalPts)[0];
    const raiderWinner = [...playersSorted].sort((a, b) => b.raidPts - a.raidPts)[0];
    const defenderWinner = [...playersSorted].sort((a, b) => b.tacklePts - a.tacklePts)[0];
    const superTackleWinner = [...playersSorted].sort((a, b) => b.superTackles - a.superTackles)[0];
    
    const allRounderWinner = [...playersSorted].sort((a, b) => {
      const aBalance = Math.min(a.raidPts, a.tacklePts) + (a.totalPts * 0.1);
      const bBalance = Math.min(b.raidPts, b.tacklePts) + (b.totalPts * 0.1);
      return bBalance - aBalance;
    })[0];

    const risingStarWinner = [...playersSorted].sort((a, b) => b.totalPts - a.totalPts).find(p => p.matches < 20) || playersSorted[0];

    return [
      {
        id: 'mvp',
        title: 'Most Valuable Player',
        subtitle: 'MVP of the Season',
        icon: '⚡',
        color: '#f59e0b',
        player: mvpWinner,
        statValue: mvpWinner.totalPts.toString(),
        statLabel: 'Total Points',
        statDetail: `${mvpWinner.matches} matches · Season 2024`,
        reason: 'Dominant across all formats — raids, tackles and bonus points.'
      },
      {
        id: 'raider',
        title: 'Best Raider',
        subtitle: 'Raider of the Season',
        icon: '🏉',
        color: '#0ea5e9',
        player: raiderWinner,
        statValue: raiderWinner.raidPts.toString(),
        statLabel: 'Raid Points',
        statDetail: `Highest raid points recorded this season.`,
        reason: 'Unmatched raiding technique with consistent bonus points.'
      },
      {
        id: 'defender',
        title: 'Best Defender',
        subtitle: 'Defender of the Season',
        icon: '🛡️',
        color: '#16a34a',
        player: defenderWinner,
        statValue: defenderWinner.tacklePts.toString(),
        statLabel: 'Tackle Points',
        statDetail: `Solid defense with high tackle success.`,
        reason: 'Rock-solid defender with lightning-fast reactions.'
      },
      {
        id: 'allrounder',
        title: 'Best All-Rounder',
        subtitle: 'Complete Player Award',
        icon: '🎯',
        color: '#7c3aed',
        player: allRounderWinner,
        statValue: allRounderWinner.totalPts.toString(),
        statLabel: 'Combined Points',
        statDetail: `${allRounderWinner.raidPts} raid + ${allRounderWinner.tacklePts} tackle pts`,
        reason: 'Equal threat in attack and defence. Contributed significantly in both roles.'
      },
      {
        id: 'supertackle',
        title: 'Super Tackle King',
        subtitle: 'Most Super Tackles',
        icon: '💪',
        color: '#ef4444',
        player: superTackleWinner,
        statValue: superTackleWinner.superTackles.toString(),
        statLabel: 'Super Tackles',
        statDetail: `Most defensive super tackles in the league.`,
        reason: 'Fearless under pressure. Consistently performed super tackles.'
      },
      {
        id: 'rising',
        title: 'Rising Star',
        subtitle: 'Best New Player',
        icon: '🌟',
        color: '#db2777',
        player: risingStarWinner,
        statValue: risingStarWinner.totalPts.toString(),
        statLabel: 'Total Points',
        statDetail: `First year player · ${risingStarWinner.matches} matches`,
        reason: 'Exceptional debut season. Already drawing comparisons to senior players.'
      }
    ];
  } catch (err) {
    console.error('Error fetching awards:', err);
    return [];
  }
}

export async function saveTournamentBase(t: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tournaments')
      .upsert({
        id: t.id,
        name: t.name,
        venue: t.venue,
        level: t.level,
        start_date: t.startDate,
        end_date: t.endDate,
        status: t.status,
        contact_phone: t.contact,
        organizer_name: t.organizer,
        created_by: t.created_by,
        city_state: t.cityState,
        all_out_points: t.allOutPoints,
        raid_timer: t.raidTimer,
        players_on_court: t.playersOnCourt,
        squad_size: t.squadSize,
        half_duration: t.halfDuration,
        format: t.format,
        do_or_die: t.doOrDie,
        courts: t.courts,
        super_tackle: t.superTackle,
        bonus_line: t.bonusLine,
        entry_fee: t.entryFee,
        prize: t.prize,
        setup_status: t.setup_status
      })


    if (error) {
      console.error('Error saving tournament base:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Unexpected error in saveTournamentBase:', err)
    return false
  }
}

export async function syncFullTournament(t: any): Promise<boolean> {
  try {
    const okBase = await saveTournamentBase(t)
    if (!okBase) return false

    if (t.teams && t.teams.length > 0) {
      const okTeams = await saveTournamentTeams(t.id, t.teams)
      if (!okTeams) return false
    }

    if (t.fixtures && t.fixtures.length > 0) {
      // Map tournamentStore fixtures (roundId, teamAId, etc.) to DB fixtures (round, team_home_id, etc.)
      const dbFixtures = t.fixtures.map((f: any) => {
        const roundObj = t.rounds?.find((r: any) => r.id === f.roundId)
        return {
          id: f.id,
          round: roundObj ? parseInt(roundObj.order) || 1 : 1,
          team_home_id: f.teamAId,
          team_guest_id: f.teamBId,
          scheduled_at: f.date && f.time ? new Date(`${f.date} ${f.time}`).toISOString() : null,
          court: f.court,
          status: f.status,
          result: f.scoreA !== undefined ? `${f.scoreA}-${f.scoreB}` : null
        }
      })
      const okFixtures = await saveTournamentFixtures(t.id, dbFixtures)
      if (!okFixtures) return false
    }

    return true
  } catch (err) {
    console.error('Error in syncFullTournament:', err)
    return false
  }
}

export async function saveTournamentTeams(tournamentId: string, teams: any[]): Promise<boolean> {
  try {
    const teamsToSave = teams.map(t => ({
      tournament_id: tournamentId,
      name: t.name,
      color: t.jerseyColor || t.color || '#0ea5e9',
      status: t.status || 'confirmed',
    }))

    const { data: insertedTeams, error } = await supabase
      .from('teams')
      .upsert(teamsToSave, { onConflict: 'tournament_id, name' })
      .select('id, name')

    if (error) {
      console.error('Error saving teams:', error)
      return false
    }

    if (insertedTeams && insertedTeams.length > 0) {
      const playersToSave: any[] = []
      teams.forEach(userInputTeam => {
        const dbTeam = (insertedTeams as any[]).find((dbT) => dbT.name === userInputTeam.name)
        if (dbTeam && userInputTeam.players) {
          userInputTeam.players.forEach((p: any) => {
            playersToSave.push({
              team_id: dbTeam.id,
              name: p.name,
              number: p.number || 0,
              role: p.isCaptain ? 'Captain' : 'Player'
            })
          })
        }
      })
      if (playersToSave.length > 0) {
        await supabase.from('players').insert(playersToSave)
      }
    }
    return true
  } catch (err) {
    console.error('Unexpected error in saveTournamentTeams:', err)
    return false
  }
}

export async function saveTournamentFixtures(tournamentId: string, fixtures: any[]): Promise<boolean> {
  try {
    const fixturesToSave = fixtures.map(f => ({
      id: f.id,
      tournament_id: tournamentId,
      round: f.round,
      team_home_id: f.team_home_id,
      team_guest_id: f.team_guest_id,
      scheduled_at: f.scheduled_at || (f.ts ? new Date(f.ts).toISOString() : null),
      court: f.court || 'Court 1',
      status: f.status || 'scheduled',
      result: f.result || null
    }))

    const { error } = await supabase
      .from('fixtures')
      .upsert(fixturesToSave)

    if (error) {
      console.error('Error saving fixtures:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Unexpected error in saveTournamentFixtures:', err)
    return false
  }
}
export async function getTopPlayers(): Promise<any[]> {
  try {
    const { data: allStats, error } = await supabase
      .from('player_match_stats')
      .select(`
        *,
        players (
          id,
          name,
          role,
          teams (id, name, color)
        )
      `) as { data: DBPlayerMatchStat[] | null, error: any };

    if (error) throw error;
    if (!allStats || allStats.length === 0) return [];

    const playerAgg: Record<string, any> = {};
    allStats.forEach((s) => {
      const pid = s.player_id;
      if (!playerAgg[pid]) {
        playerAgg[pid] = {
          id: pid,
          name: s.players?.name,
          role: s.players?.role || 'raider',
          team: s.players?.teams?.name || 'Pro Kabaddi',
          team_id: s.players?.teams?.id,
          team_color: s.players?.teams?.color || '#1e293b',
          matches: 0,
          raidPoints: 0,
          totalRaids: 0,
          successfulRaids: 0,
          superRaids: 0,
          tackles: 0,
          tacklePoints: 0,
          superTackles: 0,
          totalPts: 0
        };
      }
      playerAgg[pid].matches += 1;
      playerAgg[pid].raidPoints += (s.raid_points || 0);
      playerAgg[pid].totalRaids += (s.total_raids || 0);
      playerAgg[pid].successfulRaids += (s.raid_points > 0 ? 1 : 0); // Simplified success check
      playerAgg[pid].superRaids += (s.super_raids || 0);
      playerAgg[pid].tacklePoints += (s.tackle_points || 0);
      playerAgg[pid].superTackles += (s.super_tackles || 0);
      playerAgg[pid].totalPts = playerAgg[pid].raidPoints + playerAgg[pid].tacklePoints;
    });

    return Object.values(playerAgg).map(p => {
      const nppr = p.totalRaids > 0 ? (p.raidPoints / p.totalRaids) : 0;
      const strikeRate = p.totalRaids > 0 ? (p.successfulRaids / p.totalRaids) * 100 : 0;
      
      // Real metrics derived from stats (no longer random)
      const dodSuccessRate = strikeRate > 50 ? 80 : (strikeRate > 30 ? 60 : 40);
      const allOutContributions = Math.floor(p.superTackles * 0.5 + p.superRaids * 0.8);
      const trend = p.raidPoints > 10 ? 1 : (p.raidPoints < 5 ? -1 : 0);

      // Deterministic Scoring model (5-factor)
      const efficiency = nppr * 10 * 0.35;
      const pressure = (dodSuccessRate / 100) * 20; 
      const consistency = (p.totalPts / Math.max(p.matches, 1)) * 0.25;
      const impact = (p.superRaids * 2 + p.superTackles * 2 + allOutContributions * 0.5) * 0.15;
      const experience = Math.min(p.matches, 50) * 0.05 * 0.05;

      const score = (efficiency + pressure + consistency + impact + experience);

      return {
        ...p,
        nppr: parseFloat(nppr.toFixed(2)),
        strikeRate: parseFloat(strikeRate.toFixed(1)),
        dodSuccessRate,
        allOutContributions,
        trend,
        score: parseFloat(score.toFixed(1))
      };
    });

  } catch (err) {
    console.error('Error fetching league players:', err);
    return [];
  }
}

export async function getMatchDetails(id: string): Promise<any | null> {
  try {
    const { data: fixture, error: fError } = await supabase
      .from('fixtures')
      .select(`
        *,
        home: teams!team_home_id (id, name, color),
        guest: teams!team_guest_id (id, name, color),
        tournaments (name, venue)
      `)
      .eq('id', id)
      .maybeSingle() as { data: any, error: any };

    if (fError || !fixture) return null;

    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('fixture_id', id)
      .order('ts', { ascending: false }) as { data: DBEvent[] | null };

    const { data: stats } = await supabase
      .from('player_match_stats')
      .select(`
        *,
        players (id, name, role)
      `)
      .eq('fixture_id', id) as { data: DBPlayerMatchStat[] | null };

    const { data: playersA } = await supabase.from('players').select('*').eq('team_id', fixture.team_home_id);
    const { data: playersB } = await supabase.from('players').select('*').eq('team_id', fixture.team_guest_id);

    const matchStats = {
      raidPointsA: (stats || []).filter(s => (playersA as any[])?.some(p => p.id === s.player_id)).reduce((sum, s) => sum + (s.raid_points || 0), 0),
      raidPointsB: (stats || []).filter(s => (playersB as any[])?.some(p => p.id === s.player_id)).reduce((sum, s) => sum + (s.raid_points || 0), 0),
      tacklePointsA: (stats || []).filter(s => (playersA as any[])?.some(p => p.id === s.player_id)).reduce((sum, s) => sum + (s.tackle_points || 0), 0),
      tacklePointsB: (stats || []).filter(s => (playersB as any[])?.some(p => p.id === s.player_id)).reduce((sum, s) => sum + (s.tackle_points || 0), 0),
      allOutsA: (events || []).filter(e => e.type === 'all_out' && e.team_id === fixture.team_home_id).length,
      allOutsB: (events || []).filter(e => e.type === 'all_out' && e.team_id === fixture.team_guest_id).length,
      superRaidsA: (stats || []).filter(s => (playersA as any[])?.some(p => p.id === s.player_id)).reduce((sum, s) => sum + (s.super_raids || 0), 0),
      superRaidsB: (stats || []).filter(s => (playersB as any[])?.some(p => p.id === s.player_id)).reduce((sum, s) => sum + (s.super_raids || 0), 0),
      superTacklesA: (stats || []).filter(s => (playersA as any[])?.some(p => p.id === s.player_id)).reduce((sum, s) => sum + (s.super_tackles || 0), 0),
      superTacklesB: (stats || []).filter(s => (playersB as any[])?.some(p => p.id === s.player_id)).reduce((sum, s) => sum + (s.super_tackles || 0), 0),
      totalRaidsA: (stats || []).filter(s => (playersA as any[])?.some(p => p.id === s.player_id)).reduce((sum, s) => sum + (s.total_raids || 0), 0),
      totalRaidsB: (stats || []).filter(s => (playersB as any[])?.some(p => p.id === s.player_id)).reduce((sum, s) => sum + (s.total_raids || 0), 0),
    };

    return {
      id: fixture.id,
      status: fixture.status,
      tournament: fixture.tournaments?.name || 'Tournament',
      stage: fixture.round ? `Round ${fixture.round}` : 'League Match',
      venue: fixture.court || fixture.tournaments?.venue || 'TBD',
      teams: {
        a: { id: fixture.home.id, name: fixture.home.name, short: fixture.home.name.slice(0, 2).toUpperCase() },
        b: { id: fixture.guest.id, name: fixture.guest.name, short: fixture.guest.name.slice(0, 2).toUpperCase() }
      },
      score: {
        a: fixture.result?.split('-')[0] || 0,
        b: fixture.result?.split('-')[1] || 0,
        half: fixture.status === 'live' ? 1 : undefined,
        time: '00:00'
      },
      events: (events || []).map(e => ({
        id: e.id,
        type: e.type,
        teamId: e.team_id,
        half: e.half,
        ts: new Date(e.ts).getTime(),
        note: e.note
      })),
      stats: matchStats,
      lineups: {
        startersA: (playersA || []).map((p: any) => ({ id: p.id, name: p.name, role: p.role, pts: (stats || []).find(s => s.player_id === p.id)?.raid_points || 0 })),
        startersB: (playersB || []).map((p: any) => ({ id: p.id, name: p.name, role: p.role, pts: (stats || []).find(s => s.player_id === p.id)?.raid_points || 0 })),
        subsA: [],
        subsB: []
      },
      startsAt: fixture.scheduled_at,
      resultText: fixture.result ? `${fixture.home.name} ${fixture.result} ${fixture.guest.name}` : undefined
    };
  } catch (err) {
    console.error('Error in getMatchDetails:', err);
    return null;
  }
}
export async function searchPlayers(q: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('id, name, number')
      .or(`name.ilike.%${q}%,number.eq.${parseInt(q) || -1}`) // Search by name or number (substitute for phone if not available)
      .limit(10);

    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      phone: p.number?.toString() || '—' // Displaying number as identifier
    }));
  } catch (err) {
    console.error('Error searching players:', err);
    return [];
  }
}

export async function getAllTeams(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*, players(count)')
      .order('name');
    
    if (error) throw error;
    return (data || []).map((t: any) => ({
      ...t,
      playerCount: t.players?.[0]?.count || 0
    }));
  } catch (err) {
    console.error('Error fetching all teams:', err);
    return [];
  }
}

export async function getTeamDetail(id: string): Promise<{ team: DBTeam; players: DBPlayer[] } | null> {
  try {
    const { data: team, error: tError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();
    
    if (tError) throw tError;

    const { data: players, error: pError } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', id);
    
    if (pError) throw pError;

    return { team, players: players || [] };
  } catch (err) {
    console.error('Error fetching team detail:', err);
    return null;
  }
}

export async function createTeamRecord(name: string, city: string = '', color: string = '#6c5ce7'): Promise<DBTeam | null> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert([{ name, city, color, status: 'confirmed' }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating team:', err);
    return null;
  }
}

export async function updateTeamRecord(id: string, updates: Partial<DBTeam>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error updating team:', err);
    return false;
  }
}

export async function deleteTeamRecord(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting team:', err);
    return false;
  }
}

export async function addPlayerRecord(teamId: string, player: { name: string; role: string; number?: number }): Promise<DBPlayer | null> {
  try {
    const { data, error } = await supabase
      .from('players')
      .insert([{ ...player, team_id: teamId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error adding player:', err);
    return null;
  }
}

export async function updatePlayerRecord(id: string, updates: Partial<DBPlayer>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error updating player:', err);
    return false;
  }
}

export async function deletePlayerEntry(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting player:', err);
    return false;
  }
}

export async function saveMatchResults(
  matchId: string, 
  homeScore: number, 
  guestScore: number, 
  playerStats: Record<string, any>
): Promise<boolean> {
  try {
    // 1. Update match status
    const { error: mError } = await supabase
      .from('kabaddi_matches')
      .update({ 
        status: 'completed', 
        home_score: homeScore, 
        guest_score: guestScore,
        end_time: new Date().toISOString()
      })
      .eq('id', matchId);
    
    if (mError) throw mError;

    // 2. Prepare player stats
    const statsArray = Object.values(playerStats).map(s => ({
      match_id: matchId,
      player_id: s.id,
      raid_points: s.raidPts || 0,
      tackle_points: s.tacklePts || 0,
      super_10: (s.raidPts || 0) >= 10,
      high_5: (s.tacklePts || 0) >= 5,
      total_points: (s.raidPts || 0) + (s.tacklePts || 0)
    }));

    if (statsArray.length > 0) {
      // 3. Upsert player stats
      const { error: sError } = await supabase
        .from('player_match_stats')
        .upsert(statsArray, { onConflict: 'match_id,player_id' });
      
      if (sError) throw sError;
    }

    return true;
  } catch (err) {
    console.error('Error saving match results:', err);
    return false;
  }
}

export async function publishMatchNews(
  matchId: string,
  homeScore: number,
  guestScore: number,
  playerStats: Record<string, any>
): Promise<boolean> {
  try {
    // 1. Fetch match & teams info for the title/body
    let matchData: any = null;
    const { data: fixture } = await supabase
      .from('fixtures')
      .select(`
        id, tournament_id,
        home: teams!team_home_id (name),
        guest: teams!team_guest_id (name)
      `)
      .eq('id', matchId)
      .maybeSingle();

    if (fixture) {
      matchData = {
        homeName: fixture.home?.name || 'Home Team',
        guestName: fixture.guest?.name || 'Guest Team',
        tournamentId: fixture.tournament_id
      };
    } else {
      // Try kabaddi_matches
      const { data: dbMatch } = await supabase
        .from('kabaddi_matches')
        .select(`
          id, tournament_id,
          home_team_name, guest_team_name,
          home_team:teams!team_home_id(name),
          guest_team:teams!team_guest_id(name)
        `)
        .eq('id', matchId)
        .maybeSingle();
      
      if (dbMatch) {
        matchData = {
          homeName: dbMatch.home_team?.name || dbMatch.home_team_name || 'Home Team',
          guestName: dbMatch.guest_team?.name || dbMatch.guest_team_name || 'Guest Team',
          tournamentId: dbMatch.tournament_id
        };
      }
    }

    if (!matchData) return false;
    const winner = homeScore > guestScore ? matchData.homeName : (guestScore > homeScore ? matchData.guestName : 'Draw');
    const title = `Match Result: ${matchData.homeName} vs ${matchData.guestName}`;
    
    // Find top performer
    const statsList = Object.values(playerStats).sort((a, b) => (b.raidPts + b.tacklePts) - (a.raidPts + a.tacklePts));
    const topPlayer = statsList[0];
    const topPlayerName = topPlayer?.name || 'A player';
    const topPts = (topPlayer?.raidPts || 0) + (topPlayer?.tacklePts || 0);

    const body = winner === 'Draw' 
      ? `A thrilling draw! ${matchData.homeName} and ${matchData.guestName} finished at ${homeScore}-${guestScore}. ${topPlayerName} was the star with ${topPts} points.`
      : `${winner} secured a dominant victory over ${winner === matchData.homeName ? matchData.guestName : matchData.homeName} with a final score of ${homeScore}-${guestScore}. ${topPlayerName} led the charge with a massive ${topPts} point performance!`;

    // 2. Insert into news_posts
    const { error } = await supabase.from('news_posts').insert({
      type: 'result',
      title: title,
      body: body,
      tournament_id: matchData.tournamentId,
      created_at: new Date().toISOString()
    });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error publishing match news:', err);
    return false;
  }
}

