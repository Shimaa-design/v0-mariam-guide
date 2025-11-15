export interface Hadith {
  id: string
  number: number
  arabic: string
  translation: string
}

export const hadithData: Hadith[] = [
  {
    id: "h1",
    number: 1,
    arabic:
      "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوْ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ",
    translation:
      "Actions are judged by intentions, and every person will be rewarded according to their intention. So whoever emigrates for the sake of Allah and His Messenger, then his emigration is for Allah and His Messenger. And whoever emigrates for worldly gain or to marry a woman, then his emigration is for whatever he emigrated for.",
  },
  {
    id: "h2",
    number: 2,
    arabic:
      "بَيْنَا نَحْنُ جُلُوسٌ عِنْدَ رَسُولِ اللَّهِ صلى الله عليه وسلم ذَاتَ يَوْمٍ، إِذْ طَلَعَ عَلَيْنَا رَجُلٌ شَدِيدُ بَيَاضِ الثِّيَابِ، شَدِيدُ سَوَادِ الشَّعْرِ، لَا يُرَى عَلَيْهِ أَثَرُ السَّفَرِ، وَلَا يَعْرِفُهُ مِنَّا أَحَدٌ، حَتَّى جَلَسَ إِلَى النَّبِيِّ صلى الله عليه وسلم، فَأَسْنَدَ رُكْبَتَيْهِ إِلَى رُكْبَتَيْهِ، وَوَضَعَ كَفَّيْهِ عَلَى فَخِذَيْهِ، وَقَالَ: يَا مُحَمَّدُ أَخْبِرْنِي عَنْ الْإِسْلَامِ. فَقَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: الْإِسْلَامُ أَنْ تَشْهَدَ أَنْ لَا إلَهَ إلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَتُقِيمَ الصَّلَاةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ الْبَيْتَ إنْ اسْتَطَعْت إلَيْهِ سَبِيلًا. قَالَ: صَدَقْت. فَعَجِبْنَا لَهُ يَسْأَلُهُ وَيُصَدِّقُهُ! قَالَ: فَأَخْبِرْنِي عَنْ الْإِيمَانِ. قَالَ: أَنْ تُؤْمِنَ بِاَللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ وَالْيَوْمِ الْآخِرِ، وَتُؤْمِنَ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ. قَالَ: صَدَقْت. قَالَ: فَأَخْبِرْنِي عَنْ الْإِحْسَانِ. قَالَ: أَنْ تَعْبُدَ اللَّهَ كَأَنَّك تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاك",
    translation:
      "One day while we were sitting with the Messenger of Allah, a man appeared with extremely white clothing and extremely black hair. No signs of travel were visible on him, and none of us knew him. He sat down before the Prophet, rested his knees against his knees, and placed his palms on his thighs. He said: 'O Muhammad, tell me about Islam.' The Messenger of Allah said: 'Islam is to testify that there is no god but Allah and that Muhammad is the Messenger of Allah, to establish prayer, to give zakah, to fast Ramadan, and to make pilgrimage to the House if you are able.' He said: 'You have spoken truthfully.' We were amazed that he would ask him and then confirm his answer. He said: 'Tell me about Iman (faith).' He said: 'It is to believe in Allah, His angels, His books, His messengers, the Last Day, and to believe in divine decree, both the good and the evil thereof.' He said: 'You have spoken truthfully.' He said: 'Tell me about Ihsan (excellence).' He said: 'It is to worship Allah as if you see Him, and if you do not see Him, then indeed He sees You.'",
  },
  {
    id: "h3",
    number: 3,
    arabic:
      "بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إلَهَ إلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ الْبَيْتِ، وَصَوْمِ رَمَضَانَ",
    translation:
      "Islam is built upon five pillars: testifying that there is no god but Allah and that Muhammad is the Messenger of Allah, establishing prayer, giving zakah, making pilgrimage to the House, and fasting the month of Ramadan.",
  },
  {
    id: "h4",
    number: 4,
    arabic:
      "إِنَّ أَحَدَكُمْ يُجْمَعُ خَلْقُهُ فِي بَطْنِ أُمِّهِ أَرْبَعِينَ يَوْمًا نُطْفَةً، ثُمَّ يَكُونُ عَلَقَةً مِثْلَ ذَلِكَ، ثُمَّ يَكُونُ مُضْغَةً مِثْلَ ذَلِكَ، ثُمَّ يُرْسَلُ إلَيْهِ الْمَلَكُ فَيَنْفُخُ فِيهِ الرُّوحَ، وَيُؤْمَرُ بِأَرْبَعِ كَلِمَاتٍ: بِكَتْبِ رِزْقِهِ، وَأَجَلِهِ، وَعَمَلِهِ، وَشَقِيٍّ أَمْ سَعِيدٍ",
    translation:
      "The creation of each one of you is brought together in his mother's womb for forty days as a nutfah (drop), then he becomes an 'alaqah (clot) for a similar period, then a mudghah (lump of flesh) for a similar period. Then the angel is sent to him and he breathes the soul into him, and he is commanded with four matters: to write down his provision, his lifespan, his deeds, and whether he will be wretched or happy.",
  },
  {
    id: "h5",
    number: 5,
    arabic: "مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ",
    translation:
      "Whoever introduces into this matter of ours (Islam) something that does not belong to it, it will be rejected.",
  },
  {
    id: "h6",
    number: 6,
    arabic:
      "إِنَّ الْحَلَالَ بَيِّنٌ، وَإِنَّ الْحَرَامَ بَيِّنٌ، وَبَيْنَهُمَا أُمُورٌ مُشْتَبِهَاتٌ لَا يَعْلَمُهُنَّ كَثِيرٌ مِنْ النَّاسِ، فَمَنْ اتَّقَى الشُّبُهَاتِ فَقْد اسْتَبْرَأَ لِدِينِهِ وَعِرْضِهِ، وَمَنْ وَقَعَ فِي الشُّبُهَاتِ وَقَعَ فِي الْحَرَامِ، كَالرَّاعِي يَرْعَى حَوْلَ الْحِمَى يُوشِكُ أَنْ يَرْتَعَ فِيهِ، أَلَا وَإِنَّ لِكُلِّ مَلِكٍ حِمَى، أَلَا وَإِنَّ حِمَى اللَّهِ مَحَارِمُهُ",
    translation:
      "That which is lawful is clear and that which is unlawful is clear, and between them are doubtful matters about which many people do not know. Thus, he who avoids doubtful matters clears himself in regard to his religion and his honor. But he who falls into doubtful matters falls into that which is unlawful, like a shepherd who pastures around a sanctuary, all but grazing therein. Indeed, every king has a sanctuary, and indeed, Allah's sanctuary is His prohibitions.",
  },
  {
    id: "h7",
    number: 7,
    arabic: "الدِّينُ النَّصِيحَةُ. قُلْنَا: لِمَنْ؟ قَالَ: لِلَّهِ، وَلِكِتَابِهِ، وَلِرَسُولِهِ، وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ",
    translation:
      "Religion is sincerity. We said: 'To whom?' He said: 'To Allah, His Book, His Messenger, and to the leaders of the Muslims and their common folk.'",
  },
  {
    id: "h8",
    number: 8,
    arabic:
      "أُمِرْتُ أَنْ أُقَاتِلَ النَّاسَ حَتَّى يَشْهَدُوا أَنْ لَا إلَهَ إلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَيُقِيمُوا الصَّلَاةَ، وَيُؤْتُوا الزَّكَاةَ، فَإِذَا فَعَلُوا ذَلِكَ عَصَمُوا مِنِّي دِمَاءَهُمْ وَأَمْوَالَهُمْ إلَّا بِحَقِّ الْإِسْلَامِ، وَحِسَابُهُمْ عَلَى اللَّهِ تَعَالَى",
    translation:
      "I have been commanded to fight against people until they testify that there is no god but Allah and that Muhammad is the Messenger of Allah, and establish prayer and give zakah. If they do that, their blood and wealth are protected from me except by the right of Islam, and their reckoning is with Allah the Exalted.",
  },
  {
    id: "h9",
    number: 9,
    arabic:
      "مَنْ نَهَيْتُكُمْ عَنْهُ فَاجْتَنِبُوهُ، وَمَا أَمَرْتُكُمْ بِهِ فَأْتُوا مِنْهُ مَا اسْتَطَعْتُمْ، فَإِنَّمَا أَهْلَكَ الَّذِينَ مِنْ قَبْلِكُمْ كَثْرَةُ مَسَائِلِهِمْ وَاخْتِلَافُهُمْ عَلَى أَنْبِيَائِهِمْ",
    translation:
      "What I have forbidden you, avoid. What I have commanded you, do as much of it as you can. For verily, it was only the excessive questioning and their disagreeing with their Prophets that destroyed those who were before you.",
  },
  {
    id: "h10",
    number: 10,
    arabic: "إنَّ اللَّهَ طَيِّبٌ لَا يَقْبَلُ إلَّا طَيِّبًا، وَإِنَّ اللَّهَ أَمَرَ الْمُؤْمِنِينَ بِمَا أَمَرَ بِهِ الْمُرْسَلِينَ",
    translation:
      "Indeed Allah is Pure and accepts only that which is pure. And indeed Allah has commanded the believers with what He commanded the Messengers.",
  },
  {
    id: "h11",
    number: 11,
    arabic: "دَعْ مَا يَرِيبُكَ إلَى مَا لَا يَرِيبُكَ",
    translation: "Leave that which makes you doubt for that which does not make you doubt.",
  },
  {
    id: "h12",
    number: 12,
    arabic: "مِنْ حُسْنِ إسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ",
    translation: "Part of the perfection of one's Islam is his leaving that which does not concern him.",
  },
  {
    id: "h13",
    number: 13,
    arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    translation: "None of you truly believes until he loves for his brother what he loves for himself.",
  },
  {
    id: "h14",
    number: 14,
    arabic: "لَا يَحِلُّ دَمُ امْرِئٍ مُسْلِمٍ إلَّا بِإِحْدَى ثَلَاثٍ: الثَّيِّبُ الزَّانِي، وَالنَّفْسُ بِالنَّفْسِ، وَالتَّارِكُ لِدِينِهِ الْمُفَارِقُ لِلْجَمَاعَةِ",
    translation:
      "The blood of a Muslim may not be legally spilt other than in one of three instances: the married person who commits adultery, a life for a life, and one who forsakes his religion and separates from the community.",
  },
  {
    id: "h15",
    number: 15,
    arabic:
      "مَنْ كَانَ يُؤْمِنُ بِاَللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاَللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاَللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ ضَيْفَهُ",
    translation:
      "Whoever believes in Allah and the Last Day, let him speak good or remain silent. Whoever believes in Allah and the Last Day, let him honor his neighbor. Whoever believes in Allah and the Last Day, let him honor his guest.",
  },
  {
    id: "h16",
    number: 16,
    arabic: "لَا تَغْضَبْ",
    translation: "Do not get angry.",
  },
  {
    id: "h17",
    number: 17,
    arabic:
      "إنَّ اللَّهَ كَتَبَ الْإِحْسَانَ عَلَى كُلِّ شَيْءٍ، فَإِذَا قَتَلْتُمْ فَأَحْسِنُوا الْقِتْلَةَ، وَإِذَا ذَبَحْتُمْ فَأَحْسِنُوا الذِّبْحَةَ، وَلْيُحِدَّ أَحَدُكُمْ شَفْرَتَهُ، وَلْيُرِحْ ذَبِيحَتَهُ",
    translation:
      "Indeed Allah has prescribed excellence in all things. So when you kill, kill well, and when you slaughter, slaughter well. Let one of you sharpen his blade and spare suffering to the animal he slaughters.",
  },
  {
    id: "h18",
    number: 18,
    arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْت، وَأَتْبِعْ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ",
    translation:
      "Have taqwa (fear) of Allah wherever you are, and follow up a bad deed with a good deed which will wipe it out, and behave well towards people.",
  },
  {
    id: "h19",
    number: 19,
    arabic:
      "احْفَظْ اللَّهَ يَحْفَظْك، احْفَظْ اللَّهَ تَجِدْهُ تُجَاهَك، إذَا سَأَلْت فَاسْأَلْ اللَّهَ، وَإِذَا اسْتَعَنْت فَاسْتَعِنْ بِاَللَّهِ، وَاعْلَمْ أَنَّ الْأُمَّةَ لَوْ اجْتَمَعَتْ عَلَى أَنْ يَنْفَعُوك بِشَيْءٍ لَمْ يَنْفَعُوك إلَّا بِشَيْءٍ قَدْ كَتَبَهُ اللَّهُ لَك، وَإِنْ اجْتَمَعُوا عَلَى أَنْ يَضُرُّوك بِشَيْءٍ لَمْ يَضُرُّوك إلَّا بِشَيْءٍ قَدْ كَتَبَهُ اللَّهُ عَلَيْك، رُفِعَتْ الْأَقْلَامُ وَجَفَّتْ الصُّحُفُ",
    translation:
      "Be mindful of Allah and He will protect you. Be mindful of Allah and you will find Him before you. When you ask, ask Allah. When you seek help, seek help from Allah. Know that if the entire nation were to gather together to benefit you, they would not benefit you except with what Allah has decreed for you. And if they were to gather together to harm you, they would not harm you except with what Allah has decreed against you. The pens have been lifted and the pages have dried.",
  },
  {
    id: "h20",
    number: 20,
    arabic: "إنْ لَمْ تَسْتَحِ فَاصْنَعْ مَا شِئْت",
    translation: "If you have no shame, then do as you wish.",
  },
  {
    id: "h21",
    number: 21,
    arabic: "قُلْ: آمَنْت بِاَللَّهِ، ثُمَّ اسْتَقِمْ",
    translation: "Say: 'I believe in Allah,' and then be steadfast.",
  },
  {
    id: "h22",
    number: 22,
    arabic:
      "الطُّهُورُ شَطْرُ الْإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلَأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلَآنِ - أَوْ تَمْلَأُ - مَا بَيْنَ السَّمَاءِ وَالْأَرْضِ، وَالصَّلَاةُ نُورٌ، وَالصَّدَقَةُ بُرْهَانٌ، وَالصَّبْرُ ضِيَاءٌ، وَالْقُرْآنُ حُجَّةٌ لَك أَوْ عَلَيْك، كُلُّ النَّاسِ يَغْدُو، فَبَائِعٌ نَفْسَهُ فَمُعْتِقُهَا أَوْ مُوبِقُهَا",
    translation:
      "Purity is half of faith. 'Alhamdulillah' (praise be to Allah) fills the scales, and 'Subhan Allah' (glory be to Allah) and 'Alhamdulillah' fill what is between the heavens and the earth. Prayer is light, charity is proof, patience is illumination, and the Quran is a proof for or against you. All people go out in the morning and sell themselves, either freeing themselves or destroying themselves.",
  },
  {
    id: "h23",
    number: 23,
    arabic: "الطَّهُورُ شَطْرُ الْإِيمَانِ",
    translation: "Purity is half of faith.",
  },
  {
    id: "h24",
    number: 24,
    arabic: "يَا عِبَادِي، إنِّي حَرَّمْت الظُّلْمَ عَلَى نَفْسِي وَجَعَلْتُهُ بَيْنَكُمْ مُحَرَّمًا فَلَا تَظَالَمُوا",
    translation:
      "O My servants, I have forbidden oppression for Myself and have made it forbidden amongst you, so do not oppress one another.",
  },
  {
    id: "h25",
    number: 25,
    arabic:
      "كُلُّ سُلَامَى مِنْ النَّاسِ عَلَيْهِ صَدَقَةٌ، كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ تَعْدِلُ بَيْنَ اثْنَيْنِ صَدَقَةٌ، وَتُعِينُ الرَّجُلَ فِي دَابَّتِهِ فَتَحْمِلُهُ عَلَيْهَا أَوْ تَرْفَعُ لَهُ عَلَيْهَا مَتَاعَهُ صَدَقَةٌ، وَالْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ، وَبِكُلِّ خُطْوَةٍ تَمْشِيهَا إلَى الصَّلَاةِ صَدَقَةٌ، وَتُمِيطُ الْأَذَى عَنْ الطَّرِيقِ صَدَقَةٌ",
    translation:
      "Every joint of a person must perform a charity each day that the sun rises: to judge justly between two people is a charity. To help a man with his mount, lifting him onto it or hoisting up his belongings onto it, is a charity. A good word is a charity. Every step you take towards the prayer is a charity, and removing a harmful object from the road is a charity.",
  },
  {
    id: "h26",
    number: 26,
    arabic: "كُلُّ مَعْرُوفٍ صَدَقَةٌ",
    translation: "Every act of kindness is charity.",
  },
  {
    id: "h27",
    number: 27,
    arabic: "الْبِرُّ حُسْنُ الْخُلُقِ، وَالْإِثْمُ مَا حَاكَ فِي نَفْسِك وَكَرِهْت أَنْ يَطَّلِعَ عَلَيْهِ النَّاسُ",
    translation:
      "Righteousness is good character, and sin is what wavers in your heart and you would hate for people to find out about it.",
  },
  {
    id: "h28",
    number: 28,
    arabic:
      "أَوْصِيكَ بِتَقْوَى اللَّهِ، وَالسَّمْعِ وَالطَّاعَةِ وَإِنْ عَبْدًا حَبَشِيًّا، فَإِنَّهُ مَنْ يَعِشْ مِنْكُمْ بَعْدِي فَسَيَرَى اخْتِلَافًا كَثِيرًا، فَعَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الْخُلَفَاءِ الرَّاشِدِينَ الْمَهْدِيِّينَ، عَضُّوا عَلَيْهَا بِالنَّوَاجِذِ، وَإِيَّاكُمْ وَمُحْدَثَاتِ الْأُمُورِ، فَإِنَّ كُلَّ بِدْعَةٍ ضَلَالَةٌ",
    translation:
      "I advise you to have taqwa (fear) of Allah, and to listen and obey even if an Abyssinian slave is appointed over you. For whoever among you lives after me will see much disagreement. So hold fast to my Sunnah and the Sunnah of the Rightly-Guided Caliphs after me. Cling to it firmly with your molar teeth. Beware of newly-invented matters, for every innovation is misguidance.",
  },
  {
    id: "h29",
    number: 29,
    arabic: "مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِلِسَانِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِقَلْبِهِ، وَذَلِكَ أَضْعَفُ الْإِيمَانِ",
    translation:
      "Whoever among you sees an evil, let him change it with his hand. If he is unable to do so, then with his tongue. If he is unable to do so, then with his heart, and that is the weakest of faith.",
  },
  {
    id: "h30",
    number: 30,
    arabic:
      "إنَّ اللَّهَ تَعَالَى فَرَضَ فَرَائِضَ فَلَا تُضَيِّعُوهَا، وَحَدَّ حُدُودًا فَلَا تَعْتَدُوهَا، وَحَرَّمَ أَشْيَاءَ فَلَا تَنْتَهِكُوهَا، وَسَكَتَ عَنْ أَشْيَاءَ رَحْمَةً لَكُمْ غَيْرَ نِسْيَانٍ فَلَا تَبْحَثُوا عَنْهَا",
    translation:
      "Indeed Allah the Exalted has prescribed obligations, so do not neglect them. He has set limits, so do not transgress them. He has forbidden things, so do not violate them. He has remained silent about things out of mercy for you, not forgetfulness, so do not seek after them.",
  },
  {
    id: "h31",
    number: 31,
    arabic: "ازْهَدْ فِي الدُّنْيَا يُحِبُّك اللَّهُ، وَازْهَدْ فِيمَا عِنْدَ النَّاسِ يُحِبُّك النَّاسُ",
    translation:
      "Be detached from the world and Allah will love you. Be detached from what people possess and people will love you.",
  },
  {
    id: "h32",
    number: 32,
    arabic: "لَا ضَرَرَ وَلَا ضِرَارَ",
    translation: "There should be neither harming nor reciprocating harm.",
  },
  {
    id: "h33",
    number: 33,
    arabic: "الْبَيِّنَةُ عَلَى الْمُدَّعِي، وَالْيَمِينُ عَلَى مَنْ أَنْكَرَ",
    translation: "The burden of proof is upon the claimant, and the oath is upon the one who denies.",
  },
  {
    id: "h34",
    number: 34,
    arabic:
      "مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِلِسَانِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِقَلْبِهِ، وَذَلِكَ أَضْعَفُ الْإِيمَانِ",
    translation:
      "Whoever among you sees an evil, let him change it with his hand. If he is unable to do so, then with his tongue. If he is unable to do so, then with his heart, and that is the weakest of faith.",
  },
  {
    id: "h35",
    number: 35,
    arabic:
      "لَا تَحَاسَدُوا، وَلَا تَنَاجَشُوا، وَلَا تَبَاغَضُوا، وَلَا تَدَابَرُوا، وَلَا يَبِعْ بَعْضُكُمْ عَلَى بَيْعِ بَعْضٍ، وَكُونُوا عِبَادَ اللَّهِ إخْوَانًا، الْمُسْلِمُ أَخُو الْمُسْلِمِ لَا يَظْلِمُهُ وَلَا يَخْذُلُهُ وَلَا يَحْقِرُهُ، التَّقْوَى هَاهُنَا - وَيُشِيرُ إلَى صَدْرِهِ ثَلَاثَ مَرَّاتٍ - بِحَسْبِ امْرِئٍ مِنْ الشَّرِّ أَنْ يَحْقِرَ أَخَاهُ الْمُسْلِمَ، كُلُّ الْمُسْلِمِ عَلَى الْمُسْلِمِ حَرَامٌ دَمُهُ وَمَالُهُ وَعِرْضُهُ",
    translation:
      "Do not envy one another, do not artificially inflate prices, do not hate one another, do not turn away from one another, and do not undercut one another in trade. Be servants of Allah as brothers. A Muslim is the brother of a Muslim. He does not wrong him, nor does he forsake him, nor does he lie to him, nor does he hold him in contempt. Taqwa (piety) is here - and he pointed to his chest three times. It is evil enough for a man to hold his brother Muslim in contempt. All of a Muslim is inviolable to another Muslim: his blood, his property, and his honor.",
  },
  {
    id: "h36",
    number: 36,
    arabic:
      "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ، وَمَنْ يَسَّرَ عَلَى مُعْسِرٍ يَسَّرَ اللَّهُ عَلَيْهِ فِي الدُّنْيَا وَالْآخِرَةِ، وَمَنْ سَتَرَ مُسْلِمًا سَتَرَهُ اللَّهُ فِي الدُّنْيَا وَالْآخِرَةِ، وَاَللَّهُ فِي عَوْنِ الْعَبْدِ مَا كَانَ الْعَبْدُ فِي عَوْنِ أَخِيهِ",
    translation:
      "Whoever relieves a believer of distress in this world, Allah will relieve him of distress on the Day of Resurrection. Whoever makes things easy for one who is in difficulty, Allah will make things easy for him in this world and the Hereafter. Whoever conceals the faults of a Muslim, Allah will conceal his faults in this world and the Hereafter. Allah helps the servant as long as the servant helps his brother.",
  },
  {
    id: "h37",
    number: 37,
    arabic:
      "إنَّ اللَّهَ تَعَالَى كَتَبَ الْحَسَنَاتِ وَالسَّيِّئَاتِ، ثُمَّ بَيَّنَ ذَلِكَ، فَمَنْ هَمَّ بِحَسَنَةٍ فَلَمْ يَعْمَلْهَا كَتَبَهَا اللَّهُ عِنْدَهُ حَسَنَةً كَامِلَةً، وَإِنْ هَمَّ بِهَا فَعَمِلَهَا كَتَبَهَا اللَّهُ عِنْدَهُ عَشْرَ حَسَنَاتٍ إلَى سَبْعِمِائَةِ ضِعْفٍ إلَى أَضْعَافٍ كَثِيرَةٍ، وَإِنْ هَمَّ بِسَيِّئَةٍ فَلَمْ يَعْمَلْهَا كَتَبَهَا اللَّهُ عِنْدَهُ حَسَنَةً كَامِلَةً، وَإِنْ هَمَّ بِهَا فَعَمِلَهَا كَتَبَهَا اللَّهُ سَيِّئَةً وَاحِدَةً",
    translation:
      "Indeed Allah the Exalted has recorded the good deeds and the bad deeds, and then explained that. Whoever intends to do a good deed but does not do it, Allah records it with Himself as a complete good deed. If he intends it and does it, Allah records it with Himself as ten good deeds, up to seven hundred times, or many more times. If he intends to do a bad deed and does not do it, Allah records it with Himself as a complete good deed. If he intends it and does it, Allah records it as one bad deed.",
  },
  {
    id: "h38",
    number: 38,
    arabic:
      "مَنْ عَادَى لِي وَلِيًّا فَقَدْ آذَنْتُهُ بِالْحَرْبِ، وَمَا تَقَرَّبَ إلَيَّ عَبْدِي بِشَيْءٍ أَحَبَّ إلَيَّ مِمَّا افْتَرَضْتُهُ عَلَيْهِ، وَلَا يَزَالُ عَبْدِي يَتَقَرَّبُ إلَيَّ بِالنَّوَافِلِ حَتَّى أُحِبَّهُ، فَإِذَا أَحَبْتُهُ كُنْت سَمْعَهُ الَّذِي يَسْمَعُ بِهِ، وَبَصَرَهُ الَّذِي يُبْصِرُ بِهِ، وَيَدَهُ الَّتِي يَبْطِشُ بِهَا، وَرِجْلَهُ الَّتِي يَمْشِي بِهَا، وَلَئِنْ سَأَلَنِي لَأُعْطِيَنَّهُ، وَلَئِنْ اسْتَعَاذَنِي لَأُعِيذَنَّهُ",
    translation:
      "Whoever shows enmity to a friend of Mine, I have declared war against him. My servant does not draw near to Me with anything more beloved to Me than the religious duties I have imposed upon him. My servant continues to draw near to Me with voluntary acts of worship until I love him. When I love him, I am his hearing with which he hears, his sight with which he sees, his hand with which he strikes, and his foot with which he walks. Were he to ask of Me, I would surely give to him. Were he to seek refuge in Me, I would surely grant him refuge.",
  },
  {
    id: "h39",
    number: 39,
    arabic: "إنَّ اللَّهَ تَجَاوَزَ لِي عَنْ أُمَّتِي الْخَطَأَ وَالنِّسْيَانَ وَمَا اُسْتُكْرِهُوا عَلَيْهِ",
    translation:
      "Indeed Allah has pardoned for my nation their mistakes, their forgetfulness, and what they are forced to do.",
  },
  {
    id: "h40",
    number: 40,
    arabic: "كُنْ فِي الدُّنْيَا كَأَنَّك غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ",
    translation: "Be in this world as if you were a stranger or a traveler passing through.",
  },
]
