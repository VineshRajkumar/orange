import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createRoomId, getWebsocketTicket, joinRoom } from "../controllers/room.controller";


const roomRouter = Router()

//secured routes

roomRouter.route("/create-room-id").post(verifyJWT , createRoomId)

roomRouter.route("/get-ws-ticket").get(verifyJWT , getWebsocketTicket)

roomRouter.route("/join-room/room/:roomId/sheet/:sheetId").post(verifyJWT , joinRoom)

export default roomRouter;