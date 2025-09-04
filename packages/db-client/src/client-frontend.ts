//THIS FILE IS NOT THE MAIN FILE THIS FILE IS ONLY FOR FRONTEND TO USE WHILE SERVER SIDE RENDERING AS BCRYPT DOESNOT SUPPORT IN FRONTEND (bcrypt requires a native build which isn’t being found in my environment (Windows + Node 20).) 

// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from '../../database/generated/prisma'
import { existsExtension } from "./extensions/exists.extension";
import { retryExtension } from "./extensions/retry.extension";

// Combine extensions 
const frontend_extendedPrisma = new PrismaClient()
  .$extends(existsExtension)
  .$extends(retryExtension)


let prismaFrontend: typeof frontend_extendedPrisma;


//prisma: typeof extendedPrisma; -> 
// this is done for typescript so that 
// new extension can be added


// HERE  Prisma(for frontend) is set as global during 
// development so that it doesnot create multiple prisma clients 
// this is not needed in production as this file will run only once when server starts 
if (typeof global !== "undefined") {

    // This can be used for Node/SSR environment in nextjs 
    const globalForFrontend = global as unknown as { prismaFrontend?: typeof frontend_extendedPrisma };
    prismaFrontend = globalForFrontend.prismaFrontend || frontend_extendedPrisma;
    if (process.env.NODE_ENV !== "production") globalForFrontend.prismaFrontend = prismaFrontend;

} else {

    // global is not present in broweser so this is fallback 
    prismaFrontend = frontend_extendedPrisma;

}

export { prismaFrontend };
