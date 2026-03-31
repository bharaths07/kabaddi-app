import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfileByPlayerId } from '../shared/lib/auth';
import { useAuth } from '../shared/context/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Edit2, Share2, Copy, MapPin, Shield, Trophy, Star,
  Loader2, QrCode, ChevronRight
} from 'lucide-react';
import './public-profile.css';

export default function PublicProfilePage() {
  const { playerId } = useParams<{ playerId: string }>();
  const { user, profile: ownProfile } = useAuth();
  const navigate = useNavigate();

  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = !!user && !!ownProfile?.player_id && ownProfile.player_id === playerId;
  const profileUrl = `${window.location.origin}/player/${playerId}`;

  useEffect(() => {
    if (!playerId) { setNotFound(true); setLoading(false); return; }
    setLoading(true);
    getProfileByPlayerId(playerId)
      .then((data) => {
        if (!data) setNotFound(true);
        else setPlayer(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [playerId]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${player?.full_name || 'Kabaddi Player'} — KabaddiPulse`,
          text: `Check out ${player?.full_name}'s KabaddiPulse profile!`,
          url: profileUrl,
        });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="pp-center">
      <Loader2 className="pp-spinner" size={40} />
      <p className="pp-hint">Loading player profile…</p>
    </div>
  );

  // ── Not Found ─────────────────────────────────────────────────────
  if (notFound || !player) return (
    <div className="pp-center">
      <div className="pp-notfound-emoji">🏐</div>
      <h2 className="pp-notfound-title">Player Not Found</h2>
      <p className="pp-hint">No player with ID <strong>{playerId}</strong> exists.</p>
      <button className="pp-btn-primary" onClick={() => navigate('/')}>Go Home</button>
    </div>
  );

  const avatarInitials = (player.full_name || 'KP')
    .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  // ── Profile ───────────────────────────────────────────────────────
  return (
    <div className="pp-page">

      {/* Banner */}
      <div
        className="pp-banner"
        style={{
          backgroundImage: player.banner_url
            ? `url(${player.banner_url})`
            : 'linear-gradient(135deg,#FF6B00 0%,#FFB800 100%)'
        }}
      >
        {isOwner && (
          <button className="pp-edit-banner-btn" onClick={() => navigate('/profile/edit')}>
            <Edit2 size={14} /> Edit Profile
          </button>
        )}
      </div>

      {/* Header Row */}
      <div className="pp-header">
        <div className="pp-avatar">
          {player.avatar_url
            ? <img src={player.avatar_url} alt={player.full_name} />
            : <div className="pp-avatar-initials">{avatarInitials}</div>
          }
        </div>

        <div className="pp-header-actions">
          <button className="pp-icon-btn" onClick={() => setShowQR(true)} title="QR Code">
            <QrCode size={20} />
          </button>
          <button className="pp-icon-btn" onClick={handleShare} title="Share">
            <Share2 size={20} />
          </button>
          {isOwner && (
            <button className="pp-icon-btn pp-icon-btn--primary" onClick={() => navigate('/profile/edit')} title="Edit">
              <Edit2 size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Identity */}
      <div className="pp-identity">
        <h1 className="pp-name">{player.full_name || 'Kabaddi Player'}</h1>
        <div className="pp-badges">
          {player.role && <span className="pp-badge pp-badge--role">{player.role}</span>}
          {player.team_name && <span className="pp-badge pp-badge--team">{player.team_name}</span>}
          {player.jersey_number && <span className="pp-badge pp-badge--jersey">#{player.jersey_number}</span>}
        </div>
        {player.city && (
          <div className="pp-location">
            <MapPin size={14} /> {player.city}{player.state ? `, ${player.state}` : ''}
          </div>
        )}
        {player.bio && <p className="pp-bio">{player.bio}</p>}
      </div>

      {/* Player ID Card */}
      <div className="pp-id-card">
        <div className="pp-id-card-left">
          <div className="pp-id-label">🏅 Official Player ID</div>
          <div className="pp-id-value">{player.player_id}</div>
          <div className="pp-id-hint">KabaddiPulse Verified</div>
        </div>
        <div className="pp-id-card-right">
          <button className="pp-copy-id-btn" onClick={handleCopy}>
            <Copy size={14} />
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Stats Placeholder */}
      <div className="pp-stats-grid">
        {[
          { icon: <Trophy size={20} />, label: 'Matches', value: '—' },
          { icon: <Star size={20} />, label: 'Total Pts', value: '—' },
          { icon: <Shield size={20} />, label: 'Strike Rate', value: '—' },
        ].map((s) => (
          <div key={s.label} className="pp-stat-card">
            <div className="pp-stat-icon">{s.icon}</div>
            <div className="pp-stat-value">{s.value}</div>
            <div className="pp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Owner CTA */}
      {isOwner && (
        <button className="pp-cta-row" onClick={() => navigate('/profile')}>
          <span>View Full Stats Dashboard</span>
          <ChevronRight size={18} />
        </button>
      )}

      {/* QR Modal */}
      {showQR && (
        <div className="pp-modal-overlay" onClick={() => setShowQR(false)}>
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="pp-modal-close" onClick={() => setShowQR(false)}>✕</button>
            <h3 className="pp-modal-title">Scan to View Profile</h3>
            <div className="pp-qr-wrap">
              <QRCodeCanvas value={profileUrl} size={210} level="H" includeMargin />
            </div>
            <p className="pp-modal-url">{profileUrl}</p>
            <div className="pp-modal-actions">
              <button className="pp-btn-secondary" onClick={handleCopy}>
                <Copy size={16} /> {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button className="pp-btn-primary" onClick={handleShare}>
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
