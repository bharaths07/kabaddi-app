import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';
import { createOrUpdateProfile, uploadAvatar } from '../shared/lib/auth';
import './edit-profile.css';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi',
  'Jammu & Kashmir','Ladakh','Puducherry','Chandigarh',
];

const ROLES = ['Raider', 'Defender', 'All-Rounder', 'Captain', 'Coach'];

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  dob: string;
  city: string;
  state: string;
  role: string;
  teamName: string;
  jerseyNo: string;
  bio: string;
}

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    fullName:  profile?.full_name || '',
    phone:     profile?.phone     || user?.phone || '',
    email:     profile?.email     || user?.email || '',
    dob:       (profile as any)?.date_of_birth || '',
    city:      profile?.city      || '',
    state:     profile?.state     || '',
    role:      (profile as any)?.role || '',
    teamName:  (profile as any)?.team_name || '',
    jerseyNo:  (profile as any)?.jersey_number || '',
    bio:       (profile as any)?.bio || '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [loading, setLoading]             = useState(false);
  const [changed, setChanged]             = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [toast, setToast]                 = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [error, setError]                 = useState('');

  // Reload form if profile loads after mount
  useEffect(() => {
    if (profile) {
      setForm({
        fullName:  profile.full_name  || '',
        phone:     profile.phone      || user?.phone || '',
        email:     profile.email      || user?.email || '',
        dob:       (profile as any).date_of_birth  || '',
        city:      profile.city       || '',
        state:     profile.state      || '',
        role:      (profile as any).role         || '',
        teamName:  (profile as any).team_name    || '',
        jerseyNo:  (profile as any).jersey_number || '',
        bio:       (profile as any).bio          || '',
      });
      setAvatarPreview(profile.avatar_url || null);
    }
  }, [profile]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setChanged(true);
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    const r = new FileReader();
    r.onload = ev => setAvatarPreview(ev.target?.result as string);
    r.readAsDataURL(f);
    setChanged(true);
  };

  const handleSave = async () => {
    setError('');
    if (!form.fullName.trim()) { showToast('Full name is required', 'error'); return; }
    if (!form.city.trim())     { showToast('City is required', 'error'); return; }
    if (!form.state)           { showToast('Please select your state', 'error'); return; }

    setLoading(true);
    try {
      let avatar_url = profile?.avatar_url;
      if (avatarFile && user?.id) {
        avatar_url = await uploadAvatar(user.id, avatarFile);
      }
      await createOrUpdateProfile(user?.id || 'local', {
        full_name:      form.fullName.trim(),
        phone:          form.phone     || undefined,
        email:          form.email     || undefined,
        city:           form.city.trim(),
        state:          form.state,
        avatar_url,
        date_of_birth:  form.dob       || undefined,
        is_profile_complete: true,
      });
      try { await refreshProfile(); } catch {}
      setChanged(false);
      setSaved(true);
      showToast('Profile saved successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to save. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (profile) {
      setForm({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        email: profile.email || '',
        dob: (profile as any).date_of_birth || '',
        city: profile.city || '',
        state: profile.state || '',
        role: (profile as any).role || '',
        teamName: (profile as any).team_name || '',
        jerseyNo: (profile as any).jersey_number || '',
        bio: (profile as any).bio || '',
      });
      setAvatarPreview(profile.avatar_url || null);
      setAvatarFile(null);
    }
    setChanged(false);
    showToast('Changes discarded');
  };

  const initials = form.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PL';

  if (saved) return (
    <div className="ep-success-page">
      <div className="ep-success-card">
        <div className="ep-success-icon">✅</div>
        <h2 className="ep-success-title">Profile Updated!</h2>
        <p className="ep-success-body">Your changes have been saved and are now live on your profile.</p>
        <button className="ep-save-btn ep-save-btn-active" onClick={() => navigate('/profile')}>
          View Profile →
        </button>
        <button className="ep-discard-btn" style={{ marginTop: 10 }} onClick={() => setSaved(false)}>
          Continue Editing
        </button>
      </div>
    </div>
  );

  return (
    <div className="ep-page">
      {/* Toast */}
      {toast && (
        <div className={`ep-toast ep-toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Top bar */}
      <div className="ep-topbar">
        <div className="ep-topbar-inner">
          <div className="ep-topbar-left">
            <button className="ep-back-btn" onClick={() => navigate('/profile')}>←</button>
            <span className="ep-topbar-title">Edit Profile</span>
            {changed && <span className="ep-unsaved-badge">Unsaved changes</span>}
          </div>
          <div className="ep-topbar-actions">
            {changed && (
              <button className="ep-discard-btn" onClick={handleDiscard}>Discard</button>
            )}
            <button
              className={`ep-save-btn ${changed ? 'ep-save-btn-active' : ''}`}
              onClick={handleSave}
              disabled={loading || !changed}
            >
              {loading ? <span className="ep-spinner"/> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="ep-form-wrap">

        {/* Photo */}
        <div className="ep-card">
          <div className="ep-section-title">
            <span className="ep-section-icon">📸</span>
            <div>
              <div className="ep-section-name">Profile Photo</div>
              <div className="ep-section-desc">Appears on your profile, match scorecards and leaderboards</div>
            </div>
          </div>
          <div className="ep-avatar-row">
            <div className="ep-avatar-wrap" onClick={() => fileRef.current?.click()}>
              {avatarPreview
                ? <img src={avatarPreview} className="ep-avatar-img" alt="preview"/>
                : <div className="ep-avatar-initials">{initials}</div>}
              <div className="ep-avatar-camera">📷</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatar}/>
            <div className="ep-avatar-info">
              <button className="ep-upload-btn" onClick={() => fileRef.current?.click()}>
                📷 {avatarPreview ? 'Change Photo' : 'Upload Photo'}
              </button>
              <p className="ep-upload-hint">JPG or PNG · Max 5MB · Face should be clearly visible</p>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="ep-card">
          <div className="ep-section-title">
            <span className="ep-section-icon">👤</span>
            <div>
              <div className="ep-section-name">Personal Information</div>
              <div className="ep-section-desc">Your basic profile details</div>
            </div>
          </div>
          <div className="ep-field">
            <label className="ep-label">Full Name <span className="ep-req">*</span></label>
            <input className="ep-input" type="text" placeholder="e.g. Bharath Gowda"
              value={form.fullName} onChange={set('fullName')}/>
          </div>
          <div className="ep-grid-2">
            <div className="ep-field">
              <label className="ep-label">Phone Number</label>
              <div className="ep-input-wrap">
                <span className="ep-prefix">+91</span>
                <input className="ep-input ep-input-prefix" type="tel" placeholder="9876543210"
                  value={form.phone} onChange={set('phone')}/>
              </div>
              <p className="ep-hint">Used for login — contact support to change</p>
            </div>
            <div className="ep-field">
              <label className="ep-label">Email Address</label>
              <input className="ep-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={set('email')}/>
            </div>
          </div>
          <div className="ep-field">
            <label className="ep-label">Date of Birth</label>
            <input className="ep-input" type="date" value={form.dob} onChange={set('dob')}
              max={new Date().toISOString().split('T')[0]} style={{ colorScheme:'light' }}/>
            <p className="ep-hint">Used for age-group eligibility in tournaments</p>
          </div>
        </div>

        {/* Location */}
        <div className="ep-card">
          <div className="ep-section-title">
            <span className="ep-section-icon">📍</span>
            <div>
              <div className="ep-section-name">Location</div>
              <div className="ep-section-desc">Helps us show you local tournaments near you</div>
            </div>
          </div>
          <div className="ep-grid-2">
            <div className="ep-field">
              <label className="ep-label">City <span className="ep-req">*</span></label>
              <input className="ep-input" type="text" placeholder="e.g. Bengaluru"
                value={form.city} onChange={set('city')}/>
            </div>
            <div className="ep-field">
              <label className="ep-label">State <span className="ep-req">*</span></label>
              <select className="ep-select" value={form.state} onChange={set('state')}>
                <option value="">Select your state</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Kabaddi Info */}
        <div className="ep-card">
          <div className="ep-section-title">
            <span className="ep-section-icon">🏉</span>
            <div>
              <div className="ep-section-name">Kabaddi Details</div>
              <div className="ep-section-desc">Your playing role and team information</div>
            </div>
          </div>
          <div className="ep-grid-2">
            <div className="ep-field">
              <label className="ep-label">Playing Role</label>
              <select className="ep-select" value={form.role} onChange={set('role')}>
                <option value="">Select your role</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="ep-field">
              <label className="ep-label">Jersey Number</label>
              <input className="ep-input" type="number" placeholder="e.g. 7" min="1" max="99"
                value={form.jerseyNo} onChange={set('jerseyNo')}/>
              <p className="ep-hint">Your preferred jersey number</p>
            </div>
          </div>
          <div className="ep-field">
            <label className="ep-label">Team / Club Name</label>
            <input className="ep-input" type="text" placeholder="e.g. SKBC Varadanayakanahalli"
              value={form.teamName} onChange={set('teamName')}/>
            <p className="ep-hint">Your primary team or club</p>
          </div>
        </div>

        {/* Bio */}
        <div className="ep-card">
          <div className="ep-section-title">
            <span className="ep-section-icon">✍️</span>
            <div>
              <div className="ep-section-name">About You</div>
              <div className="ep-section-desc">A short bio that appears on your public profile</div>
            </div>
          </div>
          <div className="ep-field">
            <label className="ep-label">Bio</label>
            <textarea className="ep-textarea" rows={3} maxLength={180}
              placeholder="Tell other players about yourself..."
              value={form.bio} onChange={set('bio')}/>
            <div className="ep-char-count">{form.bio.length}/180</div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="ep-card ep-danger-card">
          <div className="ep-section-title">
            <span className="ep-section-icon">⚠️</span>
            <div>
              <div className="ep-section-name ep-danger-title">Danger Zone</div>
              <div className="ep-section-desc">These actions are permanent and cannot be undone</div>
            </div>
          </div>
          <p className="ep-danger-body">
            Deleting your account is permanent. All your match history, stats and tournament data will be removed.
          </p>
          <button className="ep-danger-btn">🗑️ Delete Account</button>
        </div>

        {/* Mobile save */}
        <button
          className={`ep-save-btn ep-save-btn-full ${changed ? 'ep-save-btn-active' : ''}`}
          onClick={handleSave}
          disabled={loading || !changed}
        >
          {loading
            ? <><span className="ep-spinner"/> Saving...</>
            : changed ? 'Save Changes ✓' : 'No Changes to Save'}
        </button>

      </div>
    </div>
  );
}
