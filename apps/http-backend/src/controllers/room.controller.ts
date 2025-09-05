import { RequestHandler } from "express-serve-static-core";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "@repo/backend-common";
import { v4 as uuidv4 } from 'uuid';
import {  prisma } from "@repo/database"
import { ApiResponse } from "../utils/ApiResponse";
import * as sheetService from "../services/sheet.services";
import jwt, { SignOptions } from "jsonwebtoken"

type createRoomType = {
  type: "create-room" | "start-session"; 
  sheetId?: string;
  title?: string;                  
}

const createRoomId:RequestHandler = asyncHandler(async(req,res)=>{

    //Steps :- 
    // Check login (if required) -> done by middleware
    // Check if guest has called this and if yes then check in db whether he alredy has a sheet present then dont allow as guest user can create only one sheet
    // createRoomId endpoint will serve for both users joining from dashbaord and users starting session directly from canvas  
    // if user join from dashbaord then type is "create-room" or else if from canvas then type is "start-session"
    // only for "create-room" -> SheetTitle will be given in req.body then Generate sheetId call the make-sheet function  -> if sheet creation fails then dont prceed give error 
    // for both "start-session" & "create-room" ->  Generate roomId (UUID/nanoid) and update it in current users db field
    // only for "create-room" -> Return roomid and sheet details with current data (since new sheet so data is null)
    // if  "start-session" then  -> Return just roomid 

    if (!req.user) throw new ApiError(404, "Current User request object not found");

    const data = req.body as createRoomType
    let newRoomSheetCreated;

    if(data.title && data.type == 'create-room'){

        if(req.user?.isGuest === true){
            const currentGuestId =  req.user.id

            const guestSheetExists = await prisma.sheet.findFirst({
                where: {
                    ownerId: currentGuestId
                }
            })

            if(guestSheetExists){
                throw new ApiError(400, 'Guest users are allowed to create only one sheet. Please log in to create more.');
            }   
        }

        newRoomSheetCreated = await sheetService.makeSheet( req.user.id , {title: data.title})

        if(!newRoomSheetCreated){
            throw new ApiError(500, 'Something went wrong while creating room sheet');
        }
    }

    const roomId = uuidv4();

    const isStartSession = data.sheetId && data.type === 'start-session'

    const updateRoomIdInSheet = await prisma.sheet.update({
        where: {
            id: isStartSession ? data.sheetId : newRoomSheetCreated?.id
        },
        data: {
            roomId: roomId
        }
    })

    if(!updateRoomIdInSheet){
        throw new ApiError(500, 'Something went wrong while updating roomId field of sheet');
    }

    const saveRoomId = await prisma.user.update({
        where:{
            id: req.user.id
        },
        data:{
            roomId: roomId
        },
        select: {
            id:true,
            username:true,
            isGuest:true,
            roomId:true,       
            createdAt:true,         
            updatedAt:true,    
            lastLoginAt:true
        }
    })

    if(!saveRoomId){
        throw new ApiError(500, 'Something went wrong while generating and saving room id');
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{newRoomSheetCreated,saveRoomId},"Generated RoomSheet and RoomId Successfully!!"))

})

