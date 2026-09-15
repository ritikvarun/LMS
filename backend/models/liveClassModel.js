import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ["student", "educator"],
    default: "student"
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const liveClassSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  youtubeVideoId: {
    type: String,
    required: true,
    trim: true
  },
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["scheduled", "live", "ended"],
    default: "scheduled"
  },
  chatMessages: [chatMessageSchema]
}, { timestamps: true });

const LiveClass = mongoose.model("LiveClass", liveClassSchema);
export default LiveClass;
