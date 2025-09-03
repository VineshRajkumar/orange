
import { asyncHandler } from "../utils/asyncHandler";
import { RequestHandler } from "express-serve-static-core";
import { getUserFromToken } from "../utils/getUserFromToken";

export const checkAlreadyLoggedIn:RequestHandler = asyncHandler(async(req, res, next) => {
    
    const token:string = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if (!token) return next(); // no token, user is not logged in -> move to login 

    //if token is present -> that means user or guest is trying to login again 
    try {

        const user = await getUserFromToken(token)
        req.user = user;
        next() 

    } catch (error) {

        return next(); // token invalid or expired, treat as not logged in

    }
});
