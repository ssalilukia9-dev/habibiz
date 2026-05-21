import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  ArrowRight, 
  LogIn, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  Heart,
  UserCheck
} from 'lucide-react';
import { 
  signInAnon,
  signInWithGoogle,
  signInWithGithub
} from '../lib/firebase';

interface AuthViewProps {
  onSuccess: () => void;
}

export default function AuthView({ onSuccess }: AuthViewProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSavedEmail, setIsSavedEmail] = useState(false);

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

  const handleOpenInBrowser = () => {
    // Standard URL resolution to guarantee a fresh top-level standalone window
    window.open(window.location.href, '_blank');
  };

  const handleClearSavedEmail = () => {
    localStorage.removeItem('saved-auth-email');
    setEmail('');
    setIsSavedEmail(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 islamic-pattern">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel rounded-[2.5rem] md:rounded-[3.5rem] border-white/10 shadow-2xl overflow-hidden bg-brand-sidebar/40 backdrop-blur-3xl"
      >
        <div className="p-8 md:p-12 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
             <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mx-auto mb-6 shadow-xl shadow-brand-primary/10">
                <LogIn size={32} />
             </div>
             <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight italic">
               The Sanctuary
             </h2>
             <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.25em]">
               Digital Spiritual Haven
             </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
            >
               <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
               <p className="text-red-400 text-xs font-semibold leading-relaxed">{error}</p>
            </motion.div>
          )}

          {/* Option A: Secure Standalone Login */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xs font-black text-brand-primary uppercase tracking-wider">Option A: Secure Firebase Account</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Log in securely to save your persistent cloud account, backup your progress, streaks, bookmarks, and settings.
              </p>
              <p className="text-[10px] text-amber-400/80 font-semibold leading-normal">
                ⚠️ Note: If you are in the preview iframe, click "Unlock in Browser" first to allow Google/GitHub authentication popups to load.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                    setError(err.message || "Google authentication failed. Please make sure you are in a standalone browser tab.");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="bg-white text-brand-depth font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all text-[11px] uppercase tracking-wider disabled:opacity-50"
              >
                <span>Google Login</span>
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
                    setError(err.message || "GitHub authentication failed. Please make sure you are in a standalone browser tab.");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="bg-slate-800 hover:bg-slate-700 text-white font-black py-3 px-4 rounded-xl border border-white/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-[11px] uppercase tracking-wider disabled:opacity-50"
              >
                <span>GitHub Login</span>
              </button>
            </div>

            <a 
              href={window.location.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white/5 border border-white/10 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/15 active:scale-[0.98] transition-all group text-center block text-xs"
            >
              <span>Unlock in Browser Window</span>
              <ExternalLink size={14} className="text-brand-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </a>
          </div>

          {/* Elegant Divider */}
          <div className="relative py-2">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
             <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.25em]">
                <span className="bg-brand-sidebar px-4 text-slate-500">Or Access Instant Profile</span>
             </div>
          </div>

          {/* Option B: Direct Password-free local registration */}
          <form onSubmit={handleInstantJoin} className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {isSavedEmail ? 'Verify Saved Email' : 'Email Address'}
                </label>
                {isSavedEmail && (
                  <button 
                    type="button"
                    onClick={handleClearSavedEmail}
                    className="text-[9px] font-bold text-red-500/80 hover:text-red-400 uppercase tracking-wider"
                  >
                    Use Another Email
                  </button>
                )}
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (isSavedEmail) setIsSavedEmail(false);
                  }}
                  placeholder="e.g., yourname@domain.com"
                  className="w-full bg-brand-depth/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-medium outline-none focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm"
                />
              </div>
              {isSavedEmail && (
                <p className="text-[10px] text-brand-primary/80 font-bold uppercase tracking-wider flex items-center gap-1.5 px-1 bg-brand-primary/5 py-1.5 rounded-lg border border-brand-primary/10">
                  <UserCheck size={12} />
                  Email restored from your last visit
                </p>
              )}
              {!isSavedEmail && (
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed px-1">
                  Provides swift entry. The app remembers your email so you can log back in later and build your custom profile. No password needed!
                </p>
              )}
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-brand-primary text-brand-depth font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/15 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 group text-xs uppercase tracking-widest"
            >
              {loading ? 'Entering Sanctuary...' : (
                <>
                  {isSavedEmail ? 'Resume Profile Journey' : 'Create Profile & Enter'}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
}
