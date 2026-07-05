import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2, Copy, Check, Type, Sparkles, Image as ImageIcon, Eye, FileText, Smartphone } from 'lucide-react';
import { notificationService } from '../services/notificationService';

interface AyahToShare {
  number: number;
  numberInSurah: number;
  text: string;
  translation: string;
  surahName: string;
}

interface VerseShareModalProps {
  ayah: AyahToShare;
  onClose: () => void;
}

interface ThemePreset {
  id: string;
  name: string;
  background: string;
  accentColor: string;
  textColor: string;
  mutedColor: string;
  borderStyle: string;
  ornamentSvg: React.ReactNode;
  bgDecorations?: string;
}

export default function VerseShareModal({ ayah, onClose }: VerseShareModalProps) {
  const [activeTheme, setActiveTheme] = useState<string>('twilight');
  const [arabicFontSize, setArabicFontSize] = useState<number>(36);
  const [englishFontSize, setEnglishFontSize] = useState<number>(18);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<'text' | 'image' | null>(null);
  const [shareSupported, setShareSupported] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if web sharing is supported
    if (navigator.share && navigator.canShare) {
      setShareSupported(true);
    }
  }, []);

  const themes: ThemePreset[] = [
    {
      id: 'twilight',
      name: 'Midnight Twilight',
      background: 'linear-gradient(135deg, #12072B 0%, #090314 100%)',
      accentColor: '#A855F7', // Purple
      textColor: '#FAF5FF',
      mutedColor: '#D8B4FE',
      borderStyle: 'border-purple-500/20',
      ornamentSvg: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="opacity-40">
          <circle cx="20" cy="20" r="18" stroke="#A855F7" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M20 6 L23 15 L32 15 L25 21 L28 30 L20 24 L12 30 L15 21 L8 15 L17 15 Z" fill="#A855F7" opacity="0.3" />
        </svg>
      ),
      bgDecorations: 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.25) 0%, transparent 60%)'
    },
    {
      id: 'emerald',
      name: 'Sacred Emerald',
      background: 'linear-gradient(135deg, #063C2D 0%, #021C14 100%)',
      accentColor: '#D4AF37', // Gold
      textColor: '#F0FDF4',
      mutedColor: '#A7F3D0',
      borderStyle: 'border-amber-500/20',
      ornamentSvg: (
        <svg width="40" height="40" viewBox="0 0 120 120" fill="none" className="opacity-40">
          <polygon points="60,10 75,45 110,60 75,75 60,110 45,75 10,60 45,45" stroke="#D4AF37" strokeWidth="2" />
          <circle cx="60" cy="60" r="20" stroke="#D4AF37" strokeWidth="1.5" />
        </svg>
      ),
      bgDecorations: 'radial-gradient(circle at 50% 10%, rgba(212, 175, 55, 0.15) 0%, transparent 70%)'
    },
    {
      id: 'charcoal',
      name: 'Kabaa Charcoal',
      background: 'linear-gradient(135deg, #1C1917 0%, #0C0A09 100%)',
      accentColor: '#EAB308', // Amber Gold
      textColor: '#F5F5F4',
      mutedColor: '#D6D3D1',
      borderStyle: 'border-stone-500/20',
      ornamentSvg: (
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" className="opacity-30">
          <rect x="25" y="25" width="50" height="50" stroke="#EAB308" strokeWidth="2" transform="rotate(45 50 50)" />
          <rect x="25" y="25" width="50" height="50" stroke="#EAB308" strokeWidth="1" />
        </svg>
      ),
      bgDecorations: 'linear-gradient(to bottom, rgba(234, 179, 8, 0.05), transparent)'
    },
    {
      id: 'sunset',
      name: 'Sunset Gold',
      background: 'linear-gradient(135deg, #5B21B6 0%, #9D174D 100%)', // Deep Purple to Deep Rose
      accentColor: '#FDE68A', // Soft Gold
      textColor: '#FFF1F2',
      mutedColor: '#FCE7F3',
      borderStyle: 'border-pink-500/20',
      ornamentSvg: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="opacity-40">
          <circle cx="20" cy="20" r="16" stroke="#FDE68A" strokeWidth="1.5" />
          <path d="M20 2 L20 38 M2 20 L38 20" stroke="#FDE68A" strokeWidth="1" opacity="0.5" />
        </svg>
      )
    },
    {
      id: 'minimalist',
      name: 'Slate Editorial',
      background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
      accentColor: '#38BDF8', // Sky Blue
      textColor: '#F8FAFC',
      mutedColor: '#94A3B8',
      borderStyle: 'border-slate-500/25',
      ornamentSvg: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="opacity-30">
          <path d="M12 2L2 12h20L12 2zM12 22l10-10H2l10 10z" stroke="#38BDF8" strokeWidth="1" />
        </svg>
      )
    }
  ];

  const currentPreset = themes.find(t => t.id === activeTheme) || themes[0];

  const getCleanText = (text: string) => {
    // Trim and clean standard spacing
    return text.trim();
  };

  const getSVGMarkup = () => {
    const selectedTheme = currentPreset;
    
    // SVG uses strict styling, so we compile variables
    const textHtml = `
      <div xmlns="http://www.w3.org/1999/xhtml" style="
        width: 1080px; 
        height: 1080px; 
        background: ${selectedTheme.background};
        box-sizing: border-box; 
        padding: 90px; 
        display: flex; 
        flex-direction: column; 
        justify-content: space-between; 
        align-items: center; 
        color: ${selectedTheme.textColor}; 
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        position: relative;
        overflow: hidden;
      ">
        <!-- Ambient Glow -->
        <div style="
          position: absolute;
          top: -200px;
          left: 140px;
          width: 800px;
          height: 800px;
          border-radius: 500px;
          background: ${selectedTheme.accentColor};
          filter: blur(160px);
          opacity: 0.12;
          pointer-events: none;
        "></div>

        <!-- Decorative Border -->
        <div style="
          position: absolute;
          top: 40px;
          bottom: 40px;
          left: 40px;
          right: 40px;
          border: 1.5px solid ${selectedTheme.accentColor}30;
          border-radius: 30px;
          pointer-events: none;
        "></div>

        <!-- Dynamic Corners -->
        <div style="position: absolute; top: 48px; left: 48px; width: 24px; height: 24px; border-top: 3px solid ${selectedTheme.accentColor}; border-left: 3px solid ${selectedTheme.accentColor};"></div>
        <div style="position: absolute; top: 48px; right: 48px; width: 24px; height: 24px; border-top: 3px solid ${selectedTheme.accentColor}; border-right: 3px solid ${selectedTheme.accentColor};"></div>
        <div style="position: absolute; bottom: 48px; left: 48px; width: 24px; height: 24px; border-bottom: 3px solid ${selectedTheme.accentColor}; border-left: 3px solid ${selectedTheme.accentColor};"></div>
        <div style="position: absolute; bottom: 48px; right: 48px; width: 24px; height: 24px; border-bottom: 3px solid ${selectedTheme.accentColor}; border-right: 3px solid ${selectedTheme.accentColor};"></div>

        <!-- Top Header Info -->
        <div style="text-align: center; margin-top: 20px; z-index: 10;">
          <p style="
            font-size: 16px; 
            font-weight: 900; 
            text-transform: uppercase; 
            letter-spacing: 0.35em; 
            color: ${selectedTheme.accentColor};
            margin: 0 0 8px 0;
          ">
            Surah ${ayah.surahName}
          </p>
          <p style="
            font-size: 13px; 
            font-weight: 500; 
            letter-spacing: 0.15em; 
            color: ${selectedTheme.mutedColor};
            opacity: 0.75;
            margin: 0;
          ">
            Verse #${ayah.numberInSurah}
          </p>
        </div>

        <!-- Content Area -->
        <div style="
          flex: 1; 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          align-items: center; 
          gap: 50px; 
          width: 100%;
          z-index: 10;
          padding: 20px 0;
        ">
          <!-- Arabic Verse -->
          <p dir="rtl" style="
            font-family: 'Amiri', serif; 
            font-size: ${arabicFontSize * 1.5}px; 
            line-height: 1.8; 
            text-align: center; 
            color: #FFFFFF; 
            margin: 0;
            padding: 0 40px;
            text-shadow: 0 0 30px rgba(255,255,255,0.15);
            font-weight: 500;
          ">
            ${getCleanText(ayah.text)}
          </p>

          <!-- Separator Ornament -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 16px; width: 100%;">
            <div style="height: 1px; width: 120px; background: linear-gradient(to right, transparent, ${selectedTheme.accentColor}60)"></div>
            <div style="
              width: 12px; 
              height: 12px; 
              border: 2px solid ${selectedTheme.accentColor}; 
              transform: rotate(45deg);
              background: transparent;
            "></div>
            <div style="height: 1px; width: 120px; background: linear-gradient(to left, transparent, ${selectedTheme.accentColor}60)"></div>
          </div>

          <!-- English Translation -->
          ${showTranslation ? `
          <p style="
            font-size: ${englishFontSize * 1.5}px; 
            line-height: 1.6; 
            text-align: center; 
            color: ${selectedTheme.mutedColor}; 
            font-weight: 300; 
            font-style: italic;
            margin: 0;
            padding: 0 50px;
            max-width: 800px;
          ">
            "${getCleanText(ayah.translation)}"
          </p>
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-bottom: 20px; z-index: 10;">
          ${showWatermark ? `
          <p style="
            font-size: 12px; 
            font-weight: 700; 
            text-transform: uppercase; 
            letter-spacing: 0.4em; 
            color: ${selectedTheme.textColor}40;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          ">
            SANCTUARY APP
          </p>
          ` : ''}
        </div>
      </div>
    `;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
        <defs>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap');
          </style>
        </defs>
        <foreignObject width="100%" height="100%">
          ${textHtml}
        </foreignObject>
      </svg>
    `;
  };

  const generateCanvasImage = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const svgString = getSVGMarkup();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = window.URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = blobURL;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas 2D context'));
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          window.URL.revokeObjectURL(blobURL);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas conversion to blob failed'));
          }
        }, 'image/png');
      };

      img.onerror = (e) => {
        window.URL.revokeObjectURL(blobURL);
        reject(e);
      };
    });
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateCanvasImage();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sanctuary_verse_${ayah.surahName}_${ayah.numberInSurah}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      notificationService.notify(
        'Card Exported!',
        `Saved Surah ${ayah.surahName} Ayah ${ayah.numberInSurah} to downloads.`,
        'system'
      );
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to generate high-resolution image card. Try copying text instead.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateCanvasImage();
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        setCopiedType('image');
        notificationService.notify('Image Copied', 'The styled verse card has been copied to your clipboard.', 'system');
        setTimeout(() => setCopiedType(null), 2500);
      } else {
        throw new Error('Clipboard write image not supported on this browser');
      }
    } catch (err) {
      console.warn('Clipboard image writing failed, falling back to download', err);
      // Fallback: trigger download
      handleDownload();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateCanvasImage();
      const file = new File([blob], `sanctuary_${ayah.surahName}_${ayah.numberInSurah}.png`, { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Verse from Surah ${ayah.surahName}`,
          text: `"${ayah.translation}" - Surah ${ayah.surahName}, Ayah ${ayah.numberInSurah}`
        });
      } else {
        // Fallback share text
        await navigator.share({
          title: `Verse from Surah ${ayah.surahName}`,
          text: `"${ayah.translation}" - Surah ${ayah.surahName}, Ayah ${ayah.numberInSurah}`
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Sharing failed', err);
        handleDownload();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyTextOnly = () => {
    const textToCopy = `${ayah.text}\n\n"${ayah.translation}"\n\n— Surah ${ayah.surahName}, Ayah ${ayah.numberInSurah} (Shared via Sanctuary)`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedType('text');
    notificationService.notify('Text Copied', 'Verse text and translation copied with citation.', 'system');
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-5xl rounded-[2.5rem] border-white/10 overflow-hidden shadow-2xl flex flex-col lg:flex-row h-auto lg:h-[80vh] bg-brand-sidebar relative"
      >
        {/* Glow effect */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* PREVIEW CONTAINER (Left side) */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center items-center bg-brand-depth/40 border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden h-[450px] lg:h-full">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/15 border border-brand-primary/20 rounded-full text-[9px] font-black uppercase tracking-wider text-brand-primary">
            <Eye size={10} /> Active Design Preview
          </div>

          {/* Symmetrical Aspect Ratio Card Wrapper */}
          <div className="w-full max-w-[360px] aspect-square rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 relative bg-brand-depth">
            {/* Beautiful Custom Card Mock */}
            <div 
              ref={previewRef}
              className="w-full h-full flex flex-col justify-between items-center p-6 md:p-8 relative transition-all duration-500 overflow-hidden"
              style={{ background: currentPreset.background }}
            >
              {/* Star dust gradient circle */}
              {currentPreset.bgDecorations && (
                <div 
                  className="absolute inset-0 pointer-events-none opacity-60"
                  style={{ backgroundImage: currentPreset.bgDecorations }}
                />
              )}

              {/* Borders */}
              <div 
                className={`absolute inset-4 border rounded-[1.25rem] pointer-events-none transition-colors duration-500`}
                style={{ borderColor: `${currentPreset.accentColor}25` }}
              />

              {/* Symmetrical Corner Accents */}
              <div style={{ borderColor: currentPreset.accentColor }} className="absolute top-5 left-5 w-4 h-4 border-t-2 border-l-2 opacity-80" />
              <div style={{ borderColor: currentPreset.accentColor }} className="absolute top-5 right-5 w-4 h-4 border-t-2 border-r-2 opacity-80" />
              <div style={{ borderColor: currentPreset.accentColor }} className="absolute bottom-5 left-5 w-4 h-4 border-b-2 border-l-2 opacity-80" />
              <div style={{ borderColor: currentPreset.accentColor }} className="absolute bottom-5 right-5 w-4 h-4 border-b-2 border-r-2 opacity-80" />

              {/* Card Header */}
              <div className="text-center z-10 space-y-1 mt-2">
                <p 
                  className="text-[10px] font-black uppercase tracking-[0.3em]"
                  style={{ color: currentPreset.accentColor }}
                >
                  Surah {ayah.surahName}
                </p>
                <p 
                  className="text-[8px] font-bold tracking-widest uppercase opacity-70"
                  style={{ color: currentPreset.mutedColor }}
                >
                  Verse #{ayah.numberInSurah}
                </p>
              </div>

              {/* Card Verses Content */}
              <div className="flex-1 flex flex-col justify-center items-center gap-4 w-full z-10 py-2">
                {/* Arabic Calligraphy */}
                <p 
                  className="arabic-text text-white leading-relaxed text-center px-2 select-none"
                  style={{ 
                    fontSize: `${arabicFontSize}px`, 
                    textShadow: '0 0 20px rgba(255,255,255,0.1)' 
                  }}
                >
                  {getCleanText(ayah.text)}
                </p>

                {/* Symmetrical Vector Divider */}
                <div className="flex items-center justify-center gap-3 w-3/4 opacity-60">
                  <div style={{ background: `linear-gradient(to right, transparent, ${currentPreset.accentColor})` }} className="h-[0.5px] flex-1" />
                  <div style={{ borderColor: currentPreset.accentColor }} className="w-1.5 h-1.5 border transform rotate-45" />
                  <div style={{ background: `linear-gradient(to left, transparent, ${currentPreset.accentColor})` }} className="h-[0.5px] flex-1" />
                </div>

                {/* English Translation */}
                {showTranslation && (
                  <p 
                    className="italic font-light text-center leading-relaxed px-4 max-h-[100px] overflow-y-auto no-scrollbar"
                    style={{ 
                      fontSize: `${englishFontSize}px`,
                      color: currentPreset.mutedColor
                    }}
                  >
                    "{getCleanText(ayah.translation)}"
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="text-center z-10 mb-2">
                {showWatermark && (
                  <p 
                    className="text-[8px] font-black tracking-[0.35em]"
                    style={{ color: `${currentPreset.textColor}40` }}
                  >
                    SANCTUARY APP
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOMIZATION PANEL (Right side) */}
        <div className="flex-[1.2] p-6 md:p-8 flex flex-col justify-between bg-brand-sidebar h-[450px] lg:h-full overflow-y-auto no-scrollbar">
          
          {/* Header */}
          <div className="flex justify-between items-start pb-4 border-b border-white/5">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={10} className="text-brand-primary" /> Premium share deck
              </span>
              <h3 className="text-lg md:text-xl font-bold text-white">Share Divine Wisdom</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Controls Container */}
          <div className="py-6 space-y-6 flex-1">
            
            {/* Theme Selector */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Premium Theme</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setActiveTheme(theme.id)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden group cursor-pointer ${
                      activeTheme === theme.id 
                        ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/10' 
                        : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {/* Small color swatches */}
                    <div className="flex justify-between items-center mb-1.5 z-10">
                      <span className="text-[10px] font-bold text-white leading-none">{theme.name}</span>
                    </div>
                    <div className="flex items-center gap-1 z-10">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: theme.accentColor }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: theme.textColor }} />
                    </div>
                    {/* Small background swatch representation */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: theme.background }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Scale Adjusters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Arabic Font Slider */}
              <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Type size={12} /> Arabic Font</span>
                  <span className="text-brand-primary">{arabicFontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="48" 
                  value={arabicFontSize}
                  onChange={(e) => setArabicFontSize(Number(e.target.value))}
                  className="w-full accent-brand-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* English Font Slider */}
              <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Type size={12} /> Translation Font</span>
                  <span className="text-brand-primary">{englishFontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="12" 
                  max="24" 
                  value={englishFontSize}
                  disabled={!showTranslation}
                  onChange={(e) => setEnglishFontSize(Number(e.target.value))}
                  className="w-full accent-brand-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>

            {/* Visibility Toggles */}
            <div className="flex gap-4">
              <button 
                onClick={() => setShowTranslation(!showTranslation)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  showTranslation 
                    ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' 
                    : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                }`}
              >
                {showTranslation ? 'Hide Translation' : 'Show Translation'}
              </button>

              <button 
                onClick={() => setShowWatermark(!showWatermark)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  showWatermark 
                    ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' 
                    : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                }`}
              >
                {showWatermark ? 'Hide Watermark' : 'Show Watermark'}
              </button>
            </div>

          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3">
            
            {/* Quick Text Copy Option */}
            <button
              onClick={handleCopyTextOnly}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95"
            >
              {copiedType === 'text' ? (
                <>
                  <Check size={14} className="text-emerald-500" /> Text Copied
                </>
              ) : (
                <>
                  <FileText size={14} /> Copy Verse Text
                </>
              )}
            </button>

            {/* Clipboard Copy Image Option */}
            <button
              onClick={handleCopyToClipboard}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-white/5 border border-white/5 hover:border-brand-primary/20 hover:text-brand-primary text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" /> Rendering...
                </>
              ) : copiedType === 'image' ? (
                <>
                  <Check size={14} className="text-emerald-500" /> Image Copied
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy styled card
                </>
              )}
            </button>

            {/* Primary Download / Share Trigger */}
            {shareSupported ? (
              <button
                onClick={handleShare}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-brand-primary text-brand-depth font-black text-[10px] uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-primary/25 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-brand-depth border-t-transparent rounded-full animate-spin" /> Preparing...
                  </>
                ) : (
                  <>
                    <Share2 size={14} fill="currentColor" /> Share Card
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-brand-primary text-brand-depth font-black text-[10px] uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-primary/25 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-brand-depth border-t-transparent rounded-full animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Download size={14} /> Download PNG
                  </>
                )}
              </button>
            )}
            
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
