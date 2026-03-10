import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const F = "'Nunito', sans-serif";

// ─── DATA ────────────────────────────────────────────────────────────────────

const TOURNAMENT = {
  name: "Kabaddi Premier League 2026",
  short: "KPL 2026",
  dates: "Jan 10 to Mar 15, 2026",
  location: "Bengaluru, Karnataka",
  format: "League + Knockout",
  teams: 8,
  matches: 28,
  prize: "₹50,000",
  organizer: "SKBC Sports Association",
  status: "ongoing",
};

const TEAMS = [
  { id: 1, abbr: "SK", name: "SKBC", color: "#0ea5e9", pts: 14, w: 3, l: 1 },
  { id: 2, abbr: "RG", name: "Rangers", color: "#f59e0b", pts: 12, w: 3, l: 2 },
  { id: 3, abbr: "WR", name: "Warriors", color: "#10b981", pts: 10, w: 2, l: 2 },
  { id: 4, abbr: "TT", name: "Titans", color: "#8b5cf6", pts: 8, w: 2, l: 3 },
  { id: 5, abbr: "LN", name: "Lions", color: "#f43f5e", pts: 6, w: 1, l: 3 },
  { id: 6, abbr: "PH", name: "Panthers", color: "#06b6d4", pts: 4, w: 1, l: 4 },
];

const MATCHES = [
  {
    id: 1, status: "live", type: "LEAGUE",
    team1: "SKBC", team2: "Rangers",
    score1: 18, score2: 15,
    date: "1/12/2026, 7:00:00 PM",
    half: "Half 1", timer: "04:12",
    t1color: "#0ea5e9", t2color: "#f59e0b",
    t1abbr: "SK", t2abbr: "RG",
    raids: [
      { player: "Bharath Gowda", team: "SKBC", pts: 8, raids: 12, sr: 6 },
      { player: "Ashu Malik", team: "Rangers", pts: 6, raids: 10, sr: 4 },
    ],
    tackles: [
      { player: "Ravi Kumar", team: "SKBC", pts: 4, tackles: 6 },
      { player: "Fazel Atrachali", team: "Rangers", pts: 3, tackles: 5 },
    ],
    timeline: [
      { min: 2, event: "Raid Point", player: "Bharath Gowda", team: "SKBC", score: "2-0" },
      { min: 4, event: "Tackle Point", player: "Fazel Atrachali", team: "Rangers", score: "2-1" },
      { min: 7, event: "Super Raid", player: "Ashu Malik", team: "Rangers", score: "2-4" },
      { min: 11, event: "All Out!", player: "SKBC", team: "SKBC", score: "7-4" },
      { min: 15, event: "Bonus Point", player: "Bharath Gowda", team: "SKBC", score: "12-8" },
      { min: 18, event: "Super Tackle", player: "Ravi Kumar", team: "SKBC", score: "15-10" },
    ],
  },
  {
    id: 2, status: "completed", type: "LEAGUE",
    team1: "Warriors", team2: "Titans",
    score1: 28, score2: 31,
    date: "1/11/2026, 7:00:00 PM",
    winner: "Titans",
    t1color: "#10b981", t2color: "#8b5cf6",
    t1abbr: "WR", t2abbr: "TT",
    raids: [
      { player: "Dev Singh", team: "Titans", pts: 14, raids: 18, sr: 10 },
      { player: "Maninder Singh", team: "Warriors", pts: 11, raids: 16, sr: 8 },
    ],
    tackles: [
      { player: "Sandeep Narwal", team: "Titans", pts: 7, tackles: 9 },
      { player: "Surjeet Singh", team: "Warriors", pts: 5, tackles: 7 },
    ],
    timeline: [
      { min: 5, event: "All Out!", player: "Warriors", team: "Titans", score: "0-7" },
      { min: 12, event: "Super Raid", player: "Dev Singh", team: "Titans", score: "5-16" },
      { min: 20, event: "Half Time", player: "", team: "", score: "14-18" },
      { min: 28, event: "All Out!", player: "Titans", team: "Warriors", score: "24-22" },
      { min: 35, event: "Super Tackle", player: "Sandeep Narwal", team: "Titans", score: "28-29" },
    ],
  },
  {
    id: 3, status: "upcoming", type: "LEAGUE",
    team1: "Lions", team2: "Panthers",
    score1: null, score2: null,
    date: "1/15/2026, 7:00:00 PM",
    t1color: "#f43f5e", t2color: "#06b6d4",
    t1abbr: "LN", t2abbr: "PH",
    raids: [], tackles: [], timeline: [],
  },
];

