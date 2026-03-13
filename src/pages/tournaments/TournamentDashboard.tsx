import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./tournament-details.css";
import { 
  Tournament, 
  TournamentTeam as Team, 
  TournamentFixture as Fixture, 
  TournamentStandingRow as StandingRow, 
  TournamentPlayerStat as PlayerStat 
} from "../../features/kabaddi/types/kabaddi.types";
import { getTournament, getTournamentTeams, getTournamentFixtures } from "../../shared/services/tournamentService";

// ─────────────────────────────────────────────────────────────
// MOCK DATA — replace with your API / useTournament(id) hook
// ─────────────────────────────────────────────────────────────
const TOURNAMENT: Tournament = {
  id: "kpl2026",
  name: "Zilla Kabaddi Cup 2025",
  venue: "Nehru Stadium, Pune",
  level: "District",
  status: "Registration Open",
  startDate: "Mar 10, 2025",
  endDate: "Mar 15, 2025",
  totalTeams: 8,
  confirmedTeams: 5,
  totalMatches: 14,
  completedMatches: 2,
  joinCode: "KAB2025",
};

const TEAMS: Team[] = [
  { id: 1, name: "Pune Warriors",   color: "#e74c3c", captain: "Arjun Patil",  players: 12, status: "confirmed" },
  { id: 2, name: "Mumbai Titans",   color: "#2980b9", captain: "Rohit Sharma", players: 11, status: "confirmed" },
  { id: 3, name: "Delhi Kings",     color: "#27ae60", captain: "Suresh Kumar", players: 12, status: "confirmed" },
  { id: 4, name: "Chennai Bulls",   color: "#f39c12", captain: "Karthik V.",   players: 10, status: "confirmed" },
  { id: 5, name: "Kolkata Riders",  color: "#8e44ad", captain: "Amit Das",     players: 9,  status: "confirmed" },
  { id: 6, name: "Hyderabad Hawks", color: "#1abc9c", captain: "—",            players: 0,  status: "invited"   },
  { id: 7, name: "Jaipur Giants",   color: "#e67e22", captain: "—",            players: 0,  status: "pending"   },
  { id: 8, name: "Bengaluru Force", color: "#c0392b", captain: "—",            players: 0,  status: "pending"   },
];

const FIXTURES: Fixture[] = [
  { id: 1, round: "Round 1", teamA: "Pune Warriors",  teamB: "Delhi Kings",     date: "Mar 9",  time: "10:00 AM", court: "Court 1", scorer: "Rahul S.",  scorerStatus: "confirmed",  status: "completed", result: "38 – 22" },
  { id: 2, round: "Round 1", teamA: "Mumbai Titans",  teamB: "Chennai Bulls",   date: "Mar 9",  time: "12:00 PM", court: "Court 2", scorer: "Vikram P.", scorerStatus: "confirmed",  status: "completed", result: "29 – 25" },
  { id: 3, round: "Round 2", teamA: "Delhi Kings",    teamB: "Chennai Bulls",   date: "Mar 10", time: "12:00 PM", court: "Court 2", scorer: "Rahul S.",  scorerStatus: "confirmed",  status: "scheduled" },
  { id: 4, round: "Round 2", teamA: "Kolkata Riders", teamB: "Hyderabad Hawks", date: "Mar 10", time: "02:30 PM", court: "Court 1", scorer: null,        scorerStatus: "unassigned", status: "scheduled" },
  { id: 5, round: "Round 2", teamA: "Jaipur Giants",  teamB: "Bengaluru Force", date: "Mar 11", time: "10:00 AM", court: "Court 2", scorer: "Vikram P.", scorerStatus: "pending",    status: "scheduled" },
];

const STANDINGS: StandingRow[] = [
  { rank: 1, team: "Pune Warriors",  color: "#e74c3c", played: 2, won: 2, lost: 0, points: 4, diff: "+12" },
  { rank: 2, team: "Mumbai Titans",  color: "#2980b9", played: 2, won: 1, lost: 1, points: 2, diff: "+3"  },
  { rank: 3, team: "Delhi Kings",    color: "#27ae60", played: 2, won: 1, lost: 1, points: 2, diff: "-2"  },
  { rank: 4, team: "Chennai Bulls",  color: "#f39c12", played: 2, won: 0, lost: 2, points: 0, diff: "-13" },
];

