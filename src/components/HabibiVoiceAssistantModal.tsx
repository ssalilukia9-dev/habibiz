import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  X, 
  Sparkles, 
  Compass, 
  Hash, 
  BookOpen, 
  MessageCircle, 
  Check, 
  Volume2,
  LogOut,
  ChevronRight,
  Plus,
  Trash2,
  Flame
} from 'lucide-react';
import { VoiceCommandService, ParsedVoiceCommand } from '../services/voiceCommandService.ts';
import { VoiceTasbihService, RecognizedSupplication } from '../services/voiceTasbihService.ts';
import InteractiveTasbihBeads from './InteractiveTasbihBeads.tsx';
import AddCustomSupplicationModal from './AddCustomSupplicationModal.tsx';

interface HabibiVoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (command: ParsedVoiceCommand) => void;
  addHasanat?: (amount: number) => void;
  initialMode?: 'commands' | 'tasbih';
}

const QUICK_COMMANDS = [
  {
    phrase: 'Habibi, show Qibla',
    icon: Compass,
    desc: 'Instant Kaaba direction compass',
    badge: 'Navigation'
  },
  {
    phrase: 'Habibi, open Tasbih',
    icon: Hash,
    desc: 'Launch electronic dhikr counter',
    badge: 'Spiritual'
  },
  {
    phrase: 'Habibi, show supplications',
    icon: Sparkles,
    desc: 'Morning, evening & sacred duas',
    badge: 'Duas'
  },
  {
    phrase: 'Habibi, open Quran',
    icon: BookOpen,
    desc: 'Read Noble Quran & audio recitations',
    badge: 'Recitation'
  },
  {
    phrase: 'Habibi, exit Ramadan mode',
    icon: LogOut,
    desc: 'Return to standard Sanctuary dashboard',
    badge: 'Control'
  },
  {
    phrase: 'Habibi, talk to companion',
    icon: MessageCircle,
    desc: 'Spiritual AI companion dialogue',
    badge: 'AI Assistant'
  }
];

