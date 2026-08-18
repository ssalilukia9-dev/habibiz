import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  ArrowRight, 
  AlertCircle,
  Sparkles,
  UserCheck,
  User,
  RefreshCw,
  Moon,
  HelpCircle,
  Compass,
  CheckCircle2,
  Zap,
  Globe
} from 'lucide-react';
import { 
  signInAnon,
  signInWithGoogle,
  signInWithGithub,
  handleRedirectResult
} from '../lib/firebase';
import kaabaDuaThemeBg from '../assets/images/kaaba_dua_theme_bg_1786900551467.jpg';

interface AuthViewProps {
  onSuccess: () => void;
}

export default function AuthView({ onSuccess }: AuthViewProps) {
  const [email, setEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSavedEmail, setIsSavedEmail] = useState(false);

  useEffect(() => {
    // Check URL parameters for preloaded invitation data
    const params = new URLSearchParams(window.location.search);
    const inviteEmail = params.get('invite_email') || params.get('email');
    const inviteName = params.get('invite_name') || params.get('name');
    
    if (inviteEmail) {
      setEmail(inviteEmail.trim().toLowerCase());
      setIsSavedEmail(false);
      localStorage.setItem('saved-auth-email', inviteEmail.trim().toLowerCase());
      if (inviteName) {
        setGuestName(inviteName);
        localStorage.setItem('temp_onboarding_name', inviteName);
      }
    } else {
      const saved = localStorage.getItem('saved-auth-email');
      if (saved) {
        setEmail(saved);
        setIsSavedEmail(true);
      }
    }
  }, []);

  useEffect(() => {
    // Check if returning from a redirect auth flow
    const checkRedirect = async () => {
      try {
        setLoading(true);
        const user = await handleRedirectResult();
        if (user) {
          onSuccess();
        }
      } catch (err: any) {
        console.warn("Redirect auth info:", err);
      } finally {
        setLoading(false);
      }
    };
    checkRedirect();
  }, [onSuccess]);

  // Fast Instant Sign-In with Email
  const handleFastEmailJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your email address to enter the sanctuary.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email format (e.g., name@domain.com).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      localStorage.setItem('saved-auth-email', email.trim().toLowerCase());

      const user = await signInAnon();
      if (user) {
        localStorage.setItem(`user_email_${user.uid}`, email.trim().toLowerCase());
        onSuccess();
      }
    } catch (err: any) {
      console.warn("Direct Firebase anonymous sign in failed, creating instant local session:", err);
      const fallbackLocalUid = 'local_' + Math.random().toString(36).substring(2, 11);
      const syntheticUser = {
        uid: fallbackLocalUid,
        email: email.trim().toLowerCase(),
        displayName: guestName.trim() || email.split('@')[0] || 'Sanctuary Soul',
        isAnonymous: true
      };
      localStorage.setItem('sanctuary_local_user', JSON.stringify(syntheticUser));
      localStorage.setItem(`user_email_${fallbackLocalUid}`, email.trim().toLowerCase());
      window.dispatchEvent(new CustomEvent('sanctuary_auth_state_change', { detail: { user: syntheticUser } }));
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  // 1-Tap Fast Guest Entry
  const handleFastGuestAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await signInAnon();
      if (user) {
        onSuccess();
      }
    } catch (err: any) {
      console.warn("Using offline instant session:", err);
      const fallbackLocalUid = 'local_' + Math.random().toString(36).substring(2, 11);
      const syntheticUser = {
        uid: fallbackLocalUid,
        email: null,
        displayName: guestName.trim() || 'Spiritual Pilgrim',
        isAnonymous: true
      };
      localStorage.setItem('sanctuary_local_user', JSON.stringify(syntheticUser));
      window.dispatchEvent(new CustomEvent('sanctuary_auth_state_change', { detail: { user: syntheticUser } }));
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  // Google Social Sign In
  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error("Google Auth failed:", err);
      setError(err.message || "Google authentication failed. Please try Fast 1-Tap entry below.");
    } finally {
      setLoading(false);
    }
  };

  // GitHub Social Sign In
  const handleGithubSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGithub();
      onSuccess();
    } catch (err: any) {
      console.error("GitHub Auth failed:", err);
      setError(err.message || "GitHub authentication failed. Please try Fast 1-Tap entry below.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Spiritual Kaaba Dua Ambient Background */}
      <div 
        className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-30 scale-105 transform-gpu z-0"
        style={{ backgroundImage: `url(${kaabaDuaThemeBg})` }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-brand-depth via-brand-depth/85 to-brand-depth/70 z-0" />

      {/* Main Glassmorphic Auth Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md bg-brand-sidebar/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-6 sm:p-10 shadow-3xl flex flex-col gap-6"
      >
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative w-16 h-16 rounded-3xl bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center shadow-xl shadow-brand-primary/20">
            <Compass size={32} className="text-brand-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">
              Habibi Sanctuary
            </h2>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em]">
              Fast & Social Access
            </p>
          </div>
        </div>

        {/* Error Alert Display */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-2xl text-xs flex items-start gap-3"
            >
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 1: 1-Tap Instant Fast Guest Entry */}
        <div className="space-y-3">
          <button
            onClick={handleFastGuestAccess}
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-brand-primary via-emerald-400 to-teal-300 text-brand-depth font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 group"
          >
            {loading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <>
                <Zap size={16} className="text-brand-depth fill-brand-depth" />
                <span>Instant Fast Entry • 1-Tap</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          <p className="text-[10px] text-center text-slate-400 font-medium">
            Jump in immediately with full access to Quran, Athkar, Duas, and Qibla.
          </p>
        </div>

        {/* SECTION 2: Social Login (Google & GitHub) */}
        <div className="space-y-3">
          <div className="relative flex py-1 items-center justify-center">
            <div className="w-full border-t border-white/10" />
            <span className="bg-brand-sidebar px-3 text-[9px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
              Or Social Sign In
            </span>
            <div className="w-full border-t border-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
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
              onClick={handleGithubSignIn}
              disabled={loading}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-100 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.16 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: Password-Free Email Quick Connect */}
        <form onSubmit={handleFastEmailJoin} className="space-y-4 pt-2 border-t border-white/10">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
              Fast Email Sign-In (No Password Needed)
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={16} />
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 font-medium outline-none focus:border-brand-primary transition-all text-xs"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-white/10 hover:bg-white/15 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-white/15 active:scale-[0.98] transition-all disabled:opacity-50 text-xs uppercase tracking-widest cursor-pointer"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <>
                <span>Enter With Email</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
