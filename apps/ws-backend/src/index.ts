
//File Structure for ws-backend :-
// 1) controller/handler -> where broadcastShapes these business logic should be written
// 2) events -> it is like routes folder where different enpoint will be written and connected to controller
// 3) middleware/verifyAuth.middleware.ts -> for verifying accessToken from clent and close socket if accesstoken wrong 
// 5) utils -> for good response format for error,resposne and extras 
// 6) connection.ts -> where json.parsing any additional rate limiting to be done here and also call verifyAuth middleware if correct then proceed



import { WebSocketServer } from "ws";
// import { connectDB } from '@repo/backend-common';
import { handleConnection } from "./connection";
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/*Why connectDB not required in prisma ? 
Ans) This is because in mongodb once db is started it keep it on and then if any 
error occurs then it will close the db connection and give the error but this 
is not the case with prisma in prisma connection is lazily connected that means 
when you send a query(findUnique,create,insert,delete..) it will automatically 
connect the db and then perform the opertation so that means it switches on and 
off the db as per the query so thats why using connectDB had no use because this 
is also like a query it will just run for first time when server starts and also 
query checks or any errors related to query are done using the retryExtension
middlewate that runs before each query is fired  

connectDB()
  .then(() => {

      const wss = new WebSocketServer({ port: Number(process.env.WEBSOCKET_PORT) });
      
      wss.on("connection", async function connection(socket, req) {

        await handleConnection(socket,req)
        
      });

      //wss.on listening for an event called error if found then this will trigger
      //this will only trigger errors like port issue , handshake issue or websocket network issue  
      wss.on("error", (error) => {
        console.log("ERROR: ", error);
        throw error;
      });

      wss.on('listening',()=>{
        console.log( `WebSocket server started on ws://localhost:${process.env.WEBSOCKET_PORT}/`);
      })

  })
  .catch((err) => {
    console.log("Prisma db connection Failed", err);
  });*/

const wss = new WebSocketServer({ port: Number(process.env.WEBSOCKET_PORT) });

wss.on("connection", async function connection(socket, req) {

  await handleConnection(socket,req)
  
});

//wss.on listening for an event called error if found then this will trigger
//this will only trigger errors like port issue , handshake issue or websocket network issue  
wss.on("error", (error) => {
  console.log("ERROR: ", error);
  throw error;
});

wss.on('listening',()=>{
  console.log( `WebSocket server started on ${process.env.WEBSOCKET_URL}`);
})