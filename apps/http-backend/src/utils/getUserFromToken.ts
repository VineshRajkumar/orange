import { ApiError } from "@repo/backend-common";
import { prisma } from "@repo/database";
import jwt from "jsonwebtoken"
import { SafeUser } from "@repo/backend-common";

export async function getUserFromToken(token: string): Promise<SafeUser> {

    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new ApiError(401, 'ACCESS_TOKEN_SECRET is not defined');
    }

    // Synchronously verify given token using a secret or a public key to get a decoded token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET )

    
    
    if (typeof decodedToken === 'object' && 'id' in decodedToken) {
        

        const user = await prisma.user.findUnique(
            {
                where:{
                    id:decodedToken?.id
                },
                select: {
                    id:true,
                    username:true,
                    email:true,
                    password:false,     
                    isGuest:true,
                    roomId:true,       
                    // accessToken:true, 
                    refreshToken:false,
                    createdAt:true,         
                    updatedAt:true,    
                    lastLoginAt:true
                }
            }
        ) as 
        SafeUser | null
        

        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }

        return user

    }
    else{
        throw new ApiError(401, 'Failed to Decode Token');
    }

}