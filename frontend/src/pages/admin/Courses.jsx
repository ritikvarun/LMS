import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { setCreatorCourseData } from '../../redux/courseSlice';
import AdminLayout from './AdminLayout';
import emptyImg from '../../assets/empty.jpg';
import { 
  FiPlus, 
  FiBookOpen, 
  FiVideo, 
  FiUsers, 
  FiExternalLink, 
  FiEdit2, 
  FiTrash2, 
  FiSearch,
  FiTv
} from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';

function Courses() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { creatorCourseData } = useSelector((state) => state.course);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'paid', 'free'

  const fetchCreatorCourses = async () => {
    setLoading(true);
    try {
      const result = await axios.get(`${serverUrl}/api/course/getcreatorcourses`, { withCredentials: true });
      dispatch(setCreatorCourseData(result.data));
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatorCourses();
  }, []);

  const deleteCourse = async (courseId, title, e) => {
    e?.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await axios.delete(`${serverUrl}/api/course/removecourse/${courseId}`, { withCredentials: true });
      toast.success("Course deleted successfully");
      const updated = (creatorCourseData || []).filter((c) => c._id !== courseId);
      dispatch(setCreatorCourseData(updated));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete course");
    }
  };

  const coursesList = Array.isArray(creatorCourseData) ? creatorCourseData : [];

  const filtered = coursesList.filter((course) => {
    // Type Filter
    const isPaid = Number(course.price) > 0 && course.isFree !== true && course.isFree !== "true";
    const isFree = course.isFree === true || course.isFree === "true" || Number(course.price) <= 0;

    if (filterType === "paid" && !isPaid) return false;
    if (filterType === "free" && !isFree) return false;

    // Search Filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return course.title?.toLowerCase().includes(q) || course.category?.toLowerCase().includes(q);
  });

  return (
    <AdminLayout activeTab="courses">
      <div className="space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md">
                Course Catalog
              </span>
              <span className="text-xs text-gray-500 font-semibold">
                {coursesList.length} Total Courses
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1.5">
              All Courses Studio
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage curriculum, video uploads, live classes, mock tests, and course settings.
            </p>
          </div>

          <button
            onClick={() => navigate("/createcourses")}
            className="px-5 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <FiPlus className="text-base" />
            <span>Create New Course</span>
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Type Toggle Pills */}
          <div className="inline-flex rounded-2xl border border-gray-200 p-1 bg-white shadow-xs self-start text-xs font-bold">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                filterType === "all"
                  ? "bg-black text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All Courses ({coursesList.length})
            </button>
            <button
              onClick={() => setFilterType("paid")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                filterType === "paid"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Paid Courses ({coursesList.filter(c => Number(c.price) > 0 && !c.isFree).length})
            </button>
            <button
              onClick={() => setFilterType("free")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                filterType === "free"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Free Courses ({coursesList.filter(c => c.isFree || Number(c.price) <= 0).length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search courses by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
            />
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 bg-white rounded-3xl border border-gray-200/80">
            <ClipLoader color="#000000" size={40} />
            <p className="text-xs font-semibold text-gray-500">Loading courses...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center max-w-lg mx-auto shadow-xs">
            <FiBookOpen className="text-4xl text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">No Courses Found</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              {searchQuery ? "No courses matched your search query." : "You haven't created any courses in this category yet."}
            </p>
            <button
              onClick={() => navigate("/createcourses")}
              className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              + Create Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => {
              const lecturesCount = course.lectures?.length || 0;
              const enrolledCount = course.enrolledStudents?.length || 0;
              const isPaid = Number(course.price) > 0 && !course.isFree;

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-3xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Banner Image */}
                  <div className="relative w-full aspect-[16/9] bg-slate-900 overflow-hidden">
                    <img
                      src={course.thumbnail || emptyImg}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = emptyImg;
                      }}
                    />

                    {/* Paid/Free Badge */}
                    <div className="absolute top-3 left-3">
                      {isPaid ? (
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-sm">
                          PAID • ₹{course.price}
                        </div>
                      ) : (
                        <div className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-sm">
                          100% FREE
                        </div>
                      )}
                    </div>

                    {/* Publish Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md shadow-xs ${
                          course.isPublished
                            ? "bg-emerald-500 text-white"
                            : "bg-amber-400 text-slate-900"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        <span>{course.category || "General"}</span>
                        <span className={isPaid ? "text-indigo-600 font-extrabold text-xs" : "text-emerald-600 font-extrabold text-xs"}>
                          {isPaid ? `₹${course.price}` : "Free"}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                        {course.title}
                      </h3>

                      {/* Course Stats Pills */}
                      <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-gray-600 flex-wrap">
                        <span className="px-2.5 py-1 bg-gray-100 rounded-lg flex items-center gap-1.5">
                          <FiVideo className="text-indigo-600 text-xs" />
                          {lecturesCount} Lectures
                        </span>
                        <span className="px-2.5 py-1 bg-gray-100 rounded-lg flex items-center gap-1.5">
                          <FiUsers className="text-purple-600 text-xs" />
                          {enrolledCount} Enrolled
                        </span>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                      {/* Left: Curriculum & Live Management */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/curriculum/${course._id}`)}
                          className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="Manage Curriculum & Videos"
                        >
                          <FiBookOpen />
                          <span>Curriculum</span>
                        </button>

                        <button
                          onClick={() => navigate(`/managelive/${course._id}`)}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition cursor-pointer"
                          title="Manage Live Classes"
                        >
                          <FiTv className="text-sm" />
                        </button>
                      </div>

                      {/* Right: Edit, Preview, Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/addcourses/${course._id}`)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                          title="Edit Details & Settings"
                        >
                          <FiEdit2 className="text-sm" />
                        </button>

                        <button
                          onClick={() => navigate(isPaid ? `/viewcourse/${course._id}` : `/freecourse/${course._id}`)}
                          className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                          title="Student View Preview"
                        >
                          <FiExternalLink className="text-sm" />
                        </button>

                        <button
                          onClick={(e) => deleteCourse(course._id, course.title, e)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Delete Course"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

export default Courses;
