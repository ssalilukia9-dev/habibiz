import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, Info, MapPin } from 'lucide-react';

export default function QiblaView() {
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const calculateQibla = (lat: number, lng: number) => {
    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;

    const φ1 = lat * Math.PI / 180;
    const φ2 = kaabaLat * Math.PI / 180;
    const Δλ = (kaabaLng - lng) * Math.PI / 180;

    const y = Math.sin(Δλ);
    const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
    let qibla = Math.atan2(y, x) * 180 / Math.PI;
    qibla = (qibla + 360) % 360;
    return qibla;
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setQiblaDirection(calculateQibla(latitude, longitude));
      },
      (err) => {
        setError("Please enable location access to find the Qibla direction.");
      }
    );

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // For iOS (webkitCompassHeading)
      if ((e as any).webkitCompassHeading) {
        setHeading((e as any).webkitCompassHeading);
      } else if (e.alpha !== null) {
        // For Android/Other
        setHeading(360 - e.alpha);
      }
    };

    if ('ondeviceorientationabsolute' in window) {
      (window as any).addEventListener('deviceorientationabsolute', handleOrientation);
    } else if ('ondeviceorientation' in window) {
      (window as any).addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      (window as any).removeEventListener('deviceorientationabsolute', handleOrientation);
      (window as any).removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const relativeQibla = (qiblaDirection - heading + 360) % 360;
  const isAligned = Math.abs(relativeQibla) < 5 || Math.abs(relativeQibla - 360) < 5;

  return (
    <div className="max-w-xl mx-auto space-y-12 py-10">
      <header className="text-center space-y-4">
        <div className="flex justify-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isAligned ? 'bg-brand-primary text-brand-depth shadow-[0_0_40px_rgba(168,85,247,0.4)]' : 'bg-brand-primary/10 text-brand-primary'}`}>
            <Compass size={32} className={`${isAligned ? 'animate-bounce' : ''}`} />
          </div>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
          Qibla <span className="text-brand-primary">Finder</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">
          Align your heart and body towards the Kaaba.
        </p>
      </header>

      <div className="relative flex justify-center py-20 translate-y-[-20px]">
        {/* Outer Ring */}
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center relative">
          
          {/* Compass Markings */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute text-[10px] font-black text-slate-700"
              style={{ transform: `rotate(${i * 45}deg) translateY(-140px)` }}
            >
              {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][i]}
            </div>
          ))}

          {/* Qibla Indicator */}
          <motion.div 
            className="absolute z-20 flex flex-col items-center"
            animate={{ rotate: relativeQibla }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          >
            <div className="w-1.5 h-32 md:h-40 bg-gradient-to-t from-brand-primary to-transparent rounded-full flex flex-col items-center justify-start">
               <div className={`w-4 h-4 rounded-full mt-[-8px] transition-all duration-500 ${isAligned ? 'bg-brand-primary scale-125 shadow-[0_0_20px_#a855f7]' : 'bg-slate-500'}`} />
               {isAligned && (
                 <motion.div 
                   initial={{ opacity: 0, y: -20 }}
                   animate={{ opacity: 1, y: -40 }}
                   className="absolute whitespace-nowrap bg-brand-primary text-brand-depth px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest"
                 >
                   Aligned
                 </motion.div>
               )}
            </div>
          </motion.div>

          {/* Compass Face */}
          <motion.div 
            className="w-full h-full absolute flex items-center justify-center"
            animate={{ rotate: -heading }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          >
             <div className="w-1 h-32 md:h-40 bg-white/10 rounded-full" />
             <div className="w-32 md:w-40 h-1 bg-white/10 rounded-full absolute" />
          </motion.div>

          <div className="z-10 text-center">
             <p className="text-4xl font-black text-white tracking-tighter">{Math.round(heading)}°</p>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Heading</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-brand-primary">
               <MapPin size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">My Location</span>
            </div>
            <p className="text-xs font-bold text-slate-200">
              {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Searching...'}
            </p>
         </div>
         <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-brand-primary">
               <Compass size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">Qibla Angle</span>
            </div>
            <p className="text-xs font-bold text-slate-200">
              {qiblaDirection ? `${Math.round(qiblaDirection)}° N` : '--'}
            </p>
         </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-4">
           <Info className="text-rose-500 flex-shrink-0" size={20} />
           <p className="text-xs text-rose-500 font-medium leading-relaxed">{error}</p>
        </div>
      )}

      <div className="p-6 bg-white/5 rounded-3xl space-y-4">
         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Best Results</h4>
         <ul className="space-y-2">
            {[
              "Place your phone on a flat surface.",
              "Move away from heavy electronic equipment.",
              "Ensure location services are enabled for this app.",
              "Rotate your phone in a 'figure-8' to calibrate."
            ].map((tip, i) => (
              <li key={i} className="flex gap-3 text-[10px] text-slate-400 font-medium">
                 <div className="w-1 h-1 bg-brand-primary rounded-full mt-1.5" />
                 {tip}
              </li>
            ))}
         </ul>
      </div>
    </div>
  );
}
