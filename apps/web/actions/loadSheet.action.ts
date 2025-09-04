import { AxiosError, AxiosResponse } from "axios";
import axios from '@/lib/axios'
import { ApiResponse } from "@/types/responses.type";
import { SheetDataType, SheetWithId } from "@/types/sheet.type";
import { toast } from "sonner";
import { ApiError } from "@repo/backend-common";

interface LoadSheetProps {
    sheetId: string
    setLoadSheetLoader?: (state: boolean) => void;
    saveSheet: (id: string, sheet: SheetDataType) => void;
    message?: string;
    
}

export const loadSheetWithSheetId = async ({sheetId,setLoadSheetLoader,saveSheet,message}:LoadSheetProps) => {

    try {
        if(setLoadSheetLoader) setLoadSheetLoader(true)
        // console.log('sheetid from loadSheetWithSheetId',sheetId)
        const response = await axios.get(`/sheets/load-sheet/s/${sheetId}`) as AxiosResponse
        const res = response.data as ApiResponse
        if (res.success === false) {
            throw new Error('loadSheetWithSheetId Error :: Sheet not loaded')
        }
        const sheet = res?.data as SheetWithId
        // console.log(sheet)
        //extracting id and data
        const {id, ...sheetDataReceived} = sheet

        //save sheet in zustand along with others
        saveSheet(id,sheetDataReceived)

        toast.success(res.message)

    } catch (err) {

        const error = err as AxiosError

        if (error.response && error.response.data) {

            const data = error.response.data as ApiError;
            // console.log(data)
            toast.error(data?.message || "An error occurred while fetching sheets.");

        } else {
            toast.error(error.message || "Unexpected error occurred.");
        }

    } finally {
        if(setLoadSheetLoader) setLoadSheetLoader(false)
    }
}