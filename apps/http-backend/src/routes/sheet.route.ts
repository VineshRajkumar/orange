import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { deleteSheet, loadSheetId, loadSheets, makeSheet, saveSheet, searchSheet } from "../controllers/sheet.controller";


const sheetRouter = Router()

//secured routes
sheetRouter.route("/make-sheet").post(verifyJWT, makeSheet) 

sheetRouter.route("/load-sheets").get(verifyJWT , loadSheets)

sheetRouter.route("/load-sheet/s/:sheetId").get(verifyJWT , loadSheetId)

sheetRouter.route("/save-sheet").post(verifyJWT , saveSheet) 

sheetRouter.route("/delete-sheet/s/:sheetId").delete(verifyJWT, deleteSheet);

sheetRouter.route("/search-sheet").get(verifyJWT, searchSheet);


export default sheetRouter;