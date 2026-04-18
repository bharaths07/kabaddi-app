import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./tournament-details.css";
import {
  getTournament,
  Tournament,
  TTeam,
  TFixture,
} from "../../features/kabaddi/state/tournamentStore";
import { supabase } from "../../shared/lib/supabase";

// ─── HELPERS ────────────────────────────────────────────────────
function fmtDate(d: string | null | undefined) {
  if (!d) return "TBD";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// Resolve team name from id
function teamName(id: string, teams: TTeam[]): string {
  if (!id || id === "TBD") return "TBD";
  return teams.find(t => t.id === id)?.name ?? id;
}

// Calc standings from fixtures
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
    } else {
      if (map[f.teamAId]) { map[f.teamAId].pts++; }
      if (map[f.teamBId]) { map[f.teamBId].pts++; }
    }
  });
  return Object.values(map).sort((a, b) => b.pts - a.pts || (b.scored - b.conceded) - (a.scored - a.conceded));
}

function getStatusConfig(status: string) {
  switch (status) {
    case "ongoing":   return { label: "LIVE",     cls: "status--live",      pulse: true };
    case "completed": return { label: "ENDED",    cls: "status--completed", pulse: false };
    default:          return { label: "UPCOMING", cls: "status--upcoming",  pulse: false };
  }
}

// ─── SMART BANNER ──────────────────────────────────────────────────
function SmartBanner({ t, navigate }: { t: Tournament; navigate: (p: string) => void }) {
  if (t.teams.length === 0) return (
    <div className="tdc-banner tdc-banner--warn">
      <span>⚠️ No teams added yet — add teams to begin</span>
      <button className="tdc-banner-btn" onClick={() => navigate(`/tournaments/${t.id}/setup`)}>Go to Setup →</button>
    </div>
  );
  if (t.fixtures.length === 0) return (
    <div className="tdc-banner tdc-banner--info">
      <span>📅 Generate the match schedule to enable match start</span>
      <button className="tdc-banner-btn" onClick={() => navigate(`/tournaments/${t.id}/setup`)}>Setup →</button>
    </div>
  );
  return null;
}

// ─── STATS STRIP ───────────────────────────────────────────────────
function StatsStrip({ t }: { t: Tournament }) {
  const completed = t.fixtures.filter(f => f.status === "completed").length;
  const live      = t.fixtures.filter(f => f.status === "live").length;
  return (
    <div className="tdc-stats-strip">
      <div className="tdc-stat-item">
        <span className="tdc-stat-value">{t.teams.length}</span>
        <span className="tdc-stat-label">Teams</span>
      </div>
      <div className="tdc-stat-divider" />
      <div className="tdc-stat-item">
        <span className="tdc-stat-value">{completed}<span className="tdc-stat-sub">/{t.fixtures.length}</span></span>
        <span className="tdc-stat-label">Played</span>
      </div>
      <div className="tdc-stat-divider" />
      <div className="tdc-stat-item">
        <span className={`tdc-stat-value ${live > 0 ? "tdc-stat-live" : ""}`}>{live > 0 ? live : "—"}</span>
        <span className="tdc-stat-label">Live Now</span>
      </div>
      <div className="tdc-stat-divider" />
      <div className="tdc-stat-item">
        <span className="tdc-stat-value">{t.fixtures.length - completed}</span>
        <span className="tdc-stat-label">Remaining</span>
      </div>
    </div>
  );
}

// ─── QUICK ACTIONS ──────────────────────────────────────────────────
function QuickActions({ t, navigate }: { t: Tournament; navigate: (p: string) => void }) {
  const hasFixtures = t.fixtures.length > 0;
  return (
    <div className="tdc-quick-actions">
      <button
        className="tdc-qa-btn tdc-qa-btn--primary"
        disabled={!hasFixtures}
        onClick={() => navigate(`/kabaddi/create/teams`)}
        title={!hasFixtures ? "Generate schedule first" : "Start a match"}
      >
        <span className="tdc-qa-icon">🚀</span>
        <span>Start Match</span>
      </button>
      <button className="tdc-qa-btn" onClick={() => navigate(`/tournaments/${t.id}/setup`)}>
        <span className="tdc-qa-icon">📅</span>
        <span>Schedule</span>
      </button>
      <button className="tdc-qa-btn" onClick={() => navigate(`/tournaments/${t.id}/add-teams`)}>
        <span className="tdc-qa-icon">👥</span>
        <span>Add Teams</span>
      </button>
      <button className="tdc-qa-btn" onClick={() => navigate(`/tournaments/${t.id}/setup`)}>
        <span className="tdc-qa-icon">⚙️</span>
        <span>Setup</span>
      </button>
    </div>
  );
}

