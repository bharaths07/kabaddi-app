import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Settings, MapPin, Instagram, Linkedin, Twitter, Youtube, Github, Plus, QrCode } from 'lucide-react';

export const MyProfileDetailsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useGlobalState();
  const isGuest = !currentUser;

  // Resolve user display data
  const userData = isGuest ? {
    name: 'Guest User',
    username: 'guest',
    location: 'India',
    memberSince: '-',
    avatarUrl: null,
    initial: 'G',
    followers: 0,
    following: 0,
    views: 0,
    bio: 'Sign in to access full profile features and connect with other sports enthusiasts.',
    favoriteGame: 'Sports Enthusiast',
    gameRoles: {} as Record<string, string[]>
  } : {
    name: currentUser.name || 'User',
    username: currentUser.username || `user_${currentUser.id.slice(0,6)}`,
    location: currentUser.location || 'India',
    memberSince: currentUser.memberSince || new Date().getFullYear().toString(),
    avatarUrl: currentUser.avatarUrl,
    initial: (currentUser.name || 'U').charAt(0),
    followers: currentUser.followersCount || 0,
    following: currentUser.followingCount || 0,
    views: currentUser.profileViews || 0,
    bio: currentUser.bio || 'Passionate about sports and competition. Always ready for a match!',
    favoriteGame: currentUser.favoriteGame || 'Athlete',
    gameRoles: currentUser.gameRoles || {},
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. Header Section (Blue Gradient) */}
      <div className="bg-gradient-to-b from-blue-600 to-cyan-400 pb-20 rounded-b-[3rem] relative overflow-hidden">
        
        {/* Top Navigation */}
        <div className="flex justify-between items-center px-6 py-6 text-white">
          <button 
             onClick={() => navigate('/profile/game')}
             className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-white/30 hover:bg-white/30 transition-colors"
          >
            Game Profile
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Settings size={24} />
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center text-white mt-2">
          {/* Avatar */}
          <div className="relative mb-4 group cursor-pointer" onClick={() => !isGuest && navigate('/profile/edit')}>
            <div className="p-1 bg-white/20 rounded-full">
                <Avatar 
                    src={userData.avatarUrl}
                    fallback={userData.initial}
                    className="w-28 h-28 border-4 border-white shadow-xl text-3xl"
                />
            </div>
          </div>

          {/* Name & Location */}
          <h1 className="text-2xl font-bold mb-1">{userData.name}</h1>
          <div className="flex items-center gap-1 text-blue-50 text-sm font-medium mb-3">
            <MapPin size={14} />
            <span>{userData.location}</span>
          </div>

          {/* Role / Favorite Game */}
          <div className="text-lg font-semibold mb-6">
            {userData.favoriteGame}
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
             <button 
                onClick={() => navigate('/profile/edit')}
                className="bg-white text-blue-600 px-10 py-2.5 rounded-full font-bold shadow-lg hover:bg-blue-50 transition-colors active:scale-95"
             >
                Edit Profile
             </button>
             <button 
                onClick={() => navigate('/profile/qr')}
                className="p-2.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white hover:bg-white/30 transition-colors active:scale-95"
             >
                <QrCode size={20} />
             </button>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-8 mt-10 mb-6">
             <div className="text-center">
                <div className="text-2xl font-bold">{userData.followers}</div>
                <div className="text-blue-100 text-xs font-medium uppercase tracking-wide">Followers</div>
             </div>
             <div className="w-px h-8 bg-blue-300/50"></div>
             <div className="text-center">
                <div className="text-2xl font-bold">{userData.following}</div>
                <div className="text-blue-100 text-xs font-medium uppercase tracking-wide">Following</div>
             </div>
             <div className="w-px h-8 bg-blue-300/50"></div>
             <div className="text-center">
                <div className="text-2xl font-bold">{userData.views}</div>
                <div className="text-blue-100 text-xs font-medium uppercase tracking-wide">Views</div>
             </div>
          </div>

        </div>
      </div>

      {/* 2. Content Section (White Background) */}
      <div className="px-6 -mt-8 relative z-10">
        
        {/* Summary Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Summary</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-3 line-clamp-3">
                {userData.bio}
            </p>
            <button className="text-blue-600 text-sm font-bold hover:underline">
                Read More...
            </button>

            <div className="flex justify-center mt-6">
                <button className="p-2 border border-slate-200 rounded-full text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors">
                    <Plus size={20} />
                </button>
            </div>
        </div>

        {/* Game Roles (Tech Stack style) */}
        {userData.gameRoles && Object.keys(userData.gameRoles).length > 0 ? (
            <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl p-6 mb-6 text-white shadow-lg shadow-blue-200">
                <h3 className="text-center font-bold text-lg mb-4 border-b border-white/20 pb-2 mx-10">Game Roles</h3>
                <div className="flex flex-wrap justify-center gap-2">
                    {Object.entries(userData.gameRoles).map(([game, roles]) => (
                        roles.map(role => (
                            <div key={`${game}-${role}`} className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30 text-xs font-bold">
                                <span>{game}</span>
                                <span className="w-1 h-1 bg-white rounded-full"></span>
                                <span>{role}</span>
                            </div>
                        ))
                    ))}
                </div>
            </div>
        ) : (
            <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl p-6 mb-6 text-white shadow-lg shadow-blue-200 text-center">
                <p className="font-medium text-sm">Add game roles to showcase your skills!</p>
                <button 
                    onClick={() => navigate('/profile/edit')}
                    className="mt-3 bg-white text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold"
                >
                    Add Roles
                </button>
            </div>
        )}

        {/* Connect Section */}
        <div className="text-center pb-10">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Connect</h3>
            <div className="flex justify-center gap-6 text-slate-600">
                <button className="hover:text-pink-600 transition-colors hover:scale-110 transform duration-200">
                    <Instagram size={24} />
                </button>
                <button className="hover:text-blue-700 transition-colors hover:scale-110 transform duration-200">
                    <Linkedin size={24} />
                </button>
                <button className="hover:text-black transition-colors hover:scale-110 transform duration-200">
                    <Twitter size={24} />
                </button>
                <button className="hover:text-red-600 transition-colors hover:scale-110 transform duration-200">
                    <Youtube size={24} />
                </button>
                <button className="hover:text-slate-900 transition-colors hover:scale-110 transform duration-200">
                    <Github size={24} />
                </button>
            </div>
        </div>

      </div>

    </div>
  );
};
