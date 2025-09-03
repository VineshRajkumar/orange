
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Switcher11 from '../ui/switcher'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from '@/store/Auth'
import { useRouter } from 'next/navigation'
import { Toaster } from "sonner"
import { useSheetStore } from '@/store/Sheets'
import PersonalCanvasCard from '../canvas/personal-canvas-card'
import CreateSheetComponent from './create-sheet-component'
import ChangePasswordDialog from './change-password-component'
import UpdateAccountDialog from './update-account-details-component'
import { DebouncedInput } from '../ui/debouncedinput'
import { getGreeting } from '@/actions/dashboard.action'
import { useSearchSheetMessage } from '@/hooks/use-search-sheet-message'
import { useSessionManager } from '@/hooks/use-session-manager'
import { useNavigateToLogin } from '@/hooks/use-navigate-login'
import { useFetchSheetsHook } from '@/hooks/use-fetch-sheets'
import { handlelogout } from '@/actions/logout.action'
import JoinRoomComponent from './join-room-component'

export default function MobileSidebar() {

  const [loading, setLoading] = useState(false)
  const [switchLoader, setswitchLoader] = useState(false)
  const { status, userData, logout } = useAuthStore((state) => (state))
  const { saveSheets, sheetData } = useSheetStore((state) => (state))
  const [searchingLoader, setSearchingLoader] = useState(false)
  const [searchMessage, setsearchMessage] = useState('')
  const [loggingOutLoader, setLoggingOutLoader] = useState(false)
  const router = useRouter()

  const handleClientLogout = () => {
    handlelogout({ logout, router, setLoggingOutLoader })
  }

  //fetching sheets should happen here 
  useFetchSheetsHook({ setLoading, saveSheets, switchLoader })

  // auth use effect logout
  useNavigateToLogin({ status, router })

  // is guest or user session expired -> this is a hook made so that it can be reused in mobile dashbaord
  useSessionManager({ userData, logout, router, setLoggingOutLoader })

  //for searching sheets message -> this is a hook made so that it can be reused in mobile dashbaord
  useSearchSheetMessage({ sheetData, setsearchMessage })



  return (
    <div className='md:grid md:grid-cols-[1fr]'>
      {/* SIDEBAR  */}

      <nav className='flex items-center  justify-evenly gap-x-3 h-[70px] w-full bg-[#FFFFFF] border-t border-[#E0E0E0] fixed bottom-0 transition-all duration-300 ease-in-out overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-none dark:bg-[#1A1A1A] dark:border-[#444444]'>
        <ul className='flex flex-row items-center justify-evenly w-full'>

          {/* Dashboard Icon  */}
          {/* Dropdown */}
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='flex flex-col items-center justify-center'>
                  <span className=" text-black dark:text-white text-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z"/></svg>
                  </span>
                  <span className="text-xs">Dashboard</span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56" align="center">
                <ul>
                  <DropdownMenuGroup className='py-3 '>

                    {/* create sheet  */}
                    {/* {userData?.isGuest === true ? '' : */}

                    <CreateSheetComponent>
                      <div className="hover:border-l-[3px] hover:border-[#FF7F00] py-2">
                        <li className='flex items-center gap-2 px-2 py-1.5 text-sm'>
                          <span className="text-black dark:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M720-160v-120H600v-80h120v-120h80v120h120v80H800v120h-80Zm-600 40q-33 0-56.5-23.5T40-200v-560q0-33 23.5-56.5T120-840h560q33 0 56.5 23.5T760-760v200h-80v-80H120v440h520v80H120Zm0-600h560v-40H120v40Zm0 0v-40 40Z" /></svg>
                          </span>
                          <span className='grow'>Create Sheet</span>
                        </li>
                      </div>

                    </CreateSheetComponent>

                    {/* create room  */}
                    {/* <CreateRoomComponent>
                      <div className="hover:border-l-[3px] hover:border-[#FF7F00]">
                        <li className='flex items-center gap-2 '>
                          <span className="material-icons">video_call</span>
                          <span className='grow'>Create Room</span>
                        </li>
                      </div>
                    </CreateRoomComponent> */}

                    {/* join room  */}
                    <JoinRoomComponent>
                      <div className="hover:border-l-[3px] hover:border-[#FF7F00] py-2">
                        <li className='flex items-center gap-2'>
                          <span className="text-black dark:text-white pl-2">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M500-482q29-32 44.5-73t15.5-85q0-44-15.5-85T500-798q60 8 100 53t40 105q0 60-40 105t-100 53Zm220 322v-120q0-36-16-68.5T662-406q51 18 94.5 46.5T800-280v120h-80Zm80-280v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Zm-480-40q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM0-160v-112q0-34 17.5-62.5T64-378q62-31 126-46.5T320-440q66 0 130 15.5T576-378q29 15 46.5 43.5T640-272v112H0Z" /></svg>
                          </span>
                          <span className='grow '>Join Room</span>
                        </li>
                      </div>
                    </JoinRoomComponent>

                  </DropdownMenuGroup>
                </ul>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>

          {/* Dark/light mode toggle */}
          <li className='flex flex-col items-center justify-center'>
            <Switcher11 />
            <span className="text-xs">Mode</span>
          </li>

          {/* Profile Icon  */}
          {/* Dropdown */}

          <li>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='flex flex-col items-center justify-center'>
                  <span className="text-black dark:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z" /></svg>
                  </span>
                  <span className="text-xs">Account</span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-60" align="center">
                <ul>
                  <DropdownMenuGroup>

                    {/* change password & updateaccount details */}
                    {
                    userData?.isGuest === true ? 
                    '' : 
                    <>
                    <ChangePasswordDialog>
                      <div className="hover:border-l-[3px] hover:border-[#FF7F00] text-sm px-2 py-1.5">
                        <li className='flex items-center gap-2'>
                          <span className="text-black dark:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm240-200q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z" /></svg>
                          </span>
                          <span>Change Password</span>
                        </li>
                      </div>
                    </ChangePasswordDialog>

                    <UpdateAccountDialog>
                      <div className="hover:border-l-[3px] hover:border-[#FF7F00] text-sm px-2 py-1.5">
                        <li className='flex items-center gap-2'>
                          <span className="text-black dark:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" /></svg>
                          </span>
                          <span>Update Account Details</span>
                        </li>
                      </div>
                    </UpdateAccountDialog>
                    </>
                    }

                    {/* logout  */}
                    <DropdownMenuItem >
                      <li className='w-[100%] flex justify-center'>
                        <Button onClick={() => handleClientLogout()} disabled={loggingOutLoader} className="w-full bg-[#FF7F00] hover:bg-[#e66f00] text-white font-semibold transition-colors duration-200">
                          {loggingOutLoader ? 'Logging Out...' : 'Logout'}
                        </Button>
                      </li>
                    </DropdownMenuItem>

                  </DropdownMenuGroup>
                </ul>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>

        </ul>
      </nav>


      {/* CONTENT  */}
      <main className='p-[min(24px,6%)] pb-[100px] text-[#333333] scroll-smooth'>

        {/* Logo + Name */}
        <div className='flex items-center justify-start mb-6 pl-[2px]'>
          <Image src="/logos/logo.png" alt="logo" width={36} height={36} />
          <span className='cursor-pointer font-semibold pl-3 text-lg sm:text-xl text-[#333333] dark:text-[#EAEAEA]'>
            Orange Board
          </span>
        </div>

        {/* Dashboard heading */}
        <div className='text-3xl sm:text-4xl font-semibold mb-4 dark:text-[#EAEAEA]'>
          {getGreeting()}, {userData?.username ?? 'Unknown'} 👋
        </div>

        {/* Toggle + Search + Refresh */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4">

          {/* Toggle buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              className="w-full sm:w-auto px-4 py-2 rounded-md font-medium bg-[#FF7F00] text-white hover:bg-[#e66f00] transition-colors"
            >
              Personal Sheets
            </button>
            {/* <button
              className="w-full sm:w-auto px-4 py-2 rounded-md font-medium border border-[#FF7F00] text-[#FF7F00] hover:bg-[#FF7F00] hover:text-white transition-colors"
            >
              Room Sheets
            </button> */}
          </div>

          {/* Search + Refresh */}
          <div className="flex items-center gap-2 w-full sm:w-auto">

            <DebouncedInput
              type="text"
              placeholder="Search sheets..."
              className="w-full sm:w-[220px] px-3 py-2 border border-[#FF7F00] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF7F00] dark:bg-[#1A1A1A] dark:text-white"
              setSearchingLoader={setSearchingLoader}
              setsearchMessage={setsearchMessage}
            />
            <button
              onClick={() => (setswitchLoader(!switchLoader))}
              className="p-2 rounded-md bg-[#FF7F00] hover:bg-[#e66f00] text-white transition-colors"
              aria-label="Refresh"
            >
              <span className="text-white text-base">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" /></svg>
              </span>
            </button>
          </div>
        </div>

        {/* container3 – placeholder */}

        <div className="mt-6">
          {/* Searching loader */}
          {searchingLoader ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Searching...</p>
          ) : null}

          {/* Show search message if no sheets */}
          {!searchingLoader && searchMessage ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{searchMessage}</p>
          ) : null}

          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
            {Object.keys(sheetData).length > 0 ? (

              Object.keys(sheetData).map((id) => (
                <div key={id}>
                  <PersonalCanvasCard sheet={sheetData[id]} loading={loading} id={id} />
                </div>
              ))
            ) : (
              // Optionally, fallback skeletons (only if not in searching state)
              !searchingLoader && !searchMessage && (
                <>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} />
                  ))}
                </>
              )
            )}
          </div>
        </div>


      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}

