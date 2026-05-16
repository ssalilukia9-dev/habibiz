import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Bookmark, 
  Settings as SettingsIcon, 
  Search, 
  ChevronRight, 
  Menu, 
  X,
  Moon,
  Sun,
  LayoutGrid,
  List,
  Home,
  MessageSquare,
  MessageCircle,
  Compass,
  ShoppingBag,
  LogOut,
  User as UserIcon,
  Sparkles,
  Bell,
  Trophy,
  Medal,
  Terminal
} from 'lucide-react';
import { NAVIGATION_TABS, SURAH_LIST, JUZ_LIST } from './constants.ts';
import { Surah, Ayah } from './types.ts';
import { auth, signInWithGoogle, db } from './lib/firebase.ts';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  getDoc, 
  updateDoc,
  collection,
  query,
  or,
  where,
  onSnapshot,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/utils.ts';

// Components
import HomeView from './components/HomeView.tsx';
import QuranView from './components/QuranView.tsx';
import HadithLibraryView from './components/HadithLibraryView.tsx';
import BookmarksView from './components/BookmarksView.tsx';
import SettingsView from './components/SettingsView.tsx';
import CompanionView from './components/CompanionView.tsx';
import MarketView from './components/MarketView.tsx';
import ResourcesView from './components/ResourcesView.tsx';
import ChatView from './components/ChatView.tsx';
import AuthView from './components/AuthView.tsx';
import PremiumGateway from './components/PremiumGateway.tsx';
import NotificationCenter from './components/NotificationCenter.tsx';
import NotificationsView from './components/NotificationsView.tsx';
import PremiumView from './components/PremiumView.tsx';
import QiblaView from './components/QiblaView.tsx';
import LeaderboardView from './components/LeaderboardView.tsx';
import ProfileView from './components/ProfileView.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import UmmahHubView from './components/UmmahHubView.tsx';
import { notificationService } from './services/notificationService.ts';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || 'home';
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastNotification, setLastNotification] = useState<any>(null);
  const [showTrial, setShowTrial] = useState(true);
  const [showNotificationPopup, setShowNotificationPopup] = useState(() => {
    return !sessionStorage.getItem('dismissed_notification_popup');
  });
  const [topUserId, setTopUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [userJoinedAt, setUserJoinedAt] = useState<Date | null>(null);
  const [hasanat, setHasanat] = useState(1250);
  const [rank, setRank] = useState('Seeker');
  const [versesRead, setVersesRead] = useState(142);
  const [duaCount, setDuaCount] = useState(84);
  const [streak, setStreak] = useState(12);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [bookmarks, setBookmarks] = useState<Ayah[]>([]);
  const [initialResId, setInitialResId] = useState<any>(null);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app-language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  useEffect(() => {
    // Splash screen timer
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 5 mins visible, 30 mins hidden cycle
    let timeoutId: any;
    
    const startCycle = (visible: boolean) => {
      setShowTrial(visible);
      const duration = visible ? 5 * 60 * 1000 : 30 * 60 * 1000;
      timeoutId = setTimeout(() => {
        startCycle(!visible);
      }, duration);
    };

    startCycle(true); 

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Leaderboard listener to find top user (Habibi Crown)
    const q = query(
      collection(db, 'users'),
      orderBy('hasanat', 'desc'),
      where('hasanat', '>', 0)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setTopUserId(snapshot.docs[0].id);
      }
    }, (e) => {
      handleFirestoreError(e, OperationType.GET, 'users');
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    // Sync hasanat if changed from Firestore
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const syncHasanat = async () => {
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
             const data = snap.data();
             if (data.hasanat) setHasanat(data.hasanat);
          }
        } catch (e) {
          console.error("Sync Hasanat failed", e);
        }
      };
      syncHasanat();
    }
  }, [currentUser]);

  useEffect(() => {
    const handleNewNotification = (e: any) => {
      setLastNotification(e.detail);
      // Auto close toast
      setTimeout(() => setLastNotification(null), 6000);
    };
    window.addEventListener('notification_received', handleNewNotification);
    return () => window.removeEventListener('notification_received', handleNewNotification);
  }, []);
  
  // App State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('dark-mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const lastInteractionRef = useRef<Record<string, any>>({});
  const initialLoadDone = useRef(false);

  // Global Chat Listener for Notifications
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'rooms'),
      or(
        where('type', '==', 'group'),
        where('participants', 'array-contains', currentUser.uid)
      )
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!initialLoadDone.current) {
        // Just capture initial states
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.updatedAt) {
            lastInteractionRef.current[doc.id] = data.updatedAt.toMillis();
          }
        });
        initialLoadDone.current = true;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const room = { id: change.doc.id, ...change.doc.data() } as any;
          const lastTime = lastInteractionRef.current[room.id] || 0;
          const newTime = room.updatedAt?.toMillis() || 0;

          // If message is newer AND not from me
          if (newTime > lastTime && room.lastSenderId !== currentUser.uid) {
            notificationService.notify(
              room.name,
              room.lastMessage || 'New message received',
              'community',
              '#chat'
            );
          }
          lastInteractionRef.current[room.id] = newTime;
        } else if (change.type === 'added') {
            const data = change.doc.data() as any;
            if (data.updatedAt) {
                lastInteractionRef.current[change.doc.id] = data.updatedAt.toMillis();
            }
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rooms');
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Friend Request Listener for Notifications
  const lastRequestTimeRef = useRef<number>(Date.now());
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'friend_requests'),
      where('toId', '==', currentUser.uid),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const req = change.doc.data();
          const reqTime = req.createdAt?.toMillis() || Date.now();
          
          if (reqTime > lastRequestTimeRef.current) {
            notificationService.notify(
              'New Friendly Request',
              `${req.fromName} wants to connect with you in the Ummah Hub.`,
              'community',
              '/profile'
            );
          }
        }
      });
      // Update last request time to avoid double notifications on initial load
      if (!snapshot.empty) {
        const latest = snapshot.docs[0].data();
        if (latest.createdAt) lastRequestTimeRef.current = latest.createdAt.toMillis();
      }
    }, (error) => {
      console.warn("Friend request notification listener failed", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Friend Request Accepted Listener for Notifications
  const lastAcceptedTimeRef = useRef<number>(Date.now());
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'friend_requests'),
      where('fromId', '==', currentUser.uid),
      where('status', '==', 'accepted'),
      orderBy('acceptedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const req = change.doc.data();
          const acceptedTime = req.acceptedAt?.toMillis() || Date.now();
          
          if (acceptedTime > lastAcceptedTimeRef.current) {
            notificationService.notify(
              'Ummah Connection Established',
              `Your request was accepted! You are now connected with your brother/sister.`,
              'community',
              '/chat'
            );
          }
        }
      });
      if (!snapshot.empty) {
        const latest = snapshot.docs[0].data();
        if (latest.acceptedAt) lastAcceptedTimeRef.current = latest.acceptedAt.toMillis();
      }
    }, (error) => {
      console.warn("Accepted request notification listener failed", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Trial Logic: 3 days (72 hours)
  const isTrialActive = userJoinedAt ? (Date.now() - userJoinedAt.getTime() < 3 * 24 * 60 * 60 * 1000) : true;
  const trialExpired = !isTrialActive;

  // Bookmarks Listener
  useEffect(() => {
    if (!currentUser) {
      setBookmarks([]);
      return;
    }

    const q = query(
      collection(db, 'users', currentUser.uid, 'ayahBookmarks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bks: Ayah[] = snapshot.docs.map(doc => ({
        ...doc.data(),
        number: Number(doc.id) // Ayah number is the doc ID
      } as any));
      setBookmarks(bks);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}/ayahBookmarks`);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const [pointPopups, setPointPopups] = useState<{id: number, amount: number}[]>([]);
  const popupId = useRef(0);

  const addHasanat = (amount: number) => {
    const newVal = hasanat + amount;
    setHasanat(newVal);

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      updateDoc(userRef, { 
        hasanat: newVal
      }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}`));
    }

    const id = popupId.current++;
    setPointPopups(prev => [...prev, { id, amount }]);
    setTimeout(() => {
      setPointPopups(prev => prev.filter(p => p.id !== id));
    }, 2000);
  };

  const incrementDua = () => {
    setDuaCount(prev => prev + 1);
    addHasanat(15);
  };

  const incrementVerse = () => {
    setVersesRead(prev => prev + 1);
    addHasanat(10);
  };

  const level = Math.floor(hasanat / 500) + 1;
  const levelProgress = ((hasanat % 500) / 500) * 100;

  useEffect(() => {
    // Update rank based on level
    if (level > 20) setRank('Legacy of Light');
    else if (level > 15) setRank('Gnostic');
    else if (level > 10) setRank('Devotee');
    else if (level > 5) setRank('Vanguard');
    else setRank('Seeker');
  }, [level]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      
      if (user) {
        // Sync user to firestore
        const userRef = doc(db, 'users', user.uid);
        try {
          // Try to get from cache first if offline, or server if online
          const docSnap = await getDoc(userRef);
          let joinedDate = new Date();
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setIsPremium(data.isPremium || false);
            if (data.createdAt) {
               joinedDate = data.createdAt.toDate();
            }
            setUserJoinedAt(joinedDate);
            setHasanat(data.hasanat || 0); // Sync hasanat from cloud
          } else {
            // New user, starting trial now
            setUserJoinedAt(joinedDate);
            await setDoc(userRef, {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              createdAt: serverTimestamp(),
              isPremium: false,
              lastSeen: serverTimestamp(),
              hasanat: 0
            });
          }

          if (docSnap.exists()) {
             await updateDoc(userRef, {
               lastSeen: serverTimestamp()
             });
          }
        } catch (error: any) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
       console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Initial welcome or daily hadith
    const lastDaily = localStorage.getItem('last_daily_hadith_notification');
    const today = new Date().toDateString();
    
    if (lastDaily !== today) {
      setTimeout(() => {
        notificationService.notify(
          'Daily Revelation',
          'The best among you is he who learns the Quran and teaches it.',
          'hadith',
          '#resources'
        );
        localStorage.setItem('last_daily_hadith_notification', today);
      }, 5000);
    }
    
    // System update check (mock)
    const lastUpdate = localStorage.getItem('last_system_update_notification');
    if (lastUpdate !== '1.3.5') {
      setTimeout(() => {
        notificationService.notify(
          'System Update',
          'Habibi AI Version v1.3.5 is now live. New features: Notification Center and enhanced spiritual companion.',
          'system',
          '#settings'
        );
        localStorage.setItem('last_system_update_notification', '1.3.5');
      }, 8000);
    }

    // Jummah Reminder
    const now = new Date();
    const isFriday = now.getDay() === 5;
    const lastJummahReminder = localStorage.getItem('last_jummah_reminder_date');
    const todayDateStr = now.toDateString();

    if (isFriday && lastJummahReminder !== todayDateStr) {
      setTimeout(() => {
        notificationService.notify(
          'Jummah Mubarak',
          "Today is the master of all days. Don't forget to read Surah Al-Kahf and prepare for Jummah prayer.",
          'community',
          '#resources'
        );
        localStorage.setItem('last_jummah_reminder_date', todayDateStr);
      }, 12000);
    }
  }, []);

  const [selectedHadithCollection, setSelectedHadithCollection] = useState('all');
  const [selectedReciter, setSelectedReciter] = useState(7); // Default: Alafasy

  const handleNavigate = (tab: string, extra?: any) => {
    if (tab === 'resources' && extra?.resId) {
      setInitialResId(extra.resId);
      if (extra.resId === 'quran' && extra.surahNumber) {
        const surah = SURAH_LIST.find(s => s.number === extra.surahNumber);
        if (surah) setSelectedSurah(surah);
      }
    } else {
      setInitialResId(null);
    }
    
    if (tab === 'quran' && extra?.surahNumber) {
      const surah = SURAH_LIST.find(s => s.number === extra.surahNumber);
      if (surah) setSelectedSurah(surah);
      navigate('/resources');
    } else {
      navigate(`/${tab}`);
      if (tab !== 'resources') setSelectedSurah(null);
    }
  };

  const toggleBookmark = async (ayah: Ayah | any) => {
    if (!currentUser) {
      notificationService.notify('Login Required', 'Please connect your heart to the sanctuary to save verses.', 'system', '#auth');
      return;
    }

    const bookmarkId = ayah.number.toString();
    const bookmarkRef = doc(db, 'users', currentUser.uid, 'ayahBookmarks', bookmarkId);

    try {
      const exists = bookmarks.some(b => b.number === ayah.number);
      if (exists) {
        await deleteDoc(bookmarkRef);
        notificationService.notify('Reflections Updated', 'Verse removed from your sacred collection.', 'system');
      } else {
        // Need to find surah number if not present (ayah object from API usually has it in ayah.numberInSurah relative etc)
        // Actually, the API response for surah endpoint usually includes surah number in the ayah object if fetched via surah
        // But let's be safe.
        const surahNum = selectedSurah?.number || 1; // Fallback to 1 if somehow missing

        await setDoc(bookmarkRef, {
          number: ayah.number,
          surahNumber: surahNum,
          numberInSurah: ayah.numberInSurah,
          text: ayah.text,
          translation: ayah.translation || '',
          createdAt: serverTimestamp()
        });
        notificationService.notify('Sanctuary Expanded', 'Verse added to your curated wisdom.', 'system', '#bookmarks');
        addHasanat(50);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}/ayahBookmarks/${bookmarkId}`);
    }
  };

  const tabsWithCompanion = [
    ...NAVIGATION_TABS,
    { id: 'companion', label: 'Companion', icon: 'Sparkles' }
  ];

  return (
    <div className="fixed inset-0 flex text-slate-200 overflow-hidden font-sans selection:bg-brand-primary/30 islamic-pattern">
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>
      <AnimatePresence>
        {('Notification' in window) && Notification.permission === 'default' && currentUser && showNotificationPopup && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[9999] px-6 pointer-events-none"
          >
            <div className="glass-panel-purple p-6 md:p-8 rounded-[2.5rem] border-brand-primary/30 flex flex-col items-center gap-6 shadow-2xl shadow-brand-primary/20 max-w-sm w-full pointer-events-auto text-center">
               <div className="w-16 h-16 bg-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary border border-brand-primary/30">
                  <Bell size={32} />
               </div>
               <div>
                  <p className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] mb-2">Sacred Signal</p>
                  <p className="text-xl font-bold text-white mb-2 leading-tight">Stay Connected to the Sanctuary</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-relaxed">Enable signals to receive daily revelations and prayer reminders.</p>
               </div>
               <div className="flex flex-col w-full gap-3">
                 <button 
                   onClick={() => {
                     Notification.requestPermission().then(permission => {
                       if (permission === 'granted') {
                         notificationService.notify('Sanctuary Synced', 'Your device is now receiving sacred signals.', 'system');
                         setShowNotificationPopup(false);
                         sessionStorage.setItem('dismissed_notification_popup', 'true');
                       }
                     });
                   }}
                   className="w-full py-4 bg-brand-primary text-brand-depth rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                 >
                   Connect Signals
                 </button>
                 <button 
                   onClick={() => {
                     setShowNotificationPopup(false);
                     sessionStorage.setItem('dismissed_notification_popup', 'true');
                   }}
                   className="text-[10px] font-bold text-slate-500 uppercase tracking-widest py-2 hover:text-brand-primary transition-colors"
                 >
                   Maybe Later
                 </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Background Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
<div id="trial-info" className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
<AnimatePresence>
{currentUser && !isPremium && !trialExpired && showTrial && (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="bg-amber-500/20 backdrop-blur-md border border-amber-500/30 px-6 py-2 rounded-full overflow-hidden"
  >
     <div className="flex items-center gap-3">
        <Sparkles size={14} className="text-amber-400 animate-pulse" />
        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">3-Day Trial Active</p>
        <div className="w-[1px] h-3 bg-amber-500/30" />
        <p className="text-[9px] font-bold text-white/70">
           {Math.ceil((3 * 24 * 60 * 60 * 1000 - (Date.now() - (userJoinedAt?.getTime() || 0))) / (1000 * 60 * 60))} Hours Left
        </p>
     </div>
  </motion.div>
)}
</AnimatePresence>
</div>

      {currentUser && !isPremium && trialExpired && (
        <PremiumGateway onActivate={async () => {
          if (currentUser) {
             const userRef = doc(db, 'users', currentUser.uid);
             await updateDoc(userRef, { isPremium: true });
             setIsPremium(true);
          }
        }} />
      )}

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 bg-brand-sidebar/80 backdrop-blur-xl border-b border-brand-border z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <BookOpen size={16} className="text-brand-depth" />
          </div>
          <span className="text-sm font-black text-white tracking-widest uppercase">HABIBI AI</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <LayoutGrid size={24} />
        </button>
      </div>

      {/* Desktop/Tablet Navigation Rail (Narrow Sidebar) */}
      <aside className="hidden md:flex w-16 h-full bg-brand-sidebar border-r border-brand-border flex-col items-center py-8 gap-6 z-40 flex-shrink-0">
        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 mb-6 group cursor-pointer">
          <BookOpen size={20} className="text-brand-depth group-hover:scale-110 transition-transform" />
        </div>
        
        <nav className="flex flex-col gap-6">
          {tabsWithCompanion.map((tab) => {
            const Icon = { 
              Home, 
              BookOpen, 
              Users, 
              Bookmark, 
              Settings: SettingsIcon,
              MessageSquare,
              MessageCircle,
              Compass,
              ShoppingBag,
              Sparkles,
              Trophy,
              Medal
            }[tab.icon as keyof typeof Icon] || BookOpen;
            
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  navigate(`/${tab.id}`);
                  if (tab.id !== 'resources') setSelectedSurah(null);
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative group ${
                  isActive 
                    ? 'bg-brand-primary text-brand-depth shadow-lg shadow-brand-primary/30' 
                    : 'text-slate-500 hover:text-brand-primary hover:bg-white/5'
                }`}
                title={tab.label}
              >
                <Icon size={20} />
                {isActive && <div className="absolute left-[-16px] w-[4px] h-6 bg-brand-primary rounded-r-full" />}
                
                {/* TOOLTIP */}
                <div className="absolute left-14 bg-brand-sidebar border border-brand-border px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-2xl">
                  {tab.label}
                </div>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-4">
           {currentUser ? (
             <div className="group relative">
               <img 
                 src={currentUser.photoURL || ''} 
                 alt="" 
                 className="w-10 h-10 rounded-full border border-brand-primary/20 cursor-pointer hover:border-brand-primary transition-all" 
               />
               <button 
                 onClick={handleLogout}
                 className="absolute left-14 bottom-0 bg-brand-sidebar border border-brand-border px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-2xl text-red-400 whitespace-nowrap"
               >
                 Logout
               </button>
             </div>
           ) : (
             <button 
               onClick={handleLogin}
               className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary hover:bg-brand-primary transition-all group"
             >
                <UserIcon size={20} className="group-hover:text-brand-depth" />
             </button>
           )}
           <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-brand-primary hover:bg-white/5 transition-all">
              <LayoutGrid size={20} />
           </button>
        </div>
      </aside>

      {/* SECONDARY SIDEBAR: List Area */}
      <aside className={`hidden md:flex flex-col h-full bg-brand-sidebar border-r border-brand-border z-30 transition-all duration-500 flex-shrink-0 ${['home', 'settings', 'companion', 'premium', 'profile', 'ummah'].includes(activeTab) ? 'w-0 opacity-0 overflow-hidden' : 'w-80 opacity-100'}`}>
        <div className="sticky top-0 bg-brand-sidebar/95 backdrop-blur-md p-6 border-b border-brand-border flex items-center justify-between z-20">
           <h2 className="text-xl font-bold tracking-tight text-white capitalize">{activeTab}</h2>
           <div className="flex gap-2">
              <button className="p-2 text-slate-500 hover:text-brand-primary transition-colors"><Search size={18} /></button>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-2">
        {activeTab === 'resources' && (
              <div className="space-y-1">
                 <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Quran</div>
                 {SURAH_LIST.slice(0, 5).map((s) => (
                    <button 
                       key={s.number}
                       onClick={() => {
                          setSelectedSurah(s);
                          // We might want a way to ensure we're viewing Quran within Resources
                       }}
                       className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all group border border-transparent ${selectedSurah?.number === s.number ? 'bg-brand-primary/10 border-brand-primary/20' : 'hover:bg-white/5'}`}
                    >
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${selectedSurah?.number === s.number ? 'bg-brand-primary text-brand-depth' : 'bg-white/5 text-brand-primary'}`}>
                          {s.number}
                       </div>
                       <div className="text-left flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate transition-colors ${selectedSurah?.number === s.number ? 'text-brand-primary' : 'text-slate-200 group-hover:text-brand-primary'}`}>{s.englishName}</p>
                       </div>
                    </button>
                 ))}
                 <div className="h-[1px] bg-white/5 mx-4 my-4" />
                 <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Collections</div>
                 {[
                   { id: 'Sahih Bukhari', name: 'Sahih Bukhari' },
                   { id: 'Sahih Muslim', name: 'Sahih Muslim' },
                 ].map(coll => (
                    <button 
                      key={coll.id} 
                      onClick={() => setSelectedHadithCollection(coll.id)}
                      className={`w-full text-left px-4 py-3 rounded-2xl transition-all group border border-transparent ${selectedHadithCollection === coll.id ? 'bg-brand-primary/10 border-brand-primary/20' : 'hover:bg-white/5'}`}
                    >
                       <p className={`text-xs font-bold transition-all ${selectedHadithCollection === coll.id ? 'text-brand-primary' : 'text-slate-200 group-hover:text-brand-primary'}`}>{coll.name}</p>
                    </button>
                 ))}
              </div>
           )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col z-10 min-w-0">
        {/* Floating Point Popups */}
        <div className="fixed top-24 right-8 z-[100] flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {pointPopups.map(p => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 20, scale: 0.5 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 1.2 }}
                className="bg-brand-primary text-brand-depth px-4 py-2 rounded-full font-black text-xs shadow-xl shadow-brand-primary/20 flex items-center gap-2"
              >
                <Sparkles size={14} />
                +{p.amount} HASANAT
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 md:px-10 border-b border-brand-border bg-brand-depth/80 backdrop-blur-md">
          <div className="flex items-center gap-6 flex-1">
             <div className="lg:hidden p-2 text-brand-primary" onClick={() => setIsSidebarOpen(true)}>
               <Menu size={24} />
             </div>
             <div className="hidden md:flex items-center gap-4 flex-1 max-w-md relative">
                <Search className="absolute left-4 text-brand-primary/40" size={16} />
                <input 
                  type="text" 
                  placeholder="Deep search through the wisdom..."
                  className="w-full bg-white/5 border border-white/5 rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40 transition-all text-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-10 rounded-full border border-brand-border bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg shadow-brand-primary/5"
             >
                {darkMode ? <Sun size={18} className="text-brand-primary" /> : <Moon size={18} className="text-brand-primary" />}
             </button>
             <div className="w-10 h-10 rounded-full border border-brand-border bg-white/5 flex items-center justify-center text-xs font-bold text-brand-primary shadow-lg shadow-brand-primary/5">
                {level}
             </div>
          </div>
        </header>

      {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-32 md:pb-12">
          <div className="max-w-5xl mx-auto p-4 md:p-12">
            {!currentUser ? (
              <AuthView onSuccess={() => {}} />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                >
                  <Routes location={location}>
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={
                      <HomeView 
                        onNavigate={handleNavigate} 
                        hasanat={hasanat} 
                        level={level} 
                        rank={rank} 
                        levelProgress={levelProgress}
                        versesRead={versesRead}
                        duaCount={duaCount}
                        streak={streak}
                        topUserId={topUserId}
                        currentUser={currentUser}
                      />
                    } />
                    <Route path="/resources" element={
                      <ResourcesView 
                        selectedSurah={selectedSurah}
                        onSelectSurah={setSelectedSurah}
                        searchQuery={searchQuery}
                        bookmarks={bookmarks}
                        onToggleBookmark={toggleBookmark}
                        selectedReciter={selectedReciter}
                        onReciterChange={setSelectedReciter}
                        selectedHadithCollection={selectedHadithCollection}
                        onHadithCollectionChange={setSelectedHadithCollection}
                        initialResId={initialResId}
                        addHasanat={addHasanat}
                        incrementDua={incrementDua}
                        incrementVerse={incrementVerse}
                        language={language}
                      />
                    } />
                    <Route path="/market" element={<MarketView />} />
                    <Route path="/market/:productId" element={<MarketView detailMode />} />
                    <Route path="/bookmarks" element={<BookmarksView bookmarks={bookmarks} onRemoveBookmark={toggleBookmark} onNavigate={handleNavigate} />} />
                    <Route path="/leaderboard" element={<LeaderboardView />} />
                    <Route path="/profile" element={
                      <ProfileView 
                        darkMode={darkMode} 
                        setDarkMode={setDarkMode} 
                        onLogout={handleLogout} 
                        language={language} 
                        setLanguage={setLanguage} 
                      />
                    } />
                    <Route path="/settings" element={<SettingsView darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} language={language} setLanguage={setLanguage} />} />
                    <Route path="/notifications" element={<NotificationsView />} />
                    <Route path="/companion" element={<CompanionView />} />
                    <Route path="/premium" element={<PremiumView />} />
                    <Route path="/qibla" element={<QiblaView />} />
                    <Route path="/ummah" element={<UmmahHubView />} />
                    <Route path="/chat" element={<ChatView isPremium={isPremium} />} />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      {/* Right Rail: Quick Actions - Desktop */}
      <aside className="hidden xl:flex w-20 bg-brand-sidebar border-l border-brand-border flex-col items-center py-8 gap-8 z-30">
        {[
          { icon: LayoutGrid, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
          { icon: SettingsIcon, color: 'text-slate-500', bg: 'bg-white/5' }
        ].map((item, i) => (
          <button key={i} className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center ${item.color} cursor-pointer hover:border hover:border-brand-primary/20 hover:scale-110 transition-all active:scale-95`}>
            <item.icon size={20} />
          </button>
        ))}
        <div className="mt-auto flex flex-col items-center gap-4 text-[10px] text-brand-primary/40 font-mono vertical-text tracking-widest">
          SANCTUARY
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-80 bg-brand-sidebar z-50 p-8 lg:hidden border-r border-brand-border"
            >
               <div className="flex justify-between items-center mb-12">
                  <h2 className="text-xl font-bold text-white uppercase tracking-tighter">HABIBI AI Navigation</h2>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400"><X size={24} /></button>
               </div>
               <nav className="space-y-3">
                 {NAVIGATION_TABS.map((tab) => (
                   <button
                     key={tab.id}
                     onClick={() => { navigate(`/${tab.id}`); setIsSidebarOpen(false); if (tab.id !== 'resources') setSelectedSurah(null); }}
                     className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${activeTab === tab.id ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' : 'text-slate-500'}`}
                   >
                     <span>{tab.label}</span>
                   </button>
                 ))}
               </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lastNotification && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40, x: '-50%' }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: window.innerWidth < 768 ? '-50%' : 0, 
              x: '-50%',
              top: window.innerWidth < 768 ? '50%' : '2rem',
              left: '50%'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: '-50%' }}
            drag="y"
            className="fixed w-[90%] max-w-md glass-panel-purple border-brand-primary p-6 rounded-[2.5rem] z-[999999] shadow-[0_40px_100px_rgba(168,85,247,0.4)] flex gap-6 cursor-pointer backdrop-blur-3xl"
            onClick={() => {
              if (lastNotification.actionUrl) {
                if (lastNotification.actionUrl.startsWith('#')) {
                  navigate(`/${lastNotification.actionUrl.substring(1)}`);
                } else {
                  navigate(lastNotification.actionUrl);
                }
              } else {
                navigate('/notifications');
              }
              setLastNotification(null);
            }}
          >
            <div className="w-16 h-16 bg-brand-primary rounded-3xl flex items-center justify-center text-brand-depth flex-shrink-0 shadow-lg shadow-brand-primary/20">
              <Bell size={32} className="animate-bounce" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">Divine Notification</p>
              <h5 className="text-lg font-black text-white line-clamp-1">{lastNotification.title}</h5>
              <p className="text-sm text-slate-400 line-clamp-2 mt-1 leading-relaxed">{lastNotification.body}</p>
              <div className="mt-3 flex items-center gap-2">
                 <div className="w-1 h-1 rounded-full bg-brand-primary animate-pulse" />
                 <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Tap to view</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

