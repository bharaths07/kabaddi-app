import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/shared/lib/supabase';

export const AuthCallbackScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/home', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-lg">
      Signing you in...
    </div>
  );
};
