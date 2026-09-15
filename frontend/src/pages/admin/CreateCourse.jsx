import axios from "axios";
import React, { useState } from "react";
import { FiBookOpen, FiLayers, FiPlus, FiGift, FiAward } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../../App";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import AdminLayout from "./AdminLayout";

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [courseType, setCourseType] = useState("free"); // "free" | "paid"

  const CreateCourseHandler = async (e) => {
    e?.preventDefault();
    if (!title.trim() || !category) {
      toast.warn("Please enter both title and category.");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/course/create`,
        { 
          title, 
          category,
          price: courseType === "free" ? 0 : 499,
          isFree: courseType === "free"
        },
        { withCredentials: true }
      );
      toast.success("Course created! Now configure curriculum and details.");
      if (result.data?._id) {
        if (courseType === "free") {
          navigate(`/admin/free-curriculum/${result.data._id}`);
        } else {
          navigate(`/addcourses/${result.data._id}`);
        }
      } else {
        navigate("/courses");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Bihar Board 10th RWA",
    "बिहार दरोगा बहाली 2025 (दरोगा बैच)",
    "RWA SSC EXAMS",
    "Haryana CET",
    "11th Class (Topper)",
    "Web Development",
    "App Development",
    "UI UX Designing",
    "AI/ML",
    "AI Tools",
    "Data Science",
    "Data Analytics",
    "Ethical Hacking",
    "Others",
  ];

  return (
    <AdminLayout activeTab="createcourses">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80">
          <div className="border-b border-gray-100 pb-5 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Studio Setup
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-2">
              Create a New Course
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Select batch type, course title, and target exam category to begin adding curriculum.
            </p>
          </div>

          <form onSubmit={CreateCourseHandler} className="space-y-6">
            
            {/* Free vs Paid Toggle */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Course Pricing Mode *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCourseType("free")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    courseType === "free"
                      ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                    courseType === "free" ? "bg-emerald-600 text-white shadow-xs" : "bg-gray-200 text-gray-500"
                  }`}>
                    <FiGift />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase">100% Free Course</div>
                    <div className="text-[11px] text-gray-500 font-normal">Free access with subjects & chapters</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCourseType("paid")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    courseType === "paid"
                      ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950 font-bold"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                    courseType === "paid" ? "bg-indigo-600 text-white shadow-xs" : "bg-gray-200 text-gray-500"
                  }`}>
                    <FiAward />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase">Paid Pro Masterclass</div>
                    <div className="text-[11px] text-gray-500 font-normal">Razorpay payment gateway</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Course Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Course / Batch Title *
              </label>
              <div className="relative flex items-center">
                <FiBookOpen className="absolute left-3.5 text-gray-400 text-base" />
                <input
                  type="text"
                  required
                  placeholder="e.g. RWA 10th Bihar Board Toppers बैच"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Target Exam / Subject Category *
              </label>
              <div className="relative flex items-center">
                <FiLayers className="absolute left-3.5 text-gray-400 text-base pointer-events-none" />
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                >
                  <option value="">Select subject category</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <ClipLoader size={20} color="white" /> : (
                  <>
                    <FiPlus />
                    <span>Create Course & Continue</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

      </div>
    </AdminLayout>
  );
};

export default CreateCourse;
