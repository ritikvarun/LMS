import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./configs/db.js"
import authRouter from "./routes/authRoute.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/userRoute.js"
import courseRouter from "./routes/courseRoute.js"
import paymentRouter from "./routes/paymentRoute.js"
import liveClassRouter from "./routes/liveClassRoute.js"
import mockTestRouter from "./routes/mockTestRoute.js"
import bookRouter from "./routes/bookRoute.js"
import contactRouter from "./routes/contactRoute.js"

let port = process.env.PORT || 8000
let app = express()
app.use(express.json())
app.use(cookieParser())
app.use("/public", express.static("public"))
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/course", courseRouter)
app.use("/api/payment", paymentRouter)
app.use("/api/live", liveClassRouter)
app.use("/api/mocktest", mockTestRouter)
app.use("/api/book", bookRouter)
app.use("/api/contact", contactRouter)


app.get("/" , (req,res)=>{
    res.send("Hello From Server")
})

app.listen(port , ()=>{
    console.log("Server Started")
    connectDb()
})

