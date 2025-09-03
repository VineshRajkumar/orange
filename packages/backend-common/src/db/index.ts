import { prisma } from "@repo/db"

const connectDB = async() => {
    try{
        
        await prisma.$connect()
        console.log("\n✅ Prisma connected to the database successfully!")

    } catch(error){

        console.error("❌ Prisma database connection error:", error)
        process.exit(1)

    }
    
}
export default connectDB;