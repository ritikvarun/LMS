import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../../App';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';
import { 
  FiBook, 
  FiPlus, 
  FiExternalLink, 
  FiTrash2, 
  FiUploadCloud, 
  FiLink, 
  FiDollarSign, 
  FiUser, 
  FiTag,
  FiX,
  FiCheckCircle,
  FiSearch
} from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';

function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [buyLink, setBuyLink] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  
  // Image handling (supports both file upload & direct URL)
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadMode, setUploadMode] = useState("file"); // 'file' or 'url'

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/book/all`);
      if (res.data?.success) {
        setBooks(res.data.books || []);
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    setImageUrl("");
  };

  const handleAddBook = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.warn("Please enter book title");
      return;
    }

    if (!buyLink.trim()) {
      toast.warn("Please provide a valid Buy Link");
      return;
    }

    if (uploadMode === "file" && !imageFile && !imagePreview) {
      toast.warn("Please select a book photo/cover file");
      return;
    }

    if (uploadMode === "url" && !imageUrl.trim()) {
      toast.warn("Please provide an image URL for the book");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("buyLink", buyLink.trim());
      if (author.trim()) formData.append("author", author.trim());
      if (price.trim()) formData.append("price", price.trim());
      if (category.trim()) formData.append("category", category.trim());
      if (description.trim()) formData.append("description", description.trim());

      if (uploadMode === "file" && imageFile) {
        formData.append("image", imageFile);
      } else {
        formData.append("image", imageUrl.trim());
      }

      const res = await axios.post(`${serverUrl}/api/book/add`, formData, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Book added successfully!");
        // Reset form
        setTitle("");
        setBuyLink("");
        setAuthor("");
        setPrice("");
        setCategory("");
        setDescription("");
        clearImage();
        // Refresh list
        fetchBooks();
      }
    } catch (err) {
      console.error("Error adding book:", err);
      toast.error(err.response?.data?.message || "Failed to add book");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = async (id, bookTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${bookTitle}"?`)) {
      return;
    }

    try {
      const res = await axios.delete(`${serverUrl}/api/book/${id}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        toast.success("Book deleted successfully");
        setBooks(books.filter((b) => b._id !== id));
      }
    } catch (err) {
      console.error("Error deleting book:", err);
      toast.error(err.response?.data?.message || "Failed to delete book");
    }
  };

  const filteredBooks = books.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout activeTab="books">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">
              Recommended Books Studio
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-2">
              Manage Recommended Books
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Add books with cover photo and purchase link to showcase in the Home page book section.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-xs self-start sm:self-auto">
            <FiBook className="text-indigo-600 text-sm" />
            <span>{books.length} Total Books</span>
          </div>
        </div>

        {/* Add Book Form Card */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FiPlus className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Add New Book</h2>
              <p className="text-xs text-gray-400">Specify book photo, title, and buy link</p>
            </div>
          </div>

          <form onSubmit={handleAddBook} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Title & Buy Link */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Book Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clean Code: A Handbook of Agile Software Craftsmanship"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Buy Link (Amazon / Store URL) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <FiLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="url"
                      required
                      placeholder="https://www.amazon.in/dp/..."
                      value={buyLink}
                      onChange={(e) => setBuyLink(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Author Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Robert C. Martin"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Price / Currency
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹699 or $34.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Category Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. System Design, DSA"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Short Description
                    </label>
                    <input
                      type="text"
                      placeholder="Short recommendation summary"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Book Cover Photo */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Book Photo / Cover <span className="text-rose-500">*</span>
                  </label>

                  {/* Toggle Mode */}
                  <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setUploadMode("file")}
                      className={`px-2.5 py-1 rounded-md transition ${
                        uploadMode === "file"
                          ? "bg-white text-indigo-600 shadow-xs font-bold"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode("url")}
                      className={`px-2.5 py-1 rounded-md transition ${
                        uploadMode === "url"
                          ? "bg-white text-indigo-600 shadow-xs font-bold"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {uploadMode === "file" ? (
                  <div className="relative">
                    {imagePreview ? (
                      <div className="relative w-full h-44 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/20 p-2 flex items-center justify-center">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full max-w-[140px] object-cover rounded-xl shadow-md border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition shadow-xs"
                          title="Remove image"
                        >
                          <FiX className="text-sm" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-44 rounded-2xl border-2 border-dashed border-gray-300 hover:border-indigo-400 bg-gray-50/60 hover:bg-indigo-50/20 transition flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center">
                        <div className="p-3 rounded-xl bg-white shadow-xs text-indigo-600">
                          <FiUploadCloud className="text-xl" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">
                            Click to upload book cover
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            PNG, JPG, WEBP up to 10MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="url"
                      placeholder="Paste image web address (https://...)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm outline-none transition"
                    />

                    {imageUrl && (
                      <div className="w-full h-36 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center p-2">
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="h-full max-w-[120px] object-cover rounded-xl shadow-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <ClipLoader size={16} color="#ffffff" />
                    <span>Adding Book...</span>
                  </>
                ) : (
                  <>
                    <FiPlus className="text-base" />
                    <span>Publish Book</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Books List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Current Recommended Books ({filteredBooks.length})
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                These books are currently displayed in the home page book section.
              </p>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-gray-200 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <ClipLoader size={30} color="#4f46e5" />
              <p className="text-xs text-gray-400">Loading books...</p>
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBooks.map((book) => (
                <div
                  key={book._id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs hover:shadow-md transition-all flex gap-4 items-start"
                >
                  {/* Book Cover Thumbnail */}
                  <div className="relative w-20 aspect-[3/4] rounded-lg overflow-hidden bg-slate-900 shadow-md shrink-0 border border-gray-200">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                    <div>
                      {book.category && (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {book.category}
                        </span>
                      )}

                      <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mt-1 leading-snug">
                        {book.title}
                      </h3>

                      {book.author && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          By {book.author}
                        </p>
                      )}

                      {book.price && (
                        <p className="text-xs font-extrabold text-emerald-600 mt-1">
                          {book.price}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                      <a
                        href={book.buyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition"
                      >
                        <span>Test Buy Link</span>
                        <FiExternalLink className="text-[10px]" />
                      </a>

                      <button
                        onClick={() => handleDeleteBook(book._id, book.title)}
                        className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Book"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 bg-white rounded-2xl border border-gray-200 text-center p-6">
              <FiBook className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No books found</p>
              <p className="text-xs text-gray-400 mt-0.5">Use the form above to add books</p>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}

export default ManageBooks;
