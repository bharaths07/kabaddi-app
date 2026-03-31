import React from 'react';
import { Match } from '@/features/matches/types/match';
import { CricketScorecard } from '@/features/matches/components/CricketScorecard';
import { FootballScorecard } from '@/features/matches/components/FootballScorecard';
import { BasketballScorecard } from '@/features/matches/components/BasketballScorecard';

interface Props {
  match: Match;
}

export const MatchScorecardTab: React.FC<Props> = ({ match }) => {
  if (match.sportId === 's3') {
    return <FootballScorecard match={match} />;
  }
  if (match.sportId === 's5') {
    return <BasketballScorecard match={match} />;
  }
  return <CricketScorecard match={match} />;
};
