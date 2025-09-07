import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import { useSheetStore } from "@/store/Sheets";
import { joinToRoom } from "@/actions/joinRoom.action";
import { InfoTooltip } from "./info-tooltip";

const JoinRoomComponent = ({ children }: { children: React.ReactNode }) => {
    const [url, setUrl] = useState("");
    const [joinRoomLoader, setJoinRoomLoader] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [open, setOpen] = useState(false);
    const saveSheet = useSheetStore((state) => (state.saveSheet))
    const updateRoomId = useAuthStore((state) => state.updateRoomId);
    const [alertMessage, setAlertMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
        const pendingLink = localStorage.getItem("pendingJoinLink");
        if (pendingLink) {
            setUrl(pendingLink);
            setOpen(true); // auto-open modal if pendingLink was set -> then that means that user joins from link so redirect him to dashbaord and open model with the link and let the user click join
            localStorage.removeItem("pendingJoinLink");
        }
    }, []);

    const joinRoom = async () => {
        if (!url.trim()) {
            setAlertMessage("Room link is required.");
            setShowAlert(true);
            return;
        }


        joinToRoom({ url, setAlertMessage, setShowAlert, setJoinRoomLoader, saveSheet, updateRoomId, setUrl, setOpen, router, type: 'userFromDashboard' })

    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertDialogTitle>Join Room</AlertDialogTitle>

                        <InfoTooltip
                            content={
                                <p className="text-sm leading-snug">
                                    <strong>Note:</strong> Paste the link you received for the collaborative
                                    session. Once joined, you will be able to draw with others in real-time.
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
                    <AlertDialogDescription>
                        Enter the full room link to join an existing session.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <Input
                    placeholder={`Enter room link, e.g. ${process.env.NEXT_PUBLIC_BASE_URL}/canvas/roomId/sheetId`}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="border-orange-300 focus:ring-orange-500 focus:border-orange-500 dark:border-orange-600 dark:bg-black dark:text-white"
                />

                {showAlert && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{alertMessage}</AlertDescription>
                    </Alert>
                )}


                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border border-orange-400 text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-500 dark:hover:bg-orange-900">
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        onClick={joinRoom}
                        disabled={joinRoomLoader}
                        className="bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                    >
                        {joinRoomLoader ? "Joining Room..." : "Join"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default JoinRoomComponent;
