/// <reference path="../deno.d.ts" />
/// <reference no-default-lib="true" />

/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />

import { serve } from "std/http/server.ts"
import { createClient } from "supabase"

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  })

serve(async (req: Request) => {
  try {
    const body = await req.json().catch(() => null)
    const matchId = body?.matchId as string | undefined

    if (!matchId) return json({ ok: false, error: "matchId required" }, 400)

    const supabaseUrl      = Deno.env.get("SUPABASE_URL")
    const serviceRoleKey   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !serviceRoleKey)
      return json({ ok: false, error: "Missing Supabase env" }, 500)

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // 1. Get all raid events for this match
    const { data: raids, error: raidsError } = await supabase
      .from("raid_events")
      .select("*")
      .eq("match_id", matchId)

    if (raidsError) return json({ ok: false, error: raidsError.message }, 500)

    // 2. Build per-player stats
    // Schema columns: raider_id, points, type, is_super_raid, is_bonus, is_do_or_die
    const statsMap = new Map<string, {
      raids:            number
      raid_pts:         number
      successful_raids: number
      empty_raids:      number
      super_raids:      number
      bonus_pts:        number
    }>()

    for (const r of raids || []) {
      if (!r.raider_id) continue

      if (!statsMap.has(r.raider_id)) {
        statsMap.set(r.raider_id, {
          raids: 0, raid_pts: 0, successful_raids: 0,
          empty_raids: 0, super_raids: 0, bonus_pts: 0,
        })
      }

      const s = statsMap.get(r.raider_id)!
      s.raids++

      const pts = Number(r.points ?? 0)
      s.raid_pts += pts

      // successful = any points scored
      if (pts > 0) s.successful_raids++
      else         s.empty_raids++

      if (r.is_super_raid) s.super_raids++
      if (r.is_bonus)      s.bonus_pts++
    }

    // 3. Also collect tackle stats per defender
    const tackleMap = new Map<string, {
      tackles:       number
      tackle_pts:    number
      super_tackles: number
    }>()

    for (const r of raids || []) {
      if (!r.defender_ids?.length) continue
      const tPts = Number(r.points ?? 0)
      for (const defId of r.defender_ids) {
        if (!tackleMap.has(defId)) {
          tackleMap.set(defId, { tackles: 0, tackle_pts: 0, super_tackles: 0 })
        }
        const t = tackleMap.get(defId)!
        if (r.type === 'tackle') {
          t.tackles++
          t.tackle_pts += tPts
          if (r.is_super_tackle) t.super_tackles++
        }
      }
    }

    // 4. Get match info
    const { data: match, error: matchError } = await supabase
      .from("kabaddi_matches")
      .select("id, fixture_id, home_score, guest_score, team_home_id, team_guest_id")
      .eq("id", matchId)
      .single()

    if (matchError || !match)
      return json({ ok: false, error: matchError?.message || "Match not found" }, 404)

    // 5. Build player_match_stats rows (uses match_id in new schema)
    const allPlayerIds = new Set([
      ...statsMap.keys(),
      ...tackleMap.keys(),
    ])

    const rows = Array.from(allPlayerIds).map(playerId => {
      const rs = statsMap.get(playerId)
      const ts = tackleMap.get(playerId)
      return {
        match_id:         matchId,
        player_id:        playerId,
        raids:            rs?.raids            ?? 0,
        raid_pts:         rs?.raid_pts         ?? 0,
        successful_raids: rs?.successful_raids ?? 0,
        empty_raids:      rs?.empty_raids      ?? 0,
        super_raids:      rs?.super_raids      ?? 0,
        bonus_pts:        rs?.bonus_pts        ?? 0,
        tackles:          ts?.tackles          ?? 0,
        tackle_pts:       ts?.tackle_pts       ?? 0,
        super_tackles:    ts?.super_tackles    ?? 0,
        total_pts:        (rs?.raid_pts ?? 0) + (ts?.tackle_pts ?? 0) + (rs?.bonus_pts ?? 0),
      }
    })

    // 6. Upsert player stats
    if (rows.length > 0) {
      const { error: statsError } = await supabase
        .from("player_match_stats")
        .upsert(rows, { onConflict: "match_id,player_id" })

      if (statsError) return json({ ok: false, error: statsError.message }, 500)
    }

    // 7. Mark match as completed
    const { error: matchUpdateError } = await supabase
      .from("kabaddi_matches")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", matchId)

    if (matchUpdateError)
      return json({ ok: false, error: matchUpdateError.message }, 500)

    // 8. If match has a fixture, mark fixture completed too
    if (match.fixture_id) {
      await supabase
        .from("fixtures")
        .update({ status: "completed" })
        .eq("id", match.fixture_id)
    }

    return json({ ok: true, stats_saved: rows.length })

  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 500)
  }
})