import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
      <div className="w-full max-w-md px-6 py-8">
        {children}
      </div>
    </div>
  );
}
