import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  LogIn, 
  UserPlus,
  Chrome,
  Github,
  AlertCircle
} from 'lucide-react';
import { 
  signInWithGoogle, 
  signInWithGithub,
  signInWithEmail, 
  signUpWithEmail,
  handleRedirectResult
} from '../lib/firebase';

interface AuthViewProps {
  onSuccess: () => void;
}

export default function AuthView({ onSuccess }: AuthViewProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for redirect result on mount
    handleRedirectResult().then(user => {
      if (user) {
        onSuccess();
      }
    }).catch(err => {
      console.error("Redirect handler error:", err);
      // We don't necessarily show an error here as it might just be the initial page load
    });
  }, [onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onSuccess();
      } else {
        setError('Compatibility mode: Redirecting to Google...');
        // The page will redirect shortly handled by firebase.ts
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setLoading(false);
      if (err.message?.includes('auth/unauthorized-domain')) {
        setError('Unauthorized domain. Please add this domain to Firebase Console > Auth > Settings > Authorized domains.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup blocked. We are attempting to redirect you instead...');
      } else {
        setError(err.message || 'Google authentication failed.');
      }
    }
  };

  const handleGithubAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await signInWithGithub();
      if (user) {
        onSuccess();
      } else {
        setError('Compatibility mode: Redirecting to GitHub...');
      }
    } catch (err: any) {
      console.error("GitHub Auth Error:", err);
      setLoading(false);
      if (err.message?.includes('auth/unauthorized-domain')) {
        setError('Unauthorized domain. Please add this domain to Firebase Console > Auth > Settings > Authorized domains.');
      } else {
        setError(err.message || 'GitHub authentication failed.');
      }
    }
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
             <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
               {mode === 'signin' ? 'Welcome Back' : 'Join the Ummah'}
             </h2>
             <p className="text-slate-500 font-medium text-sm">
               {mode === 'signin' ? 'Continue your spiritual journey today.' : 'Begin your journey into the digital sanctuary.'}
             </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 bg-red-500/10 border border-red-500/20 rounded-[2rem] space-y-3"
            >
              <div className="flex items-start gap-3">
                 <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                 <p className="text-red-400 text-xs font-medium leading-relaxed">{error}</p>
              </div>
              
              {(error.includes('missing initial state') || error.includes('Redirect') || error.includes('failed')) && (
                 <div className="pt-2 border-t border-red-500/10 space-y-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Median App Solution:</p>
                    <ul className="text-[10px] text-slate-400 space-y-1 list-disc pl-4 font-medium">
                       <li>Add <code className="text-brand-primary">median.co</code> to your Firebase Authorized Domains.</li>
                       <li>Disable "Block All Cookies" in mobile browser settings.</li>
                       <li>Use the **Email & Password** login below for 100% stability.</li>
                    </ul>
                 </div>
              )}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., ibrahim@example.com"
                  className="w-full bg-brand-depth/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-medium outline-none focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-brand-depth/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-medium outline-none focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5 transition-all"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-brand-primary text-brand-depth font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 group"
            >
              {loading ? 'Authenticating...' : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  {mode === 'signin' ? <LogIn size={20} className="group-hover:translate-x-1 transition-transform" /> : <UserPlus size={20} className="group-hover:translate-x-1 transition-transform" />}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative py-4">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
             <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-brand-sidebar px-4 text-slate-600">Or continue with</span>
             </div>
          </div>

          {/* Auth Providers */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleAuth}
              className="bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98]"
            >
               <Chrome size={18} className="text-brand-primary" />
               <span className="text-xs">Google</span>
            </button>
            <button 
              onClick={handleGithubAuth}
              className="bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98]"
            >
               <Github size={18} className="text-slate-200" />
               <span className="text-xs">GitHub</span>
            </button>
          </div>

          {/* Footer toggle */}
          <div className="text-center">
             <button 
               onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
               className="text-xs font-bold text-slate-500 hover:text-brand-primary transition-colors"
             >
                {mode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
