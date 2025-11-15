import {
  Moon,
  Sun,
  BookOpen,
  Heart,
  Clock,
  Home,
  Utensils,
  CloudRain,
  Car,
  Frown,
  Smile,
  BookMarked,
  DoorOpen,
  AlertCircle,
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'

export interface Zikr {
  id: string
  arabic: string
  translation: string
  count: number
}

export interface AzkarCategory {
  title: string
  icon: LucideIcon
  color: string
  azkar: Zikr[]
}

export interface AzkarData {
  morning: AzkarCategory
  evening: AzkarCategory
  afterPrayer: AzkarCategory
  general: AzkarCategory
  beforeSleep: AzkarCategory
  waking: AzkarCategory
  enteringHome: AzkarCategory
  leavingHome: AzkarCategory
  beforeEating: AzkarCategory
  afterEating: AzkarCategory
  whenItRains: AzkarCategory
  traveling: AzkarCategory
  anxiety: AzkarCategory
  gratitude: AzkarCategory
  seeking_knowledge: AzkarCategory
  illness: AzkarCategory
}

export const azkarData: AzkarData = {
  morning: {
    title: "Morning Azkar (After Fajr)",
    icon: Sun,
    color: "from-amber-400 to-orange-500",
    azkar: [
      {
        id: "m1",
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
        translation: "We have reached the morning and with it all dominion is Allah's, and all praise is for Allah",
        count: 1,
      },
      {
        id: "m2",
        arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
        translation:
          "O Allah, by You we have reached the morning, by You we reach the evening, by You we live, by You we die, and to You is the resurrection",
        count: 1,
      },
      {
        id: "m3",
        arabic:
          "أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ",
        translation:
          "We have reached the morning upon the natural religion of Islam, the word of sincere devotion, the religion of our Prophet Muhammad (peace be upon him), and the way of our father Ibrahim, who was upright and Muslim, and was not of those who associate others with Allah",
        count: 1,
      },
      {
        id: "m4",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        translation: "Glory is to Allah and praise is to Him",
        count: 100,
      },
      {
        id: "m5",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        translation:
          "There is no god but Allah alone, with no partner. His is the dominion and His is the praise, and He has power on all things",
        count: 10,
      },
      {
        id: "m6",
        arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
        translation: "I seek Allah's forgiveness and repent to Him",
        count: 100,
      },
      {
        id: "m7",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
        translation: "O Allah, I ask You for well-being in this world and the Hereafter",
        count: 1,
      },
      {
        id: "m8",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ",
        translation:
          "O Allah, I seek refuge in You from worry and grief, and I seek refuge in You from inability and laziness",
        count: 1,
      },
    ],
  },
  evening: {
    title: "Evening Azkar (After Asr/Maghrib)",
    icon: Moon,
    color: "from-indigo-500 to-purple-600",
    azkar: [
      {
        id: "e1",
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
        translation: "We have reached the evening and with it all dominion is Allah's, and all praise is for Allah",
        count: 1,
      },
      {
        id: "e2",
        arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
        translation:
          "O Allah, by You we have reached the evening, by You we reach the morning, by You we live, by You we die, and to You is the final return",
        count: 1,
      },
      {
        id: "e3",
        arabic:
          "أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ",
        translation:
          "We have reached the evening upon the natural religion of Islam, the word of sincere devotion, the religion of our Prophet Muhammad (peace be upon him), and the way of our father Ibrahim, who was upright and Muslim, and was not of those who associate others with Allah",
        count: 1,
      },
      {
        id: "e4",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        translation: "Glory is to Allah and praise is to Him",
        count: 100,
      },
      {
        id: "e5",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
        translation: "O Allah, I ask You for pardon and well-being in this world and the Hereafter",
        count: 1,
      },
    ],
  },
  afterPrayer: {
    title: "After Prayer",
    icon: BookOpen,
    color: "from-emerald-400 to-teal-500",
    azkar: [
      {
        id: "p1",
        arabic: "أَسْتَغْفِرُ اللَّهَ (ثَلَاثًا)",
        translation: "I seek Allah's forgiveness (3 times)",
        count: 3,
      },
      {
        id: "p2",
        arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        translation:
          "O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of Majesty and Honor",
        count: 1,
      },
      {
        id: "p3",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        translation:
          "There is no god but Allah alone, with no partner. His is the dominion and His is the praise, and He has power on all things",
        count: 1,
      },
      {
        id: "p4",
        arabic: "سُبْحَانَ اللَّهِ",
        translation: "Glory be to Allah",
        count: 33,
      },
      {
        id: "p5",
        arabic: "الْحَمْدُ لِلَّهِ",
        translation: "All praise is for Allah",
        count: 33,
      },
      {
        id: "p6",
        arabic: "اللَّهُ أَكْبَرُ",
        translation: "Allah is the Greatest",
        count: 34,
      },
      {
        id: "p7",
        arabic: "آيَةُ الْكُرْسِيِّ: اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ",
        translation: "Verse of the Throne: Allah - there is no deity except Him, the Ever-Living, the Sustainer...",
        count: 1,
      },
    ],
  },
  general: {
    title: "General Azkar",
    icon: Heart,
    color: "from-rose-400 to-pink-500",
    azkar: [
      {
        id: "g1",
        arabic: "سُبْحَانَ اللَّهِ",
        translation: "Glory be to Allah",
        count: 33,
      },
      {
        id: "g2",
        arabic: "الْحَمْدُ لِلَّهِ",
        translation: "All praise is for Allah",
        count: 33,
      },
      {
        id: "g3",
        arabic: "اللَّهُ أَكْبَرُ",
        translation: "Allah is the Greatest",
        count: 34,
      },
      {
        id: "g4",
        arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        translation: "There is no power nor strength except with Allah",
        count: 10,
      },
      {
        id: "g5",
        arabic: "حَسْبِيَ اللَّهُ وَنِعْمَ الْوَكِيلُ",
        translation: "Allah is sufficient for me, and He is the best Disposer of affairs",
        count: 7,
      },
      {
        id: "g6",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ",
        translation: "There is no god but Allah",
        count: 100,
      },
    ],
  },
  beforeSleep: {
    title: "Before Sleep",
    icon: Clock,
    color: "from-slate-600 to-slate-800",
    azkar: [
      {
        id: "s1",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        translation: "In Your name O Allah, I die and I live",
        count: 1,
      },
      {
        id: "s2",
        arabic: "اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا",
        translation: "O Allah, You created my soul and You take it back. To You is its death and its life",
        count: 1,
      },
      {
        id: "s3",
        arabic: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ",
        translation: "O Allah, I submit myself to You and entrust my affair to You",
        count: 1,
      },
      {
        id: "s4",
        arabic: "سُبْحَانَ اللَّهِ (٣٣) الْحَمْدُ لِلَّهِ (٣٣) اللَّهُ أَكْبَرُ (٣٤)",
        translation: "Glory be to Allah (33), All praise is for Allah (33), Allah is the Greatest (34)",
        count: 1,
      },
      {
        id: "s5",
        arabic: "آيَة الكرسي",
        translation: "Recite Ayat al-Kursi (Al-Baqarah 2:255)",
        count: 1,
      },
      {
        id: "s6",
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        translation: "Say: He is Allah, the One (Recite Al-Ikhlas, Al-Falaq, An-Nas 3 times each)",
        count: 3,
      },
    ],
  },
  waking: {
    title: "Upon Waking Up",
    icon: Sun,
    color: "from-yellow-400 to-amber-500",
    azkar: [
      {
        id: "w1",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        translation:
          "All praise is for Allah who gave us life after having taken it from us, and to Him is the resurrection",
        count: 1,
      },
      {
        id: "w2",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ",
        translation:
          "Praise be to Allah who has restored to me my health and returned my soul and has allowed me to remember Him",
        count: 1,
      },
    ],
  },
  enteringHome: {
    title: "Entering the Home",
    icon: Home,
    color: "from-blue-400 to-cyan-500",
    azkar: [
      {
        id: "h1",
        arabic: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
        translation:
          "In the name of Allah we enter, in the name of Allah we leave, and upon Allah our Lord we depend",
        count: 1,
      },
      {
        id: "h2",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ",
        translation: "O Allah, I ask You for the best entering and the best leaving",
        count: 1,
      },
    ],
  },
  leavingHome: {
    title: "Leaving the Home",
    icon: DoorOpen,
    color: "from-teal-400 to-green-500",
    azkar: [
      {
        id: "l1",
        arabic: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        translation:
          "In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah",
        count: 1,
      },
      {
        id: "l2",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ، أَوْ أُضَلَّ، أَوْ أَزِلَّ، أَوْ أُزَلَّ، أَوْ أَظْلِمَ، أَوْ أُظْلَمَ، أَوْ أَجْهَلَ، أَوْ يُجْهَلَ عَلَيَّ",
        translation:
          "O Allah, I seek refuge in You lest I should stray or be led astray, or slip or be tripped, or oppress or be oppressed, or behave foolishly or be treated foolishly",
        count: 1,
      },
    ],
  },
  beforeEating: {
    title: "Before Eating",
    icon: Utensils,
    color: "from-orange-400 to-red-500",
    azkar: [
      {
        id: "be1",
        arabic: "بِسْمِ اللَّهِ",
        translation: "In the name of Allah",
        count: 1,
      },
      {
        id: "be2",
        arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ",
        translation: "In the name of Allah and with the blessings of Allah",
        count: 1,
      },
    ],
  },
  afterEating: {
    title: "After Eating",
    icon: Smile,
    color: "from-lime-400 to-green-500",
    azkar: [
      {
        id: "ae1",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
        translation: "All praise is for Allah who fed us and gave us drink and made us Muslims",
        count: 1,
      },
      {
        id: "ae2",
        arabic: "الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ، غَيْرَ مَكْفِيٍّ وَلَا مُوَدَّعٍ وَلَا مُسْتَغْنًى عَنْهُ رَبَّنَا",
        translation:
          "All praise is for Allah, praise in abundance, good and blessed, never-ending, indispensable, O our Lord",
        count: 1,
      },
    ],
  },
  whenItRains: {
    title: "When It Rains",
    icon: CloudRain,
    color: "from-blue-500 to-indigo-600",
    azkar: [
      {
        id: "r1",
        arabic: "اللَّهُمَّ صَيِّبًا نَافِعًا",
        translation: "O Allah, make it a beneficial rain",
        count: 1,
      },
      {
        id: "r2",
        arabic: "مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ",
        translation: "We have been given rain by the grace and mercy of Allah",
        count: 1,
      },
    ],
  },
  traveling: {
    title: "When Traveling",
    icon: Car,
    color: "from-purple-400 to-pink-500",
    azkar: [
      {
        id: "t1",
        arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
        translation:
          "Glory to Him who has subjected this to us, and we could never have done it ourselves. And to our Lord we will surely return",
        count: 1,
      },
      {
        id: "t2",
        arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى",
        translation:
          "O Allah, we ask You on this our journey for goodness and piety, and for works that are pleasing to You",
        count: 1,
      },
      {
        id: "t3",
        arabic: "اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا، وَاطْوِ عَنَّا بُعْدَهُ",
        translation: "O Allah, make this journey easy for us and fold up for us the earth's distance",
        count: 1,
      },
    ],
  },
  anxiety: {
    title: "For Anxiety & Worry",
    icon: AlertCircle,
    color: "from-red-400 to-rose-600",
    azkar: [
      {
        id: "an1",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ",
        translation:
          "O Allah, I seek refuge in You from worry and grief, and I seek refuge in You from weakness and laziness",
        count: 1,
      },
      {
        id: "an2",
        arabic:
          "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
        translation:
          "There is no god but Allah, the Magnificent, the Forbearing. There is no god but Allah, Lord of the Magnificent Throne. There is no god but Allah, Lord of the heavens, Lord of the earth, and Lord of the Noble Throne",
        count: 1,
      },
      {
        id: "an3",
        arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        translation:
          "Allah is sufficient for me. There is no god but Him. In Him I have placed my trust, and He is the Lord of the Mighty Throne",
        count: 7,
      },
    ],
  },
  gratitude: {
    title: "Expressing Gratitude",
    icon: Heart,
    color: "from-pink-400 to-rose-500",
    azkar: [
      {
        id: "gr1",
        arabic: "الْحَمْدُ لِلَّهِ",
        translation: "All praise is for Allah",
        count: 1,
      },
      {
        id: "gr2",
        arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        translation: "All praise is for Allah, Lord of all the worlds",
        count: 1,
      },
      {
        id: "gr3",
        arabic: "اللَّهُمَّ لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَعَظِيمِ سُلْطَانِكَ",
        translation:
          "O Allah, to You is all praise as is befitting to the majesty of Your Face and the greatness of Your Dominion",
        count: 1,
      },
    ],
  },
  seeking_knowledge: {
    title: "Seeking Knowledge",
    icon: BookMarked,
    color: "from-cyan-400 to-blue-600",
    azkar: [
      {
        id: "sk1",
        arabic: "رَبِّ زِدْنِي عِلْمًا",
        translation: "My Lord, increase me in knowledge",
        count: 1,
      },
      {
        id: "sk2",
        arabic: "اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي، وَعَلِّمْنِي مَا يَنْفَعُونِي، وَزِدْنِي عِلْمًا",
        translation:
          "O Allah, benefit me with what You have taught me, and teach me what will benefit me, and increase me in knowledge",
        count: 1,
      },
      {
        id: "sk3",
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
        translation: "O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds",
        count: 1,
      },
    ],
  },
  illness: {
    title: "During Illness",
    icon: Frown,
    color: "from-gray-400 to-slate-600",
    azkar: [
      {
        id: "il1",
        arabic: "اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا",
        translation:
          "O Allah, Lord of mankind, remove the hardship and grant healing, for You are the Healer. There is no healing but Your healing, a healing that leaves no disease",
        count: 1,
      },
      {
        id: "il2",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        translation: "I seek refuge in the perfect words of Allah from the evil of what He has created",
        count: 3,
      },
      {
        id: "il3",
        arabic: "بِسْمِ اللَّهِ (ثَلَاثًا) أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ",
        translation:
          "In the name of Allah (3 times). I seek refuge in Allah and His power from the evil of what I find and fear (7 times)",
        count: 7,
      },
    ],
  },
}
