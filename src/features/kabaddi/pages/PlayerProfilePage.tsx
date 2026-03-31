import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { createOrUpdateProfile, uploadAvatar, uploadBanner, signOut, getProfileByPlayerId } from '../../../shared/lib/auth';
import { supabase } from '../../../shared/lib/supabase';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileMenu } from '../components/profile/ProfileMenu';
import { QRCodeModal } from '../components/profile/QRCodeModal';
import { Trophy, Target, Shield, Zap, Info, History, Star, Share2, Loader2 } from 'lucide-react';
import './profile-page.css';
import '../components/profile/profile.css';

const generatePlayerId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "KP-";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};

// Advanced KPI Calculators
const calcNPpR = (raidPts: number, totalRaids: number) => totalRaids > 0 ? (raidPts / totalRaids).toFixed(1) : '0.0';
const calcStrikeRate = (successCount: number, totalCount: number) => totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : '0.0';
const calcPressure = (superRaids: number, superTackles: number) => Math.min(100, (superRaids * 15) + (superTackles * 20) + 40).toFixed(0); 
const calcDODSuccess = (success: number, total: number) => total > 0 ? ((success / total) * 100).toFixed(0) : '0';

export default function PlayerProfilePage() {
  const { id } = useParams(); // URL params could be an actual auth ID or a KP-XXXXXX player_id
  const navigate = useNavigate();
  const { user, profile: authProfile, refreshProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'matches' | 'achievements'>('overview');
  const [playerData, setPlayerData] = useState<any>(null);
  const [matchStats, setMatchStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  // Is this the logged-in user viewing their own profile?
  // They are viewing their own if: No ID in URL, OR ID matches their auth ID, OR ID matches their player_id
  const isOwnProfile = !id || id === user?.id || id === authProfile?.player_id;

  useEffect(() => {
    fetchProfileData();
  }, [id, user, authProfile]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      let resolvedProfile = null;

      if (isOwnProfile) {
        resolvedProfile = authProfile;
        
        // Auto-generate player_id if missing
        if (resolvedProfile && !resolvedProfile.player_id && user) {
          const newId = generatePlayerId();
          await createOrUpdateProfile(user.id, { player_id: newId });
          await refreshProfile();
          resolvedProfile = { ...resolvedProfile, player_id: newId };
        }
      } else if (id) {
        // Assume ID is a player_id (e.g. KP-XXXXXX)
        resolvedProfile = await getProfileByPlayerId(id);
        
        // If not found by player_id, maybe it was a UUID auth ID
        if (!resolvedProfile && id.length > 20) {
           const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
           resolvedProfile = data;
        }
      }

      setPlayerData(resolvedProfile);

      // Fetch match stats linking to this user's recognized name/team context
      // Note: Real world would link users to players table via a verified claim, 
      // but for now we aggregate based on their declared team_name and name.
      if (resolvedProfile?.full_name) {
         fetchMatchHistory(resolvedProfile.full_name, resolvedProfile.team_name);
      } else {
         setMatchStats([]);
      }

    } catch (err) {
      console.error('Error fetching profile:', err);
      setPlayerData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchHistory = async (playerName: string, teamName?: string) => {
     try {
       // Search players table by name
       let query = supabase.from('players').select('id, team_id').ilike('name', playerName);
       const { data: playersFound } = await query;
       
       if (!playersFound || playersFound.length === 0) {
         setMatchStats([]);
         return;
       }

       const playerIds = (playersFound || []).map((p: any) => p.id);

       const { data: stats } = await supabase
         .from('player_match_stats')
         .select(`
           *,
           fixtures (
             id, scheduled_at, status, result,
             home: teams!team_home_id (name),
             guest: teams!team_guest_id (name)
           )
         `)
         .in('player_id', playerIds);

       if (stats) {
         // Sort by date descending
         stats.sort((a: any, b: any) => {
            const dateA = a.fixtures?.scheduled_at ? new Date(a.fixtures.scheduled_at).getTime() : 0;
            const dateB = b.fixtures?.scheduled_at ? new Date(b.fixtures.scheduled_at).getTime() : 0;
            return dateB - dateA;
         });
         setMatchStats(stats);
       } else {
         setMatchStats([]);
       }
     } catch (e) {
       console.error("Match history fail", e);
     }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!isOwnProfile || !user) return;
    try {
      const url = await uploadAvatar(user.id, file);
      await createOrUpdateProfile(user.id, { avatar_url: url });
      await refreshProfile();
      fetchProfileData();
    } catch (err) {
      alert('Failed to upload avatar');
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (!isOwnProfile || !user) return;
    try {
      const url = await uploadBanner(user.id, file);
      await createOrUpdateProfile(user.id, { banner_url: url });
      await refreshProfile();
      fetchProfileData();
    } catch (err) {
      alert('Failed to upload banner');
    }
  };

  if (loading) return (
     <div className="pro-page" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
       <Loader2 className="animate-spin" size={32} color="#FF6B00" />
     </div>
  );

  if (!playerData && !isOwnProfile) return (
     <div className="pro-page" style={{display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}}>
       <h2>Player Not Found</h2>
     </div>
  );

  // Aggregated Stats
  const totalMatches = matchStats.length;
  const totalRaidPts = matchStats.reduce((sum, s) => sum + (s.raid_points || 0), 0);
  const totalTacklePts = matchStats.reduce((sum, s) => sum + (s.tackle_points || 0), 0);
  const totalRaids = matchStats.reduce((sum, s) => sum + (s.total_raids || 0), 0);
  const totalTackles = matchStats.reduce((sum, s) => sum + (s.total_tackles || 0), 0);
  const superRaids = matchStats.reduce((sum, s) => sum + (s.super_raids || 0), 0);
  const superTackles = matchStats.reduce((sum, s) => sum + (s.super_tackles || 0), 0);
  const successfulRaids = matchStats.filter(s => (s.raid_points || 0) > 0).length; // simple approximation

  const nPpr = calcNPpR(totalRaidPts, totalRaids);
  const strikeRate = calcStrikeRate(successfulRaids, totalRaids);
  const pressure = calcPressure(superRaids, superTackles);
  
  // Create display object mapped to real data
  const displayData = {
    id: playerData?.id || user?.id,
    name: playerData?.full_name || user?.email?.split('@')[0] || "Kabaddi Player",
    role: playerData?.role || "Player",
    teamName: playerData?.team_name || "Looking for Team",
    city: playerData?.city || "India",
    avatar_url: playerData?.avatar_url,
    banner_url: playerData?.banner_url,
    player_id: playerData?.player_id,
    stats: {
      overall: [
         { label: 'Matches Played', value: totalMatches }, 
         { label: 'Total Points Earned', value: totalRaidPts + totalTacklePts }, 
         { label: 'Points Per Match', value: totalMatches > 0 ? ((totalRaidPts + totalTacklePts) / totalMatches).toFixed(1) : 0 }
      ],
      attacking: [
         { label: 'Total Raids', value: totalRaids }, 
         { label: 'No. Of Super Raids', value: superRaids }, 
         { label: 'Super 10s', value: matchStats.filter((s) => (s.raid_points || 0) >= 10).length }, 
         { label: 'Total Raid Points', value: totalRaidPts }
      ],
      defensive: [
         { label: 'No. Of Super Tackles', value: superTackles }, 
         { label: 'High 5s', value: matchStats.filter((s) => (s.tackle_points || 0) >= 5).length }, 
         { label: 'Total Tackle Points', value: totalTacklePts }, 
         { label: 'Total Tackles', value: totalTackles }
      ]
    },
    matches: matchStats.map((s: any) => {
      const f = s.fixtures;
      const isHome = f?.home?.name && playerData?.team_name && f.home.name.toLowerCase().includes(playerData.team_name.toLowerCase());
      const opponent = f ? (isHome ? f.guest?.name : f.home?.name) : 'Unknown';
      return {
        id: s.id,
        date: f?.scheduled_at ? new Date(f.scheduled_at).toLocaleDateString() : '—',
        opponent: opponent || 'Unknown Opponent',
        raidPts: s.raid_points || 0,
        tacklePts: s.tackle_points || 0,
        result: f?.result || (f?.status === 'completed' ? 'Played' : f?.status || '-')
      };
    })
  };

  return (
    <div className="pro-page">
      <div className="pro-container">
        
        {/* Menu & Header */}
        <div className="pro-header-wrapper">
          <ProfileMenu 
            playerId={displayData.player_id || displayData.id}
            isOwnProfile={isOwnProfile}
            onEdit={() => navigate('/profile/edit')}
            onShare={() => setShowQR(true)}
            onLogout={async () => { await signOut(); navigate('/login'); }}
            onViewMatches={() => setActiveTab('matches')}
            onSettings={() => navigate('/settings')}
          />
          
          <ProfileHeader 
            displayName={displayData.name}
            role={displayData.role}
            teamName={displayData.teamName}
            location={displayData.city}
            rating={92.4} 
            trend="+5 ↑" 
            avatarUrl={displayData.avatar_url}
            bannerUrl={displayData.banner_url}
            isOwnProfile={isOwnProfile}
            onAvatarUpload={handleAvatarUpload}
            onBannerUpload={handleBannerUpload}
          />
        </div>

        {/* Action Row */}
        <div className="pro-actions-row">
            <button className={`pro-action-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                <Info size={18} /> Overview
            </button>
            <button className={`pro-action-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
                <Zap size={18} /> Stats
            </button>
            <button className={`pro-action-tab ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}>
                <History size={18} /> Matches
            </button>
            <button className={`pro-action-tab ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')}>
                <Trophy size={18} /> Awards
            </button>
        </div>

        {/* Content Area */}
        <div className="pro-content">
          {activeTab === 'overview' && (
            <div className="pro-overview-grid">
               {/* KPI Capsules (KBDStars Style) */}
               <div className="pro-kpi-capsules">
                  <div className="pro-kpi-capsule orange">
                    <div className="kpi-item">
                       <span className="kpi-val"><Star size={16} fill="#f59e0b" color="#f59e0b" /> {nPpr}</span>
                       <span className="kpi-lbl">NPpR</span>
                    </div>
                    <div className="kpi-divider" />
                    <div className="kpi-item">
                       <span className="kpi-val"><Shield size={16} color="#f97316"/> {totalMatches > 0 ? (totalRaids/totalMatches).toFixed(1) : 0}</span>
                       <span className="kpi-lbl">Raids/Match</span>
                    </div>
                  </div>

                  <div className="pro-kpi-capsule blue">
                    <div className="kpi-item">
                       <span className="kpi-val">{strikeRate}%</span>
                       <span className="kpi-lbl">Strike Rate</span>
                    </div>
                    <div className="kpi-divider" />
                    <div className="kpi-item">
                       <span className="kpi-val">{pressure}%</span>
                       <span className="kpi-lbl">Pressure</span>
                    </div>
                    <div className="kpi-divider" />
                    <div className="kpi-item">
                       <span className="kpi-val">{calcDODSuccess(totalRaidPts, totalRaids)}%</span>
                       <span className="kpi-lbl">DOD Success</span>
                    </div>
                  </div>

                  <div className="pro-kpi-capsule purple">
                    <div className="kpi-item">
                       <span className="kpi-val"><Target size={18} color="#8b5cf6" /> {totalTacklePts}</span>
                       <span className="kpi-lbl">Total Tackles</span>
                    </div>
                    <div className="kpi-trophy"><Trophy size={24} /></div>
                  </div>
               </div>

               {/* Main Grid Splits */}
               <div className="pro-split-grid">
                  <div className="pro-left-column">
                     <div className="pro-card stats-summary">
                        <div className="summary-item">
                           <span className="lbl">Matches</span>
                           <span className="val">{displayData.stats.overall[0].value}</span>
                        </div>
                        <div className="summary-item">
                           <span className="lbl">Total Pts</span>
                           <span className="val highlight">{displayData.stats.overall[1].value}</span>
                        </div>
                        <div className="summary-item">
                           <span className="lbl">Avg Pts</span>
                           <span className="val green">{displayData.stats.overall[2].value}</span>
                        </div>
                     </div>

                     <div className="pro-card match-history-list">
                        <h3 className="card-title">Recent Form</h3>
                        {displayData.matches && displayData.matches.length > 0 ? (
                           displayData.matches.slice(0, 5).map((m: any) => (
                             <div key={m.id} className="history-row">
                                <div className="history-team">vs {m.opponent}</div>
                                <div className="history-pts">{m.raidPts + m.tacklePts} pts</div>
                                <div className={`history-result ${m.result.toLowerCase().includes('won') ? 'win' : 'loss'}`}>
                                   {m.result.toLowerCase().includes('won') ? 'W' : (m.result.toLowerCase().includes('played') ? '-' : 'L')}
                                </div>
                             </div>
                           ))
                        ) : (
                           <div className="empty-state" style={{color:'#94a3b8', fontSize:'14px', textAlign:'center', padding:'20px 0'}}>
                              No official match data linked yet.
                           </div>
                        )}
                        <button className="view-more-btn" onClick={() => setActiveTab('matches')}>View All History</button>
                     </div>
                  </div>

                  <div className="pro-right-column">
                     <div className="pro-card id-card">
                        <div className="id-card-header">Official Player Identity</div>
                        <div className="id-badge">
                           <span className="id-pulse" />
                           <span className="id-text">{displayData.player_id || 'Not Assigned'}</span>
                        </div>
                        <p className="id-hint">Share this ID for professional tournament registrations.</p>
                        <button className="id-share-btn" onClick={() => setShowQR(true)}>
                           <Share2 size={16} /> Get ID QR Code
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'stats' && (
             <div className="pro-stats-detailed">
                <div className="pro-split-grid">
                   <div className="pro-card">
                      <h3 className="card-title">Attacking Stats</h3>
                      {displayData.stats.attacking.map((s: any) => (
                        <div key={s.label} className="stat-detail-item">
                           <span className="lbl">{s.label}</span>
                           <span className="val">{s.value}</span>
                        </div>
                      ))}
                   </div>
                   <div className="pro-card">
                      <h3 className="card-title">Defensive Stats</h3>
                      {displayData.stats.defensive.map((s: any) => (
                        <div key={s.label} className="stat-detail-item">
                           <span className="lbl">{s.label}</span>
                           <span className="val">{s.value}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'matches' && (
             <div className="pro-matches-tab">
                {displayData.matches.length === 0 && (
                   <div className="pro-card" style={{textAlign:'center', color:'#64748b'}}>No match records found.</div>
                )}
                {displayData.matches.map((m: any) => (
                   <div key={m.id} className="pro-match-card">
                      <div className="m-date">{m.date}</div>
                      <div className="m-teams">vs {m.opponent}</div>
                      <div className="m-stats">
                         <span>Raid: {m.raidPts}</span>
                         <span>Tackle: {m.tacklePts}</span>
                      </div>
                      <div className={`m-result ${m.result.toLowerCase().includes('won') ? 'win' : 'loss'}`}>
                        {m.result}
                      </div>
                   </div>
                ))}
             </div>
          )}

          {activeTab === 'achievements' && (
             <div className="pro-card" style={{textAlign:'center', padding:'40px', color:'#64748b'}}>
               <Trophy size={48} color="#e2e8f0" style={{marginBottom: '16px'}} />
               <h3>No Awards Yet</h3>
               <p>Compete in official tournaments to earn MVP, Best Raider, and Defender awards.</p>
             </div>
          )}
        </div>

        {showQR && (
          <QRCodeModal 
            displayName={displayData.name}
            playerId={displayData.player_id || displayData.id}
            onClose={() => setShowQR(false)}
          />
        )}
      </div>
    </div>
  );
}
