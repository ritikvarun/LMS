import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { serverUrl } from '../App';
import { FaArrowLeftLong, FaLock, FaPlay, FaFileLines, FaTrophy, FaRegCopy, FaCheck } from "react-icons/fa6";
import { FiCheckCircle, FiClock, FiBookOpen, FiVideo, FiAward, FiShield, FiUsers, FiChevronDown, FiChevronUp, FiTag, FiX } from "react-icons/fi";
import img from "../assets/empty.jpg";
import Card from "../components/Card.jsx";
import Nav from "../components/Nav.jsx";
import { setSelectedCourseData } from '../redux/courseSlice';
import { setUserData } from '../redux/userSlice';
import { toast } from 'react-toastify';

function ViewCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { courseData, selectedCourseData } = useSelector((state) => state.course);
  const { userData } = useSelector((state) => state.user);

  const [selectedLecture, setSelectedLecture] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [liveClasses, setLiveClasses] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [activeTab, setActiveTab] = useState("curriculum"); // curriculum | mocktests

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");

  // Description collapse toggle
  const [showFullDesc, setShowFullDesc] = useState(false);

  const availableCoupons = [
    { code: "TODAY", discountPercent: 50, expires: "06 Sep 2026", description: "50% off" },
    { code: "RAIL20", discountPercent: 20, expires: "17 Sep 2026", description: "20% off" },
    { code: "SPECIAL30", discountPercent: 30, expires: "31 Dec 2026", description: "30% off" },
  ];

  const fetchCourseData = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/course/getcourselecture/${courseId}`, { withCredentials: true });
      if (res.data) {
        // If course is free, immediately route to FreeCourseDetail (Image 2 layout)
        if (res.data.isFree === true || !res.data.price || Number(res.data.price) <= 0) {
          navigate(`/freecourse/${courseId}`, { replace: true });
          return;
        }
        dispatch(setSelectedCourseData(res.data));
        if (res.data.isEnrolled) {
          setIsEnrolled(true);
        }
      }
    } catch (err) {
      console.log("Error fetching course data:", err);
      const found = courseData?.find((item) => item._id === courseId);
      if (found) {
        if (found.isFree === true || !found.price || Number(found.price) <= 0) {
          navigate(`/freecourse/${courseId}`, { replace: true });
          return;
        }
        dispatch(setSelectedCourseData(found));
      }
    }
  };

  useEffect(() => {
    if (selectedCourseData?._id === courseId) {
      const isFree = selectedCourseData.isFree === true || !selectedCourseData.price || Number(selectedCourseData.price) <= 0;
      if (isFree) {
        navigate(`/freecourse/${courseId}`, { replace: true });
      }
    }
  }, [selectedCourseData, courseId, navigate]);

  const checkEnrollment = () => {
    const verify = userData?.enrolledCourses?.some((c) => {
      const enrolledId = typeof c === 'string' ? c : c._id;
      return enrolledId?.toString() === courseId?.toString();
    });
    if (verify) {
      setIsEnrolled(true);
    }
  };

  useEffect(() => {
    fetchCourseData();
    checkEnrollment();

    // Fetch live classes
    const fetchLive = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/live/course/${courseId}`, { withCredentials: true });
        setLiveClasses(res.data || []);
      } catch (err) {
        console.log("Could not fetch live classes:", err);
      }
    };
    fetchLive();

    // Fetch mock tests
    const fetchMock = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/mocktest/course/${courseId}`, { withCredentials: true });
        setMockTests(res.data?.tests || []);
      } catch (err) {
        console.log("Could not fetch mock tests:", err);
      }
    };
    fetchMock();
  }, [courseId, userData]);

  // Coupon handling
  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      toast.warn("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/api/payment/apply-coupon`, {
        couponCode: code,
        coursePrice: selectedCourseData?.price || 0,
      });

      if (res.data?.success) {
        setAppliedCoupon(res.data);
        setCouponInput(code);
        toast.success(res.data.message);
      } else {
        toast.error(res.data?.message || "Invalid coupon");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    toast.info("Coupon removed");
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
    handleApplyCoupon(code);
  };

  // Price calculations
  const originalPrice = Number(selectedCourseData?.price) || 0;
  const isFreeCourse = !originalPrice || originalPrice <= 0 || selectedCourseData?.isFree === true;
  const currentPrice = appliedCoupon ? appliedCoupon.discountedPrice : originalPrice;

  // Enrollment / Buy Now Handler
  const handleEnroll = async (courseId, userId) => {
    if (!userData) {
      toast.info("Please log in to purchase or enroll in this course.");
      navigate("/login");
      return;
    }

    try {
      const orderData = await axios.post(
        serverUrl + "/api/payment/create-order",
        {
          courseId,
          userId,
          couponCode: appliedCoupon?.coupon?.code || undefined,
        },
        { withCredentials: true }
      );

      // If free course or discounted to 0, instant access
      if (orderData.data?.freeEnrollment) {
        setIsEnrolled(true);
        toast.success(orderData.data.message || "Enrolled successfully!");
        fetchCourseData();
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: "INR",
        name: "CodeCrafters Academy",
        description: `Enrollment in ${selectedCourseData?.title}`,
        image: "/logo.svg",
        order_id: orderData.data.id,
        prefill: {
          name: userData?.name || "Learner",
          email: userData?.email || "learner@example.com",
          contact: userData?.phone || "9999999999",
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          confirm_close: true,
          ondismiss: function () {
            toast.info("Payment window closed.");
          },
        },
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              serverUrl + "/api/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId,
                userId,
              },
              { withCredentials: true }
            );

            setIsEnrolled(true);
            toast.success(verifyRes.data?.message || "Payment Successful! Welcome to the batch.");

            // Refresh user data & course lectures
            try {
              const freshUser = await axios.get(serverUrl + "/api/user/currentuser", { withCredentials: true });
              if (freshUser.data) {
                dispatch(setUserData(freshUser.data));
              }
            } catch (uErr) {
              console.log("Could not refresh user after payment:", uErr);
            }
            fetchCourseData();
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            const msg = verifyError?.response?.data?.message || "Payment verification failed.";
            toast.error(msg);
          }
        },
      };

      if (typeof window.Razorpay === 'undefined') {
        toast.error("Payment gateway is loading. Please refresh the page and try again.");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Something went wrong while initiating order.";
      toast.error(errorMsg);
    }
  };



  const activeLive = liveClasses.find((c) => c.status === "live");
  const upcomingLive = !activeLive && liveClasses.find((c) => c.status === "scheduled");

  if (selectedCourseData?._id === courseId && (selectedCourseData.isFree === true || !selectedCourseData.price || Number(selectedCourseData.price) <= 0)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <Nav />

      {/* Main Container */}
      <div className="pt-[90px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation Breadcrumb (matching screenshot: Home / Paid Classes / Title) */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-300 transition cursor-pointer shadow-2xs"
            title="Go back"
          >
            <FaArrowLeftLong className="text-xs" />
          </button>
          <button onClick={() => navigate("/")} className="hover:text-indigo-600 transition cursor-pointer">
            Home
          </button>
          <span>/</span>
          <button onClick={() => navigate("/allcourses?type=paid")} className="hover:text-indigo-600 transition cursor-pointer">
            Paid Classes
          </button>
          <span>/</span>
          <span className="font-bold text-gray-800 uppercase tracking-tight truncate max-w-xs sm:max-w-md">
            {selectedCourseData?.title}
          </span>
        </div>

        {/* Live Notification Banners */}
        {activeLive && (
          <div className="mb-6 p-4 rounded-2xl bg-red-600 text-white shadow-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 bg-white rounded-full animate-ping shrink-0" />
              <div>
                <p className="font-bold text-sm sm:text-base">
                  🔴 LIVE CLASS IS IN PROGRESS: {activeLive.title}
                </p>
                <p className="text-xs text-red-100 hidden sm:block">
                  Enter now to participate in real-time interactive questions & chat!
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/live/${courseId}/${activeLive._id}`)}
              className="bg-white text-red-600 font-extrabold px-5 py-2 rounded-xl text-xs sm:text-sm hover:bg-gray-100 shadow transition shrink-0 ml-3 cursor-pointer"
            >
              Join Live
            </button>
          </div>
        )}

        {upcomingLive && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🕒</span>
              <div>
                <p className="font-bold text-sm">Upcoming Live Class: {upcomingLive.title}</p>
                <p className="text-xs text-indigo-600">
                  Scheduled for: {new Date(upcomingLive.scheduledAt).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/live/${courseId}/${upcomingLive._id}`)}
              className="border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Open Room
            </button>
          </div>
        )}

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Media Banner, Features, Description, Curriculum */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">

            {/* Course Big Banner Poster */}
            <div 
              onClick={() => isEnrolled && navigate(`/viewlecture/${courseId}`)}
              className={`bg-white rounded-3xl p-3 sm:p-4 shadow-sm border border-gray-200/80 overflow-hidden ${
                isEnrolled ? "cursor-pointer group" : ""
              }`}
            >
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-950 relative">
                <img
                  src={selectedCourseData?.thumbnail || img}
                  alt={selectedCourseData?.title}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isEnrolled ? "group-hover:scale-105" : ""
                  }`}
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-3 py-1 bg-black/70 backdrop-blur-md text-white text-xs font-bold uppercase rounded-lg shadow-sm">
                    {selectedCourseData?.category || "Special Batch"}
                  </span>
                  {!isFreeCourse && (
                    <span className="px-3 py-1 bg-amber-500/95 backdrop-blur-md text-slate-950 text-xs font-extrabold uppercase rounded-lg shadow-sm">
                      PRO BATCH
                    </span>
                  )}
                </div>

                {isEnrolled && (
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center group-hover:bg-black/25 transition">
                    <div className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-xl transition-transform group-hover:scale-105">
                      <FaPlay className="text-xs" />
                      <span>Continue Learning</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features Section (Dynamically loaded from course data) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80 space-y-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Features
              </h2>

              <div className="space-y-3.5 pt-1">
                {(selectedCourseData?.features && selectedCourseData.features.length > 0
                  ? selectedCourseData.features
                  : [
                      "यह ऑनलाइन कोर्स All Upcoming Exams के संपूर्ण पाठ्यक्रम पर आधारित है।",
                      "विशेषताएँ : - विशेष अनुभवी अध्यापकों के द्वारा Live वीडियो कक्षाएँ आप इन कक्षाओं को सुविधानुसार कभी भी देख सकते हैं।",
                      "वीडियो क्लास के साथ ही उस क्लास की (PDF) भी उपलब्ध रहेगी।",
                      `आप सभी अभ्यर्थियों का ध्यान रखते हुए हमने यह कोर्स मात्र ₹${currentPrice} में रखा है।`,
                      "Validity - 2 years Helpline No. 9818489147 / 9876543210"
                    ]
                ).map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3 text-sm sm:text-base text-gray-800 leading-relaxed font-medium">
                    <FiCheckCircle className="text-blue-600 w-5 h-5 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description Section (with Show More toggle) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80 space-y-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Description
              </h2>

              <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                <p className="font-bold text-gray-900 mb-2">
                  {selectedCourseData?.title}: आपके लक्ष्य को पूरा करने का सही माध्यम! 🌟
                </p>

                <p className="text-gray-600">
                  {selectedCourseData?.description || (
                    `क्या आप अपने करियर को नई ऊंचाइयों पर ले जाना चाहते हैं? यह व्यापक फाउंडेशन बैच आपको बेसिक से लेकर एडवांस लेवल तक संपूर्ण तैयारी करवाएगा।
                    
