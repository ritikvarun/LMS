import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import {
  FaArrowLeftLong,
  FaPlus,
  FaTrash,
  FaCheck,
  FaClock,
  FaFileLines,
  FaWandMagicSparkles,
  FaEye,
  FaChevronDown,
  FaChevronUp,
  FaToggleOn,
  FaToggleOff,
  FaLightbulb
} from 'react-icons/fa6';

function ManageMockTests() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [tests, setTests] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [expandedTestId, setExpandedTestId] = useState(null);

  // Create/Edit Test Modal State
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testTitle, setTestTitle] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20);
  const [passingScorePercent, setPassingScorePercent] = useState(60);
  const [isPublished, setIsPublished] = useState(true);
  const [questions, setQuestions] = useState([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      explanation: '',
      points: 1,
    },
  ]);

  // AI Generator Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState('Intermediate');
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch Course and Mock Tests
  const fetchData = async () => {
    try {
      setFetching(true);
      const courseRes = await axios.get(`${serverUrl}/api/course/getcourse/${courseId}`, {
        withCredentials: true,
      });
      setCourse(courseRes.data);

      const testsRes = await axios.get(`${serverUrl}/api/mocktest/course/${courseId}`, {
        withCredentials: true,
      });
      setTests(testsRes.data?.tests || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to load mock tests');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  // Handle Question Form inputs
  const handleQuestionTextChange = (qIndex, value) => {
    const updated = [...questions];
    updated[qIndex].questionText = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleCorrectOptionChange = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].correctOptionIndex = optIndex;
    setQuestions(updated);
  };

  const handleExplanationChange = (qIndex, value) => {
    const updated = [...questions];
    updated[qIndex].explanation = value;
    setQuestions(updated);
  };

  const handlePointsChange = (qIndex, value) => {
    const updated = [...questions];
    updated[qIndex].points = Math.max(1, parseInt(value, 10) || 1);
    setQuestions(updated);
  };

  const addEmptyQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
        points: 1,
      },
    ]);
  };

  const removeQuestion = (qIndex) => {
    if (questions.length <= 1) {
      toast.warn('At least one question is required');
      return;
    }
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  // AI Generator Handler
  const handleGenerateAi = async (e) => {
    e.preventDefault();
    if (!aiTopic.trim()) {
      toast.error('Please enter a topic to generate questions');
      return;
    }

    setAiLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/mocktest/generate-ai`,
        {
          topic: aiTopic.trim(),
          count: aiCount,
          difficulty: aiDifficulty,
        },
        { withCredentials: true }
      );

      const generated = res.data?.questions || [];
      if (generated.length === 0) {
        toast.error('No questions generated. Please try a different topic.');
        return;
      }

      // If user is currently editing modal, append or replace
      if (showModal) {
        // If current questions are empty, replace; else append
        const isFirstEmpty =
          questions.length === 1 &&
          !questions[0].questionText.trim() &&
          !questions[0].options[0].trim();
        setQuestions(isFirstEmpty ? generated : [...questions, ...generated]);
      } else {
        // Open the create modal pre-filled with generated questions
        setTestTitle(
          `${aiTopic.trim()} Assessment (${aiDifficulty})`
        );
        setTestDescription(`Comprehensive test covering ${aiTopic.trim()} core concepts and practical problem solving.`);
        setQuestions(generated);
        setShowModal(true);
      }

      setShowAiModal(false);
      setAiTopic('');
      toast.success(`✨ Successfully generated ${generated.length} AI questions!`);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to generate questions with AI');
    } finally {
      setAiLoading(false);
    }
  };

  // Submit New Test
  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!testTitle.trim()) {
      toast.error('Test title is required');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1} text is missing`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j] || !q.options[j].trim()) {
          toast.error(`Question ${i + 1} - Option ${j + 1} cannot be empty`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/mocktest/create`,
        {
          courseId,
          title: testTitle.trim(),
          description: testDescription.trim(),
          timeLimitMinutes: Number(timeLimitMinutes) || 20,
          passingScorePercent: Number(passingScorePercent) || 60,
          questions,
          isPublished,
        },
        { withCredentials: true }
      );

      toast.success('Mock Test Created Successfully! 🎉');
      setTests([res.data?.mockTest, ...tests]);
      setShowModal(false);
      resetModal();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to create mock test');
    } finally {
      setSaving(false);
    }
  };

  const resetModal = () => {
    setTestTitle('');
    setTestDescription('');
    setTimeLimitMinutes(20);
    setPassingScorePercent(60);
    setIsPublished(true);
    setQuestions([
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
        points: 1,
      },
    ]);
  };

  // Toggle Publish
  const handleTogglePublish = async (testId) => {
    try {
      const res = await axios.patch(
        `${serverUrl}/api/mocktest/${testId}/toggle-publish`,
        {},
        { withCredentials: true }
      );
      toast.success(res.data?.message || 'Updated status');
      setTests(
        tests.map((t) => (t._id === testId ? { ...t, isPublished: res.data?.isPublished } : t))
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  // Delete Test
  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test? All student attempt history for this test will also be deleted.')) {
      return;
    }

    try {
      await axios.delete(`${serverUrl}/api/mocktest/${testId}`, {
        withCredentials: true,
      });
      toast.success('Test deleted successfully');
      setTests(tests.filter((t) => t._id !== testId));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete test');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 relative">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/addcourses/${courseId}`)}
              className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all shadow-sm group"
              title="Back to Course"
            >
              <FaArrowLeftLong className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Educator Studio
                </span>
                <span className="text-slate-500 text-sm">•</span>
                <span className="text-xs text-slate-400 font-medium">Mock Test & Assessments</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                {course?.title || 'Manage Course Tests'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAiModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 transition-all hover:scale-[1.02] active:scale-95"
            >
              <FaWandMagicSparkles className="text-amber-300" />
              <span>Generate with AI</span>
            </button>
            <button
              onClick={() => {
                resetModal();
                setShowModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <FaPlus />
              <span>Create Test</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs font-medium text-slate-400">Total Assessments</div>
            <div className="text-2xl font-bold text-white mt-1">{tests.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs font-medium text-slate-400">Published Tests</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {tests.filter((t) => t.isPublished).length}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs font-medium text-slate-400">Drafts</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {tests.filter((t) => !t.isPublished).length}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs font-medium text-slate-400">Total Questions</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">
              {tests.reduce((sum, t) => sum + (t.questions?.length || 0), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {fetching ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ClipLoader color="#6366f1" size={40} />
            <p className="text-slate-400 text-sm mt-4">Loading tests...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-20 px-4 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto text-2xl mb-4">
              <FaFileLines />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Mock Tests Created Yet</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Assess your students' knowledge by creating quizzes manually or letting Gemini AI draft questions in seconds!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setShowAiModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-purple-900/30"
              >
                <FaWandMagicSparkles className="text-amber-300" />
                <span>Create with AI</span>
              </button>
              <button
                onClick={() => {
                  resetModal();
                  setShowModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm flex items-center gap-2"
              >
                <FaPlus />
                <span>Create Manually</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => {
              const isExpanded = expandedTestId === test._id;
              return (
                <div
                  key={test._id}
                  className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-md overflow-hidden"
                >
                  {/* Test Summary Row */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-white hover:text-indigo-400 transition-colors">
                          {test.title}
                        </h3>
                        {test.isPublished ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <FaCheck className="text-[10px]" /> Published
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Draft (Hidden)
                          </span>
                        )}
                      </div>
                      {test.description && (
                        <p className="text-sm text-slate-400 max-w-2xl line-clamp-2">
                          {test.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1.5">
                          <FaClock className="text-indigo-400" /> {test.timeLimitMinutes} Mins Duration
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <FaFileLines className="text-purple-400" /> {test.questions?.length || 0} Questions
                        </span>
                        <span>•</span>
                        <span>Passing: {test.passingScorePercent}%</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end lg:self-center">
                      <button
                        onClick={() => handleTogglePublish(test._id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                          test.isPublished
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                        title="Toggle Publish Status"
                      >
                        {test.isPublished ? <FaToggleOn className="text-sm" /> : <FaToggleOff className="text-sm" />}
                        <span>{test.isPublished ? 'Unpublish' : 'Publish'}</span>
                      </button>

                      <button
                        onClick={() => setExpandedTestId(isExpanded ? null : test._id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all"
                      >
                        <FaEye />
                        <span>{isExpanded ? 'Hide Questions' : 'Review Questions'}</span>
                        {isExpanded ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
                      </button>

                      <button
                        onClick={() => handleDeleteTest(test._id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                        title="Delete Test"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Questions Accordion */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                          <span>Questions List ({test.questions?.length || 0})</span>
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {test.questions?.map((q, qIdx) => (
                          <div
                            key={q._id || qIdx}
                            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-slate-200">
                                Q{qIdx + 1}. {q.questionText}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px]">
                                {q.points || 1} pt
                              </span>
                            </div>

                            {/* Options grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                              {q.options?.map((opt, optIdx) => {
                                const isCorrect = optIdx === q.correctOptionIndex;
                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                                      isCorrect
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-medium'
                                        : 'bg-slate-900 border-slate-800 text-slate-400'
                                    }`}
                                  >
                                    <span
                                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        isCorrect
                                          ? 'bg-emerald-500 text-slate-950'
                                          : 'bg-slate-800 text-slate-400'
                                      }`}
                                    >
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span className="truncate">{opt}</span>
                                    {isCorrect && (
                                      <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                                        Correct
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation */}
                            {q.explanation && (
                              <div className="mt-2 p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-indigo-300 flex items-start gap-2">
                                <FaLightbulb className="text-amber-400 shrink-0 mt-0.5" />
                                <span>
                                  <strong>Explanation:</strong> {q.explanation}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT TEST MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-fadeIn">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-white">Create New Mock Test</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure test parameters and add multiple-choice questions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <FaWandMagicSparkles className="text-amber-300" />
                  <span>Use AI Generator</span>
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleCreateTest} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Test Meta Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Test Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    placeholder="e.g. React & State Management Foundation Quiz"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white text-sm outline-none transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={testDescription}
                    onChange={(e) => setTestDescription(e.target.value)}
                    placeholder="Brief description of what topics this exam assesses..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white text-sm outline-none transition-all placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Time Limit (Minutes) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    required
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Passing Percentage (%) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={passingScorePercent}
                    onChange={(e) => setPassingScorePercent(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-white text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Questions</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {questions.length} Total
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Each question must have 4 choices. Mark the radio circle for the correct answer.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addEmptyQuestion}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
                  >
                    <FaPlus /> Add Question
                  </button>
                </div>

                <div className="space-y-6">
                  {questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 relative group space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                          Question {qIdx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-slate-400 flex items-center gap-1">
                            Points:
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={q.points || 1}
                              onChange={(e) => handlePointsChange(qIdx, e.target.value)}
                              className="w-12 px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-center text-xs text-white"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIdx)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-all"
                            title="Remove Question"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      <input
                        type="text"
                        required
                        value={q.questionText}
                        onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                        placeholder={`e.g. Which React hook is used to perform side effects?`}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-white text-sm outline-none transition-all placeholder:text-slate-600"
                      />

                      {/* 4 Options */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctOptionIndex === optIdx;
                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                                isCorrect
                                  ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20'
                                  : 'bg-slate-900/60 border-slate-800'
                              }`}
                            >
                              <label
                                className="cursor-pointer flex items-center justify-center"
                                title="Mark as correct answer"
                              >
                                <input
                                  type="radio"
                                  name={`correct-${qIdx}`}
                                  checked={isCorrect}
                                  onChange={() => handleCorrectOptionChange(qIdx, optIdx)}
                                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                                />
                              </label>
                              <span className="text-xs font-bold text-slate-500 w-4">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <input
                                type="text"
                                required
                                value={opt}
                                onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                className="w-full bg-transparent text-white text-xs outline-none placeholder:text-slate-600"
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                          placeholder="Explanation (shown to students on the scorecard review)..."
                          className="w-full px-3.5 py-2 bg-slate-900/50 border border-slate-800/80 focus:border-indigo-500/50 rounded-xl text-slate-300 text-xs outline-none placeholder:text-slate-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publish Toggle & Submit */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 bg-slate-900/95 py-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 font-medium">
                    Publish test immediately for enrolled students
                  </span>
                </label>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/30 disabled:opacity-50"
                  >
                    {saving ? <ClipLoader size={14} color="#fff" /> : <FaCheck />}
                    <span>Save Mock Test</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI QUESTION GENERATOR MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn relative">
            {/* Modal Glow Accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-sm">
                    <FaWandMagicSparkles />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Generate Questions with AI</h3>
                    <p className="text-xs text-slate-400">Powered by Google Gemini 2.5 Flash</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleGenerateAi} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Topic / Concept *
                  </label>
                  <input
                    type="text"
                    required
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g. React Hooks, Node.js Streams, Redux Toolkit"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-white text-sm outline-none transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Question Count
                    </label>
                    <select
                      value={aiCount}
                      onChange={(e) => setAiCount(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-white text-xs outline-none transition-all"
                    >
                      <option value={3}>3 Questions</option>
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Difficulty Level
                    </label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-white text-xs outline-none transition-all"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/30 text-xs text-purple-300 flex items-start gap-2">
                  <FaLightbulb className="text-amber-300 shrink-0 mt-0.5" />
                  <span>
                    Gemini AI will automatically craft 4 balanced options, determine the exact correct answer, and compose technical explanations.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAiModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-900/30 disabled:opacity-50 transition-all"
                  >
                    {aiLoading ? <ClipLoader size={14} color="#fff" /> : <FaWandMagicSparkles />}
                    <span>{aiLoading ? 'Drafting Questions...' : 'Generate Now'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageMockTests;
