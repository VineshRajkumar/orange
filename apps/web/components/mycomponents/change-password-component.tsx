
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiError } from "@repo/backend-common";
import { ApiResponse } from "@/types/responses.type";
import { changePasswordErroMsg } from "@/types/responses.type";


export default function ChangePasswordDialog({ children }: { children: React.ReactNode }) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [changeLoader, setChangeLoader] = useState(false);
    const [open, setOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>[] | string[]>([])

    const handleChangePassword = async () => {
        if (!oldPassword.trim() || !newPassword.trim()) {
            setShowAlert(true);
            return;
        }

        try {
            setChangeLoader(true);

            const response = await axios.post("/users/change-password", {
                oldpassword: oldPassword,
                newpassword: newPassword
            });

            const res = response.data as ApiResponse;

            if (!res.success) {
                throw new Error("handleChangePassword Error :: Failed to change password");
            }

            toast.success(res.message);

            // Reset fields
            setOldPassword("");
            setNewPassword("");
            setShowAlert(false);
            setOpen(false);
        } catch (err) {
            const error = err as AxiosError;
            if (error.response && error.response.data) {
                const data = error.response.data as ApiError;
                // console.log(data)
                if (data.errors?.length) {
                    
                    setErrors(data.errors);
                    return;
                }
                else toast.error(data.message || "An error occurred while changing password.");
            } else {
                toast.error(error.message || "Unexpected error occurred.");
            }
        } finally {
            setChangeLoader(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Change Password</AlertDialogTitle>
                    <AlertDialogDescription>
                        Enter your current password and the new password you want to set.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <Input
                    type="password"
                    placeholder="Current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="border-orange-300 focus:ring-orange-500 focus:border-orange-500 dark:border-orange-600 dark:bg-black dark:text-white mt-2"
                />
                {errors?.map((msg: changePasswordErroMsg, index) =>
                    msg.oldpassword ? (
                        <Alert key={`oldpassword-${index}`} variant="destructive" className="mt-3">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Old Password Error</AlertTitle>
                            <AlertDescription>{msg.oldpassword}</AlertDescription>
                        </Alert>
                    ) : null
                )}
                <Input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-orange-300 focus:ring-orange-500 focus:border-orange-500 dark:border-orange-600 dark:bg-black dark:text-white mt-2"
                />
                {errors?.map((msg:changePasswordErroMsg, index) =>
                    msg.newpassword ? (
                        <Alert key={`newpassword-${index}`} variant="destructive" className="mt-3">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>New Password Error</AlertTitle>
                            <AlertDescription>{msg.newpassword}</AlertDescription>
                        </Alert>
                    ) : null
                )}

                {showAlert && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Both fields are required.</AlertTitle>
                        <AlertDescription>Please fill out both password fields.</AlertDescription>
                    </Alert>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border border-orange-400 text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-500 dark:hover:bg-orange-900">
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        onClick={handleChangePassword}
                        disabled={changeLoader}
                        className="bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                    >
                        {changeLoader ? "Updating..." : "Change Password"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
