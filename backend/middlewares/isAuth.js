import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const isAuth = async (req, res, next) => {
    try {
        const headerToken = req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : req.headers.authorization;
        const token = req.cookies?.token || headerToken;

        if (token) {
            try {
                const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
                if (verifyToken && verifyToken.userId) {
                    req.userId = verifyToken.userId;
                    return next();
                }
            } catch (err) {
                // If invalid, proceed to dev fallback
            }
        }

        // Direct development access fallback for admin
        if (process.env.NODE_ENV !== "production") {
            const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase().trim() : "ritikvarun65@gmail.com";
            const adminUser = await User.findOne({ email: adminEmail });
            if (adminUser) {
                req.userId = adminUser._id;
                return next();
            }
        }

        return res.status(401).json({ message: "Authentication required. No token provided." });
    } catch (error) {
        return res.status(401).json({ message: `Authentication error: ${error.message || "Invalid session"}` });
    }
};

export default isAuth;