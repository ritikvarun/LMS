import uploadOnCloudinary from "../configs/cloudinary.js"
import { uploadOnBunny, deleteFromBunny } from "../configs/bunny.js"
import Course from "../models/courseModel.js"
import Lecture from "../models/lectureModel.js"
import User from "../models/userModel.js"

// create Courses
export const createCourse = async (req,res) => {

    try {
        const {title, category, price, isFree, subTitle, description} = req.body
        if(!title || !category){
            return res.status(400).json({message:"title and category is required"})
        }
        const isFreeCourse = isFree === true || isFree === "true" || !price || Number(price) <= 0;
        const course = await Course.create({
            title,
            category,
            subTitle: subTitle || "",
            description: description || "",
            price: isFreeCourse ? 0 : Number(price),
            isFree: isFreeCourse,
            creator: req.userId
        })
        
        return res.status(201).json(course)
    } catch (error) {
         return res.status(500).json({message:`Failed to create course ${error}`})
    }
    
}

export const getPublishedCourses = async (req,res) => {
    try {
        const courses = await Course.find({isPublished:true}).populate("lectures")
        if(!courses)
        {
            return res.status(404).json({message:"Course not found"})
        }

        return res.status(200).json(courses)
        
    } catch (error) {
          return res.status(500).json({message:`Failed to get All  courses ${error}`})
    }
}


export const getCreatorCourses = async (req,res) => {
    try {
        const userId = req.userId
        const courses = await Course.find({creator:userId}).populate("enrolledStudents", "name email photoUrl createdAt")
        if(!courses)
        {
            return res.status(404).json({message:"Course not found"})
        }
        return res.status(200).json(courses)
        
    } catch (error) {
        return res.status(500).json({message:`Failed to get creator courses ${error}`})
    }
}

export const editCourse = async (req,res) => {
    try {
        const {courseId} = req.params;
        const {title , subTitle , description , category , level , price , isPublished, telegramLink, isFree } = req.body;
        let thumbnail
         if(req.file){
            thumbnail =await uploadOnCloudinary(req.file.path)
                }
        let course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({message:"Course not found"})
        }
        const cleanLevel = (level && ["Beginner", "Intermediate", "Advanced"].includes(level))
          ? level
          : "Beginner";

        const updateData = {
          title,
          subTitle,
          description,
          category,
          level: cleanLevel,
          price,
          isPublished,
          telegramLink: telegramLink ?? course.telegramLink,
          isFree: (isFree === true || isFree === "true" || Number(price) <= 0)
        };
        if (thumbnail) {
          updateData.thumbnail = thumbnail;
        }

        course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });
        return res.status(200).json(course);
    } catch (error) {
        return res.status(500).json({message:`Failed to update course ${error}`})
    }
}


export const getCourseById = async (req,res) => {
    try {
        const {courseId} = req.params
        let course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({message:"Course not found"})
        }
         return res.status(200).json(course)
        
    } catch (error) {
        return res.status(500).json({message:`Failed to get course ${error}`})
    }
}
export const removeCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await course.deleteOne();
    return res.status(200).json({ message: "Course Removed Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({message:`Failed to remove course ${error}`})
  }
};



//create lecture

export const createLecture = async (req,res) => {
    try {
        const {lectureTitle}= req.body
        const {courseId} = req.params

        if(!lectureTitle || !courseId){
             return res.status(400).json({message:"Lecture Title required"})
        }
        const lecture = await Lecture.create({lectureTitle})
        const course = await Course.findById(courseId)
        if(course){
            course.lectures.push(lecture._id)
            
        }
        await course.populate("lectures")
        await course.save()
        return res.status(201).json({lecture,course})
        
    } catch (error) {
        return res.status(500).json({message:`Failed to Create Lecture ${error}`})
    }
    
}

