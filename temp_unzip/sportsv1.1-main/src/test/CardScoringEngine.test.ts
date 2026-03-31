import { describe, it, expect } from 'vitest';
import { createMatch } from '@/api/cardScoring';

describe('Card Scoring Engine - Hearts', () => {
  it('applies heart penalties and queen of spades', () => {
    const eng = createMatch('hearts', 'm1', ['p1', 'p2', 'p3', 'p4']);
    eng.submitEvent({ id: 'e1', type: 'card', playerId: 'p1', payload: { rank: '5', suit: 'hearts' } });
    eng.submitEvent({ id: 'e2', type: 'card', playerId: 'p1', payload: { rank: 'Q', suit: 'spades' } });
    const state = eng.getState();
    const round = state.rounds[state.currentRound - 1];
    const p1 = round.scores.find(s => s.playerId === 'p1')!;
    expect(p1.points).toBe(-14);
  });
});

describe('Card Scoring Engine - Spades', () => {
  it('scores tricks and bid bonus', () => {
    const eng = createMatch('spades', 'm2', ['p1', 'p2', 'p3', 'p4']);
    eng.submitEvent({ id: 'b1', type: 'bid', playerId: 'p1', payload: { value: 3 } });
    eng.submitEvent({ id: 't1', type: 'trick', playerId: 'p1', payload: {} });
    eng.submitEvent({ id: 't2', type: 'trick', playerId: 'p1', payload: {} });
    eng.submitEvent({ id: 't3', type: 'trick', playerId: 'p1', payload: {} });
    eng.submitEvent({ id: 're', type: 'round_end', payload: { playerId: 'p1' } });
    const state = eng.getState();
    const round = state.rounds[0];
    const p1 = round.scores.find(s => s.playerId === 'p1')!;
    expect(p1.points).toBe(30 + 30);
  });
});

describe('Card Scoring Engine - Rummy', () => {
  it('scores melds and gin bonus', () => {
    const eng = createMatch('rummy', 'm3', ['p1', 'p2']);
    eng.submitEvent({ id: 'm1', type: 'meld', playerId: 'p1', payload: { cards: [{ rank: 'A' }, { rank: 'K' }, { rank: 'Q' }] } });
    eng.submitEvent({ id: 're', type: 'round_end', payload: { playerId: 'p1', gin: true, deadwoodPoints: 0 } });
    const state = eng.getState();
    const round = state.rounds[0];
    const p1 = round.scores.find(s => s.playerId === 'p1')!;
    expect(p1.points).toBe(30 + 25);
  });
});
