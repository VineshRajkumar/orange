'use client'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { Button } from '../ui/button'
import { useAuthStore } from '@/store/Auth'
import { useRouter } from 'next/navigation'

const LeftFullNavbar = () => {

    const { status, logout } = useAuthStore((state) => (state))
    const router = useRouter()

    useEffect(() => {
        if (status === true) {
            // router.push('/dashboard')
            router.replace('/dashboard')
        }
    }, [status, router])

    const handlelogout = () => {
        logout()
    }

    return (
        <div>
            {status === true ?
                (
                    <div>
                        <Link href="/login">
                            <Button
                                onClick={() => (handlelogout)}
                                variant="outline"
                                className="h-8 px-3 text-xs font-medium"
                            >
                                Log out
                            </Button>
                        </Link>
                    </div>
                ) :
                (
                    <div className='flex gap-2'>
                        <Link href="/login">
                            <Button
                                variant="outline"
                                className="h-8 px-3 text-xs font-medium"
                            >
                                Log in
                            </Button>
                        </Link>

                        <Link href="/signup">
                            <Button
                                variant="default"
                                className="h-8 px-3 text-xs font-medium bg-orange-500 hover:bg-orange-600 text-black"
                            >
                                Create an Account
                            </Button>
                        </Link>

                    </div>

                )
            }


        </div>
    )
}

export default LeftFullNavbar
