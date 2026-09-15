import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';
import { 
  FiPlus, 
  FiBookOpen, 
  FiVideo, 
  FiLayers, 
  FiExternalLink, 
  FiEdit2, 
  FiTrash2, 
  FiSearch,
  FiGift
} from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import emptyImg from '../../assets/empty.jpg';

function AdminFreeCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/course/free-courses`, { withCredentials: true });
      setCourses(res.data?.courses || []);
    } catch (err) {
      console.error("Error fetching free courses:", err);
      toast.error("Failed to load free courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
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
    <AdminLayout activeTab="free-courses">
      <div className="space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                100% Free Batches
              </span>
              <span className="text-xs text-gray-500 font-semibold">
                {courses.length} Batches
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1.5">
              Free Courses & Curriculum
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage subjects, chapters, recorded classes, and lecture PDF notes in the hierarchical layout.
            </p>
          </div>

          <button
            onClick={() => navigate("/createcourses")}
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <FiPlus className="text-base" />
            <span>Create Free Course</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search free courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
            />
          </div>

          <span className="text-xs text-gray-500 font-semibold hidden sm:inline">
            Showing {filtered.length} courses
          </span>
        </div>

        {/* Courses List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 bg-white rounded-3xl border border-gray-200/80">
            <ClipLoader color="#059669" size={40} />
            <p className="text-xs font-semibold text-gray-500">Loading free courses...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center max-w-lg mx-auto shadow-xs">
            <FiGift className="text-4xl text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">No Free Courses Found</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              Create a course with 100% Free mode to build hierarchical curriculum with subjects and chapters.
            </p>
            <button
              onClick={() => navigate("/createcourses")}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              + Create First Free Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => {
              const subjectsCount = course.subjects?.length || 0;
              const chaptersCount = (course.subjects || []).reduce(
                (acc, sub) => acc + (sub.chapters?.length || 0), 
                0
              );
              const videosCount = course.totalVideos || 0;

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-3xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col"
                >
                  {/* Banner Image */}
                  <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
                    <img
                      src={course.thumbnail || emptyImg}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = emptyImg;
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-xs">
                      FREE BATCH
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        {course.category}
                      </div>
                      <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                        {course.title}
                      </h3>

                      {/* Curriculum Stats Pills */}
                      <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-gray-600 flex-wrap">
                        <span className="px-2.5 py-1 bg-gray-100 rounded-lg flex items-center gap-1.5">
                          <FiBookOpen className="text-emerald-600 text-xs" />
                          {subjectsCount} Subjects
                        </span>
                        <span className="px-2.5 py-1 bg-gray-100 rounded-lg flex items-center gap-1.5">
                          <FiLayers className="text-blue-600 text-xs" />
                          {chaptersCount} Chapters
                        </span>
                        <span className="px-2.5 py-1 bg-gray-100 rounded-lg flex items-center gap-1.5">
                          <FiVideo className="text-purple-600 text-xs" />
                          {videosCount} Videos
                        </span>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                      {/* Manage Curriculum Button */}
                      <button
                        onClick={() => navigate(`/admin/free-curriculum/${course._id}`)}
                        className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs border border-emerald-200"
                      >
                        <FiBookOpen />
                        <span>Curriculum</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/addcourses/${course._id}`)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                          title="Edit Details"
                        >
                          <FiEdit2 className="text-sm" />
                        </button>

                        <button
                          onClick={() => navigate(`/freecourse/${course._id}`)}
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

export default AdminFreeCourses;
