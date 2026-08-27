import { DhikrCategory, DhikrItem } from './adhkarData.ts';

// 220+ Authentic Duas, Invocations, and Adhkar from the Quran, Hisn al-Muslim, and Sunnah
export const EXPANDED_ADHKAR_CATEGORIES: DhikrCategory[] = [
  {
    id: "rabbana_quranic",
    category: "40 Sacred Rabbana Quranic Duas (أدعية ربنا من القرآن الكريم)",
    iconName: "BookOpen",
    items: [
      {
        id: "rb1",
        arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
        transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.",
        english: "Our Lord! Grant us good in this world and good in the Hereafter, and save us from the torment of the Fire (Al-Baqarah 2:201).",
        benefit: "The most comprehensive and frequently recited du'a of the Prophet ﷺ.",
        targetCount: 3
      },
      {
        id: "rb2",
        arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ",
        transliteration: "Rabbana la tuzigh quloobana ba'da idh hadaytana wa hab lana min ladunka rahmah, innaka Antal-Wahhab.",
        english: "Our Lord! Let not our hearts deviate now after You have guided us, and grant us mercy from Yourself; truly You are the Bestower (Ali 'Imran 3:8).",
        benefit: "Protects the heart from spiritual deviation and steadfastness upon Iman.",
        targetCount: 3
      },
      {
        id: "rb3",
        arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
        transliteration: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin waj'alna lil-muttaqeena imama.",
        english: "Our Lord! Grant us through our spouses and offspring the coolness of our eyes and make us leaders of the righteous (Al-Furqan 25:74).",
        benefit: "Instills joy, harmony, and righteous character in family and children.",
        targetCount: 3
      },
      {
        id: "rb4",
        arabic: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ",
        transliteration: "Rabbanagh-fir lee wa li-walidayya wa lil-mu'mineena yawma yaqoomul-hisab.",
        english: "Our Lord! Forgive me and my parents, and all believers on the Day when the reckoning will be established (Ibrahim 14:41).",
        benefit: "Supplication of Prophet Ibrahim (AS) for parents and the entire global Ummah.",
        targetCount: 3
      },
      {
        id: "rb5",
        arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
        transliteration: "Rabbir-hamhuma kama rabbayanee sagheera.",
        english: "My Lord! Bestow Your mercy upon my parents, even as they brought me up when I was small (Al-Isra 17:24).",
        benefit: "Honoring parents with continuous divine mercy throughout their lives and after.",
        targetCount: 7
      },
      {
        id: "rb6",
        arabic: "رَبِّ زِدْنِي عِلْمًا",
        transliteration: "Rabbi zidnee 'ilma.",
        english: "My Lord! Increase me in knowledge and spiritual wisdom (Ta-Ha 20:114).",
        benefit: "Expands mental capacity, clarity of thought, and deep comprehension.",
        targetCount: 7
      },
      {
        id: "rb7",
        arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي",
        transliteration: "Rabbish-rah lee sadree, wa yassir lee amree, wahlul 'uqdatan min lisanee yafqahoo qawlee.",
        english: "My Lord! Expand for me my chest with assurance, ease for me my task, and untie the knot from my tongue so they may understand my speech (Ta-Ha 20:25-28).",
        benefit: "Relieves speech anxiety, exam stress, public speaking fear, and heavy responsibilities.",
        targetCount: 3
      },
      {
        id: "rb8",
        arabic: "رَبَّنَا عَلَيْكَ تَوَكَّلْنَا وَإِلَيْكَ أَنَبْنَا وَإِلَيْكَ الْمَصِيرُ",
        transliteration: "Rabbana 'alayka tawakkalna wa ilayka anabna wa ilaykal-maseer.",
        english: "Our Lord! In You we have placed our trust, and to You we turn in repentance, and to You is the final return (Al-Mumtahanah 60:4).",
        benefit: "Anchors the soul in complete reliance (Tawakkul) upon Allah.",
        targetCount: 3
      },
      {
        id: "rb9",
        arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
        transliteration: "La ilaha illa Anta subhanaka innee kuntu minadh-dhalimeen.",
        english: "There is no deity except You, Glory be to You! Truly I have been among the wrongdoers (Al-Anbiya 21:87).",
        benefit: "Du'a of Yunus (AS) — No distressed believer calls with this except that Allah relieves him.",
        targetCount: 33
      },
      {
        id: "rb10",
        arabic: "رَبِّ أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ",
        transliteration: "Rabbi annee massaniyad-durru wa Anta Arhamur-Rahimeen.",
        english: "My Lord! Indeed adversity has touched me, and You are the Most Merciful of all who show mercy (Al-Anbiya 21:83).",
        benefit: "Du'a of Ayyub (AS) for recovery from long illness, pain, and severe trials.",
        targetCount: 7
      }
    ]
  },
  {
    id: "tahajjud_vigil",
    category: "Tahajjud & Night Vigil Duas (أدعية قيام الليل والتهجد)",
    iconName: "Moon",
    items: [
      {
        id: "th1",
        arabic: "اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ نُورُ السَّمَاوَاتِ وَالأَرْضِ وَمَنْ فِيهِنَّ، وَلَكَ الْحَمْدُ أَنْتَ قَيِّمُ السَّمَاوَاتِ وَالأَرْضِ وَمَنْ فِيهِنَّ، وَلَكَ الْحَمْدُ أَنْتَ الْحَقُّ وَوَعْدُكَ الْحَقُّ وَلِقَاؤُكَ حَقٌّ وَالْجَنَّةُ حَقٌّ وَالنَّارُ حَقٌّ",
        transliteration: "Allahumma lakal-hamdu Anta noorus-samawati wal-ardi wa man feehinna, wa lakal-hamdu Anta qayyimus-samawati wal-ardi wa man feehinna, wa lakal-hamdu Antal-Haqqu wa wa'dukal-haqqu wa liqa'uka haqqun wal-Jannatu haqqun wan-Naru haqqun.",
        english: "O Allah, to You belongs all praise; You are the Light of the heavens and the earth and all that is within them. To You belongs all praise; You are the Sustainer of the heavens and earth and all within them.",
        benefit: "The Prophetic opening du'a upon rising for Tahajjud prayer (Sahih al-Bukhari 1120).",
        targetCount: 1
      },
      {
        id: "th2",
        arabic: "اللَّهُمَّ لَكَ أَسْلَمْتُ، وَبِكَ آمَنْتُ، وَعَلَيْكَ تَوَكَّلْتُ، وَإِلَيْكَ أَنَبْتُ، وَبِكَ خَاصَمْتُ، وَإِلَيْكَ حَاكَمْتُ، فَاغْفِرْ لِي مَا قَدَّمْتُ وَمَا أَخَّرْتُ، وَمَا أَسْرَرْتُ وَمَا أَعْلَنْتُ",
        transliteration: "Allahumma laka aslamtu, wa bika amantu, wa 'alayka tawakkaltu, wa ilayka anabtu, wa bika khasmtu, wa ilayka hakamtu, faghfir lee ma qaddamtu wa ma akhkhartu, wa ma asrartu wa ma a'lantu.",
        english: "O Allah, to You I submit, in You I believe, upon You I rely, to You I turn in repentance, for You I argue, and to You I refer for judgment. Forgive my past and future sins, what I concealed and what I declared.",
        benefit: "Supplication for total surrender, absolution of all faults, and divine acceptance.",
        targetCount: 1
      },
      {
        id: "th3",
        arabic: "اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي بَصَرِي نُورًا، وَفِي سَمْعِي نُورًا، وَعَنْ يَمِينِي نُورًا، وَعَنْ يَسَارِي نُورًا، وَفَوْقِي نُورًا، وَتَحْتِي نُورًا، وَأَمَامِي نُورًا، وَخَلْفِي نُورًا، وَاجْعَلْ لِي نُورًا",
        transliteration: "Allahummaj'al fee qalbee noora, wa fee basaree noora, wa fee sam'ee noora, wa 'an yameenee noora, wa 'an yasaree noora, wa fawqee noora, wa tahtee noora, wa amamee noora, wa khalfee noora, waj'al lee noora.",
        english: "O Allah, place light in my heart, light in my sight, light in my hearing, light on my right, light on my left, light above me, light below me, light before me, light behind me, and grant me light (Sahih Muslim 763).",
        benefit: "Fills the believer's entire existence with spiritual illumination and clarity of purpose.",
        targetCount: 1
      },
      {
        id: "th4",
        arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
        transliteration: "Ya Hayyu Ya Qayyoomu bi-rahmatika astagheeth, aslih lee sha'nee kullahu wa la takilnee ila nafsee tarfata 'ayn.",
        english: "O Ever-Living, O Self-Sustaining, by Your mercy I seek assistance. Rectify for me all of my affairs, and do not leave me to myself for even a single blink of an eye.",
        benefit: "Brings divine intervention and deep peace during the quiet hours of nocturnal vigil.",
        targetCount: 3
      },
      {
        id: "th5",
        arabic: "سُبْحَانَ الْمَلِكِ الْقُدُّوسِ ، سُبْحَانَ الْمَلِكِ الْقُدُّوسِ ، سُبْحَانَ الْمَلِكِ الْقُدُّوسِ رَبِّ الْمَلَائِكَةِ وَالرُّوحِ",
        transliteration: "Subhanal-Malikil-Quddoos (3x), Rabbil-Mala'ikati war-Rooh.",
        english: "Glory be to the Sovereign, the Most Holy (3x), Lord of the Angels and the Spirit (Jibreel).",
        benefit: "Sunnah invocation recited at the conclusion of Witr and Qiyam al-Layl (Sunan an-Nasa'i).",
        targetCount: 3
      }
    ]
  },
  {
    id: "whitedays_fasting",
    category: "White Days & Voluntary Fasting Invocations (أدعية الصيام وأيام البيض)",
    iconName: "Sun",
    items: [
      {
        id: "wd1",
        arabic: "نَوَيْتُ صَوْمَ أَيَّامِ الْبِيضِ سُنَّةً لِلَّهِ تَعَالَى",
        transliteration: "Nawaytu sawma ayyamil-beedi sunnatan lillahi Ta'ala.",
        english: "I intend to fast the blessed White Days (13th, 14th, 15th) as a Sunnah for the sake of Allah the Almighty.",
        benefit: "Sacred intention for attaining the reward of fasting the entire lunar month.",
        targetCount: 1
      },
      {
        id: "wd2",
        arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ",
        transliteration: "Dhahabadh-dhama'u wabtallatil-'urooqu wa thabatal-ajru in sha Allah.",
        english: "The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills (Sunan Abi Dawud 2357).",
        benefit: "The authentic Sunnah supplication uttered at the precise moment of Iftar.",
        targetCount: 1
      },
      {
        id: "wd3",
        arabic: "اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ فَتَقَبَّلْ مِنِّي إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ",
        transliteration: "Allahumma laka sumtu wa 'ala rizqika aftartu fataqabbal minnee innaka Antas-Samee'ul-'Aleem.",
        english: "O Allah, for You I have fasted and with Your provision I break my fast, so accept from me; indeed You are the All-Hearing, the All-Knowing.",
        benefit: "Time-honored Iftar prayer affirming dedication and seeking divine acceptance.",
        targetCount: 1
      },
      {
        id: "wd4",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ أَنْ تَغْفِرَ لِي",
        transliteration: "Allahumma innee as'aluka bi-rahmatikal-latee wasi'at kulla shay'in an taghfira lee.",
        english: "O Allah, I ask You by Your mercy which encompasses all things that You forgive me (Sunan Ibn Majah 1753).",
        benefit: "The du'a of the fasting believer at the time of breaking fast is never rejected.",
        targetCount: 1
      },
      {
        id: "wd5",
        arabic: "أَفْطَرَ عِنْدَكُمُ الصَّائِمُونَ ، وَأَكَلَ طَعَامَكُمُ الأَبْرَارُ ، وَصَلَّتْ عَلَيْكُمُ الْمَلاَئِكَةُ",
        transliteration: "Aftara 'indakumus-sa'imoon, wa akala ta'amakumul-abrar, wa sallat 'alaykumul-mala'ikah.",
        english: "May fasting people break their fast with you, may the righteous eat your food, and may the angels send blessings upon you (Sunan Abi Dawud 3854).",
        benefit: "Supplication for the host when breaking fast at someone's home or gathering.",
        targetCount: 1
      }
    ]
  },
  {
    id: "anxiety_relief",
    category: "Anxiety, Grief, Sorrow & Hardship Duas (أدعية الكرب والهم والحزن وقضاء الدين)",
    iconName: "Shield",
    items: [
      {
        id: "ax1",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
        transliteration: "Allahumma innee a'oodhu bika minal-hammi wal-hazani, wal-'ajzi wal-kasali, wal-bukhli wal-jubni, wa dala'id-dayni wa ghalabatir-rijal.",
        english: "O Allah, I seek refuge in You from grief and sadness, from weakness and laziness, from miserliness and cowardice, and from the burden of debt and being overpowered by people (Sahih Bukhari 2893).",
        benefit: "The master du'a for mental peace, emotional strength, and debt relief.",
        targetCount: 3
      },
      {
        id: "ax2",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
        transliteration: "La ilaha illallahul-'Adheemul-Haleem, la ilaha illallahu Rabbul-'Arshil-'Adheem, la ilaha illallahu Rabbus-samawati wa Rabbul-ardi wa Rabbul-'Arshil-Kareem.",
        english: "There is no deity except Allah, the Magnificent, the Forbearing. There is no deity except Allah, Lord of the Mighty Throne. There is no deity except Allah, Lord of the heavens and Lord of the earth, and Lord of the Noble Throne (Sahih Bukhari 6345).",
        benefit: "The Prophetic du'a recited during intense distress, panic, or crisis (Du'a al-Karb).",
        targetCount: 3
      },
      {
        id: "ax3",
        arabic: "اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَهَ إِلَّا أَنْتَ",
        transliteration: "Allahumma rahmataka arjoo fala takilnee ila nafsee tarfata 'ayn, wa aslih lee sha'nee kullahu, la ilaha illa Anta.",
        english: "O Allah, it is Your mercy I hope for, so do not leave me to myself even for the blinking of an eye. Rectify all my affairs for me; there is no deity worthy of worship except You (Sunan Abi Dawud 5090).",
        benefit: "Calms overwhelmed minds and brings immediate reassurance in difficult moments.",
        targetCount: 3
      },
      {
        id: "ax4",
        arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ",
        transliteration: "Ya Hayyu Ya Qayyoomu bi-rahmatika astagheeth.",
        english: "O Ever-Living, O Self-Subsisting, by Your mercy I seek help (Jami` at-Tirmidhi 3524).",
        benefit: "Recited whenever an acute matter distressed the Messenger of Allah ﷺ.",
        targetCount: 10
      },
      {
        id: "ax5",
        arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
        transliteration: "Hasbunallahu wa ni'mal-Wakeel.",
        english: "Allah is sufficient for us, and He is the best Disposer of affairs (Surah Ali 'Imran 3:173).",
        benefit: "Shields against fear of enemies, threats, uncertainty, and worldly vulnerability.",
        targetCount: 33
      }
    ]
  },
  {
    id: "health_shifa",
    category: "Healing, Health & Shifa Ruqyah Duas (أدعية الشفاء والرقية الشرعية)",
    iconName: "Heart",
    items: [
      {
        id: "sh1",
        arabic: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ اشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا",
        transliteration: "Allahumma Rabban-naas, adh-hibil-ba's, ishfi Antash-Shaafee, laa shifaa'a illa shifaa'uka, shifaa'an laa yughadiru saqama.",
        english: "O Allah, Lord of mankind, remove the illness, cure it; You are the Healer, there is no cure except Your cure, a cure that leaves behind no disease (Sahih Bukhari 5743).",
        benefit: "The primary Prophetic healing du'a placed on the forehead/chest of the sick.",
        targetCount: 3
      },
      {
        id: "sh2",
        arabic: "بِسْمِ اللَّهِ (3x) ، أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ (7x)",
        transliteration: "Bismillah (3x), A'oodhu billahi wa qudratihi min sharri ma ajidu wa uhadhir (7x).",
        english: "In the name of Allah (3x). I seek refuge in Allah and His power from the evil of what I feel and what I fear (7x) (Sahih Muslim 2202).",
        benefit: "Sunnah method: Place your right hand on the location of pain while reciting.",
        targetCount: 7
      },
      {
        id: "sh3",
        arabic: "أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ",
        transliteration: "As'alullahal-'Adheema Rabbal-'Arshil-'Adheemi an yashfiyak.",
        english: "I ask Allah the Almighty, Lord of the Magnificent Throne, to heal and cure you (7x) (Sunan Abi Dawud 3106).",
        benefit: "Whoever visits a sick person whose time has not come and recites this 7x, he will be cured.",
        targetCount: 7
      },
      {
        id: "sh4",
        arabic: "بِسْمِ اللَّهِ أَرْقِيكَ مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ اللَّهُ يَشْفِيكَ ، بِسْمِ اللَّهِ أَرْقِيكَ",
        transliteration: "Bismillahi arqeek, min kulli shay'in yu'dheek, min sharri kulli nafsin aw 'ayni haasidin Allahu yashfeek, bismillahi arqeek.",
        english: "In the name of Allah I perform Ruqyah for you, from everything that harms you, from the evil of every soul or envious eye may Allah heal you. In the name of Allah I perform Ruqyah for you (Sahih Muslim 2186).",
        benefit: "The sacred Ruqyah recited by Angel Jibreel (AS) upon the Prophet Muhammad ﷺ.",
        targetCount: 3
      }
    ]
  },
  {
    id: "wealth_sustenance",
    category: "Barakah, Sustenance & Halal Provision (أدعية الرزق الحلال والبركة والنجاح)",
    iconName: "Zap",
    items: [
      {
        id: "wz1",
        arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
        transliteration: "Allahummak-finee bi-halalika 'an haramika, wa aghninee bi-fadlika 'amman siwaka.",
        english: "O Allah, suffice me with Your lawful provisions against Your prohibited things, and enrich me with Your bounty so that I am independent of all besides You (Jami` at-Tirmidhi 3563).",
        benefit: "Even if your debt were as immense as Mount Uhud, Allah will enable you to settle it.",
        targetCount: 3
      },
      {
        id: "wz2",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
        transliteration: "Allahumma innee as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbala.",
        english: "O Allah, I ask You for beneficial knowledge, pure and wholesome sustenance, and deeds that are accepted (Sunan Ibn Majah 925).",
        benefit: "Daily morning post-Fajr prayer for lifelong success, lawful income, and piety.",
        targetCount: 1
      },
      {
        id: "wz3",
        arabic: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
        transliteration: "Rabbi innee lima anzalta ilayya min khayrin faqeer.",
        english: "My Lord! Truly I am in desperate need of whatever good You would bestow upon me (Surah Al-Qasas 28:24).",
        benefit: "Du'a of Musa (AS) which brought him immediate shelter, halal livelihood, and a righteous marriage.",
        targetCount: 7
      }
    ]
  },
  {
    id: "praise_gratitude",
    category: "Praise, Tahmeed & Supreme Dhikr (أدعية الحمد والثناء والأذكار المضاعفة)",
    iconName: "Sparkles",
    items: [
      {
        id: "pg1",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
        transliteration: "Subhanallahi wa bihamdihi, Subhanallahil-'Azeem.",
        english: "Glory be to Allah and His is the praise, Glory be to Allah the Almighty.",
        benefit: "Two words that are light on the tongue, heavy in the Balance, and beloved to the Most Merciful (Sahih Bukhari 6406).",
        targetCount: 100
      },
      {
        id: "pg2",
        arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        transliteration: "La hawla wa la quwwata illa billah.",
        english: "There is no power and no strength except with Allah.",
        benefit: "A treasure from the treasures of Paradise (Kanz min kunoozil-Jannah - Sahih Bukhari 4205).",
        targetCount: 100
      },
      {
        id: "pg3",
        arabic: "سُبْحَانَ اللَّهِ ، وَالْحَمْدُ لِلَّهِ ، وَلَا إِلَهَ إِلَّا اللَّهُ ، وَاللَّهُ أَكْبَرُ",
        transliteration: "Subhanallah, wal-hamdulillah, wa la ilaha illallah, wallahu Akbar.",
        english: "Glory be to Allah, Praise be to Allah, There is no deity except Allah, and Allah is the Greatest.",
        benefit: "More beloved to the Prophet ﷺ than everything over which the sun rises (Sahih Muslim 2695).",
        targetCount: 100
      },
      {
        id: "pg4",
        arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
        transliteration: "Allahumma salli 'ala Muhammadin wa 'ala aali Muhammadin kama sallayta 'ala Ibraheema wa 'ala aali Ibraheema innaka Hameedun Majeed.",
        english: "Salawat Ibrahimiyyah: Sending blessings upon the Prophet Muhammad ﷺ and his noble family.",
        benefit: "Whoever sends one blessing upon the Prophet ﷺ, Allah blesses him tenfold and erases ten sins (Sahih Muslim).",
        targetCount: 100
      },
      {
        id: "pg5",
        arabic: "الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ",
        transliteration: "Alhamdu lillahi hamdan katheeran tayyiban mubarakan feeh.",
        english: "Praise be to Allah, an abundant, wholesome, and blessed praise.",
        benefit: "The Prophet ﷺ saw over thirty angels racing to write down this praise first (Sahih Bukhari 799).",
        targetCount: 1
      },
      {
        id: "pg6",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ",
        transliteration: "Subhanallahi wa bihamdihi: 'adada khalqihi, wa rida nafsihi, wa zinata 'arshihi, wa midada kalimatih.",
        english: "Glory be to Allah and praise is due to Him: according to the number of His creation, according to the pleasure of His Self, according to the weight of His Throne, and according to the ink of His words (Sahih Muslim 2726).",
        benefit: "Outweighs hours of continuous continuous standard dhikr in divine weight.",
        targetCount: 3
      }
    ]
  }
];
