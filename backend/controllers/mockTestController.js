import MockTest from "../models/mockTestModel.js";
import TestAttempt from "../models/testAttemptModel.js";
import Course from "../models/courseModel.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

/**
 * Helper to generate fallback MCQs if AI fails or key is missing
 */
const generateFallbackQuestions = (topic, count = 5) => {
  const safeTopic = topic || "General Concepts";
  const templates = [
    {
      questionText: `What is the primary purpose or main concept of ${safeTopic}?`,
      options: [
        `It provides core functionality and structure for building scalable solutions`,
        `It is strictly used for database styling only`,
        `It replaces all hardware requirements`,
        `It is deprecated and should not be used in modern development`,
      ],
      correctOptionIndex: 0,
      explanation: `${safeTopic} is designed to provide core functionality, modularity, and structure for building robust applications.`,
      points: 1,
    },
    {
      questionText: `Which of the following is considered a best practice when working with ${safeTopic}?`,
      options: [
        `Ignoring error handling and logging`,
        `Writing modular, reusable, and well-tested code`,
        `Hardcoding sensitive credentials in client-side code`,
        `Avoiding state management altogether`,
      ],
      correctOptionIndex: 1,
      explanation: `Writing clean, modular, and maintainable code with thorough testing is essential when dealing with ${safeTopic}.`,
      points: 1,
    },
    {
      questionText: `In the context of ${safeTopic}, how is asynchronous execution or state handling typically managed?`,
      options: [
        `By completely blocking the execution thread indefinitely`,
        `Using event listeners, promises, callbacks, or reactive hooks`,
        `By disabling browser networking`,
        `State cannot be managed dynamically`,
      ],
      correctOptionIndex: 1,
      explanation: `Modern asynchronous operations and reactivity rely on Promises, async/await, and event-driven patterns.`,
      points: 1,
    },
    {
      questionText: `Which tool or technique is most commonly paired with ${safeTopic} for debugging?`,
      options: [
        `Browser Developer Tools and Console Diagnostics`,
        `Randomly deleting source files`,
        `Restarting the operating system repeatedly`,
        `Disabling internet connectivity`,
      ],
      correctOptionIndex: 0,
      explanation: `Browser Developer Tools (F12), console logging, and debuggers provide the primary mechanism for inspecting runtime state.`,
      points: 1,
    },
    {
      questionText: `What is a key performance optimization technique when scaling applications utilizing ${safeTopic}?`,
      options: [
        `Loading all assets synchronously in a single bundle without compression`,
        `Memoization, lazy loading, and efficient resource caching`,
        `Duplicating repetitive heavy queries inside high-frequency loops`,
        `Increasing payload sizes arbitrarily`,
      ],
      correctOptionIndex: 1,
      explanation: `Techniques like lazy loading, memoization, code-splitting, and caching minimize memory overhead and latency.`,
      points: 1,
    },
  ];

  return templates.slice(0, count);
};

