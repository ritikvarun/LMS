import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiGrid, 
  FiBookOpen, 
  FiBook,
  FiGift, 
  FiPlusCircle, 
  FiCreditCard,
  FiVideo, 
  FiFileText, 
  FiArrowLeft, 
  FiLogOut, 
  FiMenu, 
  FiX, 
  FiExternalLink,
  FiUser
} from 'react-icons/fi';
import Logo from '../../components/Logo';
import { serverUrl } from '../../App';
import axios from 'axios';
import { setUserData } from '../../redux/userSlice';
import { toast } from 'react-toastify';

function AdminLayout({ children, activeTab = "dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { creatorCourseData } = useSelector((state) => state.course);

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Determine active item based on current URL path or prop
  const currentPath = location.pathname;
  const isTabActive = (key) => {
    if (key === "dashboard") return currentPath === "/dashboard" || activeTab === "dashboard";
    if (key === "free-courses") return currentPath === "/admin/free-courses" || activeTab === "free-courses";
    if (key === "paid-courses") return currentPath === "/admin/paid-courses" || activeTab === "paid-courses";
    if (key === "courses") return currentPath === "/courses" || activeTab === "courses";
    if (key === "createcourses") return currentPath === "/createcourses" || activeTab === "createcourses";
    if (key === "curriculum") return currentPath.includes("/admin/curriculum") || activeTab === "curriculum";
    if (key === "books") return currentPath === "/admin/books" || activeTab === "books";
    return false;
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      dispatch(setUserData(null));
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      dispatch(setUserData(null));
      navigate("/");
    }
  };

  const navItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <FiGrid className="text-lg" />,
      path: "/dashboard",
    },
    {
      key: "paid-courses",
      label: "Paid Courses",
      icon: <FiCreditCard className="text-lg" />,
      badge: "PRO",
      path: "/admin/paid-courses",
    },
    {
      key: "free-courses",
      label: "Free Courses",
      icon: <FiGift className="text-lg" />,
      badge: "FREE",
      path: "/admin/free-courses",
    },
    {
      key: "courses",
      label: "All Courses",
      icon: <FiBookOpen className="text-lg" />,
      path: "/courses",
    },
    {
      key: "createcourses",
      label: "Add Course",
      icon: <FiPlusCircle className="text-lg" />,
      path: "/createcourses",
    },
    {
      key: "books",
      label: "Books",
      icon: <FiBook className="text-lg" />,
      path: "/admin/books",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 flex">
      
      {/* ========================================================= */}
      {/* DESKTOP LEFT SIDEBAR (Matching User's Reference Image) */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200/80 flex-col shrink-0 sticky top-0 h-screen z-30 select-none">
        
        {/* Brand / Logo Header */}
        <div className="p-6 pb-5 border-b border-gray-100 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => navigate("/")}>
            <Logo />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
            Studio
          </span>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isTabActive(item.key);
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={active ? "text-white" : "text-gray-500"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    active ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 pb-2">
            <span className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Quick Shortcuts
            </span>
          </div>

          <button
            onClick={() => navigate("/freecourses")}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-gray-100/80 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FiExternalLink className="text-sm text-gray-400" />
              <span>Public Free Courses</span>
            </div>
            <span className="text-[10px] text-gray-400">↗</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-gray-100/80 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FiArrowLeft className="text-sm text-gray-400" />
              <span>Back to Website</span>
            </div>
          </button>
        </nav>

        {/* User Identity Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {userData?.photoUrl ? (
              <img
                src={userData.photoUrl}
                alt=""
                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {userData?.name?.slice(0, 1)?.toUpperCase() || "A"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 truncate">
                {userData?.name || "Instructor"}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                Educator Access
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
            title="Log Out"
          >
            <FiLogOut className="text-sm" />
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MOBILE DRAWER (Slide-over Sidebar for Mobile Screens) */}
      {/* ========================================================= */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-64 bg-white h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <Logo />
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 text-lg"
              >
                <FiX />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const active = isTabActive(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setIsMobileOpen(false);
                      navigate(item.path);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition cursor-pointer ${
                      active
                        ? "bg-black text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-4">
                <button
                  onClick={() => {
                    setIsMobileOpen(false);
                    navigate("/");
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  <FiArrowLeft /> Back to Website
                </button>
              </div>
            </nav>

            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {userData?.name?.slice(0, 1)?.toUpperCase() || "A"}
                </div>
                <span className="text-xs font-bold text-gray-900 truncate max-w-[110px]">
                  {userData?.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600"
              >
                <FiLogOut />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN RIGHT CONTENT AREA */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Top Navbar with Hamburger Toggle */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <FiMenu className="text-xl" />
            </button>
            <Logo />
          </div>

          <button
            onClick={() => navigate("/")}
            className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
          >
            Website ↗
          </button>
        </header>

        {/* Child Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}

export default AdminLayout;
