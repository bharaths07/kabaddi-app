import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../shared/lib/supabase';
import { getDevAuthUser } from '../../shared/lib/auth';

// Google OAuth lands here after redirect
// Supabase handles session automatically — we just redirect
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session || getDevAuthUser()) {
          const onboarded = localStorage.getItem('pl.hasOnboarded') === '1';
          navigate(onboarded ? '/home' : '/onboarding', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } catch {
        const onboarded = localStorage.getItem('pl.hasOnboarded') === '1';
        navigate(onboarded ? '/home' : '/onboarding', { replace: true });
      }
    })();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0c1832',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 44, height: 44,
        borderRadius: '50%',
        border: '3px solid rgba(14,165,233,0.15)',
        borderTopColor: '#0ea5e9',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{
        color: 'rgba(255,255,255,0.35)',
        fontFamily: 'Nunito, sans-serif',
        fontSize: 14,
      }}>
        Signing you in...
      </span>
    </div>
  );
}
