import { prisma, User } from "@repo/database";
import jwt, { SignOptions } from "jsonwebtoken";
import { ApiError, verifyAccessToken } from "@repo/backend-common";
import bcrypt from "bcrypt";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { RequestHandler } from "express-serve-static-core";
import {
  changeCurrentPasswordZodSchema,
  loginUserZodSchema,
  registerUserZodSchema,
  updateAccountDetailsZodSchema,
} from "@repo/zodschemas";
import { zodErrorFormat } from "@repo/zodschemas";
import { generateRandomUsername } from "../utils/guestUtils";

//NOTE :- bcryptExtension,existsExtension has been made in pacakages/database

const generateAccessToken = function (user: User) {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  const expiry = Number(user.isGuest ? process.env.GUEST_ACCESS_TOKEN_EXPIRY : process.env.ACCESS_TOKEN_EXPIRY);

  if (!secret || !expiry) {
    throw new ApiError(401, "Missing JWT configuration in generateAccessToken");
  }

  const payload = user.isGuest
  ? { id: user.id, username: user.username }
  : { id: user.id, email: user.email, username: user.username };

  const options: SignOptions = {
    expiresIn: expiry,
  };

  //JWT REQUIRES 3 THINGS - PAYLOAD,HEADER,EXPIRY
  return jwt.sign(payload, secret, options);
};

const generateRefreshToken = function (userId: string) {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  const expiry = Number(process.env.REFRESH_TOKEN_EXPIRY);

  if (!secret || !expiry) {
    throw new ApiError(
      401,
      "Missing JWT configuration in generateRefreshToken "
    );
  }

  const payload = {
    id: userId,
  };

  const options: SignOptions = {
    expiresIn: expiry,
  };

  //JWT REQUIRES 3 THINGS - PAYLOAD,HEADER,EXPIRY
  return jwt.sign(payload, secret, options);
};

//acesstokenandrefreshtoken function will be used a lot so we are making a function of it:-
const generateAccessTokenandRefreshToken = async (user: User) => {
  //not needed to use async handler as this will be delt internally in the server while asyncHandler happens in web
  try {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);

    //put refreshToken you got back to database
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: refreshToken,
        lastLoginAt: new Date()
      },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access Token and Refresh Token !!"
    );
  }
};

//In login we will fetch once and pass it to isPasswordCorrect and also generateAccessTokenandRefreshToken

const isPasswordCorrect = async function (
  password: string,
  dbpassword: string
) {
  //password is sent by user
  //dbpassword is password present in database
  return await bcrypt.compare(password, dbpassword);
};

