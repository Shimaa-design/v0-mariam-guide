"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Moon, Sun, BookOpen, Heart, Clock, Home, Utensils, CloudRain, Car, Frown, Smile, BookMarked, DoorOpen, AlertCircle, List, Loader2, Volume2, Pause, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react'

interface QuranVerse {
  number: number
  arabic: string
  english: string
  isSpecial?: boolean
  specialName?: string
}

interface QuranSurah {
  number: number
  name: string
  englishName?: string
  verses: QuranVerse[]
  hasSpecialReminder?: boolean
}

interface PrayerTimes {
  Fajr: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
  Jumuah: string
}

interface LocationData {
  city: string
  country: string
  latitude: number
  longitude: number
}

export default function AzkarApp() {
  const [mainTab, setMainTab] = useState("duaa")
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
  const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null)
  const [quranData, setQuranData] = useState<QuranSurah[]>([])
  const [isLoadingQuran, setIsLoadingQuran] = useState(false)
  const [quranError, setQuranError] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const dhikrRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const ayahRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const dayButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  // Prayer times state
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null)
  const prayerTimesCache = useRef<Record<string, PrayerTimes>>({})
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isLoadingPrayer, setIsLoadingPrayer] = useState(false)
  const [prayerError, setPrayerError] = useState<string | null>(null)
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null)
  const [countdown, setCountdown] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Adhan audio state
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false)
  const adhanAudioRef = useRef<HTMLAudioElement | null>(null)

  const [playingDuaaId, setPlayingDuaaId] = useState<string | null>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [arabicVoiceAvailable, setArabicVoiceAvailable] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const categoryNavRef = useRef<HTMLDivElement>(null)
  const swipeStartTime = useRef<number>(0)

  const minSwipeDistance = 50
  const minSwipeVelocity = 0.3 // pixels per millisecond

  // Define fetchQuranData function at component level so it can be accessed by multiple useEffects
  const fetchQuranData = useCallback(async () => {
    setIsLoadingQuran(true)
    setQuranError(null)
    setLoadingProgress(0)

    try {
      console.log("[v0] Starting to fetch Quran data...")

      const surahListResponse = await fetch("https://api.alquran.cloud/v1/surah")
      if (!surahListResponse.ok) {
        throw new Error(`Failed to fetch surah list: ${surahListResponse.status}`)
      }
      const surahListData = await surahListResponse.json()
      console.log("[v0] Fetched surah list successfully")

      const allSurahs: QuranSurah[] = []
      // Optimized for mobile: increased batch size, reduced delay for faster loading
      const BATCH_SIZE = 10
      const BATCH_DELAY = 500
      const totalSurahs = surahListData.data.length

      const fetchWithRetry = async (url: string, retries = 3, delay = 1000): Promise<Response> => {
        for (let i = 0; i < retries; i++) {
          try {
            const response = await fetch(url)
            if (response.ok) return response

            if (response.status === 429 || response.status >= 500) {
              console.log(`[v0] Retry ${i + 1}/${retries} for ${url} (status: ${response.status})`)
              await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
              continue
            }

            throw new Error(`HTTP ${response.status}`)
          } catch (error) {
            if (i === retries - 1) throw error
            console.log(`[v0] Retry ${i + 1}/${retries} after error:`, error)
            await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
          }
        }
        throw new Error("Max retries reached")
      }

      for (let i = 0; i < totalSurahs; i += BATCH_SIZE) {
        const batch = surahListData.data.slice(i, Math.min(i + BATCH_SIZE, totalSurahs))

        console.log(
          `[v0] Fetching batch ${Math.floor(i / BATCH_SIZE) + 1} (surahs ${i + 1}-${Math.min(i + BATCH_SIZE, totalSurahs)})`,
        )

        const batchPromises = batch.map(async (surahInfo: any) => {
          const surahNumber = surahInfo.number

          try {
            const arabicResponse = await fetchWithRetry(
              `https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`,
            )
            const arabicData = await arabicResponse.json()

            await new Promise((resolve) => setTimeout(resolve, 300))

            const englishResponse = await fetchWithRetry(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`)
            const englishData = await englishResponse.json()

            const verses: QuranVerse[] = arabicData.data.ayahs.map((ayah: any, index: number) => {
              const verse: QuranVerse = {
                number: ayah.numberInSurah,
                arabic: ayah.text,
                english: englishData.data.ayahs[index].text,
              }

              if (surahNumber === 2 && ayah.numberInSurah === 255) {
                verse.isSpecial = true
                verse.specialName = "آية الكرسي"
              }

              return verse
            })

            const surah: QuranSurah = {
              number: surahNumber,
              name: surahInfo.name,
              englishName: surahInfo.englishName,
              verses,
              hasSpecialReminder: surahNumber === 18,
            }

            console.log(`[v0] Successfully fetched surah ${surahNumber}`)
            return surah
          } catch (error) {
            console.error(`[v0] Error fetching surah ${surahNumber}:`, error)
            throw new Error(
              `Failed to fetch surah ${surahNumber}: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
          }
        })

        const batchResults = await Promise.all(batchPromises)
        allSurahs.push(...batchResults)

        const progress = Math.round((allSurahs.length / totalSurahs) * 100)
        setLoadingProgress(progress)
        console.log(`[v0] Progress: ${progress}% (${allSurahs.length}/${totalSurahs} surahs)`)

        if (i + BATCH_SIZE < totalSurahs) {
          console.log(`[v0] Waiting ${BATCH_DELAY}ms before next batch...`)
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY))
        }
      }

      console.log("[v0] Successfully fetched all surahs")
      setQuranData(allSurahs)

      // Cache the Quran data
      try {
        const CACHE_VERSION = "v1"
        localStorage.setItem("mariam-guide-quran-data", JSON.stringify(allSurahs))
        localStorage.setItem("mariam-guide-quran-cache-version", CACHE_VERSION)
        console.log("[v0] Quran data cached successfully")
      } catch (error) {
        console.error("[v0] Failed to cache Quran data:", error)
        // Continue even if caching fails
      }

      setIsLoadingQuran(false)
    } catch (error) {
      console.error("[v0] Error fetching Quran data:", error)
      setQuranError(error instanceof Error ? error.message : "Failed to load Quran data")
      setIsLoadingQuran(false)
    }
  }, [])

  // Generate a week of dates starting from today
  const getWeekDates = () => {
    const dates = []
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  useEffect(() => {
    const savedCounts = localStorage.getItem("mariam-guide-duaa-counts")
    if (savedCounts) {
      try {
        setCounts(JSON.parse(savedCounts))
      } catch (error) {
        console.error("Failed to load duaa counts:", error)
      }
    }

    const savedReadHadith = localStorage.getItem("mariam-guide-read-hadith")
    if (savedReadHadith) {
      try {
        setReadHadith(new Set(JSON.parse(savedReadHadith)))
      } catch (error) {
        console.error("Failed to load read hadith:", error)
      }
    }

    const savedBookmark = localStorage.getItem("mariam-guide-quran-bookmark")
    if (savedBookmark) {
      try {
        setQuranBookmark(JSON.parse(savedBookmark))
      } catch (error) {
        console.error("Failed to load quran bookmark:", error)
      }
    }

    // Load cached Quran data and eagerly fetch if not cached
    const cachedQuranData = localStorage.getItem("mariam-guide-quran-data")
    const cachedVersion = localStorage.getItem("mariam-guide-quran-cache-version")
    const CACHE_VERSION = "v1"

    let hasValidCache = false

    if (cachedQuranData && cachedVersion === CACHE_VERSION) {
      try {
        const parsedData = JSON.parse(cachedQuranData)
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          console.log("[v0] Loading Quran data from cache...")
          setQuranData(parsedData)
          console.log(`[v0] Successfully loaded ${parsedData.length} surahs from cache`)
          hasValidCache = true
        }
      } catch (error) {
        console.error("Failed to load cached Quran data:", error)
        // Clear invalid cache
        localStorage.removeItem("mariam-guide-quran-data")
        localStorage.removeItem("mariam-guide-quran-cache-version")
      }
    }

    // Eagerly fetch Quran data if not already cached
    if (!hasValidCache) {
      console.log("[v0] No valid cache found, starting eager fetch of Quran data...")
      fetchQuranData()
    }
  }, [fetchQuranData]) // Dependency on fetchQuranData (wrapped in useCallback)

  // Fallback: Fetch Quran data if user navigates to tab before eager loading completes
  useEffect(() => {
    if (mainTab === "quran" && quranData.length === 0 && !isLoadingQuran) {
      console.log("[v0] User switched to Quran tab, fetching data...")
      fetchQuranData()
    }
  }, [mainTab, quranData.length, isLoadingQuran, fetchQuranData])

  useEffect(() => {
    localStorage.setItem("mariam-guide-duaa-counts", JSON.stringify(counts))
  }, [counts])

  useEffect(() => {
    localStorage.setItem("mariam-guide-read-hadith", JSON.stringify(Array.from(readHadith)))
  }, [readHadith])

  useEffect(() => {
    localStorage.setItem("mariam-guide-quran-bookmark", JSON.stringify(quranBookmark))
  }, [quranBookmark])

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

  useEffect(() => {
    dhikrRefs.current = {}
  }, [selectedCategory])

  useEffect(() => {
    if (mainTab !== "quran") {
      setQuranView("list")
    }
  }, [mainTab])

  // Fetch location and prayer times for all week days
  useEffect(() => {
    const fetchLocationAndPrayer = async () => {
      if (mainTab !== "pray") return

      // Check if we already have all week data cached
      const weekDates = getWeekDates()
      const allCached = weekDates.every(date => prayerTimesCache.current[date.toDateString()])

      if (allCached) {
        // Set prayer times for currently selected date from cache
        const dateKey = selectedDate.toDateString()
        setPrayerTimes(prayerTimesCache.current[dateKey])
        return
      }

      setIsLoadingPrayer(true)
      setPrayerError(null)

      try {
        let locationInfo: LocationData | null = null

        // Check localStorage for saved location
        const savedLocation = localStorage.getItem("mariam-guide-location")
        const savedDate = localStorage.getItem("mariam-guide-location-date")
        const today = new Date().toDateString()

        if (savedLocation && savedDate === today) {
          // Use saved location if it's from today
          locationInfo = JSON.parse(savedLocation)
          setLocation(locationInfo)
        } else {
          // Get location from browser geolocation API
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000, // 10 second timeout
              enableHighAccuracy: false, // Faster, less battery
              maximumAge: 300000 // Accept cached position up to 5 minutes old
            })
          })

          const { latitude, longitude } = position.coords

          // Fetch location name from reverse geocoding API
          const locationResponse = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          )
          const locationData = await locationResponse.json()

          locationInfo = {
            city: locationData.city || locationData.locality || "Unknown",
            country: locationData.countryName || "Unknown",
            latitude,
            longitude,
          }
          setLocation(locationInfo)

          // Save location to localStorage
          localStorage.setItem("mariam-guide-location", JSON.stringify(locationInfo))
          localStorage.setItem("mariam-guide-location-date", today)
        }

        // Fetch prayer times from Aladhan API
        if (!locationInfo) {
          throw new Error("Failed to get location")
        }

        // Fetch prayer times for all days in the week
        const results = await Promise.allSettled(weekDates.map(async (date) => {
          const dateKey = date.toDateString()

          // Skip if already cached
          if (prayerTimesCache.current[dateKey]) {
            return { success: true, dateKey }
          }

          try {
            const prayerResponse = await fetch(
              `https://api.aladhan.com/v1/timings/${Math.floor(date.getTime() / 1000)}?latitude=${locationInfo.latitude}&longitude=${locationInfo.longitude}&method=2`,
            )
            const prayerData = await prayerResponse.json()

            if (prayerData.code === 200) {
              const timings = prayerData.data.timings
              const newPrayerTimes = {
                Fajr: timings.Fajr,
                Dhuhr: timings.Dhuhr,
                Asr: timings.Asr,
                Maghrib: timings.Maghrib,
                Isha: timings.Isha,
                Jumuah: timings.Dhuhr, // Jumuah (Friday prayer) is at Dhuhr time
              }

              // Cache the prayer times for this date
              prayerTimesCache.current[dateKey] = newPrayerTimes
              return { success: true, dateKey }
            } else {
              console.warn(`Failed to fetch prayer times for ${dateKey}:`, prayerData)
              return { success: false, dateKey }
            }
          } catch (err) {
            console.warn(`Error fetching prayer times for ${dateKey}:`, err)
            return { success: false, dateKey }
          }
        }))

        // Set prayer times for currently selected date
        const dateKey = selectedDate.toDateString()
        const selectedDatePrayer = prayerTimesCache.current[dateKey]

        if (!selectedDatePrayer) {
          throw new Error("Failed to fetch prayer times for the selected date. Please try again.")
        }

        setPrayerTimes(selectedDatePrayer)

        setIsLoadingPrayer(false)
      } catch (error) {
        console.error("Error fetching prayer times:", error)

        // Provide more specific error messages
        let errorMessage = "Failed to fetch prayer times. Please try again."

        if (error instanceof GeolocationPositionError) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location access in your browser settings."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location unavailable. Please check your device's location services."
              break
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again."
              break
          }
        } else if (error instanceof Error) {
          errorMessage = error.message
        }

        setPrayerError(errorMessage)
        setIsLoadingPrayer(false)
      }
    }

    fetchLocationAndPrayer()
  }, [mainTab])

  // Update displayed prayer times when selected date changes
  useEffect(() => {
    if (mainTab !== "pray") return

    const dateKey = selectedDate.toDateString()
    if (prayerTimesCache.current[dateKey]) {
      setPrayerTimes(prayerTimesCache.current[dateKey])
    }
  }, [selectedDate, mainTab])

  // Calculate next prayer and countdown
  useEffect(() => {
    if (!prayerTimes || mainTab !== "pray") return

    // Only calculate countdown if selected date is today
    const isSelectedToday = isSameDay(selectedDate, new Date())

    if (!isSelectedToday) {
      setNextPrayer(null)
      setCountdown("")
      return
    }

    const updateCountdown = () => {
      const now = new Date()
      const currentTimeInSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
      const isFriday = now.getDay() === 5 // 5 = Friday

      const prayers = [
        { name: "Fajr", time: prayerTimes.Fajr },
        { name: isFriday ? "Jumuah" : "Dhuhr", time: isFriday ? prayerTimes.Jumuah : prayerTimes.Dhuhr },
        { name: "Asr", time: prayerTimes.Asr },
        { name: "Maghrib", time: prayerTimes.Maghrib },
        { name: "Isha", time: prayerTimes.Isha },
      ]

      // Convert prayer times to seconds
      const prayerSeconds = prayers.map((p) => {
        const [hours, minutes] = p.time.split(":").map(Number)
        return { ...p, seconds: hours * 3600 + minutes * 60 }
      })

      // Find next prayer
      let next = prayerSeconds.find((p) => p.seconds > currentTimeInSeconds)

      if (!next) {
        // Next prayer is Fajr tomorrow
        next = { ...prayerSeconds[0], seconds: prayerSeconds[0].seconds + 24 * 3600 }
      }

      setNextPrayer({ name: next.name, time: next.time })

      // Calculate countdown
      let diffInSeconds = next.seconds - currentTimeInSeconds
      if (diffInSeconds < 0) diffInSeconds += 24 * 3600

      const hours = Math.floor(diffInSeconds / 3600)
      const minutes = Math.floor((diffInSeconds % 3600) / 60)
      const seconds = diffInSeconds % 60
      setCountdown(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000) // Update every second

    return () => clearInterval(interval)
  }, [prayerTimes, mainTab, selectedDate])

  // Scroll selected day into view in week navigation
  useEffect(() => {
    if (mainTab !== "pray") return

    const dateKey = selectedDate.toDateString()
    const selectedButton = dayButtonRefs.current[dateKey]

    if (selectedButton) {
      selectedButton.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      })
    }
  }, [selectedDate, mainTab])

  useEffect(() => {
    const checkVoices = () => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        setArabicVoiceAvailable(false)
        return
      }
      const voices = window.speechSynthesis.getVoices()
      const hasArabic = voices.some((voice) => voice.lang.startsWith("ar"))
      setArabicVoiceAvailable(hasArabic)
    }

    // Check immediately
    checkVoices()

    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = checkVoices
    } else {
      // Fallback for browsers that don't support onvoiceschanged
      const intervalId = setInterval(checkVoices, 500)
      return () => clearInterval(intervalId)
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  const navigateCategory = (direction: 'next' | 'prev') => {
    const categories = Object.keys(azkarData)
    const currentIndex = categories.indexOf(selectedCategory)
    
    if (direction === 'next' && currentIndex < categories.length - 1) {
      setSelectedCategory(categories[currentIndex + 1])
      scrollCategoryIntoView(categories[currentIndex + 1])
    } else if (direction === 'prev' && currentIndex > 0) {
      setSelectedCategory(categories[currentIndex - 1])
      scrollCategoryIntoView(categories[currentIndex - 1])
    }
  }

  const scrollCategoryIntoView = (category: string) => {
    setTimeout(() => {
      const categoryButton = document.querySelector(`[data-category="${category}"]`)
      if (categoryButton) {
        categoryButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }, 100)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (mainTab !== 'duaa') return
    e.preventDefault() // Prevent default touch behavior to stop background scrolling
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setSwipeOffset(0)
    setIsTransitioning(false)
    swipeStartTime.current = Date.now()
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (mainTab !== 'duaa' || isTransitioning) return
    e.preventDefault() // Prevent default touch behavior to stop background scrolling
    const currentTouch = e.targetTouches[0].clientX
    setTouchEnd(currentTouch)
    if (touchStart) {
      // Full 1:1 movement for more responsive feel
      setSwipeOffset(currentTouch - touchStart)
    }
  }

  const onTouchEnd = () => {
    if (mainTab !== 'duaa' || !touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const swipeTime = Date.now() - swipeStartTime.current
    const velocity = Math.abs(distance) / swipeTime
    
    const isLeftSwipe = distance > minSwipeDistance || (distance > 20 && velocity > minSwipeVelocity)
    const isRightSwipe = distance < -minSwipeDistance || (distance < -20 && velocity > minSwipeVelocity)

    setIsTransitioning(true)
    
    if (isLeftSwipe) {
      navigateCategory('next')
    } else if (isRightSwipe) {
      navigateCategory('prev')
    }
    
    // Spring back animation
    setTimeout(() => {
      setSwipeOffset(0)
      setTimeout(() => setIsTransitioning(false), 400)
    }, 50)
  }

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

  const hadithData = [
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
        "مَا نَهَيْتُكُمْ عَنْهُ فَاجْتَنِبُوهُ، وَمَا أَمَرْتُكُمْ بِهِ فَأْتُوا مِنْهُ مَا اسْتَطَعْتُمْ، فَإِنَّمَا أَهْلَكَ الَّذِينَ مِنْ قَبْلِكُمْ كَثْرَةُ مَسَائِلِهِمْ وَاخْتِلَافُهُمْ عَلَى أَنْبِيَائِهِمْ",
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

  // Memoize current category to avoid recalculation on every render (mobile performance)
  const currentCategory = useMemo(() =>
    azkarData[selectedCategory as keyof typeof azkarData],
    [selectedCategory]
  )

  const CategoryIcon = mainTab === "duaa" ? currentCategory.icon : mainTab === "hadith" ? BookOpen : BookMarked

  const handleIncrement = (dhikrId: string, maxCount: number, currentIndex: number) => {
    setCounts((prev) => {
      const currentCount = prev[dhikrId] || 0
      const newCount = currentCount + 1

      if (newCount >= maxCount) {
        setCompletedAzkar((prev) => new Set([...prev, dhikrId]))

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

  const playDuaaAudio = (duaaId: string, arabicText: string) => {
    if (!arabicVoiceAvailable) {
      console.error("Arabic voice not available")
      return
    }

    if (playingDuaaId === duaaId) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      speechSynthesisRef.current = null
      setPlayingDuaaId(null)
      return
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    speechSynthesisRef.current = null

    setPlayingDuaaId(duaaId)

    // Start playing new duaa
    const utterance = new SpeechSynthesisUtterance(arabicText)

    let arabicVoice = null
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices()
      // Try to find a female Arabic voice first
      arabicVoice = voices.find((voice) => voice.lang.startsWith("ar") && voice.name.toLowerCase().includes("female"))
      // Fallback to any Arabic voice if no female voice found
      if (!arabicVoice) {
        arabicVoice = voices.find((voice) => voice.lang.startsWith("ar"))
      }
      if (arabicVoice) {
        utterance.voice = arabicVoice
      }
    }

    utterance.lang = "ar-SA"
    utterance.rate = 0.8
    utterance.pitch = 1

    utterance.onend = () => {
      if (speechSynthesisRef.current === utterance) {
        setPlayingDuaaId(null)
        speechSynthesisRef.current = null
      }
    }

    utterance.onerror = (event) => {
      if (speechSynthesisRef.current === utterance && event.error !== "interrupted") {
        setPlayingDuaaId(null)
        speechSynthesisRef.current = null
        console.error("[v0] Error playing Duaa audio:", event.error)
      }
    }

    speechSynthesisRef.current = utterance
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.speak(utterance)
    }
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
    if (quranBookmark.surahNumber === surahNumber && quranBookmark.ayahNumber === ayahNumber) {
      // Remove bookmark if clicking the same ayah
      setQuranBookmark({ surahNumber: null, ayahNumber: null })
    } else {
      // Set new bookmark
      setQuranBookmark({ surahNumber, ayahNumber })
    }
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

  const openSurah = (surah: QuranSurah) => {
    ayahRefs.current = {}
    setSelectedSurah(surah)
    setQuranView("reading")
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
    return today.getDay() === 5 // Friday
  }

  const convertTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const hours12 = hours % 12 || 12
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  const formatDayName = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[date.getDay()]
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + 1)
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const toggleAdhan = () => {
    if (!adhanAudioRef.current) {
      // Create audio element if it doesn't exist
      adhanAudioRef.current = new Audio("https://www.islamcan.com/audio/adhan/azan2.mp3")

      // Add event listeners
      adhanAudioRef.current.addEventListener("ended", () => {
        // Only stop if not looping (this shouldn't trigger when loop is enabled)
        if (!adhanAudioRef.current?.loop) {
          setIsPlayingAdhan(false)
        }
      })

      adhanAudioRef.current.addEventListener("error", (e) => {
        console.error("Failed to load Adhan audio:", e)
        setIsPlayingAdhan(false)
        alert("Failed to load Adhan audio. Please check your internet connection and try again.")
      })
    }

    if (isPlayingAdhan) {
      // Pause and disable looping
      adhanAudioRef.current.pause()
      adhanAudioRef.current.loop = false
      setIsPlayingAdhan(false)
    } else {
      // Enable looping and play
      adhanAudioRef.current.loop = true
      adhanAudioRef.current
        .play()
        .then(() => {
          setIsPlayingAdhan(true)
        })
        .catch((error) => {
          console.error("Error playing Adhan:", error)
          setIsPlayingAdhan(false)
          alert("Failed to play Adhan audio. Please try again.")
        })
    }
  }

  // Added formatTime function to handle prayer times, useful for countdown display if needed
  const formatTime = (time: string) => {
    if (!time) return ""

    const [hours, minutes] = time.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const hours12 = hours % 12 || 12
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24">
      <div
        className={`bg-gradient-to-r py-4 ${mainTab === "duaa" ? currentCategory.color : mainTab === "hadith" ? "from-teal-500 to-emerald-600" : mainTab === "pray" ? "from-blue-500 to-indigo-600" : "from-purple-500 to-indigo-600"} text-white p-6 shadow-lg`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-0">
            {mainTab === "duaa" && <currentCategory.icon className="w-7 h-7" />}
            {mainTab === "hadith" && <BookOpen className="w-7 h-7" />}
            {mainTab === "quran" && <BookMarked className="w-7 h-7" />}
            {mainTab === "pray" && <Clock className="w-7 h-7" />}
            <h1 className="font-bold text-2xl">Mariam Guide</h1>
          </div>
          <p className="text-white/90 pl-10">
            {mainTab === "duaa" && currentCategory.title}
            {mainTab === "hadith" && "الأربعون النووية"}
            {mainTab === "quran" && "Quran"}
            {mainTab === "pray" && `Prayer Times for ${new Date().toLocaleDateString('en-US', { month: 'long' })}`}
          </p>
        </div>
      </div>

      {mainTab === "duaa" && (
        <div className="bg-white shadow-md sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4">
            <div ref={categoryNavRef} className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
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
                    data-category={key}
                    onClick={() => {
                      setSelectedCategory(key)
                      scrollCategoryIntoView(key)
                    }}
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

          <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              transform: `translateX(${swipeOffset}px)`,
              transition: swipeOffset === 0 
                ? 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                : 'none',
              willChange: 'transform',
              touchAction: 'pan-y' // Allow vertical scrolling but intercept horizontal
            }}
          >
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
                      isCompleted ? "ring-2 ring-green-500" : ""
                    }`}
                  >
                    <div className="p-5 py-4 px-4">
                      <div className="flex justify-between mb-4 items-center">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold px-3 py-1 rounded-full ${
                              isCompleted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            #{index + 1}
                          </span>
                          {isCompleted && <span className="text-green-500 text-sm font-semibold">✓ Completed</span>}
                        </div>
                        <button
                          onClick={() => playDuaaAudio(dhikr.id, dhikr.arabic)}
                          className={`p-2 rounded-lg transition-colors ${
                            playingDuaaId === dhikr.id
                              ? "bg-gradient-to-r " + currentCategory.color + " text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                          }`}
                          title={playingDuaaId === dhikr.id ? "Stop audio" : "Play audio"}
                        >
                          {playingDuaaId === dhikr.id ? (
                            <VolumeX className="w-5 h-5" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      <div className="text-right mb-4">
                        <p className="text-xl leading-loose text-gray-800">{dhikr.arabic}</p>
                      </div>

                      <div className="pt-4 border-t border-gray-200 mb-4">
                        <p className="text-sm text-gray-700 leading-relaxed">{dhikr.translation}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${currentCategory.color} transition-all duration-300`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold text-lg text-gray-800">{currentCount}</span>
                            <span> / {dhikr.count}</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => resetCounter(dhikr.id)}
                              className="px-3 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors py-2"
                            >
                              Reset
                            </button>
                            {!isCompleted && (
                              <button
                                onClick={() => handleIncrement(dhikr.id, dhikr.count, index)}
                                className={`px-6 py-2 rounded-lg font-medium transition-all bg-gradient-to-r ${currentCategory.color} text-white hover:shadow-lg active:scale-95`}
                              >
                                Count
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              May Allah accept your dhikr and grant you His blessings 🤲
            </p>
          </div>
        </div>
      )}

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
                    isRead ? "ring-2 ring-emerald-500" : ""
                  }`}
                >
                  <div className="p-5 py-4 px-4">
                    <div className="flex justify-between mb-4 items-center">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold px-3 py-1 rounded-full ${
                            isRead ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          الحديث #{hadith.number}
                        </span>
                        {isRead && <span className="text-emerald-500 text-sm font-semibold">✓ Read</span>}
                      </div>
                    </div>

                    <div className="text-right mb-4">
                      <p className="text-xl leading-loose text-gray-800">{hadith.arabic}</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200 mb-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{hadith.translation}</p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => markHadithAsRead(hadith.id)}
                        className={`py-2 font-medium transition-all rounded-full px-5 text-sm ${
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

          <div className="mt-8 p-4 bg-emerald-50 rounded-lg border-solid border border-green-300">
            <p className="text-sm text-emerald-800 text-center">
              الأربعون النووية - Imam An-Nawawi&apos;s 40 Hadith Collection 📚
            </p>
          </div>
        </div>
      )}

      {mainTab === "quran" && (
        <div className="max-w-4xl mx-auto p-4 pb-8 pt-4">
          {isLoadingQuran && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading Quran data...</p>
              <p className="text-sm text-gray-500 mt-2">Fetching all 114 surahs with translations</p>

              <div className="w-64 mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">{loadingProgress}%</p>
              </div>
            </div>
          )}

          {quranError && (
            <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 mb-1">Failed to load Quran data</p>
                  <p className="text-sm text-red-700">{quranError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isLoadingQuran && !quranError && quranData.length > 0 && (
            <>
              {quranView === "list" && (
                <>
                  {isFriday() && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-500 rounded-lg border-r border-b border-t border-l">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🕌</span>
                          <div>
                            <p className="font-semibold text-amber-900">It&apos;s Friday!</p>
                            <p className="text-sm text-amber-800">It's recommended to recite Surah Al-Kahf today</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const kahfSurah = quranData.find(s => s.number === 18)
                            if (kahfSurah) openSurah(kahfSurah)
                          }}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap"
                        >
                          Start Reading
                        </button>
                      </div>
                    </div>
                  )}

                  {quranBookmark.surahNumber && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-violet-400">
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

                  <div className="space-y-3">
                    {quranData.map((surah) => {
                      const isKahf = surah.number === 18
                      const hasBookmark = quranBookmark.surahNumber === surah.number

                      return (
                        <button
                          key={surah.number}
                          onClick={() => openSurah(surah)}
                          className={`w-full bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all text-left py-4 px-4 ${
                            isKahf && isFriday() ? "ring-2 ring-amber-400" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-lg flex items-center justify-center font-bold text-lg w-11 h-11">
                                {surah.number}
                              </div>
                              <div className="text-right">
                                <h3 className="text-xl font-bold text-gray-800">{surah.name}</h3>
                                <p className="text-sm text-gray-500 text-left leading-3 py-0 pt-2">
                                  {surah.verses.length} verses
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {hasBookmark && <span className="text-purple-500 font-semibold text-3xl">🔖</span>}
                              {isKahf && isFriday() && <span className="text-amber-500 text-sm">🕌</span>}
                              <span className="text-gray-400 text-xl">→</span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-300">
                    <p className="text-sm text-purple-800 text-center">
                      📖 Complete Quran with all 114 surahs and English translations
                    </p>
                  </div>
                </>
              )}

              {quranView === "reading" && selectedSurah && (
                <>
                  <div className="sticky top-0  z-10 pb-4 pt-4 mt-0 mb-2">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-5 rounded-xl shadow-lg py-2 px-2 pr-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={backToSurahList}
                          className="bg-white/20 backdrop-blur rounded-lg flex items-center justify-center size-12 hover:bg-white/30 transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div className="text-right flex-1">
                          <h2 className="font-bold text-base">{selectedSurah.name}</h2>
                          <p className="text-white/90 text-xs">{selectedSurah.verses.length} verses</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedSurah.verses.map((verse: QuranVerse, index: number) => {
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
                          className={`p-5 rounded-xl transition-all cursor-pointer py-4 px-4 ${
                            isAyatAlKursi
                              ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 hover:border-amber-400"
                              : isBookmarked
                                ? "bg-purple-50 border-2 border-purple-300 hover:border-purple-400"
                                : "bg-white shadow-md hover:shadow-lg hover:scale-[1.01]"
                          }`}
                        >
                          {isAyatAlKursi && (
                            <div className="mb-3 flex items-center gap-2">
                              <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                                ⭐ {verse.specialName}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full border-none border-0">
                              Ayah {verse.number}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setBookmark(selectedSurah.number, verse.number)
                              }}
                              className={`text-sm px-3 py-1 rounded-full transition-all ${
                                isBookmarked
                                  ? "bg-purple-500 text-white"
                                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                              }`}
                            >
                              {isBookmarked ? "🔖 Bookmarked" : "Bookmark"}
                            </button>
                          </div>

                          <div className="text-right mb-4">
                            <p className={`leading-loose text-gray-800 ${isAyatAlKursi ? "text-2xl" : "text-xl"}`}>
                              {verse.arabic}
                            </p>
                          </div>

                          <div className="border-t border-gray-200 pt-3">
                            <p className="text-sm text-gray-700 leading-relaxed">{verse.english}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {selectedSurah.number === 18 && isFriday() && (
                    <div className="mt-6 p-4 bg-amber-100 rounded-lg">
                      <p className="text-sm text-amber-900 text-center">
                        ✨ Reciting Surah Al-Kahf on Friday brings light between the two Fridays
                      </p>
                    </div>
                  )}

                  <div className="mt-8">
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
                        disabled={
                          quranData.findIndex((s) => s.number === selectedSurah.number) === quranData.length - 1
                        }
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
            </>
          )}
        </div>
      )}

      {mainTab === "pray" && (
        <div className="px-4 max-w-md mx-auto pb-32">
          {isLoadingPrayer ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading prayer times...</p>
            </div>
          ) : prayerError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-2">Error Loading Prayer Times</h3>
                  <p className="text-sm text-red-700">{prayerError}</p>
                  <button
                    onClick={() => {
                      setPrayerTimes(null)
                      setPrayerError(null)
                    }}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          ) : prayerTimes && location ? (
            <>
              {/* Week Navigation Bar */}
              <div className="mb-6 mt-6">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pl-0.5 pr-0.5 pt-0.5 pb-0.5">
                  {getWeekDates().map((date, index) => {
                    const isSelected = isSameDay(date, selectedDate)
                    const isToday = isSameDay(date, new Date())
                    const dateKey = date.toDateString()
                    return (
                      <button
                        key={index}
                        ref={(el) => { dayButtonRefs.current[dateKey] = el }}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center justify-center min-w-[60px] py-3 px-2 rounded-xl transition-all shadow-none ${
                          isSelected
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-105"
                            : isToday
                            ? "bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 border-2 border-blue-300"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        <span className={`text-xs font-medium mb-1 ${isSelected ? "text-blue-100" : isToday ? "text-blue-600" : "text-gray-500"}`}>
                          {formatDayName(date)}
                        </span>
                        <span className={`text-lg font-bold ${isSelected ? "text-white" : isToday ? "text-blue-700" : "text-gray-800"}`}>
                          {date.getDate()}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Prayer Times List */}
              <div className="space-y-3">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {isSameDay(selectedDate, new Date()) ? "Today's" : formatDayName(selectedDate) + "'s"} Prayer Times
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {location.city}, {location.country}
                      </p>
                    </div>
                    {/* Adhan Button */}
                    <button
                      onClick={toggleAdhan}
                      className={`px-4 py-2 rounded-lg font-medium text-white shadow-md transition-all hover:shadow-lg active:scale-95 ${
                        isPlayingAdhan
                          ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                          : "bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isPlayingAdhan ? (
                          <>
                            <Pause className="w-5 h-5" />
                            <span className="text-sm">Pause</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-5 h-5" />
                            <span className="text-sm">Adhan</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
                {(() => {
                  const isFriday = selectedDate.getDay() === 5 // 5 = Friday

                  return [
                    { name: "Fajr", time: prayerTimes.Fajr, icon: "🌅" },
                    isFriday
                      ? { name: "Jumuah", time: prayerTimes.Jumuah, icon: "🕌" }
                      : { name: "Dhuhr", time: prayerTimes.Dhuhr, icon: "☀️" },
                    { name: "Asr", time: prayerTimes.Asr, icon: "🌤️" },
                    { name: "Maghrib", time: prayerTimes.Maghrib, icon: "🌆" },
                    { name: "Isha", time: prayerTimes.Isha, icon: "🌙" },
                  ]
                })().map((prayer) => {
                  const isNext = nextPrayer?.name === prayer.name
                  return (
                    <div
                      key={prayer.name}
                      className={`p-4 transition-all py-3 rounded-lg shadow ${
                        isNext
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-1 border-blue-300 shadow-md"
                          : "bg-white shadow-md hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{prayer.icon}</span>
                          <div>
                            <h4 className={`font-semibold ${isNext ? "text-blue-800" : "text-gray-800"}`}>
                              {prayer.name}
                            </h4>
                            {isNext && <p className="text-xs text-blue-600 font-medium">Next Prayer - {countdown}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${isNext ? "text-blue-700" : "text-gray-700"}`}>
                            {convertTo12Hour(prayer.time)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bottom Date Navigation */}
              <div className="mt-6 mb-4">
                <div className="flex items-center justify-between">
                  {/* Previous Day Button - hide if at first day (today) */}
                  <div className="flex justify-start">
                    {(() => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const isAtStart = isSameDay(selectedDate, today)

                      if (isAtStart) {
                        return <div className="w-12 h-12" /> // Invisible spacer
                      }

                      return (
                        <button
                          onClick={goToPreviousDay}
                          className="flex items-center justify-center w-12 h-12 bg-white border-2 border-blue-300 text-blue-600 rounded-full shadow-md hover:bg-blue-50 hover:shadow-lg transition-all active:scale-95 border-none"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                      )
                    })()}
                  </div>

                  {/* Today Button (only show when not on today) */}
                  <div className="flex justify-center">
                    {!isSameDay(selectedDate, new Date()) && (
                      <button
                        onClick={goToToday}
                        className="py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
                      >
                        Today
                      </button>
                    )}
                  </div>

                  {/* Next Day Button - hide if at last day (6 days from today) */}
                  <div className="flex justify-end border-none">
                    {(() => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const lastDay = new Date(today)
                      lastDay.setDate(today.getDate() + 6)
                      const isAtEnd = isSameDay(selectedDate, lastDay)

                      if (isAtEnd) {
                        return <div className="w-12 h-12" /> // Invisible spacer
                      }

                      return (
                        <button
                          onClick={goToNextDay}
                          className="flex items-center justify-center w-12 h-12 bg-white border-2 border-blue-300 text-blue-600 rounded-full shadow-md hover:bg-blue-50 hover:shadow-lg transition-all active:scale-95 border-none"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4">
        <div className="max-w-md  mx-auto bg-white rounded-2xl shadow-2xl  ring-1 ring-gray-100">
          <div className="flex items-center justify-around px-2 py-2 ">
            <button
              onClick={() => setMainTab("duaa")}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-xl transition-all ${
                mainTab === "duaa" ? "bg-gradient-to-br from-teal-50 to-emerald-50" : "hover:bg-gray-50"
              }`}
            >
              <Heart className={`mb-1 h-4 w-4 ${mainTab === "duaa" ? "text-teal-600" : "text-gray-400"}`} />
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
              <BookOpen className={`mb-1 w-4 h-4 ${mainTab === "hadith" ? "text-teal-600" : "text-gray-400"}`} />
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
              <BookMarked className={`mb-1 h-4 w-4 ${mainTab === "quran" ? "text-purple-600" : "text-gray-400"}`} />
              <span className={`text-xs font-semibold ${mainTab === "quran" ? "text-purple-600" : "text-gray-500"}`}>
                Quran
              </span>
            </button>

            <button
              onClick={() => setMainTab("pray")}
              className={`flex flex-col items-center justify-center flex-1 px-3 rounded-xl transition-all py-2 ${
                mainTab === "pray" ? "bg-gradient-to-br from-blue-50 to-indigo-50" : "hover:bg-gray-50"
              }`}
            >
              <Clock className={`mb-1 w-4 h-4 ${mainTab === "pray" ? "text-blue-600" : "text-gray-400"}`} />
              <span className={`text-xs font-semibold ${mainTab === "pray" ? "text-blue-600" : "text-gray-500"}`}>
                Pray
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
