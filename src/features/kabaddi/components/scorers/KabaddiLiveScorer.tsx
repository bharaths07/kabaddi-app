import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../../../../shared/services/notificationService";
import { kabaddiScoringService } from "../../../../shared/services/kabaddiScoringService";
import { saveMatchResults, publishMatchNews } from "../../../../shared/services/tournamentService";
import { useAuth } from "../../../../shared/context/AuthContext";
import { supabase } from "../../../../shared/lib/supabase";
import "./KabaddiLiveScorer.css";

const MINS = 20;

const pad = (n: number | string) => String(n).padStart(2, "0");
const fmt = (s: number) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
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

function makeInit(home: any, guest: any, mins?: number) {
  const h = home;
  const g = guest;
  const m = mins || MINS;
  return {
    period: 1, clock: m * 60, running: false,
    raidCount: 1, rs: "home", doOrDie: false,
    phase: "playing", history: [] as any[],
    home: { ...h, score: 0, active: Math.min(7, (h.squad || []).length), consEmpty: 0, outQueue: [] as string[] },
    guest: { ...g, score: 0, active: Math.min(7, (g.squad || []).length), consEmpty: 0, outQueue: [] as string[] },
    stats: { ...mkStats(h.squad || [], "home"), ...mkStats(g.squad || [], "guest") },
    eventLog: [] as any[],
    raidClock: 30, raidRunning: false,
    pendingBonus: false,
    shootout: { active: false, turn: "home" as "home" | "guest", raidIndex: 0, homeRaids: [] as number[], guestRaids: [] as number[] } 
  };
}

