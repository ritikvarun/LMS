import React, { useEffect, useRef, useState } from 'react';
import img from "../../assets/empty.jpg";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate, useParams } from 'react-router-dom';
import { serverUrl } from '../../App';
import { MdEdit } from "react-icons/md";
import { FiUploadCloud, FiTrash2, FiEye, FiCheck, FiVideo, FiLayers, FiGift, FiAward, FiBookOpen } from "react-icons/fi";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { ClipLoader } from 'react-spinners';
import { setCourseData, setCreatorCourseData } from '../../redux/courseSlice';
import AdminLayout from './AdminLayout';

function AddCourses() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const { courseData, creatorCourseData } = useSelector((state) => state.course);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [pricingTier, setPricingTier] = useState("paid");
  const [price, setPrice] = useState("");
  const [telegramLink, setTelegramLink] = useState("");
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const thumb = useRef();
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCourseById = async () => {
    try {
      setPageLoading(true);
      const result = await axios.get(`${serverUrl}/api/course/getcourse/${courseId}`, { withCredentials: true });
      setSelectedCourse(result.data);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to load course details");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      setTitle(selectedCourse.title || "");
      setSubTitle(selectedCourse.subTitle || "");
      setDescription(selectedCourse.description || "");
      setCategory(selectedCourse.category || "");
      setLevel(selectedCourse.level || "");
      setTelegramLink(selectedCourse.telegramLink || "");
      setFeatures(Array.isArray(selectedCourse.features) ? selectedCourse.features : []);
      const coursePrice = selectedCourse.price;
      if (coursePrice && Number(coursePrice) > 0) {
        setPricingTier("paid");
        setPrice(coursePrice.toString());
      } else {
        setPricingTier("free");
        setPrice("0");
      }
      setFrontendImage(selectedCourse.thumbnail || img);
      setIsPublished(selectedCourse?.isPublished || false);
    }
  }, [selectedCourse]);

  useEffect(() => {
    getCourseById();
  }, [courseId]);

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  const handleAddFeature = (e) => {
    e?.preventDefault();
    if (!newFeature.trim()) return;
    setFeatures((prev) => [...prev, newFeature.trim()]);
    setNewFeature("");
  };

  const handleRemoveFeature = (index) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const editCourseHandler = async () => {
    if (pricingTier === "paid" && (!price || Number(price) <= 0)) {
      toast.warn("Please enter a valid course price in Rupees or select 100% Free Course.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("subTitle", subTitle);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("level", level);
    formData.append("price", pricingTier === "free" ? "0" : price);
    formData.append("telegramLink", telegramLink);
    formData.append("isFree", pricingTier === "free");
    formData.append("features", JSON.stringify(features));
    if (backendImage) {
      formData.append("thumbnail", backendImage);
    }
    formData.append("isPublished", isPublished);

    try {
      const result = await axios.post(
        `${serverUrl}/api/course/editcourse/${courseId}`,
        formData,
        { withCredentials: true }
      );

      const updatedCourse = result.data;
      if (updatedCourse) {
        if (Array.isArray(courseData)) {
          if (updatedCourse.isPublished) {
            const updatedCourses = courseData.map((c) => (c._id === courseId ? updatedCourse : c));
            if (!courseData.some((c) => c._id === courseId)) {
              updatedCourses.push(updatedCourse);
            }
            dispatch(setCourseData(updatedCourses));
          } else {
            const filteredCourses = courseData.filter((c) => c._id !== courseId);
            dispatch(setCourseData(filteredCourses));
          }
        }

        if (Array.isArray(creatorCourseData)) {
          const updatedCreatorCourses = creatorCourseData.map((c) =>
            c._id === courseId ? { ...c, ...updatedCourse } : c
          );
          dispatch(setCreatorCourseData(updatedCreatorCourses));
        }
      }

      toast.success("Course details saved successfully!");
      navigate("/courses");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to save course changes");
    } finally {
      setLoading(false);
    }
  };

  const removeCourse = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this entire course?")) {
      return;
    }
    setLoading(true);
    try {
      await axios.delete(`${serverUrl}/api/course/removecourse/${courseId}`, { withCredentials: true });
      if (Array.isArray(courseData)) {
        dispatch(setCourseData(courseData.filter((c) => c._id !== courseId)));
      }
      if (Array.isArray(creatorCourseData)) {
        dispatch(setCreatorCourseData(creatorCourseData.filter((c) => c._id !== courseId)));
      }
      toast.success("Course deleted successfully");
      navigate("/courses");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to delete course");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Web Development",
    "App Development",
    "UI UX Designing",
    "AI/ML",
    "AI Tools",
    "Data Science",
    "Data Analytics",
    "Ethical Hacking",
    "Bihar Board 10th RWA",
    "बिहार दरोगा बहाली 2025 (दरोगा बैच)",
    "RWA SSC EXAMS",
    "Haryana CET",
    "11th Class (Topper)",
    "Others",
  ];

  if (pageLoading && !selectedCourse) {
    return (
      <AdminLayout activeTab="courses">
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-200/80 p-12">
          <ClipLoader size={36} color="#4F46E5" />
          <p className="text-sm font-semibold text-gray-500">Loading course details...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="courses">
      <div className="space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/courses")}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition cursor-pointer text-gray-700"
              title="Back to Courses"
            >
              <FaArrowLeftLong className="w-4 h-4" />
            </button>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                Course Studio
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mt-1">
                Edit Course: {selectedCourse?.title || "Loading..."}
              </h1>
            </div>
          </div>

          {/* Action links */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => navigate(`/admin/curriculum/${courseId}`)}
              className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <FiBookOpen /> Curriculum (Subjects)
            </button>
            <button
              onClick={() => navigate(`/createlecture/${courseId}`)}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
            >
              <FiVideo /> Manage Lectures
            </button>
            <button
              onClick={() => navigate(selectedCourse?.isFree || selectedCourse?.price <= 0 ? `/freecourse/${courseId}` : `/viewcourse/${courseId}`)}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <FiEye /> Student Preview
            </button>
          </div>
        </div>

        {/* Status Bar Banner */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-200/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500">Course Visibility:</span>
            <button
              onClick={() => setIsPublished((prev) => !prev)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide uppercase transition cursor-pointer flex items-center gap-2 ${
                isPublished
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-amber-100 text-amber-700 hover:bg-amber-200"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isPublished ? "bg-emerald-500" : "bg-amber-500"}`} />
              {isPublished ? "Published (Live to Students)" : "Draft (Hidden)"}
            </button>
          </div>

          <button
            onClick={removeCourse}
            disabled={loading}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <FiTrash2 /> Delete Course
          </button>
        </div>

        {/* Main Form Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Course Metadata Form (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80 space-y-5">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Course Details
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Course Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Course Title"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Subtitle / Short Summary
              </label>
              <input
                type="text"
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                placeholder="Brief one-line summary"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Course Description
              </label>
              <textarea
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed curriculum overview and what students will learn..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
              />
            </div>

            {/* Course Features Section (मुख्य विशेषताएं) */}
            <div className="pt-2 pb-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Course Features (कोर्स की मुख्य विशेषताएं)
                  </label>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Add bullet points shown on the course details page (Checkmark items)
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {features.length} Features
                </span>
              </div>

              {/* Add New Feature Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  placeholder="e.g. Validity - 2 years Helpline No. 9818489147 / 9876543210"
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer shrink-0 shadow-xs"
                >
                  + Add Feature
                </button>
              </div>

              {/* Preset suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-semibold text-gray-400 mr-1">Quick Add:</span>
                {[
                  "यह ऑनलाइन कोर्स All Upcoming Exams के संपूर्ण पाठ्यक्रम पर आधारित है।",
                  "विशेषताएँ : - अनुभवी अध्यापकों द्वारा Live एवं रिकॉर्डेड कक्षाएं।",
                  "वीडियो क्लास के साथ ही उस क्लास की (PDF) भी उपलब्ध रहेगी।",
                  "Validity - 2 years Helpline No. 9818489147 / 9876543210"
                ].map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => {
                      if (!features.includes(preset)) {
                        setFeatures([...features, preset]);
                      }
                    }}
                    className="text-[11px] px-2.5 py-1 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-gray-600 transition cursor-pointer border border-gray-200/60"
                  >
                    + {preset.slice(0, 28)}...
                  </button>
                ))}
              </div>

              {/* Current Features List */}
              <div className="space-y-2 pt-2">
                {features.length === 0 ? (
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                    No custom features added yet. (Default standard features will be displayed on website until you add custom ones).
                  </div>
                ) : (
                  features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3 text-xs sm:text-sm text-gray-800 animate-in fade-in duration-150"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <FiCheck className="text-emerald-600 text-base shrink-0 mt-0.5" />
                        <span className="break-words leading-snug">{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer shrink-0"
                        title="Delete feature"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Category & Level in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Select Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Course Pricing Model (Free vs Paid) */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Course Pricing Tier *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 100% Free Option */}
                <button
                  type="button"
                  onClick={() => {
                    setPricingTier("free");
                    setPrice("0");
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    pricingTier === "free"
                      ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100/80"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                      pricingTier === "free"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <FiGift />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold uppercase">100% Free Course</div>
                    <div className="text-[11px] text-gray-500 font-normal">₹0 • Instant 1-Click Access</div>
                  </div>
                </button>

                {/* Paid Pro Option */}
                <button
                  type="button"
                  onClick={() => {
                    setPricingTier("paid");
                    if (!price || Number(price) <= 0) {
                      setPrice("499");
                    }
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    pricingTier === "paid"
                      ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950 font-bold"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100/80"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                      pricingTier === "paid"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <FiAward />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold uppercase">Paid Pro Course</div>
                    <div className="text-[11px] text-gray-500 font-normal">Razorpay Payment Gateway</div>
                  </div>
                </button>
              </div>

              {/* Price Details Box */}
              {pricingTier === "paid" ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider">
                      Set Course Price (₹ INR) *
                    </label>
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/90 px-2.5 py-0.5 rounded-md">
                      Razorpay Gateway
                    </span>
                  </div>

                  {/* Clean, robust input with distinct Rupee block */}
                  <div className="flex items-stretch rounded-xl shadow-xs border border-indigo-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-600 transition">
                    <div className="px-4 bg-indigo-100/60 border-r border-indigo-200/60 flex items-center justify-center text-indigo-700 font-extrabold text-base select-none">
                      ₹
                    </div>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Enter amount (e.g. 499)"
                      value={price === "0" ? "" : price}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^[0-9]+$/.test(val)) {
                          setPrice(val);
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-white text-base font-bold text-gray-900 focus:outline-none placeholder:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {price && price !== "0" && (
                      <button
                        type="button"
                        onClick={() => setPrice("")}
                        className="px-3 text-xs text-gray-400 hover:text-rose-500 font-bold transition cursor-pointer"
                        title="Clear amount"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Quick Preset Buttons */}
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Quick Price Presets:</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {["99", "199", "299", "499", "999", "1499"].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setPrice(preset)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            price === preset
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                              : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                          }`}
                        >
                          ₹{preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-gray-500">
                    <span>
                      Students will pay <strong className="text-gray-900 font-bold">₹{price || "0"}</strong> to unlock this course.
                    </span>
                    {price && Number(price) > 0 ? (
                      <span className="text-[11px] text-emerald-600 font-semibold">
                        ✓ Valid amount
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-600 font-semibold">
                        ⚠️ Please enter an amount
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FiCheck className="text-base" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-emerald-950">100% Free Course Mode</p>
                    <p className="text-emerald-700 mt-0.5">
                      Students can enroll with a single click without opening the Razorpay payment gateway.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Telegram Channel / Community Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Telegram Channel / Community Link (Optional)
              </label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition">
                <span className="text-sky-500 font-bold text-sm select-none">t.me/</span>
                <input
                  type="text"
                  placeholder="https://t.me/your_batch_channel"
                  value={telegramLink}
                  onChange={(e) => setTelegramLink(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-400">
                Shown in the "Telegram" tab for enrolled students to join the batch discussion group.
              </p>
            </div>
          </div>

          {/* Right: Media & Save Box (1 col) */}
          <div className="space-y-6">
            
            {/* Thumbnail Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 space-y-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Course Thumbnail
              </h2>

              <div
                onClick={() => thumb.current?.click()}
                className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-colors cursor-pointer relative group flex items-center justify-center"
              >
                {frontendImage ? (
                  <img src={frontendImage} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <FiUploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-xs text-gray-500 font-medium">Click to upload thumbnail</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-2">
                  <MdEdit className="text-base" /> Change Thumbnail
                </div>
              </div>

              <input
                type="file"
                ref={thumb}
                hidden
                accept="image/*"
                onChange={handleThumbnail}
              />
              <p className="text-[11px] text-gray-400 text-center">
                Recommended aspect ratio: 16:9 (1280x720)
              </p>
            </div>

            {/* Save Action Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 space-y-3">
              <button
                onClick={editCourseHandler}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <ClipLoader size={20} color="white" /> : (
                  <>
                    <FiCheck />
                    <span>Save Course Changes</span>
                  </>
                )}
              </button>

              <button
                onClick={() => navigate("/courses")}
                className="w-full py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
}

export default AddCourses;
