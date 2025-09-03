import { guestType } from "@/types/guest.type";
import { userType } from "@/types/user.type";
import { useEffect } from "react";
import { toast } from "sonner";
import { handlelogout } from "@/actions/logout.action";
import { LogoutProps } from "@/types/responses.type";

interface Props extends LogoutProps {
    userData: userType | guestType | null
}

export const useSessionManager = ({userData,logout, router, setLoggingOutLoader, message='' }:Props) => { 


    useEffect(() => {

        if (!userData) return;

        const createdAt = userData.isGuest ? 
            userData.createdAt?.toString?.() : 
            userData.lastLoginAt?.toString?.();

        if (!createdAt) {
            console.error('createdAt is undefined');
            return
        }

        const expiry = userData.isGuest
            ? Number(process.env.NEXT_PUBLIC_GUEST_ACCESS_TOKEN_EXPIRY)
            : Number(process.env.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRY);

        if (!expiry) {
            const message = userData.isGuest ? 'GUEST_ACCESS_TOKEN_EXPIRY time not set in .env' : 'ACCESS_TOKEN_EXPIRY time not set in .env'
            console.error(message);
            return;
        }


        const createdTime = new Date(createdAt).getTime();
        const expiryInMs = expiry * 1000; //converting expiry to milliseconds from sec

        const now = Date.now();
        const remainingTime = createdTime + expiryInMs - now; //gives the remaining time for setimeout method

        const tenMinBefore = 10 * 60 * 1000; // 10 minutes in milliseconds
        const delay = remainingTime - tenMinBefore;
        let warningTimeout: ReturnType<typeof setTimeout> | null = null;

        //notification that session will expire in 10 min 
        if (delay > 0) {
            warningTimeout = setTimeout(() => {

                toast.info("Your Session is about to expire in 10 minutes.");

            },  delay);
        } else {
            toast.info("You have less than 10 minutes.");
        }

        // Logout 1 min before expiry -> as once jwt is expired then user will not be able to logout so logout before jwt expires -> cookies will be cleared in logout 
        //setting guest time as 2hrs 1min and setting user time as 1day 1min in .env
        //on first load os userData this timeout will be set and will logout one min before expiry time 

        const logoutMessage = userData.isGuest
            ? "Your temporary guest session has expired. Please sign in with a registered account to continue."
            : "Session has expired. Please log in again.";


        const timeout = setTimeout(() => {

            handlelogout({ logout, router, setLoggingOutLoader, message:logoutMessage })

        }, remainingTime - 60000);


        //clear on unmount 
        return () => {
            clearTimeout(timeout);
            if (warningTimeout) clearTimeout(warningTimeout);
        };

    }, [userData, logout, router, setLoggingOutLoader])
}