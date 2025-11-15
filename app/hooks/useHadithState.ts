import { useState, useEffect } from "react"

export function useHadithState() {
  const [readHadith, setReadHadith] = useState(new Set<string>())

  // Load read hadith from localStorage on mount
  useEffect(() => {
    const savedReadHadith = localStorage.getItem("mariam-guide-read-hadith")
    if (savedReadHadith) {
      try {
        setReadHadith(new Set(JSON.parse(savedReadHadith)))
      } catch (error) {
        console.error("Failed to load read hadith:", error)
      }
    }
  }, [])

  // Save read hadith to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("mariam-guide-read-hadith", JSON.stringify(Array.from(readHadith)))
  }, [readHadith])

  // Toggle hadith read status
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

  return {
    readHadith,
    markHadithAsRead,
  }
}
