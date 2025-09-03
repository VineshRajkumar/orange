//asyncHandler is used to create a method and export that method so that we donot need to create it again and again
//it is like a wrapper


import { AuthedSocket } from "../types/auth.type";
import { ApiError, draw_elementsType } from "@repo/backend-common"



type WsHandler = (ws: AuthedSocket, data: draw_elementsType) => Promise<void>;

const wsAsyncHandler = (fn: WsHandler) => {
  return async (ws: AuthedSocket , data: draw_elementsType) => {
    try {
      // console.log("wsAsyncHandler",ws)
      await fn(ws, data);
      
    } catch (error: any) {
        const err = error as ApiError;
        const errmessage = {
            statusCode: err.statusCode ,
            success: false,
            message: err?.message || "WebSocket Internal Error",
            name: err?.name || "UnknownError",
            stack: err?.stack || "",
            data: err?.data || null,
            errors: err?.errors || []
        }

        // console.log(ws)
        // console.log(errmessage)

        ws.close(err.statusCode||1011 , JSON.stringify({sucess:errmessage.success,message:errmessage.message}))

      // Send error to client as JSON
      // ws.send(JSON.stringify({ type: "ERROR", ...errmessage }));
    }
  };
};

export { wsAsyncHandler };