import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [
      (val) => val.length === 4,
      "Each question must have exactly 4 options",
    ],
  },
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    default: "",
    trim: true,
  },
  points: {
    type: Number,
    default: 1,
  },
});

const mockTestSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    timeLimitMinutes: {
      type: Number,
      default: 20,
      min: 1,
    },
    passingScorePercent: {
      type: Number,
      default: 60,
      min: 1,
      max: 100,
    },
    questions: [questionSchema],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const MockTest = mongoose.model("MockTest", mockTestSchema);
export default MockTest;
