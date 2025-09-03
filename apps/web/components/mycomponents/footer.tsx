import Link from 'next/link'

export default function Footer() {
  return (
    <footer className=" bg-white dark:bg-black border-t border-gray-200 dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 py-5 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        
        {/* Left - Short Phrase */}
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} Orange Board. All rights reserved.
        </p>

        {/* Right - Links */}
        <div className="mt-2 sm:mt-0 flex space-x-4">
          <Link
            href="https://vinesh-raj.vercel.app/" 
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-500 transition"
          >
            Portfolio
          </Link>
          <Link
            href="https://x.com/VineshRaj239"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-500 transition"
          >
            Twitter
          </Link>
          <Link
            href="/privacy-policy"
            className="hover:text-orange-500 transition"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
