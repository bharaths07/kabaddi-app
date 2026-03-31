import React from 'react';

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange,
  variant = 'underline',
  className = ''
}) => {
  return (
    <div className={`flex ${variant === 'pill' ? 'gap-2' : 'gap-6 border-b border-slate-200'} ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        if (variant === 'pill') {
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-4 py-1.5 text-sm font-medium rounded-full transition-colors
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}
              `}
            >
              {tab.label}
            </button>
          );
        }

        // Underline variant
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              pb-3 text-sm font-medium border-b-2 transition-colors -mb-[1px]
              ${isActive 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
