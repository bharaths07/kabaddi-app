import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';
import { createOrUpdateProfile, uploadAvatar, uploadBanner } from '../shared/lib/auth';
import { Camera, ChevronLeft, Save, Trash2, User, MapPin, Trophy, Shield } from 'lucide-react';
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
  const { user, profile, refreshProfile, signOut } = useAuth();
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

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
  const [bannerPreview, setBannerPreview] = useState<string | null>(profile?.banner_url || null);
  const [bannerFile, setBannerFile]       = useState<File | null>(null);
  const [loading, setLoading]             = useState(false);
  const [changed, setChanged]             = useState(false);
  const [toast, setToast]                 = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

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
      setBannerPreview(profile.banner_url || null);
    }
  }, [profile]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const handleChange = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setChanged(true);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    const r = new FileReader();
    r.onload = ev => {
      if (type === 'avatar') {
        setAvatarFile(f);
        setAvatarPreview(ev.target?.result as string);
      } else {
        setBannerFile(f);
        setBannerPreview(ev.target?.result as string);
      }
    };
    r.readAsDataURL(f);
    setChanged(true);
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) return showToast('Full name is required', 'error');
    
    setLoading(true);
    try {
      let avatar_url = profile?.avatar_url;
      let banner_url = (profile as any)?.banner_url;

      if (avatarFile && user?.id) avatar_url = await uploadAvatar(user.id, avatarFile);
      if (bannerFile && user?.id) banner_url = await uploadBanner(user.id, bannerFile);

      await createOrUpdateProfile(user?.id || 'local', {
        full_name:      form.fullName.trim(),
        phone:          form.phone     || undefined,
        email:          form.email     || undefined,
        city:           form.city.trim(),
        state:          form.state,
        avatar_url,
        banner_url,
        role:           form.role,
        team_name:      form.teamName,
        jersey_number:  form.jerseyNo,
        bio:            form.bio,
        date_of_birth:  form.dob       || undefined,
        is_profile_complete: true,
      });

      await refreshProfile();
      setChanged(false);
      showToast('Profile saved successfully!');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (err: any) {
      showToast(err.message || 'Failed to save.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This action is permanent and will remove all your data.');
    if (confirmed) {
      setLoading(true);
      try {
        await signOut();
        alert('Your account deletion request has been submitted. You will be signed out now.');
        navigate('/intro');
      } catch (err: any) {
        showToast('Error signing out: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="ep-page">
      {toast && (
        <div className={`ep-toast ep-toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Modern Header */}
      <div className="ep-header">
        <button className="ep-back-btn" onClick={() => navigate('/profile')}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="ep-title">Edit Profile</h1>
        <button 
          className={`ep-save-btn ${changed ? 'active' : ''}`}
          onClick={handleSave}
          disabled={loading || !changed}
        >
          {loading ? '...' : <Save size={20} />}
        </button>
      </div>

      <div className="ep-content">
        
        {/* Banner & Avatar Section */}
        <div className="ep-visuals">
          <div 
            className="ep-banner-preview" 
            style={{ backgroundImage: bannerPreview ? `url(${bannerPreview})` : 'linear-gradient(135deg, #FF6B00, #FFB800)' }}
            onClick={() => bannerRef.current?.click()}
          >
            <div className="ep-overlay"><Camera size={24} /></div>
            <input type="file" ref={bannerRef} hidden onChange={e => handleFile(e, 'banner')}/>
          </div>
          
          <div className="ep-avatar-row">
            <div className="ep-avatar-preview" onClick={() => avatarRef.current?.click()}>
              {avatarPreview ? <img src={avatarPreview} alt="me"/> : <div className="ep-ini">{form.fullName[0] || 'P'}</div>}
              <div className="ep-avatar-overlay"><Camera size={16} /></div>
              <input type="file" ref={avatarRef} hidden onChange={e => handleFile(e, 'avatar')}/>
            </div>
          </div>
        </div>

        {/* Identity (Read Only) */}
        {profile?.player_id && (
          <div className="ep-section-card id-card">
            <div className="ep-card-label">Official Player ID</div>
            <div className="ep-id-val">{profile.player_id}</div>
          </div>
        )}

        {/* Form Sections */}
        <div className="ep-sections">
          
          <div className="ep-section-card">
            <h3 className="ep-section-title"><User size={18}/> Personal Details</h3>
            <div className="ep-input-group">
              <label>Full Name</label>
              <input value={form.fullName} onChange={handleChange('fullName')} placeholder="Ayan Lohchab"/>
            </div>
            <div className="ep-grid">
              <div className="ep-input-group">
                <label>Phone</label>
                <input value={form.phone} onChange={handleChange('phone')} placeholder="9876543210"/>
              </div>
              <div className="ep-input-group">
                <label>Email</label>
                <input value={form.email} onChange={handleChange('email')} placeholder="ayan@example.com"/>
              </div>
            </div>
          </div>

          <div className="ep-section-card">
            <h3 className="ep-section-title"><MapPin size={18}/> Location</h3>
            <div className="ep-grid">
              <div className="ep-input-group">
                <label>City</label>
                <input value={form.city} onChange={handleChange('city')} placeholder="Jaipur"/>
              </div>
              <div className="ep-input-group">
                <label>State</label>
                <select value={form.state} onChange={handleChange('state')}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="ep-section-card">
            <h3 className="ep-section-title"><Shield size={18}/> Professional Stats</h3>
            <div className="ep-grid">
              <div className="ep-input-group">
                <label>Role</label>
                <select value={form.role} onChange={handleChange('role')}>
                  <option value="">Select Role</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="ep-input-group">
                <label>Jersey #</label>
                <input type="number" value={form.jerseyNo} onChange={handleChange('jerseyNo')} placeholder="31"/>
              </div>
            </div>
            <div className="ep-input-group">
              <label>Current Team / Club</label>
              <input value={form.teamName} onChange={handleChange('teamName')} placeholder="Jaipur Warriors"/>
            </div>
          </div>

          <div className="ep-section-card">
            <h3 className="ep-section-title"><Trophy size={18}/> About You</h3>
            <div className="ep-input-group">
              <label>Bio</label>
              <textarea 
                value={form.bio} 
                onChange={handleChange('bio')} 
                placeholder="Share your Kabaddi journey..."
                maxLength={180}
              />
              <div className="ep-char">{form.bio.length}/180</div>
            </div>
          </div>

          <button className="ep-delete-btn" onClick={handleDeleteAccount} disabled={loading}>
            <Trash2 size={18} /> {loading ? 'Processing...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
