"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { toast } from "sonner"

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

const RECITERS = [
  { id: "ar.alafasy", name: "Mishary Rashid Alafasy", arabicName: "مشاري راشد العفاسي" },
  { id: "ar.abdulbasitmurattal", name: "Abdul Basit (Murattal)", arabicName: "عبد الباسط عبد الصمد" },
  { id: "ar.minshawi", name: "Mohamed Siddiq Minshawi", arabicName: "محمد صديق المنشاوي" },
  { id: "ar.hussary", name: "Mahmoud Khalil Al-Hussary", arabicName: "محمود خليل الحصري" },
  { id: "ar.shaatri", name: "Abu Bakr Al-Shatri", arabicName: "أبو بكر الشاطري" },
]

export function useQuranData(mainTab: string) {
  // State
  const [quranData, setQuranData] = useState<QuranSurah[]>([])
  const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null)
  const [expandedSurah, setExpandedSurah] = useState<number | null>(null)
  const [quranBookmark, setQuranBookmark] = useState<{ surahNumber: number | null; ayahNumber: number | null }>({
    surahNumber: null,
    ayahNumber: null,
  })
  const [quranView, setQuranView] = useState<"list" | "reading">("list")
  const [isLoadingQuran, setIsLoadingQuran] = useState(false)
  const [quranError, setQuranError] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Audio state
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0].id)
  const [playingAudioType, setPlayingAudioType] = useState<"surah" | "ayah" | null>(null)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null)
  const [showReciterDropdown, setShowReciterDropdown] = useState(false)

  // Refs
  const ayahRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const quranAudioRef = useRef<HTMLAudioElement | null>(null)

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
      // Reduced batch size and increased delay to prevent API rate limiting
      const BATCH_SIZE = 3
      const BATCH_DELAY = 2000
      const totalSurahs = surahListData.data.length

      const fetchWithRetry = async (url: string, retries = 5, delay = 2000): Promise<Response> => {
        for (let i = 0; i < retries; i++) {
          try {
            const response = await fetch(url)
            if (response.ok) return response

            if (response.status === 429 || response.status >= 500) {
              const backoffDelay = delay * Math.pow(2, i)
              console.log(
                `[v0] Retry ${i + 1}/${retries} for ${url} (status: ${response.status}) - waiting ${backoffDelay}ms`,
              )
              await new Promise((resolve) => setTimeout(resolve, backoffDelay))
              continue
            }

            throw new Error(`HTTP ${response.status}`)
          } catch (error) {
            if (i === retries - 1) throw error
            const backoffDelay = delay * Math.pow(2, i)
            console.log(`[v0] Retry ${i + 1}/${retries} after error - waiting ${backoffDelay}ms:`, error)
            await new Promise((resolve) => setTimeout(resolve, backoffDelay))
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
            const arabicResponse = await fetchWithRetry(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`)
            const arabicData = await arabicResponse.json()

            // Increased delay between Arabic and English requests to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 1000))

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
      const errorMessage = error instanceof Error ? error.message : "Failed to load Quran data"
      setQuranError(errorMessage)
      setIsLoadingQuran(false)

      // Show user-friendly error notification
      if (errorMessage.includes("429") || errorMessage.includes("Too Many Requests")) {
        toast.error("Loading Quran data... Please wait, the server is busy.", {
          duration: 5000,
        })
      } else {
        toast.error("Failed to load Quran data. Please check your internet connection.", {
          duration: 5000,
        })
      }
    }
  }, [])

  // Load cached Quran data and eagerly fetch if not cached
  useEffect(() => {
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
  }, [fetchQuranData])

  // Fallback: Fetch Quran data if user navigates to tab before eager loading completes
  useEffect(() => {
    if (mainTab === "quran" && quranData.length === 0 && !isLoadingQuran) {
      console.log("[v0] User switched to Quran tab, fetching data...")
      fetchQuranData()
    }
  }, [mainTab, quranData.length, isLoadingQuran, fetchQuranData])

  // Save bookmark to localStorage
  useEffect(() => {
    localStorage.setItem("mariam-guide-quran-bookmark", JSON.stringify(quranBookmark))
  }, [quranBookmark])

  // Reset quranView when leaving tab
  useEffect(() => {
    if (mainTab !== "quran") {
      setQuranView("list")
    }
  }, [mainTab])

  // Helper function to calculate global ayah number for audio API
  const getGlobalAyahNumber = (surahNumber: number, ayahNumber: number): number => {
    let globalNumber = 0

    for (let i = 0; i < surahNumber - 1; i++) {
      const surah = quranData[i]
      if (surah) {
        globalNumber += surah.verses.length
      }
    }

    return globalNumber + ayahNumber
  }

  const setBookmark = (surahNumber: number, ayahNumber: number | null) => {
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

  const playQuranAudio = (type: "surah" | "ayah", surahNumber: number, ayahNumber?: number) => {
    // Stop if clicking the same audio
    const audioId = type === "surah" ? `surah-${surahNumber}` : `ayah-${surahNumber}-${ayahNumber}`

    if (playingAudioType === type && playingAudioId === audioId) {
      stopQuranAudio()
      return
    }

    // Stop any currently playing audio
    stopQuranAudio()

    // Build audio URL based on type
    let audioUrl: string
    if (type === "surah") {
      // For surah, we need to get the first ayah number of that surah
      const surah = quranData.find((s) => s.number === surahNumber)
      if (!surah || surah.verses.length === 0) return

      audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${selectedReciter}/${surahNumber}.mp3`
    } else {
      // For individual ayah
      const globalAyahNumber = getGlobalAyahNumber(surahNumber, ayahNumber!)
      audioUrl = `https://cdn.islamic.network/quran/audio/128/${selectedReciter}/${globalAyahNumber}.mp3`
    }

    console.log("[v0] Playing Quran audio:", audioUrl)

    // Set loading state immediately
    setLoadingAudioId(audioId)

    const audio = new Audio(audioUrl)
    quranAudioRef.current = audio

    // Handle when audio can start playing
    audio.oncanplaythrough = () => {
      console.log("[v0] Audio ready to play")
      setLoadingAudioId(null)
      setPlayingAudioType(type)
      setPlayingAudioId(audioId)
    }

    audio.onended = () => {
      if (type === "ayah" && selectedSurah) {
        const currentAyahIndex = selectedSurah.verses.findIndex((v) => v.number === ayahNumber)
        const nextAyahIndex = currentAyahIndex + 1

        if (nextAyahIndex < selectedSurah.verses.length) {
          const nextAyah = selectedSurah.verses[nextAyahIndex]

          // Auto-scroll to next ayah
          setTimeout(() => {
            const nextAyahElement = document.getElementById(`ayah-${nextAyah.number}`)
            if (nextAyahElement) {
              nextAyahElement.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          }, 100)

          // Auto-play next ayah
          setTimeout(() => {
            playQuranAudio("ayah", selectedSurah.number, nextAyah.number)
          }, 300)
        } else {
          // End of surah - clear playing state
          setPlayingAudioType(null)
          setPlayingAudioId(null)
        }
      } else {
        setPlayingAudioType(null)
        setPlayingAudioId(null)
      }
    }

    audio.onerror = (e) => {
      console.error("[v0] Error playing Quran audio from URL:", audioUrl)
      console.error("[v0] Error details:", e)

      // Show user-friendly error message
      const reciterName = RECITERS.find((r) => r.id === selectedReciter)?.name || "this reciter"
      toast.error(`Unable to play audio for ${reciterName}. The audio file may not be available.`, {
        duration: 4000,
      })

      setLoadingAudioId(null)
      setPlayingAudioType(null)
      setPlayingAudioId(null)
    }

    audio.play().catch((error) => {
      console.error("[v0] Failed to play Quran audio from URL:", audioUrl)
      console.error("[v0] Play error:", error)

      // Show user-friendly error message
      const reciterName = RECITERS.find((r) => r.id === selectedReciter)?.name || "this reciter"
      toast.error(`Failed to play audio for ${reciterName}. Please try another reciter.`, {
        duration: 4000,
      })

      setLoadingAudioId(null)
      setPlayingAudioType(null)
      setPlayingAudioId(null)
    })
  }

  const stopQuranAudio = () => {
    if (quranAudioRef.current) {
      quranAudioRef.current.pause()
      quranAudioRef.current = null
    }
    setLoadingAudioId(null)
    setPlayingAudioType(null)
    setPlayingAudioId(null)
  }

  const handleAyahClick = (index: number) => {
    if (!selectedSurah) return

    const nextAyahIndex = index + 1
    if (nextAyahIndex < selectedSurah.verses.length) {
      const nextAyahKey = `${selectedSurah.number}-${nextAyahIndex}`
      const nextElement = ayahRefs.current[nextAyahKey]

      if (nextElement) {
        setTimeout(() => {
          nextElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }, 300)
      }
    }
  }

  return {
    // State
    quranData,
    selectedSurah,
    expandedSurah,
    quranBookmark,
    quranView,
    isLoadingQuran,
    quranError,
    loadingProgress,

    // Audio state
    selectedReciter,
    playingAudioType,
    playingAudioId,
    loadingAudioId,
    showReciterDropdown,

    // Refs
    ayahRefs,

    // Functions
    setBookmark,
    continueReading,
    openSurah,
    backToSurahList,
    goToPreviousSurah,
    goToNextSurah,
    playQuranAudio,
    stopQuranAudio,
    getGlobalAyahNumber,
    handleAyahClick,
    setSelectedReciter,
    setShowReciterDropdown,

    // Constants
    RECITERS,
  }
}
