import { useState, useEffect, useRef } from "react"
import { getWeekDates, formatDayName, isSameDay, convertTo12Hour, formatTime } from "../utils/helpers"

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
