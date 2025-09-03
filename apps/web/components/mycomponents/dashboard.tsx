'use client'
import React from 'react'
import DesktopSidebar from './desktop-sidebar'
import MobileSidebar from './mobile-sidebar'
import { useIsMobile } from '@/hooks/use-mobile'

const Dashboard = () => {

    const isMobile = useIsMobile()
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