सभी कॉन्सेप्ट्स को अनुभवी फैकल्टी द्वारा सरल भाषा में लाइव कक्षाओं के माध्यम से समझाया जाएगा। प्रत्येक क्लास के बाद डिजिटल पीडीएफ नोट्स, क्लासरूम असाइनमेंट्स और टेस्ट सीरीज भी प्रदान की जाएगी।`
                  )}
                </p>

                {showFullDesc && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-in fade-in duration-200 text-gray-600">
                    <p className="font-semibold text-gray-800">📌 बैच की मुख्य मुख्य बातें:</p>
                    <ul className="list-disc pl-5 space-y-1.5 text-sm">
                      <li>दैनिक लाइव कक्षाएं एवं असीमित रिकॉर्डेड रिवीज़न</li>
                      <li>प्रत्येक विषय के संपूर्ण नोट्स डाउनलोड करने योग्य पीडीएफ फॉर्मेट में</li>
                      <li>प्रत्येक शनिवार को स्पेशल डाउट सॉल्विंग सेशन</li>
                      <li>ऑल इंडिया रैंकिंग के साथ मॉक टेस्ट और स्कोरकार्ड</li>
                      <li>कोर्स पूर्ण करने पर डिजिटल सर्टिफिकेट</li>
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-xs sm:text-sm pt-2 cursor-pointer transition-colors"
              >
                <span>{showFullDesc ? "Show less" : "Show more"}</span>
                {showFullDesc ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>

            {/* Mock Tests Section (if available) */}
            {mockTests.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FaFileLines className="text-blue-600 text-base" />
                    <h3 className="font-extrabold text-base text-gray-900">
                      Mock Tests & Test Series ({mockTests.length})
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-gray-400">
                    Exam Practice
                  </span>
                </div>

                <div className="space-y-3">
                  {mockTests.map((test) => (
                    <div
                      key={test._id}
                      className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between gap-4 bg-white shadow-xs"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{test.title}</h4>
                        <p className="text-xs text-gray-500">
                          {test.timeLimitMinutes} Mins • Pass score: {test.passingScorePercent}%
                        </p>
                      </div>
                      {isEnrolled ? (
                        <button
                          onClick={() => navigate(`/test/${courseId}/${test._id}`)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          Start Test
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnroll(courseId, userData?._id)}
                          className="px-4 py-2 bg-gray-100 text-gray-600 font-semibold rounded-xl text-xs transition cursor-pointer"
                        >
                          Enroll to Attempt
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Sticky Checkout Card (Matching screenshot) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-gray-200/90">
              
              {/* Batch / Course Title */}
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 uppercase tracking-tight leading-snug">
                {selectedCourseData?.title}
              </h1>

              {/* Price display */}
              <div className="mt-4 flex items-baseline gap-3">
                {isFreeCourse ? (
                  <span className="text-3xl font-extrabold text-emerald-600">FREE</span>
                ) : (
                  <>
                    <span className="text-3xl sm:text-4xl font-extrabold text-gray-950">
                      ₹{currentPrice}
                    </span>
                    {originalPrice > currentPrice ? (
                      <>
                        <span className="text-lg text-gray-400 line-through">
                          ₹{originalPrice}
                        </span>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-md border border-emerald-200">
                          {appliedCoupon?.coupon?.discountPercent}% OFF
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg text-gray-400 line-through">
                          ₹{originalPrice + 500}
                        </span>
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-md border border-amber-200">
                          20% OFF
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Buy Now / Continue Learning Button (Matching Screenshot) */}
              <div className="mt-5">
                {!isEnrolled ? (
                  <button
                    onClick={() => handleEnroll(courseId, userData?._id)}
                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{isFreeCourse ? "Enroll Now Free" : "Buy Now"}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/viewlecture/${courseId}`)}
                    className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FaPlay className="text-sm" />
                    <span>Continue Learning</span>
                  </button>
                )}
              </div>

              {/* Dotted / Wavy divider line (matching screenshot) */}
              <div className="my-6 border-t border-dashed border-gray-200" />

              {/* Coupon Section (matching screenshot) */}
              {!isFreeCourse && !isEnrolled && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                    <FiTag className="text-blue-600 text-sm" />
                    <span>Have a coupon?</span>
                  </div>

                  {/* Coupon Input Form */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="ENTER COUPON CODE"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-300 focus:border-blue-500 rounded-xl text-xs sm:text-sm font-mono uppercase tracking-wider text-gray-900 placeholder-gray-400 outline-none transition"
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-xs"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>

                  {/* Applied Coupon Banner */}
                  {appliedCoupon && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-200">
                      <div className="flex items-center gap-1.5 font-bold">
                        <FaCheck className="text-emerald-600" />
                        <span>'{appliedCoupon.coupon.code}' applied (-₹{appliedCoupon.discountAmount})</span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-700 font-bold ml-2 cursor-pointer"
                        title="Remove coupon"
                      >
                        <FiX className="text-base" />
                      </button>
                    </div>
                  )}

                  {/* "Or pick one below" section (matching screenshot cards) */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2.5">Or pick one below</p>

                    <div className="grid grid-cols-2 gap-2.5">
                      {availableCoupons.map((c) => {
                        const isThisApplied = appliedCoupon?.coupon?.code === c.code;

                        return (
                          <div
                            key={c.code}
                            onClick={() => handleCopyCoupon(c.code)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isThisApplied
                                ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20"
                                : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                            }`}
                          >
                            <div>
                              <span className="text-[10px] text-red-500 font-semibold block truncate">
                                Expires: {c.expires}
                              </span>
                              <p className="text-xs font-bold text-gray-900 mt-1">
                                {c.discountPercent}% off
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                              <span className="font-mono font-bold text-gray-700">{c.code}</span>
                              {copiedCode === c.code ? (
                                <FaCheck className="text-emerald-600 text-[10px]" />
                              ) : (
                                <FaRegCopy className="text-gray-400 text-[10px]" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* What's included checklist */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <FiVideo className="text-blue-600 text-sm shrink-0" />
                  <span>Full Live & Recorded Video Classes</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiBookOpen className="text-blue-600 text-sm shrink-0" />
                  <span>Downloadable Class Notes (PDF)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="text-blue-600 text-sm shrink-0" />
                  <span>2 Years Course Validity</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiAward className="text-blue-600 text-sm shrink-0" />
                  <span>Official Course Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiShield className="text-emerald-600 text-sm shrink-0" />
                  <span>100% Safe Checkout with Razorpay</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default ViewCourse;
