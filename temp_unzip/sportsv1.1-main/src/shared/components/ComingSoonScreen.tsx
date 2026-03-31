import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Construction } from 'lucide-react';

interface Props {
  title?: string;
  message?: string;
}

export const ComingSoonScreen: React.FC<Props> = ({ 
  title = "Coming Soon", 
  message = "We are working hard to bring you this feature. Stay tuned!" 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract feature name from path if not provided
  const featureName = title === "Coming Soon" 
    ? location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Feature"
    : title;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">{featureName}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <Construction className="h-10 w-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Under Construction</h2>
        <p className="text-gray-500 max-w-xs mx-auto">
          {message}
        </p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-8 px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};
