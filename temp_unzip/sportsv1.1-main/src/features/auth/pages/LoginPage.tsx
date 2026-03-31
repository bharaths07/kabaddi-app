import React, { useState } from 'react';
import { ArrowRight, AlertCircle, Zap, Trophy, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '@/app/AppProviders';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { PhoneCountrySelect, PhoneCountryValue } from '@/shared/components/auth/PhoneCountrySelect';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithPhone } = useGlobalState();
  const [phoneDigits, setPhoneDigits] = useState('');
  const [country, setCountry] = useState<PhoneCountryValue>({ code: 'IN', dialCode: '+91' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapAuthError = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes('invalid token') || lower.includes('invalid otp')) return 'Incorrect OTP. Please check the code.';
    if (lower.includes('token has expired') || lower.includes('expired')) return 'OTP has expired. Please request a new one.';
    if (lower.includes('too many requests')) return 'Too many requests. Please wait before retrying.';
    return message;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phoneDigits) {
      setError('Phone number is required');
      return;
    }

    const digitsOnly = phoneDigits.replace(/\D/g, '');
    const formattedPhone = `${country.dialCode}${digitsOnly}`;

    setIsLoading(true);

    try {
      const result = await loginWithPhone(formattedPhone);

      if (result.success) {
        navigate(`/auth/verify?phone=${encodeURIComponent(formattedPhone)}`);
      } else {
        setError(mapAuthError(result.error || 'Failed to send OTP'));
      }
    } catch (err: any) {
      setError(mapAuthError(err.message || 'An unexpected error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900">

      {/* LEFT PANEL - Functional Form (60% desktop) */}
      <div className="w-full lg:w-[60%] flex flex-col justify-between items-center p-6 sm:p-12 lg:p-16 xl:p-24 relative animate-slide-in-left">

        <div className="flex-1 flex flex-col justify-center w-full max-w-md">

          {/* Logo & Subtitle */}
          <div className="flex flex-col items-center mb-12">
            <img
              src="/logo1.png"
              alt="Play Legends"
              className="mb-6 object-contain h-24 md:h-32 w-auto max-w-[280px]"
            />
            <div className="px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-[0.2em]">
              Your Game Matters
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-500 font-medium">Enter your phone number to access your career.</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="group transition-all">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Country</label>
                <PhoneCountrySelect value={country} onChange={setCountry} />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Mobile Number</label>
                <Input
                  type="tel"
                  placeholder="98765 43210"
                  value={phoneDigits}
                  onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, ''))}
                  className="h-14 text-lg font-bold rounded-2xl border-2 border-slate-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all bg-slate-50 focus:bg-white pl-12"
                  startIcon={Smartphone}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-red-600 text-white font-black hover:bg-red-700 shadow-xl shadow-red-600/20 text-lg rounded-2xl group transition-all mt-4"
              disabled={isLoading || !phoneDigits}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending OTP...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Get Verification Code
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-12 text-center">
            <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">
              Back to Home
            </button>
          </div>
        </div>

        {/* Dynamic Support Links */}
        <div className="text-xs text-slate-400 font-medium mt-12">
          &copy; 2024 Play Legends. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANEL - Sport Branding (40% desktop) */}
      <div className="hidden lg:flex w-[40%] bg-slate-900 relative overflow-hidden flex-col justify-between p-16 text-white animate-slide-in-right border-l border-white/5">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <img
            src="/logo1.png"
            alt="Play Legends"
            className="h-24 w-auto object-contain mb-8 brightness-0 invert opacity-90"
          />
        </div>

        <div className="relative z-10 space-y-12">
          <div className="space-y-4">
            <h2 className="text-6xl font-black tracking-tighter leading-none italic uppercase">
              Your Game <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                Matters
              </span>
            </h2>
            <p className="text-slate-400 text-lg font-medium max-w-sm leading-relaxed">
              Step onto the professional stage. Track stats, join tournaments, and build your legacy.
            </p>
          </div>

          <div className="space-y-10 mt-16">
            <FeatureItem
              icon={<Zap className="h-7 w-7 text-yellow-400" />}
              title="Real-time Performance"
              description="Capture every high and low with live scoring and advanced analytics."
            />
            <FeatureItem
              icon={<Trophy className="h-7 w-7 text-orange-400" />}
              title="Championship Road"
              description="Manage rosters, schedule matches, and compete for professional glory."
            />
          </div>
        </div>

        <div className="relative z-10 flex gap-6 text-sm text-slate-500 font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-red-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-red-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-red-400 transition-colors">Help</a>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Features
const FeatureItem: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex items-start gap-5 group">
    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:scale-110 transition-all duration-500">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-white text-xl mb-1 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-400 font-medium leading-relaxed">{description}</p>
    </div>
  </div>
);
