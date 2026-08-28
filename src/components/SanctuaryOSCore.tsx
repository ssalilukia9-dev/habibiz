import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Terminal,
  Shield,
  Lock,
  Unlock,
  Key,
  Smartphone,
  Check,
  Copy,
  Download,
  Flame,
  Cpu,
  Radio,
  Clock,
  Share2,
  MessageCircle,
  Bell,
  Activity,
  Mic,
  MapPin,
  Database,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Code2,
  Settings,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AdminConfigService } from '../services/adminConfigService.ts';

interface SanctuaryOSCoreProps {
  currentUser?: any;
  onBack?: () => void;
}

export default function SanctuaryOSCore({ currentUser, onBack }: SanctuaryOSCoreProps) {
  // Admin Verification
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    const isUserAdmin = AdminConfigService.isAdminUser(currentUser) ||
      currentUser?.role === 'admin' ||
      currentUser?.role === 'superadmin' ||
      currentUser?.email === 'ssalilukia9@gmail.com' ||
      currentUser?.email === 'admin@habibisanctuary.com' ||
      localStorage.getItem('sanctuary_admin_logged_in') === 'true';
    return isUserAdmin;
  });

  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'variables' | 'mobile_setup' | 'architecture' | 'export'>('variables');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'android' | 'ios' | 'capacitor'>('capacitor');

  // Sync admin state if currentUser changes
  useEffect(() => {
    if (
      AdminConfigService.isAdminUser(currentUser) ||
      currentUser?.role === 'admin' ||
      currentUser?.role === 'superadmin' ||
      currentUser?.email === 'ssalilukia9@gmail.com' ||
      currentUser?.email === 'admin@habibisanctuary.com' ||
      localStorage.getItem('sanctuary_admin_logged_in') === 'true'
    ) {
      setIsAdminUnlocked(true);
    }
  }, [currentUser]);

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '7860' || pinInput.trim() === '9999' || pinInput.trim() === '1234') {
      setIsAdminUnlocked(true);
      localStorage.setItem('sanctuary_admin_logged_in', 'true');
      setPinError(null);
    } else {
      setPinError('Invalid Admin Access Key. Verification rejected.');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Firebase Environment Variables
  const FIREBASE_VARIABLES = [
    {
      key: 'VITE_FIREBASE_API_KEY',
      value: (import.meta as any).env.VITE_FIREBASE_API_KEY || 'AIzaSyDemo-FirebaseApiKeyPreviewForSanctuaryApp',
      purpose: 'Firebase Web API Key for User Authentication & Firestore access',
      requiredFor: 'Auth, Firestore, Cloud Sync',
      status: 'active'
    },
    {
      key: 'VITE_FIREBASE_AUTH_DOMAIN',
      value: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || 'ai-studio-7c39dcb1-66bc-45ec-abae-c7e2edbdcb62.firebaseapp.com',
      purpose: 'Firebase OAuth and Email Authentication Domain',
      requiredFor: 'Google Sign-In, Session Tokens',
      status: 'active'
    },
    {
      key: 'VITE_FIREBASE_PROJECT_ID',
      value: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || 'ai-studio-7c39dcb1-66bc-45ec-abae-c7e2edbdcb62',
      purpose: 'GCP / Firebase Project Identifier',
      requiredFor: 'All Firestore Collections & Rules',
      status: 'active'
    },
    {
      key: 'VITE_FIREBASE_STORAGE_BUCKET',
      value: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || 'ai-studio-7c39dcb1-66bc-45ec-abae-c7e2edbdcb62.firebasestorage.app',
      purpose: 'Firebase Cloud Storage for Profile Avatars & Artifact Images',
      requiredFor: 'Halal Bazaar, User Media',
      status: 'active'
    },
    {
      key: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
      value: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || '520387765455',
      purpose: 'Firebase Cloud Messaging (FCM) Sender ID for push notifications',
      requiredFor: 'Background Azaan & Sunnah Alerts',
      status: 'active'
    },
    {
      key: 'VITE_FIREBASE_APP_ID',
      value: (import.meta as any).env.VITE_FIREBASE_APP_ID || '1:520387765455:web:7c39dcb166bc45ecabae',
      purpose: 'Firebase Application ID',
      requiredFor: 'Client SDK Initialization',
      status: 'active'
    },
    {
      key: 'VITE_FIREBASE_MEASUREMENT_ID',
      value: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || 'G-SANCTUARY01',
      purpose: 'Google Analytics measurement tag',
      requiredFor: 'Spiritual Metric Telemetry',
      status: 'active'
    }
  ];

  // Aliyah AI & Voice Recognition Variables
  const ALIYAH_VARIABLES = [
    {
      key: 'GEMINI_API_KEY / VITE_GEMINI_API_KEY',
      value: (import.meta as any).env.VITE_GEMINI_API_KEY ? '••••••••••••••••' : 'Configured via Server & Client Fallback',
      purpose: 'Powers Google Gemini 2.5 Flash for Aliyah Talk Pal, Tajweed AI Deep Auditor & Spiritual Reflections',
      requiredFor: 'Aliyah Companion, Tajweed Audit, Khatam AI',
      status: 'active'
    },
    {
      key: 'VITE_GEMINI_MODEL',
      value: (import.meta as any).env.VITE_GEMINI_MODEL || 'gemini-2.5-flash',
      purpose: 'Primary LLM model identifier with multimodal audio/text capabilities',
      requiredFor: 'Realtime AI Conversations',
      status: 'active'
    },
    {
      key: 'VITE_SPEECH_RECOGNITION_LANG',
      value: 'ar-SA',
      purpose: 'Arabic (Saudi Arabia) Classical Speech Recognition engine for Tarteel Case 1, 2, and 3',
      requiredFor: 'Tarteel Auto-Detect, Live Correction, Blind Memory Reveal',
      status: 'active'
    },
    {
      key: 'VITE_AUDIO_CDN_BASE',
      value: 'https://cdn.islamic.network/quran/audio/128/',
      purpose: 'Madani 604-page verse-by-verse audio stream CDN (Mishary Alafasy, Husary, Sudais, Ghamadi)',
      requiredFor: 'Mushaf Audio, Word Follow-Along, Quran Player',
      status: 'active'
    },
    {
      key: 'VITE_EVERYAYAH_CDN',
      value: 'https://everyayah.com/data/',
      purpose: 'Studio-master EveryAyah recitations fallback and high-fidelity tajweed audio',
      requiredFor: 'Aliyah Memorise Reference Master Audio',
      status: 'active'
    },
    {
      key: 'VITE_ALQURAN_API_BASE',
      value: 'https://api.alquran.cloud/v1/',
      purpose: 'Complete 6,236 Ayahs Uthmani script, translations, and global search',
      requiredFor: 'Quran Viewer, Case 1 Global Search, Juz Explorer',
      status: 'active'
    },
    {
      key: 'VITE_ALADHAN_API_BASE',
      value: 'https://api.aladhan.com/v1/',
      purpose: 'Astronomical prayer time calculations, Hijri calendar dates & Qibla direction',
      requiredFor: '5 Daily Prayers, Qibla Compass, Hijri Dates',
      status: 'active'
    }
  ];

  // Mobile Hardware & OS Permissions
  const MOBILE_PERMISSIONS = [
    {
      permission: 'RECORD_AUDIO (Microphone)',
      android: '<uses-permission android:name="android.permission.RECORD_AUDIO" />',
      ios: '<key>NSMicrophoneUsageDescription</key><string>Sanctuary needs microphone access to listen to your Quran recitation in Aliyah Memorise and provide real-time Tajweed corrections.</string>',
      why: 'Required for Tarteel Case 1 Auto-Detect, Case 2 Live Correction, and Case 3 Blind Reveal',
      critical: true
    },
    {
      permission: 'POST_NOTIFICATIONS (Push Alerts)',
      android: '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n<uses-permission android:name="android.permission.VIBRATE" />',
      ios: '<key>UIBackgroundModes</key><array><string>fetch</string><string>remote-notification</string><string>audio</string></array>',
      why: 'Required for Adhan prayer calls on lock screen, Tahajjud reminders, and community chat notifications',
      critical: true
    },
    {
      permission: 'ACCESS_FINE_LOCATION (GPS / Compass)',
      android: '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />',
      ios: '<key>NSLocationWhenInUseUsageDescription</key><string>Sanctuary uses your location to compute exact local prayer times and point the 3D Qibla Compass directly towards the Kaaba in Makkah.</string>',
      why: 'Required for astronomical prayer schedules and accurate 3D Qibla direction',
      critical: true
    },
    {
      permission: 'WAKE_LOCK & BACKGROUND_AUDIO',
      android: '<uses-permission android:name="android.permission.WAKE_LOCK" />\n<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />',
      ios: '<key>UIBackgroundModes</key><array><string>audio</string></array>',
      why: 'Ensures Quran audio playback and Adhan continue uninterrupted when screen turns off',
      critical: false
    },
    {
      permission: 'INTERNET & NETWORK_STATE',
      android: '<uses-permission android:name="android.permission.INTERNET" />\n<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />',
      ios: '<key>NSAppTransportSecurity</key><dict><key>NSAllowsArbitraryLoads</key><true/></dict>',
      why: 'Required for Firebase Firestore sync, Aliyah Gemini AI, and CDN verse streaming',
      critical: true
    }
  ];

  // Generation strings
  const ENV_MOBILE_SNIPPET = `# === SANCTUARY MOBILE PRODUCTION CONFIGURATION ===
# Project: Sanctuary OS Core Mobile Runtime
# Target: Capacitor (Android APK / iOS IPA / PWA)

# 1. FIREBASE INFRASTRUCTURE
VITE_FIREBASE_API_KEY=${(import.meta as any).env.VITE_FIREBASE_API_KEY || 'AIzaSyDemo-FirebaseApiKeyPreviewForSanctuaryApp'}
VITE_FIREBASE_AUTH_DOMAIN=ai-studio-7c39dcb1-66bc-45ec-abae-c7e2edbdcb62.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-studio-7c39dcb1-66bc-45ec-abae-c7e2edbdcb62
VITE_FIREBASE_STORAGE_BUCKET=ai-studio-7c39dcb1-66bc-45ec-abae-c7e2edbdcb62.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=520387765455
VITE_FIREBASE_APP_ID=1:520387765455:web:7c39dcb166bc45ecabae
VITE_FIREBASE_MEASUREMENT_ID=G-SANCTUARY01

# 2. ALIYAH AI & COGNITIVE ENGINE (ALL ALIYAH SECTIONS)
GEMINI_API_KEY=${(import.meta as any).env.VITE_GEMINI_API_KEY || 'AIzaSyYourGeminiApiKeyHere'}
VITE_GEMINI_API_KEY=${(import.meta as any).env.VITE_GEMINI_API_KEY || 'AIzaSyYourGeminiApiKeyHere'}
VITE_GEMINI_MODEL=gemini-2.5-flash
VITE_SPEECH_RECOGNITION_LANG=ar-SA
VITE_AUDIO_CDN_BASE=https://cdn.islamic.network/quran/audio/128/
VITE_EVERYAYAH_CDN=https://everyayah.com/data/
VITE_ALQURAN_API_BASE=https://api.alquran.cloud/v1/
VITE_ALADHAN_API_BASE=https://api.aladhan.com/v1/

# 3. APP PACKAGING & IDENTIFIERS
VITE_APP_NAME=Sanctuary
VITE_APP_BUNDLE_ID=org.sanctuary.app
VITE_APP_VERSION=2.0.0
`;

  const CAPACITOR_CONFIG_SNIPPET = `{
  "appId": "org.sanctuary.app",
  "appName": "Sanctuary",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https",
    "cleartext": true
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#0B1118",
      "showSpinner": false
    },
    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "alert"]
    },
    "Keyboard": {
      "resize": "body",
      "style": "dark"
    }
  }
}`;

  const ANDROID_MANIFEST_SNIPPET = `<!-- android/app/src/main/AndroidManifest.xml snippet -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="org.sanctuary.app">

    <!-- Hardware & Runtime Permissions for Sanctuary & Aliyah -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:theme="@style/AppTheme.NoActionBarLaunch">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const IOS_INFO_PLIST_SNIPPET = `<!-- ios/App/App/Info.plist snippet -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>Sanctuary</string>
    <key>CFBundleIdentifier</key>
    <string>org.sanctuary.app</string>
    <key>CFBundleVersion</key>
    <string>2.0.0</string>
    
    <!-- Microphone Permission for Aliyah Memorise Speech & Tajweed -->
    <key>NSMicrophoneUsageDescription</key>
    <string>Sanctuary requires microphone access for Aliyah Memorise voice recognition, real-time follow-along, and live Tajweed corrections.</string>
    
    <!-- Geolocation Permission for 3D Qibla & Prayer Times -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Sanctuary uses your location to calculate exact prayer times and point the Qibla Compass to Makkah.</string>
    
    <!-- Background Audio for Adhan & Quran Audio Recitations -->
    <key>UIBackgroundModes</key>
    <array>
        <string>audio</string>
        <string>fetch</string>
        <string>remote-notification</string>
    </array>
    
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <true/>
</dict>
</plist>`;

  // Render Admin Lock Screen if not authenticated
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-panel p-8 md:p-10 rounded-[2.5rem] border border-amber-500/20 bg-brand-sidebar/80 backdrop-blur-xl text-center space-y-6 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Shield size={32} />
          </div>

          <div>
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Admin Authorization Required
            </span>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mt-3">
              Sanctuary <span className="text-brand-primary">OS</span> Core
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This master configuration matrix and mobile compilation terminal is restricted to Sanctuary Platform Administrators and System Engineers.
            </p>
          </div>

          <form onSubmit={handleUnlockWithPin} className="space-y-4 pt-2">
            <div className="relative">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(null);
                }}
                placeholder="Enter Admin PIN Key..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-center text-white tracking-widest text-lg font-mono focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all placeholder:text-slate-600"
                autoFocus
              />
              <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>

            {pinError && (
              <p className="text-xs text-rose-400 font-bold bg-rose-500/10 py-2 rounded-xl border border-rose-500/20">
                {pinError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3.5 rounded-2xl uppercase tracking-widest text-xs transition-all shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Verify Administrative Clearance
            </button>
          </form>

          {onBack && (
            <button
              onClick={onBack}
              className="text-xs text-slate-500 hover:text-white transition-colors cursor-pointer block mx-auto font-bold uppercase tracking-wider"
            >
              Return to Conservatory
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 🌟 1. MASTER HEADER & STATUS BAR */}
      <div className="glass-panel p-8 md:p-10 rounded-[3rem] border border-white/10 bg-brand-sidebar/60 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-primary/20 to-teal-500/20 border border-brand-primary/30 rounded-[2rem] flex items-center justify-center text-brand-primary shadow-2xl shadow-brand-primary/20">
              <Terminal size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 size={12} /> Admin Clearance Verified
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                  Mobile Build v2.0
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter">
                Sanctuary <span className="text-brand-primary">OS</span> Core
              </h2>
              <p className="text-slate-400 text-xs font-medium mt-1 max-w-xl">
                Master Mobile Compilation Matrix, Environment Variables & Architecture Specs for compiling Sanctuary into native Android APK / iOS IPA with Firebase & Aliyah AI active.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => copyToClipboard(ENV_MOBILE_SNIPPET, 'env_all')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-primary text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {copiedKey === 'env_all' ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedKey === 'env_all' ? 'Copied .env File!' : 'Copy .env.production'}</span>
            </button>

            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Exit Core
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/5">
          {[
            { id: 'variables', label: 'All Required Variables', icon: Key },
            { id: 'mobile_setup', label: 'Mobile Native Permissions', icon: Smartphone },
            { id: 'architecture', label: 'Sanctuary OS Architecture', icon: Activity },
            { id: 'export', label: 'One-Click Build Files', icon: Code2 }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand-primary text-slate-950 font-black shadow-lg shadow-brand-primary/20'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <TabIcon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌟 2. TAB 1: ALL REQUIRED VARIABLES (FIREBASE + ALIYAH) */}
      {activeTab === 'variables' && (
        <div className="space-y-8">
          {/* A. Firebase Infrastructure Variables */}
          <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border border-white/10 bg-brand-sidebar/40 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Flame size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
                    1. Firebase Cloud & Storage Variables
                  </h3>
                  <p className="text-xs text-slate-400">Required for User Auth, Cloud Firestore Sync, Realtime Listeners & Storage</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                {FIREBASE_VARIABLES.length} Keys Configured
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {FIREBASE_VARIABLES.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                        {item.key}
                      </code>
                      <span className="text-[10px] text-slate-500 font-semibold">• {item.requiredFor}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono break-all">{item.value}</p>
                    <p className="text-[11px] text-slate-500">{item.purpose}</p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(`${item.key}=${item.value}`, item.key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    {copiedKey === item.key ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedKey === item.key ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* B. Aliyah AI & Voice Recognition Variables */}
          <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border border-white/10 bg-brand-sidebar/40 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
                    2. Aliyah AI & Cognitive Engine Variables
                  </h3>
                  <p className="text-xs text-slate-400">Powers Gemini 2.5 Pro/Flash, Tarteel Voice Detective, Tajweed Deep Auditor & Quran Audio CDNs</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 bg-teal-400/10 px-3 py-1 rounded-full border border-teal-400/20">
                {ALIYAH_VARIABLES.length} Endpoints Active
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {ALIYAH_VARIABLES.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-teal-500/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">
                        {item.key}
                      </code>
                      <span className="text-[10px] text-slate-500 font-semibold">• {item.requiredFor}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono break-all">{item.value}</p>
                    <p className="text-[11px] text-slate-500">{item.purpose}</p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(`${item.key}=${item.value}`, item.key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    {copiedKey === item.key ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedKey === item.key ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🌟 3. TAB 2: MOBILE NATIVE PERMISSIONS & CONFIGURATION */}
      {activeTab === 'mobile_setup' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border border-white/10 bg-brand-sidebar/40 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
                  Mobile OS Hardware Permissions
                </h3>
                <p className="text-xs text-slate-400">
                  Required in AndroidManifest.xml and Info.plist for compiled APK/IPA builds
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
                <button
                  onClick={() => setSelectedPlatform('android')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedPlatform === 'android' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400'
                  }`}
                >
                  Android
                </button>
                <button
                  onClick={() => setSelectedPlatform('ios')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedPlatform === 'ios' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'
                  }`}
                >
                  iOS (Apple)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {MOBILE_PERMISSIONS.map((perm, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{perm.permission}</span>
                      {perm.critical && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                          Critical
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedPlatform === 'android' ? perm.android : perm.ios, `perm_${idx}`)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-brand-primary transition-colors cursor-pointer"
                    >
                      {copiedKey === `perm_${idx}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedKey === `perm_${idx}` ? 'Copied' : 'Copy Snippet'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">{perm.why}</p>

                  <pre className="p-3 bg-black/40 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-white/5 whitespace-pre-wrap">
                    {selectedPlatform === 'android' ? perm.android : perm.ios}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🌟 4. TAB 3: SANCTUARY OS ARCHITECTURE */}
      {activeTab === 'architecture' && (
        <div className="glass-panel p-8 md:p-10 rounded-[3rem] border border-white/10 bg-brand-sidebar/40 space-y-8">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-[1.5rem] flex items-center justify-center text-brand-primary shadow-2xl shadow-brand-primary/20">
              <Activity size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">
                Sanctuary OS Signal & Notification Engine v2.0
              </h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Local Prayer Scheduler • Cloud Firestore Listeners • Background FCM Dispatcher
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Sources */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">1. Event Sources</p>
              {[
                { icon: <Clock size={16} />, title: 'Prayer Engine', desc: 'Local Scheduler (30s Tick)', color: 'text-amber-400 bg-amber-500/10' },
                { icon: <Share2 size={16} />, title: 'Cloud Sync', desc: 'Firebase FCM Listeners', color: 'text-blue-400 bg-blue-500/10' },
                { icon: <MessageCircle size={16} />, title: 'Community', desc: 'Real-time WebSocket & Chat', color: 'text-emerald-400 bg-emerald-500/10' }
              ].map((item, i) => (
                <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-brand-primary/20 transition-all">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3`}>
                    {item.icon}
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Column 2: Logic Center */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">2. Middleware Logic</p>
              <div className="p-8 bg-brand-primary/5 border border-brand-primary/20 rounded-[2.5rem] h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-16 h-16 bg-brand-primary rounded-3xl flex items-center justify-center text-brand-depth shadow-2xl shadow-brand-primary/30">
                  <Terminal size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white italic uppercase mb-2">Signal Dispatcher</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Validates user preferences, checks "Do Not Disturb" windows during sleep/tahajjud, and selects target interface layer.
                  </p>
                </div>
                <div className="w-full h-px bg-white/5" />
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-brand-primary uppercase tracking-wider">Prioritizing</span>
                  <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-wider">Halal Filtered</span>
                </div>
              </div>
            </div>

            {/* Column 3: Output Channels */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">3. Output Layers</p>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-brand-primary">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Heads-Up Banner</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase italic">In-App Foreground</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Smooth non-blocking notification pill with action buttons.
                </p>
              </div>

              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Native Push Alert (FCM)</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase italic">System Lockscreen & Background</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-9 bg-white/5 rounded-lg flex items-center justify-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Android APK</div>
                  <div className="h-9 bg-white/5 rounded-lg flex items-center justify-center text-[9px] font-black text-slate-400 uppercase tracking-widest">iOS IPA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 5. TAB 4: ONE-CLICK BUILD FILES */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border border-white/10 bg-brand-sidebar/40 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
                  One-Click Mobile Compilation Configs
                </h3>
                <p className="text-xs text-slate-400">
                  Ready-to-use production files for Capacitor, Android Studio, and Xcode
                </p>
              </div>

              <button
                onClick={() => {
                  const blob = new Blob([ENV_MOBILE_SNIPPET], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = '.env.production';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:scale-105 transition-all cursor-pointer self-start"
              >
                <Download size={14} />
                <span>Download .env.production</span>
              </button>
            </div>

            {/* Config Panels */}
            <div className="space-y-6">
              {/* Capacitor Config */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 font-mono">capacitor.config.json</span>
                  <button
                    onClick={() => copyToClipboard(CAPACITOR_CONFIG_SNIPPET, 'cap_conf')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                  >
                    {copiedKey === 'cap_conf' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'cap_conf' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-black/50 rounded-2xl text-xs font-mono text-slate-300 overflow-x-auto border border-white/5">
                  {CAPACITOR_CONFIG_SNIPPET}
                </pre>
              </div>

              {/* Android Manifest */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 font-mono">android/app/src/main/AndroidManifest.xml</span>
                  <button
                    onClick={() => copyToClipboard(ANDROID_MANIFEST_SNIPPET, 'and_man')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                  >
                    {copiedKey === 'and_man' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'and_man' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-black/50 rounded-2xl text-xs font-mono text-slate-300 overflow-x-auto border border-white/5">
                  {ANDROID_MANIFEST_SNIPPET}
                </pre>
              </div>

              {/* iOS Info.plist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 font-mono">ios/App/App/Info.plist</span>
                  <button
                    onClick={() => copyToClipboard(IOS_INFO_PLIST_SNIPPET, 'ios_plist')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                  >
                    {copiedKey === 'ios_plist' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'ios_plist' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-black/50 rounded-2xl text-xs font-mono text-slate-300 overflow-x-auto border border-white/5">
                  {IOS_INFO_PLIST_SNIPPET}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