const KEY_STATS = {
  topRaider: { name: "Ashu Malik", team: "Rangers", pts: 82, abbr: "RG", color: "#f59e0b" },
  topDefender: { name: "Fazel Atrachali", team: "Rangers", pts: 36, abbr: "RG", color: "#f59e0b" },
  mostRaids: { name: "Bharath Gowda", team: "SKBC", val: 124, abbr: "SK", color: "#0ea5e9" },
  bestSR: { name: "Dev Singh", team: "Titans", val: "78%", abbr: "TT", color: "#8b5cf6" },
  mostAllOuts: { name: "SKBC", team: "", val: 8, abbr: "SK", color: "#0ea5e9" },
  superRaids: { name: "Ashu Malik", team: "Rangers", val: 12, abbr: "RG", color: "#f59e0b" },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function TeamBadge({ abbr, color, size = 36 }: { abbr: string, color: string, size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: `linear-gradient(135deg, ${color}, ${color}aa)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 900, fontSize: size * 0.35,
      fontFamily: F, flexShrink: 0,
      boxShadow: `0 2px 8px ${color}44`
    }}>{abbr}</div>
  );
}

function Pill({ children, color = "#0ea5e9", bg }: { children: React.ReactNode, color?: string, bg?: string }) {
  return (
    <span style={{
      background: bg || `${color}18`, color,
      fontSize: 11, fontWeight: 800, borderRadius: 20,
      padding: "2px 10px", border: `1px solid ${color}33`
    }}>{children}</span>
  );
}

// ─── MATCH CARD ───────────────────────────────────────────────────────────────

function MatchCard({ match, onClick }: { match: any, onClick: (match: any) => void }) {
  const isLive = match.status === "live";
  const isUpcoming = match.status === "upcoming";
  return (
    <div onClick={() => !isUpcoming && onClick(match)} style={{
      background: "#fff", borderRadius: 16, padding: "14px 16px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: 12,
      cursor: isUpcoming ? "default" : "pointer",
      border: isLive ? "1.5px solid #fbbf24" : "1.5px solid transparent",
      transition: "all 0.2s"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {isLive && (
            <span style={{
              background: "#f59e0b", color: "#fff", fontSize: 10,
              fontWeight: 900, borderRadius: 20, padding: "2px 8px",
              animation: "pulse 1.5s infinite"
            }}>● LIVE</span>
          )}
          <Pill color="#64748b">{match.type}</Pill>
        </div>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{match.date.split(",")[0]}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
          <TeamBadge abbr={match.t1abbr} color={match.t1color} size={40} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>{match.team1}</div>
            {!isUpcoming && <div style={{ fontWeight: 900, fontSize: 22, color: "#1e293b", lineHeight: 1 }}>{match.score1}</div>}
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "0 4px" }}>
          {isUpcoming ? (
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>
              <div>VS</div>
              <div style={{ fontSize: 10, marginTop: 4 }}>{match.date.split(",")[1]?.trim()}</div>
            </div>
          ) : (
            <div style={{ color: "#94a3b8", fontWeight: 700, fontSize: 13 }}>–</div>
          )}
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, flexDirection: "row-reverse" }}>
          <TeamBadge abbr={match.t2abbr} color={match.t2color} size={40} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>{match.team2}</div>
            {!isUpcoming && <div style={{ fontWeight: 900, fontSize: 22, color: "#1e293b", lineHeight: 1 }}>{match.score2}</div>}
          </div>
        </div>
      </div>

      {isLive && (
        <div style={{
          marginTop: 10, background: "#f0fdf4", borderRadius: 8, padding: "6px 12px",
          display: "flex", alignItems: "center", gap: 6
        }}>
          <span style={{ color: "#22c55e", fontSize: 12 }}>●</span>
          <span style={{ fontSize: 12, color: "#15803d", fontWeight: 700 }}>
            {match.half} • {match.timer}
          </span>
        </div>
      )}
      {match.status === "completed" && match.winner && (
        <div style={{ marginTop: 8 }}>
          <Pill color="#16a34a">🏆 {match.winner} Won</Pill>
        </div>
      )}
    </div>
  );
}

// ─── MATCH DETAIL ─────────────────────────────────────────────────────────────

function MatchDetail({ match, onBack }: { match: any, onBack: () => void }) {
  const [tab, setTab] = useState("info");
  const isLive = match.status === "live";

  const tabs = ["Info", "Live", "Scorecard"];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f9ff", fontFamily: F }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(145deg, #0c4a6e, #0ea5e9)",
        padding: "0 0 0", position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.07,
          backgroundImage: `repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)`,
          backgroundSize: "20px 20px"
        }} />
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px 16px", position: "relative" }}>
          <button onClick={onBack} style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(255,255,255,0.2)", border: "none",
            color: "#fff", cursor: "pointer", fontSize: 18
          }}>←</button>
          <div style={{ flex: 1, textAlign: "center", color: "#bae6fd", fontSize: 12, fontWeight: 700 }}>
            {match.type} • KPL 2026
          </div>
          <div style={{ width: 36 }} />
        </div>

        {/* Score Banner */}
        <div style={{ padding: "0 20px 24px", position: "relative" }}>
          {isLive && (
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <span style={{
                background: "#f59e0b", color: "#fff", fontSize: 11,
                fontWeight: 900, borderRadius: 20, padding: "3px 14px"
              }}>● LIVE — {match.half} • {match.timer}</span>
            </div>
          )}
          {match.status === "completed" && (
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <span style={{ color: "#fbbf24", fontWeight: 900, fontSize: 15 }}>
                🏆 {match.winner} Won
              </span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <TeamBadge abbr={match.t1abbr} color={match.t1color} size={52} />
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginTop: 6 }}>{match.team1}</div>
              {match.score1 !== null && (
                <div style={{ color: "#fff", fontWeight: 900, fontSize: 40, lineHeight: 1, marginTop: 4 }}>{match.score1}</div>
              )}
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontWeight: 900, fontSize: 20 }}>VS</div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <TeamBadge abbr={match.t2abbr} color={match.t2color} size={52} />
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginTop: 6 }}>{match.team2}</div>
              {match.score2 !== null && (
                <div style={{ color: "#fff", fontWeight: 900, fontSize: 40, lineHeight: 1, marginTop: 4 }}>{match.score2}</div>
              )}
            </div>
          </div>
          <div style={{ textAlign: "center", color: "#bae6fd", fontSize: 12, marginTop: 10 }}>📅 {match.date}</div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "rgba(0,0,0,0.2)" }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t.toLowerCase())} style={{
              flex: 1, padding: "12px 4px", border: "none",
              background: "none", cursor: "pointer", fontFamily: F,
              fontWeight: 800, fontSize: 13, color: tab === t.toLowerCase() ? "#fff" : "rgba(255,255,255,0.5)",
              borderBottom: tab === t.toLowerCase() ? "2.5px solid #fbbf24" : "2.5px solid transparent"
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* INFO TAB */}
        {tab === "info" && (
          <>
            <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", marginBottom: 14 }}>Match Info</div>
              {[
                ["📍 Venue", "Kabaddi Ground, Bengaluru"],
                ["📅 Date & Time", match.date],
                ["🏷️ Format", "League Stage"],
                ["⏱️ Duration", "40 min (2 halves)"],
                ["🧑‍⚖️ Referee", "Kumar Raj"],
              ].map(([k, v], i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 0", borderBottom: i < 4 ? "1px solid #f1f5f9" : "none"
                }}>
                  <span style={{ fontSize: 13, color: "#64748b" }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Player Stats in Match */}
            {match.raids.length > 0 && (
              <>
                <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", marginBottom: 12 }}>⚡ Raid Leaders</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8, padding: "0 4px" }}>
                    <span style={{ flex: 3, fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>PLAYER</span>
                    <span style={{ flex: 1, fontSize: 11, color: "#94a3b8", fontWeight: 700, textAlign: "center" }}>RAIDS</span>
                    <span style={{ flex: 1, fontSize: 11, color: "#94a3b8", fontWeight: 700, textAlign: "center" }}>SR</span>
                    <span style={{ flex: 1, fontSize: 11, color: "#94a3b8", fontWeight: 700, textAlign: "right" }}>PTS</span>
                  </div>
                  {match.raids.map((r: any, i: number) => (
                    <div key={i} style={{
                      display: "flex", gap: 8, alignItems: "center",
                      padding: "10px 4px", borderTop: "1px solid #f1f5f9"
                    }}>
                      <div style={{ flex: 3 }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: "#1e293b" }}>{r.player}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{r.team}</div>
                      </div>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: 13, color: "#475569" }}>{r.raids}</span>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: 13, color: "#475569" }}>{r.sr}</span>
                      <span style={{
                        flex: 1, textAlign: "right", fontWeight: 900, fontSize: 15, color: "#0ea5e9"
                      }}>{r.pts}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", marginBottom: 12 }}>🛡️ Tackle Leaders</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8, padding: "0 4px" }}>
                    <span style={{ flex: 3, fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>PLAYER</span>
                    <span style={{ flex: 1, fontSize: 11, color: "#94a3b8", fontWeight: 700, textAlign: "center" }}>TACKLES</span>
                    <span style={{ flex: 1, fontSize: 11, color: "#94a3b8", fontWeight: 700, textAlign: "right" }}>PTS</span>
                  </div>
                  {match.tackles.map((t: any, i: number) => (
                    <div key={i} style={{
                      display: "flex", gap: 8, alignItems: "center",
                      padding: "10px 4px", borderTop: "1px solid #f1f5f9"
                    }}>
                      <div style={{ flex: 3 }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: "#1e293b" }}>{t.player}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{t.team}</div>
                      </div>
                      <span style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: 13, color: "#475569" }}>{t.tackles}</span>
                      <span style={{ flex: 1, textAlign: "right", fontWeight: 900, fontSize: 15, color: "#10b981" }}>{t.pts}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* LIVE TAB */}
        {tab === "live" && (
          <div>
            {isLive && (
              <div style={{
                background: "#fef3c7", borderRadius: 14, padding: "12px 16px",
                marginBottom: 16, display: "flex", alignItems: "center", gap: 10,
                border: "1px solid #fde68a"
              }}>
                <span style={{ fontSize: 20 }}>📡</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#92400e" }}>Live Commentary</div>
                  <div style={{ fontSize: 12, color: "#b45309" }}>{match.half} in progress • {match.timer} elapsed</div>
                </div>
              </div>
            )}
            <div style={{ fontWeight: 800, fontSize: 14, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              Match Timeline
            </div>
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", left: 20, top: 0, bottom: 0,
                width: 2, background: "#e2e8f0"
              }} />
              {match.timeline.length > 0 ? match.timeline.map((e: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16, position: "relative" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    background: "#fff", border: "2px solid #e2e8f0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 900, color: "#0ea5e9",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)", zIndex: 1
                  }}>{e.min}'</div>
                  <div style={{
                    flex: 1, background: "#fff", borderRadius: 12, padding: "12px 14px",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.07)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: "#1e293b" }}>{e.event}</span>
                      <span style={{ fontWeight: 900, fontSize: 14, color: "#0ea5e9" }}>{e.score}</span>
                    </div>
                    {e.player && (
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                        {e.player} {e.team ? `• ${e.team}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                  Match hasn't started yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCORECARD TAB */}
        {tab === "scorecard" && (
          <div>
            {/* Half-wise score */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", marginBottom: 14 }}>Score Breakdown</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <span style={{ flex: 2 }} />
                <span style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>HALF 1</span>
                <span style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>HALF 2</span>
                <span style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>TOTAL</span>
              </div>
              {[
                { name: match.team1, h1: match.score1 ? Math.floor(match.score1 * 0.55) : "-", h2: match.score1 ? Math.ceil(match.score1 * 0.45) : "-", total: match.score1 ?? "-", color: match.t1color },
                { name: match.team2, h1: match.score2 ? Math.floor(match.score2 * 0.48) : "-", h2: match.score2 ? Math.ceil(match.score2 * 0.52) : "-", total: match.score2 ?? "-", color: match.t2color },
              ].map((row, i) => (
                <div key={i} style={{
                  display: "flex", gap: 8, alignItems: "center",
                  padding: "10px 0", borderTop: "1px solid #f1f5f9"
                }}>
                  <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: row.color }} />
                    <span style={{ fontWeight: 800, fontSize: 13, color: "#1e293b" }}>{row.name}</span>
                  </div>
                  <span style={{ flex: 1, textAlign: "center", fontWeight: 700, color: "#475569" }}>{row.h1}</span>
                  <span style={{ flex: 1, textAlign: "center", fontWeight: 700, color: "#475569" }}>{row.h2}</span>
                  <span style={{ flex: 1, textAlign: "center", fontWeight: 900, fontSize: 16, color: row.color }}>{row.total}</span>
                </div>
              ))}
            </div>

            {/* Full player scorecard */}
            {match.raids.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", marginBottom: 12 }}>Player Scorecard</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 8, padding: "0 4px" }}>
                  <span style={{ flex: 3, fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>PLAYER</span>
                  <span style={{ flex: 1, fontSize: 11, color: "#94a3b8", fontWeight: 700, textAlign: "center" }}>RAID</span>
                  <span style={{ flex: 1, fontSize: 11, color: "#94a3b8", fontWeight: 700, textAlign: "center" }}>TCKL</span>
                  <span style={{ flex: 1, fontSize: 11, color: "#94a3b8", fontWeight: 700, textAlign: "right" }}>TOTAL</span>
                </div>
                {[...match.raids, ...match.tackles].reduce((acc: any[], p: any) => {
                  const ex = acc.find((x: any) => x.player === p.player);
                  if (!ex) acc.push({ ...p, raidPts: p.pts, tacklePts: 0 });
                  else ex.tacklePts = p.pts;
                  return acc;
                }, [] as any[]).map((p: any, i: number) => (
                  <div key={i} style={{
                    display: "flex", gap: 4, alignItems: "center",
                    padding: "10px 4px", borderTop: "1px solid #f1f5f9"
                  }}>
                    <div style={{ flex: 3 }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#1e293b" }}>{p.player}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{p.team}</div>
                    </div>
                    <span style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: 13, color: "#0ea5e9" }}>{p.raidPts}</span>
                    <span style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: 13, color: "#10b981" }}>{p.tacklePts || 0}</span>
                    <span style={{ flex: 1, textAlign: "right", fontWeight: 900, fontSize: 15, color: "#f59e0b" }}>{(p.raidPts || 0) + (p.tacklePts || 0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TOURNAMENT PAGE ──────────────────────────────────────────────────────────

export default function TournamentPage() {
  const [tab, setTab] = useState("overview");
  const [selectedMatch, setSelectedMatch] = useState(null);

  if (selectedMatch) {
    return <MatchDetail match={selectedMatch} onBack={() => setSelectedMatch(null)} />;
  }

  const tabs = ["Overview", "Matches", "Squads", "Points Table"];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f9ff", fontFamily: F }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      {/* Tournament Header */}
      <div style={{
        background: "linear-gradient(145deg, #0c4a6e 0%, #0ea5e9 70%, #38bdf8 100%)",
        padding: "16px 20px 24px", position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.07,
          backgroundImage: `repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)`,
          backgroundSize: "20px 20px"
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            border: "3px solid rgba(255,255,255,0.4)"
          }}>🏆</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 18, lineHeight: 1.2 }}>{TOURNAMENT.short}</div>
            <div style={{ color: "#bae6fd", fontSize: 13, marginTop: 3, fontWeight: 600 }}>{TOURNAMENT.name}</div>
            <div style={{ color: "#7dd3fc", fontSize: 12, marginTop: 2 }}>📅 {TOURNAMENT.dates}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, position: "relative" }}>
          <Pill color="#fbbf24" bg="rgba(251,191,36,0.2)">● LIVE</Pill>
          <Pill color="#fff" bg="rgba(255,255,255,0.15)">{TOURNAMENT.teams} Teams</Pill>
          <Pill color="#fff" bg="rgba(255,255,255,0.15)">{TOURNAMENT.format}</Pill>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: "#fff", display: "flex",
        borderBottom: "1px solid #e2e8f0",
        overflowX: "auto", position: "sticky", top: 0, zIndex: 10
      }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t.toLowerCase().replace(" ", ""))} style={{
            flex: "0 0 auto", padding: "13px 16px",
            border: "none", background: "none", cursor: "pointer",
            fontFamily: F, fontWeight: 800, fontSize: 13,
            color: tab === t.toLowerCase().replace(" ", "") ? "#0ea5e9" : "#94a3b8",
            borderBottom: tab === t.toLowerCase().replace(" ", "") ? "2.5px solid #0ea5e9" : "2.5px solid transparent",
            whiteSpace: "nowrap"
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <>
            {/* Featured Matches */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>Featured Matches</div>
              <button onClick={() => setTab("matches")} style={{
                background: "none", border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: 13, color: "#0ea5e9", fontFamily: F
              }}>All Matches →</button>
            </div>
            {MATCHES.slice(0, 2).map(m => (
              <MatchCard key={m.id} match={m} onClick={setSelectedMatch} />
            ))}

            {/* Key Stats */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12, marginTop: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>🔑 Key Stats</div>
              <Link to="/key-stats" style={{ fontWeight:700, fontSize:13, color:"#0ea5e9", textDecoration:'none' }}>Full Key Stats →</Link>
            </div>
            <div style={{ background: "#fff", borderRadius: 14, padding: "4px 0", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 20 }}>
              {[
                { label: "Top Raider", icon: "⚡", player: KEY_STATS.topRaider.name, team: KEY_STATS.topRaider.team, val: `${KEY_STATS.topRaider.pts} pts`, abbr: KEY_STATS.topRaider.abbr, color: KEY_STATS.topRaider.color },
                { label: "Top Defender", icon: "🛡️", player: KEY_STATS.topDefender.name, team: KEY_STATS.topDefender.team, val: `${KEY_STATS.topDefender.pts} tackle pts`, abbr: KEY_STATS.topDefender.abbr, color: KEY_STATS.topDefender.color },
                { label: "Most Raids", icon: "🏃", player: KEY_STATS.mostRaids.name, team: KEY_STATS.mostRaids.team, val: `${KEY_STATS.mostRaids.val} raids`, abbr: KEY_STATS.mostRaids.abbr, color: KEY_STATS.mostRaids.color },
                { label: "Best Raid %", icon: "🎯", player: KEY_STATS.bestSR.name, team: KEY_STATS.bestSR.team, val: KEY_STATS.bestSR.val, abbr: KEY_STATS.bestSR.abbr, color: KEY_STATS.bestSR.color },
                { label: "Super Raids", icon: "🔥", player: KEY_STATS.superRaids.name, team: KEY_STATS.superRaids.team, val: `${KEY_STATS.superRaids.val} super raids`, abbr: KEY_STATS.superRaids.abbr, color: KEY_STATS.superRaids.color },
                { label: "Most All Outs", icon: "💥", player: KEY_STATS.mostAllOuts.name, team: "", val: `${KEY_STATS.mostAllOuts.val} all outs`, abbr: KEY_STATS.mostAllOuts.abbr, color: KEY_STATS.mostAllOuts.color },
              ].map((item, i, arr) => (
                <Link to="/key-stats" key={i} style={{
                  display: "flex", alignItems: "center", padding: "12px 16px",
                  borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none", gap: 12,
                  textDecoration:'none'
                }}>
                  <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#1e293b", marginTop: 1 }}>{item.player}</div>
                    {item.team && <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.team}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 900, fontSize: 14, color: item.color }}>{item.val}</span>
                    <TeamBadge abbr={item.abbr} color={item.color} size={28} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Teams / Squads strip */}
            <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", marginBottom: 12 }}>Teams</div>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4, marginBottom: 20 }}>
              {TEAMS.map(t => (
                <div key={t.id} style={{ textAlign: "center", flexShrink: 0, width: 64 }}>
                  <TeamBadge abbr={t.abbr} color={t.color} size={52} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginTop: 6 }}>{t.name}</div>
                </div>
              ))}
            </div>

            {/* Series Info */}
            <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", marginBottom: 12 }}>📋 Series Info</div>
            <div style={{ background: "#fff", borderRadius: 14, padding: "4px 0", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 16 }}>
              {[
                ["🏆 Tournament", TOURNAMENT.name],
                ["📅 Dates", TOURNAMENT.dates],
                ["📍 Location", TOURNAMENT.location],
                ["🎮 Format", TOURNAMENT.format],
                ["👥 Teams", `${TOURNAMENT.teams} teams`],
                ["🎯 Total Matches", `${TOURNAMENT.matches} matches`],
                ["💰 Prize Pool", TOURNAMENT.prize],
                ["🏢 Organizer", TOURNAMENT.organizer],
              ].map(([k, v], i, arr) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none"
                }}>
                  <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", textAlign: "right", maxWidth: "55%" }}>{v}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── MATCHES TAB ── */}
        {tab === "matches" && (
          <>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", marginBottom: 12 }}>All Matches</div>
            {MATCHES.map(m => (
              <MatchCard key={m.id} match={m} onClick={setSelectedMatch} />
            ))}
          </>
        )}

        {/* ── SQUADS TAB ── */}
        {tab === "squads" && (
          <>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", marginBottom: 12 }}>Team Squads</div>
            {TEAMS.map(t => (
              <div key={t.id} style={{
                background: "#fff", borderRadius: 14, padding: 16,
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 12
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <TeamBadge abbr={t.abbr} color={t.color} size={44} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{t.w}W - {t.l}L • {t.pts} pts</div>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <Pill color={t.color}>{t.pts} pts</Pill>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Captain", "Raider", "Defender", "All-rounder"].map((role, i) => (
                    <div key={i} style={{
                      flex: 1, background: "#f8fafc", borderRadius: 8, padding: "8px 4px", textAlign: "center"
                    }}>
                      <div style={{ fontSize: 16 }}>{["⭐", "⚡", "🛡️", "🔄"][i]}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginTop: 3 }}>{role}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>2</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── POINTS TABLE TAB ── */}
        {tab === "pointstable" && (
          <>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", marginBottom: 12 }}>Points Table</div>
            <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
              {/* Header */}
              <div style={{
                display: "flex", background: "#f8fafc",
                padding: "10px 16px", borderBottom: "1px solid #e2e8f0"
              }}>
                <span style={{ flex: 3, fontSize: 11, color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Team</span>
                {["P", "W", "L", "PTS"].map(h => (
                  <span key={h} style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#94a3b8", fontWeight: 800 }}>{h}</span>
                ))}
              </div>
              {TEAMS.sort((a, b) => b.pts - a.pts).map((t, i) => (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", padding: "12px 16px",
                  borderBottom: "1px solid #f1f5f9",
                  background: i < 4 ? "transparent" : "#fef9f9"
                }}>
                  <div style={{ flex: 3, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 22, fontWeight: 900, fontSize: 13,
                      color: i < 4 ? "#0ea5e9" : "#94a3b8"
                    }}>{i + 1}</span>
                    <TeamBadge abbr={t.abbr} color={t.color} size={32} />
                    <span style={{ fontWeight: 800, fontSize: 13, color: "#1e293b" }}>{t.name}</span>
                  </div>
                  <span style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: 13, color: "#475569" }}>{t.w + t.l}</span>
                  <span style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: 13, color: "#22c55e" }}>{t.w}</span>
                  <span style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: 13, color: "#f43f5e" }}>{t.l}</span>
                  <span style={{ flex: 1, textAlign: "center", fontWeight: 900, fontSize: 15, color: t.color }}>{t.pts}</span>
                </div>
              ))}
              <div style={{ padding: "10px 16px", background: "#f8fafc" }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0ea5e9" }} />
                    <span style={{ fontSize: 11, color: "#64748b" }}>Qualify for Knockout</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f43f5e" }} />
                    <span style={{ fontSize: 11, color: "#64748b" }}>Eliminated</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
