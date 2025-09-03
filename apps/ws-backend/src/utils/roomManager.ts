import { ApiError, dbremoveRoomIdForAll, draw_elementsType } from "@repo/backend-common";
import { AuthedSocket } from "../types/auth.type";
import { ApiResponse } from "./ApiResponse";

/** How sheet will be saved in websocket server 
 * My Flow 
 * 1) If new room created -> shapes = [] -> because then it will be new sheet 
 * 2) If joined in existing room -> bradcast current ongoing shapes to that person socket 
 * 3) in bradcast -> before broadcasting any shape store it in shapes array 
 * 4) only if room is deleted delete the shapes object of that room 
 * 
 * NOTE :- AFTER LEAVING THE ROOM THAT SHEET WILL BE SAVED AS ROOM SHEET AND PERSON WILL BE 
 * ABLE TO DO HIS OWN WORK ON THAT ROOM SHEET AND ROOM SESSION WILL NOT BE STARTED AGAIN ON 
 * THAT SHEET AND NEW ROOM WILL BE NEEDED TO CREATE FOR NEW ROOM SESSION AND THE LAST PERSON 
 * WHO SAVED IT HIS DRAWING WILL BE VISIBLE TO EVERYONES DASHBORD ROOM SHEET THEN EACH PERSON 
 * MAY DO THEIR OWN WORK ON THAT  
 * 
 * IF MY FLOW IS NOT UNDERSTOOD THAT PROPELY THEN GPT HAS EXPLAINED MY FLOW  :- 
 * 
 * Treat rooms as temporary sessions (ephemeral) :- 
 * 1) A “room” exists only during an active session.
 * 2) Shapes live in memory only (your RoomManager shape array).
 * 3) When the last user leaves, you delete the room and all its shapes.
 * 4) If the user wants to work on the drawing later, they must either: 
 *      a) Save the current shapes to their personal room sheet in the DB before leaving.
 *      b) Or start a new room from scratch.
 * 5) To resume collaboration, they start a new room and send the link.
 */

/**Structure of Room :- 
 * 
 * Why Map is Better than Record :- 
 * 1) Maintains intersetion order 
 * 2) It gives you .has(), .get(), .set(), .delete() these are built in
 * 3) O(1) average time for adding, removing, and checking rooms.
 * 
 * Why is Set better than Array :- 
 * 1) no duplicates ->  Set automatically ignores adding the same socket twice.
 * 2) removing from a Set is O(1), while from an array it’s O(n)
 * 
 * So this is best -> Map<string, Set<AuthedSocket>> = new Map(); 
 * 
 * Structure How it will be stored :- 
 * 
 * roomManager.rooms = Map {
        "roomA" => Set {
            AuthedSocket { user: { id: "u1", username: "Alice", roomId: "roomA" }, ... },
            AuthedSocket { user: { id: "u2", username: "Bob", roomId: "roomA" }, ... }
        },
        "roomB" => Set {
            AuthedSocket { user: { id: "u3", username: "Charlie", roomId: "roomB" }, ... }
        }
    }
 */

/**Method used to solve the Race condition here is :-
 * Reffered -> https://plus.excalidraw.com/blog/building-excalidraw-p2p-collaboration-feature
 * 
 * Last Write Wins (LWW) is a conflict resolution strategy where, if multiple clients update the same data 
 * at the same time, the update that arrives last (based on timestamp or version number) overwrites the earlier one.
 * 
 * Inshort :- last write wins means if one has fast speed and other has slow speed -> the slow speed guy will win always because his updation is last
 */

class RoomManager {

    private rooms: Map<string, { sockets: Set<AuthedSocket>, shapes: draw_elementsType[], hostId: string }> = new Map();

