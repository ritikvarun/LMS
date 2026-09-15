import React, { useEffect, useState, useMemo } from 'react';
import Card from "../components/Card.jsx";
import { useNavigate, useSearchParams } from 'react-router-dom';
import Nav from '../components/Nav';
import { useSelector } from 'react-redux';
import { FiSearch, FiBookOpen, FiGift, FiAward, FiX } from 'react-icons/fi';

function AllCourses() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { courseData } = useSelector((state) => state.course);

  const [pricingType, setPricingType] = useState("all"); // 'all' | 'paid' | 'free'
  const [searchQuery, setSearchQuery] = useState("");

  // Sync pricingType and search with URL
  useEffect(() => {
    const t = searchParams.get("type");
    if (t === "free" || t === "paid") {
      setPricingType(t);
    } else {
      setPricingType("all");
    }

    const s = searchParams.get("search");
    if (s !== null) {
      setSearchQuery(s);
    }
  }, [searchParams]);

  const handlePricingChange = (type) => {
    setPricingType(type);
    const updated = Object.fromEntries(searchParams);
    if (type === "all") {
      delete updated.type;
    } else {
      updated.type = type;
    }
    setSearchParams(updated);
  };

  const handleSearchInputChange = (val) => {
    setSearchQuery(val);
    const updated = Object.fromEntries(searchParams);
    if (val.trim()) {
      updated.search = val.trim();
    } else {
      delete updated.search;
    }
    setSearchParams(updated, { replace: true });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    const updated = Object.fromEntries(searchParams);
    delete updated.search;
    setSearchParams(updated, { replace: true });
  };

  // Compute filtered courses split into Paid and Free
  const { paidFiltered, freeFiltered, totalPaidCount, totalFreeCount } = useMemo(() => {
    const all = courseData || [];
    const q = searchQuery.trim().toLowerCase();

    const matchesSearch = (item) => {
      if (!q) return true;
      return (
        item.title?.toLowerCase().includes(q) ||
        item.subTitle?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      );
    };

    const allPaid = all.filter(
      (c) => Number(c.price) > 0 && c.isFree !== true && c.isFree !== "true"
    );
    const allFree = all.filter(
      (c) => !c.price || Number(c.price) <= 0 || c.isFree === true || c.isFree === "true"
    );

    const filteredPaid = allPaid.filter(matchesSearch);
    const filteredFree = allFree.filter(matchesSearch);

    return {
      paidFiltered: filteredPaid,
      freeFiltered: filteredFree,
      totalPaidCount: allPaid.length,
      totalFreeCount: allFree.length,
    };
  }, [courseData, searchQuery]);

  const totalResults = (pricingType === "free" ? 0 : paidFiltered.length) + 
                       (pricingType === "paid" ? 0 : freeFiltered.length);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <Nav />

      {/* Main Container */}
      <main className="pt-[100px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Catalog Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            {pricingType === "free" ? (
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
                100% Free Access • फ्री कोर्सेज
              </span>
            ) : pricingType === "paid" ? (
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">
                Premium Pro Batches • पेड कोर्सेज
              </span>
            ) : (
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                Course Catalog • सभी कोर्सेज
              </span>
            )}

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-2">
              {pricingType === "free"
                ? "Free Online Courses"
                : pricingType === "paid"
                ? "Paid & Pro Masterclasses"
                : "Course Catalog"}
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              {pricingType === "free"
                ? "High-quality foundation courses accessible to everyone at zero cost. Enroll instantly!"
                : pricingType === "paid"
                ? "Comprehensive masterclasses designed to take you from beginner to job-ready pro."
                : "Explore our separate sections for Paid Masterclasses and 100% Free Foundation Batches."}
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-80 relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              type="text"
              placeholder="Search by title or topic..."
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <FiX className="text-base" />
              </button>
            )}
          </div>
        </div>

        {/* Pricing Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => handlePricingChange("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              pricingType === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <FiBookOpen />
            <span>All Sections ({totalPaidCount + totalFreeCount})</span>
          </button>

          <button
            onClick={() => handlePricingChange("paid")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              pricingType === "paid"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <FiAward className={pricingType === "paid" ? "text-slate-950" : "text-amber-500"} />
            <span>Paid Courses (पेड कोर्सेज)</span>
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                pricingType === "paid" ? "bg-black/20 text-slate-950" : "bg-amber-100 text-amber-800"
              }`}
            >
              {totalPaidCount}
            </span>
          </button>

          <button
            onClick={() => handlePricingChange("free")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              pricingType === "free"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <FiGift className={pricingType === "free" ? "text-white" : "text-emerald-500"} />
            <span>Free Courses (फ्री कोर्सेज)</span>
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                pricingType === "free" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {totalFreeCount}
            </span>
          </button>
        </div>

        {/* Global Empty State if search yields no results across active view */}
        {totalResults === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/80 p-8 max-w-lg mx-auto shadow-xs">
            <FiBookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No courses found</h3>
            <p className="text-xs text-gray-500 mt-1">
              {searchQuery ? `No courses match "${searchQuery}".` : "No courses published in this section yet."}
            </p>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1: PAID / PRO COURSES (पेड कोर्सेज)                               */}
        {/* ========================================================================= */}
        {(pricingType === "all" || pricingType === "paid") && paidFiltered.length > 0 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/70 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <FiAward className="text-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950">
                      Paid & Pro Batches
                    </h2>
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      पेड कोर्सेज ({paidFiltered.length})
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Comprehensive masterclasses with live classroom access, PDF notes, and test series.
                  </p>
                </div>
              </div>

              {pricingType === "all" && (
                <button
                  onClick={() => handlePricingChange("paid")}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 hover:underline cursor-pointer"
                >
                  Focus Paid Only →
                </button>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paidFiltered.map((item, index) => (
                <Card
                  key={item._id || index}
                  thumbnail={item.thumbnail}
                  title={item.title}
                  price={item.price}
                  category={item.category}
                  id={item._id}
                  level={item.level}
                  isFree={false}
                />
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: FREE FOUNDATION COURSES (फ्री कोर्सेज)                         */}
        {/* ========================================================================= */}
        {(pricingType === "all" || pricingType === "free") && freeFiltered.length > 0 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200/70 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <FiGift className="text-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950">
                      Free Foundation Courses
                    </h2>
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      फ्री कोर्सेज ({freeFiltered.length})
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    High quality foundation courses completely free for all students.
                  </p>
                </div>
              </div>

              {pricingType === "all" && (
                <button
                  onClick={() => handlePricingChange("free")}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                >
                  Focus Free Only →
                </button>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {freeFiltered.map((item, index) => (
                <Card
                  key={item._id || index}
                  thumbnail={item.thumbnail}
                  title={item.title}
                  price={0}
                  category={item.category}
                  id={item._id}
                  level={item.level}
                  isFree={true}
                />
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default AllCourses;
