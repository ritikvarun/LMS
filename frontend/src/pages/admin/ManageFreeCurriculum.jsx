import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiVideo, 
  FiFileText, 
  FiPlay, 
  FiX, 
  FiBookOpen, 
  FiLayers,
  FiExternalLink,
  FiArrowLeft,
  FiUploadCloud,
  FiLink,
  FiClock,
  FiSend,
  FiCheck
} from 'react-icons/fi';
import { FaTelegramPlane } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import AdminLayout from './AdminLayout';
import emptyImg from '../../assets/empty.jpg';

function ManageFreeCurriculum() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active navigation level:
  // selectedSubject: null => Viewing all Subjects
  // selectedSubject: object => Viewing Chapters in this Subject
  const [selectedSubject, setSelectedSubject] = useState(null);

  // selectedChapter: null => Viewing Chapters in Subject
  // selectedChapter: object => Viewing Videos in this Chapter
  const [selectedChapter, setSelectedChapter] = useState(null);

  // --- MODAL STATES ---
  // Subject Modal
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [subjectMode, setSubjectMode] = useState("add"); // "add" | "edit"
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectTitle, setSubjectTitle] = useState("");
  const [subjectThumbType, setSubjectThumbType] = useState("url"); // "url" | "file"
  const [subjectThumbUrl, setSubjectThumbUrl] = useState("");
  const [subjectThumbFile, setSubjectThumbFile] = useState(null);
  const [subjectSaving, setSubjectSaving] = useState(false);

  // Chapter Modal
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [chapterMode, setChapterMode] = useState("add"); // "add" | "edit"
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterThumbType, setChapterThumbType] = useState("url");
  const [chapterThumbUrl, setChapterThumbUrl] = useState("");
  const [chapterThumbFile, setChapterThumbFile] = useState(null);
  const [chapterSaving, setChapterSaving] = useState(false);

  // Video Modal
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoMode, setVideoMode] = useState("add"); // "add" | "edit"
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoSourceType, setVideoSourceType] = useState("url"); // "url" | "file"
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [durationInput, setDurationInput] = useState("");
  const [pdfSourceType, setPdfSourceType] = useState("url"); // "url" | "file"
  const [pdfUrlInput, setPdfUrlInput] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [videoSaving, setVideoSaving] = useState(false);

  // Video Preview Modal
  const [previewVideo, setPreviewVideo] = useState(null);

  // Telegram Link Editor state
  const [telegramLink, setTelegramLink] = useState("");
  const [savingTelegram, setSavingTelegram] = useState(false);

  // Fetch full course data
  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/course/free-course/${courseId}`, { withCredentials: true });
      if (res.data) {
        setCourse(res.data);
        setTelegramLink(res.data.telegramLink || "");

        // Keep active subject and chapter references in sync if already selected
        if (selectedSubject) {
          const updatedSubject = (res.data.subjects || []).find((s) => s._id === selectedSubject._id);
          setSelectedSubject(updatedSubject || null);
          if (selectedChapter && updatedSubject) {
            const updatedChapter = (updatedSubject.chapters || []).find((c) => c._id === selectedChapter._id);
            setSelectedChapter(updatedChapter || null);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching free course:", err);
      toast.error(err?.response?.data?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  // Total videos count
  const totalVideos = useMemo(() => {
    if (!course) return 0;
    return (course.subjects || []).reduce((acc, sub) => {
      return acc + (sub.chapters || []).reduce((cAcc, chap) => cAcc + (chap.videos?.length || 0), 0);
    }, 0);
  }, [course]);

  // Total chapters count
  const totalChapters = useMemo(() => {
    if (!course) return 0;
    return (course.subjects || []).reduce((acc, sub) => acc + (sub.chapters?.length || 0), 0);
  }, [course]);

  // Helper for YouTube embed
  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  const isIframeVideo = (url) => {
    if (!url) return false;
    return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("iframe.mediadelivery.net") || url.includes("vimeo.com");
  };

  // --- SAVE TELEGRAM LINK ---
  const handleSaveTelegram = async () => {
    setSavingTelegram(true);
    try {
      await axios.post(
        `${serverUrl}/api/course/editcourse/${courseId}`,
        {
          title: course.title,
          category: course.category,
          telegramLink: telegramLink.trim(),
          isFree: true,
          price: 0
        },
        { withCredentials: true }
      );
      toast.success("Telegram link updated!");
      fetchCourseData();
    } catch (err) {
      toast.error("Failed to save telegram link");
    } finally {
      setSavingTelegram(false);
    }
  };

  // =========================================================
  // 1. SUBJECT HANDLERS
  // =========================================================
  const openAddSubject = () => {
    setSubjectMode("add");
    setEditingSubject(null);
    setSubjectTitle("");
    setSubjectThumbUrl("");
    setSubjectThumbFile(null);
    setSubjectModalOpen(true);
  };

  const openEditSubject = (sub, e) => {
    e?.stopPropagation();
    setSubjectMode("edit");
    setEditingSubject(sub);
    setSubjectTitle(sub.title || "");
    setSubjectThumbUrl(sub.thumbnail || "");
    setSubjectThumbFile(null);
    setSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e?.preventDefault();
    if (!subjectTitle.trim()) {
      toast.warn("Please enter a subject title (e.g. Maths 10th Bihar Board)");
      return;
    }

    setSubjectSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", subjectTitle.trim());

      if (subjectThumbType === "file" && subjectThumbFile) {
        formData.append("thumbnail", subjectThumbFile);
      } else if (subjectThumbUrl.trim()) {
        formData.append("thumbnail", subjectThumbUrl.trim());
      }

      if (subjectMode === "add") {
        await axios.post(`${serverUrl}/api/course/${courseId}/subject`, formData, {
          withCredentials: true,
        });
        toast.success(`Subject "${subjectTitle}" added!`);
      } else {
        await axios.put(`${serverUrl}/api/course/${courseId}/subject/${editingSubject._id}`, formData, {
          withCredentials: true,
        });
        toast.success(`Subject updated successfully!`);
      }

      setSubjectModalOpen(false);
      fetchCourseData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save subject");
    } finally {
      setSubjectSaving(false);
    }
  };

  const handleDeleteSubject = async (subId, title, e) => {
    e?.stopPropagation();
    if (!window.confirm(`Delete subject "${title}" and all its chapters & videos?`)) return;

    try {
      await axios.delete(`${serverUrl}/api/course/${courseId}/subject/${subId}`, { withCredentials: true });
      toast.success("Subject deleted successfully");
      if (selectedSubject?._id === subId) {
        setSelectedSubject(null);
        setSelectedChapter(null);
      }
      fetchCourseData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete subject");
    }
  };

  // =========================================================
  // 2. CHAPTER HANDLERS
  // =========================================================
  const openAddChapter = () => {
    setChapterMode("add");
    setEditingChapter(null);
    setChapterTitle("");
    setChapterThumbUrl("");
    setChapterThumbFile(null);
    setChapterModalOpen(true);
  };

  const openEditChapter = (chap, e) => {
    e?.stopPropagation();
    setChapterMode("edit");
    setEditingChapter(chap);
    setChapterTitle(chap.title || "");
    setChapterThumbUrl(chap.thumbnail || "");
    setChapterThumbFile(null);
    setChapterModalOpen(true);
  };

  const handleSaveChapter = async (e) => {
    e?.preventDefault();
    if (!chapterTitle.trim()) {
      toast.warn("Please enter chapter title (e.g. Chapter 1: Real Numbers)");
      return;
    }

    setChapterSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", chapterTitle.trim());

      if (chapterThumbType === "file" && chapterThumbFile) {
        formData.append("thumbnail", chapterThumbFile);
      } else if (chapterThumbUrl.trim()) {
        formData.append("thumbnail", chapterThumbUrl.trim());
      }

      if (chapterMode === "add") {
        await axios.post(
          `${serverUrl}/api/course/${courseId}/subject/${selectedSubject._id}/chapter`,
          formData,
          {
            withCredentials: true,
          }
        );
        toast.success(`Chapter "${chapterTitle}" added!`);
      } else {
        await axios.put(
          `${serverUrl}/api/course/${courseId}/subject/${selectedSubject._id}/chapter/${editingChapter._id}`,
          formData,
          {
            withCredentials: true,
          }
        );
        toast.success(`Chapter updated successfully!`);
      }

      setChapterModalOpen(false);
      fetchCourseData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save chapter");
    } finally {
      setChapterSaving(false);
    }
  };

  const handleDeleteChapter = async (chapId, title, e) => {
    e?.stopPropagation();
    if (!window.confirm(`Delete chapter "${title}" and all its videos?`)) return;

    try {
      await axios.delete(
        `${serverUrl}/api/course/${courseId}/subject/${selectedSubject._id}/chapter/${chapId}`,
        { withCredentials: true }
      );
      toast.success("Chapter deleted successfully");
      if (selectedChapter?._id === chapId) {
        setSelectedChapter(null);
      }
      fetchCourseData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete chapter");
    }
  };

  // =========================================================
  // 3. VIDEO & NOTES HANDLERS
  // =========================================================
  const openAddVideo = () => {
    setVideoMode("add");
    setEditingVideo(null);
    setVideoTitle("");
    setVideoSourceType("url");
    setVideoUrlInput("");
    setVideoFile(null);
    setDurationInput("");
    setPdfSourceType("url");
    setPdfUrlInput("");
    setPdfFile(null);
    setVideoModalOpen(true);
  };

  const openEditVideo = (video, e) => {
    e?.stopPropagation();
    setVideoMode("edit");
    setEditingVideo(video);
    setVideoTitle(video.title || "");
    setVideoSourceType("url");
    setVideoUrlInput(video.videoUrl || "");
    setVideoFile(null);
    setDurationInput(video.duration || "");
    setPdfSourceType("url");
    setPdfUrlInput(video.pdfUrl || "");
    setPdfFile(null);
    setVideoModalOpen(true);
  };

  const handleSaveVideo = async (e) => {
    e?.preventDefault();
    if (!videoTitle.trim()) {
      toast.warn("Please enter a video title");
      return;
    }

    setVideoSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", videoTitle.trim());
      formData.append("duration", durationInput.trim());

      if (videoSourceType === "file" && videoFile) {
        formData.append("video", videoFile);
      } else if (videoUrlInput.trim()) {
        formData.append("videoUrl", videoUrlInput.trim());
      }

      if (pdfSourceType === "file" && pdfFile) {
        formData.append("pdf", pdfFile);
      } else if (pdfUrlInput.trim()) {
        formData.append("pdfUrl", pdfUrlInput.trim());
      }

      if (videoMode === "add") {
        await axios.post(
          `${serverUrl}/api/course/${courseId}/subject/${selectedSubject._id}/chapter/${selectedChapter._id}/video`,
          formData,
          {
            withCredentials: true,
          }
        );
        toast.success(`Video lesson added!`);
      } else {
        await axios.put(
          `${serverUrl}/api/course/${courseId}/subject/${selectedSubject._id}/chapter/${selectedChapter._id}/video/${editingVideo._id}`,
          formData,
          {
            withCredentials: true,
          }
        );
        toast.success(`Video lesson updated!`);
      }

      setVideoModalOpen(false);
      fetchCourseData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save video");
    } finally {
      setVideoSaving(false);
    }
  };

  const handleDeleteVideo = async (videoId, title, e) => {
    e?.stopPropagation();
    if (!window.confirm(`Delete video "${title}"?`)) return;

    try {
      await axios.delete(
        `${serverUrl}/api/course/${courseId}/subject/${selectedSubject._id}/chapter/${selectedChapter._id}/video/${videoId}`,
        { withCredentials: true }
      );
      toast.success("Video lesson removed");
      fetchCourseData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete video");
    }
  };

  if (loading) {
    return (
      <AdminLayout activeTab="free-courses">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 bg-white rounded-3xl border border-gray-200/80">
          <ClipLoader color="#059669" size={40} />
          <p className="text-xs font-semibold text-gray-500">Loading Free Batch Curriculum...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!course) {
    return (
      <AdminLayout activeTab="free-courses">
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 max-w-md mx-auto">
          <h2 className="text-lg font-bold text-gray-900">Course Not Found</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">Could not locate course data.</p>
          <button
            onClick={() => navigate("/admin/free-courses")}
            className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-xs"
          >
            Back to Free Courses
          </button>
        </div>
      </AdminLayout>
    );
  }

  const subjects = course.subjects || [];

  return (
    <AdminLayout activeTab="free-courses">
      <div className="space-y-6">
        
        {/* ========================================================= */}
        {/* TOP HEADER: COURSE BANNER & META                         */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
              <img
                src={course.thumbnail || emptyImg}
                alt={course.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = emptyImg;
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                  FREE BATCH
                </span>
                <span className="text-xs font-semibold text-gray-400">
                  {course.category}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-1">
                {course.title}
              </h1>
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 mt-1">
                <span>{subjects.length} Subjects</span>
                <span>•</span>
                <span>{totalChapters} Chapters</span>
                <span>•</span>
                <span>{totalVideos} Videos</span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => navigate(`/freecourse/${courseId}`)}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer border border-emerald-200 shadow-xs"
              title="See student view matching Image 2"
            >
              <FiExternalLink />
              <span>Preview Free Batch ↗</span>
            </button>

            <button
              onClick={() => navigate(`/addcourses/${courseId}`)}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <FiEdit2 />
              <span>Edit Details</span>
            </button>

            <button
              onClick={() => navigate("/admin/free-courses")}
              className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FiArrowLeft />
              <span>All Free Batches</span>
            </button>
          </div>
        </div>

        {/* Telegram Community Quick Setting */}
        <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#229ED9] text-white flex items-center justify-center text-lg shrink-0">
              <FaTelegramPlane />
            </div>
            <div>
              <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wide">
                Telegram Channel Link
              </h4>
              <p className="text-xs text-sky-800">
                Students will join this Telegram channel from the Telegram tab in the batch.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="url"
              placeholder="https://t.me/yourbatch"
              value={telegramLink}
              onChange={(e) => setTelegramLink(e.target.value)}
              className="px-3.5 py-2 bg-white border border-sky-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 w-full sm:w-64"
            />
            <button
              onClick={handleSaveTelegram}
              disabled={savingTelegram}
              className="px-4 py-2 bg-[#229ED9] hover:bg-[#1E88E5] text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0 shadow-xs flex items-center gap-1"
            >
              {savingTelegram ? <ClipLoader size={14} color="white" /> : <FiCheck />}
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* HIERARCHICAL NAVIGATION BREADCRUMBS                       */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-gray-200/80 px-5 py-3.5 shadow-xs flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 overflow-x-auto whitespace-nowrap py-1">
            <span
              onClick={() => { setSelectedSubject(null); setSelectedChapter(null); }}
              className={`cursor-pointer transition hover:text-emerald-700 ${!selectedSubject ? "text-emerald-700 font-extrabold" : ""}`}
            >
              Subjects ({subjects.length})
            </span>

            {selectedSubject && (
              <>
                <span>/</span>
                <span
                  onClick={() => setSelectedChapter(null)}
                  className={`cursor-pointer transition hover:text-blue-700 ${!selectedChapter ? "text-blue-700 font-extrabold" : ""}`}
                >
                  {selectedSubject.title}
                </span>
              </>
            )}

            {selectedSubject && selectedChapter && (
              <>
                <span>/</span>
                <span className="text-purple-700 font-extrabold">
                  {selectedChapter.title}
                </span>
              </>
            )}
          </div>

          {/* Quick CTA depending on Level */}
          <div>
            {!selectedSubject && (
              <button
                onClick={openAddSubject}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <FiPlus />
                <span>Add New Subject</span>
              </button>
            )}

            {selectedSubject && !selectedChapter && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  ← Back to Subjects
                </button>
                <button
                  onClick={openAddChapter}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FiPlus />
                  <span>Add Chapter</span>
                </button>
              </div>
            )}

            {selectedSubject && selectedChapter && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedChapter(null)}
                  className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  ← Back to Chapters
                </button>
                <button
                  onClick={openAddVideo}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FiPlus />
                  <span>Add Video & PDF Notes</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* LEVEL 1: SUBJECTS LIST (Matching Image 2)                 */}
        {/* ========================================================= */}
        {!selectedSubject && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Batch Subjects
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Subjects appear as primary cards under the "Recorded" tab in student view (Image 2).
                </p>
              </div>
            </div>

            {subjects.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center max-w-lg mx-auto">
                <FiBookOpen className="text-4xl text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900">No Subjects Added Yet</h3>
                <p className="text-xs text-gray-500 mt-1 mb-5">
                  Start by adding your first subject (e.g. Maths 10th Bihar Board, English 10th Bihar Board).
                </p>
                <button
                  onClick={openAddSubject}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  + Add First Subject
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {subjects.map((sub, index) => {
                  const chaptersCount = sub.chapters?.length || 0;
                  const videosCount = (sub.chapters || []).reduce((acc, c) => acc + (c.videos?.length || 0), 0);

                  return (
                    <div
                      key={sub._id || index}
                      onClick={() => setSelectedSubject(sub)}
                      className="bg-white rounded-2xl border border-gray-200/90 hover:border-blue-400 hover:shadow-lg transition-all p-5 flex flex-col justify-between cursor-pointer group shadow-xs"
                    >
                      <div className="flex items-start gap-4">
                        {/* Subject Thumbnail */}
                        <div className="w-20 h-14 rounded-xl border border-gray-200 bg-amber-50 shrink-0 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                          {sub.thumbnail ? (
                            <img
                              src={sub.thumbnail}
                              alt={sub.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = emptyImg;
                              }}
                            />
                          ) : (
                            <span className="text-[10px] font-black text-amber-800 uppercase px-1 text-center">
                              {sub.title.slice(0, 10)}
                            </span>
                          )}
                        </div>

                        {/* Subject Title & Stats */}
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                            Subject
                          </span>
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition truncate mt-0.5">
                            {sub.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mt-2">
                            <span>{chaptersCount} Chapters</span>
                            <span>•</span>
                            <span>{videosCount} Videos</span>
                          </div>
                        </div>
                      </div>

                      {/* Subject Card Footer */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                          <span>Manage Chapters</span>
                          <span>→</span>
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => openEditSubject(sub, e)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition"
                            title="Edit Subject"
                          >
                            <FiEdit2 className="text-xs" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSubject(sub._id, sub.title, e)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Subject"
                          >
                            <FiTrash2 className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* LEVEL 2: CHAPTERS LIST (Inside selectedSubject)           */}
        {/* ========================================================= */}
        {selectedSubject && !selectedChapter && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Chapters in "{selectedSubject.title}"
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Click on a chapter to add and organize video lessons and attached PDF notes.
                </p>
              </div>
            </div>

            {(selectedSubject.chapters || []).length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center max-w-lg mx-auto">
                <FiLayers className="text-4xl text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900">No Chapters in this Subject</h3>
                <p className="text-xs text-gray-500 mt-1 mb-5">
                  Add chapters (e.g. Chapter 1: Real Numbers, Chapter 2: Polynomials).
                </p>
                <button
                  onClick={openAddChapter}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  + Add First Chapter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(selectedSubject.chapters || []).map((chap, index) => {
                  const vCount = chap.videos?.length || 0;

                  return (
                    <div
                      key={chap._id || index}
                      onClick={() => setSelectedChapter(chap)}
                      className="bg-white rounded-2xl border border-gray-200/90 hover:border-purple-400 hover:shadow-lg transition-all p-5 flex flex-col justify-between cursor-pointer group shadow-xs"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-14 rounded-xl border border-gray-200 bg-blue-50 shrink-0 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                          {chap.thumbnail || selectedSubject.thumbnail ? (
                            <img
                              src={chap.thumbnail || selectedSubject.thumbnail}
                              alt={chap.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = emptyImg;
                              }}
                            />
                          ) : (
                            <span className="text-[10px] font-black text-blue-700 uppercase px-1 text-center">
                              {chap.title.slice(0, 10)}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                            Chapter
                          </span>
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition truncate mt-0.5">
                            {chap.title}
                          </h4>
                          <p className="text-xs font-semibold text-gray-500 mt-2 flex items-center gap-1.5">
                            <FiVideo className="text-purple-600" />
                            <span>{vCount} Video Lessons</span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-600 group-hover:underline flex items-center gap-1">
                          <span>Manage Videos & PDFs</span>
                          <span>→</span>
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => openEditChapter(chap, e)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition"
                            title="Edit Chapter"
                          >
                            <FiEdit2 className="text-xs" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteChapter(chap._id, chap.title, e)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Chapter"
                          >
                            <FiTrash2 className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* LEVEL 3: VIDEOS LIST (Inside selectedChapter)             */}
        {/* ========================================================= */}
        {selectedSubject && selectedChapter && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Video Lessons in "{selectedChapter.title}"
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Students will see Watch and View PDF buttons for each lesson matching Screen 4.
                </p>
              </div>
            </div>

            {(selectedChapter.videos || []).length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center max-w-lg mx-auto">
                <FiVideo className="text-4xl text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900">No Videos in this Chapter</h3>
                <p className="text-xs text-gray-500 mt-1 mb-5">
                  Add video lessons via YouTube link, direct video URL, or file upload with optional PDF notes.
                </p>
                <button
                  onClick={openAddVideo}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  + Add First Video Lesson
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {(selectedChapter.videos || []).map((video, idx) => (
                  <div
                    key={video._id || idx}
                    className="bg-white rounded-2xl border border-gray-200/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-gray-300 transition"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        onClick={() => setPreviewVideo(video)}
                        className="w-20 h-13 sm:w-24 sm:h-15 rounded-xl border border-gray-200 bg-gray-900 shrink-0 overflow-hidden relative cursor-pointer group"
                      >
                        {video.thumbnail || selectedChapter.thumbnail || course.thumbnail ? (
                          <img
                            src={video.thumbnail || selectedChapter.thumbnail || course.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.target.src = emptyImg;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                            <FiPlay className="text-lg" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition">
                          <div className="w-6 h-6 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-xs">
                            <FiPlay className="text-[10px] ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400">
                            #{idx + 1}
                          </span>
                          <h4
                            onClick={() => setPreviewVideo(video)}
                            className="text-sm sm:text-base font-bold text-gray-900 hover:text-purple-600 transition truncate cursor-pointer"
                          >
                            {video.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-1">
                          {video.duration && (
                            <span className="flex items-center gap-1">
                              <FiClock className="text-xs" />
                              <span>{video.duration}</span>
                            </span>
                          )}
                          {video.pdfUrl ? (
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                              <FiFileText className="text-xs" />
                              <span>PDF Notes Attached</span>
                            </span>
                          ) : (
                            <span className="text-gray-400">No PDF</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setPreviewVideo(video)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                        title="Watch Preview"
                      >
                        <FiPlay className="text-xs" />
                        <span>Watch</span>
                      </button>

                      <button
                        onClick={(e) => openEditVideo(video, e)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                        title="Edit Video Lesson"
                      >
                        <FiEdit2 className="text-sm" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteVideo(video._id, video.title, e)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                        title="Delete Video Lesson"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* 1. SUBJECT MODAL                                          */}
      {/* ========================================================= */}
      {subjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900">
                {subjectMode === "add" ? "Add New Subject" : "Edit Subject"}
              </h3>
              <button
                onClick={() => setSubjectModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Subject Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maths 10th Bihar Board, Science, Hindi"
                  value={subjectTitle}
                  onChange={(e) => setSubjectTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Subject Thumbnail
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setSubjectThumbType("url")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      subjectThumbType === "url" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubjectThumbType("file")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      subjectThumbType === "file" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Upload File
                  </button>
                </div>

                {subjectThumbType === "url" ? (
                  <input
                    type="url"
                    placeholder="https://... image url"
                    value={subjectThumbUrl}
                    onChange={(e) => setSubjectThumbUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white"
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSubjectThumbFile(e.target.files[0])}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subjectSaving}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  {subjectSaving && <ClipLoader size={14} color="white" />}
                  <span>{subjectMode === "add" ? "Create Subject" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CHAPTER MODAL                                          */}
      {/* ========================================================= */}
      {chapterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900">
                {chapterMode === "add" ? `Add Chapter to "${selectedSubject?.title}"` : "Edit Chapter"}
              </h3>
              <button
                onClick={() => setChapterModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveChapter} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1: Real Numbers, Chapter 2: Polynomials"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Chapter Thumbnail (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setChapterThumbType("url")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      chapterThumbType === "url" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setChapterThumbType("file")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      chapterThumbType === "file" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Upload File
                  </button>
                </div>

                {chapterThumbType === "url" ? (
                  <input
                    type="url"
                    placeholder="https://... image url"
                    value={chapterThumbUrl}
                    onChange={(e) => setChapterThumbUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white"
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setChapterThumbFile(e.target.files[0])}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setChapterModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={chapterSaving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  {chapterSaving && <ClipLoader size={14} color="white" />}
                  <span>{chapterMode === "add" ? "Create Chapter" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. VIDEO & PDF MODAL                                      */}
      {/* ========================================================= */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900">
                {videoMode === "add" ? "Add Video Lesson & Notes" : "Edit Video Lesson"}
              </h3>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Video Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction & Formulas Part 1"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              {/* Video Duration */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Duration (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 45:30 or 1h 10m"
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white"
                />
              </div>

              {/* Video Source */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Video Source *
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setVideoSourceType("url")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        videoSourceType === "url" ? "bg-purple-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      <FiLink className="inline mr-1" /> URL / YouTube
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSourceType("file")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        videoSourceType === "file" ? "bg-purple-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      <FiUploadCloud className="inline mr-1" /> Upload Video
                    </button>
                  </div>
                </div>

                {videoSourceType === "url" ? (
                  <input
                    type="text"
                    placeholder="e.g. https://www.youtube.com/watch?v=... or direct MP4"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                ) : (
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                )}
              </div>

              {/* PDF Notes */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Attached PDF Notes (Optional)
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPdfSourceType("url")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        pdfSourceType === "url" ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      <FiLink className="inline mr-1" /> PDF URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfSourceType("file")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        pdfSourceType === "file" ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      <FiUploadCloud className="inline mr-1" /> Upload PDF
                    </button>
                  </div>
                </div>

                {pdfSourceType === "url" ? (
                  <input
                    type="url"
                    placeholder="https://... pdf link"
                    value={pdfUrlInput}
                    onChange={(e) => setPdfUrlInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                ) : (
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={videoSaving}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  {videoSaving && <ClipLoader size={14} color="white" />}
                  <span>{videoMode === "add" ? "Add Video Lesson" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. VIDEO PREVIEW MODAL                                    */}
      {/* ========================================================= */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between text-white">
              <h4 className="font-bold text-sm truncate">{previewVideo.title}</h4>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
              >
                <FiX className="text-lg" />
              </button>
            </div>
            <div className="w-full aspect-video bg-black flex items-center justify-center">
              {previewVideo.videoUrl ? (
                isIframeVideo(previewVideo.videoUrl) ? (
                  <iframe
                    src={getEmbedUrl(previewVideo.videoUrl)}
                    title={previewVideo.title}
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    autoPlay
                    src={previewVideo.videoUrl}
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <p className="text-xs text-gray-400">No streamable video URL provided.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

export default ManageFreeCurriculum;
