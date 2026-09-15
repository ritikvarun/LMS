import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit } from "react-icons/fa";
import { FiMail, FiBookOpen, FiUser, FiCheckCircle, FiLayout } from "react-icons/fi";
import Nav from '../components/Nav';

function Profile() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  if (!userData) {
    navigate("/login");
    return null;
  }

  const isEducator = userData.role === "educator";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <Nav />

      {/* Container */}
      <main className="pt-[100px] max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition mb-6 cursor-pointer"
        >
          <FaArrowLeft className="text-xs" /> Back
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200/80 overflow-hidden">
          
          {/* Top Banner Gradient */}
          <div className="h-36 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 relative">
            <span className="absolute top-4 right-4 px-3 py-1 bg-black/30 backdrop-blur-md text-white text-xs font-semibold rounded-full">
              {isEducator ? "Verified Instructor" : "Verified Student"}
            </span>
          </div>

          {/* Profile Header Info */}
          <div className="px-6 sm:px-10 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 mb-8 gap-4">
              
              {/* Avatar */}
              <div className="relative">
                {userData.photoUrl ? (
                  <img
                    src={userData.photoUrl}
                    alt={userData.name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl ring-2 ring-indigo-500/20"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-extrabold text-4xl flex items-center justify-center border-4 border-white shadow-xl">
                    {userData?.name?.slice(0, 1)?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white text-xs" title="Active">
                  ✓
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {isEducator && (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <FiLayout /> Instructor Studio
                  </button>
                )}
                <button
                  onClick={() => navigate("/editprofile")}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <FaEdit className="text-xs" /> Edit Profile
                </button>
              </div>
            </div>

            {/* Name & Role */}
            <div className="space-y-1 mb-8">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {userData.name}
                </h1>
                <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-md tracking-wider ${
                  isEducator ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {isEducator ? "Educator" : "Student"}
                </span>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <FiMail className="text-gray-400" /> {userData.email}
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
                  <FiBookOpen className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Enrolled Courses</p>
                  <p className="text-xl font-extrabold text-gray-900">
                    {userData.enrolledCourses?.length || 0}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                  <FiUser className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Account Role</p>
                  <p className="text-base font-extrabold text-gray-900 capitalize">
                    {userData.role}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                  <FiCheckCircle className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Account Status</p>
                  <p className="text-base font-extrabold text-emerald-600">
                    Active & Verified
                  </p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="space-y-2 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                About / Bio
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-light">
                {userData.description || "No biography provided yet. Click 'Edit Profile' to add your bio, skills, and social links."}
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

export default Profile;
