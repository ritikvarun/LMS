import React from 'react';

function Logo({
  showText = true,
  iconSize = "w-10 h-10",
  tagline = "Engineering Academy",
  dark = false,
  className = ""
}) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* SVG Icon Tile */}
      <div className={`${iconSize} rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-[1.5px] shadow-sm shrink-0 flex items-center justify-center transition-transform duration-200 hover:scale-105`}>
        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center p-1.5 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />
          
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Left Bracket */}
            <path
              d="M17 14L8 24L17 34"
              stroke="#818CF8"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Center Code Slash */}
            <path
              d="M27 12L21 36"
              stroke="#FDE047"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Right Bracket */}
            <path
              d="M31 14L40 24L31 34"
              stroke="#F43F5E"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Tech Spark Dot */}
            <circle cx="39" cy="11" r="2.5" fill="#38BDF8" />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-extrabold text-lg sm:text-xl tracking-tight leading-none ${
            dark ? "text-white" : "text-gray-900"
          }`}>
            Code<span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Crafters</span>
          </span>
          {tagline && (
            <span className={`text-[9.5px] font-bold tracking-wider uppercase mt-1 ${
              dark ? "text-indigo-300/80" : "text-gray-400"
            }`}>
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Logo;
