"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle({className}:{className?:string}) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"
  // console.log('from modetoggle',theme)

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className= {`relative border ${className}`}
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all ${
          isDark ? "scale-100 rotate-0 block" : "scale-0 rotate-90 hidden"
        }`}
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] transition-all absolute ${
          isDark ? "scale-0 -rotate-90 hidden" : "scale-100 rotate-0 block"
        }`}
      />
    
    </Button>
  )
}
