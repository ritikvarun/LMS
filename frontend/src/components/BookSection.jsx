import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { FiBook, FiExternalLink, FiShoppingCart, FiTag, FiUser } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

function BookSection() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/book/all`);
        if (res.data?.success && res.data.books?.length > 0) {
          setBooks(res.data.books);
        }
      } catch (err) {
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50/50 to-white border-t border-gray-100 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100/60 mb-3">
              <HiSparkles className="text-indigo-500" />
              <span>Recommended Reading</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              Essential Tech & Coding Books
            </h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-2xl mt-3 leading-relaxed">
              Curated masterclasses and engineering classics recommended by industry leaders. Level up your system architecture, problem-solving, and clean coding practices.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto text-xs font-semibold text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-xs shrink-0">
            <FiBook className="text-indigo-600 text-sm" />
            <span>{books.length} Books Handpicked</span>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="w-full max-w-sm rounded-2xl bg-white border border-gray-100 p-5 shadow-xs animate-pulse"
              >
                <div className="w-full aspect-[3/4] bg-gray-200 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-10 bg-gray-200 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {books.map((book) => (
              <div
                key={book._id}
                className="group w-full max-w-sm bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Top: Book Cover Artwork Display */}
                <div className="relative p-6 pb-4 bg-gradient-to-b from-gray-50 to-white flex justify-center items-center overflow-hidden">
                  <div className="relative w-44 sm:w-48 aspect-[3/4] rounded-xl overflow-hidden shadow-xl border border-gray-200/60 group-hover:scale-105 transition-transform duration-300 bg-slate-900">
                    {/* Simulated Book Spine 3D Lighting Effect */}
                    <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/40 via-white/10 to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 left-3 w-px bg-white/20 z-10 pointer-events-none" />

                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80";
                      }}
                    />

                    {/* Category pill on cover */}
                    {book.category && (
                      <span className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white tracking-wide uppercase">
                        {book.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle: Info & Description */}
                <div className="p-5 sm:p-6 pt-2 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Price & Author line */}
                    <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                      {book.author && (
                        <div className="flex items-center gap-1.5 text-gray-500 font-medium truncate">
                          <FiUser className="text-indigo-600 shrink-0 text-xs" />
                          <span className="truncate">{book.author}</span>
                        </div>
                      )}

                      {book.price && (
                        <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 text-xs shrink-0">
                          {book.price}
                        </span>
                      )}
                    </div>

                    {/* Book Title */}
                    <h3 className="font-extrabold text-base sm:text-lg text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                      {book.title}
                    </h3>

                    {/* Book Description Snippet */}
                    {book.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                  </div>

                  {/* Buy Button */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <a
                      href={book.buyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group/btn"
                    >
                      <FiShoppingCart className="text-sm group-hover/btn:scale-110 transition-transform" />
                      <span>Buy Book</span>
                      <FiExternalLink className="text-xs text-gray-400 group-hover/btn:text-white transition-colors ml-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 max-w-lg mx-auto">
            <FiBook className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 text-base font-semibold">No books added yet.</p>
            <p className="text-gray-400 text-xs mt-1">Admin can add recommended books from the Studio panel!</p>
          </div>
        )}

      </div>
    </section>
  );
}

export default BookSection;
