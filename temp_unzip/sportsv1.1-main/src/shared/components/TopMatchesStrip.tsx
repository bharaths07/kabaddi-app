import React, { useMemo, useState } from 'react';
import { useGlobalState } from '@/app/AppProviders';
import { MatchStripCard } from './MatchStripCard';
import { Link } from 'react-router-dom';

export const TopMatchesStrip: React.FC = () => {
  const { matches } = useGlobalState();
  const [tab, setTab] = useState<'top' | 'live'>('top');

  const liveMatches = useMemo(() => matches.filter(m => m.status === 'live'), [matches]);
  const topMatches = useMemo(() => matches.filter(m => m.status === 'draft'), [matches]);

  const data = tab === 'top' ? topMatches : liveMatches;

  return (
    <section className="mb-6">
      {/* Header with Tabs (Left) + Schedule Link (Right) */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-4">
          <button
            onClick={() => setTab('top')}
            className={`bg-transparent border-0 p-0 cursor-pointer ${tab === 'top' ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-600 hover:text-slate-800'
              }`}
          >
            Top Matches
          </button>
          <button
            onClick={() => setTab('live')}
            className={`bg-transparent border-0 p-0 cursor-pointer ${tab === 'live' ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-600 hover:text-slate-800'
              }`}
          >
            Live ({liveMatches.length})
          </button>
        </div>
        <div>
          <Link to="/matches" className="font-bold text-slate-900 hover:underline">
            Cricket Schedule →
          </Link>
        </div>
      </div>

      {/* Horizontal row of equal cards with overflow scroll */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {data.map(m => (
          <MatchStripCard key={m.id} match={m} />
        ))}
      </div>
    </section>
  );
};
