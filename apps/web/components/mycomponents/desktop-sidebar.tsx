
import Image from 'next/image'
import React, { useState } from 'react'
import Switcher11 from '../ui/switcher'
import { Button } from '../ui/button'
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
import { handlelogout } from '@/actions/logout.action'
import { useNavigateToLogin } from '@/hooks/use-navigate-login'
import { useFetchSheetsHook } from '@/hooks/use-fetch-sheets'
import JoinRoomComponent from './join-room-component'




const DesktopSidebar = () => {
    const [openDropdown, setOpenDropdown] = useState(false)
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
        <div className='grid grid-cols-[auto_1fr]'>
            {/* SIDEBAR  */}
            <nav className='box-border flex flex-col justify-between h-screen w-[310px] px-[5px] py-4 bg-[#FFFFFF] border-[3px] border-solid border-[#E0E0E0] sticky top-0 self-start transition-all duration-300 ease-in-out overflow-x-hidden overflow-y-auto whitespace-nowrap scrollbar-none dark:bg-[#1A1A1A] dark:border-[#444444] '>
                <div>
                    {/* LOGO  */}
                    <div className=' flex justify-start mb-[30px]  pl-[20px] '>
                        <Image className='' src="/logos/logo.png" alt="logo" width={50} height={50} />
                        <span className=' cursor-pointer font-semibold pl-3 text-2xl rounded-[0.5em] no-underline text-[#333333] flex items-center gap-[1em]  dark:text-[#EAEAEA]' >
                            Orange Board
                        </span>
                    </div>

                    {/* DASHBOARD ITEMS  */}
                    <ul className=''>
                        {/* NAME :- Dashboard  */}
                        <li className=' text-xl text-[#888888] font-semibold pl-6 pb-2 dark:text-[#BBBBBB] ' >
                            Dashboard
                        </li>

                        {/* create sheet */}
                        {/* {userData?.isGuest === true ? '' : */}
                        <CreateSheetComponent>
                            <div className='sidebar-item'>
                                <span className="text-black dark:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M720-160v-120H600v-80h120v-120h80v120h120v80H800v120h-80Zm-600 40q-33 0-56.5-23.5T40-200v-560q0-33 23.5-56.5T120-840h560q33 0 56.5 23.5T760-760v200h-80v-80H120v440h520v80H120Zm0-600h560v-40H120v40Zm0 0v-40 40Z" /></svg>
                                </span>
                                <span className='grow'>Create Sheet</span>
                            </div>
                        </CreateSheetComponent>
                        {/* <CreateSheetComponent/> */}

                        {/* create room */}
                        {/*<CreateRoomComponent>
                            <div className='sidebar-item'>
                                <span className="material-icons">video_call</span>
                                <span className='grow'>Create Room</span>
                            </div>
                        </CreateRoomComponent>*/}

                        {/* join room */}
                        <JoinRoomComponent>
                            <div className='sidebar-item'>
                                <span className="text-black dark:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M500-482q29-32 44.5-73t15.5-85q0-44-15.5-85T500-798q60 8 100 53t40 105q0 60-40 105t-100 53Zm220 322v-120q0-36-16-68.5T662-406q51 18 94.5 46.5T800-280v120h-80Zm80-280v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Zm-480-40q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM0-160v-112q0-34 17.5-62.5T64-378q62-31 126-46.5T320-440q66 0 130 15.5T576-378q29 15 46.5 43.5T640-272v112H0Z" /></svg>
                                </span>
                                <span className='grow'>Join Room</span>
                            </div>
                        </JoinRoomComponent>

                        {/* darkmode toggle button*/}
                        {/* <li className='pt-[10px] px-[10px]'>
                            <Switcher11 />
                        </li> */}
                        <ul className="relative">
                            <li className="px-[10px] pt-[10px] absolute top-0 right-0">
                                <Switcher11 />
                            </li>
                        </ul>

                    </ul>

                    {/* PROFILE ITEMS  */}
                    {userData?.isGuest === true ? '' :
                        <ul className=' pt-[120px] '>
                            {/* NAME :- Profile  */}
                            <li className='text-xl text-[#333333] font-semibold  pl-6 pb-2 dark:text-[#EAEAEA] '>
                                Profile
                            </li>

                            {/* Account */}
                            <li>

                                {/* Account Button -> onclick dropdown come  
                          should be with email and username */}
                                <button onClick={() => (setOpenDropdown(!openDropdown))} className='sidebar-item  w-[90%] text-left  '>



                                    <span className="text-black dark:text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z" /></svg>
                                    </span>
                                    <span className="grow"> Account </span>
                                    <span className={` shrink-0 transition-transform duration-200 ease-in-out ${openDropdown ? 'rotate-180' : 'rotate-0'}   `}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" /></svg>
                                    </span>
                                </button>

                                {/* dropdown  */}

                                <ul
                                    className={`
                              
                                    grid  transition-all duration-300 ease-in-out 
                                    ${openDropdown ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] '}
                                `}
                                >
                                    <div className='overflow-hidden'>


                                        {/* change password */}
                                        <ChangePasswordDialog>
                                            <div className=' pl-[2em] sidebar-item '>
                                                <span className="text-black dark:text-white">
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm240-200q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z" /></svg>
                                                </span>

                                                <span>Change Password</span>
                                            </div>
                                        </ChangePasswordDialog>

                                        {/* update account details  */}
                                        <UpdateAccountDialog>
                                            <div className=' pl-[2em] sidebar-item'>
                                                <span className="text-black dark:text-white">
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" /></svg>
                                                </span>
                                                <span>Update Account Details</span>
                                            </div>
                                        </UpdateAccountDialog>
                                    </div>
                                </ul>

                            </li>

                        </ul>}
                </div>

                {/* LOGOUT  */}
                <div className='flex justify-center pb-10 '>
                    <Button onClick={() => (handleClientLogout())} disabled={loggingOutLoader} className="w-[70%] bg-[#FF7F00] hover:bg-[#e66f00] text-white font-semibold transition-colors duration-200">
                        {loggingOutLoader ? 'Logging Out...' : 'Logout'}
                    </Button>
                </div>

            </nav>

            {/* CONTENT  */}
            <main className='p-[min(30px,7%)] text-[#333333] scroll-smooth '>
                {/* for now writing only 
            for personal sheet as room sheets will 
            be same */}

                {/* container1 -> just for 'Dashboard' name */}
                <div className='text-4xl font-semibold dark:text-[#EAEAEA] py-4'>
                    {getGreeting()}, {userData?.username ?? 'Unknown'} 👋
                </div>



                {/* container2 -> just for 'Personal Sheets' name
            also might add search sheets later + also can 
            add refresh button  */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

                    {/* Toggle buttons */}
                    <div className="flex gap-2">
                        <button
                            className="px-4 py-2 rounded-md font-medium bg-[#FF7F00] text-white hover:bg-[#e66f00] transition-colors"
                        >
                            Personal Sheets
                        </button>
                        {/* <button
                            className="px-4 py-2 rounded-md font-medium border border-[#FF7F00] text-[#FF7F00] hover:bg-[#FF7F00] hover:text-white transition-colors"
                        >
                            Room Sheets
                        </button> */}
                    </div>

                    {/* Search and Refresh */}
                    <div className="flex items-center gap-2 ml-auto">
                        <DebouncedInput
                            type="text"
                            placeholder="Search sheets..."
                            className="px-3 py-2 border border-[#FF7F00] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF7F00] dark:bg-[#1A1A1A] dark:text-white"
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

                {/* container3 -> sheets -> break in grid 
            use auto fill for responsive*/}

                <div className="mt-6">
                    {/* Searching loader */}
                    {searchingLoader ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Searching...</p>
                    ) : null}

                    {/* Show search message if no sheets */}
                    {!searchingLoader && searchMessage ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{searchMessage}</p>
                    ) : null}

                    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(350px,1fr))]">
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
    )
}

export default DesktopSidebar
