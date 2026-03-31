import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export const PlaceholderScreen: React.FC = () => {
  const location = useLocation();
  const title = location.pathname.substring(1).replace(/-/g, ' ').toUpperCase();

  return (
    <div className="max-w-[600px] mx-auto p-10 px-5 text-center">
      <div className="text-5xl mb-5">🚧</div>
      <h2 className="mb-2 capitalize">{title || 'Page'}</h2>
      <p className="text-slate-600 mb-7">
        This is a placeholder for the <strong>{location.pathname}</strong> route.
        <br />
        It exists to verify the navigation flow contract.
      </p>
      <Link to="/" className="text-primary font-bold">
        Return to Live
      </Link>
    </div>
  );
};
