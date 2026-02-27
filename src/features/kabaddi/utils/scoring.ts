import { KabaddiMatch, RaidEvent, MatchDuration, Player, Team } from "../../kabaddi/types/kabaddi.types";

export function initializeMatch(team1: Team, team2: Team, duration: MatchDuration): KabaddiMatch {
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
  };
}

export function applyRaid(match: KabaddiMatch, team: 'team1' | 'team2', event: RaidEvent): KabaddiMatch {
  if (match.status !== 'live') return match;
  const total = Math.max(0, event.touchPoints) + Math.max(0, event.raidPoints);
  const s1 = team === 'team1' && event.success ? match.score1 + total : match.score1;
  const s2 = team === 'team2' && event.success ? match.score2 + total : match.score2;
  return {
    ...match,
    score1: s1,
    score2: s2,
    currentRaidNumber: match.currentRaidNumber + 1,
    currentRaider: { userId: event.raiderName, name: event.raiderName } as Player
  };
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
