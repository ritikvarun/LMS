import uploadOnCloudinary from "../configs/cloudinary.js";
import User from "../models/userModel.js";

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password").populate("enrolledCourses");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Filter out any dangling null courses (e.g. if a course was deleted)
        if (Array.isArray(user.enrolledCourses)) {
            user.enrolledCourses = user.enrolledCourses.filter(Boolean);
        }
        return res.status(200).json(user);
    } catch (error) {
        console.log("getCurrentUser error:", error);
        return res.status(500).json({ message: "Failed to get current user" });
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
