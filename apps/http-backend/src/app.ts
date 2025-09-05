import cookieParser from "cookie-parser"
import express from "express"
import cors from 'cors';
// import 'dotenv/config'
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app  = express()

// app.use(cors({
//     origin: process.env.CORS_ORIGIN, //so that only frontend can access backend -> security
//     credentials:true, //allows server to accept cookies,headers,client certificates etc
//     methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'], //needed for nextjs frontend
//     allowedHeaders: ['Content-Type','Authorization'], //needed for nextjs frontend
// }))

const ALLOWED_ORIGINS = new Set([
  'https://orangeboard.vercel.app',
  'http://localhost:3000',
]);

const corsOptions: cors.CorsOptions = {
  origin(origin, cb) {
    // allow SSR/no-origin, and explicit whitelisted origins
    if (!origin || ALLOWED_ORIGINS.has(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  // ❌ Do NOT pin allowedHeaders; let the cors package reflect the request headers.
  // allowedHeaders: undefined
};
app.use(cors(corsOptions));

// handle preflight OPTIONS requests for nextjs frontend 
// Preflight means browser asking permission first to the backend 
// and OPTIONS handler means backend server giving that permission
// * here means to match this cors thing to all routes in express
// app.options('*', cors());
app.options('*', cors(corsOptions));

//these are for parsing so that when data comes express doesnot face any problem
app.use(express.json({limit:"16kb"})) //json file limit -  Middleware to parse JSON request bodies
app.use(express.urlencoded({extended:true,limit:"16kb"})) //make url encoded - Middleware to parse URL-encoded data
app.use(express.static("public")) //to store pdf files
app.use(cookieParser())

// -----------
// app.set is used to store configuration settings 
// for your app -> Enable/disable features , 
// Store environment values, Control how 
// Express behaves
app.set('trust proxy', true) //This is Express way of getting 
// ip address -> this is used to get the original 
// ip address of user even if behind any proxy
// (like Vercel,heroku) -> This tells Express to 
// trust the X-Forwarded-For header where the clients
// original ip address is present 
// -----------


//routes
import userRouter from "./routes/user.route";
import sheetRouter from "./routes/sheet.route";
import roomRouter from "./routes/room.routes";



//routes declaration
//we will not use app.get as router file is saved in another file here app.use will be used
app.use("/api/v1/users",userRouter) //passes control to userrouter router
//using api/v1/users is standard practise
app.use("/api/v1/sheets",sheetRouter)

app.use("/api/v1/rooms",roomRouter)

//-----------------------------------------------
//NOT NEEDED NOW AS asyncHandler CAN HANDLE THE ERROR FORMAT 
// BUT THIS CAN BE ONE MORE OPTION WHEN asyncHandler IS NOT USED 

//Error Handling so that ApiError can work properly -> Read about it more in ApiError.middleware.ts file

// app.use(errorHandler as ErrorRequestHandler); 
//-----------------------------------------------


export {app}