import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { FaArrowLeftLong, FaPaperPlane, FaUserTie, FaGraduationCap } from 'react-icons/fa6';
import { BsDot } from 'react-icons/bs';
import { useSelector } from 'react-redux';

function LiveClassRoom() {
  const { courseId, liveClassId } = useParams();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const chatEndRef = useRef(null);

  // 1. Fetch live class data & chat messages
  const fetchLiveClass = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await axios.get(`${serverUrl}/api/live/${liveClassId}`, { withCredentials: true });
      setLiveClass(res.data);
      setChatMessages(res.data.chatMessages || []);
    } catch (err) {
      console.error(err);
      if (!silent) {
        toast.error(err?.response?.data?.message || 'Failed to connect to Live Classroom');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveClass(false);

    // Poll for new chat messages & status update every 2.5 seconds
    const interval = setInterval(() => {
      fetchLiveClass(true);
    }, 2500);

    return () => clearInterval(interval);
  }, [liveClassId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 2. Send Chat Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendingMessage) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setSendingMessage(true);

    try {
      const res = await axios.post(
        `${serverUrl}/api/live/${liveClassId}/chat`,
        { message: messageText },
        { withCredentials: true }
      );

      // Optimistic append
      setChatMessages((prev) => [...prev, res.data.chatMessage]);
    } catch (err) {
      console.error(err);
      toast.error('Could not send message');
      setInputMessage(messageText); // restore input on error
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-3">
        <ClipLoader size={45} color="#ef4444" />
        <p className="text-gray-400 text-sm">Entering Live Classroom...</p>
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white gap-4 p-4">
        <h2 className="text-2xl font-bold">Classroom Not Found</h2>
        <button
          onClick={() => navigate(`/viewcourse/${courseId}`)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          Back to Course
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Top Navbar */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <FaArrowLeftLong
            className="text-gray-400 hover:text-white cursor-pointer w-5 h-5 transition"
            onClick={() => navigate(`/viewcourse/${courseId}`)}
            title="Back to Course"
          />
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center ${
                  liveClass.status === 'live'
                    ? 'bg-red-600/20 text-red-500 border border-red-500/30'
                    : liveClass.status === 'scheduled'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'bg-neutral-800 text-gray-400 border border-neutral-700'
                }`}
              >
                {liveClass.status === 'live' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-ping"></span>
                    LIVE NOW
                  </>
                ) : liveClass.status === 'scheduled' ? (
                  'SCHEDULED'
                ) : (
                  'CLASS ENDED (REPLAY)'
                )}
              </span>
              <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {liveClass.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Instructor Info */}
        <div className="flex items-center gap-2">
          {liveClass.creator?.photoUrl ? (
            <img
              src={liveClass.creator.photoUrl}
              alt="Instructor"
              className="w-8 h-8 rounded-full object-cover border border-neutral-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs">
              <FaUserTie className="text-gray-300" />
            </div>
          )}
          <span className="text-xs text-gray-300 hidden sm:inline">
            {liveClass.creator?.name || 'Educator'}
          </span>
        </div>
      </header>

      {/* Main Classroom Layout (Video Left + Chat Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Side: Video Stream Player & Info */}
        <div className="flex-1 flex flex-col bg-black overflow-y-auto">
          {/* YouTube Embed Player (16:9 Aspect Ratio) */}
          <div className="w-full aspect-video bg-black relative flex items-center justify-center">
            {liveClass.youtubeVideoId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${liveClass.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                title={liveClass.title}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="text-gray-500 text-sm">No Stream Feed Available</div>
            )}
          </div>

          {/* Under-Video Details */}
          <div className="p-4 sm:p-6 space-y-3 bg-neutral-900/50 border-t border-neutral-800 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white">{liveClass.title}</h2>
              <span className="text-xs text-gray-400 bg-neutral-800 px-3 py-1 rounded-full w-fit">
                {new Date(liveClass.scheduledAt).toLocaleString()}
              </span>
            </div>

            {liveClass.description && (
              <p className="text-sm text-gray-300 leading-relaxed bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                {liveClass.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-neutral-800">
              <span className="flex items-center gap-1">
                <BsDot className="text-green-500 text-2xl" /> Unlisted HD Stream
              </span>
              <span>• Zero Latency</span>
              <span>• Auto-Saved Recording</span>
            </div>
          </div>
        </div>

        {/* Right Side: In-App Live Chat */}
        <div className="w-full lg:w-96 h-[450px] lg:h-auto bg-neutral-900 border-t lg:border-t-0 lg:border-l border-neutral-800 flex flex-col">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Live Discussion</span>
              <span className="text-[10px] bg-red-600/20 text-red-400 font-semibold px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <span className="text-xs text-gray-400">{chatMessages.length} messages</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-sm">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs text-center px-4">
                <p>Welcome to the live chat!</p>
                <p className="mt-1">Ask questions or share your thoughts with the instructor.</p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => {
                const isInstructor = msg.senderRole === 'educator';
                const isMe = msg.senderId === userData?._id;

                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[11px] font-semibold ${isInstructor ? 'text-amber-400 font-bold' : isMe ? 'text-blue-400' : 'text-gray-300'}`}>
                        {msg.senderName}
                      </span>
                      {isInstructor && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                          Teacher
                        </span>
                      )}
                      <span className="text-[10px] text-gray-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs sm:text-sm break-words ${
                        isInstructor
                          ? 'bg-amber-950/40 border border-amber-500/30 text-amber-100 rounded-tl-sm'
                          : isMe
                          ? 'bg-red-600 text-white rounded-tr-sm'
                          : 'bg-neutral-800 text-gray-200 rounded-tl-sm'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-800 bg-neutral-900 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask a question or comment..."
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-full px-4 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              maxLength={300}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || sendingMessage}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer shrink-0"
              title="Send Message"
            >
              <FaPaperPlane className="text-xs" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default LiveClassRoom;
