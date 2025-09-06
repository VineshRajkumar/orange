// import 'dotenv/config'
import dotenv from 'dotenv';
import path from 'path';
// import { connectDB } from '@repo/backend-common'
import { app } from './app';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/* Why connectDB not required in prisma ? 
Ans) This is because in mongodb once db is started it keep it on and then if any 
error occurs then it will close the db connection and give the error but this 
is not the case with prisma in prisma connection is lazily connected that means 
when you send a query(findUnique,create,insert,delete..) it will automatically 
connect the db and then perform the opertation so that means it switches on and 
off the db as per the query so thats why using connectDB had no use because this 
is also like a query it will just run for first time when server starts and also 
query checks or any errors related to query are done using the retryExtension
middlewate that runs before each query is fired  

connectDB()
.then(()=>{

    //app.on listening for an event called error if found then this will trigger
    
    app.on("error",(error)=>{
        console.log('ERROR: ',error);
        throw error
    })
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server running at port : http://localhost:${process.env.PORT}/`)
    })

})
.catch((err)=>{
    console.log("Prisma db connection Failed",err)
})*/

//app.on listening for an event called error if found then this will trigger

app.on("error",(error)=>{
    console.log('ERROR: ',error);
    throw error
})
app.listen(process.env.PORT||8000,()=>{
    console.log(`Server running at port : ${process.env.BACKEND_URL}`)
})