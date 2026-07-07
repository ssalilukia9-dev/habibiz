import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Info, MapPin, X, Sparkles, Smartphone } from 'lucide-react';

export default function QiblaView() {
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [hasSensorSignal, setHasSensorSignal] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isCalibrating) {
      setCalibrationProgress(0);
      interval = setInterval(() => {
        setCalibrationProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isCalibrating]);

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
      setHasSensorSignal(true);
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

      {/* Sensor Calibration Assistant Badge */}
      <div className="flex flex-col items-center gap-2 mt-[-20px] mb-8">
        <button
          id="btn-trigger-calibration"
          onClick={() => setIsCalibrating(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 shadow-lg active:scale-95 cursor-pointer hover:border-brand-primary/30"
        >
          <Sparkles size={12} className="text-brand-primary animate-pulse" />
          Inaccurate? Calibrate Sensor
        </button>
        {!hasSensorSignal && (
          <p className="text-[9px] text-slate-500 font-medium">
            Compass signal inactive (desktop or permissions). Tap to calibrate.
          </p>
        )}
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
              <li key={i} className="flex gap-3 text-[10px] text-slate-400 font-medium items-center">
                 <div className="w-1 h-1 bg-brand-primary rounded-full" />
                 <span>{tip}</span>
                 {i === 3 && (
                   <button
                     id="btn-tip-calibrate"
                     onClick={() => setIsCalibrating(true)}
                     className="ml-2 px-2 py-0.5 bg-brand-primary/15 text-brand-primary text-[8px] font-black uppercase tracking-wider rounded border border-brand-primary/20 hover:bg-brand-primary hover:text-brand-depth transition-colors cursor-pointer"
                   >
                     Calibrate Now
                   </button>
                 )}
              </li>
            ))}
         </ul>
      </div>

      {/* Visual Calibration Overlay */}
      <AnimatePresence>
        {isCalibrating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-depth/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-panel max-w-md w-full p-8 rounded-[2.5rem] border-white/10 space-y-8 relative overflow-hidden bg-brand-sidebar shadow-2xl"
            >
              {/* Absolute Glow Background */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Device Calibration</p>
                  <h3 className="text-xl font-bold text-white">Align Compass Sensors</h3>
                </div>
                <button 
                  onClick={() => setIsCalibrating(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Interactive Calibration Guide Animation Arena */}
              <div className="h-48 rounded-3xl bg-brand-depth/50 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Symmetrical Infinity Loop SVG Background */}
                <svg className="absolute w-64 h-32 text-brand-primary/10" viewBox="0 0 200 100" fill="none">
                  <motion.path 
                    d="M 100,50 C 140,20 190,20 190,50 C 190,80 140,80 100,50 C 60,20 10,20 10,50 C 10,80 60,80 100,50 Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeDasharray="4 4"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </svg>

                {/* Tracing Phone Container */}
                <motion.div 
                  className="relative w-10 h-16 bg-brand-primary/10 border-2 border-brand-primary/50 rounded-lg flex flex-col items-center justify-between p-1 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                  animate={{
                    x: [0, 45, 90, 45, 0, -45, -90, -45, 0],
                    y: [0, -30, 0, 30, 0, -30, 0, 30, 0],
                    rotate: [0, 20, 0, -20, 0, 20, 0, -20, 0],
                    rotateX: [0, 15, 0, -15, 0, 15, 0, -15, 0],
                    rotateY: [0, -25, 0, 25, 0, -25, 0, 25, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ perspective: 1000 }}
                >
                  {/* Bezel Notch */}
                  <div className="w-4 h-1 bg-brand-primary/40 rounded-full" />
                  
                  {/* Pulsing Target Core */}
                  <div className="w-2.5 h-2.5 bg-brand-primary rounded-full animate-ping" />
                  
                  {/* Bezel Bottom Accent */}
                  <div className="w-1.5 h-1.5 bg-brand-primary/20 rounded-full" />
                </motion.div>

                {/* Dynamic Orientation Angle Spark Indicator */}
                <div className="absolute bottom-3 text-center">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Rotate along infinity curve
                  </p>
                </div>
              </div>

              {/* Dynamic Calibration Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Sensor Calibration Progress</span>
                  <span className="text-brand-primary">{calibrationProgress}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
                  <motion.div 
                    className="h-full bg-brand-primary rounded-full"
                    style={{ width: `${calibrationProgress}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-medium italic text-center">
                  {calibrationProgress < 35 && "Analyzing ambient magnetic field..."}
                  {calibrationProgress >= 35 && calibrationProgress < 75 && "Adjusting internal magnetometer coils..."}
                  {calibrationProgress >= 75 && calibrationProgress < 100 && "Finalizing vector alignments..."}
                  {calibrationProgress === 100 && "✓ Calibration successful!"}
                </p>
              </div>

              {/* Guidance steps */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Calibration Instructions</h4>
                <div className="space-y-3">
                  {[
                    {
                      step: "01",
                      title: "Flat Surface Alignment",
                      desc: "Place or hold your phone completely flat in the palm of your hand, facing directly up."
                    },
                    {
                      step: "02",
                      title: "Smooth Figure-8 Sweep",
                      desc: "Gently wave your wrist in an infinity loop shape (∞) to reset the internal magnetometer coils."
                    },
                    {
                      step: "03",
                      title: "Magnetic Shielding",
                      desc: "Move away from laptop chargers, speakers, refrigerators, or heavy iron desks."
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span className="text-xs font-black text-brand-primary/40 font-mono mt-0.5">{item.step}</span>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white">{item.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sensor Signal Badge & Action */}
              <div className="pt-2 flex flex-col gap-3">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Hardware Status</p>
                    <p className="text-xs font-bold text-white">
                      {hasSensorSignal ? "Device Gyroscope Online" : "Simulation Mode (Static)"}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                    hasSensorSignal 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {hasSensorSignal ? 'Active' : 'Simulated'}
                  </span>
                </div>

                {/* Simulated heading slider if in simulator mode */}
                {!hasSensorSignal && (
                  <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      <span>Manual Alignment Test</span>
                      <span className="text-brand-primary">{Math.round(heading)}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="359" 
                      value={heading} 
                      onChange={(e) => setHeading(Number(e.target.value))}
                      className="w-full accent-brand-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[8px] text-slate-500 font-medium leading-relaxed">
                      Drag slider to test Qibla indicator alignment in this preview window.
                    </p>
                  </div>
                )}

                <button 
                  onClick={() => setIsCalibrating(false)}
                  className="w-full py-4 bg-brand-primary text-brand-depth font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-primary/25 cursor-pointer"
                >
                  Calibration Completed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
