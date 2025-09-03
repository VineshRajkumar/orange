import { ApiError, verifyAccessToken } from '@repo/backend-common';
import { IncomingMessage } from 'http'
import { prisma } from '@repo/db';
import { AuthedSocket } from '../types/auth.type';
import { roomManager } from '../utils/roomManager';
import { ApiResponse } from '../utils/ApiResponse';
import { HIGH_ALERT_CODES } from '../connection';

//Token will be recevied like -> `ws://localhost:8080?accessToken=${accessToken}`

//verification and joining the room 
export const verifyAuth = async( ws: AuthedSocket , req: IncomingMessage ) => {
    //Steps :- 
    //1) call the verifyAccessToken function with the token -> token will be verified and decoded token will be given -> if token was tampered then error will be given in the function 
    //2) take the id from decodedtoken call the database to get users -> id,username,roomid,createdAt,updatedAt,lastLoginAt -> if not recevied give error 
    //3) save the user details in ws.user state  
    //4) Before joining room cleanup the socket if it was alredy present in some other room  
    //4) take the roomid from it add the websocket to that room in websocket state and start websocket connection 
    //5) return saved user details and socket and roomid -> `Verified token and joined room ${roomId}`


    try {
      
        const url = req.url;
        const urlParams = new URLSearchParams(url?.split('?')[1]);
        const accessToken = urlParams.get('accessToken');
        
        if (!accessToken) {
            throw new ApiError(2002, 'Missing access token or unable to decode token. Ensure you are sending a valid token.');
        }

        const decodedToken = verifyAccessToken(accessToken,"ws");
        console.log("decode",decodedToken)

        if(!decodedToken || typeof decodedToken !== 'object' || !('id' in decodedToken)){
            throw new ApiError(1011, 'Failed to decode access token');
        }

        const userId = decodedToken.id 

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                roomId: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true
            }
        });

        if (!user) {
            throw new ApiError(2002, 'User not found');
        }

        if(!user.roomId){
            throw new ApiError(2002, 'User Room Id Not found');
        }
        
        const roomId = user.roomId

        ws.user = {
            id: user.id,
            username: user.username,
            roomId: roomId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLoginAt: user.lastLoginAt
        };

        if(!ws.user){
            throw new ApiError(2005, 'User Details not saved in WebSocket Server. Please Try Again in Some Time');
        }

        roomManager.cleanupSocket( ws ) //cleanup socket if was alredy present in some other room 

        roomManager.joinRoom( roomId , ws )

        console.log(`User ${user.username} joined room ${roomId}`);

        ws.send(JSON.stringify(new ApiResponse(1000,{ userData:ws.user , socket:ws  }, "Joined Room Successfully!!")))

        console.log('Verified client and joined to room')

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
        const {name:_name, stack:_stack , data:_data , errors:_errors , ...errmsg} = errmessage

        if (HIGH_ALERT_CODES.includes(err.statusCode)) { 
          ws.close(err.statusCode , JSON.stringify(errmsg))
        }
        else {
          ws.send(JSON.stringify(errmsg));
        }

      // Send error to client as JSON
      // ws.send(JSON.stringify({ type: "ERROR", ...errmessage }));
    }
    
}

