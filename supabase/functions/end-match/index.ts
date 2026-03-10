import { serve } from "https://deno.land/std/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js"

serve(async (req) => {
  try {
    const { matchId } = await req.json()
    if (!matchId) {
      return new Response(JSON.stringify({ ok: false, error: "matchId required" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      })
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ ok: false, error: "Missing Supabase env" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data: raids, error: raidsError } = await supabase
      .from("raid_events")
      .select("*")
      .eq("match_id", matchId)

    if (raidsError) {
      return new Response(JSON.stringify({ ok: false, error: raidsError.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      })
    }

    const statsMap = new Map<
      string,
      { raids: number; raid_points: number; successful_raids: number }
    >()

    for (const r of raids || []) {
      if (!statsMap.has(r.raider_id)) {
        statsMap.set(r.raider_id, { raids: 0, raid_points: 0, successful_raids: 0 })
      }
      const s = statsMap.get(r.raider_id)!
      s.raids++
      s.raid_points += r.points_scored
      if (r.success) s.successful_raids++
    }

    const { data: match, error: matchError } = await supabase
      .from("kabaddi_matches")
      .select("fixture_id, home_score, guest_score")
      .eq("id", matchId)
      .single()

    if (matchError || !match) {
      return new Response(JSON.stringify({ ok: false, error: matchError?.message || "Match not found" }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
      })
    }

    const rows = Array.from(statsMap.entries()).map(([playerId, s]) => ({
      fixture_id: match.fixture_id,
      player_id: playerId,
      raids: s.raids,
      raid_points: s.raid_points,
      successful_raids: s.successful_raids,
    }))

    if (rows.length > 0) {
      const { error: statsError } = await supabase
        .from("player_match_stats")
        .upsert(rows, { onConflict: "fixture_id,player_id" })

      if (statsError) {
        return new Response(JSON.stringify({ ok: false, error: statsError.message }), {
          headers: { "Content-Type": "application/json" },
          status: 500,
        })
      }
    }

    const { error: fixtureError } = await supabase
      .from("fixtures")
      .update({ status: "completed" })
      .eq("id", match.fixture_id)

    if (fixtureError) {
      return new Response(JSON.stringify({ ok: false, error: fixtureError.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
})

