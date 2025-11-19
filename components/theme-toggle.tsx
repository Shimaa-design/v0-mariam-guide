"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-[rgba(0,0,0,0.25)] dark:bg-[rgba(0,0,0,0.25)]">
        <Sun className="w-5 h-5" />
      </button>
    )
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg dark:bg-[rgba(0,0,0,0.25)] hover:bg-[rgba(0,0,0,0.35)] dark:hover:bg-[rgba(0,0,0,0.35)] transition-colors bg-[rgba(0,0,0,0.25)]"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-5 h-5 " />
      ) : (
        <Moon className="w-5 h-5 " />
      )}
    </button>
  )
}
