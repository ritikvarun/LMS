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

// Helper to clean environment URLs (remove quotes, whitespace, and trailing slashes)
const cleanUrl = (url) => (url || "").replace(/^["']|["']$/g, "").trim().replace(/\/+$/, "");

// Dynamic CORS configuration allowing localhost, local IP, FRONTEND_URL, ADMIN_URL, Vercel, Netlify, and Render domains
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://localhost:4173",
    cleanUrl(process.env.FRONTEND_URL),
    cleanUrl(process.env.ADMIN_URL)
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        // Normalize origin: remove trailing slash
        const normalizedOrigin = origin.replace(/\/+$/, "");

        const isAllowed =
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin) ||
            allowedOrigins.includes(normalizedOrigin) ||
            /^https?:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/.test(normalizedOrigin) ||
            /^https?:\/\/([a-zA-Z0-9-]+\.)*netlify\.app$/.test(normalizedOrigin) ||
            /^https?:\/\/([a-zA-Z0-9-]+\.)*onrender\.com$/.test(normalizedOrigin) ||
            /^https?:\/\/([a-zA-Z0-9-]+\.)*pages\.dev$/.test(normalizedOrigin);

        if (isAllowed) {
            return callback(null, true);
        }

        console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    optionsSuccessStatus: 200
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

