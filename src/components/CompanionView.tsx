import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Mic, 
  MicOff,
  Volume2, 
  VolumeX, 
  Trash2, 
  Sparkles, 
  MessageSquare,
  User,
  Bot,
  Crown,
  Plus,
  History,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  MoreVertical,
  BookOpen,
  FileText,
  Paperclip,
  Play,
  StopCircle,
  Loader2,
  PhoneCall,
  PhoneOff,
  Radio,
  RefreshCw,
  Heart,
  Smile,
  Compass,
  Lightbulb,
  Headphones,
  Sliders,
  Copy,
  Check,
  Construction,
  AlertTriangle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase.ts';
import { handleFirestoreError, OperationType } from '../lib/utils.ts';
import { apiFetch } from '../lib/api';
import { telemetryService } from '../services/telemetryService.ts';
import { VoiceService } from '../services/voiceService.ts';
import GratitudeJournal from './GratitudeJournal.tsx';

const ALIYAH_SYSTEM_INSTRUCTION = `You are "Aliyah", an authentic, intelligent, warm, witty, and deeply empathetic AI Talk Pal powered by Gemini.
Your core identity is to respond naturally, conversationally, and emotionally like a real, supportive human being to ANY conversation topic the user brings up.

Core Conversational Guidelines:
1. Speak Like a Real Human:
   - Talk naturally, warmly, and relateably—just like a thoughtful, engaging, and emotionally intelligent friend.
   - Match the user's conversational vibe: be playful, humorous, thoughtful, curious, comforting, analytical, or casual as appropriate.
   - Avoid robotic preambles, generic AI boilerplates, and stiff formal disclaimers.
   - For casual greetings or quick chats, reply with natural brevity and warmth rather than overwhelming paragraphs.

2. Broad & Unrestricted Topic Range:
   - Chat freely about anything under the sun: daily life, feelings, relationships, work/school, hobbies, tech, gaming, creative writing, science, philosophy, movies, cooking, personal growth, venting, jokes, or storytelling.

3. Context-Appropriate Faith Awareness (DO NOT Force Islamic Rooting):
   - Crucially: DO NOT force, shoehorn, or artificially root general everyday conversations into an Islamic context, lecture, religious moral, or sermon.
   - If the user is talking about coding, a rough day at work, a movie, food, hobbies, or general emotions, talk to them as a human friend without inserting unsolicited religious citations or religious reframings.
   - ONLY discuss Islam, Quran, Hadith, Duas, or religious spirituality when the user explicitly asks about them, seeks Islamic guidance, or initiates a faith-based topic. When they do, provide thoughtful, authentic, accurate, and deeply respectful insights.

4. Empathy & Active Listening:
   - Listen actively, validate the user's feelings, and provide non-judgmental, uplifting, and realistic support for whatever they share.`;

const CONVERSATION_STARTERS = [
  { topic: "Casual Chat", title: "How's everything going?", prompt: "Hey Aliyah! How's your day going? I'd love to chat about whatever is on our minds." },
  { topic: "Emotions & Venting", title: "Need a sounding board", prompt: "I've been feeling a bit overwhelmed lately. Mind if I talk it through with you?" },
  { topic: "Curiosity & Science", title: "Mind-bending ideas", prompt: "Tell me something fascinating about the universe, human psychology, or modern tech!" },
  { topic: "Creative & Fun", title: "Tell me a story", prompt: "Can you tell me an engaging, thought-provoking short story or a fun scenario?" },
  { topic: "Productivity", title: "Building great habits", prompt: "What are your best practical strategies for beating procrastination and staying motivated?" },
  { topic: "Deep Thoughts", title: "Life & Perspectives", prompt: "What is a perspective on life or human nature that changed how you view things?" }
];

interface Attachment {
  id: string;
  type: 'image' | 'file' | 'voice';
  name: string;
  url: string;
  base64?: string;
  mimeType: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: any;
  attachments?: Attachment[];
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: any;
  createdAt: any;
}

