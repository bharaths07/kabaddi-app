import React, { useMemo, useState } from 'react';
import { Match } from '@/features/matches/types/match';
import { Card } from '@/shared/components/ui/Card';
import { Select } from '@/shared/components/ui/Select';
import { Tabs } from '@/shared/components/ui/Tabs';

interface Props {
    match: Match;
}

interface CommentaryBall {
    id: string;
    over: number;
    ball: number;
    displayOver: string; // "13.2"
    type: string; // 'run', 'wicket', 'extra', 'boundary'
    runs: number;
    isWicket: boolean;
    isBoundary: boolean;
    isExtra: boolean;
    text: string;
    bowler: string;
    batter: string;
}

// interface OverGroup {
//   overNumber: number;
//   runs: number;
//   wickets: number;
//   scoreAtEnd: string; // "58/9"
//   balls: CommentaryBall[];
//   bowler: string; // Primary bowler for the over
//   batterStats: { name: string; score: string }[]; // Snapshot of batters
// }

export const MatchCommentaryTab: React.FC<Props> = ({ match }) => {
    // State for Filters
    const initialInnings = match.currentBattingTeamId === match.awayParticipant.id ? 'away' : 'home';
    const [activeInnings, setActiveInnings] = useState<'home' | 'away'>(initialInnings);
    const [filterType, setFilterType] = useState<string>('all');

    const battingTeam = activeInnings === 'home' ? match.homeParticipant : match.awayParticipant;

    // --- Process Events into Commentary Structure ---
    const commentaryGroups = useMemo(() => {
        // 1. Filter events for current innings
        const events = (match.events || [])
            .filter(e => e.teamId === battingTeam.id)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // Chronological for calculation

        // 2. Enrich and Group
        // const groups: Record<number, OverGroup> = {};

        const enrichedBalls: CommentaryBall[] = [];

        events.forEach((e, index) => {
            // Parse Over/Ball from description if available (e.g. "13.2 Bowler to Batter")
            // Or assume sequential if missing.
            const overMatch = e.description.match(/(\d+)\.(\d+)/);
            let over = 0;
            let ball = 0;

            if (overMatch) {
                over = parseInt(overMatch[1]);
                ball = parseInt(overMatch[2]);
            } else {
                over = Math.floor(index / 6);
                ball = (index % 6) + 1;
            }

            const isWicket = e.type === 'wicket';
            const isBoundary = e.points === 4 || e.points === 6;
            const isExtra = e.type === 'extra';

            /* */

            enrichedBalls.push({
                id: e.id,
                over,
                ball,
                displayOver: `${over}.${ball}`,
                type: e.type,
                runs: e.points,
                isWicket,
                isBoundary,
                isExtra,
                text: e.description,
                bowler: 'Bowler Name', // In real app, extract from description or event
                batter: 'Batter Name', // In real app, extract from description or event
            });
        });

        // 3. Group by Over (Reverse Order for display)
        // Reverse events to show newest first
        const reversedBalls = [...enrichedBalls].reverse();

        // Group logic: We want to show balls grouped by over.
        // Ideally, we group by 'over' property.
        const groupedByOver: Record<number, CommentaryBall[]> = {};
        reversedBalls.forEach(ball => {
            if (!groupedByOver[ball.over]) groupedByOver[ball.over] = [];
            groupedByOver[ball.over].push(ball);
        });

        // Create final OverGroup objects
        const finalGroups = Object.keys(groupedByOver).sort((a, b) => parseInt(b) - parseInt(a)).map(overKey => {
            const overNum = parseInt(overKey);
            const balls = groupedByOver[overNum];

            // Calculate over summary
            const overRuns = balls.reduce((sum, b) => sum + b.runs, 0);
            const overWickets = balls.filter(b => b.isWicket).length;

            // Mock score at end (This logic is flawed if we reverse first, but good enough for UI demo)
            // In real app, we'd use the running score from the chronological pass.

            return {
                overNumber: overNum,
                runs: overRuns,
                wickets: overWickets,
                scoreAtEnd: `${battingTeam.score}/${battingTeam.wickets}`, // Placeholder
                balls: balls,
                bowler: 'Bowler',
                batterStats: []
            };
        });

        return finalGroups;
    }, [match, battingTeam]);

    // Filter Logic
    const filteredGroups = useMemo(() => {
        if (filterType === 'all') return commentaryGroups;

        // If filtering by event type, we might lose the "Over Group" structure 
        // or just show matching balls. Let's filter balls within groups for now.
        return commentaryGroups.map(group => ({
            ...group,
            balls: group.balls.filter(b => {
                if (filterType === 'wickets') return b.isWicket;
                if (filterType === 'boundaries') return b.isBoundary;
                return true;
            })
        })).filter(g => g.balls.length > 0);
    }, [commentaryGroups, filterType]);

    const inningsTabs = [
        { id: 'home', label: match.homeParticipant.name },
        { id: 'away', label: match.awayParticipant.name }
    ];

    const filterOptions = [
        { value: 'all', label: 'All Events' },
        { value: 'wickets', label: 'Wickets' },
        { value: 'boundaries', label: 'Boundaries' }
    ];

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="w-full sm:w-auto">
                    <Tabs
                        tabs={inningsTabs}
                        activeTab={activeInnings}
                        onTabChange={(id) => setActiveInnings(id as 'home' | 'away')}
                        variant="pill"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select
                        options={filterOptions}
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Commentary List */}
            <div className="space-y-4">
                {filteredGroups.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                        No commentary available for this innings.
                    </div>
                ) : (
                    filteredGroups.map(group => (
                        <Card key={group.overNumber} className="overflow-hidden">
                            {/* Over Header */}
                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                <div className="font-bold text-slate-800 text-sm">
                                    Over {group.overNumber + 1}
                                </div>
                                <div className="text-xs font-semibold text-slate-500">
                                    {group.runs} runs • {group.wickets} wickets
                                </div>
                            </div>

                            {/* Balls */}
                            <div className="divide-y divide-slate-100">
                                {group.balls.map(ball => (
                                    <div key={ball.id} className="p-4 flex gap-4 hover:bg-slate-50 transition-colors">
                                        {/* Ball Badge */}
                                        <div className="flex-shrink-0 pt-1">
                                            <div className={`
                                          w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                          ${ball.isWicket ? 'bg-red-100 text-red-700' :
                                                    ball.isBoundary ? 'bg-green-100 text-green-700' :
                                                        ball.runs === 0 ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-700'}
                                      `}>
                                                {ball.isWicket ? 'W' : ball.runs}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-slate-900 text-sm">{ball.displayOver}</span>
                                                <span className="text-xs text-slate-400">{/* Time could go here */}</span>
                                            </div>
                                            <p className="text-slate-700 text-sm leading-relaxed">
                                                {ball.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
