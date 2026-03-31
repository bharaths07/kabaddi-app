import { CARD_GAMES } from '@/features/system/api/cardGames';
import { ScoringEngine } from '@/features/system/api/cardScoringEngine';
import { ScoringConfig } from '@/features/system/types/cardScoring';
import { cardMatchPersistence } from '@/features/system/api/cardMatchPersistence';
import { cardMatchSupabaseService } from '@/features/system/api/cardMatchSupabaseService';

const registry = new Map<string, ScoringConfig>();
const engines = new Map<string, ScoringEngine>();

Object.values(CARD_GAMES).forEach(cfg => registry.set(cfg.id, cfg));

export function registerGame(config: ScoringConfig) {
  registry.set(config.id, config);
}

export function createMatch(gameId: string, matchId: string, players: string[]) {
  const cfg = registry.get(gameId);
  if (!cfg) throw new Error('Game not registered');
  const engine = new ScoringEngine(cfg, matchId, players);
  const savedLocal = cardMatchPersistence.loadState(matchId);
  if (savedLocal && savedLocal.gameId === gameId) {
    engine.setState(savedLocal);
  }
  void (async () => {
    const savedCloud = await cardMatchSupabaseService.loadState(matchId);
    if (savedCloud && savedCloud.gameId === gameId) {
      engine.setState(savedCloud);
    }
  })();
  engines.set(matchId, engine);
  return engine;
}

export function getEngine(matchId: string) {
  const eng = engines.get(matchId);
  if (!eng) throw new Error('Engine not found');
  return eng;
}

export function listGames() {
  return Array.from(registry.values());
}