export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("lectures");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const userId = req.userId;
    const user = await User.findById(userId);

    const isCreator = course.creator?.toString() === userId?.toString();
    const isEducator = user?.role === "educator";
    const isEnrolled = user?.enrolledCourses?.some(
      (c) => (c._id || c).toString() === courseId.toString()
    );
    const isFreeCourse = !course.price || Number(course.price) <= 0 || course.isFree === true;

    const hasFullAccess = isCreator || isEducator || isEnrolled || isFreeCourse;

    const courseObj = course.toObject();

    // Auto-migrate legacy flat lectures into default subject chapters if subjects is empty
    if ((!courseObj.subjects || courseObj.subjects.length === 0) && courseObj.lectures && courseObj.lectures.length > 0) {
      courseObj.subjects = [{
        title: "Main Curriculum",
        chapters: courseObj.lectures.map((lec, idx) => ({
          _id: lec._id,
          title: lec.lectureTitle || `Topic ${idx + 1}`,
          videos: [
            {
              _id: lec._id,
              title: lec.lectureTitle || `Lesson 1`,
              videoUrl: lec.videoUrl || "",
              pdfUrl: lec.pdfUrl || "",
              duration: lec.duration || "",
              isPreviewFree: Boolean(lec.isPreviewFree),
            }
          ]
        }))
      }];
    }

    if (!hasFullAccess) {
      // Secure the lectures: strictly mask all videoUrls since preview is disabled
      courseObj.lectures = (courseObj.lectures || []).map((lec) => {
        return {
          ...lec,
          videoUrl: "", // Hide videoUrl completely on server side
          isLocked: true,
          isPreviewFree: false,
        };
      });
      if (courseObj.subjects) {
        courseObj.subjects = courseObj.subjects.map((subj) => ({
          ...subj,
          chapters: (subj.chapters || []).map((chap) => ({
            ...chap,
            videos: (chap.videos || []).map((v) => ({
              ...v,
              videoUrl: v.isPreviewFree ? v.videoUrl : "",
              isLocked: !v.isPreviewFree,
            }))
          }))
        }));
      }
      courseObj.isEnrolled = false;
    } else {
      courseObj.isEnrolled = true;
      courseObj.lectures = (courseObj.lectures || []).map((lec) => ({
        ...lec,
        isLocked: false,
      }));
      if (courseObj.subjects) {
        courseObj.subjects = courseObj.subjects.map((subj) => ({
          ...subj,
          chapters: (subj.chapters || []).map((chap) => ({
            ...chap,
            videos: (chap.videos || []).map((v) => ({
              ...v,
              isLocked: false,
            }))
          }))
        }));
      }
    }

    return res.status(200).json(courseObj);
  } catch (error) {
    console.error("getCourseLecture error:", error);
    return res.status(500).json({ message: `Failed to get Lectures ${error}` });
  }
};

export const editLecture = async (req,res) => {
    try {
        const {lectureId} = req.params
        const {isPreviewFree , lectureTitle} = req.body
        const lecture = await Lecture.findById(lectureId)
        if(!lecture){
            return res.status(404).json({message:"Lecture not found"})
        }
        let videoUrl
        if(req.file){
            videoUrl = await uploadOnBunny(req.file.path, lectureTitle || lecture.lectureTitle)
            lecture.videoUrl = videoUrl
        }
        if(lectureTitle){
            lecture.lectureTitle = lectureTitle
        }
        if(typeof isPreviewFree !== 'undefined'){
            lecture.isPreviewFree = isPreviewFree === "true" || isPreviewFree === true
        }
        
        await lecture.save()
        return res.status(200).json(lecture)
    } catch (error) {
        console.error("Failed to edit lecture:", error)
        return res.status(500).json({message:`Failed to edit Lecture: ${error.message || error}`})
    }
    
}

export const removeLecture = async (req,res) => {
    try {
        const {lectureId} = req.params
        const lecture = await Lecture.findByIdAndDelete(lectureId)
        if(!lecture){
             return res.status(404).json({message:"Lecture not found"})
        }

        // Delete from Bunny Stream if it was hosted there
        if(lecture.videoUrl && lecture.videoUrl.includes("mediadelivery.net")){
            await deleteFromBunny(lecture.videoUrl)
        }

        //remove the lecture from associated course

        await Course.updateOne(
            {lectures: lectureId},
            {$pull:{lectures: lectureId}}
        )
        return res.status(200).json({message:"Lecture Remove Successfully"})
        }
    
     catch (error) {
        return res.status(500).json({message:`Failed to remove Lectures ${error}`})
    }
}



//get Creator data


// controllers/userController.js

export const getCreatorById = async (req, res) => {
  try {
    const {userId} = req.body;

    const user = await User.findById(userId).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json( user );
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "get Creator error" });
  }
};

// ==========================================
// FREE COURSES & HIERARCHICAL CURRICULUM
// ==========================================

