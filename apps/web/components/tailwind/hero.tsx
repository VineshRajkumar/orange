import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimatedGradientTextDemo } from "../magicui/animatedgradienttext";
import LoginAsGuestButton from "../mycomponents/login-as-guest-mode";


export default function HeroSection() {


  return (
    <div className="">

      <div className="px-6  ">

        {/* <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff6700] to-[#ffb347] opacity-30 dark:from-[#ff8000] dark:to-[#ff4800] sm:left-[calc(50%-30rem)] sm:w-[72rem]"
          />
        </div> */}
   
        <div className="mx-auto max-w-[600px] ">

          <div className=" mb-6 flex justify-center">
            <AnimatedGradientTextDemo />
          </div>

          <div className="text-center">

           
              <h1 className="text-4xl  font-medium  sm:leading-[1.2] text-gray-900  sm:text-5xl dark:text-transparent dark:bg-gradient-to-r dark:from-orange-400 dark:via-yellow-300 dark:to-pink-500 dark:bg-clip-text dark:drop-shadow-md  ">
                Turn ideas into visuals
              </h1>
       

           
              <p className="mt-4 text-lg font-medium  text-gray-500 sm:text-xl/8 dark:text-gray-300">
                Orange Board is a modern whiteboard for real-time collaboration, async creativity, and visual communication.
              </p>
       


            <div className="mt-10 flex items-center justify-center gap-x-6">

              <Link href={'/signup'}>
                <Button variant={'default'} size={'lg'} >
                  Get started
                </Button>
              </Link>

              <LoginAsGuestButton/>

            </div>


          </div>


        </div>


      </div>


    </div>
  )
}
