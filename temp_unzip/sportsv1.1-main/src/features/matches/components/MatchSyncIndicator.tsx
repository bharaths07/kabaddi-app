import React from 'react';
import { useGlobalState } from '@/app/AppProviders';

export const MatchSyncIndicator: React.FC = () => {
    const { syncStatus } = useGlobalState();

    return (
        <div className="flex items-center gap-1.5 text-xs font-medium">
            <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'synced' ? 'bg-green-500' :
                    syncStatus === 'syncing' ? 'bg-amber-500 animate-pulse' :
                        'bg-red-500'
                }`}></div>
            <span className={syncStatus === 'error' ? 'text-red-500' : 'text-slate-400'}>
                {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Sync Error'}
            </span>
        </div>
    );
};
