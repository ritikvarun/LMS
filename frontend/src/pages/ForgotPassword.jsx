import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { serverUrl } from '../App';
import { toast } from 'react-toastify';
import Logo from '../components/Logo';
import { FiMail, FiKey, FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [newpassword, setNewPassword] = useState("");
  const [conPassword, setConpassword] = useState("");

  const handleStep1 = async (e) => {
    e?.preventDefault();
    if (!email) return toast.warn("Please enter your email");
    setLoading(true);
    try {
      const result = await axios.post(`${serverUrl}/api/auth/sendotp`, { email }, { withCredentials: true });
      setStep(2);
      toast.success(result.data.message || "OTP sent to your email");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e?.preventDefault();
    if (!otp) return toast.warn("Please enter the OTP received");
    setLoading(true);
    try {
      const result = await axios.post(`${serverUrl}/api/auth/verifyotp`, { email, otp }, { withCredentials: true });
      toast.success(result.data.message || "OTP verified successfully");
      setStep(3);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async (e) => {
    e?.preventDefault();
    if (!newpassword || !conPassword) return toast.warn("Please fill all fields");
    if (newpassword !== conPassword) {
      return toast.error("Passwords do not match");
    }
    setLoading(true);
    try {
      const result = await axios.post(`${serverUrl}/api/auth/resetpassword`, { email, password: newpassword }, { withCredentials: true });
      toast.success(result.data.message || "Password reset successful! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
        
        {/* Brand */}
        <div className="flex items-center justify-between mb-8">
          <div className="cursor-pointer" onClick={() => navigate("/")}>
            <Logo iconSize="w-8 h-8" tagline="" />
          </div>

          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition cursor-pointer"
          >
            <FiArrowLeft /> Back to Login
          </button>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-400"
            }`}>
              1
            </div>
            <span className="text-[10px] text-gray-500 mt-1">Email</span>
          </div>
          <div className={`h-[2px] flex-1 mx-2 ${step >= 2 ? "bg-indigo-600" : "bg-gray-200"}`} />
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-400"
            }`}>
              2
            </div>
            <span className="text-[10px] text-gray-500 mt-1">Verify OTP</span>
          </div>
          <div className={`h-[2px] flex-1 mx-2 ${step >= 3 ? "bg-indigo-600" : "bg-gray-200"}`} />
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-400"
            }`}>
              3
            </div>
            <span className="text-[10px] text-gray-500 mt-1">Reset</span>
          </div>
        </div>

        {/* Step 1: Send OTP */}
        {step === 1 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Reset Your Password
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-6">
              Enter your registered email address and we'll send you a verification OTP.
            </p>

            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <FiMail className="absolute left-3.5 text-gray-400 text-base" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition cursor-pointer flex items-center justify-center"
              >
                {loading ? <ClipLoader size={20} color="white" /> : "Send Verification Code"}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Enter OTP Code
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-6">
              We sent a 6-digit verification code to <span className="font-semibold text-gray-800">{email}</span>.
            </p>

            <form onSubmit={handleStep2} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Verification Code (OTP)
                </label>
                <div className="relative flex items-center">
                  <FiKey className="absolute left-3.5 text-gray-400 text-base" />
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm tracking-widest font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition cursor-pointer flex items-center justify-center"
              >
                {loading ? <ClipLoader size={20} color="white" /> : "Verify Code"}
              </button>

              <button
                type="button"
                onClick={handleStep1}
                className="w-full text-center text-xs font-semibold text-indigo-600 hover:underline pt-2 cursor-pointer"
              >
                Didn't receive code? Resend
              </button>
            </form>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Create New Password
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-6">
              Set a strong password for your account.
            </p>

            <form onSubmit={handleStep3} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-3.5 text-gray-400 text-base" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={newpassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-3.5 text-gray-400 text-base" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={conPassword}
                    onChange={(e) => setConpassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <ClipLoader size={20} color="white" /> : (
                  <>
                    <FiCheckCircle />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default ForgotPassword;
