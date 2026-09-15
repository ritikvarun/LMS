import React, { useState, useEffect, useRef } from 'react';
import Logo from './Logo';
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { HiSparkles } from "react-icons/hi2";
import { FiBookOpen, FiUser, FiLogOut, FiLayout, FiChevronDown, FiGift, FiAward, FiSearch, FiX } from "react-icons/fi";
import { useNavigate, useLocation } from 'react-router-dom';
import { serverUrl } from '../App';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function Nav() {
  const [showHam, setShowHam] = useState(false);
  const [showPro, setShowPro] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  // Active live session notification if any instructor is live
  const [activeLiveSession, setActiveLiveSession] = useState(null);

  useEffect(() => {
    const checkLiveAlert = async () => {
      if (!userData) return;
      try {
        const res = await axios.get(`${serverUrl}/api/live/student/my-live-classes`, {
          withCredentials: true,
        });
        const liveNow = res.data?.liveNow || [];
        if (liveNow.length > 0) {
          setActiveLiveSession(liveNow[0]);
        } else {
          setActiveLiveSession(null);
        }
      } catch (err) {
        // Silent
      }
    };
    checkLiveAlert();
    const interval = setInterval(checkLiveAlert, 30000);
    return () => clearInterval(interval);
  }, [userData]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPro(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close drawer and mobile search on path change
  useEffect(() => {
    setShowHam(false);
    setShowPro(false);
    setShowMobileSearch(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.get(serverUrl + "/api/auth/logout", { withCredentials: true });
      dispatch(setUserData(null));
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.log(error?.response?.data?.message || "Logout error");
      dispatch(setUserData(null));
      navigate("/");
    }
  };

  const isActive = (path) => location.pathname === path;

  const [navSearch, setNavSearch] = useState("");

  // Sync nav search with URL if on /allcourses
  useEffect(() => {
    const s = new URLSearchParams(location.search).get("search");
    if (s && location.pathname === "/allcourses") {
      setNavSearch(s);
    }
  }, [location.search, location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!navSearch.trim()) return;
    navigate(`/allcourses?search=${encodeURIComponent(navSearch.trim())}`);
    setShowHam(false);
    setShowMobileSearch(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full min-h-[72px] z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/70 transition-all duration-300">
      <div className="max-w-7xl mx-auto h-[72px] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 lg:gap-6">
        
        {/* 1. Left: Brand Logo */}
        <div 
          className="cursor-pointer shrink-0" 
          onClick={() => navigate("/")}
        >
          <Logo />
        </div>

        {/* 2. Center: Dedicated Centered Search Bar (sm and up) */}
        <div className="hidden sm:flex flex-1 justify-center max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg mx-2 lg:mx-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-gray-100 hover:bg-gray-100/90 focus:bg-white border border-gray-200/80 rounded-full text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
            />
            {navSearch && (
              <button
                type="button"
                onClick={() => setNavSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                title="Clear"
              >
                <FiX className="text-sm" />
              </button>
            )}
          </form>
        </div>

        {/* 3. Right: Desktop Nav Links + Auth/Profile + Mobile Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">
          
          {/* Desktop Navigation Links (Visible on lg: screens and above) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 mr-1">
            <button
              onClick={() => navigate("/")}
              className={`px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors cursor-pointer ${
                isActive("/") 
                  ? "text-indigo-600 bg-indigo-50/70 font-semibold" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate("/allcourses")}
              className={`px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                location.pathname === "/allcourses" && !location.search
                  ? "text-indigo-600 bg-indigo-50/70 font-semibold" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
              }`}
            >
              <FiBookOpen className="text-xs xl:text-sm opacity-70" />
              <span>All Courses</span>
            </button>
            <button
              onClick={() => navigate("/allcourses?type=paid")}
              className={`px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                location.pathname === "/allcourses" && location.search.includes("type=paid")
                  ? "text-amber-700 bg-amber-50/80 font-semibold" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
              }`}
            >
              <FiAward className="text-xs xl:text-sm text-amber-500" />
              <span>Paid Courses</span>
              <span className="text-[9px] xl:text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                PRO
              </span>
            </button>
            <button
              onClick={() => navigate("/freecourses")}
              className={`px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                location.pathname === "/freecourses"
                  ? "text-emerald-700 bg-emerald-50/80 font-semibold" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
              }`}
            >
              <FiGift className="text-xs xl:text-sm text-emerald-500" />
              <span>Free Courses</span>
              <span className="text-[9px] xl:text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                FREE
              </span>
            </button>

            {userData?.role === "educator" && (
              <button
                onClick={() => navigate("/dashboard")}
                className={`px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive("/dashboard") 
                    ? "text-indigo-600 bg-indigo-50/70 font-semibold" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                }`}
              >
                <FiLayout className="text-xs xl:text-sm opacity-70" />
                <span>Studio</span>
              </button>
            )}
          </nav>

          {/* Mobile Search Icon Toggle (< sm only) */}
          <button
            onClick={() => setShowMobileSearch((prev) => !prev)}
            className="sm:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
            aria-label="Toggle search"
            title="Search"
          >
            <FiSearch className="w-5 h-5" />
          </button>

          {/* User Profile / Auth Area */}
          <div ref={dropdownRef}>
            {!userData ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button 
                  onClick={() => navigate("/login")}
                  className="px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition cursor-pointer"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate("/signup")}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {activeLiveSession && (
                  <button
                    onClick={() => navigate(`/live/${activeLiveSession.courseId?._id || activeLiveSession.courseId}/${activeLiveSession._id}`)}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] sm:text-xs rounded-full shadow-md animate-pulse flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="Your course instructor is LIVE!"
                  >
                    <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                    <span className="hidden sm:inline">LIVE NOW</span>
                  </button>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowPro((prev) => !prev)}
                    className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:pr-3 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer"
                  >
                    {userData.photoUrl ? (
                      <img
                        src={userData.photoUrl}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
                        alt={userData.name}
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {userData?.name?.slice(0, 1)?.toUpperCase() || "U"}
                      </div>
                    )}
                    <span className="hidden md:inline text-xs sm:text-sm font-medium text-gray-800 max-w-[100px] xl:max-w-[130px] truncate">
                      {userData.name}
                    </span>
                    <FiChevronDown className={`text-xs text-gray-500 transition-transform duration-200 ${showPro ? "rotate-180" : ""}`} />
                  </button>

                  {/* Profile Dropdown Popover */}
                  {showPro && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-150 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{userData.name}</p>
                        <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                        <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md ${
                          userData.role === "educator" 
                            ? "bg-purple-100 text-purple-700" 
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {userData.role === "educator" ? "Instructor" : "Student"}
                        </span>
                      </div>

                      <div className="py-1">
                        {userData.role === "educator" && (
                          <button
                            onClick={() => navigate("/dashboard")}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition text-left cursor-pointer"
                          >
                            <FiLayout className="text-base text-gray-400" />
                            Instructor Dashboard
                          </button>
                        )}
                        <button
                          onClick={() => navigate("/profile")}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition text-left cursor-pointer"
                        >
                          <FiUser className="text-base text-gray-400" />
                          My Profile
                        </button>
                        <button
                          onClick={() => navigate("/enrolledcourses")}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition text-left cursor-pointer"
                        >
                          <FiBookOpen className="text-base text-gray-400" />
                          My Enrolled Courses
                        </button>
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left cursor-pointer font-medium"
                        >
                          <FiLogOut className="text-base text-red-500" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Hamburger Menu Toggle (Shown on screens < lg) */}
          <button
            onClick={() => setShowHam(true)}
            className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none transition cursor-pointer ml-0.5"
            aria-label="Open menu"
          >
            <HiMenuAlt3 className="w-6 h-6" />
          </button>
        </div>

      </div>

      {/* Mobile Inline Search Bar (Toggled on < sm) */}
      {showMobileSearch && (
        <div className="sm:hidden px-4 pb-3 pt-1 border-t border-gray-100 bg-white/95 animate-in fade-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearch} className="relative w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-8 py-2 bg-gray-100 focus:bg-white border border-gray-200 rounded-full text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition shadow-xs"
            />
            {navSearch && (
              <button
                type="button"
                onClick={() => setNavSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <FiX className="text-sm" />
              </button>
            )}
          </form>
        </div>
      )}

      {/* Mobile / Tablet Drawer */}
      {showHam && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Dimmed Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setShowHam(false)}
          />

          {/* Drawer Content */}
          <div className="fixed top-0 right-0 w-[290px] sm:w-[340px] h-full bg-white shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                <Logo iconSize="w-8 h-8" tagline="" />
                <button
                  onClick={() => setShowHam(false)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              {/* User overview if logged in */}
              {userData && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                  {userData.photoUrl ? (
                    <img src={userData.photoUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                      {userData.name?.slice(0, 1)?.toUpperCase()}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-gray-900 truncate">{userData.name}</p>
                    <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                  </div>
                </div>
              )}

              {/* Drawer Search Bar */}
              <form onSubmit={handleSearch} className="relative mt-4">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-gray-100 focus:bg-white border border-gray-200 rounded-full text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                />
                {navSearch && (
                  <button
                    type="button"
                    onClick={() => setNavSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <FiX className="text-sm" />
                  </button>
                )}
              </form>

              {/* Navigation Links */}
              <div className="mt-5 flex flex-col space-y-1">
                <button
                  onClick={() => navigate("/")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition text-left cursor-pointer"
                >
                  Home
                </button>
                <button
                  onClick={() => navigate("/allcourses")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition text-left cursor-pointer"
                >
                  <FiBookOpen className="text-base text-gray-400" />
                  <span>All Courses</span>
                </button>
                <button
                  onClick={() => navigate("/allcourses?type=paid")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FiAward className="text-base text-amber-500" />
                    <span>Paid Courses</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    PRO
                  </span>
                </button>
                <button
                  onClick={() => navigate("/freecourses")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FiGift className="text-base text-emerald-500" />
                    <span>Free Courses</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    FREE
                  </span>
                </button>

                {userData && (
                  <>
                    <button
                      onClick={() => navigate("/profile")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition text-left cursor-pointer"
                    >
                      <FiUser className="text-base text-gray-400" />
                      My Profile
                    </button>
                    <button
                      onClick={() => navigate("/enrolledcourses")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition text-left cursor-pointer"
                    >
                      <FiBookOpen className="text-base text-gray-400" />
                      My Courses
                    </button>
                    {userData.role === "educator" && (
                      <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition text-left cursor-pointer"
                      >
                        <FiLayout className="text-base text-indigo-600" />
                        Instructor Studio
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-gray-100">
              {!userData ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full py-2.5 text-center text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="w-full py-2.5 text-center text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition cursor-pointer"
                  >
                    Get Started Free
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition cursor-pointer"
                >
                  <FiLogOut className="text-base" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Nav;