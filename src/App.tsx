import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Bookmark, 
  Settings as SettingsIcon, 
  Search, 
  Mic,
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
  Crown,
  Terminal,
  Volume2,
  Clock,
  HelpCircle
} from 'lucide-react';
import { NAVIGATION_TABS, SURAH_LIST, JUZ_LIST } from './constants.ts';
import { Surah, Ayah } from './types.ts';
import { auth, signInWithGoogle, db, handleRedirectResult } from './lib/firebase.ts';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { restDbClient } from './lib/restDbClient.ts';
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  getDoc, 
  getDocs,
  updateDoc,
  collection,
  query,
  or,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  increment
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
import OnboardingView from './components/OnboardingView.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import UmmahHubView from './components/UmmahHubView.tsx';
import HeadsUpNotification from './components/HeadsUpNotification.tsx';
import { notificationService } from './services/notificationService.ts';
import WalkthroughTour from './components/WalkthroughTour.tsx';

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
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumActivatedAt, setPremiumActivatedAt] = useState<Date | null>(null);
  const [showPremiumGateway, setShowPremiumGateway] = useState(false);
  const [userJoinedAt, setUserJoinedAt] = useState<Date | null>(null);
  const [hasanat, setHasanat] = useState(0);
  const [rank, setRank] = useState('Seeker');
  const [versesRead, setVersesRead] = useState(0);
  const [duaCount, setDuaCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [bookmarks, setBookmarks] = useState<Ayah[]>([]);
  const [initialResId, setInitialResId] = useState<any>(null);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app-language') || 'en';
  });
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        // If we're not currently on a search-related page or the home page, 
        // we might want to navigate to a search results view if we have one.
        // For now, it just updates the global search query.
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  // Auto-trigger tour on first-time login
  useEffect(() => {
    if (currentUser && !needsOnboarding && !authLoading) {
      const tourCompleted = localStorage.getItem('sanctuary_tour_completed');
      if (!tourCompleted) {
        const timer = setTimeout(() => {
          setShowTour(true);
          localStorage.setItem('sanctuary_tour_completed', 'true');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser, needsOnboarding, authLoading]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Prayer Scheduler State
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string>>({});
  const lastPlayedRef = useRef<string | null>(null);
  const audioUnlockedRef = useRef<boolean>(false);

  // Audio Unlocking helper for browser autoplay restrictions
  useEffect(() => {
    const unlockAudio = () => {
      if (audioUnlockedRef.current) return;
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
        }
        // Play silent 0.1s audio to completely satisfy browser autoplay policy
        const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAD');
        silentAudio.play().then(() => {
          audioUnlockedRef.current = true;
          console.log("Audio Context unlocked for Adhan notifications.");
          window.removeEventListener('click', unlockAudio);
          window.removeEventListener('touchstart', unlockAudio);
        }).catch(e => {
          console.warn("Silent play failed, waiting for direct gesture...", e);
        });
      } catch (err) {
        console.warn("Audio unlock failed", err);
      }
    };

    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  useEffect(() => {
    const fetchTimings = async () => {
      try {
        const mode = localStorage.getItem('prayer-location-mode') || 'auto';
        let endpoint = '';
        
        if (mode === 'auto') {
          const lat = localStorage.getItem('prayer-lat') || '51.5074';
          const lng = localStorage.getItem('prayer-lng') || '-0.1278';
          endpoint = `/api/proxy/aladhan/timings?latitude=${lat}&longitude=${lng}&method=2`;
        } else {
          const city = localStorage.getItem('prayer-city') || 'London';
          const country = localStorage.getItem('prayer-country') || 'UK';
          endpoint = `/api/proxy/aladhan/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`;
        }

        const res = await fetch(endpoint);
        const data = await res.json();
        if (data.data && data.data.timings) {
          setPrayerTimes(data.data.timings);
          notificationService.schedulePrayerNotifications(data.data.timings);
        }
      } catch (e) {
        console.warn("Global prayer sync failed", e);
      }
    };

    fetchTimings();

    const handleUpdate = () => {
      fetchTimings();
    };
    window.addEventListener('prayer_times_updated', handleUpdate);

    const interval = setInterval(fetchTimings, 60 * 60 * 1000); // Refetch hourly
    return () => {
      clearInterval(interval);
      window.removeEventListener('prayer_times_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const checkPrayerTimes = () => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const prayersToCheck = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      
      for (const prayer of prayersToCheck) {
        if (prayerTimes[prayer] === timeStr && lastPlayedRef.current !== prayer) {
          lastPlayedRef.current = prayer;
          triggerAdhan(prayer);
          break;
        }
      }
    };

    const triggerAdhan = (prayer: string) => {
      // Check if notifications are globally enabled and enabled for this specific prayer
      const savedReminders = localStorage.getItem('prayer-reminders');
      const settings = savedReminders ? JSON.parse(savedReminders) : { 
        Global: true, Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true 
      };
      
      if (!settings.Global || settings[prayer] === false) {
        return;
      }

      // Find preferred Adhan sound
      const preferredId = localStorage.getItem('preferred-adhan-id') || 'makkah';
      const customUrl = localStorage.getItem('preferred-adhan-custom-url');
      
      let audioUrl = 'https://www.islamcan.com/audio/adhan/azan2.mp3'; // Default Makkah
      
      if (preferredId === 'custom' && customUrl) {
        audioUrl = customUrl;
      } else {
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
        audioUrl = adhanMap[preferredId] || audioUrl;
      }

      notificationService.notify(
        `Time for ${prayer}`,
        `The call to prayer for ${prayer} has begun. Come to success.`,
        'prayer',
        '/resources'
      );

      const audio = new Audio(audioUrl);
      audio.play().catch(e => {
        console.warn("Adhan autoplay failed, trying fallback trigger", e);
        // Force context resume and retry play
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            ctx.resume().then(() => {
              audio.play().catch(innerErr => console.warn("Failed play on forced resume", innerErr));
            });
          }
        } catch (ctxErr) {
          console.warn("Ctx resume retry failed", ctxErr);
        }
      });
    };

    const interval = setInterval(checkPrayerTimes, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [prayerTimes]);

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Dynamic Splash Control: 
    // Wait for auth to be ready, but ensure a minimum of 1.2s for the animation.
    // Also provide a safety fallback at 5s if something hangs.
    
    let timer: any;
    if (!authLoading) {
      // Auth is ready! Wait a moment for splash animation to feel right then hide.
      timer = setTimeout(() => {
        setShowSplash(false);
      }, 1200);
    } else {
      // Still loading auth? Safety fallback to show app anyway after 5 seconds.
      timer = setTimeout(() => {
        setShowSplash(false);
      }, 5000);
    }

    return () => clearTimeout(timer);
  }, [authLoading]);

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
    if (!currentUser || currentUser.uid.startsWith('local_')) return;

    // Leaderboard listener to find top user (Habibi Crown)
    const q = query(
      collection(db, 'users'),
      orderBy('hasanat', 'desc'),
      where('hasanat', '>', 0)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const topUser = snapshot.docs[0];
        setTopUserId(topUser.id);

        // Habibi King Reward: If I am the top user, grant premium!
        if (currentUser && topUser.id === currentUser.uid) {
          const userRef = doc(db, 'users', currentUser.uid);
          const topUserData = topUser.data();
          
          // Only update if not already handled to avoid infinite loops
          if (!topUserData.isPremium || !topUserData.isHabibiKing) {
            updateDoc(userRef, { 
              isPremium: true,
              isHabibiKing: true,
              habibiKingAwardedAt: serverTimestamp()
            }).then(() => {
              if (!isPremium) {
                setIsPremium(true);
                notificationService.notify(
                  'Sacred Ascension',
                  'You have been crowned the Habibi King! Premium Sanctuary access is yours.',
                  'system',
                  '/leaderboard'
                );
              }
            }).catch(e => console.error("Failed to award Habibi King status", e));
          }
        }
      }
    }, (e) => {
      handleFirestoreError(e, OperationType.GET, 'users');
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    // Sync hasanat if changed from Firestore/LocalStorage
    if (currentUser) {
      if (currentUser.uid.startsWith('local_')) {
        const key = `sanctuary_profile_${currentUser.uid}`;
        const existingData = localStorage.getItem(key);
        if (existingData) {
          const data = JSON.parse(existingData);
          if (data.hasanat) setHasanat(data.hasanat);
        }
      } else {
        const userRef = doc(db, 'users', currentUser.uid);
        const syncHasanat = async () => {
          try {
            const snap = await getDoc(userRef);
            if (snap.exists()) {
               const data = snap.data();
               if (data.hasanat) setHasanat(data.hasanat);
            }
          } catch (e) {
            console.warn("Sync Hasanat fallback enabled:", e);
            const cacheKey = `sanctuary_cache_profile_${currentUser.uid}`;
            const existingData = localStorage.getItem(cacheKey);
            if (existingData) {
              const data = JSON.parse(existingData);
              if (data.hasanat) setHasanat(data.hasanat);
            }
          }
        };
        syncHasanat();
      }
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
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    // Backward compatibility for .dark class - these themes have dark backgrounds
    if (theme === 'dark' || theme === 'purple' || theme === 'light' || theme === 'light-green') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Derived for components that still expect boolean
  const darkMode = theme === 'dark' || theme === 'purple';
  const setDarkMode = (isDark: boolean) => setTheme(isDark ? 'dark' : 'light');

  const lastInteractionRef = useRef<Record<string, any>>({});
  const initialLoadDone = useRef(false);

  // Global Chat Listener for Notifications
  useEffect(() => {
    if (!currentUser || currentUser.uid.startsWith('local_')) return;

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
        const communityNotifs = localStorage.getItem('community-notifs') !== 'false';
        if (!communityNotifs) return;

        if (change.type === 'modified') {
          const room = { id: change.doc.id, ...change.doc.data() } as any;
          const lastTime = lastInteractionRef.current[room.id] || 0;
          const newTime = room.updatedAt?.toMillis() || 0;

          // If message is newer AND not from me
          if (newTime > lastTime && room.lastSenderId !== currentUser.uid) {
            const getRoomNotifName = (r: any) => {
              if (r.type === 'group') return r.name;
              if (r.participantNames && currentUser) {
                const otherId = r.participants?.find((uid: string) => uid !== currentUser.uid);
                if (otherId && r.participantNames[otherId]) {
                  return r.participantNames[otherId];
                }
              }
              return r.name;
            };

            notificationService.notify(
              getRoomNotifName(room),
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
    if (!currentUser || currentUser.uid.startsWith('local_')) return;

    const q = query(
      collection(db, 'friend_requests'),
      where('toId', '==', currentUser.uid),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const communityNotifs = localStorage.getItem('community-notifs') !== 'false';
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && communityNotifs) {
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
    if (!currentUser || currentUser.uid.startsWith('local_')) return;

    const q = query(
      collection(db, 'friend_requests'),
      where('fromId', '==', currentUser.uid),
      where('status', '==', 'accepted'),
      orderBy('acceptedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const communityNotifs = localStorage.getItem('community-notifs') !== 'false';
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified' && communityNotifs) {
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
    if (!currentUser || currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_')) {
      if (!currentUser || currentUser.uid.startsWith('local_')) {
        setBookmarks([]);
      }
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
    setHasanat(prev => prev + amount);

    if (currentUser) {
      if (currentUser.uid.startsWith('local_')) {
        const key = `sanctuary_profile_${currentUser.uid}`;
        const existingRaw = localStorage.getItem(key);
        if (existingRaw) {
          const existing = JSON.parse(existingRaw);
          existing.hasanat = (existing.hasanat || 0) + amount;
          localStorage.setItem(key, JSON.stringify(existing));
        }
      } else {
        const userRef = doc(db, 'users', currentUser.uid);
        updateDoc(userRef, { 
          hasanat: increment(amount)
        }).catch(e => {
          console.warn("Firestore hasanat integration offline. Storing in cache...", e);
          const cacheKey = `sanctuary_cache_profile_${currentUser.uid}`;
          const existingRaw = localStorage.getItem(cacheKey);
          const existing = existingRaw ? JSON.parse(existingRaw) : {};
          existing.hasanat = (existing.hasanat || 0) + amount;
          localStorage.setItem(cacheKey, JSON.stringify(existing));
        });
      }
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

  const updateStreak = () => {
    setStreak(prev => prev + 1);
    addHasanat(100);
    if (currentUser) {
      if (currentUser.uid.startsWith('local_')) {
        const key = `sanctuary_profile_${currentUser.uid}`;
        const existingRaw = localStorage.getItem(key);
        if (existingRaw) {
          const existing = JSON.parse(existingRaw);
          existing.streak = (existing.streak || 0) + 1;
          localStorage.setItem(key, JSON.stringify(existing));
        }
      } else {
        updateDoc(doc(db, 'users', currentUser.uid), {
          streak: increment(1)
        }).catch(e => {
          console.warn("Firestore streak update offline, storing in cache...", e);
          const cacheKey = `sanctuary_cache_profile_${currentUser.uid}`;
          const existingRaw = localStorage.getItem(cacheKey);
          const existing = existingRaw ? JSON.parse(existingRaw) : {};
          existing.streak = (existing.streak || 0) + 1;
          localStorage.setItem(cacheKey, JSON.stringify(existing));
        });
      }
    }
  };

  const incrementVerse = () => {
    setVersesRead(prev => prev + 1);
    addHasanat(10);
  };

  const level = Math.floor(hasanat / 500) + 1;
  const levelProgress = ((hasanat % 500) / 500) * 100;
  const prevLevel = useRef(level);

  useEffect(() => {
    if (level > prevLevel.current) {
      notificationService.notify(
        'Spiritual Ascension',
        `SubhanAllah! You have ascended to Level ${level}. Your aura glows brighter!`,
        'system',
        '/profile'
      );
      prevLevel.current = level;
    }
  }, [level]);

  useEffect(() => {
    // Update rank based on level
    if (level > 20) setRank('Legacy of Light');
    else if (level > 15) setRank('Gnostic');
    else if (level > 10) setRank('Devotee');
    else if (level > 5) setRank('Vanguard');
    else setRank('Seeker');
  }, [level]);

  useEffect(() => {
    // Force a one-time clean logout to let user see and test the authentication flow again
    const forceLogoutKey = 'sanctuary_dynamic_reauth_check_may-20';
    if (!localStorage.getItem(forceLogoutKey)) {
      localStorage.setItem(forceLogoutKey, 'triggered');
      localStorage.removeItem('local-session-active');
      localStorage.removeItem('saved-auth-email');
      signOut(auth).then(() => {
        window.location.reload();
      }).catch(() => {
        window.location.reload();
      });
    }
  }, []);

  useEffect(() => {
    // Complete the redirect-based authentication sign-in flow
    const completeRedirectAuth = async () => {
      try {
        const user = await handleRedirectResult();
        if (user) {
          console.log("Logged in:", user);
        }
      } catch (err) {
        console.error("Firebase redirect auth failed to resolve:", err);
      }
    };
    completeRedirectAuth();
  }, []);

  useEffect(() => {
    // Intercept with secure custom REST Cloud Sync Account (highly optimized for Capacitor / Android APKs)
    if (restDbClient.isLoggedIn()) {
      const u = restDbClient.getUser();
      if (u) {
        const simulatedUser = {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`
        };
        setCurrentUser(simulatedUser);
        setAuthLoading(false);
        setHasanat(u.hasanat || 0);
        setStreak(u.streak || 0);
        setNeedsOnboarding(false);
        
        // Fetch fresh copy from server in the background
        restDbClient.getProfile().then(latestUser => {
          setHasanat(latestUser.hasanat || 0);
          setStreak(latestUser.streak || 0);
          if (Array.isArray(latestUser.bookmarks)) {
            setBookmarks(latestUser.bookmarks);
          }
        }).catch(e => {
          console.warn("Initial REST profile fetch failed, using local cached profile details", e);
        });
        return;
      }
    }

    // Generate simulated user if local session is active
    const checkLocalSession = () => {
      const isLocal = localStorage.getItem('local-session-active') === 'true';
      const savedEmail = localStorage.getItem('saved-auth-email');
      if (isLocal && savedEmail) {
        const uid = 'local_' + btoa(savedEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
        return {
          uid,
          email: savedEmail,
          displayName: savedEmail.split('@')[0],
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
          isAnonymous: true,
          emailVerified: false,
          providerData: []
        };
      }
      return null;
    };

    const localUser = checkLocalSession();

    // If we have a local session, force-resolve auth screen early if needed
    if (localUser) {
      setAuthLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      // Prioritize firebase user, fall back to virtual simulated local user
      const user = fbUser || localUser || checkLocalSession();
      if (user) {
        setCurrentUser(user);
        
        try {
          let userRef = doc(db, 'users', user.uid);
          let docSnap: any = null;
          
          const savedEmail = localStorage.getItem('saved-auth-email');
          let migratedLocalData: any = null;
          const isTransitioning = !user.uid.startsWith('local_') && localStorage.getItem('local-session-active') === 'true';
          
          if (isTransitioning && savedEmail) {
            const localUid = 'local_' + btoa(savedEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
            const localProfileKey = `sanctuary_profile_${localUid}`;
            const localProfileRaw = localStorage.getItem(localProfileKey);
            if (localProfileRaw) {
              try {
                migratedLocalData = JSON.parse(localProfileRaw);
              } catch (e) {
                console.warn("Failed to parse local profile for migrating payload", e);
              }
            }
          }
          
          if (user.uid.startsWith('local_')) {
            const cacheKey = `sanctuary_profile_${user.uid}`;
            const localDataRaw = localStorage.getItem(cacheKey);
            docSnap = {
              exists: () => !!localDataRaw,
              data: () => localDataRaw ? JSON.parse(localDataRaw) : null
            };
          } else {
            try {
              docSnap = await getDoc(userRef);
            } catch (dbErr) {
              console.warn("Firestore blocked, falling back to local profile replication...", dbErr);
              const cacheKey = `sanctuary_cache_profile_${user.uid}`;
              const localDataRaw = localStorage.getItem(cacheKey);
              docSnap = {
                exists: () => !!localDataRaw,
                data: () => localDataRaw ? JSON.parse(localDataRaw) : null
              };
            }
          }
          
          if (docSnap && !docSnap.exists() && !user.uid.startsWith('local_')) {
            const targetEmail = (user.email || savedEmail || '').toLowerCase();
            if (targetEmail) {
              try {
                const usersColl = collection(db, 'users');
                const qEmail = query(usersColl, where('email', '==', targetEmail));
                const qEmailSnap = await getDocs(qEmail);
                if (!qEmailSnap.empty) {
                  // Direct pre-provisioned template exists in users collection!
                  const existingDoc = qEmailSnap.docs[0];
                  const existingData = existingDoc.data();
                  
                  // Re-provision at the authentic authenticated UID
                  userRef = doc(db, 'users', user.uid);
                  await setDoc(userRef, {
                    ...existingData,
                    uid: user.uid,
                    lastSeen: serverTimestamp(),
                    onboardingCompleted: true // preloaded profiles ready to engage
                  });
                  
                  // Delete the placeholder if it was different
                  if (existingDoc.id !== user.uid) {
                    await deleteDoc(doc(db, 'users', existingDoc.id));
                  }
                  
                  docSnap = await getDoc(userRef);
                  console.log("Adopted pre-provisioned profile successfully!");
                }
              } catch (e) {
                console.warn("Pre-provisioned adoption error:", e);
              }
            }
          }

          if (docSnap && !docSnap.exists() && savedEmail && !user.uid.startsWith('local_')) {
            try {
              // Check if there is an existing secondary profile mapping under this email
              const emailProfileRef = doc(db, 'profiles', savedEmail.toLowerCase());
              const emailProfileSnap = await getDoc(emailProfileRef);
              if (emailProfileSnap.exists()) {
                const profileData = emailProfileSnap.data();
                if (profileData.uid && profileData.uid !== user.uid) {
                  // Instantly bind to the existing user profile UID!
                  userRef = doc(db, 'users', profileData.uid);
                  docSnap = await getDoc(userRef);
                }
              }
            } catch (e) {
              console.warn("Secondary profile resolve failed or blocked", e);
            }
          }
          
          if (docSnap && docSnap.exists()) {
            const data = docSnap.data();
            
            let updatedHasanat = data.hasanat || 0;
            let updatedStreak = data.streak || 0;
            let updatedVersesRead = data.versesRead || 0;
            let updatedDuaCount = data.duaCount || 0;
            let updatedBio = data.bio || '';
            let updatedDisplayName = data.displayName || user.displayName || '';

            if (migratedLocalData) {
              updatedHasanat += (migratedLocalData.hasanat || 0);
              updatedStreak = Math.max(updatedStreak, migratedLocalData.streak || 0);
              updatedVersesRead += (migratedLocalData.versesRead || 0);
              updatedDuaCount += (migratedLocalData.duaCount || 0);
              if (!updatedBio && migratedLocalData.bio) updatedBio = migratedLocalData.bio;
              if ((!updatedDisplayName || updatedDisplayName.startsWith('Seeker_')) && migratedLocalData.displayName) {
                updatedDisplayName = migratedLocalData.displayName;
              }
              
              try {
                await updateDoc(userRef, {
                  hasanat: updatedHasanat,
                  streak: updatedStreak,
                  versesRead: updatedVersesRead,
                  duaCount: updatedDuaCount,
                  bio: updatedBio,
                  displayName: updatedDisplayName,
                  lastSeen: serverTimestamp()
                });
              } catch (uErr) {
                console.warn("Failed to write migrated local data directly to firestore:", uErr);
              }
              
              localStorage.removeItem('local-session-active');
              setTimeout(() => {
                notificationService.notify('Progress Secured', `Masha'Allah! Your local guest profile content (${migratedLocalData.hasanat || 0} Hasanat) has been merged and secured in the cloud.`, 'system');
              }, 1000);
            }

            const rawPremium = data.isPremium || migratedLocalData?.isPremium || false;
            let rawActivatedAt = data.premiumActivatedAt 
              ? (data.premiumActivatedAt.toDate ? data.premiumActivatedAt.toDate() : new Date(data.premiumActivatedAt)) 
              : (migratedLocalData?.premiumActivatedAt ? new Date(migratedLocalData.premiumActivatedAt) : null);
            
            if (rawPremium && !rawActivatedAt) {
              rawActivatedAt = new Date();
              if (!user.uid.startsWith('local_')) {
                try {
                  updateDoc(userRef, { premiumActivatedAt: serverTimestamp() });
                } catch (err) {
                  console.warn("Failed to set default premiumActivatedAt", err);
                }
              } else {
                const key = `sanctuary_profile_${user.uid}`;
                const localDataRaw = localStorage.getItem(key);
                if (localDataRaw) {
                  const localData = JSON.parse(localDataRaw);
                  localData.premiumActivatedAt = rawActivatedAt.toISOString();
                  localStorage.setItem(key, JSON.stringify(localData));
                }
              }
            }

            let finalPremium = rawPremium;
            if (rawPremium && rawActivatedAt) {
              const elapsed = Date.now() - rawActivatedAt.getTime();
              const thirtyDays = 30 * 24 * 60 * 60 * 1000;
              if (elapsed >= thirtyDays) {
                finalPremium = false;
                if (!user.uid.startsWith('local_')) {
                  try {
                    updateDoc(userRef, { isPremium: false });
                  } catch (err) {
                    console.warn("Failed to auto-expire premium on Firestore", err);
                  }
                } else {
                  const key = `sanctuary_profile_${user.uid}`;
                  const localDataRaw = localStorage.getItem(key);
                  if (localDataRaw) {
                    const localData = JSON.parse(localDataRaw);
                    localData.isPremium = false;
                    localStorage.setItem(key, JSON.stringify(localData));
                  }
                }
              }
            }

            setIsPremium(finalPremium);
            setPremiumActivatedAt(finalPremium ? rawActivatedAt : null);
            setUserJoinedAt(data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date());
            setHasanat(updatedHasanat);
            
            // If onboarding specifically hasn't been completed
            if (data.onboardingCompleted === false || !updatedDisplayName || updatedDisplayName.startsWith('Seeker_')) {
              setNeedsOnboarding(true);
            } else {
              setNeedsOnboarding(false);
            }
          } else {
            // Document doesn't exist? Create a minimal one to establish presence
            const savedEmailOrEmpty = savedEmail || '';
            const tempOnboardingName = localStorage.getItem('temp_onboarding_name');
            const defaultDisplayName = tempOnboardingName || migratedLocalData?.displayName || (user as any).displayName || (user.email ? user.email.split('@')[0] : (savedEmailOrEmpty ? savedEmailOrEmpty.split('@')[0] : `Seeker_${user.uid.substring(0, 5)}`));
            
            if (tempOnboardingName) {
              localStorage.removeItem('temp_onboarding_name');
            }

            const newProfile: any = {
              uid: user.uid,
              email: user.email || savedEmailOrEmpty,
              emailVerified: (user as any).emailVerified || false,
              displayName: defaultDisplayName,
              photoURL: migratedLocalData?.photoURL || (user as any).photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
              hasanat: migratedLocalData?.hasanat || 0,
              streak: migratedLocalData?.streak || 0,
              versesRead: migratedLocalData?.versesRead || 0,
              duaCount: migratedLocalData?.duaCount || 0,
              bio: migratedLocalData?.bio || '',
              isPremium: migratedLocalData?.isPremium || false,
              onboardingCompleted: migratedLocalData?.onboardingCompleted || false
            };
            
            if (user.uid.startsWith('local_')) {
              newProfile.createdAt = new Date().toISOString();
              newProfile.lastSeen = new Date().toISOString();
              localStorage.setItem(`sanctuary_profile_${user.uid}`, JSON.stringify(newProfile));
            } else {
              try {
                await setDoc(userRef, {
                  ...newProfile,
                  createdAt: serverTimestamp(),
                  lastSeen: serverTimestamp()
                });
              } catch (setErr) {
                console.warn("onboarding initial setDoc failed, cache set instead", setErr);
                newProfile.createdAt = new Date().toISOString();
                newProfile.lastSeen = new Date().toISOString();
                localStorage.setItem(`sanctuary_cache_profile_${user.uid}`, JSON.stringify(newProfile));
              }

              if (migratedLocalData) {
                localStorage.removeItem('local-session-active');
                setTimeout(() => {
                  notificationService.notify('Profile Secured', `Masha'Allah! Your temporary profile has been secured. Welcome to the Cloud Sanctuary!`, 'system');
                }, 1000);
              }
            }
            setHasanat(newProfile.hasanat || 0);
            setIsPremium(newProfile.isPremium || false);
            setPremiumActivatedAt(newProfile.premiumActivatedAt ? new Date(newProfile.premiumActivatedAt) : null);
            setNeedsOnboarding(newProfile.onboardingCompleted === false);
          }
 
          // Background update for lastSeen
          if (user.uid.startsWith('local_')) {
            const key = `sanctuary_profile_${user.uid}`;
            const existingRaw = localStorage.getItem(key);
            if (existingRaw) {
              const existing = JSON.parse(existingRaw);
              existing.lastSeen = new Date().toISOString();
              localStorage.setItem(key, JSON.stringify(existing));
            }
          } else {
            updateDoc(userRef, {
              lastSeen: serverTimestamp()
            }).catch(() => {
              const key = `sanctuary_cache_profile_${user.uid}`;
              const existingRaw = localStorage.getItem(key);
              if (existingRaw) {
                const existing = JSON.parse(existingRaw);
                existing.lastSeen = new Date().toISOString();
                localStorage.setItem(key, JSON.stringify(existing));
              }
            });
          }
          
        } catch (error: any) {
          console.error("Auth sync error:", error);
        } finally {
          setAuthLoading(false);
        }
      } else {
        // If there's an active local session flag but fbUser is null, double-check local user setup
        const localSessionActive = localStorage.getItem('local-session-active') === 'true';
        if (localSessionActive && localUser) {
          setCurrentUser(localUser);
          setAuthLoading(false);
        } else {
          setCurrentUser(null);
          setHasanat(0);
          setNeedsOnboarding(false);
          setAuthLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-sync REST user data with server database (Android-compatible Cloud Database)
  useEffect(() => {
    if (currentUser && currentUser.uid.startsWith('rest_') && restDbClient.isLoggedIn()) {
      const timeoutId = setTimeout(() => {
        restDbClient.sync(hasanat, streak, bookmarks).catch(err => {
          console.warn("REST auto-sync failed:", err);
        });
      }, 2000); // Debounce to prevent rapid network calls on frequent updates
      return () => clearTimeout(timeoutId);
    }
  }, [hasanat, streak, bookmarks, currentUser]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('local-session-active');
      localStorage.removeItem('saved-auth-email');
      if (restDbClient.isLoggedIn()) {
        restDbClient.logout();
      }
      try {
        await signOut(auth);
      } catch (authErr) {
        console.warn("Sign out from Firebase failed or uninitialized, proceeding with local clear...", authErr);
      }
      // Force page reload to drop any active contexts clean
      window.location.reload();
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
          'Sanctuary Version v1.3.5 is now live. New features: Notification Center and enhanced spiritual companion.',
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
        const communityNotifs = localStorage.getItem('community-notifs') !== 'false';
        if (!communityNotifs) return;
        
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
    } else if (tab === 'quran') {
      setInitialResId('quran');
      if (extra?.surahNumber) {
        const surah = SURAH_LIST.find(s => s.number === extra.surahNumber);
        if (surah) setSelectedSurah(surah);
      } else {
        setSelectedSurah(null);
      }
      navigate('/resources');
      return;
    } else if (tab === 'juz') {
      setInitialResId('quran');
      navigate('/resources', { state: { activeRes: 'quran', juzIndex: extra?.juzIndex } });
      return;
    } else {
      setInitialResId(null);
    }
    
    navigate(`/${tab}`);
    if (tab !== 'resources') setSelectedSurah(null);
  };

  useEffect(() => {
    const handleAppNavigate = (e: any) => {
      const { tab, extra } = e.detail;
      handleNavigate(tab, extra);
    };
    window.addEventListener('app_navigate', handleAppNavigate);
    return () => window.removeEventListener('app_navigate', handleAppNavigate);
  }, [handleNavigate]);

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

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!currentUser) {
    return (
      <div className="fixed inset-0 flex text-slate-200 overflow-y-auto font-sans selection:bg-brand-primary/30 islamic-pattern bg-brand-depth">
        <HeadsUpNotification />
        <AuthView onSuccess={() => setAuthLoading(true)} />
      </div>
    );
  }

  if (needsOnboarding) {
    return (
      <div className="fixed inset-0 flex text-slate-200 overflow-y-auto font-sans selection:bg-brand-primary/30 islamic-pattern bg-brand-depth">
        <HeadsUpNotification />
        <div className="w-full max-w-2xl mx-auto px-4 py-8 md:py-16">
          <OnboardingView user={currentUser} onComplete={() => setNeedsOnboarding(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex text-slate-200 overflow-hidden font-sans selection:bg-brand-primary/30 islamic-pattern">
      <HeadsUpNotification />
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
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] max-h-[800px] bg-brand-primary/5 blur-[120px] md:blur-[150px] rounded-full pointer-events-none z-0"></div>
<div id="trial-info" className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none w-full flex justify-center px-6">
<AnimatePresence>
{currentUser && !isPremium && !trialExpired && showTrial && (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="bg-brand-sidebar/90 md:bg-amber-500/20 backdrop-blur-xl border border-amber-500/30 px-4 md:px-6 py-3 md:py-2 rounded-[2rem] md:rounded-full shadow-2xl flex items-center gap-3"
  >
           <div className="w-8 h-8 md:w-6 md:h-6 bg-amber-500/20 rounded-xl md:rounded-lg flex items-center justify-center text-amber-500 shrink-0">
             <Sparkles size={14} className="animate-pulse" />
           </div>
           <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-3 leading-none">
             <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1 md:mb-0">3-Day Trial Active</p>
             <div className="hidden md:block w-[1px] h-3 bg-amber-500/30" />
             <p className="text-[9px] font-bold text-white/40">
                {Math.ceil((3 * 24 * 60 * 60 * 1000 - (Date.now() - (userJoinedAt?.getTime() || 0))) / (1000 * 60 * 60))} Hours Left
             </p>
           </div>
  </motion.div>
)}
{currentUser && isPremium && premiumActivatedAt && showTrial && (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="bg-brand-sidebar/90 md:bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 px-4 md:px-6 py-3 md:py-2 rounded-[2rem] md:rounded-full shadow-2xl flex items-center gap-3"
  >
           <div className="w-8 h-8 md:w-6 md:h-6 bg-emerald-500/20 rounded-xl md:rounded-lg flex items-center justify-center text-emerald-500 shrink-0">
             <Crown size={14} className="animate-pulse text-emerald-400" />
           </div>
           <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-3 leading-none">
             <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 md:mb-0">Premium Active</p>
             <div className="hidden md:block w-[1px] h-3 bg-emerald-500/30" />
             <p className="text-[9px] font-bold text-white/70">
                {(() => {
                  const elapsed = Date.now() - premiumActivatedAt.getTime();
                  const remainingMs = 30 * 24 * 60 * 60 * 1000 - elapsed;
                  const daysLeft = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
                  const hoursLeft = Math.ceil(remainingMs / (1000 * 60 * 60));
                  if (daysLeft > 1) {
                    return `${daysLeft} Days Left`;
                  } else {
                    return `${hoursLeft > 0 ? hoursLeft : 0} Hours Left`;
                  }
                })()}
             </p>
           </div>
  </motion.div>
)}
</AnimatePresence>
</div>

      {((currentUser && !isPremium && trialExpired) || showPremiumGateway) && (
        <PremiumGateway onActivate={async () => {
          if (currentUser) {
             const now = new Date();
             if (currentUser.uid.startsWith('local_')) {
                const key = `sanctuary_profile_${currentUser.uid}`;
                const localDataRaw = localStorage.getItem(key);
                if (localDataRaw) {
                   const localData = JSON.parse(localDataRaw);
                   localData.isPremium = true;
                   localData.premiumActivatedAt = now.toISOString();
                   localStorage.setItem(key, JSON.stringify(localData));
                }
             } else {
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, { 
                  isPremium: true,
                  premiumActivatedAt: serverTimestamp()
                });
             }
             setIsPremium(true);
             setPremiumActivatedAt(now);
             setShowPremiumGateway(false);
             notificationService.notify('Sanctuary Unlocked', 'Masha\'Allah! Your 30-day Premium Sanctuary access is now active.', 'system');
          }
        }} />
      )}

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-brand-sidebar/85 backdrop-blur-xl border-b border-brand-border z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <BookOpen size={16} className="text-brand-depth" />
          </div>
          <span className="text-xs font-black text-white tracking-widest uppercase text-nowrap">HABIBI</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex items-baseline gap-1 px-2.5 py-1 bg-brand-primary/10 rounded-full border border-brand-primary/20">
              <span className="text-[8px] font-black text-brand-primary uppercase">Hasanat</span>
              <span className="text-xs font-black text-white font-mono">{hasanat.toLocaleString()}</span>
           </div>
           <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 rounded-full border border-brand-border bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
           >
              {darkMode ? <Sun size={14} className="text-brand-primary" /> : <Moon size={14} className="text-brand-primary" />}
           </button>
           <button 
              onClick={() => setShowTour(true)}
              className="w-8 h-8 rounded-full border border-brand-border bg-white/5 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-brand-primary transition-colors"
              title="Spiritual Tour & Guide"
           >
              <HelpCircle size={14} />
           </button>
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="p-1 text-slate-400 hover:text-white transition-colors"
             title="Open Navigation"
           >
             <LayoutGrid size={20} />
           </button>
        </div>
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
              Medal,
              User: UserIcon
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
      <aside className={`hidden md:flex flex-col h-full bg-brand-sidebar border-r border-brand-border z-30 transition-[width,opacity] duration-300 ease-in-out flex-shrink-0 ${['home', 'settings', 'companion', 'premium', 'profile', 'ummah'].includes(activeTab) ? 'w-0 opacity-0 pointer-events-none' : 'w-80 opacity-100'}`}>
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
        <header className="hidden md:flex h-20 items-center justify-between px-6 md:px-10 border-b border-brand-border bg-brand-depth/80 backdrop-blur-md">
          <div className="flex items-center gap-6 flex-1">
             <div className="lg:hidden p-2 text-brand-primary" onClick={() => setIsSidebarOpen(true)}>
               <Menu size={24} />
             </div>
             <div className="hidden md:flex items-center gap-4 flex-1 max-w-md relative">
                <Search className="absolute left-4 text-brand-primary/40" size={16} />
                <input 
                  type="text" 
                  placeholder="Deep search through the wisdom..."
                  className="w-full bg-white/5 border border-white/5 rounded-full pl-11 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40 transition-all text-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  onClick={toggleListening}
                  className={`absolute right-4 p-1.5 rounded-lg transition-all ${isListening ? 'text-brand-primary bg-brand-primary/10 animate-pulse' : 'text-slate-500 hover:text-white'}`}
                  title="Voice Search"
                >
                  <Mic size={16} />
                </button>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             {currentUser && topUserId === currentUser.uid && (
                <div className="w-10 h-10 rounded-full border border-yellow-500 bg-yellow-500/10 flex items-center justify-center text-yellow-500 shadow-lg shadow-yellow-500/20" title="Habibi King">
                   <Crown size={18} />
                </div>
             )}
             <button 
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-10 rounded-full border border-brand-border bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg shadow-brand-primary/5"
             >
                {darkMode ? <Sun size={18} className="text-brand-primary" /> : <Moon size={18} className="text-brand-primary" />}
             </button>
             <button 
                onClick={() => setShowTour(true)}
                className="w-10 h-10 rounded-full border border-brand-border bg-white/5 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-brand-primary transition-colors shadow-lg shadow-brand-primary/5"
                title="Spiritual Tour & Guide"
             >
                <HelpCircle size={18} />
             </button>
             <div className="flex items-baseline gap-1.5 px-3 py-1.5 bg-brand-primary/10 rounded-full border border-brand-primary/20">
                <span className="text-[10px] font-black text-brand-primary uppercase">Hasanat</span>
                <span className="text-sm font-black text-white font-mono">{hasanat.toLocaleString()}</span>
             </div>
             <div className="w-10 h-10 rounded-full border border-brand-border bg-white/5 flex items-center justify-center text-xs font-bold text-brand-primary shadow-lg shadow-brand-primary/5">
                {level}
             </div>
          </div>
        </header>

      {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pt-16 md:pt-0 pb-32 md:pb-12">
          <div className="max-w-5xl mx-auto p-4 md:p-12">
            {currentUser && (
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
                        updateStreak={updateStreak}
                      />
                    } />
                    <Route path="/resources" element={
                      <ResourcesView 
                        selectedSurah={selectedSurah}
                        onSelectSurah={setSelectedSurah}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
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
                        isPremium={isPremium || isTrialActive}
                        onShowPremium={() => setShowPremiumGateway(true)}
                        currentUser={currentUser}
                      />
                    } />
                    <Route path="/market" element={<MarketView searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />
                    <Route path="/market/:productId" element={<MarketView detailMode searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />
                    <Route path="/bookmarks" element={<BookmarksView bookmarks={bookmarks} onRemoveBookmark={toggleBookmark} onNavigate={handleNavigate} />} />
                    <Route path="/leaderboard" element={<LeaderboardView searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentUser={currentUser} currentHasanat={hasanat} />} />
                    <Route path="/profile" element={
                      <ProfileView 
                        theme={theme}
                        setTheme={setTheme}
                        darkMode={darkMode} 
                        setDarkMode={setDarkMode} 
                        onLogout={handleLogout} 
                        language={language} 
                        setLanguage={setLanguage} 
                        isHabibiKing={currentUser && topUserId === currentUser.uid}
                        currentUser={currentUser}
                      />
                    } />
                    <Route path="/settings" element={<SettingsView theme={theme} setTheme={setTheme} darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} language={language} setLanguage={setLanguage} />} />
                    <Route path="/notifications" element={<NotificationsView />} />
                    <Route path="/companion" element={<CompanionView currentUser={currentUser} isPremium={isPremium || isTrialActive} onShowPremium={() => setShowPremiumGateway(true)} addHasanat={addHasanat} />} />
                    <Route path="/premium" element={<PremiumView />} />
                    <Route path="/qibla" element={<QiblaView />} />
                    <Route path="/ummah" element={<UmmahHubView searchQuery={searchQuery} setSearchQuery={setSearchQuery} addHasanat={addHasanat} isPremium={isPremium || isTrialActive} onShowPremium={() => setShowPremiumGateway(true)} />} />
                    <Route path="/chat" element={<ChatView currentUser={currentUser} isPremium={isPremium || isTrialActive} searchQuery={searchQuery} setSearchQuery={setSearchQuery} addHasanat={addHasanat} />} />
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
           HABIBI • ISIS WRISTS
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
                  <h2 className="text-xl font-bold text-white uppercase tracking-tighter">HABIBI Navigation</h2>
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
               <div className="mt-8 pt-8 border-t border-white/10">
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-2">Partner</p>
                    <h4 className="text-white font-black uppercase tracking-widest text-sm">ISIS WRISTS</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Aloha Group Sponsorship</p>
                 </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lastNotification && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[999998]"
              onClick={() => setLastNotification(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
              className="fixed top-1/2 left-1/2 w-[95%] max-w-sm z-[999999]"
            >
            {/* System Notification: Centered Focus System */}
            <div 
              className="bg-[#1C1C1E]/95 backdrop-blur-3xl border border-white/5 p-4 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.7)] flex flex-col gap-4 cursor-pointer active:scale-98 transition-all group overflow-hidden relative"
              onClick={() => {
                if (lastNotification.actionUrl) {
                  if (lastNotification.actionUrl.startsWith('#')) {
                    navigate(`/${lastNotification.actionUrl.substring(1)}`);
                  } else {
                    navigate(lastNotification.actionUrl);
                  }
                }
                setLastNotification(null);
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-[1.4rem] flex items-center justify-center shrink-0 shadow-2xl ${
                  lastNotification.type === 'prayer' ? 'bg-amber-500 text-white shadow-amber-500/20' :
                  lastNotification.type === 'community' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                  'bg-brand-primary text-white shadow-brand-primary/20'
                }`}>
                  {lastNotification.type === 'prayer' ? <Clock size={28} /> :
                   lastNotification.type === 'community' ? <MessageCircle size={28} /> :
                   <Bell size={28} />}
                </div>

                <div className="flex-1 min-w-0 pr-4 mt-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      {lastNotification.type === 'prayer' ? 'Prayer Alert' : 
                       lastNotification.type === 'community' ? 'Ummah Hub' : 
                       'Sanctuary OS'}
                    </p>
                    <span className="text-[9px] text-slate-600 font-bold uppercase">Now</span>
                  </div>
                  <h5 className="text-base font-black text-white leading-tight mb-1">{lastNotification.title}</h5>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium">{lastNotification.body}</p>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex gap-2 pt-1">
                {lastNotification.type === 'community' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/chat'); setLastNotification(null); }}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-500 transition-colors"
                  >
                    Reply
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); setLastNotification(null); }}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>

      <WalkthroughTour 
        isOpen={showTour} 
        onClose={() => setShowTour(false)} 
        onNavigate={handleNavigate} 
        addHasanat={addHasanat} 
      />
    </div>
  );
}

