import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Card } from '@/shared/components/ui/Card';

export const AuthSuccessScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <PageContainer className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md p-12 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Login Successful!</h1>
        <p className="text-slate-500">Redirecting you to the home screen...</p>
      </Card>
    </PageContainer>
  );
};
