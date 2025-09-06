import { useEffect } from "react";
import axios from "@/lib/axios";
import { useAuthStore } from "@/store/Auth";
import { toast } from "sonner";
import { AxiosError, AxiosResponse } from "axios";
import { ApiResponse } from "@/types/responses.type";
import { ApiError } from "@repo/backend-common";
import { useRouter } from "next/navigation";

export function useAuthValidator(type:'canvas'|'notcanvas') {

  const logout = useAuthStore((state) => state.logout);
  const router = useRouter()

  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;


    const checkAuth = async () => {
      try {
        // wait 5 seconds before sending request -> what if his browser was capable but and he logged in through link and this hook check so fast that he got logged out
        // hit backend to check if session cookie is valid
        // if res.success is false or if data not received then throw error that Login session expired or cookies not set and clear data from zustand 
        // if loggedin user only then no issue continue 
        
        if(type === 'canvas') await new Promise((resolve) => setTimeout(resolve, 14000));
        else await new Promise((resolve) => setTimeout(resolve, 3000));

        const response = await axios.get("/users/current-user") as AxiosResponse
        const res = response.data as ApiResponse
        if (!res.data || res.success === false ) {
          throw new Error('Your browser is blocking cookies. Please allow cookies or switch to a normal browser window.')
        }

      } catch (err) {
        logout() //clear from zustand

        const error = err as AxiosError;
        if (error.response && error.response.data) {
            const data = error.response.data as ApiError;
            // console.log(data)
            toast.error(data.message || "An error occurred while checking auth");
        } else {
            toast.error(error.message || "Unexpected error occurred.");
        }
        
        redirectTimer = setTimeout(() => router.replace('/'), 1500);

      }
    };

    checkAuth();

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };

  }, [logout,router]);
}
