import { RequestHandler } from "express-serve-static-core"
import { asyncHandler } from "../utils/asyncHandler"
import { ApiError } from "@repo/backend-common";
import { zodErrorFormat , saveSheetDataSchema  } from "@repo/zodschemas";
import { prisma } from "@repo/database";
import * as sheetService from "../services/sheet.services";
import { ApiResponse } from "../utils/ApiResponse";



const makeSheet:RequestHandler = asyncHandler(async (req,res)=>{
    //Steps :- 
    //Get the userid ->  req.user.id 
    //Get the title compulsory if not given give error 
    //let the data be data = draw_elementsType[] initially 
    //Create the sheet in database with title , data , ownerid 
    //If created return the the sheet id , title , ownerid of the sheet 

    if (!req.user) throw new ApiError(404, "Current User request object not found");

    if(req.user?.isGuest === true){
        const currentGuestId =  req.user.id

        const guestSheetExists = await prisma.sheet.findFirst({
            where: {
                ownerId: currentGuestId
            }
        })

        if(guestSheetExists){
            throw new ApiError(400, 'Guest users are allowed to create only one sheet. Please log in to create more.');
        }   
    }

    const newSheetCreated = await sheetService.makeSheet( req.user.id , req.body)
 
    return res.status(201).json( 
        new ApiResponse(200, newSheetCreated ,"Sheet Created Successfully !! ")
    )

}) 

const loadSheets:RequestHandler = asyncHandler(async (req,res)=>{
    //Steps :- 
    //Get the user id from req.user.id 
    //make a findUnique request to db with userid 
    //return all the sheets with id,title,data 

    if (!req.user) throw new ApiError(404, "Current User request object not found");

    const currentUserId =  req.user.id

    const sheets = await prisma.user.findUnique({
        where:{
            id: currentUserId
        },
        select: {
            id: true,
            username: true,
            sheets: {
                orderBy:{
                    createdAt: 'desc'
                }
            }
        },
       
    })

    if(!sheets){
        throw new ApiError(500,"Unable to Load sheets")
    }

    return res.status(201).json( 
        new ApiResponse(200, sheets ,"All Sheets Loaded Successfully !! ")
    )

}) 

const loadSheetId:RequestHandler = asyncHandler(async (req,res)=>{
    //Steps :- 
    //Take the sheetid from req.body 
    //Search the sheetid in database 
    //Return the sheetid,title,data 

    if (!req.user) throw new ApiError(404, "Current User request object not found");
    const currentUserId =  req.user.id

    const {sheetId} = req.params

    if(!sheetId ){
        throw new ApiError(400,"SheetId is required")
    }

    const fetchedSheet = await sheetService.loadSheetId(sheetId)

    return res.status(201).json( 
        new ApiResponse(200, fetchedSheet ,"Sheet Loaded Successfully !! ")
    )


}) 

const saveSheet:RequestHandler = asyncHandler(async (req,res)=>{
    //Steps :- 
    //data would be in form  "data": { "elements": [], "appState": {} }
    //Get the sheetid , data from req.body 
    // no need to check if same data is coming because that will again take one more db call 
    //(THIS WAS WRITTEN PREVIOUSLY) The data from the frontend will be got by the onchange event handler which will track the changes store it in variable and give us the data in json format 
    //(UPDATED) The data from the frontend will come from the diagrams array 
    //Update the data to latest data in the database 
    //Send a response sheet saved and data if required 

    if (!req.user) throw new ApiError(404, "Current User request object not found");
    const currentUserId =  req.user.id
    const isGuest = req.user.isGuest

    //Zod Validation
    const result = saveSheetDataSchema.safeParse(req.body);
    // console.log(result)

    if (!result.success) {
        const errors = zodErrorFormat(result.error);
        // console.log(errors)
        throw new ApiError(400, "Validation Error", [errors]);
    }

    const { sheetId, data } = result.data;

    if(!sheetId){
        throw new ApiError(400,"Sheet Id is Required !!")
    }
    if(!data){
        throw new ApiError(400,"Drawing Elements are Required !!")
    }

    
    // get sheet to check ownership -> if the sheet belong to same owner then save in that sheet or else create new sheet for that user/guest
    const sheet = await prisma.sheet.findUnique({
        where: { id: sheetId },
    });

    if (!sheet) {
        throw new ApiError(404, "Sheet not found");
    }

    let savedData;
    const sheetOwnership = sheet.ownerId === currentUserId

    if (sheetOwnership) {
        // owner saving the sheet so update the existing sheet
        savedData = await prisma.sheet.update({
            where: { id: sheetId },
            data: { data:data }
        });

    } else {

        //Preventing guest users from saving more than one sheet
        if (isGuest) {
            const guestSheetCount = await prisma.sheet.count({
                where: { ownerId: currentUserId }
            });

            if (guestSheetCount >= 1) {
                throw new ApiError(403, "Guest users are allowed to save only one sheet");
            }
        }

        //  not the owner so create a duplicate sheet with current user as owner and same title
        savedData = await prisma.sheet.create({
            data: {
                title: sheet.title,
                ownerId: currentUserId,
                data:data,
            },
        });
    }

    if(!savedData){
        throw new ApiError(500,`Unable to save sheet`)
    }

    return res.status(201).json( 
        new ApiResponse(200, savedData , sheetOwnership ? "Sheet Saved to DB Successfully !!" : "Created Duplicate Sheet and Saved to DB Successfully !!")
    )


}) 

const deleteSheet: RequestHandler = asyncHandler(async (req, res) => {
    // Steps:
    // 1. Get user ID from req.user
    // 2. Get sheetId from req.params
    // 3. Check if sheet exists and belongs to the user
    // 4. Delete the sheet from DB
    // 5. Return success response

    if (!req.user) throw new ApiError(404, "Current User request object not found");
    const currentUserId = req.user.id;

    const { sheetId } = req.params;
    if (!sheetId) {
        throw new ApiError(400, "SheetId is required");
    }

    // Ensure the sheet exists and belongs to the current user
    const existingSheet = await prisma.sheet.findUnique({
        where: {
            id: sheetId,
            ownerId: currentUserId
        }
    });

    if (!existingSheet) {
        throw new ApiError(404, `Sheet not found or access denied`);
    }

    // Delete the sheet
    const deletedSheet = await prisma.sheet.delete({
        where: {
            id: sheetId
        }
    });

    return res.status(200).json(
        new ApiResponse(200, deletedSheet, `Sheet deleted successfully!`)
    );
});

const searchSheet: RequestHandler = asyncHandler(async(req, res) => {

    if (!req.user) throw new ApiError(404, "Current User request object not found");

    const currentUserId =  req.user.id

    const title = typeof req.query.title === "string" ? req.query.title : undefined;

    const result = await prisma.sheet.findMany({
        where: {
            ownerId: currentUserId,
            OR: [
                {
                    title: {
                        search: title
                    }
                },
                {
                    title: {
                        contains: title,
                        mode: 'insensitive',
                    }
                }
            ]
        }
    })

    if(!result ){
        return res.status(200).json(
            new ApiResponse(200, {}, `Sheet Not Found`)
        );
    }
    else {
        return res.status(200).json(
            new ApiResponse(200, result, `Sheet Found successfully!`)
        );
    }

})


export {
    makeSheet,
    loadSheets,
    loadSheetId,
    saveSheet,
    deleteSheet,
    searchSheet

}