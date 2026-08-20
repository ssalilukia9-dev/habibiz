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
  }
];
