import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { changeCurrentPassword,  getAccessToken,  getCurrentUser,  loginGuestUser,  loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails } from "../controllers/user.controller";
import { checkAlreadyLoggedIn } from "../middlewares/checkAlredyLoggedIn.middleware";
import { guestLoginLimiter } from "../middlewares/guestLogin-rateLimiter.middleware";

const userRouter = Router()

userRouter.route("/register").post(registerUser)

userRouter.route("/login").post(checkAlreadyLoggedIn, loginUser)

userRouter.route("/login-guest").post( guestLoginLimiter , checkAlreadyLoggedIn, loginGuestUser)

//secured routes
userRouter.route("/logout").post(verifyJWT, logoutUser) //verifyJWT is a middleware

userRouter.route("/refresh-token").post(refreshAccessToken)

userRouter.route("/get-access-token").get(verifyJWT , getAccessToken)

userRouter.route("/change-password").post(verifyJWT , changeCurrentPassword)

userRouter.route("/current-user").get(verifyJWT , getCurrentUser)

userRouter.route("/update-account").patch(verifyJWT , updateAccountDetails) //.patch is used here to only update some details or else all details will get updated


export default userRouter;