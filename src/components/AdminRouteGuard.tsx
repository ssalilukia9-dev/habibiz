import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Key, 
  ArrowLeft, 
  AlertCircle, 
  Sparkles, 
  ShieldAlert,
  CheckCircle2,
  Terminal
} from 'lucide-react';
import { AdminConfigService, AdminConfig } from '../services/adminConfigService.ts';

interface AdminRouteGuardProps {
  currentUser: any;
  children: React.ReactNode;
  onAdminAuthenticated?: (userPayload: any) => void;
}

export default function AdminRouteGuard({ 
  currentUser, 
  children, 
  onAdminAuthenticated 
}: AdminRouteGuardProps) {
  const navigate = useNavigate();
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(AdminConfigService.getConfig());
  const [adminIdentifier, setAdminIdentifier] = useState<string>(currentUser?.email || currentUser?.uid || '');
  const [adminPasscode, setAdminPasscode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('sanctuary_admin_logged_in') === 'true' || AdminConfigService.isAdminUser(currentUser);
  });

  useEffect(() => {
    const unsub = AdminConfigService.subscribe((cfg) => {
      setAdminConfig(cfg);
      if (AdminConfigService.isAdminUser(currentUser)) {
        setIsUnlocked(true);
      }
    });
    return () => unsub();
  }, [currentUser]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await AdminConfigService.verifyAdminCredentials(adminIdentifier, adminPasscode);
      if (result.success && result.userPayload) {
        setIsUnlocked(true);
        localStorage.setItem('sanctuary_admin_logged_in', 'true');
        if (onAdminAuthenticated) {
          onAdminAuthenticated(result.userPayload);
        }
      } else {
        setError(result.error || 'Access Denied: Invalid overseer credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error while verifying overseer authority.');
    } finally {
      setLoading(false);
    }
  };

  // If verified as authorized admin, grant access to AdminView
  if (isUnlocked && (AdminConfigService.isAdminUser(currentUser) || localStorage.getItem('sanctuary_admin_logged_in') === 'true')) {
    return <>{children}</>;
  }

  // Otherwise, render High-Security Admin Route Guard Sanctum
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl glass-panel-purple border-brand-primary/30 p-8 sm:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden bg-black/60 backdrop-blur-2xl"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-[2rem] bg-gradient-to-tr from-brand-primary/20 via-amber-500/20 to-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary shadow-xl shadow-brand-primary/10">
              <ShieldAlert size={38} className="animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className="px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-[0.25em]">
                Restricted Sanctum
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight">
                Overseer Command Center
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                This sector contains high-authority administrative tools, real-time audit feeds, user record controls, and system parameters.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center gap-3 text-red-400 text-xs font-semibold"
              >
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Secure Challenge Form */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Overseer Identifier / Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={adminIdentifier}
                  onChange={(e) => setAdminIdentifier(e.target.value)}
                  placeholder="Enter Overseer Identifier or Email"
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-primary/60 focus:bg-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Security Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-primary/60 focus:bg-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none tracking-widest transition-all"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 px-6 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-brand-depth font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Unlock size={16} />
                <span>{loading ? 'Verifying Security...' : 'Authorize Access'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/home')}
                className="py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Return Home</span>
              </button>
            </div>
          </form>

          {/* Quick Helper Badge */}
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-brand-primary" />
              Protected by Firestore Role Validation
            </span>
            <span>Security Guard • Multi-Factor Active</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
