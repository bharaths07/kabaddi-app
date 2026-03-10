import React, { useState, useEffect, useRef, useCallback } from "react";
import "./KabaddiLiveScorer.css";
import { PosterPreview } from "../../components/posters";
import type { PosterData } from "../../components/posters/engine/posterTypes";
import { kabaddiScoringService } from "../../../../shared/services/kabaddiScoringService";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface MatchTeam {
  /** Display name e.g. "SKBC" */
  name: string;
  /** Up to 3 letters e.g. "SK" */
  abbr: string;
  /** Hex colour e.g. "#0ea5e9" */
  color: string;
}

export interface KabaddiLiveScorerProps {
  /** Team that starts as HOME (raids first) */
  homeTeam: MatchTeam;
  /** Team that starts as GUEST */
  guestTeam: MatchTeam;
  /** Period duration in minutes (default 20) */
  periodMins?: number;
  /** Called when user taps "End Match" on the fulltime overlay */
  onMatchEnd?: (result: MatchResult) => void;
  /** Optional backend match id for Supabase sync */
  matchId?: string;
}

export interface MatchResult {
  homeScore: number;
  guestScore: number;
  winner: "home" | "guest" | "tie";
  totalRaids: number;
}

// ─── INTERNAL TYPES ───────────────────────────────────────────────────────────

interface TeamState extends MatchTeam {
  score: number;
  activePlayers: number;   // 1-7 currently on court
  consecutiveEmpty: number;
  captain: string;
  location: string;
  players: any[];
  matchesPlayed: number;
}

type RaidSide = "home" | "guest";
type Phase    = "playing" | "halftime" | "fulltime";

interface MatchState {
  period: 1 | 2;
  clock: number;           // seconds remaining
  running: boolean;
  raidCount: number;
  raidingSide: RaidSide;
  home: TeamState;
  guest: TeamState;
  doOrDie: boolean;
  phase: Phase;
  toast: { msg: string; type: string } | null;
  history: Omit<MatchState, "history">[];
}

interface Action {
  type: "RAID" | "TACKLE" | "EMPTY" | "BONUS";
  pts?: number;
  forced?: boolean;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const pad = (n: number) => n.toString().padStart(2, "0");
const fmtTime = (s: number) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

const mkTeam = (t: MatchTeam): TeamState => ({
  ...t,
  score: 0,
  activePlayers: 7,
  consecutiveEmpty: 0,
  captain: '',
  location: '',
  players: [],
  matchesPlayed: 0,
});

function makeInitial(home: MatchTeam, guest: MatchTeam, mins: number): MatchState {
  return {
    period: 1,
    clock: mins * 60,
    running: false,
    raidCount: 1,
    raidingSide: "home",
    home: mkTeam(home),
    guest: mkTeam(guest),
    doOrDie: false,
    phase: "playing",
    toast: null,
    history: [],
  };
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

/** Seven dots showing players on court */
function PlayerDots({ active, color }: { active: number; color: string }) {
  return (
    <div className="kls-team__dots">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="kls-team__dot"
          style={{
            background: i < active ? color : "rgba(255,255,255,0.14)",
            border: `1px solid ${i < active ? color : "rgba(255,255,255,0.08)"}`,
          }}
        />
      ))}
    </div>
  );
}

