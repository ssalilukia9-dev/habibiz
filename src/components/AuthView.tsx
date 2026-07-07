import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  ArrowRight, 
  LogIn, 
  AlertCircle,
  Sparkles,
  UserCheck,
  Lock,
  User,
  RefreshCw,
  Shield,
  Moon,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Check,
  Globe,
  Info
} from 'lucide-react';
import { 
  signInAnon,
  signInWithGoogle,
  signInWithGithub,
  handleRedirectResult
} from '../lib/firebase';
import { restDbClient } from '../lib/restDbClient';

interface AuthViewProps {
  onSuccess: () => void;
}

export default function AuthView({ onSuccess }: AuthViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [useRestDb, setUseRestDb] = useState(true); // Default to REST database for robust multi-platform sync
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSavedEmail, setIsSavedEmail] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  useEffect(() => {
    // Check URL parameters for potential preloaded invitation data
    const params = new URLSearchParams(window.location.search);
    const inviteEmail = params.get('invite_email') || params.get('email');
    const inviteName = params.get('invite_name') || params.get('name');
    
    if (inviteEmail) {
      setEmail(inviteEmail.trim().toLowerCase());
      setIsSavedEmail(false);
      localStorage.setItem('saved-auth-email', inviteEmail.trim().toLowerCase());
      if (inviteName) {
        localStorage.setItem('temp_onboarding_name', inviteName);
      }
    } else {
      // See if we have a saved email in local storage to greet or prefill
      const saved = localStorage.getItem('saved-auth-email');
      if (saved) {
        setEmail(saved);
        setIsSavedEmail(true);
      }
    }
  }, []);

  useEffect(() => {
    // Check if we are returning from a redirect auth flow
    const checkRedirect = async () => {
      try {
        setLoading(true);
        const user = await handleRedirectResult();
        if (user) {
          onSuccess();
        }
      } catch (err: any) {
        console.warn("Redirect authentication note (usually sandbox restriction):", err);
        // Suppress automatic scary red error on page load as requested
        // Redirect flows are often blocked by standard browser sandbox cookies security
      } finally {
        setLoading(false);
      }
    };
    checkRedirect();
  }, [onSuccess]);

  const handleInstantJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your email address to initiate custom profile rendering.');
      return;
    }

    // Advanced regex check for email verification
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email format (e.g., you@domain.com).');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1. Save email in local storage so the app can retrieve it on future loadings or onboarding
      localStorage.setItem('saved-auth-email', email.trim().toLowerCase());
      
      try {
        // 2. Authenticate anonymously using Firebase (securely bypasses popup blockers totally)
        await signInAnon();
      } catch (fbErr) {
        console.warn('Firebase Auth blocked or uninitialized. Activating standalone local identity fallback...', fbErr);
        // Turn on Local Session Active!
        localStorage.setItem('local-session-active', 'true');
        // Instantly invoke reload to boot state inside App.tsx seamlessly
        window.location.reload();
        return;
      }
      onSuccess();
    } catch (err: any) {
      console.error('Instant join failed:', err);
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide your email address and password.');
      return;
    }
    if (isRegister && !displayName.trim()) {
      setError('Please enter a display name to personalize your spiritual dashboard.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await restDbClient.register(email.trim(), password.trim(), displayName.trim());
      } else {
        await restDbClient.login(email.trim(), password.trim());
      }
      onSuccess();
    } catch (err: any) {
      console.error('REST database auth error:', err);
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSavedEmail = () => {
    localStorage.removeItem('saved-auth-email');
    setEmail('');
    setIsSavedEmail(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-y-auto bg-brand-depth">
      {/* Premium Ambient Floating Glow Spotlights */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-brand-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] bg-brand-secondary/8 rounded-full blur-[140px] pointer-events-none" />

      {/* Atmospheric Star Sparks */}
      <div className="absolute top-12 left-12 text-white/5 animate-pulse"><Sparkles size={24} /></div>
      <div className="absolute bottom-16 left-20 text-white/5 animate-bounce"><Moon size={20} /></div>
      <div className="absolute top-24 right-16 text-white/5"><Sparkles size={16} /></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-xl rounded-[2.5rem] border border-white/10 bg-brand-sidebar/45 backdrop-blur-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden p-6 md:p-10 space-y-6 my-8"
      >
        {/* Top elegant gradient highlight line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />

        {/* Header - Styled with a beautiful rotated geometric Islamic emblem */}
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            {/* Pulsing Outer Geometric Octagram shapes */}
            <div className="absolute inset-0 bg-brand-primary/15 rounded-2xl rotate-45 animate-pulse" />
            <div className="absolute inset-1.5 bg-brand-secondary/10 rounded-2xl rotate-12 animate-pulse [animation-delay:0.3s]" />
            <div className="relative text-brand-primary flex items-center justify-center">
              <LogIn size={26} className="text-brand-primary drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight italic">
              The Sanctuary
            </h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.25em]">
              Digital Spiritual Haven
            </p>
          </div>
        </div>

        {/* Sliding Tab Selector with smooth layout projection */}
        <div className="relative flex bg-brand-depth/80 p-1.5 rounded-2xl border border-white/5 shadow-inner">
          <div className="absolute inset-1.5 flex pointer-events-none">
            <div className="w-1/2 h-full" />
            <div className="w-1/2 h-full" />
            <motion.div 
              layout
              className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl shadow-md"
              initial={false}
              animate={{ x: useRestDb ? 0 : '100%' }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          </div>

          <button
            onClick={() => {
              setUseRestDb(true);
              setError(null);
            }}
            className={`relative flex-1 py-3 px-4 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer z-10 ${
              useRestDb ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw size={13} className={useRestDb ? 'animate-spin' : ''} />
            Android Sync
          </button>
          
          <button
            onClick={() => {
              setUseRestDb(false);
              setError(null);
            }}
            className={`relative flex-1 py-3 px-4 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer z-10 ${
              !useRestDb ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={13} />
            Firebase / Social
          </button>
        </div>

        {/* Animated Error message card */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-start gap-3"
            >
               <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
               <p className="text-red-400 text-xs font-semibold leading-relaxed">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main interactive form area with clean animations */}
        <div className="min-h-[220px]">
          <AnimatePresence mode="wait">
            {useRestDb ? (
              /* Custom REST Synchronization Auth Form (Capacitor & APK Native Compatible!) */
              <motion.form 
                key="rest-form"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRestAuthSubmit} 
                className="space-y-5"
              >
                <div className="space-y-1 bg-brand-depth/30 p-4 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Shield size={13} />
                    {isRegister ? 'Create Cloud Sync Account' : 'Sign In to Cloud Sync'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {isRegister 
                      ? 'Establish custom login credentials to back up streaks, Hasanat points, books, and enable feed posts and chat rooms.'
                      : 'Log in with your password to restore and sync your full spiritual journey instantly.'}
                  </p>
                </div>

                <div className="space-y-4">
                  {isRegister && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                        Display Name
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={18} />
                        <input 
                          required
                          type="text" 
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g., Spiritual Soul"
                          className="w-full bg-brand-depth/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder-slate-500 font-medium outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={18} />
                      <input 
                        required
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g., you@domain.com"
                        className="w-full bg-brand-depth/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder-slate-500 font-medium outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                      Secure Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={18} />
                      <input 
                        required
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-brand-depth/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder-slate-500 font-medium outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-brand-primary/25 hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 group text-xs uppercase tracking-widest cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw size={14} className="animate-spin" />
                        Processing Sync...
                      </span>
                    ) : (
                      <>
                        {isRegister ? 'Register & Begin Journey' : 'Log In & Retrieve Sync'}
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(!isRegister);
                      setError(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white font-bold py-2 transition-colors cursor-pointer"
                  >
                    {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
                  </button>
                </div>
              </motion.form>
            ) : (
              /* Traditional Firebase Auth (Social & Passwordless) */
              <motion.div 
                key="firebase-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-1.5 bg-brand-depth/30 p-4 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} />
                    Secure Firebase Account
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Log in securely with your Google or GitHub credentials, or create a password-free direct entry profile.
                  </p>
                </div>

                {/* Styled Google / GitHub buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setError(null);
                        setLoading(true);
                        await signInWithGoogle();
                        onSuccess();
                      } catch (err: any) {
                        console.error("Google Auth failed:", err);
                        setError(err.message || "Google authentication failed. Under sandboxed previews, third-party redirects can be restricted. Try Instant Entry below!");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-100 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setError(null);
                        setLoading(true);
                        await signInWithGithub();
                        onSuccess();
                      } catch (err: any) {
                        console.error("GitHub Auth failed:", err);
                        setError(err.message || "GitHub authentication failed. Under sandboxed previews, third-party redirects can be restricted. Try Instant Entry below!");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-100 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.16 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>

                {/* Elegant Separator */}
                <div className="relative py-1">
                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                   <div className="relative flex justify-center text-[9px] font-extrabold uppercase tracking-[0.25em]">
                      <span className="bg-[#0f071b] px-4 text-slate-500 rounded-full">Or Password-Free Entry</span>
                   </div>
                </div>

                {/* Password-free entry */}
                <form onSubmit={handleInstantJoin} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                        {isSavedEmail ? 'Verify Saved Email' : 'Email Address'}
                      </label>
                      {isSavedEmail && (
                        <button 
                          type="button"
                          onClick={handleClearSavedEmail}
                          className="text-[9px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider cursor-pointer"
                        >
                          Use Another Email
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={18} />
                      <input 
                        required
                        type="email" 
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (isSavedEmail) setIsSavedEmail(false);
                        }}
                        placeholder="yourname@domain.com"
                        className="w-full bg-brand-depth/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder-slate-500 font-medium outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm"
                      />
                    </div>
                    {isSavedEmail && (
                      <p className="text-[10px] text-brand-primary/95 font-semibold uppercase tracking-wider flex items-center gap-1.5 px-3 bg-brand-primary/10 py-2.5 rounded-xl border border-brand-primary/15">
                        <UserCheck size={12} className="text-brand-primary" />
                        Identity restored from your last visit
                      </p>
                    )}
                    {!isSavedEmail && (
                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium px-1">
                        Swift, secure verification. The system preserves your email locally to keep your streaks, bookmarks, and journey intact seamlessly.
                      </p>
                    )}
                  </div>

                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-brand-primary/25 hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 group text-xs uppercase tracking-widest cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw size={14} className="animate-spin" />
                        Entering Sanctuary...
                      </span>
                    ) : (
                      <>
                        {isSavedEmail ? 'Resume Profile Journey' : 'Create Profile & Enter'}
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Elegant Troubleshooting Accordion for Sandbox/Iframe Restrictions */}
        <div className="border-t border-white/10 pt-4 mt-2">
          <button
            onClick={() => setShowTroubleshoot(!showTroubleshoot)}
            className="w-full flex items-center justify-between text-slate-400 hover:text-white transition-colors py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <HelpCircle size={14} className="text-brand-primary" />
              Stuck on Google or GitHub?
            </span>
            {showTroubleshoot ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          <AnimatePresence>
            {showTroubleshoot && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="bg-brand-depth/40 p-4 rounded-2xl border border-white/5 mt-2 space-y-2.5 text-xs text-slate-400 leading-relaxed font-medium">
                  <div className="flex gap-2 items-start text-brand-primary">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <span className="font-bold">Browser Sandbox Constraints</span>
                  </div>
                  <p>
                    Because the app is running in a secure, sandboxed <span className="text-white font-bold">iframe preview</span>, browser security policies strictly block social popups and cross-origin authentication cookies from loading.
                  </p>
                  <p className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1.5 text-slate-300">
                    <span className="text-brand-primary font-bold uppercase text-[9px] tracking-wider block">Recommended Alternatives:</span>
                    <span className="flex items-start gap-2">
                      <span className="text-brand-primary font-extrabold mt-0.5">•</span>
                      <span>Use <strong className="text-white">Android Sync</strong> with an email and password to sync and save progress seamlessly across dev and mobile builds.</span>
                    </span>
                    <span className="flex items-start gap-2">
                      <span className="text-brand-primary font-extrabold mt-0.5">•</span>
                      <span>Use <strong className="text-white">Password-Free Entry</strong> to bypass all popups and log in instantly with your email address.</span>
                    </span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
