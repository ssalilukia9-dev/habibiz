import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronUp, Compass, Home, BookOpen, Layers } from 'lucide-react';

export default function GlobalNavigationControls() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor window and document scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      setScrollY(currentScroll);
      setIsScrolled(currentScroll > 180);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut listener: Press Escape or Alt+ArrowLeft to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const activeElement = document.activeElement;
      const isInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.getAttribute('contenteditable') === 'true');
      if (isInput) return;

      if (e.key === 'Escape' && location.pathname !== '/home' && location.pathname !== '/') {
        handleGoBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location.pathname]);

  const isHome = location.pathname === '/home' || location.pathname === '/';

  const handleGoBack = () => {
    // If we have history, go back; otherwise fallback to /home or /resources
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Get readable page name from path
  const getPageTitle = (path: string) => {
    const clean = path.replace('/', '').split('/')[0];
    if (!clean || clean === 'home') return 'Home Sanctuary';
    if (clean === 'khatam') return 'Khatam Journey';
    if (clean === 'memorise') return 'Aliyah Memorise';
    if (clean === 'admin') return 'Admin Central Command';
    if (clean === 'market') return 'Halal Market';
    if (clean === 'ummah') return 'Ummah Social Hub';
    if (clean === 'chat') return 'Companion AI & Chat';
    if (clean === 'quran') return 'The Noble Qur\'an';
    if (clean === 'resources') return 'The Conservatory';
    if (clean === 'bookmarks') return 'Sacred Bookmarks';
    if (clean === 'leaderboard') return 'Ummah Leaderboard';
    if (clean === 'profile') return 'Pilgrim Profile';
    if (clean === 'settings') return 'Sanctuary Settings';
    if (clean === 'babynames' || clean === 'baby-names') return 'Islamic Baby Names';
    if (clean === 'qibla') return 'Qibla Direction';
    if (clean === 'premium') return 'Habibi Sanctuary Pass';
    if (clean === 'about-creators' || clean === 'creators' || clean === 'about') return 'About App Creators';
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  return (
    <>
      {/* 1. FLOATING QUICK RETURN DOCK (Bottom-Left on desktop & mobile, elevated above tab bar) */}
      <AnimatePresence>
        {(!isHome || isScrolled) && (
          <motion.aside
            aria-label="Quick Page Navigation"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 left-4 sm:left-6 z-40 flex items-center gap-2 pointer-events-auto"
          >
            {/* Primary Back Button */}
            {!isHome && (
              <button
                onClick={handleGoBack}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/80 hover:bg-black/95 text-white border border-amber-500/30 hover:border-amber-400 shadow-2xl backdrop-blur-xl transition-all duration-200 cursor-pointer active:scale-95 text-xs font-bold shadow-amber-500/10"
                title="Go back to previous screen (Esc)"
              >
                <div className="w-6 h-6 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center group-hover:-translate-x-0.5 transition-transform">
                  <ArrowLeft size={14} />
                </div>
                <span className="hidden sm:inline text-slate-200 group-hover:text-white font-black tracking-wide">Back</span>
                <span className="sm:hidden text-slate-200 font-bold">Back</span>
              </button>
            )}

            {/* Quick Return to Home (if on deeper sub-pages) */}
            {!isHome && location.pathname !== '/home' && (
              <button
                onClick={() => navigate('/home')}
                className="p-2.5 rounded-2xl bg-black/70 hover:bg-black/90 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 shadow-2xl backdrop-blur-xl transition-all cursor-pointer active:scale-95 hidden md:flex items-center justify-center"
                title="Return to Home Sanctuary"
              >
                <Home size={16} />
              </button>
            )}

            {/* Scroll To Top Button (Appears when scrolled down > 180px) */}
            {isScrolled && (
              <button
                onClick={scrollToTop}
                className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black shadow-xl shadow-amber-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center font-black"
                title="Scroll smoothly back to top"
              >
                <ChevronUp size={18} />
              </button>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. STICKY TOP MINI-BREADCRUMB BAR (When scrolled deeply into articles, verses, or long admin lists) */}
      <AnimatePresence>
        {isScrolled && !isHome && (
          <motion.nav
            aria-label="Scrolled Navigation Bar"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-black/85 backdrop-blur-md border border-white/15 shadow-2xl text-xs font-bold text-white pointer-events-auto"
          >
            <button
              onClick={handleGoBack}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>

            <span className="text-white/20">•</span>

            <span className="text-slate-300 font-medium truncate max-w-[200px]">
              {getPageTitle(location.pathname)}
            </span>

            <span className="text-white/20">•</span>

            <button
              onClick={scrollToTop}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <ChevronUp size={13} />
              <span>Top</span>
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
