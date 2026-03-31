import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Trophy,
  AlertCircle
} from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { Button } from '@/shared/components/ui/Button';

export const OtpVerificationScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone');

  const { verifyOtp, loginWithPhone } = useGlobalState();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!phone) {
      navigate('/login');
      return;
    }

    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phone, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.split('').slice(0, 6);
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      if (index + pastedData.length < 6) {
        inputRefs.current[index + pastedData.length]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);

    const timeoutPromise = new Promise<{ success: boolean; error?: string }>((_, reject) => {
      setTimeout(() => reject(new Error('Verification timed out. Please try again.')), 120000);
    });

    try {
      if (phone) {
        console.log('[OtpVerify] Starting verification for:', phone);

        // Race between actual verification and timeout
        const result = await Promise.race([
          verifyOtp(phone, otpString),
          timeoutPromise
        ]) as { success: boolean; error?: string };

        console.log('[OtpVerify] Result:', result);

        if (result.success) {
          localStorage.removeItem('temp_user_name');
          navigate('/auth/success');
        } else {
          setError(result.error || 'Verification failed. Invalid OTP.');
        }
      }
    } catch (err: any) {
      console.error('[OtpVerify] Error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      // Ensure loading state is ALWAYS turned off
      if (inputRefs.current) {
        setLoading(false);
      }
    }
  };

  const handleResend = async () => {
    if (!phone) return;
    setLoading(true);
    const result = await loginWithPhone(phone);
    if (result.success) {
      setTimeLeft(300);
      setCanResend(false);
      setError(null);
      alert('OTP sent successfully!');
    } else {
      setError(result.error || 'Failed to resend OTP.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">

      {/* LEFT PANEL - Functional Form (60% desktop) */}
      <div className="w-full lg:w-[60%] flex flex-col justify-between items-center p-6 sm:p-12 lg:p-16 xl:p-24 relative animate-slide-in-left">

        {/* Top Spacer */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-md">

          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/logo1.png"
              alt="Play Legends"
              className="mb-6 object-contain h-24 md:h-32 w-auto max-w-[280px]"
            />
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Verification Code</h1>
            <p className="text-slate-500 mt-2">
              We sent a 6-digit code to <br />
              <span className="font-semibold text-slate-900">{phone}</span>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* OTP Input Form */}
          <form onSubmit={handleVerify} className="space-y-10 w-full max-w-[360px] mx-auto">
            <div className="flex justify-between gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all bg-slate-50 focus:bg-white shadow-sm"
                  disabled={loading}
                  title={`Digit ${index + 1}`}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xl shadow-blue-600/20 text-lg rounded-2xl group transition-all"
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="animate-spin" size={20} />
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Verify Account
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-slate-500">
              Time remaining: <span className="font-mono font-medium text-slate-700">{formatTime(timeLeft)}</span>
            </p>

            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="flex items-center justify-center w-full gap-2 text-blue-600 font-medium hover:bg-blue-50 p-2 rounded-lg transition-colors"
              >
                <RefreshCw size={16} /> Resend Code
              </button>
            ) : (
              <button disabled className="text-slate-300 flex items-center justify-center w-full gap-2 cursor-not-allowed">
                <RefreshCw size={16} /> Resend Code
              </button>
            )}

            <button
              onClick={() => navigate('/login')}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              Change Phone Number
            </button>
          </div>

        </div>
      </div>

      {/* RIGHT PANEL - Branding & Features (40% desktop) */}
      <div className="hidden lg:flex w-[40%] bg-slate-900 relative overflow-hidden flex-col justify-between p-16 text-white animate-slide-in-right">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <img
            src="/logo1.png"
            alt="Play Legends"
            className="h-24 w-auto object-contain mb-8 brightness-0 invert opacity-90"
          />
        </div>

        <div className="relative z-10 space-y-10">
          <h2 className="text-5xl font-black tracking-tight leading-tight">
            Secure & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Instant Access
            </span>
          </h2>

          <div className="space-y-8 mt-12">
            <FeatureItem
              icon={<ShieldCheck className="h-7 w-7 text-blue-400" />}
              title="Verified Identity"
              description="Secure authentication powered by enterprise-grade protocols."
            />
            <FeatureItem
              icon={<Trophy className="h-7 w-7 text-emerald-400" />}
              title="Full League Access"
              description="Unlock tournament registration and competitive stats tracking."
            />
          </div>
        </div>

        <div className="relative z-10 mt-12">
          {/* ... Testimonial ... */}
        </div>

      </div>
    </div>
  );
};

// Helper Component for Features
const FeatureItem: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex items-start gap-4 group">
    <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-white text-lg">{title}</h3>
      <p className="text-sm text-blue-200/70">{description}</p>
    </div>
  </div>
);
