import { supabase } from '../lib/supabase';

export type TeamStandingResult = {
  id: string;
  name: string;
  color: string;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  scoreDiff: number;
};

export async function fetchGlobalStandings(tournamentId?: string): Promise<TeamStandingResult[]> {
  try {
    // 1. Fetch Teams
    let teamQuery = supabase.from('teams').select('id, name, color, tournament_id');
    if (tournamentId && tournamentId !== 'all') {
      teamQuery = teamQuery.eq('tournament_id', tournamentId);
    }
    const { data: teams, error: tError } = await teamQuery;
    if (tError) throw tError;
    if (!teams) return [];

    // 2. Fetch Completed Matches
    let matchQuery = supabase.from('kabaddi_matches').select('id, team_home_id, team_guest_id, home_score, guest_score').eq('status', 'completed');
    const { data: matches, error: mError } = await matchQuery;
    if (mError) throw mError;

    // 3. Calculate Standings
    const standingsMap: Record<string, TeamStandingResult> = {};
    
    teams.forEach((t: { id: string; name: string; color: string | null }) => {
      standingsMap[t.id] = {
        id: t.id,
        name: t.name,
        color: t.color || '#64748b',
        matches: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
        scoreDiff: 0
      };
    });

    if (matches) {
      matches.forEach((m: { team_home_id: string; team_guest_id: string; home_score: number | null; guest_score: number | null }) => {
        const homeId = m.team_home_id;
        const guestId = m.team_guest_id;
        const homeScore = m.home_score || 0;
        const guestScore = m.guest_score || 0;

        if (standingsMap[homeId]) {
          const s = standingsMap[homeId];
          s.matches++;
          s.scoreDiff += (homeScore - guestScore);
          if (homeScore > guestScore) { s.wins++; s.points += 5; }
          else if (homeScore < guestScore) { s.losses++; }
          else { s.draws++; s.points += 3; }
        }

        if (standingsMap[guestId]) {
          const s = standingsMap[guestId];
          s.matches++;
          s.scoreDiff += (guestScore - homeScore);
          if (guestScore > homeScore) { s.wins++; s.points += 5; }
          else if (guestScore < homeScore) { s.losses++; }
          else { s.draws++; s.points += 3; }
        }
      });
    }

    return Object.values(standingsMap).sort((a, b) => b.points - a.points || b.scoreDiff - a.scoreDiff);
  } catch (err) {
    console.error('Error fetching standings:', err);
    return [];
  }
}
