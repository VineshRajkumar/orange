import { Prisma } from "@prisma/client/extension";

// Read about prisma extension i have written in notes

/*EXPLANATION OF CODE :- 

Here this extension is responsible for telling if a 
record is present or not in db.

1) model -> means to make your custom Model function like findMany(),findFirst() 
2)  $allModels: -> apply to all models like User or any other model 
3) async exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> :- 
    
    a) here output will be either true or false thats 
    why we wrote Promise<boolean>

    b) this:T means -> it refers to current model like 
    if current model is prisma.user then This:user 

    c) where: Prisma.Args<T, 'findFirst'>['where'] -> 
        You must pass a where filter same as you pass
         it in findFirst like here we are defing the 
         type of where and saying that type of 
         where should match the type of findFirst

4) Prisma.getExtensionContext(this) -> this gets all the 
Model functions propeties like count,$gt(greater) 

5) const count = await (context as any).count({
          where,
          take: 1
        } as Prisma.Args<T, 'count'>); 
    
    Here this means :- 
        a) This line runs a count query, but:

            i) It passes a where clause (your filter).
            ii) It adds take: 1 for optimization — tells Prisma: "Just check for 1 record, don't count them all."

        b) "as any" is used to bypass TypeScript type checks here, because Prisma doesn't yet expose this context in a strongly-typed way.
        c) The cast as Prisma.Args<T, 'count'> helps TypeScript know what shape the query should be.

6) return count > 0; :- 

    a) If count is more than 0 → something exists → return true
    b) If count is 0 → nothing matches the filter → return false
*/

export const existsExtension = Prisma.defineExtension({
  name: 'exists-extension',
  model: {
    $allModels: {
      async exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> {
        const context = Prisma.getExtensionContext(this);
        const count = await (context as any).count({
          where,
          take: 1
        } as Prisma.Args<T, 'count'>);
        return count > 0;
      }
    }
  }
});

