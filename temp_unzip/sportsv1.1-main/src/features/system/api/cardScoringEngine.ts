import { BonusRule, MatchState, PenaltyRule, PlayerScore, RoundState, RuleContext, ScoringConfig, ScoreEvent } from '../types/cardScoring';
import { cardMatchPersistence } from './cardMatchPersistence';
import { cardMatchSupabaseService } from './cardMatchSupabaseService';

type UpdateListener = (state: MatchState, event: ScoreEvent) => void;

export class ScoringEngine {
  private config: ScoringConfig;
  private state: MatchState;
  private listeners: UpdateListener[] = [];

  constructor(config: ScoringConfig, matchId: string, players: string[]) {
    const scores: PlayerScore[] = players.map(p => ({
      playerId: p,
      points: config.initialPoints ?? 0,
      bonuses: 0,
      penalties: 0,
      roundsWon: 0,
      metadata: {}
    }));
    const round: RoundState = { roundNumber: 1, scores, events: [], metadata: {} };
    this.config = config;
    this.state = {
      matchId,
      gameId: config.id,
      players,
      rounds: [round],
      currentRound: 1,
      startedAt: new Date().toISOString()
    };
  }

  onUpdate(listener: UpdateListener) {
    this.listeners.push(listener);
  }

  getState(): MatchState {
    return this.state;
  }

  setState(next: MatchState) {
    this.state = next;
    this.emit({
      id: 'hydrate',
      type: 'round_end',
      payload: {},
      timestamp: new Date().toISOString()
    });
  }

  getHistory(): ScoreEvent[] {
    return this.state.rounds.flatMap(r => r.events);
  }

  private currentRound(): RoundState {
    return this.state.rounds[this.state.currentRound - 1];
  }

  private emit(event: ScoreEvent) {
    this.listeners.forEach(l => l(this.state, event));
  }

  private applyPoints(playerId: string, delta: number) {
    const score = this.currentRound().scores.find(s => s.playerId === playerId);
    if (!score) return;
    score.points += delta;
  }

  private applyBonus(playerId: string, delta: number) {
    const score = this.currentRound().scores.find(s => s.playerId === playerId);
    if (!score) return;
    score.bonuses += delta;
    score.points += delta;
  }

  private applyPenalty(playerId: string, delta: number) {
    const score = this.currentRound().scores.find(s => s.playerId === playerId);
    if (!score) return;
    score.penalties += delta;
    score.points -= delta;
  }

  private validateAndCalcRules(event: ScoreEvent, rules: ScoringConfig['scoringRules']) {
    const ctx: RuleContext = { state: this.state, event };
    const matched = rules.filter(r => r.eventType === event.type);
    return matched.map(rule => {
      const valid = rule.validate ? rule.validate(ctx) : true;
      const applies = rule.appliesTo ? this.state.players.filter(pid => rule.appliesTo!(pid, ctx)) : [event.playerId!];
      const value = valid ? rule.calculate(ctx) : 0;
      return { applies, value };
    });
  }

  private evaluateBonus(event: ScoreEvent, bonusRules: BonusRule[] | undefined) {
    if (!bonusRules) return [];
    const ctx: RuleContext = { state: this.state, event };
    return bonusRules
      .filter(br => br.validate(ctx))
      .map(br => br.calculate(ctx));
  }

  private evaluatePenalty(event: ScoreEvent, penaltyRules: PenaltyRule[] | undefined) {
    if (!penaltyRules) return [];
    const ctx: RuleContext = { state: this.state, event };
    return penaltyRules
      .filter(pr => pr.validate(ctx))
      .map(pr => pr.calculate(ctx));
  }

  private basicPreValidate(event: Omit<ScoreEvent, 'timestamp'>): { valid: boolean; reason?: string } {
    if (!event.type) return { valid: false, reason: 'Missing event type' };
    if (event.type !== 'match_end' && event.type !== 'round_end') {
      if (!event.playerId) return { valid: false, reason: 'Missing player' };
    }
    if (event.type === 'card') {
      if (!event.payload || !event.payload.suit) return { valid: false, reason: 'Missing card suit' };
    }
    if (event.type === 'bid') {
      const v = event.payload?.value;
      if (typeof v !== 'number' || v < 0) return { valid: false, reason: 'Invalid bid value' };
    }
    if (event.type === 'meld') {
      const cards = event.payload?.cards;
      if (!Array.isArray(cards) || cards.length === 0) return { valid: false, reason: 'Missing meld cards' };
    }
    return { valid: true };
  }

  submitEvent(event: Omit<ScoreEvent, 'timestamp'>): { accepted: boolean; reason?: string } {
    const fullEvent: ScoreEvent = { ...event, timestamp: new Date().toISOString() };
    const pre = this.basicPreValidate(event);
    if (!pre.valid) {
      return { accepted: false, reason: pre.reason };
    }
    if (this.config.preEventValidate) {
      const ctx: RuleContext = { state: this.state, event: fullEvent };
      const res = this.config.preEventValidate(ctx);
      if (!res.valid) return { accepted: false, reason: res.reason };
    }
    const round = this.currentRound();
    round.events.push(fullEvent);
    cardMatchPersistence.appendEvent(this.state.matchId, fullEvent);
    void cardMatchSupabaseService.appendEvent(this.state.matchId, fullEvent);

    const ruleResults = this.validateAndCalcRules(fullEvent, this.config.scoringRules);
    ruleResults.forEach(res => {
      res.applies.forEach(pid => this.applyPoints(pid, res.value));
    });

    const bonusValues = this.evaluateBonus(fullEvent, this.config.bonusRules);
    const targetBonusPid =
      fullEvent.playerId ??
      (typeof fullEvent.payload?.playerId === 'string' ? fullEvent.payload.playerId : undefined);
    if (bonusValues.length > 0 && targetBonusPid) {
      bonusValues.forEach(v => this.applyBonus(targetBonusPid as string, v));
    }

    const penaltyValues = this.evaluatePenalty(fullEvent, this.config.penaltyRules);
    const targetPenaltyPid =
      fullEvent.playerId ??
      (typeof fullEvent.payload?.playerId === 'string' ? fullEvent.payload.playerId : undefined);
    if (penaltyValues.length > 0 && targetPenaltyPid) {
      penaltyValues.forEach(v => this.applyPenalty(targetPenaltyPid as string, v));
    }

    if (fullEvent.type === 'round_end') {
      if (this.config.roundEndAdjust) this.config.roundEndAdjust(this.state);
      const winner = [...round.scores].sort((a, b) => b.points - a.points)[0];
      const s = round.scores.find(x => x.playerId === winner.playerId);
      if (s) s.roundsWon += 1;
      const nextScores: PlayerScore[] = round.scores.map(s2 => ({
        playerId: s2.playerId,
        points: 0,
        bonuses: 0,
        penalties: 0,
        roundsWon: s2.roundsWon,
        metadata: {}
      }));
      const nextRound: RoundState = { roundNumber: this.state.currentRound + 1, scores: nextScores, events: [], metadata: {} };
      this.state.rounds.push(nextRound);
      this.state.currentRound += 1;
    }

    if (fullEvent.type === 'match_end') {
      const res = this.config.winEvaluator(this.state);
      if (res.done) {
        this.state.endedAt = new Date().toISOString();
        this.state.winnerIds = res.winners || undefined;
      }
    }

    this.emit(fullEvent);
    cardMatchPersistence.saveState(this.state.matchId, this.state);
    void cardMatchSupabaseService.saveState(this.state.matchId, this.config.id, this.state);
    return { accepted: true };
  }
}