// Get all published free courses with computed video counts & category stats
export const getFreeCourses = async (req, res) => {
    try {
        const query = {
            isPublished: true,
            $or: [
                { isFree: true },
                { price: 0 },
                { price: { $exists: false } },
                { price: null }
            ]
        };

        const courses = await Course.find(query).populate("creator");

        const formatted = courses.map(course => {
            const doc = course.toObject();
            const subjectVideos = (doc.subjects || []).reduce((acc, sub) => {
                return acc + (sub.chapters || []).reduce((cAcc, chap) => cAcc + (chap.videos?.length || 0), 0);
            }, 0);
            const totalVideos = subjectVideos > 0 ? subjectVideos : (doc.lectures?.length || 0);
            return {
                ...doc,
                totalVideos
            };
        });

        const categoryCounts = {};
        formatted.forEach(c => {
            const cat = c.category || "General";
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        return res.status(200).json({
            courses: formatted,
            totalCourses: formatted.length,
            categoryCounts
        });
    } catch (error) {
        return res.status(500).json({ message: `Failed to get free courses: ${error.message}` });
    }
};

// Get single free course by ID with complete hierarchical curriculum
export const getFreeCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId).populate("creator", "-password");
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const doc = course.toObject();
        if ((!doc.subjects || doc.subjects.length === 0) && doc.topics && doc.topics.length > 0) {
            doc.subjects = doc.topics.map((top) => ({
                _id: top._id,
                title: top.title,
                thumbnail: doc.thumbnail || "",
                chapters: [{
                    _id: `${top._id}-ch1`,
                    title: `${top.title} - Lectures`,
                    thumbnail: doc.thumbnail || "",
                    videos: (top.videos || []).map((v) => ({
                        _id: v._id,
                        title: v.title,
                        videoUrl: v.videoUrl,
                        pdfUrl: v.pdfUrl,
                        thumbnail: v.thumbnail || doc.thumbnail || "",
                        duration: v.duration || ""
                    }))
                }]
            }));
        }
        const subjectVideos = (doc.subjects || []).reduce((acc, sub) => {
            return acc + (sub.chapters || []).reduce((cAcc, chap) => cAcc + (chap.videos?.length || 0), 0);
        }, 0);
        doc.totalVideos = subjectVideos > 0 ? subjectVideos : (doc.lectures?.length || 0);

        return res.status(200).json(doc);
    } catch (error) {
        return res.status(500).json({ message: `Failed to get course: ${error.message}` });
    }
};

// --- SUBJECT MANAGEMENT ---

export const addSubject = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, thumbnail: thumbnailStr } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Subject title is required" });
        }

        let thumbnail = thumbnailStr || "";
        if (req.file) {
            thumbnail = await uploadOnCloudinary(req.file.path);
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        course.subjects.push({
            title,
            thumbnail,
            chapters: []
        });

        await course.save();
        const createdSubject = course.subjects[course.subjects.length - 1];
        return res.status(201).json({ message: "Subject added successfully", subject: createdSubject, course });
    } catch (error) {
        return res.status(500).json({ message: `Failed to add subject: ${error.message}` });
    }
};

