import uploadOnCloudinary from "../configs/cloudinary.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const getCurrentUser = async (req, res) => {
    try {
        const { token } = req.cookies || {};
        if (token) {
            let verifyToken;
            try {
                verifyToken = jwt.verify(token, process.env.JWT_SECRET);
                if (verifyToken && verifyToken.userId) {
                    const user = await User.findById(verifyToken.userId).select("-password").populate("enrolledCourses");
                    if (user) {
                        if (Array.isArray(user.enrolledCourses)) {
                            user.enrolledCourses = user.enrolledCourses.filter(Boolean);
                        }
                        return res.status(200).json(user);
                    }
                }
            } catch (jwtErr) {
                // proceed
            }
        }

        // Direct development access fallback for admin
        if (process.env.NODE_ENV !== "production") {
            const origin = req.headers.origin || req.headers.referer || "";
            if (origin.includes("5174") || origin.includes("5175") || !token) {
                const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase().trim() : "ritikvarun65@gmail.com";
                const adminUser = await User.findOne({ email: adminEmail }).select("-password").populate("enrolledCourses");
                if (adminUser) {
                    return res.status(200).json(adminUser);
                }
            }
        }

        return res.status(200).json(null);
    } catch (error) {
        return res.status(200).json(null);
    }
};

export const UpdateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, description } = req.body;

        const updateData = {};
        if (name && name.trim()) {
            updateData.name = name.trim();
        }
        if (typeof description !== "undefined") {
            updateData.description = description.trim();
        }
        if (req.file) {
            const photoUrl = await uploadOnCloudinary(req.file.path);
            if (photoUrl) {
                updateData.photoUrl = photoUrl;
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true, runValidators: true }
        ).select("-password").populate("enrolledCourses");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (Array.isArray(updatedUser.enrolledCourses)) {
            updatedUser.enrolledCourses = updatedUser.enrolledCourses.filter(Boolean);
        }

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.log("UpdateProfile error:", error);
        return res.status(500).json({ message: `Update Profile Error: ${error.message || error}` });
    }
};
