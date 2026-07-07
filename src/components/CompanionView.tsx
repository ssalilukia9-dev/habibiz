import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Mic, 
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
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  MoreVertical,
  BookOpen,
  Image as ImageIcon,
  FileText,
  Paperclip,
  Play,
  StopCircle,
  Loader2
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

const SYSTEM_INSTRUCTION = `You are "The Nur Companion", the soul of the Holy Quran Chat.
Your goal is to provide deep, spiritual, and scholarly guidance based strictly on the Quran and Sunnah.
Maintain a serene, compassionate, and wise tone at all times.
Keep your responses insightful, focusing on the spiritual essence of the user's queries.
For short, direct, simple, or straightforward questions, always give short, direct, and concise replies. Avoid long walls of text when a brief answer is sufficient or needed.
Always reference specific Quranic verses (Surah:Verse) and authentic Hadith to support your guidance.
Format your responses beautifully using Markdown: use headers for key concepts, bolding for emphasis, and blockquotes for scriptural citations.
If a user seeks advice beyond Islamic jurisprudence, gently bridge the topic back to moral excellence (Ihsan) or prophetic wisdom.
If a query requires technical legal expertise (Fatwa) beyond your capacity, respectfully advise consulting a qualified local Mufti or scholar.
Greet the user with "Assalamu Alaikum" in your first response of a session if they haven't initiated the greeting.`;

