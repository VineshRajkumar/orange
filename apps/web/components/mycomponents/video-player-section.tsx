import Image from 'next/image'
import React from 'react'

const VideoPlayerSection = () => {
    return (

        <div className="relative  z-0 mx-auto px-4  bg-neutral-100 dark:bg-neutral-900">
            <div className="mx-auto mt-2 max-w-[940px] ">
                <div className="size-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-1.5 py-1.5 sm:rounded-[1.25rem] sm:px-3 sm:py-3  ">

                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="rounded-xl w-full h-auto"
                        poster="/videos/demo.png"
                        preload="auto"
                    >
                        {/* webm video is light for website */}
                        <source src="/videos/orangeboard.webm" type="video/webm" />

                        {/* If video fails to load, fallback image will show via poster */}
                        <Image
                            src="/videos/demo.png"
                            alt="Demo"
                            width={1280}
                            height={720}
                            className="rounded-xl w-full h-auto"
                        />
                    </video>
                </div>
            </div>
        </div>

    )
}

export default VideoPlayerSection


