import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import {
  FaArrowLeftLong,
  FaTrophy,
  FaCheck,
  FaXmark,
  FaClock,
  FaRotateRight,
  FaLightbulb,
  FaCircleCheck,
  FaCircleXmark,
  FaMinus,
  FaGraduationCap
} from 'react-icons/fa6';

function TestResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${serverUrl}/api/mocktest/result/${attemptId}`, {
          withCredentials: true,
        });
        setResult(res.data?.attempt);
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || 'Failed to load test results');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <ClipLoader color="#6366f1" size={48} />
        <p className="mt-4 text-sm text-slate-400">Calculating your performance scorecard...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <h2 className="text-xl font-bold mb-2">Scorecard Not Found</h2>
        <p className="text-slate-400 text-sm mb-4">We could not locate this test attempt result.</p>
        <button
          onClick={() => navigate('/enrolledcourses')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-sm"
        >
          Go to My Learning
        </button>
      </div>
    );
  }

  const formatSeconds = (secs) => {
    if (!secs) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-all group"
          >
            <FaArrowLeftLong className="group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FaGraduationCap className="text-indigo-400 text-sm" />
            <span>{result.courseTitle}</span>
          </div>
        </div>

        {/* Hero Scorecard Banner */}
        <div
          className={`rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden transition-all ${
            result.isPassed
              ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-950 border-emerald-500/30'
              : 'bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-950 border-amber-500/30'
          }`}
        >
          {/* Subtle Glow */}
          <div
            className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 ${
              result.isPassed ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
                {result.isPassed ? (
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <FaTrophy className="text-amber-400" /> Passed Assessment
                  </span>
                ) : (
                  <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full flex items-center gap-1.5">
                    Needs Improvement
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {result.testTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md">
                {result.isPassed
                  ? 'Outstanding performance! You have demonstrated strong mastery over the core concepts.'
                  : `You scored ${result.percentage}%. The passing threshold is ${result.passingScorePercent}%. Review your incorrect answers below and try again!`}
              </p>
            </div>

            {/* Circular Percentage Card */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner min-w-[160px]">
              <div
                className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
                  result.isPassed ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {result.percentage}%
              </div>
              <div className="text-xs font-semibold text-slate-400 mt-1">
                {result.score} / {result.totalMarks} Marks
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800/80 relative z-10">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5 mb-1">
                <FaCircleCheck className="text-emerald-400 text-xs" /> Correct
              </div>
              <div className="text-lg font-bold text-white">{result.correctCount}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5 mb-1">
                <FaCircleXmark className="text-rose-400 text-xs" /> Incorrect
              </div>
              <div className="text-lg font-bold text-white">{result.wrongCount}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5 mb-1">
                <FaMinus className="text-slate-400 text-xs" /> Skipped
              </div>
              <div className="text-lg font-bold text-white">{result.skippedCount}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5 mb-1">
                <FaClock className="text-indigo-400 text-xs" /> Time Taken
              </div>
              <div className="text-lg font-bold text-white">
                {formatSeconds(result.timeTakenSeconds)}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Solutions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Solution & Answer Breakdown</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {result.totalQuestions} Questions
              </span>
            </h2>
            <span className="text-xs text-slate-400">All questions with verified solutions</span>
          </div>

          <div className="space-y-4">
            {result.breakdown?.map((item) => {
              const isCorrect = item.isCorrect;
              const isSkipped = item.selectedOption === -1;

              let statusBorder = 'border-slate-800';
              let badge = (
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold flex items-center gap-1">
                  <FaMinus className="text-[10px]" /> Skipped (0 pts)
                </span>
              );

              if (isCorrect) {
                statusBorder = 'border-emerald-500/30 bg-emerald-950/5';
                badge = (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <FaCheck className="text-[10px]" /> Correct (+{item.pointsAwarded} pt)
                  </span>
                );
              } else if (!isSkipped) {
                statusBorder = 'border-rose-500/30 bg-rose-950/5';
                badge = (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1">
                    <FaXmark className="text-[10px]" /> Incorrect (0 pts)
                  </span>
                );
              }

              return (
                <div
                  key={item.questionNumber}
                  className={`p-6 rounded-2xl bg-slate-900/60 border ${statusBorder} shadow-sm space-y-4`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                        Question {item.questionNumber}
                      </span>
                      <h3 className="text-base font-semibold text-slate-100">
                        {item.questionText}
                      </h3>
                    </div>
                    <div>{badge}</div>
                  </div>

                  {/* 4 Choices */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {item.options?.map((opt, optIdx) => {
                      const isUserChoice = item.selectedOption === optIdx;
                      const isCorrectAnswer = item.correctOptionIndex === optIdx;

                      let optClass = 'bg-slate-950/60 border-slate-800/80 text-slate-400';
                      let chip = null;

                      if (isCorrectAnswer) {
                        optClass =
                          'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-semibold ring-1 ring-emerald-500/30';
                        chip = (
                          <span className="ml-auto text-[10px] uppercase font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                            Correct Answer
                          </span>
                        );
                      } else if (isUserChoice && !isCorrect) {
                        optClass =
                          'bg-rose-500/15 border-rose-500/50 text-rose-300 font-semibold ring-1 ring-rose-500/30';
                        chip = (
                          <span className="ml-auto text-[10px] uppercase font-bold bg-rose-500 text-white px-2 py-0.5 rounded">
                            Your Choice
                          </span>
                        );
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border flex items-center gap-3 text-xs ${optClass}`}
                        >
                          <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {chip}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Note */}
                  {item.explanation && (
                    <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-300 flex items-start gap-2.5">
                      <FaLightbulb className="text-amber-400 shrink-0 mt-0.5 text-sm" />
                      <div>
                        <strong className="text-indigo-200 block mb-0.5">Explanation:</strong>
                        <span>{item.explanation}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestResultPage;
