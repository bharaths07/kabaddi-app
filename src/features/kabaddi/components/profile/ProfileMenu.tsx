import React, { useState } from 'react';
import { MoreVertical, Edit2, Share2, Copy, Settings, LogOut, User } from 'lucide-react';
import './profile.css';

interface ProfileMenuProps {
  playerId: string;
  isOwnProfile?: boolean;
  onEdit: () => void;
  onShare: () => void;
  onLogout: () => void;
  onViewMatches: () => void;
  onSettings: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  playerId,
  isOwnProfile = false,
  onEdit,
  onShare,
  onLogout,
  onViewMatches,
  onSettings
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const copyPlayerId = () => {
    navigator.clipboard.writeText(playerId);
    setIsOpen(false);
    // You could trigger a toast here
  };

  const handleAction = (cb: () => void) => {
    cb();
    setIsOpen(false);
  };

  return (
    <div className="pro-menu-container">
      <button className="pro-menu-trigger" onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical size={24} />
      </button>

      {isOpen && (
        <>
          <div className="pro-menu-overlay" onClick={() => setIsOpen(false)} />
          <div className="pro-menu-dropdown">
            {isOwnProfile && (
              <button className="pro-menu-item" onClick={() => handleAction(onEdit)}>
                <Edit2 size={18} />
                <span>Edit Profile</span>
              </button>
            )}
            <button className="pro-menu-item" onClick={() => handleAction(onShare)}>
              <Share2 size={18} />
              <span>Share Profile</span>
            </button>
            <button className="pro-menu-item" onClick={copyPlayerId}>
              <Copy size={18} />
              <span>Copy Player ID</span>
            </button>
            <button className="pro-menu-item" onClick={() => handleAction(onViewMatches)}>
              <User size={18} />
              <span>{isOwnProfile ? 'My Matches' : 'View Matches'}</span>
            </button>
            
            {isOwnProfile && (
              <>
                <div className="pro-menu-divider" />
                <button className="pro-menu-item" onClick={() => handleAction(onSettings)}>
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
                <button className="pro-menu-item text-danger" onClick={() => handleAction(onLogout)}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
