import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import {
  FaClock,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaBookmark,
  FaRotateLeft,
  FaTriangleExclamation,
  FaPaperPlane,
} from 'react-icons/fa6';

function MockTestRoom() {
  const { courseId, testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Active question index (0-indexed)
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers Map: { [questionId]: selectedOptionIndex (0-3) }
  const [answers, setAnswers] = useState({});

  // Marked for Review Set of questionIds
  const [markedForReview, setMarkedForReview] = useState(new Set());

  // Timer State (in seconds)
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const timerRef = useRef(null);
  const autoSubmittedRef = useRef(false);

  // 1. Fetch Test Details
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${serverUrl}/api/mocktest/exam/${testId}`, {
          withCredentials: true,
        });

        const examData = res.data?.test;
        setTest(examData);

        const durationSeconds = (examData?.timeLimitMinutes || 20) * 60;
        setSecondsLeft(durationSeconds);
        setTotalSeconds(durationSeconds);
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || 'Failed to load test');
        navigate(`/viewcourse/${courseId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [testId, courseId, navigate]);

  // 2. Countdown Timer
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!autoSubmittedRef.current) {
            autoSubmittedRef.current = true;
            toast.warn('⏰ Time is up! Submitting exam automatically...');
            handleFinalSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [secondsLeft]);

  // Format MM:SS
  const formatTime = (secs) => {
    if (secs === null || secs === undefined) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Option selection
  const handleSelectOption = (qId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionIndex,
    }));
  };

  // Clear current question choice
  const handleClearChoice = (qId) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  // Toggle Marked for review
  const handleToggleReview = (qId) => {
    setMarkedForReview((prev) => {
      const copy = new Set(prev);
      if (copy.has(qId)) {
        copy.delete(qId);
      } else {
        copy.add(qId);
      }
      return copy;
    });
  };

  // Submit Attempt
  const handleFinalSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // Prepare payload
      const formattedAnswers = test.questions.map((q) => ({
        questionId: q._id,
        selectedOption: answers[q._id] !== undefined ? answers[q._id] : -1,
      }));

      const timeTaken = totalSeconds - (secondsLeft || 0);

      const res = await axios.post(
        `${serverUrl}/api/mocktest/submit/${testId}`,
        {
          answers: formattedAnswers,
          timeTakenSeconds: timeTaken,
        },
        { withCredentials: true }
      );

      const attemptId = res.data?.attemptId;
      toast.success(res.data?.message || 'Test submitted successfully!');
      navigate(`/test-result/${attemptId}`);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to submit test');
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  if (loading || !test) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <ClipLoader color="#6366f1" size={48} />
        <p className="mt-4 text-sm text-slate-400">Preparing Exam Environment...</p>
      </div>
    );
  }

  const currentQ = test.questions[currentIndex];
  const isLastQuestion = currentIndex === test.questions.length - 1;
  const currentSelected = answers[currentQ._id];
  const isCurrentMarked = markedForReview.has(currentQ._id);

  // Status counters for question palette
  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.size;
  const totalQuestions = test.questions.length;
  const isUrgent = secondsLeft !== null && secondsLeft < 120; // under 2 mins

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* Top Fixed Header */}
      <header className="bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-30 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">
            Online Examination
          </span>
          <h1 className="text-base sm:text-lg font-bold text-white truncate max-w-xs sm:max-w-md">
            {test.title}
          </h1>
        </div>

        {/* Center Countdown Timer */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${
            isUrgent
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
              : 'bg-slate-800/80 border-slate-700/80 text-white'
          }`}
        >
          <FaClock className={isUrgent ? 'text-rose-400' : 'text-indigo-400'} />
          <span className="font-mono text-base sm:text-lg font-bold">
            {formatTime(secondsLeft)}
          </span>
        </div>

        {/* Submit Action */}
        <div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <FaPaperPlane />
            <span>Submit Exam</span>
          </button>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center: Question Panel (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl relative min-h-[550px]">
          <div>
            {/* Question Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                {isCurrentMarked && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                    <FaBookmark className="text-[10px]" /> Review Later
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Points: +{currentQ.points || 1} Mark
              </span>
            </div>

            {/* Question Text */}
            <div className="text-lg sm:text-xl font-medium text-slate-100 leading-relaxed mb-8">
              {currentQ.questionText}
            </div>

            {/* 4 Options */}
            <div className="space-y-3.5">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = currentSelected === optIdx;
                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ._id, optIdx)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200 group ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span
                      className={`text-sm sm:text-base flex-1 ${
                        isSelected ? 'text-white font-medium' : 'text-slate-300'
                      }`}
                    >
                      {opt}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500 text-white'
                          : 'border-slate-700 group-hover:border-slate-500'
                      }`}
                    >
                      {isSelected && <FaCheck className="text-[10px]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question Navigation Controls */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 mt-8">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleReview(currentQ._id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  isCurrentMarked
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800/70 border-slate-700/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FaBookmark className="text-xs" />
                <span>{isCurrentMarked ? 'Unmark Review' : 'Mark for Review'}</span>
              </button>

              {currentSelected !== undefined && (
                <button
                  type="button"
                  onClick={() => handleClearChoice(currentQ._id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800/70 border border-slate-700/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <FaRotateLeft className="text-xs" />
                  <span>Clear Choice</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaArrowLeft className="text-xs" />
                <span>Previous</span>
              </button>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
                >
                  <span>Review & Submit</span>
                  <FaPaperPlane className="text-xs" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition-all"
                >
                  <span>Save & Next</span>
                  <FaArrowRight className="text-xs" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Question Palette Grid (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Question Palette
            </h3>

            {/* Quick Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mb-6 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700 shrink-0" />
                <span>Unvisited ({totalQuestions - answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <span>Marked ({markedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
                <span>Current</span>
              </div>
            </div>

            {/* Grid of Question Number Badges */}
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {test.questions.map((q, qIdx) => {
                const isAnswered = answers[q._id] !== undefined;
                const isMarked = markedForReview.has(q._id);
                const isCurrent = currentIndex === qIdx;

                let btnBg = 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700';
                if (isAnswered && isMarked) {
                  btnBg = 'bg-purple-600/20 border-purple-500/50 text-purple-300 font-bold';
                } else if (isAnswered) {
                  btnBg = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
                } else if (isMarked) {
                  btnBg = 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold';
                }

                return (
                  <button
                    key={q._id || qIdx}
                    onClick={() => setCurrentIndex(qIdx)}
                    className={`h-11 rounded-xl border flex flex-col items-center justify-center text-xs transition-all relative ${btnBg} ${
                      isCurrent ? 'ring-2 ring-indigo-500 border-indigo-400 font-bold scale-105 shadow-md' : ''
                    }`}
                  >
                    <span>{qIdx + 1}</span>
                    {isMarked && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Guidelines / Safety Note */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-500 space-y-1">
            <p>• Answers are auto-saved in your current session.</p>
            <p>• Timer continues even if you refresh.</p>
            <p>• Test auto-submits when timer hits 00:00.</p>
          </div>
        </div>
      </main>

      {/* CONFIRMATION SUBMIT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fadeIn space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mx-auto">
              <FaPaperPlane />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Ready to Submit Exam?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Please review your progress before final submission:
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <div>
                <div className="text-base font-bold text-emerald-400">{answeredCount}</div>
                <div className="text-[11px] text-slate-400">Answered</div>
              </div>
              <div>
                <div className="text-base font-bold text-amber-400">
                  {totalQuestions - answeredCount}
                </div>
                <div className="text-[11px] text-slate-400">Unanswered</div>
              </div>
              <div>
                <div className="text-base font-bold text-indigo-400">{markedCount}</div>
                <div className="text-[11px] text-slate-400">Marked</div>
              </div>
            </div>

            {totalQuestions - answeredCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <FaTriangleExclamation className="shrink-0" />
                <span>
                  You still have {totalQuestions - answeredCount} unanswered questions!
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Keep Reviewing
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
              >
                {submitting ? <ClipLoader size={14} color="#fff" /> : <FaCheck />}
                <span>{submitting ? 'Submitting...' : 'Yes, Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MockTestRoom;
