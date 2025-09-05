import { ApiError } from "@repo/backend-common"
import { prisma } from "@repo/database"

export const dbremoveRoomId = async (userId: string) => {
    if(!userId){
        throw new ApiError(1008, "UserId is required")
    }
    
    const removeRoomId = await prisma.user.update({ 
        where: { id: userId }, 
        data: { roomId: null }, 
        select: { id: true, roomId: true} 
    }) 

    if (!removeRoomId) { 
        console.error("Failed to remove roomid from db") 
        return false; 
    }

    console.log(`Removed User ${userId} RoomId from DB`)
    return true;
}

export const dbremoveRoomIdForAll = async (roomId: string) => {
    if(!roomId){
        throw new ApiError(1008, "RoomId is required")
    }

    const [updatedUsers, updatedSheets] = await prisma.$transaction([
        prisma.user.updateMany({
            where: { roomId: roomId },
            data: { roomId: null }
        }),
        prisma.sheet.updateMany({
            where: { roomId: roomId },
            data: { roomId: null }
        })
    ])

    if (updatedUsers.count === 0 && updatedSheets.count === 0) {
        console.error("Failed to remove roomids of all users and sheets from db")
        return false
    }

    console.log(`Removed User RoomId and Sheet RoomId from DB`)
    return true;
}