export const editSubject = async (req, res) => {
    try {
        const { courseId, subjectId } = req.params;
        const { title, thumbnail: thumbnailStr } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const subject = course.subjects.id(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        if (title) subject.title = title;
        if (thumbnailStr) subject.thumbnail = thumbnailStr;
        if (req.file) {
            subject.thumbnail = await uploadOnCloudinary(req.file.path);
        }

        await course.save();
        return res.status(200).json({ message: "Subject updated successfully", subject, course });
    } catch (error) {
        return res.status(500).json({ message: `Failed to update subject: ${error.message}` });
    }
};

export const deleteSubject = async (req, res) => {
    try {
        const { courseId, subjectId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        course.subjects.pull({ _id: subjectId });
        await course.save();
        return res.status(200).json({ message: "Subject removed successfully", course });
    } catch (error) {
        return res.status(500).json({ message: `Failed to remove subject: ${error.message}` });
    }
};

// --- CHAPTER MANAGEMENT ---

export const addChapter = async (req, res) => {
    try {
        const { courseId, subjectId } = req.params;
        const { title, thumbnail: thumbnailStr } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Chapter title is required" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const subject = course.subjects.id(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        let thumbnail = thumbnailStr || subject.thumbnail || "";
        if (req.file) {
            thumbnail = await uploadOnCloudinary(req.file.path);
        }

        subject.chapters.push({
            title,
            thumbnail,
            videos: []
        });

        await course.save();
        const createdChapter = subject.chapters[subject.chapters.length - 1];
        return res.status(201).json({ message: "Chapter added successfully", chapter: createdChapter, course });
    } catch (error) {
        return res.status(500).json({ message: `Failed to add chapter: ${error.message}` });
    }
};

export const editChapter = async (req, res) => {
    try {
        const { courseId, subjectId, chapterId } = req.params;
        const { title, thumbnail: thumbnailStr } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const subject = course.subjects.id(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        const chapter = subject.chapters.id(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: "Chapter not found" });
        }

        if (title) chapter.title = title;
        if (thumbnailStr) chapter.thumbnail = thumbnailStr;
        if (req.file) {
            chapter.thumbnail = await uploadOnCloudinary(req.file.path);
        }

        await course.save();
        return res.status(200).json({ message: "Chapter updated successfully", chapter, course });
    } catch (error) {
        return res.status(500).json({ message: `Failed to update chapter: ${error.message}` });
    }
};

export const deleteChapter = async (req, res) => {
    try {
        const { courseId, subjectId, chapterId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const subject = course.subjects.id(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        subject.chapters.pull({ _id: chapterId });
        await course.save();
        return res.status(200).json({ message: "Chapter removed successfully", course });
    } catch (error) {
        return res.status(500).json({ message: `Failed to remove chapter: ${error.message}` });
    }
};

// --- VIDEO & PDF MANAGEMENT ---

export const addVideo = async (req, res) => {
    try {
        const { courseId, subjectId, chapterId } = req.params;
        const { title, videoUrl: bodyVideoUrl, pdfUrl: bodyPdfUrl, thumbnail: bodyThumbnail, duration } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Video title is required" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const subject = course.subjects.id(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        const chapter = subject.chapters.id(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: "Chapter not found" });
        }

        let videoUrl = bodyVideoUrl || "";
        let pdfUrl = bodyPdfUrl || "";
        let thumbnail = bodyThumbnail || chapter.thumbnail || subject.thumbnail || "";

        if (req.files) {
            if (req.files.video && req.files.video[0]) {
                videoUrl = await uploadOnBunny(req.files.video[0].path, title);
            }
            if (req.files.pdf && req.files.pdf[0]) {
                pdfUrl = await uploadOnCloudinary(req.files.pdf[0].path, "auto");
            }
            if (req.files.thumbnail && req.files.thumbnail[0]) {
                thumbnail = await uploadOnCloudinary(req.files.thumbnail[0].path, "image");
            }
        }

        chapter.videos.push({
            title,
            videoUrl,
            pdfUrl,
            thumbnail,
            duration: duration || ""
        });

        await course.save();
        const createdVideo = chapter.videos[chapter.videos.length - 1];
        return res.status(201).json({ message: "Video added successfully", video: createdVideo, course });
    } catch (error) {
        return res.status(500).json({ message: `Failed to add video: ${error.message}` });
    }
};

export const editVideo = async (req, res) => {
    try {
        const { courseId, subjectId, chapterId, videoId } = req.params;
        const { title, videoUrl: bodyVideoUrl, pdfUrl: bodyPdfUrl, thumbnail: bodyThumbnail, duration } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const subject = course.subjects.id(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        const chapter = subject.chapters.id(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: "Chapter not found" });
        }

        const video = chapter.videos.id(videoId);
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        if (title) video.title = title;
        if (bodyVideoUrl !== undefined) video.videoUrl = bodyVideoUrl;
        if (bodyPdfUrl !== undefined) video.pdfUrl = bodyPdfUrl;
        if (bodyThumbnail !== undefined) video.thumbnail = bodyThumbnail;
        if (duration !== undefined) video.duration = duration;

        if (req.files) {
            if (req.files.video && req.files.video[0]) {
                video.videoUrl = await uploadOnBunny(req.files.video[0].path, title || video.title);
            }
            if (req.files.pdf && req.files.pdf[0]) {
                video.pdfUrl = await uploadOnCloudinary(req.files.pdf[0].path, "auto");
            }
            if (req.files.thumbnail && req.files.thumbnail[0]) {
                video.thumbnail = await uploadOnCloudinary(req.files.thumbnail[0].path, "image");
            }
        }

        await course.save();
        return res.status(200).json({ message: "Video updated successfully", video, course });
    } catch (error) {
        return res.status(500).json({ message: `Failed to update video: ${error.message}` });
    }
};

export const deleteVideo = async (req, res) => {
    try {
        const { courseId, subjectId, chapterId, videoId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const subject = course.subjects.id(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        const chapter = subject.chapters.id(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: "Chapter not found" });
        }

        const video = chapter.videos.id(videoId);
        if (video && video.videoUrl && video.videoUrl.includes("mediadelivery.net")) {
            await deleteFromBunny(video.videoUrl);
        }

        chapter.videos.pull({ _id: videoId });
        await course.save();
        return res.status(200).json({ message: "Video removed successfully", course });
    } catch (error) {
        return res.status(500).json({ message: `Failed to remove video: ${error.message}` });
    }
};

// --- TOPIC & MULTI-VIDEO CURRICULUM CONTROLLER ---

// 1. Get Course Curriculum with Topics and multiple Videos
export const getCourseCurriculum = async (req, res) => {
  try {
    const { courseId } = req.params;
    let course = await Course.findById(courseId).populate("lectures");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Auto-migrate legacy flat lectures into default subject chapters if subjects is empty
    if ((!course.subjects || course.subjects.length === 0) && course.lectures && course.lectures.length > 0) {
      course.subjects = [{
        title: "Main Curriculum",
        chapters: course.lectures.map((lec, idx) => ({
          _id: lec._id,
          title: lec.lectureTitle || `Topic ${idx + 1}`,
          videos: [
            {
              _id: lec._id,
              title: lec.lectureTitle || `Lesson 1`,
              videoUrl: lec.videoUrl || "",
              pdfUrl: lec.pdfUrl || "",
              duration: lec.duration || "",
              isPreviewFree: Boolean(lec.isPreviewFree)
            }
          ]
        }))
      }];
      await course.save();
    } else if (!course.subjects || course.subjects.length === 0) {
      course.subjects = [{
        title: "Main Curriculum",
        chapters: []
      }];
      await course.save();
    }

    const defaultSubject = course.subjects[0];

    return res.status(200).json({
      success: true,
      courseTitle: course.title,
      category: course.category,
      isFree: course.isFree || !course.price || Number(course.price) <= 0,
      subjectId: defaultSubject._id,
      topics: defaultSubject.chapters || []
    });
  } catch (error) {
    console.error("getCourseCurriculum error:", error);
    return res.status(500).json({ message: `Failed to load curriculum: ${error.message}` });
  }
};

// 2. Add New Topic (Chapter)
export const addCourseTopic = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Topic title is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!course.subjects || course.subjects.length === 0) {
      course.subjects = [{ title: "Main Curriculum", chapters: [] }];
    }

    const subject = course.subjects[0];
    subject.chapters.push({
      title: title.trim(),
      videos: []
    });

    await course.save();
    const createdTopic = subject.chapters[subject.chapters.length - 1];

    return res.status(201).json({
      success: true,
      message: "Topic added successfully",
      topic: createdTopic,
      topics: subject.chapters
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to add topic: ${error.message}` });
  }
};

// 3. Edit Topic Title
export const editCourseTopic = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Topic title is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const subject = course.subjects?.[0];
    if (!subject) return res.status(404).json({ message: "Curriculum not found" });

    const chapter = subject.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: "Topic not found" });

    chapter.title = title.trim();
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Topic updated successfully",
      topic: chapter,
      topics: subject.chapters
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to edit topic: ${error.message}` });
  }
};