// 1. Generate Questions using Gemini AI
export const generateAiQuestions = async (req, res) => {
  try {
    const { topic, count = 5, difficulty = "Intermediate" } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ message: "Topic is required for generating questions." });
    }

    const safeCount = Math.min(Math.max(parseInt(count, 10) || 5, 3), 15);

    try {
      const ai = new GoogleGenAI({});
      const prompt = `You are an expert technical examiner. Create exactly ${safeCount} multiple-choice questions (MCQs) for the topic: "${topic.trim()}".
Difficulty level: ${difficulty}.

Requirements:
1. Each question must have EXACTLY 4 distinct, plausible options.
2. Provide correctOptionIndex as an integer between 0 and 3 (0 is option 1, 1 is option 2, 2 is option 3, 3 is option 4).
3. Provide a clear, educational 1-2 sentence explanation of why that option is correct.
4. Set points to 1 for each question.
5. Return ONLY a valid JSON array. Do not wrap in markdown code blocks (\`\`\`json). Do not add any greeting or trailing text.

JSON format expected:
[
  {
    "questionText": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOptionIndex": 1,
    "explanation": "Why Option B is correct...",
    "points": 1
  }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let rawText = response.text?.trim() || "";
      // Strip any markdown code fence if AI included it
      if (rawText.startsWith("```json")) {
        rawText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (rawText.startsWith("```")) {
        rawText = rawText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(rawText);

      if (Array.isArray(parsed) && parsed.length > 0) {
        // Validate items
        const sanitized = parsed.map((q, idx) => ({
          questionText: q.questionText || `Question ${idx + 1} on ${topic}`,
          options:
            Array.isArray(q.options) && q.options.length === 4
              ? q.options.map(String)
              : ["Option A", "Option B", "Option C", "Option D"],
          correctOptionIndex:
            typeof q.correctOptionIndex === "number" &&
            q.correctOptionIndex >= 0 &&
            q.correctOptionIndex <= 3
              ? q.correctOptionIndex
              : 0,
          explanation: q.explanation || "Correct answer based on core principles.",
          points: q.points || 1,
        }));

        return res.status(200).json({
          success: true,
          source: "gemini-ai",
          questions: sanitized,
        });
      }
    } catch (aiErr) {
      console.warn("AI generation failed or fell back:", aiErr.message);
    }

    // Fallback if AI call failed or JSON parse threw
    const fallbackQuestions = generateFallbackQuestions(topic, safeCount);
    return res.status(200).json({
      success: true,
      source: "template-fallback",
      questions: fallbackQuestions,
      message: "Generated high-quality questions using curated technical template.",
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return res.status(500).json({ message: "Failed to generate questions." });
  }
};

// 2. Create Mock Test (Educator)
export const createMockTest = async (req, res) => {
  try {
    const {
      courseId,
      title,
      description,
      timeLimitMinutes,
      passingScorePercent,
      questions,
      isPublished,
    } = req.body;

    const userId = req.userId;

    if (!courseId || !title || !title.trim()) {
      return res.status(400).json({ message: "Course ID and Test Title are required." });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "At least one question is required." });
    }

    // Check course existence
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Create test
    const mockTest = await MockTest.create({
      courseId,
      creator: userId,
      title: title.trim(),
      description: description ? description.trim() : "",
      timeLimitMinutes: Number(timeLimitMinutes) || 20,
      passingScorePercent: Number(passingScorePercent) || 60,
      questions,
      isPublished: Boolean(isPublished),
    });

    return res.status(201).json({
      success: true,
      message: "Mock Test created successfully!",
      mockTest,
    });
  } catch (error) {
    console.error("Error creating mock test:", error);
    return res.status(500).json({ message: "Failed to create mock test." });
  }
};

// 3. Update Mock Test (Educator)
export const updateMockTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const {
      title,
      description,
      timeLimitMinutes,
      passingScorePercent,
      questions,
      isPublished,
    } = req.body;

    const mockTest = await MockTest.findById(testId);
    if (!mockTest) {
      return res.status(404).json({ message: "Mock test not found." });
    }

    if (title !== undefined) mockTest.title = title.trim();
    if (description !== undefined) mockTest.description = description.trim();
    if (timeLimitMinutes !== undefined) mockTest.timeLimitMinutes = Number(timeLimitMinutes);
    if (passingScorePercent !== undefined)
      mockTest.passingScorePercent = Number(passingScorePercent);
    if (Array.isArray(questions) && questions.length > 0) {
      mockTest.questions = questions;
    }
    if (isPublished !== undefined) mockTest.isPublished = Boolean(isPublished);

    await mockTest.save();

    return res.status(200).json({
      success: true,
      message: "Mock test updated successfully!",
      mockTest,
    });
  } catch (error) {
    console.error("Error updating mock test:", error);
    return res.status(500).json({ message: "Failed to update mock test." });
  }
};

// 4. Toggle Publish Status
export const togglePublishTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const mockTest = await MockTest.findById(testId);
    if (!mockTest) {
      return res.status(404).json({ message: "Mock test not found." });
    }

    mockTest.isPublished = !mockTest.isPublished;
    await mockTest.save();

    return res.status(200).json({
      success: true,
      message: `Test is now ${mockTest.isPublished ? "Published" : "Draft"}.`,
      isPublished: mockTest.isPublished,
    });
  } catch (error) {
    console.error("Error toggling publish status:", error);
    return res.status(500).json({ message: "Failed to update publish status." });
  }
};

