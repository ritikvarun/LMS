import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { setCreatorCourseData } from '../../redux/courseSlice';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';
import { 
  FiPlus, 
  FiBookOpen, 
  FiVideo, 
  FiUsers, 
  FiExternalLink, 
  FiEdit2, 
  FiTrash2, 
  FiSearch,
  FiDollarSign,
  FiCreditCard,
  FiTv,
  FiCheckCircle
} from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import emptyImg from '../../assets/empty.jpg';

function AdminPaidCourses() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { creatorCourseData } = useSelector((state) => state.course);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPaidCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/course/getcreatorcourses`, { withCredentials: true });
      const allCreatorCourses = Array.isArray(res.data) ? res.data : [];
      dispatch(setCreatorCourseData(allCreatorCourses));
      // Filter for paid courses (price > 0 and isFree is not true)
      const paidOnly = allCreatorCourses.filter(
        (c) => Number(c.price) > 0 && c.isFree !== true && c.isFree !== "true"
      );
      setCourses(paidOnly);
    } catch (err) {
      console.error("Error fetching paid courses:", err);
      toast.error("Failed to load paid courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaidCourses();
  }, []);

  const deleteCourse = async (courseId, title, e) => {
    e?.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await axios.delete(`${serverUrl}/api/course/removecourse/${courseId}`, { withCredentials: true });
      toast.success("Course deleted successfully");
      setCourses(courses.filter((c) => c._id !== courseId));
      const updatedCreator = (creatorCourseData || []).filter((c) => c._id !== courseId);
      dispatch(setCreatorCourseData(updatedCreator));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete course");
    }
  };

  const filtered = courses.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.title?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q);
  });

  return (
    <AdminLayout activeTab="paid-courses">
      <div className="space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-md">
                Paid Pro Programs
              </span>
              <span className="text-xs text-gray-500 font-semibold">
                {courses.length} Paid Courses
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1.5">
              Paid Courses & Premium Batches
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage premium masterclasses, curriculum, enrolled students, pricing, and live interactive classes.
            </p>
          </div>

          <button
            onClick={() => navigate("/createcourses")}
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <FiPlus className="text-base" />
            <span>Create Paid Course</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search paid courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
            />
          </div>

          <span className="text-xs text-gray-500 font-semibold hidden sm:inline">
            Showing {filtered.length} paid courses
          </span>
        </div>

        {/* Courses List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 bg-white rounded-3xl border border-gray-200/80">
            <ClipLoader color="#4f46e5" size={40} />
            <p className="text-xs font-semibold text-gray-500">Loading paid courses...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FiCreditCard className="text-2xl" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No Paid Courses Found</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              You haven't published any paid courses yet. Set a price when creating a course to start monetizing.
            </p>
            <button
              onClick={() => navigate("/createcourses")}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              + Create First Paid Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => {
              const lecturesCount = course.lectures?.length || 0;
              const enrolledCount = course.enrolledStudents?.length || 0;
              const subjectsCount = course.subjects?.length || 0;

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
                    
                    {/* Paid Batch Badge */}
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                      <span>PAID BATCH</span>
                      <span>•</span>
                      <span>₹{course.price}</span>
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
                        <span className="text-emerald-600 font-extrabold text-xs">₹{course.price}</span>
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
                        {subjectsCount > 0 && (
                          <span className="px-2.5 py-1 bg-gray-100 rounded-lg flex items-center gap-1.5">
                            <FiBookOpen className="text-emerald-600 text-xs" />
                            {subjectsCount} Subjects
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                      
                      {/* Left: Curriculum & Live Management */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/curriculum/${course._id}`)}
                          className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
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
                          title="Edit Details & Pricing"
                        >
                          <FiEdit2 className="text-sm" />
                        </button>

                        <button
                          onClick={() => navigate(`/viewcourse/${course._id}`)}
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

export default AdminPaidCourses;
