import { guestType } from "@/types/guest.type";
import { userType } from "@/types/user.type";
import { create } from "zustand";
import { persist } from "zustand/middleware";


type AuthStore = {
  status: 'loading' | true | false;
  userData: userType | guestType | null;
  login: (data: userType | guestType) => void;
  logout: () => void;
  updateRoomId: (roomId: string) => void;
};

//persist is used to revent any changes when the page is constantly refreshed -> so that if user is logged in it will save its data 
//Note :- persist stores data in localstore so dont store cookies or sentive info

export const useAuthStore = create(
  persist<AuthStore>(
    (set) => ({
      status: 'loading',
      userData: null,

      login: (data : userType | guestType ) => {
        set({
          status: true,
          userData: data,
        });
      },
      logout: () => {
        set({
          status: false,
          userData: null,
        });
      },

      updateRoomId: (roomId: string) => {
        set((state) => ({
          userData: state.userData ? { ...state.userData, roomId } : null
        }))
      }
    }),
    {
      name: "userLoginStatus", //name of localstorage 
      skipHydration: false
    }
  )
);
