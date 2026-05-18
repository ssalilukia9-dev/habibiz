import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Cropper from 'react-easy-crop';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Mail, 
  Sparkles, 
  Calendar, 
  Clock, 
  Shield, 
  Edit2, 
  CheckCircle, 
  XCircle, 
  Camera, 
  ChevronRight,
  TrendingUp,
  MapPin,
  Globe,
  Bell,
  Database,
  Moon,
  Sun,
  LogOut,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  UserPlus,
  Users,
  Smartphone,
  Zap,
  Volume2,
  Play
} from 'lucide-react';
import { db, auth } from '../lib/firebase.ts';
import { doc, onSnapshot, updateDoc, serverTimestamp, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile, deleteUser } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../lib/utils.ts';
import { LANGUAGES } from '../constants.ts';
import { notificationService } from '../services/notificationService';
import { offlineService, SyncProgress } from '../services/offlineService';

import { apiFetch } from '../lib/api';

interface ProfileImageProps {
  src: string | null;
  name: string;
  size?: 'sm' | 'lg';
  isEditing?: boolean;
}

function ProfileImage({ src, name, size = 'lg', isEditing = false }: ProfileImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';

  const sizeClasses = size === 'lg' ? 'w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem]' : 'w-10 h-10 rounded-xl';

  return (
    <div className={`relative ${sizeClasses} overflow-hidden border-4 border-brand-primary/20 shadow-2xl shadow-brand-primary/20 bg-brand-sidebar group`}>
      {src && !error ? (
        <>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-brand-sidebar">
              <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <img 
            src={src} 
            alt={name} 
            className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-sidebar to-brand-depth text-brand-primary font-black text-4xl italic">
          {initials}
        </div>
      )}
      
      {isEditing && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <Camera size={24} className="text-white" />
        </div>
      )}
    </div>
  );
}

interface ProfileViewProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onLogout: () => void;
  language: string;
  setLanguage: (val: string) => void;
}