// ── Raider Strip ──────────────────────────────────────────────────
function RaiderStrip({ squad, onCourt, color, selectedId, onSelect }: any) {
  const available = squad.filter((p: any) => onCourt.has(p.id));
  return (
    <div className="kls-raider-strip fadeInUp">
      <div className="kls-raider-strip__label">👤 SELECT ACTIVE RAIDER</div>
      <div className="kls-raider-strip__list">
        <button
          onClick={() => onSelect(null)}
          className="kls-raider-strip__item"
          style={{
            borderColor: selectedId === null ? 'var(--color-primary)' : undefined,
            background: selectedId === null ? 'var(--glass-bg-light)' : undefined
          }}
        >
          <span className="kls-raider-strip__num-box" style={{ background: 'var(--glass-bg-dark)', opacity: 0.5 }}>?</span>
          <span className="kls-raider-strip__name">Skip</span>
        </button>
        {available.map((p: any) => {
          const on = selectedId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="kls-raider-strip__item"
              style={{
                borderColor: on ? color : undefined,
                background: on ? `${color}15` : undefined
              }}
            >
              <span className="kls-raider-strip__num-box" style={{ background: on ? color : 'var(--glass-bg-dark)', color: '#fff' }}>
                {p.jerseyNumber}
              </span>
              <span className="kls-raider-strip__name" style={{ color: on ? '#fff' : 'var(--text-secondary)', fontWeight: on ? 800 : 600 }}>
                {p.name.split(" ")[0]}
              </span>
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
    <div className="kls-overlay fadeIn">
      <div className={`kls-modal ${isSuperTackle ? 'kls-modal--super' : ''}`}>
        {isSuperTackle && (
          <div className="kls-super-badge">
            <div className="kls-super-badge__title" style={{ fontWeight: 900, color: 'var(--color-warning)' }}>💪 SUPER TACKLE ZONE</div>
            <div className="kls-super-badge__sub" style={{ fontSize: 11, color: 'var(--color-warning)', opacity: 0.8 }}>+1 point added automatically</div>
          </div>
        )}
        <div className="kls-modal-title">🛡️ TACKLE BY...</div>
        <div className="kls-modal-sub">
          +{pts}{isSuperTackle ? ` + 1 (Super) = ${pts + 1}` : ""} pts — tap defenders
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
                  background: on ? `${color}15` : 'var(--glass-bg)',
                  borderColor: on ? color : 'var(--glass-border)'
                }}
              >
                <div className="kls-picker-item__num" style={{ background: on ? color : 'var(--glass-bg-dark)' }}>{p.jerseyNumber}</div>
                <div className="kls-picker-item__name" style={{ color: on ? '#fff' : 'var(--text-secondary)', fontWeight: on ? 800 : 600 }}>{p.name.split(" ")[0]}</div>
                {on && <div className="kls-picker-item__check">✓</div>}
              </button>
            );
          })}
        </div>
        <div className="kls-modal-actions">
          <button onClick={() => onConfirm([])} className="kls-dialog__cancel" style={{ flex: 1 }}>Skip</button>
          <button onClick={() => onConfirm([...sel])} className="kls-dialog__confirm" style={{ background: color, flex: 2 }}>
            Confirm {sel.size > 0 ? `(${sel.size})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub Panel ─────────────────────────────────────────────────────
function SubPanel({ homeTeam, guestTeam, homeOnCourt, guestOnCourt, onSub, onClose }: any) {
  const [side, setSide] = useState("home");
  const homeSquad = homeTeam?.squad || [];
  const guestSquad = guestTeam?.squad || [];
  const squad = side === "home" ? homeSquad : guestSquad;
  const onCourt = side === "home" ? homeOnCourt : guestOnCourt;
  const color = side === "home" ? (homeTeam?.color || "#0ea5e9") : (guestTeam?.color || "#ef4444");
  
  return (
    <div className="kls-overlay fadeIn">
      <div className="kls-modal" style={{ maxWidth: 450 }}>
        <div className="kls-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="kls-modal-title" style={{ margin: 0 }}>🔄 SUBSTITUTIONS</div>
          <button onClick={onClose} className="kls-topbar__icon-btn" style={{ width: 32, height: 32 }}>✕</button>
        </div>
        
        <div className="kls-tabs" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {["home", "guest"].map(s => {
            const active = side === s;
            const t = s === "home" ? homeTeam : guestTeam;
            const tColor = t?.color || (s === 'home' ? '#0ea5e9' : '#ef4444');
            return (
              <button
                key={s}
                onClick={() => setSide(s)}
                className="kls-center__btn"
                style={{
                  flex: 1,
                  background: active ? `${tColor}15` : 'var(--glass-bg)',
                  borderColor: active ? tColor : 'var(--glass-border)',
                  color: active ? tColor : 'var(--text-secondary)'
                }}
              >
                {t?.name.split(" ")[0].toUpperCase()}
              </button>
            );
          })}
        </div>

        <div className="kls-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
          {squad.map((p: any) => {
            const active = onCourt.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onSub(side, p.id)}
                className="kls-picker-item"
                style={{
                  background: active ? `${color}15` : 'var(--glass-bg)',
                  borderColor: active ? color : 'var(--glass-border)',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  padding: '8px 12px',
                  gap: 12
                }}
              >
                <div className="kls-picker-item__num" style={{ background: active ? color : 'var(--glass-bg-dark)', width: 28, height: 28, fontSize: 13 }}>{p.jerseyNumber}</div>
                <div style={{ textAlign: 'left' }}>
                  <div className="kls-picker-item__name" style={{ fontSize: 13, color: active ? '#fff' : 'var(--text-secondary)' }}>{p.name.split(" ")[0]}</div>
                  <div style={{ fontSize: 9, opacity: 0.5, color: active ? '#fff' : 'inherit' }}>{active ? "ON COURT" : "BENCH"}</div>
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
function StatsPanel({ stats, homeTeam, guestTeam, onClose }: any) {
  const all: any[] = Object.values(stats);
  const raiders = all.filter(p => p.raids > 0).sort((a, b) => b.raidPts - a.raidPts);
  const defenders = all.filter(p => p.tackles > 0).sort((a, b) => b.tacklePts - a.tacklePts);
  const color = (p: any) => p.side === "home" ? (homeTeam?.color || "#0ea5e9") : (guestTeam?.color || "#ef4444");
  
  return (
    <div className="kls-overlay fadeIn">
      <div className="kls-modal" style={{ maxWidth: 500, padding: '24px 0' }}>
        <div className="kls-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '0 24px' }}>
          <div className="kls-modal-title" style={{ margin: 0 }}>📊 MATCH STATISTICS</div>
          <button onClick={onClose} className="kls-topbar__icon-btn" style={{ width: 32, height: 32 }}>✕</button>
        </div>
        
        <div style={{ maxHeight: 450, overflowY: 'auto', padding: '0 24px' }}>
          {raiders.length === 0 && defenders.length === 0 ? (
            <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: '40px 0', fontSize: 14 }}>
              No stats recorded for this match yet.
            </div>
          ) : (
            <>
              {raiders.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div className="kls-topbar__period-label" style={{ marginBottom: 12 }}>⚡ TOP RAIDERS</div>
                  {raiders.map(p => (
                    <div key={p.id} className="kls-team" style={{ flexDirection: 'row', padding: '10px 14px', marginBottom: 8, background: 'var(--glass-bg-dark)' }}>
                      <div className="kls-picker-item__num" style={{ background: color(p), width: 28, height: 28 }}>{p.num}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>{p.name}</div>
                        <div style={{ fontSize: 10, opacity: 0.5 }}>{p.raids} R | {p.successRaids} ✓ | {p.emptyRaids} ○</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: color(p), fontFamily: 'var(--font-display)', lineHeight: 1 }}>{p.raidPts}</div>
                        <div style={{ fontSize: 8, opacity: 0.5 }}>PTS</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {defenders.length > 0 && (
                <div>
                  <div className="kls-topbar__period-label" style={{ marginBottom: 12 }}>🛡️ TOP DEFENDERS</div>
                  {defenders.map(p => (
                    <div key={p.id} className="kls-team" style={{ flexDirection: 'row', padding: '10px 14px', marginBottom: 8, background: 'var(--glass-bg-dark)' }}>
                      <div className="kls-picker-item__num" style={{ background: color(p), width: 28, height: 28 }}>{p.num}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>{p.name}</div>
                        <div style={{ fontSize: 10, opacity: 0.5 }}>{p.tackles} TACKLES</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: color(p), fontFamily: 'var(--font-display)', lineHeight: 1 }}>{p.tacklePts}</div>
                        <div style={{ fontSize: 8, opacity: 0.5 }}>PTS</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
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
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return (
    <div className="kls-overlay fadeIn" style={{ zIndex: 2000, background: 'rgba(0,0,0,0.9)' }}>
      <div className="kls-modal kls-modal--super pulse">
        <div style={{ fontSize: 64, textAlign: "center", marginBottom: 16 }}>💥</div>
        <div className="kls-modal-title" style={{ fontSize: 42, color: 'var(--color-warning)' }}>ALL OUT!</div>
        <div className="kls-modal-sub" style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{team.toUpperCase()} WIPED OUT</div>
        
        <div className="kls-team" style={{ background: 'var(--glass-bg-dark)', padding: 20, marginTop: 24 }}>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>RAID BREAKDOWN</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>+{raidPts} RAID + 2 LONA</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--color-warning)', fontFamily: 'var(--font-display)' }}>+{raidPts + 2}</div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--color-success)', fontWeight: 800 }}>
          ✓ ALL 7 PLAYERS REVIVED
        </div>
      </div>
    </div>
  );
}

// ── Shootout Overlay ──────────────────────────────────────────────
function ShootoutOverlay({ shootout, homeTeam, guestTeam, onRecord, onDone }: any) {
  const { turn, raidIndex, homeRaids, guestRaids } = shootout;
  const isHome = turn === "home";
  const currentTeam = isHome ? homeTeam : guestTeam;
  const oppTeam = isHome ? guestTeam : homeTeam;
  const hTotal = homeRaids.reduce((a: any, b: any) => a + (b || 0), 0);
  const gTotal = guestRaids.reduce((a: any, b: any) => a + (b || 0), 0);

  const isComplete = raidIndex >= 5;

  return (
    <div className="kls-overlay fadeIn" style={{ zIndex: 1500 }}>
      <div className="kls-modal" style={{ maxWidth: 600 }}>
        <div className="kls-modal-title" style={{ fontSize: 24, letterSpacing: 2 }}>⚡ 5-RAID SHOOTOUT</div>
        <div className="kls-modal-sub" style={{ marginBottom: 20 }}>Tied Match Tie-Breaker</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
          <div style={{ textAlign: 'center', background: 'var(--glass-bg-dark)', padding: 12, borderRadius: 12, border: `1px solid ${homeTeam.color}44` }}>
            <div style={{ fontSize: 10, color: homeTeam.color, fontWeight: 900 }}>{homeTeam.name.toUpperCase()}</div>
            <div style={{ fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#fff' }}>{hTotal}</div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 8 }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ width: 14, height: 14, borderRadius: 4, background: homeRaids[i] !== undefined ? (homeRaids[i] > 0 ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--glass-border)', opacity: raidIndex === i && isHome ? 1 : 0.5 }} />
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center', background: 'var(--glass-bg-dark)', padding: 12, borderRadius: 12, border: `1px solid ${guestTeam.color}44` }}>
            <div style={{ fontSize: 10, color: guestTeam.color, fontWeight: 900 }}>{guestTeam.name.toUpperCase()}</div>
            <div style={{ fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#fff' }}>{gTotal}</div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 8 }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ width: 14, height: 14, borderRadius: 4, background: guestRaids[i] !== undefined ? (guestRaids[i] > 0 ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--glass-border)', opacity: raidIndex === i && !isHome ? 1 : 0.5 }} />
              ))}
            </div>
          </div>
        </div>

        {!isComplete ? (
          <div className="fadeInUp">
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 11, opacity: 0.6 }}>NOW RAIDING</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: currentTeam.color }}>{currentTeam.name} — RAID {raidIndex + 1}/5</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[0, 1, 2, 3].map(pts => (
                <button
                  key={pts}
                  onClick={() => onRecord(pts)}
                  className="kls-center__raid-btn"
                  style={{ height: 60, fontSize: 18, background: pts > 0 ? `${currentTeam.color}22` : undefined, borderColor: pts > 0 ? currentTeam.color : undefined }}
                >
                  {pts === 0 ? "STP" : `+${pts}`}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 12, textAlign: 'center', fontSize: 10, opacity: 0.5 }}>
              STP: Stopped (0 pts, +1 to defense) | +1: Success (+1 pt)
            </div>
          </div>
        ) : (
          <div className="fadeInUp" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-warning)', marginBottom: 20 }}>
              {hTotal > gTotal ? `${homeTeam.name} Wins!` : gTotal > hTotal ? `${guestTeam.name} Wins!` : "Still Tied! GO TO GOLDEN RAID"}
            </div>
            <button onClick={onDone} className="kls-end-btn" style={{ background: 'var(--grad-primary)' }}>
              Finalize Result →
            </button>
          </div>
        )}
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
  const [homeOnCourt, setHOC] = useState(() => new Set((homeTeam?.squad || []).map((p: any) => p.id)));
  const [guestOnCourt, setGOC] = useState(() => new Set((guestTeam?.squad || []).map((p: any) => p.id)));
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
          team.outQueue = []; // Full team revived
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

      const revivePlayers = (team: any, count: number) => {
        const actualRevivals = Math.min(count, 7 - team.active, team.outQueue.length);
        for (let i = 0; i < actualRevivals; i++) {
          team.outQueue.shift(); // Remove first player who went out
          team.active++;
        }
        return actualRevivals;
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
        
        // Advanced metadata for stats
        const isSuperRaid = action.type === "RAID" && points >= 3;
        const isSuperTackle = action.type === "TACKLE" && dT.active <= 3;
        const isBonus = action.type === "BONUS";

        kabaddiScoringService.recordRaid(matchId, {
          raidNumber: next.raidCount,
          raiderId: action.rid || 'unknown',
          team: rs,
          pointsScored: points,
          touchPoints: action.type === "RAID" ? action.pts : 0,
          success: isRaidSuccess,
          type: action.type === "TACKLE" ? "tackle" : (action.type === "BONUS" ? "raid" : (isRaidSuccess ? "raid" : "empty")),
          isBonus: isBonus,
          isSuperRaid: isSuperRaid,
          isSuperTackle: isSuperTackle,
          isDoOrDie: next.doOrDie,
          defenderIds: action.dids || []
        }).catch((err: Error) => console.error("Failed to record raid:", err));

        kabaddiScoringService.updateMatchScore(matchId, next.home.score, next.guest.score)
          .catch((err: Error) => console.error("Failed to update score:", err));
      }

      switch (action.type) {
        case "RAID": {
          const pts = action.pts;
          rT.score += pts;
          if (next.pendingBonus) { rT.score += 1; next.pendingBonus = false; }
          
          // Put defenders out (Simplified: last 7 - active players)
          dT.active = Math.max(0, dT.active - pts);
          for (let i = 0; i < pts; i++) dT.outQueue.push(`P${Date.now() + i}`); // Placeholder if no IDs

          // Revive raider's team (FIFO)
          revivePlayers(rT, pts);

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
          
          // Raider goes out
          rT.active = Math.max(0, rT.active - 1);
          if (action.rid) rT.outQueue.push(action.rid);
          else rT.outQueue.push(`R${Date.now()}`);

          // Revive defender's team (Safety: max 1 revival even on Super Tackle)
          revivePlayers(dT, 1);

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
            if (action.rid) rT.outQueue.push(action.rid);
            dT.score += 1; 
            
            // Revive defender's team
            revivePlayers(dT, 1);

            rT.consEmpty = 0; next.doOrDie = false;
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
            next.pendingBonus = true; 
            playSound("point");
            showT("🎯 BONUS LINE CROSSED", "#16a34a");
          } break;
        }
        case "TECHNICAL": {
          const target = action.team === "home" ? next.home : next.guest;
          target.score += 1;
          const msg = action.reason ? `⚠️ Tech Point (${action.reason}) to ${target.name}` : `⚠️ Technical Point to ${target.name}`;
          next.eventLog.push({
            id: Date.now(), raidNo: next.raidCount, type: "RAID",
            label: msg,
            pts: 1, score: `${next.home.score}-${next.guest.score}`, time: now
          });
          playSound("point");
          break;
        }
        case "SELF_OUT": {
          const team = action.team === "home" ? next.home : next.guest;
          const opp = action.team === "home" ? next.guest : next.home;
          team.active = Math.max(0, team.active - 1);
          if (action.rid) team.outQueue.push(action.rid);
          else team.outQueue.push(`S${Date.now()}`);
          
          opp.score += 1;
          revivePlayers(opp, 1);
          
          const pName = action.rid && next.stats[action.rid] ? next.stats[action.rid].name.split(" ")[0] : "Player";
          const msg = `🚫 SELF-OUT! ${pName} (${team.name}) — +1 to ${opp.name}`;
          next.eventLog.push({
            id: Date.now(), raidNo: next.raidCount, type: "EMPTY",
            label: msg,
            pts: 1, score: `${next.home.score}-${next.guest.score}`, time: now
          });
          playSound("point");
          showT(msg, "#ef4444");
          checkAllOut(team, action.team === "home" ? "guest" : "home", 0);
          break;
        }
        case "SHOOTOUT_RECORD": {
          const pts = action.pts;
          const turn = next.shootout.turn;
          const isHome = turn === "home";
          
          if (pts > 0) {
            if (isHome) { next.home.score += pts; next.shootout.homeRaids.push(pts); }
            else { next.guest.score += pts; next.shootout.guestRaids.push(pts); }
          } else {
             // Stopped (0 pts, +1 to defense)
             if (isHome) { next.guest.score += 1; next.shootout.homeRaids.push(0); }
             else { next.home.score += 1; next.shootout.guestRaids.push(0); }
          }

          if (isHome) {
            next.shootout.turn = "guest";
          } else {
            next.shootout.turn = "home";
            next.shootout.raidIndex++;
          }
          break;
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
            .update({ status: 'live', is_timer_running: true })
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
          
          const newClock = p.clock - 1;
          // Sync clock to DB every 5 seconds or when it hits crucial marks
          if (matchId && (newClock % 5 === 0)) {
            kabaddiScoringService.updateMatchClock(matchId, newClock, true)
              .catch(e => console.error("Clock sync error:", e));
          }

          return { ...p, clock: newClock };
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      // Sync pause state
      if (matchId && matchStartedRef.current) {
        kabaddiScoringService.updateMatchClock(matchId, S.clock, false)
          .catch(e => console.error("Clock pause sync error:", e));
      }
    }
    return () => clearInterval(timerRef.current);
  }, [S.running, S.phase, matchId, postNoti, user?.id, navigate]);


  // Real-time listener for external clock/score updates
  useEffect(() => {
    if (!matchId) return;
    const unsub = kabaddiScoringService.subscribeToMatch(matchId, (update) => {
      setS(prev => {
        const next = dc(prev);
        // Sync scores
        next.home.score = update.currentState.homeScore;
        next.guest.score = update.currentState.guestScore;
        next.raidCount = update.currentState.currentRaid;
        
        // Sync clock ONLY if we are not the primary isRunning changed or clock is far off
        if (update.currentState.currentTime !== undefined) {
          const diff = Math.abs(next.clock - update.currentState.currentTime);
          if (diff > 5) {
            next.clock = update.currentState.currentTime;
          }
          next.running = update.currentState.isTimerRunning ?? next.running;
        }
        return next;
      });
    });
    return () => unsub();
  }, [matchId]);

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
  const raidingSquad = rs === "home" ? homeTeam.squad : guestTeam.squad;
  const defendingSquad = rs === "home" ? guestTeam.squad : homeTeam.squad;
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
      {S.home.score !== S.guest.score ? (
        <div style={{ fontWeight: 900, fontSize: 20, color: S.home.score > S.guest.score ? S.home.color : S.guest.color, marginBottom: 20 }}>
          {S.home.score > S.guest.score ? S.home.name : S.guest.name} Wins! 🎉
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#94a3b8", fontWeight: 800, fontSize: 18, marginBottom: 12 }}>It's a Tie! (Draw)</div>
          <button 
            onClick={() => setS(p => ({
              ...p,
              phase: "playing",
              shootout: { active: true, turn: "home", raidIndex: 0, homeRaids: [], guestRaids: [] }
            }))}
            className="kls-center__btn"
            style={{ background: 'var(--grad-primary)', color: '#fff', padding: '12px 24px', fontSize: 14 }}
          >
            START 5-RAID SHOOTOUT 🪙
          </button>
        </div>
      )}
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
      {S.shootout.active && (
        <ShootoutOverlay 
          shootout={S.shootout} 
          homeTeam={S.home} 
          guestTeam={S.guest} 
          onRecord={(pts: number) => apply({ type: 'SHOOTOUT_RECORD', pts })}
          onDone={() => setS(p => ({ ...p, phase: 'fulltime', shootout: { ...p.shootout, active: false } }))}
        />
      )}
      {defPick && <DefenderPicker squad={defendingSquad} onCourt={defOnCourt} color={dT.color} pts={defPick.pts} isSuperTackle={isSuperTackle}
        onConfirm={(dids: string[]) => {
          apply({ type: "TACKLE", pts: defPick.pts, rid, dids });
          showT(isSuperTackle ? `💪 SUPER TACKLE!\n+${defPick.pts + 1} ${dT.name}` : `🛡️ Tackle +${defPick.pts}  ${dT.name}`, isSuperTackle ? "#f97316" : "#10b981");
          setDP(null); setSR("unset");
        }}
        onCancel={() => setDP(null)}
      />}
      {showSub && <SubPanel homeTeam={homeTeam} guestTeam={guestTeam} homeOnCourt={homeOnCourt} guestOnCourt={guestOnCourt} onSub={handleSub} onClose={() => setSSub(false)} />}
      {showReset && (
        <div className="kls-dialog-overlay">
          <div className="kls-dialog">
            <div className="kls-dialog-emoji">↺</div>
            <div className="kls-dialog-title">Reset Match?</div>
            <div className="kls-dialog-sub">All scores and history will be cleared.</div>
            <div className="kls-dialog-actions">
              <button onClick={() => setSReset(false)} className="kls-dialog-btn kls-dialog-btn--cancel">Cancel</button>
              <button onClick={() => { clearInterval(timerRef.current); setS(makeInit(homeTeam, guestTeam, periodMins)); setSR("unset"); setHOC(new Set((homeTeam?.squad || []).map((p: any) => p.id))); setGOC(new Set((guestTeam?.squad || []).map((p: any) => p.id))); setSReset(false); }} className="kls-dialog-btn kls-dialog-btn--danger">Reset</button>
            </div>
          </div>
        </div>
      )}
      {showStats && <StatsPanel stats={S.stats} homeTeam={homeTeam} guestTeam={guestTeam} onClose={() => setSStats(false)} />}
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

      <div className="kls-topbar fadeInUp">
        <div className="kls-topbar-left">
          <button onClick={handleBack} className="kls-back-btn">←</button>
          <div className="kls-topbar__period-box">
            <div className="kls-topbar__period-label">PER</div>
            <div className="kls-topbar__period-num">{S.period}</div>
          </div>
        </div>
        
        <button 
          onClick={() => setS(p => ({ ...p, running: !p.running }))} 
          className="kls-topbar__clock-btn"
        >
          <span className={`kls-topbar__clock ${S.running ? 'kls-topbar__clock--running' : 'kls-topbar__clock--paused'}`}>
            {fmt(S.clock)}
          </span>
          <span className="kls-topbar__clock-hint">
            {S.running ? "PAUSE" : "START"}
          </span>
        </button>

        <div className="kls-topbar-right">
          <button onClick={() => setSStats(true)} className="kls-topbar__icon-btn">📊</button>
          <button onClick={() => setSSub(true)} className="kls-topbar__icon-btn">🔄</button>
          <button onClick={() => setSReset(true)} className="kls-topbar__icon-btn">↺</button>
        </div>
      </div>

      <div className={`kls-raidbar slideInDown ${S.doOrDie ? 'kls-raidbar--dod' : 'kls-raidbar--normal'}`}>
        <span className="kls-raidbar__word">RAID</span>
        <span className={`kls-raidbar__num ${S.doOrDie ? 'kls-raidbar__num--dod' : 'kls-raidbar__num--normal'}`}>{S.raidCount}</span>
        <div className="kls-raidbar__pill" style={{ color: rT.color, borderColor: `${rT.color}44` }}>
          {rT.name.toUpperCase()} RAIDS
        </div>
        {selRaider !== "unset" && selRaider && (
          <div className="kls-raidbar__pill">
            #{selRaider.jerseyNumber} {selRaider.name.split(" ")[0]}
          </div>
        )}
        {S.doOrDie && <div className="kls-raidbar__dod-badge">⚠️ DO-OR-DIE</div>}
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

      <div className="kls-columns">
        {/* Home Team Panel */}
        {(() => {
          const t = S.home, isR = rs === "home", low = isLowAlert(t);
          return (
            <div className="kls-team fadeInLeft" style={{ borderColor: isR ? t.color : undefined, boxShadow: isR ? `0 0 20px ${t.color}22` : undefined }}>
              <div className="kls-team__header">
                <div className="kls-team__role-wrap" style={{ background: `${t.color}15` }}>
                  <span className="kls-team__role" style={{ color: t.color }}>{isR ? "⚡ RAIDING" : "🛡️ DEFENSE"}</span>
                </div>
                <div className="kls-team__name">{t.name}</div>
              </div>
              <div className="kls-team__score" style={{ color: t.color }}>{t.score}</div>
              <div className="kls-team__court-label">ON COURT {t.active}/7</div>
              <div className="kls-team__dots">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`kls-team__dot ${i >= t.active ? 'kls-team__dot--out' : ''}`}
                    style={{ background: i < t.active ? t.color : undefined }}
                  />
                ))}
              </div>
              {low && (
                <div className="kls-team__empty-warn">
                  <div className="kls-team__empty-warn-text">🚨 {t.active} REMAINING</div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Center Controls */}
        <div className="kls-center fadeInUp">
          <div className="kls-center__box">
            <div className="kls-center__box-label">RAID TIMER</div>
            <div className="kls-topbar__clock" style={{ 
              fontSize: 32, textAlign: 'center',
              color: S.raidClock <= 5 ? 'var(--color-danger)' : S.raidClock <= 15 ? 'var(--color-primary)' : 'var(--color-success)'
            }}>
              {S.raidClock}s
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button onClick={() => setS(p => ({ ...p, raidClock: 30, raidRunning: false }))} className="kls-topbar__icon-btn" style={{ flex: 1 }}>↺</button>
              <button onClick={() => setS(p => ({ ...p, raidRunning: !p.raidRunning }))} className="kls-topbar__icon-btn" style={{ flex: 2, fontSize: 11, fontWeight: 900 }}>
                {S.raidRunning ? "PAUSE" : "START"}
              </button>
            </div>
          </div>

          <div className="kls-center__box">
            <div className="kls-center__box-label">RAID POINTS</div>
            <div className="kls-center__raid-grid">
              {[1, 2, 3].map(pts => (
                <button 
                  key={pts} 
                  onClick={() => { apply({ type: "RAID", pts, rid }); showT(`⚡ +${pts} ${rT.name}`, rT.color); setSR("unset"); }}
                  className="kls-center__raid-btn"
                >
                  +{pts}
                </button>
              ))}
            </div>
          </div>

          <div className="kls-center__box">
            <div className="kls-center__box-label">TACKLE</div>
            <div className="kls-center__tackle-grid">
              {[1, 2].map(pts => (
                <button 
                  key={pts} 
                  onClick={() => setDP({ pts })}
                  className="kls-center__tackle-btn"
                  style={{ background: isSuperTackle ? 'var(--grad-warning)' : undefined }}
                >
                  +{pts}{isSuperTackle && <span style={{ fontSize: 10, opacity: 0.8 }}>+1</span>}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => { if (S.doOrDie) { apply({ type: "EMPTY", forced: true, rid }); showT("❌ Do-or-Die fail!", "#ef4444"); } else { apply({ type: "EMPTY", rid }); } setSR("unset"); }}
            className={`kls-center__btn ${S.doOrDie ? 'kls-center__btn--empty-dod' : 'kls-center__btn--empty'}`}
          >
            {S.doOrDie ? "DO-OR-DIE FAIL" : "EMPTY RAID"}
          </button>

          <button 
            disabled={!bonusOk}
            onClick={() => apply({ type: "BONUS", rid })}
            className={`kls-center__btn ${S.pendingBonus ? 'kls-center__btn--bonus-on' : bonusOk ? 'kls-center__btn--bonus' : 'kls-center__btn--bonus-off'}`}
          >
            {S.pendingBonus ? "✓ BONUS RECORDED" : "BONUS POINT"}
          </button>

          <div style={{ display: "flex", gap: 8, width: "100%", marginTop: 4 }}>
            <button 
              onClick={() => apply({ type: "TECHNICAL", team: rs })}
              className="kls-center__btn"
              style={{ flex: 1, fontSize: 10, background: "rgba(245,158,11,0.1)", color: "#f59e0b", borderColor: "rgba(245,158,11,0.2)" }}
            >
              TECH PT (R)
            </button>
            <button 
              onClick={() => apply({ type: "TECHNICAL", team: ds })}
              className="kls-center__btn"
              style={{ flex: 1, fontSize: 10, background: "rgba(245,158,11,0.1)", color: "#f59e0b", borderColor: "rgba(245,158,11,0.2)" }}
            >
              TECH PT (D)
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, width: "100%", marginTop: 4 }}>
            <button 
              onClick={() => apply({ type: "SELF_OUT", team: rs, rid })}
              className="kls-center__btn"
              style={{ flex: 1, fontSize: 10, background: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }}
            >
              SELF OUT (R)
            </button>
            <button 
              onClick={() => apply({ type: "SELF_OUT", team: ds })}
              className="kls-center__btn"
              style={{ flex: 1, fontSize: 10, background: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }}
            >
              SELF OUT (D)
            </button>
          </div>

          <button 
            disabled={!S.history.length}
            onClick={undo}
            className={`kls-center__btn ${S.history.length ? 'kls-center__btn--undo' : 'kls-center__btn--undo-off'}`}
          >
            ↩ UNDO LAST
          </button>
        </div>

        {/* Guest Team Panel */}
        {(() => {
          const t = S.guest, isR = rs === "guest", low = isLowAlert(t);
          return (
            <div className="kls-team fadeInRight" style={{ borderColor: isR ? t.color : undefined, boxShadow: isR ? `0 0 20px ${t.color}22` : undefined }}>
              <div className="kls-team__header">
                <div className="kls-team__role-wrap" style={{ background: `${t.color}15` }}>
                  <span className="kls-team__role" style={{ color: t.color }}>{isR ? "⚡ RAIDING" : "🛡️ DEFENSE"}</span>
                </div>
                <div className="kls-team__name">{t.name}</div>
              </div>
              <div className="kls-team__score" style={{ color: t.color }}>{t.score}</div>
              <div className="kls-team__court-label">ON COURT {t.active}/7</div>
              <div className="kls-team__dots">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`kls-team__dot ${i >= t.active ? 'kls-team__dot--out' : ''}`}
                    style={{ background: i < t.active ? t.color : undefined }}
                  />
                ))}
              </div>
              {low && (
                <div className="kls-team__empty-warn">
                  <div className="kls-team__empty-warn-text">🚨 {t.active} REMAINING</div>
                </div>
              )}
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
