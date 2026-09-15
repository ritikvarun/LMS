import React, { useMemo } from 'react';
import Card from "./Card.jsx";
import { useSelector } from 'react-redux';
import { SiViaplay } from "react-icons/si";
import { FiBookOpen, FiAward, FiGift, FiArrowRight } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

function Cardspage() {
  const { courseData } = useSelector((state) => state.course);
  const navigate = useNavigate();

  // Separate Paid vs Free courses
  const { paidCourses, freeCourses } = useMemo(() => {
    const list = courseData || [];
    const paid = list.filter(
      (c) => Number(c.price) > 0 && c.isFree !== true && c.isFree !== "true"
    );
    const free = list.filter(
      (c) => !c.price || Number(c.price) <= 0 || c.isFree === true || c.isFree === "true"
    );
    return { paidCourses: paid, freeCourses: free };
  }, [courseData]);

  return (
    <div className="bg-gray-50/50 border-t border-gray-100 py-16 sm:py-24 space-y-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* ========================================================================= */}
        {/* SECTION 1: PAID / PRO COURSES (पेड कोर्सेज)                               */}
        {/* ========================================================================= */}
        <section>
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-wider text-amber-900 uppercase bg-amber-100/90 border border-amber-300 px-3.5 py-1 rounded-full shadow-2xs">
                <FiAward className="text-amber-700 text-sm" />
                <span>PRO BATCHES • पेड कोर्सेज</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight mt-3">
                Paid & Pro Masterclasses
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mt-2 leading-relaxed">
                Comprehensive, structured certification courses taught by top mentors. Includes live doubts, test series, class notes, and lifetime access.
              </p>
            </div>

            <button
              onClick={() => navigate("/allcourses?type=paid")}
              className="self-start md:self-auto px-5 py-2.5 rounded-xl border border-amber-300 hover:border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-900 text-sm font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
            >
              <span>View All Paid ({paidCourses.length})</span>
              <FiArrowRight className="text-base text-amber-700" />
            </button>
          </div>

          {/* Paid Courses Grid */}
          {paidCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
              {paidCourses.slice(0, 6).map((item, index) => (
                <Card
                  key={item._id || index}
                  id={item._id}
                  thumbnail={item.thumbnail}
                  title={item.title}
                  price={item.price}
                  category={item.category}
                  level={item.level}
                  isFree={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 p-8 max-w-lg mx-auto">
              <FiAward className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 text-base">No Paid Courses Published Yet</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                New pro batches are being scheduled. Check back shortly!
              </p>
            </div>
          )}
        </section>

        {/* Subtle separator */}
        <div className="border-t border-gray-200/80" />

        {/* ========================================================================= */}
        {/* SECTION 2: FREE COURSES (फ्री कोर्सेज)                                     */}
        {/* ========================================================================= */}
        <section>
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-wider text-emerald-800 uppercase bg-emerald-100 border border-emerald-300 px-3.5 py-1 rounded-full shadow-2xs">
                <FiGift className="text-emerald-600 text-sm" />
                <span>100% FREE LEARNING • फ्री कोर्सेज</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight mt-3">
                Free Foundation Batches
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mt-2 leading-relaxed">
                Zero-cost foundation courses open to all students. Start learning high-in-demand topics immediately at no cost!
              </p>
            </div>

            <button
              onClick={() => navigate("/allcourses?type=free")}
              className="self-start md:self-auto px-5 py-2.5 rounded-xl border border-emerald-300 hover:border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-sm font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
            >
              <span>View All Free ({freeCourses.length})</span>
              <FiArrowRight className="text-base text-emerald-700" />
            </button>
          </div>

          {/* Free Courses Grid */}
          {freeCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
              {freeCourses.slice(0, 6).map((item, index) => (
                <Card
                  key={item._id || index}
                  id={item._id}
                  thumbnail={item.thumbnail}
                  title={item.title}
                  price={0}
                  category={item.category}
                  level={item.level}
                  isFree={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 p-8 max-w-lg mx-auto">
              <FiGift className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 text-base">No Free Courses Available Right Now</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                New free foundation courses are being added soon!
              </p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default Cardspage;
