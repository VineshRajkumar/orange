//NOT NEEDED -> NOT USING TICKET VERIFICATION -> WILL BE USING A SIMPLE TOKEN VERIFICATION 
//NOTE :- here req is Websocket and res is payload


import { ApiError } from "@repo/backend-common";
import { wsAsyncHandler } from "../utils/asyncHandler";
import jwt , { JwtPayload } from "jsonwebtoken"
import { prisma } from "@repo/database";
import { ApiResponse } from "../utils/ApiResponse";

interface ticketType extends JwtPayload {
    id: string
    ipAddress: string
    accessToken: string
    createdTime: Date 
    //we are extending because 2 additional filed iat,exp 
    // also come from Jwt and also for typescript 
}

//verifyTicket is authentication, done once before any room or draw action.

/*
const verifyTicket = wsAsyncHandler(async( ws , data )=>{
    //STEPS :- 
    //extract ticket from data 
    //ticket contains -> {userId, userIpAddress, created_time, accessToken, expiresAt}
    //Verify userId from db if falied close the server
    //Verify accessToken by jwt.decode if falied close the server
    //Verify user Ip address if falied close the server
    //Set the ticket in server 
    //Send a response that ticket is verified 


    // console.log("socket at verifyTicket",ws)
    // console.log("payload ",data)

    if (!process.env.WEBSOCKET_TICKET_SECRET) {
        // console.log(process.env.WEBSOCKET_TICKET_SECRET)
        throw new ApiError(1008, 'WEBSOCKET_TICKET_SECRET is not defined');
    }
    const decodedData = jwt.verify(data, process.env.WEBSOCKET_TICKET_SECRET)

    if (typeof decodedData !== "object" || decodedData === null) {
        throw new ApiError(1008, "Invalid ticket structure");
    }
    // console.log("decoded",decodedData)
    // console.log("type", typeof(decodedData))
    const ticket = decodedData as ticketType

    if(!ticket){
        throw new ApiError(1008,"Authentication ticket missing")
        // ws.close(1008,"Authentication ticket missing")
    }

    const validate_userId = await prisma.user.findFirst({   
        where:{
            id:ticket.id
        },
        select:{
            id: true,
            username: true,
            roomId: true,
            refreshToken: false,
            createdAt: false,
            updatedAt: false,
            password: false,
            email:false
        }
    })

    if(!validate_userId){
        throw new ApiError(1008,"UserId doesnot exits in the Db")
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new ApiError(1008, 'ACCESS_TOKEN_SECRET is not defined');
    }
    const decodedToken = jwt.verify(ticket.accessToken,process.env.ACCESS_TOKEN_SECRET)
    if(!decodedToken){
        throw new ApiError(1008,"Failed to Decode Token")
    }

    //IP CHECKING NOT NEEDED 
    // const httpipAddress = ticket.ipAddress
    // if(httpipAddress !== ip){
    //     throw new ApiError(1008,"Http Ip Address didnot match Websocket Ip Address")
    // }

    // console.log(ws)
    // console.log(ws.user)
    if(!ws.user){
        ws.user = { id: "no id", username: "no username" };
    }
    ws.user.id = validate_userId.id
    ws.user.username = validate_userId.username
    
    if( ws.user.id==="no id" || ws.user.username === "no username"){
        throw new ApiError(1011,"Issue with Websocket Server at verifyTicket")
    }

    ws.send(JSON.stringify(new ApiResponse(1000,{ id:ws.user.id , username: ws.user.username , socket:ws  }, "Ticket is Verified!!")))
})

*/


/** Ticket System -> Authentication/authorization In Websockets  :- 

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


// Previously Planned :- 

//Steps :-
//Client will sned ticket to websocket server
//Decode token -> jwt.decode
//Veify userid , accessToken , verify ip -> payload.ip !== clientIp
//If incorrect then stop the ws server
//If correct then store ws.userId = payload.userId and ws.accessToken = payload.accessToken;
//Get room id from db -> Send the user to the room
