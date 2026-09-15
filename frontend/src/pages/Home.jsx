import React from 'react';
import Nav from '../components/Nav';
import { SiViaplay } from "react-icons/si";
import { FiCheckCircle, FiTrendingUp, FiVideo } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import Cardspage from '../components/Cardspage';
import BookSection from '../components/BookSection';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Modern Sticky Navigation */}
      <Nav />

      {/* Hero Section */}
      <section className="relative pt-[100px] lg:pt-[120px] pb-16 lg:pb-24 bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] sm:w-[800px] h-[300px] bg-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute -top-10 right-10 w-[300px] h-[300px] bg-purple-600/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs sm:text-sm font-semibold text-indigo-300 backdrop-blur-md mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <HiSparkles className="text-indigo-400" />
            <span>Next-Gen Engineering Learning Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.15] mb-6">
            Grow Your Skills to Advance Your{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Career Path
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl font-light mb-8 leading-relaxed">
            Discover in-depth courses taught by industry veterans. Experience high-definition streaming, interactive live classrooms, and project-based engineering.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap mb-10">
            <button
              onClick={() => navigate("/allcourses")}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2.5 cursor-pointer text-sm sm:text-base"
            >
              <span>Explore All Courses</span>
              <SiViaplay className="text-lg" />
            </button>
          </div>

          {/* Quick Highlights */}
          <div className="flex items-center justify-center gap-6 text-xs sm:text-sm text-gray-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <FiCheckCircle className="text-emerald-400" /> Lifetime Course Access
            </span>
            <span className="flex items-center gap-1.5">
              <FiVideo className="text-indigo-400" /> Interactive Live Classes
            </span>
            <span className="flex items-center gap-1.5">
              <FiTrendingUp className="text-purple-400" /> Project-Based Learning
            </span>
          </div>

        </div>
      </section>

      {/* Popular Courses Carousel / Grid */}
      <Cardspage />

      {/* Recommended Books Section */}
      <BookSection />

      {/* Contact Form Section */}
      <ContactForm />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;