const TOP_RAIDERS: PlayerStat[]  = [
  { name: "Arjun Patil",  team: "Pune Warriors",  value: 18 },
  { name: "Rohit Sharma", team: "Mumbai Titans",  value: 14 },
  { name: "Karthik V.",   team: "Chennai Bulls",  value: 11 },
];
const TOP_TACKLERS: PlayerStat[] = [
  { name: "Suresh Kumar", team: "Delhi Kings",    value: 10 },
  { name: "Amit Das",     team: "Kolkata Riders", value: 8  },
  { name: "Vikram M.",    team: "Pune Warriors",  value: 7  },
];

// ─────────────────────────────────────────────────────────────
// BADGE — maps status string → css class in tournament-details.css
// ─────────────────────────────────────────────────────────────
const BADGE_CLASS: Record<string, string> = {
  "Registration Open": "badge--open",
  "Live":              "badge--live",
  "Upcoming":          "badge--upcoming",
  "Completed":         "badge--completed",
  confirmed:           "badge--confirmed",
  invited:             "badge--invited",
  pending:             "badge--pending",
  unassigned:          "badge--unassigned",
  "✓ Scorer":          "badge--confirmed",
  "No Scorer":         "badge--unassigned",
};

function Badge({ label }: { label: string }) {
  return <span className={`badge ${BADGE_CLASS[label] ?? ""}`}>{label}</span>;
}

