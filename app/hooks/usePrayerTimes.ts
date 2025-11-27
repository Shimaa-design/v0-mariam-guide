"use client"

import { useState, useEffect, useRef } from "react"
import { getWeekDates, formatDayName, isSameDay, convertTo12Hour, formatTime } from "../utils/helpers"

interface PrayerTimes {
  Fajr: string
  Sunrise: string
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

export function usePrayerTimes(mainTab: string) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null)
  const prayerTimesCache = useRef<Record<string, PrayerTimes>>({})
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isLoadingPrayer, setIsLoadingPrayer] = useState(false)
  const [prayerError, setPrayerError] = useState<string | null>(null)
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null)
  const [countdown, setCountdown] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const dayButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

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

  // Helper to fetch prayer times for a specific date
  const fetchPrayerTimesForDate = async (date: Date, locationInfo: LocationData) => {
    const dateKey = date.toDateString()

    // Skip if already cached in memory
    if (prayerTimesCache.current[dateKey]) {
      return { success: true, dateKey, data: prayerTimesCache.current[dateKey] }
    }

    // Try to load from localStorage first
    try {
      const cachedData = localStorage.getItem(`prayer-times-${dateKey}`)
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        prayerTimesCache.current[dateKey] = parsed
        return { success: true, dateKey, data: parsed }
      }
    } catch (e) {
      console.warn('Error loading cached prayer times:', e)
    }

    try {
      const prayerResponse = await fetch(
        `https://api.aladhan.com/v1/timings/${Math.floor(date.getTime() / 1000)}?latitude=${locationInfo.latitude}&longitude=${locationInfo.longitude}&method=2`,
        {
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }
      )

      if (!prayerResponse.ok) {
        throw new Error(`API returned ${prayerResponse.status}`)
      }

      const prayerData = await prayerResponse.json()

      if (prayerData.code === 200) {
        const timings = prayerData.data.timings
        const newPrayerTimes = {
          Fajr: timings.Fajr,
          Sunrise: timings.Sunrise,
          Dhuhr: timings.Dhuhr,
          Asr: timings.Asr,
          Maghrib: timings.Maghrib,
          Isha: timings.Isha,
          Jumuah: timings.Dhuhr, // Jumuah (Friday prayer) is at Dhuhr time
        }

        // Cache the prayer times in memory
        prayerTimesCache.current[dateKey] = newPrayerTimes

        // Save to localStorage for offline access
        try {
          localStorage.setItem(`prayer-times-${dateKey}`, JSON.stringify(newPrayerTimes))
        } catch (e) {
          console.warn('Error saving prayer times to localStorage:', e)
        }

        return { success: true, dateKey, data: newPrayerTimes }
      } else {
        console.warn(`Failed to fetch prayer times for ${dateKey}:`, prayerData)
        return { success: false, dateKey, error: prayerData.status || "Unknown API error" }
      }
    } catch (err) {
      console.warn(`Error fetching prayer times for ${dateKey}:`, err)

      // Check if we have any cached data to fall back to
      try {
        const cachedData = localStorage.getItem(`prayer-times-${dateKey}`)
        if (cachedData) {
          const parsed = JSON.parse(cachedData)
          prayerTimesCache.current[dateKey] = parsed
          return { success: true, dateKey, data: parsed, fromCache: true }
        }
      } catch (e) {
        console.warn('Error loading cached prayer times as fallback:', e)
      }

      return { success: false, dateKey, error: err instanceof Error ? err.message : "Network error" }
    }
  }

  // Fetch location and prayer times for all week days
  useEffect(() => {
    const fetchLocationAndPrayer = async () => {
      if (mainTab !== "pray") return

      // Check if we already have all week data cached
      const weekDates = getWeekDates()
      const datesToFetch = [...weekDates]
      if (!weekDates.some((d) => isSameDay(d, selectedDate))) {
        datesToFetch.push(selectedDate)
      }

      // Also ensure we fetch tomorrow's prayer times (needed for next prayer calculation)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      if (!datesToFetch.some((d) => isSameDay(d, tomorrow))) {
        datesToFetch.push(tomorrow)
      }

      const allCached = datesToFetch.every((date) => prayerTimesCache.current[date.toDateString()])

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
          try {
            locationInfo = JSON.parse(savedLocation)
            setLocation(locationInfo)
          } catch (e) {
            console.error("Error parsing saved location", e)
            localStorage.removeItem("mariam-guide-location")
          }
        }

        if (!locationInfo) {
          // Get location from browser geolocation API
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000, // 10 second timeout
                enableHighAccuracy: false, // Faster, less battery
                maximumAge: 300000, // Accept cached position up to 5 minutes old
              })
            })

            const { latitude, longitude } = position.coords

            // Fetch location name from reverse geocoding API
            try {
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
            } catch (locErr) {
              console.warn("Reverse geocoding failed, using coordinates only", locErr)
              locationInfo = {
                city: "Current Location",
                country: "",
                latitude,
                longitude,
              }
            }

            setLocation(locationInfo)

            // Save location to localStorage
            localStorage.setItem("mariam-guide-location", JSON.stringify(locationInfo))
            localStorage.setItem("mariam-guide-location-date", today)
          } catch (geoError) {
            console.warn("Geolocation failed, falling back to default location (Mecca)", geoError)
            // Fallback to Mecca if geolocation fails
            locationInfo = {
              city: "Mecca",
              country: "Saudi Arabia",
              latitude: 21.3891,
              longitude: 39.8579,
            }
            setLocation(locationInfo)
            // Don't save fallback to localStorage to retry next time
          }
        }

        // Fetch prayer times from Aladhan API
        if (!locationInfo) {
          throw new Error("Failed to get location")
        }

        // Fetch prayer times for all days in the week + selected date
        await Promise.allSettled(datesToFetch.map((date) => fetchPrayerTimesForDate(date, locationInfo!)))

        // Set prayer times for currently selected date
        const dateKey = selectedDate.toDateString()
        const selectedDatePrayer = prayerTimesCache.current[dateKey]

        if (!selectedDatePrayer) {
          // Try one more time specifically for selected date if it failed
          const retryResult = await fetchPrayerTimesForDate(selectedDate, locationInfo)
          if (retryResult.success && retryResult.data) {
            setPrayerTimes(retryResult.data)
            setIsLoadingPrayer(false)
            // Show info if loaded from cache
            if (retryResult.fromCache) {
              console.info('Loaded prayer times from offline cache')
            }
          } else {
            throw new Error(
              "Failed to fetch prayer times for the selected date. Please check your internet connection.",
            )
          }
        } else {
          setPrayerTimes(selectedDatePrayer)
          setIsLoadingPrayer(false)
        }
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
  }, [mainTab, selectedDate]) // Added selectedDate dependency to refetch if needed

  // Update displayed prayer times when selected date changes
  /* 
  useEffect(() => {
    if (mainTab !== "pray") return

    const dateKey = selectedDate.toDateString()
    if (prayerTimesCache.current[dateKey]) {
      setPrayerTimes(prayerTimesCache.current[dateKey])
    }
  }, [selectedDate, mainTab])
  */

  // Calculate next prayer and countdown
  useEffect(() => {
    if (!prayerTimes || mainTab !== "pray") return

    const updateCountdown = () => {
      const currentTime = new Date()
      const currentTimeInSeconds = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds()

      // Only calculate next prayer based on TODAY's date and current time
      // This ensures we only highlight ONE prayer - the actual next one from now
      const today = new Date()
      const isSelectedToday = isSameDay(selectedDate, today)
      const todayIsFriday = today.getDay() === 5 // 5 = Friday

      // Get today's prayer times from cache
      const todayKey = today.toDateString()
      const todayPrayerTimes = prayerTimesCache.current[todayKey] || prayerTimes

      const todayPrayers = [
        { name: "Fajr", time: todayPrayerTimes.Fajr },
        { name: todayIsFriday ? "Jumuah" : "Dhuhr", time: todayIsFriday ? todayPrayerTimes.Jumuah : todayPrayerTimes.Dhuhr },
        { name: "Asr", time: todayPrayerTimes.Asr },
        { name: "Maghrib", time: todayPrayerTimes.Maghrib },
        { name: "Isha", time: todayPrayerTimes.Isha },
      ]

      // Convert today's prayer times to seconds
      const todayPrayerSeconds = todayPrayers.map((p) => {
        const [hours, minutes] = p.time.split(":").map(Number)
        return { ...p, seconds: hours * 3600 + minutes * 60 }
      })

      // Find next prayer from current time
      let next = todayPrayerSeconds.find((p) => p.seconds > currentTimeInSeconds)
      let nextPrayerDate = today

      if (!next) {
        // Next prayer is Fajr tomorrow
        const tomorrow = new Date(currentTime)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowKey = tomorrow.toDateString()
        nextPrayerDate = tomorrow

        // Get tomorrow's prayer times from cache if available
        const tomorrowPrayerTimes = prayerTimesCache.current[tomorrowKey]
        const tomorrowFajrTime = tomorrowPrayerTimes ? tomorrowPrayerTimes.Fajr : todayPrayerTimes.Fajr

        const [hours, minutes] = tomorrowFajrTime.split(":").map(Number)
        next = {
          name: "Fajr",
          time: tomorrowFajrTime,
          seconds: hours * 3600 + minutes * 60 + 24 * 3600
        }
      }

      // Only show next prayer if we're viewing the date that contains it
      const isViewingNextPrayerDate = isSameDay(selectedDate, nextPrayerDate)

      if (isViewingNextPrayerDate) {
        setNextPrayer({ name: next.name, time: next.time })

        // Calculate countdown
        let diffInSeconds = next.seconds - currentTimeInSeconds
        if (diffInSeconds < 0) diffInSeconds += 24 * 3600

        const hours = Math.floor(diffInSeconds / 3600)
        const minutes = Math.floor((diffInSeconds % 3600) / 60)
        const seconds = diffInSeconds % 60
        setCountdown(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        // Not viewing the date with the next prayer
        setNextPrayer(null)
        setCountdown("")
      }
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
        inline: "center",
      })
    }
  }, [selectedDate, mainTab])

  return {
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
  }
}