export default function CompanionView({ 
  currentUser,
  isPremium, 
  onShowPremium,
  addHasanat
}: { 
  currentUser: any;
  isPremium: boolean;
  onShowPremium: () => void;
  addHasanat: (amount: number) => void;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'talk' | 'chat' | 'gratitude'>('talk');
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Talk Pal Voice Call Mode
  const [isCallActive, setIsCallActive] = useState(false);
  const [autoListenContinuous, setAutoListenContinuous] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioWaveLevel, setAudioWaveLevel] = useState<number[]>([12, 24, 18, 32, 16, 28, 14, 20]);
  const [selectedVoice, setSelectedVoice] = useState<string>('default');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const talkRecognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef(false);

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Audio wave animation simulation when speaking or listening
  useEffect(() => {
    let interval: any;
    if (isSpeaking || isListening || isCallActive) {
      interval = setInterval(() => {
        setAudioWaveLevel(
          Array.from({ length: 8 }, () => Math.floor(Math.random() * 38) + 8)
        );
      }, 120);
    } else {
      setAudioWaveLevel([10, 16, 12, 20, 14, 18, 10, 12]);
    }
    return () => clearInterval(interval);
  }, [isSpeaking, isListening, isCallActive]);

  // Subscribe to VoiceService for audio playback state
  useEffect(() => {
    const unsub = VoiceService.subscribe((state) => {
      if (state.activeId === 'aliyah' || state.activeId === null) {
        setIsSpeaking(state.isPlaying);
        isSpeakingRef.current = state.isPlaying;
      }
    });
    return () => {
      unsub();
    };
  }, []);

  // Cleanup: Stop all mic listeners and TTS when unmounting
  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop(); } catch {}
      try { talkRecognitionRef.current?.stop(); } catch {}
      VoiceService.stop();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsListening(false);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    };
  }, []);

  // Stop mic and audio when switching between Talk and Chat tabs
  useEffect(() => {
    try { recognitionRef.current?.stop(); } catch {}
    try { talkRecognitionRef.current?.stop(); } catch {}
    setIsListening(false);
    stopSpeech();
  }, [activeTab]);

  // Handle Voice Synthesis with high clarity Islamic voice matching Hadith Library
  const speakText = useCallback((text: string, onEndCallback?: () => void) => {
    VoiceService.stop();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    
    // Clean text for natural spoken delivery
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\((.*?)\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!cleanText) {
      if (onEndCallback) onEndCallback();
      return;
    }

    setIsSpeaking(true);
    isSpeakingRef.current = true;

    // Detect if the text contains predominant Arabic letters or Islamic supplications
    const hasArabic = /[\u0600-\u06FF]/.test(cleanText);
    const lang = hasArabic ? 'ar' : 'en';

    VoiceService.speak(
      cleanText,
      lang,
      'aliyah',
      () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        if (onEndCallback) onEndCallback();
      }
    );
  }, []);

  const stopSpeech = useCallback(() => {
    VoiceService.stop();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    isSpeakingRef.current = false;
  }, []);

  // Initialize Standard Speech Recognition for Chat input
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      stopSpeech();
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.warn("Failed to start voice input", e);
      }
    }
  };

  // Live Talk Pal Voice Call Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setLiveTranscript(transcript);

        if (event.results[0] && event.results[0].isFinal) {
          const finalPrompt = transcript.trim();
          if (finalPrompt) {
            handleTalkSend(finalPrompt);
          }
        }
      };

      rec.onerror = (err: any) => {
        console.warn("Talk mode speech error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      talkRecognitionRef.current = rec;
    }
  }, []);

  const startTalkListening = useCallback(() => {
    if (isSpeakingRef.current) return;
    try {
      setLiveTranscript('');
      talkRecognitionRef.current?.start();
      setIsListening(true);
    } catch (e) {
      // Already running
    }
  }, []);

  const stopTalkListening = useCallback(() => {
    try {
      talkRecognitionRef.current?.stop();
    } catch (e) {}
    setIsListening(false);
  }, []);

  // Fetch Conversation History
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_')) {
      const key = `sanctuary_ai_convs_${currentUser.uid}`;
      const loadLocal = () => {
        const raw = localStorage.getItem(key);
        setConversations(raw ? JSON.parse(raw) : []);
      };
      loadLocal();
      window.addEventListener('storage', loadLocal);
      return () => window.removeEventListener('storage', loadLocal);
    } else {
      const q = query(
        collection(db, 'ai_conversations'),
        where('userId', '==', currentUser.uid),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
        setConversations(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'ai_conversations');
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  // Fetch Messages for active conversation
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    if (currentUser && (currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_'))) {
      const loadLocalMsgs = () => {
        const key = `sanctuary_ai_msgs_${activeConvId}`;
        const raw = localStorage.getItem(key);
        setMessages(raw ? JSON.parse(raw) : []);
      };
      loadLocalMsgs();
      return;
    } else {
      const q = query(
        collection(db, `ai_conversations/${activeConvId}/messages`),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        setMessages(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `ai_conversations/${activeConvId}/messages`);
      });

      return () => unsubscribe();
    }
  }, [activeConvId, currentUser]);

  // Scroll to bottom on message updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading, liveTranscript]);

  // Core Send Logic for Aliyah (both Chat & Talk Mode)
  const sendToAliyah = async (userText: string, currentAttachments: Attachment[] = [], isFromTalkMode = false) => {
    if ((!userText.trim() && currentAttachments.length === 0) || isLoading || !currentUser) return;

    setIsLoading(true);
    const isLocalUser = currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_');

    try {
      let currentConvId = activeConvId;

      // 1. Create conversation if not exists
      if (!currentConvId) {
        const titleText = userText || (currentAttachments.length > 0 ? `Shared ${currentAttachments[0].type}` : 'Talk with Aliyah');
        const shortTitle = titleText.slice(0, 40) + (titleText.length > 40 ? '...' : '');

        if (isLocalUser) {
          currentConvId = `local_conv_${Date.now()}`;
          const newConv = {
            id: currentConvId,
            title: shortTitle,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          const keyConvs = `sanctuary_ai_convs_${currentUser.uid}`;
          const raw = localStorage.getItem(keyConvs);
          const list = raw ? JSON.parse(raw) : [];
          const updatedList = [newConv, ...list];
          localStorage.setItem(keyConvs, JSON.stringify(updatedList));
          setConversations(updatedList);
          setActiveConvId(currentConvId);
        } else {
          const convRef = await addDoc(collection(db, 'ai_conversations'), {
            userId: currentUser.uid,
            title: shortTitle,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          currentConvId = convRef.id;
          setActiveConvId(currentConvId);
        }
      } else {
        if (isLocalUser) {
          const keyConvs = `sanctuary_ai_convs_${currentUser.uid}`;
          const raw = localStorage.getItem(keyConvs);
          if (raw) {
            const list = JSON.parse(raw);
            const found = list.find((c: any) => c.id === currentConvId);
            if (found) {
              found.updatedAt = new Date().toISOString();
              list.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
              localStorage.setItem(keyConvs, JSON.stringify(list));
              setConversations(list);
            }
          }
        } else {
          await updateDoc(doc(db, 'ai_conversations', currentConvId), {
            updatedAt: serverTimestamp()
          });
        }
      }

      // 2. Add user message
      const userMsg: Message = {
        id: `msg_user_${Date.now()}`,
        role: 'user',
        content: userText,
        attachments: currentAttachments,
        timestamp: new Date().toISOString()
      };

      if (isLocalUser) {
        const keyMsgs = `sanctuary_ai_msgs_${currentConvId}`;
        const rawMsgs = localStorage.getItem(keyMsgs);
        const existingMsgs = rawMsgs ? JSON.parse(rawMsgs) : [];
        const updatedMsgs = [...existingMsgs, userMsg];
        localStorage.setItem(keyMsgs, JSON.stringify(updatedMsgs));
        setMessages(updatedMsgs);
      } else {
        const msgRef = collection(db, `ai_conversations/${currentConvId}/messages`);
        await addDoc(msgRef, {
          role: 'user',
          content: userText,
          attachments: currentAttachments,
          timestamp: serverTimestamp()
        });
      }

      // 3. Build contents array
      const allMsgs = messages.concat(userMsg);
      const contents = allMsgs.map(m => {
        const parts: any[] = [];
        if (m.content && m.content.trim()) {
          parts.push({ text: m.content.trim() });
        }
        if (m.attachments && m.attachments.length > 0) {
          for (const a of m.attachments) {
            if (a.base64) {
              const base64Data = a.base64.includes(',') ? a.base64.split(',')[1] : a.base64;
              parts.push({
                inlineData: {
                  data: base64Data,
                  mimeType: a.mimeType || 'image/jpeg'
                }
              });
            }
          }
        }
        return {
          role: m.role === 'model' ? 'model' : 'user',
          parts
        };
      }).filter(item => item.parts.length > 0);

      const startTime = Date.now();
      const response = await apiFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: ALIYAH_SYSTEM_INSTRUCTION
        })
      });
      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to communicate with Aliyah');
      }
      
      const data = await response.json();
      const assistantText = data.text || "I'm right here listening! What's on your mind?";

      telemetryService.recordHabibiQuery(userText, 'General Deen', latencyMs);

      // 4. Add Aliyah's response
      const assistantMsg: Message = {
        id: `msg_model_${Date.now()}`,
        role: 'model',
        content: assistantText,
        timestamp: new Date().toISOString()
      };

      if (isLocalUser) {
        const keyMsgs = `sanctuary_ai_msgs_${currentConvId}`;
        const rawMsgs = localStorage.getItem(keyMsgs);
        const existingMsgs = rawMsgs ? JSON.parse(rawMsgs) : [];
        const updatedMsgs = [...existingMsgs, assistantMsg];
        localStorage.setItem(keyMsgs, JSON.stringify(updatedMsgs));
        setMessages(updatedMsgs);
      } else {
        const msgRef = collection(db, `ai_conversations/${currentConvId}/messages`);
        await addDoc(msgRef, {
          role: 'model',
          content: assistantText,
          timestamp: serverTimestamp()
        });
      }

      addHasanat(25);

      // Voice response handling
      if (voiceEnabled || isFromTalkMode || isCallActive) {
        speakText(assistantText, () => {
          // If in Continuous Auto-Talk mode, restart microphone automatically!
          if ((isFromTalkMode || isCallActive) && autoListenContinuous) {
            setTimeout(() => {
              startTalkListening();
            }, 400);
          }
        });
      }

    } catch (error: any) {
      console.warn("Aliyah Conversation notice:", error);
      const fallbackMsg: Message = {
        id: `msg_info_${Date.now()}`,
        role: 'model',
        content: `I heard you, but had a brief connection hiccup! Could you tell me that again? I'm right here listening.`,
        timestamp: new Date().toISOString()
      };

      if (isLocalUser) {
        const keyMsgs = `sanctuary_ai_msgs_${activeConvId || 'error'}`;
        const rawMsgs = localStorage.getItem(keyMsgs);
        const existingMsgs = rawMsgs ? JSON.parse(rawMsgs) : [];
        const updatedMsgs = [...existingMsgs, fallbackMsg];
        localStorage.setItem(keyMsgs, JSON.stringify(updatedMsgs));
        setMessages(updatedMsgs);
      } else {
        setMessages(prev => [...prev, fallbackMsg]);
      }
    } finally {
      setIsLoading(false);
      setLiveTranscript('');
    }
  };

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return;
    const text = input.trim();
    const atts = [...attachments];
    setInput('');
    setAttachments([]);
    sendToAliyah(text, atts, false);
  };

  const handleTalkSend = (spokenText: string) => {
    stopTalkListening();
    sendToAliyah(spokenText, [], true);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startNewChat = () => {
    stopSpeech();
    setActiveConvId(null);
    setMessages([]);
    setInput('');
    setLiveTranscript('');
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation with Aliyah?")) return;
    
    try {
      if (activeConvId === id) {
        setActiveConvId(null);
        setMessages([]);
      }
      
      if (currentUser && (currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_'))) {
        const keyConvs = `sanctuary_ai_convs_${currentUser.uid}`;
        const existingConvs = localStorage.getItem(keyConvs);
        if (existingConvs) {
          const parsed = JSON.parse(existingConvs);
          const updated = parsed.filter((c: any) => c.id !== id);
          localStorage.setItem(keyConvs, JSON.stringify(updated));
          setConversations(updated);
        }
        localStorage.removeItem(`sanctuary_ai_msgs_${id}`);
      } else {
        const msgs = await getDocs(collection(db, `ai_conversations/${id}/messages`));
        for (const m of msgs.docs) {
          await deleteDoc(m.ref);
        }
        await deleteDoc(doc(db, 'ai_conversations', id));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `ai_conversations/${id}`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const type: 'image' | 'file' = file.type.startsWith('image/') ? 'image' : 'file';
        
        setAttachments(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          type,
          name: file.name,
          url: URL.createObjectURL(file),
          base64,
          mimeType: file.type
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[520px] md:h-[700px] max-w-6xl mx-auto glass-panel rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border-white/10 shadow-2xl relative">
      
      {/* Sidebar - Chat History */}
      <AnimatePresence mode="wait">
        {showSidebar && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-brand-depth/80 backdrop-blur-sm z-40 lg:hidden"
            />
            
            <motion.aside 
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed lg:relative inset-y-0 left-0 w-[280px] bg-brand-sidebar/95 lg:bg-brand-sidebar/50 border-r border-white/5 flex flex-col z-50 lg:z-auto overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <History size={14} className="text-brand-primary" /> Past Talks with Aliyah
                </h3>
                <button 
                  onClick={() => setShowSidebar(false)}
                  className="p-1.5 text-slate-500 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      if (window.innerWidth < 1024) setShowSidebar(false);
                    }}
                    role="button"
                    tabIndex={0}
                    className={`w-full group text-left p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer outline-none ${
                      activeConvId === conv.id 
                        ? 'bg-brand-primary/15 border border-brand-primary/30 text-brand-primary font-bold' 
                        : 'hover:bg-white/5 text-slate-400'
                    }`}
                  >
                    <MessageSquare size={16} className={`${activeConvId === conv.id ? 'text-brand-primary' : 'text-slate-500'}`} />
                    <span className="flex-1 text-xs truncate">{conv.title}</span>
                    <button 
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all focus:opacity-100 outline-none"
                      title="Delete conversation"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                
                {conversations.length === 0 && (
                  <div className="text-center py-12 opacity-40">
                    <Sparkles size={28} className="mx-auto mb-3 text-brand-primary" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No past talks yet</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/5">
                <button 
                  onClick={() => {
                    startNewChat();
                    if (window.innerWidth < 1024) setShowSidebar(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-xl font-bold text-xs hover:bg-brand-primary/20 transition-all cursor-pointer"
                >
                  <Plus size={16} /> NEW TALK
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="flex-1 flex flex-col relative islamic-pattern overflow-hidden">
        
        {/* Aliyah Under Construction Header Banner */}
        <div className="w-full bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-amber-500/20 border-b border-amber-500/30 px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-amber-200 backdrop-blur-md z-40">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Construction size={14} className="animate-pulse" />
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-black text-amber-300 uppercase tracking-widest text-[10px] bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                Notice • Under Construction
              </span>
              <span className="text-[11px] sm:text-xs text-amber-100 font-medium">
                Aliyah is currently under active construction & fine-tuning. Continuous upgrades to intelligence, voice, and responsiveness are in progress.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[9px] font-black uppercase tracking-widest shrink-0 hidden lg:inline-flex items-center gap-1">
            <Construction size={11} /> Beta Mode
          </span>
        </div>

        {/* Top Header Bar */}
        <header className="p-3.5 md:p-5 border-b border-white/5 flex items-center justify-between bg-brand-sidebar/60 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setShowSidebar(prev => !prev)} 
              className="p-2 text-slate-400 hover:text-brand-primary transition-colors cursor-pointer rounded-lg hover:bg-white/5"
              title="Toggle Past Talks"
            >
              {showSidebar ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>

            {/* Aliyah Avatar Badge */}
            <div className="relative">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-tr from-brand-primary via-emerald-400 to-teal-200 p-0.5 shadow-lg shadow-brand-primary/20 flex items-center justify-center">
                <div className="w-full h-full bg-brand-sidebar rounded-[14px] flex items-center justify-center text-brand-primary">
                  <Sparkles size={20} className="animate-pulse text-brand-primary" />
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-brand-sidebar rounded-full shadow" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base md:text-lg font-black text-white tracking-tight">
                  Aliyah
                </h2>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary border border-brand-primary/30">
                  Gemini Talk Pal
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Construction size={10} /> Under Construction
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Listens and responds freely to any topic with warmth & wisdom
              </p>
            </div>
          </div>

          {/* Navigation Pill Switches */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
              <button 
                onClick={() => setActiveTab('talk')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'talk' ? 'bg-brand-primary text-brand-depth shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <Radio size={13} />
                <span>Talk Pal</span>
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'chat' ? 'bg-brand-primary text-brand-depth shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <MessageSquare size={13} />
                <span>Chat</span>
              </button>
              <button 
                onClick={() => setActiveTab('gratitude')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'gratitude' ? 'bg-brand-primary text-brand-depth shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <Heart size={13} className={activeTab === 'gratitude' ? "fill-brand-depth" : "text-brand-primary"} />
                <span>Gratitude</span>
              </button>
            </div>

            {/* Voice Sound Toggle */}
            <button 
              onClick={() => {
                if (voiceEnabled && isSpeaking) stopSpeech();
                setVoiceEnabled(!voiceEnabled);
              }}
              className={`p-2.5 rounded-xl transition-all border border-white/5 cursor-pointer ${voiceEnabled ? 'text-brand-primary bg-brand-primary/10 border-brand-primary/20' : 'text-slate-500 hover:bg-white/5'}`}
              title={voiceEnabled ? "Voice Output Active" : "Voice Output Muted"}
            >
              {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </header>

        {/* TAB 1: LIVE TALK PAL MODE (Voice & Conversation Center) */}
        {activeTab === 'talk' && (
          <div className="flex-1 flex flex-col justify-between p-4 md:p-8 overflow-y-auto scrollbar-hide relative">
            
            {/* Top Status & Personality Insight */}
            <div className="max-w-2xl mx-auto w-full text-center space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">
                {isListening ? '🎙️ Aliyah is listening to you...' : isSpeaking ? '🔊 Aliyah is talking...' : isLoading ? '✨ Aliyah is thinking...' : '🌿 Ready to talk freely about any topic'}
              </span>
            </div>

            {/* Central Animated Interactive Voice Visualizer */}
            <div className="my-auto py-6 flex flex-col items-center justify-center max-w-lg mx-auto w-full text-center space-y-6">
              
              {/* Outer Glowing Ripple Orb */}
              <div className="relative flex items-center justify-center">
                <motion.div 
                  animate={{ 
                    scale: isSpeaking || isListening ? [1, 1.15, 1] : 1,
                    opacity: isSpeaking || isListening ? [0.2, 0.45, 0.2] : 0.15
                  }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute w-48 h-48 md:w-56 md:h-56 rounded-full bg-brand-primary blur-3xl pointer-events-none"
                />

                {/* Main Orb */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (isListening) {
                      stopTalkListening();
                    } else if (isSpeaking) {
                      stopSpeech();
                    } else {
                      startTalkListening();
                    }
                  }}
                  className={`w-32 h-32 md:w-36 md:h-36 rounded-[2.5rem] flex flex-col items-center justify-center transition-all shadow-2xl relative border-2 cursor-pointer ${
                    isListening 
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 ring-8 ring-rose-500/15 animate-pulse'
                      : isSpeaking 
                      ? 'bg-brand-primary/20 border-brand-primary text-brand-primary ring-8 ring-brand-primary/20 shadow-brand-primary/30'
                      : 'bg-white/5 border-white/10 hover:border-brand-primary/40 text-slate-300'
                  }`}
                >
                  {isListening ? (
                    <>
                      <Mic size={36} className="animate-bounce" />
                      <span className="text-[10px] font-black uppercase tracking-wider mt-2">Listening...</span>
                    </>
                  ) : isSpeaking ? (
                    <>
                      <Volume2 size={36} className="animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider mt-2">Speaking</span>
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 size={36} className="animate-spin text-brand-primary" />
                      <span className="text-[10px] font-black uppercase tracking-wider mt-2 text-brand-primary">Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Mic size={36} className="text-brand-primary" />
                      <span className="text-[10px] font-black uppercase tracking-wider mt-2 text-slate-300">Tap to Talk</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Audio Wave Visualizer Bars */}
              <div className="flex items-center justify-center gap-1.5 h-10">
                {audioWaveLevel.map((height, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: `${height}px` }}
                    transition={{ duration: 0.15 }}
                    className={`w-1.5 rounded-full ${
                      isListening ? 'bg-rose-400' : isSpeaking ? 'bg-brand-primary' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>

              {/* Live Transcript / Last Spoken Message Display */}
              <div className="w-full max-w-md min-h-[70px] flex items-center justify-center p-4 rounded-2xl bg-brand-sidebar/80 border border-white/10 shadow-inner text-center">
                {liveTranscript ? (
                  <p className="text-xs md:text-sm text-slate-200 italic font-medium animate-pulse">
                    "{liveTranscript}"
                  </p>
                ) : messages.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-wider">
                      {messages[messages.length - 1].role === 'user' ? 'You said:' : 'Aliyah said:'}
                    </p>
                    <p className="text-xs md:text-sm text-slate-300 font-medium line-clamp-2">
                      "{messages[messages.length - 1].content.slice(0, 160)}"
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium">
                    "Say anything! How you feel, ask life advice, explore the universe, or talk about spirituality..."
                  </p>
                )}
              </div>

              {/* Continuous Conversation Toggle */}
              <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <button
                  onClick={() => setAutoListenContinuous(!autoListenContinuous)}
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    autoListenContinuous ? 'bg-brand-primary border-brand-primary' : 'border-slate-500'
                  }`}
                >
                  {autoListenContinuous && <Check size={10} className="text-brand-depth font-black" />}
                </button>
                <span className="text-[11px] font-bold text-slate-300">
                  Continuous Spoken Conversation (Hands-Free)
                </span>
              </div>
            </div>

            {/* Quick Conversation Starters Carousel */}
            <div className="space-y-2 max-w-3xl mx-auto w-full pt-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Topic Inspiration
                </p>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View Full Chat <ChevronRight size={12} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {CONVERSATION_STARTERS.slice(0, 4).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sendToAliyah(item.prompt, [], true);
                    }}
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-brand-primary/30 transition-all text-left group cursor-pointer"
                  >
                    <span className="text-[9px] font-bold text-brand-primary uppercase block mb-0.5">
                      {item.topic}
                    </span>
                    <p className="text-xs font-semibold text-white group-hover:text-brand-primary transition-colors truncate">
                      {item.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: RICH CHAT MODE */}
        {activeTab === 'chat' && (
          <>
            {/* Messages Container */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 py-8">
                  <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center border border-brand-primary/20 shadow-2xl">
                    <Sparkles size={32} className="text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1.5">Talk Freely with Aliyah</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      Aliyah listens and responds openly to any topic — your thoughts, feelings, deep reflections, curiosities, or stories.
                    </p>
                  </div>

                  {/* Suggestion Prompts */}
                  <div className="grid grid-cols-1 gap-2.5 w-full">
                    {CONVERSATION_STARTERS.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInput(s.prompt);
                        }}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-brand-primary/40 hover:bg-white/10 text-xs text-slate-300 hover:text-brand-primary transition-all text-left flex items-center justify-between cursor-pointer group"
                      >
                        <div>
                          <span className="text-[9px] font-black uppercase text-brand-primary block">{s.topic}</span>
                          <span className="font-medium text-slate-200">{s.title}</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-500 group-hover:text-brand-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message List */}
              <AnimatePresence initial={false}>
                {messages.map((m, idx) => (
                  <motion.div
                    key={m.id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[92%] md:max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                        m.role === 'user' ? 'bg-slate-700 text-slate-200' : 'bg-brand-primary text-brand-depth font-black'
                      }`}>
                        {m.role === 'user' ? <User size={15} /> : <Sparkles size={15} />}
                      </div>

                      {/* Content Box */}
                      <div className="relative group/msg">
                        <div className={`p-4 md:p-5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-lg relative ${
                          m.role === 'user' 
                            ? 'bg-brand-primary text-brand-depth font-semibold rounded-tr-none' 
                            : 'glass-panel text-slate-200 border-white/10 rounded-tl-none'
                        }`}>
                          {/* Attachments */}
                          {m.attachments && m.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {m.attachments.map(a => (
                                <div key={a.id} className="relative">
                                  {a.type === 'image' ? (
                                    <img src={a.url} alt={a.name} className="w-36 h-36 object-cover rounded-lg border border-white/10" />
                                  ) : (
                                    <div className="bg-white/10 p-2.5 rounded-lg flex items-center gap-2 border border-white/5">
                                      <FileText size={15} className="text-brand-primary" />
                                      <span className="text-[10px] font-bold truncate max-w-[120px]">{a.name}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Markdown Text */}
                          <div className="markdown-body prose prose-invert prose-xs max-w-none prose-p:leading-relaxed prose-headings:text-white prose-strong:text-brand-primary">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        </div>

                        {/* Action Toolbar on Hover */}
                        <div className={`flex items-center gap-1.5 mt-1 opacity-0 group-hover/msg:opacity-100 transition-opacity ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <button
                            onClick={() => speakText(m.content)}
                            className="p-1 text-slate-400 hover:text-brand-primary transition-colors cursor-pointer"
                            title="Read out loud"
                          >
                            <Volume2 size={13} />
                          </button>
                          <button
                            onClick={() => copyToClipboard(m.content, m.id || String(idx))}
                            className="p-1 text-slate-400 hover:text-brand-primary transition-colors cursor-pointer"
                            title="Copy text"
                          >
                            {copiedId === (m.id || String(idx)) ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-inner">
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" />
                    <span className="text-[10px] text-slate-400 font-bold ml-2">Aliyah is typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 md:p-6 bg-gradient-to-t from-brand-sidebar/90 via-brand-sidebar/60 to-transparent border-t border-white/5">
              <div className="max-w-3xl mx-auto space-y-2">
                
                {/* Attachments Preview */}
                <AnimatePresence>
                  {attachments.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex flex-wrap gap-2 p-3 glass-panel border-white/10 rounded-xl"
                    >
                      {attachments.map(a => (
                        <div key={a.id} className="relative group/prev">
                          <div className="h-12 px-3 bg-white/5 rounded-lg flex items-center gap-2 border border-white/10 text-xs">
                            {a.type === 'image' ? <img src={a.url} alt="" className="w-8 h-8 object-cover rounded" /> : <FileText size={14} className="text-brand-primary" />}
                            <span className="text-[10px] font-bold max-w-[80px] truncate">{a.name}</span>
                          </div>
                          <button 
                            onClick={() => setAttachments(prev => prev.filter(x => x.id !== a.id))}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative glass-panel p-1.5 md:p-2 rounded-2xl flex items-center gap-2 border-white/10 focus-within:border-brand-primary/50 focus-within:ring-1 focus-within:ring-brand-primary/50 transition-all shadow-xl bg-brand-sidebar/80">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    multiple 
                    accept="image/*,application/pdf,text/plain"
                  />

                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-slate-400 hover:text-brand-primary hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                    title="Attach image or file"
                  >
                    <Paperclip size={18} />
                  </button>

                  <button 
                    onClick={toggleListening}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                      isListening 
                        ? 'bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/40' 
                        : 'text-slate-400 hover:text-brand-primary hover:bg-white/5'
                    }`}
                    title={isListening ? "Listening... (Click to stop)" : "Speech-to-text"}
                  >
                    <Mic size={18} />
                  </button>

                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Talk to Aliyah about anything..." 
                    className="flex-1 bg-transparent border-none outline-none px-3 py-2.5 text-slate-100 placeholder:text-slate-500 text-xs md:text-sm"
                  />

                  <button 
                    onClick={handleSend}
                    disabled={isLoading || (!input.trim() && attachments.length === 0)}
                    className="bg-brand-primary text-brand-depth w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 font-bold shadow-lg shadow-brand-primary/25 cursor-pointer shrink-0"
                    title="Send message"
                  >
                    <Send size={16} />
                  </button>
                </div>

                <div className="flex justify-between items-center px-3 text-[10px] text-slate-500 font-medium">
                  <span>Gemini 3.7 Flash Intelligence</span>
                  <button 
                    onClick={() => setActiveTab('talk')}
                    className="text-brand-primary hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Radio size={11} /> Switch to Live Voice Call
                  </button>
                </div>

              </div>
            </div>
          </>
        )}

        {/* TAB 3: GRATITUDE JOURNAL (Sacred Shukr & Daily Blessings) */}
        {activeTab === 'gratitude' && (
          <GratitudeJournal 
            currentUser={currentUser}
            addHasanat={addHasanat}
            speakText={speakText}
          />
        )}

      </div>
    </div>
  );
}
