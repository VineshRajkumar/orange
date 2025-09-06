import { ApiResponse } from "@/types/responses.type";
import { AxiosError, AxiosResponse } from "axios";
import axios from '@/lib/axios'
import { guestType } from "@/types/guest.type";
import { ApiError } from "@repo/backend-common";
import { toast } from "sonner";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { startTransition } from "react";

interface LoginGuestProps {
    login: (data: guestType) => void; //zustand login
    setGuestLoader?: (state: boolean) => void;
    setSuccess?: React.Dispatch<React.SetStateAction<string>>
    setError?: React.Dispatch<React.SetStateAction<string>>
    type: 'canvas' | 'notcanvas'
    message?: string;
    router: AppRouterInstance;
}

export const loginAsGuest = async({login,setGuestLoader,setSuccess, setError,type,message,router}:LoginGuestProps) => {

    try {
        if(setGuestLoader) setGuestLoader(true);

        await new Promise((resolve) => setTimeout(resolve, 10000));

        const response = await axios.post("/users/login-guest") as AxiosResponse;

        const res = response.data as ApiResponse;

        if (!res.success || !res.data) {
            throw new Error("handleloginAsGuest Error :: Failed to login guest");
        }


        if (typeof res.data === "string") {
            throw new Error("handleloginAsGuest Error :: Invalid data");
        }

        // console.log(res)

        const guestData = (res.data as { user: guestType }).user;

        if (!guestData) {
            throw new Error("guest data not received")
        }

        login(guestData)
        localStorage.setItem("orange-board-guest-used", "true")  //if guest used his free trial dont let guest use it agin send to register

        if(type === 'canvas'){
            toast.success(res.message)
        }
        else {
            setSuccess?.(res.message) 

            startTransition(() => {
                // setTimeout(() => router.push('/dashboard'), 1000);
                setTimeout(() => router.replace('/dashboard'), 1000);
            })
        }
        // toast.success(res.message)

        

    } catch (err) {

        const error = err as AxiosError;
        if (error.response && error.response.data) {
            const data = error.response.data as ApiError;
            // console.log(data)
            if(type === 'canvas'){
                toast.error(data.message || "An error occurred while login as guest.")
            }
            else {
                setError?.(data.message || "An error occurred while login as guest.")
            }
            

        } else {
            if(type === 'canvas'){
                toast.error(error.message || "Unexpected error occurred.");
            }
            else {
                setError?.(error.message || "Unexpected error occurred.")
            }
        }

    } finally {
        if(setGuestLoader) setGuestLoader(false);
    }

}