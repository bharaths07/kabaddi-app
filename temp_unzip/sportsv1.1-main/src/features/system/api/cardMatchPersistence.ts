import { MatchState, ScoreEvent } from '../types/cardScoring';

const LS_KEY_PREFIX = 'card_match_';
const memoryStore = new Map<string, string>();

function setItem(key: string, value: string) {
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    window.localStorage.setItem(key, value);
  } else {
    memoryStore.set(key, value);
  }
}

function getItem(key: string): string | null {
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    return window.localStorage.getItem(key);
  }
  return memoryStore.get(key) ?? null;
}

function removeItem(key: string) {
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    window.localStorage.removeItem(key);
  } else {
    memoryStore.delete(key);
  }
}

export const cardMatchPersistence = {
  saveState(matchId: string, state: MatchState) {
    const key = `${LS_KEY_PREFIX}${matchId}_state`;
    setItem(key, JSON.stringify(state));
  },
  listLocalMatches(): Array<{ id: string; updatedAt: string }> {
    const results: Array<{ id: string; updatedAt: string }> = [];
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i) || '';
        if (key.startsWith(LS_KEY_PREFIX) && key.endsWith('_state')) {
          const id = key.substring(LS_KEY_PREFIX.length, key.length - '_state'.length);
          const raw = getItem(key);
          if (raw) {
            const state = JSON.parse(raw) as MatchState;
            const updatedAt = state.endedAt || state.startedAt || new Date().toISOString();
            results.push({ id, updatedAt });
          }
        }
      }
    } else {
      for (const key of memoryStore.keys()) {
        if (key.startsWith(LS_KEY_PREFIX) && key.endsWith('_state')) {
          const id = key.substring(LS_KEY_PREFIX.length, key.length - '_state'.length);
          const raw = getItem(key);
          if (raw) {
            const state = JSON.parse(raw) as MatchState;
            const updatedAt = state.endedAt || state.startedAt || new Date().toISOString();
            results.push({ id, updatedAt });
          }
        }
      }
    }
    results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return results;
  },
  loadState(matchId: string): MatchState | null {
    const key = `${LS_KEY_PREFIX}${matchId}_state`;
    const raw = getItem(key);
    return raw ? (JSON.parse(raw) as MatchState) : null;
  },
  appendEvent(matchId: string, event: ScoreEvent) {
    const key = `${LS_KEY_PREFIX}${matchId}_events`;
    const raw = getItem(key);
    const events: ScoreEvent[] = raw ? JSON.parse(raw) : [];
    events.push(event);
    setItem(key, JSON.stringify(events));
  },
  loadEvents(matchId: string): ScoreEvent[] {
    const key = `${LS_KEY_PREFIX}${matchId}_events`;
    const raw = getItem(key);
    return raw ? (JSON.parse(raw) as ScoreEvent[]) : [];
  },
  clear(matchId: string) {
    removeItem(`${LS_KEY_PREFIX}${matchId}_state`);
    removeItem(`${LS_KEY_PREFIX}${matchId}_events`);
  }
};
