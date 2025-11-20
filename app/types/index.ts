export interface QuranVerse {
  number: number
  arabic: string
  english: string
  isSpecial?: boolean
  specialName?: string
}

export interface QuranSurah {
  number: number
  name: string
  englishName?: string
  verses: QuranVerse[]
  hasSpecialReminder?: boolean
  revelationOrder?: number
}

export interface PrayerTimes {
  Fajr: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
  Jumuah: string
}

export interface LocationData {
  city: string
  country: string
  latitude: number
  longitude: number
}
