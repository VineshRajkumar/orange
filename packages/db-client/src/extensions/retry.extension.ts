// import { Prisma } from "@prisma/client/extension";

import { Prisma } from "../../../database/generated/prisma";

//NEON DB OFTEN SLEEPS SO SOMETIMES THE DB SERVER MIGHT TAKE TIME TO START 
// BUT IF PRISMA FIRES REQUEST BEFORE IT STARTS THEN IT WILL GIVEN THE 
// P1001 ERROR -> AND SAYS -> Can't reach database server -> TO AVOID 
// THIS THIS MIDDLEWARE WILL RUN BEFORE EACH QUERY IS FIRED AND IF ANY 
// SUCH CASE OCCURS WHERE DB WAS SLEEP AND ERROR CODE P1001 WAS RECEIVED 
// THEN THEN WOULD RETRY THE QUERY 3 TIMES 2 SECONDS GAP EACH RETRY AND IF 
// IT STILL DOESNT OPEN THEN IT WILL GIVE THE ERROR BUT I THINK 3 RETRIES 
// ARE ENOUGH FOR IT TO OPEN  
// THIS IS A MIDDLEWARE WILL RUN FOR ALL QUERIES AND ALL MODELS (user,sheet) AND ALL OPERATIONS (create,update,delete,findUnique...)


export class CustomApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    //  prototype chain 
    Object.setPrototypeOf(this, new.target.prototype);

  }
}

export const retryExtension = Prisma.defineExtension({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        let retries = 3;

        while (retries > 0) {
          try {
    
            const result = await query(args); // running the original Prisma query
            console.log(`✅ Prisma query succeeded on Retry Number :- ${ 4 - retries }`);
            return result;
            
          } catch (err: any) {

            if (err.code === "P1001" && retries > 0) {
              //if neon not active 

              console.log("⚠️ Neon DB sleeping, retrying...");
              console.log(`Retry Number :- ${ 4 - retries }`)
              retries--;
              await new Promise((res) => setTimeout(res, 2000)); // wait before retry

            } else {
              // rethrow other prisma related errors
              console.log(`Retry Number :- ${ 4 - retries }`)
              console.log("❌ Prisma query ERROR :-", err);
              throw new CustomApiError(503,"Database is currently unavailable. \nPlease try again later.") 
              
            }
          }
        }

        // If retries exhausted
        console.log("❌ ERROR :: Their is some issue with Prisma or Neon ");
        console.log(`Retry Number :- ${ 4 - retries }`)
        throw new CustomApiError(503,"Database is currently unavailable. \nPlease try again later.") 


      },
    },
  },
});
