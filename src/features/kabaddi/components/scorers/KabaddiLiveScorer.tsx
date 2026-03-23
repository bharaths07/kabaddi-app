import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../../../../shared/services/notificationService";
import { kabaddiScoringService } from "../../../../shared/services/kabaddiScoringService";
import { useAuth } from "../../../../shared/context/AuthContext";

const HOME_SQUAD = [
  { id:"h1", name:"Pavan Kumar",   jerseyNumber:7,  role:"raider" },
  { id:"h2", name:"Ravi Singh",    jerseyNumber:3,  role:"defender" },
  { id:"h3", name:"Arjun Rao",     jerseyNumber:11, role:"raider" },
  { id:"h4", name:"Suresh Naik",   jerseyNumber:5,  role:"defender" },
  { id:"h5", name:"Kiran Reddy",   jerseyNumber:9,  role:"all-rounder" },
  { id:"h6", name:"Dev Patil",     jerseyNumber:14, role:"defender" },
  { id:"h7", name:"Ajay Kumar",    jerseyNumber:1,  role:"raider" },
];
const GUEST_SQUAD = [
  { id:"g1", name:"Rahul Sharma",  jerseyNumber:6,  role:"raider" },
  { id:"g2", name:"Vijay Nair",    jerseyNumber:4,  role:"defender" },
  { id:"g3", name:"Manoj Yadav",   jerseyNumber:10, role:"raider" },
  { id:"g4", name:"Sanjay Mehta",  jerseyNumber:2,  role:"defender" },
  { id:"g5", name:"Pradeep Singh", jerseyNumber:8,  role:"all-rounder" },
  { id:"g6", name:"Nikhil Joshi",  jerseyNumber:15, role:"defender" },
  { id:"g7", name:"Rohit Das",     jerseyNumber:12, role:"raider" },
];
const HOME  = { name:"SKBC Varadanayakanahalli", abbr:"SK", color:"#0ea5e9", squad:HOME_SQUAD };
const GUEST = { name:"CSE B",                    abbr:"CB", color:"#ef4444", squad:GUEST_SQUAD };
const MINS  = 20;

const pad = n => String(n).padStart(2,"0");
const fmt = s => `${pad(Math.floor(s/60))}:${pad(s%60)}`;
const dc  = v => JSON.parse(JSON.stringify(v));

// ── Audio ─────────────────────────────────────────────────────────
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const g = ctx.createGain();
    g.connect(ctx.destination);
    if (type === "allout") {
      // dramatic descending tone
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
  } catch(e) {}
}

function mkStats(squad, side) {
  const o = {};
  squad.forEach(p => {
    o[p.id] = { id:p.id, name:p.name, num:p.jerseyNumber, side,
      raids:0, raidPts:0, successRaids:0, emptyRaids:0,
      tackles:0, tacklePts:0, bonusPts:0, total:0 };
  });
  return o;
}

function makeInit(home, guest, mins) {
  const h = home || HOME;
  const g = guest || GUEST;
  const m = mins || MINS;
  return {
    period:1, clock:m*60, running:false,
    raidCount:1, rs:"home", doOrDie:false,
    phase:"playing", history:[],
    home:  { ...h,  score:0, active:7, consEmpty:0 },
    guest: { ...g, score:0, active:7, consEmpty:0 },
    stats: { ...mkStats(h.squad || HOME_SQUAD,"home"), ...mkStats(g.squad || GUEST_SQUAD,"guest") },
    eventLog:[],
    raidClock: 30, raidRunning: false,
  };
}

