'use client'
import React from 'react'
import DesktopSidebar from './desktop-sidebar'
import MobileSidebar from './mobile-sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuthValidator } from '@/hooks/use-auth-validator'

const Dashboard = () => {

    const isMobile = useIsMobile()
    //-------------------------------------
    //Custom hook to check if browser supports cookie storage if not then after 5sec this will log him out -> login not allowed by incognito 
    useAuthValidator()

    return (

        <div>
            {isMobile ? (
                <MobileSidebar />
            ) : (
                <DesktopSidebar />
            )}
        </div>

    )
}

export default Dashboard
