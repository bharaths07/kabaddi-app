import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { profileService } from '@/features/players/api/profileService';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Button } from '@/shared/components/ui/Button';
import { MapPin, Calendar, UserPlus, UserCheck, Eye, Share2 } from 'lucide-react';
import { User } from '@/features/players/types/user';
import { supabase } from '@/shared/lib/supabase';

export const PublicProfileScreen: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { currentUser } = useGlobalState();
  
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      setIsLoading(true);
      setError(null);
      try {
        const user = await profileService.getProfileByUsername(username);
        if (user) {
          setProfile(user);
          // Check follow status if logged in
          if (currentUser) {
             const { count } = await supabase
                .from('followers')
                .select('*', { count: 'exact', head: true })
                .eq('follower_id', currentUser.id)
                .eq('following_id', user.id);
             setIsFollowing(!!count);
          }
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Failed to fetch public profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!profile) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id);
        if (error) throw error;
        setIsFollowing(false);
        setProfile(prev => prev ? { ...prev, followersCount: (prev.followersCount || 1) - 1 } : null);
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert({
            follower_id: currentUser.id,
            following_id: profile.id
          });
        if (error) throw error;
        setIsFollowing(true);
        setProfile(prev => prev ? { ...prev, followersCount: (prev.followersCount || 0) + 1 } : null);
      }
    } catch (err) {
      console.error('Follow toggle failed:', err);
      alert('Action failed. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-medium">Loading Profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">User Not Found</h2>
        <p className="text-slate-500 mb-6">The user @{username} does not exist or has been removed.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* 1. Header Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-700 pb-16">
        <div className="flex justify-between items-center px-5 py-4 text-white">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
            ←
          </button>
          <span className="font-semibold text-sm tracking-wide">PROFILE</span>
          <button 
            onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied!');
            }}
            className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* 2. Main Content Card */}
      <div className="px-5 -mt-12">
        <div className="bg-white rounded-2xl shadow-sm p-5 relative overflow-hidden">
          
          {/* Top Row: Avatar & Stats */}
          <div className="flex justify-between items-start mb-4">
            {/* Avatar */}
            <div className="-mt-12 relative">
              <Avatar 
                src={profile.avatarUrl}
                fallback={profile.name?.charAt(0) || 'U'}
                className="w-24 h-24 border-4 border-white shadow-md text-3xl"
              />
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-1 text-center">
              <div>
                <div className="text-lg font-bold text-slate-900">{profile.followersCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Followers</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">{profile.followingCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Following</div>
              </div>
            </div>
          </div>

          {/* Name & Username */}
          <div className="mb-4">
             <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {profile.name}
                {profile.favoriteGame && (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold uppercase rounded-full border border-purple-100">
                        {profile.favoriteGame}
                    </span>
                )}
             </h1>
             <p className="text-slate-500 text-sm font-medium">@{profile.username}</p>
          </div>

          {/* Bio */}
          {profile.bio && (
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                 {profile.bio}
              </p>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-6">
             {profile.location && (
                 <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{profile.location}</span>
                 </div>
             )}
             <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                <span>Joined {profile.memberSince || new Date().getFullYear()}</span>
             </div>
             <div className="flex items-center gap-2">
                <Eye size={16} className="text-slate-400" />
                <span>{profile.profileViews || 0} Views</span>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
             {isOwnProfile ? (
                 <Button 
                    className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200"
                    onClick={() => navigate('/profile/edit')}
                 >
                    Edit Profile
                 </Button>
             ) : (
                 <Button 
                    className={`flex-1 gap-2 ${
                        isFollowing 
                        ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                    }`}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                 >
                    {isFollowing ? (
                        <>
                            <UserCheck size={18} />
                            Following
                        </>
                    ) : (
                        <>
                            <UserPlus size={18} />
                            Follow
                        </>
                    )}
                 </Button>
             )}
          </div>

          {/* Game Roles Display */}
          {profile.gameRoles && Object.keys(profile.gameRoles).length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Game Roles</h3>
                  <div className="flex flex-wrap gap-2">
                      {Object.entries(profile.gameRoles).map(([game, roles]) => (
                          roles.map(role => (
                              <span key={`${game}-${role}`} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full border border-slate-200">
                                  {game}: <strong>{role}</strong>
                              </span>
                          ))
                      ))}
                  </div>
              </div>
          )}

        </div>
      </div>
      
    </div>
  );
};