// 5. Delete Mock Test
export const deleteMockTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const mockTest = await MockTest.findByIdAndDelete(testId);
    if (!mockTest) {
      return res.status(404).json({ message: "Mock test not found." });
    }

    // Also remove any student attempts for this test
    await TestAttempt.deleteMany({ testId });

    return res.status(200).json({
      success: true,
      message: "Mock test and associated attempts deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting mock test:", error);
    return res.status(500).json({ message: "Failed to delete mock test." });
  }
};

// 6. Get all Mock Tests for a Course (For both Educator and Student)
export const getCourseMockTests = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const isCreatorOrAdmin =
      course.creator?.toString() === userId?.toString() || req.userRole === "admin";

    let tests;
    if (isCreatorOrAdmin) {
      // Educator gets everything including answers and draft tests
      tests = await MockTest.find({ courseId }).sort({ createdAt: -1 });
    } else {
      // Students only get published tests
      tests = await MockTest.find({ courseId, isPublished: true }).sort({ createdAt: -1 });
    }

    // Fetch user's latest attempts for each test to show prior scores
    const userAttempts = await TestAttempt.find({
      courseId,
      studentId: userId,
    }).sort({ createdAt: -1 });

    const attemptsMap = {};
    for (const att of userAttempts) {
      const tId = att.testId.toString();
      if (!attemptsMap[tId]) {
        attemptsMap[tId] = att;
      }
    }

    // Sanitize for students (hide correct answers & explanations from listing)
    const formatted = tests.map((t) => {
      const tObj = t.toObject();
      const latestAttempt = attemptsMap[t._id.toString()] || null;

      if (!isCreatorOrAdmin) {
        // Strip solutions
        tObj.questions = tObj.questions.map((q) => ({
          _id: q._id,
          questionText: q.questionText,
          options: q.options,
          points: q.points,
        }));
      }

      return {
        ...tObj,
        totalQuestions: t.questions?.length || 0,
        totalMarks: t.questions?.reduce((acc, q) => acc + (q.points || 1), 0) || 0,
        userAttempt: latestAttempt
          ? {
              attemptId: latestAttempt._id,
              score: latestAttempt.score,
              totalMarks: latestAttempt.totalMarks,
              percentage: latestAttempt.percentage,
              isPassed: latestAttempt.isPassed,
              submittedAt: latestAttempt.createdAt,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      tests: formatted,
      isCreator: isCreatorOrAdmin,
    });
  } catch (error) {
    console.error("Error fetching course mock tests:", error);
    return res.status(500).json({ message: "Failed to fetch mock tests." });
  }
};

// 7. Get single test for Live Exam Room (Student) - STRICT ANTI-CHEAT SANITIZATION
export const getTestForExam = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.userId;

    const mockTest = await MockTest.findById(testId).populate("courseId", "title category thumbnail");
    if (!mockTest) {
      return res.status(404).json({ message: "Test not found." });
    }

    if (!mockTest.isPublished) {
      // Check if user is educator
      const course = await Course.findById(mockTest.courseId);
      const isCreator = course?.creator?.toString() === userId?.toString();
      if (!isCreator) {
        return res.status(403).json({ message: "This test is not published yet." });
      }
    }

    // Sanitize: REMOVE correctOptionIndex and explanation
    const sanitizedQuestions = mockTest.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      points: q.points || 1,
    }));

    return res.status(200).json({
      success: true,
      test: {
        _id: mockTest._id,
        courseId: mockTest.courseId,
        title: mockTest.title,
        description: mockTest.description,
        timeLimitMinutes: mockTest.timeLimitMinutes,
        passingScorePercent: mockTest.passingScorePercent,
        totalQuestions: sanitizedQuestions.length,
        totalMarks: sanitizedQuestions.reduce((acc, q) => acc + (q.points || 1), 0),
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    console.error("Error fetching test for exam:", error);
    return res.status(500).json({ message: "Failed to load examination." });
  }
};

// 8. Submit Student Test Attempt & Auto-Grade
export const submitTestAttempt = async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers = [], timeTakenSeconds = 0 } = req.body;
    const studentId = req.userId;

    const mockTest = await MockTest.findById(testId);
    if (!mockTest) {
      return res.status(404).json({ message: "Mock test not found." });
    }

    // Build question map for fast lookup
    const questionMap = new Map();
    let totalMarks = 0;
    mockTest.questions.forEach((q) => {
      const pts = q.points || 1;
      totalMarks += pts;
      questionMap.set(q._id.toString(), q);
    });

    let score = 0;
    const gradedAnswers = [];

    // Map of student's answers { [questionId]: selectedOptionIndex }
    const studentAnsMap = new Map();
    answers.forEach((ans) => {
      if (ans.questionId) {
        studentAnsMap.set(ans.questionId.toString(), ans.selectedOption);
      }
    });

    // Grade each question from the test
    mockTest.questions.forEach((q) => {
      const qIdStr = q._id.toString();
      const selected = studentAnsMap.has(qIdStr) ? studentAnsMap.get(qIdStr) : -1;
      const isCorrect = selected !== -1 && selected === q.correctOptionIndex;
      const pts = isCorrect ? q.points || 1 : 0;

      if (isCorrect) {
        score += pts;
      }

      gradedAnswers.push({
        questionId: q._id,
        selectedOption: selected,
        isCorrect,
        pointsAwarded: pts,
      });
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const isPassed = percentage >= mockTest.passingScorePercent;

    // Save test attempt to DB
    const attempt = await TestAttempt.create({
      testId: mockTest._id,
      studentId,
      courseId: mockTest.courseId,
      score,
      totalMarks,
      percentage,
      isPassed,
      timeTakenSeconds,
      answers: gradedAnswers,
    });

    return res.status(201).json({
      success: true,
      message: isPassed
        ? "Congratulations! You passed the test."
        : "Test submitted. Keep practicing to improve!",
      attemptId: attempt._id,
      score,
      totalMarks,
      percentage,
      isPassed,
      timeTakenSeconds,
    });
  } catch (error) {
    console.error("Error submitting test attempt:", error);
    return res.status(500).json({ message: "Failed to grade and submit test." });
  }
};

