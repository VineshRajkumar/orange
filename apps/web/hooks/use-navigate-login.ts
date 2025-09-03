import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useEffect } from "react";


export const useNavigateToLogin = ({status, router}:{status:boolean | "loading" ,  router: AppRouterInstance}) => {
    useEffect(() => {
        if (status === false) {
            setTimeout(() => router.push('/login'), 2500);
        }
    }, [status, router])
}