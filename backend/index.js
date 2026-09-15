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

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
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

app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
});
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

// Global error handler middleware (catches multer, stream, and unhandled routing errors)
app.use((err, req, res, next) => {
    console.error("Global Server Error:", err?.message || err);
    if (res.headersSent) {
        return next(err);
    }
    return res.status(err.status || 500).json({
        message: err.message || "An unexpected server error occurred during request",
        error: process.env.NODE_ENV === "development" ? err : undefined
    });
});

process.on("uncaughtException", (err) => {
    console.error("CRITICAL Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("CRITICAL Unhandled Rejection at:", promise, "reason:", reason);
});

app.listen(port , ()=>{
    console.log("Server Started on port", port)
    connectDb()
})

