
import Image from 'next/image'
import Link from 'next/link'
import { ModeToggle } from '@/components/ui/modetoggle'
import { Poppins } from 'next/font/google';
import LeftFullNavbar from './left-full-navbar';
import { AdditionalInfoDialog } from '../mycomponents/additional-info-dialog';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-poppins',
})

export default function Navbar() {

 

  return (
    <div className="sticky top-0 z-50 w-full">

      {/* Put the dark mode button and github button in footer in mobile view  */}
      {/* Navbar */}
      <nav
        aria-label="Global"
        className="border-b  backdrop-blur-lg bg-white/75 dark:bg-black/75 border-neutral-100 dark:border-white/10"
      >
        <div className="max-w-5xl px-4 flex items-center justify-between mx-auto h-14  ">

          <Link href="/" className="flex items-center justify-center gap-2">
            <div className="flex items-center  ">
              <Image
                alt="Orange Logo"
                src="/logos/logo.png"
                width={33}
                height={33}

              />
            </div>
            <span
              className={`${poppins.className} max-[500px]:hidden text-xl font-semibold text-black dark:text-white`}
            >
              Orange Board
            </span>
          </Link>


          <div className=" flex items-center gap-2">

            
            <div className='max-[375px]:hidden'>
              <AdditionalInfoDialog/>
            </div>

            <ModeToggle className='flex border-0 shadow-none' />
        
            <LeftFullNavbar/>

          </div>

        </div>
      </nav>


    </div>
  )
}

