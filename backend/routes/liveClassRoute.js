import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  createLiveClass,
  getCourseLiveClasses,
  getLiveClassById,
  updateLiveStatus,
  sendChatMessage,
  deleteLiveClass,
  getStudentLiveClasses
} from "../controllers/liveClassController.js";

const liveClassRouter = express.Router();

liveClassRouter.post("/create/:courseId", isAuth, createLiveClass);
liveClassRouter.get("/course/:courseId", isAuth, getCourseLiveClasses);
liveClassRouter.get("/student/my-live-classes", isAuth, getStudentLiveClasses);
liveClassRouter.get("/:liveClassId", isAuth, getLiveClassById);
liveClassRouter.patch("/:liveClassId/status", isAuth, updateLiveStatus);
liveClassRouter.post("/:liveClassId/chat", isAuth, sendChatMessage);
liveClassRouter.delete("/:liveClassId", isAuth, deleteLiveClass);

export default liveClassRouter;
