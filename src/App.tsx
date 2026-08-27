import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  HelpCircle,
  ShieldCheck,
  Heart,
  CheckCircle2
} from 'lucide-react';
import { NAVIGATION_TABS, SURAH_LIST, JUZ_LIST, GLOBAL_ADHAN_LIST } from './constants.ts';
import { getAudioStreamUrl } from './lib/api.ts';
import { Surah, Ayah } from './types.ts';
import { auth, signInWithGoogle, db, handleRedirectResult } from './lib/firebase.ts';
import { authStatePersistence } from './lib/authStatePersistence.ts';
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
  increment,
  arrayUnion,
  addDoc,
  limit
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/utils.ts';
import UniversalShareModal from './components/UniversalShareModal.tsx';

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
import AdminView from './components/AdminView.tsx';
import SponsorsDrawerSection from './components/SponsorsDrawerSection.tsx';
import AdminRouteGuard from './components/AdminRouteGuard.tsx';
import { AdminConfigService } from './services/adminConfigService.ts';
import AdhanCallerModal from './components/AdhanCallerModal.tsx';
import TahajjudAlarmModal from './components/TahajjudAlarmModal.tsx';
import UniversalSearchModal from './components/UniversalSearchModal.tsx';
import { TahajjudAlarmService } from './services/tahajjudAlarmService.ts';
import GlobalQuranPlayerBar from './components/GlobalQuranPlayerBar.tsx';
import BabyNamesView from './components/BabyNamesView.tsx';
import ThemeCustomizerView from './components/ThemeCustomizerView.tsx';
import KhatamJourneyView from './components/KhatamJourneyView.tsx';
import AliyahMemoriseView from './components/AliyahMemoriseView.tsx';
import AboutCreatorsView from './components/AboutCreatorsView.tsx';
import GlobalNavigationControls from './components/GlobalNavigationControls.tsx';
import { ThemeService } from './services/themeService.ts';
import { trialService, TrialStatus } from './services/trialService.ts';
import TrialExpiredPaywallModal from './components/TrialExpiredPaywallModal.tsx';
import { getRamadanStatus, RamadanStatus, calculateFastingProgress, FastingProgress } from './services/islamicScheduleService.ts';
import RamadanHub from './components/RamadanHub.tsx';
import HabibiVoiceAssistantModal from './components/HabibiVoiceAssistantModal.tsx';
import { VoiceCommandService, ParsedVoiceCommand } from './services/voiceCommandService.ts';
import kaabaDuaThemeBg from './assets/images/kaaba_dua_theme_bg_1786900551467.jpg';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || 'home';
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUniversalSearch, setShowUniversalSearch] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAdhanAlert, setActiveAdhanAlert] = useState<{ prayerName: string; prayerTime?: string; preferredAdhanId?: string } | null>(null);
  const [activeTahajjudAlert, setActiveTahajjudAlert] = useState<{ timeStr?: string; label?: string; message?: string } | null>(null);

  // Subscribe to Tahajjud Alarm Service
  useEffect(() => {
    const unsubscribe = TahajjudAlarmService.subscribe((ringing, info) => {
      if (ringing) {
        setActiveTahajjudAlert(info || { timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
      } else {
        setActiveTahajjudAlert(null);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);
  const [showTrial, setShowTrial] = useState(true);
  const [topUserId, setTopUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(() => trialService.getStatus().isPremium);
  const [premiumActivatedAt, setPremiumActivatedAt] = useState<Date | null>(null);
  const [showPremiumGateway, setShowPremiumGateway] = useState(false);
  const [userJoinedAt, setUserJoinedAt] = useState<Date | null>(null);
  const [trialState, setTrialState] = useState<TrialStatus>(() => trialService.getStatus());
  const [ramadanStatus, setRamadanStatus] = useState<RamadanStatus>(() => getRamadanStatus());

  // Reactive listener for trial & premium updates
  useEffect(() => {
    const update = () => {
      const status = trialService.getStatus(currentUser);
      setTrialState(status);
      if (status.isPremium && !isPremium) {
        setIsPremium(true);
      }
    };
    update();
    const interval = setInterval(update, 30000);
    window.addEventListener('sanctuary_user_updated', update);
    window.addEventListener('sanctuary_premium_activated', update);
    return () => {
      clearInterval(interval);
      window.removeEventListener('sanctuary_user_updated', update);
      window.removeEventListener('sanctuary_premium_activated', update);
    };
  }, [currentUser, isPremium]);

  // Reactive listener for Ramadan status
  useEffect(() => {
    const update = () => {
      setRamadanStatus(getRamadanStatus());
    };
    update();
    const interval = setInterval(update, 60000);
    window.addEventListener('ramadan_mode_updated', update);
    return () => {
      clearInterval(interval);
      window.removeEventListener('ramadan_mode_updated', update);
    };
  }, []);

  const trialExpired = trialState.isTrialExpired && !isPremium;
  const isRamadanActive = ramadanStatus.isRamadanActive;
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
  const [showHabibiVoiceModal, setShowHabibiVoiceModal] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Global Voice Command Executor
  const handleExecuteVoiceCommand = (command: ParsedVoiceCommand) => {
    if (command.type === 'NAVIGATE_QIBLA') {
      navigate('/qibla');
      notificationService.notify('🧭 Qibla Compass', 'Navigating to live Qibla direction.', 'system');
    } else if (command.type === 'NAVIGATE_TASBIH' || command.type === 'VOICE_TASBIH') {
      navigate('/resources', { state: { resId: 'tasbih', autoVoice: command.type === 'VOICE_TASBIH' } });
      setInitialResId('tasbih');
      notificationService.notify('📿 Electronic Tasbih', 'Opening Tasbih counter. Ready for dhikr.', 'system');
    } else if (command.type === 'NAVIGATE_SUPPLICATIONS') {
      navigate('/resources', { state: { resId: 'adhkar' } });
      setInitialResId('adhkar');
      notificationService.notify('🤲 Sacred Supplications', 'Opening daily duas and sacred adhkar.', 'system');
    } else if (command.type === 'EXIT_RAMADAN') {
      localStorage.setItem('force-ramadan-mode', 'false');
      localStorage.setItem('sanctuary_user_exited_ramadan', 'true');
      window.dispatchEvent(new CustomEvent('ramadan_mode_updated'));
      notificationService.notify('🌙 Exited Ramadan Mode', 'Standard dashboard has been restored.', 'system');
    } else if (command.type === 'NAVIGATE_QURAN') {
      navigate('/resources', { state: { resId: 'quran' } });
      setInitialResId('quran');
    } else if (command.type === 'NAVIGATE_PRAYER_TIMES') {
      navigate('/resources', { state: { resId: 'prayer_times' } });
      setInitialResId('prayer_times');
    } else if (command.type === 'NAVIGATE_COMPANION') {
      navigate('/companion');
    } else if (command.type === 'NAVIGATE_MARKET') {
      navigate('/market');
    } else if (command.type === 'NAVIGATE_NAMES_OF_ALLAH') {
      navigate('/resources', { state: { resId: 'names' } });
      setInitialResId('names');
    } else if (command.type === 'SEARCH') {
      setSearchQuery(command.query || '');
      setShowUniversalSearch(true);
    }
  };

  // Keyboard shortcut listener for Habibi Voice Assistant (Alt+V or Ctrl+Shift+V)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && (e.key === 'v' || e.key === 'V')) || (e.ctrlKey && e.shiftKey && (e.key === 'v' || e.key === 'V'))) {
        e.preventDefault();
        setShowHabibiVoiceModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleListening = () => {
    setShowHabibiVoiceModal(true);
  };

  // Prayer Scheduler State
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string>>({});
  const [fastingProgress, setFastingProgress] = useState<FastingProgress>(() => calculateFastingProgress(prayerTimes));

  // Live ticking updater for Fasting Progress
  useEffect(() => {
    const updateFasting = () => {
      setFastingProgress(calculateFastingProgress(prayerTimes));
    };
    updateFasting();
    const interval = setInterval(updateFasting, 3000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

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
          notificationService.scheduleDailyAdhkarAndDuaReminders();
          notificationService.scheduleTahajjudNotifications(data.data.timings);
          notificationService.scheduleWhiteDaysNotifications();
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

      const preferredId = localStorage.getItem('preferred-adhan-id') || 'makkah';

      notificationService.notify(
        `Time for ${prayer}`,
        `The call to prayer for ${prayer} has begun. Come to success.`,
        'prayer',
        '/resources'
      );

      // Open rich interactive Adhan modal
      setActiveAdhanAlert({
        prayerName: prayer,
        prayerTime: prayerTimes[prayer] || '',
        preferredAdhanId: preferredId
      });
    };

    const handleTestAdhan = (e: any) => {
      const detail = e.detail || {};
      setActiveAdhanAlert({
        prayerName: detail.prayerName || 'Dhuhr',
        prayerTime: detail.prayerTime || '13:05',
        preferredAdhanId: detail.adhanId || localStorage.getItem('preferred-adhan-id') || 'makkah'
      });
    };

    window.addEventListener('trigger_test_adhan', handleTestAdhan);

    // Deep link and service worker message listener for closed-app notification clicks
    const checkUrlDeepLinks = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const athanParam = searchParams.get('athan');
        const timeParam = searchParams.get('time');
        const claimedPrayer = searchParams.get('claimed_prayer');
        const hash = window.location.hash;

        if (athanParam || hash === '#adhan') {
          const prayer = athanParam || 'Adhan';
          const preferredId = localStorage.getItem('preferred-adhan-id') || 'makkah';
          setActiveAdhanAlert({
            prayerName: prayer,
            prayerTime: timeParam || prayerTimes[prayer] || '',
            preferredAdhanId: preferredId
          });
          // Clean up URL without reload
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (claimedPrayer) {
          addHasanat(5);
          notificationService.notify('Prayer Claimed', `Masha'Allah! You earned +50 Hasanat for completing ${claimedPrayer} prayer on time.`, 'system');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (e) {
        console.warn("Deep link parse error:", e);
      }
    };

    checkUrlDeepLinks();

    // Listen for Service Worker postMessage when app is active/woken
    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ATHAN_NOTIFICATION_CLICKED') {
        const { prayerName, action } = event.data;
        const preferredId = localStorage.getItem('preferred-adhan-id') || 'makkah';
        
        if (action === 'open_qibla') {
          navigate('/qibla');
        } else if (action === 'mark_prayed') {
          addHasanat(5);
          notificationService.notify('Prayer Claimed', `Masha'Allah! You earned +50 Hasanat for completing ${prayerName} prayer.`, 'system');
        } else {
          setActiveAdhanAlert({
            prayerName: prayerName || 'Prayer',
            prayerTime: prayerTimes[prayerName] || '',
            preferredAdhanId: preferredId
          });
        }
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    const interval = setInterval(checkPrayerTimes, 30000); // Check every 30s
    return () => {
      clearInterval(interval);
      window.removeEventListener('trigger_test_adhan', handleTestAdhan);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
    };
  }, [prayerTimes]);

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // 8-second Splash Screen immersion experience with safety fallback
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 8400);

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
    if (!currentUser || currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_')) return;

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

  const lastSeenDirectAlertRef = useRef<string | null>(null);

  // Real-time Current User Profile Sync (Updates immediately when Admin modifies user)
  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;

    let unsubFirestore: (() => void) | null = null;

    if (!currentUser.uid.startsWith('local_')) {
      const userRef = doc(db, 'users', currentUser.uid);
      unsubFirestore = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.hasanat !== undefined) setHasanat(Number(data.hasanat) || 0);
          if (data.streak !== undefined) setStreak(Number(data.streak) || 0);
          if (data.versesRead !== undefined) setVersesRead(Number(data.versesRead) || 0);
          if (data.duaCount !== undefined) setDuaCount(Number(data.duaCount) || 0);
          if (data.isPremium !== undefined) setIsPremium(!!data.isPremium);
          if (data.rank) setRank(data.rank);

          if (data.directAlert && data.directAlert !== lastSeenDirectAlertRef.current) {
            lastSeenDirectAlertRef.current = data.directAlert;
            notificationService.notify(
              'Message from Sanctuary Admin',
              data.directAlert,
              'system',
              '/home'
            );
          }
        }
      }, (e) => {
        console.warn("User live sync stream warning:", e);
      });
    }

    // Local window event listener for instantaneous UI reactivity
    const handleLocalUserUpdate = (e: any) => {
      const { uid, hasanat: newH, streak: newS, versesRead: newV, duaCount: newD, isPremium: newP, rank: newR } = e.detail || {};
      if (uid === currentUser.uid) {
        if (newH !== undefined) setHasanat(newH);
        if (newS !== undefined) setStreak(newS);
        if (newV !== undefined) setVersesRead(newV);
        if (newD !== undefined) setDuaCount(newD);
        if (newP !== undefined) setIsPremium(newP);
        if (newR !== undefined) setRank(newR);
      }
    };

    const handleDirectAlertEvent = (e: any) => {
      const { uid, message } = e.detail || {};
      if (uid === currentUser.uid && message) {
        notificationService.notify(
          'Message from Sanctuary Admin',
          message,
          'system',
          '/home'
        );
      }
    };

    window.addEventListener('sanctuary_user_updated', handleLocalUserUpdate);
    window.addEventListener('sanctuary_direct_alert', handleDirectAlertEvent);

    return () => {
      if (unsubFirestore) unsubFirestore();
      window.removeEventListener('sanctuary_user_updated', handleLocalUserUpdate);
      window.removeEventListener('sanctuary_direct_alert', handleDirectAlertEvent);
    };
  }, [currentUser]);

  // Daily login reward: Triggered strictly once per calendar day on entering the app
  useEffect(() => {
    if (!currentUser) return;
    const todayStr = new Date().toDateString();
    const lastDailyLoginKey = `last_daily_login_bonus_${currentUser.uid}`;
    const lastBonusDate = localStorage.getItem(lastDailyLoginKey);

    if (lastBonusDate !== todayStr) {
      localStorage.setItem(lastDailyLoginKey, todayStr);
      addHasanat(3);
      setTimeout(() => {
        notificationService.notify(
          'Daily Sanctuary Barakah 🌿',
          'Assalamu Alaikum! +25 Daily Login Hasanat awarded for returning to your Sanctuary.',
          'system'
        );
      }, 1500);
    }
  }, [currentUser]);

  // Auto-Enroll Every User (New or Existing) into Global 'Firdaus Charity Organisation' Group Room in Firestore
  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;

    const syncFirdausGroup = async () => {
      try {
        if (!currentUser.uid.startsWith('local_') && !currentUser.uid.startsWith('rest_')) {
          const roomRef = doc(db, 'rooms', 'group_firdaws_charity');
          await setDoc(roomRef, {
            id: 'group_firdaws_charity',
            name: 'Firdaus Charity Organisation',
            type: 'group',
            isBusiness: false,
            isPartner: true,
            verified: true,
            description: 'Official Strategic Humanitarian Partner Hub — Empowering Lives, Shaping Futures. Community relief updates, clean water wells, orphan sponsorship, and charitable du’as.',
            createdBy: 'partner_firdaus',
            updatedAt: serverTimestamp(),
            participants: arrayUnion(currentUser.uid, 'partner_firdaus')
          }, { merge: true });

          // Also check if welcome starter message exists in subcollection
          const msgsRef = collection(db, 'rooms/group_firdaws_charity/messages');
          const snap = await getDocs(query(msgsRef, orderBy('timestamp', 'asc'), limit(1)));
          if (snap.empty) {
            await addDoc(msgsRef, {
              senderId: 'partner_firdaus',
              senderName: 'Firdaus Charity Organisation',
              text: '🌟 Assalamu Alaikum wa Rahmatullahi wa Barakatuh!\n\nWelcome to the official Firdaus Charity Organisation global group hub.\n\n"Empowering Lives, Shaping Futures"\n\nIn partnership with Muslim Habibi and its young student founders Kizza Hamza & Lubowa Sudias, we share verified humanitarian relief updates, clean water borehole projects in Uganda and East Africa, orphan educational sponsorships, and community du’as. Feel free to join, collaborate, and share your support for the Ummah!',
              timestamp: serverTimestamp(),
              isBusiness: false
            });
          }
        }
      } catch (err) {
        console.warn("Firdaus Charity room auto-sync error:", err);
      }
    };

    syncFirdausGroup();
  }, [currentUser]);
  
  // App State - Default to Aloha Oceanic Gold theme
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('app-theme') || 'aloha';
    if (saved === 'blue' || saved === 'light') return 'sapphire';
    if (saved === 'green' || saved === 'light-green') return 'emerald';
    return saved;
  });

  useEffect(() => {
    const customConfig = theme === 'custom' ? ThemeService.getActiveCustomThemeData() : undefined;
    ThemeService.applyTheme(theme, customConfig);
    ThemeService.applyFontStyle(ThemeService.getActiveFontStyle());
    ThemeService.applyFontSize(ThemeService.getActiveFontSize());
    ThemeService.applyArabicFont(ThemeService.getActiveArabicFont());
  }, [theme]);

  // Derived for components that still expect boolean
  const darkMode = true;
  const setDarkMode = (isDark: boolean) => setTheme(isDark ? 'dark' : 'emerald');

  const lastInteractionRef = useRef<Record<string, any>>({});
  const initialLoadDone = useRef(false);

  // Global Chat Listener for Notifications
  useEffect(() => {
    if (!currentUser || currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_')) return;

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
    if (!currentUser || currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_')) return;

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
    if (!currentUser || currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_')) return;

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

  
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowUniversalSearch(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);

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
    addHasanat(2);
  };

  const updateStreak = () => {
    setStreak(prev => prev + 1);
    addHasanat(1);
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
    let unsubscribe: (() => void) | null = null;
    let isCancelled = false;

    const initializeAuth = async () => {
      setAuthLoading(true);

      // 1. Complete the redirect-based authentication sign-in flow first to prevent race conditions
      try {
        const user = await handleRedirectResult();
        if (user) {
          console.log("Logged in via robust redirect result:", user);
        }
      } catch (err) {
        console.error("Firebase redirect auth failed to resolve:", err);
      } finally {
        // Confirm the redirect result is fully processed in the dedicated persistence layer
        authStatePersistence.markAsProcessed();
      }

      if (isCancelled) return;

      // 2. Intercept with secure custom REST Cloud Sync Account (highly optimized for Capacitor / Android APKs)
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
            if (isCancelled) return;
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

      // If we have a local session, force-resolve auth screen early if needed (only if redirect is already fully processed)
      if (localUser && authStatePersistence.isRedirectProcessed()) {
        setAuthLoading(false);
      }

      // 3. Register standard Firebase Auth state observer only after handling redirect result
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (isCancelled) return;
        
        // Ensure redirect result is fully processed and confirmed in the persistence layer before allowing UI boot
        await authStatePersistence.waitForRedirect();
        if (isCancelled) return;

        // Prioritize firebase user, fall back to virtual simulated local user
        const user = fbUser || localUser || checkLocalSession();
        if (user) {
          setCurrentUser(user);
          notificationService.setOneSignalUser(user.uid, user.email || undefined);
          
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
              const tier = data.subscriptionTier || migratedLocalData?.subscriptionTier || 'monthly';
              if (rawPremium && rawActivatedAt && tier !== 'lifetime') {
                const elapsed = Date.now() - rawActivatedAt.getTime();
                const planDuration = (tier === 'annual' || tier === 'yearly')
                  ? 365 * 24 * 60 * 60 * 1000 // 1 Full Year for Yearly plan
                  : 30 * 24 * 60 * 60 * 1000;  // 30 Days for Monthly plan

                if (elapsed >= planDuration) {
                  finalPremium = false;
                  if (!user.uid.startsWith('local_')) {
                    try {
                      updateDoc(userRef, { isPremium: false, subscriptionTier: 'free' });
                    } catch (err) {
                      console.warn("Failed to auto-expire premium on Firestore", err);
                    }
                  } else {
                    const key = `sanctuary_profile_${user.uid}`;
                    const localDataRaw = localStorage.getItem(key);
                    if (localDataRaw) {
                      const localData = JSON.parse(localDataRaw);
                      localData.isPremium = false;
                      localData.subscriptionTier = 'free';
                      localStorage.setItem(key, JSON.stringify(localData));
                    }
                  }
                  notificationService.notify('Plan Expired', 'Your Sanctuary Elite plan has ended. You can renew anytime.', 'system');
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
            if (!isCancelled) setAuthLoading(false);
          }
        } else {
          // If there's an active local session flag but fbUser is null, double-check local user setup
          const localSessionActive = localStorage.getItem('local-session-active') === 'true';
          if (localSessionActive && localUser) {
            setCurrentUser(localUser);
            if (!isCancelled) setAuthLoading(false);
          } else {
            setCurrentUser(null);
            setHasanat(0);
            setNeedsOnboarding(false);
            if (!isCancelled) setAuthLoading(false);
          }
        }
      });
    };

    initializeAuth();

    return () => {
      isCancelled = true;
      if (unsubscribe) unsubscribe();
    };
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
      authStatePersistence.clear();
      notificationService.clearOneSignalUser();
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
      notificationService.requestPermission();
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
        addHasanat(5);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}/ayahBookmarks/${bookmarkId}`);
    }
  };

  const isAdmin = AdminConfigService.isAdminUser(currentUser) || localStorage.getItem('sanctuary_admin_logged_in') === 'true';

  const tabsWithCompanion = useMemo(() => {
    const base = [
      ...NAVIGATION_TABS.filter(t => t.id !== 'admin' && t.id !== 'leaderboard' && t.id !== 'notifications' && t.id !== 'profile' && t.id !== 'ummah'),
      { id: 'companion', label: 'Aliyah (Talk Pal)', icon: 'Sparkles' },
      { id: 'about-creators', label: 'About App Creators', icon: 'Heart' }
    ];
    // Guarantee unique IDs across all tabs
    const seen = new Set<string>();
    return base.filter(tab => {
      if (seen.has(tab.id)) return false;
      seen.add(tab.id);
      return true;
    });
  }, []);

  if (showSplash) {
    return <SplashScreen onEnter={() => setShowSplash(false)} />;
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
      <div className="fixed inset-0 flex text-slate-200 overflow-y-auto font-sans selection:bg-brand-primary/30 islamic-pattern bg-brand-depth relative">
        {/* Visible Spiritual Kaaba Dua Ambient Background */}
        <div 
          className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-25 scale-100 transform-gpu z-0"
          style={{ backgroundImage: `url(${kaabaDuaThemeBg})` }}
        />
        <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-brand-depth via-brand-depth/80 to-brand-depth/60 z-0" />
        <HeadsUpNotification />
        <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-8 md:py-16">
          <OnboardingView user={currentUser} onComplete={() => setNeedsOnboarding(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex text-slate-200 overflow-hidden font-sans selection:bg-brand-primary/30 islamic-pattern relative">
      {/* Visible Spiritual Kaaba Dua Ambient Background */}
      <div 
        className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-25 scale-100 transform-gpu z-0"
        style={{ backgroundImage: `url(${kaabaDuaThemeBg})` }}
      />
      
      {/* Delicate Theme Gradient Blends */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-brand-depth via-brand-depth/40 to-brand-depth/60 z-0" />

      <HeadsUpNotification />
      {/* Background Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] max-h-[800px] bg-brand-primary/5 blur-[120px] md:blur-[150px] rounded-full pointer-events-none z-0"></div>
<div id="trial-info" className="fixed top-3 md:top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-md flex flex-col items-center gap-1.5 px-4">
<AnimatePresence>
{isRamadanActive && (
  <motion.div 
    key="holy-ramadan-mode-pill"
    initial={{ opacity: 0, y: -25 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -25, scale: 0.95 }}
    onClick={() => navigate('/ramadan')}
    className="pointer-events-auto cursor-pointer group bg-gradient-to-r from-[#111f18]/95 via-[#182e23]/95 to-[#111f18]/95 hover:from-[#162a20]/95 hover:to-[#1e382b]/95 text-white px-4 py-2 rounded-2xl shadow-2xl flex flex-col gap-1.5 border border-amber-400/40 backdrop-blur-2xl transition-all duration-300 w-full max-w-sm hover:scale-[1.02] hover:border-amber-300/80 shadow-amber-950/40 mb-1"
    title="Click to open Ramadan Sanctuary Hub & Fasting Clock"
  >
    {/* Top Row: Ramadan Title, Day, and Hours Remaining */}
    <div className="flex items-center justify-between w-full gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-5 h-5 bg-amber-500/20 border border-amber-400/30 rounded-full flex items-center justify-center text-amber-300 shrink-0 group-hover:rotate-12 transition-transform">
          <Moon size={11} className="fill-amber-400/30" />
        </div>
        <div className="flex items-center gap-1.5 leading-none min-w-0 truncate">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-300 truncate">Holy Ramadan Mode</p>
          <div className="w-[1px] h-2.5 bg-amber-400/30 shrink-0" />
          <p className="text-[10px] font-bold font-mono text-slate-200 shrink-0">
            Day {ramadanStatus.ramadanDay}/30
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[9px] font-bold font-mono text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
          {fastingProgress.hoursText}
        </span>
      </div>
    </div>

    {/* Visual Progress Bar beneath the text */}
    <div className="w-full space-y-1">
      <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-amber-500/30 p-[1px] relative shadow-inner">
        <motion.div 
          className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-300 rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(4, fastingProgress.progressPercent)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Glowing illuminated pulse at the leading edge */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full blur-[1px] shadow-[0_0_8px_#fbbf24]" />
        </motion.div>
      </div>

      {/* Micro-labels beneath progress bar: Fajr, % Fasted, Maghrib */}
      <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 px-0.5 leading-none">
        <span className="text-amber-400/90 font-medium">Fajr {fastingProgress.fajrStr}</span>
        <span className="text-amber-300 font-bold tracking-tight">
          {fastingProgress.isFasting ? `${Math.round(fastingProgress.progressPercent)}% Fasted` : fastingProgress.statusBadge}
        </span>
        <span className="text-emerald-400/90 font-medium">Maghrib {fastingProgress.maghribStr}</span>
      </div>
    </div>
  </motion.div>
)}

{currentUser && !isPremium && !trialExpired && showTrial && (
  <motion.div 
    key="trial-remaining-status-pill"
    initial={{ opacity: 0, y: -25 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -25, scale: 0.95 }}
    className="pointer-events-auto bg-brand-sidebar/95 backdrop-blur-xl border border-amber-500/30 px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2.5"
  >
           <div className="w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 shrink-0">
             <Sparkles size={11} className="animate-pulse" />
           </div>
           <div className="flex items-center gap-2 leading-none">
             <p className="text-[9px] font-black text-amber-400 uppercase tracking-wider">3-Day Free Trial</p>
             <div className="w-[1px] h-2.5 bg-amber-500/30" />
             <p className="text-[9px] font-bold text-slate-300 font-mono">
                {trialState.daysRemaining > 0 ? `${trialState.daysRemaining}d ${trialState.hoursRemaining}h Left` : `${trialState.hoursRemaining}h ${trialState.minutesRemaining}m Left`}
             </p>
           </div>
           <button
             onClick={() => setShowTrial(false)}
             className="ml-1 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
           >
             <X size={11} />
           </button>
  </motion.div>
)}
{currentUser && !isPremium && trialExpired && showTrial && (
  <motion.div 
    key="free-plan-status-pill"
    initial={{ opacity: 0, y: -25 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -25, scale: 0.95 }}
    className="pointer-events-auto bg-brand-sidebar/95 backdrop-blur-xl border border-emerald-500/30 px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2.5"
  >
    <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 shrink-0">
      <CheckCircle2 size={11} />
    </div>
    <div className="flex items-center gap-2 leading-none">
      <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Free Plan Active</p>
      <div className="w-[1px] h-2.5 bg-emerald-500/30" />
      <button
        onClick={() => setShowPremiumGateway(true)}
        className="text-[9px] font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
      >
        Upgrade to Elite
      </button>
    </div>
    <button
      onClick={() => setShowTrial(false)}
      className="ml-1 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
    >
      <X size={11} />
    </button>
  </motion.div>
)}
{currentUser && isPremium && premiumActivatedAt && showTrial && (
  <motion.div 
    key="premium-active-status-pill"
    initial={{ opacity: 0, y: -25 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -25, scale: 0.95 }}
    className="pointer-events-auto bg-brand-sidebar/95 backdrop-blur-xl border border-emerald-500/30 px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2.5"
  >
           <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 shrink-0">
             <Crown size={11} className="animate-pulse" />
           </div>
           <div className="flex items-center gap-2 leading-none">
             <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Premium Active</p>
             <div className="w-[1px] h-2.5 bg-emerald-500/30" />
             <p className="text-[9px] font-bold text-emerald-300 font-mono">
                {(() => {
                  const elapsed = Date.now() - premiumActivatedAt.getTime();
                  const remainingMs = 30 * 24 * 60 * 60 * 1000 - elapsed;
                  const daysLeft = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
                  return daysLeft > 1 ? `${daysLeft}d Left` : `<1d Left`;
                })()}
             </p>
           </div>
           <button
             onClick={() => setShowTrial(false)}
             className="ml-1 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
           >
             <X size={11} />
           </button>
  </motion.div>
)}
</AnimatePresence>
</div>

      {showPremiumGateway && (
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

      {/* Desktop/Tablet Navigation Rail (Narrow Sidebar) Strictly Glued to the screen */}
      <aside 
        id="tour-desktop-rail"
        className="hidden md:flex fixed top-0 left-0 bottom-0 w-16 h-screen bg-brand-sidebar/95 backdrop-blur-2xl border-r border-brand-border flex-col items-center justify-between py-4 z-40 select-none overflow-hidden"
        style={{ height: '100vh', maxHeight: '100vh', minHeight: '100vh', pointerEvents: 'auto' }}
      >
        {/* Top Sacred Logo */}
        <div 
          onClick={() => navigate('/home')}
          className="w-10 h-10 rounded-xl overflow-hidden border border-brand-primary/40 shadow-lg shadow-brand-primary/25 shrink-0 group cursor-pointer bg-brand-depth p-1 flex items-center justify-center text-brand-primary active:scale-95 transition-all"
          title="Habibi Islamic Sanctuary"
        >
          <Moon size={20} className="fill-brand-primary/25 text-brand-primary group-hover:scale-110 group-hover:rotate-12 transition-transform" />
        </div>
        
        {/* Navigation Items (Glued, Compact, Absolute Overflow Hidden, Never Moves or Scrolls) */}
        <nav className="flex flex-col gap-1.5 my-auto w-full items-center shrink-0 overflow-hidden py-1">
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
              Crown,
              User: UserIcon,
              Shield: ShieldCheck,
              Heart
            }[tab.icon as keyof typeof Icon] || BookOpen;
            
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tour-nav-${tab.id}`}
                onClick={() => {
                  navigate(`/${tab.id}`);
                  if (tab.id !== 'resources') setSelectedSurah(null);
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative group cursor-pointer shrink-0 ${
                  isActive 
                    ? 'bg-brand-primary text-brand-depth shadow-lg shadow-brand-primary/30' 
                    : 'text-slate-400 hover:text-brand-primary hover:bg-white/5'
                }`}
                title={tab.label}
              >
                <Icon size={19} />
                {isActive && (
                  <div 
                    className="absolute left-[-12px] w-[3px] h-5 bg-brand-primary rounded-r-full shadow-[0_0_8px_#10b981]" 
                  />
                )}
                
                {/* TOOLTIP */}
                <div className="absolute left-14 bg-brand-sidebar border border-brand-border px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-8px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-2xl">
                  {tab.label}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile & Full Directory Trigger (Glued) */}
        <div className="flex flex-col items-center gap-2.5 shrink-0 pt-1">
           {currentUser ? (
             <div className="group relative">
               {currentUser.photoURL ? (
                 <img 
                   src={currentUser.photoURL} 
                   alt="" 
                   className="w-9 h-9 rounded-full border border-brand-primary/30 cursor-pointer hover:border-brand-primary transition-all object-cover" 
                 />
               ) : (
                 <div className="w-9 h-9 rounded-full bg-purple-700/80 border border-brand-primary/40 flex items-center justify-center text-white font-black text-xs cursor-pointer hover:border-brand-primary transition-all shadow-md">
                   {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                 </div>
               )}
               <button 
                 onClick={handleLogout}
                 className="absolute left-14 bottom-0 bg-brand-sidebar border border-brand-border px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-2xl text-red-400 whitespace-nowrap cursor-pointer z-50"
               >
                 Logout
               </button>
             </div>
           ) : (
             <button 
               onClick={handleLogin}
               className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-brand-depth transition-all group cursor-pointer"
               title="Login / Account"
             >
                <UserIcon size={18} />
             </button>
           )}
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-primary hover:bg-white/5 transition-all cursor-pointer"
             title="Open Full Directory"
           >
              <LayoutGrid size={19} />
           </button>
        </div>
      </aside>

      {/* Desktop Fixed Sidebar Spacer (Guarantees layout offset without shifting) */}
      <div className="hidden md:block w-16 shrink-0 h-full select-none pointer-events-none" aria-hidden="true" />

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col z-10 min-w-0 h-full overflow-hidden">
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

        {/* Mobile Top Header (Optimized for Mobile Screens) */}
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-brand-sidebar/95 backdrop-blur-2xl border-b border-white/10 px-4 flex items-center justify-between z-40">
          <div className="flex items-center gap-3">
            <button 
              id="tour-mobile-drawer-toggle"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-1 text-slate-300 hover:text-white rounded-xl bg-white/5 border border-white/5 active:scale-95 transition-all cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu size={20} className="text-brand-primary" />
            </button>
            <div className="flex items-center gap-2" onClick={() => navigate('/home')}>
              <div className="w-7 h-7 bg-brand-primary/20 border border-brand-primary/30 rounded-lg flex items-center justify-center text-brand-primary">
                <Moon size={14} className="fill-brand-primary/30 text-brand-primary" />
              </div>
              <span className="text-sm font-black text-white uppercase tracking-tight">HABIBI</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Tour Guide Button */}
            <button 
              id="tour-mobile-guide-btn"
              onClick={() => setShowTour(true)}
              className="px-2.5 py-1.5 rounded-full bg-brand-primary/15 border border-brand-primary/30 flex items-center gap-1.5 text-brand-primary hover:bg-brand-primary hover:text-brand-depth font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-brand-primary/10 cursor-pointer"
              title="Launch In-App Guided Tour"
            >
              <HelpCircle size={14} className="animate-pulse" />
              <span>Tour</span>
            </button>

            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-300 active:scale-95 transition-all"
            >
              {darkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-400" />}
            </button>

            {/* Hasanat Badge */}
            <div className="flex items-baseline gap-1 px-2.5 py-1 bg-brand-primary/10 rounded-full border border-brand-primary/25">
              <span className="text-[9px] font-black text-brand-primary uppercase">★</span>
              <span className="text-xs font-black text-white font-mono">{hasanat.toLocaleString()}</span>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex h-20 items-center justify-between px-6 md:px-10 border-b border-brand-border bg-brand-depth/80 backdrop-blur-md">
          <div className="flex items-center gap-6 flex-1">
             <div className="lg:hidden p-2 text-brand-primary" onClick={() => setIsSidebarOpen(true)}>
               <Menu size={24} />
             </div>
             <div className="hidden md:flex items-center gap-4 flex-1 max-w-md relative">
                <Search className="absolute left-4 text-brand-primary/40" size={16} />
                <input 
                  type="text" 
                  placeholder="Search Surah, Hadith, Adhkar, Duas, Names (Ctrl+K)..."
                  onClick={() => setShowUniversalSearch(true)}
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
                onClick={() => setShowHabibiVoiceModal(true)}
                className="w-10 h-10 rounded-full border border-brand-primary/40 bg-brand-primary/10 flex items-center justify-center text-brand-primary hover:bg-brand-primary/20 hover:scale-105 transition-all shadow-lg shadow-brand-primary/10 cursor-pointer group"
                title="Habibi Voice Assistant ('Habibi, show Qibla', etc.) [Alt+V]"
             >
                <Mic size={18} className="group-hover:animate-pulse" />
             </button>
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
                        addHasanat={addHasanat}
                      />
                    } />
                    <Route path="/resources" element={
                      <div id="tour-resources-container">
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
                          isPremium={isPremium || !trialExpired}
                          onShowPremium={() => setShowPremiumGateway(true)}
                          currentUser={currentUser}
                        />
                      </div>
                    } />
                    <Route path="/market" element={
                      <div id="tour-market-container">
                        <MarketView 
                          searchQuery={searchQuery} 
                          setSearchQuery={setSearchQuery} 
                          currentUser={currentUser}
                          currentHasanat={hasanat}
                          onHasanatDeducted={(amt) => setHasanat(prev => Math.max(0, prev - amt))}
                        />
                      </div>
                    } />
                    <Route path="/market/:productId" element={
                      <div id="tour-market-container">
                        <MarketView 
                          detailMode 
                          searchQuery={searchQuery} 
                          setSearchQuery={setSearchQuery} 
                          currentUser={currentUser}
                          currentHasanat={hasanat}
                          onHasanatDeducted={(amt) => setHasanat(prev => Math.max(0, prev - amt))}
                        />
                      </div>
                    } />
                    <Route path="/bookmarks" element={<BookmarksView bookmarks={bookmarks} onRemoveBookmark={toggleBookmark} onNavigate={handleNavigate} />} />
                    <Route path="/leaderboard" element={
                      (isPremium || !trialExpired) ? (
                        <div id="tour-leaderboard-container">
                          <LeaderboardView 
                            searchQuery={searchQuery} 
                            setSearchQuery={setSearchQuery} 
                            currentUser={currentUser} 
                            currentHasanat={hasanat}
                            onHasanatDeducted={(amt) => setHasanat(prev => Math.max(0, prev - amt))}
                          />
                        </div>
                      ) : (
                        <TrialExpiredPaywallModal
                          currentUser={currentUser}
                          featureName="Global Hasanat Leaderboard"
                          onUnlocked={() => {
                            setIsPremium(true);
                            setPremiumActivatedAt(new Date());
                          }}
                          onOpenFullGateway={() => setShowPremiumGateway(true)}
                          onContinueFree={() => navigate('/home')}
                          onClose={() => navigate('/home')}
                        />
                      )
                    } />
                    <Route path="/ramadan" element={
                      <div className="p-4 md:p-8 max-w-7xl mx-auto">
                        <RamadanHub 
                          currentTime={new Date()} 
                          prayerData={null} 
                          addHasanat={addHasanat} 
                          onExitRamadanMode={() => {
                            localStorage.setItem('force-ramadan-mode', 'false');
                            localStorage.setItem('sanctuary_user_exited_ramadan', 'true');
                            window.dispatchEvent(new CustomEvent('ramadan_mode_updated'));
                            navigate('/home');
                          }}
                        />
                      </div>
                    } />
                    <Route path="/profile" element={
                      <div id="tour-profile-container">
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
                      </div>
                    } />
                    <Route path="/admin" element={
                      <AdminRouteGuard currentUser={currentUser} onAdminAuthenticated={(authPayload) => setCurrentUser(authPayload)}>
                        <AdminView currentUser={currentUser} addHasanat={addHasanat} />
                      </AdminRouteGuard>
                    } />
                    <Route path="/settings" element={<div id="tour-settings-container"><SettingsView theme={theme} setTheme={setTheme} darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} language={language} setLanguage={setLanguage} /></div>} />
                    <Route path="/settings/theme" element={
                      (isPremium || !trialExpired) ? (
                        <div id="tour-themes-container"><ThemeCustomizerView theme={theme} setTheme={setTheme} onBack={() => navigate('/settings')} /></div>
                      ) : (
                        <TrialExpiredPaywallModal
                          currentUser={currentUser}
                          featureName="Sanctuary Theme Customizer"
                          onUnlocked={() => {
                            setIsPremium(true);
                            setPremiumActivatedAt(new Date());
                          }}
                          onOpenFullGateway={() => setShowPremiumGateway(true)}
                          onContinueFree={() => navigate('/settings')}
                          onClose={() => navigate('/settings')}
                        />
                      )
                    } />
                    <Route path="/themes" element={
                      (isPremium || !trialExpired) ? (
                        <div id="tour-themes-container"><ThemeCustomizerView theme={theme} setTheme={setTheme} onBack={() => navigate('/home')} /></div>
                      ) : (
                        <TrialExpiredPaywallModal
                          currentUser={currentUser}
                          featureName="Sanctuary Theme Customizer"
                          onUnlocked={() => {
                            setIsPremium(true);
                            setPremiumActivatedAt(new Date());
                          }}
                          onOpenFullGateway={() => setShowPremiumGateway(true)}
                          onContinueFree={() => navigate('/home')}
                          onClose={() => navigate('/home')}
                        />
                      )
                    } />
                    <Route path="/notifications" element={<NotificationsView />} />
                    <Route path="/companion" element={
                      (isPremium || !trialExpired) ? (
                        <div id="tour-companion-container">
                          <CompanionView currentUser={currentUser} isPremium={isPremium || !trialExpired} onShowPremium={() => setShowPremiumGateway(true)} addHasanat={addHasanat} />
                        </div>
                      ) : (
                        <TrialExpiredPaywallModal
                          currentUser={currentUser}
                          featureName="Aliyah AI 24/7 Talk Pal"
                          onUnlocked={() => {
                            setIsPremium(true);
                            setPremiumActivatedAt(new Date());
                          }}
                          onOpenFullGateway={() => setShowPremiumGateway(true)}
                          onContinueFree={() => navigate('/home')}
                          onClose={() => navigate('/home')}
                        />
                      )
                    } />
                    <Route path="/talk" element={
                      (isPremium || !trialExpired) ? (
                        <div id="tour-companion-container">
                          <CompanionView currentUser={currentUser} isPremium={isPremium || !trialExpired} onShowPremium={() => setShowPremiumGateway(true)} addHasanat={addHasanat} />
                        </div>
                      ) : (
                        <TrialExpiredPaywallModal
                          currentUser={currentUser}
                          featureName="Aliyah AI 24/7 Talk Pal"
                          onUnlocked={() => {
                            setIsPremium(true);
                            setPremiumActivatedAt(new Date());
                          }}
                          onOpenFullGateway={() => setShowPremiumGateway(true)}
                          onContinueFree={() => navigate('/home')}
                          onClose={() => navigate('/home')}
                        />
                      )
                    } />
                    <Route path="/talk-pal" element={
                      (isPremium || !trialExpired) ? (
                        <div id="tour-companion-container">
                          <CompanionView currentUser={currentUser} isPremium={isPremium || !trialExpired} onShowPremium={() => setShowPremiumGateway(true)} addHasanat={addHasanat} />
                        </div>
                      ) : (
                        <TrialExpiredPaywallModal
                          currentUser={currentUser}
                          featureName="Aliyah AI 24/7 Talk Pal"
                          onUnlocked={() => {
                            setIsPremium(true);
                            setPremiumActivatedAt(new Date());
                          }}
                          onOpenFullGateway={() => setShowPremiumGateway(true)}
                          onContinueFree={() => navigate('/home')}
                          onClose={() => navigate('/home')}
                        />
                      )
                    } />
                    <Route path="/premium" element={<PremiumView />} />
                    <Route path="/qibla" element={<div id="tour-qibla-container"><QiblaView /></div>} />
                    <Route path="/babynames" element={
                      (isPremium || !trialExpired) ? (
                        <div id="tour-babynames-container">
                          <BabyNamesView onBack={() => navigate('/resources')} addHasanat={addHasanat} />
                        </div>
                      ) : (
                        <TrialExpiredPaywallModal
                          currentUser={currentUser}
                          featureName="Islamic Baby Names Generator"
                          onUnlocked={() => {
                            setIsPremium(true);
                            setPremiumActivatedAt(new Date());
                          }}
                          onOpenFullGateway={() => setShowPremiumGateway(true)}
                          onContinueFree={() => navigate('/resources')}
                          onClose={() => navigate('/resources')}
                        />
                      )
                    } />
                    <Route path="/baby-names" element={
                      (isPremium || !trialExpired) ? (
                        <div id="tour-babynames-container">
                          <BabyNamesView onBack={() => navigate('/resources')} addHasanat={addHasanat} />
                        </div>
                      ) : (
                        <TrialExpiredPaywallModal
                          currentUser={currentUser}
                          featureName="Islamic Baby Names Generator"
                          onUnlocked={() => {
                            setIsPremium(true);
                            setPremiumActivatedAt(new Date());
                          }}
                          onOpenFullGateway={() => setShowPremiumGateway(true)}
                          onContinueFree={() => navigate('/resources')}
                          onClose={() => navigate('/resources')}
                        />
                      )
                    } />
                    <Route path="/khatam" element={
                      (isPremium || !trialExpired) ? (
                        <div id="tour-khatam-container">
                          <KhatamJourneyView onBack={() => navigate('/resources')} addHasanat={addHasanat} currentUser={currentUser} onOpenAdmin={() => navigate('/admin')} />
                        </div>
                      ) : (
                        <TrialExpiredPaywallModal
                          currentUser={currentUser}
                          featureName="Khatam Journey & Video Reflections"
                          onUnlocked={() => {
                            setIsPremium(true);
                            setPremiumActivatedAt(new Date());
                          }}
                          onOpenFullGateway={() => setShowPremiumGateway(true)}
                          onContinueFree={() => navigate('/resources')}
                          onClose={() => navigate('/resources')}
                        />
                      )
                    } />
                    <Route path="/memorise" element={
                      (isPremium || !trialExpired) ? (
                        <AliyahMemoriseView onBack={() => navigate('/resources')} addHasanat={addHasanat} isPremium={isPremium || !trialExpired} onShowPremium={() => setShowPremiumGateway(true)} currentUser={currentUser} />
                      ) : (
                        <TrialExpiredPaywallModal
                          currentUser={currentUser}
                          featureName="Aliyah Hifz & Memorization Studio"
                          onUnlocked={() => {
                            setIsPremium(true);
                            setPremiumActivatedAt(new Date());
                          }}
                          onOpenFullGateway={() => setShowPremiumGateway(true)}
                          onContinueFree={() => navigate('/resources')}
                          onClose={() => navigate('/resources')}
                        />
                      )
                    } />
                    <Route path="/aliyah" element={
                      (isPremium || !trialExpired) ? (
                        <AliyahMemoriseView onBack={() => navigate('/resources')} addHasanat={addHasanat} isPremium={isPremium || !trialExpired} onShowPremium={() => setShowPremiumGateway(true)} currentUser={currentUser} />
                      ) : (
                        <TrialExpiredPaywallModal
                          currentUser={currentUser}
                          featureName="Aliyah Hifz & Memorization Studio"
                          onUnlocked={() => {
                            setIsPremium(true);
                            setPremiumActivatedAt(new Date());
                          }}
                          onOpenFullGateway={() => setShowPremiumGateway(true)}
                          onContinueFree={() => navigate('/resources')}
                          onClose={() => navigate('/resources')}
                        />
                      )
                    } />
                    <Route path="/aliyah-memorise" element={
                      (isPremium || !trialExpired) ? (
                        <AliyahMemoriseView onBack={() => navigate('/resources')} addHasanat={addHasanat} isPremium={isPremium || !trialExpired} onShowPremium={() => setShowPremiumGateway(true)} currentUser={currentUser} />
                      ) : (
                        <TrialExpiredPaywallModal
                          currentUser={currentUser}
                          featureName="Aliyah Hifz & Memorization Studio"
                          onUnlocked={() => {
                            setIsPremium(true);
                            setPremiumActivatedAt(new Date());
                          }}
                          onOpenFullGateway={() => setShowPremiumGateway(true)}
                          onContinueFree={() => navigate('/resources')}
                          onClose={() => navigate('/resources')}
                        />
                      )
                    } />
                    <Route path="/hifz" element={
                      (isPremium || !trialExpired) ? (
                        <AliyahMemoriseView onBack={() => navigate('/resources')} addHasanat={addHasanat} isPremium={isPremium || !trialExpired} onShowPremium={() => setShowPremiumGateway(true)} currentUser={currentUser} />
                      ) : (
                        <TrialExpiredPaywallModal
                          currentUser={currentUser}
                          featureName="Aliyah Hifz & Memorization Studio"
                          onUnlocked={() => {
                            setIsPremium(true);
                            setPremiumActivatedAt(new Date());
                          }}
                          onOpenFullGateway={() => setShowPremiumGateway(true)}
                          onContinueFree={() => navigate('/resources')}
                          onClose={() => navigate('/resources')}
                        />
                      )
                    } />
                    <Route path="/about-creators" element={<AboutCreatorsView onBack={() => navigate('/home')} addHasanat={addHasanat} />} />
                    <Route path="/about" element={<AboutCreatorsView onBack={() => navigate('/home')} addHasanat={addHasanat} />} />
                    <Route path="/creators" element={<AboutCreatorsView onBack={() => navigate('/home')} addHasanat={addHasanat} />} />
                    <Route path="/ummah" element={
                      (isPremium || !trialExpired) ? (
                        <UmmahHubView searchQuery={searchQuery} setSearchQuery={setSearchQuery} addHasanat={addHasanat} isPremium={isPremium || !trialExpired} onShowPremium={() => setShowPremiumGateway(true)} />
                      ) : (
                        <TrialExpiredPaywallModal
                          currentUser={currentUser}
                          featureName="Global Ummah Hub & Audio Circles"
                          onUnlocked={() => {
                            setIsPremium(true);
                            setPremiumActivatedAt(new Date());
                          }}
                          onOpenFullGateway={() => setShowPremiumGateway(true)}
                          onContinueFree={() => navigate('/home')}
                          onClose={() => navigate('/home')}
                        />
                      )
                    } />
                    <Route path="/chat" element={<ChatView currentUser={currentUser} isPremium={isPremium || !trialExpired} searchQuery={searchQuery} setSearchQuery={setSearchQuery} addHasanat={addHasanat} />} />
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
          { icon: LayoutGrid, color: 'text-brand-primary', bg: 'bg-brand-primary/10', title: 'Dashboard', action: () => navigate('/home') },
          { icon: SettingsIcon, color: 'text-slate-400', bg: 'bg-white/5', title: 'Atmosphere Studio', action: () => navigate('/settings/theme') }
        ].map((item, i) => (
          <button 
            key={i} 
            onClick={item.action}
            title={item.title}
            className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center ${item.color} cursor-pointer hover:border hover:border-brand-primary/20 hover:scale-110 transition-all active:scale-95`}
          >
            <item.icon size={20} />
          </button>
        ))}
        <div className="mt-auto flex flex-col items-center gap-4 text-[10px] text-brand-primary/40 font-mono vertical-text tracking-widest">
           HABIBI • ISIS WRISTS
        </div>
      </aside>

      {/* Mobile Sidebar with Staggered Entrance */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              id="tour-mobile-drawer-content"
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 w-80 bg-brand-sidebar z-50 p-8 lg:hidden border-r border-brand-border flex flex-col justify-between overflow-y-auto"
            >
               <div>
                 <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                        <Moon size={18} className="fill-brand-depth text-brand-depth" />
                      </div>
                      <h2 className="text-xl font-bold text-white uppercase tracking-tighter">HABIBI</h2>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white p-2 cursor-pointer"><X size={22} /></button>
                 </div>
                 <motion.nav 
                   initial="hidden"
                   animate="visible"
                   variants={{
                     hidden: {},
                     visible: {
                       transition: {
                         staggerChildren: 0.035,
                         delayChildren: 0.05
                       }
                     }
                   }}
                   className="space-y-2"
                 >
                   {tabsWithCompanion.map((tab) => (
                     <motion.button
                       key={tab.id}
                       variants={{
                         hidden: { opacity: 0, x: -16 },
                         visible: { opacity: 1, x: 0, transition: { duration: 0.25 } }
                       }}
                       whileTap={{ scale: 0.96 }}
                       onClick={() => { navigate(`/${tab.id}`); setIsSidebarOpen(false); if (tab.id !== 'resources') setSelectedSurah(null); }}
                       className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all cursor-pointer ${activeTab === tab.id ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'}`}
                     >
                       <span>{tab.label}</span>
                     </motion.button>
                   ))}
                 </motion.nav>
               </div>

               <SponsorsDrawerSection onCloseDrawer={() => setIsSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Heads-up Top Notification Toast Banner (Non-intrusive, sleek top banner) */}
      <HeadsUpNotification />

      <WalkthroughTour 
        isOpen={showTour} 
        onClose={() => setShowTour(false)} 
        onNavigate={handleNavigate} 
        addHasanat={addHasanat} 
        onOpenDrawer={setIsSidebarOpen}
        isDrawerOpen={isSidebarOpen}
      />

      {/* Adhan Caller Modal with sacred caller voice, dynamic imagery & Du'a */}
      <AdhanCallerModal 
        isOpen={!!activeAdhanAlert}
        onClose={() => setActiveAdhanAlert(null)}
        prayerName={activeAdhanAlert?.prayerName || 'Prayer'}
        prayerTime={activeAdhanAlert?.prayerTime}
        preferredAdhanId={activeAdhanAlert?.preferredAdhanId}
        addHasanat={addHasanat}
        onNavigateToQibla={() => {
          setActiveAdhanAlert(null);
          navigate('/qibla');
        }}
      />

      {/* Tahajjud Vigil & Night Alarm Modal with Audio Chime & Du'a */}
      <TahajjudAlarmModal
        isOpen={!!activeTahajjudAlert}
        onClose={() => {
          TahajjudAlarmService.stopAlarm();
          setActiveTahajjudAlert(null);
        }}
        onNavigateToAdhkar={() => {
          navigate('/resources');
          setInitialResId('adhkar');
        }}
        addHasanat={addHasanat}
        alarmInfo={activeTahajjudAlert || undefined}
      />

      {/* Persistent Global Quran Audio Floating Player */}
      
      {/* Universal Search Modal (Surahs, Hadiths, Adhkar, Duas, Names) */}
      <UniversalSearchModal
        isOpen={showUniversalSearch}
        onClose={() => setShowUniversalSearch(false)}
        initialQuery={searchQuery}
        onNavigate={(tab, extra) => {
          if (tab === "resources") {
            navigate("/resources", { state: extra });
            if (extra?.resId) setInitialResId(extra.resId);
            if (extra?.selectedSurah) setSelectedSurah(extra.selectedSurah);
          } else {
            navigate("/" + tab, { state: extra });
          }
        }}
      />

      <GlobalQuranPlayerBar 
        isInSurahView={activeTab === 'resources' && !!selectedSurah}
        currentViewingSurahNumber={selectedSurah?.number || null}
      />

      <GlobalNavigationControls />

      <UniversalShareModal />

      {/* Habibi Voice Assistant Modal with Voice Commands (e.g. 'Habibi, show Qibla', 'Habibi, open Tasbih') */}
      <HabibiVoiceAssistantModal
        isOpen={showHabibiVoiceModal}
        onClose={() => setShowHabibiVoiceModal(false)}
        onExecuteCommand={handleExecuteVoiceCommand}
      />

      {/* Mobile Floating Bottom Navigation Dock (Optimized for all phone screen sizes) */}
      <nav 
        id="tour-mobile-dock"
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-brand-sidebar/90 backdrop-blur-2xl border border-white/10 rounded-2xl px-2 py-2 shadow-2xl shadow-black/80 flex items-center justify-around"
      >
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'resources', label: 'Resources', icon: BookOpen },
          { id: 'market', label: 'Market', icon: ShoppingBag },
          { id: 'companion', label: 'Habibi Aliyah', icon: Sparkles },
          { id: 'ummah', label: 'Ummah', icon: Users },
          { id: 'profile', label: 'Profile', icon: UserIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'resources' && activeTab === 'bookmarks');
          return (
            <button
              key={tab.id}
              id={`tour-nav-${tab.id}`}
              onClick={() => {
                navigate(`/${tab.id}`);
                if (tab.id !== 'resources') setSelectedSurah(null);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive 
                  ? 'text-brand-primary font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTabMobileIndicator"
                  className="absolute inset-0 bg-brand-primary/15 rounded-xl border border-brand-primary/25"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={18} className="relative z-10" />
              <span className="text-[9px] mt-0.5 tracking-tight relative z-10 font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

