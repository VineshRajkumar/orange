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
import axios from '@/lib/axios'
import { ApiResponse, CreateRoomSheetResponse } from "@/types/responses.type"
import { ApiError } from "@repo/backend-common"
import { AxiosError, AxiosResponse } from "axios"
import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import { toast } from "sonner"
import { useSheetStore } from "@/store/Sheets"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/Auth"
import { InfoTooltip } from "./info-tooltip"

const CreateRoomComponent = ({ children }: { children: React.ReactNode }) => {

    const [title, setTitle] = useState("")
    const [createSheetLoader, setCreateSheetLoader] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [open, setOpen] = useState(false)
    const saveSheet = useSheetStore((state) => (state.saveSheet))
    const updateRoomId = useAuthStore((state) => (state.updateRoomId))
    const router = useRouter()



    const handleCreateRoomSheet = async () => {
        if (!title.trim()) {
            setShowAlert(true)
            return
        }

        try {
            setCreateSheetLoader(true)
            const response = await axios.post('/rooms/create-room-id', { type: "create-room", title }) as AxiosResponse
            const res = response.data as ApiResponse
            if (!res.data || typeof (res.data) === 'string') {
                throw new Error('handleCreateRoomSheet Error :: Failed to create new room sheet')
            }

            const data = res.data as CreateRoomSheetResponse

            const { id: sheetId, ...sheetData } = data.newRoomSheetCreated
            const roomId = data.saveRoomId.roomId

            saveSheet(sheetId, sheetData)
            if (roomId) updateRoomId(roomId)
            toast.success(res.message)

            setTimeout(() => {
                // router.push(`/canvas/myroom/${sheetId}/${roomId}`)
                router.replace(`/canvas/myroom/${sheetId}/${roomId}`)
            }, 2500)

        } catch (err) {

            const error = err as AxiosError

            if (error.response && error.response.data) {

                const data = error.response.data as ApiError;
                toast.error(data?.message || "An error occurred while creating room.");

            } else {
                toast.error(error.message || "Unexpected error occurred.");
            }

            setCreateSheetLoader(false)
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
                        <AlertDialogTitle>
                            Create New Room
                        </AlertDialogTitle>

                        <InfoTooltip
                            content={
                                <p className="text-sm leading-snug">
                                    <strong>Note:</strong> After leaving the room, the sheet will be saved as a
                                    <em> personal sheet</em>. You will be able to work on it individually, but the original
                                    room session will not restart on that sheet. A new room will be required for any
                                    future collaborative session. The last person to save the sheet will have their
                                    drawing visible on everyones dashboard, after which each person can continue their
                                    own work independently.
                                </p>
                            }
                        >
                            <button
                                type="button"
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <Info className="h-4 w-4" />
                            </button>
                        </InfoTooltip>

                    </div>
                    <AlertDialogDescription >
                        Give your room sheet a title and get started!
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
                        <AlertTitle>Room Sheet title is required.</AlertTitle>
                        <AlertDescription>Please enter a name for your new room sheet.</AlertDescription>
                    </Alert>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border border-orange-400 text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-500 dark:hover:bg-orange-900">
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        onClick={handleCreateRoomSheet}
                        disabled={createSheetLoader}
                        className="bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                    >
                        {createSheetLoader ? 'Joining Room...' : 'Create'}
                    </Button>
                </AlertDialogFooter>

            </AlertDialogContent>

        </AlertDialog>
    )
}

export default CreateRoomComponent