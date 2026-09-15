import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { FaArrowLeftLong, FaVideo, FaTrash, FaPlay, FaStop, FaClock } from 'react-icons/fa6';
import { SiYoutube } from 'react-icons/si';

function ManageLiveClasses() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  // Fetch Course details and existing live classes
  const fetchClasses = async () => {
    try {
      setFetching(true);
      // Fetch course info
      const courseRes = await axios.get(`${serverUrl}/api/course/getcourse/${courseId}`, { withCredentials: true });
      setCourse(courseRes.data);

      // Fetch live classes
      const res = await axios.get(`${serverUrl}/api/live/course/${courseId}`, { withCredentials: true });
      setClasses(res.data);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to load live classes');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [courseId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !youtubeUrl.trim()) {
      toast.error('Title and YouTube Link are required');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/live/create/${courseId}`,
        {
          title,
          description,
          youtubeUrl,
          scheduledAt: scheduledAt || new Date().toISOString()
        },
        { withCredentials: true }
      );

      toast.success('Live Class Scheduled Successfully!');
      setClasses([res.data, ...classes]);
      setTitle('');
      setDescription('');
      setYoutubeUrl('');
      setScheduledAt('');
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to schedule class');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (liveClassId, newStatus) => {
    try {
      const res = await axios.patch(
        `${serverUrl}/api/live/${liveClassId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(`Class marked as ${newStatus.toUpperCase()}`);
      setClasses(classes.map(c => c._id === liveClassId ? { ...c, status: newStatus } : c));
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (liveClassId) => {
    if (!window.confirm('Are you sure you want to delete this live class session?')) return;
    try {
      await axios.delete(`${serverUrl}/api/live/${liveClassId}`, { withCredentials: true });
      toast.success('Live Class Deleted');
      setClasses(classes.filter(c => c._id !== liveClassId));
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to delete class');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <FaArrowLeftLong
              className="text-gray-700 w-5 h-5 cursor-pointer hover:text-black transition"
              onClick={() => navigate(`/addcourses/${courseId}`)}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaVideo className="text-red-600" /> Manage Live Classes
              </h1>
              <p className="text-sm text-gray-500">Course: <span className="font-semibold text-gray-700">{course?.title}</span></p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/addcourses/${courseId}`)}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition"
          >
            Back to Course
          </button>
        </div>

        {/* Schedule Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-gray-200 space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <SiYoutube className="text-red-600 text-xl" /> Schedule New YouTube Live Session
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Start an <strong>Unlisted</strong> live stream on YouTube and paste its link below. Only enrolled students in this course can join!
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Class Title *</label>
              <input
                type="text"
                placeholder="e.g. MERN Stack Live Doubt Session & Revision"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">YouTube Live / Video Link *</label>
              <input
                type="text"
                placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                required
              />
              <p className="text-xs text-gray-400 mt-1">Paste any full YouTube link or an 11-digit Video ID.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Scheduled Date & Time (Optional)</label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Short Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Topics to cover, prerequisites..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-lg text-sm shadow transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <ClipLoader size={20} color="white" /> : '+ Schedule Live Class'}
            </button>
          </form>
        </div>

        {/* Existing Classes List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">All Live Sessions for this Course</h2>

          {fetching ? (
            <div className="flex justify-center p-12">
              <ClipLoader size={35} color="#000" />
            </div>
          ) : classes.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-gray-200 text-gray-500">
              No live classes scheduled yet. Create your first live class above!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {classes.map((cls) => (
                <div
                  key={cls._id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                          cls.status === 'live'
                            ? 'bg-red-100 text-red-600 animate-pulse'
                            : cls.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {cls.status === 'live' ? '🔴 LIVE NOW' : cls.status === 'scheduled' ? '🕒 SCHEDULED' : '⏹️ ENDED'}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FaClock /> {new Date(cls.scheduledAt).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">{cls.title}</h3>
                    {cls.description && <p className="text-sm text-gray-600">{cls.description}</p>}
                    <p className="text-xs text-gray-400">YouTube Video ID: <code className="bg-gray-100 px-1 py-0.5 rounded">{cls.youtubeVideoId}</code></p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status toggles */}
                    {cls.status !== 'live' && (
                      <button
                        onClick={() => handleStatusChange(cls._id, 'live')}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        <FaPlay className="text-[10px]" /> Go Live
                      </button>
                    )}

                    {cls.status === 'live' && (
                      <button
                        onClick={() => handleStatusChange(cls._id, 'ended')}
                        className="bg-gray-800 hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        <FaStop className="text-[10px]" /> End Class
                      </button>
                    )}

                    {/* Join / Preview Classroom */}
                    <button
                      onClick={() => navigate(`/live/${courseId}/${cls._id}`)}
                      className="border border-black text-black hover:bg-black hover:text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                    >
                      Enter Classroom
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(cls._id)}
                      className="text-red-500 hover:text-red-700 p-2 text-sm cursor-pointer"
                      title="Delete Live Class"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ManageLiveClasses;
