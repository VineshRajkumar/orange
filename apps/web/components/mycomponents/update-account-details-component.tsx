
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel
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
import { useAuthStore } from "@/store/Auth";
import { userType } from "@/types/user.type";
import { updateAccountDetailsErrMsg } from "@/types/responses.type";



export default function UpdateAccountDialog({
    children,
    initialUsername = "",
    initialEmail = "",
}: {
    children: React.ReactNode;
    initialUsername?: string;
    initialEmail?: string;
}) {
    const [username, setUsername] = useState(initialUsername);
    const [email, setEmail] = useState(initialEmail);
    const [open, setOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>[] | string[]>([])
    const [showAlert, setShowAlert] = useState(false);
    const [loading, setLoading] = useState(false);
   
    //will not actually use for login -> will use to update the new details changes of user
    const login  = useAuthStore((state) => (state.login))


    const handleUpdateAccount = async () => {
        if (!username.trim() || !email.trim()) {
            setShowAlert(true);
            return;
        }

        try {
            setLoading(true);

            const response = await axios.patch("/users/update-account", {
                username,
                email,
            });

            const res = response.data as ApiResponse;

            if (!res.success) {
                throw new Error("UpdateAccount Error :: Failed to update account");
            }

            const userdata = res.data as userType
            login(userdata)

            toast.success(res.message);
            setOpen(false);
            setShowAlert(false);
            setErrors([]);
           
        } catch (err) {
            const error = err as AxiosError;
            if (error.response && error.response.data) {
                const data = error.response.data as ApiError;
                // console.log(data)
                if (data.errors?.length) {
                    setErrors(data.errors);
                    return;
                }
                toast.error(data.message || "An error occurred while updating account.");
            } else {
                toast.error(error.message || "Unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Update Account Details</AlertDialogTitle>
                    <AlertDialogDescription>
                        Change your account username and email here.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        setErrors([]);
                        setShowAlert(false);
                    }}
                    className="border-orange-300 focus:ring-orange-500 focus:border-orange-500 dark:border-orange-600 dark:bg-black dark:text-white mt-2"
                />
                {errors?.map((msg: updateAccountDetailsErrMsg, index) =>
                    msg.username ? (
                        <Alert key={`username-${index}`} variant="destructive" className="mt-3">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Username Error</AlertTitle>
                            <AlertDescription>{msg.username}</AlertDescription>
                        </Alert>
                    ) : null
                )}

                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors([]);
                        setShowAlert(false);
                    }}
                    className="border-orange-300 focus:ring-orange-500 focus:border-orange-500 dark:border-orange-600 dark:bg-black dark:text-white mt-2"
                />
                {errors?.map((msg: updateAccountDetailsErrMsg, index) =>
                    msg.email ? (
                        <Alert key={`email-${index}`} variant="destructive" className="mt-3">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Email Error</AlertTitle>
                            <AlertDescription>{msg.email}</AlertDescription>
                        </Alert>
                    ) : null
                )}

                {showAlert && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Both fields are required.</AlertTitle>
                        <AlertDescription>Please fill out both fields.</AlertDescription>
                    </Alert>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border border-orange-400 text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-500 dark:hover:bg-orange-900">
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        onClick={handleUpdateAccount}
                        disabled={loading}
                        className="bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                    >
                        {loading ? "Updating..." : "Update Account"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
