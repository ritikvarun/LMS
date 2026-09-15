import React, { useState } from 'react';
import Logo from '../components/Logo';
import axios from 'axios';
import { serverUrl } from '../App';
import { MdOutlineRemoveRedEye, MdRemoveRedEye } from "react-icons/md";
import { FiUser, FiMail, FiLock, FiKey, FiArrowRight } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../utils/Firebase';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEducator, setIsEducator] = useState(false);
  const [adminSecret, setAdminSecret] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      toast.warn("Please fill in all required fields.");
      return;
    }
    if (isEducator && !adminSecret) {
      toast.warn("Instructor passcode is required to register as educator.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        role: isEducator ? "educator" : "student",
        adminSecret: isEducator ? adminSecret : undefined,
      };

      const result = await axios.post(
        serverUrl + "/api/auth/signup",
        payload,
        { withCredentials: true }
      );
      dispatch(setUserData(result.data));
      navigate("/");
      toast.success("Account created successfully! Welcome to CodeCrafters.");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const googleSignUp = async () => {
    try {
      const response = await signInWithPopup(auth, provider);
      const user = response.user;
      const name = user.displayName;
      const email = user.email;
      const role = "";

      const result = await axios.post(
        serverUrl + "/api/auth/googlesignup",
        { name, email, role },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data));
      navigate("/");
      toast.success("Signed up with Google successfully!");
    } catch (error) {
      if (error?.code === "auth/popup-closed-by-user" || error?.code === "auth/cancelled-popup-request") {
        return;
      }
      toast.error(error?.response?.data?.message || "Google signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      
      {/* Container */}
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Brand */}
            <div 
              className="cursor-pointer mb-8"
              onClick={() => navigate("/")}
            >
              <Logo iconSize="w-9 h-9" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Start mastering in-demand skills today
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <FiUser className="absolute left-3.5 text-gray-400 text-base pointer-events-none" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    placeholder="Ritik Varun"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <FiMail className="absolute left-3.5 text-gray-400 text-base pointer-events-none" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-3.5 text-gray-400 text-base pointer-events-none" />
                  <input
                    type={show ? "text" : "password"}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {show ? <MdRemoveRedEye className="text-lg" /> : <MdOutlineRemoveRedEye className="text-lg" />}
                  </button>
                </div>
              </div>

              {/* Educator Checkbox & Passcode */}
              <div className="pt-1">
                <label className="flex items-center gap-2.5 text-xs text-gray-600 hover:text-gray-900 cursor-pointer select-none font-medium">
                  <input
                    type="checkbox"
                    checked={isEducator}
                    onChange={(e) => {
                      setIsEducator(e.target.checked);
                      if (!e.target.checked) setAdminSecret("");
                    }}
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                  />
                  <span>Register as an Instructor / Educator</span>
                </label>

                {isEducator && (
                  <div className="mt-3 p-3 bg-purple-50/70 border border-purple-200 rounded-xl animate-in fade-in duration-200">
                    <label className="block text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-1">
                      Instructor Secret Passcode
                    </label>
                    <div className="relative flex items-center">
                      <FiKey className="absolute left-3 text-purple-400 text-sm" />
                      <input
                        type="password"
                        placeholder="Enter admin passcode"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-purple-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        value={adminSecret}
                        onChange={(e) => setAdminSecret(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-[10px] text-purple-600 mt-1">
                      Provided by the platform administrator for authorized educators.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? <ClipLoader size={20} color="white" /> : (
                  <>
                    <span>Create Account</span>
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-xs text-gray-400 uppercase tracking-wider font-semibold absolute">
                or
              </span>
            </div>

            {/* Google Signup */}
            <button
              onClick={googleSignUp}
              type="button"
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-xs transition flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="pt-6 text-center text-xs text-gray-500">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Right Banner */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-indigo-500/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/20 blur-3xl rounded-full" />

          <div className="relative z-10">
            <span className="px-3 py-1 bg-white/10 border border-white/15 rounded-full text-xs font-semibold text-indigo-300">
              Start Learning Free
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-6 leading-snug">
              Unlock Unlimited Learning Opportunities.
            </h2>
            <p className="text-sm text-gray-300 mt-4 leading-relaxed font-light">
              Get immediate access to course materials, interactive live classes with mentors, and personal learning roadmaps.
            </p>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/10 mt-8 space-y-3 text-xs text-gray-300 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span>
              <span>100% Free registration</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span>
              <span>Lifetime access to enrolled courses</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span>
              <span>Verified certificates of completion</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default SignUp;
