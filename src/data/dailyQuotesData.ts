export interface DailyQuoteItem {
  id: number;
  theme: string;
  category: 'wisdom' | 'quran' | 'hadith' | 'sahaba' | 'scholar';
  arabic?: string;
  quote: string;
  source: string;
  reflection: string;
  author: string;
  actionableStep?: string;
  backgroundImage?: string;
  accentColor?: string;
}

export const DAILY_ISLAMIC_QUOTES: DailyQuoteItem[] = [
  {
    id: 1,
    theme: "Dawn of Ease",
    category: "quran",
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    quote: "Verily, with hardship comes ease. With hardship comes ease.",
    source: "Surah Ash-Sharh (94:5-6)",
    author: "The Holy Qur'an",
    reflection: "Hardship never comes alone; ease is woven directly into the challenge itself.",
    actionableStep: "Place complete trust in Allah and breathe through current difficulties.",
    accentColor: "#10b981"
  },
  {
    id: 2,
    theme: "The Art of Patience",
    category: "hadith",
    arabic: "وَاعْلَمْ أَنَّ فِي الصَّبْرِ عَلَى مَا تَكْرَهُ خَيْرًا كَثِيرًا",
    quote: "Know that in having patience with that which you dislike, there is an immense good.",
    source: "Musnad Ahmad & Sunan At-Tirmidhi",
    author: "Prophet Muhammad ﷺ",
    reflection: "Patience is not passive waiting, but active grace and spiritual fortitude in the midst of storms.",
    actionableStep: "Respond with calmness rather than impulsiveness in your conversations today.",
    accentColor: "#f59e0b"
  },
  {
    id: 3,
    theme: "Peace of the Heart",
    category: "scholar",
    arabic: "الرِّضَا بِمَا قَسَمَ اللَّهُ رَاحَةُ الْقُلُوبِ",
    quote: "Contentment with what Allah has decreed brings tranquility to the restless heart and dissolves worldly anxiety.",
    source: "Al-Fawa'id",
    author: "Imam Ibn Al-Qayyim",
    reflection: "When you accept Allah's decree, every moment becomes an opportunity for closeness to Him.",
    actionableStep: "List three blessings you received today that you often take for granted.",
    accentColor: "#3b82f6"
  },
  {
    id: 4,
    theme: "The Gift of Kindness",
    category: "hadith",
    arabic: "إِنَّ الرِّفْقَ لَا يَكُونُ فِي شَيْءٍ إِلَّا زَانَهُ",
    quote: "Gentleness is not in anything except that it beautifies it, and it is not removed from anything except that it stains it.",
    source: "Sahih Muslim (2594)",
    author: "Prophet Muhammad ﷺ",
    reflection: "Gentleness touches hearts where harshness fails. Soften your words and your demeanor.",
    actionableStep: "Speak with extra warmth and gentleness to a family member or coworker.",
    accentColor: "#10b981"
  },
  {
    id: 5,
    theme: "Inner Purification",
    category: "scholar",
    arabic: "عَلَيْكَ بِمُحَاسَبَةِ نَفْسِكَ قَبْلَ أَنْ تُحَاسَبَ",
    quote: "Take account of yourselves before you are called to account, and weigh your deeds before they are weighed for you.",
    source: "Hilyat al-Awliya",
    author: "Umar ibn Al-Khattab (RA)",
    reflection: "Self-reflection is the mirror of sincere faith. Correct yourself today before tomorrow arrives.",
    actionableStep: "Spend five quiet minutes before sleep auditing today's intentions.",
    accentColor: "#ec4899"
  },
  {
    id: 6,
    theme: "The Divine Nearness",
    category: "quran",
    arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    quote: "And when My servants ask you concerning Me, indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.",
    source: "Surah Al-Baqarah (2:186)",
    author: "The Holy Qur'an",
    reflection: "You do not need to shout or search far; Allah hears the whisper you cannot even formulate into words.",
    actionableStep: "Make a sincere dua in prostration (sujood) pouring out your heart.",
    accentColor: "#8b5cf6"
  },
  {
    id: 7,
    theme: "Gratitude as an Anchor",
    category: "scholar",
    arabic: "الشُّكْرُ قَيْدُ النِّعَمِ الْمَوْجُودَةِ وَصَيْدُ النِّعَمِ الْمَفْقُودَةِ",
    quote: "Gratitude is the leash that secures present blessings, and the net that catches blessings yet to come.",
    source: "Ihya Ulum al-Din",
    author: "Imam Abu Hamid Al-Ghazali",
    reflection: "Thankfulness magnifies every joy and turns ordinary moments into perpetual worship.",
    actionableStep: "Say 'Alhamdulillah' with mindful contemplation after your next sip of water or meal.",
    accentColor: "#f59e0b"
  },
  {
    id: 8,
    theme: "Charity of the Soul",
    category: "hadith",
    arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
    quote: "Your smiling in the face of your brother is an act of charity for you.",
    source: "Jami` at-Tirmidhi (1956)",
    author: "Prophet Muhammad ﷺ",
    reflection: "Charity is not limited to wealth; a warm smile spreads light and uplifts weary souls.",
    actionableStep: "Greet everyone you meet today with a genuine, welcoming smile.",
    accentColor: "#10b981"
  },
  {
    id: 9,
    theme: "Sincerity of Action",
    category: "sahaba",
    arabic: "إِنَّمَا يُعْطَى الرَّجُلُ عَلَى قَدْرِ نِيَّتِهِ",
    quote: "A person is blessed and rewarded purely according to the purity and sincerity of their intention.",
    source: "Al-Zuhd",
    author: "Ali ibn Abi Talib (RA)",
    reflection: "Transform ordinary routines—eating, working, studying—into sacred worship by renewing your intention.",
    actionableStep: "Before starting your next work task, silently dedicate it for the sake of Allah.",
    accentColor: "#6366f1"
  },
  {
    id: 10,
    theme: "The Light of Knowledge",
    category: "scholar",
    arabic: "لَيْسَ الْعِلْمُ مَا حُفِظَ، إِنَّمَا الْعِلْمُ مَا نَفَعَ",
    quote: "True knowledge is not merely what is memorized; knowledge is that which benefits the soul and brings one closer to the Creator.",
    source: "Siyar A'lam an-Nubala",
    author: "Imam Ash-Shafi'i",
    reflection: "Knowledge without humble practice is like a tree without fruit. Apply what you learn.",
    actionableStep: "Share one beneficial Islamic insight or reminder with a friend or family member today.",
    accentColor: "#06b6d4"
  },
  {
    id: 11,
    theme: "Unshakable Hope",
    category: "quran",
    arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
    quote: "Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins.",
    source: "Surah Az-Zumar (39:53)",
    author: "The Holy Qur'an",
    reflection: "No matter how heavy your past feels, Allah's mercy is infinitely vast. Turn back to Him right now.",
    actionableStep: "Make sincere repentance (Astaghfirullah) 100 times throughout your day.",
    accentColor: "#14b8a6"
  },
  {
    id: 12,
    theme: "Humility in Speech",
    category: "scholar",
    arabic: "مَنْ كَثُرَ كَلَامُهُ كَثُرَ سَقَطُهُ",
    quote: "Whoever speaks excessively will stumble often, and whoever stumbles often loses dignity and reverence.",
    source: "Jami' al-Ulum wal-Hikam",
    author: "Hasan Al-Basri",
    reflection: "Silence is a shield against regret. Guard your tongue, and let your words heal rather than hurt.",
    actionableStep: "Pause for three seconds before speaking to ensure your words are kind, true, and necessary.",
    accentColor: "#eab308"
  },
  {
    id: 13,
    theme: "The Best of Companionship",
    category: "hadith",
    arabic: "الْمَرْءُ مَعَ مَنْ أَحَبَّ",
    quote: "A person will be in the Hereafter with those whom he loved in this life.",
    source: "Sahih Al-Bukhari (6168)",
    author: "Prophet Muhammad ﷺ",
    reflection: "Surround your heart with love for the righteous, the Prophet ﷺ, and seekers of goodness.",
    actionableStep: "Reach out to a pious friend and express your gratitude for their companionship.",
    accentColor: "#ec4899"
  },
  {
    id: 14,
    theme: "Releasing Worldly Attachment",
    category: "scholar",
    arabic: "ازْهَدْ فِي الدُّنْيَا يُحِبَّكَ اللَّهُ",
    quote: "Hold the world in your hands, but never let it enter and dwell inside your heart.",
    source: "Letters of Wisdom",
    author: "Imam Ahmad ibn Hanbal",
    reflection: "True richness is freedom from the enslavement of material desires.",
    actionableStep: "Give away an item of clothing or money secretly without expecting praise.",
    accentColor: "#f97316"
  },
  {
    id: 15,
    theme: "Remembrance of Allah",
    category: "quran",
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    quote: "Unquestionably, by the remembrance of Allah do hearts find peace and assurance.",
    source: "Surah Ar-Ra'd (13:28)",
    author: "The Holy Qur'an",
    reflection: "Whenever your mind is overwhelmed by worries, anchoring in Dhikr restores inner serenity.",
    actionableStep: "Recite 'SubhanAllah wa Bihamdihi' 100 times during your commute or walk.",
    accentColor: "#10b981"
  },
  {
    id: 16,
    theme: "Excellence in Worship (Ihsan)",
    category: "hadith",
    arabic: "أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ",
    quote: "Excellence is to worship Allah as though you see Him, and if you cannot see Him, know that He surely sees you.",
    source: "Hadith Jibreel • Sahih Muslim",
    author: "Prophet Muhammad ﷺ",
    reflection: "Live with mindful consciousness that your Creator watches over you with tenderness and majesty.",
    actionableStep: "Perform your next prayer with unhurried mindfulness, focusing on each movement.",
    accentColor: "#3b82f6"
  },
  {
    id: 17,
    theme: "Purity of Conscience",
    category: "scholar",
    arabic: "إِذَا أَرَدْتَ أَنْ يَدُومَ صَفَاءُ وَقْتِكَ، فَأَصْلِحْ مَا بَيْنَكَ وَبَيْنَ اللَّهِ",
    quote: "If you desire that your life remain in serene clarity, purify what is between you and your Creator.",
    source: "Madarij As-Salikin",
    author: "Ibn Qayyim Al-Jawziyya",
    reflection: "When you mend your relationship with Allah in private, He mends your affairs with people in public.",
    actionableStep: "Perform two rak'ahs of private voluntary prayer (Salat ad-Duha or Tahajjud).",
    accentColor: "#8b5cf6"
  },
  {
    id: 18,
    theme: "The Shield of Forgiveness",
    category: "quran",
    arabic: "وَلْيَعْفُوا وَلْيَصْفَحُوا ۗ أَلَا تُحِبُّونَ أَن يَغْفِرَ اللَّهُ لَكُمْ",
    quote: "Let them pardon and overlook. Would you not like that Allah should forgive you? And Allah is Forgiving and Merciful.",
    source: "Surah An-Nur (24:22)",
    author: "The Holy Qur'an",
    reflection: "Holding grudges only harms the vessel that holds them. Forgive others so that Allah may forgive you.",
    actionableStep: "Release any resentment you hold toward someone who wronged you and pray for their guidance.",
    accentColor: "#10b981"
  },
  {
    id: 19,
    theme: "The Real Test of Character",
    category: "scholar",
    arabic: "حُسْنُ الْخُلُقِ أَنْ تَكُونَ كَمَا أَنْتَ فِي السِّرِّ وَالْعَلَانِيَةِ",
    quote: "Noble character is to be the same pure, honest soul in private solitude as you appear before the public eye.",
    source: "Al-Risala al-Qushayriyya",
    author: "Abu Bakr Al-Warraq",
    reflection: "True piety is not a performance for others, but an intimate covenant with the All-Seeing.",
    actionableStep: "Guard your eyes, thoughts, and device usage when alone as if surrounded by righteous mentors.",
    accentColor: "#f59e0b"
  },
  {
    id: 20,
    theme: "Supplication as a Weapon",
    category: "hadith",
    arabic: "الدُّعَاءُ هُوَ الْعِبَادَةُ",
    quote: "Dua (supplication) is the very essence of worship.",
    source: "Sunan Abu Dawood (1479)",
    author: "Prophet Muhammad ﷺ",
    reflection: "Asking Allah is not a last resort; it is our primary declaration of reliance and love.",
    actionableStep: "Raise your hands and ask Allah for both your biggest worldly dreams and your highest Jannah.",
    accentColor: "#6366f1"
  },
  {
    id: 21,
    theme: "The Fragrance of Sincerity",
    category: "scholar",
    arabic: "الْإِخْلَاصُ هُوَ سِرٌّ بَيْنَ الْعَبْدِ وَرَبِّهِ",
    quote: "Sincerity is a sacred secret between the servant and the Lord; no angel knows it to write it down, and no demon knows it to corrupt it.",
    source: "Kitab Al-Ikhlas",
    author: "Al-Junayd al-Baghdadi",
    reflection: "Protect your good deeds from the poison of showing off (Riya). Keep some good works completely hidden.",
    actionableStep: "Perform a secret act of charity or kindness today that nobody on earth knows about.",
    accentColor: "#ec4899"
  },
  {
    id: 22,
    theme: "Praising in Every Season",
    category: "hadith",
    arabic: "الْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ",
    quote: "All praise belongs to Allah under every circumstance and in all states of life.",
    source: "Sunan Ibn Majah",
    author: "Prophet Muhammad ﷺ",
    reflection: "When things go well, say Alhamdulillah with gratitude. When things go hard, say Alhamdulillah with patience.",
    actionableStep: "Thank Allah specifically for a hardship that taught you resilience or humility.",
    accentColor: "#14b8a6"
  },
  {
    id: 23,
    theme: "Honoring Parents",
    category: "quran",
    arabic: "وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    quote: "And lower to them the wing of humility out of mercy and say: My Lord, have mercy upon them as they brought me up when I was small.",
    source: "Surah Al-Isra (17:24)",
    author: "The Holy Qur'an",
    reflection: "Our parents are our greatest gateway to Paradise. Honor them with tenderness and attentive care.",
    actionableStep: "Call, hug, or make a special heartfelt supplication for your parents today.",
    accentColor: "#f97316"
  },
  {
    id: 24,
    theme: "Seeking Peace in Prayer",
    category: "hadith",
    arabic: "أَرِحْنَا بِهَا يَا بِلَالُ",
    quote: "Relieve us with it (the prayer), O Bilal!",
    source: "Sunan Abi Dawud (4985)",
    author: "Prophet Muhammad ﷺ",
    reflection: "Prayer is not a burden to be finished, but an oasis of rest to escape into from the noise of the world.",
    actionableStep: "Enter your next Salah with anticipation, viewing it as your private sanctuary with the Divine.",
    accentColor: "#10b981"
  },
  {
    id: 25,
    theme: "Trust in Divine Timing",
    category: "scholar",
    arabic: "لَا تَقْلَقْ مِنْ تَدْبِيرِ اللَّهِ، فَإِنَّهُ أَرْحَمُ بِكَ مِنْ أُمِّكَ",
    quote: "Do not let anxiety overtake you regarding Allah’s plan; He is more merciful to you than a mother to her newborn infant.",
    source: "Hikmat al-Salihin",
    author: "Ibn Ata'illah al-Iskandari",
    reflection: "What has passed you by was never meant for you, and what has reached you could never have missed you.",
    actionableStep: "Surrender a lingering anxiety to Allah with the phrase: 'HasbunAllahu wa ni'mal wakeel'.",
    accentColor: "#3b82f6"
  },
  {
    id: 26,
    theme: "The Guarded Tongue",
    category: "hadith",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    quote: "Whoever believes in Allah and the Last Day, let him speak what is good or remain silent.",
    source: "Sahih Al-Bukhari & Sahih Muslim",
    author: "Prophet Muhammad ﷺ",
    reflection: "Every word uttered either elevates your record in the heavens or weighs it down. Choose wisely.",
    actionableStep: "Fast from complaining, gossiping, or negative banter for the next 24 hours.",
    accentColor: "#eab308"
  },
  {
    id: 27,
    theme: "The Beauty of Tawakkul",
    category: "quran",
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ",
    quote: "And whoever relies upon Allah – then He is sufficient for him. Indeed, Allah will accomplish His purpose.",
    source: "Surah At-Talaq (65:3)",
    author: "The Holy Qur'an",
    reflection: "Tawakkul is doing your absolute best with your hands while leaving the outcome entirely in Allah's hands.",
    actionableStep: "Take the necessary practical step for your goal today, then release all outcome stress to Allah.",
    accentColor: "#06b6d4"
  },
  {
    id: 28,
    theme: "The Power of Consistency",
    category: "hadith",
    arabic: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    quote: "The deeds most loved by Allah are those done consistently, even if they are small.",
    source: "Sahih Muslim (782)",
    author: "Prophet Muhammad ﷺ",
    reflection: "A small river flowing every day will carve through solid rock. Build steady spiritual habits.",
    actionableStep: "Commit to reading just one page of Quran or giving a modest charity daily without fail.",
    accentColor: "#8b5cf6"
  },
  {
    id: 29,
    theme: "The Ocean of Istighfar",
    category: "scholar",
    arabic: "مَنْ لَزِمَ الِاسْتِغْفَارَ جَعَلَ اللَّهُ لَهُ مِنْ كُلِّ ضِيقٍ مَخْرَجًا",
    quote: "Whoever holds firmly to Istighfar (seeking forgiveness), Allah will provide a relief from every distress and a way out from every difficulty.",
    source: "Sunan Abi Dawud",
    author: "Sayyiduna Ibn Abbas (RA)",
    reflection: "Seeking forgiveness is not just for sins; it unlocks closed doors, brings provision, and softens hearts.",
    actionableStep: "Say 'Rabbi-ghfir li wa tub 'alayya' with heartfelt remorse and hope throughout the day.",
    accentColor: "#10b981"
  },
  {
    id: 30,
    theme: "The Eternal Home",
    category: "quran",
    arabic: "وَالْآخِرَةُ خَيْرٌ وَأَبْقَىٰ",
    quote: "While the Hereafter is better and more enduring.",
    source: "Surah Al-A'la (87:17)",
    author: "The Holy Qur'an",
    reflection: "This world is a traveler's rest stop under the shade of a tree. Live for what lasts forever.",
    actionableStep: "Invest in an everlasting charity (Sadaqah Jariyah) or teach someone a beneficial verse.",
    accentColor: "#f59e0b"
  }
];

export const getDailyQuoteForDate = (date: Date = new Date()): DailyQuoteItem => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = Math.abs(dayOfYear) % DAILY_ISLAMIC_QUOTES.length;
  return DAILY_ISLAMIC_QUOTES[index] || DAILY_ISLAMIC_QUOTES[0];
};
