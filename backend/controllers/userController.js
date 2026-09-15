import uploadOnCloudinary from "../configs/cloudinary.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const getCurrentUser = async (req, res) => {
    try {
        const { token } = req.cookies || {};
        if (!token) {
            return res.status(200).json(null);
        }

        let verifyToken;
        try {
            verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            return res.status(200).json(null);
        }

        if (!verifyToken || !verifyToken.userId) {
            return res.status(200).json(null);
        }

        const user = await User.findById(verifyToken.userId).select("-password").populate("enrolledCourses");
        if (!user) {
            return res.status(200).json(null);
        }
        // Filter out any dangling null courses (e.g. if a course was deleted)
        if (Array.isArray(user.enrolledCourses)) {
            user.enrolledCourses = user.enrolledCourses.filter(Boolean);
        }
        return res.status(200).json(user);
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
