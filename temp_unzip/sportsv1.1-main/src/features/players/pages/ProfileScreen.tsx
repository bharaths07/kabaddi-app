import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { Avatar } from '@/shared/components/ui/Avatar';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useGlobalState();
  const isGuest = !currentUser;

  // Resolve user display data
  const userData = isGuest ? {
    name: 'Guest',
    initial: 'G',
    subtitle: 'Sign in to sync your data',
    avatarUrl: null
  } : {
    name: `${currentUser.firstName} ${currentUser.lastName}`,
    initial: currentUser.firstName?.charAt(0) || 'U',
    subtitle: `Member since ${currentUser.memberSince}`,
    avatarUrl: currentUser.avatarUrl
  };

  // Quick Actions Config
  const quickActions = [
    { 
      icon: '👤', 
      label: 'My Profile', 
      active: false, // Changed from true to false
      onClick: () => navigate('/profile/me') // Navigate to new details page
    },
    { 
      icon: '🔖', 
      label: 'Saved Matches', 
      onClick: () => isGuest ? navigate('/login') : console.log('Saved Matches') 
    },
    { 
      icon: '🔔', 
      label: 'Notifications', 
      onClick: () => isGuest ? navigate('/login') : console.log('Notifications') 
    },
    { icon: '⚙️', label: 'Settings', onClick: () => console.log('Settings') },
    { icon: '❓', label: 'Help & Support', onClick: () => console.log('Help') },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      
      {/* A. PROFILE HEADER (ACCOUNT LEVEL) */}
      <div className="bg-white px-5 py-6 border-b border-slate-200 flex items-center gap-4">
        {/* Avatar */}
        <Avatar 
          src={userData.avatarUrl}
          fallback={userData.initial}
          className="w-16 h-16 border-2 border-white shadow-sm text-2xl bg-slate-200 text-slate-500 font-bold"
        />

        {/* Center Info */}
        <div className="flex-1">
          <div className="text-[20px] font-bold text-slate-900">
            {userData.name}
          </div>
          <div className="text-[13px] text-slate-500 mt-0.5">
            {userData.subtitle}
          </div>
        </div>

        {/* Right CTA */}
        <div>
          {isGuest ? (
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded-2xl text-[13px] font-semibold cursor-pointer"
            >
              Login
            </button>
          ) : (
            <button 
              onClick={() => console.log('Edit Profile')}
              className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-2xl text-[13px] font-semibold cursor-pointer"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* B. QUICK ACTIONS (CARD LIST) */}
      <div className="p-5">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {quickActions.map((action, index) => (
            <div 
              key={action.label}
              onClick={action.onClick}
              className={`p-4 flex items-center gap-4 cursor-pointer ${index !== quickActions.length - 1 ? 'border-b border-slate-100' : ''} ${action.active ? 'bg-blue-50' : 'bg-white'}`}
            >
              <span className="text-[18px]">{action.icon}</span>
              <span className={`flex-1 text-[15px] ${action.active ? 'text-blue-600 font-semibold' : 'text-slate-700 font-normal'}`}>
                {action.label}
              </span>
              <span className="text-slate-300">›</span>
            </div>
          ))}
        </div>
      </div>

      {/* C. GAME PROFILES ENTRY */}
      <div className="px-5 pb-5">
        <h3 className="text-[14px] uppercase text-slate-500 mb-3 font-semibold tracking-[0.5px]">
          Game Profiles
        </h3>
        
        {/* Cricket Card */}
        <div 
          onClick={() => {
            if (isGuest) {
              navigate('/login');
            } else {
              navigate('/profile/game/cricket');
            }
          }}
          className={`bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 cursor-pointer ${isGuest ? 'opacity-70' : 'opacity-100'} [border-left:4px_solid_#ef4444]`}
        >
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-[20px]">
            🏏
          </div>
          <div className="flex-1">
            <div className="text-[16px] font-semibold text-slate-900">Cricket</div>
            <div className="text-[13px] text-slate-500 mt-0.5">
              {isGuest ? 'Login to set up profile' : 'View your game stats'}
            </div>
          </div>
          <div className="text-red-600 text-[13px] font-semibold">
            {isGuest ? 'Locked' : 'Open'}
          </div>
        </div>
      </div>

    </div>
  );
};
