import React from 'react';

interface TournamentStatusProps {
  stage: string;
  progress: string; // e.g. "12 of 30 matches completed"
  nextMatch: string; // e.g. "AFG vs WI – Feb 4, 3:00 PM"
}

export const TournamentStatus: React.FC<TournamentStatusProps> = ({ stage, progress, nextMatch }) => {
  return (
    <div className="mb-8 px-6 py-5 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
            Current Stage
          </h2>
          <div className="text-xl font-bold text-slate-900">
            {stage}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {progress}
          </div>
        </div>
        <div className="text-right">
           <h2 className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
            Up Next
          </h2>
          <div className="text-base font-semibold text-slate-900">
            {nextMatch}
          </div>
        </div>
      </div>
    </div>
  );
};