// 9. Get Detailed Attempt Result & Scorecard Breakdown
export const getAttemptResult = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.userId;

    const attempt = await TestAttempt.findById(attemptId)
      .populate("testId")
      .populate("courseId", "title thumbnail category");

    if (!attempt) {
      return res.status(404).json({ message: "Test attempt not found." });
    }

    // Check authorization: must be student who took it, or course creator, or admin
    const isStudent = attempt.studentId.toString() === userId?.toString();
    const course = await Course.findById(attempt.courseId);
    const isEducator = course?.creator?.toString() === userId?.toString() || req.userRole === "admin";

    if (!isStudent && !isEducator) {
      return res.status(403).json({ message: "Not authorized to view this result." });
    }

    const test = attempt.testId;
    if (!test) {
      return res.status(404).json({ message: "Original test details no longer available." });
    }

    // Build question lookup
    const qMap = new Map();
    test.questions.forEach((q) => {
      qMap.set(q._id.toString(), q);
    });

    // Assemble detailed question-by-question review
    const reviewBreakdown = attempt.answers.map((ans, idx) => {
      const q = qMap.get(ans.questionId.toString());
      return {
        questionNumber: idx + 1,
        questionText: q?.questionText || "Question details unavailable",
        options: q?.options || [],
        selectedOption: ans.selectedOption,
        correctOptionIndex: q?.correctOptionIndex ?? null,
        isCorrect: ans.isCorrect,
        pointsAwarded: ans.pointsAwarded,
        maxPoints: q?.points || 1,
        explanation: q?.explanation || "",
      };
    });

    return res.status(200).json({
      success: true,
      attempt: {
        _id: attempt._id,
        testTitle: test.title,
        testDescription: test.description,
        courseTitle: attempt.courseId?.title || "Course",
        courseThumbnail: attempt.courseId?.thumbnail || "",
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        isPassed: attempt.isPassed,
        passingScorePercent: test.passingScorePercent,
        timeTakenSeconds: attempt.timeTakenSeconds,
        submittedAt: attempt.createdAt,
        totalQuestions: reviewBreakdown.length,
        correctCount: reviewBreakdown.filter((r) => r.isCorrect).length,
        wrongCount: reviewBreakdown.filter((r) => !r.isCorrect && r.selectedOption !== -1).length,
        skippedCount: reviewBreakdown.filter((r) => r.selectedOption === -1).length,
        breakdown: reviewBreakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching attempt result:", error);
    return res.status(500).json({ message: "Failed to load test results." });
  }
};
