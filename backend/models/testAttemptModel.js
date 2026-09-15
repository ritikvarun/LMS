import mongoose from "mongoose";

const studentAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  selectedOption: {
    type: Number, // 0, 1, 2, 3 or null / -1 if skipped
    default: -1,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  pointsAwarded: {
    type: Number,
    default: 0,
  },
});

const testAttemptSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockTest",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 0,
    },
    percentage: {
      type: Number,
      required: true,
      default: 0,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
    answers: [studentAnswerSchema],
  },
  { timestamps: true }
);

const TestAttempt = mongoose.model("TestAttempt", testAttemptSchema);
export default TestAttempt;
