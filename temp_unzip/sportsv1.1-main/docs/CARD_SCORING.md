# Card Scoring System

## Overview
- Modular scoring framework for multiple card games
- Real-time score updates with history tracking
- Rule validation per game, bonuses, penalties, and win evaluation
- Clear API for registering games and starting matches

## Concepts
- ScoringConfig: defines rules, bonuses, penalties, winEvaluator
- ScoreEvent: typed event with payload and timestamp
- MatchState: players, rounds, scores, events, winners

## Built-in Games
- Hearts: heart penalties, queen of spades, shoot-the-moon bonus, race to 100 lowest score wins
- Spades: bids, trick points, bid completion bonus, sandbag penalty, highest total after rounds wins
- Rummy: meld scoring, gin bonus, deadwood penalty, highest total wins

## API
- registerGame(config): add a new game
- createMatch(gameId, matchId, players): create engine instance
- getEngine(matchId): retrieve engine
- listGames(): view available games

## Scoring Flow
1. Submit events to engine
2. Engine validates and calculates rule values
3. Applies points, bonuses, penalties
4. Round end optionally adjusts and starts next round
5. Match end runs winEvaluator and sets winners

## Integrating New Games
- Provide ScoringConfig with event types, calculate/validate, bonuses, penalties, winEvaluator
- Use function-based rules to express complex mechanics

## Testing
- Hearts: penalties and queen of spades
- Spades: bids and trick bonus
- Rummy: melds and gin bonus

## File References
- Domain: src/domain/cardScoring.ts
- Engine: src/services/cardScoringEngine.ts
- Games: src/services/cardGames/index.ts
- API: src/api/cardScoring.ts
- Tests: src/test/CardScoringEngine.test.ts
