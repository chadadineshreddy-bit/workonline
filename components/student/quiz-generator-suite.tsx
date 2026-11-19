"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  BookOpen,
  Award,
  Play,
  FileText,
  Clock,
  ArrowRight
} from "lucide-react";

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0, 1, 2, 3
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  questions: QuizQuestion[];
}

const DEFAULT_QUIZZES: Quiz[] = [
  {
    id: "quiz-1",
    title: "Operating Systems & Concurrency Fundamentals",
    subject: "Computer Science",
    questions: [
      {
        id: "q1",
        question: "Which of the following conditions is NOT required for a deadlock to occur?",
        options: [
          "Mutual exclusion",
          "Hold and wait",
          "Preemption allowed",
          "Circular wait",
        ],
        correctIndex: 2,
        explanation: "Deadlock requires 'No Preemption'. If preemption is allowed, resources can be forcibly reclaimed, breaking the deadlock.",
      },
      {
        id: "q2",
        question: "Belady's Anomaly is typically exhibited by which page replacement algorithm?",
        options: ["Least Recently Used (LRU)", "First In First Out (FIFO)", "Optimal Replacement (OPT)", "Clock Algorithm"],
        correctIndex: 1,
        explanation: "FIFO page replacement can produce more page faults when increasing allocated physical page frames.",
      },
      {
        id: "q3",
        question: "What is the primary function of a Translation Lookaside Buffer (TLB)?",
        options: [
          "Cache recent file system directory blocks",
          "Cache virtual-to-physical address translations",
          "Schedule kernel threads",
          "Manage DMA bus master channels",
        ],
        correctIndex: 1,
        explanation: "The TLB is a dedicated hardware associative cache for page table address translation entries.",
      },
      {
        id: "q4",
        question: "In Unix-like systems, which system call creates a duplicate child process?",
        options: ["execve()", "fork()", "pthread_create()", "clone()"],
        correctIndex: 1,
        explanation: "fork() duplicates the parent process by creating a child with an exact copy of address space and file descriptors.",
      },
    ],
  },
  {
    id: "quiz-2",
    title: "Data Structures & Algorithm Complexity",
    subject: "Algorithms",
    questions: [
      {
        id: "ds_q1",
        question: "What is the worst-case time complexity of standard QuickSort?",
        options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
        correctIndex: 2,
        explanation: "When partitions are unbalanced (e.g. sorted input with naive pivot selection), QuickSort degrades to O(n²).",
      },
      {
        id: "ds_q2",
        question: "Which data structure is fundamentally used for Breadth-First Search (BFS) graph traversal?",
        options: ["Stack", "Queue", "Priority Queue / Heap", "Binary Search Tree"],
        correctIndex: 1,
        explanation: "BFS explores neighbors level-by-level using a FIFO Queue.",
      },
      {
        id: "ds_q3",
        question: "What is the maximum balance factor allowed for any node in a valid AVL Tree?",
        options: ["0", "±1", "±2", "±log n"],
        correctIndex: 1,
        explanation: "An AVL tree enforces that the height difference between left and right subtrees must be -1, 0, or +1.",
      },
    ],
  },
];

