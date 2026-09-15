import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlay, FaFileLines } from "react-icons/fa6";
import { FiBookOpen, FiVideo, FiArrowRight, FiClock, FiCalendar, FiUser, FiAward, FiGift } from "react-icons/fi";
import Nav from '../components/Nav';
import emptyImg from "../assets/empty.jpg";
import axios from 'axios';
import { serverUrl } from '../App';

function EnrolledCourse() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [liveNowList, setLiveNowList] = useState([]);
  const [upcomingList, setUpcomingList] = useState([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'paid' | 'free'

  const enrolledCourses = useMemo(() => {
    return (userData?.enrolledCourses || []).filter(Boolean);
  }, [userData?.enrolledCourses]);

  // Separate Paid vs Free enrolled courses
  const { paidEnrolled, freeEnrolled } = useMemo(() => {
    const list = enrolledCourses;
    const paid = list.filter(
      (c) => c && Number(c.price) > 0 && c.isFree !== true && c.isFree !== "true"
    );
    const free = list.filter(
      (c) => c && (!c.price || Number(c.price) <= 0 || c.isFree === true || c.isFree === "true")
    );
    return { paidEnrolled: paid, freeEnrolled: free };
  }, [enrolledCourses]);

  // Fetch Live Classes across all enrolled courses
  const fetchStudentLiveClasses = async () => {
    if (!userData) return;
    try {
      setLoadingLive(true);
      const res = await axios.get(`${serverUrl}/api/live/student/my-live-classes`, { withCredentials: true });
      if (res.data) {
        setLiveNowList(res.data.liveNow || []);
        setUpcomingList(res.data.upcoming || []);
      }
    } catch (err) {
      console.log("Could not fetch student live classes:", err);
    } finally {
      setLoadingLive(false);
    }
  };

  useEffect(() => {
    fetchStudentLiveClasses();
    const interval = setInterval(fetchStudentLiveClasses, 25000);
    return () => clearInterval(interval);
  }, [userData]);

  const formatScheduleTime = (dateString) => {
    if (!dateString) return { label: "Scheduled Soon", relative: "Upcoming" };
    const date = new Date(dateString);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const diffMs = date - now;
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    let relative = "";
    if (diffMs > 0 && diffMins <= 60) {
      relative = `Starts in ${diffMins} min${diffMins === 1 ? '' : 's'}`;
    } else if (diffMs > 0 && diffHours <= 24) {
      relative = `Starts in ${diffHours} hr${diffHours === 1 ? '' : 's'}`;
    } else if (diffMs <= 0 && diffMins > -120) {
      relative = "Starting shortly";
    } else {
      relative = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    const label = isToday ? `Today at ${timeStr}` : `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
    return { label, relative };
  };

  const renderCourseCard = (course) => {
    const isCourseLiveNow = liveNowList.some(
      (l) => l.courseId?._id === course._id || l.courseId === course._id
    );
    const upcomingSession = upcomingList.find(
      (u) => u.courseId?._id === course._id || u.courseId === course._id
    );
    const isFreeCourse = !course.price || Number(course.price) <= 0 || course.isFree === true || course.isFree === "true";

    return (
      <div
        key={course._id}
        className={`bg-white rounded-2xl overflow-hidden border shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group ${
          isCourseLiveNow ? "border-red-500 ring-2 ring-red-400/30" : "border-gray-200"
        }`}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
          <img
            src={course.thumbnail || emptyImg}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Top Tags */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold uppercase rounded-md">
              {course.category || "Technology"}
            </span>

            {isCourseLiveNow ? (
              <span className="px-2.5 py-1 bg-red-600 text-white text-[11px] font-extrabold uppercase rounded-md flex items-center gap-1.5 shadow-md animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full" />
                Live Now
              </span>
            ) : isFreeCourse ? (
              <span className="px-2 py-0.5 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase rounded-md shadow-2xs">
                FREE BATCH
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-amber-500/95 backdrop-blur-md text-slate-950 text-[10px] font-extrabold uppercase rounded-md shadow-2xs">
                PRO BATCH
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-base text-gray-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
              {course.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
              <span className="capitalize">{course.level || "All Levels"}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FiVideo className="text-indigo-500" /> Video Track
              </span>
            </div>
          </div>

          {/* Live notification chip if scheduled */}
          {upcomingSession && !isCourseLiveNow && (
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                <FiClock className="text-indigo-500" /> Live Scheduled:
              </span>
              <span className="font-bold">
                {formatScheduleTime(upcomingSession.scheduledAt).label}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
            {isCourseLiveNow ? (
              <button
                onClick={() => {
                  const live = liveNowList.find(
                    (l) => l.courseId?._id === course._id || l.courseId === course._id
                  );
                  if (live) navigate(`/live/${course._id}/${live._id}`);
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-500/20"
              >
                <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                <span>Join Live Class</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={() => navigate(`/viewlecture/${course._id}`)}
                  className="flex-1 py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <FaPlay className="text-[10px]" />
                  <span>Lectures</span>
                </button>
                <button
                  onClick={() => navigate(`/viewcourse/${course._id}`)}
                  className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-purple-100"
                  title="Mock Tests & Course Details"
                >
                  <FaFileLines className="text-xs" />
                  <span>Tests</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <Nav />

      {/* Main Container */}
      <main className="pt-[100px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition mb-2 cursor-pointer"
            >
              <FaArrowLeft className="text-xs" /> Back to Home
            </button>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Student Learning Hub
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Access your enrolled courses, view upcoming schedules, and join real-time live classes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-300">
              Paid: {paidEnrolled.length}
            </span>
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300">
              Free: {freeEnrolled.length}
            </span>
          </div>
        </div>

        {/* 1. REAL-TIME LIVE SESSIONS ALERT BANNER */}
        {liveNowList.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 bg-white rounded-full animate-ping shrink-0" />
                <div>
                  <span className="text-[10px] font-extrabold tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded">
                    BROADCASTING LIVE
                  </span>
                  <h3 className="text-base sm:text-lg font-bold mt-1">
                    {liveNowList[0].title}
                  </h3>
                  <p className="text-xs text-red-100 mt-0.5">
                    Course: {liveNowList[0].courseId?.title || "Enrolled Course"} • Taught by {liveNowList[0].creator?.name || "Instructor"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/live/${liveNowList[0].courseId?._id || liveNowList[0].courseId}/${liveNowList[0]._id}`)}
                className="w-full md:w-auto px-6 py-3 bg-white text-red-600 hover:bg-gray-100 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <FiVideo />
                <span>Enter Live Classroom</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. UPCOMING LIVE SESSIONS HORIZONTAL CAROUSEL */}
        {upcomingList.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Upcoming Live Classes Schedule
                </h2>
              </div>
              <span className="text-xs font-semibold text-gray-400">
                {upcomingList.length} Scheduled
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingList.map((session) => {
                const schedule = formatScheduleTime(session.scheduledAt);
                return (
                  <div
                    key={session._id}
                    className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between hover:border-indigo-300 transition-all space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full uppercase">
                          {session.courseId?.category || "Live"}
                        </span>
                        <span className="text-xs font-bold text-indigo-600">
                          {schedule.relative}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-gray-900">
                        {session.title}
                      </h3>
                      {session.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {session.description}
                        </p>
                      )}

                      <div className="mt-4 pt-3 border-t border-indigo-100/60 flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          {session.creator?.photoUrl ? (
                            <img src={session.creator.photoUrl} className="w-6 h-6 rounded-full object-cover" alt="" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                              {session.creator?.name?.slice(0, 1) || "I"}
                            </div>
                          )}
                          <span className="font-medium text-gray-800">{session.creator?.name || "Instructor"}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                          <FiCalendar />
                          <span>{schedule.label}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-indigo-100/60">
                      <button
                        onClick={() => navigate(`/live/${session.courseId?._id || session.courseId}/${session._id}`)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <FiVideo />
                        <span>Enter Class Room (Waiting Lobby)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. MY ENROLLED COURSES (DIVIDED INTO PAID AND FREE SECTIONS) */}
        <div className="space-y-6">
          {/* Header & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiBookOpen className="text-indigo-600" />
              <span>My Enrolled Courses</span>
            </h2>

            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFilterTab("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterTab === "all"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                All Batches ({enrolledCourses.length})
              </button>

              <button
                onClick={() => setFilterTab("paid")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === "paid"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <FiAward className="text-xs" />
                <span>Paid Batches ({paidEnrolled.length})</span>
              </button>

              <button
                onClick={() => setFilterTab("free")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === "free"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <FiGift className="text-xs" />
                <span>Free Batches ({freeEnrolled.length})</span>
              </button>
            </div>
          </div>

          {/* No enrollments at all */}
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/80 shadow-xs max-w-xl mx-auto p-8">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiBookOpen className="text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">You haven't enrolled in any courses yet</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Browse our catalog of in-demand tech courses, enroll, and attend live classes!
              </p>
              <button
                onClick={() => navigate("/allcourses")}
                className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition flex items-center gap-2 mx-auto cursor-pointer"
              >
                <span>Explore Course Catalog</span>
                <FiArrowRight />
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              
              {/* SECTION 1: PAID ENROLLED COURSES */}
              {(filterTab === "all" || filterTab === "paid") && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200/80">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                      Paid & Pro Batches (पेड कोर्सेज)
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {paidEnrolled.length}
                    </span>
                  </div>

                  {paidEnrolled.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {paidEnrolled.map((c) => renderCourseCard(c))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-4 italic">
                      You haven't purchased any paid courses yet.
                    </p>
                  )}
                </div>
              )}

              {/* SECTION 2: FREE ENROLLED COURSES */}
              {(filterTab === "all" || filterTab === "free") && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200/80">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                      Free Foundation Batches (फ्री कोर्सेज)
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {freeEnrolled.length}
                    </span>
                  </div>

                  {freeEnrolled.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {freeEnrolled.map((c) => renderCourseCard(c))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-4 italic">
                      You haven't enrolled in any free courses yet.
                    </p>
                  )}
                </div>
              )}

            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default EnrolledCourse;
