import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { sendPhoneOTP, signInWithEmail, signInWithGoogle } from '../../shared/lib/auth';
import { useAuth } from '../../shared/context/AuthContext';
import './LoginPage.css';

type Tab = 'phone' | 'email';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const from = (location.state as any)?.from?.pathname || '/home';

  const [tab, setTab]           = useState<Tab>('phone');
  const [phone, setPhone]       = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => { if (user) navigate(from, { replace: true }); }, [user]);

  const handlePhone = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) { setError('Enter a valid 10-digit mobile number'); return; }
    const formatted = `+91${cleaned.slice(-10)}`;
    setLoading(true);
    try {
      await sendPhoneOTP(formatted);
      navigate('/verify-otp', { state: { phone: formatted, from } });
    } catch (err: any) { setError(err.message || 'Failed to send OTP. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!email.includes('@')) { setError('Enter a valid email address'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      const onboarded = localStorage.getItem('pl.hasOnboarded') === '1';
      navigate(onboarded ? '/home' : '/onboarding', { replace: true });
    } catch (err: any) {
      setError(err.message?.includes('Invalid') ? 'Wrong email or password.' : err.message || 'Login failed.');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setError(''); setGLoading(true);
    try { 
      const res = await signInWithGoogle(); 
      if ((res as any)?.redirectTo) {
        navigate((res as any).redirectTo, { replace: true });
      }
    }
    catch (err: any) { setError(err.message || 'Google sign-in failed.'); setGLoading(false); }
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
            <div className="auth-logo-title">KabaddiPulse</div>
            <div className="auth-logo-sub">Kabaddi Tournament Platform</div>
          </div>
        </div>
        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subheading">Sign in to continue</p>
        <div className="auth-tabs">
          {(['phone','email'] as Tab[]).map(t => (
            <button key={t} className={`auth-tab ${tab===t?'auth-tab-active':''}`}
              onClick={() => { setTab(t); setError(''); }}>
              {t==='phone' ? '📱 Phone' : '✉️ Email'}
            </button>
          ))}
        </div>
        {error && <div className="auth-error"><span>⚠️</span> {error}</div>}
        {tab==='phone' && (
          <form onSubmit={handlePhone}>
            <div className="auth-input-group">
              <label className="auth-label">Mobile Number</label>
              <div className="auth-input-wrap">
                <span className="auth-prefix">+91</span>
                <input className="auth-input has-prefix" type="tel" placeholder="9876543210"
                  value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} autoFocus />
              </div>
            </div>
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner"/> : 'Send OTP →'}
            </button>
          </form>
        )}
        {tab==='email' && (
          <form onSubmit={handleEmail}>
            <div className="auth-input-group">
              <label className="auth-label">Email Address</label>
              <input className="auth-input" type="email" placeholder="you@example.com"
                value={email} onChange={e=>setEmail(e.target.value)} autoFocus />
            </div>
            <div className="auth-input-group">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <input className="auth-input" type={showPass?'text':'password'} placeholder="••••••••"
                  value={password} onChange={e=>setPassword(e.target.value)} style={{paddingRight:44}} />
                <button type="button" className="auth-input-suffix" onClick={()=>setShowPass(p=>!p)} tabIndex={-1}>
                  {showPass?'🙈':'👁️'}
                </button>
              </div>
            </div>
            <div style={{textAlign:'right',marginBottom:16,marginTop:-8}}>
              <Link to="/forgot-password" className="auth-link" style={{fontSize:12}}>Forgot password?</Link>
            </div>
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner"/> : 'Sign In →'}
            </button>
            <div className="auth-link-row">No account? <Link to="/signup" className="auth-link">Create one</Link></div>
          </form>
        )}
        <div className="auth-divider">
          <div className="auth-divider-line"/><span className="auth-divider-text">or continue with</span><div className="auth-divider-line"/>
        </div>
        <button className="auth-btn-google" onClick={handleGoogle} disabled={gLoading}>
          {gLoading ? <span className="auth-spinner"/> : (
            <><svg style={{width:18,height:18}} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>Continue with Google</>
          )}
        </button>
      </div>
    </div>
  );
}
