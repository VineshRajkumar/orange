import { handleEvent } from './events/user.event';
import { IncomingMessage } from 'http'
import { verifyAuth } from './middlewares/verifyAuth.middleware';
import { AuthedSocket } from './types/auth.type';
import { roomManager } from './utils/roomManager';
import {  ApiError, Payload } from '@repo/backend-common';


// {
//     "event": "join-room",
//     "payload": { "roomId": "abc123" }
// }

//SAFE CODE :- 
//2000 -> unknown error 
//2001 -> invalid payload 
//2002 -> not found 
//2003 -> action not allowed 
//2004 -> rate limit exceeded 
//2005 -> retry after some time 
//2006 -> Internal cleanup error 

export const HIGH_ALERT_CODES = [
  1002, //non-JSON data 
  1003, //unsupported data 
  1008, //authentication failure , security restriction 
  1011, // Internal server error
  1013  // Try again later (overload)
];

export const handleConnection =  async (socket: AuthedSocket, req: IncomingMessage) => {

  console.log('Client connected');

  //middleware to verify authentication of user and join to room and save user object
  await verifyAuth(socket, req);
 

  socket.on('message', async(data) => {
    
    try {

      const { event , payload } = JSON.parse(data.toString());
      let parsedPayload;
      // console.log('payload',payload)
      if(payload){
        parsedPayload = payload as Payload
      }
      // console.log('parsedPayload',parsedPayload)

      if( typeof(event) !== 'string' ){
        throw new ApiError(2001, 'Event should be string type');
      } 

      await handleEvent(event,socket,parsedPayload?.removeShape,parsedPayload?.element);
      
    } catch (error) {


      if(error instanceof ApiError){
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

        const {name:_name, stack:_stack , data:_data , errors:_errors , ...errmsg} = errmessage

        if (HIGH_ALERT_CODES.includes(err.statusCode)) { 
          console.log('HIGH_ALERT_CODES from socken.on message')
          socket.close(err.statusCode , JSON.stringify(errmsg))
        }
        else {
          socket.send(JSON.stringify(errmsg));
        }
      }
      else {
        console.error('Invalid message format:', error);
      }

    }

  });



  socket.on('close', async () => {

    try {

      if(!socket.user) {
        throw new ApiError(2002, 'User details not found in Socket')
      }

      //not needed as socket must be maintained if user refreshes - still if somehow roomId stays in db even if user disconnected then that roomid will change when he joins other room 
      // const removedfromdb = await dbremoveRoomId(socket.user.id)
      // if(removedfromdb === false) throw new ApiError(2006, `Failed to remove roomid from db`)

      if(!socket.user?.roomId){
        console.log('RoomId Not Found : Cleaning Up Socket by cleanupSocket function')
        roomManager.cleanupSocket(socket)
      }
      else {
        console.log('leave rooom called in socket.on close')
        roomManager.leaveRoom(socket.user?.roomId , socket)
      }

    } catch (error) {
      
      
      if(error instanceof ApiError){
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

        const {name:_name, stack:_stack , data:_data , errors:_errors , ...errmsg} = errmessage

        if (HIGH_ALERT_CODES.includes(err.statusCode)) { 
          console.log('HIGH_ALERT_CODES from socken.on close')
          socket.close(err.statusCode , JSON.stringify(errmsg))
        }
        else {
          socket.send(JSON.stringify(errmsg));
        }
      }
      else {
        console.error('Invalid message format:', error);
      }

    }

    console.log(' Client disconnected ');

  });


}
