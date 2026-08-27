export interface DhikrItem {
  id: string;
  arabic: string;
  transliteration?: string;
  english: string;
  benefit: string;
  targetCount: number;
}

export interface DhikrCategory {
  id: string;
  category: string;
  iconName: string;
  items: DhikrItem[];
}

import { EXPANDED_ADHKAR_CATEGORIES } from './expandedAdhkar.ts';

export const ALL_ADHKAR_CATEGORIES: DhikrCategory[] = [
  {
    id: "morning",
    category: "Morning Adhkar (أذكار الصباح)",
    iconName: "Sun",
    items: [
      {
        id: "m1",
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration: "Asbahna wa-asbahal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer.",
        english: "We have entered a new day and with it all dominion is Allah's. Praise is to Allah. None has the right to be worshipped but Allah alone with no partner.",
        benefit: "Affirmation of Tawheed and divine sovereign protection throughout the daylight hours.",
        targetCount: 1
      },
      {
        id: "m2",
        arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        transliteration: "Bismillāhilladhī lā yadurru ma‘as-mihī shay'un fil-ardi wa lā fis-samā'i wa huwas-Samī‘ul-‘Alīm.",
        english: "In the Name of Allah with Whose Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.",
        benefit: "Recited 3 times: Total immunity from sudden harm, poison, or calamity until evening.",
        targetCount: 3
      },
      {
        id: "m3",
        arabic: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
        transliteration: "Radeetu billahi Rabba, wa bil-Islami deena, wa bi-Muhammadin sallallahu 'alayhi wa sallama Nabiyya.",
        english: "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace be upon him) as my Prophet.",
        benefit: "Recited 3 times: Allah promises to please the servant on the Day of Resurrection.",
        targetCount: 3
      },
      {
        id: "m4",
        arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
        transliteration: "Ya Hayyu Ya Qayyoom, bi-rahmatika astagheeth, aslih lee sha'nee kullahu wa la takilnee ila nafsee tarfata 'ayn.",
        english: "O Ever-Living, O Self-Subsisting, by Your mercy I seek help. Rectify all my affairs and do not leave me to myself for even the blink of an eye.",
        benefit: "Supplication for divine intervention and inner tranquility.",
        targetCount: 1
      },
      {
        id: "m5",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
        transliteration: "Subhanallahi wa bihamdihi: 'adada khalqihi, wa rida nafsihi, wa zinata 'arshihi, wa midada kalimatih.",
        english: "Glory is to Allah and praise is to Him, by the multitude of His creation, by His Pleasure, by the weight of His Throne, and by the extent of His Words.",
        benefit: "Recited 3 times: Rewards exceeding hours of ordinary tasbih.",
        targetCount: 3
      },
      {
        id: "m6",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
        transliteration: "Allahumma innee as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan.",
        english: "O Allah, I ask You for beneficial knowledge, good and pure provision, and deeds that are accepted.",
        benefit: "Recited after Fajr prayer: Directs productivity and halal sustenance for the day.",
        targetCount: 1
      },
      {
        id: "m7",
        arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ",
        transliteration: "Allahumma 'afinee fee badanee, Allahumma 'afinee fee sam'ee, Allahumma 'afinee fee basaree, la ilaha illa Ant.",
        english: "O Allah, grant wellness to my body. O Allah, grant wellness to my hearing. O Allah, grant wellness to my sight. None has the right to be worshipped but You.",
        benefit: "Recited 3 times: Preserves physical vitality, mental clarity, and spiritual sensory purity.",
        targetCount: 3
      },
      {
        id: "m8",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ",
        transliteration: "Allahumma innee a'oodhu bika minal-kufri wal-faqr, wa a'oodhu bika min 'adhabil-qabr, la ilaha illa Ant.",
        english: "O Allah, I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. None has the right to be worshipped but You.",
        benefit: "Protection against financial ruin, spiritual decay, and torment of the grave.",
        targetCount: 3
      }
    ]
  },
  {
    id: "evening",
    category: "Evening Adhkar (أذكار المساء)",
    iconName: "Moon",
    items: [
      {
        id: "e1",
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration: "Amsayna wa-amsal-mulku lillah wal-hamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer.",
        english: "We have reached evening and with it all dominion belongs to Allah. Praise is to Allah. None has the right to be worshipped but Allah alone without partner.",
        benefit: "Gratitude and spiritual realignment as twilight settles.",
        targetCount: 1
      },
      {
        id: "e2",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        transliteration: "A'oodhu bi-kalimatillahit-tammati min sharri ma khalaq.",
        english: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
        benefit: "Recited 3 times: Protects against stings, venomous creatures, and unseen perils throughout the night.",
        targetCount: 3
      },
      {
        id: "e3",
        arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
        transliteration: "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namootu, wa ilaykal-maseer.",
        english: "O Allah, by You we enter the evening, by You we enter the morning, by You we live, by You we die, and unto You is our final return.",
        benefit: "Deep consciousness of the soul's fragility and ultimate journey to the Creator.",
        targetCount: 1
      },
      {
        id: "e4",
        arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        transliteration: "Hasbiyallahu la ilaha illa Huwa 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem.",
        english: "Allah is sufficient for me; there is no deity except Him. On Him I rely, and He is the Lord of the Great Throne.",
        benefit: "Recited 7 times morning & evening: Allah relieves every anxiety and distress of worldly and hereafter matters.",
        targetCount: 7
      }
    ]
  },
  {
    id: "sleep",
    category: "Sleep & Night Adhkar (أذكار النوم والليل)",
    iconName: "Moon",
    items: [
      {
        id: "sl1",
        arabic: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
        transliteration: "Bismika Rabbi wada'tu janbee, wa bika arfa'uh, fa in amsakta nafsee farhamha, wa in arsaltaha fahfadh-ha bima tahfadhu bihi 'ibadakas-saliheen.",
        english: "In Your name my Lord, I lie down, and in Your name I rise. If You take my soul, have mercy upon it, and if You release it, protect it as You protect Your righteous servants.",
        benefit: "Angel protection assigned through the night until waking.",
        targetCount: 1
      },
      {
        id: "sl2",
        arabic: "اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا. اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ",
        transliteration: "Allahumma innaka khalaqta nafsee wa Anta tawaffaha, laka mamatuha wa mahyaha, in ahyaytaha fahfadh-ha wa in amattaha faghfir laha. Allahumma innee as'alukal-'afiyah.",
        english: "O Allah, You created my soul and You take it. To You belongs its life and death. If You grant it life, protect it; and if You cause it to die, forgive it. O Allah, I ask You for well-being.",
        benefit: "Peaceful rest with the soul entrusted directly to Allah.",
        targetCount: 1
      },
      {
        id: "sl3",
        arabic: "سُبْحَانَ اللَّهِ (33x)، الْحَمْدُ لِلَّهِ (33x)، اللَّهُ أَكْبَرُ (34x)",
        transliteration: "Subhanallah (33x), Alhamdulillah (33x), Allahu Akbar (34x).",
        english: "Tasbih of Fatimah (RA): Glory be to Allah 33 times, Praise be to Allah 33 times, Allah is the Greatest 34 times before sleeping.",
        benefit: "Better and more revitalizing for physical stamina than having a helper or servant.",
        targetCount: 1
      },
      {
        id: "sl4",
        arabic: "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ...",
        transliteration: "Amanar-Rasoolu bima unzila ilayhi mir-Rabbihi wal-mu'minoon...",
        english: "The Messenger has believed in what was revealed to him from his Lord, and so have the believers... (Last 2 verses of Surah Al-Baqarah 285-286).",
        benefit: "Whoever recites the last two verses of Surah Al-Baqarah at night, they will be sufficient for him against every evil.",
        targetCount: 1
      }
    ]
  },
  {
    id: "prayer_dhikr",
    category: "After Obligatory Salah (أذكار بعد الصلاة)",
    iconName: "Sparkles",
    items: [
      {
        id: "ps1",
        arabic: "أَسْتَغْفِرُ اللَّهَ (3x) ، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        transliteration: "Astaghfirullah (3x). Allahumma Antas-Salam wa minkas-salam, tabarakta ya Dhal-Jalali wal-Ikram.",
        english: "I seek forgiveness of Allah (3x). O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of Majesty and Honor.",
        benefit: "Prophetic Sunnah immediately upon making Salam from prayer.",
        targetCount: 1
      },
      {
        id: "ps2",
        arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ",
        transliteration: "Allahumma a'innee 'ala dhikrika wa shukrika wa husni 'ibadatik.",
        english: "O Allah, help me in remembering You, expressing gratitude to You, and worshipping You with excellence.",
        benefit: "Taught by the Prophet ﷺ to Mu'adh ibn Jabal (RA) out of deep love.",
        targetCount: 1
      },
      {
        id: "ps3",
        arabic: "سُبْحَانَ اللَّهِ (33x)، الْحَمْدُ لِلَّهِ (33x)، اللَّهُ أَكْبَرُ (33x)، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ (1x)",
        transliteration: "Subhanallah (33x), Alhamdulillah (33x), Allahu Akbar (33x), La ilaha illallahu wahdahu la shareeka lah... (1x)",
        english: "Glory be to Allah (33), Praise be to Allah (33), Allah is the Greatest (33), and sealing with the Kalimah.",
        benefit: "Completes 100 counts and forgives all minor sins.",
        targetCount: 1
      },
      {
        id: "ps4",
        arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ...",
        transliteration: "Allahu la ilaha illa Huwal-Hayyul-Qayyoom...",
        english: "Ayat al-Kursi (2:255): Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence...",
        benefit: "Whoever recites Ayat al-Kursi after every obligatory prayer, nothing stands between him and entering Paradise except death.",
        targetCount: 1
      }
    ]
  },
  {
    id: "distress",
    category: "Relief of Distress & Anxiety (تفريج الكرب والهم)",
    iconName: "Heart",
    items: [
      {
        id: "d1",
        arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
        transliteration: "La ilaha illa Anta subhanaka innee kuntu minaz-zalimeen.",
        english: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
        benefit: "Du'a of Yunus (AS) in the whale's belly: No believer makes this dua except that Allah delivers him from grief.",
        targetCount: 33
      },
      {
        id: "d2",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ",
        transliteration: "Allahumma innee a'oodhu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa dala'id-dayni wa ghalabatir-rijal.",
        english: "O Allah, I seek refuge in You from grief and sadness, helplessness and laziness, stinginess and cowardice, the burden of debt, and domination by men.",
        benefit: "The ultimate antidote to psychological anxiety, procrastination, and indebtedness.",
        targetCount: 1
      },
      {
        id: "d3",
        arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ",
        transliteration: "Ya Hayyu Ya Qayyoom, bi-rahmatika astagheeth.",
        english: "O Ever-Living, O Sustainer, by Your mercy I seek relief.",
        benefit: "Uttered by the Prophet ﷺ whenever distressed by a grave circumstance.",
        targetCount: 10
      },
      {
        id: "d4",
        arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
        transliteration: "La hawla wa la quwwata illa billahil-'Aliyyil-'Azeem.",
        english: "There is no might nor power except with Allah, the Most High, the Most Great.",
        benefit: "A medicine for 99 spiritual diseases, the least of which is anxiety.",
        targetCount: 33
      }
    ]
  },
  {
    id: "healing",
    category: "Healing & Ruqyah Shifa (أدعية الشفاء والرقية)",
    iconName: "Shield",
    items: [
      {
        id: "h1",
        arabic: "أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ، وَاشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا",
        transliteration: "Adhhibil-ba'sa Rabban-nas, washfi Antash-Shafi, la shifa'a illa shifa'uk, shifa'an la yughadiru saqama.",
        english: "Remove the disease, O Lord of humanity, and cure; You are the Healer. There is no cure but Your cure, a cure that leaves behind no ailment.",
        benefit: "Prophetic Dua for curing bodily pain, illness, and fever.",
        targetCount: 3
      },
      {
        id: "h2",
        arabic: "بِسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ",
        transliteration: "Bismillahi arqeek, min kulli shay'in yu'dheek, min sharri kulli nafsin aw 'ayni hasidin, Allahu yashfeek, bismillahi arqeek.",
        english: "In the name of Allah I perform ruqyah for you, from everything that harms you, from the evil of every soul or envious eye. May Allah cure you; in the name of Allah I perform ruqyah for you.",
        benefit: "The Ruqyah recited by Jibril (AS) upon the Prophet Muhammad ﷺ.",
        targetCount: 3
      },
      {
        id: "h3",
        arabic: "أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ",
        transliteration: "As'alullahal-'Azeema Rabbal-'Arshil-'Azeemi an yashfiyak.",
        english: "I ask Allah the Almighty, Lord of the Magnificent Throne, to cure you.",
        benefit: "Recited 7 times for any sick person whose appointed time has not arrived; Allah grants recovery.",
        targetCount: 7
      }
    ]
  },
  {
    id: "forgiveness",
    category: "Tawbah & Chief of Repentance (سيد الاستغفار والتوبة)",
    iconName: "Award",
    items: [
      {
        id: "f1",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        transliteration: "Allahumma Anta Rabbi la ilaha illa Ant, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't, a'oodhu bika min sharri ma sana't, aboo'u laka bi ni'matika 'alayya wa aboo'u bi dhanbi faghfir lee fa innahu la yaghfirudh-dhunooba illa Ant.",
        english: "Sayyid al-Istighfar (The Master Supplication for Forgiveness): O Allah, You are my Lord, none has the right to be worshipped but You. You created me and I am Your servant...",
        benefit: "Whoever recites this with conviction by day and dies before evening, or by night and dies before morning, enters Jannah directly.",
        targetCount: 1
      },
      {
        id: "f2",
        arabic: "أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ",
        transliteration: "Astaghfirullahalladhi la ilaha illa Huwal-Hayyul-Qayyoomu wa atoobu ilayh.",
        english: "I seek the forgiveness of Allah, other than Whom there is no deity, the Ever-Living, the Sustainer of all existence, and I repent unto Him.",
        benefit: "Whoever says this, his sins are forgiven even if he had fled from the battlefield.",
        targetCount: 3
      },
      {
        id: "f3",
        arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ",
        transliteration: "Rabbigh-fir lee wa tub 'alayya innaka Antat-Tawwabur-Raheem.",
        english: "My Lord, forgive me and accept my repentance, for You are the Acceptor of Repentance, the Most Merciful.",
        benefit: "The companions counted the Prophet ﷺ reciting this over 100 times in a single gathering.",
        targetCount: 100
      }
    ]
  },
  {
    id: "daily_life",
    category: "Daily Life & Transitions (أذكار الدخول والخروج والبركة)",
    iconName: "Sun",
    items: [
      {
        id: "dl1",
        arabic: "بِسْمِ اللَّهِ ، تَوَكَّلْتُ عَلَى اللَّهِ ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        transliteration: "Bismillahi, tawakkaltu 'alallah, wa la hawla wa la quwwata illa billah.",
        english: "In the name of Allah, I place my trust in Allah, and there is no power nor might except with Allah (Leaving home).",
        benefit: "It is said to him: 'You are guided, defended, and protected,' and the shaytan distances himself from him.",
        targetCount: 1
      },
      {
        id: "dl2",
        arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        transliteration: "Allahummaf-tah lee abwaba rahmatik.",
        english: "O Allah, open for me the gates of Your mercy (Entering the Masjid).",
        benefit: "Invokes divine mercy while stepping into the house of Allah.",
        targetCount: 1
      },
      {
        id: "dl3",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
        transliteration: "Allahumma innee as'aluka min fadlik.",
        english: "O Allah, I ask You from Your bounty (Exiting the Masjid).",
        benefit: "Prepares for seeking halal livelihood with divine barakah upon stepping out.",
        targetCount: 1
      },
      {
        id: "dl4",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        transliteration: "Alhamdu lillahilladhi at'amanee hadha wa razaqaneehi min ghayri hawlin minnee wa la quwwah.",
        english: "Praise is to Allah Who has fed me this and provided it for me without any might or power from myself (After eating).",
        benefit: "Whoever recites this after finishing a meal has all his past minor sins forgiven.",
        targetCount: 1
      }
    ]
  },
  {
    id: "prophets_duas",
    category: "Famous Duas of the Prophets (أدعية الأنبياء في القرآن)",
    iconName: "Sparkles",
    items: [
      {
        id: "pd1",
        arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
        transliteration: "Laa ilaaha illaa Anta subhaanaka innee kuntu minadh-dhaalimeen.",
        english: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers (Dua of Prophet Yunus / Jonah in the belly of the whale - Surah Al-Anbiya 21:87).",
        benefit: "Prophet Muhammad ﷺ said: No Muslim supplicates with this in any situation of distress or hardship except that Allah answers him.",
        targetCount: 3
      },
      {
        id: "pd2",
        arabic: "أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ",
        transliteration: "Annee massaniyad-durru wa Anta Arhamur-Raahimeen.",
        english: "Indeed, adversity and affliction have touched me, and You are the Most Merciful of the merciful (Dua of Prophet Ayyub / Job - Surah Al-Anbiya 21:83).",
        benefit: "Supplication for divine healing, endurance, and immediate relief from prolonged sickness or distress.",
        targetCount: 3
      },
      {
        id: "pd3",
        arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي",
        transliteration: "Rabbish-rah lee sadree, wa yassir lee amree, wahlul 'uqdatam-mil-lisaanee, yafqahoo qawlee.",
        english: "My Lord, expand for me my chest with peace, ease for me my task, and untie the knot from my tongue that they may understand my speech (Dua of Prophet Musa / Moses - Surah Taha 20:25-28).",
        benefit: "Removes anxiety, grants eloquence, confidence, and removes mental heaviness before exams, speeches, or challenging tasks.",
        targetCount: 3
      },
      {
        id: "pd4",
        arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
        transliteration: "Rabbij-'alnee muqeemas-Salaati wa min dhurriyyatee, Rabbanaa wa taqabbal du'aa'.",
        english: "My Lord, make me an establisher of prayer, and many from my descendants. Our Lord, and accept my supplication (Dua of Prophet Ibrahim / Abraham - Surah Ibrahim 14:40).",
        benefit: "Preserves devotion to prayer and shields children and generations from abandoning Salah.",
        targetCount: 3
      },
      {
        id: "pd5",
        arabic: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
        transliteration: "Rabbanaa dhalamnaa anfusanaa wa illam taghfir lanaa wa tarhamnaa lana-koonanna minal-khaasireen.",
        english: "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers (Dua of Adam & Hawwa - Surah Al-A'raf 7:23).",
        benefit: "The first repentance of mankind; restores spiritual purity and attracts overwhelming divine mercy.",
        targetCount: 3
      },
      {
        id: "pd6",
        arabic: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
        transliteration: "Rabbi innee limaa anzalta ilayya min khayrin faqeer.",
        english: "My Lord, truly I am in desperate need of whatever good You bestow upon me (Dua of Prophet Musa at the well of Madyan - Surah Al-Qasas 28:24).",
        benefit: "The miraculous Quranic Dua for miraculous provision, halal employment, safety, and a righteous spouse.",
        targetCount: 7
      },
      {
        id: "pd7",
        arabic: "أَنتَ وَلِيِّي فِي الدُّنْيَا وَالْآخِرَةِ ۖ تَوَفَّنِي مُسْلِمًا وَأَلْحِقْنِي بِالصَّالِحِينَ",
        transliteration: "Anta Waliyyee fid-dunyaa wal-Aakhirah, tawaffanee musliman wa al-hiqnee bis-saaliheen.",
        english: "You are my Protector in this world and in the Hereafter. Cause me to die a Muslim and join me with the righteous (Dua of Prophet Yusuf / Joseph - Surah Yusuf 12:101).",
        benefit: "Guarantees a blessed end (Husn al-Khatimah) and companionship with the prophets in Jannah.",
        targetCount: 1
      },
      {
        id: "pd8",
        arabic: "رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الْوَارِثِينَ",
        transliteration: "Rabbi laa tadharnii fardan wa Anta Khayrul-waarithiin.",
        english: "My Lord, do not leave me alone and childless, though You are the Best of inheritors (Dua of Prophet Zakariya - Surah Al-Anbiya 21:89).",
        benefit: "Dua for righteous companions, relief from loneliness, and granting blessed offspring.",
        targetCount: 3
      },
      {
        id: "pd9",
        arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
        transliteration: "Hasbunallaahu wa Ni'mal-Wakeel.",
        english: "Allah alone is sufficient for us, and He is the Best Disposer of affairs (Uttered by Prophet Ibrahim when cast into fire & Prophet Muhammad ﷺ in times of crisis - Surah Ali 'Imran 3:173).",
        benefit: "Transforms insurmountable fire, enemies, and obstacles into coolness, peace, and divine victory.",
        targetCount: 7
      },
      {
        id: "pd10",
        arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
        transliteration: "Rabbanaa aatinaa fid-dunyaa hasanatan wa fil-Aakhirati hasanatan wa qinaa 'adhaaban-Naar.",
        english: "Our Lord, give us in this world that which is good and in the Hereafter that which is good, and protect us from the punishment of the Fire (The most frequent Dua of Prophet Muhammad ﷺ - Surah Al-Baqarah 2:201).",
        benefit: "Comprehensive encompassment of all worldly well-being, righteous family, halal wealth, and Paradise.",
        targetCount: 3
      }
    ]
  },
  {
    id: "seeking_marriage",
    category: "Duas for Seeking a Righteous Spouse (أدعية تيسير الزواج والزوج الصالح)",
    iconName: "Heart",
    items: [
      {
        id: "sm1",
        arabic: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
        transliteration: "Rabbi innee limaa anzalta ilayya min khayrin faqeer.",
        english: "My Lord, truly I am in dire need of whatever good You bestow upon me (Surah Al-Qasas 28:24).",
        benefit: "Prophet Musa's supplication at Madyan; immediately after reciting this, Allah blessed him with shelter, righteous work, and marriage to a noble wife.",
        targetCount: 7
      },
      {
        id: "sm2",
        arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
        transliteration: "Rabbanaa hab lanaa min azwaajinaa wa dhurriyyatinaa qurrata a'yunin waj'alnaa lil-muttaqeena imaama.",
        english: "Our Lord, grant us from among our spouses and offspring comfort to our eyes, and make us leaders for the righteous (Surah Al-Furqan 25:74).",
        benefit: "Supplication of the servants of the Most Merciful (Ibadur-Rahman) for a loving, pious spouse and noble lineage.",
        targetCount: 3
      },
      {
        id: "sm3",
        arabic: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا ، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
        transliteration: "Allahumma laa sahla illaa maa ja'altahu sahlaa, wa Anta taj'alul-hazna idhaa shi'ta sahlaa.",
        english: "O Allah, there is no ease except in that which You have made easy, and You make the difficult easy when You will (Sahih Ibn Hibban).",
        benefit: "Removes blockages, complications, and anxieties when searching for a spouse or finalizing marriage arrangements.",
        targetCount: 3
      },
      {
        id: "sm4",
        arabic: "رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الْوَارِثِينَ",
        transliteration: "Rabbi laa tadharnii fardan wa Anta Khayrul-waarithiin.",
        english: "My Lord, do not leave me alone and single, and You are the Best of inheritors (Surah Al-Anbiya 21:89).",
        benefit: "Recited with sincerity for companionship, ending loneliness, and finding a supportive life partner.",
        targetCount: 3
      },
      {
        id: "sm5",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِعِلْمِكَ الْغَيْبَ وَقُدْرَتِكَ عَلَى الْخَلْقِ أَنْ تُقَدِّرَ لِي خَيْرَ الزَّوْجِ وَأَصْلَحَهُ لِدِينِي وَدُنْيَايَ وَعَاقِبَةِ أَمْرِي",
        transliteration: "Allahumma innee as'aluka bi-'ilmikal-ghayba wa qudratika 'alal-khalqi an tuqaddira lee khayraz-zawji wa aslahahu li-deenee wa dunyaaya wa 'aaqibati amree.",
        english: "O Allah, I ask You by Your knowledge of the unseen and Your power over creation to decree for me the best and most righteous spouse for my deen, my worldly life, and the outcome of my affairs.",
        benefit: "Istikharah-rooted supplication for divine matching with a spouse who brings closeness to Allah.",
        targetCount: 1
      },
      {
        id: "sm6",
        arabic: "رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً ۖ إِنَّكَ سَمِيعُ الدُّعَاءِ",
        transliteration: "Rabbi hab lee mil-ladunka dhurriyyatan tayyibah, innaka Samee'ud-du'aa'.",
        english: "My Lord, grant me from Yourself a good offspring; indeed, You are the Hearer of supplication (Surah Ali 'Imran 3:38).",
        benefit: "Prophet Zakariya's prayer for noble character, righteous family, and answered prayers.",
        targetCount: 3
      }
    ]
  },
  {
    id: "married_couples",
    category: "Duas for Married Couples & Family Harmony (أدعية المتزوجين والبركة في البيت)",
    iconName: "Users",
    items: [
      {
        id: "mc1",
        arabic: "بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
        transliteration: "Baarakallaahu laka wa baaraka 'alayka wa jama'a baynakumaa fee khayr.",
        english: "May Allah bless you, shower His blessings upon you, and unite you both in goodness and harmony (Sunnah Wedding Supplication - Sunan Abi Dawud 2130).",
        benefit: "The Prophetic blessing upon newly married couples that seals divine barakah into their marital bond.",
        targetCount: 1
      },
      {
        id: "mc2",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا جَبَلْتَهَا عَلَيْهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا جَبَلْتَهَا عَلَيْهِ",
        transliteration: "Allahumma innee as'aluka khayrahaa wa khayra maa jabaltahaa 'alayh, wa a'oodhu bika min sharrihaa wa sharri maa jabaltahaa 'alayh.",
        english: "O Allah, I ask You for the goodness in my spouse and the good nature with which You created them, and I seek refuge in You from any evil in them and any harmful nature with which You created them (Sunan Abi Dawud 2160).",
        benefit: "Recited on the wedding night / during marriage to invite enduring kindness, peace, and mutual love.",
        targetCount: 1
      },
      {
        id: "mc3",
        arabic: "اللَّهُمَّ أَلِّفْ بَيْنَ قُلُوبِنَا، وَأَصْلِحْ ذَاتَ بَيْنِنَا، وَاهْدِنَا سُبُلَ السَّلَامِ، وَنَجِّنَا مِنَ الظُّلُمَاتِ إِلَى النُّورِ",
        transliteration: "Allahumma allif bayna quloobinaa, wa aslih dhaata bayninaa, wahdinaa subulas-salaam, wa najjinaa minadh-dhulumaati ilan-noor.",
        english: "O Allah, unite our hearts in love, reconcile between us, guide us to the ways of peace, and deliver us from darkness into the light (Sunan Abi Dawud).",
        benefit: "The most powerful supplication for cooling arguments, removing discord, and strengthening emotional intimacy between husband and wife.",
        targetCount: 3
      },
      {
        id: "mc4",
        arabic: "بِسْمِ اللَّهِ ، اللَّهُمَّ جَنِّبْنَا الشَّيْطَانَ ، وَجَنِّبِ الشَّيْطَانَ مَا رَزَقْتَنَا",
        transliteration: "Bismillaah, Allahumma jannibnash-shaytaan, wa jannibish-shaytaana maa razaqtanaa.",
        english: "In the name of Allah. O Allah, distance Satan from us, and distance Satan from whatever You bestow upon us of offspring (Sahih Bukhari 6388).",
        benefit: "If the couple conceives a child from that intimacy, Satan will never be able to harm or mislead that child.",
        targetCount: 1
      },
      {
        id: "mc5",
        arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَصْلِحْ لِي فِي ذُرِّيَّتِي ۖ إِنِّي تُبْتُ إِلَيْكَ وَإِنِّي مِنَ الْمُسْلِمِينَ",
        transliteration: "Rabbi awzi'nee an ashkura ni'matakal-latee an'amta 'alayya wa 'alaa waalidayya wa an a'mala saalihan tardaahu wa aslih lee fee dhurriyyatee, innee tubtu ilayka wa innee minal-muslimeen.",
        english: "My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents, and to work righteousness of which You will approve, and make righteous for me my offspring. Indeed, I have repented to You, and indeed, I am of the Muslims (Surah Al-Ahqaf 46:15).",
        benefit: "Invites continuous barakah, gratitude, and moral uprightness in the household.",
        targetCount: 1
      },
      {
        id: "mc6",
        arabic: "اللَّهُمَّ بَارِكْ لَنَا فِي أَهْلِنَا وَبَارِكْ لِأَهْلِنَا فِينَا، وَارْزُقْنَا مِنْهُمْ وَارْزُقْهُمْ مِنَّا، وَاجْمَعْ بَيْنَنَا مَا جَمَعْتَ فِي خَيْرٍ",
        transliteration: "Allahumma baarik lanaa fee ahlinaa wa baarik li-ahlinaa feenaa, war-zuqnaa minhum war-zuqhum minnaa, wajma' baynanaa maa jama'ta fee khayr.",
        english: "O Allah, bless us in our family and bless our family in us; provide for us through them and provide for them through us; and unite us in goodness as long as You unite us (Musannaf Ibn Abi Shaybah).",
        benefit: "Supplication of Abdullah ibn Mas'ud for building an affectionate, blessed, and tranquil Islamic home.",
        targetCount: 1
      }
    ]
  },
  ...EXPANDED_ADHKAR_CATEGORIES
];