// ─── MATCH CARD ────────────────────────────────────────────────────
function MatchCard({ f, teams, navigate }: { f: TFixture; teams: TTeam[]; navigate: (p: string) => void }) {
  const isLive      = f.status === "live";
  const isCompleted = f.status === "completed";
  const nameA = teamName(f.teamAId, teams);
  const nameB = teamName(f.teamBId, teams);
  const colorA = teams.find(t => t.id === f.teamAId)?.color ?? "#FF5722";
  const colorB = teams.find(t => t.id === f.teamBId)?.color ?? "#3182CE";

  return (
    <div className={`tdc-match-card ${isLive ? "tdc-match-card--live" : ""} ${isCompleted ? "tdc-match-card--done" : ""}`}>
      {isLive && <div className="tdc-live-badge"><span className="tdc-live-dot" />LIVE</div>}
      <div className="tdc-match-teams">
        <div className="tdc-match-team">
          <div className="tdc-team-dot" style={{ background: colorA }} />
          <span className="tdc-team-name">{nameA}</span>
        </div>
        <div className="tdc-match-score-box">
          {isLive || isCompleted
            ? <span className="tdc-score">{f.scoreA ?? 0} - {f.scoreB ?? 0}</span>
            : <span className="tdc-vs">VS</span>
          }
        </div>
        <div className="tdc-match-team tdc-match-team--right">
          <span className="tdc-team-name">{nameB}</span>
          <div className="tdc-team-dot" style={{ background: colorB }} />
        </div>
      </div>
      <div className="tdc-match-meta">
        {f.date && <span>📅 {fmtDate(f.date)}</span>}
        {f.time && <span>⏰ {f.time}</span>}
        {f.court && <span>🏟 {f.court}</span>}
      </div>
      <div className="tdc-match-actions">
        {isLive && <button className="tdc-btn tdc-btn--live" onClick={() => navigate(`/matches/${f.id}/live`)}>🔴 Go to Live Scoring</button>}
        {!isLive && !isCompleted && <button className="tdc-btn tdc-btn--start" onClick={() => navigate(`/kabaddi/create/teams`)}>▶ Start Match</button>}
        {isCompleted && <button className="tdc-btn tdc-btn--summary" onClick={() => navigate(`/matches/${f.id}/summary`)}>📊 View Summary</button>}
      </div>
    </div>
  );
}

