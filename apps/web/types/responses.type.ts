import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { guestType } from "./guest.type"
import { SheetWithId } from "./sheet.type"

//used in signup
export type errormsg = {
  username?: string,
  email?: string,
  password?: string
}

//used in login
export type loginErrorMsg = {
  email?: string,
  password?: string
}

export type changePasswordErroMsg = {
    oldpassword?: string
    newpassword?: string
}


export type updateAccountDetailsErrMsg = {
    username?: string;
    email?: string;
};

export interface CreateRoomSheetResponse {
    newRoomSheetCreated: SheetWithId
    saveRoomId: guestType
}

export type CreateRoomSheetSessionResponse = Omit<CreateRoomSheetResponse, "newRoomSheetCreated">;

export interface JoinRoomResponse {
    roomId: string
    sheet: SheetWithId
    updatedUser: guestType
}

export interface LogoutProps {
    logout: () => void; //zustand logout
    router: AppRouterInstance;
    setLoggingOutLoader: (state: boolean) => void;
    message?: string;
}

export interface ApiResponse {
    statusCode: number
    data?: string | object
    message: string
    success: boolean
}

