  import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrUpdateProfile, uploadAvatar } from '../../shared/lib/auth';
import { useAuth } from '../../shared/context/AuthContext';
import './LoginPage.css';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman & Nicobar Islands','Chandigarh','Dadra & Nagar Haveli','Daman & Diu',
  'Delhi','Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry',
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Step 1
  const [fullName, setFullName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [email, setEmail]         = useState('');
  const [dob, setDob]             = useState('');

  // Step 2
  const [city, setCity]   = useState('');
  const [state, setState] = useState('');

  // Step 3
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Pre-fill from Google user if available
  const googleName  = user?.user_metadata?.full_name || '';
  const googleEmail = user?.email || '';
  const googlePhone = user?.phone || '';

  const stepLabels = ['Basic Info', 'Location', 'Photo'];

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleNext = async () => {
    setError('');

    if (step === 1) {
      const name = fullName || googleName;
      if (!name.trim()) { setError('Full name is required'); return; }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!city.trim()) { setError('City is required'); return; }
      if (!state)       { setError('Please select your state'); return; }
      setStep(3);
      return;
    }

    // Step 3 — save everything (allow without user in stub mode)
    setLoading(true);
    try {
      let avatarUrl: string | undefined;
      if (avatarFile && user?.id) {
        avatarUrl = await uploadAvatar(user.id, avatarFile);
      }

      await createOrUpdateProfile(user?.id || 'local', {
        full_name:          (fullName || googleName).trim(),
        phone:              phone || googlePhone || undefined,
        email:              email || googleEmail || undefined,
        city:               city.trim(),
        state,
        avatar_url:         avatarUrl,
        date_of_birth:      dob || undefined,
        is_profile_complete: true,
      });

      try { await refreshProfile(); } catch {}
      navigate('/home', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPhoto = async () => {
    setError('');
    setLoading(true);
    try {
      await createOrUpdateProfile(user?.id || 'local', {
        full_name:           (fullName || googleName).trim(),
        phone:               phone || googlePhone || undefined,
        email:               email || googleEmail || undefined,
        city:                city.trim(),
        state,
        date_of_birth:       dob || undefined,
        is_profile_complete: true,
      });
      try { await refreshProfile(); } catch {}
      navigate('/home', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-glow auth-bg-glow-1" />
        <div className="auth-bg-glow auth-bg-glow-2" />
        <div className="auth-bg-grid" />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🏉</div>
          <div>
            <div className="auth-logo-title">Play Legends</div>
            <div className="auth-logo-sub">Set up your profile</div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="ob-steps">
          {stepLabels.map((label, i) => {
            const n = i + 1;
            const isDone   = step > n;
            const isActive = step === n;
            return (
              <div key={n} className={`ob-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                {i < stepLabels.length - 1 && <div className="ob-step-line" />}
                <div className="ob-step-dot">
                  {isDone ? '✓' : n}
                </div>
                <div className="ob-step-label">{label}</div>
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito,sans-serif',
              fontWeight: 700, padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ← Back to Login
          </button>
        )}

        {error && <div className="auth-error"><span>⚠️</span> {error}</div>}

        {/* ── Step 1: Basic Info ── */}
        {step === 1 && (
          <div>
            <div className="auth-input-group">
              <label className="auth-label">Full Name *</label>
              <input
                className="auth-input"
                type="text"
                placeholder="e.g. Bharath Kumar"
                value={fullName || googleName}
                onChange={e => setFullName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="auth-input-group">
              <label className="auth-label">
                Phone Number {!googlePhone && !user?.phone ? '*' : '(optional)'}
              </label>
              <div className="auth-input-wrap">
                <span className="auth-prefix">+91</span>
                <input
                  className="auth-input has-prefix"
                  type="tel"
                  placeholder="9876543210"
                  value={phone || googlePhone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                />
              </div>
            </div>
            <div className="auth-input-group">
              <label className="auth-label">
                Email {!googleEmail ? '(optional)' : ''}
              </label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email || googleEmail}
                onChange={e => setEmail(e.target.value)}
                readOnly={!!googleEmail}
                style={googleEmail ? { opacity: 0.6 } : {}}
              />
            </div>
            <div className="auth-input-group">
              <label className="auth-label">Date of Birth (optional)</label>
              <input
                className="auth-input"
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Location ── */}
        {step === 2 && (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 20, fontFamily: 'Nunito,sans-serif' }}>
              This helps us show you local tournaments and matches near you.
            </p>
            <div className="auth-input-group">
              <label className="auth-label">City *</label>
              <input
                className="auth-input"
                type="text"
                placeholder="e.g. Bengaluru"
                value={city}
                onChange={e => setCity(e.target.value)}
                autoFocus
              />
            </div>
            <div className="auth-input-group">
              <label className="auth-label">State *</label>
              <select
                className="auth-select"
                value={state}
                onChange={e => setState(e.target.value)}
              >
                <option value="">Select your state</option>
                {INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ── Step 3: Photo ── */}
        {step === 3 && (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 12, fontFamily: 'Nunito,sans-serif', textAlign: 'center' }}>
              Add a photo so teammates can recognise you.
            </p>
            <div className="avatar-upload">
              <div
                className="avatar-preview"
                onClick={() => fileRef.current?.click()}
                title="Click to upload photo"
              >
                {avatarPreview
                  ? <img src={avatarPreview} alt="preview" />
                  : '👤'}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatar}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{
                  background: 'rgba(14,165,233,0.12)',
                  border: '1px solid rgba(14,165,233,0.3)',
                  borderRadius: 10,
                  color: '#0ea5e9',
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '8px 18px',
                  cursor: 'pointer',
                  fontFamily: 'Nunito,sans-serif',
                }}
              >
                {avatarPreview ? '📷 Change Photo' : '📷 Upload Photo'}
              </button>
              <p className="avatar-hint">
                JPG or PNG, max 5MB<br />
                Your face should be clearly visible
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {step > 1 && (
            <button
              onClick={() => { setStep(s => s - 1); setError(''); }}
              style={{
                flex: '0 0 auto',
                padding: '13px 18px',
                borderRadius: 13,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'Nunito,sans-serif',
              }}
            >
              ← Back
            </button>
          )}
          <button
            className="auth-btn"
            onClick={handleNext}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading
              ? <span className="auth-spinner" />
              : step === 3
                ? 'Finish & Enter App 🏉'
                : `Next →`}
          </button>
        </div>

        {/* Skip photo option on step 3 */}
        {step === 3 && (
          <button
            onClick={handleSkipPhoto}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 10,
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.35)',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'Nunito,sans-serif',
              fontWeight: 600,
            }}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
