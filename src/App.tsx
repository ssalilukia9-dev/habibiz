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
  Sparkles
} from 'lucide-react';
import { NAVIGATION_TABS, SURAH_LIST, JUZ_LIST } from './constants.ts';
import { Surah, Ayah } from './types.ts';
import { auth, signInWithGoogle, db } from './lib/firebase.ts';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';
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

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || 'home';
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // App State
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [bookmarks, setBookmarks] = useState<Ayah[]>([]);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [initialResId, setInitialResId] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [userJoinedAt, setUserJoinedAt] = useState<Date | null>(null);

  // Trial Logic: 3 days (72 hours)
  const isTrialActive = userJoinedAt ? (Date.now() - userJoinedAt.getTime() < 3 * 24 * 60 * 60 * 1000) : true;
  const trialExpired = !isTrialActive;

  // Gamification State
  const [hasanat, setHasanat] = useState(1250);
  const [rank, setRank] = useState('Seeker');
  const [pointPopups, setPointPopups] = useState<{id: number, amount: number}[]>([]);
  const [versesRead, setVersesRead] = useState(142);
  const [duaCount, setDuaCount] = useState(84);
  const [streak, setStreak] = useState(12);
  const popupId = useRef(0);

  const addHasanat = (amount: number) => {
    setHasanat(prev => prev + amount);
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
          const docSnap = await getDoc(userRef);
          let joinedDate = new Date();
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setIsPremium(data.isPremium || false);
            if (data.createdAt) {
               joinedDate = data.createdAt.toDate();
            }
            setUserJoinedAt(joinedDate);
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
              lastSeen: serverTimestamp()
            });
          }

          if (docSnap.exists()) {
             await updateDoc(userRef, {
               lastSeen: serverTimestamp()
             });
          }
        } catch (error) {
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
  }, []);

  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

   const [selectedHadithCollection, setSelectedHadithCollection] = useState('all');
  const [selectedReciter, setSelectedReciter] = useState(7); // Default: Alafasy

  const handleNavigate = (tab: string, extra?: any) => {
    if (tab === 'resources' && extra?.resId) {
      setInitialResId(extra.resId);
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

  const toggleBookmark = (ayah: Ayah | any) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.number === ayah.number);
      if (exists) {
        return prev.filter(b => b.number !== ayah.number);
      }
      return [...prev, ayah];
    });
  };

  const tabsWithCompanion = [
    ...NAVIGATION_TABS,
    { id: 'companion', label: 'Companion', icon: 'Sparkles' }
  ];

  return (
    <div className="fixed inset-0 flex text-slate-200 overflow-hidden font-sans selection:bg-brand-primary/30 islamic-pattern">
      {/* Background Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
<div id="trial-info" className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
{currentUser && !isPremium && !trialExpired && (
  <div className="bg-amber-500/20 backdrop-blur-md border border-amber-500/30 px-6 py-2 rounded-full overflow-hidden">
     <div className="flex items-center gap-3">
        <Sparkles size={14} className="text-amber-400 animate-pulse" />
        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">3-Day Trial Active</p>
        <div className="w-[1px] h-3 bg-amber-500/30" />
        <p className="text-[9px] font-bold text-white/70">
           {Math.ceil((3 * 24 * 60 * 60 * 1000 - (Date.now() - (userJoinedAt?.getTime() || 0))) / (1000 * 60 * 60))} Hours Left
        </p>
     </div>
  </div>
)}
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

      {/* WHATSAPP STYLE SIDEBAR: Narrow Primary Rail */}
      <aside className="hidden lg:flex w-16 h-full bg-brand-sidebar border-r border-brand-border flex-col items-center py-8 gap-6 z-40 flex-shrink-0">
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
              Sparkles
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
      <aside className={`hidden md:flex flex-col h-full bg-brand-sidebar border-r border-brand-border z-30 transition-all duration-500 flex-shrink-0 ${activeTab === 'home' || activeTab === 'settings' || activeTab === 'companion' ? 'w-0 opacity-0 overflow-hidden' : 'w-80 opacity-100'}`}>
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
             <button className="w-10 h-10 rounded-full border border-brand-border bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg shadow-brand-primary/5">
                <Moon size={18} className="text-brand-primary" />
             </button>
             <div className="w-10 h-10 rounded-full border border-brand-border bg-white/5 flex items-center justify-center text-xs font-bold text-brand-primary shadow-lg shadow-brand-primary/5">
                A+
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
                      />
                    } />
                    <Route path="/market" element={<MarketView />} />
                    <Route path="/bookmarks" element={<BookmarksView bookmarks={bookmarks} onRemoveBookmark={toggleBookmark} onNavigate={handleNavigate} />} />
                    <Route path="/settings" element={<SettingsView darkMode={true} setDarkMode={() => {}} onLogout={handleLogout} />} />
                    <Route path="/companion" element={<CompanionView />} />
                    <Route path="/chat" element={<ChatView isPremium={isPremium} />} />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      {/* WHATSAPP MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-brand-sidebar/90 backdrop-blur-xl border-t border-brand-border flex items-center justify-around px-4 z-50">
        {tabsWithCompanion.filter(tab => !['bookmarks', 'settings'].includes(tab.id)).map((tab) => {
          const Icon = { 
            Home, 
            BookOpen, 
            Users, 
            MessageSquare,
            MessageCircle,
            Compass,
            ShoppingBag,
            Sparkles
          }[tab.icon as keyof typeof Icon] || BookOpen;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                navigate(`/${tab.id}`);
                if (tab.id !== 'resources') setSelectedSurah(null);
              }}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-brand-primary' : 'text-slate-500'}`}
            >
              <div className={`w-12 h-8 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-brand-primary/20' : ''}`}>
                <Icon size={22} className={isActive ? 'animate-pulse' : ''} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Rail: Quick Actions - Desktop */}
      <aside className="hidden xl:flex w-20 bg-brand-sidebar border-l border-brand-border flex-col items-center py-8 gap-8 z-30">
        {[
          { icon: LayoutGrid, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
          { icon: Bookmark, color: 'text-slate-500', bg: 'bg-white/5' },
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
                  <h2 className="text-xl font-bold text-white">An-Nur Navigation</h2>
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
    </div>
  );
}

