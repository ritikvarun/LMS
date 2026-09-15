import axios from 'axios';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { serverUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCamera } from "react-icons/fa";
import { FiUser, FiMail, FiCheck } from "react-icons/fi";
import Nav from '../components/Nav';

function EditProfile() {
  const { userData } = useSelector((state) => state.user);
  const [name, setName] = useState(userData?.name || "");
  const [description, setDescription] = useState(userData?.description || "");
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(userData?.photoUrl || null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const updateProfile = async () => {
    if (!name.trim()) {
      toast.warn("Name cannot be empty");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (photoFile) {
      formData.append("photoUrl", photoFile);
    }

    try {
      const result = await axios.post(
        `${serverUrl}/api/user/updateprofile`,
        formData,
        { withCredentials: true }
      );
      dispatch(setUserData(result.data));
      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <Nav />

      <main className="pt-[100px] max-w-2xl mx-auto px-4 sm:px-6">
        
        {/* Back Link */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition mb-6 cursor-pointer"
        >
          <FaArrowLeft className="text-xs" /> Back to Profile
        </button>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200/80 p-8 sm:p-10">
          <div className="border-b border-gray-100 pb-6 mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Edit Your Profile
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Update your photo, display name, and public biography.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); updateProfile(); }} className="space-y-6">
            
            {/* Avatar Upload */}
            <div className="flex flex-col items-center text-center">
              <div className="relative group">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-indigo-500/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-extrabold text-3xl flex items-center justify-center border-4 border-white shadow-lg">
                    {userData?.name?.slice(0, 1)?.toUpperCase() || "U"}
                  </div>
                )}

                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md cursor-pointer transition-transform group-hover:scale-110"
                  title="Upload new photo"
                >
                  <FaCamera className="text-xs" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <span className="text-xs text-gray-400 mt-2">Click camera icon to change avatar</span>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center">
                <FiUser className="absolute left-3.5 text-gray-400 text-base" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Email (Read only) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <FiMail className="absolute left-3.5 text-gray-400 text-base" />
                <input
                  type="email"
                  readOnly
                  disabled
                  value={userData?.email || ""}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Email address cannot be changed.</p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Bio / Headline
              </label>
              <textarea
                rows="4"
                placeholder="Write a few words about your interests, skills, or role..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                {loading ? <ClipLoader size={18} color="white" /> : (
                  <>
                    <FiCheck />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </main>
    </div>
  );
}

export default EditProfile;
