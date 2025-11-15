"use client"

import { useState, useRef } from "react"

export function useAdhanAudio() {
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false)
  const adhanAudioRef = useRef<HTMLAudioElement | null>(null)

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

  return {
    isPlayingAdhan,
    adhanAudioRef,
    toggleAdhan,
  }
}
