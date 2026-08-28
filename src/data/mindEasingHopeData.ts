/**
 * Mind-Easing Hope, Encouragement & Relief Repository
 * Curated Quranic Ayahs of Ease, Prophetic Hadiths of Comfort, and Historic Stories of Divine Deliverance
 * Designed to soothe anxious hearts, bring immediate serenity, and spark unshakable hope upon opening the sanctuary.
 */

export interface HopeItem {
  id: string;
  type: 'ayah' | 'hadith' | 'story';
  title: string;
  arabicTitle?: string;
  arabic?: string;
  translation: string;
  context: string;
  reflection: string;
  reference: string;
  narrator?: string;
  surahNumber?: number;
  ayahNumber?: number;
  soothingTheme: 'ease_after_hardship' | 'mercy_and_forgiveness' | 'solace_in_trials' | 'unshakeable_trust' | 'divine_nearness';
  icon: string;
  tag: string;
}

export const MIND_EASING_HOPE_COLLECTION: HopeItem[] = [
  {
    id: 'hope-sharh-ease',
    type: 'ayah',
    title: 'The Promise of Ease Twice Over',
    arabicTitle: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: '“For indeed, with hardship comes ease. Indeed, with hardship comes ease.”',
    context: 'Revealed to Prophet Muhammad ﷺ during his most agonizing period of grief and social boycott in Makkah.',
    reflection: 'In Arabic grammar, the hardship (al-usr) is definite (singular), while ease (yusr) is indefinite (boundless). One singular hardship can never overcome two boundless waves of Divine ease. Relief is not coming after the storm — ease is embedded right inside the difficulty.',
    reference: 'Surah Ash-Sharh [94:5-6]',
    surahNumber: 94,
    ayahNumber: 5,
    soothingTheme: 'ease_after_hardship',
    icon: '🌅',
    tag: 'Guaranteed Ease'
  },
  {
    id: 'hope-zumar-mercy',
    type: 'ayah',
    title: 'Never Despair of Divine Mercy',
    arabicTitle: 'لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
    arabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا',
    translation: '“Say, ‘O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful.’”',
    context: 'Described by Abdullah ibn Umar as the most hopeful and comforting verse in the entire Quran.',
    reflection: 'Notice how Allah tenderly calls the broken, the sinful, and the regretful: “Ya ‘Ibadi” (O My Servants). He does not cast you out; He embraces your broken heart. Your mistakes are finite, but His ocean of forgiveness is infinite.',
    reference: 'Surah Az-Zumar [39:53]',
    surahNumber: 39,
    ayahNumber: 53,
    soothingTheme: 'mercy_and_forgiveness',
    icon: '🕊️',
    tag: 'Infinite Mercy'
  },
  {
    id: 'hope-duha-forsaken',
    type: 'ayah',
    title: 'Your Lord Has Not Forsaken You',
    arabicTitle: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ',
    arabic: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ ۝ وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ ۝ وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
    translation: '“Your Lord has not forsaken you, nor has He become displeased. And the future is far better for you than the past. And your Lord will surely give you, and you will be well-pleased.”',
    context: 'Revealed after months of silence when enemies mocked that revelation had stopped and sorrow weighed heavily upon the Prophet’s heart.',
    reflection: 'When feeling lonely, unheard, or stalled in life, remember: silence is not absence. Allah is orchestrating a season of abundance for you. What is coming will make your heart completely satisfied.',
    reference: 'Surah Ad-Duha [93:3-5]',
    surahNumber: 93,
    ayahNumber: 3,
    soothingTheme: 'divine_nearness',
    icon: '✨',
    tag: 'Unconditional Love'
  },
  {
    id: 'hope-baqarah-burden',
    type: 'ayah',
    title: 'Tuned Precisely to Your Strength',
    arabicTitle: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ',
    translation: '“Allah does not burden a soul beyond that it can bear.”',
    context: 'The crowning conclusion of Surah Al-Baqarah, assuring the believer that no trial exceeds their God-given capacity.',
    reflection: 'If Allah allowed this heavy mountain on your path, it is because He engineered the spiritual wings within you to rise over it. You are stronger than your anxiety whispers.',
    reference: 'Surah Al-Baqarah [2:286]',
    surahNumber: 2,
    ayahNumber: 286,
    soothingTheme: 'solace_in_trials',
    icon: '🛡️',
    tag: 'Divine Capacity'
  },
  {
    id: 'hope-talaq-way-out',
    type: 'ayah',
    title: 'The Miracle From Where You Never Expected',
    arabicTitle: 'وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
    arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ۝ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    translation: '“And whoever relies upon Allah — then He is sufficient for him. Indeed, Allah will accomplish His purpose.”',
    context: 'Revealed to comfort those facing sudden hardship and doors slammed shut by worldly circumstances.',
    reflection: 'When all human calculations say 0%, Divine decree says 100%. Hand over your worries to the Creator of the universe. When He opens a door, no power on earth can close it.',
    reference: 'Surah At-Talaq [65:2-3]',
    surahNumber: 65,
    ayahNumber: 2,
    soothingTheme: 'unshakeable_trust',
    icon: '🗝️',
    tag: 'Unexpected Relief'
  },
  {
    id: 'hope-hadith-wonderful-affair',
    type: 'hadith',
    title: 'Everything in Your Life is Good',
    arabicTitle: 'عَجَبًا لِأَمْرِ الْمُؤْمِنِ',
    arabic: 'عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ ، وَلَيْسَ ذَاكَ لِأَحَدٍ إِلَّا لِلْمُؤْمِنِ ، إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ ، وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ',
    translation: '“How wonderful is the affair of the believer! Verily, all of his affairs are good, and that belongs to none except a believer. If something pleasant happens to him, he is grateful and that is good for him; and if something burdensome befalls him, he is patient and that is good for him.”',
    context: 'Narrated by Suhaib ibn Sinan in Sahih Muslim (2999).',
    reflection: 'As a believer, you never lose. Ease becomes a blessing of gratitude, and trials become diamonds of forgiveness and elevated ranks in Jannah. Relax your shoulders; you are in the hands of the Most Kind.',
    reference: 'Sahih Muslim 2999',
    narrator: 'Suhaib (RA)',
    soothingTheme: 'solace_in_trials',
    icon: '🌸',
    tag: 'Believer’s Peace'
  },
  {
    id: 'hope-hadith-victory-patience',
    type: 'hadith',
    title: 'The Inseparable Companions: Relief & Hardship',
    arabicTitle: 'وَاعْلَمْ أَنَّ النَّصْرَ مَعَ الصَّبْرِ',
    arabic: 'وَاعْلَمْ أَنَّ فِي الصَّبْرِ عَلَى مَا تَكْرَهُ خَيْرًا كَثِيرًا ، وَأَنَّ النَّصْرَ مَعَ الصَّبْرِ ، وَأَنَّ الْفَرَجَ مَعَ الْكَرْبِ ، وَأَنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: '“And know that in patient endurance of what you dislike there is immense good; and know that victory accompanies patience, relief accompanies affliction, and ease accompanies hardship.”',
    context: 'The golden counsel given by Prophet Muhammad ﷺ to the young Ibn Abbas (RA) while riding together.',
    reflection: 'Affliction and relief are twin travelers. The deeper the darkness of the night, the closer the first golden rays of Fajr. Hold on just a little longer.',
    reference: 'Jami` at-Tirmidhi & Musnad Ahmad',
    narrator: 'Abdullah ibn Abbas (RA)',
    soothingTheme: 'ease_after_hardship',
    icon: '💎',
    tag: 'Victory with Patience'
  },
  {
    id: 'hope-hadith-good-opinion',
    type: 'hadith',
    title: 'Allah is as You Expect of Him',
    arabicTitle: 'أَنَا عِنْدَ ظَنِّ عَبْدِي بِي',
    arabic: 'يَقُولُ اللَّهُ تَعَالَى : أَنَا عِنْدَ ظَنِّ عَبْدِي بِي ، وَأَنَا مَعَهُ إِذَا ذَكَرَنِي ، فَإِنْ ذَكَرَنِي فِي نَفْسِهِ ذَكَرْتُهُ فِي نَفْسِي',
    translation: '“Allah the Exalted says: ‘I am as My servant expects Me to be, and I am with him when he remembers Me. If he remembers Me within himself, I remember him within Myself... and if he comes walking to Me, I come running to him.’”',
    context: 'Sacred Hadith Qudsi recorded in Sahih al-Bukhari (7405) and Sahih Muslim.',
    reflection: 'Expect miracles. Expect healing. Expect forgiveness. When you have beautiful thoughts of Allah’s loving-kindness, He showers you with even greater beauty than you ever dared to imagine.',
    reference: 'Sahih al-Bukhari 7405 & Sahih Muslim',
    narrator: 'Abu Hurairah (RA)',
    soothingTheme: 'divine_nearness',
    icon: '🌟',
    tag: 'Beautiful Hope'
  },
  {
    id: 'hope-story-yunus',
    type: 'story',
    title: 'The Light Inside Three Darknesses: Prophet Yunus (AS)',
    arabicTitle: 'نَجَاةُ ذِي النُّونِ فِي ظُلُمَاتِ الْيَمِّ',
    translation: '“There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.” (Quran 21:87)',
    context: 'Trapped in three insurmountable layers of darkness: the blackness of the night, the depths of the ocean abyss, and the stomach of a great whale.',
    reflection: 'No human agency, submarine, or ship could reach Yunus. He had nothing except his humble whisper to Allah. That single sincere prayer pierced through the ocean floors and reached the Divine Throne. Allah commanded the beast not to harm him, washed him gently ashore, and grew a soothing gourd plant to shade and nourish his skin. \n\nWhatever ocean of grief or trapped situation you find yourself in today — no whale is bigger than Allah’s mercy. Whisper your prayer with certainty; rescue is already on its way.',
    reference: 'Surah Al-Anbiya [21:87-88]',
    soothingTheme: 'ease_after_hardship',
    icon: '🐋',
    tag: 'Story of Rescue'
  },
  {
    id: 'hope-story-cave-thawr',
    type: 'story',
    title: 'The Fragile Spiderweb and the Mighty Peace: Cave of Thawr',
    arabicTitle: 'لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا',
    translation: '“Do not grieve; indeed Allah is with us.” (Quran 9:40)',
    context: 'Prophet Muhammad ﷺ and his beloved companion Abu Bakr (RA) hiding during the dangerous Hijrah migration, while assassins stood right at the entrance of the cave.',
    reflection: 'Abu Bakr whispered with trembling concern: “O Messenger of Allah, if one of them merely looks down at their feet, they will see us!” The Prophet ﷺ looked back with profound serenity and smiled: “O Abu Bakr, what do you think of two people when Allah is the third?” \n\nAllah did not need an army of iron to protect them; He sent a fragile spider to spin a web and a dove to lay eggs in a nest. When Allah protects you, the most delicate creature becomes an impenetrable fortress. Peace is not the absence of danger — peace is the presence of Allah.',
    reference: 'Surah At-Tawbah [9:40] & Sahih al-Bukhari',
    soothingTheme: 'unshakeable_trust',
    icon: '🕊️',
    tag: 'Story of Serenity'
  },
  {
    id: 'hope-story-ayyub-healing',
    type: 'story',
    title: 'The Cool Healing Spring: Prophet Ayyub’s Restoration',
    arabicTitle: 'شِفَاءُ أَيُّوبَ وَرَحْمَةُ الْغَفُورِ',
    translation: '“Adversity has touched me, and You are the Most Merciful of the merciful.” (Quran 21:83)',
    context: 'Prophet Ayyub (AS) endured years of severe debilitating illness, loss of children, and collapse of wealth, yet his tongue never ceased praising Allah.',
    reflection: 'When Ayyub finally made supplication, he did not demand or complain. He merely stated his condition and praised Allah’s mercy. Immediately, Allah said: “Strike [the ground] with your foot; this is a spring for a cool bath and drink.” (38:42). In a single moment, every cell of his body was restored to radiant youth, and Allah multiplied his wealth and reunited his family.\n\nYour chronic pain, your prolonged wait, your tears at Tahajjud are all seen. The cure and restitution from your Lord are richer than anything you lost along the way.',
    reference: 'Surah Al-Anbiya [21:83-84] & Surah Sad [38:41-44]',
    soothingTheme: 'solace_in_trials',
    icon: '🌿',
    tag: 'Story of Healing'
  },
  {
    id: 'hope-story-musa-sea',
    type: 'story',
    title: 'The Parting of the Impossible Sea: Prophet Musa (AS)',
    arabicTitle: 'كَلَّا إِنَّ مَعِيَ رَبِّي سَيَهْدِينِ',
    translation: '“Nay, indeed with me is my Lord; He will guide me.” (Quran 26:62)',
    context: 'Bani Israel trapped at the edge of the roaring Red Sea with Pharaoh’s vast chariot army charging from behind.',
    reflection: 'His companions cried in despair: “We are surely overtaken!” Every worldly calculation was a dead end. But Musa had certainty rooted in the Divine: “Kalla!” (Never!). He struck the water with his simple wooden staff, and the sea parted into twelve crystalline dry highways with towering walls of water on either side.\n\nWhen you feel trapped with nowhere to turn, do not look at the size of the sea or the strength of the problem. Look at the One who controls the water. The way forward will open at the exact right moment.',
    reference: 'Surah Ash-Shu’ara [26:61-68]',
    soothingTheme: 'unshakeable_trust',
    icon: '🌊',
    tag: 'Story of Deliverance'
  },
  {
    id: 'hope-story-maryam-palm',
    type: 'story',
    title: 'The Fresh Spring in the Desert: Maryam (AS)',
    arabicTitle: 'فَنَادَاهَا مِن تَحْتِهَا أَلَّا تَحْزَنِي',
    translation: '“Grieve not; your Lord has provided beneath you a stream.” (Quran 19:24)',
    context: 'Maryam in her loneliest, most painful hour of childbirth under a barren date palm tree in the desert.',
    reflection: 'In the depth of physical pain and public vulnerability, Maryam wished she had died and been forgotten. But Allah sent angel Jibreel to soothe her: “Do not grieve!” A fresh, crystal-clear stream bubbled right beneath her feet, and shaking a barren dry tree rained down sweet, nourishing fresh dates.\n\nWhen you feel drained and isolated, know that Allah provides comfort right where you are. He creates water in the desert and life from dry branches. You are deeply cherished.',
    reference: 'Surah Maryam [19:23-26]',
    soothingTheme: 'mercy_and_forgiveness',
    icon: '🌴',
    tag: 'Story of Comfort'
  }
];

export function getRandomHopeItem(type?: 'ayah' | 'hadith' | 'story'): HopeItem {
  const pool = type 
    ? MIND_EASING_HOPE_COLLECTION.filter(item => item.type === type)
    : MIND_EASING_HOPE_COLLECTION;
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex] || MIND_EASING_HOPE_COLLECTION[0];
}

export function getHopeItemForDay(date: Date = new Date()): HopeItem {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % MIND_EASING_HOPE_COLLECTION.length;
  return MIND_EASING_HOPE_COLLECTION[index];
}
