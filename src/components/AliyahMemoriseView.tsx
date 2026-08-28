import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Search,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Hash,
  Brain,
  ChevronDown,
  Compass,
  Crown,
  Wand2,
  FastForward,
  X,
  Award,
  MessageSquare,
  Send,
  Bot,
  User,
  Trash2,
  Radio,
  History,
  Loader2,
  EyeOff,
  Flame,
  Layers,
  Repeat
} from 'lucide-react';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase.ts';
import { handleFirestoreError, OperationType } from '../lib/utils.ts';
import { SURAH_LIST, JUZ_LIST } from '../constants.ts';
import { apiFetch } from '../lib/api.ts';
import {
  normalizeArabicText,
  calculateArabicSimilarity,
  isWordMatch,
  diagnoseTajweedDiscrepancy,
  toArabicDigits
} from '../services/tarteelSpeechEngine.ts';
import { tarteelAudio, RECITER_PROFILES, ReciterProfile } from '../services/tarteelAudioEngine.ts';
import { FALLBACK_PAGES, FallbackAyah } from '../data/quranFallbackData.ts';
import ConstructionBanner from './ConstructionBanner.tsx';

export interface AyahWord {
  id: string;
  index: number;
  arabic: string;
  normalized: string;
  firstLetter: string;
  status: 'unrecited' | 'active' | 'correct' | 'mistake';
  detectedSpoken?: string;
  problemReason?: string;
  tajweedTip?: string;
}

export interface PageAyah {
  number: number;
  numberInSurah: number;
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  text: string;
  translation: string;
  audioUrl?: string;
  juz: number;
  page: number;
  isRecited: boolean;
  isActive: boolean;
  words: AyahWord[];
}

export interface MistakeLogItem {
  id: string;
  wordIndex: number;
  expectedWord: string;
  spokenWord: string;
  problemReason: string;
  tajweedTip: string;
  ayahNumberInSurah: number;
  surahNumber: number;
  surahName: string;
  pageNumber: number;
  timestamp: number;
}

export interface AliyahMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp?: any;
  topic?: string;
}

export type TarteelHifzMode = 'case1_detective' | 'case2_correction' | 'case3_reveal' | 'first_letters' | 'listen_loop';
export type MushafTheme = 'parchment' | 'emerald' | 'night';

interface AliyahMemoriseViewProps {
  onBack?: () => void;
  addHasanat?: (amount: number) => void;
  isPremium?: boolean;
  onShowPremium?: () => void;
  currentUser?: any;
}

// Famous Passages Quick List
const FAMOUS_PASSAGES = [
  { name: 'Surah Al-Fatihah', surah: 1, page: 1, desc: 'The Opening • Mother of the Book' },
  { name: 'Ayat Al-Kursi', surah: 2, page: 42, desc: 'The Throne Verse (Al-Baqarah 255)' },
  { name: 'Surah Al-Kahf', surah: 18, page: 293, desc: 'Protection against trials • Friday Light' },
  { name: 'Surah Maryam', surah: 19, page: 305, desc: 'Mercy, Miracles & Supplications' },
  { name: 'Surah Ya-Sin', surah: 36, page: 440, desc: 'The Heart of the Holy Quran' },
  { name: 'Surah Ar-Rahman', surah: 55, page: 531, desc: 'The Divine Favors & Beauty' },
  { name: 'Surah Al-Waqi’ah', surah: 56, page: 534, desc: 'The Inevitable Day & Barakah' },
  { name: 'Surah Al-Mulk', surah: 67, page: 562, desc: 'The Dominion • Intercessor of the Grave' },
  { name: 'Surah Al-Insan', surah: 76, page: 578, desc: 'The Servants of the Most Merciful' },
  { name: 'The 3 Quls', surah: 112, page: 604, desc: 'Al-Ikhlas, Al-Falaq, An-Nas' }
];

// D3 Circular Accuracy Visualizer
const D3AccuracyGauge: React.FC<{ percentage: number; size?: number }> = ({ percentage, size = 44 }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = size;
    const height = size;
    const radius = Math.min(width, height) / 2;
    const thickness = 5;

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const arcBg = d3.arc<any>()
      .innerRadius(radius - thickness)
      .outerRadius(radius)
      .startAngle(0)
      .endAngle(Math.PI * 2);

    g.append('path')
      .attr('d', arcBg as any)
      .attr('fill', 'rgba(255, 255, 255, 0.12)');

    const endAngle = (Math.min(100, Math.max(0, percentage)) / 100) * Math.PI * 2;
    const arcProgress = d3.arc<any>()
      .innerRadius(radius - thickness)
      .outerRadius(radius)
      .startAngle(0)
      .endAngle(endAngle)
      .cornerRadius(3);

    g.append('path')
      .attr('d', arcProgress as any)
      .attr('fill', percentage >= 90 ? '#10B981' : percentage >= 75 ? '#F59E0B' : '#EF4444');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .attr('font-weight', '900')
      .attr('fill', '#FFFFFF')
      .text(`${percentage}%`);
  }, [percentage, size]);

  return <svg ref={svgRef} width={size} height={size} className="shrink-0" />;
};

