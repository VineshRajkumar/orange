import Link from 'next/link'
import React from 'react'

export default function CTA() {
  return (
    <div className="bg-white dark:bg-black">
      <div className="mx-auto max-w-7xl sm:px-6 py-10 lg:px-8">
        <div className="relative isolate overflow-hidden bg-zinc-900 dark:bg-gray-100 px-6 shadow-2xl sm:rounded-3xl sm:px-16 lg:flex lg:gap-x-20 lg:px-24">
          {/* Background Gradient Blob */}
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -z-10 size-[64rem] -translate-y-1/2 mask-[radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
          >
            <circle
              r={512}
              cx={512}
              cy={512}
              fill="url(#orange-board-gradient)"
              fillOpacity="0.7"
            />
            <defs>
              <radialGradient id="orange-board-gradient">
                <stop stopColor="#f97316" />
                <stop offset={1} stopColor="#ef4444" />
              </radialGradient>
            </defs>
          </svg>

          {/* Left content */}
          <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto py-11 lg:text-left">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance text-white dark:text-gray-900">
              Build <span className="text-orange-500">Collaborative</span>{' '}
              <span className="text-red-500">Ideas</span> Visually.
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300 dark:text-gray-700 text-pretty">
              Orange Board is your real-time canvas for creativity—draw, share,
              and collaborate effortlessly with your team or friends.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <Link
                href="/signup"
                className="rounded-md bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 transition"
              >
                Get Started
              </Link>
              <Link
                href="https://x.com/VineshRaj239/status/1946252289519559158"
                className="text-sm font-semibold leading-6 text-white hover:text-orange-200 dark:text-gray-800 dark:hover:text-orange-500 transition"
              >
                Learn More <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
