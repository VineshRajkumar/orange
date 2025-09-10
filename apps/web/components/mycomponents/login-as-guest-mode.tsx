'use client'
import React, { useEffect, useState } from 'react'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { Button } from '../ui/button'
import { AlertCircle, Info } from 'lucide-react'
import { useAuthStore } from '@/store/Auth'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import PopupBanner from './popup-banner'
import { loginAsGuest } from '@/actions/loginGuest.action'

const LoginAsGuestButton = () => {

    const [guestLoader, setGuestLoader] = useState(false)
    const { login } = useAuthStore((state) => (state))
    const [error, setError] = useState<string>('')
    const [success, setSuccess] = useState<string>('')
    const [showpopup, setShowpopup] = useState(false)
    const [trialUsed, setTrialUsed] = useState(false)
    const router = useRouter()


    useEffect(() => {
        const used = localStorage.getItem("orange-board-guest-used") === "true"
        const bannerShown = localStorage.getItem("orange-board-guest-banner-shown") === "true"
        setTrialUsed(used)
        if (used && !bannerShown) {
            setShowpopup(true)
            localStorage.setItem("orange-board-guest-banner-shown", "true")
        }
    }, [])

    const handleloginAsGuest = async () => {


        loginAsGuest({ login, setGuestLoader, setSuccess, setError, type: 'notcanvas', router })

    };

    return (

        <div className="flex items-center gap-2">


            <AlertDialog >
                <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={trialUsed}>
                        {trialUsed ? (
                            'Free Trial Ended'
                        ) : (
                            <>
                                Try it out <span aria-hidden="true">→</span>
                            </>
                        )}
                    </Button>
                </AlertDialogTrigger>

                <AlertDialogContent >
                    <AlertDialogHeader>
                        <div className="flex items-center justify-center gap-2">
                            <Info className="h-5 w-5 text-orange-500" />
                            <AlertDialogTitle>Guest Mode Limitations</AlertDialogTitle>
                        </div>

                        <div className="w-full max-w-md p-2 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded text-sm text-center">
                            ⚠️ Our backend is hosted on a free server. The first request may take up to 50 seconds to respond. After that, you can use the app normally. If you return later, it may take 50 seconds again. We apologize for the delay — once the site grows, we’ll switch to a paid server. Please do not refresh and wait for the guest login to complete.
                        </div>
                        <AlertDialogDescription className="text-sm mt-2">
                            This is a temporary guest session and will automatically expire after <strong>2 hours</strong>.<br /><br />
                            You are allowed to create only <strong>one room sheet</strong>. However, you may still join rooms created by others using shared links.<br /><br />
                            Please note that features exclusive to registered users — such as personal sheet management, session persistence, and customization — will not be available.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Failed to Log in as Guest</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {(success) && (
                        <Alert variant='default' className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Redirecting To Dashboard...</AlertTitle>
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel className=" border border-orange-400 text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-500 dark:hover:bg-orange-900">
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            className="bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                            onClick={handleloginAsGuest}
                            disabled={guestLoader}
                        >
                            {guestLoader ? "Loading..." : "Continue as Guest"}
                        </Button>
                    </AlertDialogFooter>



                </AlertDialogContent>
                {/* <Toaster richColors position="top-center" className='relative top-0' /> */}
            </AlertDialog>
            {showpopup && <PopupBanner />}
        </div>

    )
}

export default LoginAsGuestButton