/** Left / right team panel */
function TeamPanel({ team, isRaiding }: { team: TeamState; isRaiding: boolean }) {
  return (
    <div
      className="kls-team"
      style={{
        border: isRaiding
          ? `1.5px solid ${team.color}99`
          : "1.5px solid rgba(255,255,255,0.06)",
        boxShadow: isRaiding ? `0 0 22px ${team.color}22` : "none",
      }}
    >
      {/* Role label */}
      <div className="kls-team__header">
        <div
          className="kls-team__role-wrap"
          style={{
            background: isRaiding ? `${team.color}22` : "transparent",
            border:     isRaiding ? `1px solid ${team.color}44` : "none",
          }}
        >
          <span className="kls-team__role" style={{ color: team.color }}>
            {isRaiding ? "⚡ RAIDING" : "🛡️ DEF"}
          </span>
        </div>
        <div className="kls-team__name">{team.name}</div>
      </div>

      {/* Big score */}
      <div
        className="kls-team__score"
        style={{ color: team.color, textShadow: `0 0 32px ${team.color}44` }}
      >
        {team.score}
      </div>

      {/* Court dots */}
      <div>
        <div className="kls-team__court-label">ON COURT {team.activePlayers}/7</div>
        <PlayerDots active={team.activePlayers} color={team.color} />
      </div>

      {/* Consecutive empty warning */}
      {team.consecutiveEmpty > 0 && (
        <div className="kls-team__empty-warn">
          <span className="kls-team__empty-warn-text">
            {team.consecutiveEmpty} empty raid{team.consecutiveEmpty > 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}

/** Floating toast */
function Toast({ toast }: { toast: MatchState["toast"] }) {
  if (!toast) return null;
  const BG: Record<string, string> = {
    allout: "#ef4444", dod: "#f59e0b",
    bonus: "#16a34a", good: "#0ea5e9",
  };
  return (
    <div
      className="kls-toast"
      style={{ background: BG[toast.type] ?? "#334155", boxShadow: `0 8px 28px ${BG[toast.type] ?? "#334155"}88` }}
    >
      {toast.msg}
    </div>
  );
}

/** Half-time overlay */
function HalfTimeOverlay({
  home, guest, onContinue,
}: {
  home: TeamState; guest: TeamState; onContinue: () => void;
}) {
  const leader =
    home.score > guest.score ? home.name
    : home.score < guest.score ? guest.name
    : "Both teams";

  return (
    <div className="kls-overlay kls-overlay--half">
      <div className="kls-overlay__emoji">⏱️</div>
      <div className="kls-overlay__title kls-overlay__title--half">HALF TIME</div>
      <div className="kls-overlay__sub">Teams swap sides for Period 2</div>

      <div className="kls-overlay__score-row">
        {[home, guest].map((t) => (
          <div key={t.name} style={{ textAlign: "center" }}>
            <div
              className="kls-overlay__badge"
              style={{ background: `linear-gradient(135deg,${t.color},${t.color}88)` }}
            >
              {t.abbr}
            </div>
            <div className="kls-overlay__team-score" style={{ color: t.color }}>{t.score}</div>
            <div className="kls-overlay__team-name">{t.name}</div>
          </div>
        ))}
      </div>

      <div className="kls-overlay__summary">
        <div className="kls-overlay__summary-label">{leader} leading at half</div>
        <div className="kls-overlay__summary-score">{home.score} – {guest.score}</div>
      </div>

      <button className="kls-overlay__cta" onClick={onContinue}>
        Start Period 2 →
      </button>
    </div>
  );
}

/** Full-time overlay */
function FullTimeOverlay({
  home, guest, onEnd, onPosters,
}: {
  home: TeamState; guest: TeamState; onEnd: () => void; onPosters: () => void;
}) {
  const winner =
    home.score > guest.score ? home
    : home.score < guest.score ? guest
    : null;

  return (
    <div className="kls-overlay kls-overlay--full">
      <div className="kls-overlay__emoji">🏆</div>
      <div className="kls-overlay__title kls-overlay__title--full">FULL TIME</div>

      {winner ? (
        <div className="kls-overlay__winner" style={{ color: winner.color }}>
          {winner.name} Wins! 🎉
        </div>
      ) : (
        <div className="kls-overlay__tie">It's a Tie!</div>
      )}

      <div className="kls-overlay__score-row">
        {[home, guest].map((t) => (
          <div key={t.name} style={{ textAlign: "center" }}>
            <div className="kls-overlay__team-score" style={{ color: t.color }}>{t.score}</div>
            <div className="kls-overlay__team-name">{t.name}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button className="kls-overlay__end-btn" onClick={onEnd}>
          End Match
        </button>
        <button className="kls-overlay__end-btn" onClick={onPosters} style={{ background: "#0ea5e9" }}>
          🎨 Generate Posters
        </button>
      </div>
    </div>
  );
}

/** Reset confirm dialog */
function ResetDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="kls-backdrop">
      <div className="kls-dialog">
        <div className="kls-dialog__icon">↺</div>
        <div className="kls-dialog__title">Reset Match?</div>
        <div className="kls-dialog__body">All scores and history will be cleared.</div>
        <div className="kls-dialog__btns">
          <button className="kls-dialog__cancel" onClick={onCancel}>Cancel</button>
          <button className="kls-dialog__confirm" onClick={onConfirm}>Reset</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const DEFAULT_HOME: MatchTeam = { name: "Home Team", abbr: "HM", color: "#0ea5e9" };
const DEFAULT_GUEST: MatchTeam = { name: "Guest Team", abbr: "GT", color: "#ef4444" };

export default function KabaddiLiveScorer({
  homeTeam = DEFAULT_HOME,
  guestTeam = DEFAULT_GUEST,
  periodMins = 20,
  onMatchEnd,
  matchId,
}: KabaddiLiveScorerProps) {
  const initState = makeInitial(homeTeam, guestTeam, periodMins);
  const [S, setS] = useState<MatchState>(initState);
  const [showReset, setShowReset] = useState(false);
  const [posterData, setPosterData] = useState<PosterData | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;
    (async () => {
      try {
        const live = await kabaddiScoringService.getLiveMatch(matchId);
        if (!live || cancelled) return;
        setS((prev) => ({
          ...prev,
          home: { ...prev.home, score: live.home_score ?? prev.home.score },
          guest: { ...prev.guest, score: live.guest_score ?? prev.guest.score },
          raidCount: live.raid_number ?? prev.raidCount,
        }));
      } catch {
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  // ── timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (S.running && S.phase === "playing") {
      timerRef.current = setInterval(() => {
        setS((prev) => {
          if (prev.clock <= 0) {
            clearInterval(timerRef.current!);
            if (prev.period === 1) {
              return { ...prev, running: false, phase: "halftime", clock: 0 };
            }
            return { ...prev, running: false, phase: "fulltime", clock: 0 };
          }
          return { ...prev, clock: prev.clock - 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [S.running, S.phase]);

  // ── toast ──────────────────────────────────────────────────────────────────
  const toast = useCallback((msg: string, type = "good") => {
    setS((p) => ({ ...p, toast: { msg, type } }));
    setTimeout(() => setS((p) => ({ ...p, toast: null })), 2600);
  }, []);

  // ── scoring engine ─────────────────────────────────────────────────────────
  const apply = useCallback((action: Action) => {
    setS((prev) => {
      const next = deepClone(prev) as MatchState;

      // snapshot for undo (cap at 60)
      (next.history as MatchState["history"]).push(
        deepClone({ ...prev, history: [] }) as Omit<MatchState, "history">
      );
      if (next.history.length > 60) next.history.shift();

      const rs   = next.raidingSide;                        // raiding side key
      const ds   = rs === "home" ? "guest" : "home";        // defending side key
      const rT   = next[rs]  as TeamState;
      const dT   = next[ds]  as TeamState;

      // flip after every raid
      const endRaid = () => {
        next.raidCount++;
        next.raidingSide = ds as RaidSide;
      };

      // all-out check: if a team hits 0 players the opponents get +7
      const checkAllOut = (team: TeamState, scoringKey: RaidSide) => {
        if (team.activePlayers <= 0) {
          team.activePlayers = 7;
          (next[scoringKey] as TeamState).score += 7;
          setTimeout(() => toast(`💥 ALL OUT!\n+7 to ${next[scoringKey].name}`, "allout"), 30);
        }
      };

      switch (action.type) {

        case "RAID": {
          const pts = action.pts ?? 1;
          rT.score += pts;
          // put `pts` defenders out (never go below 1)
          dT.activePlayers = Math.max(1, dT.activePlayers - Math.min(pts, dT.activePlayers - 1));
          rT.consecutiveEmpty = 0;
          next.doOrDie = false;
          checkAllOut(dT, rs);
          endRaid();
          break;
        }

        case "TACKLE": {
          const pts = action.pts ?? 1;
          const superTackle = dT.activePlayers <= 3;
          dT.score += pts + (superTackle ? 1 : 0);
          rT.activePlayers = Math.max(1, rT.activePlayers - 1);
          rT.consecutiveEmpty = 0;
          next.doOrDie = false;
          if (superTackle) {
            setTimeout(() => toast(`💪 SUPER TACKLE!\n+${pts + 1} to ${dT.name}`, "good"), 30);
          }
          checkAllOut(rT, ds);
          endRaid();
          break;
        }

        case "EMPTY": {
          if (action.forced) {
            // do-or-die fail: raider automatically OUT
            rT.activePlayers = Math.max(1, rT.activePlayers - 1);
            dT.score += 1;
            rT.consecutiveEmpty = 0;
            next.doOrDie = false;
            checkAllOut(rT, ds);
          } else {
            rT.consecutiveEmpty++;
            if (rT.consecutiveEmpty >= 2) {
              next.doOrDie = true;
              setTimeout(() => toast("⚠️ DO-OR-DIE\nNext raid is mandatory!", "dod"), 30);
            }
          }
          endRaid();
          break;
        }

        case "BONUS": {
          // only valid when defending team has ≥ 6 players
          if (dT.activePlayers >= 6) {
            rT.score += 1;
            rT.consecutiveEmpty = 0;
            endRaid();
          }
          break;
        }
      }

      return next;
    });
  }, [toast]);

  useEffect(() => {
    if (!matchId) return;
    kabaddiScoringService
      .updateMatchScore(matchId, S.home.score, S.guest.score)
      .catch(() => {});
  }, [matchId, S.home.score, S.guest.score]);

  // ── undo ───────────────────────────────────────────────────────────────────
  const undo = () => {
    setS((prev) => {
      if (prev.history.length === 0) return prev;
      const snap = prev.history[prev.history.length - 1] as MatchState;
      return { ...snap, history: prev.history.slice(0, -1) };
    });
  };

  // ── misc controls ──────────────────────────────────────────────────────────
  const toggleTimer = () => setS((p) => ({ ...p, running: !p.running }));

  const startPeriod2 = () =>
    setS((p) => ({
      ...p,
      period: 2,
      clock: periodMins * 60,
      running: false,
      phase: "playing",
      raidingSide: (p.raidingSide === "home" ? "guest" : "home") as RaidSide,
    }));

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setS(makeInitial(homeTeam, guestTeam, periodMins));
    setShowReset(false);
  };

  const handleMatchEnd = () => {
    if (matchId) {
      kabaddiScoringService
        .endMatch(matchId, S.home.score, S.guest.score)
        .catch(() => {});
    }
    onMatchEnd?.({
      homeScore:  S.home.score,
      guestScore: S.guest.score,
      winner:
        S.home.score > S.guest.score ? "home"
        : S.home.score < S.guest.score ? "guest"
        : "tie",
      totalRaids: S.raidCount - 1,
    });
  };

  const openVictoryPoster = () => {
    const winnerSide = S.home.score >= S.guest.score ? "home" : "guest" as "home" | "guest";
    setPosterData({
      type: "match_victory",
      homeTeam: S.home,
      guestTeam: S.guest,
      homeScore: S.home.score,
      guestScore: S.guest.score,
      winner: winnerSide,
      tournament: 'KPL 2026',
      stage: 'Final',
      venue: 'Bengaluru',
      date: new Date().toLocaleDateString(),
      totalRaids: S.raidCount,
      allOuts: 0,
      home: S.home,
      guest: S.guest,
    });
  };

  // ── derived ────────────────────────────────────────────────────────────────
  const { period, clock, running, raidCount, raidingSide, doOrDie, phase } = S;
  const rTeam = S[raidingSide] as TeamState;
  const dTeam = S[raidingSide === "home" ? "guest" : "home"] as TeamState;
  const bonusAvailable = dTeam.activePlayers >= 6;
  const canUndo = S.history.length > 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="kls">
      <Toast toast={S.toast} />

      {/* ── OVERLAYS ── */}
      {phase === "halftime" && (
        <HalfTimeOverlay home={S.home} guest={S.guest} onContinue={startPeriod2} />
      )}
      {phase === "fulltime" && (
        <FullTimeOverlay home={S.home} guest={S.guest} onEnd={handleMatchEnd} onPosters={openVictoryPoster} />
      )}

      {/* ── TOP BAR ── */}
      <div className="kls-topbar">
        <div>
          <div className="kls-topbar__period-label">PERIOD</div>
          <div className="kls-topbar__period-num">{period}</div>
        </div>

        <button className="kls-topbar__clock-btn" onClick={toggleTimer}>
          <span className={`kls-topbar__clock ${running ? "kls-topbar__clock--running" : "kls-topbar__clock--paused"}`}>
            {fmtTime(clock)}
          </span>
          <span className="kls-topbar__clock-hint">
            {running ? "⏸ tap to pause" : "▶ tap to start"}
          </span>
        </button>

        <button className="kls-topbar__icon-btn" onClick={() => setShowReset(true)}>↺</button>
      </div>

      {/* ── RAID BAR ── */}
      <div className={`kls-raidbar ${doOrDie ? "kls-raidbar--dod" : "kls-raidbar--normal"}`}>
        <span className="kls-raidbar__word">RAID</span>
        <span className={`kls-raidbar__num ${doOrDie ? "kls-raidbar__num--dod" : "kls-raidbar__num--normal"}`}>
          {raidCount}
        </span>
        <span
          className="kls-raidbar__pill"
          style={{
            background: `${rTeam.color}33`,
            border: `1px solid ${rTeam.color}66`,
            color: rTeam.color,
          }}
        >
          {rTeam.name} RAIDS
        </span>
        {doOrDie && <span className="kls-raidbar__dod-badge">⚠️ DO-OR-DIE</span>}
      </div>

      {/* ── 3-COLUMN LAYOUT ── */}
      <div className="kls-columns">

        {/* HOME */}
        <TeamPanel team={S.home} isRaiding={raidingSide === "home"} />

        {/* CENTER */}
        <div className="kls-center">

          {/* RAID buttons */}
          <div className="kls-center__box">
            <div className="kls-center__box-label">RAID — {rTeam.name}</div>
            <div className="kls-center__raid-grid">
              {[1, 2, 3].map((pts) => (
                <button
                  key={pts}
                  className="kls-center__raid-btn"
                  onClick={() => {
                    apply({ type: "RAID", pts });
                    toast(`⚡ Raid +${pts}  ${rTeam.name}`, "good");
                  }}
                >
                  +{pts}
                </button>
              ))}
            </div>
            <div className="kls-center__box-hint">defenders tagged</div>
          </div>

          {/* TACKLE buttons */}
          <div className="kls-center__box">
            <div className="kls-center__box-label">TACKLE — {dTeam.name}</div>
            <div className="kls-center__tackle-grid">
              {[1, 2].map((pts) => (
                <button
                  key={pts}
                  className="kls-center__tackle-btn"
                  onClick={() => {
                    const isST = dTeam.activePlayers <= 3;
                    apply({ type: "TACKLE", pts });
                    toast(
                      isST
                        ? `💪 SUPER TACKLE!\n+${pts + 1} ${dTeam.name}`
                        : `🛡️ Tackle +${pts}  ${dTeam.name}`,
                      "good"
                    );
                  }}
                >
                  +{pts}
                </button>
              ))}
            </div>
          </div>

          {/* EMPTY / DO-OR-DIE */}
          <button
            className={`kls-center__btn ${doOrDie ? "kls-center__btn--empty-dod" : "kls-center__btn--empty"}`}
            onClick={() => {
              if (doOrDie) {
                apply({ type: "EMPTY", forced: true });
                toast("❌ Do-or-Die fail!\nRaider OUT", "allout");
              } else {
                apply({ type: "EMPTY" });
              }
            }}
          >
            {doOrDie ? "⚠️ FAIL (Auto OUT)" : "EMPTY RAID"}
          </button>

          {/* BONUS */}
          <button
            className={`kls-center__btn ${bonusAvailable ? "kls-center__btn--bonus" : "kls-center__btn--bonus-off"}`}
            disabled={!bonusAvailable}
            onClick={() => {
              apply({ type: "BONUS" });
              toast(`🎯 Bonus +1  ${rTeam.name}`, "bonus");
            }}
          >
            🎯 BONUS {!bonusAvailable && <span style={{ opacity: 0.55 }}>(need 6)</span>}
          </button>

          {/* UNDO */}
          <button
            className={`kls-center__btn ${canUndo ? "kls-center__btn--undo" : "kls-center__btn--undo-off"}`}
            disabled={!canUndo}
            onClick={undo}
          >
            ↩ UNDO
          </button>
        </div>

        {/* GUEST */}
        <TeamPanel team={S.guest} isRaiding={raidingSide === "guest"} />
      </div>

      {/* ── RESET DIALOG ── */}
      {showReset && (
        <ResetDialog onCancel={() => setShowReset(false)} onConfirm={handleReset} />
      )}
      {posterData && <PosterPreview data={posterData} onClose={() => setPosterData(null)} />}
    </div>
  );
}
