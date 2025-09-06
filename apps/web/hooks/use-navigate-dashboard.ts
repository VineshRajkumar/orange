import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useEffect } from "react";


export const useNavigateToDashboard = ({status, router}:{status:boolean | "loading" ,  router: AppRouterInstance}) => {
    useEffect(() => {
        if (status === true) {
            // router.push('/dashboard')
            router.replace('/dashboard')
        }
    }, [status, router])
}