import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { 
    createCourse, 
    createLecture, 
    editCourse, 
    editLecture, 
    getCourseById, 
    getCourseLecture, 
    getCreatorById, 
    getCreatorCourses, 
    getPublishedCourses, 
    removeCourse, 
    removeLecture,
    getFreeCourses,
    getFreeCourseById,
    addSubject,
    editSubject,
    deleteSubject,
    addChapter,
    editChapter,
    deleteChapter,
    addVideo, 
    editVideo, 
    deleteVideo,
    getCourseCurriculum,
    addCourseTopic,
    editCourseTopic,
    deleteCourseTopic,
    reorderCourseTopics,
    addVideoToTopic,
    editVideoInTopic,
    deleteVideoFromTopic,
    reorderVideosInTopic
} from "../controllers/courseController.js"
import upload from "../middlewares/multer.js"

let courseRouter = express.Router()

// Existing Course Routes
courseRouter.post("/create",isAuth,createCourse)
courseRouter.get("/getpublishedcoures",getPublishedCourses)
courseRouter.get("/getpublishedcourses",getPublishedCourses)
courseRouter.get("/getcreatorcourses",isAuth,getCreatorCourses)
courseRouter.post("/editcourse/:courseId",isAuth,upload.single("thumbnail"),editCourse)
courseRouter.get("/getcourse/:courseId",isAuth,getCourseById)
courseRouter.delete("/removecourse/:courseId",isAuth,removeCourse)
courseRouter.post("/createlecture/:courseId",isAuth,createLecture)
courseRouter.get("/getcourselecture/:courseId",isAuth,getCourseLecture)
courseRouter.post("/editlecture/:lectureId",isAuth,upload.single("videoUrl"),editLecture)
courseRouter.delete("/removelecture/:lectureId",isAuth,removeLecture)
courseRouter.post("/getcreator",isAuth,getCreatorById)

// Free Courses Public Routes
courseRouter.get("/free-courses", getFreeCourses)
courseRouter.get("/free-course/:courseId", getFreeCourseById)

// Subject Routes
courseRouter.post("/:courseId/subject", isAuth, upload.single("thumbnail"), addSubject)
courseRouter.put("/:courseId/subject/:subjectId", isAuth, upload.single("thumbnail"), editSubject)
courseRouter.delete("/:courseId/subject/:subjectId", isAuth, deleteSubject)

// Chapter Routes
courseRouter.post("/:courseId/subject/:subjectId/chapter", isAuth, upload.single("thumbnail"), addChapter)
courseRouter.put("/:courseId/subject/:subjectId/chapter/:chapterId", isAuth, upload.single("thumbnail"), editChapter)
courseRouter.delete("/:courseId/subject/:subjectId/chapter/:chapterId", isAuth, deleteChapter)

// Video & PDF Routes
const videoUploadFields = upload.fields([
    { name: "video", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
])
courseRouter.post("/:courseId/subject/:subjectId/chapter/:chapterId/video", isAuth, videoUploadFields, addVideo)
courseRouter.put("/:courseId/subject/:subjectId/chapter/:chapterId/video/:videoId", isAuth, videoUploadFields, editVideo)
courseRouter.delete("/:courseId/subject/:subjectId/chapter/:chapterId/video/:videoId", isAuth, deleteVideo)

// Unified Topic & Multi-Video Curriculum Routes
courseRouter.get("/:courseId/curriculum", isAuth, getCourseCurriculum)
courseRouter.post("/:courseId/topic", isAuth, addCourseTopic)
courseRouter.put("/:courseId/topic/:chapterId", isAuth, editCourseTopic)
courseRouter.delete("/:courseId/topic/:chapterId", isAuth, deleteCourseTopic)
courseRouter.put("/:courseId/reorder-topics", isAuth, reorderCourseTopics)
courseRouter.post("/:courseId/topic/:chapterId/video", isAuth, videoUploadFields, addVideoToTopic)
courseRouter.put("/:courseId/topic/:chapterId/video/:videoId", isAuth, videoUploadFields, editVideoInTopic)
courseRouter.delete("/:courseId/topic/:chapterId/video/:videoId", isAuth, deleteVideoFromTopic)
courseRouter.put("/:courseId/topic/:chapterId/reorder-videos", isAuth, reorderVideosInTopic)

export default courseRouter