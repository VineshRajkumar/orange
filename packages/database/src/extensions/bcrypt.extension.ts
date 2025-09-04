// import { Prisma } from "@prisma/client/extension";
import bcrypt from "bcrypt";
import { Prisma } from "../../generated/prisma";

//Read about prisma extension i have written in notes

// NOTE :- YOU CANNOT MOVE Prisma.defineExtension to app/http-backend 
// beacuse it will give error as You're importing Prisma from a generated
// Prisma client (@repo/db) since prisma is alredy generated you cannot 
// do extends or modify the prisma folder thats why it gives error.
//  Hence extensions folder should be in packages/database so that 
// before being generated the extensions can modify the Prisma.

//bcryptExtension is extended in client.ts file

type UserInput = { password?: string };

export const bcryptExtension = Prisma.defineExtension({
  name: "bcrypt-hash-extension",
  query: {
    user: {
      async $allOperations({ operation, args, query }) {
        if (["create", "update"].includes(operation) && "data" in args) {
          const data = args.data as UserInput;

          if (data.password && !data.password.startsWith("$2")) {
            data.password = await bcrypt.hash(data.password, 10);
          }
          args.data = data;
        }
        return query(args);
      },
    },
  },
})

