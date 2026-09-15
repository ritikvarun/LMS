import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaPlay, 
  FaChevronLeft, 
  FaChevronRight, 
  FaLock, 
  FaCheck, 
  FaHouse, 
  FaArrowLeft 
} from 'react-icons/fa6';
import { 
  FiVideo, 
  FiFileText, 
  FiCheckCircle, 
  FiDownload, 
  FiChevronDown, 
  FiChevronUp, 
  FiClock, 
  FiBookOpen, 
  FiUser, 
  FiInfo,
  FiMenu,
  FiX,
  FiCheckSquare,
  FiSquare
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { serverUrl } from '../App';

function ViewLecture() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { courseData } = useSelector((state) => state.course);
  const { userData } = useSelector((state) => state.user);

  const initialCourse = courseData?.find((c) => c._id === courseId);
  const [course, setCourse] = useState(initialCourse || null);
  const [loading, setLoading] = useState(true);

  // Selected item (video) and active module
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  // Accordion open/close map: { [moduleIndex]: boolean }
  const [openModules, setOpenModules] = useState({ 0: true });

  // Sidebar collapse toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Active live class
  const [activeLiveClass, setActiveLiveClass] = useState(null);

  // Active tab below video: "overview" | "notes" | "instructor"
  const [activeTab, setActiveTab] = useState("overview");

  // Track completed videos in localStorage
  const [completedItems, setCompletedItems] = useState(() => {
    try {
      const saved = localStorage.getItem(`completed_${userData?._id}_${courseId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch fresh course and lecture data
  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/course/getcourselecture/${courseId}`, { withCredentials: true });
      if (res.data) {
        setCourse(res.data);
      }
    } catch (err) {
      console.error("Error fetching course lectures:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const selectedCourse = course || initialCourse;
  const courseCreator = userData?._id === selectedCourse?.creator ? userData : null;

  // STRICT ACCESS CONTROL:
  // If course is PAID and user is NOT enrolled and NOT creator and NOT educator:
  // Redirect to course details with warning!
  useEffect(() => {
    if (selectedCourse && userData) {
      const isCreator = userData?._id === selectedCourse.creator || userData?.role === "educator";
      const isEnrolled = userData?.enrolledCourses?.some(
        (c) => (c._id || c).toString() === courseId.toString()
      ) || selectedCourse.isEnrolled === true;
      const isFree = !selectedCourse.price || Number(selectedCourse.price) <= 0 || selectedCourse.isFree === true;

      if (!isCreator && !isEnrolled && !isFree) {
        toast.warning("Please purchase this course first to access the classroom and video lectures.");
        navigate(`/viewcourse/${courseId}`, { replace: true });
      }
    }
  }, [selectedCourse, userData, courseId, navigate]);

  // Check for live classes
  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/live/course/${courseId}`, { withCredentials: true });
        const live = res.data?.find((c) => c.status === "live");
        setActiveLiveClass(live || null);
      } catch (e) {
        console.log("Could not check live status:", e);
      }
    };
    fetchLive();
  }, [courseId]);

  // Build hierarchical modules & topics from course data
  const buildModules = () => {
    if (!selectedCourse) return [];

    // 1. If course has subjects with chapters and videos
    if (selectedCourse.subjects && selectedCourse.subjects.length > 0) {
      const modules = [];
      selectedCourse.subjects.forEach((subj, sIdx) => {
        if (subj.chapters && subj.chapters.length > 0) {
          subj.chapters.forEach((chap, cIdx) => {
            const topicNum = cIdx + 1;
            const topicTitle = /^\d+[\.\s]/.test(chap.title) ? chap.title : `${topicNum}. ${chap.title}`;
            modules.push({
              id: chap._id || `chap_${sIdx}_${cIdx}`,
              title: topicTitle,
              subjectTitle: subj.title,
              items: (chap.videos || []).map((v, vIdx) => {
                const subIdx = `${topicNum}.${vIdx + 1}`;
                const cleanVTitle = v.title?.replace(new RegExp(`^${subIdx}\\s*`, "i"), "") || v.title || `Lesson ${vIdx + 1}`;
                return {
                  id: v._id || `vid_${sIdx}_${cIdx}_${vIdx}`,
                  title: cleanVTitle,
                  videoUrl: v.videoUrl,
                  pdfUrl: v.pdfUrl,
                  duration: v.duration,
                  isLocked: v.isLocked,
                  isPreviewFree: v.isPreviewFree,
                  format: "video",
                  subIndex: subIdx,
                };
              }),
            });
          });
        }
      });
      if (modules.length > 0) return modules;
    }

    // 2. If course has flat lectures (like the user screenshot: 1. LMS Overview, 2. How to Attend...)
    if (selectedCourse.lectures && selectedCourse.lectures.length > 0) {
      return selectedCourse.lectures.map((lec, idx) => ({
        id: lec._id || `lec_${idx}`,
        title: `${idx + 1}. ${lec.lectureTitle || `Topic ${idx + 1}`}`,
        items: [
          {
            id: lec._id || `lec_item_${idx}`,
            title: lec.lectureTitle || `Lecture ${idx + 1}`,
            videoUrl: lec.videoUrl,
            pdfUrl: lec.pdfUrl || "",
            duration: lec.duration || "",
            isLocked: lec.isLocked,
            isPreviewFree: lec.isPreviewFree,
            format: "video",
            subIndex: `${idx + 1}.1`,
          },
        ],
      }));
    }

    return [];
  };

  const modules = buildModules();

  // Set default selected item once modules are built
  useEffect(() => {
    if (modules.length > 0 && !selectedItem) {
      // Find first playable item
      for (let mIdx = 0; mIdx < modules.length; mIdx++) {
        const item = modules[mIdx].items?.find((it) => !it.isLocked) || modules[mIdx].items?.[0];
        if (item) {
          setSelectedItem(item);
          setActiveModuleIndex(mIdx);
          setOpenModules((prev) => ({ ...prev, [mIdx]: true }));
          break;
        }
      }
    }
  }, [modules, selectedItem]);

  // Flattened list of all video items for Previous / Next navigation
  const allItems = modules.flatMap((m) => m.items || []);
  const currentIndex = allItems.findIndex((it) => it.id === selectedItem?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < (allItems.length - 1);

  const handlePrev = () => {
    if (hasPrev) {
      selectItemAndOpenModule(allItems[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      selectItemAndOpenModule(allItems[currentIndex + 1]);
    }
  };

  const selectItemAndOpenModule = (item) => {
    setSelectedItem(item);
    // Find which module contains this item and ensure it's open
    const mIdx = modules.findIndex((m) => m.items.some((i) => i.id === item.id));
    if (mIdx !== -1) {
      setActiveModuleIndex(mIdx);
      setOpenModules((prev) => ({ ...prev, [mIdx]: true }));
    }
  };

  const toggleModuleAccordion = (idx) => {
    setOpenModules((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleComplete = (itemId) => {
    setCompletedItems((prev) => {
      let updated;
      if (prev.includes(itemId)) {
        updated = prev.filter((id) => id !== itemId);
      } else {
        updated = [...prev, itemId];
        toast.success("Marked as completed! 🎉");
      }
      try {
        localStorage.setItem(`completed_${userData?._id}_${courseId}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Completion percentage calculation
  const totalItemsCount = allItems.length;
  const completedCount = allItems.filter((it) => completedItems.includes(it.id)).length;
  const completionPercentage = totalItemsCount > 0 ? Math.round((completedCount / totalItemsCount) * 100) : 0;

  // Active module
  const currentModule = modules.find((m) => m.items.some((i) => i.id === selectedItem?.id)) || modules[0];

  // Helper for YouTube & iframe embeds
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
    return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("mediadelivery.net") || url.includes("vimeo.com");
  };

  const isCurrentItemLocked = Boolean(selectedItem?.isLocked && !selectedItem?.videoUrl);

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-gray-900 flex flex-col font-sans">
      
      {/* Top Navigation Bar (matching screenshot: 🏠 - Navigation - Student Course Details) */}
      <header className="h-14 px-4 sm:px-6 bg-white border-b border-gray-200 flex items-center justify-between z-30 shrink-0 sticky top-0 shadow-xs">
        <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600 truncate">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold cursor-pointer transition shrink-0"
            title="Go Home"
          >
            <FaHouse className="text-sm" />
          </button>
          <span className="text-gray-300">-</span>
          <button
            onClick={() => navigate(`/viewcourse/${courseId}`)}
            className="text-gray-500 hover:text-blue-600 transition cursor-pointer shrink-0 font-medium"
          >
            Navigation
          </button>
          <span className="text-gray-300">-</span>
          <span className="font-bold text-gray-800 truncate">
            Student Course Details
          </span>
        </div>

        <div className="flex items-center gap-3">
          {activeLiveClass && (
            <button
              onClick={() => navigate(`/live/${courseId}/${activeLiveClass._id}`)}
              className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-full shadow-sm animate-pulse cursor-pointer shrink-0"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-ping" />
              <span>LIVE NOW</span>
            </button>
          )}

          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer lg:hidden"
            title="Toggle Course Topics"
          >
            {isSidebarOpen ? <FiX className="text-lg" /> : <FiMenu className="text-lg" />}
          </button>
        </div>
      </header>

      {/* Main Classroom Layout: Left Sidebar + Right Video Area */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* ========================================================= */}
        {/* LEFT SIDEBAR: TOPIC ACCORDION & PROGRESS (SIDE MAI TOPIC) */}
        {/* ========================================================= */}
        <aside
          className={`${
            isSidebarOpen ? "w-full lg:w-[360px] xl:w-[400px]" : "w-0 hidden"
          } bg-white border-r border-gray-200 flex flex-col shrink-0 h-auto lg:h-[calc(100vh-56px)] transition-all duration-300 z-20 overflow-y-auto`}
        >
          {/* Sidebar Top: Course / Subject Title matching screenshot */}
          <div className="p-5 pb-3 border-b border-gray-100">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight leading-snug">
              {selectedCourse?.title} {selectedCourse?.category ? `- ${selectedCourse.category}` : ""}
            </h2>

            {/* Course Completion Progress Bar (Matching screenshot: Course Completion 4%) */}
            <div className="mt-4 p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200/70">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                <span>Course Completion</span>
                <span className="text-emerald-600 font-extrabold">{completionPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Module / Topic Accordion List (Matching screenshot) */}
          <div className="flex-1 p-3 sm:p-4 space-y-2.5">
            {modules.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                No modules or lectures uploaded yet.
              </div>
            ) : (
              modules.map((module, mIdx) => {
                const isOpen = Boolean(openModules[mIdx]);
                const hasActiveChild = module.items.some((i) => i.id === selectedItem?.id);

                return (
                  <div key={module.id || mIdx} className="rounded-xl overflow-hidden shadow-2xs">
                    
                    {/* Module Accordion Header Button (Dark Olive/Forest Green like in screenshot) */}
                    <button
                      onClick={() => toggleModuleAccordion(mIdx)}
                      className="w-full px-4 py-3 bg-[#3F5243] hover:bg-[#344438] text-white flex items-center justify-between gap-3 text-left transition cursor-pointer select-none rounded-xl"
                    >
                      <span className="text-xs sm:text-sm font-bold truncate leading-tight">
                        {module.title}
                      </span>
                      <span className="shrink-0 text-white/90 text-sm">
                        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                      </span>
                    </button>

                    {/* Sub-items List (Matching screenshot: 2.1 ✔ How to Attend Live Classes / Format: video) */}
                    {isOpen && (
                      <div className="p-2 pt-2.5 space-y-2 bg-[#F8F9FA] rounded-b-xl border-x border-b border-gray-200 animate-in fade-in duration-150">
                        {module.items.map((item) => {
                          const isCurrent = selectedItem?.id === item.id;
                          const isDone = completedItems.includes(item.id);
                          const isLocked = Boolean(item.isLocked && !item.videoUrl);

                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (isLocked) {
                                  toast.info("🔒 This topic is locked. Purchase the course to unlock.");
                                }
                                selectItemAndOpenModule(item);
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                                isCurrent
                                  ? "bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm"
                                  : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                              }`}
                            >
                              <div className="flex items-start gap-2 min-w-0">
                                {/* Completion Checkmark */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleComplete(item.id);
                                  }}
                                  className="mt-0.5 text-emerald-600 hover:text-emerald-700 cursor-pointer shrink-0"
                                  title={isDone ? "Mark as uncompleted" : "Mark as completed"}
                                >
                                  {isDone ? (
                                    <FiCheckSquare className="text-base text-emerald-600" />
                                  ) : (
                                    <FiSquare className="text-base text-gray-400 hover:text-gray-600" />
                                  )}
                                </button>

                                <div className="min-w-0">
                                  <h4 className={`text-xs sm:text-sm leading-snug font-bold truncate ${
                                    isCurrent ? "text-blue-600" : "text-gray-800"
                                  }`}>
                                    <span className="mr-1">{item.subIndex}</span>
                                    <span>{item.title}</span>
                                  </h4>
                                  <p className="text-[11px] text-gray-500 mt-0.5">
                                    Format: {item.format || "video"} {item.duration ? `• ${item.duration}` : ""}
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0 pt-0.5">
                                {isLocked ? (
                                  <FaLock className="text-xs text-gray-400" />
                                ) : isCurrent ? (
                                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping inline-block" />
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ========================================================= */}
        {/* COLLAPSE / EXPAND TOGGLE BUTTON ON DIVIDER (Matching <) */}
        {/* ========================================================= */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden lg:flex items-center justify-center w-6 h-12 bg-gray-700 hover:bg-gray-800 text-white rounded-r-md cursor-pointer absolute top-1/3 left-0 z-30 shadow-md transition-transform"
          style={{
            left: isSidebarOpen ? "360px" : "0px",
            transition: "left 300ms ease",
          }}
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? <FaChevronLeft className="text-xs" /> : <FaChevronRight className="text-xs" />}
        </button>

        {/* ========================================================= */}
        {/* RIGHT MAIN AREA: VIDEO PLAYER & CONTENT (RIGHT MAI VIDEO) */}
        {/* ========================================================= */}
        <main className="flex-1 flex flex-col h-auto lg:h-[calc(100vh-56px)] overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* Active Lecture Title (Matching screenshot top: 2. How to Attend... - 2.1 ...) */}
          <div className="mb-4">
            <h1 className="text-lg sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-snug">
              {currentModule?.title} - {selectedItem?.subIndex} {selectedItem?.title}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Topic Lecture • {selectedCourse?.category || "Course"} • {selectedCourse?.title}
            </p>
          </div>

          {/* Large Video Player Frame (Right Mai Video Chale) */}
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-200 relative flex items-center justify-center">
            {isCurrentItemLocked ? (
              <div className="text-center p-8 max-w-md animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
                  <FaLock />
                </div>
                <h3 className="text-xl font-extrabold text-white mb-2">This Topic Video is Locked</h3>
                <p className="text-gray-300 text-xs sm:text-sm mb-6 leading-relaxed">
                  You need to purchase this course to unlock all video lessons, PDF materials, and live doubt sessions.
                </p>
                <button
                  onClick={() => navigate(`/viewcourse/${courseId}`)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Buy Course Now
                </button>
              </div>
            ) : selectedItem?.videoUrl ? (
              isIframeVideo(selectedItem.videoUrl) ? (
                <iframe
                  src={getEmbedUrl(selectedItem.videoUrl)}
                  title={selectedItem.title}
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
                  allowFullScreen
                />
              ) : (
                <video
                  key={selectedItem.id || selectedItem.videoUrl}
                  src={selectedItem.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  crossOrigin="anonymous"
                />
              )
            ) : (
              <div className="text-center p-8 text-gray-400">
                <FiVideo className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                <p className="text-sm">Select any topic from the left sidebar to start playing the video</p>
              </div>
            )}
          </div>

          {/* Video Control Bar: Prev / Mark Completed / Next */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-gray-200">
            {/* Mark as completed button */}
            {selectedItem && (
              <button
                onClick={() => toggleComplete(selectedItem.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs ${
                  completedItems.includes(selectedItem.id)
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaCheck className={completedItems.includes(selectedItem.id) ? "text-emerald-600" : "text-gray-400"} />
                <span>{completedItems.includes(selectedItem.id) ? "Completed" : "Mark as Complete"}</span>
              </button>
            )}

            {/* Prev / Next controls */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                disabled={!hasPrev}
                onClick={handlePrev}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition ${
                  hasPrev
                    ? "bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 cursor-pointer shadow-2xs"
                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                }`}
              >
                <FaChevronLeft className="text-[10px]" />
                <span>Previous</span>
              </button>
              <button
                disabled={!hasNext}
                onClick={handleNext}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition ${
                  hasNext
                    ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm shadow-blue-600/20"
                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                }`}
              >
                <span>Next Topic</span>
                <FaChevronRight className="text-[10px]" />
              </button>
            </div>
          </div>

          {/* Classroom Tabs below Video */}
          <div className="mt-6">
            <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
              <button
                onClick={() => setActiveTab("overview")}
                className={`text-sm font-bold pb-1.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "overview"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <FiInfo /> Overview
              </button>
              {selectedItem?.pdfUrl && (
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`text-sm font-bold pb-1.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "notes"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <FiFileText /> Class Notes (PDF)
                </button>
              )}
              <button
                onClick={() => setActiveTab("instructor")}
                className={`text-sm font-bold pb-1.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "instructor"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <FiUser /> Instructor
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
              <div className="py-5 space-y-4 text-sm text-gray-700 leading-relaxed">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                  <h3 className="font-bold text-gray-900 text-base mb-1">About this Topic</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {selectedCourse?.description || "Watch this lesson carefully. Take notes of the key concepts and test your knowledge with the practice assignments."}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Class Notes (PDF) */}
            {activeTab === "notes" && selectedItem?.pdfUrl && (
              <div className="py-5">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                      <FiFileText />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Downloadable Class Notes</h4>
                      <p className="text-xs text-gray-500">PDF Document for {selectedItem.title}</p>
                    </div>
                  </div>
                  <a
                    href={selectedItem.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition"
                  >
                    <FiDownload />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            )}

            {/* Tab 3: Instructor */}
            {activeTab === "instructor" && (
              <div className="py-5">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-4 max-w-md">
                  {courseCreator?.photoUrl ? (
                    <img src={courseCreator.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-base">
                      {courseCreator?.name?.slice(0, 1) || "I"}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{courseCreator?.name || "Faculty Member"}</h4>
                    <p className="text-xs text-gray-500">{courseCreator?.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </main>

      </div>

    </div>
  );
}

export default ViewLecture;
