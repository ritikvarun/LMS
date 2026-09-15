import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { FiBookOpen, FiArrowRight } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { FaGithub, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Pre-footer Callout */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 rounded-3xl p-8 sm:p-10 border border-indigo-500/20 mb-16 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to Craft Your Next-Level Tech Career?
            </h3>
            <p className="text-sm text-gray-300 max-w-xl">
              Join thousands of developers leveling up with hands-on projects, real-time live classes, and interactive assessments.
            </p>
          </div>
          <button
            onClick={() => navigate("/allcourses")}
            className="px-6 py-3.5 bg-white text-gray-950 hover:bg-gray-100 font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Explore Catalog</span>
            <FiArrowRight />
          </button>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          
          {/* Col 1: Brand (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="cursor-pointer" onClick={() => navigate("/")}>
              <Logo dark={true} tagline="Engineering Academy" />
            </div>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              An intelligent, cloud-powered Learning Management System built for students and educators. Learn faster, practice better, and advance your career.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-700 transition">
                <FaTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-700 transition">
                <FaLinkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-700 transition">
                <FaYoutube className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-700 transition">
                <FaGithub className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => navigate("/")} className="hover:text-white transition cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/allcourses")} className="hover:text-white transition cursor-pointer flex items-center gap-1.5">
                  <FiBookOpen className="text-xs text-indigo-400" />
                  <span>All Courses</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/allcourses?type=paid")} className="hover:text-white transition cursor-pointer flex items-center gap-1.5">
                  <span className="text-xs text-amber-400">★</span>
                  <span>Paid Courses</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/freecourses")} className="hover:text-white transition cursor-pointer flex items-center gap-1.5">
                  <span className="text-xs text-emerald-400">🎁</span>
                  <span>Free Courses</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Top Domains
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li onClick={() => navigate("/allcourses")} className="hover:text-white transition cursor-pointer">
                Web Development
              </li>
              <li onClick={() => navigate("/allcourses")} className="hover:text-white transition cursor-pointer">
                AI & Machine Learning
              </li>
              <li onClick={() => navigate("/allcourses")} className="hover:text-white transition cursor-pointer">
                App Development
              </li>
              <li onClick={() => navigate("/allcourses")} className="hover:text-white transition cursor-pointer">
                Data Science
              </li>
            </ul>
          </div>

          {/* Col 4: Account */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Student Hub
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => navigate("/login")} className="hover:text-white transition cursor-pointer">
                  Sign In
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/signup")} className="hover:text-white transition cursor-pointer">
                  Create Account
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/enrolledcourses")} className="hover:text-white transition cursor-pointer">
                  My Enrolled Courses
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/profile")} className="hover:text-white transition cursor-pointer">
                  Profile & Settings
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} CodeCrafters Academy Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-400 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-400 transition cursor-pointer">Cookie Preferences</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
