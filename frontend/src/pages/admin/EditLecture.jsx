import axios from 'axios';
import React, { useState } from 'react';
import { FaArrowLeft } from "react-icons/fa";
import { FiCloud, FiCheckCircle, FiTrash2, FiVideo, FiUploadCloud } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { serverUrl } from '../../App';
import { setLectureData } from '../../redux/lectureSlice';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

function EditLecture() {
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileSizeMB, setFileSizeMB] = useState(null);
  const { courseId, lectureId } = useParams();
  const { lectureData } = useSelector((state) => state.lecture);
  const dispatch = useDispatch();
  const selectedLecture = lectureData?.find((lecture) => lecture._id === lectureId);

  const [videoUrl, setVideoUrl] = useState(null);
  const [lectureTitle, setLectureTitle] = useState(selectedLecture?.lectureTitle || "");
  const [isPreviewFree, setIsPreviewFree] = useState(selectedLecture?.isPreviewFree || false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoUrl(file);
      setFileSizeMB((file.size / (1024 * 1024)).toFixed(1));
      setUploadProgress(0);
    }
  };

  const editLecture = async () => {
    if (!lectureTitle.trim()) {
      toast.warn("Lecture title is required.");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("lectureTitle", lectureTitle);
      if (videoUrl) {
        formData.append("videoUrl", videoUrl);
      }
      formData.append("isPreviewFree", isPreviewFree);

      const result = await axios.post(
        `${serverUrl}/api/course/editlecture/${lectureId}`,
        formData,
        {
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percent);
            }
          },
        }
      );

      const updatedList = (lectureData || []).map((l) => (l._id === lectureId ? result.data : l));
      dispatch(setLectureData(updatedList));
      toast.success("Lecture updated & video uploaded successfully!");
      navigate(`/createlecture/${courseId}`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error?.response?.data?.message || "Failed to upload video");
    } finally {
      setLoading(false);
    }
  };

  const removeLecture = async () => {
    if (!window.confirm("Are you sure you want to delete this lecture?")) return;
    setLoading1(true);
    try {
      await axios.delete(`${serverUrl}/api/course/removelecture/${lectureId}`, { withCredentials: true });
      dispatch(setLectureData(lectureData.filter((l) => l._id !== lectureId)));
      toast.success("Lecture removed successfully");
      navigate(`/createlecture/${courseId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete lecture");
    } finally {
      setLoading1(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/createlecture/${courseId}`)}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition cursor-pointer text-gray-700"
              title="Back to Lecture List"
            >
              <FaArrowLeft className="text-xs" />
            </button>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                Lecture Editor
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mt-1">
                Edit & Upload Lecture
              </h1>
            </div>
          </div>

          <button
            onClick={removeLecture}
            disabled={loading1}
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <FiTrash2 /> Delete
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80 space-y-6">
          
          {/* Lecture Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Lecture Title
            </label>
            <input
              type="text"
              required
              value={lectureTitle}
              onChange={(e) => setLectureTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Video Upload Area */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Video File (MP4, MKV, MOV)
            </label>

            <label
              htmlFor="lecture-video-input"
              className="border-2 border-dashed border-gray-300 hover:border-indigo-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-gray-50/60 hover:bg-indigo-50/20 transition-all text-center"
            >
              <FiUploadCloud className="w-10 h-10 text-indigo-600 mb-3" />
              <p className="text-sm font-bold text-gray-900">
                {videoUrl ? videoUrl.name : "Click to browse or replace video file"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {fileSizeMB ? `File size: ${fileSizeMB} MB` : "Files routed directly through Bunny Stream CDN"}
              </p>
            </label>
            <input
              id="lecture-video-input"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Upload Progress Bar */}
          {loading && uploadProgress > 0 && (
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                <span>Uploading video to Bunny Stream...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-indigo-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Free Preview Toggle */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-gray-900">Free Preview Access</h4>
              <p className="text-xs text-gray-500">Allow non-enrolled students to watch this sample lesson.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPreviewFree}
                onChange={(e) => setIsPreviewFree(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => navigate(`/createlecture/${courseId}`)}
              type="button"
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={editLecture}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {loading ? <ClipLoader size={18} color="white" /> : "Save & Upload"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default EditLecture;
