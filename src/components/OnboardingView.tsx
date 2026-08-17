import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Camera,
  XCircle
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import { db, auth } from '../lib/firebase.ts';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile, User as FirebaseUser } from 'firebase/auth';
import { notificationService } from '../services/notificationService';
import { apiFetch } from '../lib/api';
import kaabaDuaThemeBg from '../assets/images/kaaba_dua_theme_bg_1786900551467.jpg';

interface OnboardingViewProps {
  user: FirebaseUser;
  onComplete: () => void;
}

export default function OnboardingView({ user, onComplete }: OnboardingViewProps) {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(user.displayName || (user.email ? user.email.split('@')[0] : ''));
  const [photoURL, setPhotoURL] = useState(user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  // Cropping states
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_setCroppedArea: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    // Resize for firebase safety
    const MAX_SIZE = 400;
    let width = pixelCrop.width;
    let height = pixelCrop.height;

    if (width > MAX_SIZE || height > MAX_SIZE) {
      const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
      width *= ratio;
      height *= ratio;
    }

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      width,
      height
    );

    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setTempImage(reader.result as string);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    try {
      if (tempImage && croppedAreaPixels) {
        const croppedImageBase64 = await getCroppedImg(tempImage, croppedAreaPixels);
        setPhotoURL(croppedImageBase64);
        setShowCropper(false);
        setTempImage(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
      // 1. Update Auth Profile - use a lightweight reference to avoid "URL too long" error
      // Authenticaton profile has a very small limit for photoURL if it's a data URL
      const authPhotoURL = photoURL.startsWith('data:') 
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}` 
        : photoURL;

      try {
        await updateProfile(user, {
          displayName,
          photoURL: authPhotoURL
        });
      } catch (authProfErr) {
        console.warn("Auth profile update not supported for local virtual profile, skipping...", authProfErr);
      }

      // 2. Update Firestore Record using updateDoc to preserve existing fields like createdAt and email
      const userRef = doc(db, 'users', user.uid);
      const emailResolved = user.email || localStorage.getItem('saved-auth-email') || '';
      const profileData: any = {
        displayName,
        photoURL,
        bio,
        email: emailResolved,
        emailVerified: user.emailVerified || false,
        onboardingCompleted: true
      };
      
      if (user.uid.startsWith('local_')) {
        const localProfileKey = `sanctuary_profile_${user.uid}`;
        const existingData = localStorage.getItem(localProfileKey);
        const existing = existingData ? JSON.parse(existingData) : {};
        localStorage.setItem(localProfileKey, JSON.stringify({ ...existing, ...profileData, lastSeen: new Date().toISOString() }));
      } else {
        try {
          await setDoc(userRef, {
            ...profileData,
            lastSeen: serverTimestamp()
          }, { merge: true });

          // 3. Create/Update Secondary Profile (Email-based) for app-wide indexing
          if (emailResolved) {
            const emailRef = doc(db, 'profiles', emailResolved.toLowerCase());
            await setDoc(emailRef, {
              uid: user.uid,
              displayName,
              photoURL,
              bio,
              lastSeen: serverTimestamp(),
              isPremium: false
            }, { merge: true });
          }
        } catch (dbErr) {
          console.warn("Firestore write blocked or offline. Falling back to local replication cache...", dbErr);
          const cacheKey = `sanctuary_cache_profile_${user.uid}`;
          const existingData = localStorage.getItem(cacheKey);
          const existing = existingData ? JSON.parse(existingData) : {};
          localStorage.setItem(cacheKey, JSON.stringify({ ...existing, ...profileData, lastSeen: new Date().toISOString() }));
        }
      }

      notificationService.notify('Welcome to Sanctuary', `Peace be upon you, ${displayName}. Your profile is ready.`, 'system');
      onComplete();
    } catch (err: any) {
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-brand-depth overflow-y-auto overflow-x-hidden pt-20 pb-20 relative">
      {/* Visible Theme Ambient Background */}
      <div 
        className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-25 scale-100 transform-gpu z-0"
        style={{ backgroundImage: `url(${kaabaDuaThemeBg})` }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-brand-depth via-brand-depth/75 to-brand-depth/65 z-0" />
      <div className="absolute inset-0 bg-brand-primary/5 blur-[150px] rounded-full pointer-events-none z-0" />
      
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

              <div className="flex flex-col items-center gap-6">
                 <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-4 border-brand-primary/20 overflow-hidden bg-brand-sidebar relative shadow-2xl">
                       {photoURL ? (
                         <img src={photoURL} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-brand-primary/40 bg-gradient-to-br from-brand-sidebar to-brand-depth">
                            <UserIcon size={48} />
                         </div>
                       )}
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={24} className="text-white" />
                       </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-primary text-brand-depth rounded-xl flex items-center justify-center shadow-xl">
                       <Camera size={18} />
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                 </div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Click to upload your image</p>
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

      {/* Cropper Modal Overlay */}
      <AnimatePresence>
        {showCropper && tempImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8"
          >
            <div className="bg-brand-sidebar w-full max-w-2xl rounded-[3rem] overflow-hidden flex flex-col h-[80vh] border border-white/10 shadow-2xl">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-brand-depth">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-brand-primary/20 rounded-lg flex items-center justify-center text-brand-primary">
                      <Camera size={16} />
                   </div>
                   <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Sacred Image Calibration</h3>
                </div>
                <button 
                  onClick={() => { setShowCropper(false); setTempImage(null); }}
                  className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-all"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="relative flex-1 bg-black">
                <Cropper
                  image={tempImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <div className="p-8 space-y-6 bg-brand-sidebar">
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Magnification Level</span>
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-brand-primary h-1 bg-white/10 rounded-full cursor-pointer appearance-none outline-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleCropSave}
                    className="flex-1 py-5 bg-brand-primary text-brand-depth rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 active:scale-95 transition-all"
                  >
                    Set Identity Image
                  </button>
                  <button 
                    onClick={() => { setShowCropper(false); setTempImage(null); }}
                    className="px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

