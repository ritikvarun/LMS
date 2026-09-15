import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  createMockTest,
  updateMockTest,
  togglePublishTest,
  deleteMockTest,
  generateAiQuestions,
  getCourseMockTests,
  getTestForExam,
  submitTestAttempt,
  getAttemptResult,
} from "../controllers/mockTestController.js";

const mockTestRouter = express.Router();

// Educator Actions
mockTestRouter.post("/create", isAuth, createMockTest);
mockTestRouter.put("/:testId/update", isAuth, updateMockTest);
mockTestRouter.patch("/:testId/toggle-publish", isAuth, togglePublishTest);
mockTestRouter.delete("/:testId", isAuth, deleteMockTest);
mockTestRouter.post("/generate-ai", isAuth, generateAiQuestions);

// Course Tests Listing
mockTestRouter.get("/course/:courseId", isAuth, getCourseMockTests);

// Student Exam Room & Submission
mockTestRouter.get("/exam/:testId", isAuth, getTestForExam);
mockTestRouter.post("/submit/:testId", isAuth, submitTestAttempt);

// Scorecard & Review
mockTestRouter.get("/result/:attemptId", isAuth, getAttemptResult);

export default mockTestRouter;
