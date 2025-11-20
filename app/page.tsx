"use client"

// React
import { useState, useEffect } from "react"

// External libraries
import {
  List,
  Loader2,
  Volume2,
  Pause,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Play,
  BookOpen,
  BookMarked,
  Heart,
  Clock,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react"
import { Toaster } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle"

// Data
import { azkarData } from "./data/azkar-data"
import { hadithData } from "./data/hadith-data"

// Utils
import { isFriday } from "./utils/helpers"

// Hooks
import { useQuranData } from "./hooks/useQuranData"
import { usePrayerTimes } from "./hooks/usePrayerTimes"
import { useHadithState } from "./hooks/useHadithState"
import { useAzkarState } from "./hooks/useAzkarState"
import { useAdhanAudio } from "./hooks/useAdhanAudio"
import { useDuaaAudio } from "./hooks/useDuaaAudio"

// Types
import type { QuranVerse } from "./types"

export default function AzkarApp() {
  const [mainTab, setMainTab] = useState("duaa")
  const [rippleState, setRippleState] = useState<{ id: string; key: number } | null>(null)

  // Azkar state hook
  const {
    selectedCategory,
    setSelectedCategory,
    counts,
    completedAzkar,
    scrollPositions,
    setScrollPositions,
    touchStart,
    touchEnd,
    swipeOffset,
    isTransitioning,
    dhikrRefs,
    categoryNavRef,
    currentCategory,
    handleIncrement,
    resetCounter,
    resetCategory,
    navigateCategory,
    scrollCategoryIntoView,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  } = useAzkarState({ mainTab })

  // Prayer times hook
  const {
    prayerTimes,
    setPrayerTimes,
    location,
    isLoadingPrayer,
    prayerError,
    setPrayerError,
    nextPrayer,
    countdown,
    selectedDate,
    setSelectedDate,
    dayButtonRefs,
    getWeekDates,
    formatDayName,
    isSameDay,
    convertTo12Hour,
    formatTime,
    goToPreviousDay,
    goToNextDay,
    goToToday,
  } = usePrayerTimes(mainTab)

  // Hadith state hook
  const { readHadith, markHadithAsRead } = useHadithState()

  // Audio hooks
  const { isPlayingAdhan, adhanAudioRef, toggleAdhan } = useAdhanAudio()
  const { playingDuaaId, speechSynthesisRef, arabicVoiceAvailable, playDuaaAudio } = useDuaaAudio()

  const playClickSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return

      const audioCtx = new AudioContext()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      // Create a "pop" sound
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15)

      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1)

      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 0.15)
    } catch (e) {
      console.error("Audio play failed", e)
    }
  }

  // Use Quran custom hook
  const {
    quranData,
    selectedSurah,
    expandedSurah,
    quranBookmark,
    quranView,
    isLoadingQuran,
    quranError,
    loadingProgress,
    selectedReciter,
    playingAudioType,
    playingAudioId,
    loadingAudioId,
    showReciterDropdown,
    ayahRefs,
    sortOption,
    setSortOption,
    showSortDropdown,
    setShowSortDropdown,
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
    RECITERS,
  } = useQuranData(mainTab)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 pb-24">
      <div
        className={`bg-gradient-to-r py-4 ${mainTab === "duaa" ? currentCategory.color : mainTab === "hadith" ? "from-teal-500 to-emerald-600" : mainTab === "pray" ? "from-blue-500 to-indigo-600" : "from-purple-500 to-indigo-600"} text-white p-6 shadow-lg`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-0 justify-between">
            <div className="flex items-center gap-3">
              {mainTab === "duaa" && <currentCategory.icon className="size-6" />}
              {mainTab === "hadith" && <BookOpen className="size-6" />}
              {mainTab === "quran" && <BookMarked className="size-auto" />}
              {mainTab === "pray" && <Clock className="size-auto" />}
              <h1 className="font-bold text-2xl">Mariam Guide</h1>
            </div>
            <ThemeToggle />
          </div>
          <p className="text-white/90 pl-10">
            {mainTab === "duaa" && currentCategory.title}
            {mainTab === "hadith" && "الأربعون النووية"}
            {mainTab === "quran" && "Quran"}
            {mainTab === "pray" && `Prayer Times for ${new Date().toLocaleDateString("en-US", { month: "long" })}`}
          </p>
        </div>
      </div>

      {mainTab === "duaa" && (
        <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 py-2">
          <div className="max-w-4xl mx-auto px-4">
            <div ref={categoryNavRef} className="flex gap-2 overflow-x-auto scrollbar-hide">
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
                  death: "Death"
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
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
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
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
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
              transition: swipeOffset === 0 ? "transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)" : "none",
              willChange: "transform",
              touchAction: "pan-y", // Allow vertical scrolling but intercept horizontal
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
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all scroll-mt-24 ${
                      isCompleted ? "ring-2 ring-green-500" : ""
                    }`}
                  >
                    <div className="p-5 py-4 px-4">
                      <div className="flex justify-between mb-4 items-center">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold px-3 py-1 rounded-full ${
                              isCompleted
                                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            #{index + 1}
                          </span>
                          {isCompleted && (
                            <span className="text-green-500 dark:text-green-400 text-sm font-semibold">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => playDuaaAudio(dhikr.id, dhikr.arabic)}
                          className={`p-2 rounded-lg transition-colors ${
                            playingDuaaId === dhikr.id
                              ? "bg-gradient-to-r " + currentCategory.color + " text-white"
                              : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
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
                        <p className="text-xl leading-loose text-gray-800 dark:text-gray-100">{dhikr.arabic}</p>
                      </div>

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mb-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{dhikr.translation}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${currentCategory.color} transition-all duration-300`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                              {currentCount}
                            </span>
                            <span> / {dhikr.count}</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => resetCounter(dhikr.id)}
                              className="px-3 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors py-2 dark:text-gray-200"
                            >
                              Reset
                            </button>
                            {!isCompleted && (
                              <button
                                onClick={() => {
                                  playClickSound() // Added sound effect
                                  setRippleState({ id: dhikr.id, key: Date.now() })
                                  handleIncrement(dhikr.id, dhikr.count, index)
                                }}
                                className={`relative overflow-hidden px-6 py-2 rounded-lg font-medium transition-all bg-gradient-to-r ${currentCategory.color} text-white hover:shadow-lg active:scale-110`}
                              >
                                <span className="relative z-10">Count</span>
                                {rippleState?.id === dhikr.id && (
                                  <span
                                    key={rippleState.key}
                                    className="absolute inset-0 bg-white/40 rounded-full animate-ripple pointer-events-none"
                                    style={{
                                      left: "50%",
                                      top: "50%",
                                      width: "100%",
                                      height: "100%",
                                      transformOrigin: "center",
                                      marginLeft: "-50%",
                                      marginTop: "-50%",
                                    }}
                                  />
                                )}
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

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
              May Allah accept your dhikr and grant you His blessings 🤲
            </p>
          </div>
        </div>
      )}

      {mainTab === "hadith" && (
        <div className="max-w-4xl mx-auto p-4 pb-8">
          <div className="mb-4 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">{readHadith.size} of 40 read</p>
          </div>

          <div className="space-y-4">
            {hadithData.map((hadith) => {
              const isRead = readHadith.has(hadith.id)

              return (
                <div
                  key={hadith.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all ${
                    isRead ? "ring-2 ring-emerald-500" : ""
                  }`}
                >
                  <div className="p-5 py-4 px-4">
                    <div className="text-right mb-4 mt-2">
                      <p className="text-xl leading-loose text-gray-800 dark:text-gray-100">{hadith.arabic}</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mb-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{hadith.translation}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold px-3 py-1 rounded-full ${
                            isRead
                              ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          الحديث #{hadith.number}
                        </span>
                        {isRead && (
                          <span className="text-emerald-500 dark:text-emerald-400 text-sm font-semibold">✓ Read</span>
                        )}
                      </div>

                      <button
                        onClick={() => markHadithAsRead(hadith.id)}
                        className={`py-2 font-medium transition-all rounded-full px-5 text-sm ${
                          isRead
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
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

          <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border-solid border border-green-300 dark:border-green-800">
            <p className="text-sm text-emerald-800 dark:text-emerald-200 text-center">
              الأربعون النووية - Imam An-Nawawi&apos;s 40 Hadith Collection 📚
            </p>
          </div>
        </div>
      )}

      {mainTab === "quran" && (
        <div className="max-w-4xl mx-auto p-4 pb-8 pt-5">
          {isLoadingQuran && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Loading Quran data...</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Fetching all 114 surahs with translations</p>

              <div className="w-64 mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">{loadingProgress}%</p>
              </div>
            </div>
          )}

          {quranError && (
            <div className="p-6 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-200 mb-1">Failed to load Quran data</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{quranError}</p>
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
                  <div className="mb-4 flex gap-3">
                    {/* Reciter Dropdown */}
                    <div className="relative flex-1">
                      <button
                        onClick={() => {
                          setShowReciterDropdown(!showReciterDropdown)
                          setShowSortDropdown(false)
                        }}
                        className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:shadow-lg transition-all flex items-center justify-between h-full"
                      >
                        <div className="flex items-center gap-3">
                          <Volume2 className="w-5 h-5 text-purple-500" />
                          <div className="text-left">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Reciter</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
                              {RECITERS.find((r) => r.id === selectedReciter)?.name}
                            </p>
                          </div>
                        </div>
                        <ChevronLeft
                          className={`w-5 h-5 text-gray-400 transition-transform ${showReciterDropdown ? "rotate-90" : "-rotate-90"}`}
                        />
                      </button>

                      {showReciterDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border-purple-200 dark:border-purple-800 z-20  overflow-y-auto border-0">
                          {RECITERS.map((reciter) => (
                            <button
                              key={reciter.id}
                              onClick={() => {
                                setSelectedReciter(reciter.id)
                                setShowReciterDropdown(false)
                                stopQuranAudio()
                              }}
                              className={`w-full p-4 text-left hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors border-gray-100 dark:border-gray-700 last:border-b-0 border-b ${
                                selectedReciter === reciter.id ? "bg-purple-100 dark:bg-purple-900/50" : ""
                              }`}
                            >
                              <p className="font-semibold text-gray-800 dark:text-gray-200 text-xs">{reciter.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 text-right">
                                {reciter.arabicName}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative flex-1">
                      <button
                        onClick={() => {
                          setShowSortDropdown(!showSortDropdown)
                          setShowReciterDropdown(false)
                        }}
                        className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:shadow-lg transition-all flex items-center justify-between h-full"
                      >
                        <div className="flex items-center gap-3">
                          <ArrowUpDown className="w-5 h-5 text-purple-500" />
                          <div className="text-left">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sort By</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
                              {sortOption === "number" && "Surah Number"}
                              {sortOption === "alphabetical-en" && "Alphabetical (A-Z)"}
                              {sortOption === "alphabetical-ar" && "Alphabetical (Arabic)"}
                              {sortOption === "verses-desc" && "Most Verses"}
                              {sortOption === "verses-asc" && "Fewest Verses"}
                              {sortOption === "revelation-order" && "Revelation Order"}
                            </p>
                          </div>
                        </div>
                        <ChevronLeft
                          className={`w-5 h-5 text-gray-400 transition-transform ${showSortDropdown ? "rotate-90" : "-rotate-90"}`}
                        />
                      </button>

                      {showSortDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border-purple-200 dark:border-purple-800 z-20 overflow-hidden border-0">
                          {[
                            { id: "number", label: "Surah Number (Default)" },
                            { id: "revelation-order", label: "Revelation Order (Chronological)" },
                            { id: "alphabetical-en", label: "Alphabetical (English)" },
                            { id: "alphabetical-ar", label: "Alphabetical (Arabic)" },
                            { id: "verses-desc", label: "Most Verses (High to Low)" },
                            { id: "verses-asc", label: "Fewest Verses (Low to High)" },
                          ].map((option) => (
                            <button
                              key={option.id}
                              onClick={() => {
                                setSortOption(option.id as any)
                                setShowSortDropdown(false)
                              }}
                              className={`w-full p-4 text-left hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                                sortOption === option.id ? "bg-purple-100 dark:bg-purple-900/50" : ""
                              }`}
                            >
                              <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{option.label}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {isFriday() && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-500 dark:border-amber-700 rounded-lg border-r border-b border-t border-l">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🕌</span>
                          <div>
                            <p className="font-semibold text-amber-900 dark:text-amber-200">It&apos;s Friday!</p>
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                              It's recommended to recite Surah Al-Kahf today
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const kahfSurah = quranData.find((s) => s.number === 18)
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
                    <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg border border-violet-200 dark:border-violet-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-purple-900 dark:text-purple-200">Continue Reading</p>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
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
                          className={`w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 hover:shadow-lg transition-all text-left py-4 px-4 ${
                            isKahf && isFriday() ? "ring-2 ring-amber-400" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-lg flex items-center justify-center font-bold text-lg w-11 h-11">
                                {surah.number}
                              </div>
                              <div className="text-right">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{surah.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-left leading-3 py-0 pt-2">
                                  {surah.englishName || surah.name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {hasBookmark && <span className="text-purple-500 font-semibold text-3xl">🔖</span>}
                              {isKahf && isFriday() && <span className="text-amber-500 text-sm">🕌</span>}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  playQuranAudio("surah", surah.number)
                                }}
                                className="p-2 rounded-lg bg-purple-100 dark:bg-[rgba(0,0,0,0.25)] hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors"
                              >
                                {loadingAudioId === `surah-${surah.number}` ? (
                                  <Loader2 className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin" />
                                ) : playingAudioType === "surah" && playingAudioId === `surah-${surah.number}` ? (
                                  <Pause className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                ) : (
                                  <Play className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                )}
                              </button>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-300 dark:border-purple-800">
                    <p className="text-sm text-purple-800 dark:text-purple-200 text-center">
                      📖 Complete Quran with all 114 surahs and English translations
                    </p>
                  </div>
                </>
              )}

              {quranView === "reading" && selectedSurah && (
                <>
                  <div className="sticky top-0  z-10 pb-4 pt-4 mt-0 mb-2">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-5 rounded-xl shadow-lg py-2 px-2 pr-2">
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            playQuranAudio("surah", selectedSurah.number)
                          }}
                          className="bg-white/20 backdrop-blur rounded-lg flex items-center justify-center size-12 hover:bg-white/30 transition-colors"
                        >
                          {loadingAudioId === `surah-${selectedSurah.number}` ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : playingAudioType === "surah" && playingAudioId === `surah-${selectedSurah.number}` ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </button>
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
                          id={`ayah-${verse.number}`} // Added ID for scrolling to specific ayah
                          ref={(el) => {
                            if (el) ayahRefs.current[ayahKey] = el
                          }}
                          onClick={() => handleAyahClick(index)}
                          className={`p-5 rounded-xl transition-all cursor-pointer py-4 px-4 scroll-mt-24 ${
                            isAyatAlKursi
                              ? "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-2 border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600"
                              : isBookmarked
                                ? "bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-600"
                                : "bg-white dark:bg-gray-800 shadow-md hover:shadow-lg hover:scale-[1.01]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full border-none border-0">
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
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                }`}
                              >
                                {isBookmarked ? "🔖 Bookmarked" : "Bookmark"}
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              {isAyatAlKursi && (
                                <span className="px-3 py-1 bg-amber-500 text-white font-bold rounded-full text-sm">
                                  ⭐ {verse.specialName}
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  playQuranAudio("ayah", selectedSurah.number, verse.number)
                                }}
                                className="p-1.5 bg-purple-100 dark:bg-[rgba(0,0,0,0.25)] hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors rounded-md"
                              >
                                {loadingAudioId === `ayah-${selectedSurah.number}-${verse.number}` ? (
                                  <Loader2 className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin" />
                                ) : playingAudioType === "ayah" &&
                                  playingAudioId === `ayah-${selectedSurah.number}-${verse.number}` ? (
                                  <Pause className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                ) : (
                                  <Play className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="text-right mb-4">
                            <p
                              className={`leading-loose text-gray-800 dark:text-gray-100 mt-2 ${isAyatAlKursi ? "text-2xl" : "text-xl"}`}
                            >
                              {verse.arabic}
                            </p>
                          </div>

                          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{verse.english}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {selectedSurah.number === 18 && isFriday() && (
                    <div className="mt-6 p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <p className="text-sm text-amber-900 dark:text-amber-200 text-center">
                        ✨ Reciting Surah Al-Kahf on Friday brings light between the two Fridays
                      </p>
                    </div>
                  )}

                  <div className="mt-8">
                    <div className="flex items-stretch justify-between gap-3">
                      <button
                        onClick={goToPreviousSurah}
                        disabled={quranData.findIndex((s) => s.number === selectedSurah.number) === 0}
                        className={`flex-1 h-12 px-6 font-semibold transition-all flex items-center justify-center gap-2 border-none shadow-md rounded-lg ${
                          quranData.findIndex((s) => s.number === selectedSurah.number) === 0
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-2 border-purple-500 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:shadow-lg"
                        }`}
                      >
                        <span className="text-xl">←</span>
                        <span>Previous</span>
                      </button>

                      <button
                        onClick={backToSurahList}
                        className="h-12 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center shadow-xl rounded-lg"
                      >
                        <List className="w-5 h-5" />
                      </button>

                      <button
                        onClick={goToNextSurah}
                        disabled={
                          quranData.findIndex((s) => s.number === selectedSurah.number) === quranData.length - 1
                        }
                        className={`flex-1 h-12 px-6 font-semibold transition-all flex items-center justify-center gap-2 border-none shadow-md rounded-lg ${
                          quranData.findIndex((s) => s.number === selectedSurah.number) === quranData.length - 1
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-2 border-purple-500 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:shadow-lg"
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
        <div className="px-4 max-w-4xl mx-auto pb-32">
          {isLoadingPrayer ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading prayer times...</p>
            </div>
          ) : prayerError ? (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 mt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Prayer Times</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">{prayerError}</p>
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
                        ref={(el) => {
                          dayButtonRefs.current[dateKey] = el
                        }}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center justify-center min-w-[60px] py-3 px-2 rounded-xl transition-all shadow-none ${
                          isSelected
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-105"
                            : isToday
                              ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-700"
                              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        }`}
                      >
                        <span
                          className={`text-xs font-medium mb-1 ${isSelected ? "text-blue-100" : isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                        >
                          {formatDayName(date)}
                        </span>
                        <span
                          className={`text-lg font-bold ${isSelected ? "text-white" : isToday ? "text-blue-700 dark:text-blue-300" : "text-gray-800 dark:text-gray-200"}`}
                        >
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
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {isSameDay(selectedDate, new Date()) ? "Today's" : formatDayName(selectedDate) + "'s"} Prayer
                        Times
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {location.city}, {location.country}
                      </p>
                    </div>
                    {/* Adhan Button */}
                    <button
                      onClick={toggleAdhan}
                      className={`px-4 py-2 rounded-lg font-medium text-white shadow-md transition-all hover:shadow-lg active:scale-95 ${
                        isPlayingAdhan
                          ? "bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800"
                          : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
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
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-1 border-blue-300 dark:border-blue-700 shadow-md"
                          : "bg-white dark:bg-gray-800 shadow-md hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{prayer.icon}</span>
                          <div>
                            <h4
                              className={`font-semibold ${isNext ? "text-blue-800 dark:text-blue-200" : "text-gray-800 dark:text-gray-100"}`}
                            >
                              {prayer.name}
                            </h4>
                            {isNext && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                Next Prayer - {countdown}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold text-lg ${isNext ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}
                          >
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
                          className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-full shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:shadow-lg transition-all active:scale-95 border-none"
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

                  {/* Next Day Button - hide if at last day (7 days from today) */}
                  <div className="flex justify-end border-none">
                    {(() => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const lastDay = new Date(today)
                      lastDay.setDate(today.getDate() + 7)
                      const isAtEnd = isSameDay(selectedDate, lastDay)

                      if (isAtEnd) {
                        return <div className="w-12 h-12" /> // Invisible spacer
                      }

                      return (
                        <button
                          onClick={goToNextDay}
                          className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-full shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:shadow-lg transition-all active:scale-95 border-none"
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
        <div className="max-w-md  mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl  ring-1 ring-gray-100 dark:ring-gray-700">
          <div className="flex items-center justify-around px-2 py-2 ">
            <button
              onClick={() => setMainTab("duaa")}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-xl transition-all ${
                mainTab === "duaa"
                  ? "bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Heart
                className={`mb-1 h-4 w-4 ${mainTab === "duaa" ? "text-teal-600 dark:text-teal-400" : "text-gray-400"}`}
              />
              <span
                className={`text-xs font-semibold ${mainTab === "duaa" ? "text-teal-600 dark:text-teal-400" : "text-gray-500 dark:text-gray-400"}`}
              >
                Duaa
              </span>
            </button>

            <button
              onClick={() => setMainTab("hadith")}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-xl transition-all ${
                mainTab === "hadith"
                  ? "bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <BookOpen
                className={`mb-1 w-4 h-4 ${mainTab === "hadith" ? "text-teal-600 dark:text-teal-400" : "text-gray-400"}`}
              />
              <span
                className={`text-xs font-semibold ${mainTab === "hadith" ? "text-teal-600 dark:text-teal-400" : "text-gray-500 dark:text-gray-400"}`}
              >
                Hadith
              </span>
            </button>

            <button
              onClick={() => setMainTab("quran")}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-xl transition-all ${
                mainTab === "quran"
                  ? "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <BookMarked
                className={`mb-1 h-4 w-4 ${mainTab === "quran" ? "text-purple-600 dark:text-purple-400" : "text-gray-400"}`}
              />
              <span
                className={`text-xs font-semibold ${mainTab === "quran" ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"}`}
              >
                Quran
              </span>
            </button>

            <button
              onClick={() => setMainTab("pray")}
              className={`flex flex-col items-center justify-center flex-1 px-3 rounded-xl transition-all py-2 ${
                mainTab === "pray"
                  ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Clock
                className={`mb-1 w-4 h-4 ${mainTab === "pray" ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}
              />
              <span
                className={`text-xs font-semibold ${mainTab === "pray" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
              >
                Pray
              </span>
            </button>
          </div>
        </div>
      </div>
      <Toaster position="bottom-center" richColors />
    </div>
  )
}
