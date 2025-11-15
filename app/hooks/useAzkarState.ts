import { useState, useEffect, useRef, useMemo } from "react"
import { azkarData } from "../data/azkar-data"

interface UseAzkarStateProps {
  mainTab: string
}

export function useAzkarState({ mainTab }: UseAzkarStateProps) {
  // State
  const [selectedCategory, setSelectedCategory] = useState("morning")
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [completedAzkar, setCompletedAzkar] = useState(new Set<string>())
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({
    duaa: 0,
    hadith: 0,
    quran: 0,
    pray: 0
  })

  // Touch gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Refs
  const dhikrRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const categoryNavRef = useRef<HTMLDivElement>(null)
  const swipeStartTime = useRef<number>(0)

  // Constants
  const minSwipeDistance = 50
  const minSwipeVelocity = 0.3 // pixels per millisecond

  // Load counts from localStorage
  useEffect(() => {
    const savedCounts = localStorage.getItem("mariam-guide-duaa-counts")
    if (savedCounts) {
      try {
        setCounts(JSON.parse(savedCounts))
      } catch (error) {
        console.error("Failed to load duaa counts:", error)
      }
    }
  }, [])

  // Save counts to localStorage
  useEffect(() => {
    localStorage.setItem("mariam-guide-duaa-counts", JSON.stringify(counts))
  }, [counts])

  // Scroll restoration for duaa tab
  useEffect(() => {
    // Small delay to ensure DOM is rendered
    const timeoutId = setTimeout(() => {
      const savedPosition = scrollPositions[mainTab] || 0
      window.scrollTo({
        top: savedPosition,
        behavior: 'instant' // Use instant to avoid jarring animation
      })
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [mainTab, scrollPositions])

  // Reset dhikr refs when category changes
  useEffect(() => {
    dhikrRefs.current = {}
  }, [selectedCategory])

  // Memoize current category to avoid recalculation on every render (mobile performance)
  const currentCategory = useMemo(() =>
    azkarData[selectedCategory as keyof typeof azkarData],
    [selectedCategory]
  )

  // Functions
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
              // Changed block from "center" to "start"
              nextElement.scrollIntoView({
                behavior: "smooth",
                block: "start",
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

  // Touch handlers
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

  return {
    // State
    selectedCategory,
    setSelectedCategory,
    counts,
    completedAzkar,
    scrollPositions,
    setScrollPositions,

    // Touch gesture state
    touchStart,
    touchEnd,
    swipeOffset,
    isTransitioning,

    // Refs
    dhikrRefs,
    categoryNavRef,

    // Derived data
    currentCategory,

    // Functions
    handleIncrement,
    resetCounter,
    resetCategory,
    navigateCategory,
    scrollCategoryIntoView,

    // Touch handlers
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}
