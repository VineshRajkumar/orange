//asyncHandler is used to create a method and export that method so that we donot need to create it again and again
//it is like a wrapper

import { Request,Response,NextFunction,RequestHandler } from "express";
import { ApiError } from '@repo/backend-common';


const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>):RequestHandler  => async(req,res,next)=>{ //made a fucntion inside a function
    try{
        await fn(req,res,next)  //if no error then execute that function 
    }
    catch(error : unknown){

        const err = error as ApiError;

        // Ensure the status code is a valid number (default to 500)
        const statusCode:number = err.statusCode ?? 500;
        
        res.status(statusCode).json({ // if error is received then give error in api error format
            success: err.success || false,
            message: err.message || "Internal Server Error",
            errors: err.errors || [],
            data: err.data || null,
            name: err.name || 'No Name',
            stack: err.stack || 'Empty Stack'
        })
    }
}

export {asyncHandler}