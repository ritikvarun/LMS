import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { 
  FiChevronLeft, 
  FiArrowUpRight, 
  FiVideo, 
  FiFileText, 
  FiSend, 
  FiPlay, 
  FiX, 
  FiBookOpen,
  FiClock,
  FiDownload
} from 'react-icons/fi';
import { FaTelegramPlane } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import emptyImg from '../assets/empty.jpg';

function FreeCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tab state: "recorded" | "live" | "telegram"
  const [activeTab, setActiveTab] = useState("recorded");

  // Navigation hierarchy state:
  // null = Course level (Screen 2 / Image 2)
  // object = Inside Subject (Screen 3 / Image 1)
  const [selectedSubject, setSelectedSubject] = useState(null);

  // null = Subject level
  // object = Inside Chapter (Screen 4 / Image 3)
  const [selectedChapter, setSelectedChapter] = useState(null);

  // Live classes for this course
  const [liveClasses, setLiveClasses] = useState([]);

  // Video Player Modal State
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  // PDF Preview Modal State
  const [activePdfModal, setActivePdfModal] = useState(null);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/course/free-course/${courseId}`, { withCredentials: true });
      setCourse(res.data);
    } catch (err) {
      console.error("Error fetching free course:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveClasses = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/live/course/${courseId}`, { withCredentials: true });
      setLiveClasses(res.data || []);
    } catch (err) {
      console.log("No live classes:", err);
    }
  };

  useEffect(() => {
    fetchCourse();
    fetchLiveClasses();
  }, [courseId]);

  // Back Button navigation handler
  const handleBack = () => {
    if (selectedChapter) {
      // Step back from Chapter (Image 3) to Subject (Image 1)
      setSelectedChapter(null);
    } else if (selectedSubject) {
      // Step back from Subject (Image 1) to Course (Image 2)
      setSelectedSubject(null);
    } else {
      // Step back from Course to Catalog (Image 4)
      navigate("/freecourses");
    }
  };

  // Helper to convert YouTube standard links to embed links
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex flex-col justify-center items-center gap-3">
        <ClipLoader color="#4F46E5" size={40} />
        <p className="text-sm font-medium text-gray-500">Loading course curriculum...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex flex-col justify-center items-center p-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Course Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">The requested free course could not be located.</p>
        <button
          onClick={() => navigate("/freecourses")}
          className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm"
        >
          Back to Free Courses
        </button>
      </div>
    );
  }

  const subjects = course.subjects || [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 pb-24">
      <Nav />

      <main className="pt-[84px] max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* ========================================================= */}
        {/* DYNAMIC BREADCRUMB BAR (Changes according to Image 2, 1, 3) */}
        {/* ========================================================= */}
        <div className="py-4 mb-3 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-100 hover:border-gray-300 transition shadow-xs cursor-pointer text-gray-700 shrink-0"
            title="Go back"
          >
            <FiChevronLeft className="text-lg" />
          </button>

          {/* Breadcrumb Path */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500 overflow-x-auto whitespace-nowrap py-1">
            {!selectedSubject && !selectedChapter && (
              /* Screen 2 Breadcrumb: Home / Free courses / Course Title */
              <>
                <span onClick={() => navigate("/")} className="hover:text-indigo-600 transition cursor-pointer">
                  Home
                </span>
                <span>/</span>
                <span onClick={() => navigate("/freecourses")} className="hover:text-indigo-600 transition cursor-pointer">
                  Free courses
                </span>
                <span>/</span>
                <span className="font-bold text-gray-900 truncate">
                  {course.title}
                </span>
              </>
            )}

            {selectedSubject && !selectedChapter && (
              /* Screen 3 Breadcrumb: Course Title / Subject Title */
              <>
                <span onClick={() => setSelectedSubject(null)} className="hover:text-indigo-600 transition cursor-pointer">
                  {course.title}
                </span>
                <span>/</span>
                <span className="font-bold text-gray-900 truncate">
                  {selectedSubject.title}
                </span>
              </>
            )}

            {selectedSubject && selectedChapter && (
              /* Screen 4 Breadcrumb: Course Title / Subject Title / Chapter Title */
              <>
                <span onClick={() => setSelectedSubject(null)} className="hover:text-indigo-600 transition cursor-pointer">
                  {course.title}
                </span>
                <span>/</span>
                <span onClick={() => setSelectedChapter(null)} className="hover:text-indigo-600 transition cursor-pointer">
                  {selectedSubject.title}
                </span>
                <span>/</span>
                <span className="font-bold text-gray-900 truncate">
                  {selectedChapter.title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEP 1: COURSE LEVEL - SUBJECTS & TABS (Image 2) */}
        {/* ========================================================= */}
        {!selectedSubject && !selectedChapter && (
          <div className="space-y-6">
            
            {/* Course Header Banner Card matching Image 2 */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row items-center sm:items-center gap-5 sm:gap-6">
              {/* Left Thumbnail Poster / Placeholder */}
              <div className="w-48 h-28 sm:w-56 sm:h-32 rounded-2xl bg-pink-50/80 border border-pink-100 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = emptyImg;
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-pink-300">
                    <FiBookOpen className="text-3xl" />
                  </div>
                )}
              </div>

              {/* Right Course Title */}
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-block bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md mb-2">
                  Free Batch
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                  {course.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {course.subTitle || course.category} • {course.totalVideos || 0} Total Videos
                </p>
              </div>
            </div>

            {/* Navigation Tabs Bar matching Image 2 */}
            <div className="bg-white rounded-2xl border border-gray-200/90 px-4 sm:px-6 shadow-xs flex items-center gap-6 sm:gap-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab("recorded")}
                className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "recorded"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                Recorded
              </button>

              <button
                onClick={() => setActiveTab("live")}
                className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "live"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <span>Live & Upcoming</span>
                {liveClasses.some(c => c.status === "live") && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("telegram")}
                className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "telegram"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <FaTelegramPlane className="text-sky-500 text-sm" />
                <span>Telegram</span>
              </button>
            </div>

            {/* Tab 1: RECORDED CONTENT (List of Subjects matching Image 2) */}
            {activeTab === "recorded" && (
              <div className="space-y-3">
                {subjects.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200/80 p-10 text-center text-gray-500">
                    <FiBookOpen className="mx-auto text-3xl text-gray-400 mb-2" />
                    <p className="font-semibold text-gray-800">No Subjects Added Yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      The educator will be uploading subjects and lectures shortly.
                    </p>
                  </div>
                ) : (
                  subjects.map((subject) => (
                    <div
                      key={subject._id}
                      onClick={() => setSelectedSubject(subject)}
                      className="bg-white rounded-2xl border border-gray-200/80 p-3 sm:p-4 flex items-center gap-4 hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
                    >
                      {/* Subject Thumbnail / Badge Image */}
                      <div className="w-20 h-13 sm:w-24 sm:h-15 rounded-xl border border-gray-200 bg-amber-50 shrink-0 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                        {subject.thumbnail ? (
                          <img
                            src={subject.thumbnail}
                            alt={subject.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = emptyImg;
                            }}
                          />
                        ) : (
                          <div className="text-amber-800 font-extrabold text-[10px] text-center px-1">
                            {subject.title.toUpperCase().slice(0, 10)}
                          </div>
                        )}
                      </div>

                      {/* Subject Info */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-blue-600 transition truncate">
                          {subject.title}
                        </h2>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          Subject
                        </p>
                      </div>

                      <div className="text-gray-400 group-hover:text-blue-600 transition pr-2 text-sm">
                        <FiArrowUpRight />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: LIVE & UPCOMING CLASSES */}
            {activeTab === "live" && (
              <div className="space-y-3">
                {liveClasses.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200/80 p-10 text-center text-gray-500">
                    <FiVideo className="mx-auto text-3xl text-gray-400 mb-2" />
                    <p className="font-semibold text-gray-800">No Live Classes Scheduled</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Check back later for scheduled live sessions with the faculty.
                    </p>
                  </div>
                ) : (
                  liveClasses.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white rounded-2xl border border-gray-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${
                          item.status === "live" ? "bg-red-50 text-red-600 animate-pulse" : "bg-gray-100 text-gray-600"
                        }`}>
                          <FiVideo />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900">
                              {item.title}
                            </h3>
                            {item.status === "live" && (
                              <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                                LIVE NOW
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <FiClock className="text-xs" />
                            <span>{new Date(item.scheduledStartTime).toLocaleString()}</span>
                          </p>
                        </div>
                      </div>

                      {item.status === "live" ? (
                        <button
                          onClick={() => navigate(`/live/${courseId}/${item._id}`)}
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                        >
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          <span>Join Live Classroom</span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                          Upcoming Session
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: TELEGRAM COMMUNITY */}
            {activeTab === "telegram" && (
              <div className="bg-white rounded-2xl border border-gray-200/90 p-8 text-center max-w-xl mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-4 text-3xl shadow-xs">
                  <FaTelegramPlane />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Join Batch Telegram Channel
                </h2>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Join our official discussion and doubt solving community. Get class PDF notes, daily practice sheets, class notifications, and exam strategies directly on Telegram.
                </p>

                <div className="mt-6">
                  {course.telegramLink ? (
                    <a
                      href={course.telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#229ED9] hover:bg-[#1E88E5] text-white font-bold rounded-xl text-sm shadow-md shadow-sky-500/20 transition cursor-pointer"
                    >
                      <FaTelegramPlane className="text-base" />
                      <span>Join Telegram Channel ↗</span>
                    </a>
                  ) : (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 inline-block">
                      Telegram group link will be shared by the instructor soon!
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: SUBJECT LEVEL - CHAPTERS LIST (Image 1) */}
        {/* ========================================================= */}
        {selectedSubject && !selectedChapter && (
          <div className="space-y-3">
            {(selectedSubject.chapters || []).length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-10 text-center text-gray-500">
                <FiBookOpen className="mx-auto text-3xl text-gray-400 mb-2" />
                <p className="font-semibold text-gray-800">No Chapters in {selectedSubject.title}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Chapters and video lessons are being uploaded for this subject.
                </p>
              </div>
            ) : (
              selectedSubject.chapters.map((chapter) => (
                <div
                  key={chapter._id}
                  onClick={() => setSelectedChapter(chapter)}
                  className="bg-white rounded-2xl border border-gray-200/80 p-3 sm:p-4 flex items-center gap-4 hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
                >
                  {/* Chapter Thumbnail / Icon */}
                  <div className="w-20 h-13 sm:w-24 sm:h-15 rounded-xl border border-gray-200 bg-blue-50 shrink-0 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                    {chapter.thumbnail || selectedSubject.thumbnail ? (
                      <img
                        src={chapter.thumbnail || selectedSubject.thumbnail}
                        alt={chapter.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = emptyImg;
                        }}
                      />
                    ) : (
                      <div className="text-blue-600 font-extrabold text-[10px] text-center px-1">
                        {chapter.title.slice(0, 10)}
                      </div>
                    )}
                  </div>

                  {/* Chapter Title & Subtitle matching Image 1 */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-blue-600 transition truncate">
                      {chapter.title}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      Chapter
                    </p>
                  </div>

                  <div className="text-gray-400 group-hover:text-blue-600 transition pr-2 text-sm">
                    <FiArrowUpRight />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: CHAPTER LEVEL - VIDEOS & PDFS (Image 3) */}
        {/* ========================================================= */}
        {selectedSubject && selectedChapter && (
          <div className="space-y-3">
            {(selectedChapter.videos || []).length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-10 text-center text-gray-500">
                <FiVideo className="mx-auto text-3xl text-gray-400 mb-2" />
                <p className="font-semibold text-gray-800">No Videos in {selectedChapter.title}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Video lessons and PDF notes will appear here once uploaded.
                </p>
              </div>
            ) : (
              selectedChapter.videos.map((video) => (
                <div
                  key={video._id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 transition"
                >
                  {/* Left: Video Thumbnail + Center Title matching Image 3 */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div 
                      onClick={() => setActiveVideoModal(video)}
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
                          <FiPlay className="text-xl" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition">
                        <div className="w-6 h-6 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-xs">
                          <FiPlay className="text-[10px] ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h3 
                        onClick={() => setActiveVideoModal(video)}
                        className="text-sm sm:text-base font-bold text-gray-900 hover:text-blue-600 transition truncate cursor-pointer"
                      >
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Video {video.duration ? `• ${video.duration}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Right: Watch and View PDF Action Buttons matching Image 3 */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    {/* Watch Button (Solid Blue) */}
                    <button
                      onClick={() => setActiveVideoModal(video)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <span>Watch</span>
                      <FiArrowUpRight className="text-sm" />
                    </button>

                    {/* View PDF Button (Outline Blue) */}
                    {video.pdfUrl && (
                      <button
                        onClick={() => setActivePdfModal(video)}
                        className="px-4 py-2 bg-white border border-blue-500 hover:bg-blue-50 text-blue-600 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <span>View PDF</span>
                        <FiArrowUpRight className="text-sm" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* VIDEO PLAYER MODAL DIALOG */}
      {/* ========================================================= */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="font-bold text-sm sm:text-base text-gray-100 line-clamp-1">
                  {activeVideoModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Video Player Container */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {activeVideoModal.videoUrl ? (
                isIframeVideo(activeVideoModal.videoUrl) ? (
                  <iframe
                    src={getEmbedUrl(activeVideoModal.videoUrl)}
                    title={activeVideoModal.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    autoPlay
                    src={activeVideoModal.videoUrl}
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <div className="text-center p-6 text-gray-400">
                  <FiVideo className="text-4xl mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Video stream is being processed or URL is not available.</p>
                </div>
              )}
            </div>

            {/* Modal Footer with PDF quick link */}
            <div className="px-5 py-3 bg-gray-900 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {course.title} • {selectedSubject?.title}
              </span>
              {activeVideoModal.pdfUrl && (
                <button
                  onClick={() => {
                    const v = activeVideoModal;
                    setActiveVideoModal(null);
                    setActivePdfModal(v);
                  }}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <FiFileText />
                  <span>Open Attached PDF Notes ↗</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PDF VIEWER / DOWNLOAD MODAL DIALOG */}
      {/* ========================================================= */}
      {activePdfModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            {/* PDF Header */}
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiFileText className="text-blue-600 text-lg" />
                <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-1">
                  PDF Notes: {activePdfModal.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activePdfModal.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <FiDownload />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setActivePdfModal(null)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition cursor-pointer"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>

            {/* PDF Frame */}
            <div className="flex-1 w-full bg-gray-100">
              <iframe
                src={activePdfModal.pdfUrl}
                title="Lecture PDF Document"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default FreeCourseDetail;