const registerUser: RequestHandler = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation - not empty - required field
  //check if user alredy exists : using username and email
  //check for images , check for avatar
  //upload then to cloudinary, avatar
  //create user object - create entry in db
  //remove passsowrd and refresh token field from response
  //check for user creation
  //return response

  //Zod Validation
  //get user details from frontend
  const result = registerUserZodSchema.safeParse(req.body);
  // console.log(result)
  if (!result.success) {
    const errors = zodErrorFormat(result.error);
    throw new ApiError(400, "Validation Error for Register", [errors]);
  }

  const { email, username, password } = result.data;
  // console.log("email : ",email)

  //validation - not empty - required field
  if (
    //some will check all fields
    [email, username, password].some((field) => field?.trim() === "") //if field is present then remove whitespace or space from it and it it is still empty then return true give error
  ) {
    throw new ApiError(400, "All field are required!!");
  }

  //check if user alredy exists : using username and email
  //HERE .exists is a custom model function made in pacakages/database/extensions
  const existedUser = await prisma.user.exists({
    OR: [{ username: username }, { email: email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with same email or username alredy exists");
  }
  // console.log(existedUser);

  //create user object - create entry in db

  const user = await prisma.user.create({
    data: {
      username: username.toLowerCase(),
      email: email,
      password: password,
    },
    //remove passsowrd and refresh token field from response
    select: {
      id: true,
      username: true,
      email: true,
      password: false,
      roomId: true,
      // accessToken:true,
      refreshToken: false,
      createdAt: true,
      updatedAt: true,
    },
  });

  //check for user creation if not created throw an error
  if (!user) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  //return response

  return res.status(201).json(
    //you could have directly returned aou response but this is standard practise to do like res.status(201).json( postman also understands well with this
    new ApiResponse(200, user, "User Created Successfully !! ")
  );
});

const loginUser: RequestHandler = asyncHandler(async (req, res) => {
  //bring data by using req.body
  //check username or email
  //find the user
  //check password
  //access and refreshtoken generate
  //send token by cookies

// console.log(req.user)
  if(req.user?.id){
    let message = req.user.isGuest ? "You are alredy logged in as Guest . Please logout before you login again" : "You are alredy logged in as User . Please logout before you login again"
    throw new ApiError(400, message);
  }

  //Zod Validation
  const result = loginUserZodSchema.safeParse(req.body);
  // console.log(result)
  if (!result.success) {
    const errors = zodErrorFormat(result.error);
    throw new ApiError(400, "Validation Error in Login", [errors]);
  }
  //bring data by using req.body
  const { email, username, password } = result.data;
  // console.log(password)

  if (!(username || email)) {
    throw new ApiError(400, "Username/email is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  //check username or email
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: username }, { email: email }],
    },
  });

  //find the user

  if (!user) {
    throw new ApiError(404, "Username/email not found!!");
  }

  //this check is done because password field is made optional in database due to guest login feature added
  if (!user.password || user.password === null || user.password === undefined){
    throw new ApiError(404, "Password for the user is not found!!");
  }

  //check password
  // isPasswordCorrect bcrypt function TO CHECK IF THE ENTERED
  //Password IS SAME AS THE ONE KEPT IN database
  //Returns a Boolean value
  const isPasswordValid = await isPasswordCorrect(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials");
  }

  //access and refreshtoken generate
  const { accessToken, refreshToken } =
    await generateAccessTokenandRefreshToken(user);

  //send token by cookies
  //NOTE - in cookies we cannout pass password again so we need to update user variable
  //since we cannot use the same name password or refreshToken so we took password and
  //refreshToken and passed it to two new variables _pasword and _refreshToken and we
  // removed it from the user object so that now we can pass it in cookies

  const { password: _pasword, refreshToken: _refreshToken, ...safeUser } = user;

  const expiry = Number(process.env.ACCESS_TOKEN_EXPIRY);
  
  if (!expiry) {
    throw new ApiError(401, "User access token expiry time not set in env");
  }
  
  const expiryInMillisec = expiry * 1000  //converting expiry of jwt in sec to millisec 

  const options = {
    httpOnly: true, //for security purposes by using httpOnly cookies will only be mofiable through server cannot mondify through frontend
    secure: true,
    maxAge: expiryInMillisec //after 1day it will be cleared in browser too -> user allowed only for 1day
  }

  return res
    .status(200) //this is continuation of res just written like this for good code format
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse( //ApiResponse format
        200,
        {
          user: safeUser,
          accessToken,
          refreshToken, //its your choice to add this , here this is added by considering if user want to send data by his own
        },
        "User logged in Successfully"
      )
    );
});

