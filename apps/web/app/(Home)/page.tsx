import React from 'react'



import Banner from '@/components/mycomponents/banner'
import Navbar from '@/components/tailwind/navbar'
import HeroSection from '@/components/tailwind/hero'
import VideoPlayerSection from '@/components/mycomponents/video-player-section'
import BentoGrid from '@/components/tailwind/bento'
import LogoClouds from '@/components/tailwind/logo-clouds'
import CTA from '@/components/mycomponents/cta'
import Footer from '@/components/mycomponents/footer'
import { satoshi } from '../styles/fonts'


export default function OrangePage() {
  return (
    <div className={`${satoshi.className} `}>
      <Banner />
      <Navbar />
      <div className="relative z-10 bg-white w-full dark:bg-black  ">

        {/* Hero Section */}
        <div className=" px-4 fade-in">
          <div className='max-w-grid-width py-20 sm:py-15'>
            <HeroSection />
          </div>
        </div>

        {/* Video Player Section */}
        <div className="bg-neutral-100 px-4 dark:bg-neutral-900 fade-in">
          <div className='max-w-grid-width py-14 sm:py-15'>
            <VideoPlayerSection />
          </div>
        </div>

        {/* Logo Clouds */}
        <div className="px-4 border-t border-b border-zinc-200 dark:border-zinc-800">
          <div className='max-w-grid-width  py-8 sm:py-10'>
            <LogoClouds />
          </div>
        </div>

        {/* Bento Grid Section */}
        <div className="px-4">
          <div className='max-w-grid-width '>
            <BentoGrid />
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-4 ">
          <div className='max-w-grid-width '>
            <CTA />
          </div>
        </div>

        {/* Footer */}
        <div className="">
          <Footer />
        </div>
      </div>
    </div>
  )
}
