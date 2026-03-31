import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../../../../shared/services/notificationService";
import { kabaddiScoringService } from "../../../../shared/services/kabaddiScoringService";
import { saveMatchResults, publishMatchNews } from "../../../../shared/services/tournamentService";
import { useAuth } from "../../../../shared/context/AuthContext";
import { supabase } from "../../../../shared/lib/supabase";
import "./KabaddiLiveScorer.css";

const HOME_SQUAD = [
  { id: "h1", name: "Raider 1", jerseyNumber: 1, role: "raider" },
  { id: "h2", name: "Defender 1", jerseyNumber: 2, role: "defender" },
  { id: "h3", name: "Raider 2", jerseyNumber: 3, role: "raider" },
  { id: "h4", name: "Defender 2", jerseyNumber: 4, role: "defender" },
  { id: "h5", name: "All Rounder 1", jerseyNumber: 5, role: "all-rounder" },
  { id: "h6", name: "Defender 3", jerseyNumber: 6, role: "defender" },
  { id: "h7", name: "Raider 3", jerseyNumber: 7, role: "raider" },
];
const GUEST_SQUAD = [
  { id: "g1", name: "Raider A", jerseyNumber: 10, role: "raider" },
  { id: "g2", name: "Defender A", jerseyNumber: 11, role: "defender" },
  { id: "g3", name: "Raider B", jerseyNumber: 12, role: "raider" },
  { id: "g4", name: "Defender B", jerseyNumber: 13, role: "defender" },
  { id: "g5", name: "All Rounder A", jerseyNumber: 14, role: "all-rounder" },
  { id: "g6", name: "Defender C", jerseyNumber: 15, role: "defender" },
  { id: "g7", name: "Raider C", jerseyNumber: 16, role: "raider" },
];
const HOME = { name: "Home Team", abbr: "HOME", color: "#0ea5e9", squad: HOME_SQUAD };
const GUEST = { name: "Guest Team", abbr: "GUEST", color: "#ef4444", squad: GUEST_SQUAD };
const MINS = 20;

const pad = (n: any) => String(n).padStart(2, "0");
const fmt = (s: any) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
const dc = (v: any) => JSON.parse(JSON.stringify(v));

// ── Audio ─────────────────────────────────────────────────────────
function playSound(type: string) {
  try {
    const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
    const g = ctx.createGain();
    g.connect(ctx.destination);
    if (type === "allout") {
      const o = ctx.createOscillator();
      o.connect(g);
      o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.7);
      g.gain.setValueAtTime(0.45, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      o.start(); o.stop(ctx.currentTime + 0.7);
    } else if (type === "warn") {
      [0, 0.2].forEach(t => {
        const o = ctx.createOscillator();
        o.connect(g); o.frequency.value = 660;
        g.gain.setValueAtTime(0.3, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.15);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.15);
      });
    } else if (type === "point") {
      const o = ctx.createOscillator();
      o.connect(g); o.frequency.value = 520;
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      o.start(); o.stop(ctx.currentTime + 0.12);
    }
  } catch (e) { }
}

function mkStats(squad: any[], side: string) {
  const o: any = {};
  squad.forEach(p => {
    o[p.id] = {
      id: p.id, name: p.name, num: p.jerseyNumber, side,
      raids: 0, raidPts: 0, successRaids: 0, emptyRaids: 0,
      tackles: 0, tacklePts: 0, bonusPts: 0, total: 0
    };
  });
  return o;
}

function makeInit(home?: any, guest?: any, mins?: number) {
  const h = home || HOME;
  const g = guest || GUEST;
  const m = mins || MINS;
  return {
    period: 1, clock: m * 60, running: false,
    raidCount: 1, rs: "home", doOrDie: false,
    phase: "playing", history: [] as any[],
    home: { ...h, score: 0, active: 7, consEmpty: 0 },
    guest: { ...g, score: 0, active: 7, consEmpty: 0 },
    stats: { ...mkStats(h.squad || HOME_SQUAD, "home"), ...mkStats(g.squad || GUEST_SQUAD, "guest") },
    eventLog: [] as any[],
    raidClock: 30, raidRunning: false,
  };
}

