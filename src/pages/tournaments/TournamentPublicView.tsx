import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./tournament-public.css";
import {
  getTournament,
  Tournament,
  TTeam,
  TFixture,
} from "../../features/kabaddi/state/tournamentStore";
import { supabase } from "../../shared/lib/supabase";
import { useAuth } from "../../shared/context/AuthContext";
import TeamRegistrationModal from "../../features/kabaddi/components/modals/TeamRegistrationModal";
import "./tournament-public.css";

// ── Helpers ──────────────────────────────────────────────────────
function fmtDate(d: string | null | undefined) {
  if (!d) return "TBD";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function teamName(id: string, teams: TTeam[]): string {
  if (!id || id === "TBD") return "TBD";
  return teams.find(t => t.id === id)?.name ?? id;
}

function calcStandings(teams: TTeam[], fixtures: TFixture[]) {
  const map: Record<string, { name: string; color: string; P: number; W: number; L: number; pts: number; scored: number; conceded: number }> = {};
  teams.forEach(t => { map[t.id] = { name: t.name, color: t.color, P: 0, W: 0, L: 0, pts: 0, scored: 0, conceded: 0 }; });
  fixtures.filter(f => f.status === "completed" && f.scoreA !== undefined && f.scoreB !== undefined).forEach(f => {
    const sA = f.scoreA!, sB = f.scoreB!;
    if (map[f.teamAId]) { map[f.teamAId].P++; map[f.teamAId].scored += sA; map[f.teamAId].conceded += sB; }
    if (map[f.teamBId]) { map[f.teamBId].P++; map[f.teamBId].scored += sB; map[f.teamBId].conceded += sA; }
    if (sA > sB) {
      if (map[f.teamAId]) { map[f.teamAId].W++; map[f.teamAId].pts += 2; }
      if (map[f.teamBId]) map[f.teamBId].L++;
    } else if (sB > sA) {
      if (map[f.teamBId]) { map[f.teamBId].W++; map[f.teamBId].pts += 2; }
      if (map[f.teamAId]) map[f.teamAId].L++;
    }
  });
  return Object.values(map).sort((a, b) => b.pts - a.pts || (b.scored - b.conceded) - (a.scored - a.conceded));
}

// ── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    ongoing:   { label: "🔴 LIVE",      cls: "pv-status--live" },
    completed: { label: "✅ ENDED",     cls: "pv-status--done" },
    draft:     { label: "📌 Upcoming",  cls: "pv-status--upcoming" },
    registration: { label: "📋 Open",   cls: "pv-status--upcoming" },
  };
  const { label, cls } = cfg[status] ?? { label: "Upcoming", cls: "pv-status--upcoming" };
  return <span className={`pv-status ${cls}`}>{label}</span>;
}