const loginGuestUser: RequestHandler = asyncHandler(async (req , res) => {

    //Later Additiona if app grows :- 
    //Might add ip tracking to prevent guest session abuse -> hash the ip in database and set up a cronjob to delete it after 20days 
    
    //STEPS :- 
    //there is no need for guest to enter name and email , password and all so we will directly send to dashbaord 

    //generate a random username "guest_ab12cd"
    //check if the same guest username is present or not in database -> if yes then generate new username , if no continue 
    //create the guest with the username , give isGuest true
    //generate accessToken only no refreshToken required as guest will be loggedin only for 2hr as expiry will be 2hrs 
    //set accessToken in cookie and send success message if done 

    // console.log(req.user)
    if(req.user?.id){
        let message = req.user.isGuest ? "You are alredy logged in as Guest . Please logout before you login again" : "You are alredy logged in as User . Please logout before you login again"
        throw new ApiError(400, message);
    }

    let guestGenerateRandomUsername = generateRandomUsername();

    const guestUsernameExists = await prisma.user.exists({
        username: guestGenerateRandomUsername 
    });

    if (guestUsernameExists === true) {
        guestGenerateRandomUsername = generateRandomUsername()
    }

    const guest = await prisma.user.create({
        data: {
            username: guestGenerateRandomUsername,
            isGuest: true
        }
    })

    if (!guest) {
        throw new ApiError(500, "Failed to create guest user");
    } 

    const accessToken = generateAccessToken(guest);

    if (!accessToken) {
        throw new ApiError(500, "Failed to generate accessToken for guest");
    } 

    const { email: _email , password: _pasword, refreshToken: _refreshToken, ...safeUser } = guest;

    const expiry = Number(process.env.GUEST_ACCESS_TOKEN_EXPIRY);

    if (!expiry) {
        throw new ApiError(401, "Guest access token expiry time not set in env");
    }

    const expiryInMillisec = expiry * 1000  //converting expiry of jwt in sec to millisec 

    const options = {
        httpOnly: true, //for security purposes by using httpOnly cookies will only be mofiable through server cannot mondify through frontend
        secure: true,
        maxAge: expiryInMillisec //after 2hr it will be cleared in browser too -> guest allowed only for 2hrs 
    };

    return res
        .status(200) 
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: safeUser,
                    accessToken
                },
                "Guest logged in Successfully"
            )
        );

});

//logout made for both guest and user 
const logoutUser: RequestHandler = asyncHandler(async (req, res) => {
  //making a auth.middleware.js middleware for getting userid
  //reset refreshToken
  //remove cookies

  //making a auth.middleware.js middleware for getting userid
  //reset refreshToken

  // console.log(req)
  

  if(req.user?.isGuest === false) {

    const loggingOutUser = await prisma.user.update({
        where: {
            id: req.user?.id,
        },
        data: {
            refreshToken: null, //there is no unset in Prisma and we cant clear the field because Prisma doesn’t support "removing" fields (it uses SQL under the hood, where fields always exist — they’re just null if empty).
        },
    }); 

    if (!loggingOutUser) {
        throw new ApiError(500, "Logout Failed ! Internal Server Error");
    }

  }

  //remove cookies
  const options = {
    httpOnly: true, //for security purposes by using httpOnly cookies will only be mofiable through server cannot mondify through frontend
    secure: true,
  };

  let response = res.status(200).clearCookie("accessToken", options);
  let message = "Guest logged out Successfully"

  if (!req.user?.isGuest) {
    response = response.clearCookie("refreshToken", options);
    message = "User logged out Successfully"
  }

  return response.json(new ApiResponse(200, {}, message));
  
});

const refreshAccessToken: RequestHandler = asyncHandler(async (req, res) => {
  //NOTE:- Since access token is short lived and refresh token is longlived
  //so if user is using the app and accessToken gets expired then user gets an 401 error
  //hence to avoid this -> if user is still using the app and access token getsexpired then
  //frontend will send a request to server to generate new accessToken for that user by using the refreshToken
  //if they are equal then user gets access and keeps working.

  //catch the incomingRefreshToken

 
  if(!req.cookies.refreshToken || !req.body.refreshToken){
    throw new ApiError(400, "You are logged in as a guest and are not allowed to perform this operation. Please log out and log in with a registered account to continue.");
  }

  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken; //req.body.refreshToken is written for mobile users
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new ApiError(401, "REFRESH_TOKEN_SECRET is not defined");
    }

    //decoding token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (typeof decodedToken === "object" && "id" in decodedToken) {
      //check database refreshtoken with incomingRefreshToken
      const user = await prisma.user.findFirst({
        where: {
          id: decodedToken?.id,
        },
      });

      if (!user) {
        throw new ApiError(401, "Invalid Refresh Token");
      }
      if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh Token Expired !!");
      }

      //generateAccessTokenandRefreshToken and cookie
        const expiry = Number(process.env.ACCESS_TOKEN_EXPIRY);
        
        if (!expiry) {
            throw new ApiError(401, "User access token expiry time not set in env");
        }
        
        const expiryInMillisec = expiry * 1000  //converting expiry of jwt in sec to millisec 

        const options = {
            httpOnly: true, //for security purposes by using httpOnly cookies will only be mofiable through server cannot mondify through frontend
            secure: true,
            maxAge: expiryInMillisec //after 1day it will be cleared in browser too -> user allowed only for 1day
        }


      //giving the refreshToken generated to newrefreshToken
      const { accessToken, refreshToken: newrefreshToken } =
        await generateAccessTokenandRefreshToken(user);
      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
          new ApiResponse(
            200,
            { accessToken, refreshToken: newrefreshToken },
            "Access Token Refreshed"
          )
        );
    } else {
      throw new ApiError(401, "Failed to Decode Token");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(401, error.message);
    } else {
      throw new ApiError(401, "Invalid Refresh Token");
    }
  }
});

