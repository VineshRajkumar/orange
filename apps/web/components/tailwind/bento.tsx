import Image from "next/image";

export default function BentoGrid() {
  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 py-20 sm:py-15">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-center text-base font-semibold text-orange-600">
          Orange Board
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-4xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-5xl">
          A collaborative whiteboard, reimagined.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-16 lg:grid-cols-2">

          {/* Card 1  */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 flex flex-col justify-between">
            <div>
              <div className="text-orange-600 dark:text-orange-400 mb-2 text-sm font-semibold uppercase tracking-wide">
                Teamwork in Action
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Real-time Collaboration
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                See changes live as your team draws, brainstorms, and connects on the same canvas—instantly.
              </p>
            </div>
            <div className="mt-6 relative aspect-[4/3.6] w-full overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800">
              <video
                className="absolute inset-0 h-full w-full object-cover "
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                <source src="/bento/team.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 flex flex-col justify-between">
            <div>
              <div className="text-orange-600 dark:text-orange-400 mb-2 text-sm font-semibold uppercase tracking-wide">
                Seamless Workflow
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Clean & Fast Experience
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                A distraction-free interface built with performance in mind. Enjoy smooth drawing, instant interactions, and a UI that gets out of your way.
              </p>
            </div>
            <div className="mt-6 relative aspect-[4/3.6] w-full overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800">
              <Image
                src="/bento/calm.gif"
                alt="Calm UI experience"
                fill
                className="object-cover"
                sizes="100vw"
                priority
                unoptimized
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