function TeamAvatar({ name, color, size = 38 }: { name: string; color: string; size?: number }) {
  return (
    <div
      className="team-avatar"
      style={{ background: color, width: size, height: size, fontSize: size * 0.42 }}
    >
      {name[0]}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────────────────────
function OverviewTab({ onTabChange, fixtures }: { onTabChange: (tab: string) => void, fixtures: Fixture[] }) {
  const teamPct  = Math.round((TOURNAMENT.confirmedTeams   / TOURNAMENT.totalTeams)   * 100);
  const matchPct = Math.round((TOURNAMENT.completedMatches / TOURNAMENT.totalMatches)  * 100);
  
  // Use fixtures from state if available, else fallback to mock
  const displayFixtures = fixtures.length > 0 ? fixtures : FIXTURES;
  const upcoming = displayFixtures.filter(f => f.status === "scheduled").slice(0, 3);

  return (
    <div className="tab-content">

      {/* Stat Cards */}
      <div className="stat-cards">
        {[
          { label: "Teams",   value: `${TOURNAMENT.confirmedTeams}/${TOURNAMENT.totalTeams}`,    icon: "👥" },
          { label: "Matches", value: `${TOURNAMENT.completedMatches}/${TOURNAMENT.totalMatches}`, icon: "🎯" },
          { label: "Status",  value: "Open",                                                      icon: "✅" },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <span className="stat-card__icon">{s.icon}</span>
            <span className="stat-card__value">{s.value}</span>
            <span className="stat-card__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="section-card">
        <h3 className="section-title">Tournament Progress</h3>
        {[
          { label: "Teams Confirmed",  pct: teamPct,  color: "#27ae60" },
          { label: "Matches Played",   pct: matchPct, color: "#e74c3c" },
          { label: "Scorers Assigned", pct: 57,       color: "#e67e22" },
        ].map(p => (
          <div className="progress-row" key={p.label}>
            <div className="progress-row__labels">
              <span>{p.label}</span>
              <span style={{ color: p.color, fontWeight: 700 }}>{p.pct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${p.pct}%`, background: p.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Matches */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Upcoming Matches</h3>
          <button className="link-btn" onClick={() => onTabChange("fixtures")}>View All →</button>
        </div>
        {upcoming.map(m => (
          <div className="fixture-row" key={m.id}>
            <div>
              <p className="fixture-row__teams">
                {m.teamA} <span className="vs">vs</span> {m.teamB}
              </p>
              <p className="fixture-row__meta">📅 {m.date} &nbsp; ⏰ {m.time} &nbsp; 🏟 {m.court}</p>
            </div>
            <Badge label={m.scorerStatus === "confirmed" ? "✓ Scorer" : "No Scorer"} />
          </div>
        ))}
      </div>

      {/* Join Code */}
      <div className="join-code-card">
        <p className="join-code-card__label">🔗 Tournament Join Code</p>
        <p className="join-code-card__code">{TOURNAMENT.joinCode}</p>
        <p className="join-code-card__sub">Share this code so teams can self-register</p>
        <div className="join-code-card__actions">
          <button
            className="btn btn--outline-white"
            onClick={() => navigator.clipboard.writeText(TOURNAMENT.joinCode)}
          >
            📋 Copy Code
          </button>
          <button className="btn btn--whatsapp">📲 WhatsApp</button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-card">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions">
          {[
            { icon: "📅", label: "Schedule Match",   onClick: () => onTabChange("fixtures") },
            { icon: "📢", label: "Send Announcement" },
            { icon: "👤", label: "Assign Scorer"     },
            { icon: "✏️", label: "Edit Tournament"   },
          ].map(a => (
            <button className="quick-action-btn" key={a.label} onClick={a.onClick}>
              <span className="quick-action-btn__icon">{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEAMS TAB
// ─────────────────────────────────────────────────────────────
function TeamsTab() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "confirmed" | "invited" | "pending">("all");

  const filtered = filter === "all" ? TEAMS : TEAMS.filter(t => t.status === filter);

  return (
    <div className="tab-content">

      <div className="filter-pills">
        {(["all", "confirmed", "invited", "pending"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-pill ${filter === f ? "filter-pill--active" : ""}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.map(team => (
        <div className="team-card" key={team.id} style={{ borderLeftColor: team.color }}>
          <TeamAvatar name={team.name} color={team.color} />
          <div className="team-card__info">
            <p className="team-card__name">{team.name}</p>
            <p className="team-card__meta">
              👤 {team.captain} &nbsp;·&nbsp; 🏃 {team.players} Players
            </p>
          </div>
          <div className="team-card__right">
            <Badge label={team.status.charAt(0).toUpperCase() + team.status.slice(1)} />
            <Link to={`/teams/${team.name.toLowerCase().replace(/\s+/g, '-')}`} className="link-btn" style={{ marginTop: 6, display: "block", textDecoration: 'none' }}>View ›</Link>
          </div>
        </div>
      ))}

      <button
        className="add-dashed-btn"
        onClick={() => navigate(`/tournament/${id}/add-teams`)}
      >
        + Add Team
      </button>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FIXTURES TAB
// ─────────────────────────────────────────────────────────────
function FixturesTab({ fixtures, setFixtures }: { fixtures: Fixture[], setFixtures: (f: any) => void }) {
  const { id: tournamentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assigningMatch, setAssigningMatch] = useState<Fixture | null>(null);
  const [searchQuery, setSearchQuery]       = useState("");
  const [showAddSingle, setShowAddSingle]   = useState(false);

  // Form state for a single match
  const [newMatch, setNewMatch] = useState({
    teamA: "", teamB: "", date: "", time: "", round: "Round 1", court: "Court 1"
  });

  const SUGGESTED = [
    { name: "Rahul Sharma", phone: "+91 9876543210" },
    { name: "Vikram Patil", phone: "+91 9823456789" },
    { name: "Ankit Mehta",  phone: "+91 9811234567" },
  ];

  const rounds = [...new Set(fixtures.map(f => f.round))];

  const onAddSingle = () => {
    if (!newMatch.teamA || !newMatch.teamB) return;
    const f: Fixture = {
      id: fixtures.length + 1,
      round: newMatch.round,
      teamA: newMatch.teamA,
      teamB: newMatch.teamB,
      date: newMatch.date,
      time: newMatch.time,
      court: newMatch.court,
      scorer: null,
      scorerStatus: "unassigned",
      status: "scheduled"
    };
    setFixtures([...fixtures, f]);
    setShowAddSingle(false);
  };

  return (
    <div className="tab-content">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: 12 }}>
        <button 
          className="btn btn--outline" 
          onClick={() => setShowAddSingle(true)}
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          + Quick Add
        </button>
        <button 
          className="btn btn--primary" 
          onClick={() => navigate(`/tournament/${tournamentId}/add-schedule`)}
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          📅 Schedule Wizard
        </button>
      </div>

      {showAddSingle && (
        <div className="section-card" style={{ marginBottom: 20, border: '2px dashed #e2e8f0' }}>
          <h4 style={{ margin: '0 0 12px 0' }}>Quick Schedule Single Match</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input className="input" placeholder="Team A" value={newMatch.teamA} onChange={e=>setNewMatch({...newMatch, teamA: e.target.value})} />
            <input className="input" placeholder="Team B" value={newMatch.teamB} onChange={e=>setNewMatch({...newMatch, teamB: e.target.value})} />
            <input className="input" type="date" value={newMatch.date} onChange={e=>setNewMatch({...newMatch, date: e.target.value})} />
            <input className="input" type="time" value={newMatch.time} onChange={e=>setNewMatch({...newMatch, time: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="btn btn--primary btn--sm" onClick={onAddSingle}>Add to Schedule</button>
            <button className="btn btn--ghost btn--sm" onClick={() => setShowAddSingle(false)}>Cancel</button>
          </div>
        </div>
      )}

      {rounds.map(round => (
        <div key={round}>
          <p className="round-label">{round}</p>
          {fixtures.filter(f => f.round === round).map(fixture => (
            <div
              key={fixture.id}
              className={`fixture-card ${fixture.status === "completed" ? "fixture-card--done" : ""}`}
            >
              {/* top meta row */}
              <div className="fixture-card__meta">
                <span>📅 {fixture.date} &nbsp; ⏰ {fixture.time} &nbsp; 🏟 {fixture.court}</span>
                {fixture.status === "completed" && <Badge label="Completed" />}
                {fixture.status === "live"      && <Badge label="Live"      />}
              </div>

              {/* versus row */}
              <div className="fixture-card__versus">
                <span className="fixture-card__team">{fixture.teamA}</span>
                <span className="fixture-card__vs-box">
                  {fixture.status === "completed" ? fixture.result : "VS"}
                </span>
                <span className="fixture-card__team fixture-card__team--right">{fixture.teamB}</span>
              </div>

              {/* scorer row */}
              {fixture.status !== "completed" && (
                <div className="fixture-card__scorer-row">
                  <span>
                    👤 Scorer:&nbsp;
                    <strong style={{ color: fixture.scorer ? "inherit" : "#e74c3c" }}>
                      {fixture.scorer ?? "Not Assigned"}
                    </strong>
                  </span>
                  <button
                    className={`btn btn--sm ${fixture.scorerStatus === "confirmed" ? "btn--success" : "btn--primary"}`}
                    onClick={() => { setAssigningMatch(fixture); setSearchQuery(""); }}
                  >
                    {fixture.scorer ? "Change" : "Assign Scorer"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Assign Scorer Bottom Sheet */}
      {assigningMatch && (
        <>
          <div className="overlay" onClick={() => setAssigningMatch(null)} />
          <div className="bottom-sheet">
            <div className="bottom-sheet__handle" />
            <h3 className="bottom-sheet__title">Assign Scorer</h3>
            <p className="bottom-sheet__sub">
              {assigningMatch.teamA} vs {assigningMatch.teamB}
            </p>
            <div className="search-box">
              <span>🔍</span>
              <input
                type="text"
                className="search-box__input"
                placeholder="Search by name or phone"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <p className="suggested-label">SUGGESTED</p>
            {SUGGESTED.filter(s =>
              s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.phone.includes(searchQuery)
            ).map(scorer => (
              <div className="scorer-row" key={scorer.name}>
                <div>
                  <p className="scorer-row__name">{scorer.name}</p>
                  <p className="scorer-row__phone">{scorer.phone}</p>
                </div>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => setAssigningMatch(null)}
                >
                  Assign
                </button>
              </div>
            ))}
            <button className="btn btn--outline btn--full" style={{ marginTop: 12 }}>
              + Invite New Scorer
            </button>
          </div>
        </>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STANDINGS TAB
// ─────────────────────────────────────────────────────────────
function StandingsTab() {
  return (
    <div className="tab-content">
      <div className="standings-table">

        <div className="standings-header">
          {["#", "Team", "P", "W", "L", "Pts", "+/-"].map(h => (
            <span key={h} className={`standings-col ${h === "Team" ? "standings-col--team" : ""}`}>
              {h}
            </span>
          ))}
        </div>

        {STANDINGS.map((row, i) => (
          <div className={`standings-row ${i === 0 ? "standings-row--top" : ""}`} key={row.rank}>
            <span className="standings-col">{i === 0 ? "🥇" : row.rank}</span>
            <span className="standings-col standings-col--team">
              <TeamAvatar name={row.team} color={row.color} size={28} />
              {row.team.split(" ")[0]}
            </span>
            <span className="standings-col">{row.played}</span>
            <span className="standings-col">{row.won}</span>
            <span className="standings-col">{row.lost}</span>
            <span className="standings-col standings-col--pts">{row.points}</span>
            <span className={`standings-col ${row.diff.startsWith("+") ? "standings-col--pos" : "standings-col--neg"}`}>
              {row.diff}
            </span>
          </div>
        ))}

      </div>

      <div className="info-box">
        ℹ️ Top <strong>2 teams</strong> qualify for knockouts.
        Tiebreaker: Point difference → Head to head.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATS TAB
// ─────────────────────────────────────────────────────────────
function StatsTab() {
  const [type, setType] = useState<"raiders" | "tacklers">("raiders");
  const data = type === "raiders" ? TOP_RAIDERS : TOP_TACKLERS;

  return (
    <div className="tab-content">
      <div className="toggle-group">
        <button
          className={`toggle-btn ${type === "raiders" ? "toggle-btn--active" : ""}`}
          onClick={() => setType("raiders")}
        >
          ⚡ Top Raiders
        </button>
        <button
          className={`toggle-btn ${type === "tacklers" ? "toggle-btn--active" : ""}`}
          onClick={() => setType("tacklers")}
        >
          🛡 Top Tacklers
        </button>
      </div>

      {data.map((player, i) => (
        <div className="stat-player-card" key={player.name}>
          <span className="stat-player-card__medal">
            {["🥇", "🥈", "🥉"][i]}
          </span>
          <Link to={`/players/${player.name.toLowerCase().replace(/\s+/g, '-')}`} className="stat-player-card__info" style={{ textDecoration: 'none', color: 'inherit' }}>
            <p className="stat-player-card__name">{player.name}</p>
            <p className="stat-player-card__team">{player.team}</p>
          </Link>
          <div className="stat-player-card__score">
            <span className="stat-player-card__value">{player.value}</span>
            <span className="stat-player-card__unit">
              {type === "raiders" ? "Raid Pts" : "Tackle Pts"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview",  label: "Overview",  icon: "⚡" },
  { id: "teams",     label: "Teams",     icon: "👥" },
  { id: "fixtures",  label: "Fixtures",  icon: "📅" },
  { id: "standings", label: "Standings", icon: "🏆" },
  { id: "stats",     label: "Stats",     icon: "📈" },
];

export default function TournamentDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);

  useEffect(() => {
    if (id) {
      getTournament(id).then(setTournament);
      getTournamentTeams(id).then(setTeams);
      getTournamentFixtures(id).then(setFixtures);
    }
  }, [id]);

  if (!tournament) return <div style={{ padding: 20 }}>Loading...</div>;

  const renderTab = () => {
    switch (activeTab) {
      case "overview":  return <OverviewTab onTabChange={setActiveTab} fixtures={fixtures} />;
      case "teams":     return <TeamsTab />;
      case "fixtures":  return <FixturesTab fixtures={fixtures} setFixtures={setFixtures} />;
      case "standings": return <StandingsTab />;
      case "stats":     return <StatsTab />;
      default:          return null;
    }
  };

  return (
    <div className="dashboard">

      {/* ── HEADER ── */}
      <div className="dashboard__header">

        <div className="dashboard__header-row">
          <button className="btn btn--back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="menu-wrapper">
            <button className="btn btn--menu" onClick={() => setMenuOpen(o => !o)}>
              ⋮
            </button>
            {menuOpen && (
              <div className="dropdown-menu">
                {[
                  { icon: "✏️", label: "Edit Tournament",    danger: false },
                  { icon: "📢", label: "Send Announcement",  danger: false },
                  { icon: "🔗", label: "Share Link",         danger: false },
                  { icon: "🚫", label: "Close Registration", danger: false },
                  { icon: "🗑", label: "Delete Tournament",  danger: true  },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => setMenuOpen(false)}
                    className={`dropdown-item ${item.danger ? "dropdown-item--danger" : ""}`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard__hero">
          <div className="dashboard__trophy">🏅</div>
          <div>
            <h1 className="dashboard__name">{tournament.name}</h1>
            <p className="dashboard__venue">📍 {tournament.venue}</p>
            <div className="dashboard__badges">
              <Badge label={tournament.status} />
              <Badge label={tournament.level} />
              <span className="dashboard__date-range">
                {tournament.startDate} – {tournament.endDate}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── TAB BAR ── */}
      <div className="tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? "tab-btn--active" : ""}`}
          >
            <span className="tab-btn__icon">{tab.icon}</span>
            <span className="tab-btn__label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div className="dashboard__content">
        {renderTab()}
      </div>

    </div>
  );
}