    async joinRoom(roomId: string, socket: AuthedSocket) {
        //Steps :- 
        //1) Check if this user is already in any room 
        //2) If user joins same room no problem 
        //3) But if user tries to join another room then -> check if he is the host and if yes that means he wants to simply discontinue the room so close the room and remove everyone, if he is not the host then its the user trying to join another room so make him leave from current room and let him join new room
        //2) If roomid is not in rooms then create it and who ever creates it that means he is the host of that room
        //3) Once roomid is created or if it was alredy created get that roomId and add the socket 
        //4) send those shapes that were drawn before the user joined

     
        for (const [id, room] of this.rooms.entries()) {

            if (Array.from(room.sockets).some((s) => s.user?.id === socket.user?.id)) {

                if (id === roomId) {
                    // Already in the same room
                    console.log(`${socket.user?.username} is already in the room ${roomId}`);
                    socket.send(
                        JSON.stringify(new ApiResponse(2003, `You are already in room ${roomId}`))
                    );
                    return;

                } else {

                    // Already in a different room and joinin new room 
                    console.log(`${socket.user?.username} is already in another room: ${id}`);

                    const isHost = room.hostId === socket.user?.id;

                    if (isHost) {
                        // Host is switching -> close previous room for all 
                        await dbremoveRoomIdForAll(id);
                        this.closeRoom(id,'fromjoinRoom');
                        console.log(`Host ${socket.user?.username} closed room ${id}`);

                    } else {
                        // Normal user switching -> leave previous room
                        this.leaveRoom(id, socket);
                        console.log(`${socket.user?.username} left room ${id}`);
                    }

                }
                
            }
        }

        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, { sockets: new Set(), shapes: [], hostId: socket.user?.id! });
        }
        // console.log('Rooms',this.rooms.get(roomId))
        const room = this.rooms.get(roomId)!;

        const added = room.sockets.add(socket);
        if (!added) {
            throw new ApiError(2000, `Failed to join user ${socket.user?.username} to room ${roomId}`);
        }

        if (room.shapes.length > 0) {
            socket.send(JSON.stringify(new ApiResponse(1000, room.shapes, "Loaded existing shapes in room")));
        }

        this.broadcast(roomId, `${socket.user?.username} has joined the room`)
        // console.log('Rooms',this.rooms.get(roomId))
        console.log('Current Rooms In Websocket Server :- ', this.rooms)

    }

    leaveRoom(roomId: string, socket: AuthedSocket) {
        //Steps :- 
        //1) get the room from the roomid 
        //2) delete the socket that is leaving or is disconnected 
        //3) broadcast a message to other users in room that that user left 
        //4) if room is empty now then delete the room -> along with the room shapes will also get deleted
        const room = this.rooms.get(roomId);
        if (room) {
            const cleanSocket = room.sockets.delete(socket);
            if(!cleanSocket){
                throw new ApiError(2006,`Failed to cleanup user ${socket.user?.username} socket`)
            }
            console.log(`Removed User ${socket.user?.username} from Room`)
            this.broadcast(roomId, `${socket.user?.username} has left the room`)

            if (room.sockets.size === 0) {
                this.rooms.delete(roomId); 
                console.log(`Removed Room ${roomId} and cleared shapes`);
            }
        }
    }

    broadcast(roomId: string, message: draw_elementsType | string , userId?:string, username?:string, removeShape: boolean = false  ) {
        //Steps :- 
        //1) get the room from the roomid 
        //2) if the room is null then that means roomid was also null so given an error
        //3) if the message was a shape then store the shape
        //4) if room user is in room only then broadcast a message (drawing element object) to all users in room 
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new ApiError(2002,`Failed to broadcast message : User has not joined any room`)
        }

    
        if (typeof message !== "string") {
            if (removeShape) {

                const shapeExists = room.shapes.some(shape => shape.id === message.id);

                if (!shapeExists) {
                    console.log(`Shape with id ${message.id} does not exist, skipping removal broadcast`);
                    return; 
                }
                
                room.shapes = room.shapes.filter(shape => shape.id !== message.id)
                console.log(`Removed shape with id ${message.id}`)
            }
            else{
                //this avoids race condition -> if new shape push to shapes and if same shape then update in that only  -> explaination written above in detail
                const index = room.shapes.findIndex(s => s.id === message.id);
                if (index >= 0) {
                    console.log(`Entered Race Condition due to User ${username}`)
                    room.shapes[index] = message;
                    console.log(`Race Condition Solved : Updated shape with id ${message.id}`);
                } else {
                    room.shapes.push(message); 
                    console.log('Added new shape');
                }
            }
        }
        
        const data = typeof(message)==='string' ? 
            JSON.stringify(new ApiResponse(1000, message , "Broadcasted Message Successfully!!")) : 
            JSON.stringify(new ApiResponse(1000, 
                {element:message, userId:userId, username:username, removeShape:removeShape} , 
                removeShape ? "Broadcasted Shape Removal Successfully!!" : "Broadcasted Shapes Successfully!!"
            ));

        for (const client of room.sockets) {

            client.send(data);
        }

        if(typeof message !== "string") console.log(removeShape ? 'Broadcasted Shape Removal' : 'Broadcasted Shapes');

        // console.log("shapes",room.shapes)
    }

    getRoomMembers(roomId: string , socket: AuthedSocket) {
        const roomMembers = this.rooms.get(roomId);
        // console.log(roomMembers)
        if(!roomMembers) throw new ApiError(2002,'Failed to fetch current room members')
        const membersArray = Array.from(roomMembers.sockets);
        socket.send(JSON.stringify(new ApiResponse(1000, {totalcount: membersArray.length , members: membersArray} , "Fetched Room Members Successfully!!")))
        
    }

    //for cleanup this method can be used :-  here only socket is given and it searchs in all rooms and clear that socket -> this can be called before joining -> if this socket was not cleared earlier
    //will not be using this a lot as this is not very optimal as this will have to search in all rooms 
    cleanupSocket(socket: AuthedSocket) {
        for (const [roomId, room] of this.rooms.entries()) {
            if (room.sockets.has(socket)) {
                const cleanSocket = room.sockets.delete(socket);
                if(!cleanSocket){
                    throw new ApiError(1011,`Failed to cleanup user ${socket.user?.username} socket`)
                }
                console.log(`Removed User ${socket.user?.username} from Room by cleanSocket method`)
                if (room.sockets.size === 0) {
                    this.rooms.delete(roomId);
                    console.log(`Removed Room ${roomId} and cleared shapes`);
                }
            }
        }
    }

    closeRoom(roomId: string, type?: 'fromjoinRoom') {
        const members = this.rooms.get(roomId);
        if (!members) throw new ApiError(2002,'Failed to fetch current room members')
        const membersArray = Array.from(members.sockets);

        for (let i = 0; i < membersArray.length; i++) {
            const socket = membersArray[i];
            if(!socket) throw new ApiError(2002,'Socket not found')
            console.log("Session stopped by host")
            const statusCode = type === 'fromjoinRoom' ? 2004 : 4000
            socket.send(JSON.stringify(new ApiResponse(statusCode, 'The host has ended the session' , "Broadcasted Message Successfully!!")));
            if(statusCode === 4000) socket.close(4000);
            else socket.close();
            
        
        }
        console.log('CLOSEROOM :: Rooms Before Closing', this.rooms)
        this.rooms.delete(roomId);
        console.log('CLOSEROOM :: Rooms After Closing ', this.rooms)
    }

    
}

export const roomManager = new RoomManager();
