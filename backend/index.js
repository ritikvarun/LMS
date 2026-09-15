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

// Trust proxy is required for Render / reverse proxies so secure cookies work over HTTPS
app.set("trust proxy", 1)

app.use(express.json())
app.use(cookieParser())
app.use("/public", express.static("public"))

// Dynamic CORS configuration allowing localhost, local IP, FRONTEND_URL, Vercel, and Render domains
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:4173",
    process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/+$/, "") : null
].filter(Boolean)

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(origin) ||
            /^https:\/\/[a-zA-Z0-9_-]+\.onrender\.com$/.test(origin)
        ) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
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

