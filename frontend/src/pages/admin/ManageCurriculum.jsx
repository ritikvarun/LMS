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
  FiArrowUp, 
  FiArrowDown,
  FiEye,
  FiUploadCloud,
  FiLink,
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import { FaArrowLeftLong, FaPlay } from 'react-icons/fa6';
import { ClipLoader } from 'react-spinners';
import AdminLayout from './AdminLayout';

function ManageCurriculum() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Topic input
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [addingTopic, setAddingTopic] = useState(false);

  // Expanded topics state { [topicId]: true/false }
  const [expandedTopics, setExpandedTopics] = useState({});

  // Topic rename modal
  const [editingTopic, setEditingTopic] = useState(null);
  const [renameInput, setRenameInput] = useState("");
  const [renamingTopic, setRenamingTopic] = useState(false);

  // Video Modal State
  // modalMode: "add" | "edit" | null
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);

  // Video form fields
  const [videoTitle, setVideoTitle] = useState("");
  const [videoSourceType, setVideoSourceType] = useState("url"); // "url" | "file"
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [durationInput, setDurationInput] = useState("");
  const [pdfSourceType, setPdfSourceType] = useState("url"); // "url" | "file"
  const [pdfUrlInput, setPdfUrlInput] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [isPreviewFree, setIsPreviewFree] = useState(false);
  const [videoSaving, setVideoSaving] = useState(false);

  // Video Preview Modal
  const [previewVideo, setPreviewVideo] = useState(null);

  // Fetch Course Curriculum
  const fetchCurriculum = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/course/${courseId}/curriculum`, { withCredentials: true });
      if (res.data?.success) {
        if (res.data.isFree === true || !res.data.price || Number(res.data.price) <= 0) {
          navigate(`/admin/free-curriculum/${courseId}`, { replace: true });
          return;
        }
        setCourseData(res.data);
        const tList = res.data.topics || [];
        setTopics(tList);

        // Expand all topics by default
        const expanded = {};
        tList.forEach((t) => {
          expanded[t._id] = true;
        });
        setExpandedTopics(expanded);
      }
    } catch (err) {
      console.error("Fetch curriculum error:", err);
      toast.error(err?.response?.data?.message || "Failed to load curriculum");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, [courseId]);

  // Total videos count
  const totalVideosCount = useMemo(() => {
    return topics.reduce((sum, t) => sum + (t.videos?.length || 0), 0);
  }, [topics]);

  // Toggle Topic Accordion
  const toggleTopic = (topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  // --- TOPIC ACTIONS ---

  // 1. Add Topic
  const handleAddTopic = async (e) => {
    e?.preventDefault();
    if (!newTopicTitle.trim()) {
      toast.warn("Please enter a topic title (e.g. ai, ml, react)");
      return;
    }

    setAddingTopic(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/course/${courseId}/topic`,
        { title: newTopicTitle.trim() },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(`Topic "${newTopicTitle}" added!`);
        setNewTopicTitle("");
        setTopics(res.data.topics || []);
        if (res.data.topic?._id) {
          setExpandedTopics((prev) => ({ ...prev, [res.data.topic._id]: true }));
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add topic");
    } finally {
      setAddingTopic(false);
    }
  };

  // 2. Open Rename Modal
  const openRenameModal = (topic) => {
    setEditingTopic(topic);
    setRenameInput(topic.title);
  };

  // 3. Save Rename
  const handleSaveRename = async () => {
    if (!renameInput.trim()) {
      toast.warn("Please enter a topic name");
      return;
    }
    setRenamingTopic(true);
    try {
      const res = await axios.put(
        `${serverUrl}/api/course/${courseId}/topic/${editingTopic._id}`,
        { title: renameInput.trim() },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("Topic renamed successfully");
        setTopics(res.data.topics || []);
        setEditingTopic(null);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to rename topic");
    } finally {
      setRenamingTopic(false);
    }
  };

  // 4. Delete Topic
  const handleDeleteTopic = async (topicId, topicTitle) => {
    if (!window.confirm(`Delete topic "${topicTitle}" and all its videos?`)) return;
    try {
      const res = await axios.delete(
        `${serverUrl}/api/course/${courseId}/topic/${topicId}`,
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(`Topic "${topicTitle}" removed`);
        setTopics(res.data.topics || []);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove topic");
    }
  };

  // 5. Reorder Topic (Move Up / Down)
  const handleMoveTopic = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= topics.length) return;

    const newTopics = [...topics];
    const [moved] = newTopics.splice(index, 1);
    newTopics.splice(targetIndex, 0, moved);
    setTopics(newTopics);

    try {
      const chapterIds = newTopics.map((t) => t._id);
      await axios.put(
        `${serverUrl}/api/course/${courseId}/reorder-topics`,
        { chapterIds },
        { withCredentials: true }
      );
      toast.success("Topics reordered!");
    } catch (err) {
      console.error("Reorder topics error:", err);
      fetchCurriculum();
    }
  };

  // --- VIDEO ACTIONS ---

  // 1. Open Add Video Modal
  const openAddVideoModal = (topicId) => {
    setModalMode("add");
    setActiveTopicId(topicId);
    setEditingVideo(null);
    setVideoTitle("");
    setVideoSourceType("url");
    setVideoUrlInput("");
    setVideoFile(null);
    setDurationInput("");
    setPdfSourceType("url");
    setPdfUrlInput("");
    setPdfFile(null);
    setIsPreviewFree(false);
    setVideoModalOpen(true);
  };

  // 2. Open Edit Video Modal
  const openEditVideoModal = (topicId, video) => {
    setModalMode("edit");
    setActiveTopicId(topicId);
    setEditingVideo(video);
    setVideoTitle(video.title || "");
    setVideoSourceType("url");
    setVideoUrlInput(video.videoUrl || "");
    setVideoFile(null);
    setDurationInput(video.duration || "");
    setPdfSourceType("url");
    setPdfUrlInput(video.pdfUrl || "");
    setPdfFile(null);
    setIsPreviewFree(Boolean(video.isPreviewFree));
    setVideoModalOpen(true);
  };

  // 3. Save Video (Add or Edit)
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
      formData.append("isPreviewFree", isPreviewFree ? "true" : "false");

      if (videoSourceType === "file" && videoFile) {
        formData.append("video", videoFile);
      } else {
        formData.append("videoUrl", videoUrlInput.trim());
      }

      if (pdfSourceType === "file" && pdfFile) {
        formData.append("pdf", pdfFile);
      } else {
        formData.append("pdfUrl", pdfUrlInput.trim());
      }

      let res;
      if (modalMode === "add") {
        res = await axios.post(
          `${serverUrl}/api/course/${courseId}/topic/${activeTopicId}/video`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
      } else {
        res = await axios.put(
          `${serverUrl}/api/course/${courseId}/topic/${activeTopicId}/video/${editingVideo._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
      }

      if (res.data?.success) {
        toast.success(modalMode === "add" ? "Video added successfully!" : "Video updated!");
        setTopics(res.data.topics || []);
        setVideoModalOpen(false);
      }
    } catch (err) {
      console.error("Save video error:", err);
      toast.error(err?.response?.data?.message || "Failed to save video");
    } finally {
      setVideoSaving(false);
    }
  };

  // 4. Delete Video
  const handleDeleteVideo = async (topicId, videoId, vTitle) => {
    if (!window.confirm(`Delete video "${vTitle}"?`)) return;
    try {
      const res = await axios.delete(
        `${serverUrl}/api/course/${courseId}/topic/${topicId}/video/${videoId}`,
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(`Video "${vTitle}" deleted`);
        setTopics(res.data.topics || []);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete video");
    }
  };

  // 5. Reorder Videos inside Topic (Move Up / Down)
  const handleMoveVideo = async (topicId, videoIndex, direction) => {
    const topic = topics.find((t) => t._id === topicId);
    if (!topic || !topic.videos) return;

    const targetIndex = direction === "up" ? videoIndex - 1 : videoIndex + 1;
    if (targetIndex < 0 || targetIndex >= topic.videos.length) return;

    const newVideos = [...topic.videos];
    const [moved] = newVideos.splice(videoIndex, 1);
    newVideos.splice(targetIndex, 0, moved);

    // Update local state immediately for instant feedback
    const updatedTopics = topics.map((t) => {
      if (t._id === topicId) {
        return { ...t, videos: newVideos };
      }
      return t;
    });
    setTopics(updatedTopics);

    try {
      const videoIds = newVideos.map((v) => v._id);
      await axios.put(
        `${serverUrl}/api/course/${courseId}/topic/${topicId}/reorder-videos`,
        { videoIds },
        { withCredentials: true }
      );
      toast.success("Videos order updated!");
    } catch (err) {
      console.error("Reorder videos error:", err);
      fetchCurriculum();
    }
  };

  // Helper for embed URLs in preview modal
  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  return (
    <AdminLayout activeTab="courses">
      <div className="space-y-6 pb-24 max-w-5xl mx-auto">

        {/* 1. TOP HEADER & BREADCRUMB */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/addcourses/${courseId}`)}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition cursor-pointer text-gray-700"
                title="Back to Course Details"
              >
                <FaArrowLeftLong className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                    Curriculum & Video Tracks
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                    courseData?.isFree ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {courseData?.isFree ? "FREE BATCH" : "PRO BATCH"}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mt-1">
                  {courseData?.courseTitle || "Course Curriculum"}
                </h1>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => navigate(`/viewlecture/${courseId}`)}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-xs border border-emerald-200"
                title="Preview what students see in classroom"
              >
                <FiEye className="text-base text-emerald-600" />
                <span>Student Preview</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="pt-3 border-t border-gray-100 flex items-center gap-3 text-xs font-semibold text-gray-600 flex-wrap">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg flex items-center gap-1.5 font-bold">
              <FiBookOpen /> {topics.length} {topics.length === 1 ? "Topic" : "Topics"}
            </span>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg flex items-center gap-1.5 font-bold">
              <FiVideo /> {totalVideosCount} {totalVideosCount === 1 ? "Video" : "Videos Total"}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500 font-normal">
              Ek topic me multiple videos add karein (jaise ai me 1.1, 1.2, 1.3... aur ml me 2.1, 2.2, 2.3)
            </span>
          </div>
        </div>

        {/* 2. FAST ADD TOPIC BAR */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-md space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-lg">📁</span>
            <h2 className="font-extrabold text-base sm:text-lg">
              Add New Topic / Chapter
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-indigo-200">
            Jaise: <strong className="text-white">ai</strong>, <strong className="text-white">ml</strong>, <strong className="text-white">Web Development</strong>, <strong className="text-white">Python</strong>. Phir is topic ke andar aap chahe jitne videos add kar sakte hain!
          </p>

          <form onSubmit={handleAddTopic} className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <input
              type="text"
              placeholder="e.g. ai (Artificial Intelligence)"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-gray-900 placeholder-indigo-300 focus:placeholder-gray-400 border border-white/20 focus:border-white rounded-xl text-sm outline-none transition"
            />
            <button
              type="submit"
              disabled={addingTopic || !newTopicTitle.trim()}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-lg"
            >
              {addingTopic ? <ClipLoader size={18} color="#000" /> : (
                <>
                  <FiPlus className="text-base" />
                  <span>+ Add Topic</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 3. TOPICS & VIDEOS LIST */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-200/80">
            <ClipLoader size={36} color="#4F46E5" />
            <p className="text-sm text-gray-500 mt-3 font-semibold">Loading topics & videos...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 max-w-lg mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl">
              📂
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">No Topics Created Yet</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Start by typing a topic name above (like <strong>"ai"</strong> or <strong>"ml"</strong>) and click <strong>"+ Add Topic"</strong>!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {topics.map((topic, tIdx) => {
              const isOpen = Boolean(expandedTopics[topic._id]);
              const videos = topic.videos || [];
              const topicNumber = tIdx + 1;

              return (
                <div
                  key={topic._id}
                  className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden transition-all"
                >
                  {/* TOPIC HEADER BAR */}
                  <div className="p-5 sm:p-6 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left: Title, Counter & Toggle */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button
                        onClick={() => toggleTopic(topic._id)}
                        className="w-10 h-10 rounded-2xl bg-gray-900 text-white font-mono text-sm font-extrabold flex items-center justify-center shrink-0 cursor-pointer shadow-xs hover:bg-indigo-600 transition-colors"
                        title="Click to toggle videos"
                      >
                        {topicNumber}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 
                            onClick={() => toggleTopic(topic._id)}
                            className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight truncate cursor-pointer hover:text-indigo-600 transition-colors"
                          >
                            {topic.title}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                            {videos.length} {videos.length === 1 ? "Video" : "Videos"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Videos will be numbered as {topicNumber}.1, {topicNumber}.2, {topicNumber}.3...
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Move Up / Down Buttons for Topic Order */}
                      <div className="flex items-center bg-gray-100 rounded-xl p-0.5">
                        <button
                          type="button"
                          disabled={tIdx === 0}
                          onClick={() => handleMoveTopic(tIdx, "up")}
                          className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                          title="Move Topic Up"
                        >
                          <FiArrowUp className="text-xs" />
                        </button>
                        <button
                          type="button"
                          disabled={tIdx === topics.length - 1}
                          onClick={() => handleMoveTopic(tIdx, "down")}
                          className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                          title="Move Topic Down"
                        >
                          <FiArrowDown className="text-xs" />
                        </button>
                      </div>

                      {/* Rename Topic Button */}
                      <button
                        onClick={() => openRenameModal(topic)}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer border border-gray-200"
                        title="Rename Topic"
                      >
                        <FiEdit2 className="text-xs" />
                      </button>

                      {/* Delete Topic Button */}
                      <button
                        onClick={() => handleDeleteTopic(topic._id, topic.title)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer border border-gray-200"
                        title="Delete Topic"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>

                      {/* PRIMARY: + Add Video Button */}
                      <button
                        onClick={() => openAddVideoModal(topic._id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <FiPlus />
                        <span>+ Add Video to "{topic.title}"</span>
                      </button>

                      {/* Toggle Chevron */}
                      <button
                        onClick={() => toggleTopic(topic._id)}
                        className="p-2 text-gray-500 hover:text-gray-900 rounded-xl transition cursor-pointer"
                      >
                        {isOpen ? <FiChevronUp className="text-base" /> : <FiChevronDown className="text-base" />}
                      </button>
                    </div>

                  </div>

                  {/* VIDEOS LIST (SHOWN WHEN OPEN) */}
                  {isOpen && (
                    <div className="p-5 sm:p-6 bg-white space-y-3.5 animate-in fade-in duration-150">
                      {videos.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
                          <p className="text-sm font-semibold text-gray-600">
                            No videos added to topic <strong>"{topic.title}"</strong> yet.
                          </p>
                          <button
                            onClick={() => openAddVideoModal(topic._id)}
                            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <FiPlus /> Click here to add video {topicNumber}.1
                          </button>
                        </div>
                      ) : (
                        videos.map((video, vIdx) => {
                          const subIndex = `${topicNumber}.${vIdx + 1}`;
                          const hasVideo = Boolean(video.videoUrl);

                          return (
                            <div
                              key={video._id || vIdx}
                              className="p-4 rounded-2xl bg-gray-50/70 hover:bg-indigo-50/20 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                            >
                              {/* Video Details */}
                              <div className="flex items-start gap-3 min-w-0">
                                {/* Auto Number Badge e.g. 1.1, 1.2 */}
                                <span className="w-9 h-9 rounded-xl bg-white border border-gray-300 text-indigo-700 font-mono text-xs font-extrabold flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                                  {subIndex}
                                </span>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-sm sm:text-base text-gray-900 leading-snug">
                                      {video.title}
                                    </h4>
                                    {video.isPreviewFree && (
                                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md border border-emerald-200">
                                        FREE PREVIEW
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                                    {hasVideo ? (
                                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                        <FiCheckCircle /> Video Ready
                                      </span>
                                    ) : (
                                      <span className="text-amber-600 font-semibold flex items-center gap-1">
                                        <FiClock /> Video URL Pending
                                      </span>
                                    )}

                                    {video.duration && (
                                      <span>• ⏱️ {video.duration}</span>
                                    )}

                                    {video.pdfUrl && (
                                      <a
                                        href={video.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center gap-1"
                                      >
                                        <FiFileText /> PDF Notes
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Video Actions */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                
                                {/* Move Up / Down Buttons within this Topic */}
                                <div className="flex items-center bg-white border border-gray-200 rounded-xl p-0.5">
                                  <button
                                    type="button"
                                    disabled={vIdx === 0}
                                    onClick={() => handleMoveVideo(topic._id, vIdx, "up")}
                                    className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                    title="Move Video Up (e.g. 1.2 -> 1.1)"
                                  >
                                    <FiArrowUp className="text-xs" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={vIdx === videos.length - 1}
                                    onClick={() => handleMoveVideo(topic._id, vIdx, "down")}
                                    className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                    title="Move Video Down (e.g. 1.1 -> 1.2)"
                                  >
                                    <FiArrowDown className="text-xs" />
                                  </button>
                                </div>

                                {/* Play Preview Button */}
                                {hasVideo && (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewVideo({ ...video, subIndex })}
                                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                                    title="Preview video playback"
                                  >
                                    <FaPlay className="text-[9px]" />
                                    <span>Play</span>
                                  </button>
                                )}

                                {/* Edit Video */}
                                <button
                                  type="button"
                                  onClick={() => openEditVideoModal(topic._id, video)}
                                  className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-xl border border-gray-200 transition cursor-pointer"
                                  title="Edit Video"
                                >
                                  <FiEdit2 className="text-xs" />
                                </button>

                                {/* Delete Video */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVideo(topic._id, video._id, video.title)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-200 transition cursor-pointer"
                                  title="Delete Video"
                                >
                                  <FiTrash2 className="text-xs" />
                                </button>

                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT VIDEO MODAL                                          */}
      {/* ========================================================================= */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  {modalMode === "add" ? "New Lesson" : "Update Lesson"}
                </span>
                <h3 className="font-extrabold text-lg sm:text-xl text-gray-900">
                  {modalMode === "add" ? "Add Video Lesson" : "Edit Video Lesson"}
                </h3>
              </div>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-4">
              
              {/* Video Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Video Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1. Introduction to Neural Networks"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 focus:border-indigo-500 rounded-xl text-sm outline-none transition"
                />
              </div>

              {/* Video Source Tabs */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Video Source (Stream / URL or File) *
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setVideoSourceType("url")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition border flex items-center justify-center gap-1.5 cursor-pointer ${
                      videoSourceType === "url"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <FiLink />
                    <span>Paste Video URL / Embed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoSourceType("file")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition border flex items-center justify-center gap-1.5 cursor-pointer ${
                      videoSourceType === "file"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <FiUploadCloud />
                    <span>Upload Video File</span>
                  </button>
                </div>

                {videoSourceType === "url" ? (
                  <input
                    type="url"
                    placeholder="https://iframe.mediadelivery.net/... or https://youtube.com/..."
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 focus:border-indigo-500 rounded-xl text-xs sm:text-sm outline-none transition"
                  />
                ) : (
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none"
                  />
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Estimated Duration (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15:30 min"
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 focus:border-indigo-500 rounded-xl text-sm outline-none transition"
                />
              </div>

              {/* PDF Notes Source */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Class Notes / PDF Attachment (optional)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setPdfSourceType("url")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition border flex items-center justify-center gap-1.5 cursor-pointer ${
                      pdfSourceType === "url"
                        ? "bg-gray-800 text-white border-gray-800"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    <span>PDF Link / Cloudinary URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfSourceType("file")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition border flex items-center justify-center gap-1.5 cursor-pointer ${
                      pdfSourceType === "file"
                        ? "bg-gray-800 text-white border-gray-800"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    <span>Upload PDF File</span>
                  </button>
                </div>

                {pdfSourceType === "url" ? (
                  <input
                    type="url"
                    placeholder="https://.../notes.pdf"
                    value={pdfUrlInput}
                    onChange={(e) => setPdfUrlInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 focus:border-indigo-500 rounded-xl text-xs outline-none transition"
                  />
                ) : (
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none"
                  />
                )}
              </div>

              {/* Free Preview Toggle */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="previewFreeCheck"
                  checked={isPreviewFree}
                  onChange={(e) => setIsPreviewFree(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="previewFreeCheck" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Allow students to watch this video as a free sample preview
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={videoSaving}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {videoSaving ? <ClipLoader size={16} color="#fff" /> : (
                    <span>{modalMode === "add" ? "Add Video" : "Save Changes"}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RENAME TOPIC MODAL                                              */}
      {/* ========================================================================= */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-lg text-gray-900">
              Rename Topic
            </h3>
            <input
              type="text"
              required
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 focus:border-indigo-500 rounded-xl text-sm outline-none"
              placeholder="e.g. ai, ml, react..."
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTopic(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRename}
                disabled={renamingTopic}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                {renamingTopic ? <ClipLoader size={14} color="#fff" /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIDEO PLAYBACK PREVIEW MODAL                                    */}
      {/* ========================================================================= */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-gray-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-indigo-400">
                  Preview: Lesson {previewVideo.subIndex}
                </span>
                <h4 className="font-bold text-sm sm:text-base truncate">
                  {previewVideo.title}
                </h4>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black flex items-center justify-center">
              {previewVideo.videoUrl?.includes("youtube") || previewVideo.videoUrl?.includes("youtu.be") || previewVideo.videoUrl?.includes("mediadelivery.net") ? (
                <iframe
                  src={getEmbedUrl(previewVideo.videoUrl)}
                  title={previewVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                />
              ) : (
                <video
                  src={previewVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  Your browser does not support HTML video.
                </video>
              )}
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

export default ManageCurriculum;