/* Ticket System -> Authentication/authorization In Websockets  :- 

    https://devcenter.heroku.com/articles/websocket-security#authentication-authorization

    🧠 Step-by-Step (Simplified):
        1. Client asks for a ticket:
        Before opening a WebSocket, the 
        browser sends a normal HTTP 
        request to your server:

        ➜ “Hey, I want to open a WebSocket. Can I get a ticket?”

        2. Server creates a ticket:
        The server checks that the user is 
        logged in, then makes a ticket. This 
        ticket includes:

            i) The user's ID
            ii) The user's IP address
            iii) The time it was created
            iv) A random string (for security)

        The server saves this ticket 
        somewhere (like a database or in-memory cache).

        3. Server sends ticket back to client:
        The browser gets the ticket as a response.

        4. Client opens WebSocket using ticket:
        When opening the WebSocket, the client 
        sends the ticket in the first message 
        (since JavaScript can't set headers for WebSocket).

        5. Server checks the ticket:

            i) Is the ticket real?
            ii) Was it used before?
            iii) Is it from the same IP?
            iv) Is it expired?
            
        If everything is okay, the server 
        accepts the WebSocket connection.

    🛡️ Why this is good:
        i) You don't need to rely on cookies or headers.
        ii) It works even if WebSocket server is separate 
        from your main HTTP server.
        iii) It's more secure than just trusting 
        whatever comes in.

*/
//NOT NEEDED ------------------------------------------------
const getWebsocketTicket:RequestHandler = asyncHandler(async(req,res)=>{

    //Steps :- 
    
    // Client will hit the get-ws-ticket endpoint 
    // get current user ip , userId, accessToken 
    // make sure to set the logic of expiresAt 
    // Make a ticket -> {userId, userIpAddress, created_time, accessToken, expiresAt}
    // return the ticket to client user to start websocket connection

    
    if (!req.user) throw new ApiError(404, "Current User request object not found");
    
    const userId = req.user.id
    if(!userId) throw new ApiError(404, "Current User Id not found");
    
    const accessToken = req.cookies.accessToken
    if(!accessToken) throw new ApiError(404, "Current User AccessToken not found");
    
    const ipAddress = req.ip
    if(!ipAddress) throw new ApiError(404, "Current User Ip Address not found");
    

    const secret = process.env.WEBSOCKET_TICKET_SECRET;
    const expiry = Number(process.env.WEBSOCKET_TICKET_EXPIRY);

    if (!secret || !expiry) {
        throw new ApiError(401,"Missing JWT configuration for getWebsocketTicket ");
    }

    const payload = {
        id: userId,
        ipAddress: ipAddress,
        accessToken: accessToken,
        createdTime: Date.now(),
    };

    const options: SignOptions = {
        expiresIn: expiry
    };

    //JWT REQUIRES 3 THINGS - PAYLOAD,HEADER,EXPIRY
    const ticket = jwt.sign( payload, secret, options)

    if(!ticket){
        throw new ApiError(500,"Error in Creating JWT Websocket Ticket");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,ticket,"Created JWT Websocket Ticket Successfully"))

})

const joinRoom:RequestHandler = asyncHandler(async(req,res)=>{

    //Steps :- 
    // 1) roomid and sheetid will be sent to join room endpoint  
    // 2) If roomid and sheetid not recevied give error or else proceed
    // 3) check if any other user has same roomId if yes then that means roomId has been generated previously and roomId is valid so proceed or else give error 
    // 4) ensure this sheet belongs to the same owner
    // 5) if user is alredy in one room and is try to join another room then remove the old room and then proceed with updating new room
    // 6) roomid field will be updated in current users db and sheet will be found from sheetid if -> roomid not updated then dont proceed giving the sheet give an error
    // 7) return roomid after updating and sheet details with the current data till it was saved 

    if (!req.user) {
        throw new ApiError(404, "Current User request object not found");
    }

    const { roomId, sheetId } = req.params; 

    if (!roomId || !sheetId) {
        throw new ApiError(400, "Both roomId and sheetId are required in the URL");
    }

    const correctRoomAndSheet = await prisma.sheet.findFirst({
        where: {
            id: sheetId,
            roomId: roomId,
            owner: {
                roomId: roomId
            }
        },
        include: {
            owner: { select: { id: true } }
        }
    });

    if (!correctRoomAndSheet) {
        throw new ApiError(403, "Invalid roomId + sheetId combination. Cannot join this room.");
    }

    
    const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { roomId: roomId },
        select: {
            id: true,
            username: true,
            isGuest: true,
            roomId: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true
        }
    });

    if (!updatedUser || updatedUser.roomId !== roomId) {
        throw new ApiError(500, "Failed to join room. Please try again.");
    }

    const sheet = await sheetService.loadSheetId(sheetId, correctRoomAndSheet.owner.id)

    return res.status(200).json(
        new ApiResponse(
            200,
            { roomId, sheet, updatedUser },
            "Updated room successfully and fetched sheet data. Starting Websocket Server"
        )
    );


})


