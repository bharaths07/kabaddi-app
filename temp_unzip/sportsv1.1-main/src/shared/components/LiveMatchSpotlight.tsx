import React from 'react';
import { Link } from 'react-router-dom';
import { Match } from '@/features/matches/types/match';
import './LiveMatchSpotlight.css';

interface LiveMatchSpotlightProps {
  match: Match;
}

export const LiveMatchSpotlight: React.FC<LiveMatchSpotlightProps> = ({ match }) => {
  // Helper to get sport name (simple mapping for now)
  const getSportName = (id: string) => {
    switch (id) {
      case 's1': return 'Cricket';
      case 's2': return 'Kabaddi';
      case 's3': return 'Football';
      default: return 'Sport';
    }
  };

  // Helper to format score based on sport
  const formatScore = (participant: any) => {
    const score = participant.score || 0;
    // Check if cricket-like (has wickets)
    if (participant.wickets !== undefined) {
      const overs = participant.balls ?
        `(${Math.floor(participant.balls / 6)}.${participant.balls % 6})` : '';
      return (
        <div className="score-container">
          <span className="score-main">{score}/{participant.wickets}</span>
          {overs && <span className="score-sub">{overs}</span>}
        </div>
      );
    }
    return <span className="score-main">{score}</span>;
  };

  const isLive = match.status === 'live';

  return (
    <div className="live-match-spotlight">
      {/* ZONE 1 — Match Status */}
      <div className="spotlight-zone-status">
        <span className={`status-badge ${isLive ? 'status-live' : 'status-draft'}`}>
          {isLive && <span className="pulse-dot"></span>}
          {match.status.toUpperCase()}
        </span>
        <span className="sport-type">{getSportName(match.sportId)}</span>
        <span className="match-format">T20</span>
      </div>

      {/* ZONE 2 — Teams & Score */}
      <div className="spotlight-zone-score">
        {/* Team A */}
        <div className="team-block team-left">
          <div className="team-logo-placeholder">{match.homeParticipant.name.charAt(0)}</div>
          <h3 className="team-name">{match.homeParticipant.name}</h3>
        </div>

        {/* Score Center */}
        <div className="score-center">
          <div className="team-score">
            {formatScore(match.homeParticipant)}
          </div>
          <div className="vs-divider">VS</div>
          <div className="team-score">
            {formatScore(match.awayParticipant)}
          </div>
        </div>

        {/* Team B */}
        <div className="team-block team-right">
          <div className="team-logo-placeholder">{match.awayParticipant.name.charAt(0)}</div>
          <h3 className="team-name">{match.awayParticipant.name}</h3>
        </div>
      </div>

      {/* ZONE 3 — Match Context */}
      <div className="spotlight-zone-context">
        <span className="context-item icon-venue">📍 {match.location}</span>
        <span className="context-separator">•</span>
        <span className="context-item">1st Innings</span>
      </div>

      {/* ZONE 4 — Primary Action */}
      <div className="spotlight-zone-action">
        <Link to={`/match/${match.id}/live`} className="cta-button">
          View Live Match
        </Link>
      </div>
    </div>
  );
};
