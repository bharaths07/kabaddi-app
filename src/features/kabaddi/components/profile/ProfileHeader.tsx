import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import './profile.css';

interface ProfileHeaderProps {
  displayName: string;
  role: string;
  teamName: string;
  location: string;
  rating: number;
  trend: string;
  avatarUrl?: string;
  bannerUrl?: string;
  isOwnProfile: boolean;
  onAvatarUpload: (file: File) => void;
  onBannerUpload: (file: File) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  displayName,
  role,
  teamName,
  location,
  rating,
  trend,
  avatarUrl,
  bannerUrl,
  isOwnProfile,
  onAvatarUpload,
  onBannerUpload
}) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'avatar') onAvatarUpload(file);
      else onBannerUpload(file);
    }
  };

  return (
    <div className="pro-header">
      {/* Banner Section */}
      <div 
        className="pro-banner"
        style={{ backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'linear-gradient(135deg, #FF6B00 0%, #FFB800 100%)' }}
        onClick={() => isOwnProfile && bannerInputRef.current?.click()}
      >
        {isOwnProfile && (
          <div className="pro-banner-edit-overlay">
            <Camera size={24} color="#000" />
            <input 
              type="file" 
              ref={bannerInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'banner')}
            />
          </div>
        )}
      </div>

      <div className="pro-header-content">
        {/* Avatar Section */}
        <div className="pro-avatar-container">
          <div 
            className="pro-avatar"
            onClick={() => isOwnProfile && avatarInputRef.current?.click()}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} />
            ) : (
              <div className="pro-avatar-placeholder">
                {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
            {isOwnProfile && (
              <div className="pro-avatar-edit-badge">
                <Camera size={16} color="#fff" />
                <input 
                  type="file" 
                  ref={avatarInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'avatar')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="pro-info-row">
          <div className="pro-main-info">
            <h1 className="pro-display-name">{displayName}</h1>
            <div className="pro-meta-row">
              <span className="pro-role-badge">{role || 'Player'}</span>
              <span className="pro-team-name">{teamName || 'Free Agent'}</span>
            </div>
            <div className="pro-location">📍 {location || 'India'}</div>
          </div>

          {/* Rating Pill */}
          <div className="pro-rating-card">
            <div className="pro-rating-val">{rating.toFixed(1)}</div>
            <div className={`pro-rating-trend ${trend.includes('↑') ? 'up' : 'down'}`}>
              {trend}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
