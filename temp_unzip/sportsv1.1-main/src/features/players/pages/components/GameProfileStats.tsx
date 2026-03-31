import React, { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Award, Zap } from 'lucide-react';
import { CalculatedProfileStats } from '@/shared/utils/statsCalculator';

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 1000, suffix = '' }: { value: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{count}{suffix}</span>;
};

interface GameProfileStatsProps {
  stats: CalculatedProfileStats;
}

export const GameProfileStats: React.FC<GameProfileStatsProps> = ({ stats }) => {
  // Use real data from props
  const { winRate, matchesPlayed, bestStreak, formGuide } = stats;
  
  // Pad form guide for visualization if less than 5
  const displayForm = [...formGuide];
  while (displayForm.length < 5) {
      // Pad with undefined or skip rendering
      // For chart, let's just use what we have or map properly
  }

  // Reverse form guide for chart (Oldest -> Newest left to right) if needed, 
  // but usually "Recent Form" shows last 5. 
  // Let's visualize the `formGuide` which is [W, L, W...] (Newest first).
  // For a chart, we might want chronological order: Oldest -> Newest.
  const chartData = [...formGuide].reverse();

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 cursor-default group">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2 group-hover:text-slate-700 transition-colors">
            <Trophy size={16} className="text-yellow-500 group-hover:scale-110 transition-transform duration-300" />
            <span>Win Rate</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            <AnimatedCounter value={winRate} suffix="%" />
          </div>
          <div className="text-xs text-green-600 font-medium flex items-center mt-1">
            <TrendingUp size={12} className="mr-1" />
            Lifetime
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 cursor-default group">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2 group-hover:text-slate-700 transition-colors">
            <Award size={16} className="text-blue-500 group-hover:scale-110 transition-transform duration-300" />
            <span>Total Matches</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
             <AnimatedCounter value={matchesPlayed} />
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            Across all games
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 cursor-default group">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2 group-hover:text-slate-700 transition-colors">
            <Zap size={16} className="text-purple-500 group-hover:scale-110 transition-transform duration-300" />
            <span>Best Streak</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
             <AnimatedCounter value={bestStreak} />
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            Consecutive wins
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 cursor-default group">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2 group-hover:text-slate-700 transition-colors">
            <TrendingUp size={16} className="text-green-500 group-hover:scale-110 transition-transform duration-300" />
            <span>Form</span>
          </div>
          <div className="flex gap-1 mt-1">
             {formGuide.length > 0 ? formGuide.map((res, i) => (
                 <span key={i} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white transition-transform hover:scale-110 ${
                     res === 'W' ? 'bg-green-500' : res === 'L' ? 'bg-red-500' : 'bg-slate-400'
                 }`}>
                     {res}
                 </span>
             )) : <span className="text-slate-400 text-sm">No recent matches</span>}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-2">
            Last 5 matches
          </div>
        </div>
      </div>

      {/* Performance Trend (Custom CSS Chart) - Only show if we have data */}
      {chartData.length > 0 && (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Performance History</h3>
        
        {/* Simple Bar Chart */}
        <div className="flex items-end gap-2 h-40 w-full">
            {chartData.map((result, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                        className={`w-full rounded-t-md transition-all duration-300 group-hover:opacity-80 ${
                            result === 'W' ? 'h-[80%] bg-green-500' : result === 'L' ? 'h-[30%] bg-red-400' : 'h-[50%] bg-slate-300'
                        }`}
                    ></div>
                    <span className="text-xs text-slate-400 font-medium">
                        {idx === chartData.length - 1 ? 'Latest' : `M${idx + 1}`}
                    </span>
                </div>
            ))}
        </div>
        <div className="flex justify-center gap-6 mt-4 text-xs font-medium">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span className="text-slate-600">Won</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                <span className="text-slate-600">Lost</span>
            </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-300 rounded-sm"></div>
                <span className="text-slate-600">Draw</span>
            </div>
        </div>
      </div>
      )}

      {/* Detailed Stats Table (Placeholder for now, can be connected later) */}
      {/* 
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="px-6 py-4 border-b border-slate-100">
             <h3 className="text-lg font-bold text-slate-900">Stats by Game Type</h3>
         </div>
         <div className="divide-y divide-slate-100">
             {[
                 { game: 'Cricket', matches: matchesPlayed, win: `${winRate}%`, best: '-' },
             ].map((row, idx) => (
                <div key={idx} className="px-6 py-4 flex justify-between items-center">
                    <div>
                        <div className="font-bold text-slate-900">{row.game}</div>
                        <div className="text-xs text-slate-500">{row.matches} Matches</div>
                    </div>
                    <div className="text-right">
                         <div className="font-bold text-green-600">{row.win} Win Rate</div>
                         <div className="text-xs text-slate-500">Best: {row.best}</div>
                    </div>
                </div>
             ))}
         </div>
      </div>
      */}
    </div>
  );
};
