import { KabaddiMatch, RaidEvent, KabaddiFormat, KabaddiPlayer, KabaddiTeam } from "../types/kabaddi.types";

export function initializeMatch(team1: KabaddiTeam, team2: KabaddiTeam, duration: KabaddiFormat): KabaddiMatch {
  const minutes = duration === 'thirty' ? 30 : duration === 'forty' ? 40 : 50;
  return {
    id: `${Date.now()}`,
    team1,
    team2,
    score1: 0,
    score2: 0,
    currentRaidNumber: 1,
    currentRaider: null,
    matchDuration: duration,
    timeRemaining: minutes * 60,
    status: 'live'
  } as any;
}

export function applyRaid(match: KabaddiMatch, team: 'team1' | 'team2', event: RaidEvent): KabaddiMatch {
  if (match.status !== 'live') return match;
  const total = Math.max(0, (event as any).touchPoints) + Math.max(0, (event as any).raidPoints);
  const s1 = team === 'team1' && event.success ? (match as any).score1 + total : (match as any).score1;
  const s2 = team === 'team2' && event.success ? (match as any).score2 + total : (match as any).score2;
  return {
    ...match,
    score1: s1,
    score2: s2,
    currentRaidNumber: (match as any).currentRaidNumber + 1,
    currentRaider: { userId: (event as any).raiderName, name: (event as any).raiderName } as KabaddiPlayer
  } as any;
}

export function tick(match: KabaddiMatch, seconds: number): KabaddiMatch {
  if (match.status !== 'live') return match;
  const next = Math.max(0, match.timeRemaining - seconds);
  return {
    ...match,
    timeRemaining: next,
    status: next === 0 ? 'completed' : 'live'
  };
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
