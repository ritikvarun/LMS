import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiArrowUpRight, 
  FiVideo, 
  FiSearch, 
  FiBookOpen
} from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import emptyImg from '../assets/empty.jpg';

function FreeCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categoryCounts, setCategoryCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef(null);

  const fetchFreeCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/course/free-courses`, { withCredentials: true });
      const fetchedCourses = res.data?.courses || [];
      setCourses(fetchedCourses);
      setCategoryCounts(res.data?.categoryCounts || {});
    } catch (err) {
      console.error("Error fetching free courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreeCourses();
  }, []);

  const scrollPills = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.6;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Filter courses by category & search query
  const filteredCourses = courses.filter((course) => {
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 pb-24">
      <Nav />

      <main className="pt-[90px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Header matching Image 4 */}
        <div className="flex items-center justify-between py-4 mb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-100 hover:border-gray-300 transition shadow-xs cursor-pointer text-gray-700"
              title="Go back to Home"
            >
              <FiChevronLeft className="text-lg" />
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <span 
                onClick={() => navigate("/")} 
                className="hover:text-indigo-600 transition cursor-pointer"
              >
                Home
              </span>
              <span>/</span>
              <span className="font-bold text-gray-900">
                Free Courses
              </span>
            </div>
          </div>

          {/* Quick Search box */}
          <div className="hidden sm:flex items-center relative w-64 md:w-80">
            <FiSearch className="absolute left-3.5 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search free courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs"
            />
          </div>
        </div>

        {/* Category Pill Filters Carousel matching Image 4 */}
        <div className="relative flex items-center my-4">
          {/* Scroll Left Button */}
          <button
            onClick={() => scrollPills('left')}
            className="hidden md:flex shrink-0 w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-100 items-center justify-center shadow-xs cursor-pointer mr-2 z-10 text-gray-600"
            title="Scroll left"
          >
            <FiChevronLeft className="text-sm" />
          </button>

          {/* Scrollable Pills Container */}
          <div 
            ref={scrollRef}
            className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-2 px-1 w-full scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* "All" category pill */}
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                selectedCategory === "All"
                  ? "bg-gray-900 text-white shadow-md shadow-gray-900/15"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <FiBookOpen className="text-xs" />
              <span>All</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-extrabold ${
                selectedCategory === "All" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}>
                {courses.length}
              </span>
            </button>

            {/* Individual category pills */}
            {Object.entries(categoryCounts).map(([catName, count]) => {
              const isSelected = selectedCategory === catName;
              return (
                <button
                  key={catName}
                  onClick={() => setSelectedCategory(catName)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-gray-900 text-white shadow-md shadow-gray-900/15"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="truncate max-w-[200px]">{catName}</span>
                  <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scrollPills('right')}
            className="hidden md:flex shrink-0 w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-100 items-center justify-center shadow-xs cursor-pointer ml-2 z-10 text-gray-600"
            title="Scroll right"
          >
            <FiChevronRight className="text-sm" />
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
            <ClipLoader color="#4F46E5" size={40} />
            <p className="text-sm font-medium text-gray-500">Loading free courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center max-w-lg mx-auto my-12 shadow-xs">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              <FiBookOpen />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No Free Courses Found</h2>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              {searchQuery
                ? `No results match your query "${searchQuery}". Try a different keyword.`
                : "No published free courses available in this category yet."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-xs hover:bg-gray-800 transition cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* Course Cards Grid matching Image 4 */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mt-4">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                onClick={() => navigate(`/freecourse/${course._id}`)}
                className="bg-white rounded-3xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col group cursor-pointer"
              >
                {/* Poster / Thumbnail Banner with 16:9 ratio */}
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                  <img
                    src={course.thumbnail || emptyImg}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = emptyImg;
                    }}
                  />
                  {/* Category overlay */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                    {course.category || "Foundation"}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Title and Free Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition line-clamp-2 leading-snug">
                        {course.title}
                      </h3>
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200">
                        FREE
                      </span>
                    </div>

                    {/* Video Stats */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-2.5">
                      <FiVideo className="text-gray-400 text-sm" />
                      <span>{course.totalVideos || 0} videos</span>
                    </div>
                  </div>

                  {/* Bottom Action Row matching Image 4 */}
                  <div className="mt-5 pt-4 flex items-center justify-between border-t border-gray-100">
                    <span className="font-extrabold text-sm sm:text-base text-gray-900 group-hover:text-indigo-600 transition">
                      View Now
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs group-hover:bg-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shadow-xs">
                      <FiArrowUpRight className="text-sm font-bold" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

export default FreeCourses;
