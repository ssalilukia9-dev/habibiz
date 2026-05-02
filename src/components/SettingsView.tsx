import { Moon, Sun, Globe, Bell, Shield, Info, Database, LogOut, ArrowRight } from 'lucide-react';
import { LANGUAGES } from '../constants.ts';

interface SettingsViewProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onLogout: () => void;
}

export default function SettingsView({ darkMode, setDarkMode, onLogout }: SettingsViewProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-20">
      <header>
        <h2 className="text-4xl font-bold text-white tracking-tight">App Settings</h2>
        <p className="text-brand-primary font-medium tracking-wide">Personalize your digital sanctuary</p>
      </header>

      {/* Appearance Section */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary/60 flex items-center gap-3">
          <Moon size={14} /> Global Appearance
        </h3>
        <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white/5 rounded-2xl text-brand-primary border border-white/5">
                {darkMode ? <Moon size={22} /> : <Sun size={22} />}
              </div>
              <div>
                <p className="font-bold text-slate-200">Dark Sanctuary Mode</p>
                <p className="text-xs text-slate-500">Optimized for night-time reflection</p>
              </div>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-16 h-9 rounded-full transition-all relative ${darkMode ? 'bg-brand-primary' : 'bg-slate-800'}`}
            >
              <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all ${darkMode ? 'left-8' : 'left-1.5'} shadow-lg`} />
            </button>
          </div>
          
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white/5 rounded-2xl text-brand-primary border border-white/5">
                 <Globe size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-200">Primary Translation</p>
                <p className="text-xs text-slate-500">Language for meaning and context</p>
              </div>
            </div>
            <select className="bg-brand-depth border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest p-2.5 outline-none text-brand-primary focus:border-brand-primary/50 transition-all cursor-pointer">
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary/60 flex items-center gap-3">
          <Shield size={14} /> Service & Privacy
        </h3>
        <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
           {[
             { icon: Bell, label: 'Prayer Notifications', desc: 'Sync with local prayer times' },
             { icon: Database, label: 'Offline Sanctuary', desc: 'Manage downloaded revelations' },
             { icon: Info, label: 'An-Nur Version', desc: 'v1.3.0-purple • Sanctuary Release' }
           ].map((item, i) => (
             <button 
               key={i}
               className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all border-b border-white/5 last:border-0 group"
             >
               <div className="flex items-center gap-5 text-left">
                  <div className="p-3 bg-white/5 rounded-2xl text-slate-400 group-hover:text-brand-primary transition-colors border border-white/5">
                    <item.icon size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
               </div>
               <ChevronRight size={20} className="text-slate-700 group-hover:text-brand-primary transition-colors" />
             </button>
           ))}
        </div>
      </section>

      {/* Logout Section */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500/60 flex items-center gap-3">
          <LogOut size={14} /> Critical Actions
        </h3>
        <div className="bg-red-500/5 rounded-[2rem] border border-red-500/10 overflow-hidden shadow-2xl">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-between p-8 hover:bg-red-500/10 transition-all group"
          >
            <div className="flex items-center gap-5 text-left">
              <div className="p-4 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20 group-hover:scale-110 transition-transform">
                <LogOut size={24} />
              </div>
              <div>
                <p className="font-black text-slate-200">Sign Out of Sanctuary</p>
                <p className="text-xs text-red-500/60 font-medium">Safe departure from your digital session</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-all">
              <ArrowRight size={20} />
            </div>
          </button>
        </div>
      </section>

      <div className="pt-16 text-center space-y-4">
        <p className="text-sm text-slate-500 italic max-w-xs mx-auto">"Invite to the way of your Lord with wisdom and good instruction." (16:125)</p>
        <div className="h-[1px] w-12 bg-brand-primary/20 mx-auto" />
        <p className="text-[10px] text-brand-primary/30 font-mono uppercase tracking-[0.4em]">Digital Sanctuary © 2026</p>
      </div>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number, className: string }) {
  return (
    <svg 
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
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