// ── Raider Strip ──────────────────────────────────────────────────
function RaiderStrip({ squad, onCourt, color, selectedId, onSelect }) {
  const available = squad.filter(p => onCourt.has(p.id));
  return (
    <div className="kls-raider-strip">
      <div className="kls-raider-strip__label">
        👤 Who's Raiding?
      </div>
      <div className="kls-raider-strip__list">
        <button 
          onClick={() => onSelect(null)} 
          className="kls-raider-strip__item"
          style={{ 
            background: selectedId === null ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.04)", 
            border: `1.5px solid ${selectedId === null ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.08)"}` 
          }}
        >
          <span className="kls-raider-strip__num-box" style={{ background: "rgba(255,255,255,0.10)", fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 900 }}>?</span>
          <span className="kls-raider-strip__name" style={{ fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>Skip</span>
        </button>
        {available.map(p => {
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
              <span className="kls-raider-strip__num-box" style={{ background: on ? color : "rgba(255,255,255,0.10)", fontSize: 13, fontWeight: 900, color: on ? "#fff" : "rgba(255,255,255,0.7)" }}>{p.jerseyNumber}</span>
              <span className="kls-raider-strip__name" style={{ fontWeight: on ? 800 : 700, color: on ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}>{p.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Defender Picker ───────────────────────────────────────────────
function DefenderPicker({ squad, onCourt, color, pts, isSuperTackle, onConfirm, onCancel }) {
  const [sel, setSel] = useState(new Set());
  const tog = id => setSel(p => { const n = new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
  const available = squad.filter(p => onCourt.has(p.id));
  return (
    <div className="kls-overlay">
      <div className={`kls-modal ${isSuperTackle ? 'kls-modal--super' : 'kls-modal--def'}`}>
        {isSuperTackle && (
          <div className="kls-super-badge">
            <div style={{ color:"#f97316", fontWeight:900, fontSize:15, fontFamily:"Rajdhani,sans-serif" }}>💪 SUPER TACKLE ZONE!</div>
            <div style={{ color:"rgba(249,115,22,0.8)", fontSize:11, fontFamily:"Nunito,sans-serif" }}>+1 bonus point added automatically</div>
          </div>
        )}
        <div className="kls-modal-title">🛡️ Who made the tackle?</div>
        <div className="kls-modal-sub">
          Tackle +{pts}{isSuperTackle?` +1 super = ${pts+1} total`:""} — tap all defenders
        </div>
        <div className="kls-grid-picker">
          {available.map(p => {
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
            Confirm {sel.size>0?`(${sel.size})`:""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub Panel ─────────────────────────────────────────────────────
function SubPanel({ homeSquad, guestSquad, homeOnCourt, guestOnCourt, onSub, onClose }) {
  const [side, setSide] = useState("home");
  const squad    = side==="home" ? homeSquad   : guestSquad;
  const onCourt  = side==="home" ? homeOnCourt : guestOnCourt;
  const color    = side==="home" ? HOME.color  : GUEST.color;
  return (
    <div className="kls-panel-overlay">
      <div className="kls-panel">
        <div className="kls-panel-header">
          <div className="kls-panel-title">🔄 Substitution</div>
          <button onClick={onClose} className="kls-panel-close">Done</button>
        </div>
        <div className="kls-tabs">
          {["home","guest"].map(s => (
            <button 
              key={s} 
              onClick={()=>setSide(s)} 
              className="kls-tab"
              style={{ 
                border: `1.5px solid ${side === s ? (s === "home" ? HOME.color : GUEST.color) : "rgba(255,255,255,0.12)"}`, 
                background: side === s ? `${s === "home" ? HOME.color : GUEST.color}20` : "transparent", 
                color: side === s ? (s === "home" ? HOME.color : GUEST.color) : "rgba(255,255,255,0.5)" 
              }}
            >
              {s==="home"?HOME.name:GUEST.name}
            </button>
          ))}
        </div>
        <div className="kls-panel-hint">TAP TO TOGGLE — GREEN = ON COURT</div>
        <div className="kls-grid-2">
          {squad.map(p => {
            const active = onCourt.has(p.id);
            return (
              <button 
                key={p.id} 
                onClick={()=>onSub(side,p.id)} 
                className="kls-item-row"
                style={{ 
                  background: active ? `${color}18` : "rgba(255,255,255,0.04)", 
                  border: `1.5px solid ${active ? color : "rgba(255,255,255,0.08)"}` 
                }}
              >
                <div className="kls-item-num" style={{ background: active ? color : "rgba(255,255,255,0.10)" }}>{p.jerseyNumber}</div>
                <div style={{ textAlign:"left" }}>
                  <div className="kls-item-name" style={{ color: active ? "#fff" : "rgba(255,255,255,0.45)" }}>{p.name}</div>
                  <div className="kls-item-status" style={{ color: active ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)" }}>{active?"● ON COURT":"○ BENCH"}</div>
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
function StatsPanel({ stats, onClose }) {
  const all = Object.values(stats);
  const raiders   = all.filter(p=>p.raids>0).sort((a,b)=>b.raidPts-a.raidPts);
  const defenders = all.filter(p=>p.tackles>0).sort((a,b)=>b.tacklePts-a.tacklePts);
  const color = p => p.side==="home" ? HOME.color : GUEST.color;
  return (
    <div className="kls-stats-overlay">
      <div className="kls-stats-container">
        <div className="kls-panel-header">
          <div className="kls-panel-title">📊 Player Stats</div>
          <button onClick={onClose} className="kls-panel-close">✕ Close</button>
        </div>
        {raiders.length===0&&defenders.length===0 ? (
          <div style={{ color:"rgba(255,255,255,0.35)", textAlign:"center", fontFamily:"Nunito,sans-serif", marginTop:80, fontSize:14, lineHeight:1.8 }}>No stats yet.<br/>Select a player before recording events.</div>
        ) : <>
          {raiders.length>0 && <>
            <div className="kls-stats-section-title">⚡ RAID LEADERS</div>
            {raiders.map(p=>(
              <div key={p.id} className="kls-stats-row">
                <div className="kls-item-num" style={{ background: color(p) }}>{p.num}</div>
                <div style={{ flex:1 }}>
                  <div className="kls-stats-name">{p.name}</div>
                  <div className="kls-stats-desc">{p.raids} raids · {p.successRaids} ✓ · {p.emptyRaids} empty</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div className="kls-stats-pts" style={{ color: color(p) }}>{p.raidPts}</div>
                  <div className="kls-stats-pts-label">raid pts</div>
                </div>
              </div>
            ))}
            <div style={{ height:16 }}/>
          </>}
          {defenders.length>0 && <>
            <div className="kls-stats-section-title">🛡️ TACKLE LEADERS</div>
            {defenders.map(p=>(
              <div key={p.id} className="kls-stats-row">
                <div className="kls-item-num" style={{ background: color(p) }}>{p.num}</div>
                <div style={{ flex:1 }}>
                  <div className="kls-stats-name">{p.name}</div>
                  <div className="kls-stats-desc">{p.tackles} tackles</div>
                </div>
                <div style={{ textAlign:"right" }}>
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
function EventLog({ log }) {
  if (log.length===0) return (
    <div style={{ padding:"24px 0", textAlign:"center", color:"rgba(255,255,255,0.25)", fontFamily:"Nunito,sans-serif", fontSize:13 }}>No events yet. Start scoring ↑</div>
  );
  const icons = { RAID:"⚡", TACKLE:"🛡️", EMPTY:"○", BONUS:"🎯", ALLOUT:"💥", SUPER:"💪", DOD_FAIL:"❌" };
  const clrs  = { RAID:"#22c55e", TACKLE:"#ef4444", EMPTY:"rgba(255,255,255,0.35)", BONUS:"#4ade80", ALLOUT:"#f59e0b", SUPER:"#f97316", DOD_FAIL:"#ef4444" };
  return (
    <div style={{ maxHeight:220, overflowY:"auto", scrollbarWidth:"none" }}>
      {[...log].reverse().map((e,i) => (
        <div key={e.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", borderBottom:"1px solid rgba(255,255,255,0.05)", background:i===0?"rgba(255,255,255,0.04)":"transparent" }}>
          <div style={{ width:28, height:28, borderRadius:8, background:`${clrs[e.type]||"#fff"}22`, border:`1px solid ${clrs[e.type]||"#fff"}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>{icons[e.type]||"·"}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:"#fff", fontWeight:800, fontSize:12, fontFamily:"Nunito,sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.label}</div>
            <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10, fontFamily:"Nunito,sans-serif" }}>Raid #{e.raidNo} · {e.time}</div>
          </div>
          {e.pts!==undefined && (
            <div style={{ color:clrs[e.type]||"#fff", fontWeight:900, fontSize:18, fontFamily:"Rajdhani,sans-serif", flexShrink:0 }}>
              {e.pts>0?`+${e.pts}`:e.pts===0?"○":""}
            </div>
          )}
          <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, fontFamily:"Nunito,sans-serif", flexShrink:0, minWidth:36, textAlign:"right" }}>{e.score}</div>
        </div>
      ))}
    </div>
  );
}

// ── All-Out Flash ─────────────────────────────────────────────────
function AllOutFlash({ team, raidPts, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.80)" }}>
      <style>{`@keyframes aoPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}`}</style>
      <div style={{ textAlign:"center", animation:"aoPulse 0.5s ease infinite" }}>
        <div style={{ fontSize:76, marginBottom:8 }}>💥</div>
        <div style={{ color:"#f59e0b", fontWeight:900, fontSize:38, fontFamily:"Rajdhani,sans-serif", letterSpacing:3 }}>ALL OUT!</div>
        <div style={{ color:"#fff", fontWeight:800, fontSize:18, fontFamily:"Nunito,sans-serif", marginTop:8 }}>{team} wiped out</div>
        {/* ✅ Shows correct breakdown: raid pts + 2 bonus */}
        <div style={{ marginTop:12, background:"rgba(245,158,11,0.2)", border:"1px solid rgba(245,158,11,0.4)", borderRadius:14, padding:"12px 24px", display:"inline-block" }}>
          <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12, fontFamily:"Nunito,sans-serif", marginBottom:4 }}>Points this raid</div>
          <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center" }}>
            <span style={{ color:"#22c55e", fontWeight:900, fontSize:22, fontFamily:"Rajdhani,sans-serif" }}>+{raidPts} raid</span>
            <span style={{ color:"rgba(255,255,255,0.4)", fontSize:18 }}>+</span>
            <span style={{ color:"#f59e0b", fontWeight:900, fontSize:22, fontFamily:"Rajdhani,sans-serif" }}>+2 lona</span>
            <span style={{ color:"rgba(255,255,255,0.4)", fontSize:18 }}>=</span>
            <span style={{ color:"#fff", fontWeight:900, fontSize:26, fontFamily:"Rajdhani,sans-serif" }}>+{raidPts+2}</span>
          </div>
        </div>
        <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13, fontFamily:"Nunito,sans-serif", marginTop:10 }}>All 7 players revived ✓</div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function App({ homeTeam, guestTeam, periodMins, matchId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [S, setS]            = useState(() => makeInit(homeTeam, guestTeam, periodMins));
  const [selRaider, setSR]   = useState("unset");
  const [defPick, setDP]     = useState(null);
  const [toast, setToast]    = useState(null);
  const [showReset, setSReset] = useState(false);
  const [showStats, setSStats] = useState(false);
  const [showSub,   setSSub]   = useState(false);
  const [showLog,   setSLog]   = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [allOutFlash, setAOF]  = useState(null); // { team, raidPts }
  const [homeOnCourt, setHOC]  = useState(() => new Set(HOME_SQUAD.map(p=>p.id)));
  const [guestOnCourt, setGOC] = useState(() => new Set(GUEST_SQUAD.map(p=>p.id)));
  const timerRef = useRef(null);
  const prevSide = useRef("home");
  const matchStartedRef = useRef(false);

  const handleBack = () => {
    if (S.phase === 'playing' || S.raidCount > 1) {
      setShowExitConfirm(true);
    } else {
      navigate('/matches');
    }
  };

  const postNoti = (title, body, type = 'match') => {
    notificationService.createNotification({
      user_id: user?.id,
      type,
      title,
      body,
      href: `/matches/${matchId || 'm1'}/live`,
      metadata: { matchId }
    });
  };

  const showT = useCallback((msg, clr="#0ea5e9") => {
    setToast({msg,clr}); setTimeout(()=>setToast(null), 2400);
  }, []);

  const apply = useCallback((action) => {
    setS(prev => {
      const next = dc(prev);
      next.history.push(dc({...prev, history:[]}));
      if (next.history.length > 60) next.history.shift();

      const rs = next.rs, ds = rs==="home" ? "guest" : "home";
      const rT = next[rs], dT = next[ds];
      const now = new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
      const endRaid = () => {
        next.raidCount++;
        next.rs = ds;
        next.raidClock = 30;
        next.raidRunning = false;
      };

      // ✅ FIX: All-Out gives exactly +2 bonus (lona rule)
      // active is allowed to reach 0, then resets to 7
      const checkAllOut = (team, scoringKey, raidPtsThisRaid) => {
        if (team.active <= 0) {
          team.active = 7; // ✅ Revival — all 7 players back
          next[scoringKey].score += 2; // ✅ +2 lona bonus only
          const totalPts = raidPtsThisRaid + 2;
          const msg = `💥 ALL OUT! ${team.name} — +${raidPtsThisRaid} raid +2 lona = +${totalPts} total to ${next[scoringKey].name}`;
          next.eventLog.push({
            id: Date.now()+Math.random(), raidNo: next.raidCount, type:"ALLOUT",
            label: msg,
            pts: 2, score:`${next.home.score}-${next.guest.score}`, time: now
          });
          postNoti("💥 ALL OUT!", msg);
          setTimeout(() => { playSound("allout"); setAOF({ team: team.name, raidPts: raidPtsThisRaid }); }, 80);
        }
      };

      const addRS = (id, pts, ok, bonus=false) => {
        if (!next.stats[id]) return;
        const s = next.stats[id];
        s.raids++; s.raidPts += pts;
        ok ? s.successRaids++ : s.emptyRaids++;
        if (bonus) s.bonusPts++;
        s.total = s.raidPts + s.tacklePts + s.bonusPts;
      };
      const addDS = (ids, pts) => {
        ids.forEach(id => {
          if (!next.stats[id]) return;
          const s = next.stats[id];
          s.tackles++; s.tacklePts += pts;
          s.total = s.raidPts + s.tacklePts + s.bonusPts;
        });
      };

      const raiderName = action.rid && next.stats[action.rid] ? next.stats[action.rid].name.split(" ")[0] : null;
      const defNames   = (action.dids||[]).map(id => next.stats[id]?.name.split(" ")[0]).filter(Boolean);

      // Persist to Supabase
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
          // ✅ FIX 1: removed Math.max(1,...) — active CAN now reach 0
          dT.active = dT.active - Math.min(pts, dT.active);
          rT.consEmpty = 0; next.doOrDie = false;
          if (action.rid) addRS(action.rid, pts, true);
          const msg = `⚡ ${raiderName||rT.name} tagged ${pts} defender${pts>1?"s":""}`;
          next.eventLog.push({ id:Date.now(), raidNo:next.raidCount, type:"RAID",
            label: msg,
            pts, score:`${next.home.score}-${next.guest.score}`, time:now });
          playSound("point");
          if (pts >= 3) {
            postNoti("🔥 SUPER RAID!", `${raiderName||rT.name} scored ${pts} points for ${rT.name}!`);
          }
          // ✅ Check all-out AFTER awarding raid pts, pass raid pts for display
          checkAllOut(dT, rs, pts);
          endRaid(); break;
        }

        case "TACKLE": {
          const pts = action.pts;
          const st  = dT.active <= 3;
          const total = pts + (st ? 1 : 0);
          dT.score += total;
          // ✅ FIX 2: raider active also CAN reach 0
          rT.active = Math.max(0, rT.active - 1);
          rT.consEmpty = 0; next.doOrDie = false;
          if (action.rid) addRS(action.rid, 0, false);
          if (action.dids?.length) addDS(action.dids, total);
          const evType = st ? "SUPER" : "TACKLE";
          const msg = st
            ? `💪 SUPER TACKLE! ${defNames.join(", ")||dT.name} — +${total}`
            : `🛡️ ${defNames.join(", ")||dT.name} tackle — +${total}`;
          next.eventLog.push({ id:Date.now(), raidNo:next.raidCount, type:evType,
            label: msg,
            pts: total, score:`${next.home.score}-${next.guest.score}`, time:now });
          playSound("point");
          if (st) {
            postNoti("💪 SUPER TACKLE!", msg);
          }
          // Check if raider going out caused an all-out on raiding team
          checkAllOut(rT, ds, 0);
          endRaid(); break;
        }

        case "EMPTY": {
          if (action.forced) {
            rT.active = Math.max(0, rT.active - 1);
            dT.score += 1; rT.consEmpty = 0; next.doOrDie = false;
            if (action.rid) addRS(action.rid, 0, false);
            next.eventLog.push({ id:Date.now(), raidNo:next.raidCount, type:"DOD_FAIL",
              label:`❌ Do-or-Die fail — ${raiderName||rT.name} OUT, +1 to ${dT.name}`,
              pts:1, score:`${next.home.score}-${next.guest.score}`, time:now });
            checkAllOut(rT, ds, 0);
          } else {
            rT.consEmpty++;
            if (action.rid) addRS(action.rid, 0, false);
            next.eventLog.push({ id:Date.now(), raidNo:next.raidCount, type:"EMPTY",
              label:`○ Empty raid — ${raiderName||rT.name}`,
              pts:0, score:`${next.home.score}-${next.guest.score}`, time:now });
            if (rT.consEmpty >= 2) next.doOrDie = true;
          }
          endRaid(); break;
        }

        case "BONUS": {
          if (dT.active >= 6) {
            rT.score += 1; rT.consEmpty = 0;
            if (action.rid) addRS(action.rid, 1, true, true);
            next.eventLog.push({ id:Date.now(), raidNo:next.raidCount, type:"BONUS",
              label:`🎯 Bonus line — ${raiderName||rT.name} +1`,
              pts:1, score:`${next.home.score}-${next.guest.score}`, time:now });
            playSound("point");
            endRaid();
          } break;
        }
      }
      return next;
    });
  }, []);

  const undo = () => {
    setS(p => { if(!p.history.length) return p; const snap=p.history[p.history.length-1]; return {...snap,history:p.history.slice(0,-1)}; });
    setSR("unset");
  };

  const handleSub = (side, pid) => {
    if (side==="home") setHOC(p=>{ const n=new Set(p); n.has(pid)?n.delete(pid):n.add(pid); return n; });
    else setGOC(p=>{ const n=new Set(p); n.has(pid)?n.delete(pid):n.add(pid); return n; });
  };

  useEffect(() => {
    if (S.rs !== prevSide.current) { prevSide.current = S.rs; setSR("unset"); }
  }, [S.rs]);

  useEffect(() => {
    if (S.running && S.phase==="playing") {
      if (!matchStartedRef.current) {
        matchStartedRef.current = true;
        postNoti("Match Started! ⚡", `${S.home.name} vs ${S.guest.name} is now LIVE.`);
      }
      timerRef.current = setInterval(() => {
        setS(p => {
          if (p.clock<=0) { 
            clearInterval(timerRef.current); 
            const isHalf = p.period === 1;
            if (isHalf) {
              postNoti("Half Time ⏱️", `Score: ${p.home.name} ${p.home.score} - ${p.guest.score} ${p.guest.name}`);
            } else {
              postNoti("Full Time 🏆", `Final: ${p.home.name} ${p.home.score} - ${p.guest.score} ${p.guest.name}`);
              
              // ✅ Auto-post to Feed
              const resultMsg = `${p.home.name} ${p.home.score} - ${p.guest.score} ${p.guest.name}`;
              const winner = p.home.score > p.guest.score ? p.home.name : p.guest.score > p.home.score ? p.guest.name : "Draw";
              const caption = `🏁 Match Ended! ${resultMsg}. ${winner !== "Draw" ? `Congratulations ${winner}! 🏆` : "It's a draw!"}`;
              
              supabase.from('feed_posts').insert({
                user_id: user?.id,
                type: 'result',
                caption,
                tournament_id: p.tournamentId,
                match_id: matchId,
                likes_count: 0
              }).catch(err => console.error("Failed to post match result to feed:", err));
            }
            return {...p, running:false, phase:isHalf?"halftime":"fulltime", clock:0}; 
          }
          return {...p, clock:p.clock-1};
        });
      }, 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [S.running, S.phase]);

  // ── Raid Timer (30s) ───────────────────────────────────────────
  useEffect(() => {
    let raidTimer;
    if (S.raidRunning && S.phase === "playing") {
      raidTimer = setInterval(() => {
        setS(p => {
          if (p.raidClock <= 1) {
            clearInterval(raidTimer);
            // Auto-fire empty raid
            setTimeout(() => {
              apply({ type: "EMPTY", forced: p.doOrDie, rid: selRaider !== "unset" ? selRaider?.id : null });
              showT(p.doOrDie ? "❌ Do-or-Die fail!\nTimer expired" : "○ Empty Raid\nTimer expired", p.doOrDie ? "#ef4444" : "rgba(255,255,255,0.4)");
            }, 0);
            return { ...p, raidClock: 30, raidRunning: false };
          }
          if (p.raidClock === 6) playSound("warn"); // Warning at 5s remaining
          return { ...p, raidClock: p.raidClock - 1 };
        });
      }, 1000);
    } else clearInterval(raidTimer);
    return () => clearInterval(raidTimer);
  }, [S.raidRunning, S.phase, S.doOrDie, selRaider, apply, showT]);

  const rs = S.rs, ds = rs==="home"?"guest":"home";
  const rT = S[rs], dT = S[ds];
  const raidingSquad   = rs==="home" ? HOME_SQUAD  : GUEST_SQUAD;
  const defendingSquad = rs==="home" ? GUEST_SQUAD : HOME_SQUAD;
  const raidOnCourt    = rs==="home" ? homeOnCourt : guestOnCourt;
  const defOnCourt     = rs==="home" ? guestOnCourt: homeOnCourt;
  const rid = selRaider!=="unset" ? selRaider?.id : undefined;
  const bonusOk       = dT.active >= 6;
  const isSuperTackle = dT.active <= 3 && dT.active > 0;
  const isLowAlert    = t => t.active <= 2 && t.active > 0;
  const F1={fontFamily:"Rajdhani,sans-serif"}, F2={fontFamily:"Nunito,sans-serif"};

  // Halftime
  if (S.phase==="halftime") return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0c1832,#0f2a50)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,...F2}}>
      <div style={{fontSize:52,marginBottom:10}}>⏱️</div>
      <div style={{color:"#f59e0b",fontWeight:900,fontSize:32,...F1,marginBottom:6}}>HALF TIME</div>
      <div style={{color:"rgba(255,255,255,0.45)",fontSize:13,marginBottom:28}}>Teams swap sides for Period 2</div>
      <div style={{display:"flex",gap:32,marginBottom:28}}>
        {[S.home,S.guest].map(t=>(
          <div key={t.name} style={{textAlign:"center"}}>
            <div style={{width:56,height:56,borderRadius:14,background:t.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,color:"#fff",margin:"0 auto 8px",...F1}}>{t.abbr}</div>
            <div style={{color:t.color,fontWeight:900,fontSize:44,...F1,lineHeight:1}}>{t.score}</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginTop:3}}>{t.name}</div>
          </div>
        ))}
      </div>
      <button onClick={()=>setS(p=>({...p,period:2,clock:MINS*60,running:false,phase:"playing",rs:p.rs==="home"?"guest":"home"}))} style={{padding:"15px 40px",borderRadius:14,border:"none",background:"#0ea5e9",color:"#fff",fontWeight:900,fontSize:17,cursor:"pointer",...F2}}>Start Period 2 →</button>
    </div>
  );

  // Fulltime
  if (S.phase==="fulltime") return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0c1832,#0f2a50)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,...F2}}>
      <div style={{fontSize:52,marginBottom:10}}>🏆</div>
      <div style={{color:"#fbbf24",fontWeight:900,fontSize:32,...F1,marginBottom:12}}>FULL TIME</div>
      {S.home.score!==S.guest.score
        ? <div style={{fontWeight:900,fontSize:20,color:S.home.score>S.guest.score?S.home.color:S.guest.color,marginBottom:20}}>{S.home.score>S.guest.score?S.home.name:S.guest.name} Wins! 🎉</div>
        : <div style={{color:"#94a3b8",fontWeight:800,fontSize:18,marginBottom:20}}>It's a Tie!</div>}
      <div style={{display:"flex",gap:32,marginBottom:28}}>
        {[S.home,S.guest].map(t=>(
          <div key={t.name} style={{textAlign:"center"}}>
            <div style={{color:t.color,fontWeight:900,fontSize:52,...F1,lineHeight:1}}>{t.score}</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:13}}>{t.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
  // End Match View
  if (S.phase === "completed") return (
    <div style={{minHeight:"100vh",background:"#0c1832",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center",...F2}}>
      <div style={{fontSize:64,marginBottom:20}}>🏁</div>
      <h1 style={{color:"#fff",fontSize:32,fontWeight:900,...F1,margin:"0 0 8px 0"}}>Match Completed!</h1>
      <p style={{color:"rgba(255,255,255,0.5)",fontSize:16,marginBottom:32}}>The final score has been recorded.</p>
      
      <div style={{background:"rgba(255,255,255,0.05)",borderRadius:24,padding:32,width:"100%",maxWidth:400,border:"1px solid rgba(255,255,255,0.1)",marginBottom:40}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{textAlign:"left"}}>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:12,fontWeight:800,textTransform:"uppercase"}}>{S.home.name}</div>
            <div style={{color:"#fff",fontSize:48,fontWeight:900,...F1}}>{S.home.score}</div>
          </div>
          <div style={{color:"rgba(255,255,255,0.2)",fontSize:24,fontWeight:900}}>VS</div>
          <div style={{textAlign:"right"}}>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:12,fontWeight:800,textTransform:"uppercase"}}>{S.guest.name}</div>
            <div style={{color:"#fff",fontSize:48,fontWeight:900,...F1}}>{S.guest.score}</div>
          </div>
        </div>
        <div style={{background: S.home.score > S.guest.score ? S.home.color : S.guest.color, color:"#fff", padding:"8px 16px", borderRadius:12, fontWeight:900, fontSize:14}}>
          🏆 {S.home.score > S.guest.score ? S.home.name : S.guest.score > S.home.score ? S.guest.name : "Match Drawn"} WON
        </div>
      </div>

      <div style={{display:"flex",gap:12,width:"100%",maxWidth:400}}>
        <button onClick={()=>setSStats(true)} style={{flex:1,padding:"16px",borderRadius:16,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer"}}>📊 Full Stats</button>
        <button 
          onClick={() => navigate(`/matches/${matchId || 'm1'}/summary`)}
          style={{flex:1,padding:"16px",borderRadius:16,border:"none",background:"#f97316",color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer",boxShadow:"0 4px 12px rgba(249, 115, 22, 0.3)"}}
        >
          View Summary
        </button>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>setSStats(true)} style={{padding:"13px 24px",borderRadius:14,border:"none",background:"#0ea5e9",color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer",...F2}}>📊 Stats</button>
        <button onClick={()=>setSLog(true)} style={{padding:"13px 24px",borderRadius:14,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",...F2}}>📋 Log</button>
        <button 
          onClick={() => navigate(`/matches/${matchId || 'm1'}/summary`)}
          style={{padding:"13px 24px",borderRadius:14,border:"none",background:"#f97316",color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer",...F2,boxShadow:"0 4px 12px rgba(249, 115, 22, 0.3)"}}
        >
          🏁 Finish Match
        </button>
      </div>
      {showStats && <StatsPanel stats={S.stats} onClose={()=>setSStats(false)}/>}
      {showLog && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.94)",zIndex:800,overflowY:"auto"}}>
          <div style={{maxWidth:480,margin:"0 auto",padding:"20px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{color:"#fff",fontWeight:900,fontSize:22,...F1}}>📋 Match Log</div>
              <button onClick={()=>setSLog(false)} style={{background:"rgba(255,255,255,0.10)",border:"none",borderRadius:10,padding:"8px 14px",color:"#fff",fontWeight:800,cursor:"pointer",...F2}}>✕</button>
            </div>
            <EventLog log={S.eventLog}/>
          </div>
        </div>
      )}
    </div>
  );

  // Main scorer
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0c1832 0%,#0f2a50 100%)",display:"flex",flexDirection:"column",userSelect:"none",position:"relative"}}>
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent} button:active{transform:scale(0.92);transition:transform 0.08s} @keyframes flashRed{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>

      {allOutFlash && <AllOutFlash team={allOutFlash.team} raidPts={allOutFlash.raidPts} onDone={()=>setAOF(null)}/>}
      {toast && <div style={{position:"fixed",top:68,left:"50%",transform:"translateX(-50%)",background:toast.clr,color:"#fff",borderRadius:12,padding:"10px 20px",fontWeight:800,fontSize:14,zIndex:850,whiteSpace:"pre-line",textAlign:"center",boxShadow:`0 8px 28px ${toast.clr}88`,maxWidth:260,...F2}}>{toast.msg}</div>}
      {defPick && <DefenderPicker squad={defendingSquad} onCourt={defOnCourt} color={dT.color} pts={defPick.pts} isSuperTackle={isSuperTackle}
        onConfirm={dids=>{
          apply({type:"TACKLE",pts:defPick.pts,rid,dids});
          showT(isSuperTackle?`💪 SUPER TACKLE!\n+${defPick.pts+1} ${dT.name}`:`🛡️ Tackle +${defPick.pts}  ${dT.name}`, isSuperTackle?"#f97316":"#10b981");
          setDP(null); setSR("unset");
        }}
        onCancel={()=>setDP(null)}
      />}
      {showSub && <SubPanel homeSquad={HOME_SQUAD} guestSquad={GUEST_SQUAD} homeOnCourt={homeOnCourt} guestOnCourt={guestOnCourt} onSub={handleSub} onClose={()=>setSSub(false)}/>}
      {showReset && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:700,padding:24}}>
          <div style={{background:"#1e293b",borderRadius:20,padding:"28px 22px",maxWidth:300,width:"100%",textAlign:"center",border:"1px solid rgba(255,255,255,0.1)",...F2}}>
            <div style={{fontSize:36,marginBottom:10}}>↺</div>
            <div style={{color:"#fff",fontWeight:900,fontSize:20,...F1,marginBottom:8}}>Reset Match?</div>
            <div style={{color:"rgba(255,255,255,0.45)",fontSize:13,marginBottom:22}}>All scores and history will be cleared.</div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setSReset(false)} style={{flex:1,padding:12,borderRadius:11,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"#fff",fontWeight:800,cursor:"pointer"}}>Cancel</button>
              <button onClick={()=>{clearInterval(timerRef.current);setS(makeInit());setSR("unset");setHOC(new Set(HOME_SQUAD.map(p=>p.id)));setGOC(new Set(GUEST_SQUAD.map(p=>p.id)));setSReset(false);}} style={{flex:1,padding:12,borderRadius:11,border:"none",background:"#ef4444",color:"#fff",fontWeight:900,cursor:"pointer"}}>Reset</button>
            </div>
          </div>
        </div>
      )}
      {showStats && <StatsPanel stats={S.stats} onClose={()=>setSStats(false)}/>}
      {showExitConfirm && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24}}>
          <div style={{background:"#1e293b",borderRadius:20,padding:"28px 22px",maxWidth:300,width:"100%",textAlign:"center",border:"1px solid rgba(255,255,255,0.1)",...F2}}>
            <div style={{fontSize:36,marginBottom:10}}>🏁</div>
            <div style={{color:"#fff",fontWeight:900,fontSize:20,...F1,marginBottom:8}}>End Match?</div>
            <div style={{color:"rgba(255,255,255,0.45)",fontSize:13,marginBottom:22}}>Are you sure you want to exit the scorer? The match progress is saved.</div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowExitConfirm(false)} style={{flex:1,padding:12,borderRadius:11,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"#fff",fontWeight:800,cursor:"pointer"}}>Keep Scoring</button>
              <button onClick={() => navigate('/matches')} style={{flex:1,padding:12,borderRadius:11,border:"none",background:"#ef4444",color:"#fff",fontWeight:900,cursor:"pointer"}}>Exit Match</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.08)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={handleBack} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,width:32,height:32,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18}}>←</button>
          <div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:10,fontWeight:700,letterSpacing:2,...F2}}>PERIOD</div>
            <div style={{color:"#fff",fontWeight:700,fontSize:24,...F1,lineHeight:1}}>{S.period}</div>
          </div>
        </div>
        <button onClick={()=>setS(p=>({...p,running:!p.running}))} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",padding:0}}>
          <span style={{fontSize:42,fontWeight:700,...F1,lineHeight:1,letterSpacing:3,color:S.running?"#f59e0b":"#fff",textShadow:S.running?"0 0 24px rgba(245,158,11,0.55)":"none"}}>{fmt(S.clock)}</span>
          <span style={{color:"rgba(255,255,255,0.3)",fontSize:10,...F2,marginTop:2}}>{S.running?"⏸ tap to pause":"▶ tap to start"}</span>
        </button>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setSStats(true)} style={{width:34,height:34,borderRadius:9,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",fontSize:15,cursor:"pointer"}}>📊</button>
          <button onClick={()=>setSSub(true)}   style={{width:34,height:34,borderRadius:9,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",fontSize:15,cursor:"pointer"}}>🔄</button>
          <button onClick={()=>setSReset(true)} style={{width:34,height:34,borderRadius:9,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",fontSize:17,cursor:"pointer"}}>↺</button>
        </div>
      </div>

      {/* Raid Bar */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",background:S.doOrDie?"rgba(245,158,11,0.12)":"rgba(0,0,0,0.22)",borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}>
        <span style={{color:"rgba(255,255,255,0.4)",fontSize:11,fontWeight:700,letterSpacing:"0.1em",...F2}}>RAID</span>
        <span style={{color:S.doOrDie?"#f59e0b":"#fff",fontWeight:900,fontSize:22,...F1}}>{S.raidCount}</span>
        <span style={{background:`${rT.color}2a`,border:`1px solid ${rT.color}55`,color:rT.color,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:800,...F2}}>{rT.name} RAIDS</span>
        {selRaider!=="unset"&&selRaider && <span style={{background:"rgba(255,255,255,0.10)",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.8)",...F2}}>#{selRaider.jerseyNumber} {selRaider.name.split(" ")[0]}</span>}
        {S.doOrDie && <span style={{background:"rgba(245,158,11,0.2)",border:"1px solid rgba(245,158,11,0.5)",color:"#f59e0b",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:800,...F2}}>⚠️ DO-OR-DIE</span>}
      </div>

      {/* Super Tackle Banner */}
      {isSuperTackle && (
        <div style={{background:"rgba(249,115,22,0.18)",borderBottom:"1px solid rgba(249,115,22,0.4)",padding:"7px 14px",display:"flex",alignItems:"center",gap:8,flexShrink:0,animation:"flashRed 1.2s ease infinite"}}>
          <span style={{fontSize:16}}>💪</span>
          <span style={{color:"#f97316",fontWeight:900,fontSize:13,...F1,letterSpacing:1}}>SUPER TACKLE ZONE</span>
          <span style={{color:"rgba(249,115,22,0.75)",fontSize:11,...F2}}>{dT.name}: {dT.active} players — +1 bonus on tackle!</span>
        </div>
      )}

      {/* Low player warning (2 or fewer, not super tackle zone) */}
      {!isSuperTackle && (isLowAlert(S.home)||isLowAlert(S.guest)) && (
        <div style={{background:"rgba(239,68,68,0.15)",borderBottom:"1px solid rgba(239,68,68,0.3)",padding:"6px 14px",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:14}}>🚨</span>
          <span style={{color:"#ef4444",fontWeight:800,fontSize:12,...F2}}>
            {[S.home,S.guest].filter(isLowAlert).map(t=>`${t.name}: ${t.active} left`).join(" · ")} — All-Out risk!
          </span>
        </div>
      )}

      {/* Raider Strip */}
      <RaiderStrip squad={raidingSquad} onCourt={raidOnCourt} color={rT.color}
        selectedId={selRaider==="unset" ? null : (selRaider?.id ?? null)}
        onSelect={p=>setSR(p)}
      />

      {/* 3-column */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.35fr 1fr",gap:8,padding:10,flex:1}}>

        {/* Home Panel */}
        {(()=>{ const t=S.home,isR=rs==="home",low=isLowAlert(t); return (
          <div style={{background:low?"rgba(239,68,68,0.08)":"rgba(255,255,255,0.04)",borderRadius:14,padding:12,border:`1.5px solid ${low?"rgba(239,68,68,0.5)":isR?t.color+"88":"rgba(255,255,255,0.06)"}`,boxShadow:isR?`0 0 22px ${t.color}22`:"none",display:"flex",flexDirection:"column",gap:8}}>
            <div style={{background:isR?`${t.color}22`:"transparent",border:isR?`1px solid ${t.color}44`:"none",borderRadius:20,padding:"3px 10px",alignSelf:"flex-start"}}>
              <span style={{color:t.color,fontSize:11,fontWeight:800,...F2}}>{isR?"⚡ RAIDING":"🛡️ DEF"}</span>
            </div>
            <div style={{color:"rgba(255,255,255,0.75)",fontSize:11,fontWeight:700,...F2,lineHeight:1.3}}>{t.name}</div>
            <div style={{color:t.color,fontWeight:700,fontSize:48,...F1,lineHeight:1,textShadow:`0 0 32px ${t.color}44`}}>{t.score}</div>
            <div>
              <div style={{color:"rgba(255,255,255,0.3)",fontSize:9,...F2,marginBottom:5}}>ON COURT {t.active}/7</div>
              <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{Array.from({length:7}).map((_,i)=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:i<t.active?t.color:"rgba(255,255,255,0.12)"}}/>)}</div>
            </div>
            {low && <div style={{background:"rgba(239,68,68,0.2)",borderRadius:8,padding:"4px 8px"}}><span style={{color:"#ef4444",fontSize:10,fontWeight:800,...F2}}>🚨 {t.active} left!</span></div>}
            {t.consEmpty>0&&!low && <div style={{background:"rgba(245,158,11,0.15)",borderRadius:8,padding:"4px 8px"}}><span style={{color:"#f59e0b",fontSize:10,fontWeight:700,...F2}}>{t.consEmpty} empty</span></div>}
          </div>
        );})()}

        {/* Center */}
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {/* ── Raid Timer (New) ── */}
          <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 14, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", ...F2 }}>RAID TIMER</span>
              <div style={{
                fontSize: 34,
                fontWeight: 900,
                lineHeight: 1,
                ...F1,
                color: S.raidClock <= 5 ? "#ef4444" : S.raidClock <= 15 ? "#f59e0b" : "#22c55e",
                animation: S.raidClock <= 5 && S.raidRunning ? "flashRed 0.5s ease infinite" : "none",
                textShadow: `0 0 15px ${S.raidClock <= 5 ? "rgba(239,68,68,0.3)" : S.raidClock <= 15 ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.3)"}`
              }}>
                {S.raidClock}s
              </div>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setS(p => ({ ...p, raidClock: 30, raidRunning: false }))}
                style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ↺
              </button>
              <button
                onClick={() => setS(p => ({ ...p, raidRunning: !p.raidRunning }))}
                style={{
                  padding: "0 14px",
                  height: 36,
                  borderRadius: 10,
                  border: "none",
                  background: S.raidRunning ? "rgba(239,68,68,0.2)" : "#0ea5e9",
                  color: S.raidRunning ? "#ef4444" : "#fff",
                  fontWeight: 900,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  ...F2
                }}
              >
                {S.raidRunning ? "⏸ PAUSE" : "▶ START"}
              </button>
            </div>
          </div>

          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:12,padding:"10px 10px 8px",border:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:10,fontWeight:700,letterSpacing:"0.05em",marginBottom:8,...F2}}>
              RAID —{" "}{selRaider!=="unset"&&selRaider?<span style={{color:rT.color}}>#{selRaider.jerseyNumber} {selRaider.name.split(" ")[0]}</span>:<span style={{opacity:0.5}}>select player ↑</span>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
              {[1,2,3].map(pts=>(
                <button key={pts} onClick={()=>{apply({type:"RAID",pts,rid});showT(`⚡ +${pts} ${rT.name}`,rT.color);setSR("unset");}} style={{padding:"14px 0",borderRadius:10,border:"none",background:"#16a34a",color:"#fff",fontSize:20,fontWeight:900,cursor:"pointer",...F1}}>+{pts}</button>
              ))}
            </div>
            <div style={{color:"rgba(255,255,255,0.2)",fontSize:9,textAlign:"center",marginTop:5,...F2}}>defenders tagged</div>
          </div>

          <div style={{background:isSuperTackle?"rgba(249,115,22,0.12)":"rgba(255,255,255,0.04)",borderRadius:12,padding:"10px 10px 8px",border:`1px solid ${isSuperTackle?"rgba(249,115,22,0.45)":"rgba(255,255,255,0.07)"}`,transition:"all 0.3s"}}>
            <div style={{color:isSuperTackle?"#f97316":"rgba(255,255,255,0.5)",fontSize:10,fontWeight:800,letterSpacing:"0.05em",marginBottom:8,...F2}}>
              {isSuperTackle?"💪 SUPER TACKLE":"TACKLE"} — {dT.name}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[1,2].map(pts=>(
                <button key={pts} onClick={()=>setDP({pts})} style={{padding:"14px 0",borderRadius:10,border:"none",background:isSuperTackle?"#f97316":"#dc2626",color:"#fff",fontSize:20,fontWeight:900,cursor:"pointer",...F1,boxShadow:isSuperTackle?"0 4px 18px rgba(249,115,22,0.45)":"none"}}>
                  +{pts}{isSuperTackle&&<span style={{fontSize:11}}>(+1)</span>}
                </button>
              ))}
            </div>
          </div>

          <button onClick={()=>{if(S.doOrDie){apply({type:"EMPTY",forced:true,rid});showT("❌ Do-or-Die fail!\nRaider OUT","#ef4444");}else{apply({type:"EMPTY",rid});}setSR("unset");}}
            style={{padding:"11px 0",borderRadius:10,border:`1px solid ${S.doOrDie?"rgba(245,158,11,0.4)":"rgba(255,255,255,0.10)"}`,background:S.doOrDie?"rgba(245,158,11,0.18)":"rgba(255,255,255,0.06)",color:S.doOrDie?"#f59e0b":"rgba(255,255,255,0.65)",fontWeight:800,fontSize:12,cursor:"pointer",...F2}}>
            {S.doOrDie?"⚠️ FAIL (Auto OUT)":"EMPTY RAID"}
          </button>

          <button disabled={!bonusOk} onClick={()=>{apply({type:"BONUS",rid});showT(`🎯 Bonus +1  ${rT.name}`,"#16a34a");setSR("unset");}}
            style={{padding:"11px 0",borderRadius:10,border:`1px solid ${bonusOk?"rgba(22,163,74,0.45)":"rgba(255,255,255,0.06)"}`,background:bonusOk?"rgba(22,163,74,0.20)":"rgba(255,255,255,0.04)",color:bonusOk?"#4ade80":"rgba(255,255,255,0.25)",fontWeight:800,fontSize:12,cursor:bonusOk?"pointer":"not-allowed",...F2}}>
            🎯 BONUS{!bonusOk&&<span style={{opacity:0.5}}> (need 6)</span>}
          </button>

          <button disabled={!S.history.length} onClick={undo}
            style={{padding:"9px 0",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.04)",color:S.history.length?"rgba(255,255,255,0.55)":"rgba(255,255,255,0.2)",fontWeight:700,fontSize:12,cursor:S.history.length?"pointer":"not-allowed",...F2}}>
            ↩ UNDO
          </button>
        </div>

        {/* Guest Panel */}
        {(()=>{ const t=S.guest,isR=rs==="guest",low=isLowAlert(t); return (
          <div style={{background:low?"rgba(239,68,68,0.08)":"rgba(255,255,255,0.04)",borderRadius:14,padding:12,border:`1.5px solid ${low?"rgba(239,68,68,0.5)":isR?t.color+"88":"rgba(255,255,255,0.06)"}`,boxShadow:isR?`0 0 22px ${t.color}22`:"none",display:"flex",flexDirection:"column",gap:8}}>
            <div style={{background:isR?`${t.color}22`:"transparent",border:isR?`1px solid ${t.color}44`:"none",borderRadius:20,padding:"3px 10px",alignSelf:"flex-start"}}>
              <span style={{color:t.color,fontSize:11,fontWeight:800,...F2}}>{isR?"⚡ RAIDING":"🛡️ DEF"}</span>
            </div>
            <div style={{color:"rgba(255,255,255,0.75)",fontSize:11,fontWeight:700,...F2,lineHeight:1.3}}>{t.name}</div>
            <div style={{color:t.color,fontWeight:700,fontSize:48,...F1,lineHeight:1,textShadow:`0 0 32px ${t.color}44`}}>{t.score}</div>
            <div>
              <div style={{color:"rgba(255,255,255,0.3)",fontSize:9,...F2,marginBottom:5}}>ON COURT {t.active}/7</div>
              <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{Array.from({length:7}).map((_,i)=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:i<t.active?t.color:"rgba(255,255,255,0.12)"}}/>)}</div>
            </div>
            {low && <div style={{background:"rgba(239,68,68,0.2)",borderRadius:8,padding:"4px 8px"}}><span style={{color:"#ef4444",fontSize:10,fontWeight:800,...F2}}>🚨 {t.active} left!</span></div>}
            {t.consEmpty>0&&!low && <div style={{background:"rgba(245,158,11,0.15)",borderRadius:8,padding:"4px 8px"}}><span style={{color:"#f59e0b",fontSize:10,fontWeight:700,...F2}}>{t.consEmpty} empty</span></div>}
          </div>
        );})()}
      </div>

      {/* Event Log */}
      <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",flexShrink:0}}>
        <button onClick={()=>setSLog(p=>!p)} style={{width:"100%",padding:"9px 14px",background:"rgba(0,0,0,0.25)",border:"none",color:"rgba(255,255,255,0.5)",fontWeight:800,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",...F2}}>
          <span>📋 MATCH LOG ({S.eventLog.length} events)</span>
          <span style={{fontSize:14}}>{showLog?"▼":"▲"}</span>
        </button>
        {showLog && <EventLog log={S.eventLog}/>}
      </div>
    </div>
  );
}
