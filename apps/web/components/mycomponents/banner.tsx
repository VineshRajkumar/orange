import Link from 'next/link'

export default function Banner() {
  return (
     <div className="w-full bg-gradient-to-tr from-orange-500 to-red-500 text-white py-2">
      <div className="mx-auto max-w-7xl px-4 flex flex-row justify-center items-center gap-2 text-sm sm:text-base text-center">
        <p className="flex items-center gap-1">
          Built with
          <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">🧡</span>
          by{' '}
          <Link
            href="https://vinesh-raj.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-orange-100 transition"
          >
            Vinesh Raj
          </Link>
        </p>
        <span className="hidden sm:inline">|</span>
        <Link
          href="https://x.com/VineshRaj239"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-orange-100 transition"
        >
          Twitter
        </Link>
      </div>
    </div>
  )
}






