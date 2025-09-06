import { ApiResponse } from "@/types/responses.type";
import { ApiError } from "@repo/backend-common";
import { AxiosError, AxiosResponse } from "axios";
import { toast } from "sonner";
import axios from '@/lib/axios'
import { LogoutProps } from "@/types/responses.type";

export const handlelogout = async ({logout, router, setLoggingOutLoader, message = ''}:LogoutProps) => {

    try {
        setLoggingOutLoader(true);

        const response = await axios.post("/users/logout") as AxiosResponse;

        const res = response.data as ApiResponse;

        if (!res.success) {
            throw new Error("handlelogout Error :: Failed to logout user/guest");
        }

        // console.log(res)

        logout() //update in zustand 

        if (message && message !== '') toast.info(message)
        else toast.success(res.message)

        // setTimeout(() => router.push('/login'), 5000);
        setTimeout(() => router.replace('/login'), 5000);

    } catch (err) {

        const error = err as AxiosError;
        if (error.response && error.response.data) {
            const data = error.response.data as ApiError;
            // console.log(data)
            toast.error(data.message || "An error occurred while logging out");
        } else {
            toast.error(error.message || "Unexpected error occurred.");
        }

    } finally {
        setLoggingOutLoader(false);
    }


}