// ─── MATCHES SECTION ────────────────────────────────────────────────
function MatchesSection({ t, navigate }: { t: Tournament; navigate: (p: string) => void }) {
  const [tab, setTab] = useState<"upcoming" | "live" | "completed">("upcoming");
  const live      = t.fixtures.filter(f => f.status === "live");
  const upcoming  = t.fixtures.filter(f => f.status === "scheduled");
  const completed = t.fixtures.filter(f => f.status === "completed");
  const visible   = tab === "live" ? live : tab === "upcoming" ? upcoming : completed;

  useEffect(() => {
    if (live.length > 0) setTab("live");
    else if (upcoming.length > 0) setTab("upcoming");
    else setTab("completed");
  }, [t.fixtures.length]);

  return (
    <div className="tdc-section">
      <div className="tdc-section-header">
        <h2 className="tdc-section-title">Matches</h2>
      </div>
      <div className="tdc-match-tabs">
        {(["upcoming", "live", "completed"] as const).map(tb => (
          <button key={tb} onClick={() => setTab(tb)} className={`tdc-match-tab ${tab === tb ? "tdc-match-tab--active" : ""}`}>
            {tb === "live" && live.length > 0 && <span className="tdc-tab-live-dot" />}
            {tb.charAt(0).toUpperCase() + tb.slice(1)}
            <span className="tdc-tab-count">{tb === "live" ? live.length : tb === "upcoming" ? upcoming.length : completed.length}</span>
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <div className="tdc-empty">
          <div className="tdc-empty-icon">{tab === "live" ? "🎙" : tab === "upcoming" ? "📅" : "🏁"}</div>
          <p>{tab === "live" ? "No live matches right now." : tab === "upcoming" ? "No upcoming matches. Generate a schedule first." : "No completed matches yet."}</p>
        </div>
      ) : (
        visible.map(f => <MatchCard key={f.id} f={f} teams={t.teams} navigate={navigate} />)
      )}
    </div>
  );
}

// ─── POINTS TABLE ────────────────────────────────────────────────────
function PointsTable({ t }: { t: Tournament }) {
  const rows = calcStandings(t.teams, t.fixtures);
  const hasData = t.fixtures.some(f => f.status === "completed");
  return (
    <div className="tdc-section">
      <h2 className="tdc-section-title">Points Table</h2>
      {!hasData ? (
        <div className="tdc-empty tdc-empty--sm">
          <div className="tdc-empty-icon">🏆</div>
          <p>Standings update after first match</p>
        </div>
      ) : (
        <div className="tdc-standings-table">
          <div className="tdc-standings-head">
            <span className="tdc-col-rank">#</span>
            <span className="tdc-col-team">Team</span>
            <span className="tdc-col-num">P</span>
            <span className="tdc-col-num">W</span>
            <span className="tdc-col-num">L</span>
            <span className="tdc-col-pts">Pts</span>
          </div>
          {rows.map((r, i) => (
            <div key={r.name} className={`tdc-standings-row ${i === 0 ? "tdc-standings-row--top" : ""}`}>
              <span className="tdc-col-rank">{i + 1}</span>
              <span className="tdc-col-team">
                <span className="tdc-team-dot-sm" style={{ background: r.color }} />{r.name}
              </span>
              <span className="tdc-col-num">{r.P}</span>
              <span className="tdc-col-num">{r.W}</span>
              <span className="tdc-col-num">{r.L}</span>
              <span className="tdc-col-pts tdc-pts">{r.pts}</span>
            </div>
          ))}
        </div>
      )}
      <div className="tdc-standings-rule">Tiebreaker: Points → Score Diff → H2H</div>
    </div>
  );
}

// ─── TEAMS LIST ────────────────────────────────────────────────────
function TeamsList({ t, navigate }: { t: Tournament; navigate: (p: string) => void }) {
  return (
    <div className="tdc-section">
      <div className="tdc-section-header">
        <h2 className="tdc-section-title">Teams</h2>
        <button className="tdc-link-btn" onClick={() => navigate(`/tournaments/${t.id}/setup`)}>Manage →</button>
      </div>
      {t.teams.length === 0 ? (
        <div className="tdc-empty tdc-empty--sm">
          <p>No teams yet.</p>
          <button className="tdc-btn tdc-btn--start" onClick={() => navigate(`/tournaments/${t.id}/setup`)}>+ Add Teams</button>
        </div>
      ) : (
        <div className="tdc-teams-list">
          {t.teams.map(team => (
            <div key={team.id} className="tdc-team-row">
              <div className="tdc-team-avatar" style={{ background: team.color }}>{team.name[0]}</div>
              <div className="tdc-team-info">
                <span className="tdc-team-row-name">{team.name}</span>
                <span className="tdc-team-row-meta">{team.players.length} players · {team.captain || "No captain"}</span>
              </div>
              <span className={`tdc-team-status tdc-team-status--${team.registered ? "confirmed" : "pending"}`}>
                {team.registered ? "ready" : "pending"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TOURNAMENT INFO ────────────────────────────────────────────────
function TournamentInfo({ t }: { t: Tournament }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="tdc-section tdc-info-section">
      <button className="tdc-info-toggle" onClick={() => setOpen(o => !o)}>
        <span>⚙️ Tournament Info</span>
        <span className="tdc-info-arrow">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="tdc-info-grid">
          {[
            { label: "Format",    value: t.format },
            { label: "Venue",     value: t.venue },
            { label: "Start",     value: fmtDate(t.startDate) },
            { label: "Half",      value: `${t.halfDuration} min` },
            { label: "Players",   value: `${t.playersOnCourt} on court` },
            { label: "Organizer", value: t.organizer },
          ].map(r => (
            <div key={r.label} className="tdc-info-row">
              <span className="tdc-info-label">{r.label}</span>
              <span className="tdc-info-value">{r.value || "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────
export default function TournamentDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [copied,     setCopied]     = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) { setLoading(false); return; }
      
      // 1. Try Local
      const t = getTournament(id);
      if (t) {
        setTournament(t);
        setLoading(false);
        return;
      }

      // 2. Try Supabase
      const { data: dbT } = await supabase.from('tournaments').select('*').eq('id', id).single();
      if (dbT) {
        setTournament({ 
          ...dbT, 
          status: dbT.status || 'upcoming',
          format: dbT.format || 'league',
          venue: dbT.venue || dbT.venue_name || '',
          startDate: dbT.start_date || dbT.startDate || '',
          endDate: dbT.end_date || dbT.endDate || '',
          cityState: dbT.city_state || dbT.cityState || '',
          teams: [], 
          fixtures: [], 
          groups: [], 
          rounds: [] 
        } as any);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const copyCode = () => {
    if (id) {
      navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="tdc-loading"><div className="tdc-spinner" /><p>Loading...</p></div>;
  if (!tournament) return (
    <div className="tdc-loading">
      <div className="tdc-empty-icon" style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
      <p style={{ fontWeight: 700, color: "#718096" }}>Tournament not found.</p>
      <button style={{ marginTop: 16, padding: "10px 24px", background: "#FF5722", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" }} onClick={() => navigate("/tournaments")}>
        ← Back to Tournaments
      </button>
    </div>
  );

  const statusCfg = getStatusConfig(tournament.status);
  const liveCount = tournament.fixtures.filter(f => f.status === "live").length;

  return (
    <div className="tdc-page" onClick={() => menuOpen && setMenuOpen(false)}>

      {/* HEADER */}
      <div className="tdc-header">
        <div className="tdc-header-top">
          <button className="tdc-back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="tdc-header-actions">
            <button className="tdc-share-btn" onClick={copyCode}>
              {copied ? "✓ Copied!" : "🔗 Share ID"}
            </button>
            <div className="tdc-menu-wrapper" onClick={e => e.stopPropagation()}>
              <button className="tdc-menu-btn" onClick={() => setMenuOpen(o => !o)}>⋮</button>
              {menuOpen && (
                <div className="tdc-dropdown">
                  <button className="tdc-dropdown-item" onClick={() => { navigate(`/tournaments/${id}/setup`); setMenuOpen(false); }}>⚙️ Setup Dashboard</button>
                  <button className="tdc-dropdown-item" onClick={() => setMenuOpen(false)}>✏️ Edit Tournament</button>
                  <button className="tdc-dropdown-item" onClick={() => setMenuOpen(false)}>📢 Announce</button>
                  <button className="tdc-dropdown-item tdc-dropdown-item--danger" onClick={() => setMenuOpen(false)}>🗑 Delete</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="tdc-hero">
          <div className="tdc-hero-left">
            <div className="tdc-trophy-wrap">🏆</div>
            <div>
              <h1 className="tdc-name">{tournament.name}</h1>
              <p className="tdc-venue">📍 {tournament.venue || tournament.cityState}</p>
              <div className="tdc-badges">
                <span className={`tdc-status ${statusCfg.cls}`}>
                  {statusCfg.pulse && <span className="tdc-pulse" />}
                  {statusCfg.label}
                </span>
                <span className="tdc-badge-info">{tournament.format}</span>
                <span className="tdc-badge-info">{tournament.teams.length} Teams</span>
              </div>
            </div>
          </div>
          <button
            className={`tdc-start-hero-btn ${tournament.fixtures.length === 0 ? "tdc-start-hero-btn--disabled" : ""}`}
            disabled={tournament.fixtures.length === 0}
            onClick={() => navigate(`/kabaddi/create/teams`)}
          >
            {liveCount > 0 ? `🔴 ${liveCount} Live` : "🚀 Start Match"}
          </button>
        </div>
      </div>

      {/* SMART BANNER */}
      <SmartBanner t={tournament} navigate={navigate} />

      {/* STATS */}
      <StatsStrip t={tournament} />

      {/* QUICK ACTIONS */}
      <QuickActions t={tournament} navigate={navigate} />

      {/* 2-COL BODY */}
      <div className="tdc-body">
        <div className="tdc-col-left">
          <MatchesSection t={tournament} navigate={navigate} />
          <TournamentInfo t={tournament} />
        </div>
        <div className="tdc-col-right">
          <PointsTable t={tournament} />
          <TeamsList t={tournament} navigate={navigate} />
        </div>
      </div>
    </div>
  );
}
