import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Sparkles, Check, BookOpen, Volume2 } from 'lucide-react';
import { VoiceTasbihService, RecognizedSupplication } from '../services/voiceTasbihService.ts';

interface AddCustomSupplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (newSupplication: Omit<RecognizedSupplication, 'count'>) => void;
}

const PRESETS = [
  {
    name: 'Dua Yunus (Deliverance)',
    arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliteration: 'Lā ilāha illā Anta subḥānaka innī kuntu minaẓ-ẓālimīn',
    meaning: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
    keywords: ['la ilaha illa anta', 'subhanaka inni kuntu', 'dua yunus']
  },
  {
    name: 'Sayyidul Istighfar (Master of Forgiveness)',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ',
    transliteration: 'Allāhumma Anta Rabbī lā ilāha illā Anta',
    meaning: 'O Allah, You are my Lord, there is no god but You. You created me and I am Your servant.',
    keywords: ['sayyidul istighfar', 'allahumma anta rabbi', 'master of forgiveness']
  },
  {
    name: 'Dua for Knowledge & Wisdom',
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    transliteration: 'Rabbi zidnī ‘ilmā',
    meaning: 'My Lord, increase me in knowledge.',
    keywords: ['rabbi zidni ilma', 'zidni ilma', 'increase me in knowledge']
  },
  {
    name: 'Dua for Protection from Fire',
    arabic: 'اللَّهُمَّ أَجِرْنَا مِنَ النَّارِ',
    transliteration: 'Allāhumma ajirnā minan-nār',
    meaning: 'O Allah, save us from the fire of Hell.',
    keywords: ['allahumma ajirna minan nar', 'ajirna minan nar', 'save us from hellfire']
  },
  {
    name: 'Dua for Goodness in Both Worlds',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā ‘adhāban-nār',
    meaning: 'Our Lord, give us in this world that which is good and in the Hereafter good, and save us from the punishment of the Fire.',
    keywords: ['rabbana atina fid dunya', 'rabbana atina', 'hasanatan wa fil akhirah']
  }
];

export default function AddCustomSupplicationModal({
  isOpen,
  onClose,
  onAdded
}: AddCustomSupplicationModalProps) {
  const [name, setName] = useState('');
  const [arabic, setArabic] = useState('');
  const [transliteration, setTransliteration] = useState('');
  const [meaning, setMeaning] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setName(preset.name);
    setArabic(preset.arabic);
    setTransliteration(preset.transliteration);
    setMeaning(preset.meaning);
    setKeywordsInput(preset.keywords.join(', '));
    setError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name or transliteration for this supplication.');
      return;
    }

    const keywords = keywordsInput
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(Boolean);

    if (name.trim()) {
      keywords.push(name.trim().toLowerCase());
    }
    if (transliteration.trim()) {
      keywords.push(transliteration.trim().toLowerCase());
    }

    const saved = VoiceTasbihService.saveCustomSupplication({
      name: name.trim(),
      arabic: arabic.trim() || name.trim(),
      transliteration: transliteration.trim() || name.trim(),
      meaning: meaning.trim() || 'Custom Devotional Supplication',
      keywords: Array.from(new Set(keywords))
    });

    onAdded(saved);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="w-full max-w-lg bg-slate-900 border border-brand-primary/40 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden text-white max-h-[90vh] flex flex-col"
        >
          {/* Background Decorative Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-white tracking-tight">
                Add Custom Supplication
              </h3>
              <p className="text-xs text-slate-400">
                Personalize your voice-activated Tasbih & Misbaha
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-4">
            {/* Quick Preset Picker */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Quick Presets (Tap to Autofill):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/40 text-[11px] font-medium text-slate-300 hover:text-brand-primary transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles size={11} className="text-amber-400" />
                    <span>{p.name.split('(')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input Form */}
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Supplication Title / Transliteration <span className="text-brand-primary">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rabbi Zidni Ilma, Ya Hayyu Ya Qayyum"
                  className="w-full bg-black/40 border border-white/15 focus:border-brand-primary rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Arabic Script (Optional)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={arabic}
                  onChange={(e) => setArabic(e.target.value)}
                  placeholder="رَبِّ زِدْنِي عِلْمًا"
                  className="w-full bg-black/40 border border-white/15 focus:border-brand-primary rounded-xl px-3.5 py-2.5 text-base font-arabic text-amber-200 placeholder:text-slate-600 focus:outline-none transition-colors text-right"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  English Translation / Meaning
                </label>
                <input
                  type="text"
                  value={meaning}
                  onChange={(e) => setMeaning(e.target.value)}
                  placeholder="e.g. My Lord, increase me in knowledge"
                  className="w-full bg-black/40 border border-white/15 focus:border-brand-primary rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5">
                    <Volume2 size={13} className="text-brand-primary" />
                    Spoken Voice Trigger Keywords
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Comma-separated</span>
                </label>
                <input
                  type="text"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  placeholder="e.g. rabbi zidni ilma, zidni ilma, increase knowledge"
                  className="w-full bg-black/40 border border-white/15 focus:border-brand-primary rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  When the voice assistant hears any of these spoken keywords, it will increment your tasbih bead counter automatically.
                </p>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                  {error}
                </p>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-primary to-amber-500 hover:from-brand-primary/90 hover:to-amber-600 text-brand-depth text-xs font-black transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={15} />
                  <span>Save Supplication</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