// ── Raider Strip ──────────────────────────────────────────────────
function RaiderStrip({ squad, onCourt, color, selectedId, onSelect }: any) {
  const available = squad.filter((p: any) => onCourt.has(p.id));
  return (
    <div className="kls-raider-strip">
      <div className="kls-raider-strip__label">👤 Who's Raiding?</div>
      <div className="kls-raider-strip__list">
        <button
          onClick={() => onSelect(null)}
          className="kls-raider-strip__item"
          style={{
            background: selectedId === null ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${selectedId === null ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.08)"}`
          }}
        >
          <span className="kls-raider-strip__num-box kls-raider-strip__num-box--skip">?</span>
          <span className="kls-raider-strip__name kls-raider-strip__name--skip">Skip</span>
        </button>
        {available.map((p: any) => {
          const on = selectedId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="kls-raider-strip__item"
              style={{
                background: on ? `${color}1a` : "rgba(255,255,255,0.04)",
                border: `1.5px solid ${on ? color : "rgba(255,255,255,0.08)"}`
              }}
            >
              <span className="kls-raider-strip__num-box" style={{ background: on ? color : "rgba(255,255,255,0.10)", color: on ? "#fff" : "rgba(255,255,255,0.7)" }}>{p.jerseyNumber}</span>
              <span className="kls-raider-strip__name" style={{ fontWeight: on ? 800 : 700, color: on ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}>{p.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Defender Picker ───────────────────────────────────────────────
function DefenderPicker({ squad, onCourt, color, pts, isSuperTackle, onConfirm }: any) {
  const [sel, setSel] = useState(new Set<string>());
  const tog = (id: string) => setSel(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const available = squad.filter((p: any) => onCourt.has(p.id));
  return (
    <div className="kls-overlay">
      <div className={`kls-modal ${isSuperTackle ? 'kls-modal--super' : 'kls-modal--def'}`}>
        {isSuperTackle && (
          <div className="kls-super-badge">
            <div className="kls-super-badge__title">💪 SUPER TACKLE ZONE!</div>
            <div className="kls-super-badge__sub">+1 bonus point added automatically</div>
          </div>
        )}
        <div className="kls-modal-title">🛡️ Who made the tackle?</div>
        <div className="kls-modal-sub">
          Tackle +{pts}{isSuperTackle ? ` +1 super = ${pts + 1} total` : ""} — tap all defenders
        </div>
        <div className="kls-grid-picker">
          {available.map((p: any) => {
            const on = sel.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => tog(p.id)}
                className="kls-picker-item"
                style={{
                  background: on ? `${color}1a` : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${on ? color : "rgba(255,255,255,0.08)"}`
                }}
              >
                <div className="kls-picker-item__num" style={{ background: on ? color : "rgba(255,255,255,0.10)" }}>{p.jerseyNumber}</div>
                <div className="kls-picker-item__name" style={{ fontWeight: on ? 800 : 700, color: on ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.40)" }}>{p.name.split(" ")[0]}</div>
                {on && <div className="kls-picker-item__check">✓</div>}
              </button>
            );
          })}
        </div>
        <div className="kls-modal-actions">
          <button onClick={() => onConfirm([])} className="kls-btn kls-btn--outline">Skip</button>
          <button onClick={() => onConfirm([...sel])} className="kls-btn kls-btn--primary" style={{ background: color }}>
            Confirm {sel.size > 0 ? `(${sel.size})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub Panel ─────────────────────────────────────────────────────
function SubPanel({ homeSquad, guestSquad, homeOnCourt, guestOnCourt, onSub, onClose }: any) {
  const [side, setSide] = useState("home");
  const squad = side === "home" ? homeSquad : guestSquad;
  const onCourt = side === "home" ? homeOnCourt : guestOnCourt;
  const color = side === "home" ? HOME.color : GUEST.color;
  return (
    <div className="kls-panel-overlay">
      <div className="kls-panel">
        <div className="kls-panel-header">
          <div className="kls-panel-title">🔄 Substitution</div>
          <button onClick={onClose} className="kls-panel-close">Done</button>
        </div>
        <div className="kls-tabs">
          {["home", "guest"].map(s => (
            <button
              key={s}
              onClick={() => setSide(s)}
              className="kls-tab"
              style={{
                border: `1.5px solid ${side === s ? (s === "home" ? HOME.color : GUEST.color) : "rgba(255,255,255,0.12)"}`,
                background: side === s ? `${s === "home" ? HOME.color : GUEST.color}20` : "transparent",
                color: side === s ? (s === "home" ? HOME.color : GUEST.color) : "rgba(255,255,255,0.5)"
              }}
            >
              {s === "home" ? HOME.name : GUEST.name}
            </button>
          ))}
        </div>
        <div className="kls-panel-hint">TAP TO TOGGLE — GREEN = ON COURT</div>
        <div className="kls-grid-2">
          {squad.map((p: any) => {
            const active = onCourt.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onSub(side, p.id)}
                className="kls-item-row"
                style={{
                  background: active ? `${color}18` : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${active ? color : "rgba(255,255,255,0.08)"}`
                }}
              >
                <div className="kls-item-num" style={{ background: active ? color : "rgba(255,255,255,0.10)" }}>{p.jerseyNumber}</div>
                <div className="kls-item-row__info">
                  <div className="kls-item-name" style={{ color: active ? "#fff" : "rgba(255,255,255,0.45)" }}>{p.name}</div>
                  <div className="kls-item-status" style={{ color: active ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)" }}>{active ? "● ON COURT" : "○ BENCH"}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Stats Panel ───────────────────────────────────────────────────
function StatsPanel({ stats, onClose }: any) {
  const all: any[] = Object.values(stats);
  const raiders = all.filter(p => p.raids > 0).sort((a, b) => b.raidPts - a.raidPts);
  const defenders = all.filter(p => p.tackles > 0).sort((a, b) => b.tacklePts - a.tacklePts);
  const color = (p: any) => p.side === "home" ? HOME.color : GUEST.color;
  return (
    <div className="kls-stats-overlay">
      <div className="kls-stats-container">
        <div className="kls-panel-header">
          <div className="kls-panel-title">📊 Player Stats</div>
          <button onClick={onClose} className="kls-panel-close">✕ Close</button>
        </div>
        {raiders.length === 0 && defenders.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.35)", textAlign: "center", fontFamily: "Nunito,sans-serif", marginTop: 80, fontSize: 14, lineHeight: 1.8 }}>No stats yet.<br />Select a player before recording events.</div>
        ) : <>
          {raiders.length > 0 && <>
            <div className="kls-stats-section-title">⚡ RAID LEADERS</div>
            {raiders.map(p => (
              <div key={p.id} className="kls-stats-row">
                <div className="kls-item-num" style={{ background: color(p) }}>{p.num}</div>
                <div style={{ flex: 1 }}>
                  <div className="kls-stats-name">{p.name}</div>
                  <div className="kls-stats-desc">{p.raids} raids · {p.successRaids} ✓ · {p.emptyRaids} empty</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="kls-stats-pts" style={{ color: color(p) }}>{p.raidPts}</div>
                  <div className="kls-stats-pts-label">raid pts</div>
                </div>
              </div>
            ))}
            <div style={{ height: 16 }} />
          </>}
          {defenders.length > 0 && <>
            <div className="kls-stats-section-title">🛡️ TACKLE LEADERS</div>
            {defenders.map(p => (
              <div key={p.id} className="kls-stats-row">
                <div className="kls-item-num" style={{ background: color(p) }}>{p.num}</div>
                <div style={{ flex: 1 }}>
                  <div className="kls-stats-name">{p.name}</div>
                  <div className="kls-stats-desc">{p.tackles} tackles</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="kls-stats-pts" style={{ color: color(p) }}>{p.tacklePts}</div>
                  <div className="kls-stats-pts-label">tackle pts</div>
                </div>
              </div>
            ))}
          </>}
        </>}
      </div>
    </div>
  );
}

// ── Event Log ─────────────────────────────────────────────────────
function EventLog({ log }: any) {
  if (log.length === 0) return (
    <div style={{ padding: "24px 0", textAlign: "center", color: "rgba(255,255,255,0.25)", fontFamily: "Nunito,sans-serif", fontSize: 13 }}>No events yet. Start scoring ↑</div>
  );
  const icons: any = { RAID: "⚡", TACKLE: "🛡️", EMPTY: "○", BONUS: "🎯", ALLOUT: "💥", SUPER: "💪", DOD_FAIL: "❌" };
  const clrs: any = { RAID: "#22c55e", TACKLE: "#ef4444", EMPTY: "rgba(255,255,255,0.35)", BONUS: "#4ade80", ALLOUT: "#f59e0b", SUPER: "#f97316", DOD_FAIL: "#ef4444" };
  return (
    <div style={{ maxHeight: 220, overflowY: "auto", scrollbarWidth: "none" }}>
      {[...log].reverse().map((e, i) => (
        <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: i === 0 ? "rgba(255,255,255,0.04)" : "transparent" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${clrs[e.type] || "#fff"}22`, border: `1px solid ${clrs[e.type] || "#fff"}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{icons[e.type] || "·"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 12, fontFamily: "Nunito,sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.label}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "Nunito,sans-serif" }}>Raid #{e.raidNo} · {e.time}</div>
          </div>
          {e.pts !== undefined && (
            <div style={{ color: clrs[e.type] || "#fff", fontWeight: 900, fontSize: 18, fontFamily: "Rajdhani,sans-serif", flexShrink: 0 }}>
              {e.pts > 0 ? `+${e.pts}` : e.pts === 0 ? "○" : ""}
            </div>
          )}
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "Nunito,sans-serif", flexShrink: 0, minWidth: 36, textAlign: "right" }}>{e.score}</div>
        </div>
      ))}
    </div>
  );
}

// ── All-Out Flash ─────────────────────────────────────────────────
function AllOutFlash({ team, raidPts, onDone }: any) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, []);
  return (
    <div className="kls-ao-overlay">
      <style>{`@keyframes aoPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}`}</style>
      <div className="kls-ao-card">
        <div className="kls-ao-emoji">💥</div>
        <div className="kls-ao-title">ALL OUT!</div>
        <div className="kls-ao-team-desc">{team} wiped out</div>
        <div className="kls-ao-breakdown">
          <div className="kls-ao-breakdown-label">Points this raid</div>
          <div className="kls-ao-breakdown-row">
            <span className="kls-ao-pts-raid">+{raidPts} raid</span>
            <span className="kls-ao-pts-op">+</span>
            <span className="kls-ao-pts-lona">+2 lona</span>
            <span className="kls-ao-pts-op">=</span>
            <span className="kls-ao-pts-total">+{raidPts + 2}</span>
          </div>
        </div>
        <div className="kls-ao-revived-hint">All 7 players revived ✓</div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function App({ homeTeam, guestTeam, periodMins, matchId }: any) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [S, setS] = useState(() => makeInit(homeTeam, guestTeam, periodMins));
  const [selRaider, setSR] = useState<any>("unset");
  const [defPick, setDP] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);
  const [showReset, setSReset] = useState(false);
  const [showStats, setSStats] = useState(false);
  const [showSub, setSSub] = useState(false);
  const [showLog, setSLog] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [allOutFlash, setAOF] = useState<any>(null);
  const [homeOnCourt, setHOC] = useState(() => new Set((homeTeam?.squad || HOME_SQUAD).map((p: any) => p.id)));
  const [guestOnCourt, setGOC] = useState(() => new Set((guestTeam?.squad || GUEST_SQUAD).map((p: any) => p.id)));
  const timerRef = useRef<any>(null);
  const prevSide = useRef("home");
  const matchStartedRef = useRef(false);

  const handleBack = () => {
    if (S.phase === 'playing' || S.raidCount > 1) {
      setShowExitConfirm(true);
    } else {
      navigate('/matches');
    }
  };

  const postNoti = (title: string, body: string, type: any = 'match') => {
    notificationService.createNotification({
      user_id: user?.id,
      type,
      title,
      body,
      href: `/matches/${matchId || 'm1'}/live`,
      metadata: { matchId }
    });
  };

  const showT = useCallback((msg: string, clr = "#0ea5e9") => {
    setToast({ msg, clr }); setTimeout(() => setToast(null), 2400);
  }, []);

  const apply = useCallback((action: any) => {
    setS(prev => {
      const next = dc(prev);
      next.history.push(dc({ ...prev, history: [] }));
      if (next.history.length > 60) next.history.shift();

      const rs = next.rs, ds = rs === "home" ? "guest" : "home";
      const rT = next[rs], dT = next[ds];
      const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const endRaid = () => {
        next.raidCount++;
        next.rs = ds;
        next.raidClock = 30;
        next.raidRunning = false;
      };

      const checkAllOut = (team: any, scoringKey: string, raidPtsThisRaid: number) => {
        if (team.active <= 0) {
          team.active = 7;
          next[scoringKey].score += 2;
          const totalPts = raidPtsThisRaid + 2;
          const msg = `💥 ALL OUT! ${team.name} — +${raidPtsThisRaid} raid +2 lona = +${totalPts} total to ${next[scoringKey].name}`;
          next.eventLog.push({
            id: Date.now() + Math.random(), raidNo: next.raidCount, type: "ALLOUT",
            label: msg,
            pts: 2, score: `${next.home.score}-${next.guest.score}`, time: now
          });
          postNoti("💥 ALL OUT!", msg);
          setTimeout(() => { playSound("allout"); setAOF({ team: team.name, raidPts: raidPtsThisRaid }); }, 80);
        }
      };

      const addRS = (id: string, pts: number, ok: boolean, bonus = false) => {
        if (!next.stats[id]) return;
        const s = next.stats[id];
        s.raids++; s.raidPts += pts;
        ok ? s.successRaids++ : s.emptyRaids++;
        if (bonus) s.bonusPts++;
        s.total = s.raidPts + s.tacklePts + s.bonusPts;
      };
      const addDS = (ids: string[], pts: number) => {
        ids.forEach(id => {
          if (!next.stats[id]) return;
          const s = next.stats[id];
          s.tackles++; s.tacklePts += pts;
          s.total = s.raidPts + s.tacklePts + s.bonusPts;
        });
      };

      const raiderName = action.rid && next.stats[action.rid] ? next.stats[action.rid].name.split(" ")[0] : null;
      const defNames: any[] = (action.dids || []).map((id: string) => next.stats[id]?.name.split(" ")[0]).filter(Boolean);

      if (matchId) {
        const isRaidSuccess = action.type === "RAID" || action.type === "BONUS";
        const points = action.pts || (action.type === "BONUS" ? 1 : 0);
        kabaddiScoringService.recordRaid(matchId, {
          raidNumber: next.raidCount,
          raiderId: action.rid || 'unknown',
          team: rs,
          pointsScored: points,
          touchPoints: action.type === "RAID" ? action.pts : 0,
          success: isRaidSuccess
        }).catch(err => console.error("Failed to record raid:", err));
        kabaddiScoringService.updateMatchScore(matchId, next.home.score, next.guest.score)
          .catch(err => console.error("Failed to update score:", err));
      }

      switch (action.type) {
        case "RAID": {
          const pts = action.pts;
          rT.score += pts;
          dT.active = dT.active - Math.min(pts, dT.active);
          rT.consEmpty = 0; next.doOrDie = false;
          if (action.rid) addRS(action.rid, pts, true);
          const msg = `⚡ ${raiderName || rT.name} tagged ${pts} defender${pts > 1 ? "s" : ""}`;
          next.eventLog.push({
            id: Date.now(), raidNo: next.raidCount, type: "RAID",
            label: msg,
            pts, score: `${next.home.score}-${next.guest.score}`, time: now
          });
          playSound("point");
          if (pts >= 3) postNoti("🔥 SUPER RAID!", `${raiderName || rT.name} scored ${pts} points for ${rT.name}!`);
          checkAllOut(dT, rs, pts);
          endRaid(); break;
        }
        case "TACKLE": {
          const pts = action.pts;
          const st = dT.active <= 3;
          const total = pts + (st ? 1 : 0);
          dT.score += total;
          rT.active = Math.max(0, rT.active - 1);
          rT.consEmpty = 0; next.doOrDie = false;
          if (action.rid) addRS(action.rid, 0, false);
          if (action.dids?.length) addDS(action.dids, total);
          const evType = st ? "SUPER" : "TACKLE";
          const msg = st ? `💪 SUPER TACKLE! ${defNames.join(", ") || dT.name} — +${total}` : `🛡️ ${defNames.join(", ") || dT.name} tackle — +${total}`;
          next.eventLog.push({
            id: Date.now(), raidNo: next.raidCount, type: evType,
            label: msg,
            pts: total, score: `${next.home.score}-${next.guest.score}`, time: now
          });
          playSound("point");
          if (st) postNoti("💪 SUPER TACKLE!", msg);
          checkAllOut(rT, ds, 0);
          endRaid(); break;
        }
        case "EMPTY": {
          if (action.forced) {
            rT.active = Math.max(0, rT.active - 1);
            dT.score += 1; rT.consEmpty = 0; next.doOrDie = false;
            if (action.rid) addRS(action.rid, 0, false);
            next.eventLog.push({
              id: Date.now(), raidNo: next.raidCount, type: "DOD_FAIL",
              label: `❌ Do-or-Die fail — ${raiderName || rT.name} OUT, +1 to ${dT.name}`,
              pts: 1, score: `${next.home.score}-${next.guest.score}`, time: now
            });
            checkAllOut(rT, ds, 0);
          } else {
            rT.consEmpty++;
            if (action.rid) addRS(action.rid, 0, false);
            next.eventLog.push({
              id: Date.now(), raidNo: next.raidCount, type: "EMPTY",
              label: `○ Empty raid — ${raiderName || rT.name}`,
              pts: 0, score: `${next.home.score}-${next.guest.score}`, time: now
            });
            if (rT.consEmpty >= 2) next.doOrDie = true;
          }
          endRaid(); break;
        }
        case "BONUS": {
          if (dT.active >= 6) {
            rT.score += 1; rT.consEmpty = 0;
            if (action.rid) addRS(action.rid, 1, true, true);
            next.eventLog.push({
              id: Date.now(), raidNo: next.raidCount, type: "BONUS",
              label: `🎯 Bonus line — ${raiderName || rT.name} +1`,
              pts: 1, score: `${next.home.score}-${next.guest.score}`, time: now
            });
            playSound("point");
            endRaid();
          } break;
        }
      }
      return next;
    });
  }, [matchId, postNoti, showT]);

  const undo = () => {
    setS(p => { if (!p.history.length) return p; const snap = p.history[p.history.length - 1]; return { ...snap, history: p.history.slice(0, -1) }; });
    setSR("unset");
  };

  const handleSub = (side: string, pid: string) => {
    if (side === "home") setHOC(p => { const n = new Set(p); n.has(pid) ? n.delete(pid) : n.add(pid); return n; });
    else setGOC(p => { const n = new Set(p); n.has(pid) ? n.delete(pid) : n.add(pid); return n; });
  };

  useEffect(() => {
    if (S.rs !== prevSide.current) { prevSide.current = S.rs; setSR("unset"); }
  }, [S.rs]);

  useEffect(() => {
    if (S.running && S.phase === "playing") {
      if (!matchStartedRef.current) {
        matchStartedRef.current = true;
        postNoti("Match Started! ⚡", `${S.home.name} vs ${S.guest.name} is now LIVE.`);

        // Update match status to 'live' in Supabase
        if (matchId) {
          supabase.from('kabaddi_matches')
            .update({ status: 'live' })
            .eq('id', matchId)
            .then(({ error }: { error: any }) => {
              if (error) console.error("Failed to update match status to live:", error);
            });
        }
      }
      timerRef.current = setInterval(() => {
        setS(p => {
          if (p.clock <= 0) {
            clearInterval(timerRef.current);
            const isHalf = p.period === 1;
            if (isHalf) {
              postNoti("Half Time ⏱️", `Score: ${p.home.name} ${p.home.score} - ${p.guest.score} ${p.guest.name}`);
            } else {
              postNoti("Full Time 🏆", `Final: ${p.home.name} ${p.home.score} - ${p.guest.score} ${p.guest.name}`);

              // Update match status to 'completed' and save final scores + player stats
              if (matchId) {
                saveMatchResults(matchId, p.home.score, p.guest.score, p.stats)
                  .then(success => {
                    if (success) {
                      publishMatchNews(matchId, p.home.score, p.guest.score, p.stats);
                      navigate(`/matches/${matchId}/summary`);
                    }
                    else console.error("Failed to save final match results.");
                  });
              }

              const resultMsg = `${p.home.name} ${p.home.score} - ${p.guest.score} ${p.guest.name}`;
              const winner = p.home.score > p.guest.score ? p.home.name : p.guest.score > p.home.score ? p.guest.name : "Draw";
              const caption = `🏁 Match Ended! ${resultMsg}. ${winner !== "Draw" ? `Congratulations ${winner}! 🏆` : "It's a draw!"}`;
              supabase.from('feed_posts').insert({
                user_id: user?.id,
                type: 'result',
                caption,
                tournament_id: (p as any).tournamentId,
                match_id: matchId,
                likes_count: 0
              }).then(({ error }: { error: any }) => {
                if (error) console.error("Failed to post match result to feed:", error);
              });
            }
            return { ...p, running: false, phase: isHalf ? "halftime" : "fulltime", clock: 0 };
          }
          return { ...p, clock: p.clock - 1 };
        });
      }, 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [S.running, S.phase, matchId, postNoti, user?.id, navigate]);

  useEffect(() => {
    let raidTimer: any;
    if (S.raidRunning && S.phase === "playing") {
      raidTimer = setInterval(() => {
        setS(p => {
          if (p.raidClock <= 1) {
            clearInterval(raidTimer);
            setTimeout(() => {
              apply({ type: "EMPTY", forced: p.doOrDie, rid: selRaider !== "unset" ? selRaider?.id : null });
              showT(p.doOrDie ? "❌ Do-or-Die fail!\nTimer expired" : "○ Empty Raid\nTimer expired", p.doOrDie ? "#ef4444" : "rgba(255,255,255,0.4)");
            }, 0);
            return { ...p, raidClock: 30, raidRunning: false };
          }
          if (p.raidClock === 6) playSound("warn");
          return { ...p, raidClock: p.raidClock - 1 };
        });
      }, 1000);
    } else clearInterval(raidTimer);
    return () => clearInterval(raidTimer);
  }, [S.raidRunning, S.phase, S.doOrDie, selRaider, apply, showT]);

  const rs = S.rs, ds = rs === "home" ? "guest" : "home";
  const rT = (S as any)[rs], dT = (S as any)[ds];
  const raidingSquad = rs === "home" ? HOME_SQUAD : GUEST_SQUAD;
  const defendingSquad = rs === "home" ? GUEST_SQUAD : HOME_SQUAD;
  const raidOnCourt = rs === "home" ? homeOnCourt : guestOnCourt;
  const defOnCourt = rs === "home" ? guestOnCourt : homeOnCourt;
  const rid = selRaider !== "unset" ? selRaider?.id : undefined;
  const bonusOk = dT.active >= 6;
  const isSuperTackle = dT.active <= 3 && dT.active > 0;
  const isLowAlert = (t: any) => t.active <= 2 && t.active > 0;

  if (S.phase === "halftime") return (
    <div className="kls-end-view">
      <div className="kls-end-emoji">⏱️</div>
      <div className="kls-end-title">HALF TIME</div>
      <div className="kls-end-sub">Teams swap sides for Period 2</div>
      <div className="kls-end-scores">
        {[S.home, S.guest].map(t => (
          <div key={t.name} className="kls-end-team">
            <div className="kls-end-team-badge" style={{ background: t.color }}>{t.abbr}</div>
            <div className="kls-end-team-score" style={{ color: t.color }}>{t.score}</div>
            <div className="kls-end-team-name">{t.name}</div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setS(p => ({ ...p, period: 2, clock: MINS * 60, running: false, phase: "playing", rs: p.rs === "home" ? "guest" : "home" }))}
        className="kls-end-btn"
      >
        Start Period 2 →
      </button>
    </div>
  );

  if (S.phase === "fulltime") return (
    <div className="kls-end-view">
      <div className="kls-end-emoji">🏆</div>
      <div className="kls-end-title">FULL TIME</div>
      {S.home.score !== S.guest.score
        ? <div style={{ fontWeight: 900, fontSize: 20, color: S.home.score > S.guest.score ? S.home.color : S.guest.color, marginBottom: 20 }}>{S.home.score > S.guest.score ? S.home.name : S.guest.name} Wins! 🎉</div>
        : <div style={{ color: "#94a3b8", fontWeight: 800, fontSize: 18, marginBottom: 20 }}>It's a Tie!</div>}
      <div className="kls-end-scores">
        {[S.home, S.guest].map(t => (
          <div key={t.name} className="kls-end-team">
            <div className="kls-end-team-score" style={{ color: t.color }}>{t.score}</div>
            <div className="kls-end-team-name">{t.name}</div>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate(`/matches/${matchId || 'm1'}/summary`)}
        className="kls-end-btn"
        style={{ marginTop: 32, background: "#f97316" }}
      >
        View Match Summary
      </button>
    </div>
  );

  return (
    <div className="kls">
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent} button:active{transform:scale(0.92);transition:transform 0.08s} @keyframes flashRed{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>

      {allOutFlash && <AllOutFlash team={allOutFlash.team} raidPts={allOutFlash.raidPts} onDone={() => setAOF(null)} />}
      {toast && <div className="kls-toast" style={{ background: toast.clr, boxShadow: `0 8px 28px ${toast.clr}88` }}>{toast.msg}</div>}
      {defPick && <DefenderPicker squad={defendingSquad} onCourt={defOnCourt} color={dT.color} pts={defPick.pts} isSuperTackle={isSuperTackle}
        onConfirm={(dids: string[]) => {
          apply({ type: "TACKLE", pts: defPick.pts, rid, dids });
          showT(isSuperTackle ? `💪 SUPER TACKLE!\n+${defPick.pts + 1} ${dT.name}` : `🛡️ Tackle +${defPick.pts}  ${dT.name}`, isSuperTackle ? "#f97316" : "#10b981");
          setDP(null); setSR("unset");
        }}
        onCancel={() => setDP(null)}
      />}
      {showSub && <SubPanel homeSquad={HOME_SQUAD} guestSquad={GUEST_SQUAD} homeOnCourt={homeOnCourt} guestOnCourt={guestOnCourt} onSub={handleSub} onClose={() => setSSub(false)} />}
      {showReset && (
        <div className="kls-dialog-overlay">
          <div className="kls-dialog">
            <div className="kls-dialog-emoji">↺</div>
            <div className="kls-dialog-title">Reset Match?</div>
            <div className="kls-dialog-sub">All scores and history will be cleared.</div>
            <div className="kls-dialog-actions">
              <button onClick={() => setSReset(false)} className="kls-dialog-btn kls-dialog-btn--cancel">Cancel</button>
              <button onClick={() => { clearInterval(timerRef.current); setS(makeInit()); setSR("unset"); setHOC(new Set(HOME_SQUAD.map(p => p.id))); setGOC(new Set(GUEST_SQUAD.map(p => p.id))); setSReset(false); }} className="kls-dialog-btn kls-dialog-btn--danger">Reset</button>
            </div>
          </div>
        </div>
      )}
      {showStats && <StatsPanel stats={S.stats} onClose={() => setSStats(false)} />}
      {showExitConfirm && (
        <div className="kls-dialog-overlay">
          <div className="kls-dialog">
            <div className="kls-dialog-emoji">🏁</div>
            <div className="kls-dialog-title">End Match?</div>
            <div className="kls-dialog-sub">Are you sure you want to exit the scorer? The match progress is saved.</div>
            <div className="kls-dialog-actions">
              <button onClick={() => setShowExitConfirm(false)} className="kls-dialog-btn kls-dialog-btn--cancel">Keep Scoring</button>
              <button onClick={() => navigate('/matches')} className="kls-dialog-btn kls-dialog-btn--danger">Exit Match</button>
            </div>
          </div>
        </div>
      )}

      <div className="kls-topbar">
        <div className="kls-topbar-left">
          <button onClick={handleBack} className="kls-back-btn">←</button>
          <div>
            <div className="kls-topbar__period-label">PERIOD</div>
            <div className="kls-topbar__period-num">{S.period}</div>
          </div>
        </div>
        <button onClick={() => setS(p => ({ ...p, running: !p.running }))} className="kls-topbar__clock-btn">
          <span className={`kls-topbar__clock ${S.running ? 'kls-topbar__clock--running' : 'kls-topbar__clock--paused'}`}>{fmt(S.clock)}</span>
          <span className="kls-topbar__clock-hint">{S.running ? "⏸ tap to pause" : "▶ tap to start"}</span>
        </button>
        <div className="kls-topbar-right">
          <button onClick={() => setSStats(true)} className="kls-icon-tool-btn">📊</button>
          <button onClick={() => setSSub(true)} className="kls-icon-tool-btn">🔄</button>
          <button onClick={() => setSReset(true)} className="kls-icon-tool-btn">↺</button>
        </div>
      </div>

      <div className={`kls-raid-bar ${S.doOrDie ? 'kls-raid-bar--dod' : 'kls-raid-bar--normal'}`}>
        <span className="kls-raid-label">RAID</span>
        <span className="kls-raid-num" style={{ color: S.doOrDie ? "#f59e0b" : "#fff" }}>{S.raidCount}</span>
        <span className="kls-raid-team-pill" style={{ background: `${rT.color}2a`, border: `1px solid ${rT.color}55`, color: rT.color }}>{rT.name} RAIDS</span>
        {selRaider !== "unset" && selRaider && <span className="kls-raid-team-pill" style={{ background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.8)" }}>#{selRaider.jerseyNumber} {selRaider.name.split(" ")[0]}</span>}
        {S.doOrDie && <span className="kls-raid-team-pill" style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.5)", color: "#f59e0b" }}>⚠️ DO-OR-DIE</span>}
      </div>

      {isSuperTackle && (
        <div className="kls-banner kls-banner--super">
          <span className="kls-banner-icon">💪</span>
          <span className="kls-banner-title" style={{ color: "#f97316" }}>SUPER TACKLE ZONE</span>
          <span className="kls-banner-desc" style={{ color: "rgba(249,115,22,0.75)" }}>{dT.name}: {dT.active} players — +1 bonus on tackle!</span>
        </div>
      )}

      {!isSuperTackle && (isLowAlert(S.home) || isLowAlert(S.guest)) && (
        <div className="kls-banner kls-banner--low">
          <span className="kls-banner-icon">🚨</span>
          <span className="kls-banner-desc" style={{ color: "#ef4444", fontWeight: 800 }}>
            {[S.home, S.guest].filter(isLowAlert).map(t => `${t.name}: ${t.active} left`).join(" · ")} — All-Out risk!
          </span>
        </div>
      )}

      <RaiderStrip squad={raidingSquad} onCourt={raidOnCourt} color={rT.color}
        selectedId={selRaider === "unset" ? null : (selRaider?.id ?? null)}
        onSelect={(p: any) => setSR(p)}
      />

      <div className="kls-team-grid">
        {(() => {
          const t = S.home, isR = rs === "home", low = isLowAlert(t); return (
            <div className={`kls-team-panel ${low ? 'kls-team-panel--low' : 'kls-team-panel--normal'}`}
              style={{
                border: low ? "1.5px solid rgba(239,68,68,0.5)" : `1.5px solid ${isR ? t.color + "88" : "rgba(255,255,255,0.06)"}`,
                boxShadow: isR ? `0 0 22px ${t.color}22` : "none"
              }}
            >
              <div className="kls-team-role-pill" style={{ background: isR ? `${t.color}22` : "transparent", border: isR ? `1px solid ${t.color}44` : "none" }}>
                <span style={{ color: t.color }}>{isR ? "⚡ RAIDING" : "🛡️ DEF"}</span>
              </div>
              <div className="kls-team-name-label">{t.name}</div>
              <div className="kls-team-score-num" style={{ color: t.color, textShadow: `0 0 32px ${t.color}44` }}>{t.score}</div>
              <div className="kls-team-on-court">
                <div className="kls-team-on-court-label">ON COURT {t.active}/7</div>
                <div className="kls-team-dots">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="kls-team-dot" style={{ background: i < t.active ? t.color : "rgba(255,255,255,0.12)" }} />
                  ))}
                </div>
              </div>
              {low && <div className="kls-team-alert-pill">🚨 {t.active} left!</div>}
              {t.consEmpty > 0 && !low && <div className="kls-team-empty-pill">{t.consEmpty} empty</div>}
            </div>
          );
        })()}

        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <div className="kls-raid-timer">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span className="kls-raid-timer-label">RAID TIMER</span>
              <div className="kls-raid-timer-num" style={{
                color: S.raidClock <= 5 ? "#ef4444" : S.raidClock <= 15 ? "#f59e0b" : "#22c55e",
                animation: S.raidClock <= 5 && S.raidRunning ? "flashRed 0.5s ease infinite" : "none",
                textShadow: `0 0 15px ${S.raidClock <= 5 ? "rgba(239,68,68,0.3)" : S.raidClock <= 15 ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.3)"}`
              }}>
                {S.raidClock}s
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setS(p => ({ ...p, raidClock: 30, raidRunning: false }))} className="kls-icon-tool-btn" style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>↺</button>
              <button onClick={() => setS(p => ({ ...p, raidRunning: !p.raidRunning }))} className="kls-icon-tool-btn" style={{ width: 68, height: 36, background: S.raidRunning ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)", border: `1px solid ${S.raidRunning ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"}`, color: S.raidRunning ? "#ef4444" : "#22c55e", fontWeight: 800, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>{S.raidRunning ? "⏸ PAUSE" : "▶ START"}</button>
            </div>
          </div>

          <div className="kls-action-box kls-action-box--normal">
            <div className="kls-action-label">RAID —{" "}{selRaider !== "unset" && selRaider ? <span style={{ color: rT.color }}>#{selRaider.jerseyNumber} {selRaider.name.split(" ")[0]}</span> : <span style={{ opacity: 0.5 }}>select player ↑</span>}</div>
            <div className="kls-action-grid kls-action-grid--3">
              {[1, 2, 3].map(pts => (<button key={pts} onClick={() => { apply({ type: "RAID", pts, rid }); showT(`⚡ +${pts} ${rT.name}`, rT.color); setSR("unset"); }} className="kls-action-btn kls-action-btn--pts" style={{ background: "#16a34a" }}>+{pts}</button>))}
            </div>
          </div>

          <div className={`kls-action-box ${isSuperTackle ? 'kls-action-box--super' : 'kls-action-box--normal'}`}>
            <div className="kls-action-label" style={{ color: isSuperTackle ? "#f97316" : "rgba(255,255,255,0.5)", fontWeight: 800 }}>{isSuperTackle ? "💪 SUPER TACKLE" : "TACKLE"} — {dT.name}</div>
            <div className="kls-action-grid kls-action-grid--2">
              {[1, 2].map(pts => (<button key={pts} onClick={() => setDP({ pts })} className="kls-action-btn kls-action-btn--pts" style={{ background: isSuperTackle ? "#f97316" : "#dc2626", boxShadow: isSuperTackle ? "0 4px 18px rgba(249,115,22,0.45)" : "none" }}>+{pts}{isSuperTackle && <span style={{ fontSize: 11 }}>(+1)</span>}</button>))}
            </div>
          </div>

          <button onClick={() => { if (S.doOrDie) { apply({ type: "EMPTY", forced: true, rid }); showT("❌ Do-or-Die fail!\nRaider OUT", "#ef4444"); } else { apply({ type: "EMPTY", rid }); } setSR("unset"); }} className="kls-action-btn kls-action-btn--small" style={{ border: `1px solid ${S.doOrDie ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.10)"}`, background: S.doOrDie ? "rgba(245,158,11,0.18)" : "rgba(255,255,255,0.06)", color: S.doOrDie ? "#f59e0b" : "rgba(255,255,255,0.65)" }}>{S.doOrDie ? "⚠️ FAIL (Auto OUT)" : "EMPTY RAID"}</button>
          <button disabled={!bonusOk} onClick={() => { apply({ type: "BONUS", rid }); showT(`🎯 Bonus +1  ${rT.name}`, "#16a34a"); setSR("unset"); }} className="kls-action-btn kls-action-btn--small" style={{ border: `1px solid ${bonusOk ? "rgba(22,163,74,0.45)" : "rgba(255,255,255,0.06)"}`, background: bonusOk ? "rgba(22,163,74,0.20)" : "rgba(255,255,255,0.04)", color: bonusOk ? "#4ade80" : "rgba(255,255,255,0.25)", cursor: bonusOk ? "pointer" : "not-allowed" }}>🎯 BONUS{!bonusOk && <span style={{ opacity: 0.5 }}> (need 6)</span>}</button>
          <button disabled={!S.history.length} onClick={undo} className="kls-action-btn--undo" style={{ color: S.history.length ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.2)", cursor: S.history.length ? "pointer" : "not-allowed" }}>↩ UNDO</button>
        </div>

        {(() => {
          const t = S.guest, isR = rs === "guest", low = isLowAlert(t); return (
            <div className={`kls-team-panel ${low ? 'kls-team-panel--low' : 'kls-team-panel--normal'}`}
              style={{
                border: low ? "1.5px solid rgba(239,68,68,0.5)" : `1.5px solid ${isR ? t.color + "88" : "rgba(255,255,255,0.06)"}`,
                boxShadow: isR ? `0 0 22px ${t.color}22` : "none"
              }}
            >
              <div className="kls-team-role-pill" style={{ background: isR ? `${t.color}22` : "transparent", border: isR ? `1px solid ${t.color}44` : "none" }}>
                <span style={{ color: t.color }}>{isR ? "⚡ RAIDING" : "🛡️ DEF"}</span>
              </div>
              <div className="kls-team-name-label">{t.name}</div>
              <div className="kls-team-score-num" style={{ color: t.color, textShadow: `0 0 32px ${t.color}44` }}>{t.score}</div>
              <div className="kls-team-on-court">
                <div className="kls-team-on-court-label">ON COURT {t.active}/7</div>
                <div className="kls-team-dots">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="kls-team-dot" style={{ background: i < t.active ? t.color : "rgba(255,255,255,0.12)" }} />
                  ))}
                </div>
              </div>
              {low && <div className="kls-team-alert-pill">🚨 {t.active} left!</div>}
              {t.consEmpty > 0 && !low && <div className="kls-team-empty-pill">{t.consEmpty} empty</div>}
            </div>
          );
        })()}
      </div>

      <div className="kls-log-bar">
        <button onClick={() => setSLog(p => !p)} className="kls-log-toggle-btn">
          <span>📋 MATCH LOG ({S.eventLog.length} events)</span>
          <span style={{ fontSize: 14 }}>{showLog ? "▼" : "▲"}</span>
        </button>
        {showLog && <EventLog log={S.eventLog} />}
      </div>
    </div>
  );
}
