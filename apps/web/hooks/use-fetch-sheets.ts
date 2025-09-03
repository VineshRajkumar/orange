import { ApiResponse } from "@/types/responses.type";
import { loadDataType, SheetWithId, SheetDataType } from "@/types/sheet.type";
import { ApiError } from "@repo/backend-common";
import { AxiosError, AxiosResponse } from "axios";
import { useEffect } from "react"
import { toast } from "sonner";
import axios from '@/lib/axios'

interface Props {
    setLoading: (state: boolean) => void;
    switchLoader: boolean;
    saveSheets: (sheets: Record<string, SheetDataType>) => void
}

export const useFetchSheetsHook = ({setLoading,switchLoader,saveSheets}:Props) => {

    useEffect(() => {

        const fetchSheets = async () => {
            setLoading(true)
            try {
                const response = await axios.get('/sheets/load-sheets') as AxiosResponse
                const res = response.data as ApiResponse
                // console.log(res)
                if (!res.data) {
                    throw new Error('fetchSheets Error :: Failed to fetch sheets')
                }
                const loadData = res.data as loadDataType
                const sheets = loadData.sheets as SheetWithId[]

                //extracting id and making it like id:{}
                const sheetMap: Record<string, SheetDataType> = sheets.reduce((acc, { id, ...rest }) => {
                    acc[id] = rest;
                    return acc;
                }, {} as Record<string, SheetDataType>);

                //saving all sheets in zustand store -> no need to call api again and again
                saveSheets(sheetMap)

                toast.success(res.message)
                // console.log(sheets)

            } catch (err) {

                const error = err as AxiosError

                if (error.response && error.response.data) {

                    const data = error.response.data as ApiError;
                    toast.error(data?.message || "An error occurred while fetching sheets.");

                } else {
                    toast.error(error.message || "Unexpected error occurred.");
                }

            } finally {
                setLoading(false)
            }
        }

        fetchSheets()
        // Simulate loading time
        // const timer = setTimeout(() => setLoading(false), 1500)
        // return () => clearTimeout(timer)
    }, [saveSheets,setLoading,switchLoader])
}