//ROUGH PROJECT PLAN :-
//NOTE :- LATER ADD RESTRICTION FOR GUEST USERS CAN ONLY CREATE ONE ROOM SHEET 
//If create room is pressed in frontend :- 
//1) from frontend when sheetitle is entered and create room button is clicked -> http request will go to backend url -> /create-room-id 
//2) in /create-room-id -> get the sheet title and do it similar to makeSheet function in sheet.controller.ts -> generate the roomid put it in current users db field -> return roomid and sheet details with current data (since new sheet so data is null)
//3) then in frontend save the sheet in the zustand state libirary 
//4) redirect to the sheet & roomid then the frontend will call  /get-accesstoken -> in get-accesstoken endpoint current user accessToken will be taken from cookie verify the token by making a db call if the user/guest exists in db and also check if the req.user.id == decodedtoken.id if verified this function will give acesstoken 
//5) the in frontend take the recevied accesstoken -> do socket.send with the type: auth -> decode the token and verify it same as done in get-accesstoken and take the roomid from it add in the websocket state and start websocket connection 
//6) once started , in frotend in canvas send a broadcast shape request to websocket server immediately -> render it on canvas -> there might not be any shape because this is a new room and new sheet created 
//7) Further updates by and sending shapes will be done by brodcast shapes where broadcast to current user/guest and also to other memeber   
//8) Give option of sharing room link only once current user is in the room sheet 

// NOTE :- GUEST ONLY HAS 2HR TIME SO REMEBER TO PUT THE USE SESSION MANAGER HOOK TO EXIT HIM FROM THERE BEFORE THAT REMOVE HIM FROM WEBSOCKET SERVER

//If any guest/user joins room from dashbaord :- 
// 1) guest/user will paste the link containing sheet id and room id -> frontend extracts sheetid and roomid 
// 2) roomid and sheetid will be sent to join room endpoint where user/guest -> check with zod validation if link is correct -> check if any other user has same roomId if yes then that means roomId has been generated previously then proceed-> roomid field will be updated in current users db and sheet will be found from sheetid -> return roomid after updating and sheet details with the current data till it was saved 
// 3) then in frontend save the sheet in the zustand state libirary 
// 4) redirect to the sheet & roomid then the frontend will call  /get-accesstoken -> in get-accesstoken endpoint current user accessToken will be taken from cookie verify the token by making a db call if the user/guest exists in db and also check if the req.user.id == decodedtoken.id if verified this function will give acesstoken 
// 5) the in frontend take the recevied accesstoken -> do socket.send with the type: auth -> decode the token and verify it same as done in get-accesstoken and take the roomid from it add in the websocket state and start websocket connection 
// 6) once started in frotend in canvas send a broadcast shape request to websocket server immediately -> render it on canvas  -> NOTE:- If sheet had data previously just give a note that it will overidden by that persons sheet data who is present before the current person -> because these are room sheet -> if you need it seperately then put it in personal sheets
// 7) Further updates by and sending shapes will be done by brodcast shapes where broadcast to current user/guest and also to other memeber 

//If any guest joins via link directly :- 
//1) If any user shares link to some random person 
//2) then login him as guest in frontend with useeffect in frontend and 
//3) then call the load-sheet-id endpoint in frontend and save the sheet with current last saved data in zustand state libirary 
//4) get the acesstoken from the response and
//5) send the accesstoken by doing socket.send with the type: auth to websocket server->    decode the token and verify it same as done in get-accesstoken and take the roomid from it add in the websocket state and start websocket connection 
// 6) once started in frotend in canvas send a broadcast shape request to websocket server immediately -> render it on canvas  -> NOTE:- If sheet had data previously just give a note that it will overidden by that persons sheet data who is present before the current person -> because these are room sheet -> if you need it seperately then put it in personal sheets
// 7) Further updates by and sending shapes will be done by brodcast shapes where broadcast to current user/guest and also to other memeber 

//FUTURE ADDITIONS :- 
//1) ENCRYPTION TO DATA ELEMENTS GOING TO WEBSOCKET 
//2) CURRENTLY AFTER GUEST SESSION IS OVER IT ONLY STORES IN LOCAL STORAGE 
// BUT THAT IS NOT A CORRECT WAY BEACUSE THEN THE USER CAN MISUSE IT BY REMOVING 
// IT FROM LOCAL STORAGE AND AGAIN USING GUEST SESSION SO SOLUTION IS ADD IP 
// PROTECTION NEXT TIME IF GUEST TRIES TO USE CHECK THE IP :- 
//  a) Ip deletetion after few days automatically 
//  b) site will use ip discliamer 
//3) ADD NUMBER OF VISITORS VISITED THIS WEBSITE AND LIKES 

export {
    createRoomId,
    getWebsocketTicket,
    joinRoom
}