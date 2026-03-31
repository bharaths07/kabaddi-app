import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Copy, Share2 } from 'lucide-react';
import './profile.css';

interface QRCodeModalProps {
  displayName: string;
  playerId: string;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  displayName,
  playerId,
  onClose
}) => {
  const profileUrl = `${window.location.origin}/player/${playerId || 'unknown'}`;

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    // Toast logic could go here
  };

  return (
    <div className="pro-modal-overlay" onClick={onClose}>
      <div className="pro-modal-content" onClick={e => e.stopPropagation()}>
        <button className="pro-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="pro-qr-container">
          <QRCodeCanvas 
            value={profileUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <h2 className="pro-modal-title">Share {displayName}'s Profile</h2>
        <p className="pro-modal-desc">Scan to view professional stats or copy the link to share anywhere.</p>

        <div className="pro-copy-row">
          <button className="pro-btn-secondary" onClick={copyLink}>
            <Copy size={18} />
            <span>Copy Link</span>
          </button>
          <button className="pro-btn-primary" onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `${displayName} - KabaddiPulse`,
                url: profileUrl
              });
            }
          }}>
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
