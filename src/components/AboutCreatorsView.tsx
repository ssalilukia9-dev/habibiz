import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Sparkles,
  Users,
  Code2,
  BookOpen,
  Shield,
  Star,
  Globe,
  Mail,
  Send,
  CheckCircle2,
  Award,
  Compass,
  MessageCircle,
  Share2,
  ArrowLeft,
  Flame,
  ExternalLink,
  Layers,
  GraduationCap,
  MapPin,
  Building2,
  TrendingUp,
  HandHeart,
  Quote,
  Lightbulb,
  Check,
  Droplets,
  Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FirdawsLogo from './FirdawsLogo';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface AboutCreatorsViewProps {
  onBack?: () => void;
  addHasanat?: (amount: number) => void;
}

export default function AboutCreatorsView({ onBack, addHasanat }: AboutCreatorsViewProps) {
  const navigate = useNavigate();
  const [copiedContact, setCopiedContact] = useState<string | null>(null);
  const [duasSent, setDuasSent] = useState<number>(() => {
    return Number(localStorage.getItem('sanctuary_creator_duas_sent') || '128');
  });
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSender, setSupportSender] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContact(label);
    setTimeout(() => setCopiedContact(null), 2500);
  };

  const handleSendDua = () => {
    const next = duasSent + 1;
    setDuasSent(next);
    localStorage.setItem('sanctuary_creator_duas_sent', String(next));
    if (addHasanat) addHasanat(15);
  };

  const handleShareStory = async () => {
    const shareText = "Meet Kizza Hamza & Lubowa Sudias — two young Ugandan students from Gombe Secondary School who created Muslim Habibi in partnership with Firdaws Charity Organisation. Built with purpose, faith, and young minds! ✨";
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Muslim Habibi - Creators Story',
          text: shareText,
          url: shareUrl
        });
      } catch {
        // Fallback
        handleCopy(`${shareText}\n${shareUrl}`, 'share');
      }
    } else {
      handleCopy(`${shareText}\n${shareUrl}`, 'share');
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 3000);
    }
  };

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    const senderName = supportSender.trim() || 'Anonymous Supporter';
    const msg = supportMessage.trim();

    try {
      await addDoc(collection(db, 'creator_messages'), {
        toEmail: 'ssalilukia9@gmail.com',
        senderName: senderName,
        message: msg,
        timestamp: serverTimestamp(),
        status: 'delivered'
      });
    } catch (err) {
      console.warn("Firestore message save warning:", err);
    }

    const localMessages = JSON.parse(localStorage.getItem('sanctuary_sent_feedback') || '[]');
    localMessages.unshift({
      toEmail: 'ssalilukia9@gmail.com',
      senderName,
      message: msg,
      date: new Date().toISOString()
    });
    localStorage.setItem('sanctuary_sent_feedback', JSON.stringify(localMessages.slice(0, 50)));

    setMessageSent(true);
    if (addHasanat) addHasanat(25);
  };

  const handleDirectEmailApp = () => {
    const subject = encodeURIComponent(`Encouragement & Collaboration for Muslim Habibi [${supportSender || 'Supporter'}]`);
    const body = encodeURIComponent(
      `Assalamu Alaikum Kizza Hamza & Lubowa Sudias,\n\n${supportMessage || 'I am reaching out regarding Muslim Habibi and your noble mission.'}\n\nFrom: ${supportSender || 'A Muslim Habibi user'}`
    );
    window.location.href = `mailto:ssalilukia9@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-12 pb-28 max-w-6xl mx-auto px-4 md:px-8 pt-4">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onBack ? onBack() : navigate(-1)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer group"
            title="Go back"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.35em]">The Vision Behind Muslim Habibi</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-bold">Gombe Secondary School, Uganda</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              About App Creators
              <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Young Visionaries
              </span>
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleShareStory}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-xs transition-all cursor-pointer"
          >
            <Share2 size={15} />
            <span>{sharedToast ? 'Story Copied!' : 'Share Story'}</span>
          </button>
          <button
            onClick={handleSendDua}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-brand-depth font-black text-xs shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Heart size={16} className="fill-brand-depth animate-pulse" />
            <span>Send Du'a for Creators ({duasSent})</span>
          </button>
        </div>
      </div>

      {/* Hero Dedication & Manifesto Banner */}
      <div className="relative overflow-hidden rounded-[3rem] p-8 md:p-14 bg-gradient-to-br from-amber-500/15 via-emerald-500/10 to-brand-sidebar border border-amber-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none -mt-32 -mr-32" />
        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-black uppercase tracking-widest">
            <Sparkles size={14} /> Created with Purpose. Built with Faith. Driven by Young Minds.
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Empowering the Global Ummah Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-300">Youth, Faith & Technology</span>.
          </h2>

          <p className="text-base md:text-lg text-slate-300 leading-relaxed font-normal">
            "As students, we believe that age should never be a limitation to having a vision, serving humanity, or using our talents to make a positive difference. Muslim Habibi is more than just an application to us — it is a vision, a learning journey, and a humble contribution toward a greater purpose."
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <Building2 size={16} className="text-amber-400" />
              <span>Gombe Secondary School, Uganda</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <GraduationCap size={16} className="text-emerald-400" />
              <span>Academic Session 2026–2027</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <Globe size={16} className="text-cyan-400" />
              <span>Serving Believers Worldwide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Creators Spotlight: Kizza Hamza & Lubowa Sudias */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Founders & Visionaries</span>
            <h3 className="text-2xl md:text-3xl font-black text-white">Meet The Young Creators</h3>
          </div>
          <span className="text-xs text-slate-400 font-bold hidden sm:inline">Uganda 🇺🇬 to the World 🌍</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Creator 1: Kizza Hamza */}
          <div className="glass-panel rounded-[3rem] p-8 md:p-10 border border-amber-500/30 bg-gradient-to-b from-brand-sidebar via-brand-depth to-black/80 shadow-2xl space-y-6 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              {/* Profile Top Bar */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Portrait Representation */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-400 p-0.5 shadow-xl shadow-amber-500/20 overflow-hidden">
                      <div className="w-full h-full bg-brand-depth rounded-[14px] flex flex-col items-center justify-center text-center p-2">
                        <span className="text-2xl font-black text-amber-400">KH</span>
                        <span className="text-[8px] font-mono text-emerald-400 uppercase">Creator</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-brand-depth font-black text-[10px] flex items-center justify-center shadow">
                      ★
                    </div>
                  </div>

                  <div>
                    <h4 className="text-2xl font-black text-white">Kizza Hamza</h4>
                    <p className="text-xs font-bold text-amber-400">Co-Creator & Lead Visionary</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin size={12} className="text-emerald-400" /> Gombe Secondary School, Uganda
                    </p>
                  </div>
                </div>
              </div>

              {/* Academic Combination & Focus */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <GraduationCap size={15} className="text-amber-400" /> Academic Combination:
                  </span>
                  <span className="text-amber-300 font-mono font-bold">2026–2027</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs">
                    Physics
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-xs">
                    Mathematics
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                    Economics
                  </span>
                </div>
              </div>

              {/* Bio & Vision */}
              <p className="text-sm text-slate-300 leading-relaxed">
                Driven by a deep passion for analytical thinking, mathematical precision, and Islamic technological empowerment. Hamza envisions Muslim Habibi as an all-in-one digital companion that bridges modern software engineering with traditional Islamic values.
              </p>

              {/* Quote */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border-l-4 border-amber-400 text-xs italic text-slate-300 flex items-start gap-2.5">
                <Quote size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <span>
                  "Our dream is to use technology to spread goodness, faith, knowledge, and opportunity across the world."
                </span>
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 relative z-10">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 size={14} /> Technology & Platform Architecture
              </span>
            </div>
          </div>

          {/* Creator 2: Lubowa Sudias */}
          <div className="glass-panel rounded-[3rem] p-8 md:p-10 border border-emerald-500/30 bg-gradient-to-b from-brand-sidebar via-brand-depth to-black/80 shadow-2xl space-y-6 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              {/* Profile Top Bar */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Portrait Representation */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 p-0.5 shadow-xl shadow-emerald-500/20 overflow-hidden">
                      <div className="w-full h-full bg-brand-depth rounded-[14px] flex flex-col items-center justify-center text-center p-2">
                        <span className="text-2xl font-black text-emerald-400">LS</span>
                        <span className="text-[8px] font-mono text-amber-400 uppercase">Creator</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-brand-depth font-black text-[10px] flex items-center justify-center shadow">
                      ★
                    </div>
                  </div>

                  <div>
                    <h4 className="text-2xl font-black text-white">Lubowa Sudias</h4>
                    <p className="text-xs font-bold text-emerald-400">Co-Creator & Strategic Lead</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin size={12} className="text-emerald-400" /> Gombe Secondary School, Uganda
                    </p>
                  </div>
                </div>
              </div>

              {/* Academic Combination & Focus */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <GraduationCap size={15} className="text-emerald-400" /> Academic Combination:
                  </span>
                  <span className="text-emerald-300 font-mono font-bold">2026–2027</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                    History
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold text-xs">
                    Economics
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs">
                    Entrepreneurship
                  </span>
                </div>
              </div>

              {/* Bio & Vision */}
              <p className="text-sm text-slate-300 leading-relaxed">
                Passionate about historical Islamic scholarship, socio-economic community growth, and ethical entrepreneurship. Sudias focuses on uniting communities, fostering an ethical Halal marketplace, and making spiritual journeys structured and accessible.
              </p>

              {/* Quote */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border-l-4 border-emerald-400 text-xs italic text-slate-300 flex items-start gap-2.5">
                <Quote size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  "With the support of Allah and people around us, Muslim Habibi will grow from a student initiative into a platform serving millions."
                </span>
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 relative z-10">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <CheckCircle2 size={14} /> Community, Strategy & Halal Commerce
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Core Mission & Platform Pillars */}
      <div className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Our Strategic Vision</span>
          <h3 className="text-2xl font-black text-white">What We Are Building Together</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Authentic Islamic Knowledge",
              desc: "Making it effortless for Muslims and seekers of knowledge worldwide to access authentic Quranic recitations, verified Hadiths, Duas, and Islamic history.",
              icon: BookOpen,
              color: "amber"
            },
            {
              title: "Hajj & Umrah Pilgrim Support",
              desc: "Providing interactive 3D simulations, real-time sacred map navigation, checklist guides, and rituals breakdown to enrich every pilgrim's sacred journey.",
              icon: Compass,
              color: "emerald"
            },
            {
              title: "Halal Marketplace & Opportunity",
              desc: "Creating an ethical commerce and networking hub where Muslim businesses, students, and creators can connect, trade, and discover opportunities.",
              icon: TrendingUp,
              color: "cyan"
            },
            {
              title: "Community Unity & Brotherhood",
              desc: "Fostering positive, honest, and respectful interaction among believers from diverse cultural and geographic backgrounds across the globe.",
              icon: Users,
              color: "purple"
            },
            {
              title: "Youth Inspiration & Purpose",
              desc: "Demonstrating that youth and students have the power to serve humanity, build technology with soul, and leave a lasting legacy for Allah.",
              icon: Lightbulb,
              color: "amber"
            },
            {
              title: "Privacy, Charity & Amanah",
              desc: "Operating 100% ad-free and privacy-first. Every feature is crafted with sincerity (Ikhlas) as a continuous source of beneficial knowledge (Sadaqah Jariyah).",
              icon: Shield,
              color: "emerald"
            }
          ].map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-[2rem] border border-white/10 hover:border-amber-500/30 transition-all space-y-3 bg-white/[0.02]">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
                  <Icon size={20} />
                </div>
                <h4 className="text-base font-black text-white">{pillar.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Humanitarian Partner: Firdaws Charity Organization */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel rounded-[3rem] p-8 md:p-12 border border-[#D4AF37]/40 bg-gradient-to-br from-[#063E33]/40 via-brand-sidebar to-brand-depth shadow-2xl relative overflow-hidden space-y-8"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D061] text-[10px] font-black uppercase tracking-widest">
              ★ Official Strategic Humanitarian Partner
            </div>
            <h3 className="text-3xl font-black text-white">
              Firdaws Charity Organisation
            </h3>
            <p className="text-sm text-emerald-300 font-medium italic">
              "Empowering Lives, Shaping Futures"
            </p>
          </div>

          <FirdawsLogo variant="full" size="lg" dark={true} className="bg-black/30 p-4 rounded-3xl border border-[#D4AF37]/30 backdrop-blur-md" />
        </div>

        {/* Partnership Story & Joint Initiatives */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-amber-300 flex items-center justify-center">
              <Droplets size={20} />
            </div>
            <h4 className="text-base font-black text-white">Clean Water Wells</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Funding solar-powered boreholes and clean water access across vulnerable rural communities in Uganda and East Africa.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Gift size={20} />
            </div>
            <h4 className="text-base font-black text-white">Orphan & Education Care</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Direct educational sponsorship, school supplies, Quranic memorization circles, and living support for orphans and vulnerable students.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Heart size={20} />
            </div>
            <h4 className="text-base font-black text-white">Halal Food Relief & Sadaqah</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ramadan food hampers, Qurbani distribution, and emergency family assistance, bringing tangible relief to the Ummah.
            </p>
          </div>
        </div>

        {/* Partner Quote */}
        <div className="p-5 rounded-2xl bg-[#063E33]/60 border border-[#D4AF37]/30 flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <HandHeart className="text-amber-400 w-6 h-6 shrink-0" />
            <p className="text-xs text-slate-200 leading-relaxed">
              In strong collaboration with Kizza Hamza and Lubowa Sudias, Firdaws Charity Organisation champions the next generation of humanitarian technologists.
            </p>
          </div>
          <button 
            onClick={() => navigate('/sanctuary')}
            className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49e28] text-brand-depth font-black text-xs transition-all cursor-pointer shadow-lg"
          >
            Join Global Chat Group
          </button>
        </div>
      </motion.div>

      {/* Direct Contact, Collaboration & Encouragement Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Support & Encouragement Form */}
        <div className="lg:col-span-7 glass-panel p-8 md:p-10 rounded-[3rem] border border-amber-500/25 bg-brand-sidebar/80 space-y-6 shadow-2xl">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Global Support & Feedback</span>
            <h3 className="text-2xl font-black text-white">Send Words of Encouragement to Kizza & Lubowa</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All messages and partnership proposals are securely dispatched directly to <span className="text-amber-400 font-mono font-bold">ssalilukia9@gmail.com</span>.
            </p>
          </div>

          {messageSent ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-white">Jazakum Allahu Khairan!</h4>
                <p className="text-xs text-emerald-300">
                  Your message has been sent to <span className="font-mono font-bold">ssalilukia9@gmail.com</span> with deep gratitude. +25 Hasanat added!
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleDirectEmailApp}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-brand-depth font-black text-xs flex items-center gap-2 hover:bg-emerald-400 transition-all cursor-pointer shadow-lg"
                >
                  <Mail size={14} />
                  <span>Open in Email App</span>
                </button>
                <button
                  onClick={() => setMessageSent(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/15 transition-all cursor-pointer"
                >
                  Send Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitSupport} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Your Name / Organization (Optional)</label>
                <input
                  type="text"
                  value={supportSender}
                  onChange={(e) => setSupportSender(e.target.value)}
                  placeholder="e.g. Brother Ahmad, Kampala / Sister Fatima, London"
                  className="w-full bg-white/5 border border-white/10 focus:border-amber-400 rounded-xl px-4 py-3 text-white text-xs outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Your Message / Du'a / Partnership Note</label>
                <textarea
                  required
                  rows={4}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Write a heartfelt du'a, advice for the young creators, or collaboration inquiry (sent to ssalilukia9@gmail.com)..."
                  className="w-full bg-white/5 border border-white/10 focus:border-amber-400 rounded-xl px-4 py-3 text-white text-xs outline-none transition-all resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-brand-depth font-black text-xs shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={15} />
                  <span>Send Message to ssalilukia9@gmail.com (+25 Hasanat)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDirectEmailApp}
                  className="py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
                  title="Open mail client directly"
                >
                  <Mail size={15} className="text-amber-400" />
                  <span>Email App</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Direct Channels & School Profile */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-8 rounded-[3rem] border border-white/10 bg-brand-sidebar/80 space-y-6 shadow-2xl">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Direct Communication</span>
              <h3 className="text-xl font-black text-white">Contact & Connect</h3>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleCopy('ssalilukia9@gmail.com', 'email')}
                className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Official Creators Email</p>
                    <p className="text-[11px] text-slate-400 font-mono">ssalilukia9@gmail.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-amber-400 uppercase">
                  {copiedContact === 'email' ? 'Copied! ✨' : 'Copy'}
                </span>
              </button>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">School & Academic Base</p>
                    <p className="text-[11px] text-slate-400">Gombe Secondary School, Uganda</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 pt-1 leading-relaxed border-t border-white/5">
                  Proudly rooted in Uganda's renowned secondary education hub, combining rigorous academic study with cutting-edge digital development.
                </p>
              </div>
            </div>
          </div>

          {/* Spiritual Quranic Blessing */}
          <div className="rounded-[3rem] p-8 bg-gradient-to-br from-amber-500/15 via-brand-depth to-black border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <HandHeart size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Quranic Supplication</span>
            </div>
            
            <p className="arabic-text text-lg text-amber-200 leading-relaxed text-right font-serif">
              "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ"
            </p>
            
            <p className="text-xs text-slate-300 italic">
              "Our Lord, accept this from us. Indeed You are the Hearing, the Knowing." (Surah Al-Baqarah 2:127)
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
