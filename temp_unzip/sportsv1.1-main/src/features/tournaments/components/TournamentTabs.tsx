import React from 'react';

interface TournamentTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TournamentTabs: React.FC<TournamentTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = ['Overview', 'Matches', 'Squads', 'Points Table', 'Leaderboard'];

  return (
    <div className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 flex gap-8">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`relative translate-y-[1px] py-4 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-white border-b-2 border-blue-500'
                : 'text-slate-400 border-b-2 border-transparent hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};
