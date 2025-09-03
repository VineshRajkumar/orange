import { ApiError } from '@repo/backend-common';
import type { ErrorRequestHandler } from "express";

//-----------------------------------------------
//NOT NEEDED NOW AS asyncHandler CAN HANDLE THE ERROR FORMAT 
// BUT THIS CAN BE ONE MORE OPTION WHEN asyncHandler IS NOT USED 
//-----------------------------------------------

//NOTE :- 
//Why was this middleware required ? 

//Error Handling so that ApiError can work properly 
//ApiError was extending Error and Error class contains 
// only three thing name,message,stack.

//so when i sent message it went properly as we were 
// calling super(message) so it went to parent class 
// that is Error and sent the response when error was thrown 
// but other fields like statusCode , data , success,
// error array didnot go in response as there was nothing 
// made to send them.

// so even if you send statusCode or any other data it 
// wont get sent in response.

// SO THATS WHY THIS MIDDLEWWARE WAS NEEDED THAT COULD SEND THE ERROR PROPERLY WHEN THROWN 

export const errorHandler:ErrorRequestHandler = ( err, req, res, next ) => {
  
  console.log(err)
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  }

  // fallback for other errors
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