export function QuizGeneratorSuite() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(DEFAULT_QUIZZES);
  const [activeQuizId, setActiveQuizId] = useState<string>("quiz-1");

  // Mode: "creator" | "taking" | "results"
  const [viewMode, setViewMode] = useState<"creator" | "taking" | "results">("creator");

  // Quiz Taking state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // New question form state
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [qText, setQText] = useState("");
  const [opt0, setOpt0] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [opt3, setOpt3] = useState("");
  const [correctOption, setCorrectOption] = useState<number>(0);
  const [qExplanation, setQExplanation] = useState("");

  // New quiz modal
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizSubject, setNewQuizSubject] = useState("");

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("workonline_quizzes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuizzes(parsed);
          setActiveQuizId(parsed[0].id);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const saveQuizzes = (updated: Quiz[]) => {
    setQuizzes(updated);
    try {
      localStorage.setItem("workonline_quizzes", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId) || quizzes[0];
  const questions = activeQuiz?.questions || [];

  // Start Quiz
  const handleStartQuiz = () => {
    if (questions.length === 0) {
      alert("Please add at least one question to this quiz first.");
      return;
    }
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setViewMode("taking");
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    setViewMode("results");
  };

  // Score computation
  const scoreResult = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    const percent = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    return { correct, total: questions.length, percent };
  };

  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !opt0.trim() || !opt1.trim() || !opt2.trim() || !opt3.trim()) {
      alert("Please complete the question and all 4 options.");
      return;
    }

    const newQ: QuizQuestion = {
      id: "q-" + Date.now(),
      question: qText.trim(),
      options: [opt0.trim(), opt1.trim(), opt2.trim(), opt3.trim()],
      correctIndex: correctOption,
      explanation: qExplanation.trim() || undefined,
    };

    const updated = quizzes.map((q) =>
      q.id === activeQuizId ? { ...q, questions: [...q.questions, newQ] } : q
    );
    saveQuizzes(updated);
    setQText("");
    setOpt0("");
    setOpt1("");
    setOpt2("");
    setOpt3("");
    setQExplanation("");
    setCorrectOption(0);
    setIsAddingQuestion(false);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (questions.length <= 1) {
      alert("A quiz must have at least one question.");
      return;
    }
    const updated = quizzes.map((q) =>
      q.id === activeQuizId ? { ...q, questions: q.questions.filter((item) => item.id !== qId) } : q
    );
    saveQuizzes(updated);
  };

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle.trim()) return;

    const newQuiz: Quiz = {
      id: "quiz-" + Date.now(),
      title: newQuizTitle.trim(),
      subject: newQuizSubject.trim() || "General",
      questions: [
        {
          id: "q-init",
          question: "Sample Question 1: What is the primary purpose of this topic?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctIndex: 0,
        },
      ],
    };

    const updated = [...quizzes, newQuiz];
    saveQuizzes(updated);
    setActiveQuizId(newQuiz.id);
    setNewQuizTitle("");
    setNewQuizSubject("");
    setIsAddingQuiz(false);
  };

  return (
    <div className="text-white space-y-8">
      {/* Top Banner */}
      <div className="liquid-glass-pill p-3 px-6 mb-6 flex items-center justify-between print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/student-zone"
              className="text-xs font-semibold text-[#F04452] hover:text-[#D72638] flex items-center gap-1"
            >
              Student Zone <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                MCQ Quiz Generator & Exam Simulator
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode !== "creator" ? (
              <button
                onClick={() => setViewMode("creator")}
                className="px-3.5 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
              >
                <span>← Back to Quiz Manager</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsAddingQuestion(true)}
                  className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#F04452]" />
                  <span>Add Question</span>
                </button>
                <button
                  onClick={handleStartQuiz}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Take Quiz ({questions.length} Qs)</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* VIEW 1: CREATOR & MANAGER */}
        {viewMode === "creator" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
                  Academic MCQ Quizzes
                </h2>
                <p className="text-xs sm:text-sm text-[#777777] mt-1">
                  Create customized test question banks with multiple-choice options, correct keys, and revision explanations.
                </p>
              </div>

              <button
                onClick={() => setIsAddingQuiz(true)}
                className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5 self-start transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Create New Quiz
              </button>
            </div>

            {/* Quiz Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/80">
              {quizzes.map((q) => {
                const isActive = q.id === activeQuizId;
                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuizId(q.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                      isActive
                        ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white shadow-xs"
                        : "liquid-glass-card text-[#777777] hover:bg-white/30"
                    }`}
                  >
                    <span>{q.title}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isActive ? "bg-red-500/100 text-white" : "bg-white/30 text-[#777777]"
                      }`}
                    >
                      {q.questions.length} Qs
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#202124]">
                  Questions in &quot;{activeQuiz?.title}&quot; ({questions.length})
                </h3>
                <button
                  onClick={handleStartQuiz}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" /> Start Test Now
                </button>
              </div>

              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-xl border border-white/80 bg-white shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-xs font-bold text-[#202124]">
                        {idx + 1}. {q.question}
                      </span>
                      {questions.length > 1 && (
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-[#777777] hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correctIndex;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                              isCorrect
                                ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                                : "bg-white/20 border-white/80 text-[#202124]"
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] liquid-glass-card font-mono">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="truncate">{opt}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-[#777777] bg-white/20 p-2.5 rounded-lg border border-white/60">
                        <strong className="text-[#202124]">Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: TAKING THE QUIZ */}
        {viewMode === "taking" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-white/80 shadow-md space-y-6">
              {/* Quiz progress */}
              <div className="flex items-center justify-between text-xs text-[#777777] pb-3 border-b border-white/80">
                <span className="font-bold text-[#202124]">{activeQuiz?.title}</span>
                <span className="font-mono">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>

              {/* Current Question */}
              {questions[currentQuestionIndex] && (
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-[#202124] leading-snug">
                    {questions[currentQuestionIndex].question}
                  </h3>

                  <div className="space-y-2.5 pt-2">
                    {questions[currentQuestionIndex].options.map((opt, optIdx) => {
                      const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                      return (
                        <div
                          key={optIdx}
                          onClick={() =>
                            setUserAnswers({
                              ...userAnswers,
                              [currentQuestionIndex]: optIdx,
                            })
                          }
                          className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-center gap-3 transition-all ${
                            isSelected
                              ? "bg-red-500/10 border-blue-500 text-[#202124] font-bold shadow-2xs"
                              : "bg-white border-white/80 text-[#202124] hover:border-white/80"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs ${
                              isSelected
                                ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white"
                                : "bg-white/30 text-[#202124]"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-white/60">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  className="px-3.5 py-1.5 rounded-lg border border-white/80 text-xs font-semibold text-[#202124] hover:bg-white/20 disabled:opacity-40"
                >
                  Previous
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] shadow-xs"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: RESULTS & SCORE REVIEW */}
        {viewMode === "results" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Scorecard banner */}
            <div className="floating-glass-canvas rounded-3xl shadow-xl p-6 text-center space-y-3">
              <Award className="w-12 h-12 text-[#F04452] mx-auto" />
              <h3 className="text-xl font-black text-[#202124]">Quiz Completed!</h3>
              <div className="text-5xl font-extrabold text-[#F04452] font-mono">
                {scoreResult().percent}%
              </div>
              <p className="text-xs text-[#777777]">
                You answered <strong className="text-[#202124]">{scoreResult().correct}</strong> out of{" "}
                <strong className="text-[#202124]">{scoreResult().total}</strong> questions correctly.
              </p>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  onClick={handleStartQuiz}
                  className="px-4 py-2 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                </button>
                <button
                  onClick={() => setViewMode("creator")}
                  className="px-4 py-2 rounded-lg border border-white/80 text-xs font-semibold text-[#202124] hover:bg-white/20"
                >
                  Back to Question Bank
                </button>
              </div>
            </div>

            {/* Answer Breakdown */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#202124]">Review Answers</h4>
              {questions.map((q, idx) => {
                const userChoice = userAnswers[idx];
                const isCorrect = userChoice === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border bg-white space-y-2 ${
                      isCorrect ? "border-emerald-300" : "border-rose-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-[#202124]">
                        {idx + 1}. {q.question}
                      </span>
                      {isCorrect ? (
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="text-[#777777]">
                        Your answer:{" "}
                        <strong className={isCorrect ? "text-emerald-700" : "text-rose-700"}>
                          {userChoice !== undefined ? q.options[userChoice] : "Skipped"}
                        </strong>
                      </p>
                      {!isCorrect && (
                        <p className="text-[#777777]">
                          Correct answer:{" "}
                          <strong className="text-emerald-700">{q.options[q.correctIndex]}</strong>
                        </p>
                      )}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-[#777777] bg-white/20 p-2 rounded-lg mt-1">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      {isAddingQuestion && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="liquid-glass-card rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#202124]">Add MCQ Question</h3>
            <form onSubmit={handleAddQuestionSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#202124] block mb-1">
                  Question Text *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Enter the question prompt..."
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#202124] block">
                  Four Answer Options & Select Correct Key *
                </label>
                {[
                  { val: opt0, set: setOpt0, idx: 0 },
                  { val: opt1, set: setOpt1, idx: 1 },
                  { val: opt2, set: setOpt2, idx: 2 },
                  { val: opt3, set: setOpt3, idx: 3 },
                ].map((item) => (
                  <div key={item.idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOptionRadio"
                      checked={correctOption === item.idx}
                      onChange={() => setCorrectOption(item.idx)}
                      className="accent-emerald-600 w-4 h-4 cursor-pointer"
                      title="Mark as correct answer"
                    />
                    <span className="font-mono text-xs font-bold text-[#777777] w-4">
                      {String.fromCharCode(65 + item.idx)}
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + item.idx)}`}
                      value={item.val}
                      onChange={(e) => item.set(e.target.value)}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-medium text-[#202124] block mb-1">
                  Answer Explanation (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Why is this answer correct? References, lemmas, or rules..."
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingQuestion(false)}
                  className="px-3.5 py-2 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] transition-colors shadow-xs"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Quiz Modal */}
      {isAddingQuiz && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="liquid-glass-card rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#202124]">Create New Quiz Bank</h3>
            <form onSubmit={handleCreateQuiz} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#202124] block mb-1">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thermodynamics & Heat Transfer"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#202124] block mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mechanical Engineering"
                  value={newQuizSubject}
                  onChange={(e) => setNewQuizSubject(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingQuiz(false)}
                  className="px-3.5 py-2 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] transition-colors shadow-xs"
                >
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
