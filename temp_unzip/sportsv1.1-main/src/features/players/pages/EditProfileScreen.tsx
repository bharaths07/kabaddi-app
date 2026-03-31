import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { profileService } from '@/features/players/api/profileService';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Avatar } from '@/shared/components/ui/Avatar';
import { ArrowLeft, Camera, Upload } from 'lucide-react';
import type { User } from '@/features/players/types/user';

export const EditProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useGlobalState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Proceed even if no user; UI will handle the guest state

  const [name, setName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [favoriteGame, setFavoriteGame] = useState(currentUser?.favoriteGame || '');
  const [gender, setGender] = useState<User['gender'] | ''>(currentUser?.gender ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.dateOfBirth || '');
  const [displayEmail, setDisplayEmail] = useState(currentUser?.displayEmail || currentUser?.email || '');
  const [displayPhone, setDisplayPhone] = useState(currentUser?.displayPhone || currentUser?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  // Parse game roles or default to empty
  const [gameRoles, setGameRoles] = useState<Record<string, string[]>>(currentUser?.gameRoles || {});
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const withTimeout = async <T,>(p: Promise<T>, ms = 12000, msg = 'Request timed out'): Promise<T> => {
    let timer: number;
    return new Promise<T>((resolve, reject) => {
      timer = window.setTimeout(() => reject(new Error(msg)), ms);
      p.then(
        (v) => {
          clearTimeout(timer);
          resolve(v);
        },
        (e: any) => {
          clearTimeout(timer);
          reject(e);
        }
      );
    });
  };

  // Helper for game roles
  const availableGames = ['Cricket', 'Football', 'Badminton', 'Tennis'];
  const commonRoles: Record<string, string[]> = {
      'Cricket': ['Batsman', 'Bowler', 'All-Rounder', 'Wicket Keeper', 'Captain'],
      'Football': ['Striker', 'Midfielder', 'Defender', 'Goalkeeper', 'Captain'],
      'Badminton': ['Singles', 'Doubles', 'Mixed Doubles'],
      'Tennis': ['Singles', 'Doubles']
  };

  const toggleRole = (game: string, role: string) => {
      setGameRoles(prev => {
          const currentRoles = prev[game] || [];
          const newRoles = currentRoles.includes(role) 
              ? currentRoles.filter(r => r !== role)
              : [...currentRoles, role];
          
          return {
              ...prev,
              [game]: newRoles
          };
      });
  };

  const handleSave = async () => {
    if (!currentUser) {
      setError('Please log in to edit your profile.');
      return;
    }
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!username.trim()) {
        setError('Username is required');
        return;
    }

    // Age Verification (Simple check: must be at least 13)
    if (dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 13) {
            setError('You must be at least 13 years old.');
            return;
        }
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Check username availability if changed
      if (username !== currentUser.username) {
          const isAvailable = await withTimeout(profileService.checkUsernameAvailability(username));
          if (!isAvailable) {
              setError('Username is already taken');
              setIsSaving(false);
              return;
          }
      }

      await withTimeout(updateUserProfile({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        location,
        bio,
        favoriteGame,
        gender: gender || undefined,
        dateOfBirth,
        displayEmail: displayEmail.trim(),
        displayPhone: displayPhone.trim(),
        gameRoles,
        avatarUrl: avatarUrl || undefined
      }));
      setSuccess('Profile updated successfully');
      navigate(-1);
    } catch (error) {
      console.error("Failed to update profile", error);
      const message = error instanceof Error ? error.message : "Failed to update profile";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) {
      setError('Please log in to upload an avatar.');
      return;
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Optimistic Preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);

      // Upload in background (or you could wait for save)
      // Ideally, we upload immediately to get the URL
      try {
          const publicUrl = await profileService.uploadAvatar(currentUser.id, file);
          if (publicUrl) {
              setAvatarUrl(publicUrl);
          }
      } catch (err) {
          console.error('Avatar upload failed:', err);
          setError('Failed to upload avatar image');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(-1)}
          className="text-slate-600 hover:text-slate-900 -ml-2"
        >
          <ArrowLeft size={18} className="mr-1" />
          Cancel
        </Button>
        <h1 className="text-lg font-bold text-slate-900">
          Edit Profile
        </h1>
        <Button 
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="text-blue-600 font-semibold hover:bg-blue-50 -mr-2"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-lg mx-auto w-full">
        
        {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
            </div>
        )}
        {success && (
            <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
                {success}
            </div>
        )}

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div 
            className="relative group cursor-pointer" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar 
              src={avatarUrl} 
              fallback={name.charAt(0) || 'U'}
              className="w-28 h-28 text-4xl border-4 border-white shadow-lg"
            />
            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white w-8 h-8" />
            </div>
            <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white shadow-sm">
                <Upload size={14} className="text-white" />
            </div>
          </div>
          <p className="text-sm text-blue-600 font-medium mt-3 cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>
            Change Profile Photo
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileSelect}
            aria-label="Upload profile photo"
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-1">
              Display Name
            </label>
            <Input 
              id="displayName"
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              placeholder="e.g. Rahul Dravid"
              className="bg-white"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <Input 
              id="username"
              value={username}
              onChange={(e: any) => setUsername(e.target.value)}
              placeholder="e.g. rahul19"
              className="bg-white"
            />
            <p className="text-xs text-slate-400 mt-1">Unique handle for your profile URL.</p>
          </div>

          <div>
            <label htmlFor="favoriteGame" className="block text-sm font-medium text-slate-700 mb-1">
              Favorite Sport
            </label>
            <select
                id="favoriteGame"
                value={favoriteGame}
                onChange={(e: any) => setFavoriteGame(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
                <option value="">Select a sport</option>
                {availableGames.map(game => (
                    <option key={game} value={game}>{game}</option>
                ))}
            </select>
          </div>

          {/* Game Roles Section */}
          {favoriteGame && commonRoles[favoriteGame] && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                      Your Roles in {favoriteGame}
                  </label>
                  <div className="flex flex-wrap gap-2">
                      {commonRoles[favoriteGame].map(role => {
                          const isSelected = gameRoles[favoriteGame]?.includes(role);
                          return (
                              <button
                                  key={role}
                                  type="button"
                                  onClick={() => toggleRole(favoriteGame, role)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                      isSelected 
                                      ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                  }`}
                              >
                                  {role} {isSelected && '✓'}
                              </button>
                          );
                      })}
                  </div>
              </div>
          )}

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">
              Gender
            </label>
            <select
                id="gender"
                value={gender}
                onChange={(e: any) => setGender(e.target.value as User['gender'] | '')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700 mb-1">
              Date of Birth
            </label>
            <Input 
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e: any) => setDateOfBirth(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="displayEmail" className="block text-sm font-medium text-slate-700 mb-1">
                Email (Display)
                </label>
                <Input 
                id="displayEmail"
                type="email"
                value={displayEmail}
                onChange={(e: any) => setDisplayEmail(e.target.value)}
                placeholder="public@email.com"
                className="bg-white"
                />
            </div>
            <div>
                <label htmlFor="displayPhone" className="block text-sm font-medium text-slate-700 mb-1">
                Phone (Display)
                </label>
                <Input 
                id="displayPhone"
                type="tel"
                value={displayPhone}
                onChange={(e: any) => setDisplayPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="bg-white"
                />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
              Location
            </label>
            <Input 
              id="location"
              value={location}
              onChange={(e: any) => setLocation(e.target.value)}
              placeholder="e.g. Mumbai, India"
              className="bg-white"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
              Bio
            </label>
            <Textarea 
              id="bio"
              value={bio}
              onChange={(e: any) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="bg-white resize-none"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
