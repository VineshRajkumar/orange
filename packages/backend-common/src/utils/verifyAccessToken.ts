import { ApiError } from "./ApiError";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";



export const verifyAccessToken = (token:string, type?:"ws"|"notws") => {

    const errcode = type === "ws" ? 1011 : 401

    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new ApiError(errcode, 'ACCESS_TOKEN_SECRET is not defined');
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (typeof decodedToken === 'object' && 'id' in decodedToken) {
            return decodedToken;
        } else {
            throw new ApiError(errcode, 'Invalid token payload');
        }
    } catch (err) {
        if (err instanceof TokenExpiredError) {
            throw new ApiError(errcode, 'Token has expired');
        }
        if (err instanceof JsonWebTokenError) {
            throw new ApiError(errcode, `Invalid token: ${err.message}`);
        }
        throw new ApiError(errcode, 'Token verification failed');
    }
}