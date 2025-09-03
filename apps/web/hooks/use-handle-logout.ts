import { useCallback } from "react";
import { handlelogout} from "@/actions/logout.action";
import { LogoutProps } from "@/types/responses.type";

export const useHandleLogout = ({
  logout,
  router,
  setLoggingOutLoader,
  message,
}: LogoutProps) => {


  return useCallback(() => {

    handlelogout({ logout, router, setLoggingOutLoader, message });

  }, [logout, router, setLoggingOutLoader, message]);

};
