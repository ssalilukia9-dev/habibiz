import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Hash, 
  ChevronRight, 
  RotateCcw,
  Navigation,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function ToolsView() {
  const [activeTool, setActiveTool] = useState<'tasbih' | 'qibla' | 'mosques' | 'calendar'>('tasbih');
  
  // Tasbih Logic
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [vibrate, setVibrate] = useState(false);

  const increment = () => {
    setCount(prev => prev + 1);
    setVibrate(true);
    setTimeout(() => setVibrate(false), 50);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Sub-Nav */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {[
          { id: 'tasbih', label: 'Tasbih', icon: Hash },
          { id: 'qibla', label: 'Qibla', icon: Compass },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'mosques', label: 'Nearby', icon: MapPin }
        ].map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id as any)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-bold transition-all border ${
              activeTool === tool.id 
              ? 'bg-brand-primary text-brand-depth border-brand-primary shadow-xl shadow-brand-primary/20' 
              : 'bg-white/5 text-slate-500 border-white/5'
            }`}
          >
            <tool.icon size={16} /> {tool.label}
          </button>
        ))}
      </div>

      <div className="max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTool === 'tasbih' && (
            <motion.div
              key="tasbih"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-12"
            >
               <div className="text-center">
                  <h3 className="text-2xl font-black text-white mb-2">Electronic Tasbih</h3>
                  <p className="text-slate-500 font-medium">Keep track of your morning and evening dhikr.</p>
               </div>

               <div className="relative">
                  {/* Outer Ring */}
                  <div className="w-80 h-80 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                     <div className="absolute inset-0 rounded-full border-4 border-brand-primary opacity-20 border-t-transparent animate-[spin_5s_linear_infinite]" />
                     
                     <button 
                       onClick={increment}
                       className={`w-64 h-64 bg-brand-sidebar border-2 border-brand-primary/20 rounded-full flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5),0_0_30px_rgba(212,175,55,0.1)] active:scale-95 transition-all outline-none ${vibrate ? 'scale-98' : ''}`}
                     >
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4">Count</span>
                        <span className="text-7xl font-black text-white mb-4 leading-none tabular-nums">{count}</span>
                        <span className="text-xs font-bold text-slate-500">Target: {target}</span>
                     </button>
                  </div>
               </div>

               <div className="flex gap-6">
                  <button 
                    onClick={() => setCount(0)}
                    className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors border border-white/5"
                  >
                     <RotateCcw size={20} />
                  </button>
                  <div className="bg-white/5 rounded-2xl p-1 flex gap-1 border border-white/5">
                     {[33, 99, 1000].map(val => (
                       <button 
                         key={val}
                         onClick={() => setTarget(val)}
                         className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${target === val ? 'bg-brand-primary text-brand-depth' : 'text-slate-500 hover:text-white'}`}
                       >
                         {val}
                       </button>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {activeTool === 'qibla' && (
            <motion.div
              key="qibla"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-10"
            >
               <div className="text-center">
                  <h3 className="text-2xl font-black text-white mb-2">Qibla Finder</h3>
                  <p className="text-slate-500 font-medium italic">Face the Kaaba in Makkah, Saudi Arabia.</p>
               </div>
               
               <div className="relative w-72 h-72 rounded-full border-2 border-brand-primary/20 flex items-center justify-center bg-brand-sidebar shadow-2xl">
                  {/* Compass Markers */}
                  <div className="absolute inset-4 rounded-full border border-white/5" />
                  <div className="absolute top-4 text-[10px] font-black text-slate-600">N</div>
                  <div className="absolute bottom-4 text-[10px] font-black text-slate-600">S</div>
                  <div className="absolute left-4 text-[10px] font-black text-slate-600">W</div>
                  <div className="absolute right-4 text-[10px] font-black text-slate-600">E</div>

                  {/* Compass Needle */}
                  <motion.div 
                    animate={{ rotate: 115 }} 
                    className="absolute w-1 h-48 bg-gradient-to-b from-brand-primary via-brand-primary to-transparent rounded-full flex flex-col items-center"
                  >
                     <div className="w-4 h-4 bg-brand-primary rounded-full shadow-lg shadow-brand-primary/50" />
                  </motion.div>

                  <div className="z-10 bg-brand-sidebar p-4 rounded-3xl border border-white/10 flex flex-col items-center shadow-xl">
                     <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">Direction</span>
                     <span className="text-2xl font-black text-white">115° SE</span>
                  </div>
               </div>

               <div className="glass-panel-gold p-6 rounded-3xl border-brand-primary/30 flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-brand-depth">
                     <Navigation size={20} />
                  </div>
                  <p className="text-sm font-bold text-white">Device location accuracy: High</p>
               </div>
            </motion.div>
          )}

          {activeTool === 'mosques' && (
            <motion.div
              key="mosques"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
               <div className="text-center mb-10">
                  <h3 className="text-2xl font-black text-white mb-2">Nearby Mosques</h3>
                  <p className="text-slate-500 font-medium">Find places of worship in your current vicinity.</p>
               </div>
               
               {[
                 { name: "Al-Noor Islamic Center", dist: "0.8 km", time: "12 min walk", color: "bg-emerald-500" },
                 { name: "Grand Central Masjid", dist: "2.4 km", time: "6 min drive", color: "bg-blue-500" },
                 { name: "Community Prayer Hall", dist: "3.2 km", time: "8 min drive", color: "bg-amber-500" }
               ].map(mosque => (
                 <div key={mosque.name} className="glass-panel p-6 rounded-3xl border-white/5 flex items-center justify-between hover:border-brand-primary/20 transition-all group">
                    <div className="flex gap-4 items-center">
                       <div className={`w-12 h-12 ${mosque.color} rounded-2xl flex items-center justify-center text-brand-depth group-hover:scale-110 transition-transform`}>
                          <MapPin size={24} />
                       </div>
                       <div>
                          <p className="font-bold text-white mb-1">{mosque.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                             <Clock size={10} /> {mosque.time} • {mosque.dist} away
                          </p>
                       </div>
                    </div>
                    <button className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-brand-primary transition-colors">
                       <ExternalLink size={20} />
                    </button>
                 </div>
               ))}
            </motion.div>
          )}

          {activeTool === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
               <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-white mb-2">Hijri Calendar</h3>
                  <p className="text-slate-500 font-medium">14 Shawwal 1445 AH</p>
               </div>

               <div className="glass-panel p-8 rounded-[3rem] border-white/5">
                  <div className="grid grid-cols-7 gap-4 text-center mb-8">
                     {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                       <div key={`${d}-${idx}`} className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{d}</div>
                     ))}
                     {Array.from({ length: 30 }).map((_, i) => (
                       <div key={i} className={`h-12 flex items-center justify-center text-sm font-bold rounded-2xl transition-all ${i + 1 === 14 ? 'bg-brand-primary text-brand-depth shadow-lg shadow-brand-primary/20 scale-110' : 'text-slate-400 hover:bg-white/5'}`}>
                          {i + 1}
                       </div>
                     ))}
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                        <div className="flex gap-3 items-center">
                           <div className="w-2 h-2 bg-brand-primary rounded-full" />
                           <span className="text-sm font-bold text-white">Upcoming: Hajj Season</span>
                        </div>
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">In 46 Days</span>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
