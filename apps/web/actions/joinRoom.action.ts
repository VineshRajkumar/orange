import { ApiResponse, JoinRoomResponse } from "@/types/responses.type";
import { ApiError } from "@repo/backend-common";
import { AxiosError, AxiosResponse } from "axios";
import axios from "@/lib/axios";
import { SheetDataType } from "@/types/sheet.type";
import { toast } from "sonner";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";


interface JoinRoomProps {
    url:string
    setAlertMessage?: (value: React.SetStateAction<string>) => void
    setShowAlert?: (value: React.SetStateAction<boolean>) => void
    setJoinRoomLoader?: (value: React.SetStateAction<boolean>) => void
    saveSheet: (id: string, sheet: SheetDataType) => void;
    updateRoomId: (roomId: string) => void
    setUrl?: (value: React.SetStateAction<string>) => void
    setOpen?: (value: React.SetStateAction<boolean>) => void
    router?: AppRouterInstance
    type: 'userFromLink' | 'userFromDashboard'
    message?: string;
    
}

export const joinToRoom = async ({url,setAlertMessage,setShowAlert,setJoinRoomLoader,saveSheet,updateRoomId,setUrl,setOpen,router,type,message}:JoinRoomProps) => {

    try {
        // Extract IDs from the URL
        const cleanedUrl = url.trim(); //to remove extra spaces
        const match = cleanedUrl.match(/\/canvas\/myroom\/([^\/]+)\/([^\/]+)/);
        if (!match || match.length < 3) {

            if(type==='userFromLink') toast.error("Invalid room link format")
            else {
                setAlertMessage?.("Invalid room link format.");
                setShowAlert?.(true);
            }
            
            return;
        }

        
        const sheetId = match[1];
        const roomId = match[2];

        if( setJoinRoomLoader ) setJoinRoomLoader(true);

        const response = await axios.post(`/rooms/join-room/room/${roomId}/sheet/${sheetId}`) as AxiosResponse;

        const res = response.data as ApiResponse;
        if (!res.data) {
            throw new Error("JoinRoom Error :: Failed to join room");
        }


        const data = res.data as JoinRoomResponse

        const { id: dbsheetId, ...sheetData } = data.sheet
        const dbroomId = data.roomId

        saveSheet(dbsheetId, sheetData)
        if (roomId) updateRoomId(dbroomId)

        toast.success(res.message)

        if(type === 'userFromDashboard'){
            setUrl?.("");
            setShowAlert?.(false);
            setOpen?.(false);

            setTimeout(() => {
                router?.push(`/canvas/myroom/${sheetId}/${roomId}`);
            }, 2500);
        }
        

    } catch (err) {
        const error = err as AxiosError;

        if (error.response && error.response.data) {
            const data = error.response.data as ApiError;
            // console.log(data)
            if(type==='userFromLink') toast.error(data?.message || "An error occurred while joining room.")
            else setAlertMessage?.(data?.message || "An error occurred while joining room.");

        } else {

            if(type==='userFromLink') toast.error(error.message || "Unexpected error occurred.")
            else setAlertMessage?.(error.message || "Unexpected error occurred.");
        }
        
        if(type === 'userFromDashboard') setShowAlert?.(true);

    } finally {
        if( setJoinRoomLoader ) setJoinRoomLoader(false);
    }
}