import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyPhoneOTP, sendPhoneOTP } from '../../shared/lib/auth';
import './LoginPage.css';

export default function VerifyOTP() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { phone, from = '/home' } = (location.state as any) || {};

  const [otp, setOtp]       = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [timer, setTimer]     = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no phone in state
  useEffect(() => {
    if (!phone) navigate('/login', { replace: true });
  }, [phone]);

  // 60s countdown
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (otp.every(d => d !== '')) {
      handleVerify(otp.join(''));
    }
  }, [otp]);

  const handleChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await verifyPhoneOTP(phone, code);
      const onboarded = localStorage.getItem('pl.hasOnboarded') === '1';
      navigate(onboarded ? '/home' : '/onboarding', { replace: true });
    } catch (err: any) {
      setError('Invalid or expired OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setCanResend(false);
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    inputs.current[0]?.focus();
    try {
      await sendPhoneOTP(phone);
    } catch (err: any) {
      setError('Failed to resend OTP. Please try again.');
      setCanResend(true);
    }
  };

  const maskedPhone = phone
    ? phone.replace(/(\+91)(\d{2})(\d{4})(\d{4})/, '$1 $2** **** $4')
    : '';

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

        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
            fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito,sans-serif',
            fontWeight: 700, padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ← Back
        </button>

        <h1 className="auth-heading">Enter OTP</h1>
        <p className="auth-subheading">
          Sent to <span style={{ color: '#0ea5e9', fontWeight: 700 }}>{maskedPhone}</span>
        </p>

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* 6-digit OTP grid */}
        <div className="otp-grid">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputs.current[i] = el; }}
              className={`otp-cell${digit ? ' filled' : ''}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              onPaste={handlePaste}
              autoFocus={i === 0}
              disabled={loading}
            />
          ))}
        </div>

        <button
          className="auth-btn"
          onClick={() => handleVerify(otp.join(''))}
          disabled={loading || otp.some(d => !d)}
        >
          {loading ? <span className="auth-spinner" /> : 'Verify & Continue →'}
        </button>

        {/* Resend */}
        <div className="resend-row" style={{ marginTop: 16 }}>
          {canResend ? (
            <>
              Didn't get it?{' '}
              <button className="resend-btn" onClick={handleResend}>
                Resend OTP
              </button>
            </>
          ) : (
            <>
              Resend OTP in{' '}
              <span style={{ color: '#0ea5e9', fontWeight: 700 }}>{timer}s</span>
            </>
          )}
        </div>

        {/* Testing note */}
        {import.meta.env.DEV && (
          <div style={{
            marginTop: 20,
            background: 'rgba(14,165,233,0.08)',
            border: '1px solid rgba(14,165,233,0.2)',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'Nunito,sans-serif',
            lineHeight: 1.6,
          }}>
            🧪 <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Testing:</strong>{' '}
            In Supabase Dashboard → Auth → Settings → disable "Enable phone confirmations" → use OTP <code style={{ color: '#0ea5e9' }}>123456</code>
          </div>
        )}
      </div>
    </div>
  );
}