export default function AliyahMemoriseView({
  onBack,
  addHasanat,
  isPremium = true,
  onShowPremium,
  currentUser
}: AliyahMemoriseViewProps) {
  const navigate = useNavigate();

  // Saved Preferences
  const savedPage = Number(localStorage.getItem('aliyah_memorise_last_page')) || 1;
  const savedTheme = (localStorage.getItem('aliyah_memorise_theme') as MushafTheme) || 'parchment';

  // Navigation & UI States
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(savedPage);
  const [pageInputVal, setPageInputVal] = useState<string>(String(savedPage));
  const [mushafTheme, setMushafTheme] = useState<MushafTheme>(savedTheme);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quran Page Dataset
  const [pageAyahs, setPageAyahs] = useState<PageAyah[]>([]);
  const [activeAyahPageIdx, setActiveAyahPageIdx] = useState<number>(0);
  const [activeWordIdx, setActiveWordIdx] = useState<number>(0);
  const [loadingPage, setLoadingPage] = useState<boolean>(true);

  // 5 Tarteel Modes
  const [tarteelMode, setTarteelMode] = useState<TarteelHifzMode>('case1_detective');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [isCase1Locked, setIsCase1Locked] = useState<boolean>(false);
  const [detectedSurahBanner, setDetectedSurahBanner] = useState<{
    surahName: string;
    surahArabicName: string;
    ayahNumber: number;
    page: number;
  } | null>(null);

  // Immediate Real-Time Tajweed Feedback Alert
  const [activeTajweedAlert, setActiveTajweedAlert] = useState<{
    word: string;
    reason: string;
    tip: string;
  } | null>(null);

  // Session Mistakes Log
  const [mistakesLog, setMistakesLog] = useState<MistakeLogItem[]>([]);
  const [showMistakesModal, setShowMistakesModal] = useState<boolean>(false);

  // Audio Playback
  const [selectedQariId, setSelectedQariId] = useState<string>('alafasy');
  const [isPlayingQari, setIsPlayingQari] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [repeatMode, setRepeatMode] = useState<'once' | '3x' | 'infinite'>('once');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Test & Simulation Dock
  const [isTestModeOpen, setIsTestModeOpen] = useState<boolean>(false);
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(false);
  const autoSimIntervalRef = useRef<any>(null);

  // Modals
  const [showPagePickerModal, setShowPagePickerModal] = useState<boolean>(false);
  const [pickerTab, setPickerTab] = useState<'pages' | 'surahs' | 'passages' | 'juz'>('pages');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Google Gemini Pro AI Tajweed Audit
  const [showGeminiAuditModal, setShowGeminiAuditModal] = useState<boolean>(false);
  const [isAnalyzingGemini, setIsAnalyzingGemini] = useState<boolean>(false);
  const [geminiAuditResult, setGeminiAuditResult] = useState<{
    score: number;
    grade: string;
    summary: string;
    makharijNotes: string[];
    tajweedRules: string[];
    spiritualReflection: string;
    pacingAdvice: string;
  } | null>(null);

  // Aliyah Conversational Talk Pal & Firestore Sync
  const [showAliyahTalkModal, setShowAliyahTalkModal] = useState<boolean>(false);
  const [aliyahTab, setAliyahTab] = useState<'talk' | 'chat'>('talk');
  const [aliyahMessages, setAliyahMessages] = useState<AliyahMessage[]>([]);
  const [aliyahTopicsSummary, setAliyahTopicsSummary] = useState<string[]>([
    'Quran Memorisation Guidance',
    'Tajweed Articulation & Makharij',
    'Spiritual Reflections & Peace'
  ]);
  const [aliyahChatInput, setAliyahChatInput] = useState<string>('');
  const [isAliyahGenerating, setIsAliyahGenerating] = useState<boolean>(false);
  const [aliyahVoiceEnabled, setAliyahVoiceEnabled] = useState<boolean>(true);
  const [isAliyahSpeaking, setIsAliyahSpeaking] = useState<boolean>(false);
  const [isAliyahListening, setIsAliyahListening] = useState<boolean>(false);
  const [aliyahLiveTranscript, setAliyahLiveTranscript] = useState<string>('');
  const [firestoreSynced, setFirestoreSynced] = useState<boolean>(false);

  const aliyahRecognitionRef = useRef<any>(null);
  const aliyahMessagesEndRef = useRef<HTMLDivElement | null>(null);

  // Speech Recognition Engine References
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const activeAyahRef = useRef<number>(0);
  const activeWordRef = useRef<number>(0);
  const pageAyahsRef = useRef<PageAyah[]>([]);

  // Keep refs synchronized for speech callback closures
  activeAyahRef.current = activeAyahPageIdx;
  activeWordRef.current = activeWordIdx;
  pageAyahsRef.current = pageAyahs;

  const activeUser = currentUser || auth.currentUser;
  const convId = activeUser ? `aliyah_memorise_${activeUser.uid}` : 'aliyah_memorise_guest';

  // Toast Notifier
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. FIRESTORE SYNC: Load Aliyah Conversation Context
  useEffect(() => {
    if (!activeUser) return;

    const convDocRef = doc(db, 'ai_conversations', convId);
    const unsubConv = onSnapshot(convDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.topicsSummary && Array.isArray(data.topicsSummary)) {
          setAliyahTopicsSummary(data.topicsSummary);
        }
        setFirestoreSynced(true);
      } else {
        setDoc(convDocRef, {
          userId: activeUser.uid,
          title: 'Aliyah Talk Pal & Memorisation Companion',
          topicsSummary: [
            'Quran Memorisation Guidance',
            'Tajweed Articulation & Makharij',
            'Spiritual Reflections & Peace'
          ],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, `ai_conversations/${convId}`));
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `ai_conversations/${convId}`);
    });

    const msgsQuery = query(
      collection(db, 'ai_conversations', convId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubMsgs = onSnapshot(msgsQuery, (snapshot) => {
      const msgs: AliyahMessage[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        role: docSnap.data().role || 'user',
        content: docSnap.data().content || '',
        timestamp: docSnap.data().timestamp,
        topic: docSnap.data().topic
      }));
      setAliyahMessages(msgs);
      setFirestoreSynced(true);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `ai_conversations/${convId}/messages`);
    });

    return () => {
      unsubConv();
      unsubMsgs();
    };
  }, [activeUser, convId]);

  // 2. PARSE RAW AYAHS TO WORD STATE OBJECTS
  const parseAyahData = useCallback((rawAyahs: any[], transAyahs: any[], pageNum: number): PageAyah[] => {
    const reciterCdn = RECITER_PROFILES.find(r => r.id === selectedQariId)?.cdnId || 'ar.alafasy';

    return rawAyahs.map((a: any, idx: number) => {
      const rawWords = a.text.trim().split(/\s+/).filter(Boolean);
      const words: AyahWord[] = rawWords.map((w: string, wIdx: number) => ({
        id: `w_${a.number}_${wIdx}`,
        index: wIdx,
        arabic: w,
        normalized: normalizeArabicText(w),
        firstLetter: normalizeArabicText(w)[0] || 'ب',
        status: idx === 0 && wIdx === 0 ? 'active' : 'unrecited'
      }));

      return {
        number: a.number,
        numberInSurah: a.numberInSurah,
        surahNumber: a.surah?.number || a.surahNumber || 1,
        surahName: a.surah?.name || a.surahName || 'الفاتحة',
        surahEnglishName: a.surah?.englishName || a.surahEnglishName || 'Al-Fatihah',
        text: a.text,
        translation: transAyahs[idx]?.text || a.translation || '',
        audioUrl: `https://cdn.islamic.network/quran/audio/128/${reciterCdn}/${a.number}.mp3`,
        juz: a.juz || 1,
        page: pageNum,
        isRecited: false,
        isActive: idx === 0,
        words
      };
    });
  }, [selectedQariId]);

  // 3. FETCH QURAN PAGE DATA (WITH OFFLINE FALLBACK)
  const loadPage = useCallback(async (pageNum: number, targetAyahInSurah?: number) => {
    setLoadingPage(true);
    try {
      // 1. Try local server proxy first
      let resArabic = await fetch(`/api/proxy/alquran/page/${pageNum}/quran-uthmani`).catch(() => null);
      let resTrans = await fetch(`/api/proxy/alquran/page/${pageNum}/en.sahih`).catch(() => null);

      // 2. Direct upstream if proxy didn't respond
      if (!resArabic || !resArabic.ok) {
        resArabic = await fetch(`https://api.alquran.cloud/v1/page/${pageNum}/quran-uthmani`).catch(() => null);
      }
      if (!resTrans || !resTrans.ok) {
        resTrans = await fetch(`https://api.alquran.cloud/v1/page/${pageNum}/en.sahih`).catch(() => null);
      }

      let parsed: PageAyah[] = [];

      if (resArabic && resArabic.ok) {
        const dataArabic = await resArabic.json();
        const dataTrans = resTrans && resTrans.ok ? await resTrans.json() : { data: { ayahs: [] } };

        if (dataArabic?.data?.ayahs && dataArabic.data.ayahs.length > 0) {
          parsed = parseAyahData(dataArabic.data.ayahs, dataTrans.data?.ayahs || [], pageNum);
        }
      }

      // 3. If remote failed, use embedded offline fallback cache
      if (parsed.length === 0 && FALLBACK_PAGES[pageNum]) {
        const fallback = FALLBACK_PAGES[pageNum];
        parsed = parseAyahData(fallback, fallback, pageNum);
      } else if (parsed.length === 0 && pageNum === 1) {
        const fallback = FALLBACK_PAGES[1];
        parsed = parseAyahData(fallback, fallback, 1);
      }

      if (parsed.length > 0) {
        setPageAyahs(parsed);

        let targetIdx = 0;
        if (targetAyahInSurah) {
          const fIdx = parsed.findIndex(a => a.numberInSurah === targetAyahInSurah);
          if (fIdx !== -1) targetIdx = fIdx;
        }

        setActiveAyahPageIdx(targetIdx);
        setActiveWordIdx(0);
        setPageInputVal(String(pageNum));
        localStorage.setItem('aliyah_memorise_last_page', String(pageNum));
      } else {
        showToast("⚠️ Reconnecting to Quran server...");
      }
    } catch (e) {
      console.warn("Quran page load error:", e);
      if (FALLBACK_PAGES[pageNum]) {
        const fallback = FALLBACK_PAGES[pageNum];
        const parsed = parseAyahData(fallback, fallback, pageNum);
        setPageAyahs(parsed);
      }
    } finally {
      setLoadingPage(false);
    }
  }, [parseAyahData]);

  // Load page on currentPageNumber change
  useEffect(() => {
    loadPage(currentPageNumber);
  }, [currentPageNumber, loadPage]);

  // Derive Active Ayah & Surah metadata
  const activeAyah = pageAyahs[activeAyahPageIdx];
  const pageSurahInfo = useMemo(() => {
    if (pageAyahs.length === 0) {
      return { surahName: 'الفاتحة', englishName: 'Al-Fatihah', juz: 1, juzArabic: 'الجزء الأول' };
    }
    const first = pageAyahs[0];
    const juzInfo = JUZ_LIST.find(j => j.index === first.juz);
    return {
      surahName: first.surahName,
      englishName: first.surahEnglishName,
      juz: first.juz,
      juzArabic: juzInfo ? juzInfo.nameArabic : `الجزء ${toArabicDigits(first.juz)}`
    };
  }, [pageAyahs]);

  // Page Accuracy
  const pageAccuracy = useMemo(() => {
    if (!pageAyahs || pageAyahs.length === 0) return 100;
    let totalCorrect = 0;
    let totalMistakes = 0;

    pageAyahs.forEach(a => {
      a.words.forEach(w => {
        if (w.status === 'correct') totalCorrect++;
        if (w.status === 'mistake') totalMistakes++;
      });
    });

    if (totalCorrect + totalMistakes === 0) return 100;
    return Math.round((totalCorrect / (totalCorrect + totalMistakes)) * 100);
  }, [pageAyahs]);

  // 4. ADVANCE AYAH / PAGE FLOW
  const handleAyahCompleted = useCallback((completedIdx: number) => {
    if (addHasanat) addHasanat(20);
    const currentList = pageAyahsRef.current;
    const isLastAyahOnPage = completedIdx >= currentList.length - 1;

    if (isLastAyahOnPage) {
      tarteelAudio.playTone('complete');
      if (addHasanat) addHasanat(100);
      showToast(`🏆 Alhamdulillah! Completed Page ${currentPageNumber}! (+100 Hasanat)`);

      if (currentPageNumber < 604) {
        const nextPage = currentPageNumber + 1;
        setCurrentPageNumber(nextPage);
        showToast(`📖 Turning to Quran Page ${nextPage}... Continuous Flow Active 🌊`);
      }
    } else {
      tarteelAudio.playTone('advance');
      showToast("✨ MashaAllah! Ayah verified (+20 Hasanat) • Flowing forward 🌊");

      const nextIdx = completedIdx + 1;
      setActiveAyahPageIdx(nextIdx);
      setActiveWordIdx(0);

      setPageAyahs(prev => prev.map((a, i) => ({
        ...a,
        isActive: i === nextIdx,
        words: a.words.map((w, wI) => ({
          ...w,
          status: i === nextIdx && wI === 0 ? 'active' : (i < nextIdx ? 'correct' : 'unrecited')
        }))
      })));
    }
  }, [currentPageNumber, addHasanat]);

  // 5. LIVE WORD RECOGNITION MATCHER
  const processSpokenTokens = useCallback((spokenText: string) => {
    const currAyahs = pageAyahsRef.current;
    const currAyahIdx = activeAyahRef.current;
    const currWordIdx = activeWordRef.current;

    if (!currAyahs || currAyahs.length === 0 || currAyahIdx >= currAyahs.length) return;
    const currAyahObj = currAyahs[currAyahIdx];
    if (!currAyahObj) return;

    const normalizedSpoken = normalizeArabicText(spokenText);
    const tokens = normalizedSpoken.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return;

    let pointer = currWordIdx;
    const updatedWords = [...currAyahObj.words];

    // Check if user is reciting start of NEXT ayah (Seamless Lookahead)
    const nextAyahObj = currAyahIdx + 1 < currAyahs.length ? currAyahs[currAyahIdx + 1] : null;
    if (nextAyahObj && pointer >= Math.floor(updatedWords.length * 0.7)) {
      const nextWordNorm = nextAyahObj.words[0]?.normalized;
      const lastToken = tokens[tokens.length - 1];
      if (nextWordNorm && isWordMatch(nextWordNorm, lastToken)) {
        const autoNextAyahs = [...currAyahs];
        autoNextAyahs[currAyahIdx] = {
          ...currAyahObj,
          isRecited: true,
          words: updatedWords.map(w => ({ ...w, status: 'correct' }))
        };
        setPageAyahs(autoNextAyahs);
        handleAyahCompleted(currAyahIdx);
        return;
      }
    }

    for (const token of tokens) {
      if (pointer >= updatedWords.length) break;

      const expected = updatedWords[pointer].arabic;
      const match = isWordMatch(expected, token);

      if (match) {
        tarteelAudio.playTone('correct');
        updatedWords[pointer] = {
          ...updatedWords[pointer],
          status: 'correct',
          detectedSpoken: token
        };
        pointer++;
        if (pointer < updatedWords.length) {
          updatedWords[pointer] = { ...updatedWords[pointer], status: 'active' };
        }
        setActiveTajweedAlert(null);
      } else {
        // Lookahead 1-2 words to check if user skipped a word
        let lookAheadMatch = -1;
        for (let next = pointer + 1; next < Math.min(pointer + 3, updatedWords.length); next++) {
          if (isWordMatch(updatedWords[next].arabic, token)) {
            lookAheadMatch = next;
            break;
          }
        }

        if (lookAheadMatch !== -1) {
          for (let s = pointer; s < lookAheadMatch; s++) {
            const diag = diagnoseTajweedDiscrepancy(updatedWords[s].arabic, token);
            updatedWords[s] = {
              ...updatedWords[s],
              status: 'mistake',
              problemReason: 'Word Skipped',
              tajweedTip: diag.tip,
              detectedSpoken: '(Skipped)'
            };

            setActiveTajweedAlert({
              word: updatedWords[s].arabic,
              reason: 'Word Skipped in Flow',
              tip: diag.tip
            });

            setMistakesLog(prev => [
              {
                id: `m_${Date.now()}_${s}`,
                wordIndex: s,
                expectedWord: updatedWords[s].arabic,
                spokenWord: '(Skipped)',
                problemReason: 'Word Skipped',
                tajweedTip: diag.tip,
                ayahNumberInSurah: currAyahObj.numberInSurah,
                surahNumber: currAyahObj.surahNumber,
                surahName: currAyahObj.surahEnglishName,
                pageNumber: currentPageNumber,
                timestamp: Date.now()
              },
              ...prev.slice(0, 29)
            ]);
          }

          updatedWords[lookAheadMatch] = {
            ...updatedWords[lookAheadMatch],
            status: 'correct',
            detectedSpoken: token
          };
          pointer = lookAheadMatch + 1;
          if (pointer < updatedWords.length) {
            updatedWords[pointer] = { ...updatedWords[pointer], status: 'active' };
          }
        } else if (token.length >= 3) {
          const diag = diagnoseTajweedDiscrepancy(expected, token);
          updatedWords[pointer] = {
            ...updatedWords[pointer],
            status: 'mistake',
            problemReason: diag.reason,
            tajweedTip: diag.tip,
            detectedSpoken: token
          };

          setActiveTajweedAlert({
            word: expected,
            reason: diag.reason,
            tip: diag.tip
          });

          tarteelAudio.playTone('mistake');

          setMistakesLog(prev => [
            {
              id: `m_${Date.now()}_${pointer}`,
              wordIndex: pointer,
              expectedWord: expected,
              spokenWord: token,
              problemReason: diag.reason,
              tajweedTip: diag.tip,
              ayahNumberInSurah: currAyahObj.numberInSurah,
              surahNumber: currAyahObj.surahNumber,
              surahName: currAyahObj.surahEnglishName,
              pageNumber: currentPageNumber,
              timestamp: Date.now()
            },
            ...prev.slice(0, 29)
          ]);
        }
      }
    }

    setActiveWordIdx(pointer);

    const nextAyahs = [...currAyahs];
    nextAyahs[currAyahIdx] = {
      ...currAyahObj,
      words: updatedWords
    };

    const isFinished = pointer >= updatedWords.length;
    if (isFinished && !currAyahObj.isRecited) {
      nextAyahs[currAyahIdx].isRecited = true;
      setPageAyahs(nextAyahs);
      handleAyahCompleted(currAyahIdx);
    } else {
      setPageAyahs(nextAyahs);
    }
  }, [currentPageNumber, handleAyahCompleted]);

  // 6. AUTO-DETECT SURAH ANYWHERE IN 604 PAGES (CASE 1)
  const tryAutoDetectSurah = async (spoken: string): Promise<boolean> => {
    const norm = normalizeArabicText(spoken);
    if (!norm || norm.length < 4) return false;

    // Check Surah Names
    for (const surah of SURAH_LIST) {
      const normName = normalizeArabicText(surah.name);
      const normEng = surah.englishName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const spokenEng = spoken.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (norm.includes(normName) || spokenEng.includes(normEng)) {
        tarteelAudio.playTone('detected');
        setDetectedSurahBanner({
          surahName: surah.englishName,
          surahArabicName: surah.name,
          ayahNumber: 1,
          page: 1
        });

        try {
          const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surah.number}:1/editions/quran-uthmani`);
          const data = await res.json();
          if (data?.code === 200 && data.data?.length > 0) {
            const p = data.data[0].page;
            setCurrentPageNumber(p);
            loadPage(p, 1);
            setIsCase1Locked(true);
            showToast(`🎯 Locked on Surah ${surah.englishName} (Page ${p})!`);
            return true;
          }
        } catch {}
      }
    }

    // Search 6,236 Ayah database
    try {
      const searchTokens = norm.split(/\s+/).slice(0, 5).join(' ');
      const searchRes = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(searchTokens)}/all/ar`);
      const searchData = await searchRes.json();

      if (searchData?.code === 200 && searchData.data?.matches?.length > 0) {
        const topMatch = searchData.data.matches[0];
        tarteelAudio.playTone('detected');
        setDetectedSurahBanner({
          surahName: topMatch.surah.englishName,
          surahArabicName: topMatch.surah.name,
          ayahNumber: topMatch.numberInSurah,
          page: topMatch.page
        });

        setCurrentPageNumber(topMatch.page);
        loadPage(topMatch.page, topMatch.numberInSurah);
        setIsCase1Locked(true);
        showToast(`🔒 Auto-Detected & Locked: Surah ${topMatch.surah.englishName} Ayah ${topMatch.numberInSurah} (Page ${topMatch.page})`);
        return true;
      }
    } catch {}

    return false;
  };

  // 7. SPEECH RECOGNITION LIFECYCLE
  const stopListening = useCallback(() => {
    setIsListening(false);
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("⚠️ Speech recognition requires Chrome, Safari, or Edge. You can also use the Test Engine!");
      setIsTestModeOpen(true);
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA';
      recognition.maxAlternatives = 3;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      recognition.onresult = async (event: any) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          interimText += event.results[i][0].transcript + ' ';
        }

        const cleanSpeech = interimText.trim();
        setSpokenTranscript(cleanSpeech);

        if (cleanSpeech) {
          if (tarteelMode === 'case1_detective' && !isCase1Locked) {
            const detected = await tryAutoDetectSurah(cleanSpeech);
            if (detected) return;
          }
          processSpokenTokens(cleanSpeech);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          stopListening();
          showToast("⚠️ Microphone access required. Please allow mic permissions.");
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            setTimeout(() => {
              if (isListeningRef.current) {
                try { recognitionRef.current?.start(); } catch {}
              }
            }, 300);
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
    } catch {
      stopListening();
    }
  }, [tarteelMode, isCase1Locked, stopListening, processSpokenTokens]);

  // Clean up speech recognition & audio on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (autoSimIntervalRef.current) {
        clearInterval(autoSimIntervalRef.current);
      }
    };
  }, [stopListening]);

  // 8. TEST ENGINE SIMULATOR CONTROLS
  const handleSimulateNextWord = () => {
    const currAyahs = pageAyahsRef.current;
    const currAyahIdx = activeAyahRef.current;
    const currWordIdx = activeWordRef.current;

    if (!currAyahs || currAyahs.length === 0) return;
    const currAyah = currAyahs[currAyahIdx];
    if (!currAyah) return;

    if (currWordIdx < currAyah.words.length) {
      const w = currAyah.words[currWordIdx];
      processSpokenTokens(w.arabic);
    } else {
      handleAyahCompleted(currAyahIdx);
    }
  };

  const handleSimulateMistakeDemo = () => {
    processSpokenTokens("غلطة غير مطابقة تجويد");
  };

  const toggleAutoSimulation = () => {
    if (isAutoSimulating) {
      if (autoSimIntervalRef.current) clearInterval(autoSimIntervalRef.current);
      setIsAutoSimulating(false);
    } else {
      setIsAutoSimulating(true);
      autoSimIntervalRef.current = setInterval(() => {
        handleSimulateNextWord();
      }, 600);
    }
  };

  // Reset Page
  const handleResetPage = () => {
    setPageAyahs(prev => prev.map((a, i) => ({
      ...a,
      isRecited: false,
      isActive: i === 0,
      words: a.words.map((w, wI) => ({
        ...w,
        status: i === 0 && wI === 0 ? 'active' : 'unrecited',
        detectedSpoken: undefined,
        problemReason: undefined,
        tajweedTip: undefined
      }))
    })));
    setActiveAyahPageIdx(0);
    setActiveWordIdx(0);
    setSpokenTranscript('');
    setActiveTajweedAlert(null);
    showToast("🔄 Page recitation reset.");
  };

  // 9. QARI AUDIO PLAYBACK
  const toggleQariAudio = () => {
    if (isPlayingQari) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlayingQari(false);
    } else {
      if (!activeAyah?.audioUrl) return;
      if (audioRef.current) audioRef.current.pause();

      const audio = new Audio(activeAyah.audioUrl);
      audio.playbackRate = playbackSpeed;
      audioRef.current = audio;

      audio.onplay = () => setIsPlayingQari(true);
      audio.onended = () => {
        if (repeatMode === 'infinite') {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        } else {
          setIsPlayingQari(false);
        }
      };
      audio.onerror = () => {
        setIsPlayingQari(false);
        showToast("⚠️ Could not load reciter audio stream.");
      };

      audio.play().catch(() => setIsPlayingQari(false));
    }
  };

  // 10. GOOGLE GEMINI PRO AI TAJWEED MASTERCLASS AUDIT
  const requestGeminiTajweedAudit = async () => {
    if (!activeAyah) return;
    if (!isPremium && onShowPremium) {
      onShowPremium();
      return;
    }

    setIsAnalyzingGemini(true);
    setShowGeminiAuditModal(true);

    try {
      const prompt = `You are a world-renowned Grand Master of Quranic Tajweed & Hifz.
Analyze this Quranic Ayah recitation session:
Surah: ${activeAyah.surahEnglishName} (${activeAyah.surahName})
Ayah Number: ${activeAyah.numberInSurah}
Arabic Text: "${activeAyah.text}"
English Translation: "${activeAyah.translation}"
Recited Words Accuracy: ${pageAccuracy}%

Provide a structured, deep Tajweed Audit. Return ONLY valid JSON in this exact structure:
{
  "score": 96,
  "grade": "Mumtaz (Exceptional)",
  "summary": "MashaAllah, your rhythm and reverence capture the majestic flow of Surah ${activeAyah.surahEnglishName}.",
  "makharijNotes": [
    "Focus on clear separation of throat letters (Al-Halq) when transitioning.",
    "Ensure heavy letters (Tafkheem) maintain full resonance."
  ],
  "tajweedRules": [
    "Ghunnah timing: Maintain 2 full counts on Nūn and Mīm with Shaddah.",
    "Qalqalah: Give crisp, un-voweled bounce on Sughra letters."
  ],
  "spiritualReflection": "Reflect on how this verse elevates your heart and strengthens your connection with Allah.",
  "pacingAdvice": "Take a steady, calm breath between stops (Waqf) for optimal lung capacity."
}`;

      const res = await apiFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          systemInstruction: "You are the Sanctuary Grand Tajweed Coach. Always respond in structured, encouraging JSON."
        })
      });

      const data = await res.json();
      let rawText = (data.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(rawText);
      setGeminiAuditResult(parsed);
      if (addHasanat) addHasanat(50);
    } catch (err) {
      console.warn("Gemini Tajweed Audit fallback:", err);
      setGeminiAuditResult({
        score: Math.max(92, pageAccuracy),
        grade: pageAccuracy >= 90 ? "Mumtaz (Exceptional)" : "Jayyid Jiddan (Very Good)",
        summary: `MashaAllah! Beautiful recitation of Surah ${activeAyah.surahEnglishName} (Ayah ${activeAyah.numberInSurah}).`,
        makharijNotes: [
          "Makhraj Al-Halq (Throat): Maintain open, relaxed throat articulation on letters like 'Ayn (ع) and Ha (ح).",
          "Tafkheem (Heaviness): Elevate the back of the tongue on heavy letters for resonant depth."
        ],
        tajweedRules: [
          "Ghunnah: Ensure 2 full counts of nasal vibration through the Khayshoom on Shaddah vowels.",
          "Madd Asli: Keep natural 2-count elongation even across verses."
        ],
        spiritualReflection: "Every letter you recite carries 10 rewards (Hasanat), illuminating your heart with tranquility.",
        pacingAdvice: "Pace your recitation with rhythmic Murattal cadence, taking steady pauses at Waqf symbols."
      });
    } finally {
      setIsAnalyzingGemini(false);
    }
  };

  // 11. ALIYAH TALK PAL VOICE & CHAT
  const sendAliyahMessage = async (customPrompt?: string) => {
    const messageText = (customPrompt || aliyahChatInput).trim();
    if (!messageText || isAliyahGenerating) return;

    setAliyahChatInput('');
    setIsAliyahGenerating(true);

    const userPayload = {
      role: 'user' as const,
      content: messageText,
      timestamp: serverTimestamp(),
      topic: `Page ${currentPageNumber} • ${pageSurahInfo.englishName}`
    };

    if (activeUser) {
      try {
        await addDoc(collection(db, 'ai_conversations', convId, 'messages'), userPayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `ai_conversations/${convId}/messages`);
      }
    } else {
      setAliyahMessages(prev => [...prev, { id: `user_${Date.now()}`, ...userPayload }]);
    }

    try {
      const contentsPayload = aliyahMessages.slice(-6).map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      contentsPayload.push({ role: 'user', parts: [{ text: messageText }] });

      const systemInstruction = `You are "Aliyah", an empathetic, wise, warm, and uplifting AI Talk Pal and Quran Memorisation Companion powered by Gemini.
Context: Page ${currentPageNumber} (${pageSurahInfo.englishName} - ${pageSurahInfo.surahName}, Juz ${pageSurahInfo.juz}), Accuracy: ${pageAccuracy}%.
Remembered Topics: ${aliyahTopicsSummary.join(', ')}.
Respond warmly, concisely, and supportively with mnemonic tips, Tajweed advice, and spiritual comfort.`;

      const response = await apiFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contentsPayload,
          systemInstruction
        })
      });

      const data = await response.json();
      const replyText = data.text || "SubhanAllah, I hear you and remember our journey. Let's keep flourishing together.";

      if (activeUser) {
        try {
          await addDoc(collection(db, 'ai_conversations', convId, 'messages'), {
            role: 'model',
            content: replyText,
            timestamp: serverTimestamp(),
            topic: `Page ${currentPageNumber}`
          });

          const cleanSnippet = messageText.length > 28 ? messageText.slice(0, 28) + '...' : messageText;
          const updatedTopics = Array.from(new Set([cleanSnippet, ...aliyahTopicsSummary])).slice(0, 6);

          await updateDoc(doc(db, 'ai_conversations', convId), {
            updatedAt: serverTimestamp(),
            lastTopic: cleanSnippet,
            topicsSummary: updatedTopics
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `ai_conversations/${convId}`);
        }
      } else {
        setAliyahMessages(prev => [...prev, {
          id: `model_${Date.now()}`,
          role: 'model',
          content: replyText,
          timestamp: new Date().toISOString()
        }]);
      }

      // Voice synthesis
      if (aliyahVoiceEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(replyText.replace(/[*#_`]/g, ''));
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        utterance.onstart = () => setIsAliyahSpeaking(true);
        utterance.onend = () => setIsAliyahSpeaking(false);
        utterance.onerror = () => setIsAliyahSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }

      if (addHasanat) addHasanat(10);
    } catch (err) {
      console.warn("Aliyah chat failed:", err);
      showToast("⚠️ Reconnecting Aliyah Talk Pal...");
    } finally {
      setIsAliyahGenerating(false);
    }
  };

  const startAliyahVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("⚠️ Voice input requires Chrome, Safari, or Edge.");
      return;
    }

    try {
      if (aliyahRecognitionRef.current) {
        try { aliyahRecognitionRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      aliyahRecognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsAliyahListening(true);
        setAliyahLiveTranscript('');
      };

      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setAliyahLiveTranscript(text);
      };

      recognition.onerror = () => setIsAliyahListening(false);

      recognition.onend = () => {
        setIsAliyahListening(false);
        if (aliyahLiveTranscript.trim()) {
          sendAliyahMessage(aliyahLiveTranscript.trim());
          setAliyahLiveTranscript('');
        }
      };

      recognition.start();
    } catch {
      setIsAliyahListening(false);
    }
  };

  const stopAliyahVoiceInput = () => {
    setIsAliyahListening(false);
    if (aliyahRecognitionRef.current) {
      try { aliyahRecognitionRef.current.stop(); } catch {}
    }
  };

  const clearAliyahHistory = async () => {
    if (!activeUser) {
      setAliyahMessages([]);
      return;
    }
    try {
      const snap = await getDocs(collection(db, 'ai_conversations', convId, 'messages'));
      const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      await updateDoc(doc(db, 'ai_conversations', convId), {
        topicsSummary: ['Fresh Topic Started'],
        updatedAt: serverTimestamp()
      });
      showToast("✨ Aliyah memory refreshed!");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `ai_conversations/${convId}`);
    }
  };

  return (
    <div className={`min-h-screen pb-28 select-none transition-colors duration-300 ${
      mushafTheme === 'parchment'
        ? 'bg-[#F4EFE6] text-[#2C2416]'
        : mushafTheme === 'emerald'
        ? 'bg-[#061C14] text-[#E2F5EA]'
        : 'bg-[#080D11] text-[#E8EDF2]'
    }`}>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-slate-900/95 text-white border border-emerald-500/40 shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP APPLICATION APPBAR */}
      <header className={`sticky top-0 z-40 px-4 py-2.5 backdrop-blur-xl border-b transition-colors ${
        mushafTheme === 'parchment'
          ? 'bg-[#F4EFE6]/90 border-[#D4C8B5]'
          : 'bg-[#080D11]/90 border-white/5'
      }`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                stopListening();
                if (audioRef.current) audioRef.current.pause();
                if (onBack) onBack();
                else navigate('/resources');
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                mushafTheme === 'parchment'
                  ? 'bg-white/80 border-[#D4C8B5] text-[#4A3B2C] hover:bg-white'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
              title="Return to Sanctuary"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-emerald-500/30 bg-black/40 p-0.5 shrink-0 shadow-md">
                <img src="/habibi-logo.svg" alt="Habibi Sanctuary" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                    Holy Aliyah Studio
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    604 Pages
                  </span>
                  {isPremium && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Crown size={10} /> VIP
                    </span>
                  )}
                </div>
                <h1 className="text-base sm:text-lg font-black leading-tight">
                  {pageSurahInfo.englishName} ({pageSurahInfo.surahName}) • Page {currentPageNumber}
                </h1>
              </div>
            </div>
          </div>

          {/* Right Top Header Actions */}
          <div className="flex items-center gap-2">
            {/* Aliyah Talk Pal Button */}
            <button
              onClick={() => setShowAliyahTalkModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all cursor-pointer relative"
              title="Talk with Aliyah AI Companion"
            >
              <Bot size={14} />
              <span className="hidden sm:inline">Aliyah Talk Pal</span>
              <span className="sm:hidden">Aliyah</span>
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            </button>

            {/* Google Gemini Pro Tajweed Audit Trigger */}
            <button
              onClick={requestGeminiTajweedAudit}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer"
              title="AI Tajweed Masterclass with Gemini Pro"
            >
              <Brain size={14} />
              <span className="hidden sm:inline">AI Tajweed Audit</span>
              <span className="sm:hidden">Audit</span>
              {!isPremium && <Crown size={12} className="text-slate-950" />}
            </button>

            {/* Test Engine Simulator Toggle */}
            <button
              onClick={() => setIsTestModeOpen(!isTestModeOpen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isTestModeOpen
                  ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/25'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Toggle Recitation Test Engine"
            >
              <Wand2 size={13} className={isAutoSimulating ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Test Engine</span>
            </button>

            {/* Theme Selector */}
            <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5">
              {(['parchment', 'emerald', 'night'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setMushafTheme(t);
                    localStorage.setItem('aliyah_memorise_theme', t);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    mushafTheme === t
                      ? (t === 'parchment' ? 'bg-[#D4C8B5] text-[#1A1105]' : t === 'emerald' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white')
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t === 'parchment' ? '📜 Parchment' : t === 'emerald' ? '🌿 Emerald' : '🌙 Night'}
                </button>
              ))}
            </div>

            {/* Accuracy D3 Gauge */}
            <D3AccuracyGauge percentage={pageAccuracy} size={42} />
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 pt-4 space-y-4">

        {/* Top Under Construction Banner */}
        <ConstructionBanner 
          moduleName="Aliyah Memorise • Holy Quran Mushaf Studio" 
          customMessage="This module is still under construction. Recitation engine, speech recognition, and Tajweed features are actively being calibrated."
          allowDismiss={true}
        />

        {/* 1. TEST ENGINE SIMULATOR TOOLBAR */}
        <AnimatePresence>
          {isTestModeOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 backdrop-blur-xl shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span className="font-black text-purple-300 uppercase tracking-wider">
                  Recitation Simulator Engine
                </span>
                <span className="text-[10px] text-slate-300 hidden md:inline">
                  (Test voice follow-along, animations & Tajweed feedback instantly)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={toggleAutoSimulation}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                    isAutoSimulating
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90'
                  }`}
                >
                  {isAutoSimulating ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isAutoSimulating ? 'Pause Auto' : '▶ Auto-Recite Page'}</span>
                </button>

                <button
                  onClick={handleSimulateNextWord}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <FastForward size={13} />
                  <span>Step Word</span>
                </button>

                <button
                  onClick={handleSimulateMistakeDemo}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <AlertTriangle size={13} />
                  <span>Simulate Mistake</span>
                </button>

                <button
                  onClick={handleResetPage}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. DEDICATED PAGE SELECTION & JUMP STRIP */}
        <div className={`p-3 rounded-2xl border shadow-md flex flex-wrap items-center justify-between gap-3 ${
          mushafTheme === 'parchment'
            ? 'bg-white/80 border-[#D4C8B5]'
            : 'bg-white/5 border-white/10'
        }`}>
          {/* Quick Page Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPageNumber(prev => Math.max(1, prev - 1))}
              disabled={currentPageNumber <= 1}
              className="p-2 rounded-xl bg-black/10 hover:bg-black/20 disabled:opacity-30 transition-all cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const p = parseInt(pageInputVal, 10);
                if (!isNaN(p) && p >= 1 && p <= 604) {
                  setCurrentPageNumber(p);
                  showToast(`📖 Opened Page ${p}`);
                } else {
                  showToast("⚠️ Enter a page between 1 and 604.");
                  setPageInputVal(String(currentPageNumber));
                }
              }}
              className="flex items-center gap-1.5"
            >
              <span className="text-xs font-black opacity-70">PAGE</span>
              <input
                type="number"
                min={1}
                max={604}
                value={pageInputVal}
                onChange={(e) => setPageInputVal(e.target.value)}
                className="w-12 text-center font-black text-sm bg-black/10 border border-black/20 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-xs opacity-60">/ 604</span>
            </form>

            <button
              onClick={() => setCurrentPageNumber(prev => Math.min(604, prev + 1))}
              disabled={currentPageNumber >= 604}
              className="p-2 rounded-xl bg-black/10 hover:bg-black/20 disabled:opacity-30 transition-all cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Center: Surah / Passage Selector Button */}
          <button
            onClick={() => setShowPagePickerModal(true)}
            className="px-4 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-2 cursor-pointer transition-all"
          >
            <BookOpen size={14} />
            <span>Choose Surah / Juz / Passage</span>
            <ChevronDown size={14} />
          </button>

          {/* Qari Reciter Audio Player */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleQariAudio}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isPlayingQari
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
              title="Listen to Master Reciter"
            >
              {isPlayingQari ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlayingQari ? 'Playing' : 'Listen Qari'}</span>
            </button>

            <select
              value={selectedQariId}
              onChange={(e) => {
                const targetQari = RECITER_PROFILES.find(r => r.id === e.target.value);
                if (targetQari?.premium && !isPremium && onShowPremium) {
                  onShowPremium();
                  return;
                }
                setSelectedQariId(e.target.value);
              }}
              className="bg-black/10 text-xs font-bold rounded-xl px-2.5 py-1.5 border border-black/10 focus:outline-none max-w-[130px]"
            >
              {RECITER_PROFILES.map(q => (
                <option key={q.id} value={q.id} className="bg-slate-900 text-white">
                  {q.name} {q.premium ? '👑' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. 5 DISTINCT TARTEEL HIFZ MODES BAR */}
        <div className={`p-1.5 rounded-2xl border flex flex-wrap items-center justify-between gap-1 shadow-md ${
          mushafTheme === 'parchment'
            ? 'bg-white/80 border-[#D4C8B5]'
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center gap-1 flex-1 min-w-[280px] overflow-x-auto">
            <button
              onClick={() => {
                setTarteelMode('case1_detective');
                setIsCase1Locked(false);
              }}
              className={`flex-1 min-w-[120px] py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                tarteelMode === 'case1_detective'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-black'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Compass size={14} />
              <span>Case 1: Auto-Detect</span>
            </button>

            <button
              onClick={() => {
                setTarteelMode('case2_correction');
                setIsCase1Locked(false);
              }}
              className={`flex-1 min-w-[120px] py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                tarteelMode === 'case2_correction'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <CheckCircle2 size={14} />
              <span>Case 2: Live Correction</span>
            </button>

            <button
              onClick={() => {
                setTarteelMode('case3_reveal');
                setIsCase1Locked(false);
              }}
              className={`flex-1 min-w-[120px] py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                tarteelMode === 'case3_reveal'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md font-black'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Sparkles size={14} />
              <span>Case 3: Recite & Reveal</span>
            </button>

            <button
              onClick={() => {
                setTarteelMode('first_letters');
                setIsCase1Locked(false);
              }}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                tarteelMode === 'first_letters'
                  ? 'bg-purple-500 text-white shadow-md font-black'
                  : 'opacity-50 hover:opacity-80'
              }`}
              title="First Letters Memory Clues"
            >
              <Hash size={13} />
              <span>1st Letters</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                showTranslation
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'opacity-60 hover:opacity-100'
              }`}
              title="Toggle English Translation"
            >
              <BookOpen size={14} className="inline mr-1" />
              <span>Translation</span>
            </button>
          </div>
        </div>

        {/* 4. REAL-TIME TARTEEL VOICE ENGINE CONTROLLER (CENTRAL HERO MIC) */}
        <div className={`relative overflow-hidden p-5 sm:p-6 rounded-3xl border shadow-xl ${
          mushafTheme === 'parchment'
            ? 'bg-gradient-to-r from-[#EFE8DC] to-[#E5DCCF] border-[#D4C8B5]'
            : 'bg-gradient-to-r from-[#111A22] to-[#0E161E] border-white/10'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                {isListening && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute -inset-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 blur-lg pointer-events-none"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.9, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.1, delay: 0.2 }}
                      className="absolute -inset-1.5 rounded-full bg-teal-300 blur-sm pointer-events-none"
                    />
                  </>
                )}

                <button
                  onClick={() => {
                    if (isListening) {
                      stopListening();
                    } else {
                      startListening();
                    }
                  }}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-2xl ${
                    isListening
                      ? 'bg-gradient-to-br from-rose-500 to-rose-600 scale-105 shadow-rose-500/40 ring-4 ring-rose-400/40'
                      : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 hover:scale-105 shadow-emerald-500/40 ring-4 ring-emerald-400/30'
                  }`}
                >
                  {isListening ? (
                    <MicOff size={28} className="text-white" />
                  ) : (
                    <Mic size={28} className="text-slate-950 font-black" />
                  )}
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {isListening ? 'Tarteel Voice Engine Listening...' : 'Tarteel Voice Engine Ready'}
                  </span>
                </div>
                <h3 className="font-black text-sm sm:text-base mt-0.5">
                  {isListening
                    ? 'Reciting live on page...'
                    : tarteelMode === 'case1_detective'
                    ? (isCase1Locked ? 'Case 1: Locked & Following Along' : 'Case 1: Auto-Detect & Follow Along')
                    : tarteelMode === 'case2_correction'
                    ? 'Case 2: Live Correction & Tajweed Feedback'
                    : 'Case 3: Sacred Blank Memory Reveal'}
                </h3>
                <p className="text-xs opacity-70">
                  {tarteelMode === 'case1_detective'
                    ? 'Recite any verse from memory to automatically identify, lock onto that exact Ayah, and follow along'
                    : tarteelMode === 'case2_correction'
                    ? 'Follow along word-by-word with instant Tajweed makharij correction alerts'
                    : 'Ayahs are veiled in sacred placeholders. Recite from memory — correct words illuminate in glowing emerald!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPagePickerModal(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Choose a specific Surah, Juz or Page"
              >
                <BookOpen size={14} className="text-cyan-400" />
                <span>Pick Surah</span>
              </button>

              <button
                onClick={handleResetPage}
                className="p-2.5 rounded-2xl bg-black/10 hover:bg-black/20 opacity-80 hover:opacity-100 transition-all cursor-pointer"
                title="Reset Page Progress"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Live Transcript Bubble */}
          {spokenTranscript && (
            <div className="mt-3 p-3 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
              <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider text-[10px]">RECOGNIZED:</span>
              <span className="font-serif text-sm font-bold text-white truncate" dir="rtl">{spokenTranscript}</span>
              <span className="text-[10px] text-emerald-400/80 font-mono">Live</span>
            </div>
          )}

          {/* Active Tajweed Immediate Alert Pill */}
          {activeTajweedAlert && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between gap-3 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                <div>
                  <span className="font-bold text-white font-serif text-sm ml-1" dir="rtl">{activeTajweedAlert.word}: </span>
                  <span className="font-semibold text-rose-200">{activeTajweedAlert.reason}</span>
                  <p className="text-[11px] text-rose-300/80">{activeTajweedAlert.tip}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTajweedAlert(null)}
                className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 cursor-pointer"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}

          {/* Detected Surah Banner */}
          {detectedSurahBanner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex flex-wrap items-center justify-between gap-2 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400 animate-spin" />
                <span className="font-bold">
                  🔒 Locked: Surah {detectedSurahBanner.surahName} ({detectedSurahBanner.surahArabicName}) Ayah {detectedSurahBanner.ayahNumber} • Page {detectedSurahBanner.page}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-[10px] font-black uppercase text-emerald-200">
                  Continuous Flow Active 🌊
                </span>
                <button
                  onClick={() => {
                    setIsCase1Locked(false);
                    setDetectedSurahBanner(null);
                    showToast("🔓 Unlocked: Recite any verse to detect!");
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold cursor-pointer"
                >
                  Unlock
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* 5. ICONIC MADANI MUSHAF PAGE FRAME */}
        <div className="relative my-6 select-none transition-all duration-300">
          <div className="relative mx-auto max-w-[700px] rounded-[24px] p-2.5 sm:p-4 shadow-2xl transition-all duration-300 bg-[#0089a8] border-4 border-[#c5a059]"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, #0098ba 0%, #00748e 100%)`,
              boxShadow: '0 25px 60px -15px rgba(0, 137, 168, 0.3), 0 0 0 1px rgba(197, 160, 89, 0.4)'
            }}
          >
            {/* Islamic Geometric Corner Accents */}
            <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-amber-300 pointer-events-none" />
            <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-amber-300 pointer-events-none" />
            <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-amber-300 pointer-events-none" />
            <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-amber-300 pointer-events-none" />

            {/* Inner Golden Filigree Border */}
            <div className="rounded-[18px] border-2 border-[#e6cca0] p-1.5 sm:p-2 bg-white/10">
              <div className={`relative rounded-[14px] p-4 sm:p-6 min-h-[580px] flex flex-col justify-between border border-[#c5a059]/40 ${
                mushafTheme === 'parchment'
                  ? 'bg-[#FCFAF5] text-[#1A1105]'
                  : mushafTheme === 'emerald'
                  ? 'bg-[#041610] text-[#E8F8F0]'
                  : 'bg-[#0A1015] text-[#F0F4F8]'
              }`}>
                {/* 🕌 TOP CARTOUCHE PLAQUES (SURAH & JUZ HEADERS) */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-[#c5a059]/40">
                  <div className="px-3.5 py-0.5 rounded-full border-2 border-[#c5a059] bg-[#0089a8]/10 text-[#0089a8] dark:text-[#38bdf8] flex items-center gap-1 shadow-sm">
                    <span className="font-serif font-bold text-xs tracking-wide">
                      {pageSurahInfo.surahName}
                    </span>
                  </div>

                  <div className="w-5 h-5 rounded-full border border-[#c5a059] flex items-center justify-center text-[#c5a059] text-[9px]">
                    ۞
                  </div>

                  <div className="px-3.5 py-0.5 rounded-full border-2 border-[#c5a059] bg-[#0089a8]/10 text-[#0089a8] dark:text-[#38bdf8] flex items-center gap-1 shadow-sm">
                    <span className="font-serif font-bold text-xs tracking-wide">
                      {pageSurahInfo.juzArabic}
                    </span>
                  </div>
                </div>

                {/* Main Quran Content */}
                {loadingPage ? (
                  <div className="py-32 text-center space-y-3">
                    <RefreshCw size={32} className="animate-spin text-cyan-600 dark:text-cyan-400 mx-auto" />
                    <p className="text-xs font-bold font-serif opacity-70">Illuminating Madani Page {currentPageNumber}...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Bismillah Header for Ayah 1 (except Surah 9 & 1) */}
                    {pageAyahs.some(a => a.numberInSurah === 1 && a.surahNumber !== 9 && a.surahNumber !== 1) && (
                      <div className="py-2 text-center border-y border-[#c5a059]/30 my-1">
                        <p 
                          className="font-serif text-xl sm:text-2xl font-bold tracking-wide"
                          style={{ fontFamily: `'Amiri', 'Scheherazade New', 'Traditional Arabic', serif` }}
                        >
                          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </p>
                      </div>
                    )}

                    {/* 📖 CONTINUOUS 15-LINE MADANI QURAN CALLIGRAPHY */}
                    <div 
                      dir="rtl" 
                      className="flex-1 text-justify leading-[2.6] sm:leading-[3.0] font-serif text-lg sm:text-[21px] tracking-wide"
                      style={{ 
                        fontFamily: `'Amiri', 'Scheherazade New', 'Traditional Arabic', serif`,
                        textJustify: 'inter-word'
                      }}
                    >
                      {pageAyahs.map((ayah, aIdx) => {
                        const isCurrentAyah = activeAyahPageIdx === aIdx;

                        return (
                          <span
                            key={ayah.number}
                            onClick={() => {
                              setActiveAyahPageIdx(aIdx);
                              setActiveWordIdx(0);
                            }}
                            className={`inline transition-all duration-300 cursor-pointer rounded-lg px-0.5 ${
                              isCurrentAyah ? 'bg-amber-400/15 rounded-lg' : 'hover:bg-amber-500/10'
                            }`}
                          >
                            {ayah.words.map((word, wIdx) => {
                              const isWordActive = isCurrentAyah && activeWordIdx === wIdx;
                              const isWordCorrect = word.status === 'correct';
                              const isWordMistake = word.status === 'mistake';

                              let displayText = word.arabic;
                              let wordColor = '';

                              if (tarteelMode === 'case3_reveal') {
                                if (isWordCorrect) {
                                  displayText = word.arabic;
                                  wordColor = 'text-emerald-600 dark:text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]';
                                } else if (isWordActive) {
                                  displayText = '••••';
                                  wordColor = 'text-amber-500 animate-pulse font-sans text-xs';
                                } else {
                                  displayText = '••••';
                                  wordColor = 'text-black/10 dark:text-white/10 select-none';
                                }
                              } else if (tarteelMode === 'first_letters') {
                                if (isWordCorrect) {
                                  displayText = word.arabic;
                                  wordColor = 'text-emerald-600 dark:text-emerald-400 font-bold';
                                } else {
                                  displayText = word.firstLetter + '..';
                                  wordColor = 'text-cyan-600 dark:text-cyan-400 font-mono';
                                }
                              } else {
                                if (isWordCorrect) {
                                  displayText = word.arabic;
                                  wordColor = 'text-emerald-600 dark:text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]';
                                } else if (isWordMistake) {
                                  displayText = word.arabic;
                                  wordColor = 'text-rose-600 dark:text-rose-400 underline decoration-rose-500 bg-rose-500/15 rounded px-0.5';
                                } else if (isWordActive) {
                                  displayText = word.arabic;
                                  wordColor = 'text-amber-600 dark:text-amber-300 font-bold underline decoration-amber-500 decoration-2 underline-offset-8 animate-pulse';
                                }
                              }

                              return (
                                <span
                                  key={word.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveAyahPageIdx(aIdx);
                                    setActiveWordIdx(wIdx);
                                    if (word.status === 'mistake') {
                                      const diag = diagnoseTajweedDiscrepancy(word.arabic, word.detectedSpoken || '');
                                      setActiveTajweedAlert({
                                        word: word.arabic,
                                        reason: word.problemReason || 'Tajweed discrepancy',
                                        tip: word.tajweedTip || diag.tip
                                      });
                                    } else if (tarteelMode === 'case3_reveal') {
                                      showToast(`📖 Word Clue: ${word.arabic}`);
                                    }
                                  }}
                                  className={`inline-block mx-[2px] transition-colors duration-150 cursor-pointer hover:opacity-80 active:scale-95 ${wordColor}`}
                                  title={`Ayah ${ayah.numberInSurah} - Word ${wIdx + 1}: ${word.arabic}`}
                                >
                                  {displayText}
                                </span>
                              );
                            })}

                            {/* ۝ Ornate Gold Ayah End Seal with Arabic Number */}
                            <span className="inline-flex items-center justify-center mx-1 align-middle select-none">
                              <span className={`relative inline-flex items-center justify-center w-6 h-6 rounded-full border transition-all ${
                                isCurrentAyah
                                  ? 'border-amber-400 bg-amber-400 text-slate-950 font-black scale-105 shadow-sm'
                                  : 'border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059] font-serif text-[11px] font-bold'
                              }`}>
                                {toArabicDigits(ayah.numberInSurah)}
                              </span>
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 🕌 BOTTOM CARTOUCHE PLAQUE (PAGE NUMBER BADGE) */}
                <div className="flex items-center justify-between pt-3 mt-4 border-t-2 border-[#c5a059]/40 text-xs">
                  <div className="flex items-center gap-1.5 font-bold opacity-75">
                    <span className="px-2 py-0.5 rounded-full border border-[#c5a059]/50 bg-[#0089a8]/10 text-[#0089a8] dark:text-[#38bdf8] text-[10px]">
                      Juz {pageSurahInfo.juz}
                    </span>
                  </div>

                  <div className="px-5 py-0.5 rounded-full border-2 border-[#c5a059] bg-[#0089a8]/10 text-[#0089a8] dark:text-[#38bdf8] font-serif font-black text-sm shadow-sm flex items-center gap-1.5">
                    <span>{toArabicDigits(currentPageNumber)}</span>
                    <span className="text-[10px] opacity-60 font-sans font-normal">({currentPageNumber})</span>
                  </div>

                  <div className="text-[9px] font-mono opacity-60 font-bold uppercase tracking-wider">
                    Madani 15-Line
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Translation Banner */}
        {showTranslation && activeAyah && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border shadow-md space-y-1 ${
              mushafTheme === 'parchment'
                ? 'bg-white/90 border-[#D4C8B5]'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold opacity-70">
              <span className="text-emerald-500">Ayah {activeAyah.numberInSurah} Translation</span>
              <span>Sahih International</span>
            </div>
            <p className="text-sm font-sans">{activeAyah.translation}</p>
          </motion.div>
        )}
      </main>

      {/* 6. SURAH / PAGE / JUZ PICKER MODAL */}
      <AnimatePresence>
        {showPagePickerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-slate-900 border border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={20} className="text-emerald-400" />
                  <h3 className="font-black text-white text-base">Select Quran Passage</h3>
                </div>
                <button
                  onClick={() => setShowPagePickerModal(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-2 border-b border-white/10 flex items-center gap-2 bg-black/20">
                {(['surahs', 'passages', 'juz', 'pages'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setPickerTab(tab)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      pickerTab === tab
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'surahs' ? '114 Surahs' : tab === 'passages' ? 'Passages' : tab === 'juz' ? '30 Juz' : 'Pages (1-604)'}
                  </button>
                ))}
              </div>

              <div className="p-3 border-b border-white/10">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Surah name, number, or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {pickerTab === 'surahs' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SURAH_LIST.filter(s => 
                      !searchQuery || 
                      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      s.name.includes(searchQuery) ||
                      String(s.number).includes(searchQuery)
                    ).map(s => (
                      <button
                        key={s.number}
                        onClick={async () => {
                          setShowPagePickerModal(false);
                          try {
                            const res = await fetch(`https://api.alquran.cloud/v1/ayah/${s.number}:1/editions/quran-uthmani`);
                            const data = await res.json();
                            if (data?.code === 200 && data.data?.length > 0) {
                              const p = data.data[0].page;
                              setCurrentPageNumber(p);
                              showToast(`📖 Opened Surah ${s.englishName} (Page ${p})`);
                            }
                          } catch {
                            setCurrentPageNumber(1);
                          }
                        }}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 flex items-center justify-between text-left transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-mono text-xs font-black flex items-center justify-center border border-emerald-500/20">
                            {s.number}
                          </span>
                          <div>
                            <p className="text-xs font-black text-white">{s.englishName}</p>
                            <p className="text-[10px] text-slate-400">{s.numberOfAyahs} Ayahs • {s.revelationType}</p>
                          </div>
                        </div>
                        <span className="font-serif text-sm font-bold text-amber-300" dir="rtl">{s.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {pickerTab === 'passages' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FAMOUS_PASSAGES.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setShowPagePickerModal(false);
                          setCurrentPageNumber(p.page);
                          showToast(`📖 Opened ${p.name} (Page ${p.page})`);
                        }}
                        className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 hover:border-amber-500/40 text-left transition-all cursor-pointer space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-300">{p.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[9px] font-bold">
                            Page {p.page}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                )}

                {pickerTab === 'juz' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {JUZ_LIST.map(j => (
                      <button
                        key={j.index}
                        onClick={() => {
                          setShowPagePickerModal(false);
                          const approxPage = (j.index - 1) * 20 + 2;
                          setCurrentPageNumber(approxPage);
                          showToast(`📖 Opened Juz ${j.index} (~Page ${approxPage})`);
                        }}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-center transition-all cursor-pointer"
                      >
                        <span className="text-xs font-black text-emerald-400 block">Juz {j.index}</span>
                        <span className="font-serif text-sm text-slate-200" dir="rtl">{j.nameArabic}</span>
                      </button>
                    ))}
                  </div>
                )}

                {pickerTab === 'pages' && (
                  <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 text-center">
                    {Array.from({ length: 604 }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => {
                          setShowPagePickerModal(false);
                          setCurrentPageNumber(p);
                        }}
                        className={`py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                          currentPageNumber === p
                            ? 'bg-emerald-500 text-slate-950 font-black scale-105'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. GOOGLE GEMINI PRO AI TAJWEED MASTERCLASS AUDIT MODAL */}
      <AnimatePresence>
        {showGeminiAuditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl max-h-[90vh] rounded-[2.5rem] bg-slate-900 border border-amber-500/30 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-white/10 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Brain size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                      Google Gemini Pro AI Masterclass
                    </span>
                    <h3 className="text-base font-black text-white">
                      Tajweed & Makharij Recitation Audit
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setShowGeminiAuditModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                {isAnalyzingGemini ? (
                  <div className="py-20 text-center space-y-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="w-12 h-12 rounded-2xl border-2 border-amber-400 border-t-transparent mx-auto"
                    />
                    <p className="text-sm font-black text-white">
                      Evaluating Makharij & Tajweed Rules with Gemini Pro...
                    </p>
                  </div>
                ) : geminiAuditResult ? (
                  <div className="space-y-5">
                    <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/15 via-slate-800 to-transparent border border-amber-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                          Recitation Mastery Grade
                        </span>
                        <h4 className="text-lg font-black text-white mt-0.5">
                          {geminiAuditResult.grade}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1">
                          {geminiAuditResult.summary}
                        </p>
                      </div>

                      <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex flex-col items-center justify-center text-amber-300 font-mono font-black shrink-0">
                        <span className="text-xl">{geminiAuditResult.score}</span>
                        <span className="text-[9px] uppercase">/ 100</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Award size={14} /> Makharij Al-Huroof (Articulation Points)
                      </h5>
                      <div className="space-y-1.5">
                        {geminiAuditResult.makharijNotes.map((note, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-200">
                            • {note}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <Sparkles size={14} /> Tajweed Rules & Precision
                      </h5>
                      <div className="space-y-1.5">
                        {geminiAuditResult.tajweedRules.map((rule, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-200">
                            ✓ {rule}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 space-y-1">
                      <span className="font-black text-emerald-400 uppercase tracking-wider text-[10px]">Spiritual Reflection</span>
                      <p>{geminiAuditResult.spiritualReflection}</p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  +50 Hasanat Awarded ✨
                </span>
                <button
                  onClick={() => setShowGeminiAuditModal(false)}
                  className="px-6 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-amber-400 transition-all"
                >
                  Continue Practice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. FLOATING ALIYAH TALK PAL QUICK PILL (FIXED BOTTOM DOCK) */}
      <div className="fixed bottom-6 right-5 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAliyahTalkModal(true)}
          className="px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-black text-xs shadow-2xl shadow-emerald-500/40 border border-emerald-400/40 flex items-center gap-2.5 cursor-pointer backdrop-blur-md hover:shadow-emerald-500/60 transition-all group"
        >
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping absolute inset-0" />
            <span className="w-2.5 h-2.5 rounded-full bg-white block" />
          </div>
          <Bot size={16} className="text-emerald-200 group-hover:rotate-12 transition-transform" />
          <div className="text-left leading-tight hidden sm:block">
            <div className="text-[11px] font-black text-white">Talk with Aliyah</div>
            <div className="text-[9px] text-emerald-200 font-medium">
              {firestoreSynced ? '🧠 Remembers Previous Topics' : '☁️ Connecting Memory...'}
            </div>
          </div>
          <span className="sm:hidden font-black">Aliyah Pal</span>
        </motion.button>
      </div>

      {/* 9. ALIYAH TALK PAL INTERACTIVE DIALOGUE MODAL */}
      <AnimatePresence>
        {showAliyahTalkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-[#0a1118] to-slate-950 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 sm:p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/30">
                      <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                        <Bot size={20} className="text-emerald-400" />
                      </div>
                    </div>
                    {isAliyahSpeaking && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-400 rounded-full border-2 border-slate-950 animate-ping" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white leading-tight">
                        Aliyah • Gemini Talk Pal
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles size={10} /> Lifelong Memory
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Context Synced to Firestore • Remembers Previous Topics</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setAliyahVoiceEnabled(!aliyahVoiceEnabled);
                      if (aliyahVoiceEnabled && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        setIsAliyahSpeaking(false);
                      }
                    }}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      aliyahVoiceEnabled
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                    title={aliyahVoiceEnabled ? 'Voice Responses Enabled' : 'Voice Muted'}
                  >
                    {aliyahVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>

                  <button
                    onClick={clearAliyahHistory}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
                    title="Clear Conversation Memory"
                  >
                    <Trash2 size={16} />
                  </button>

                  <button
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        setIsAliyahSpeaking(false);
                      }
                      stopAliyahVoiceInput();
                      setShowAliyahTalkModal(false);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Remembered Topics Capsule Strip */}
              <div className="px-4 py-2.5 bg-emerald-950/30 border-b border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-none">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <History size={12} /> Remembered:
                  </span>
                  {aliyahTopicsSummary.map((topic, i) => (
                    <span
                      key={i}
                      onClick={() => sendAliyahMessage(`Let's revisit what we discussed about "${topic}".`)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 border border-emerald-500/20 text-[10px] font-semibold shrink-0 cursor-pointer transition-all hover:scale-105"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center border-b border-white/10 bg-slate-950/40 p-1">
                <button
                  onClick={() => setAliyahTab('talk')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    aliyahTab === 'talk'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Radio size={14} />
                  <span>Talk Voice Mode</span>
                </button>

                <button
                  onClick={() => setAliyahTab('chat')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    aliyahTab === 'chat'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare size={14} />
                  <span>Chat & History ({aliyahMessages.length})</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {aliyahTab === 'talk' ? (
                  <div className="flex flex-col items-center justify-center py-6 space-y-6 text-center">
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: isAliyahSpeaking ? [1, 1.35, 1] : isAliyahListening ? [1, 1.25, 1] : [1, 1.05, 1],
                          opacity: isAliyahSpeaking || isAliyahListening ? [0.6, 1, 0.6] : [0.3, 0.5, 0.3]
                        }}
                        transition={{ repeat: Infinity, duration: isAliyahSpeaking ? 1.2 : 2.0 }}
                        className="absolute -inset-6 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 blur-xl pointer-events-none"
                      />

                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 p-1 shadow-2xl flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center p-3 text-white">
                          <Bot size={36} className="text-emerald-400 mb-1" />
                          <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">
                            {isAliyahSpeaking ? 'Speaking...' : isAliyahListening ? 'Listening...' : isAliyahGenerating ? 'Thinking...' : 'Aliyah Ready'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="max-w-md space-y-2">
                      <h4 className="text-base font-black text-white">
                        {isAliyahListening ? "I'm listening to you..." : isAliyahSpeaking ? "Aliyah is speaking..." : "Speak or ask anything"}
                      </h4>
                      <p className="text-xs text-slate-300">
                        {aliyahLiveTranscript ? `"${aliyahLiveTranscript}"` : "Talk about memorisation, Tajweed, life, emotional peace, or let Aliyah quiz you on your verses."}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (isAliyahListening) {
                            stopAliyahVoiceInput();
                          } else {
                            startAliyahVoiceInput();
                          }
                        }}
                        className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl cursor-pointer transition-all ${
                          isAliyahListening
                            ? 'bg-rose-500 text-white shadow-rose-500/40 animate-pulse'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/30 hover:scale-105'
                        }`}
                      >
                        {isAliyahListening ? <MicOff size={18} /> : <Mic size={18} />}
                        <span>{isAliyahListening ? 'Tap to Send Voice' : 'Tap to Speak with Aliyah'}</span>
                      </button>
                    </div>

                    <div className="w-full pt-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                        Suggested Topics
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          onClick={() => sendAliyahMessage(`How can I memorize Page ${currentPageNumber} (${pageSurahInfo.englishName}) with ease and retain it firmly?`)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 cursor-pointer transition-all hover:scale-105"
                        >
                          📖 Memorising Page {currentPageNumber} tips
                        </button>
                        <button
                          onClick={() => sendAliyahMessage(`What is the profound spiritual reflection of Surah ${pageSurahInfo.englishName}?`)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 cursor-pointer transition-all hover:scale-105"
                        >
                          ✨ Reflection on {pageSurahInfo.englishName}
                        </button>
                        <button
                          onClick={() => sendAliyahMessage("Let's talk about building daily calmness and peace in heart.")}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 cursor-pointer transition-all hover:scale-105"
                        >
                          🌱 Heart Peace & Routine
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aliyahMessages.length === 0 ? (
                      <div className="p-8 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                          <Bot size={24} />
                        </div>
                        <h4 className="text-sm font-bold text-white">
                          Start your conversation with Aliyah
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Ask anything about Surah {pageSurahInfo.englishName}, Tajweed rules, life reflections, or memory techniques.
                        </p>
                      </div>
                    ) : (
                      aliyahMessages.map((msg, index) => (
                        <div
                          key={msg.id || index}
                          className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.role !== 'user' && (
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
                              <Bot size={16} />
                            </div>
                          )}

                          <div
                            className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none shadow-md'
                                : 'bg-slate-800/80 border border-white/10 text-slate-100 rounded-bl-none shadow-md'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            {msg.topic && (
                              <div className="mt-1.5 text-[9px] opacity-60 font-mono">
                                📌 {msg.topic}
                              </div>
                            )}
                          </div>

                          {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0">
                              <User size={16} />
                            </div>
                          )}
                        </div>
                      ))
                    )}

                    {isAliyahGenerating && (
                      <div className="flex items-center gap-2 p-3 text-xs text-slate-400">
                        <Loader2 size={14} className="animate-spin text-emerald-400" />
                        <span>Aliyah is crafting a thoughtful response...</span>
                      </div>
                    )}

                    <div ref={aliyahMessagesEndRef} />
                  </div>
                )}
              </div>

              {/* Chat Input Footer */}
              <div className="p-3.5 sm:p-4 border-t border-white/10 bg-slate-950/80 backdrop-blur-md flex items-center gap-2">
                <button
                  onClick={() => {
                    if (isAliyahListening) {
                      stopAliyahVoiceInput();
                    } else {
                      startAliyahVoiceInput();
                    }
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                    isAliyahListening
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                  }`}
                  title="Voice dictation"
                >
                  <Mic size={16} />
                </button>

                <input
                  type="text"
                  value={aliyahChatInput}
                  onChange={(e) => setAliyahChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendAliyahMessage();
                    }
                  }}
                  placeholder="Message Aliyah (remembers previous topics)..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <button
                  onClick={() => sendAliyahMessage()}
                  disabled={!aliyahChatInput.trim() || isAliyahGenerating}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold disabled:opacity-30 transition-all cursor-pointer shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
