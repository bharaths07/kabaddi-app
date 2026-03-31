import { Match, ScoreEvent, MatchParticipant, PlayerStats } from '../types/match';

export const scoreEngine = {
  /**
   * Applies a score event to the match state, updating team scores and player stats.
   * Returns a new Match object (immutable update).
   */
  applyEvent(match: Match, event: ScoreEvent): Match {
    const updatedMatch = { ...match }; // Shallow copy

    // Ensure liveState exists
    if (!updatedMatch.liveState) {
      updatedMatch.liveState = {
        currentOver: 0,
        ballsInCurrentOver: 0,
        currentPeriod: 1,
        clockTime: '00:00',
        isPaused: false
      };
    }

    if (match.sportId === 's3') {
      return this.applyFootballEvent(updatedMatch, event);
    }

    if (match.sportId === 's5') {
      return this.applyBasketballEvent(updatedMatch, event);
    }

    // Default to Cricket (s1)
    return this.applyCricketEvent(updatedMatch, event);
  },

  applyFootballEvent(match: Match, event: ScoreEvent): Match {
    const teamId = event.teamId || match.homeParticipant.id;
    const isHome = teamId === match.homeParticipant.id;
    const team = isHome ? { ...match.homeParticipant } : { ...match.awayParticipant };

    if (!team.players) team.players = [];

    // 1. Core Score
    if (event.type === 'goal') {
      team.score = (team.score || 0) + 1;
    }

    // 2. Player Stats (Scorer)
    if (event.scorerId) {
      updatePlayerStat(team, event.scorerId, (p) => {
        if (event.type === 'goal') p.goals = (p.goals || 0) + 1;
        if (event.type === 'card') {
          if (event.cardType === 'yellow') p.yellowCards = (p.yellowCards || 0) + 1;
          if (event.cardType === 'red') p.redCards = (p.redCards || 0) + 1;
        }
      });
    }

    // 3. Assists
    if (event.assistId) {
      updatePlayerStat(team, event.assistId, (p) => {
        p.assists = (p.assists || 0) + 1;
      });
    }

    // 4. Substitutions
    if (event.type === 'substitution' && event.playerInId && event.playerOutId) {
      // Logic for active squad management can go here
      // For now, we just log it in events
    }

    // 5. Period Management
    if (event.type === 'period_start' && event.period) {
      match.liveState!.currentPeriod = event.period;
    }

    if (isHome) match.homeParticipant = team;
    else match.awayParticipant = team;

    match.events = [event, ...(match.events || [])];
    return match;
  },

  applyBasketballEvent(match: Match, event: ScoreEvent): Match {
    const teamId = event.teamId || match.homeParticipant.id;
    const isHome = teamId === match.homeParticipant.id;
    const team = isHome ? { ...match.homeParticipant } : { ...match.awayParticipant };
    if (!team.players) team.players = [];

    // 1. Score update (1, 2, or 3 points)
    if (event.type === 'basket') {
      const pts = event.points || 0;
      team.score = (team.score || 0) + pts;
    }

    // 2. Player Stats
    if (event.scorerId) {
      updatePlayerStat(team, event.scorerId, (p) => {
        if (event.type === 'basket') p.points = (p.points || 0) + (event.points || 0);
        if (event.type === 'foul') p.fouls = (p.fouls || 0) + 1;
      });
    }

    // 3. Assists
    if (event.assistId) {
      updatePlayerStat(team, event.assistId, (p) => {
        p.assists = (p.assists || 0) + 1;
      });
    }

    // 4. Period (Quarter)
    if (event.type === 'period_start' && event.period) {
      match.liveState!.currentPeriod = event.period;
    }

    if (isHome) match.homeParticipant = team;
    else match.awayParticipant = team;

    match.events = [event, ...(match.events || [])];
    return match;
  },

  applyCricketEvent(match: Match, event: ScoreEvent): Match {
    // Determine Batting Team
    const battingTeamId = event.teamId || match.currentBattingTeamId || match.homeParticipant.id;
    const isHomeBatting = battingTeamId === match.homeParticipant.id;

    const battingSide = isHomeBatting ? { ...match.homeParticipant } : { ...match.awayParticipant };
    const bowlingSide = isHomeBatting ? { ...match.awayParticipant } : { ...match.homeParticipant };

    if (!battingSide.players) battingSide.players = [];
    if (!bowlingSide.players) bowlingSide.players = [];

    // Update Team Score
    battingSide.score = (battingSide.score || 0) + (event.points || 0);
    if (event.isWicket) battingSide.wickets = (battingSide.wickets || 0) + 1;

    // Overs/Balls
    const isLegalDelivery = event.type === 'delivery' || (event.type === 'wicket' && !event.extras?.type);
    const isWideOrNoBall = event.extras?.type === 'wide' || event.extras?.type === 'no_ball';

    if (isLegalDelivery || (event.extras && !isWideOrNoBall)) {
      battingSide.balls = (battingSide.balls || 0) + 1;
      battingSide.overs = Math.floor(battingSide.balls / 6);
    }

    // Batter Stats
    if (event.batterId) {
      updatePlayerStat(battingSide, event.batterId, (p) => {
        if (event.runsScored !== undefined) p.runs = (p.runs || 0) + event.runsScored;
        if (!isWideOrNoBall) p.balls = (p.balls || 0) + 1;
      });
    }

    // Bowler Stats
    if (event.bowlerId) {
      updatePlayerStat(bowlingSide, event.bowlerId, (p) => {
        const runsToCharge = (event.runsScored || 0) + (isWideOrNoBall ? (event.extras?.runs || 0) : 0);
        p.runsConceded = (p.runsConceded || 0) + runsToCharge;
        if (!isWideOrNoBall) p.ballsBowled = (p.ballsBowled || 0) + 1;
        if (event.isWicket && event.dismissal?.type !== 'run_out') p.wickets = (p.wickets || 0) + 1;
      });
    }

    // Fielder Stats
    if (event.dismissal?.fielderId) {
      updatePlayerStat(bowlingSide, event.dismissal.fielderId, (p) => {
        if (event.dismissal?.type === 'caught') p.catches = (p.catches || 0) + 1;
        if (event.dismissal?.type === 'run_out') p.runouts = (p.runouts || 0) + 1;
      });
    }

    // Live State
    const liveState = { ...match.liveState! };
    if (event.batterId) liveState.strikerId = event.batterId;
    if (event.nonStrikerId) liveState.nonStrikerId = event.nonStrikerId;
    if (event.bowlerId) liveState.bowlerId = event.bowlerId;

    if ((event.runsScored || 0) % 2 !== 0) {
      const temp = liveState.strikerId;
      liveState.strikerId = liveState.nonStrikerId;
      liveState.nonStrikerId = temp;
    }

    if (!isWideOrNoBall) {
      liveState.ballsInCurrentOver += 1;
      if (liveState.ballsInCurrentOver >= 6) {
        liveState.currentOver += 1;
        liveState.ballsInCurrentOver = 0;
        const temp = liveState.strikerId;
        liveState.strikerId = liveState.nonStrikerId;
        liveState.nonStrikerId = temp;
        liveState.bowlerId = undefined;
      }
    }

    match.liveState = liveState;

    if (isHomeBatting) {
      match.homeParticipant = battingSide;
      match.awayParticipant = bowlingSide;
    } else {
      match.awayParticipant = battingSide;
      match.homeParticipant = bowlingSide;
    }

    match.events = [event, ...(match.events || [])];
    return match;
  },

  /**
   * Rebuilds a match state from scratch using its event log.
   * Useful for Undo operations or correcting state desync.
   */
  recalculateMatch(match: Match): Match {
    // 1. Prepare a fresh "reset" match
    const resetMatch: Match = {
      ...match,
      events: [], // Start with empty events, let applyEvent re-populate
      homeParticipant: {
        ...match.homeParticipant,
        score: 0, wickets: 0, balls: 0, overs: 0,
        players: [], result: undefined
      },
      awayParticipant: {
        ...match.awayParticipant,
        score: 0, wickets: 0, balls: 0, overs: 0,
        players: [], result: undefined
      },
      liveState: {
        currentOver: 0,
        ballsInCurrentOver: 0,
        currentPeriod: 1,
        clockTime: '00:00',
        isPaused: false
      },
      status: match.status === 'completed' ? 'live' : match.status // Revert to live for processing if it was completed
    };

    // 2. Collect all events and sort by timestamp (oldest first)
    const sortedEvents = [...(match.events || [])].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // 3. Sequentially apply all events
    const recalculated = sortedEvents.reduce((acc, event) => {
      // We use applyEvent to process each event. 
      // Note: applyEvent adds the event to acc.events (prepends it).
      return this.applyEvent(acc, event);
    }, resetMatch);

    // 4. Restore original completion status if necessary
    recalculated.status = match.status;

    return recalculated;
  }
};

/**
 * Helper to update or create a player stat in a participant's squad.
 */
function updatePlayerStat(participant: MatchParticipant, playerId: string, updater: (stat: PlayerStats) => void) {
  if (!participant.players) participant.players = [];
  let player = participant.players.find(p => p.playerId === playerId);

  if (!player) {
    player = {
      playerId,
      runs: 0, balls: 0, wickets: 0, catches: 0,
      goals: 0, assists: 0, yellowCards: 0, redCards: 0,
      points: 0, fouls: 0
    };
    participant.players.push(player);
  }

  updater(player);
  participant.players = participant.players.map(p => p.playerId === playerId ? player! : p);
}
