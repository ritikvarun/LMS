import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ message: "Authentication required. No token provided." });
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!verifyToken || !verifyToken.userId) {
            return res.status(401).json({ message: "Invalid or expired authentication token." });
        }

        req.userId = verifyToken.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: `Authentication error: ${error.message || "Invalid session"}` });
    }
};

export default isAuth;