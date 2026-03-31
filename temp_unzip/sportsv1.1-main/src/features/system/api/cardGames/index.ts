import { ScoringConfig } from '../../types/cardScoring';

const hearts: ScoringConfig = {
  id: 'hearts',
  name: 'Hearts',
  minPlayers: 4,
  maxPlayers: 4,
  preEventValidate: () => ({ valid: true }),
  scoringRules: [
    {
      eventType: 'card',
      calculate: ({ event }) => {
        const payload = event.payload as any;
        if (payload.rank === 'Q' && payload.suit === 'spades') return -13;
        if (payload.suit === 'hearts') return -1;
        return 0;
      },
      appliesTo: (playerId, { event }) => playerId === event.playerId
    }
  ],
  bonusRules: [
    {
      name: 'Shoot The Moon',
      validate: ({ state, event }) => {
        if (event.type !== 'round_end') return false;
        const round = state.rounds[state.currentRound - 1];
        const playerId = event.payload.playerId;
        const taken = round.events.filter(e => e.type === 'card' && e.playerId === playerId && (e.payload.suit === 'hearts' || (e.payload.rank === 'Q' && e.payload.suit === 'spades'))).length;
        return taken >= 14;
      },
      calculate: () => 26
    }
  ],
  penaltyRules: [],
  winEvaluator: (state) => {
    const totals = new Map<string, number>();
    state.players.forEach(p => totals.set(p, 0));
    state.rounds.forEach(r => r.scores.forEach(s => totals.set(s.playerId, (totals.get(s.playerId) || 0) + s.points)));
    let done = false;
    state.rounds.forEach(r => {
      r.scores.forEach(s => { if ((totals.get(s.playerId) || 0) >= 100) done = true; });
    });
    if (!done) return { winners: null, done: false };
    const min = Math.min(...Array.from(totals.values()));
    const winners = Array.from(totals.entries()).filter((entry) => entry[1] === min).map((entry) => entry[0]);
    return { winners, done: true };
  }
};

const spades: ScoringConfig = {
  id: 'spades',
  name: 'Spades',
  minPlayers: 4,
  maxPlayers: 4,
  preEventValidate: ({ state, event }) => {
    const round = state.rounds[state.currentRound - 1];
    const payload = event.payload as any;
    if (event.type === 'bid') {
      const v = payload?.value ?? 0;
      if (v < 0 || v > 13) return { valid: false, reason: 'Bid must be between 0 and 13' };
      const already = round.events.some(e => e.type === 'bid' && e.playerId === event.playerId);
      if (already) return { valid: false, reason: 'Player already bid this round' };
    }
    if (event.type === 'trick') {
      const hasBid = round.events.some(e => e.type === 'bid' && e.playerId === event.playerId);
      if (!hasBid) return { valid: false, reason: 'Player must bid before taking tricks' };
    }
    return { valid: true };
  },
  scoringRules: [
    {
      eventType: 'bid',
      calculate: () => 0,
      appliesTo: () => false
    },
    {
      eventType: 'trick',
      calculate: () => 10,
      appliesTo: (playerId, { event }) => playerId === event.playerId
    },
    {
      eventType: 'penalty',
      calculate: ({ event }) => (event.payload as any).value || 0,
      appliesTo: (playerId, { event }) => playerId === event.playerId
    }
  ],
  bonusRules: [
    {
      name: 'Made Bid',
      validate: ({ state, event }) => {
        if (event.type !== 'round_end') return false;
        const round = state.rounds[state.currentRound - 1];
        const bids = new Map<string, number>();
        round.events.filter(e => e.type === 'bid').forEach(e => bids.set(e.playerId!, (e.payload as any).value));
        const tricks = new Map<string, number>();
        state.players.forEach(p => tricks.set(p, 0));
        round.events.filter(e => e.type === 'trick').forEach(e => tricks.set(e.playerId!, (tricks.get(e.playerId!) || 0) + 1));
        const made = Array.from(tricks.entries()).filter(([pid, t]) => t >= (bids.get(pid) || 0));
        return made.some(([pid]) => pid === event.payload.playerId);
      },
      calculate: ({ state, event }) => {
        const round = state.rounds[state.currentRound - 1];
        const bid = (round.events.filter(e => e.type === 'bid' && e.playerId === (event.payload as any).playerId)[0]?.payload.value as number) || 0;
        return bid * 10;
      }
    }
  ],
  penaltyRules: [
    {
      name: 'Sandbag',
      validate: ({ state, event }) => {
        if (event.type !== 'round_end') return false;
        const round = state.rounds[state.currentRound - 1];
        const bid = (round.events.filter(e => e.type === 'bid' && e.playerId === (event.payload as any).playerId)[0]?.payload.value as number) || 0;
        const tricks = round.events.filter(e => e.type === 'trick' && e.playerId === (event.payload as any).playerId).length;
        return tricks > bid + 10;
      },
      calculate: () => -100
    }
  ],
  winEvaluator: (state) => {
    const totals = new Map<string, number>();
    state.players.forEach(p => totals.set(p, 0));
    state.rounds.forEach(r => r.scores.forEach(s => totals.set(s.playerId, (totals.get(s.playerId) || 0) + s.points)));
    if (state.rounds.length < 10) return { winners: null, done: false };
    const max = Math.max(...Array.from(totals.values()));
    const winners = Array.from(totals.entries()).filter((entry) => entry[1] === max).map((entry) => entry[0]);
    return { winners, done: true };
  }
};

const rummy: ScoringConfig = {
  id: 'rummy',
  name: 'Rummy',
  minPlayers: 2,
  maxPlayers: 6,
  preEventValidate: ({ event }) => {
    if (event.type === 'meld') {
      const cards = (event.payload as any)?.cards || [];
      if (cards.length < 3) return { valid: false, reason: 'Meld must contain 3 or more cards' };
    }
    if (event.type === 'round_end' && event.payload?.gin === true) {
      const dw = event.payload?.deadwoodPoints ?? 0;
      if (dw !== 0) return { valid: false, reason: 'Gin requires 0 deadwood' };
    }
    return { valid: true };
  },
  scoringRules: [
    {
      eventType: 'meld',
      calculate: ({ event }) => {
        const values: Record<string, number> = { A: 10, K: 10, Q: 10, J: 10 };
        const cards: Array<{ rank: string }> = (event.payload as any).cards || [];
        return cards.reduce((sum, c) => sum + (values[c.rank] || Number(c.rank) || 0), 0);
      },
      appliesTo: (playerId, { event }) => playerId === event.playerId
    }
  ],
  penaltyRules: [
    {
      name: 'Deadwood',
      validate: ({ event }) => event.type === 'round_end',
      calculate: ({ event }) => {
        const deadwood = (event.payload as any).deadwoodPoints || 0;
        return deadwood;
      }
    }
  ],
  bonusRules: [
    {
      name: 'Gin',
      validate: ({ event }) => event.type === 'round_end' && event.payload.gin === true,
      calculate: () => 25
    }
  ],
  winEvaluator: (state) => {
    const totals = new Map<string, number>();
    state.players.forEach(p => totals.set(p, 0));
    state.rounds.forEach(r => r.scores.forEach(s => totals.set(s.playerId, (totals.get(s.playerId) || 0) + s.points)));
    const max = Math.max(...Array.from(totals.values()));
    const winners = Array.from(totals.entries()).filter((entry) => entry[1] === max).map((entry) => entry[0]);
    return { winners, done: state.rounds.length >= 10 };
  }
};

export const CARD_GAMES: Record<string, ScoringConfig> = {
  hearts,
  spades,
  rummy
};
