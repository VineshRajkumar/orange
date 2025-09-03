"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export const ThemeToggle = () => {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"

  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={isDark}
        onChange={() => setTheme(isDark ? "light" : "dark")}
      />
      <div className="relative w-11 h-6 bg-orange-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-500 rounded-full peer dark:bg-orange-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-orange-300 dark:after:border-orange-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 dark:peer-checked:bg-orange-400 border border-orange-400 dark:border-orange-300" />
      <span className="ms-3 text-sm font-medium text-orange-900 dark:text-orange-200">
        {isDark ? "Dark" : "Light"} Mode
      </span>
    </label>
  )
}



