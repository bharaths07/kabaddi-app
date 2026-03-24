import { supabase } from '../lib/supabase'
import type { Tournament, TournamentTeam, TournamentFixture } from '../../features/kabaddi/types/kabaddi.types'

export async function getTournament(slugOrId: string): Promise<Tournament | null> {
  const column = slugOrId.match(/^[0-9a-fA-F-]{36}$/) ? 'id' : 'slug';
  
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq(column, slugOrId)
      .maybeSingle()

    if (error) {
      // If we still get a PGRST116 here, it means RLS is likely blocking the read
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching tournament:', error)
      return null
    }

    if (!data) return null;

    // Map DB status to UI status if needed
    let status = data.status;
    if (status === 'draft') status = 'Upcoming';
    if (status === 'ongoing') status = 'Live';

    return {
      id: data.id,
      name: data.name,
      venue: data.venue || data.venue_name || 'TBD',
      level: data.level || 'Local',
      status: status as any,
      startDate: data.start_date,
      endDate: data.end_date,
      totalTeams: 8, // Placeholder
      confirmedTeams: 5, // Placeholder
      totalMatches: 14, // Placeholder
      completedMatches: 2, // Placeholder
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
      // Basic slug matching: replace hyphens with spaces and use ilike
      const nameMatch = teamIdOrSlug.replace(/-/g, ' ');
      query = query.ilike('name', nameMatch);
    }

    const { data: team, error: teamError } = await query.maybeSingle();

    if (teamError || !team) return null;

    // Fetch players
    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', team.id);

    // Fetch fixtures (home or guest)
    const { data: fixtures } = await supabase
      .from('fixtures')
      .select(`
        *,
        home: teams!team_home_id (name),
        guest: teams!team_guest_id (name)
      `)
      .or(`team_home_id.eq.${team.id},team_guest_id.eq.${team.id}`);

    return {
      ...team,
      tournamentName: team.tournaments?.name,
      squad: players || [],
      fixtures: (fixtures || []).map((f: any) => ({
        id: f.id,
        opponent: f.team_home_id === team.id ? f.guest?.name : f.home?.name,
        date: f.scheduled_at ? new Date(f.scheduled_at).toLocaleDateString() : '—',
        time: f.scheduled_at ? new Date(f.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        status: f.status,
        score: f.result || '',
        result: f.result ? (f.status === 'completed' ? 'played' : '') : '' // logic can be more complex
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

    const { data: player, error: playerError } = await query.maybeSingle();

    if (playerError || !player) return null;

    // Fetch match stats
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
      .eq('player_id', player.id);

    if (statsError) console.error('Error fetching player match stats:', statsError);

    // Aggregate overall stats
    const totalMatches = matchStats?.length || 0;
    const totalRaidPts = matchStats?.reduce((sum, s) => sum + (s.raid_points || 0), 0) || 0;
    const totalTacklePts = matchStats?.reduce((sum, s) => sum + (s.tackle_points || 0), 0) || 0;
    const superRaids = matchStats?.reduce((sum, s) => sum + (s.super_raids || 0), 0) || 0;
    const superTackles = matchStats?.reduce((sum, s) => sum + (s.super_tackles || 0), 0) || 0;
    const super10s = matchStats?.filter(s => (s.raid_points || 0) >= 10).length || 0;
    const high5s = matchStats?.filter(s => (s.tackle_points || 0) >= 5).length || 0;

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
          notOut: 75, // Placeholder
          successRaid: 60, // Placeholder
          successTackle: 30 // Placeholder
        }
      },
      matches: (matchStats || []).map((s: any) => {
        const f = s.fixtures;
        const isHome = f.home.name === player.teams?.name;
        return {
          id: f.id,
          opponent: isHome ? f.guest.name : f.home.name,
          date: f.scheduled_at ? new Date(f.scheduled_at).toLocaleDateString() : '—',
          raidPts: s.raid_points || 0,
          tacklePts: s.tackle_points || 0,
          result: f.result || (f.status === 'completed' ? 'Played' : f.status)
        };
      }),
      achievements: [] // Still placeholder for now
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

    return (data || []).map(t => ({
      id: t.id,
      name: t.name,
      color: t.color || '#0ea5e9',
      captain: '—', // Placeholder
      players: 0, // Placeholder
      status: t.status as any || 'confirmed',
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
      .eq('tournament_id', tournamentId)

    if (error) {
      console.warn('Error fetching tournament fixtures:', error.message)
      return []
    }

    return (data || []).map(f => ({
      id: f.id,
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
      scorerStatus: 'unassigned',
      status: f.status as any || 'scheduled',
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
      `);

    if (error) throw error;
    if (!allStats || allStats.length === 0) return [];

    // Aggregate stats by player
    const playerAgg: Record<string, any> = {};
    allStats.forEach(s => {
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

    const players = Object.values(playerAgg);
    if (players.length === 0) return [];

    // Sort to find winners
    const mvpWinner = [...players].sort((a, b) => b.totalPts - a.totalPts)[0];
    const raiderWinner = [...players].sort((a, b) => b.raidPts - a.raidPts)[0];
    const defenderWinner = [...players].sort((a, b) => b.tacklePts - a.tacklePts)[0];
    const superTackleWinner = [...players].sort((a, b) => b.superTackles - a.superTackles)[0];
    
    // All-rounder: balanced raid and tackle points
    const allRounderWinner = [...players].sort((a, b) => {
      const aBalance = Math.min(a.raidPts, a.tacklePts) + (a.totalPts * 0.1);
      const bBalance = Math.min(b.raidPts, b.tacklePts) + (b.totalPts * 0.1);
      return bBalance - aBalance;
    })[0];

    // Rising Star: Highest points among players with fewest matches (simulated for MVP)
    const risingStarWinner = [...players].sort((a, b) => b.totalPts - a.totalPts).find(p => p.matches < 20) || players[0];

    const winners = [
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

    return winners;
  } catch (err) {
    console.error('Error fetching awards:', err);
    return [];
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
        const dbTeam = insertedTeams.find((dbT: any) => dbT.name === userInputTeam.name)
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
      id: f.id, // Include ID for upsert
      tournament_id: tournamentId,
      round: f.round,
      team_home_id: f.team_home_id,
      team_guest_id: f.team_guest_id,
      scheduled_at: f.scheduled_at || f.ts ? new Date(f.ts || f.scheduled_at).toISOString() : null,
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
