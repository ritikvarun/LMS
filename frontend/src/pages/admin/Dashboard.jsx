import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import { setCreatorCourseData } from '../../redux/courseSlice';
import AdminLayout from './AdminLayout';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";
import { 
  FiBookOpen, 
  FiUsers, 
  FiGift, 
  FiVideo, 
  FiArrowRight, 
  FiPlus, 
  FiCheckCircle, 
  FiAward,
  FiCreditCard
} from "react-icons/fi";
import { FaGraduationCap, FaIndianRupeeSign } from "react-icons/fa6";
import emptyImg from "../../assets/empty.jpg";

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-gray-800">
        <p className="font-bold text-gray-200">{label}</p>
        <p className="text-indigo-400">
          {payload[0].name}: <span className="font-semibold text-white">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { creatorCourseData } = useSelector((state) => state.course);

  const [hubTab, setHubTab] = useState("paid"); // 'paid' or 'free'

  // Always fetch fresh creator courses on mount to ensure real-time accuracy
  useEffect(() => {
    const fetchCreatorCourses = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/course/getcreatorcourses`, { withCredentials: true });
        if (Array.isArray(res.data)) {
          dispatch(setCreatorCourseData(res.data));
        }
      } catch (err) {
        console.log("Error loading dashboard courses:", err);
      }
    };
    fetchCreatorCourses();
  }, [dispatch]);

  // Key LMS Metrics based strictly on creator's actual courses
  const allCourses = Array.isArray(creatorCourseData) ? creatorCourseData : [];
  const totalCourses = allCourses.length;
  const paidCoursesList = allCourses.filter(
    (c) => Number(c.price) > 0 && c.isFree !== true && c.isFree !== "true"
  );
  const totalPaidCourses = paidCoursesList.length;
  const freeCoursesList = allCourses.filter(
    (c) => c.isFree === true || c.isFree === "true" || !c.price || Number(c.price) <= 0
  );
  const totalFreeCourses = freeCoursesList.length;
  const totalStudents = allCourses.reduce((sum, course) => sum + (course.enrolledStudents?.length || 0), 0);
  const totalEarnings = allCourses.reduce((sum, course) => {
    const studentCount = course.enrolledStudents?.length || 0;
    const courseRevenue = course.price ? course.price * studentCount : 0;
    return sum + courseRevenue;
  }, 0);

  // Chart Data
  const chartData = creatorCourseData?.map(course => ({
    name: course.title.length > 12 ? course.title.slice(0, 12) + "..." : course.title,
    lectures: course.lectures?.length || 0,
    students: course.enrolledStudents?.length || 0,
  })) || [];

  // Extract real enrolled students from creatorCourseData
  const realEnrollments = [];
  (creatorCourseData || []).forEach(course => {
    (course.enrolledStudents || []).forEach(student => {
      const sObj = typeof student === 'object' ? student : null;
      if (sObj) {
        realEnrollments.push({
          id: sObj._id + "_" + course._id,
          initial: sObj.name ? sObj.name.charAt(0).toUpperCase() : "S",
          name: sObj.name || "Enrolled Student",
          email: sObj.email || "student@lms.com",
          courseName: course.title,
          price: course.price || 0,
          isFree: !course.price || course.price <= 0 || course.isFree,
          enrolledAt: sObj.createdAt ? new Date(sObj.createdAt).toLocaleDateString() : "Recent"
        });
      }
    });
  });

  const displayEnrollments = realEnrollments.slice(0, 6);

  return (
    <AdminLayout activeTab="dashboard">
      <div className="space-y-7">
        
        {/* Top Header Text */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Instructor Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Overview of academy courses, free batches, and student enrollments
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => navigate("/admin/paid-courses")}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs sm:text-sm font-bold rounded-2xl border border-indigo-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FiCreditCard className="text-indigo-600" />
              <span>Paid Batches ({totalPaidCourses})</span>
            </button>

            <button
              onClick={() => navigate("/admin/free-courses")}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold rounded-2xl border border-emerald-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FiGift className="text-emerald-600" />
              <span>Free Batches ({totalFreeCourses})</span>
            </button>

            <button
              onClick={() => navigate("/createcourses")}
              className="px-4 py-2.5 bg-black hover:bg-gray-800 text-white text-xs sm:text-sm font-bold rounded-2xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <FiPlus />
              <span>Add Course</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STAT SUMMARY CARDS (100% LMS Terminology) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          
          {/* 1. Total Courses / Batches */}
          <div 
            onClick={() => navigate("/courses")}
            className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 flex items-center gap-4 shadow-xs hover:border-gray-400 transition cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
              <FiBookOpen className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">Total Courses</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">
                {totalCourses}
              </h2>
            </div>
          </div>

          {/* 2. Paid Courses / Premium Batches */}
          <div 
            onClick={() => navigate("/admin/paid-courses")}
            className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 flex items-center gap-4 shadow-xs hover:border-indigo-300 transition cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
              <FiCreditCard className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">Paid Courses</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-700 mt-0.5">
                {totalPaidCourses}
              </h2>
            </div>
          </div>

          {/* 3. Free Batches */}
          <div 
            onClick={() => navigate("/admin/free-courses")}
            className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 flex items-center gap-4 shadow-xs hover:border-emerald-300 transition cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
              <FiGift className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">Free Courses</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-0.5">
                {totalFreeCourses}
              </h2>
            </div>
          </div>

          {/* 4. Enrolled Students (Active Learners) */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
              <FaGraduationCap className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">Enrolled Students</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">
                {totalStudents}
              </h2>
            </div>
          </div>

          {/* 5. Course Revenue */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
              <FaIndianRupeeSign className="text-lg" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">Total Revenue</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">
                ₹{totalEarnings.toLocaleString()}
              </h2>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RECENT STUDENT ENROLLMENTS (100% LMS Table) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          
          {/* Header Row */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Recent Student Enrollments
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Students who enrolled in your free or paid batches recently
              </p>
            </div>

            <button
              onClick={() => navigate("/courses")}
              className="text-xs font-bold text-gray-900 hover:text-indigo-600 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>View All Courses</span>
              <FiArrowRight />
            </button>
          </div>

          {/* Student Enrollments Rows */}
          <div className="divide-y divide-gray-100">
            {displayEnrollments.length > 0 ? (
              displayEnrollments.map((student) => (
                <div 
                  key={student.id} 
                  className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 p-2 rounded-2xl transition"
                >
                  {/* Left: Avatar initial circle + Student Name + Course */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-sm flex items-center justify-center shrink-0 border border-indigo-100">
                      {student.initial}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">
                        {student.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {student.email} • Enrolled in <span className="text-gray-800 font-semibold">{student.courseName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Price + LMS Enrollment Badge */}
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="font-extrabold text-sm text-gray-900">
                        {student.price > 0 ? `₹${student.price}` : "Free"}
                      </span>
                      <p className="text-[10px] text-gray-400 font-semibold">
                        {student.isFree ? "Free Enrollment" : "Online Gateway"}
                      </p>
                    </div>

                    <span className={`px-3 py-1 text-[11px] font-bold rounded-full border ${
                      student.isFree
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                    }`}>
                      {student.isFree ? "Free Access" : "Enrolled (Pro)"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <FiUsers className="w-10 h-10 mx-auto text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">No Student Enrollments Yet</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  When students enroll in your courses, their names, courses, and receipts will appear here.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* ========================================================= */}
        {/* CHARTS / PERFORMANCE SECTION */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Enrollments Breakdown */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              Students Per Course
            </h3>
            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="students" name="Students" fill="#000000" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Add courses to visualize student distributions.
                </div>
              )}
            </div>
          </div>

          {/* Quick Curriculum & Courses Hub (Both Paid & Free) */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Hub Toggle Tabs */}
                <div className="inline-flex rounded-xl border border-gray-200 p-0.5 bg-gray-50 text-xs font-bold">
                  <button
                    onClick={() => setHubTab("paid")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      hubTab === "paid"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Paid Batches ({totalPaidCourses})
                  </button>
                  <button
                    onClick={() => setHubTab("free")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      hubTab === "free"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Free Batches ({totalFreeCourses})
                  </button>
                </div>

                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  hubTab === "paid"
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}>
                  {hubTab === "paid" ? "PRO BATCHES" : "100% FREE"}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                {hubTab === "paid"
                  ? "Directly manage curriculum, pricing, video lectures, and live sessions for paid students."
                  : "Directly edit modular curriculum (Subjects, Chapters, Video Lectures & PDF Notes) for your free students."}
              </p>
            </div>

            {/* List for Active Tab */}
            <div className="space-y-2.5">
              {hubTab === "paid" ? (
                paidCoursesList.length > 0 ? (
                  paidCoursesList.slice(0, 3).map((c) => (
                    <div 
                      key={c._id}
                      onClick={() => navigate(`/admin/curriculum/${c._id}`)}
                      className="p-3 bg-gray-50 hover:bg-gray-100/80 rounded-2xl border border-gray-200/70 flex items-center justify-between gap-3 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={c.thumbnail || emptyImg} 
                          alt="" 
                          className="w-12 h-8 rounded-lg object-cover shrink-0" 
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{c.title}</p>
                          <p className="text-[10px] text-indigo-600 font-semibold">₹{c.price} • {c.category || "Pro"}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 shrink-0">
                        Curriculum →
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-gray-400">
                    No paid courses added yet.
                  </div>
                )
              ) : (
                freeCoursesList.length > 0 ? (
                  freeCoursesList.slice(0, 3).map((c) => (
                    <div 
                      key={c._id}
                      onClick={() => navigate(`/admin/curriculum/${c._id}`)}
                      className="p-3 bg-gray-50 hover:bg-gray-100/80 rounded-2xl border border-gray-200/70 flex items-center justify-between gap-3 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={c.thumbnail || emptyImg} 
                          alt="" 
                          className="w-12 h-8 rounded-lg object-cover shrink-0" 
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{c.title}</p>
                          <p className="text-[10px] text-emerald-600 font-semibold">FREE • {c.category || "General"}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 shrink-0">
                        Curriculum →
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-gray-400">
                    No free courses added yet.
                  </div>
                )
              )}
            </div>

            {/* Bottom Button */}
            {hubTab === "paid" ? (
              <button
                onClick={() => navigate("/admin/paid-courses")}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition text-center shadow-xs cursor-pointer"
              >
                Open Paid Courses Studio
              </button>
            ) : (
              <button
                onClick={() => navigate("/admin/free-courses")}
                className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl text-xs transition text-center shadow-xs cursor-pointer"
              >
                Open Free Courses Studio
              </button>
            )}
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}

export default Dashboard;
