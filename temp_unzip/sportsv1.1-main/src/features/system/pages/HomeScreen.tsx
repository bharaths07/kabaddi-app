import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { ActivityFeed } from '@/shared/components/ActivityFeed';

export const HomeScreen: React.FC = () => {
  const { currentUser, feedItems } = useGlobalState();
  const navigate = useNavigate();

  // Mock Stats for Dashboard

  return (
    <div className="space-y-8">
      
      {/* 1. Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {currentUser?.firstName || 'Legend'} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Your gaming dashboard is ready.
        </p>
      </div>

      {/* 2. Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/matches')}
          className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition border border-transparent hover:border-primary/20 group"
        >
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          </div>
          <h3 className="font-semibold text-lg text-gray-900 mb-1">Matches</h3>
          <p className="text-sm text-gray-500">View live scores, upcoming fixtures, and results.</p>
        </div>

        <div 
          onClick={() => navigate('/tournaments')}
          className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition border border-transparent hover:border-primary/20 group"
        >
          <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          </div>
          <h3 className="font-semibold text-lg text-gray-900 mb-1">Tournaments</h3>
          <p className="text-sm text-gray-500">Browse active tournaments and standings.</p>
        </div>

        <div 
          onClick={() => navigate('/teams')}
          className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition border border-transparent hover:border-primary/20 group"
        >
          <div className="h-10 w-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h3 className="font-semibold text-lg text-gray-900 mb-1">Teams</h3>
          <p className="text-sm text-gray-500">Find teams, players, and manage your squad.</p>
        </div>
      </div>

      {/* 3. Upcoming Matches Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">
          Upcoming Matches
        </h2>

        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            No matches scheduled
          </p>

          <button 
            onClick={() => navigate('/create-match')}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Match
          </button>
        </div>
      </div>

      {/* 4. Activity Feed (Reused) */}
      <ActivityFeed items={feedItems.slice(0, 5)} />

    </div>
  );
};
