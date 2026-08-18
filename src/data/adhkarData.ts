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
        transliteration: "A'oodhu bi-kalimatil-lahit-tammati min sharri ma khalaq.",
        english: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
        benefit: "Recited 3 times: Shield against stings, bites, evil spirits, and nocturnal harm.",
        targetCount: 3
      },
      {
        id: "e3",
        arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        transliteration: "Hasbiyallahu la ilaha illa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem.",
        english: "Allah is sufficient for me. None has the right to be worshipped but He. In Him I put my trust and He is the Lord of the Mighty Throne.",
        benefit: "Recited 7 times: Allah suffices all burdens, anxiety, and concerns of this world and the next.",
        targetCount: 7
      },
      {
        id: "e4",
        arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
        transliteration: "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namootu wa ilaykal-maseer.",
        english: "O Allah, by You we reach the evening and by You we reach the morning, by You we live and die, and to You is our ultimate return.",
        benefit: "Surrendering one's mortal timeline into Allah's gentle custody.",
        targetCount: 1
      },
      {
        id: "e5",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي",
        transliteration: "Allahumma innee as'alukal-'afwa wal-'afiyata fid-dunya wal-akhirah. Allahummastur 'awratee wa amin raw'atee.",
        english: "O Allah, I ask You for pardon and well-being in this world and the Hereafter. O Allah, conceal my faults and reassure my fears.",
        benefit: "Comprehensive fortification shielding from all directions.",
        targetCount: 1
      }
    ]
  },
  {
    id: "sleep",
    category: "Sleeping & Waking (النوم والاستيقاظ)",
    iconName: "Shield",
    items: [
      {
        id: "s1",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        transliteration: "Bismika Allahumma amootu wa ahya.",
        english: "In Your name, O Allah, I die and I live.",
        benefit: "Sunnah dua before resting to invite peace into sleep.",
        targetCount: 1
      },
      {
        id: "s2",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        transliteration: "Alhamdu lillahil-ladhee ahyana ba'da ma amatana wa ilayhin-nushoor.",
        english: "Praise is to Allah Who gives us life after He has caused us to die and unto Him is the resurrection.",
        benefit: "The very first consciousness of gratitude upon opening eyes.",
        targetCount: 1
      },
      {
        id: "s3",
        arabic: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
        transliteration: "Bismika Rabbee wada'tu janbee, wa bika arfa'uh, fa in amsakta nafsee farhamha, wa in arsaltaha fahfadh-ha bima tahfadhu bihi 'ibadakas-saliheen.",
        english: "In Your name my Lord, I lay my side down and in Your name I raise it up. If You retain my soul, show it mercy, and if You release it, preserve it as You preserve Your righteous servants.",
        benefit: "Angelic bodyguard stationed over the sleeper all night.",
        targetCount: 1
      },
      {
        id: "s4",
        arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
        transliteration: "Allahumma qinee 'adhabaka yawma tab'athu 'ibadak.",
        english: "O Allah, protect me from Your punishment on the Day You resurrect Your servants.",
        benefit: "Recited 3 times placing the right hand under the right cheek.",
        targetCount: 3
      },
      {
        id: "s5",
        arabic: "سُبْحَانَ اللَّهِ (33x)، الْحَمْدُ لِلَّهِ (33x)، اللَّهُ أَكْبَرُ (34x)",
        transliteration: "Subhanallah (33x), Alhamdulillah (33x), Allahu Akbar (34x).",
        english: "Glory be to Allah (33), Praise be to Allah (33), Allah is the Greatest (34).",
        benefit: "Tasbih Fatimah: Bestowed by the Prophet ﷺ to Fatima and Ali (RA) - grants spiritual energy superior to a servant.",
        targetCount: 100
      }
    ]
  },
  {
    id: "forgiveness",
    category: "Praise & Forgiveness (الاستغفار والتسبيح)",
    iconName: "Award",
    items: [
      {
        id: "pf1",
        arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
        transliteration: "Astaghfirullaha wa atoobu ilayh.",
        english: "I seek Allah's forgiveness and turn to Him in sincere repentance.",
        benefit: "Cleanses the heart and invites rain, strength, and children (100x daily).",
        targetCount: 100
      },
      {
        id: "pf2",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        transliteration: "Subhanallahi wa bihamdihi.",
        english: "Glory be to Allah and all praise is due to Him.",
        benefit: "Minor sins forgiven even if they equal the foam of the boundless sea (100x).",
        targetCount: 100
      },
      {
        id: "pf3",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        transliteration: "Allahumma Anta Rabbi la ilaha illa Ant, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't, a'oodhu bika min sharri ma sana't, aboo'u laka bi ni'matika 'alayya wa aboo'u bi dhanbi faghfir lee fa innahu la yaghfirudh-dhunooba illa Ant.",
        english: "O Allah, You are my Lord, none has the right to be worshipped but You. You created me and I am Your servant...",
        benefit: "Sayyid al-Istighfar (Chief of Repentance): Whoever recites with conviction and dies enters Paradise.",
        targetCount: 1
      },
      {
        id: "pf4",
        arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        transliteration: "La hawla wa la quwwata illa billah.",
        english: "There is no power and no might except by Allah.",
        benefit: "A treasure stored beneath the Throne of Ar-Rahman in Jannah.",
        targetCount: 33
      },
      {
        id: "pf5",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ",
        transliteration: "Subhanallahi wa bihamdihi, Subhanallahil-'Azeem.",
        english: "Glory be to Allah and His is the praise; Glory be to Allah the Supreme.",
        benefit: "Two phrases beloved to the Most Merciful and heaviest on the Scales.",
        targetCount: 33
      }
    ]
  },
  {
    id: "prayer_dhikr",
    category: "After Obligatory Swalah (أذكار بعد الصلاة)",
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
        arabic: "آيَةُ الْكُرْسِيِّ: اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...",
        transliteration: "Ayat al-Kursi: Allahu la ilaha illa Huwal-Hayyul-Qayyoom...",
        english: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence...",
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
      }
    ]
  }
];
