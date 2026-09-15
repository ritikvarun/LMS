import LiveClass from "../models/liveClassModel.js";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";

// Helper to extract YouTube 11-char Video ID from various link formats
export const extractYouTubeVideoId = (input) => {
  if (!input) return null;
  const trimmed = input.trim();
  
  // Handles youtube.com/watch?v=..., youtu.be/..., youtube.com/live/..., youtube.com/embed/...
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/))([\w-]{11})/);
  if (match && match[1]) {
    return match[1];
  }
  
  // Directly an 11-character video ID
  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
};

// 1. Schedule / Create a Live Class
export const createLiveClass = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, youtubeUrl, scheduledAt } = req.body;

    if (!title || !youtubeUrl) {
      return res.status(400).json({ message: "Class Title and YouTube Link are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Verify educator ownership
    if (course.creator.toString() !== req.userId && req.userRole !== "educator") {
      return res.status(403).json({ message: "Only the course creator can schedule live classes" });
    }

    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({ 
        message: "Invalid YouTube URL! Please paste a valid YouTube Live or Video link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)" 
      });
    }

    const liveClass = await LiveClass.create({
      courseId,
      creator: req.userId,
      title: title.trim(),
      description: description ? description.trim() : "",
      youtubeVideoId: videoId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      status: "scheduled"
    });

    return res.status(201).json(liveClass);
  } catch (error) {
    console.error("Create Live Class Error:", error);
    return res.status(500).json({ message: `Failed to create live class: ${error.message}` });
  }
};

// 2. Get all live classes for a course
export const getCourseLiveClasses = async (req, res) => {
  try {
    const { courseId } = req.params;
    const classes = await LiveClass.find({ courseId })
      .sort({ scheduledAt: -1, createdAt: -1 })
      .select("-chatMessages"); // Exclude chat messages for list view performance

    return res.status(200).json(classes);
  } catch (error) {
    console.error("Get Course Live Classes Error:", error);
    return res.status(500).json({ message: `Failed to fetch live classes: ${error.message}` });
  }
};

// 3. Get single live class details with chat
export const getLiveClassById = async (req, res) => {
  try {
    const { liveClassId } = req.params;
    const liveClass = await LiveClass.findById(liveClassId).populate("creator", "name photoUrl role");

    if (!liveClass) {
      return res.status(404).json({ message: "Live Class not found" });
    }

    return res.status(200).json(liveClass);
  } catch (error) {
    console.error("Get Live Class Error:", error);
    return res.status(500).json({ message: `Failed to fetch live class: ${error.message}` });
  }
};

// 4. Update status: 'scheduled' | 'live' | 'ended'
export const updateLiveStatus = async (req, res) => {
  try {
    const { liveClassId } = req.params;
    const { status } = req.body;

    if (!["scheduled", "live", "ended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const liveClass = await LiveClass.findById(liveClassId);
    if (!liveClass) {
      return res.status(404).json({ message: "Live Class not found" });
    }

    if (liveClass.creator.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to change class status" });
    }

    liveClass.status = status;
    await liveClass.save();

    return res.status(200).json({ message: `Status updated to ${status}`, liveClass });
  } catch (error) {
    console.error("Update Live Status Error:", error);
    return res.status(500).json({ message: `Failed to update status: ${error.message}` });
  }
};

// 5. Send a live chat message
export const sendChatMessage = async (req, res) => {
  try {
    const { liveClassId } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const liveClass = await LiveClass.findById(liveClassId);
    if (!liveClass) {
      return res.status(404).json({ message: "Live Class not found" });
    }

    const newMsg = {
      senderId: user._id,
      senderName: user.name,
      senderRole: user.role || "student",
      message: message.trim(),
      createdAt: new Date()
    };

    liveClass.chatMessages.push(newMsg);

    // Keep only last 200 messages in memory/db to keep documents fast and light
    if (liveClass.chatMessages.length > 200) {
      liveClass.chatMessages = liveClass.chatMessages.slice(-200);
    }

    await liveClass.save();

    return res.status(201).json({ message: "Message sent", chatMessage: newMsg });
  } catch (error) {
    console.error("Send Chat Error:", error);
    return res.status(500).json({ message: `Failed to send message: ${error.message}` });
  }
};

// 6. Delete a live class
export const deleteLiveClass = async (req, res) => {
  try {
    const { liveClassId } = req.params;
    const liveClass = await LiveClass.findById(liveClassId);

    if (!liveClass) {
      return res.status(404).json({ message: "Live Class not found" });
    }

    if (liveClass.creator.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to delete this class" });
    }

    await liveClass.deleteOne();
    return res.status(200).json({ message: "Live Class deleted successfully" });
  } catch (error) {
    console.error("Delete Live Class Error:", error);
    return res.status(500).json({ message: `Failed to delete live class: ${error.message}` });
  }
};

// 7. Get live classes for student's enrolled courses
export const getStudentLiveClasses = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const enrolledCourseIds = user.enrolledCourses || [];
    if (enrolledCourseIds.length === 0) {
      return res.status(200).json({ liveNow: [], upcoming: [] });
    }

    const liveClasses = await LiveClass.find({
      courseId: { $in: enrolledCourseIds },
      status: { $in: ["live", "scheduled"] }
    })
      .sort({ scheduledAt: 1 })
      .populate("courseId", "title thumbnail category")
      .populate("creator", "name photoUrl")
      .select("-chatMessages");

    const liveNow = liveClasses.filter((c) => c.status === "live");
    const upcoming = liveClasses.filter((c) => c.status === "scheduled");

    return res.status(200).json({ liveNow, upcoming, totalCount: liveClasses.length });
  } catch (error) {
    console.error("Get Student Live Classes Error:", error);
    return res.status(500).json({ message: `Failed: ${error.message}` });
  }
};