export default function ProfileView({ darkMode, setDarkMode, onLogout, language, setLanguage }: ProfileViewProps) {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

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

    // Limit size to prevent "URL too long" errors
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

    return canvas.toDataURL('image/jpeg', 0.8); // Add quality reduction as well
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
        setEditPhoto(croppedImageBase64);
        setShowCropper(false);
        setTempImage(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Settings states
  const [offlineMode, setOfflineMode] = useState(() => localStorage.getItem('offline-mode') === 'true');
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [cacheSize, setCacheSize] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => localStorage.getItem('last-sync-time'));
  const [isRemindersExpanded, setIsRemindersExpanded] = useState(false);
  const [communityNotifs, setCommunityNotifs] = useState(() => localStorage.getItem('community-notifs') !== 'false');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('prayer-reminders');
    return saved ? JSON.parse(saved) : {
      Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true, Adhan: true, Global: true
    };
  });

  const [preferredAdhan, setPreferredAdhan] = useState(() => localStorage.getItem('preferred-adhan-id') || 'makkah');
  const [customAdhanUrl, setCustomAdhanUrl] = useState(() => localStorage.getItem('preferred-adhan-custom-url') || '');

  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserData(data);
        setEditName(data.displayName || '');
        setEditPhoto(data.photoURL || '');
        setEditBio(data.bio || '');
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('prayer-reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('preferred-adhan-id', preferredAdhan);
  }, [preferredAdhan]);

  useEffect(() => {
    localStorage.setItem('preferred-adhan-custom-url', customAdhanUrl);
  }, [customAdhanUrl]);

  useEffect(() => {
    if (offlineMode) {
      offlineService.getCacheSize().then(setCacheSize);
    } else {
      setCacheSize(null);
    }
  }, [offlineMode]);

  const handleSave = async () => {
    if (!currentUser) return;
    
    // Validation
    if (!editName.trim()) {
      setNameError('Divine identity requires a name.');
      return;
    }
    if (editName.length > 50) {
      setNameError('Name is too long (max 50 characters).');
      return;
    }
    setNameError(null);

    setSaving(true);
    try {
      await updateProfile(currentUser, {
        displayName: editName,
        photoURL: editPhoto
      });

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: editName,
        photoURL: editPhoto,
        bio: editBio,
        lastSeen: serverTimestamp(),
        emailVerified: currentUser.emailVerified
      });

      notificationService.notify('Profile Synchronized', 'Your sacred identity records have been updated.', 'system');
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const generateBio = async () => {
    if (isGeneratingBio) return;
    setIsGeneratingBio(true);
    try {
      const response = await apiFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Generate a short (max 20 words), poetic, spiritual bio for a person named ${editName}. Focus on peace, growth, and the ummah. Return only the bio text.` }] }],
          systemInstruction: "You are a specialized spiritual bio generator for the Sanctuary app. Output only the bio, no quotes or intro."
        })
      });
      const data = await response.json();
      if (data.text) {
        setEditBio(data.text.trim());
      }
    } catch (e) {
      console.error("Bio generation failed", e);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const toggleGlobalReminders = async () => {
    const newVal = !reminders.Global;
    if (newVal) {
      const granted = await notificationService.requestPermission();
      if (!granted) {
        alert('Please enable notifications in your browser settings to receive alerts.');
        return;
      }
      notificationService.notify('Notifications Active', 'You will now receive alerts for prayers.', 'system');
    }
    setReminders(prev => ({ ...prev, Global: newVal }));
  };

  const toggleIndividualReminder = (key: string) => {
    setReminders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const adhanOptions = [
    { id: 'makkah', name: 'Makkah (Grand Mosque)', city: 'Saudi Arabia' },
    { id: 'madinah', name: 'Madinah (Prophet\'s Mosque)', city: 'Saudi Arabia' },
    { id: 'mishary', name: 'Mishary Rashid Alafasy', city: 'Kuwait' },
    { id: 'turkey', name: 'Turkish Style', city: 'Istanbul' },
    { id: 'movie_style', name: 'Cinematic Adhan', city: 'Spiritual' },
    { id: 'sharjah', name: 'Sharjah Mosque', city: 'UAE' },
    { id: 'bosnia', name: 'Bosnian Adhan', city: 'Sarajevo' },
    { id: 'africa', name: 'African Adhan', city: 'West Africa' },
    { id: 'custom', name: 'Custom Upload', city: 'Personal' }
  ];

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Audio file too large. Please select a file smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCustomAdhanUrl(reader.result as string);
        setPreferredAdhan('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const testAdhan = () => {
    let audioUrl = '';
    const adhanMap: Record<string, string> = {
      'makkah': 'https://www.islamcan.com/audio/adhan/azan2.mp3',
      'madinah': 'https://www.islamcan.com/audio/adhan/azan1.mp3',
      'mishary': 'https://www.islamcan.com/audio/adhan/azan20.mp3',
      'turkey': 'https://archive.org/download/Adhan_Collection/Adhan-Turkey.mp3',
      'movie_style': 'https://www.islamcan.com/audio/adhan/azan14.mp3',
      'sharjah': 'https://www.islamcan.com/audio/adhan/azan3.mp3',
      'bosnia': 'https://www.islamcan.com/audio/adhan/azan12.mp3',
      'africa': 'https://archive.org/download/Adhan_Collection/Adhan-African.mp3'
    };

    if (preferredAdhan === 'custom' && customAdhanUrl) {
      audioUrl = customAdhanUrl;
    } else {
      audioUrl = adhanMap[preferredAdhan] || adhanMap['makkah'];
    }

    const audio = new Audio(audioUrl);
    audio.play().catch(e => {
      console.error("Test playback failed", e);
      alert("Playback failed. Please check the audio source.");
    });
  };

  const startSync = async () => {
    await offlineService.syncFullQuran(async (progress) => {
      setSyncProgress(progress);
      if (progress.current % 10 === 0 || progress.status === 'completed') {
        const size = await offlineService.getCacheSize();
        setCacheSize(size);
      }
      if (progress.status === 'completed') {
        const now = new Date().toLocaleString();
        localStorage.setItem('last-sync-time', now);
        setLastSyncTime(now);
        setOfflineMode(true);
        setTimeout(() => setSyncProgress(null), 3000);
      }
    });
  };

  const toggleOfflineMode = async () => {
    if (!offlineMode) {
      if (confirm('Enable Offline Sanctuary? This will download Quran data (~50MB).')) {
        startSync();
      }
    } else {
      if (confirm('Disable Offline Mode and clear cache?')) {
        await offlineService.clearCache();
        setOfflineMode(false);
        setCacheSize(null);
        localStorage.removeItem('last-sync-time');
        setLastSyncTime(null);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    
    const confirmed = confirm("WARNING: This will permanently delete your sacred records, including your Hasanat, bookmarks, and settings. This action is irreversible. Proceed to erase identity?");
    
    if (!confirmed) return;

    setIsDeletingAccount(true);
    try {
      // 1. Delete from Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await deleteDoc(userRef);

      // 2. Clear local storage
      localStorage.removeItem('offline-mode');
      localStorage.removeItem('last-sync-time');
      localStorage.removeItem('prayer-reminders');
      localStorage.removeItem('community-notifs');
      await offlineService.clearCache();

      // 3. Delete from Auth
      await deleteUser(currentUser);
      
      notificationService.notify('Identity Erased', 'Your records have been removed from the sanctuary.', 'system');
      onLogout();
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        alert("For security, you must have logged in recently to delete your account. Please sign out and sign back in, then try again.");
      } else {
        handleFirestoreError(error, OperationType.DELETE, `users/${currentUser.uid}`);
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'friend_requests'),
      where('toId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIncomingRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAcceptRequest = async (request: any) => {
    try {
       await updateDoc(doc(db, 'friend_requests', request.id), {
          status: 'accepted',
          acceptedAt: serverTimestamp()
       });
       notificationService.notify('Circle Expanded', `You are now connected with ${request.fromName}.`, 'community');
    } catch (error) {
       handleFirestoreError(error, OperationType.WRITE, `friend_requests/${request.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black text-brand-primary uppercase tracking-[0.3em] animate-pulse">Syncing Soul Data</p>
      </div>
    );
  }

  if (!currentUser || !userData) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
        <div className="w-20 h-20 bg-red-400/10 rounded-full flex items-center justify-center text-red-400">
          <XCircle size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Sanctuary Disconnected</h2>
          <p className="text-slate-400 max-w-xs">Please sign in to view your spiritual profile.</p>
        </div>
      </div>
    );
  }

  const creationDate = userData.createdAt?.toDate ? userData.createdAt.toDate().toLocaleDateString() : 'N/A';
  const lastSeenDate = userData.lastSeen?.toDate ? userData.lastSeen.toDate().toLocaleString() : 'N/A';

  return (
    <div className="space-y-12 pb-20">
      {/* HEADER / PROFILE CARD */}
      <div className="relative p-8 md:p-12 glass-panel border-brand-primary/20 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <UserIcon size={120} className="text-brand-primary" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="relative cursor-pointer" onClick={() => isEditing && fileInputRef.current?.click()}>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <ProfileImage 
              src={isEditing ? editPhoto : userData.photoURL} 
              name={userData.displayName || 'User'} 
              isEditing={isEditing}
            />
            {isEditing && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-primary text-brand-depth rounded-xl flex items-center justify-center shadow-xl z-20">
                <Camera size={18} />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">Spirit Seeker Profile</span>
                {userData.isPremium && (
                  <span className="bg-brand-primary/10 text-brand-primary border border-brand-primary/30 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">Premium Elite</span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                {userData.displayName || 'Unidentified Wanderer'}
              </h1>
              
              {userData.bio && (
                <p className="text-sm text-slate-400 font-medium italic mb-2 max-w-lg mx-auto md:mx-0">
                  "{userData.bio}"
                </p>
              )}
              
              <div className="flex items-center justify-center md:justify-start gap-4 text-slate-500 font-medium">
                <div className="flex items-center gap-1.5 text-xs">
                  <Mail size={14} className="text-brand-primary/60" />
                  {currentUser.email}
                </div>
                <div className="w-[1px] h-3 bg-white/10 hidden sm:block" />
                <div className={`flex items-center gap-1.5 text-xs ${currentUser.emailVerified ? 'text-green-400' : 'text-amber-400'}`}>
                  {currentUser.emailVerified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  {currentUser.emailVerified ? 'Verified' : 'Unverified'}
                </div>
              </div>
            </div>

            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 rounded-2xl text-[10px] font-black text-brand-primary uppercase tracking-widest transition-all"
              >
                <Edit2 size={12} /> Edit Sacred Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* EDITING CONTROLS */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 glass-panel-purple border-brand-primary/30 rounded-[3rem] space-y-6"
          >
            <h3 className="text-xs font-black text-brand-primary uppercase tracking-[0.4em]">Modification Chamber</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">Display Identity</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" size={16} />
                  <input 
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    className={`w-full bg-black/40 border ${nameError ? 'border-red-500/50' : 'border-white/10'} p-4 pl-12 rounded-2xl text-sm focus:border-brand-primary outline-none transition-all text-white`}
                    placeholder="Enter full name..."
                  />
                </div>
                {nameError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="text-[10px] font-bold text-red-400 pl-4 flex items-center gap-1"
                  >
                    <AlertCircle size={10} /> {nameError}
                  </motion.p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">Sacred Image (URL or Upload)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" size={16} />
                    <input 
                      value={editPhoto}
                      onChange={(e) => setEditPhoto(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-4 pl-12 rounded-2xl text-sm focus:border-brand-primary outline-none transition-all text-white"
                      placeholder="Enter image URL..."
                    />
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 bg-brand-primary/10 border border-brand-primary/30 rounded-2xl text-[10px] font-black text-brand-primary uppercase tracking-widest hover:bg-brand-primary/20 transition-all"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between pl-4 pr-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Divine Bio</label>
                 <button 
                  onClick={generateBio}
                  disabled={isGeneratingBio}
                  className="flex items-center gap-1.5 text-[8px] font-black text-brand-primary uppercase tracking-widest hover:text-white transition-colors disabled:opacity-50"
                 >
                   <Sparkles size={10} className={isGeneratingBio ? 'animate-spin' : ''} />
                   {isGeneratingBio ? 'Generating...' : 'AI Spirit Generate'}
                 </button>
              </div>
              <textarea 
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Share your spiritual journey in a few words..."
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-xs focus:border-brand-primary outline-none transition-all text-white resize-none h-24"
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-4 bg-brand-primary text-brand-depth rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                {saving ? 'Syncing Records...' : 'Ascend Changes'}
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditName(userData.displayName || '');
                  setEditPhoto(userData.photoURL || '');
                  setNameError(null);
                }}
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400/10 hover:text-red-400 transition-all"
              >
                Discard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SETTINGS SECTION 1: APPEARANCE */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                <Sun size={16} />
             </div>
             <h3 className="text-xs font-black text-white uppercase tracking-widest">Global Appearance</h3>
          </div>
          
          <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden shadow-xl">
             <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-brand-sidebar rounded-xl text-brand-primary">
                    {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Dark Mode</p>
                    <p className="text-[10px] text-slate-500">Night-time reflection mode</p>
                  </div>
                </div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-14 h-8 rounded-full transition-all relative ${darkMode ? 'bg-brand-primary' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${darkMode ? 'left-7' : 'left-1'} shadow-lg`} />
                </button>
             </div>

             <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-2.5 bg-brand-sidebar rounded-xl text-brand-primary">
                      <Globe size={20} />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-200">Language</p>
                      <p className="text-[10px] text-slate-500">Translation context</p>
                   </div>
                </div>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-brand-depth border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest p-2 outline-none text-brand-primary cursor-pointer"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
             </div>
          </div>
        </section>

        {/* SETTINGS SECTION 2: NOTIFICATIONS */}
        <section className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                 <Bell size={16} />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Divine Signals</h3>
           </div>

           <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-white/5" onClick={() => setIsRemindersExpanded(!isRemindersExpanded)}>
                 <div className="flex items-center gap-4 cursor-pointer">
                    <div className="p-2.5 bg-brand-sidebar rounded-xl text-brand-primary">
                       <Bell size={20} />
                    </div>
                    <div>
                       <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-200">Prayer Alerts</p>
                          <ChevronRight size={12} className={`text-slate-500 transition-transform ${isRemindersExpanded ? 'rotate-90' : ''}`} />
                       </div>
                       <p className="text-[10px] text-slate-500">Adhan & Iqamah</p>
                    </div>
                 </div>
                 <button 
                  onClick={(e) => { e.stopPropagation(); toggleGlobalReminders(); }}
                  className={`w-14 h-8 rounded-full transition-all relative ${reminders.Global ? 'bg-brand-primary' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${reminders.Global ? 'left-7' : 'left-1'} shadow-lg`} />
                </button>
              </div>

              <AnimatePresence>
                {isRemindersExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-black/20">
                     <div className="p-6 grid grid-cols-2 gap-4">
                        {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((p) => (
                          <div key={p} className="flex items-center justify-between">
                             <span className="text-[10px] font-bold text-slate-400">{p}</span>
                             <button 
                              onClick={() => toggleIndividualReminder(p)}
                              className={`w-10 h-6 rounded-full relative transition-all ${reminders[p] ? 'bg-brand-primary/40' : 'bg-white/5'}`}
                             >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${reminders[p] ? 'left-5' : 'left-1'}`} />
                             </button>
                          </div>
                        ))}
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-6 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-brand-sidebar rounded-xl text-brand-primary">
                       <MessageSquare size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-slate-200">Community Notifs</p>
                       <p className="text-[10px] text-slate-500">Social activity signals</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => { setCommunityNotifs(!communityNotifs); localStorage.setItem('community-notifs', (!communityNotifs).toString()); }}
                  className={`w-14 h-8 rounded-full transition-all relative ${communityNotifs ? 'bg-brand-primary' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${communityNotifs ? 'left-7' : 'left-1'} shadow-lg`} />
                </button>
              </div>
           </div>

           {/* ADHAN SELECTION SECTION */}
           <div className="flex items-center gap-3 mt-8">
              <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                 <Volume2 size={16} />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Adhan Symphony</h3>
           </div>

           <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden shadow-xl mt-4">
              <div className="p-6 space-y-6">
                 <div className="grid grid-cols-1 gap-3">
                    {adhanOptions.map((opt) => (
                      <button 
                        key={opt.id}
                        onClick={() => setPreferredAdhan(opt.id)}
                        className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          preferredAdhan === opt.id 
                            ? 'bg-brand-primary/10 border-brand-primary/30' 
                            : 'bg-black/20 border-white/5 hover:border-white/10'
                        }`}
                      >
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                              preferredAdhan === opt.id ? 'bg-brand-primary text-brand-depth' : 'bg-white/5 text-slate-500 group-hover:text-white'
                            }`}>
                               <Sun size={20} />
                            </div>
                            <div className="text-left">
                               <p className={`text-sm font-bold ${preferredAdhan === opt.id ? 'text-white' : 'text-slate-400'}`}>{opt.name}</p>
                               <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black leading-none">{opt.city}</p>
                            </div>
                         </div>
                         {preferredAdhan === opt.id && <CheckCircle2 size={16} className="text-brand-primary" />}
                      </button>
                    ))}
                 </div>

                 {preferredAdhan === 'custom' && (
                   <div className="p-5 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Audio File</span>
                         <label className="cursor-pointer px-4 py-2 bg-brand-primary text-brand-depth rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                            Choose File
                            <input type="file" className="hidden" accept="audio/*" onChange={handleCustomAudioUpload} />
                         </label>
                      </div>
                      {customAdhanUrl && (
                        <div className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-white/5">
                           <Volume2 size={14} className="text-brand-primary" />
                           <span className="text-[10px] text-slate-400 font-bold truncate">Custom Adhan Loaded (Ready to Manifest)</span>
                        </div>
                      )}
                   </div>
                 )}

                 <button 
                  onClick={testAdhan}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-brand-primary uppercase tracking-widest transition-all"
                 >
                   <Play size={16} /> Test Sacred Call
                 </button>
              </div>
           </div>
        </section>
      </div>

      {/* SOCIAL CONNECTIVITY */}
      <section className="space-y-6">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
               <UserPlus size={16} />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Ummah Connections</h3>
         </div>

         <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden shadow-xl p-8">
            {incomingRequests.length > 0 ? (
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-6">Pending Friendly Requests ({incomingRequests.length})</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {incomingRequests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-brand-primary/30 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden">
                               <img src={req.fromPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.fromId}`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-white">{req.fromName}</p>
                               <p className="text-[10px] text-slate-500 uppercase font-black">Wants to Connect</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <button 
                              onClick={() => handleAcceptRequest(req)}
                              className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-brand-depth transition-all"
                            >
                               <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={async () => {
                                 await updateDoc(doc(db, 'friend_requests', req.id), { status: 'rejected' });
                              }}
                              className="p-3 bg-red-400/10 text-red-400 rounded-xl hover:bg-red-400 hover:text-white transition-all"
                            >
                               <XCircle size={18} />
                            </button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-700">
                    <Users size={32} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-bold text-white">No pending requests</p>
                    <p className="text-[10px] text-slate-500 max-w-xs uppercase tracking-widest font-black">Your spiritual circle is in harmony.</p>
                 </div>
                 <button 
                   onClick={() => navigate('/ummah')}
                   className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] pt-2 hover:underline"
                 >
                   Explore Ummah Hub
                 </button>
              </div>
            )}
         </div>
      </section>

      {/* ANDROID & SYSTEM NOTIFICATIONS */}
      <section className="space-y-6">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
               <Smartphone size={16} />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">System Notifications</h3>
         </div>

         <div className="bg-gradient-to-br from-brand-primary/5 to-brand-depth rounded-[2rem] border border-brand-primary/10 p-8 space-y-6">
            <div className="space-y-2">
               <p className="text-lg font-bold text-white">Get Notifications on Android</p>
               <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.1em] leading-relaxed">
                  To receive real-time prayer alerts and hadiths on your Android device:
               </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-5 bg-white/5 rounded-2xl space-y-2 border border-white/5 hover:border-brand-primary/20 transition-all">
                  <p className="text-[10px] font-black text-brand-primary uppercase">Step 1: Install PWA</p>
                  <p className="text-xs text-slate-300">Tap the browser menu (three dots) and select <strong>'Add to Home Screen'</strong>.</p>
               </div>
               <div className="p-5 bg-white/5 rounded-2xl space-y-2 border border-white/5 hover:border-brand-primary/20 transition-all">
                  <p className="text-[10px] font-black text-brand-primary uppercase">Step 2: Connect Signals</p>
                  <p className="text-xs text-slate-300">Click the button below to sync your device with the sanctuary's notification tower.</p>
               </div>
            </div>

            <button 
              onClick={async () => {
                const granted = await notificationService.requestPermission();
                if (granted) {
                  notificationService.notify('Sanctuary Connected', 'System notifications successfully enabled for this device.', 'system');
                } else {
                  alert('Please enable notifications in your regular browser settings.');
                }
              }}
              className="w-full py-4 bg-brand-primary text-brand-depth rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
               <Zap size={16} />
               Connect System Notifications
            </button>
         </div>
      </section>

      {/* DATA & OFFLINE */}
      <section className="space-y-6">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
               <Database size={16} />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Data & Persistence</h3>
         </div>

         <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden shadow-xl p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-brand-sidebar rounded-[1.5rem] flex items-center justify-center text-brand-primary border border-white/5">
                     <Database size={32} />
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-lg font-black text-white uppercase tracking-tight italic">Offline Sanctuary</h4>
                     <p className="text-xs text-slate-500 max-w-sm leading-relaxed">Download sacred revelations to your device for study without connection.</p>
                     {cacheSize && (
                       <div className="flex items-center gap-2 mt-1">
                          <CheckCircle2 size={12} className="text-brand-primary" />
                          <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{cacheSize} Stored</span>
                       </div>
                     )}
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  {offlineMode && !syncProgress && (
                    <button onClick={async () => { if(confirm('Clear cache?')){ await offlineService.clearCache(); setCacheSize(null); setOfflineMode(false); } }} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-red-400 transition-all">
                       <RefreshCw size={20} />
                    </button>
                  )}
                  <button 
                  onClick={toggleOfflineMode}
                  disabled={syncProgress?.status === 'syncing'}
                  className={`w-20 h-10 rounded-full transition-all relative ${offlineMode ? 'bg-brand-primary' : 'bg-slate-800'} ${syncProgress?.status === 'syncing' ? 'opacity-50' : ''}`}
                >
                  <div className={`absolute top-1.5 w-7 h-7 bg-white rounded-full transition-all ${offlineMode ? 'left-11' : 'left-1.5'} shadow-xl`} />
                </button>
               </div>
            </div>

            {syncProgress && (
              <div className="space-y-3 pt-4 border-t border-white/5">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                    <span>Syncing Verse Data</span>
                    <span>{Math.round((syncProgress.current / syncProgress.total) * 100)}%</span>
                 </div>
                 <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }} className="h-full bg-brand-primary" />
                 </div>
              </div>
            )}
         </div>
      </section>

      {/* CROPPER MODAL */}
      <AnimatePresence>
        {showCropper && tempImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
          >
            <div className="bg-brand-sidebar w-full max-w-2xl rounded-[3rem] overflow-hidden flex flex-col h-[80vh] border border-white/10">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-brand-primary/20 rounded-lg flex items-center justify-center text-brand-primary">
                      <Camera size={16} />
                   </div>
                   <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Sacred Framing</h3>
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
                  cropShape="rect"
                  showGrid={true}
                />
              </div>

              <div className="p-8 space-y-6 bg-brand-sidebar/80">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Magnification</span>
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-brand-primary h-1 bg-white/5 rounded-full cursor-pointer appearance-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleCropSave}
                    className="flex-1 py-4 bg-brand-primary text-brand-depth rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 active:scale-95 transition-all"
                  >
                    Set Sacred Image
                  </button>
                  <button 
                    onClick={() => { setShowCropper(false); setTempImage(null); }}
                    className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-red-400 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATS & INFO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 glass-panel border-white/5 rounded-[2.5rem] flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1">Total Hasanat</p>
            <p className="text-3xl font-black text-white tracking-tighter">{userData.hasanat || 0}</p>
          </div>
        </div>

        <div className="p-8 glass-panel border-white/5 rounded-[2.5rem] space-y-5">
           <div className="flex items-center gap-4">
              <Calendar size={18} className="text-brand-primary/60" />
              <div className="text-left">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Established</p>
                 <p className="text-xs font-bold text-white">{creationDate}</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <Clock size={18} className="text-brand-primary/60" />
              <div className="text-left">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Last Presence</p>
                 <p className="text-xs font-bold text-white uppercase">{lastSeenDate}</p>
              </div>
           </div>
        </div>

        <div className="p-8 glass-panel bg-red-500/5 border-red-500/10 rounded-[2.5rem] flex flex-col justify-center gap-4">
           <button 
            onClick={onLogout}
            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group border border-white/5"
           >
              <div className="flex items-center gap-4">
                 <LogOut size={20} className="text-slate-400" />
                 <span className="text-xs font-black text-white uppercase tracking-widest">Sign Out</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
           </button>

           <button 
            onClick={handleDeleteAccount}
            disabled={isDeletingAccount}
            className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 rounded-2xl transition-all group border border-red-500/20"
           >
              <div className="flex items-center gap-4">
                 <XCircle size={20} className="text-red-500" />
                 <span className="text-xs font-black text-white uppercase tracking-widest">
                   {isDeletingAccount ? 'Erasing...' : 'Delete Account'}
                 </span>
              </div>
              <AlertCircle size={16} className="text-red-500 opacity-50 group-hover:opacity-100 transition-all" />
           </button>
        </div>
      </div>
    </div>
  );
}
