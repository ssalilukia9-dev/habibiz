import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { db, auth } from '../lib/firebase.ts';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile, User as FirebaseUser } from 'firebase/auth';
import { notificationService } from '../services/notificationService';

import { apiFetch } from '../lib/api';

interface OnboardingViewProps {
  user: FirebaseUser;
  onComplete: () => void;
}

export default function OnboardingView({ user, onComplete }: OnboardingViewProps) {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [photoURL] = useState(user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  const generateBio = async () => {
    if (!displayName) return;
    setIsGeneratingBio(true);
    try {
      const response = await apiFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Generate a short (max 15 words), poetic, spiritual bio for a person named ${displayName} who is starting their journey in a digital sanctuary app. Return only the bio text.` }] }],
          systemInstruction: "You are a specialized spiritual bio generator. Output only the bio, no quotes."
        })
      });
      const data = await response.json();
      if (data.text) {
        setBio(data.text.trim());
      }
    } catch (e) {
      console.error("Bio generation failed", e);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleFinish = async () => {
    if (!displayName.trim()) {
      setError("Please enter your name to continue.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. Update Auth Profile
      await updateProfile(user, {
        displayName,
        photoURL
      });

      // 2. Create Firestore Record
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        displayName,
        photoURL,
        bio,
        email: user.email || '',
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        isPremium: false,
        hasanat: 0,
        onboardingCompleted: true
      });

      notificationService.notify('Welcome to Sanctuary', `Peace be upon you, ${displayName}. Your profile is ready.`, 'system');
      onComplete();
    } catch (err: any) {
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-brand-depth overflow-y-auto overflow-x-hidden pt-20 pb-20">
      <div className="absolute inset-0 bg-brand-primary/5 blur-[150px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-2xl glass-panel-purple border-brand-primary/30 rounded-[3rem] p-8 md:p-12 shadow-2xl relative z-10"
      >
        {/* Progress Bar */}
        <div className="flex gap-2 mb-12">
          {[1, 2].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden`}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: step >= i ? '100%' : '0%' }}
                className="h-full bg-brand-primary"
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mx-auto mb-6">
                  <UserIcon size={32} />
                </div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Your Sacred Identity</h2>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Step 1: Manifestation</p>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-4">Your Name</label>
                    <input 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g., Ibrahim"
                      className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-brand-primary transition-all font-medium"
                    />
                 </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold">
                   <AlertCircle size={16} />
                   {error}
                </div>
              )}

              <button 
                onClick={() => {
                  if (displayName.trim()) setStep(2);
                  else setError("Please enter your name.");
                }}
                className="w-full py-5 bg-brand-primary text-brand-depth rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 group"
              >
                 Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mx-auto mb-6">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Spiritual Essence</h2>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Step 2: Intention</p>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex items-center justify-between pl-4 pr-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Divine Bio</label>
                       <button 
                        onClick={generateBio}
                        disabled={isGeneratingBio}
                        className="flex items-center gap-1.5 text-[8px] font-black text-brand-primary uppercase tracking-widest hover:text-white transition-colors"
                       >
                         <Sparkles size={10} className={isGeneratingBio ? 'animate-spin' : ''} />
                         {isGeneratingBio ? 'Refining...' : 'AI Spirit Generate'}
                       </button>
                    </div>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="In a few words, what brings you to the sanctuary?"
                      className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-brand-primary transition-all font-medium resize-none h-32 text-sm leading-relaxed"
                    />
                 </div>
              </div>

              <div className="p-6 bg-brand-primary/5 border border-brand-primary/10 rounded-3xl space-y-3">
                 <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Ummah Code of Peace</h4>
                 <div className="flex items-start gap-3">
                    <div className="mt-1"><CheckCircle2 size={12} className="text-brand-primary" /></div>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-widest">I commit to respect, kindness, and spiritual growth within this community.</p>
                 </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold">
                   <AlertCircle size={16} />
                   {error}
                </div>
              )}

              <div className="flex gap-4">
                 <button 
                  onClick={() => setStep(1)}
                  className="px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
                 >
                   Back
                 </button>
                 <button 
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex-1 py-5 bg-brand-primary text-brand-depth rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all group"
                 >
                   {loading ? 'Manifesting Identity...' : 'Enter Sanctuary'}
                   {!loading && <CheckCircle2 size={18} />}
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function XCircle({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
