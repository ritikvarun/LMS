import React, { useState } from 'react';
import Logo from '../components/Logo';
import axios from 'axios';
import { serverUrl } from '../App';
import { MdOutlineRemoveRedEye, MdRemoveRedEye } from "react-icons/md";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../utils/Firebase';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async () => {
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
      dispatch(setUserData(result.data));
      navigate("/");
      toast.success("Welcome back! Login Successful.");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
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
      toast.success("Logged in with Google successfully!");
    } catch (error) {
      if (error?.code === "auth/popup-closed-by-user" || error?.code === "auth/cancelled-popup-request") {
        return;
      }
      toast.error(error?.response?.data?.message || "Google login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      
      {/* Auth Card Container */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
        <div>
            {/* Logo & Header */}
            <div 
              className="cursor-pointer mb-8"
              onClick={() => navigate("/")}
            >
              <Logo iconSize="w-9 h-9" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-gray-500 mt-1 mb-8">
              Sign in to continue your learning journey
            </p>

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
              
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgotpassword")}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-3.5 text-gray-400 text-base pointer-events-none" />
                  <input
                    type={show ? "text" : "password"}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    placeholder="••••••••••••"
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

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? <ClipLoader size={20} color="white" /> : (
                  <>
                    <span>Sign In</span>
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

            {/* Google Login */}
            <button
              onClick={googleLogin}
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

          {/* Footer link */}
          <div className="pt-6 text-center text-xs text-gray-500">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
            >
              Sign up now
            </button>
          </div>
        </div>
      </div>
  );
}

export default Login;
