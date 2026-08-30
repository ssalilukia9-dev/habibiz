import { DhikrCategory, DhikrItem } from './adhkarData.ts';

// Comprehensive Authentic Adhkar, Duas, and Invocations from the Holy Quran, Hisn al-Muslim, and Sunnah
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
        benefit: "Protects the heart from spiritual deviation and strengthens steadfastness upon Iman.",
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
        benefit: "Seals genuine reliance (Tawakkul) upon Allah in all endeavors.",
        targetCount: 3
      },
      {
        id: "rb9",
        arabic: "رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
        transliteration: "Rabbana la tu'akhidhna in naseena aw akhta'na, Rabbana wa la tahmil 'alayna isran kama hamaltahu 'alal-ladheena min qablina, Rabbana wa la tuhammilna ma la taqata lana bih, wa'fu 'anna waghfir lana warhamna, Anta Mawlana fansurna 'alal-qawmil-kafireen.",
        english: "Our Lord, do not impose blame upon us if we forget or make a mistake. Our Lord, and lay not upon us a burden like that which You laid upon those before us. Our Lord, and burden us not with that which we have no ability to bear. And pardon us; and forgive us; and have mercy upon us. You are our protector, so give us victory over the disbelieving people (Al-Baqarah 2:286).",
        benefit: "The final verse of Surah Al-Baqarah. The Prophet ﷺ said: Whoever recites the last two verses of Surah Al-Baqarah at night, they will suffice him for everything.",
        targetCount: 1
      },
      {
        id: "rb10",
        arabic: "رَبَّنَا وَسِعْتَ كُلَّ شَيْءٍ رَّحْمَةً وَعِلْمًا فَاغْفِرْ لِلَّذِينَ تَابُوا وَاتَّبَعُوا سَبِيلَكَ وَقِهِمْ عَذَابَ الْجَحِيمِ",
        transliteration: "Rabbana wasi'ta kulla shay'in rahmatan wa 'ilman faghfir lilladheena taboo wattaba'oo sabeelaka wa qihim 'adhabal-jaheem.",
        english: "Our Lord, You have encompassed all things in mercy and knowledge, so forgive those who have repented and followed Your way and protect them from the punishment of Hellfire (Ghafir 40:7).",
        benefit: "Supplication of the Angels who carry the Throne on behalf of the believers.",
        targetCount: 3
      },
      {
        id: "rb11",
        arabic: "رَبَّنَا إِنَّنَا آمَنَّا فَاغْفِرْ لَنَا ذُنُوبَنَا وَقِنَا عَذَابَ النَّارِ",
        transliteration: "Rabbana innana amanna faghfir lana dhunoobana wa qina 'adhaban-nar.",
        english: "Our Lord, indeed we have believed, so forgive us our sins and protect us from the punishment of the Fire (Ali 'Imran 3:16).",
        benefit: "Supplication of the patient, the truthful, and those who seek forgiveness before dawn.",
        targetCount: 3
      },
      {
        id: "rb12",
        arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
        transliteration: "Rabbana afrigh 'alayna sabran wa thabbit aqdamana wansurna 'alal-qawmil-kafireen.",
        english: "Our Lord, pour upon us patience and plant firmly our feet and give us victory over the disbelieving people (Al-Baqarah 2:250).",
        benefit: "Du'a of the righteous army of Talut against Goliath. Bestows steadfastness in adversity.",
        targetCount: 3
      }
    ]
  },
  {
    id: "prophetic_istighfar",
    category: "Istighfar, Repentance & Divine Forgiveness (سيد الاستغفار والتوبة النصوح)",
    iconName: "Sparkles",
    items: [
      {
        id: "ist1",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        transliteration: "Allahumma Anta Rabbee la ilaha illa Ant, khalaqtanee wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't, a'oodhu bika min sharri ma sana't, aboo'u laka bi-ni'matika 'alayy, wa aboo'u bi-dhanbee faghfir lee fa-innahu la yaghfirudh-dhunooba illa Ant.",
        english: "O Allah! You are my Lord! None has the right to be worshipped but You. You created me and I am Your servant, and I am faithful to my covenant and my promise to You as much as I can. I seek refuge with You from all the evil I have done. I acknowledge before You all the blessings You have bestowed upon me, and I confess to You all my sins. So I entreat You to forgive me, for none can forgive sins except You (Sayyid al-Istighfar).",
        benefit: "The Master Supplication for Forgiveness. The Prophet ﷺ said: Whoever recites it during the day with conviction and dies that day will be among the people of Paradise, and whoever recites it at night and dies will be among the people of Paradise (Sahih Bukhari 6306).",
        targetCount: 1
      },
      {
        id: "ist2",
        arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ",
        transliteration: "Astaghfirullahal-'Azeemalladhee la ilaha illa Huwal-Hayyul-Qayyoomu wa atoobu ilayh.",
        english: "I seek the forgiveness of Allah the Magnificent, besides Whom there is no deity worthy of worship, the Ever-Living, the Self-Subsisting, and I turn to Him in repentance.",
        benefit: "Whoever says this, his sins will be forgiven even if he had fled from the battlefield (Sunan Abi Dawud 1517).",
        targetCount: 3
      },
      {
        id: "ist3",
        arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ",
        transliteration: "Rabbigh-fir lee wa tub 'alayya innaka Antat-Tawwabur-Raheem.",
        english: "My Lord, forgive me and accept my repentance; verily, You are the Acceptor of Repentance, the Most Merciful.",
        benefit: "The Companions counted the Prophet ﷺ saying this 100 times in a single gathering (Sunan Abi Dawud 1516).",
        targetCount: 100
      },
      {
        id: "ist4",
        arabic: "اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا، وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ، وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
        transliteration: "Allahumma innee dhalamtu nafsee dhulman katheera, wa la yaghfirudh-dhunooba illa Ant, faghfir lee maghfiratan min 'indik, warhamnee innaka Antal-Ghafoorur-Raheem.",
        english: "O Allah! I have wronged myself greatly and none can forgive sins except You. So grant me forgiveness from Yourself and have mercy on me, for You are the Forgiving, the Merciful.",
        benefit: "Taught directly by the Prophet ﷺ to Abu Bakr as-Siddiq (RA) to recite in Tashahhud / Prayer (Sahih Bukhari 834).",
        targetCount: 1
      },
      {
        id: "ist5",
        arabic: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
        transliteration: "Rabbigh-fir lee, Rabbigh-fir lee.",
        english: "Lord forgive me, Lord forgive me.",
        benefit: "Prophetic Sunnah between the two prostrations (Sajdahs) of prayer (Sunan an-Nasa'i).",
        targetCount: 2
      }
    ]
  },
  {
    id: "prophets_supplications",
    category: "Duas of the Prophets in the Quran (أدعية الأنبياء والمرسلين)",
    iconName: "ShieldCheck",
    items: [
      {
        id: "pr1",
        arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
        transliteration: "La ilaha illa Anta subhanaka innee kuntu minadh-dhalimeen.",
        english: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers (Al-Anbiya 21:87).",
        benefit: "The Du'a of Prophet Yunus (Dhun-Nun) inside the whale. The Prophet ﷺ said: No Muslim supplicates with this in any distress except that Allah relieves him (Jami` at-Tirmidhi 3505).",
        targetCount: 3
      },
      {
        id: "pr2",
        arabic: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
        transliteration: "Rabbana dhalamna anfusana wa il-lam taghfir lana wa tarhamna lana-koonanna minal-khasireen.",
        english: "Our Lord! We have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers (Al-A'raf 7:23).",
        benefit: "The original du'a of Adam and Hawwa (peace be upon them) that earned complete forgiveness from Allah.",
        targetCount: 3
      },
      {
        id: "pr3",
        arabic: "رَبِّ إِنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ",
        transliteration: "Rabbi innee massaniyad-durru wa Anta Arhamur-Rahimeen.",
        english: "My Lord! Adversity has touched me, and You are the Most Merciful of the merciful (Al-Anbiya 21:83).",
        benefit: "Du'a of Prophet Ayyub (Job) in severe sickness and loss. Unlocks divine healing and restoration.",
        targetCount: 7
      },
      {
        id: "pr4",
        arabic: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
        transliteration: "Rabbi innee lima anzalta ilayya min khayrin faqeer.",
        english: "My Lord! Truly I am in need of whatever good You bestow upon me (Al-Qasas 28:24).",
        benefit: "Du'a of Prophet Musa when alone and exhausted in Madyan. Led to provision, shelter, marriage, and divine protection.",
        targetCount: 7
      },
      {
        id: "pr5",
        arabic: "رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الْوَارِثِينَ",
        transliteration: "Rabbi la tadharnī fardan wa Anta khayrul-waritheen.",
        english: "My Lord! Do not leave me alone and childless, and You are the Best of inheritors (Al-Anbiya 21:89).",
        benefit: "Du'a of Prophet Zakariyya for righteous children and overcoming biological infertility.",
        targetCount: 3
      },
      {
        id: "pr6",
        arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
        transliteration: "Rabbij-'alnee muqeemas-Salati wa min dhurriyyatee, Rabbana wa taqabbal du'a'.",
        english: "My Lord! Make me an establisher of prayer, and from my descendants. Our Lord, and accept my supplication (Ibrahim 14:40).",
        benefit: "Du'a of Prophet Ibrahim for eternal love of prayer in his family lineage.",
        targetCount: 3
      }
    ]
  },
  {
    id: "relief_anxiety_debt",
    category: "Relief from Anxiety, Grief, Distress & Debt (أدعية تفريج الهم والحزن وقضاء الدين)",
    iconName: "Heart",
    items: [
      {
        id: "rad1",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
        transliteration: "Allahumma innee a'oodhu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa dala'id-dayni wa ghalabatir-rijal.",
        english: "O Allah, I seek refuge in You from anxiety and grief, weakness and laziness, miserliness and cowardice, the burden of debt and being overpowered by men.",
        benefit: "Prophetic daily supplication. Relieves chronic stress, paralysis by anxiety, financial strain, and intimidation (Sahih Bukhari 2893).",
        targetCount: 3
      },
      {
        id: "rad2",
        arabic: "اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ لَا إِلَهَ إِلَّا أَنْتَ",
        transliteration: "Allahumma rahmataka arjoo fala takilnee ila nafsee tarfata 'ayn, wa aslih lee sha'nee kullahu la ilaha illa Ant.",
        english: "O Allah, it is Your mercy that I hope for, so do not leave me to myself even for the blink of an eye, and rectify for me all of my affairs. None has the right to be worshipped but You.",
        benefit: "The Supplication of the Distressed (Du'a al-Makroob - Sunan Abi Dawud 5090).",
        targetCount: 3
      },
      {
        id: "rad3",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
        transliteration: "La ilaha illallahul-'Azeemul-Haleem, la ilaha illallahu Rabbul-'Arshil-'Azeem, la ilaha illallahu Rabbus-samawati wa Rabbul-ardi wa Rabbul-'Arshil-Kareem.",
        english: "None has the right to be worshipped but Allah the Incomparably Great, the Clement. None has the right to be worshipped but Allah, Lord of the Mighty Throne. None has the right to be worshipped but Allah, Lord of the heavens and Lord of the earth and Lord of the Noble Throne.",
        benefit: "The Prophetic Du'a of severe crisis and hardship (Sahih Bukhari 6345).",
        targetCount: 1
      },
      {
        id: "rad4",
        arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
        transliteration: "Allahummak-finee bi-halalika 'an haramik, wa aghninee bi-fadlika 'amman siwak.",
        english: "O Allah, suffice me with Your lawful provision against what You have prohibited, and make me independent of all others through Your grace and bounty.",
        benefit: "Ali (RA) taught this for paying off mountain-sized debts (Jami` at-Tirmidhi 3563).",
        targetCount: 3
      },
      {
        id: "rad5",
        arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        transliteration: "Hasbiyallahu la ilaha illa Huwa 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem.",
        english: "Allah is sufficient for me; none has the right to be worshipped but He. In Him I put my trust, and He is the Lord of the Mighty Throne (At-Tawbah 9:129).",
        benefit: "Recited 7 times morning & evening: Allah suffices the servant in everything that distresses him in this world and the Next (Sunan Abi Dawud 5081).",
        targetCount: 7
      }
    ]
  },
  {
    id: "health_shifa_ruqyah",
    category: "Health, Healing & Shifa Ruqyah (أدعية الشفاء والعافية والرقية الشرعية)",
    iconName: "ShieldCheck",
    items: [
      {
        id: "hs1",
        arabic: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا",
        transliteration: "Allahumma Rabban-nasi adh-hibil-ba's, ishfi Antash-Shafee, la shifa'a illa shifa'uk, shifa'an la yughadiru saqama.",
        english: "O Allah, Lord of mankind, remove the disease and bring about healing. You are the Healer; there is no healing except Your healing—a healing that leaves behind no ailment.",
        benefit: "The Prophetic Ruqyah for wiping physical pain and illness (Sahih Bukhari 5743).",
        targetCount: 3
      },
      {
        id: "hs2",
        arabic: "بِسْمِ اللَّهِ (ثَلَاثًا)، أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ (سَبْعًا)",
        transliteration: "Bismillah (3x), A'oodhu billahi wa qudratihee min sharri ma ajidu wa uhadhir (7x).",
        english: "In the name of Allah (3 times). I seek refuge in Allah and His power from the evil of what I feel and what I fear (7 times).",
        benefit: "Place hand on the site of physical pain and recite. Relieves physical aches and pain (Sahih Muslim 2202).",
        targetCount: 7
      },
      {
        id: "hs3",
        arabic: "أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ",
        transliteration: "As'alullahal-'Azeem Rabbal-'Arshil-'Azeem an yashfiyak.",
        english: "I ask Allah the Magnificent, Lord of the Mighty Throne, to heal you.",
        benefit: "Recited 7 times when visiting any sick person: Allah heals them unless it is their appointed time (Jami` at-Tirmidhi 2083).",
        targetCount: 7
      },
      {
        id: "hs4",
        arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ",
        transliteration: "Allahumma 'afinee fee badanee, Allahumma 'afinee fee sam'ee, Allahumma 'afinee fee basaree, la ilaha illa Ant.",
        english: "O Allah, grant health to my body; O Allah, grant health to my hearing; O Allah, grant health to my sight. There is no deity worthy of worship except You.",
        benefit: "Preserves vitality, ocular health, auditory clarity, and total bodily wellbeing (Sunan Abi Dawud 5090).",
        targetCount: 3
      },
      {
        id: "hs5",
        arabic: "بِسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ",
        transliteration: "Bismillahi arqeek, min kulli shay'in yu'dheek, min sharri kulli nafsin aw 'ayni hasid, Allahu yashfeek, Bismillahi arqeek.",
        english: "In the name of Allah I perform Ruqyah for you, from everything that may harm you, from the evil of every soul or envious eye. May Allah heal you; in the name of Allah I perform Ruqyah for you.",
        benefit: "The Ruqyah recited by the Archangel Jibril (AS) upon the Prophet Muhammad ﷺ (Sahih Muslim 2186).",
        targetCount: 3
      }
    ]
  },
  {
    id: "night_tahajjud_laylatulqadr",
    category: "Tahajjud, Night Prayer & Laylat al-Qadr (أدعية قيام الليل والتهجد وليلة القدر)",
    iconName: "Moon",
    items: [
      {
        id: "nt1",
        arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
        transliteration: "Allahumma innaka 'Afuwwun tuhibbul-'afwa fa'fu 'annee.",
        english: "O Allah! Verily You are Oft-Pardoning, and You love to pardon, so pardon me.",
        benefit: "Taught by the Prophet ﷺ to Aisha (RA) as the supreme supplication for Laylat al-Qadr (Jami` at-Tirmidhi 3513).",
        targetCount: 100
      },
      {
        id: "nt2",
        arabic: "اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ نُورُ السَّمَوَاتِ وَالأَرْضِ وَمَنْ فِيهِنَّ، وَلَكَ الْحَمْدُ أَنْتَ قَيِّمُ السَّمَوَاتِ وَالأَرْضِ وَمَنْ فِيهِنَّ، وَلَكَ الْحَمْدُ أَنْتَ رَبُّ السَّمَوَاتِ وَالأَرْضِ وَمَنْ فِيهِنَّ، أَنْتَ الْحَقُّ وَوَعْدُكَ الْحَقُّ",
        transliteration: "Allahumma lakal-hamdu Anta noorus-samawati wal-ardi wa man feehinn, wa lakal-hamdu Anta qayyimus-samawati wal-ardi wa man feehinn, wa lakal-hamdu Anta Rabbus-samawati wal-ardi wa man feehinn, Antal-Haqqu wa wa'dukal-haqq.",
        english: "O Allah, to You belongs all praise. You are the Light of the heavens and the earth and all that is within them. To You belongs all praise; You are the Sustainer of the heavens and the earth and all that is within them. You are the Ultimate Truth and Your promise is Truth.",
        benefit: "The Prophetic opening du'a at the beginning of Tahajjud in the depths of the night (Sahih Bukhari 1120).",
        targetCount: 1
      },
      {
        id: "nt3",
        arabic: "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ، وَإِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، وَلَا يَعِزُّ مَنْ عَادَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ",
        transliteration: "Allahumma-hdinee feeman hadayt, wa 'afinee feeman 'afayt, wa tawallanee feeman tawallayt, wa barik lee feema a'tayt, wa qinee sharra ma qadayt, fa-innaka taqdee wa la yuqda 'alayk, wa innahu la yadhillu man walayt, wa la ya'izzu man 'adayt, tabarakta Rabbana wa ta'alayt.",
        english: "O Allah, guide me among those whom You have guided, pardon me among those whom You have pardoned, turn to me in friendship among those on whom You have turned in friendship, and bless me in what You have bestowed, and save me from the evil of what You have decreed. For verily You decree and none can decree against You.",
        benefit: "Du'a Qunoot al-Witr taught by the Prophet ﷺ to his grandson Al-Hasan (Sunan Abi Dawud 1425).",
        targetCount: 1
      }
    ]
  },
  {
    id: "knowledge_clarity_wisdom",
    category: "Knowledge, Memorization, Exam Success & Focus (أدعية طلب العلم والحفظ والتوفيق في الامتحانات)",
    iconName: "GraduationCap",
    items: [
      {
        id: "kw1",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
        transliteration: "Allahumma innee as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbala.",
        english: "O Allah! I ask You for beneficial knowledge, a pure wholesome livelihood, and deeds that are accepted.",
        benefit: "Recited daily after the Fajr prayer (Sunan Ibn Majah 925). Sets the golden foundation for daily learning and work.",
        targetCount: 3
      },
      {
        id: "kw2",
        arabic: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
        transliteration: "Allahumma la sahla illa ma ja'altahu sahla, wa Anta taj'alul-hazna idha shi'ta sahla.",
        english: "O Allah, there is no ease except what You make easy, and You make hardship easy if You will.",
        benefit: "The premier supplication when facing difficult exams, complex work tasks, or challenging interviews (Sahih Ibn Hibban 327).",
        targetCount: 3
      },
      {
        id: "kw3",
        arabic: "اللَّهُمَّ فَقِّهْنِي فِي الدِّينِ وَعَلِّمْنِي التَّأْوِيلَ",
        transliteration: "Allahumma faqqihnee fid-deeni wa 'allimnit-ta'weel.",
        english: "O Allah! Grant me deep understanding of the religion and teach me the interpretation of the Quran.",
        benefit: "The famous Prophetic du'a upon Abdullah ibn Abbas (RA) that made him the greatest Quranic scholar.",
        targetCount: 3
      },
      {
        id: "kw4",
        arabic: "يَا مُعَلِّمَ إِبْرَاهِيمَ عَلِّمْنِي، وَيَا مُفَهِّمَ سُلَيْمَانَ فَهِّمْنِي",
        transliteration: "Ya Mu'allima Ibraheema 'allimnee, wa ya Mufahhima Sulaymana fahhimnee.",
        english: "O Teacher of Ibrahim teach me, and O Granter of understanding to Sulaiman grant me comprehension.",
        benefit: "Supplication used by Imam Ibn Taymiyyah and great scholars when encountering difficult concepts.",
        targetCount: 3
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
        benefit: "Outweighs hours of continuous standard dhikr in divine weight.",
        targetCount: 3
      },
      {
        id: "pg7",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration: "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer.",
        english: "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things.",
        benefit: "Whoever recites this 100 times in a day gets the reward of freeing 10 slaves, 100 good deeds are recorded, 100 sins erased, and is protected from Satan all day (Sahih Bukhari 3293).",
        targetCount: 100
      }
    ]
  },
  {
    id: "travel_and_journey",
    category: "Travel, Boarding Vehicles & Safe Journey (أدعية السفر وركوب الدواب والعودة)",
    iconName: "Compass",
    items: [
      {
        id: "tr1",
        arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ ، وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ",
        transliteration: "Subhanal-ladhee sakh-khara lana hadha wa ma kunna lahoo muqrineen, wa inna ila Rabbina lamunqaliboon.",
        english: "Glory be to Him Who has subjected this to us, whereas we were unable to conquer it by ourselves. And verily, unto our Lord we shall return (Surah Az-Zukhruf 43:13-14).",
        benefit: "Recited when boarding any car, plane, train, or vehicle for divine protection and safety (Sahih Muslim 1342).",
        targetCount: 1
      },
      {
        id: "tr2",
        arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ",
        transliteration: "Allahumma inna nas'aluka fee safarina hadhal-birra wat-taqwa, wa minal-'amali ma tarda, Allahumma hawwin 'alayna safarana hadha watwi 'anna bu'dah.",
        english: "O Allah, we ask You in this journey of ours for righteousness and piety, and deeds pleasing to You. O Allah, make this journey easy for us and shorten its distance.",
        benefit: "Invites ease into long travels, protects against accidents, and blesses travelers' intentions (Sahih Muslim).",
        targetCount: 1
      },
      {
        id: "tr3",
        arabic: "اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ",
        transliteration: "Allahumma Antas-Sahibu fis-safar, wal-Khaleefatu fil-ahl. Allahumma innee a'oodhu bika min wa'tha'is-safar, wa ka'abatil-mandhar, wa soo'il-munqalabi fil-mali wal-ahl.",
        english: "O Allah, You are our Companion in travel and Guardian of our families in our absence. O Allah, I seek refuge in You from the hardships of travel, sorrowful sights, and finding our wealth and family in adversity upon return.",
        benefit: "Entrusts family and assets at home directly into Allah's preservation during travel.",
        targetCount: 1
      },
      {
        id: "tr4",
        arabic: "آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ",
        transliteration: "Ayiboona, ta'iboona, 'abidoona, li-Rabbina hamidoon.",
        english: "We are returning, repenting, worshipping, and praising our Lord.",
        benefit: "Sunnah supplication when returning safely home from a journey or pilgrimage (Sahih Bukhari 1799).",
        targetCount: 3
      }
    ]
  },
  {
    id: "eating_drinking_fasting",
    category: "Meals, Eating, Drinking & Fasting (أدعية الطعام والشراب والإفطار والسحور)",
    iconName: "Utensils",
    items: [
      {
        id: "ed1",
        arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ",
        transliteration: "Bismillahi wa 'ala barakatillah.",
        english: "In the name of Allah and upon the blessings of Allah.",
        benefit: "Prevents Shaytan from partaking in food and infuses nutritional sustenance with barakah (Abu Dawud).",
        targetCount: 1
      },
      {
        id: "ed2",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        transliteration: "Alhamdu lillahil-ladhee at'amanee hadha wa razaqaneehi min ghayri hawlin minnee wa la quwwah.",
        english: "Praise be to Allah Who fed me this and provided it for me without any power or strength on my part.",
        benefit: "Whoever says this after finishing a meal, all their past sins are forgiven (Jami` at-Tirmidhi 3458).",
        targetCount: 1
      },
      {
        id: "ed3",
        arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
        transliteration: "Dhahabadh-dhama'u wabtallatil-'urooqu wa thabatal-ajru in sha'Allah.",
        english: "The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills.",
        benefit: "The Prophetic supplication upon breaking the fast (Iftar) (Sunan Abi Dawud 2357).",
        targetCount: 1
      },
      {
        id: "ed4",
        arabic: "اللَّهُمَّ بَارِكْ لَهُمْ فِيمَا رَزَقْتَهُمْ، وَاغْفِرْ لَهُمْ وَارْحَمْهُمْ",
        transliteration: "Allahumma barik lahum feema razaqtahum, waghfir lahum warhamhum.",
        english: "O Allah, bless what You have provided for them, forgive them, and have mercy upon them.",
        benefit: "Supplication for the host or cook who prepared and served food (Sahih Muslim 2042).",
        targetCount: 1
      }
    ]
  },
  {
    id: "entering_leaving_spaces",
    category: "Entering & Leaving Home, Mosque & Market (أدعية دخول وخروج المنزل والمسجد والسوق)",
    iconName: "Home",
    items: [
      {
        id: "sp1",
        arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        transliteration: "Bismillahi tawakkaltu 'alallah, la hawla wa la quwwata illa billah.",
        english: "In the name of Allah, I place my trust in Allah; there is no might and no power except with Allah.",
        benefit: "Recited when exiting home. The angels respond: 'You have been guided, defended, and protected,' and Satan flees (Abu Dawud 5095).",
        targetCount: 1
      },
      {
        id: "sp2",
        arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        transliteration: "Allahummaf-tah lee abwaba rahmatik.",
        english: "O Allah, open for me the gates of Your mercy.",
        benefit: "Sunnah when entering the mosque with the right foot (Sahih Muslim 713).",
        targetCount: 1
      },
      {
        id: "sp3",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
        transliteration: "Allahumma innee as'aluka min fadlik.",
        english: "O Allah, I ask You from Your divine bounty and grace.",
        benefit: "Sunnah when leaving the mosque with the left foot (Sahih Muslim 713).",
        targetCount: 1
      },
      {
        id: "sp4",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ بِيَدِهِ الْخَيْرُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration: "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu yuhyee wa yumeetu wa Huwa Hayyun la yamootu biyadihil-khayru wa Huwa 'ala kulli shay'in qadeer.",
        english: "None has the right to be worshipped but Allah alone with no partner. His is the dominion and His is the praise; He gives life and causes death, and He is Ever-Living and never dies. In His hand is all good, and He is Able to do all things.",
        benefit: "Recited when entering the marketplace or shopping mall: Allah records 1,000,000 good deeds, erases 1,000,000 sins, and builds a palace in Jannah (Jami` at-Tirmidhi 3428).",
        targetCount: 1
      }
    ]
  },
  {
    id: "nature_weather_astronomy",
    category: "Weather, Rain, Thunder, Wind & New Moon (أدعية نزول الغيث والرعد والرياح ورؤية الهلال)",
    iconName: "CloudRain",
    items: [
      {
        id: "nw1",
        arabic: "اللَّهُمَّ صَيِّبًا نَافِعًا",
        transliteration: "Allahumma sayyiban nafi'an.",
        english: "O Allah, make it a beneficial and productive downpour.",
        benefit: "Recited as rain begins to fall; prayers made during rain are accepted (Sahih Bukhari 1032).",
        targetCount: 3
      },
      {
        id: "nw2",
        arabic: "سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ",
        transliteration: "Subhanal-ladhee yusabbihur-ra'du bi-hamdihi wal-mala'ikatu min kheefatih.",
        english: "Glory be to Him Whom the thunder glorifies with His praise, and the angels from the awe of Him (Surah Ar-Ra'd 13:13).",
        benefit: "Recited by the Prophet ﷺ and Companions whenever thunder was heard (Al-Muwatta 1801).",
        targetCount: 1
      },
      {
        id: "nw3",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا فِيهَا وَخَيْرَ مَا أُرْسِلَتْ بِهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا فِيهَا وَشَرِّ مَا أُرْسِلَتْ بِهِ",
        transliteration: "Allahumma innee as'aluka khayraha wa khayra ma feeha wa khayra ma ursilat bih, wa a'oodhu bika min sharriha wa sharri ma feeha wa sharri ma ursilat bih.",
        english: "O Allah, I ask You for its goodness, the goodness within it, and the goodness it was sent with. And I seek refuge in You from its evil, the evil within it, and the evil it was sent with.",
        benefit: "Recited during strong winds or storms for divine safety and protection (Sahih Muslim 899).",
        targetCount: 1
      },
      {
        id: "nw4",
        arabic: "اللَّهُ أَكْبَرُ، اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيمَانِ، وَالسَّلَامَةِ وَالْإِسْلَامِ، وَالتَّوْفِيقِ لِمَا تُحِبُّ وَتَرْضَى، رَبُّنَا وَرَبُّكَ اللَّهُ",
        transliteration: "Allahu Akbar, Allahumma ahillahu 'alayna bil-amni wal-iman, was-salamati wal-Islam, wat-tawfeeqi lima tuhibbu wa tarda, Rabbuna wa Rabbukallah.",
        english: "Allah is the Greatest. O Allah, bring this crescent moon upon us with security, faith, peace, Islam, and success in that which You love and are pleased with. (O moon,) our Lord and your Lord is Allah.",
        benefit: "Recited upon sighting the new moon of each Islamic month (Jami` at-Tirmidhi 3451).",
        targetCount: 1
      }
    ]
  },
  {
    id: "protection_evil_eye_envy",
    category: "Protection from Evil Eye, Envy & Shaytan (أدعية الحفظ من العين والحسد والشياطين والوسواس)",
    iconName: "ShieldCheck",
    items: [
      {
        id: "pe1",
        arabic: "أُعِيذُكَ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ",
        transliteration: "U'eedhuka bi-kalimatillahit-tammati min kulli shaytanin wa hammah, wa min kulli 'aynin lammah.",
        english: "I seek protection for you in the Perfect Words of Allah from every devil and poisonous creature, and from every evil envious eye.",
        benefit: "The Prophetic protection recited by Ibrahim upon Ismail & Ishaq, and Muhammad ﷺ upon Hasan & Husain (Sahih Bukhari 3371).",
        targetCount: 3
      },
      {
        id: "pe2",
        arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ مِنْ هَمْزِهِ وَنَفْخِهِ وَنَفْثِهِ",
        transliteration: "A'oodhu billahi minash-shaytanir-rajeem min hamzihi wa nafkhihi wa nafthih.",
        english: "I seek refuge in Allah from the accursed Satan, from his whispering (insanity), his pride (arrogance), and his corrupt poetry.",
        benefit: "Eliminates distracting intrusive thoughts (waswas) in prayer and daily life (Abu Dawud 775).",
        targetCount: 3
      },
      {
        id: "pe3",
        arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        transliteration: "Bismillāhilladhī lā yadurru ma‘as-mihī shay'un fil-ardi wa lā fis-samā'i wa huwas-Samī‘ul-‘Alīm.",
        english: "In the Name of Allah with Whose Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.",
        benefit: "Recited 3 times morning and evening: Total divine shielding against harm, poison, or sudden catastrophe (Tirmidhi 3388).",
        targetCount: 3
      }
    ]
  },
  {
    id: "bereavement_calamity_janazah",
    category: "Calamity, Grief, Bereavement & Funerals (أدعية الصبر عند المصيبة والاسترجاع والجنائز)",
    iconName: "Heart",
    items: [
      {
        id: "bc1",
        arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
        transliteration: "Inna lillahi wa inna ilayhi raji'oon. Allahumma'jurnee fee museebatee wa akhlif lee khayran minha.",
        english: "Truly to Allah we belong and truly to Him we return. O Allah, reward me for my affliction and replace it for me with something even better.",
        benefit: "Whoever recites this when afflicted with grief or loss, Allah grants them a better outcome (Sahih Muslim 918).",
        targetCount: 3
      },
      {
        id: "bc2",
        arabic: "اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ وَوَسِّعْ مُدْخَلَهُ، وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ",
        transliteration: "Allahummagh-fir lahu war-hamhu wa 'afihi wa'fu 'anh, wa akrim nuzulahu wa wassi' mudkhalah, waghsilhu bil-ma'i wath-thalji wal-barad.",
        english: "O Allah, forgive him, have mercy on him, pardon him, grant him an honorable reception, widen his grave, and cleanse him with water, snow, and hail.",
        benefit: "The Prophetic Janazah supplication for deceased believers (Sahih Muslim 963).",
        targetCount: 1
      },
      {
        id: "bc3",
        arabic: "السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَاحِقُونَ، نَسْأَلُ اللَّهَ لَنَا وَلَكُمُ الْعَافِيَةَ",
        transliteration: "As-salamu 'alaykum ahlad-diyari minal-mu'mineena wal-muslimeen, wa inna in sha'Allahu bikum lahiqoon, nas'alullaha lana wa lakumul-'afiyah.",
        english: "Peace be upon you, O dwellers of this place among the believers and Muslims. Verily, if Allah wills, we shall soon join you. We ask Allah for well-being for us and for you.",
        benefit: "Sunnah when visiting Muslim cemeteries to remind the soul and pray for the departed (Sahih Muslim 975).",
        targetCount: 1
      }
    ]
  },
  {
    id: "jummah_salawat_blessings",
    category: "Friday Blessings, Salawat & Duas of Acceptance (أدعية وبركات يوم الجمعة والصلاة على النبي ﷺ)",
    iconName: "Sparkles",
    items: [
      {
        id: "jm1",
        arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ النَّبِيِّ الْأُمِّيِّ وَعَلَى آلِهِ وَسَلِّمْ تَسْلِيمًا",
        transliteration: "Allahumma salli 'ala Muhammadinin-Nabiyyil-ummiyyi wa 'ala aalihi wa sallim tasleema.",
        english: "O Allah, send blessings upon Muhammad, the Unlettered Prophet, and upon his family, and grant them abundant peace.",
        benefit: "Increasing blessings on Friday causes them to be presented directly to the Prophet ﷺ (Sunan Abi Dawud 1047).",
        targetCount: 100
      },
      {
        id: "jm2",
        arabic: "اللَّهُمَّ يَا سَمِيعَ الدُّعَاءِ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ، بَلِّغْنَا سَاعَةَ اسْتِجَابَتِكَ فِي هَذَا الْيَوْمِ الْمُبَارَكِ وَافْتَحْ لَنَا أَبْوَابَ خَيْرِكَ",
        transliteration: "Allahumma ya Samee'ad-du'a' ya dhal-Jalali wal-Ikram, ballighna sa'ata-stijabatika fee hadhal-yawmil-mubarak waftah lana abwaba khayrik.",
        english: "O Allah, O Hearer of supplications, Owner of Majesty and Honor, grant us to catch Your hour of response on this blessed Friday and open for us the gates of Your good.",
        benefit: "Supplication during Friday afternoon leading up to Maghrib (the golden hour of answered prayer).",
        targetCount: 7
      }
    ]
  }
];

