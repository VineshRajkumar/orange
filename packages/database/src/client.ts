
import { PrismaClient } from "@prisma/client";
import { bcryptExtension } from "./extensions/bcrypt.extension";
import { existsExtension } from "./extensions/exists.extension";
import { retryExtension } from "./extensions/retry.extension";

// Combine extensions 
const extendedPrisma = new PrismaClient()
  .$extends(bcryptExtension)
  .$extends(existsExtension)
  .$extends(retryExtension)

//prisma: typeof extendedPrisma; -> 
// this is done for typescript so that 
// new extension can be added

// HERE Prisma(for backend) is set as global during 
// development so that it doesnot create multiple prisma clients 
// this is not needed in production as this file will run only once when server starts 
const globalForPrisma = global as unknown as { prisma: typeof extendedPrisma; };


export const prisma = globalForPrisma.prisma || extendedPrisma;


if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

