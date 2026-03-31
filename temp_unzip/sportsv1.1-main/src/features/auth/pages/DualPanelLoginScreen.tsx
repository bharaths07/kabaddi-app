import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Trophy,
  Zap,
  Smartphone,
  AlertCircle,
  User,
  MessageCircle,
  Globe,
  ChevronDown
} from 'lucide-react';
import { useGlobalState } from '@/app/AppProviders';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

type LoginMethod = 'phone' | 'email';
type PhoneStep = 'select' | 'input';

export const DualPanelLoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithPhone, loginAsGuest, currentUser, users } = useGlobalState();

  // State
  const [method, setMethod] = useState<LoginMethod>('phone');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('select');
  const [isRegistering] = useState(false);

  // Email Auth State
  const [email, setEmail] = useState('');
  const [name, setName] = useState(''); // Used for both Email Register & Phone Login
  const [password, setPassword] = useState('');

  // Phone Auth State
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (currentUser) {
    navigate('/home');
    return null;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (isRegistering && !name) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);

    try {
      // Simulate network delay for effect
      await new Promise(resolve => setTimeout(resolve, 800));

      // Validate based on mode (Mock logic)
      if (users) {
        const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!isRegistering && !existingUser) {
          throw new Error('Account not found. Please create an account.');
        }

        if (isRegistering && existingUser) {
          throw new Error('Account already exists. Please sign in.');
        }
      }

      await login(email, password, isRegistering ? name : undefined);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Regex for basic validation (10-15 digits)
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!phone || !phoneRegex.test(phone)) {
      setError('Please enter a valid phone number (10-15 digits).');
      return;
    }

    // Name is optional for login in this new flow, but we can ask for it if we want registration
    // For now, let's keep it simple as per reference image (just phone)
    // But our backend expects a name for new users. We'll handle that.

    setLoading(true);

    try {
      // Use provided name or default to 'Guest User' if not provided (Reference doesn't show name field)
      // We will ask for name AFTER OTP if it's a new user (in a real flow), 
      // but for now let's use a temporary name or the one entered if we add the field back.
      const tempName = name || 'New Player';
      localStorage.setItem('temp_user_name', tempName);

      const fullPhone = `${countryCode}${phone}`;
      const result = await loginWithPhone(fullPhone);

      if (result.success) {
        navigate(`/auth/verify?phone=${encodeURIComponent(fullPhone)}`);
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Phone login failed.');
      setLoading(false);
    }
  };

  const toggleMethod = () => {
    setMethod(method === 'email' ? 'phone' : 'email');
    setPhoneStep('select'); // Reset phone step
    setError('');
  };



  const handleGuestAccess = () => {
    loginAsGuest();
    navigate('/home');
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">

      {/* LEFT PANEL - Functional Form (60% desktop) */}
      <div className="w-full lg:w-[60%] flex flex-col justify-between items-center p-6 sm:p-12 lg:p-16 xl:p-24 relative animate-slide-in-left">

        {/* Top Spacer */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-md">

          {/* Logo Section (Mobile & Desktop) */}
          <div className="flex flex-col items-center mb-12">
            <img
              src="/logo1.png"
              alt="Play Legends"
              className="mb-6 object-contain h-24 md:h-32 w-auto max-w-[280px]"
            />
            <p className="text-slate-500 text-sm mt-1 font-medium tracking-wide uppercase">
              Your Game Matters
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Main Content Area */}
          {method === 'phone' ? (
            <div className="space-y-6 w-full">

              {/* Country Selector (Always visible in Phone Mode) */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                  <Globe className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 appearance-none cursor-pointer hover:border-slate-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  title="Select Country Code"
                >
                  <option value="+91">India (+91)</option>
                  <option value="+1">United States (+1)</option>
                  <option value="+44">United Kingdom (+44)</option>
                  <option value="+61">Australia (+61)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full absolute"></div>
                <span className="bg-white px-3 text-slate-400 text-sm font-medium relative z-10">Login with</span>
              </div>

              {/* Step 1: Selection Buttons */}
              {phoneStep === 'select' && (
                <div className="space-y-4">
                  <Button
                    className="w-full h-12 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold border-none shadow-md shadow-green-100"
                    onClick={() => setError('WhatsApp login is currently disabled. Please use Mobile Number.')}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    WhatsApp
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-12 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 shadow-sm"
                    onClick={() => setPhoneStep('input')}
                  >
                    <Smartphone className="h-5 w-5 mr-2" />
                    Mobile Number
                  </Button>
                </div>
              )}

              {/* Step 2: Input Field */}
              {phoneStep === 'input' && (
                <form onSubmit={handlePhoneSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-2">
                    {/* We hide name for "Clean" look, or verify if we need it. 
                                    Supabase usually needs a user record. 
                                    Let's include it but make it look subtle or optional-ish?
                                    Actually, for a "Reference Match", we should stick to just phone.
                                    But to make it WORK with our backend that might expect a name...
                                    I'll add it back for now to ensure reliability.
                                */}
                    <div className="relative">
                      <Input
                        placeholder="Full Name (Optional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        startIcon={<User size={18} />}
                      />
                    </div>

                    <div className="relative">
                      <Input
                        type="tel"
                        placeholder="Mobile Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="pl-10"
                        startIcon={<Smartphone size={18} />}
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20"
                    disabled={loading}
                  >
                    {loading ? 'Sending OTP...' : 'Get OTP'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setPhoneStep('select')}
                    className="w-full text-center text-sm text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </form>
              )}

            </div>
          ) : (
            /* EMAIL FORM (Legacy/Alternative) */
            <form onSubmit={handleEmailSubmit} className="space-y-6 w-full animate-in fade-in slide-in-from-right-4">
              {/* ... (Keep existing email form logic but styled simpler) ... */}
              {isRegistering && (
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isRegistering}
                      className="pl-10"
                      startIcon={<User size={18} />}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                    startIcon={<Mail size={18} />}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                    startIcon={<Lock size={18} />}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isRegistering ? 'Creating...' : 'Signing in...'}</span>
                  </div>
                ) : (
                  <span>{isRegistering ? 'Sign Up' : 'Sign In'}</span>
                )}
              </Button>
            </form>
          )}

        </div>

        {/* Bottom Footer Area */}
        <div className="mt-12 w-full flex flex-col items-center space-y-4">
          {/* Guest Link */}
          <button
            onClick={handleGuestAccess}
            className="text-slate-600 font-medium hover:text-slate-900 border-b border-transparent hover:border-slate-900 transition-all pb-0.5"
          >
            Explore as a guest
          </button>

          {/* Switch Method Link */}
          <button
            onClick={toggleMethod}
            className="text-sm text-slate-400 hover:text-slate-600"
          >
            {method === 'phone' ? 'Login with Email' : 'Login with Mobile'}
          </button>

          {/* Terms */}
          <p className="text-xs text-center text-slate-400 max-w-xs leading-relaxed">
            By signing in, you agree to our <a href="#" className="underline hover:text-slate-600">terms of service</a> and <a href="#" className="underline hover:text-slate-600">privacy policy</a>.
          </p>
        </div>

      </div>

      {/* RIGHT PANEL - Branding & Features (40% desktop) */}
      <div className="hidden lg:flex w-[40%] bg-slate-900 relative overflow-hidden flex-col justify-between p-16 text-white animate-slide-in-right">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

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
            Your Game <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              Matters
            </span>
          </h2>

          <div className="space-y-8 mt-12">
            <FeatureItem
              icon={<Zap className="h-7 w-7 text-yellow-400" />}
              title="Real-time Scoring"
              description="Track every ball, every goal, and every point live."
            />
            <FeatureItem
              icon={<Trophy className="h-7 w-7 text-orange-400" />}
              title="Tournament Pro"
              description="Organize and manage professional tournaments with ease."
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