const getAccessToken: RequestHandler = asyncHandler(async(req,res) => {

  if(!req){
    throw new ApiError(404, "Request Not Found");
  }

  const token:string = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

  if(!token){
      throw new ApiError(401, "Unauthorized Request")
  }

  const userId = req.user?.id
  
  if(!userId){
    throw new ApiError(404, "User Id not found in request object")
  }

  const decodedToken = verifyAccessToken(token,'notws')

  if (!decodedToken || typeof decodedToken !== 'object' || !('id' in decodedToken)) {
    throw new ApiError(500, "Failed to get access token");
  }

  if(userId !== decodedToken.id){
    throw new ApiError(401, 'Access denied: You are not authorized to access this resource.');
  }

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      token,
      "Current User AccessToken Fetched Successfully"
    )
  );

})


const changeCurrentPassword: RequestHandler = asyncHandler(async (req, res) => {

  if(req.user?.isGuest === true){
    throw new ApiError(400, "You are logged in as a guest and are not allowed to perform this operation. Please log out and log in with a registered account to continue.");
  }
  //Zod Validation
  const result = changeCurrentPasswordZodSchema.safeParse(req.body);
  // console.log(result)
  if (!result.success) {
    const errors = zodErrorFormat(result.error);
    throw new ApiError(400, "Validation Error for Change Current Password", [
      errors,
    ]);
  }

  //check weather oldpassword entered is correct or not
  const { oldpassword, newpassword } = result.data;

  // console.log(req.user?.id)

  const user = await prisma.user.findFirst({
    where: {
      id: req.user?.id,
    },
  });

  if (!user) throw new ApiError(404, "User not found");

    //this check is done because password field is made optional in database due to guest login feature added
  if (!user.password || user.password === null || user.password === undefined){
    throw new ApiError(404, "Password for the user is not found!!");
  }

  const isPassCorrect = await isPasswordCorrect(oldpassword, user.password);
  if (!isPassCorrect) {
    throw new ApiError(400, "Invalid Old Password!!");
  }

  //update newpassword

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: newpassword,
    },
    select: {
      id: true,
      username: true,
      email: true,
      password: false,
      roomId: true,
      // accessToken:false,
      refreshToken: false,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Password Changed Successfully"));
});

const getCurrentUser: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user)
    throw new ApiError(404, "Current User request object not found");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.user,
        "Current User Details Fetched Successfully"
      )
    );
});

const updateAccountDetails: RequestHandler = asyncHandler(async (req, res) => {

  if(req.user?.isGuest === true){
    throw new ApiError(400, "You are logged in as a guest and are not allowed to perform this operation. Please log out and log in with a registered account to continue.");
  }
  
  //Zod Validation
  const result = updateAccountDetailsZodSchema.safeParse(req.body);
  // console.log(result)
  if (!result.success) {
    const errors = zodErrorFormat(result.error);
    throw new ApiError(400, "Validation Error for Update Account Details", [
      errors,
    ]);
  }

  const { username, email } = result.data;

  if (!username || !email) {
    throw new ApiError(400, "All Fields are Required !!");
  }

  if (req.user?.username === username && req.user?.email === email) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, "No changes detected. Profile already up to date.")
      );
  }

  const user = await prisma.user.update({
    where: {
      id: req.user?.id,
    },
    data: {
      username: username,
      email: email,
    },
    select: {
      id: true,
      username: true,
      email: true,
      password: false,
      roomId: true,
      // accessToken:false,
      refreshToken: false,
      isGuest: true,
      lastLoginAt:true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details Updated Successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  loginGuestUser
};
