import { ApiError } from "@repo/backend-common";
import { draw_elementsType } from "@repo/backend-common";
import { sheetTitleSchema, zodErrorFormat  } from "@repo/zodschemas";
import { prisma } from "@repo/db";
import { Sheet } from "@prisma/client";
import { z } from 'zod'


type SheetInput = z.infer<typeof sheetTitleSchema>;

//( userId:string , data: SheetInput ) => Promise<Sheet> = <- this is written due to typescript as it was not able to get the prisma file properly 
export const makeSheet:( userId:string , data: SheetInput ) => Promise<Sheet> = async ( userId:string , data: SheetInput ) => {
    //Steps :- 
    //Get the userid ->  req.user.id 
    //Get the title compulsory if not given give error 
    //let the data be data = draw_elementsType[] initially 
    //Create the sheet in database with title , data , ownerid 
    //If created return the the sheet id , title , ownerid of the sheet 

    const currentUserId = userId

     //Zod Validation
    const result = sheetTitleSchema.safeParse(data) 
    
    if(!result.success){
        const errors = zodErrorFormat(result.error)
        throw new ApiError(400,"Validation Error for makeSheet", [errors])
    }
    const {title} = result.data

    if(!title){
        throw new ApiError(400,"Sheet Title is Required !!")
    }

    const sheetElements: draw_elementsType[] = [];

    const sheet = await prisma.sheet.create({
        data: {
            title: title,
            data: sheetElements,
            ownerId: currentUserId
        },
        select: {
            id:true,
            title: true,
            data: false,
            ownerId: true,
            createdAt:true,         
            updatedAt:true  
        }
    })

    if(!sheet){
        throw new ApiError(500,"Something went wrong while creating sheet")
    }

    return sheet;
}

export const loadSheetId:(sheetId:string , currentUserId?: string) => Promise<Sheet> = async ( sheetId:string , currentUserId?: string) => {

   
    const sheet = await prisma.sheet.findUnique({
        where:{
            id: sheetId,
            ...(currentUserId ? { ownerId: currentUserId } : {})
        }
    })

    
    if(!sheet){
        throw new ApiError(500,`Wrong Sheet Id :- Unable to Load sheetId ${sheetId}`)
    }

    return sheet
}