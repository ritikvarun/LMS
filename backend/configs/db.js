import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("✅ MongoDB Connected successfully")
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message)
    }
}
export default connectDb