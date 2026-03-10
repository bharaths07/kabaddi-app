import React from "react";
import PosterCanvas from "../engine/PosterCanvas";
import type { MatchResult, PosterRatio } from "../engine/posterTypes";

export default function MatchVictoryPoster({
  match,
  ratio = "story",
}: {
  match: MatchResult;
  ratio?: PosterRatio;
}) {
  const data: MatchResult = {
    type: "match_victory" as const,
    homeTeam: match.homeTeam,
    guestTeam: match.guestTeam,
    homeScore: match.homeScore,
    guestScore: match.guestScore,
    winner: match.winner,
    tournament: match.tournament,
    stage: match.stage,
    venue: match.venue,
    date: match.date,
    totalRaids: match.totalRaids,
    allOuts: match.allOuts,
    home: match.homeTeam,
    guest: match.guestTeam,
  };
  return <PosterCanvas data={data} ratio={ratio} />;
}
