import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './settings.css'
import { getSettings, updateSettings, syncSettingsToSupabase } from '../shared/state/settingsStore'
import { useAuth } from '../shared/context/AuthContext'

type Tab = 'general' | 'account' | 'privacy' | 'notifications' | 'about'

export default function Settings() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const initial = useMemo(() => getSettings(), [])
  const [theme, setTheme] = useState(initial.theme)
  const [newsRefreshMs, setNewsRefreshMs] = useState(initial.newsRefreshMs)
  const [showLiveHints, setShowLiveHints] = useState(initial.showLiveHints)
  const [notifications, setNotifications] = useState(initial.notifications)
  const [privacy, setPrivacy] = useState(initial.privacy || { publicProfile: true, showHistory: true })

  useEffect(() => { 
    updateSettings({ theme })
    if (user?.id) syncSettingsToSupabase(user.id)
  }, [theme, user?.id])

  useEffect(() => { 
    updateSettings({ newsRefreshMs })
    if (user?.id) syncSettingsToSupabase(user.id)
  }, [newsRefreshMs, user?.id])

  useEffect(() => { 
    updateSettings({ showLiveHints })
    if (user?.id) syncSettingsToSupabase(user.id)
  }, [showLiveHints, user?.id])

  useEffect(() => { 
    updateSettings({ notifications })
    if (user?.id) syncSettingsToSupabase(user.id)
  }, [notifications, user?.id])

  useEffect(() => { 
    updateSettings({ privacy })
    if (user?.id) syncSettingsToSupabase(user.id)
  }, [privacy, user?.id])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="st-content">
            <div className="st-section">
              <div className="st-section-title">Appearance</div>
              <div className="st-field">
                <label className="st-label">Theme</label>
                <div className="st-options">
                  <button className={`st-option ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>Dark Mode</button>
                  <button className={`st-option ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>Light Mode</button>
                </div>
              </div>
            </div>

            <div className="st-section">
              <div className="st-section-title">Match Feed & Notifications</div>
              <div className="st-field">
                <label className="st-label">Auto-refresh interval (ms)</label>
                <input className="st-input" type="number" min={500} step={500} value={newsRefreshMs} onChange={e => setNewsRefreshMs(Number(e.target.value))} />
              </div>
              <div className="st-field">
                <label className="st-toggle">
                  <input type="checkbox" checked={showLiveHints} onChange={e => setShowLiveHints(e.target.checked)} />
                  <span className="st-toggle-text">Show live match score hints</span>
                </label>
              </div>
            </div>
          </div>
        )
      case 'account':
        return (
          <div className="st-content">
            <div className="st-section">
              <div className="st-section-title">Profile Information</div>
              <div className="st-profile-row">
                <div className="st-avatar-large">
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="st-avatar-img" /> : (profile?.full_name?.[0] || 'U')}
                </div>
                <div className="st-profile-info">
                  <div className="st-profile-name">{profile?.full_name || 'Anonymous User'}</div>
                  <div className="st-profile-email">{profile?.email || user?.email || 'No email provided'}</div>
                  <span className="st-badge">Organizer</span>
                </div>
              </div>
              <button className="st-btn-outline" onClick={() => navigate('/profile/edit')}>Edit Profile</button>
            </div>
            <div className="st-section">
              <div className="st-section-title">Account Security</div>
              <button className="st-btn-outline" onClick={() => navigate('/settings/security')}>Change Password</button>
              <button className="st-btn-danger" onClick={handleLogout}>Log Out</button>
            </div>
          </div>
        )
      case 'privacy':
        return (
          <div className="st-content">
            <div className="st-section">
              <div className="st-section-title">Privacy Settings</div>
              <div className="st-field">
                <label className="st-toggle">
                  <input type="checkbox" checked={privacy.publicProfile} onChange={e => setPrivacy(p => ({ ...p, publicProfile: e.target.checked }))} />
                  <span className="st-toggle-text">Make my profile public</span>
                </label>
              </div>
              <div className="st-field">
                <label className="st-toggle">
                  <input type="checkbox" checked={privacy.showHistory} onChange={e => setPrivacy(p => ({ ...p, showHistory: e.target.checked }))} />
                  <span className="st-toggle-text">Show my scoring history</span>
                </label>
              </div>
            </div>
          </div>
        )
      case 'notifications':
        return (
          <div className="st-content">
            <div className="st-section">
              <div className="st-section-title">Notification Settings</div>
              <div className="st-field">
                <label className="st-toggle">
                  <input type="checkbox" checked={notifications.push} onChange={e => setNotifications(n => ({ ...n, push: e.target.checked }))} />
                  <span className="st-toggle-text">Push notifications</span>
                </label>
              </div>
              <div className="st-field">
                <label className="st-toggle">
                  <input type="checkbox" checked={notifications.email} onChange={e => setNotifications(n => ({ ...n, email: e.target.checked }))} />
                  <span className="st-toggle-text">Email notifications</span>
                </label>
              </div>
              <div className="st-field">
                <label className="st-toggle">
                  <input type="checkbox" checked={notifications.sms} onChange={e => setNotifications(n => ({ ...n, sms: e.target.checked }))} />
                  <span className="st-toggle-text">SMS notifications</span>
                </label>
              </div>
            </div>
          </div>
        )
      case 'about':
        return (
          <div className="st-content">
            <div className="st-section">
              <div className="st-section-title">About KabaddiPulse</div>
              <div className="st-about-row">
                <span className="st-label">Version</span>
                <span className="st-value">1.2.4 (Beta)</span>
              </div>
              <div className="st-about-row">
                <span className="st-label">Last Updated</span>
                <span className="st-value">Oct 24, 2025</span>
              </div>
              <button className="st-btn-outline">Check for Updates</button>
            </div>
            <div className="st-section">
              <div className="st-section-title">Support</div>
              <button className="st-btn-outline">Help Center</button>
              <button className="st-btn-outline">Contact Us</button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="st-page">
      <div className="st-header">
        <h1 className="st-title">Settings</h1>
        <div className="st-sub">Manage your profile and app preferences</div>
      </div>

      <div className="st-layout">
        <aside className="st-sidebar">
          <button className={`st-nav-item ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
            <span className="st-nav-icon">⚙️</span> General
          </button>
          <button className={`st-nav-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
            <span className="st-nav-icon">👤</span> Account
          </button>
          <button className={`st-nav-item ${activeTab === 'privacy' ? 'active' : ''}`} onClick={() => setActiveTab('privacy')}>
            <span className="st-nav-icon">🔒</span> Privacy
          </button>
          <button className={`st-nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            <span className="st-nav-icon">🔔</span> Notifications
          </button>
          <button className={`st-nav-item ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
            <span className="st-nav-icon">ℹ️</span> About
          </button>
        </aside>

        <main className="st-main">
          {renderTabContent()}
        </main>
      </div>
    </div>
  )
}

