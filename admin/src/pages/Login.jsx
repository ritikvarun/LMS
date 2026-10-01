import React, { useState } from 'react';
import Logo from '../components/Logo';
import axios from 'axios';
import { serverUrl } from '../App';
import { MdOutlineRemoveRedEye, MdRemoveRedEye } from "react-icons/md";
import { FiMail, FiLock, FiArrowRight, FiShield, FiExternalLink } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function Login() {
  const [email, setEmail] = useState("ritikvarun65@gmail.com");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const websiteUrl = (import.meta.env.VITE_WEBSITE_URL || "http://localhost:5173").replace(/\/+$/, "");

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      toast.warn("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const result = await axios.post(
        serverUrl + "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      const user = result.data;
      if (user.role !== "educator") {
        await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true }).catch(() => {});
        dispatch(setUserData(null));
        toast.error("Access Denied: This portal is strictly for authorized instructors and administrators.");
        return;
      }

      if (user.token) {
        localStorage.setItem("admin_token", user.token);
      }
      dispatch(setUserData(user));
      toast.success(`Welcome back, ${user.name || "Instructor"}!`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error(error?.response?.data?.message || "Invalid credentials or login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/60">
        
        {/* Header with Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <Logo dark={true} tagline="Studio Management Portal" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <FiShield className="text-xs" />
            <span>Admin & Educator Portal</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Instructor Sign In</h1>
          <p className="text-xs text-slate-400 mt-1">Manage courses, lectures, live streams, and mock tests</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <FiMail className="text-indigo-400" /> Instructor Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="educator@codecrafters.com"
                className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <FiLock className="text-indigo-400" /> Password
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition pr-11"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {show ? <MdRemoveRedEye size={18} /> : <MdOutlineRemoveRedEye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <ClipLoader color="#ffffff" size={20} />
            ) : (
              <>
                <span>Access Studio Portal</span>
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Back to main website link */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <a
            href={websiteUrl}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition"
          >
            <span>Return to Student Learning Platform</span>
            <FiExternalLink className="text-[11px]" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