// 4. Delete Topic
export const deleteCourseTopic = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const subject = course.subjects?.[0];
    if (!subject) return res.status(404).json({ message: "Curriculum not found" });

    subject.chapters.pull({ _id: chapterId });
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Topic removed successfully",
      topics: subject.chapters
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to remove topic: ${error.message}` });
  }
};

// 5. Reorder Topics
export const reorderCourseTopics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { chapterIds } = req.body;
    if (!Array.isArray(chapterIds)) {
      return res.status(400).json({ message: "chapterIds must be an array" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const subject = course.subjects?.[0];
    if (!subject) return res.status(404).json({ message: "Curriculum not found" });

    const chapterMap = new Map();
    subject.chapters.forEach((c) => chapterMap.set(c._id.toString(), c));

    const reordered = [];
    chapterIds.forEach((id) => {
      const chap = chapterMap.get(id.toString());
      if (chap) {
        reordered.push(chap);
        chapterMap.delete(id.toString());
      }
    });
    chapterMap.forEach((chap) => reordered.push(chap));

    subject.chapters = reordered;
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Topics reordered successfully",
      topics: subject.chapters
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to reorder topics: ${error.message}` });
  }
};

// 6. Add Video to a Topic
export const addVideoToTopic = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;
    const { title, videoUrl: bodyVideoUrl, pdfUrl: bodyPdfUrl, duration, isPreviewFree } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Video title is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const subject = course.subjects?.[0];
    if (!subject) return res.status(404).json({ message: "Curriculum not found" });

    const chapter = subject.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: "Topic not found" });

    let videoUrl = bodyVideoUrl || "";
    let pdfUrl = bodyPdfUrl || "";

    if (req.files) {
      if (req.files.video && req.files.video[0]) {
        videoUrl = await uploadOnBunny(req.files.video[0].path, title);
      }
      if (req.files.pdf && req.files.pdf[0]) {
        pdfUrl = await uploadOnCloudinary(req.files.pdf[0].path, "auto");
      }
    }

    chapter.videos.push({
      title: title.trim(),
      videoUrl,
      pdfUrl,
      duration: duration || "",
      isPreviewFree: isPreviewFree === "true" || isPreviewFree === true
    });

    await course.save();
    const createdVideo = chapter.videos[chapter.videos.length - 1];

    return res.status(201).json({
      success: true,
      message: "Video added successfully",
      video: createdVideo,
      topics: subject.chapters
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to add video: ${error.message}` });
  }
};

// 7. Edit Video in Topic
export const editVideoInTopic = async (req, res) => {
  try {
    const { courseId, chapterId, videoId } = req.params;
    const { title, videoUrl: bodyVideoUrl, pdfUrl: bodyPdfUrl, duration, isPreviewFree } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const subject = course.subjects?.[0];
    if (!subject) return res.status(404).json({ message: "Curriculum not found" });

    const chapter = subject.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: "Topic not found" });

    const video = chapter.videos.id(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (title) video.title = title.trim();
    if (bodyVideoUrl !== undefined) video.videoUrl = bodyVideoUrl;
    if (bodyPdfUrl !== undefined) video.pdfUrl = bodyPdfUrl;
    if (duration !== undefined) video.duration = duration;
    if (isPreviewFree !== undefined) video.isPreviewFree = isPreviewFree === "true" || isPreviewFree === true;

    if (req.files) {
      if (req.files.video && req.files.video[0]) {
        video.videoUrl = await uploadOnBunny(req.files.video[0].path, title || video.title);
      }
      if (req.files.pdf && req.files.pdf[0]) {
        video.pdfUrl = await uploadOnCloudinary(req.files.pdf[0].path, "auto");
      }
    }

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Video updated successfully",
      video,
      topics: subject.chapters
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to update video: ${error.message}` });
  }
};