import { apiFetch } from '../lib/api';

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
  
  // Return Gateway if not premium
  if (!isPremium) {
    return (
      <div className="h-[calc(100vh-140px)] min-h-[480px] md:h-[650px] flex flex-col items-center justify-center space-y-8 glass-panel rounded-[2rem] md:rounded-[2.5rem] border-white/10 relative overflow-hidden bg-brand-sidebar/20">
        <div className="absolute inset-0 islamic-pattern opacity-5 pointer-events-none" />
        <div className="w-24 h-24 bg-brand-primary/10 rounded-[2.5rem] flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-2xl animate-pulse">
           <Sparkles size={48} />
        </div>
        <div className="text-center max-w-sm px-6 space-y-4 relative z-10">
           <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Divine Consultation</h2>
           <p className="text-slate-400 font-medium text-sm leading-relaxed">
             Unlock the power of our **Premium AI Companion**. Deep Quranic insights, personalized spiritual guidance, and voice interaction.
           </p>
           <button 
             onClick={onShowPremium}
             className="w-full bg-brand-primary text-brand-depth font-black py-4 rounded-2xl shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 text-xs uppercase"
           >
              Upgrade to Premium
              <Crown size={20} className="text-brand-depth/40" />
           </button>
        </div>
        <div className="flex gap-4 opacity-30 pt-4">
           {[Bot, MessageSquare, History, Mic].map((Icon, i) => <Icon key={i} size={16} className="text-slate-500" />)}
        </div>
      </div>
    );
  }

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'chat' | 'reflections'>('chat');
  const [reflections, setReflections] = useState<any[]>([]);
  const [isReflectionsLoading, setIsReflectionsLoading] = useState(false);
  const [reflectionInput, setReflectionInput] = useState('');
  const [isRecordingReflection, setIsRecordingReflection] = useState(false);
  const [reflectionVerses, setReflectionVerses] = useState<any[]>([]);
  const [isAnalyzingReflection, setIsAnalyzingReflection] = useState(false);
  const reflectionRecognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  // Initialize sidebar based on screen size
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setShowSidebar(true);
    }
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
      // Listen to storage event in case of updates
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

  // Fetch Reflections from Firestore or LocalStorage
  useEffect(() => {
    if (!currentUser || activeView !== 'reflections') return;

    if (currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_')) {
      const key = `sanctuary_voice_reflections_${currentUser.uid}`;
      const loadLocal = () => {
        const raw = localStorage.getItem(key);
        setReflections(raw ? JSON.parse(raw) : []);
      };
      loadLocal();
      window.addEventListener('storage', loadLocal);
      return () => window.removeEventListener('storage', loadLocal);
    } else {
      setIsReflectionsLoading(true);
      const q = query(
        collection(db, 'users', currentUser.uid, 'voiceReflections'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReflections(list);
        setIsReflectionsLoading(false);
      }, (error) => {
        console.error("Error loading voice reflections:", error);
        setIsReflectionsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [currentUser, activeView]);

  // Continuous speech recognition for structured reflections
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setReflectionInput(prev => prev + finalTranscript);
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsRecordingReflection(false);
      };
      rec.onend = () => {
        setIsRecordingReflection(false);
      };

      reflectionRecognitionRef.current = rec;
    }
  }, []);

  const toggleRecordingReflection = () => {
    if (isRecordingReflection) {
      reflectionRecognitionRef.current?.stop();
      setIsRecordingReflection(false);
    } else {
      setReflectionInput('');
      setReflectionVerses([]);
      try {
        reflectionRecognitionRef.current?.start();
        setIsRecordingReflection(true);
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }
  };

  const analyzeReflection = async () => {
    if (!reflectionInput.trim() || isAnalyzingReflection) return;
    setIsAnalyzingReflection(true);
    try {
      const res = await apiFetch('/api/ai/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reflectionInput })
      });

      if (!res.ok) {
        throw new Error("Failed to get verse suggestions");
      }

      const data = await res.json();
      const suggestedVerses = data.verses || [];
      setReflectionVerses(suggestedVerses);

      // Save to database
      if (currentUser) {
        const isLocalUser = currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_');
        const newReflection = {
          text: reflectionInput,
          createdAt: new Date().toISOString(),
          verses: suggestedVerses
        };

        if (isLocalUser) {
          const key = `sanctuary_voice_reflections_${currentUser.uid}`;
          const raw = localStorage.getItem(key);
          const list = raw ? JSON.parse(raw) : [];
          localStorage.setItem(key, JSON.stringify([newReflection, ...list]));
          setReflections([newReflection, ...list]);
        } else {
          await addDoc(collection(db, 'users', currentUser.uid, 'voiceReflections'), {
            text: reflectionInput,
            createdAt: serverTimestamp(),
            verses: suggestedVerses
          });
        }
        addHasanat(50);
      }
    } catch (e: any) {
      console.error("Reflection analysis failed:", e);
      alert("Spiritual analysis failed: " + e.message);
    } finally {
      setIsAnalyzingReflection(false);
    }
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const startNewChat = async () => {
    setActiveConvId(null);
    setMessages([]);
    setInput('');
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;
    
    try {
      if (activeConvId === id) setActiveConvId(null);
      
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
        // Delete messages subcollection first (though firestore rules might prevent batch delete easily, 
        // in production we'd do a recursive delete or function)
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

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading || !currentUser) return;

    const userText = input.trim();
    const currentAttachments = [...attachments];
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    const isLocalUser = currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_');

    try {
      let currentConvId = activeConvId;

      // 1. Create conversation if it doesn't exist
      if (!currentConvId) {
        const titleText = userText || (currentAttachments.length > 0 ? `Shared ${currentAttachments[0].type}` : 'New Consult');
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
        // Update updatedAt
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

      // 3. Call AI Proxy / Google Gemini API client-side fallback
      const contents = messages.concat(userMsg).map(m => ({
        role: m.role,
        parts: [
          { text: m.content },
          ...(m.attachments || []).map(a => ({
            inlineData: {
              data: a.base64?.split(',')[1],
              mimeType: a.mimeType
            }
          }))
        ]
      }));

      const response = await apiFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: SYSTEM_INSTRUCTION
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get AI response');
      }
      
      const data = await response.json();
      const assistantText = data.text || "I apologize, I couldn't process that. Please try again.";

      // 4. Add assistant message
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

      addHasanat(30);

      if (voiceEnabled) {
        speak(assistantText);
      }

    } catch (error: any) {
      console.error("AI Error:", error);
      
      const assistantMsg: Message = {
        id: `msg_error_${Date.now()}`,
        role: 'model',
        content: `⚠️ **System Error:** ${error.message}. Please check your connection and configuration.`,
        timestamp: new Date().toISOString()
      };

      if (isLocalUser) {
        const keyMsgs = `sanctuary_ai_msgs_${activeConvId || 'error'}`;
        const rawMsgs = localStorage.getItem(keyMsgs);
        const existingMsgs = rawMsgs ? JSON.parse(rawMsgs) : [];
        const updatedMsgs = [...existingMsgs, assistantMsg];
        localStorage.setItem(keyMsgs, JSON.stringify(updatedMsgs));
        setMessages(updatedMsgs);
      } else {
        const msgRef = collection(db, `ai_conversations/${activeConvId || 'error'}/messages`);
        if (activeConvId) {
          await addDoc(msgRef, {
            role: 'model',
            content: `⚠️ **System Error:** ${error.message}. Please check your connection and configuration.`,
            timestamp: serverTimestamp()
          });
        } else {
          alert(`AI Error: ${error.message}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    // Clean text for speech
    const cleanText = text.replace(/[*_#]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
    
    const utterance = new window.SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices[0];
    if (voice) utterance.voice = voice;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
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

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setAttachments(prev => [...prev, {
            id: 'voice-' + Date.now(),
            type: 'voice',
            name: 'Voice Message',
            url: URL.createObjectURL(blob),
            base64,
            mimeType: 'audio/webm'
          }]);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[480px] md:h-[650px] max-w-6xl mx-auto glass-panel rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border-white/10 shadow-2xl relative">
      {/* Sidebar - Mobile Drawer / Desktop Static */}
      <AnimatePresence mode="wait">
        {showSidebar && (
          <>
            {/* Backdrop for mobile */}
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
              className="fixed lg:relative inset-y-0 left-0 w-[280px] lg:w-[280px] bg-brand-sidebar/95 lg:bg-brand-sidebar/50 border-r border-white/5 flex flex-col z-50 lg:z-auto overflow-hidden whitespace-nowrap"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <History size={14} className="text-brand-primary" /> Past Chats
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setActiveConvId(conv.id);
                        if (window.innerWidth < 1024) setShowSidebar(false);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`w-full group text-left p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 ${
                      activeConvId === conv.id 
                        ? 'bg-brand-primary/10 border border-brand-primary/20 text-brand-primary' 
                        : 'hover:bg-white/5 text-slate-400'
                    }`}
                  >
                    <MessageSquare size={16} className={`${activeConvId === conv.id ? 'text-brand-primary' : 'text-slate-500'}`} />
                    <span className="flex-1 text-xs font-medium truncate">{conv.title}</span>
                    <button 
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all focus:opacity-100 outline-none"
                      aria-label="Delete conversation"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                
                {conversations.length === 0 && (
                  <div className="text-center py-10 opacity-30">
                    <Sparkles size={32} className="mx-auto mb-4" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No history yet</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/5">
                 <button 
                   onClick={() => {
                     startNewChat();
                     if (window.innerWidth < 1024) setShowSidebar(false);
                   }}
                   className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-xl font-bold text-xs hover:bg-brand-primary/20 transition-all"
                 >
                   <Plus size={16} /> NEW CONSULTATION
                 </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative islamic-pattern">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-brand-sidebar/40 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSidebar(prev => !prev)} 
              className="p-2 text-slate-400 hover:text-brand-primary transition-colors"
            >
              {showSidebar ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center border border-brand-primary/30 group">
              <Sparkles size={20} className="text-brand-primary group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h2 className="text-sm md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Holy Quran Chat
                <span className="hidden xs:inline text-[8px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase">Premium AI</span>
              </h2>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Nur Companion</p>
            </div>

            <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10 sm:ml-4">
              <button 
                onClick={() => setActiveView('chat')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${activeView === 'chat' ? 'bg-brand-primary text-brand-depth shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Consult
              </button>
              <button 
                onClick={() => setActiveView('reflections')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${activeView === 'reflections' ? 'bg-brand-primary text-brand-depth shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Reflection Journal
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2.5 rounded-xl transition-all ${voiceEnabled ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-500 hover:bg-white/5'}`}
            >
              {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button className="p-2.5 text-slate-500 hover:text-white rounded-xl transition-all">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {activeView === 'chat' ? (
          <>
            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-hide"
            >
              {activeConvId === null && messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-6">
                  <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center border border-brand-primary/20 shadow-2xl relative">
                    <Sparkles size={40} className="text-brand-primary" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-brand-primary text-brand-depth rounded-full flex items-center justify-center">
                      <BookOpen size={12} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Speak with the Wisdom of Quran</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      "Invite to the way of your Lord with wisdom and good instruction." (16:125)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 w-full">
                    {["Prophet's character", "Importance of patience", "How to pray better"].map((query) => (
                      <button 
                        key={query}
                        onClick={() => { setInput(query); }}
                        className="p-4 glass-panel border-white/5 text-xs text-slate-300 hover:border-brand-primary/30 hover:text-brand-primary transition-all text-left flex items-center justify-between"
                      >
                        {query}
                        <ChevronRight size={14} className="opacity-30" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((m, idx) => (
                  <motion.div
                    key={m.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-4 max-w-[90%] md:max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg ${
                        m.role === 'user' ? 'bg-slate-700 text-slate-300' : 'bg-brand-primary text-brand-depth'
                      }`}>
                        {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={`relative group ${m.role === 'user' ? 'order-1' : ''}`}>
                        <div className={`p-4 md:p-5 rounded-2xl text-[13px] md:text-sm leading-relaxed shadow-xl ${
                          m.role === 'user' 
                            ? 'bg-brand-primary text-brand-depth font-semibold' 
                            : 'glass-panel text-slate-200 border-white/10'
                        }`}>
                          {m.attachments && m.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {m.attachments.map(a => (
                                <div key={a.id} className="relative group/att">
                                  {a.type === 'image' ? (
                                    <img src={a.url} alt={a.name} className="w-40 h-40 object-cover rounded-lg border border-white/10" />
                                  ) : a.type === 'voice' ? (
                                    <div className="bg-brand-depth/40 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                                       <div className="w-8 h-8 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary">
                                          <Mic size={14} />
                                       </div>
                                       <audio src={a.url} controls className="h-8 w-48 opacity-60" />
                                    </div>
                                  ) : (
                                    <div className="bg-white/5 p-3 rounded-lg flex items-center gap-2 border border-white/5 min-w-[120px]">
                                      <FileText size={16} className="text-brand-primary" />
                                      <span className="text-[10px] font-bold truncate max-w-[100px]">{a.name}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="markdown-body prose prose-invert prose-xs max-w-none prose-p:leading-relaxed prose-headings:text-white prose-strong:text-brand-primary">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-white/5 border border-white/10 p-5 rounded-2xl rounded-tl-none flex gap-2 shadow-inner">
                      <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" />
                   </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 md:p-8 bg-gradient-to-t from-brand-sidebar/80 to-transparent">
              <div className="max-w-3xl mx-auto relative group">
                {/* Attachment Preview */}
                <AnimatePresence>
                  {attachments.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mb-4 flex flex-wrap gap-3 p-4 glass-panel border-white/10 rounded-2xl"
                    >
                      {attachments.map(a => (
                        <div key={a.id} className="relative group/preview">
                          {a.type === 'image' ? (
                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                               <img src={a.url} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-16 px-4 bg-white/5 rounded-xl flex items-center gap-2 border border-white/10">
                               {a.type === 'voice' ? <Mic size={16} className="text-brand-primary" /> : <FileText size={16} className="text-brand-primary" />}
                               <span className="text-[10px] font-bold max-w-[80px] truncate">{a.name}</span>
                            </div>
                          )}
                          <button 
                            onClick={() => removeAttachment(a.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center border-2 border-brand-depth group-hover/preview:scale-110 transition-transform shadow-lg"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute inset-0 bg-brand-primary/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative glass-panel p-2 rounded-2xl flex items-center gap-2 border-white/10 focus-within:border-brand-primary/50 focus-within:ring-1 focus-within:ring-brand-primary/50 transition-all shadow-2xl">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    multiple 
                    accept="image/*,application/pdf,text/plain"
                  />
                  
                  <div className="flex items-center gap-1">
                    <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="p-3 text-slate-500 hover:text-brand-primary hover:bg-white/5 rounded-xl transition-all"
                       title="Attach media"
                    >
                      <Paperclip size={20} />
                    </button>
                    <button 
                      onClick={toggleListening}
                      className={`p-3 rounded-xl transition-all ${isListening ? 'bg-brand-primary/20 text-brand-primary animate-pulse' : 'text-slate-500 hover:text-brand-primary hover:bg-white/5'}`}
                      title="Voice Type (Speech back)"
                    >
                      <Mic size={20} />
                    </button>
                    <button 
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-slate-500 hover:text-brand-primary hover:bg-white/5'}`}
                      title={isRecording ? "Stop recording" : "Send Voice Message"}
                    >
                      {isRecording ? <StopCircle size={20} /> : <Play size={20} />}
                    </button>
                  </div>

                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask Sanctuary for wisdom..." 
                    className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-slate-100 placeholder:text-slate-600 text-sm md:text-base selection:bg-brand-primary/30"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={isLoading || (!input.trim() && attachments.length === 0)}
                    className="bg-brand-primary text-brand-depth w-10 md:w-12 h-10 md:h-12 rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-brand-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 disabled:shadow-none font-bold"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <div className="flex justify-between items-center px-4 mt-3">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Sparkles size={10} className="text-brand-primary" /> 
                    Holy Quran Chat • {activeConvId ? 'Deep Memory' : 'Active Heart'}
                  </p>
                  <button 
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className="text-[9px] font-bold text-slate-600 hover:text-brand-primary transition-colors flex items-center gap-1.5 uppercase tracking-widest"
                  >
                    <Volume2 size={10} /> {voiceEnabled ? 'Audio On' : 'Audio Off'}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-hide">
            {/* Daily Reflection Journal UI */}
            <div className="max-w-3xl mx-auto space-y-8">
              
              {/* Introduction / Card */}
              <div className="glass-panel p-6 rounded-[2rem] border-white/5 space-y-3 relative overflow-hidden bg-brand-sidebar/20">
                <div className="absolute top-0 right-0 p-6 opacity-5 text-brand-primary pointer-events-none">
                  <Mic size={64} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Spiritual Accounting</p>
                  <h3 className="text-xl font-bold text-white">Daily Voice Reflections</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Speak freely about your day, your struggles, feelings, or things you are grateful for. We will convert your voice reflection to text and suggest comforting Quranic verses.
                  </p>
                </div>
              </div>

              {/* Recording Interface Card */}
              <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="flex flex-col items-center gap-4 text-center">
                  <button 
                    onClick={toggleRecordingReflection}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl relative ${
                      isRecordingReflection 
                        ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/20 ring-8 ring-rose-500/15' 
                        : 'bg-brand-primary text-brand-depth hover:scale-105 active:scale-95 shadow-brand-primary/25'
                    }`}
                  >
                    {isRecordingReflection ? <StopCircle size={32} /> : <Mic size={32} />}
                    {isRecordingReflection && (
                      <span className="absolute -inset-2 rounded-full border border-rose-500 animate-ping opacity-30" />
                    )}
                  </button>
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-white">
                      {isRecordingReflection ? 'Recording your voice...' : 'Tap to start reflecting'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Uses the browser's high-fidelity SpeechRecognition API
                    </p>
                  </div>
                </div>

                {/* Transcript Display */}
                {(reflectionInput || isRecordingReflection) && (
                  <div className="w-full space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Live Transcript Preview</p>
                    <textarea 
                      value={reflectionInput}
                      onChange={(e) => setReflectionInput(e.target.value)}
                      placeholder={isRecordingReflection ? "Please speak clearly, your voice is being transcribed..." : "Type or edit your reflection here..."}
                      className="w-full h-32 p-4 bg-brand-depth/40 border border-white/5 rounded-2xl text-slate-200 placeholder:text-slate-600 text-xs md:text-sm focus:outline-none focus:border-brand-primary/30 resize-none font-medium leading-relaxed"
                    />
                  </div>
                )}

                {reflectionInput && !isRecordingReflection && (
                  <button 
                    onClick={analyzeReflection}
                    disabled={isAnalyzingReflection || !reflectionInput.trim()}
                    className="w-full py-4 bg-brand-primary text-brand-depth font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-primary/25 flex items-center justify-center gap-2"
                  >
                    {isAnalyzingReflection ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Analyzing Spiritual Resonance...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Analyze & Suggest Verses
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Currently suggested verses display */}
              {reflectionVerses.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary flex items-center gap-2">
                    <Sparkles size={14} /> Divine Suggestions for Your Day
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {reflectionVerses.map((verse, idx) => (
                      <div key={idx} className="glass-panel p-6 rounded-3xl border-white/5 space-y-4 relative overflow-hidden bg-brand-sidebar/10">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          <span>Surah {verse.surahName} • {verse.surah}:{verse.ayah}</span>
                        </div>
                        <p className="text-right text-lg md:text-xl font-arabic text-white leading-loose font-bold tracking-wide">
                          {verse.text}
                        </p>
                        <div className="space-y-1">
                          <p className="text-xs text-brand-primary italic leading-relaxed font-semibold">
                            "{verse.translation}"
                          </p>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-medium pt-2 border-t border-white/5">
                            {verse.relevance}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Reflections Section */}
              <div className="space-y-4 pt-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Past Spiritual Milestones</h4>
                {isReflectionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-brand-primary" size={24} />
                  </div>
                ) : reflections.length === 0 ? (
                  <div className="text-center py-10 opacity-30 glass-panel rounded-3xl border-white/5">
                    <History size={32} className="mx-auto mb-3" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Your journal is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reflections.map((ref, idx) => (
                      <div key={ref.id || idx} className="glass-panel p-6 rounded-3xl border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {ref.createdAt ? new Date(ref.createdAt.seconds ? ref.createdAt.seconds * 1000 : ref.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Spiritual Moment'}
                          </span>
                          <span className="text-[8px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full border border-brand-primary/20 uppercase">Reflection Journal</span>
                        </div>
                        <p className="text-xs md:text-sm text-slate-200 leading-relaxed italic font-medium">
                          "{ref.text}"
                        </p>
                        
                        {ref.verses && ref.verses.length > 0 && (
                          <div className="border-t border-white/5 pt-4 space-y-4">
                            <p className="text-[9px] font-black uppercase tracking-wider text-brand-primary">Suggested Verses:</p>
                            <div className="space-y-3">
                              {ref.verses.map((v: any, vIdx: number) => (
                                <div key={vIdx} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase">
                                    <span>{v.surahName} ({v.surah}:{v.ayah})</span>
                                  </div>
                                  <p className="text-right text-sm font-arabic text-white font-bold leading-relaxed">{v.text}</p>
                                  <p className="text-[11px] text-brand-primary italic font-medium">"{v.translation}"</p>
                                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed pt-1">{v.relevance}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {isSpeaking && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 px-6 py-3 bg-brand-primary text-brand-depth rounded-full shadow-2xl flex items-center gap-3 font-bold text-xs ring-4 ring-brand-primary/20 z-30"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1 h-3 bg-brand-depth/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            Sanctuary is speaking...
            <button onClick={stopSpeech} className="p-1 px-2 border border-brand-depth/20 hover:bg-brand-depth/10 rounded-lg transition-colors ml-2 uppercase text-[8px] font-black">
              Stop
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
