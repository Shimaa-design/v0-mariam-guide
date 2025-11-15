"use client"

import { useState, useRef, useEffect } from "react"

export function useDuaaAudio() {
  const [playingDuaaId, setPlayingDuaaId] = useState<string | null>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [arabicVoiceAvailable, setArabicVoiceAvailable] = useState(false)

  // Check for Arabic voice availability
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

  return {
    playingDuaaId,
    speechSynthesisRef,
    arabicVoiceAvailable,
    playDuaaAudio,
  }
}
