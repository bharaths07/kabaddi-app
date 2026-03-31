import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { useGlobalState } from '@/app/AppProviders';
import { Avatar } from '@/shared/components/ui/Avatar';
import { ArrowLeft, Download, Mail, MessageSquare, MoreHorizontal, Copy } from 'lucide-react';

const BACKGROUND_COLORS = [
  'bg-yellow-400',
  'bg-gradient-to-br from-orange-400 to-amber-600',
  'bg-gradient-to-br from-blue-500 to-cyan-400',
  'bg-gradient-to-br from-purple-500 to-pink-500',
  'bg-gradient-to-br from-green-400 to-emerald-600',
  'bg-slate-900',
];

export const MyQRCodeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useGlobalState();
  const [colorIndex, setColorIndex] = useState(0);

  // Fallback if no user (should generally be protected)
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const username = currentUser.username || `user_${currentUser.id.slice(0, 6)}`;
  const profileUrl = `${window.location.origin}/u/${username}`;
  
  const handleBackgroundTap = () => {
    setColorIndex((prev) => (prev + 1) % BACKGROUND_COLORS.length);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <div 
      className={`min-h-screen ${BACKGROUND_COLORS[colorIndex]} transition-colors duration-500 ease-in-out flex flex-col relative`}
      onClick={handleBackgroundTap}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-white z-10">
        <button 
          onClick={(e: any) => { e.stopPropagation(); navigate(-1); }}
          className="p-2 bg-black/20 rounded-full hover:bg-black/30 backdrop-blur-sm transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <button 
           onClick={(e: any) => { e.stopPropagation(); /* Future feature: Toggle card style */ }}
           className="p-2 bg-black/20 rounded-full hover:bg-black/30 backdrop-blur-sm transition-colors"
        >
           <Copy size={24} className="opacity-0" /> {/* Placeholder for balance */}
        </button>
      </div>

      {/* Main Content - Centered Card */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-20">
        
        {/* QR Card */}
          <div 
          className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative flex flex-col items-center animate-in zoom-in-95 duration-300"
          onClick={(e: any) => e.stopPropagation()}
        >
          {/* Avatar floating at top */}
          <div className="-mt-16 mb-4 relative">
             <Avatar 
                src={currentUser.avatarUrl}
                fallback={(currentUser.name || 'U').charAt(0)}
                className="w-20 h-20 border-4 border-white shadow-lg text-2xl"
             />
          </div>

          {/* Username */}
          <h2 className="text-xl font-bold text-slate-900 mb-6">@{username}</h2>

          {/* QR Code */}
          <div className="mb-6 p-2 bg-white rounded-xl">
             <QRCode 
                value={profileUrl} 
                size={200} 
                level="H" // High error correction
                fgColor="#000000"
                bgColor="#FFFFFF"
             />
          </div>

          {/* Helper Text */}
          <p className="text-xs text-slate-500 text-center mb-6 font-medium px-4">
            Share your QR code so others can follow you
          </p>

          {/* Branding Logo */}
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
             <span className="text-2xl">🏅</span>
             <span>Sports Legends</span>
          </div>

        </div>

        {/* Tap Instruction */}
        <p className="text-white/80 text-sm font-medium mt-8 animate-pulse">
          Tap background to change color
        </p>

      </div>

      {/* Bottom Share Sheet */}
      <div 
        className="bg-white rounded-t-3xl p-6 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-20 animate-in slide-in-from-bottom-full duration-500"
        onClick={(e: any) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-slate-900 font-bold text-lg">Share to</h3>
           <button onClick={() => navigate(-1)} className="p-1 hover:bg-slate-100 rounded-full">
              <span className="text-slate-400 font-bold text-xl">×</span>
           </button>
        </div>

        <div className="flex justify-between px-2">
           {/* Download */}
           <button className="flex flex-col items-center gap-2 group" onClick={() => alert('Download feature coming soon!')}>
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 group-hover:bg-slate-200 transition-colors">
                 <Download size={24} />
              </div>
              <span className="text-xs text-slate-500 font-medium">Download</span>
           </button>

           {/* SMS */}
           <button className="flex flex-col items-center gap-2 group" onClick={() => window.open(`sms:?body=Check out my profile on Sports Legends: ${profileUrl}`)}>
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white group-hover:bg-green-600 transition-colors shadow-lg shadow-green-200">
                 <MessageSquare size={24} />
              </div>
              <span className="text-xs text-slate-500 font-medium">SMS</span>
           </button>

           {/* Email */}
           <button className="flex flex-col items-center gap-2 group" onClick={() => window.open(`mailto:?subject=Follow me on Sports Legends&body=Check out my profile here: ${profileUrl}`)}>
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200">
                 <Mail size={24} />
              </div>
              <span className="text-xs text-slate-500 font-medium">Email</span>
           </button>

           {/* Other (Copy Link) */}
           <button className="flex flex-col items-center gap-2 group" onClick={copyLink}>
              <div className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center text-white group-hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200">
                 <MoreHorizontal size={24} />
              </div>
              <span className="text-xs text-slate-500 font-medium">Other</span>
           </button>
        </div>
      </div>

    </div>
  );
};