// 8. Delete Video from Topic
export const deleteVideoFromTopic = async (req, res) => {
  try {
    const { courseId, chapterId, videoId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const subject = course.subjects?.[0];
    if (!subject) return res.status(404).json({ message: "Curriculum not found" });

    const chapter = subject.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: "Topic not found" });

    const video = chapter.videos.id(videoId);
    if (video && video.videoUrl && video.videoUrl.includes("mediadelivery.net")) {
      await deleteFromBunny(video.videoUrl);
    }

    chapter.videos.pull({ _id: videoId });
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Video removed successfully",
      topics: subject.chapters
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to remove video: ${error.message}` });
  }
};

// 9. Reorder Videos inside a Topic
export const reorderVideosInTopic = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;
    const { videoIds } = req.body;
    if (!Array.isArray(videoIds)) {
      return res.status(400).json({ message: "videoIds must be an array" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const subject = course.subjects?.[0];
    if (!subject) return res.status(404).json({ message: "Curriculum not found" });

    const chapter = subject.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: "Topic not found" });

    const videoMap = new Map();
    chapter.videos.forEach((v) => videoMap.set(v._id.toString(), v));

    const reordered = [];
    videoIds.forEach((id) => {
      const vid = videoMap.get(id.toString());
      if (vid) {
        reordered.push(vid);
        videoMap.delete(id.toString());
      }
    });
    videoMap.forEach((vid) => reordered.push(vid));

    chapter.videos = reordered;
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Videos reordered successfully",
      topics: subject.chapters
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to reorder videos: ${error.message}` });
  }
};






