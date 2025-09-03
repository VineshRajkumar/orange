import * as React from "react"
import { useDebounceCallback } from 'usehooks-ts'
import axios from '@/lib/axios'
import { cn } from "@/lib/utils"
import { AxiosError } from "axios";
import { ApiError } from "@repo/backend-common";
import { ApiResponse } from "@/types/responses.type";
import { useSheetStore } from "@/store/Sheets";
import { SheetWithId } from "@/types/sheet.type";
import { SheetDataType } from "@/types/sheet.type";

type DebouncedInputProps = React.ComponentProps<"input"> & {
    setSearchingLoader: (loading: boolean) => void;
    setsearchMessage: (text: string) => void;
};

function DebouncedInput({ className, type, setSearchingLoader, setsearchMessage, ...props }: DebouncedInputProps) {

    const [searchValue, setSearchValue] = React.useState('')
    // const [searchMessage, setsearchMessage] = React.useState('')
    const debounced = useDebounceCallback(setSearchValue, 300)
    const saveSheets  = useSheetStore((state) => (state.saveSheets))

    React.useEffect(() => {

        const findSheets = async () => {

            if (searchValue) {
                setSearchingLoader(true)
                setsearchMessage('')
            }

            try {
                const response = await axios.get(`/sheets/search-sheet?title=${searchValue}`)
                const res = response.data as ApiResponse
                // console.log(res.data)
                if (res.data === null || !res.data || res.data === 'undefined' || Object.values(res.data).length === 0 ) {
                    saveSheets({})
                    throw new Error('No Sheets Found')
                }

                const sheets = res.data as SheetWithId[]

                //extracting id and making it like id:{}
                const sheetMap: Record<string, SheetDataType> = sheets.reduce((acc, { id, ...rest }) => {
                    acc[id] = rest;
                    return acc;
                }, {} as Record<string, SheetDataType>);

                //updating the state in zustand 
                saveSheets(sheetMap)

                // setsearchMessage(`Found ${Object.keys(sheetData).length} sheet${Object.keys(sheetData).length > 1 ? 's' : ''}`)

            } catch (err) {

                const error = err as AxiosError

                if (error.response && error.response.data) {

                    const data = error.response.data as ApiError;
                    setsearchMessage(data?.message)
                    // toast.error(data?.message || "An error occurred while fetching sheets.");

                } else {
                    setsearchMessage(error.message || 'No Sheets Found')
                    // toast.error(error.message || "Unexpected error occurred.");
                }

            }
            finally {
                setSearchingLoader(false)
            }
        }

        findSheets()

    }, [searchValue, setSearchingLoader,saveSheets,setsearchMessage])


    return (
        <input
            type={type}
            data-slot="input"
            onChange={(e) => { debounced(e.target.value) }}
            className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                className
            )}
            {...props}
        />
    )
}

export { DebouncedInput }