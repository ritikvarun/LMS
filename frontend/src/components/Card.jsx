import React from "react";
import { FiArrowUpRight, FiBookOpen } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import emptyImg from "../assets/empty.jpg";

const CourseCard = ({ thumbnail, title, category, price, id, level, isFree: isFreeProp }) => {
  const navigate = useNavigate();

  const isFree = isFreeProp === true || isFreeProp === "true" || !price || Number(price) <= 0;

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer max-w-sm w-full"
      onClick={() => navigate(isFree ? `/freecourse/${id}` : `/viewcourse/${id}`)}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        <img
          src={thumbnail || emptyImg}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Floating Category Badge */}
        {category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide uppercase rounded-md shadow-xs">
            {category}
          </span>
        )}

        {/* Free vs Paid Top Right Badge */}
        {isFree ? (
          <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-extrabold tracking-wider uppercase rounded-md shadow-xs">
            FREE
          </span>
        ) : (
          <span className="absolute top-3 right-3 px-2.5 py-1 bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-extrabold tracking-wider uppercase rounded-md shadow-xs">
            PRO
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col justify-between flex-grow space-y-3">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>

        {/* Level / Category Meta */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold">
            {level || "All Levels"}
          </span>
          <span>•</span>
          <span className="text-gray-500 truncate">{category || "Comprehensive Batch"}</span>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          {isFree ? (
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                FREE
              </span>
              <span className="text-xs text-gray-400 font-medium">100% Free</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-gray-900">
                ₹{price}
              </span>
              <span className="text-xs text-gray-400 line-through">
                ₹{Number(price) + 400}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
            <span>Details</span>
            <FiArrowUpRight className="text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
