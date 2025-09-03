
import { Marquee } from '@/components/magicui/marquee'
import Image from 'next/image'
import React from 'react'

const techStack = [
  { alt: "Next.js", src: "/techstacks/nextjs.svg" },
  { alt: "Turborepo", src: "/techstacks/turborepo.svg" },
  { alt: "WebSocket", src: "/techstacks/websocket.svg" },
  { alt: "Prisma", src: "/techstacks/prisma.svg" },
  { alt: "Tailwind CSS", src: "/techstacks/tailwind.svg", noInvert: true },
  { alt: "TypeScript", src: "/techstacks/typescript.svg", noInvert: true },
  { alt: "Zod", src: "/techstacks/zod.svg", noInvert: true },
  { alt: "ShadCN", src: "/techstacks/shadcn.svg" },
  { alt: "Node.js", src: "/techstacks/nodejs.svg" },
  { alt: "Express.js", src: "/techstacks/express.svg" },
]

export default function TechMarquee() {
  return (
    <div className="overflow-hidden bg-white dark:bg-black py-8">
      <Marquee>
        {techStack.concat(techStack).map((tech, idx) => (
          <div key={idx} className="flex items-center justify-center">
            <Image
              src={tech.src}
              alt={tech.alt}
              width={48}
              height={48}
              className={`h-10 px-10 w-auto object-contain ${tech.noInvert ? '' : 'dark:invert'}`}
            />
          </div>
        ))}
      </Marquee>
    </div>
  )
}

