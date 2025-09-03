import { asyncHandler } from "../utils/asyncHandler";
import { RequestHandler } from "express-serve-static-core";
import { ApiError } from '@repo/backend-common';
import { getUserFromToken } from "../utils/getUserFromToken";
import { SafeUser } from "@repo/backend-common";

//for user field to come in Request and be global
declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}


export const verifyJWT:RequestHandler = asyncHandler(async(req,_,next)=>{ //NOTE :-  SINCE res is not being used here so you can replace that res word with "_" underscore mostly written in production based code 

    try {
        //Steps :-
        // acess the token
        // check if token exists fot that user
        // decode the token
        // find the user and return 
    
    
        //NOTE :-  we will import token in token variable by req.cookies?.accessToken  -> req also contains tokens
        //NOTE :- special case is also added here if user is loggedin with mobile or user has in his own given the token and details -> req.header("Authorization")?.replace("Bearer ","")
        //meaning of this -> req.header("Authorization")?.replace("Bearer ","")
        //token are normally generated in this form Authorization: Bearer <token> so from here we are extracting token by replacing Bearer with "" empty string so if we acess Authorization we will diretly recive the token
        const token:string = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401, "Unauthorized Request")
        }
        
        const user = await getUserFromToken(token)

        req.user = user;
        next() 

        
    } catch (error) {

        if (error instanceof Error) {
            throw new ApiError(401, error.message);
        }
        else{
            throw new ApiError(401,"Invalid Access Token");
        }
    }

})