// ── Public Match Card (read-only) ────────────────────────────────
function PublicMatchCard({ f, teams, navigate }: { f: TFixture; teams: TTeam[]; navigate: (p: string) => void }) {
  const isLive      = f.status === "live";
  const isCompleted = f.status === "completed";
  const nameA  = teamName(f.teamAId, teams);
  const nameB  = teamName(f.teamBId, teams);
  const colorA = teams.find(t => t.id === f.teamAId)?.color ?? "#FF5722";
  const colorB = teams.find(t => t.id === f.teamBId)?.color ?? "#3182CE";

  return (
    <div className={`pv-match-card ${isLive ? "pv-match-card--live" : ""}`}>
      {isLive && <div className="pv-live-badge"><span className="pv-live-pulse" />LIVE NOW</div>}
      <div className="pv-match-teams">
        <div className="pv-team">
          <div className="pv-team-dot" style={{ background: colorA }} />
          <span className="pv-team-name">{nameA}</span>
        </div>
        <div className="pv-score-box">
          {isLive || isCompleted
            ? <span className="pv-score">{f.scoreA ?? 0} - {f.scoreB ?? 0}</span>
            : <span className="pv-vs">VS</span>
          }
        </div>
        <div className="pv-team pv-team--right">
          <span className="pv-team-name">{nameB}</span>
          <div className="pv-team-dot" style={{ background: colorB }} />
        </div>
      </div>
      <div className="pv-match-meta">
        {f.date && <span>📅 {fmtDate(f.date)}</span>}
        {f.time && <span>⏰ {f.time}</span>}
        {f.court && <span>🏟 {f.court}</span>}
        {isCompleted && <span className="pv-done-tag">Completed</span>}
      </div>
      {isLive && (
        <button className="pv-live-btn" onClick={() => navigate(`/matches/${f.id}/live`)}>
          📺 Watch Live
        </button>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function TournamentPublicView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [matchTab,   setMatchTab]   = useState<"upcoming" | "live" | "completed">("upcoming");
  const [showReg,    setShowReg]    = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      if (!id) { setLoading(false); return; }
      
      // 1. Try Local
      const t = getTournament(id);
      if (t) {
        setTournament(t);
        updateTabs(t);
        setLoading(false);
        return;
      }

      // 2. Try Supabase
      const { data: dbT } = await supabase.from('tournaments').select('*').eq('id', id).single();
      if (dbT) {
        const fullT: Tournament = {
          ...dbT,
          startDate: dbT.start_date || dbT.startDate || '',
          endDate: dbT.end_date || dbT.endDate || '',
          cityState: dbT.city_state || dbT.cityState || '',
          status: dbT.status || 'upcoming',
          format: dbT.format || 'league',
          venue: dbT.venue || dbT.venue_name || '',
          organizer: dbT.organizer || '',
          teams: [], 
          fixtures: [],
          groups: [],
          rounds: [],
          createdAt: dbT.created_at || new Date().toISOString()
        } as any;
        setTournament(fullT);
      }
      setLoading(false);
    }

    function updateTabs(t: any) {
      if (t.fixtures.some((f: any) => f.status === "live")) setMatchTab("live");
      else if (t.fixtures.some((f: any) => f.status === "scheduled")) setMatchTab("upcoming");
      else setMatchTab("completed");
    }

    load();
  }, [id]);

  if (loading) return (
    <div className="pv-loading"><div className="pv-spinner" /><p>Loading tournament...</p></div>
  );

  if (!tournament) return (
    <div className="pv-loading">
      <p style={{ fontWeight: 700 }}>Tournament not found.</p>
      <button style={{ marginTop: 16, padding: "10px 24px", background: "#FF5722", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" }} onClick={() => navigate("/tournaments")}>
        ← Back to Tournaments
      </button>
    </div>
  );

  const { teams, fixtures } = tournament;
  const standings = calcStandings(teams, fixtures);
  const live      = fixtures.filter(f => f.status === "live");
  const upcoming  = fixtures.filter(f => f.status === "scheduled");
  const completed = fixtures.filter(f => f.status === "completed");
  const visible   = matchTab === "live" ? live : matchTab === "upcoming" ? upcoming : completed;

  return (
    <div className="pv-page">

      {/* HERO */}
      <div className="pv-hero">
        <button className="pv-back" onClick={() => navigate(-1)}>← Back</button>
        <div className="pv-hero-content">
          <div className="pv-trophy">🏆</div>
          <div>
            <h1 className="pv-name">{tournament.name}</h1>
            <p className="pv-venue">📍 {tournament.venue || tournament.cityState} · {fmtDate(tournament.startDate)} – {fmtDate(tournament.endDate)}</p>
            <div className="tp-hero-badges">
            <span className={`tp-status tp-status--${tournament.status || 'upcoming'}`}>{(tournament.status || 'upcoming').toUpperCase()}</span>
            <span>{(tournament.format || 'league').replace('_', ' ').toUpperCase()}</span>
          </div>
          
          {(tournament.status === 'registration' || tournament.status === 'draft') && (
            <div className="tp-action-row">
              {regSuccess ? (
                <div className="tp-success-badge">✅ Application Submitted!</div>
              ) : (
                <button className="tp-apply-btn" onClick={() => setShowReg(true)}>
                  Apply to Join Tournament →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showReg && (
        <TeamRegistrationModal 
          tournamentId={tournament.id}
          tournamentName={tournament.name}
          onClose={() => setShowReg(false)}
          onSuccess={() => {
            setShowReg(false);
            setRegSuccess(true);
            setTimeout(() => setRegSuccess(false), 5000);
          }}
        />
      )}
        {tournament.organizer && (
          <p className="pv-organizer">Organized by <strong>{tournament.organizer}</strong></p>
        )}
      </div>

      {/* LIVE STRIP */}
      {live.length > 0 && (
        <div className="pv-live-strip">
          <span className="pv-live-strip-dot" />
          {live.length} Match{live.length > 1 ? "es" : ""} Live Now
        </div>
      )}

      {/* STATS */}
      <div className="pv-stats-strip">
        <div className="pv-stat"><span className="pv-stat-val">{teams.length}</span><span className="pv-stat-lbl">Teams</span></div>
        <div className="pv-stat-div" />
        <div className="pv-stat"><span className="pv-stat-val">{completed.length}<span className="pv-stat-sub">/{fixtures.length}</span></span><span className="pv-stat-lbl">Matches Played</span></div>
        <div className="pv-stat-div" />
        <div className="pv-stat"><span className={`pv-stat-val ${live.length > 0 ? "pv-stat-val--live" : ""}`}>{live.length > 0 ? live.length : "—"}</span><span className="pv-stat-lbl">Live Now</span></div>
      </div>

      {/* BODY */}
      <div className="pv-body">
        <div className="pv-col-main">
          <div className="pv-section">
            <h2 className="pv-section-title">Matches</h2>
            <div className="pv-match-tabs">
              {(["upcoming", "live", "completed"] as const).map(tb => (
                <button key={tb} onClick={() => setMatchTab(tb)} className={`pv-match-tab ${matchTab === tb ? "pv-match-tab--active" : ""}`}>
                  {tb === "live" && live.length > 0 && <span className="pv-tab-live-dot" />}
                  {tb.charAt(0).toUpperCase() + tb.slice(1)}
                  <span className="pv-tab-count">{tb === "live" ? live.length : tb === "upcoming" ? upcoming.length : completed.length}</span>
                </button>
              ))}
            </div>
            {visible.length === 0 ? (
              <div className="pv-empty">
                <div className="pv-empty-icon">{matchTab === "live" ? "🎙" : matchTab === "upcoming" ? "📅" : "🏁"}</div>
                <p>{matchTab === "live" ? "No live matches." : matchTab === "upcoming" ? "Schedule not yet available." : "No completed matches yet."}</p>
              </div>
            ) : (
              visible.map(f => <PublicMatchCard key={f.id} f={f} teams={teams} navigate={navigate} />)
            )}
          </div>
        </div>

        <div className="pv-col-side">
          {/* Standings */}
          <div className="pv-section">
            <h2 className="pv-section-title">Points Table</h2>
            {!completed.length ? (
              <div className="pv-empty pv-empty--sm">
                <div className="pv-empty-icon">🏅</div>
                <p>Standings update after first match</p>
              </div>
            ) : (
              <div className="pv-standings">
                <div className="pv-standings-head">
                  <span className="pv-col-rank">#</span>
                  <span className="pv-col-team">Team</span>
                  <span className="pv-col-num">P</span>
                  <span className="pv-col-num">W</span>
                  <span className="pv-col-num">L</span>
                  <span className="pv-col-pts">Pts</span>
                </div>
                {standings.map((r, i) => (
                  <div key={r.name} className={`pv-standings-row ${i === 0 ? "pv-standings-row--top" : ""}`}>
                    <span className="pv-col-rank" style={{ color: i === 0 ? "#FF5722" : undefined }}>{i + 1}</span>
                    <span className="pv-col-team">
                      <span className="pv-team-dot-sm" style={{ background: r.color }} />{r.name}
                    </span>
                    <span className="pv-col-num">{r.P}</span>
                    <span className="pv-col-num">{r.W}</span>
                    <span className="pv-col-num">{r.L}</span>
                    <span className="pv-col-pts">{r.pts}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Teams */}
          <div className="pv-section">
            <h2 className="pv-section-title">Teams</h2>
            {teams.length === 0 ? (
              <div className="pv-empty pv-empty--sm"><p>Teams not announced yet.</p></div>
            ) : (
              <div className="pv-teams-grid">
                {teams.map(t => (
                  <div key={t.id} className="pv-team-chip">
                    <div className="pv-team-chip-avatar" style={{ background: t.color }}>{t.name[0]}</div>
                    <div>
                      <div className="pv-team-chip-name">{t.name}</div>
                      <div className="pv-team-chip-sub">{t.players.length} players</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
