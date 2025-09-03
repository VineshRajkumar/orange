
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import React, { useState } from "react"
import { toast } from "sonner"
import { AxiosError, AxiosResponse } from "axios"
import axios from '@/lib/axios'
import { ApiResponse } from "@/types/responses.type"
import { ApiError } from "@repo/backend-common"
import { AlertCircle, Info } from "lucide-react"


export default function CreateSheetComponent({ children }: { children: React.ReactNode }) {
    const [title, setTitle] = useState("")
    const [createSheetLoader, setCreateSheetLoader] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [open, setOpen] = useState(false)



    const handleCreateSheet = async () => {
        if (!title.trim()) {
            setShowAlert(true)
            return
        }

        try {
            setCreateSheetLoader(true)
            const response = await axios.post('/sheets/make-sheet', { title }) as AxiosResponse
            const res = response.data as ApiResponse
            if (!res.data) {
                throw new Error('handleCreateSheet Error :: Failed to create new sheet')
            }
            toast.success(res.message)

        } catch (err) {

            const error = err as AxiosError

            if (error.response && error.response.data) {

                const data = error.response.data as ApiError;
                toast.error(data?.message || "An error occurred while fetching sheets.");

            } else {
                toast.error(error.message || "Unexpected error occurred.");
            }
        }
        finally {
            setCreateSheetLoader(false)
        }

        setTitle("")
        setShowAlert(false)
        setOpen(false) //to close the dialog box only if sheet gets created -> this is trying to keep the dialog box open so that alert is also visible
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>

                {children}
            </AlertDialogTrigger>



            <AlertDialogContent className="">
                <AlertDialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertDialogTitle >
                            Create New Sheet
                        </AlertDialogTitle>
                        <TooltipProvider >
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <Info className="h-4 w-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side='top' className="max-w-sm p-2">
                                    <div className="text-sm leading-snug">
                                        <strong>Note:</strong>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li>You can draw, save, and start collaborative sessions on any sheet.</li>
                                            <li>Guests can save only <em>one sheet</em>. After that, all work goes to their personal copy.</li>
                                            <li>If you own the sheet, all changes (before/after session) stay on the same sheet. Otherwise, saving creates your own duplicate.</li>
                                            <li>Guests who save once in a session cannot save again in the room sheet.</li>
                                            <li>Personal sheets have no limit—you can run as many sessions as you want.</li>
                                            <li>You can only join one room at a time. Joining another will remove you from the current one.</li>
                                        </ul>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <AlertDialogDescription >
                        Give your sheet a title and get started!
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <Input
                    placeholder="Enter sheet title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-orange-300 focus:ring-orange-500 focus:border-orange-500 dark:border-orange-600 dark:bg-black dark:text-white"
                />

                {showAlert && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Sheet title is required.</AlertTitle>
                        <AlertDescription>Please enter a name for your new sheet.</AlertDescription>
                    </Alert>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border border-orange-400 text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-500 dark:hover:bg-orange-900">
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        onClick={handleCreateSheet}
                        disabled={createSheetLoader}
                        className="bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                    >
                        {createSheetLoader ? 'Creating New Sheet...' : 'Create'}
                    </Button>
                </AlertDialogFooter>

            </AlertDialogContent>

        </AlertDialog>
    )
}

