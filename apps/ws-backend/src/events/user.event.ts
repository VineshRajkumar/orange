import { ApiError, draw_elementsType, dbremoveRoomId, dbremoveRoomIdForAll } from "@repo/backend-common";
import { AuthedSocket } from "../types/auth.type";
import { roomManager } from "../utils/roomManager";
import { drawElementSchema, zodErrorFormat } from "@repo/zodschemas";


/** Previously Planned :- 
 * 
 * const eventMap: Record<string, Function> = {
      'draw-canvas': drawCanvasHandler,
    };
 * const handler = eventMap[event];
    if (handler) {
      console.log("handleEvent :- ",socket)
      handler(socket,payload);
    } else {
       console.warn(`Unknown event: ${event}`);
    }

 */

export const cleanElement = (element: draw_elementsType) => {
  if (!element) return element;

  switch (element.type) {
    case "freeHand": {
        // removing x1,y1,x2,y2 for freehand as they are not needed 
        const { x1, y1, x2, y2, ...rest } = element;
        return rest;
    }
    case "text": {
        // removing x2,y2 for text as they are not needed 
      
        const { x2, y2, ...rest } = element;
        return rest;
    }
    default:
        return element;
  }
};

export async function handleEvent(event: string, socket: AuthedSocket, removeShape?: boolean, payload?: draw_elementsType) {

  
  if(!socket.user) {
    throw new ApiError(2002, 'User details not found in Socket')
  }

  const roomId = socket.user?.roomId
  const userId = socket.user?.id
  const username = socket.user.username

  switch (event) {
    
    case 'broadcast-shape':

      if(!payload) throw new ApiError(2001, `Payload containing shape object is required`);

      const newPayload = cleanElement(payload)

      // const result = drawElementsSchema.safeParse(payload);
      const result = drawElementSchema.safeParse(newPayload);

      if (!result.success) {
        // console.log(result)
        const errors = zodErrorFormat(result.error);
        // console.log(errors)
        throw new ApiError(2001, `Validation Error for drawElementSchema :- `, [errors]);
      }
  
      const safeParsePayload = result.data
      roomManager.broadcast( roomId , safeParsePayload, userId,username,removeShape)
      break;

    case 'get-room-members': 
    
      roomManager.getRoomMembers(roomId, socket)
      break

    case 'leave-room': 
    
      const removedfromdb = await dbremoveRoomId(userId)
      if(removedfromdb === true) roomManager.leaveRoom(roomId,socket)
      else throw new ApiError(2006, `Failed to remove roomid from db`)
      break

    case 'stop-session':

      // Steps 
      // 1) Remove roomId from DB for all members
      // 2) Notify all users in this room that session is stopped
      // 3) Force all users (including host) to leave

      await dbremoveRoomIdForAll(roomId);
      roomManager.closeRoom(roomId);
      break;
      
      
      
    default:

      throw new ApiError(2001, `Unknown event: ${event}`)

  }

}
