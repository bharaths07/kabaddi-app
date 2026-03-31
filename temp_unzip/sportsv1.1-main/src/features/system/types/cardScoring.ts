export type CardGameId = 'hearts' | 'spades' | 'rummy' | (string & {});

export type ScoreEventType = 'trick' | 'card' | 'bid' | 'meld' | 'penalty' | 'bonus' | 'round_end' | 'match_end';

export interface ScoreEvent {
  id: string;
  type: ScoreEventType;
  playerId?: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface PlayerScore {
  playerId: string;
  points: number;
  bonuses: number;
  penalties: number;
  roundsWon: number;
  metadata?: Record<string, unknown>;
}

export interface RoundState {
  roundNumber: number;
  scores: PlayerScore[];
  events: ScoreEvent[];
  metadata?: Record<string, unknown>;
}

export interface MatchState {
  matchId: string;
  gameId: CardGameId;
  players: string[];
  rounds: RoundState[];
  currentRound: number;
  startedAt: string;
  endedAt?: string;
  winnerIds?: string[];
}

export interface RuleContext {
  state: MatchState;
  event: ScoreEvent;
}

export type RuleValidator = (ctx: RuleContext) => boolean;
export type RuleCalculator = (ctx: RuleContext) => number;
export type WinEvaluator = (state: MatchState) => { winners: string[] | null; done: boolean };

export interface ScoringRule {
  eventType: ScoreEventType;
  validate?: RuleValidator;
  calculate: RuleCalculator;
  appliesTo?: (playerId: string, ctx: RuleContext) => boolean;
}

export interface BonusRule {
  name: string;
  validate: RuleValidator;
  calculate: RuleCalculator;
}

export interface PenaltyRule {
  name: string;
  validate: RuleValidator;
  calculate: RuleCalculator;
}

export interface ScoringConfig {
  id: CardGameId;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  scoringRules: ScoringRule[];
  bonusRules?: BonusRule[];
  penaltyRules?: PenaltyRule[];
  winEvaluator: WinEvaluator;
  initialPoints?: number;
  roundEndAdjust?: (state: MatchState) => void;
  preEventValidate?: (ctx: RuleContext) => { valid: boolean; reason?: string };
}