export default function HabibiVoiceAssistantModal({
  isOpen,
  onClose,
  onExecuteCommand,
  addHasanat,
  initialMode = 'commands'
}: HabibiVoiceAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<'commands' | 'tasbih'>(initialMode);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [matchedCommand, setMatchedCommand] = useState<ParsedVoiceCommand | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tasbih Mode Specific State
  const [supplications, setSupplications] = useState<Omit<RecognizedSupplication, 'count'>[]>(() => {
    return VoiceTasbihService.getAllSupplications();
  });
  const [selectedSupplication, setSelectedSupplication] = useState<Omit<RecognizedSupplication, 'count'> | null>(() => {
    return VoiceTasbihService.getAllSupplications()[0] || null;
  });
  const [tasbihCount, setTasbihCount] = useState<number>(() => {
    const saved = localStorage.getItem('tasbih-count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [tasbihTarget, setTasbihTarget] = useState<number>(33);
  const [interimVoiceText, setInterimVoiceText] = useState<string>('');
  const [lastDhikrBadge, setLastDhikrBadge] = useState<string | null>(null);
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [hasanatEarnedSession, setHasanatEarnedSession] = useState(0);

  const addHasanatRef = useRef(addHasanat);
  useEffect(() => {
    addHasanatRef.current = addHasanat;
  }, [addHasanat]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('tasbih-count', tasbihCount.toString());
  }, [tasbihCount]);

  // Handle active mode switching and Speech Recognition Subscriptions
  useEffect(() => {
    if (!isOpen) {
      VoiceCommandService.stopListening();
      VoiceTasbihService.stop();
      setIsListening(false);
      setTranscript('');
      setInterimVoiceText('');
      setMatchedCommand(null);
      setErrorMessage(null);
      return;
    }

    // Refresh supplications list
    setSupplications(VoiceTasbihService.getAllSupplications());

    if (activeTab === 'commands') {
      VoiceTasbihService.stop();
      
      const unsub = VoiceCommandService.subscribe({
        onStatusChange: (listening) => {
          setIsListening(listening);
        },
        onTranscript: (text) => {
          setTranscript(text);
          setErrorMessage(null);
        },
        onCommandMatched: (command) => {
          if (command.type === 'NAVIGATE_TASBIH' || command.type === 'VOICE_TASBIH') {
            // Smoothly switch directly to the dedicated Tasbih overlay within the modal!
            setActiveTab('tasbih');
            setMatchedCommand(null);
          } else {
            setMatchedCommand(command);
            setTimeout(() => {
              onExecuteCommand(command);
              onClose();
            }, 800);
          }
        },
        onError: (err) => {
          setErrorMessage(err);
        }
      });

      VoiceCommandService.startListening();

      return () => {
        unsub();
        VoiceCommandService.stopListening();
      };
    } else {
      // Live Constant Voice Tasbih Mode
      VoiceCommandService.stopListening();

      const unsub = VoiceTasbihService.subscribe({
        onStatusChange: (listening) => {
          setIsListening(listening);
        },
        onInterimTranscript: (interim) => {
          setInterimVoiceText(interim);
        },
        onSupplicationRecognized: (supp, countToAdd, raw) => {
          setTasbihCount(prev => prev + countToAdd);
          setHasanatEarnedSession(prev => prev + (5 * countToAdd));
          if (addHasanatRef.current) {
            addHasanatRef.current(5 * countToAdd);
          }
          setLastDhikrBadge(supp.name);
          setInterimVoiceText('');
          setTimeout(() => setLastDhikrBadge(null), 2000);
        },
        onError: (err) => {
          setErrorMessage(err);
        }
      });

      // Constant listening in Tasbih mode until manually paused or modal closed
      VoiceTasbihService.start();

      return () => {
        unsub();
        VoiceTasbihService.stop();
      };
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleManualCommand = (phrase: string) => {
    setTranscript(phrase);
    const command = VoiceCommandService.parseCommand(phrase);
    if (command) {
      if (command.type === 'NAVIGATE_TASBIH' || command.type === 'VOICE_TASBIH') {
        setActiveTab('tasbih');
      } else {
        setMatchedCommand(command);
        setTimeout(() => {
          onExecuteCommand(command);
          onClose();
        }, 500);
      }
    }
  };

  const handleIncrementTasbih = () => {
    setTasbihCount(prev => prev + 1);
    setHasanatEarnedSession(prev => prev + 5);
    if (addHasanat) {
      addHasanat(5);
    }
  };

  const handleResetTasbih = () => {
    setTasbihCount(0);
  };

  const handleCustomSupplicationAdded = (newSupp: Omit<RecognizedSupplication, 'count'>) => {
    setSupplications(VoiceTasbihService.getAllSupplications());
    setSelectedSupplication(newSupp);
  };

  const handleDeleteCustomSupplication = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    VoiceTasbihService.deleteCustomSupplication(id);
    const updated = VoiceTasbihService.getAllSupplications();
    setSupplications(updated);
    if (selectedSupplication?.id === id) {
      setSelectedSupplication(updated[0] || null);
    }
  };

  const toggleListeningCurrentMode = () => {
    if (activeTab === 'commands') {
      VoiceCommandService.toggleListening();
    } else {
      VoiceTasbihService.toggle();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className={`w-full ${
            activeTab === 'tasbih' ? 'max-w-2xl' : 'max-w-xl'
          } bg-slate-900 border border-brand-primary/35 rounded-[2.5rem] p-5 md:p-7 shadow-2xl relative overflow-hidden text-white flex flex-col max-h-[92vh] transition-all`}
        >
          {/* Background Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar: Mode Switcher & Close */}
          <div className="flex items-center justify-between gap-2 mb-4 relative z-20">
            {/* Tab switcher: Commands vs Dedicated Live Tasbih Overlay */}
            <div className="flex items-center p-1 bg-black/40 border border-white/10 rounded-full">
              <button
                onClick={() => setActiveTab('commands')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'commands'
                    ? 'bg-brand-primary text-brand-depth shadow-md shadow-brand-primary/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic size={13} />
                <span>Voice Commands</span>
              </button>

              <button
                onClick={() => setActiveTab('tasbih')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'tasbih'
                    ? 'bg-gradient-to-r from-amber-400 to-brand-primary text-brand-depth shadow-md shadow-brand-primary/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Hash size={13} />
                <span>Voice Dhikr & Beads</span>
                {activeTab !== 'tasbih' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Close Voice Assistant"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mode 1: Standard Voice Commands Mode */}
          {activeTab === 'commands' && (
            <div className="flex flex-col items-center text-center space-y-5 relative z-10 overflow-y-auto no-scrollbar">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">
                  Habibi Voice Assistant
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Speak to Your Sanctuary
              </h3>

              {/* Microphone Listening Button Hub */}
              <div className="relative my-1">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center relative">
                  {isListening && (
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full border-2 border-brand-primary/40 pointer-events-none"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: 0.3 }}
                        className="absolute inset-0 rounded-full border border-emerald-400/30 pointer-events-none"
                      />
                    </>
                  )}

                  <button
                    onClick={toggleListeningCurrentMode}
                    className={`w-18 h-18 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                      isListening 
                        ? 'bg-gradient-to-tr from-brand-primary to-amber-400 text-brand-depth shadow-brand-primary/30 scale-105' 
                        : 'bg-white/10 text-slate-400 hover:text-white hover:bg-white/20'
                    }`}
                    title={isListening ? "Tap to pause listening" : "Tap to speak"}
                  >
                    {isListening ? (
                      <Mic size={32} className="animate-pulse" />
                    ) : (
                      <MicOff size={28} />
                    )}
                  </button>
                </div>
              </div>

              {/* Live Transcription Box */}
              <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 min-h-[65px] flex items-center justify-center text-center">
                {matchedCommand ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold animate-fadeIn">
                    <Check size={18} className="text-emerald-400" />
                    <span>Executing: {matchedCommand.label}</span>
                  </div>
                ) : transcript ? (
                  <p className="text-base md:text-lg font-medium text-amber-200 italic">
                    "{transcript}"
                  </p>
                ) : isListening ? (
                  <p className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Volume2 size={16} className="text-brand-primary animate-pulse" />
                    Listening constantly... Say <span className="text-white font-bold">"Habibi, show Qibla"</span> or <span className="text-white font-bold">"Habibi, open Tasbih"</span>
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Microphone paused. Tap the mic above to resume.
                  </p>
                )}
              </div>

              {errorMessage && (
                <p className="text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                  {errorMessage}
                </p>
              )}

              {/* Quick Command Suggestions */}
              <div className="w-full text-left space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  Suggested Voice Commands:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1 no-scrollbar">
                  {QUICK_COMMANDS.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleManualCommand(cmd.phrase)}
                      className="p-2.5 bg-white/5 hover:bg-brand-primary/10 border border-white/5 hover:border-brand-primary/30 rounded-xl flex items-center justify-between text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                          <cmd.icon size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                            "{cmd.phrase}"
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {cmd.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={13} className="text-slate-600 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Dedicated Live Voice Dhikr & Interactive Beads Overlay */}
          {activeTab === 'tasbih' && (
            <div className="flex flex-col items-center flex-1 overflow-y-auto no-scrollbar space-y-3 relative z-10">
              {/* Header Status & Hasanat Counter */}
              <div className="w-full flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span className="text-[11px] font-bold text-slate-300">
                    {isListening ? 'Constant Voice Counting Active' : 'Voice Paused'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-bold text-amber-300">
                  <Flame size={13} className="text-amber-400" />
                  <span>+{hasanatEarnedSession} Hasanat</span>
                </div>
              </div>

              {/* Supplication Quick Selector Chips */}
              <div className="w-full overflow-x-auto no-scrollbar flex items-center gap-1.5 py-1">
                {supplications.map((supp) => {
                  const isSelected = selectedSupplication?.id === supp.id;
                  return (
                    <div key={supp.id} className="relative group shrink-0">
                      <button
                        onClick={() => setSelectedSupplication(supp)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-brand-primary text-brand-depth shadow-md shadow-brand-primary/20'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                        }`}
                      >
                        <span>{supp.name}</span>
                        {supp.isCustom && (
                          <span className="text-[9px] px-1 rounded bg-black/30 text-amber-200">Custom</span>
                        )}
                      </button>

                      {supp.isCustom && (
                        <button
                          onClick={(e) => handleDeleteCustomSupplication(e, supp.id)}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                          title="Delete custom supplication"
                        >
                          <Trash2 size={9} />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Add Custom Supplication Button */}
                <button
                  onClick={() => setIsAddCustomOpen(true)}
                  className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/5 hover:bg-brand-primary/20 text-slate-400 hover:text-brand-primary border border-dashed border-white/20 hover:border-brand-primary/50 transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Custom Supplication</span>
                </button>
              </div>

              {/* Interactive Moving Beads Rosary Component */}
              <div className="my-1">
                <InteractiveTasbihBeads
                  count={tasbihCount}
                  target={tasbihTarget}
                  supplication={selectedSupplication}
                  onIncrement={handleIncrementTasbih}
                  onReset={handleResetTasbih}
                  isVoiceActive={isListening}
                  interimVoiceText={interimVoiceText}
                  compact={true}
                />
              </div>

              {/* Recognition Toast Badge */}
              <AnimatePresence>
                {lastDhikrBadge && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -5 }}
                    className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                  >
                    <Check size={13} />
                    <span>Counted: {lastDhikrBadge} (+1)</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Target Selector & Voice Toggle Controls */}
              <div className="w-full pt-1 flex items-center justify-between gap-2 border-t border-white/10">
                {/* Target Chips */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
                    Target:
                  </span>
                  {[33, 99, 100, 1000].map(num => (
                    <button
                      key={num}
                      onClick={() => setTasbihTarget(num)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        tasbihTarget === num
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'text-slate-400 hover:text-white bg-white/5'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Microphone Constant Listening Toggle */}
                <button
                  onClick={toggleListeningCurrentMode}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isListening
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {isListening ? (
                    <>
                      <Mic size={13} className="text-emerald-400 animate-pulse" />
                      <span>Listening... (Tap to Pause)</span>
                    </>
                  ) : (
                    <>
                      <MicOff size={13} />
                      <span>Resume Voice Counting</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Add Custom Supplication Dialog */}
        <AddCustomSupplicationModal
          isOpen={isAddCustomOpen}
          onClose={() => setIsAddCustomOpen(false)}
          onAdded={handleCustomSupplicationAdded}
        />
      </div>
    </AnimatePresence>
  );
}
