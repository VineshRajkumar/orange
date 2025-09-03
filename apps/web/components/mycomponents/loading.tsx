'use client'
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function Loading() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (

    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-black  transition-colors duration-300 text-center px-4">
      {(resolvedTheme === "light") ?

        <Image

          src={"/loader/clocktime.gif"}
          alt="Loading..."
          width={180}
          height={180}
          priority
          unoptimized
        />


        :
        <Image
          src={"/loader/clock.gif"}
          alt="Loading..."
          width={180}
          height={180}
          priority
          unoptimized
        />
      }
    </div>
  );
}


