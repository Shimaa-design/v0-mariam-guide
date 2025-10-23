"use client"

import { useState, useEffect, useRef } from "react"
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
  List,
} from "lucide-react"

export default function AzkarApp() {
  const [mainTab, setMainTab] = useState("duaa") // duaa, hadith, quran
  const [selectedCategory, setSelectedCategory] = useState("morning")
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [completedAzkar, setCompletedAzkar] = useState(new Set<string>())
  const [readHadith, setReadHadith] = useState(new Set<string>())
  const [quranBookmark, setQuranBookmark] = useState<{ surahNumber: number | null; ayahNumber: number | null }>({
    surahNumber: null,
    ayahNumber: null,
  })
  const [expandedSurah, setExpandedSurah] = useState<number | null>(null)
  const [quranView, setQuranView] = useState<"list" | "reading">("list")
  const [selectedSurah, setSelectedSurah] = useState<any>(null)
  const dhikrRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const ayahRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Add custom scrollbar styling
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  // Clear refs when category changes
  useEffect(() => {
    dhikrRefs.current = {}
  }, [selectedCategory])

  // Reset Quran view when switching tabs
  useEffect(() => {
    if (mainTab !== "quran") {
      setQuranView("list")
    }
  }, [mainTab])

  const azkarData = {
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
            "There is no god but Allah alone, with no partner. His is the dominion and His is the praise, and He has power over all things",
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
            "There is no god but Allah alone, with no partner. His is the dominion and His is the praise, and He has power over all things",
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
          arabic: "آية الكرسي",
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
          arabic: "اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي، وَعَلِّمْنِي مَا يَنْفَعُنِي، وَزِدْنِي عِلْمًا",
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

  const hadithData = [
    {
      id: "h1",
      number: 1,
      arabic:
        "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوْ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ",
    },
    {
      id: "h2",
      number: 2,
      arabic:
        "بَيْنَمَا نَحْنُ جُلُوسٌ عِنْدَ رَسُولِ اللَّهِ صلى الله عليه وسلم ذَاتَ يَوْمٍ، إِذْ طَلَعَ عَلَيْنَا رَجُلٌ شَدِيدُ بَيَاضِ الثِّيَابِ، شَدِيدُ سَوَادِ الشَّعْرِ، لَا يُرَى عَلَيْهِ أَثَرُ السَّفَرِ، وَلَا يَعْرِفُهُ مِنَّا أَحَدٌ، حَتَّى جَلَسَ إِلَى النَّبِيِّ صلى الله عليه وسلم، فَأَسْنَدَ رُكْبَتَيْهِ إِلَى رُكْبَتَيْهِ، وَوَضَعَ كَفَّيْهِ عَلَى فَخِذَيْهِ، وَقَالَ: يَا مُحَمَّدُ أَخْبِرْنِي عَنْ الْإِسْلَامِ. فَقَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: الْإِسْلَامُ أَنْ تَشْهَدَ أَنْ لَا إلَهَ إلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَتُقِيمَ الصَّلَاةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ الْبَيْتَ إنْ اسْتَطَعْت إلَيْهِ سَبِيلًا. قَالَ: صَدَقْت. فَعَجِبْنَا لَهُ يَسْأَلُهُ وَيُصَدِّقُهُ! قَالَ: فَأَخْبِرْنِي عَنْ الْإِيمَانِ. قَالَ: أَنْ تُؤْمِنَ بِاَللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ وَالْيَوْمِ الْآخِرِ، وَتُؤْمِنَ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ. قَالَ: صَدَقْت. قَالَ: فَأَخْبِرْنِي عَنْ الْإِحْسَانِ. قَالَ: أَنْ تَعْبُدَ اللَّهَ كَأَنَّك تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاك",
    },
    {
      id: "h3",
      number: 3,
      arabic:
        "بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إلَهَ إلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ الْبَيْتِ، وَصَوْمِ رَمَضَانَ",
    },
    {
      id: "h4",
      number: 4,
      arabic:
        "إنَّ أَحَدَكُمْ يُجْمَعُ خَلْقُهُ فِي بَطْنِ أُمِّهِ أَرْبَعِينَ يَوْمًا نُطْفَةً، ثُمَّ يَكُونُ عَلَقَةً مِثْلَ ذَلِكَ، ثُمَّ يَكُونُ مُضْغَةً مِثْلَ ذَلِكَ، ثُمَّ يُرْسَلُ إلَيْهِ الْمَلَكُ فَيَنْفُخُ فِيهِ الرُّوحَ، وَيُؤْمَرُ بِأَرْبَعِ كَلِمَاتٍ: بِكَتْبِ رِزْقِهِ، وَأَجَلِهِ، وَعَمَلِهِ، وَشَقِيٍّ أَمْ سَعِيدٍ",
    },
    {
      id: "h5",
      number: 5,
      arabic: "مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ",
    },
    {
      id: "h6",
      number: 6,
      arabic:
        "إنَّ الْحَلَالَ بَيِّنٌ، وَإِنَّ الْحَرَامَ بَيِّنٌ، وَبَيْنَهُمَا أُمُورٌ مُشْتَبِهَاتٌ لَا يَعْلَمُهُنَّ كَثِيرٌ مِنْ النَّاسِ، فَمَنْ اتَّقَى الشُّبُهَاتِ فَقْد اسْتَبْرَأَ لِدِينِهِ وَعِرْضِهِ، وَمَنْ وَقَعَ فِي الشُّبُهَاتِ وَقَعَ فِي الْحَرَامِ، كَالرَّاعِي يَرْعَى حَوْلَ الْحِمَى يُوشِكُ أَنْ يَرْتَعَ فِيهِ، أَلَا وَإِنَّ لِكُلِّ مَلِكٍ حِمًى، أَلَا وَإِنَّ حِمَى اللَّهِ مَحَارِمُهُ",
    },
    {
      id: "h7",
      number: 7,
      arabic: "الدِّينُ النَّصِيحَةُ. قُلْنَا: لِمَنْ؟ قَالَ: لِلَّهِ، وَلِكِتَابِهِ، وَلِرَسُولِهِ، وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ",
    },
    {
      id: "h8",
      number: 8,
      arabic:
        "أُمِرْتُ أَنْ أُقَاتِلَ النَّاسَ حَتَّى يَشْهَدُوا أَنْ لَا إلَهَ إلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَيُقِيمُوا الصَّلَاةَ، وَيُؤْتُوا الزَّكَاةَ، فَإِذَا فَعَلُوا ذَلِكَ عَصَمُوا مِنِّي دِمَاءَهُمْ وَأَمْوَالَهُمْ إلَّا بِحَقِّ الْإِسْلَامِ، وَحِسَابُهُمْ عَلَى اللَّهِ تَعَالَى",
    },
    {
      id: "h9",
      number: 9,
      arabic:
        "مَا نَهَيْتُكُمْ عَنْهُ فَاجْتَنِبُوهُ، وَمَا أَمَرْتُكُمْ بِهِ فَأْتُوا مِنْهُ مَا اسْتَطَعْتُمْ، فَإِنَّمَا أَهْلَكَ الَّذِينَ مِنْ قَبْلِكُمْ كَثْرَةُ مَسَائِلِهِمْ وَاخْتِلَافُهُمْ عَلَى أَنْبِيَائِهِمْ",
    },
    {
      id: "h10",
      number: 10,
      arabic: "إنَّ اللَّهَ طَيِّبٌ لَا يَقْبَلُ إلَّا طَيِّبًا، وَإِنَّ اللَّهَ أَمَرَ الْمُؤْمِنِينَ بِمَا أَمَرَ بِهِ الْمُرْسَلِينَ",
    },
    {
      id: "h11",
      number: 11,
      arabic: "دَعْ مَا يَرِيبُكَ إلَى مَا لَا يَرِيبُكَ",
    },
    {
      id: "h12",
      number: 12,
      arabic: "مِنْ حُسْنِ إسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ",
    },
    {
      id: "h13",
      number: 13,
      arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    },
    {
      id: "h14",
      number: 14,
      arabic: "لَا يَحِلُّ دَمُ امْرِئٍ مُسْلِمٍ إلَّا بِإِحْدَى ثَلَاثٍ: الثَّيِّبُ الزَّانِي، وَالنَّفْسُ بِالنَّفْسِ، وَالتَّارِكُ لِدِينِهِ الْمُفَارِقُ لِلْجَمَاعَةِ",
    },
    {
      id: "h15",
      number: 15,
      arabic:
        "مَنْ كَانَ يُؤْمِنُ بِاَللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاَللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاَللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ ضَيْفَهُ",
    },
    {
      id: "h16",
      number: 16,
      arabic: "لَا تَغْضَبْ",
    },
    {
      id: "h17",
      number: 17,
      arabic:
        "إنَّ اللَّهَ كَتَبَ الْإِحْسَانَ عَلَى كُلِّ شَيْءٍ، فَإِذَا قَتَلْتُمْ فَأَحْسِنُوا الْقِتْلَةَ، وَإِذَا ذَبَحْتُمْ فَأَحْسِنُوا الذِّبْحَةَ، وَلْيُحِدَّ أَحَدُكُمْ شَفْرَتَهُ، وَلْيُرِحْ ذَبِيحَتَهُ",
    },
    {
      id: "h18",
      number: 18,
      arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْت، وَأَتْبِعْ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ",
    },
    {
      id: "h19",
      number: 19,
      arabic:
        "احْفَظْ اللَّهَ يَحْفَظْك، احْفَظْ اللَّهَ تَجِدْهُ تُجَاهَك، إذَا سَأَلْت فَاسْأَلْ اللَّهَ، وَإِذَا اسْتَعَنْت فَاسْتَعِنْ بِاَللَّهِ، وَاعْلَمْ أَنَّ الْأُمَّةَ لَوْ اجْتَمَعَتْ عَلَى أَنْ يَنْفَعُوك بِشَيْءٍ لَمْ يَنْفَعُوك إلَّا بِشَيْءٍ قَدْ كَتَبَهُ اللَّهُ لَك، وَإِنْ اجْتَمَعُوا عَلَى أَنْ يَضُرُّوك بِشَيْءٍ لَمْ يَضُرُّوك إلَّا بِشَيْءٍ قَدْ كَتَبَهُ اللَّهُ عَلَيْك، رُفِعَتْ الْأَقْلَامُ وَجَفَّتْ الصُّحُفُ",
    },
    {
      id: "h20",
      number: 20,
      arabic: "إنْ لَمْ تَسْتَحِ فَاصْنَعْ مَا شِئْت",
    },
    {
      id: "h21",
      number: 21,
      arabic: "قُلْ: آمَنْت بِاَللَّهِ، ثُمَّ اسْتَقِمْ",
    },
    {
      id: "h22",
      number: 22,
      arabic:
        "الطُّهُورُ شَطْرُ الْإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلَأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلَآنِ - أَوْ تَمْلَأُ - مَا بَيْنَ السَّمَاءِ وَالْأَرْضِ، وَالصَّلَاةُ نُورٌ، وَالصَّدَقَةُ بُرْهَانٌ، وَالصَّبْرُ ضِيَاءٌ، وَالْقُرْآنُ حُجَّةٌ لَك أَوْ عَلَيْك، كُلُّ النَّاسِ يَغْدُو، فَبَائِعٌ نَفْسَهُ فَمُعْتِقُهَا أَوْ مُوبِقُهَا",
    },
    {
      id: "h23",
      number: 23,
      arabic: "الطَّهُورُ شَطْرُ الْإِيمَانِ",
    },
    {
      id: "h24",
      number: 24,
      arabic: "يَا عِبَادِي، إنِّي حَرَّمْت الظُّلْمَ عَلَى نَفْسِي وَجَعَلْتُهُ بَيْنَكُمْ مُحَرَّمًا فَلَا تَظَالَمُوا",
    },
    {
      id: "h25",
      number: 25,
      arabic:
        "كُلُّ سُلَامَى مِنْ النَّاسِ عَلَيْهِ صَدَقَةٌ، كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ تَعْدِلُ بَيْنَ اثْنَيْنِ صَدَقَةٌ، وَتُعِينُ الرَّجُلَ فِي دَابَّتِهِ فَتَحْمِلُهُ عَلَيْهَا أَوْ تَرْفَعُ لَهُ عَلَيْهَا مَتَاعَهُ صَدَقَةٌ، وَالْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ، وَبِكُلِّ خُطْوَةٍ تَمْشِيهَا إلَى الصَّلَاةِ صَدَقَةٌ، وَتُمِيطُ الْأَذَى عَنْ الطَّرِيقِ صَدَقَةٌ",
    },
    {
      id: "h26",
      number: 26,
      arabic: "كُلُّ مَعْرُوفٍ صَدَقَةٌ",
    },
    {
      id: "h27",
      number: 27,
      arabic: "الْبِرُّ حُسْنُ الْخُلُقِ، وَالْإِثْمُ مَا حَاكَ فِي نَفْسِك وَكَرِهْت أَنْ يَطَّلِعَ عَلَيْهِ النَّاسُ",
    },
    {
      id: "h28",
      number: 28,
      arabic:
        "أَوْصِيكَ بِتَقْوَى اللَّهِ، وَالسَّمْعِ وَالطَّاعَةِ وَإِنْ عَبْدًا حَبَشِيًّا، فَإِنَّهُ مَنْ يَعِشْ مِنْكُمْ بَعْدِي فَسَيَرَى اخْتِلَافًا كَثِيرًا، فَعَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الْخُلَفَاءِ الرَّاشِدِينَ الْمَهْدِيِّينَ، عَضُّوا عَلَيْهَا بِالنَّوَاجِذِ، وَإِيَّاكُمْ وَمُحْدَثَاتِ الْأُمُورِ، فَإِنَّ كُلَّ بِدْعَةٍ ضَلَالَةٌ",
    },
    {
      id: "h29",
      number: 29,
      arabic: "مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِلِسَانِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِقَلْبِهِ، وَذَلِكَ أَضْعَفُ الْإِيمَانِ",
    },
    {
      id: "h30",
      number: 30,
      arabic:
        "إنَّ اللَّهَ تَعَالَى فَرَضَ فَرَائِضَ فَلَا تُضَيِّعُوهَا، وَحَدَّ حُدُودًا فَلَا تَعْتَدُوهَا، وَحَرَّمَ أَشْيَاءَ فَلَا تَنْتَهِكُوهَا، وَسَكَتَ عَنْ أَشْيَاءَ رَحْمَةً لَكُمْ غَيْرَ نِسْيَانٍ فَلَا تَبْحَثُوا عَنْهَا",
    },
    {
      id: "h31",
      number: 31,
      arabic: "ازْهَدْ فِي الدُّنْيَا يُحِبُّك اللَّهُ، وَازْهَدْ فِيمَا عِنْدَ النَّاسِ يُحِبُّك النَّاسُ",
    },
    {
      id: "h32",
      number: 32,
      arabic: "لَا ضَرَرَ وَلَا ضِرَارَ",
    },
    {
      id: "h33",
      number: 33,
      arabic: "الْبَيِّنَةُ عَلَى الْمُدَّعِي، وَالْيَمِينُ عَلَى مَنْ أَنْكَرَ",
    },
    {
      id: "h34",
      number: 34,
      arabic: "مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِلِسَانِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِقَلْبِهِ، وَذَلِكَ أَضْعَفُ الْإِيمَانِ",
    },
    {
      id: "h35",
      number: 35,
      arabic:
        "لَا تَحَاسَدُوا، وَلَا تَنَاجَشُوا، وَلَا تَبَاغَضُوا، وَلَا تَدَابَرُوا، وَلَا يَبِعْ بَعْضُكُمْ عَلَى بَيْعِ بَعْضٍ، وَكُونُوا عِبَادَ اللَّهِ إخْوَانًا، الْمُسْلِمُ أَخُو الْمُسْلِمِ لَا يَظْلِمُهُ وَلَا يَخْذُلُهُ وَلَا يَحْقِرُهُ، التَّقْوَى هَاهُنَا - وَيُشِيرُ إلَى صَدْرِهِ ثَلَاثَ مَرَّاتٍ - بِحَسْبِ امْرِئٍ مِنْ الشَّرِّ أَنْ يَحْقِرَ أَخَاهُ الْمُسْلِمَ، كُلُّ الْمُسْلِمِ عَلَى الْمُسْلِمِ حَرَامٌ دَمُهُ وَمَالُهُ وَعِرْضُهُ",
    },
    {
      id: "h36",
      number: 36,
      arabic:
        "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ، وَمَنْ يَسَّرَ عَلَى مُعْسِرٍ يَسَّرَ اللَّهُ عَلَيْهِ فِي الدُّنْيَا وَالْآخِرَةِ، وَمَنْ سَتَرَ مُسْلِمًا سَتَرَهُ اللَّهُ فِي الدُّنْيَا وَالْآخِرَةِ، وَاَللَّهُ فِي عَوْنِ الْعَبْدِ مَا كَانَ الْعَبْدُ فِي عَوْنِ أَخِيهِ",
    },
    {
      id: "h37",
      number: 37,
      arabic:
        "إنَّ اللَّهَ تَعَالَى كَتَبَ الْحَسَنَاتِ وَالسَّيِّئَاتِ، ثُمَّ بَيَّنَ ذَلِكَ، فَمَنْ هَمَّ بِحَسَنَةٍ فَلَمْ يَعْمَلْهَا كَتَبَهَا اللَّهُ عِنْدَهُ حَسَنَةً كَامِلَةً، وَإِنْ هَمَّ بِهَا فَعَمِلَهَا كَتَبَهَا اللَّهُ عِنْدَهُ عَشْرَ حَسَنَاتٍ إلَى سَبْعِمِائَةِ ضِعْفٍ إلَى أَضْعَافٍ كَثِيرَةٍ، وَإِنْ هَمَّ بِسَيِّئَةٍ فَلَمْ يَعْمَلْهَا كَتَبَهَا اللَّهُ عِنْدَهُ حَسَنَةً كَامِلَةً، وَإِنْ هَمَّ بِهَا فَعَمِلَهَا كَتَبَهَا اللَّهُ سَيِّئَةً وَاحِدَةً",
    },
    {
      id: "h38",
      number: 38,
      arabic:
        "مَنْ عَادَى لِي وَلِيًّا فَقَدْ آذَنْتُهُ بِالْحَرْبِ، وَمَا تَقَرَّبَ إلَيَّ عَبْدِي بِشَيْءٍ أَحَبَّ إلَيَّ مِمَّا افْتَرَضْتُهُ عَلَيْهِ، وَلَا يَزَالُ عَبْدِي يَتَقَرَّبُ إلَيَّ بِالنَّوَافِلِ حَتَّى أُحِبَّهُ، فَإِذَا أَحْبَبْتُهُ كُنْت سَمْعَهُ الَّذِي يَسْمَعُ بِهِ، وَبَصَرَهُ الَّذِي يُبْصِرُ بِهِ، وَيَدَهُ الَّتِي يَبْطِشُ بِهَا، وَرِجْلَهُ الَّتِي يَمْشِي بِهَا، وَلَئِنْ سَأَلَنِي لَأُعْطِيَنَّهُ، وَلَئِنْ اسْتَعَاذَنِي لَأُعِيذَنَّهُ",
    },
    {
      id: "h39",
      number: 39,
      arabic: "إنَّ اللَّهَ تَجَاوَزَ لِي عَنْ أُمَّتِي الْخَطَأَ وَالنِّسْيَانَ وَمَا اُسْتُكْرِهُوا عَلَيْهِ",
    },
    {
      id: "h40",
      number: 40,
      arabic: "كُنْ فِي الدُّنْيَا كَأَنَّك غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ",
    },
  ]

  // Quran Data - Sample surahs (organized by length - shortest to longest)
  const quranData = [
    {
      number: 108,
      name: "الكوثر",
      verses: [
        { number: 1, arabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", english: "Indeed, We have granted you al-Kawthar." },
        { number: 2, arabic: "فَصَلِّ لِرَبِّكَ وَانْحَرْ", english: "So pray to your Lord and sacrifice [to Him alone]." },
        { number: 3, arabic: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ", english: "Indeed, your enemy is the one cut off." },
      ],
    },
    {
      number: 103,
      name: "العصر",
      verses: [
        { number: 1, arabic: "وَالْعَصْرِ", english: "By time," },
        { number: 2, arabic: "إِنَّ الْإِنسَانَ لَفِي خُسْرٍ", english: "Indeed, mankind is in loss," },
        {
          number: 3,
          arabic: "إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
          english:
            "Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.",
        },
      ],
    },
    {
      number: 112,
      name: "الإخلاص",
      verses: [
        { number: 1, arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", english: "Say, He is Allah, [who is] One," },
        { number: 2, arabic: "اللَّهُ الصَّمَدُ", english: "Allah, the Eternal Refuge." },
        { number: 3, arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", english: "He neither begets nor is born," },
        { number: 4, arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", english: "Nor is there to Him any equivalent." },
      ],
    },
    {
      number: 113,
      name: "الفلق",
      verses: [
        { number: 1, arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", english: "Say, I seek refuge in the Lord of daybreak" },
        { number: 2, arabic: "مِن شَرِّ مَا خَلَقَ", english: "From the evil of that which He created" },
        { number: 3, arabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", english: "And from the evil of darkness when it settles" },
        { number: 4, arabic: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", english: "And from the evil of the blowers in knots" },
        { number: 5, arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", english: "And from the evil of an envier when he envies." },
      ],
    },
    {
      number: 114,
      name: "الناس",
      verses: [
        { number: 1, arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", english: "Say, I seek refuge in the Lord of mankind," },
        { number: 2, arabic: "مَلِكِ النَّاسِ", english: "The Sovereign of mankind." },
        { number: 3, arabic: "إِلَٰهِ النَّاسِ", english: "The God of mankind," },
        { number: 4, arabic: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", english: "From the evil of the retreating whisperer" },
        { number: 5, arabic: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", english: "Who whispers [evil] into the breasts of mankind" },
        { number: 6, arabic: "مِنَ الْجِنَّةِ وَالنَّاسِ", english: "From among the jinn and mankind." },
      ],
    },
    {
      number: 1,
      name: "الفاتحة",
      verses: [
        {
          number: 1,
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          english: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        },
        { number: 2, arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", english: "All praise is due to Allah, Lord of the worlds" },
        { number: 3, arabic: "الرَّحْمَٰنِ الرَّحِيمِ", english: "The Entirely Merciful, the Especially Merciful," },
        { number: 4, arabic: "مَالِكِ يَوْمِ الدِّينِ", english: "Sovereign of the Day of Recompense." },
        { number: 5, arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", english: "It is You we worship and You we ask for help." },
        { number: 6, arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", english: "Guide us to the straight path" },
        {
          number: 7,
          arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          english:
            "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
        },
      ],
    },
    {
      number: 93,
      name: "الضحى",
      verses: [
        { number: 1, arabic: "وَالضُّحَىٰ", english: "By the morning brightness" },
        { number: 2, arabic: "وَاللَّيْلِ إِذَا سَجَىٰ", english: "And [by] the night when it covers with darkness," },
        {
          number: 3,
          arabic: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ",
          english: "Your Lord has not taken leave of you, nor has He detested [you].",
        },
        {
          number: 4,
          arabic: "وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ",
          english: "And the Hereafter is better for you than the first [life].",
        },
        {
          number: 5,
          arabic: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
          english: "And your Lord is going to give you, and you will be satisfied.",
        },
        { number: 6, arabic: "أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ", english: "Did He not find you an orphan and give [you] refuge?" },
        { number: 7, arabic: "وَوَجَدَكَ ضَالًّا فَهَدَىٰ", english: "And He found you lost and guided [you]," },
        { number: 8, arabic: "وَوَجَدَكَ عَائِلًا فَأَغْنَىٰ", english: "And He found you poor and made [you] self-sufficient." },
        { number: 9, arabic: "فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ", english: "So as for the orphan, do not oppress [him]." },
        { number: 10, arabic: "وَأَمَّا السَّائِلَ فَلَا تَنْهَرْ", english: "And as for the petitioner, do not repel [him]." },
        { number: 11, arabic: "وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ", english: "But as for the favor of your Lord, report [it]." },
      ],
    },
    {
      number: 18,
      name: "الكهف",
      hasSpecialReminder: true,
      verses: [
        {
          number: 1,
          arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ وَلَمْ يَجْعَل لَّهُ عِوَجًا",
          english:
            "All praise is due to Allah, who has sent down upon His Servant the Book and has not made therein any deviance.",
        },
        {
          number: 2,
          arabic: "قَيِّمًا لِّيُنذِرَ بَأْسًا شَدِيدًا مِّن لَّدُنْهُ وَيُبَشِّرَ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا حَسَنًا",
          english:
            "[He has made it] straight, to warn of severe punishment from Him and to give good tidings to the believers who do righteous deeds that they will have a good reward.",
        },
        { number: 3, arabic: "مَّاكِثِينَ فِيهِ أَبَدًا", english: "In which they will remain forever" },
      ],
    },
    {
      number: 2,
      name: "البقرة",
      verses: [
        {
          number: 255,
          arabic:
            "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
          english:
            "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
          isSpecial: true,
          specialName: "آية الكرسي",
        },
      ],
    },
  ]

  const currentCategory = azkarData[selectedCategory as keyof typeof azkarData]

  const handleIncrement = (dhikrId: string, maxCount: number, currentIndex: number) => {
    setCounts((prev) => {
      const currentCount = prev[dhikrId] || 0
      const newCount = currentCount + 1

      if (newCount >= maxCount) {
        setCompletedAzkar((prev) => new Set([...prev, dhikrId]))

        // Scroll to next dhikr after a short delay
        setTimeout(() => {
          const nextIndex = currentIndex + 1
          const azkarList = currentCategory.azkar

          if (nextIndex < azkarList.length) {
            const nextDhikrId = azkarList[nextIndex].id
            const nextElement = dhikrRefs.current[nextDhikrId]

            if (nextElement) {
              nextElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              })
            }
          }
        }, 300)
      }

      return {
        ...prev,
        [dhikrId]: newCount >= maxCount ? maxCount : newCount,
      }
    })
  }

  const resetCounter = (dhikrId: string) => {
    setCounts((prev) => ({
      ...prev,
      [dhikrId]: 0,
    }))
    setCompletedAzkar((prev) => {
      const newSet = new Set(prev)
      newSet.delete(dhikrId)
      return newSet
    })
  }

  const resetCategory = () => {
    const categoryIds = currentCategory.azkar.map((a) => a.id)
    setCounts((prev) => {
      const newCounts = { ...prev }
      categoryIds.forEach((id) => delete newCounts[id])
      return newCounts
    })
    setCompletedAzkar((prev) => {
      const newSet = new Set(prev)
      categoryIds.forEach((id) => newSet.delete(id))
      return newSet
    })
  }

  const markHadithAsRead = (hadithId: string) => {
    setReadHadith((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(hadithId)) {
        newSet.delete(hadithId)
      } else {
        newSet.add(hadithId)
      }
      return newSet
    })
  }

  const setBookmark = (surahNumber: number, ayahNumber: number) => {
    setQuranBookmark({ surahNumber, ayahNumber })
  }

  const continueReading = () => {
    if (quranBookmark.surahNumber) {
      const surah = quranData.find((s) => s.number === quranBookmark.surahNumber)
      if (surah) {
        setSelectedSurah(surah)
        setQuranView("reading")
      }
    }
  }

  const openSurah = (surah: any) => {
    // Clear previous refs before opening new surah
    ayahRefs.current = {}
    setSelectedSurah(surah)
    setQuranView("reading")
    // Scroll to top when opening a surah
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const backToSurahList = () => {
    setQuranView("list")
    setSelectedSurah(null)
  }

  const goToPreviousSurah = () => {
    if (!selectedSurah) return
    const currentIndex = quranData.findIndex((s) => s.number === selectedSurah.number)
    if (currentIndex > 0) {
      openSurah(quranData[currentIndex - 1])
    }
  }

  const goToNextSurah = () => {
    if (!selectedSurah) return
    const currentIndex = quranData.findIndex((s) => s.number === selectedSurah.number)
    if (currentIndex < quranData.length - 1) {
      openSurah(quranData[currentIndex + 1])
    }
  }

  const handleAyahClick = (currentAyahIndex: number) => {
    if (!selectedSurah) return

    const nextAyahIndex = currentAyahIndex + 1
    if (nextAyahIndex < selectedSurah.verses.length) {
      const nextAyahKey = `${selectedSurah.number}-${nextAyahIndex}`
      const nextElement = ayahRefs.current[nextAyahKey]

      if (nextElement) {
        setTimeout(() => {
          nextElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          })
        }, 300)
      }
    }
  }

  const isFriday = () => {
    const today = new Date()
    return today.getDay() === 5 // 5 = Friday
  }

  const CategoryIcon = mainTab === "duaa" ? currentCategory.icon : BookOpen

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24">
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${mainTab === "duaa" ? currentCategory.color : mainTab === "hadith" ? "from-teal-500 to-emerald-600" : "from-purple-500 to-indigo-600"} text-white p-6 shadow-lg`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <CategoryIcon className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Azkar App</h1>
          </div>
          <p className="text-white/90">
            {mainTab === "duaa" && currentCategory.title}
            {mainTab === "hadith" && "الأربعون النووية"}
            {mainTab === "quran" && "Quran"}
          </p>
        </div>
      </div>

      {/* Category Tabs - Only for Duaa */}
      {mainTab === "duaa" && (
        <div className="bg-white shadow-md sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
              {Object.entries(azkarData).map(([key, data]) => {
                const Icon = data.icon
                const categoryNames: Record<string, string> = {
                  morning: "Morning",
                  evening: "Evening",
                  afterPrayer: "After Prayer",
                  general: "General",
                  beforeSleep: "Before Sleep",
                  waking: "Waking Up",
                  enteringHome: "Entering Home",
                  leavingHome: "Leaving Home",
                  beforeEating: "Before Eating",
                  afterEating: "After Eating",
                  whenItRains: "Rain",
                  traveling: "Travel",
                  anxiety: "Anxiety",
                  gratitude: "Gratitude",
                  seeking_knowledge: "Knowledge",
                  illness: "Illness",
                }
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      selectedCategory === key
                        ? "bg-gradient-to-r " + data.color + " text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{categoryNames[key]}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {mainTab === "duaa" && (
        <div className="max-w-4xl mx-auto p-4 pb-8">
          <div className="mb-4 flex justify-end">
            <button
              onClick={resetCategory}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              Reset All
            </button>
          </div>

          <div className="space-y-4">
            {currentCategory.azkar.map((dhikr, index) => {
              const currentCount = counts[dhikr.id] || 0
              const isCompleted = completedAzkar.has(dhikr.id)
              const progress = (currentCount / dhikr.count) * 100

              return (
                <div
                  key={dhikr.id}
                  ref={(el) => {
                    if (el) dhikrRefs.current[dhikr.id] = el
                  }}
                  className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                    isCompleted ? "ring-2 ring-green-400" : ""
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          isCompleted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        #{index + 1}
                      </span>
                      {isCompleted && <span className="text-green-500 text-sm font-semibold">✓ Completed</span>}
                    </div>

                    {/* Arabic Text */}
                    <div className="text-right mb-4">
                      <p className="text-2xl leading-loose text-gray-800">{dhikr.arabic}</p>
                    </div>

                    {/* Translation */}
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-gray-700">{dhikr.translation}</p>
                    </div>

                    {/* Counter Section */}
                    <div className="space-y-3">
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${currentCategory.color} transition-all duration-300`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Counter Display and Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-lg text-gray-800">{currentCount}</span>
                          <span> / {dhikr.count}</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => resetCounter(dhikr.id)}
                            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => handleIncrement(dhikr.id, dhikr.count, index)}
                            disabled={isCompleted}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${
                              isCompleted
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : `bg-gradient-to-r ${currentCategory.color} text-white hover:shadow-lg active:scale-95`
                            }`}
                          >
                            {isCompleted ? "Done" : "Count"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer Note */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              May Allah accept your dhikr and grant you His blessings 🤲
            </p>
          </div>
        </div>
      )}

      {/* Hadith Section */}
      {mainTab === "hadith" && (
        <div className="max-w-4xl mx-auto p-4 pb-8">
          <div className="mb-4 text-center">
            <p className="text-gray-600 text-sm">{readHadith.size} of 40 read</p>
          </div>

          <div className="space-y-4">
            {hadithData.map((hadith) => {
              const isRead = readHadith.has(hadith.id)

              return (
                <div
                  key={hadith.id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                    isRead ? "ring-2 ring-emerald-400" : ""
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          isRead ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        الحديث #{hadith.number}
                      </span>
                      {isRead && <span className="text-emerald-500 text-sm font-semibold">✓ Read</span>}
                    </div>

                    {/* Arabic Text */}
                    <div className="text-right mb-6">
                      <p className="text-xl leading-loose text-gray-800">{hadith.arabic}</p>
                    </div>

                    {/* Read Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => markHadithAsRead(hadith.id)}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          isRead
                            ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                            : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:shadow-lg active:scale-95"
                        }`}
                      >
                        {isRead ? "Mark as Unread" : "Mark as Read"}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer Note */}
          <div className="mt-8 p-4 bg-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-800 text-center">
              الأربعون النووية - Imam An-Nawawi&apos;s 40 Hadith Collection 📚
            </p>
          </div>
        </div>
      )}

      {/* Quran Section */}
      {mainTab === "quran" && (
        <div className="max-w-4xl mx-auto p-4 pb-8">
          {/* LIST VIEW */}
          {quranView === "list" && (
            <>
              {/* Friday Reminder for Al-Kahf */}
              {isFriday() && (
                <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🕌</span>
                    <div>
                      <p className="font-semibold text-amber-900">It&apos;s Friday!</p>
                      <p className="text-sm text-amber-800">It&apos;s recommended to recite Surah Al-Kahf today</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bookmark Continue Reading */}
              {quranBookmark.surahNumber && (
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-purple-900">Continue Reading</p>
                      <p className="text-sm text-purple-700">
                        {quranData.find((s) => s.number === quranBookmark.surahNumber)?.name} - Ayah{" "}
                        {quranBookmark.ayahNumber}
                      </p>
                    </div>
                    <button
                      onClick={continueReading}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Surahs List */}
              <div className="space-y-3">
                {quranData.map((surah) => {
                  const isKahf = surah.number === 18
                  const hasBookmark = quranBookmark.surahNumber === surah.number

                  return (
                    <button
                      key={surah.number}
                      onClick={() => openSurah(surah)}
                      className={`w-full bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all text-left ${
                        isKahf && isFriday() ? "ring-2 ring-amber-400" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                            {surah.number}
                          </div>
                          <div className="text-right">
                            <h3 className="text-xl font-bold text-gray-800">{surah.name}</h3>
                            <p className="text-sm text-gray-500">{surah.verses.length} verses</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasBookmark && <span className="text-purple-500 text-sm font-semibold">🔖</span>}
                          {isKahf && isFriday() && <span className="text-amber-500 text-sm">🕌</span>}
                          <span className="text-gray-400 text-xl">→</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Footer Note */}
              <div className="mt-8 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800 text-center">
                  📖 Sample surahs included. For complete Quran, integrate with Quran API
                </p>
              </div>
            </>
          )}

          {/* READING VIEW */}
          {quranView === "reading" && selectedSurah && (
            <>
              {/* Back Button & Surah Header */}
              <div className="mb-4 sticky top-0 bg-gradient-to-br from-slate-50 to-slate-100 z-10 pb-4">
                <button
                  onClick={backToSurahList}
                  className="mb-3 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  <span className="text-xl">←</span>
                  <span>Back to Surahs</span>
                </button>

                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-5 rounded-xl shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center font-bold text-xl">
                      {selectedSurah.number}
                    </div>
                    <div className="text-right flex-1">
                      <h2 className="text-2xl font-bold">{selectedSurah.name}</h2>
                      <p className="text-white/90 text-sm">{selectedSurah.verses.length} verses</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verses */}
              <div className="space-y-6">
                {selectedSurah.verses.map((verse: any, index: number) => {
                  const isBookmarked =
                    quranBookmark.surahNumber === selectedSurah.number && quranBookmark.ayahNumber === verse.number
                  const isAyatAlKursi = verse.isSpecial
                  const ayahKey = `${selectedSurah.number}-${index}`

                  return (
                    <div
                      key={verse.number}
                      ref={(el) => {
                        if (el) ayahRefs.current[ayahKey] = el
                      }}
                      onClick={() => handleAyahClick(index)}
                      className={`p-5 rounded-xl transition-all cursor-pointer ${
                        isAyatAlKursi
                          ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 hover:border-amber-400"
                          : isBookmarked
                            ? "bg-purple-50 border-2 border-purple-300 hover:border-purple-400"
                            : "bg-white shadow-md hover:shadow-lg hover:scale-[1.01]"
                      }`}
                    >
                      {/* Special Badge for Ayat al-Kursi */}
                      {isAyatAlKursi && (
                        <div className="mb-3 flex items-center gap-2">
                          <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                            ⭐ {verse.specialName}
                          </span>
                        </div>
                      )}

                      {/* Ayah Number */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          Ayah {verse.number}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setBookmark(selectedSurah.number, verse.number)
                          }}
                          className={`text-sm px-3 py-1 rounded-full transition-all ${
                            isBookmarked ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                        >
                          {isBookmarked ? "🔖 Bookmarked" : "Bookmark"}
                        </button>
                      </div>

                      {/* Arabic Text */}
                      <div className="text-right mb-4">
                        <p className={`leading-loose text-gray-800 ${isAyatAlKursi ? "text-2xl" : "text-xl"}`}>
                          {verse.arabic}
                        </p>
                      </div>

                      {/* English Translation */}
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-700 leading-relaxed">{verse.english}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Al-Kahf Friday Reminder */}
              {selectedSurah.number === 18 && isFriday() && (
                <div className="mt-6 p-4 bg-amber-100 rounded-lg">
                  <p className="text-sm text-amber-900 text-center">
                    ✨ Reciting Surah Al-Kahf on Friday brings light between the two Fridays
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8">
                {/* Previous/List/Next Navigation */}
                <div className="flex items-stretch justify-between gap-3">
                  <button
                    onClick={goToPreviousSurah}
                    disabled={quranData.findIndex((s) => s.number === selectedSurah.number) === 0}
                    className={`flex-1 h-12 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      quranData.findIndex((s) => s.number === selectedSurah.number) === 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white text-purple-600 border-2 border-purple-500 hover:bg-purple-50 hover:shadow-lg"
                    }`}
                  >
                    <span className="text-xl">←</span>
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={backToSurahList}
                    className="h-12 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center"
                  >
                    <List className="w-5 h-5" />
                  </button>

                  <button
                    onClick={goToNextSurah}
                    disabled={quranData.findIndex((s) => s.number === selectedSurah.number) === quranData.length - 1}
                    className={`flex-1 h-12 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      quranData.findIndex((s) => s.number === selectedSurah.number) === quranData.length - 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white text-purple-600 border-2 border-purple-500 hover:bg-purple-50 hover:shadow-lg"
                    }`}
                  >
                    <span>Next</span>
                    <span className="text-xl">→</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Bottom Tabbar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200">
          <div className="flex items-center justify-around px-2 py-3">
            <button
              onClick={() => setMainTab("duaa")}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-xl transition-all ${
                mainTab === "duaa" ? "bg-gradient-to-br from-teal-50 to-emerald-50" : "hover:bg-gray-50"
              }`}
            >
              <Heart className={`w-6 h-6 mb-1 ${mainTab === "duaa" ? "text-teal-600" : "text-gray-400"}`} />
              <span className={`text-xs font-semibold ${mainTab === "duaa" ? "text-teal-600" : "text-gray-500"}`}>
                Duaa
              </span>
            </button>

            <button
              onClick={() => setMainTab("hadith")}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-xl transition-all ${
                mainTab === "hadith" ? "bg-gradient-to-br from-teal-50 to-emerald-50" : "hover:bg-gray-50"
              }`}
            >
              <BookOpen className={`w-6 h-6 mb-1 ${mainTab === "hadith" ? "text-teal-600" : "text-gray-400"}`} />
              <span className={`text-xs font-semibold ${mainTab === "hadith" ? "text-teal-600" : "text-gray-500"}`}>
                Hadith
              </span>
            </button>

            <button
              onClick={() => setMainTab("quran")}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-xl transition-all ${
                mainTab === "quran" ? "bg-gradient-to-br from-purple-50 to-indigo-50" : "hover:bg-gray-50"
              }`}
            >
              <BookMarked className={`w-6 h-6 mb-1 ${mainTab === "quran" ? "text-purple-600" : "text-gray-400"}`} />
              <span className={`text-xs font-semibold ${mainTab === "quran" ? "text-purple-600" : "text-gray-500"}`}>
                Quran
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
