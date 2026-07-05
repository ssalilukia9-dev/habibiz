import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Heart, 
  Navigation, 
  Compass, 
  Waves, 
  Tent, 
  Moon, 
  Flame, 
  ArrowLeft,
  X,
  Footprints,
  Play,
  Award,
  BookOpen
} from 'lucide-react';

interface HajjGame3DProps {
  onClose: () => void;
  addHasanat: (amount: number) => void;
}

type StepId = 'onboarding' | 'talbiyah' | 'tawaf' | 'sai' | 'mina' | 'arafat' | 'muzdalifah' | 'jamarat' | 'completion';

export default function HajjGame3D({ onClose, addHasanat }: HajjGame3DProps) {
  const [currentStep, setCurrentStep] = useState<StepId>('onboarding');
  const [gender, setGender] = useState<'brother' | 'sister' | null>(null);
  const [spiritualFocus, setSpiritualFocus] = useState(100);
  const [earnedHasanat, setEarnedHasanat] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 3D Camera / Orbit / Gyroscope state
  const [cameraYaw, setCameraYaw] = useState<number>(35); // View orbit around Y
  const [cameraPitch, setCameraPitch] = useState<number>(-22); // View tilt around X
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, yaw: 0, pitch: 0 });
  const [gyroActive, setGyroActive] = useState(false);

  // Character walker state
  const [charPos, setCharPos] = useState({ x: 0, y: 0, z: 0 });

  // Handle drag/swipe rotation
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStart({
      x: clientX,
      y: clientY,
      yaw: cameraYaw,
      pitch: cameraPitch
    });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    
    // Smooth orbit rotation
    setCameraYaw((dragStart.yaw + deltaX * 0.6) % 360);
    setCameraPitch(Math.max(-65, Math.min(-5, dragStart.pitch - deltaY * 0.5)));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Listen to Gyroscope/Device Orientation Event
  useEffect(() => {
    if (!gyroActive) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // Use alpha for Yaw and beta/gamma for Pitch
      if (e.alpha !== null && e.beta !== null) {
        // Smooth direct orientation feedback (relative to standard hold angle)
        setCameraYaw(Math.floor(e.alpha + 45) % 360);
        const pitchAngle = Math.max(-60, Math.min(-10, -Math.floor(e.beta)));
        setCameraPitch(pitchAngle);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [gyroActive]);

  const requestGyroPermission = async () => {
    const reqPermission = (DeviceOrientationEvent as any).requestPermission;
    if (typeof reqPermission === 'function') {
      try {
        const response = await reqPermission();
        if (response === 'granted') {
          setGyroActive(true);
          playSuccess();
        } else {
          setGyroActive(false);
        }
      } catch (err) {
        console.error('Permission requesting error:', err);
        setGyroActive(true); // Attempt fallback
      }
    } else {
      // Direct activation for browsers without requestPermission API
      setGyroActive(!gyroActive);
      playSuccess();
    }
  };

  // Tawaf state
  const [tawafRounds, setTawafRounds] = useState(0);
  const [kaabaRotation, setKaabaRotation] = useState(45);
  const [isWalkingTawaf, setIsWalkingTawaf] = useState(false);
  const [tawafProgress, setTawafProgress] = useState(0); // 0 to 100 for current round

  // Sa'i state
  const [saiLaps, setSaiLaps] = useState(0);
  const [saiPosition, setSaiPosition] = useState(0); // -100 (Safa) to 100 (Marwa)
  const [currentHill, setCurrentHill] = useState<'Safa' | 'Marwa'>('Safa');
  const [stepToggle, setStepToggle] = useState(false);

  // Mina Dhikr state
  const [dhikrCount, setDhikrCount] = useState(0);
  const [dhikrRequired] = useState(15);

  // Arafat Dua state
  const [selectedDuas, setSelectedDuas] = useState<string[]>([]);
  const [arafatCompleted, setArafatCompleted] = useState(false);

  // Muzdalifah state
  const [pebblesCollected, setPebblesCollected] = useState(0);
  const [pebbles, setPebbles] = useState<{ id: number; x: number; y: number; collected: boolean }[]>([]);

  // Jamarat state
  const [jamaratHits, setJamaratHits] = useState(0);
  const [isThrowing, setIsThrowing] = useState(false);
  const [throwOutcome, setThrowOutcome] = useState<'hit' | 'miss' | null>(null);
  const [targetX, setTargetX] = useState(50); // 0-100 target zone center

  useEffect(() => {
    // Generate random pebbles for Muzdalifah
    if (currentStep === 'muzdalifah') {
      const list = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        y: 20 + Math.random() * 60,
        collected: false
      }));
      setPebbles(list);
    }
  }, [currentStep]);

  const awardPoints = (amount: number) => {
    setEarnedHasanat(prev => prev + amount);
    addHasanat(amount);
  };

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.log('Audio feedback failed', e);
    }
  };

  const playSuccess = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio success failed', e);
    }
  };

  // Onboarding Start
  const selectGender = (g: 'brother' | 'sister') => {
    setGender(g);
    playBeep();
    awardPoints(30);
    setCurrentStep('talbiyah');
  };

  // Talbiyah logic
  const [talbiyahBeats, setTalbiyahBeats] = useState<number[]>([]);
  const handleTalbiyahTap = () => {
    playBeep();
    setTalbiyahBeats(prev => [...prev, Date.now()]);
    if (talbiyahBeats.length >= 6) {
      playSuccess();
      awardPoints(40);
      setCurrentStep('tawaf');
    }
  };

  // Tawaf walk tick
  useEffect(() => {
    let interval: any;
    if (isWalkingTawaf && currentStep === 'tawaf') {
      interval = setInterval(() => {
        setKaabaRotation(prev => (prev + 5) % 360);
        setTawafProgress(prev => {
          const next = prev + 4;
          if (next >= 100) {
            playSuccess();
            setTawafRounds(r => {
              const nr = r + 1;
              if (nr >= 7) {
                setIsWalkingTawaf(false);
                setTimeout(() => {
                  awardPoints(60);
                  setCurrentStep('sai');
                }, 1000);
              }
              return nr;
            });
            return 0;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isWalkingTawaf, currentStep]);

  // Sa'i step walk
  const handleSaiStep = () => {
    playBeep();
    setStepToggle(!stepToggle);
    setSaiPosition(prev => {
      const step = currentHill === 'Safa' ? 10 : -10;
      const next = prev + step;
      
      if (next >= 100 && currentHill === 'Safa') {
        playSuccess();
        setCurrentHill('Marwa');
        setSaiLaps(l => {
          const nl = l + 1;
          if (nl >= 7) {
            setTimeout(() => {
              awardPoints(60);
              setCurrentStep('mina');
            }, 1000);
          }
          return nl;
        });
        return 100;
      }
      if (next <= -100 && currentHill === 'Marwa') {
        playSuccess();
        setCurrentHill('Safa');
        setSaiLaps(l => {
          const nl = l + 1;
          if (nl >= 7) {
            setTimeout(() => {
              awardPoints(60);
              setCurrentStep('mina');
            }, 1000);
          }
          return nl;
        });
        return -100;
      }
      return next;
    });
  };

  // Mina dhikr tap
  const handleDhikr = () => {
    playBeep();
    setDhikrCount(prev => {
      const next = prev + 1;
      if (next >= dhikrRequired) {
        playSuccess();
        awardPoints(40);
        setTimeout(() => {
          setCurrentStep('arafat');
        }, 1200);
      }
      return next;
    });
  };

  // Arafat toggle dua
  const toggleDua = (dua: string) => {
    playBeep();
    if (selectedDuas.includes(dua)) {
      setSelectedDuas(prev => prev.filter(d => d !== dua));
    } else {
      setSelectedDuas(prev => [...prev, dua]);
    }
  };

  const completeArafat = () => {
    if (selectedDuas.length < 3) return;
    playSuccess();
    awardPoints(50);
    setArafatCompleted(true);
    setTimeout(() => {
      setCurrentStep('muzdalifah');
    }, 1500);
  };

  // Muzdalifah pick pebble
  const collectPebble = (id: number) => {
    playBeep();
    setPebbles(prev => prev.map(p => p.id === id ? { ...p, collected: true } : p));
    setPebblesCollected(prev => {
      const next = prev + 1;
      if (next >= 7) {
        playSuccess();
        awardPoints(40);
        setTimeout(() => {
          setCurrentStep('jamarat');
        }, 1200);
      }
      return next;
    });
  };

  // Jamarat stoning logic
  const throwPebble = () => {
    if (isThrowing || pebblesCollected <= 0) return;
    setIsThrowing(true);
    playBeep();
    setPebblesCollected(prev => prev - 1);

    // Dynamic slider challenge logic: throw is successful if slider indicator is near targetX
    const sliderVal = Math.floor(Math.random() * 100);
    const hitZone = Math.abs(sliderVal - targetX) < 25;

    setTimeout(() => {
      if (hitZone) {
        setThrowOutcome('hit');
        playSuccess();
        setJamaratHits(h => {
          const next = h + 1;
          if (next >= 7) {
            setTimeout(() => {
              awardPoints(50);
              setCurrentStep('completion');
            }, 1500);
          }
          return next;
        });
      } else {
        setThrowOutcome('miss');
      }
      
      // Update new target center randomly
      setTargetX(20 + Math.random() * 60);

      setTimeout(() => {
        setIsThrowing(false);
        setThrowOutcome(null);
      }, 1000);
    }, 600);
  };

  const DUA_POOL = [
    "Astagfirullah - Seeking continuous forgiveness for past mistakes",
    "SubhanAllah - Glorifying Allah's absolute perfection and majesty",
    "Alhamdulillah - Expressing deep gratitude for health, family & guidance",
    "La ilaha illallah - Reaffirming strict monotheism and loyalty to Him",
    "Rabbana Atina - Praying for peace in this life and high status in hereafter",
    "Allahumma inni as'aluka - Asking for paradise and safety from distress"
  ];

  const render3DCharacter = (isMoving: boolean, isActionActive: boolean) => {
    const isSister = gender === 'sister';
    
    return (
      <div className="relative transform-style-preserve-3d w-10 h-20 flex flex-col items-center">
        {/* Head */}
        <div 
          className={`w-6 h-6 rounded-lg absolute -top-6 left-2 border shadow-lg transform-style-preserve-3d ${
            isSister 
              ? 'bg-slate-100 border-slate-200' // Sister headscarf/hijab
              : 'bg-amber-100 border-amber-200' // Brother head
          }`}
          style={{ transform: 'translateZ(2px)' }}
        >
          {isSister && (
            // Hijab wrap
            <div className="absolute inset-0 bg-white/90 rounded-b-md shadow-inner" />
          )}
          {/* Subtle eyes */}
          <div className="absolute top-1.5 left-1 w-1 h-1 bg-stone-800 rounded-full" />
          <div className="absolute top-1.5 right-1 w-1 h-1 bg-stone-800 rounded-full" />
        </div>

        {/* Torso / Body robes */}
        <div 
          className="w-8 h-12 bg-white border border-slate-200 rounded-lg absolute top-0 left-1 shadow-md transform-style-preserve-3d flex items-center justify-center overflow-hidden"
          style={{ transform: 'translateZ(0px)' }}
        >
          {/* Robe stripes / Ihram pattern */}
          {!isSister ? (
            // Brother shoulder wrap wrap strap
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white via-slate-50 to-white/10 rotate-12 origin-top-left border-r border-slate-200" />
          ) : (
            // Sister dress details
            <div className="absolute bottom-1 w-full h-1 bg-brand-primary/20" />
          )}
          {/* Pure spiritual light core inside the player */}
          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/40 animate-ping" />
        </div>

        {/* Left Arm / Hands raised in supplication/stone-throwing */}
        <motion.div 
          className="absolute w-2 h-7 bg-white border border-slate-200 rounded-full -left-1.5 top-1 origin-top transform-style-preserve-3d"
          animate={
            isActionActive 
              ? { rotateX: [-20, -110, -20], rotateY: [0, -10, 0] } 
              : { rotateX: 0, rotateY: 0 }
          }
          transition={{ repeat: isActionActive ? Infinity : 0, duration: 0.8, ease: 'easeInOut' }}
        />

        {/* Right Arm / Supplication position */}
        <motion.div 
          className="absolute w-2 h-7 bg-white border border-slate-200 rounded-full -right-1.5 top-1 origin-top transform-style-preserve-3d"
          animate={
            isActionActive 
              ? { rotateX: [-20, -110, -20], rotateY: [0, 10, 0] } 
              : { rotateX: 0, rotateY: 0 }
          }
          transition={{ repeat: isActionActive ? Infinity : 0, duration: 0.8, ease: 'easeInOut', delay: 0.1 }}
        />

        {/* Left Leg */}
        <motion.div 
          className={`absolute w-2.5 h-8 border rounded-b-md top-12 left-1.5 origin-top transform-style-preserve-3d ${
            isSister ? 'bg-white border-slate-200' : 'bg-amber-100/90 border-amber-200/40'
          }`}
          animate={isMoving ? { rotateX: [-28, 28, -28] } : { rotateX: 0 }}
          transition={isMoving ? { repeat: Infinity, duration: 0.6, ease: 'easeInOut' } : {}}
        />

        {/* Right Leg */}
        <motion.div 
          className={`absolute w-2.5 h-8 border rounded-b-md top-12 left-4 origin-top transform-style-preserve-3d ${
            isSister ? 'bg-white border-slate-200' : 'bg-amber-100/90 border-amber-200/40'
          }`}
          animate={isMoving ? { rotateX: [28, -28, 28] } : { rotateX: 0 }}
          transition={isMoving ? { repeat: Infinity, duration: 0.6, ease: 'easeInOut' } : {}}
        />

        {/* Shadow floor base */}
        <div 
          className="absolute w-12 h-12 bg-black/35 rounded-full blur-xs"
          style={{ transform: 'rotateX(90deg) translateZ(18px) translateY(-14px)' }}
        />
      </div>
    );
  };

  const getStageStatus = (stageId: string) => {
    const stepOrder: StepId[] = ['onboarding', 'talbiyah', 'tawaf', 'sai', 'mina', 'arafat', 'muzdalifah', 'jamarat', 'completion'];
    const currentIndex = stepOrder.indexOf(currentStep);

    if (stageId === 'ihram') {
      if (currentIndex > 1) return 'completed';
      if (currentIndex <= 1) return 'active';
    }
    if (stageId === 'tawaf') {
      if (currentIndex > 2) return 'completed';
      if (currentIndex === 2) return 'active';
      return 'locked';
    }
    if (stageId === 'sai') {
      if (currentIndex > 3) return 'completed';
      if (currentIndex === 3) return 'active';
      return 'locked';
    }
    if (stageId === 'mina_arafat') {
      if (currentIndex > 5) return 'completed';
      if (currentIndex === 4 || currentIndex === 5) return 'active';
      return 'locked';
    }
    if (stageId === 'stoning') {
      if (currentIndex > 7) return 'completed';
      if (currentIndex === 6 || currentIndex === 7) return 'active';
      return 'locked';
    }
    return 'locked';
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-brand-depth/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
      <div className="w-full max-w-4xl bg-brand-sidebar border border-brand-primary/20 rounded-[3rem] p-6 md:p-10 relative shadow-2xl overflow-hidden flex flex-col md:flex-row gap-8 max-h-[95vh]">
        {/* Absolute Background Ambient Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        {/* Left Side: Game UI & Controls */}
        <div className="flex-1 flex flex-col justify-between relative z-10 min-w-0">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary/15 rounded-2xl flex items-center justify-center text-brand-primary">
                <Gamepad2 size={20} />
              </div>
              <div>
                <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] block leading-none">Interactive Simulator</span>
                <h4 className="text-lg font-black text-white leading-tight uppercase tracking-tight">Pilgrimage Quest</h4>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)} 
                className="text-slate-400 hover:text-white transition-colors"
                title={soundEnabled ? 'Mute' : 'Unmute'}
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Mini-Levels Stage Tracker */}
          <div className="mb-6 bg-brand-depth/20 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ritual Milestones</span>
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-2 py-0.5 rounded-lg border border-brand-primary/20">Earn Hasanat!</span>
            </div>
            <div className="flex items-center justify-between gap-1.5 md:gap-2">
              {[
                { id: 'ihram', label: 'Ihram' },
                { id: 'tawaf', label: 'Tawaf' },
                { id: 'sai', label: 'Sa\'i' },
                { id: 'mina_arafat', label: 'Mina & Arafat' },
                { id: 'stoning', label: 'Jamarat' }
              ].map((stage, i, arr) => {
                const status = getStageStatus(stage.id);
                return (
                  <div key={stage.id} className="flex-1 flex flex-col items-center relative group">
                    <div className="flex items-center w-full">
                      {/* Left Connector Line */}
                      {i > 0 && (
                        <div className={`flex-1 h-[2px] transition-all duration-500 ${status === 'completed' || status === 'active' ? 'bg-brand-primary' : 'bg-white/5'}`} />
                      )}
                      
                      {/* Ritual Node Bullet */}
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all duration-500 ${
                        status === 'completed' ? 'bg-emerald-500 border-emerald-400 text-slate-950 scale-105 shadow-md shadow-emerald-500/10' :
                        status === 'active' ? 'bg-brand-primary border-brand-primary text-slate-950 scale-110 shadow-lg shadow-brand-primary/20 animate-pulse' :
                        'bg-white/5 border-white/5 text-slate-500'
                      }`}>
                        {status === 'completed' ? '✓' : i + 1}
                      </div>

                      {/* Right Connector Line */}
                      {i < arr.length - 1 && (
                        <div className={`flex-1 h-[2px] transition-all duration-500 ${getStageStatus(arr[i+1].id) === 'completed' || getStageStatus(arr[i+1].id) === 'active' ? 'bg-brand-primary' : 'bg-white/5'}`} />
                      )}
                    </div>
                    
                    {/* Hover tooltip / Label */}
                    <span className={`text-[9px] font-black uppercase mt-1.5 tracking-wider transition-colors text-center ${
                      status === 'active' ? 'text-brand-primary' : status === 'completed' ? 'text-emerald-400' : 'text-slate-600'
                    }`}>
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Playground Core */}
          <div className="flex-1 flex flex-col justify-center py-4">
            <AnimatePresence mode="wait">
              {/* Onboarding step */}
              {currentStep === 'onboarding' && (
                <motion.div
                  key="onboarding"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-center"
                >
                  <div className="w-20 h-20 bg-brand-primary/10 rounded-[2rem] flex items-center justify-center text-brand-primary mx-auto animate-float">
                    <Sparkles size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-white italic tracking-tighter">Enter the Sanctuary State</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">Prepare for your virtual pilgrimage. Wear the sacred white Ihram robe and set your pure intentions.</p>
                  </div>

                  <div className="space-y-2 pt-4">
                    <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest">Select character clothes</p>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => selectGender('brother')}
                        className="px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white hover:border-brand-primary hover:bg-brand-primary/5 transition-all w-36 hover:scale-105"
                      >
                        Hajj Brother robe
                      </button>
                      <button
                        onClick={() => selectGender('sister')}
                        className="px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white hover:border-brand-primary hover:bg-brand-primary/5 transition-all w-36 hover:scale-105"
                      >
                        Hajj Sister dress
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Talbiyah Rhythm step */}
              {currentStep === 'talbiyah' && (
                <motion.div
                  key="talbiyah"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em]">Phase 1: Pure Intention</span>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter">Recite The Talbiyah</h3>
                  </div>

                  <div className="bg-brand-depth/40 border border-white/5 p-6 rounded-2xl space-y-3">
                    <p className="arabic-text text-3xl text-brand-primary leading-loose">
                      لَبَّيْكَ اللَّهُمَّ لَبَّيْك ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْك
                    </p>
                    <p className="text-xs text-slate-400 font-light italic">"Here I am at Your service, O Allah, here I am..."</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tap the button to chant in rhythm ({talbiyahBeats.length}/7)</p>
                    <button
                      onClick={handleTalbiyahTap}
                      className="w-24 h-24 rounded-full bg-brand-primary text-brand-depth flex items-center justify-center font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20 mx-auto"
                    >
                      Chant!
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Tawaf Circumambulation step */}
              {currentStep === 'tawaf' && (
                <motion.div
                  key="tawaf"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-1 text-center md:text-left">
                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em]">Phase 2: Tawaf al-Kudum</span>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter">Walk Around the 3D Kaaba</h3>
                    <p className="text-xs text-slate-400 font-medium">Start from the Black Stone (Hajar al-Aswad) corner and complete 7 full rounds counter-clockwise.</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                      <span>Completed Rounds:</span>
                      <span className="text-brand-primary font-black text-sm">{tawafRounds}/7</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
                      <motion.div 
                        className="h-full bg-brand-primary rounded-full"
                        style={{ width: `${tawafProgress}%` }}
                        layoutId="tawaf-bar"
                      />
                    </div>

                    <div className="pt-4 flex flex-col gap-2">
                      <button
                        onMouseDown={() => setIsWalkingTawaf(true)}
                        onMouseUp={() => setIsWalkingTawaf(false)}
                        onTouchStart={() => setIsWalkingTawaf(true)}
                        onTouchEnd={() => setIsWalkingTawaf(false)}
                        className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all text-center select-none ${isWalkingTawaf ? 'bg-emerald-500 text-white animate-pulse' : 'bg-brand-primary text-brand-depth shadow-xl shadow-brand-primary/25 hover:scale-[1.01]'}`}
                      >
                        {isWalkingTawaf ? 'Walking...' : 'Hold to Walk Tawaf'}
                      </button>
                      <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest">Hold the button to walk round the Kaaba</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Sa'i Step */}
              {currentStep === 'sai' && (
                <motion.div
                  key="sai"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-1 text-center md:text-left">
                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em]">Phase 3: Sa'i Hills Journey</span>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter">Walk Between Safa & Marwa</h3>
                    <p className="text-xs text-slate-400 font-medium">Re-trace the historical search of Hajar (AS) for water. Walk 7 laps between the hills of Safa and Marwa.</p>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Active Lap:</span>
                    <span className="text-brand-primary font-black text-sm">{saiLaps + 1}/7 ({currentHill} Peak)</span>
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <button
                      onClick={handleSaiStep}
                      className="w-full py-5 bg-brand-primary text-brand-depth rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.01] active:scale-98 transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3"
                    >
                      <Footprints size={18} />
                      Take Step ({stepToggle ? 'Left Foot' : 'Right Foot'})
                    </button>
                    <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest">Tap to advance across the passage</p>
                  </div>
                </motion.div>
              )}

              {/* Mina Dhikr step */}
              {currentStep === 'mina' && (
                <motion.div
                  key="mina"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em]">Phase 4: Camp of Mina</span>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter">Spiritual Reflection & Tasbih</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">Spend the night in Mina, meditating and remembering Allah under the canvas of tents.</p>
                  </div>

                  <div className="bg-brand-depth/40 border border-white/5 p-6 rounded-2xl space-y-2">
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Perform Meditative Dhikr</span>
                    <h4 className="text-white font-black font-mono text-3xl">{dhikrCount} / {dhikrRequired}</h4>
                    <p className="text-xs text-slate-500 font-medium">Click the beads to fulfill the evening remembrance.</p>
                  </div>

                  <button
                    onClick={handleDhikr}
                    className="w-20 h-20 rounded-full bg-brand-primary text-brand-depth font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/25 mx-auto flex items-center justify-center"
                  >
                    Dhikr
                  </button>
                </motion.div>
              )}

              {/* Day of Arafat Dua */}
              {currentStep === 'arafat' && (
                <motion.div
                  key="arafat"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-1 text-center md:text-left">
                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em]">Phase 5: Day of Arafat</span>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter">The Pinnacle Mount of Mercy</h3>
                    <p className="text-xs text-slate-400 font-medium">Hajj is Arafat. Select and recite at least 3 deep supplications of repentance and hope to advance.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 max-h-[180px] overflow-y-auto pr-1 no-scrollbar pt-2">
                    {DUA_POOL.map((dua, i) => {
                      const selected = selectedDuas.includes(dua);
                      return (
                        <button
                          key={i}
                          onClick={() => toggleDua(dua)}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${selected ? 'bg-brand-primary/10 border-brand-primary text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'}`}
                        >
                          <span className="text-xs font-semibold leading-relaxed">{dua}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected ? 'border-brand-primary bg-brand-primary text-brand-depth' : 'border-white/20'}`}>
                            {selected && <CheckCircle size={10} className="stroke-black" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={selectedDuas.length < 3}
                    onClick={completeArafat}
                    className="w-full py-5 bg-brand-primary text-brand-depth rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.01] active:scale-98 transition-all shadow-xl shadow-brand-primary/25 disabled:opacity-50"
                  >
                    Complete Arafat Wuquf
                  </button>
                </motion.div>
              )}

              {/* Muzdalifah Pebble Hunt */}
              {currentStep === 'muzdalifah' && (
                <motion.div
                  key="muzdalifah"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-1 text-center md:text-left">
                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em]">Phase 6: Starry Muzdalifah</span>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter">Collect 7 Stoning Pebbles</h3>
                    <p className="text-xs text-slate-400 font-medium">Gather small stones from the desert floor under the dark sky. Fulfill exactly 7 pebbles to progress.</p>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Pebbles Picked:</span>
                    <span className="text-brand-primary font-black text-sm">{pebblesCollected}/7</span>
                  </div>

                  {/* Interactive field canvas */}
                  <div className="relative h-44 bg-brand-depth rounded-3xl border border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
                    <div className="absolute top-4 left-4 text-[8px] font-bold text-slate-600 uppercase tracking-widest">Tap Pebbles on ground</div>
                    
                    {pebbles.map((p) => {
                      if (p.collected) return null;
                      return (
                        <motion.button
                          key={p.id}
                          onClick={() => collectPebble(p.id)}
                          style={{ left: `${p.x}%`, top: `${p.y}%` }}
                          className="absolute w-6 h-6 bg-slate-400 rounded-full border-2 border-slate-500 hover:bg-brand-primary hover:border-white transition-colors flex items-center justify-center cursor-pointer shadow-lg active:scale-90"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <div className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Jamarat Stoning */}
              {currentStep === 'jamarat' && (
                <motion.div
                  key="jamarat"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-1 text-center md:text-left">
                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em]">Phase 7: Stoning the Pillars</span>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter">Stone the Jamarah</h3>
                    <p className="text-xs text-slate-400 font-medium">Fling pebbles at the Jamarah pillar to ward off temptations and evil. Achieve 7 verified hits.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl text-center">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Pebbles Left</span>
                      <p className="text-xl font-black text-white font-mono">{pebblesCollected}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl text-center">
                      <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest">Successful Hits</span>
                      <p className="text-xl font-black text-brand-primary font-mono">{jamaratHits}/7</p>
                    </div>
                  </div>

                  {/* Slider Timing Challenge */}
                  <div className="space-y-4 pt-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block text-center">Timing Challenge Slider (Aim for Green zone!)</span>
                    <div className="relative h-8 bg-brand-depth rounded-xl border border-white/5 overflow-hidden flex items-center">
                      {/* Aim hit zone */}
                      <div 
                        style={{ left: `${targetX - 15}%`, width: '30%' }}
                        className="absolute h-full bg-emerald-500/20 border-l border-r border-emerald-500/40"
                      />
                      {/* Moving cursor */}
                      <motion.div 
                        className="w-1.5 h-full bg-brand-primary absolute"
                        animate={{ left: ['0%', '98%', '0%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                      />
                    </div>

                    <button
                      onClick={throwPebble}
                      disabled={isThrowing || pebblesCollected <= 0}
                      className="w-full py-5 bg-brand-primary text-brand-depth rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.01] active:scale-98 transition-all shadow-xl shadow-brand-primary/25 disabled:opacity-50"
                    >
                      {isThrowing ? 'Stoning...' : 'Throw Pebble!'}
                    </button>

                    <AnimatePresence>
                      {throwOutcome && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className={`text-center font-black uppercase text-sm py-2 rounded-xl border ${throwOutcome === 'hit' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                        >
                          {throwOutcome === 'hit' ? '✓ HIT!' : '✗ MISS - Tap with better timing'}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Game Completion */}
              {currentStep === 'completion' && (
                <motion.div
                  key="completion"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-center"
                >
                  <div className="w-24 h-24 bg-brand-primary/15 rounded-full flex items-center justify-center text-brand-primary mx-auto shadow-inner animate-float">
                    <Trophy size={48} />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">Ritual Complete!</span>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter">MashaAllah, Haji!</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">You have beautifully navigated the architectural pathways and spiritual stages of the Pilgrimage quest.</p>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4 max-w-sm mx-auto">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 border-b border-white/5 pb-2">
                      <span>Total Hasanat Earned:</span>
                      <span className="text-brand-primary font-black text-sm">+{earnedHasanat}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                      <span>Completed Stages:</span>
                      <span className="text-white font-black text-sm">8 / 8</span>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full py-5 bg-brand-primary text-brand-depth font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-[1.01] active:scale-98 transition-all shadow-xl shadow-brand-primary/25"
                  >
                    Return to Sanctuary
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Immersive 3D Visual Sandbox */}
        <div className="w-full md:w-[380px] bg-brand-depth/40 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px]" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Immersive 3D Space</span>
              <div className="h-[2px] w-12 bg-brand-primary rounded-full" />
            </div>
            
            {/* Gyroscope Trigger Button */}
            <button
              onClick={requestGyroPermission}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-wider transition-all ${
                gyroActive 
                  ? 'bg-brand-primary/20 border-brand-primary text-brand-primary animate-pulse' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
              title="Activate smartphone gyroscope to rotate scene"
            >
              <Compass size={12} className={gyroActive ? 'animate-spin' : ''} />
              {gyroActive ? 'Gyro On' : 'Tilt Phone'}
            </button>
          </div>

          {/* Interactive Drag-To-Orbit 3D Sandbox Viewport */}
          <div 
            className="flex-1 min-h-[300px] flex items-center justify-center my-4 relative overflow-hidden select-none cursor-grab active:cursor-grabbing rounded-2xl bg-slate-950/40 border border-white/5 shadow-inner"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {/* Ambient Background Grid and Celestial Atmosphere */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="absolute w-52 h-52 bg-brand-primary/5 rounded-full blur-[60px]" />
              {currentStep === 'muzdalifah' && (
                <div className="absolute inset-0 bg-indigo-950/25 transition-all duration-700" />
              )}
              <span className="absolute bottom-3 text-[8px] font-black uppercase tracking-[0.2em] text-slate-600/60 flex items-center gap-1">
                <Navigation size={8} /> Drag to orbit / Pinch to zoom
              </span>
            </div>

            {/* CSS 3D Space Scene */}
            <div 
              className="w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
              style={{
                perspective: '800px',
                transformStyle: 'preserve-3d',
              }}
            >
              <div 
                className="relative w-40 h-40 flex items-center justify-center transition-all duration-200"
                style={{
                  transform: `rotateX(${cameraPitch}deg) rotateY(${cameraYaw}deg)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* 3D Sanctuary Marble Floor Base */}
                <div 
                  className="absolute w-64 h-64 bg-slate-900/60 rounded-full border border-white/10 shadow-2xl"
                  style={{
                    transform: 'rotateX(90deg) translateZ(-40px)',
                    backgroundImage: 'radial-gradient(circle, transparent 20%, rgba(255, 255, 255, 0.05) 21%, transparent 22%), radial-gradient(circle, transparent 40%, rgba(255, 255, 255, 0.05) 41%, transparent 42%), radial-gradient(circle, transparent 60%, rgba(255, 255, 255, 0.05) 61%, transparent 62%)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Golden circle track for Tawaf */}
                  {currentStep === 'tawaf' && (
                    <div className="absolute inset-10 border border-dashed border-brand-primary/25 rounded-full animate-spin" style={{ animationDuration: '40s' }} />
                  )}
                </div>

                {/* 1. ONBOARDING & TALBIYAH CHARACTER DISPLAY */}
                {(currentStep === 'onboarding' || currentStep === 'talbiyah') && (
                  <div 
                    className="absolute transform-style-preserve-3d flex flex-col items-center"
                    style={{ transform: 'translate3d(0, -10px, 0)' }}
                  >
                    {/* Glowing Platform */}
                    <div className="absolute w-20 h-20 bg-brand-primary/10 rounded-full border border-brand-primary/30 blur-xs" style={{ transform: 'rotateX(90deg) translateZ(40px)' }} />
                    
                    {/* Character Avatar */}
                    {render3DCharacter(true, currentStep === 'talbiyah')}
                  </div>
                )}

                {/* 2. TAWAF: 3D KAABA & ORBITING PILGRIM */}
                {currentStep === 'tawaf' && (
                  <div className="absolute transform-style-preserve-3d w-full h-full">
                    {/* 3D KAABA CUBE (Center) */}
                    <div 
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform-style-preserve-3d"
                      style={{ transform: 'translate3d(0, -20px, 0)' }}
                    >
                      <div className="w-16 h-18 relative transform-style-preserve-3d">
                        {/* Front Face (with Black Stone Corner and Door) */}
                        <div className="absolute w-16 h-18 bg-neutral-950 border border-slate-900 shadow-xl flex flex-col justify-between p-1 transform translateZ(32px)">
                          <div className="h-1.5 bg-yellow-500 border-b border-yellow-300" />
                          <div className="flex justify-between items-end">
                            {/* Golden Door (Bab Al-Kaaba) */}
                            <div className="w-4 h-8 bg-yellow-600/90 border border-yellow-300 rounded-xs flex flex-col justify-around p-0.5 ml-2">
                              <div className="w-full h-[1px] bg-yellow-400" />
                              <div className="w-full h-[1px] bg-yellow-400" />
                            </div>
                            {/* Black Stone (Hajar Al-Aswad) */}
                            <div className="w-2.5 h-2.5 bg-neutral-950 border-2 border-white/60 rounded-full flex items-center justify-center mr-1 mb-1">
                              <div className="w-1 h-1 bg-amber-600 rounded-full" />
                            </div>
                          </div>
                        </div>
                        {/* Back Face */}
                        <div className="absolute w-16 h-18 bg-neutral-950 border border-slate-900 transform rotateY(180deg) translateZ(32px) p-1">
                          <div className="h-1.5 bg-yellow-500" />
                        </div>
                        {/* Left Face */}
                        <div className="absolute w-16 h-18 bg-neutral-950 border border-slate-900 transform rotateY(-90deg) translateZ(32px) p-1">
                          <div className="h-1.5 bg-yellow-500" />
                        </div>
                        {/* Right Face */}
                        <div className="absolute w-16 h-18 bg-neutral-950 border border-slate-900 transform rotateY(90deg) translateZ(32px) p-1">
                          <div className="h-1.5 bg-yellow-500" />
                        </div>
                        {/* Top Face */}
                        <div className="absolute w-16 h-16 bg-neutral-900 transform rotateX(90deg) translateZ(9px)" />
                      </div>
                    </div>

                    {/* Orbiting Pilgrim Character */}
                    <div 
                      className="absolute transform-style-preserve-3d transition-transform duration-100"
                      style={{
                        transform: `translate3d(${Math.sin((kaabaRotation * Math.PI) / 180) * 44}px, -14px, ${Math.cos((kaabaRotation * Math.PI) / 180) * 44}px) rotateY(${kaabaRotation + 90}deg)`
                      }}
                    >
                      {render3DCharacter(isWalkingTawaf, isWalkingTawaf)}
                    </div>

                    {/* Floating Crowds (Simulating other pilgrims orbiting) */}
                    {[0, 72, 144, 216, 288].map((angle, idx) => {
                      const orbitRadius = 52 + (idx % 2 === 0 ? 6 : -4);
                      const currentAngle = (kaabaRotation + angle) % 360;
                      return (
                        <div 
                          key={idx}
                          className="absolute w-2 h-4 bg-white/40 border border-white/10 rounded-full"
                          style={{
                            transform: `translate3d(${Math.sin((currentAngle * Math.PI) / 180) * orbitRadius}px, -2px, ${Math.cos((currentAngle * Math.PI) / 180) * orbitRadius}px)`
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* 3. SA'I: HILLS & PROGRESS PATH */}
                {currentStep === 'sai' && (
                  <div className="absolute transform-style-preserve-3d w-full h-full">
                    {/* Safa Hill structure (Left) */}
                    <div 
                      className="absolute transform-style-preserve-3d flex flex-col items-center"
                      style={{ transform: 'translate3d(-65px, -15px, 0)' }}
                    >
                      {/* Rock Steps */}
                      <div className="w-12 h-8 bg-stone-700 rounded-t-xl border border-stone-600 flex items-center justify-center shadow-lg">
                        <span className="text-[7px] font-black text-white bg-slate-800/80 px-1 py-0.5 rounded uppercase">Safa</span>
                      </div>
                      <div className="w-16 h-4 bg-stone-800 rounded-b-md border-t border-stone-700" />
                    </div>

                    {/* Marwa Hill structure (Right) */}
                    <div 
                      className="absolute transform-style-preserve-3d flex flex-col items-center"
                      style={{ transform: 'translate3d(65px, -15px, 0)' }}
                    >
                      {/* Rock Steps */}
                      <div className="w-12 h-8 bg-stone-700 rounded-t-xl border border-stone-600 flex items-center justify-center shadow-lg">
                        <span className="text-[7px] font-black text-white bg-slate-800/80 px-1 py-0.5 rounded uppercase">Marwa</span>
                      </div>
                      <div className="w-16 h-4 bg-stone-800 rounded-b-md border-t border-stone-700" />
                    </div>

                    {/* Green Neon Light zone corridor */}
                    <div 
                      className="absolute w-24 h-4 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center"
                      style={{ transform: 'translate3d(0, -1px, 0) rotateX(90deg)' }}
                    >
                      <div className="w-full h-0.5 bg-emerald-400 animate-pulse" />
                    </div>

                    {/* Moving Pilgrim Character */}
                    <div 
                      className="absolute transform-style-preserve-3d transition-all duration-300"
                      style={{
                        transform: `translate3d(${(saiPosition / 100) * 50}px, -14px, 0px) rotateY(${currentHill === 'Safa' ? 90 : -90}deg)`
                      }}
                    >
                      {render3DCharacter(true, true)}
                    </div>
                  </div>
                )}

                {/* 4. MINA: 3D TENTS OF THE VALLEY */}
                {currentStep === 'mina' && (
                  <div className="absolute transform-style-preserve-3d w-full h-full">
                    {/* Circle of white tents */}
                    {[
                      { x: -45, z: -35 },
                      { x: 45, z: -35 },
                      { x: -50, z: 25 },
                      { x: 50, z: 25 }
                    ].map((pos, idx) => (
                      <div 
                        key={idx}
                        className="absolute transform-style-preserve-3d flex flex-col items-center"
                        style={{ transform: `translate3d(${pos.x}px, -15px, ${pos.z}px)` }}
                      >
                        {/* Tent cone */}
                        <div className="w-10 h-8 bg-white border border-slate-200 clip-tent shadow-md" />
                        {/* Tent entrance */}
                        <div className="w-3 h-4 bg-stone-900 rounded-t-xs -mt-4 z-10" />
                      </div>
                    ))}

                    {/* Pilgrim Character sitting in prayer */}
                    <div 
                      className="absolute transform-style-preserve-3d"
                      style={{ transform: 'translate3d(0, -12px, 0)' }}
                    >
                      {render3DCharacter(false, true)}
                      <div className="absolute w-12 h-12 bg-emerald-500/20 rounded-full blur-md -top-4 -left-4 animate-pulse" />
                    </div>
                  </div>
                )}

                {/* 5. DAY OF ARAFAT: MERCY MOUNT MOUNTAIN */}
                {currentStep === 'arafat' && (
                  <div className="absolute transform-style-preserve-3d w-full h-full">
                    {/* Layered Mountain Hill */}
                    <div 
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform-style-preserve-3d"
                      style={{ transform: 'translate3d(0, -10px, -10px)' }}
                    >
                      {/* Mountain base layer */}
                      <div className="w-24 h-12 bg-amber-800/80 border border-amber-700/60 rounded-xl transform-style-preserve-3d">
                        {/* Middle layer */}
                        <div className="w-18 h-10 bg-amber-700/90 border border-amber-600/50 rounded-lg mx-auto -mt-6 transform-style-preserve-3d">
                          {/* Top Peak */}
                          <div className="w-12 h-8 bg-amber-600/90 border border-amber-500 rounded-md mx-auto -mt-5 transform-style-preserve-3d flex items-center justify-center">
                            {/* Mount Pillar */}
                            <div className="w-2.5 h-10 bg-white border border-slate-200 -mt-8" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Standing Pilgrim Character making Dua */}
                    <div 
                      className="absolute transform-style-preserve-3d"
                      style={{ transform: 'translate3d(0, -32px, 10px)' }}
                    >
                      {render3DCharacter(false, true)}
                      <div className="absolute w-8 h-8 bg-yellow-500/10 rounded-full blur-sm -top-6 -left-2 animate-bounce" />
                    </div>
                  </div>
                )}

                {/* 6. MUZDALIFAH: CODES UNDER DESERT STARS */}
                {currentStep === 'muzdalifah' && (
                  <div className="absolute transform-style-preserve-3d w-full h-full">
                    {/* Tiny pebbles to pick up in 3D */}
                    {pebbles.map((p, idx) => {
                      if (p.collected) return null;
                      // map to 3D coords
                      const cx = (p.x - 50) * 1.2;
                      const cz = (p.y - 50) * 1.2;
                      return (
                        <div
                          key={p.id}
                          className="absolute w-2.5 h-2 bg-slate-400 border border-slate-300 rounded-full shadow-md animate-bounce cursor-pointer hover:bg-brand-primary"
                          style={{
                            transform: `translate3d(${cx}px, -1px, ${cz}px)`,
                            animationDelay: `${idx * 150}ms`
                          }}
                          onClick={() => collectPebble(p.id)}
                        />
                      );
                    })}

                    {/* Pilgrim Character searching */}
                    <div 
                      className="absolute transform-style-preserve-3d"
                      style={{ transform: 'translate3d(0, -10px, 0)' }}
                    >
                      {render3DCharacter(true, false)}
                    </div>
                  </div>
                )}

                {/* 7. JAMARAT: STONING PILLARS CHALLENGE */}
                {currentStep === 'jamarat' && (
                  <div className="absolute transform-style-preserve-3d w-full h-full">
                    {/* The Large Stoning Pillar Obelisk */}
                    <div 
                      className="absolute transform-style-preserve-3d flex flex-col items-center"
                      style={{ transform: 'translate3d(0, -25px, -45px)' }}
                    >
                      <div className="w-10 h-28 bg-stone-700 border border-stone-600 rounded-md shadow-2xl transform-style-preserve-3d flex flex-col items-center justify-between p-1.5">
                        <div className="w-full h-4 bg-stone-800 rounded flex items-center justify-center text-[8px] font-black text-white border border-stone-600">JAMARAH</div>
                        <div className="w-4 h-16 bg-neutral-900 border border-white/5 rounded-full" />
                      </div>
                    </div>

                    {/* Standing Pilgrim Character throwing */}
                    <div 
                      className="absolute transform-style-preserve-3d"
                      style={{ transform: 'translate3d(0, -14px, 25px) rotateY(180deg)' }}
                    >
                      {render3DCharacter(false, isThrowing)}
                    </div>

                    {/* Flying Pebble Projectile */}
                    {isThrowing && (
                      <motion.div 
                        className="absolute w-1.5 h-1.5 bg-stone-300 border border-white rounded-full shadow-md"
                        initial={{ x: 0, y: -20, z: 20 }}
                        animate={{ x: 0, y: -25, z: -40 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    )}
                  </div>
                )}

                {/* 8. COMPLETION: VICTORY trophy & GLOW */}
                {currentStep === 'completion' && (
                  <div className="absolute transform-style-preserve-3d w-full h-full flex items-center justify-center">
                    {/* Rotating Trophy */}
                    <motion.div 
                      className="absolute text-brand-primary"
                      style={{ transform: 'translate3d(0, -35px, 0)' }}
                      animate={{ rotateY: 360, y: [-35, -40, -35] }}
                      transition={{ rotateY: { repeat: Infinity, duration: 4, ease: 'linear' }, y: { repeat: Infinity, duration: 2, ease: 'easeInOut' } }}
                    >
                      <Trophy size={28} />
                    </motion.div>

                    {/* Happy Pilgrim avatar */}
                    <div 
                      className="absolute transform-style-preserve-3d"
                      style={{ transform: 'translate3d(0, -14px, 0)' }}
                    >
                      {render3DCharacter(true, true)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Spiritual Focus Stat Meter */}
          <div className="relative z-10 pt-4 border-t border-white/5 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
              <span className="uppercase tracking-widest">Spiritual Focus</span>
              <span>{spiritualFocus}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
              <div 
                className="h-full bg-brand-primary rounded-full transition-all duration-300" 
                style={{ width: `${spiritualFocus}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
