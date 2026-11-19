"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Sparkles,
  Upload,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Award,
  Sliders,
  Check,
  Save
} from "lucide-react";
import { extractTextFromPdf, executeAiTask } from "@/lib/ai/ai-client";
import { AiStatusBadge } from "./ai-status-badge";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  type: string;
}

export function QuizGeneratorSuite() {
  const [topic, setTopic] = useState("");
  const [studyText, setStudyText] = useState("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questionType, setQuestionType] = useState<"multiple_choice" | "true_false">("multiple_choice");

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interactive Quiz Running State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setError(null);
    setIsExtracting(true);
    try {
      const extracted = await extractTextFromPdf(file);
      setStudyText(extracted.totalText);
      if (!topic) setTopic(file.name.replace(/\.[^/.]+$/, ""));
    } catch (err: any) {
      setError("Failed to extract text from PDF: " + err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!topic.trim() && !studyText.trim()) {
      setError("Please provide a topic or study material to generate questions.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setQuestions([]);
    setIsSubmitted(false);
    setUserAnswers({});
    setCurrentIndex(0);

    const response = await executeAiTask({
      task: "generate_quiz",
      prompt: studyText.slice(0, 35000) || `Generate an academic quiz on: ${topic}`,
      options: {
        mode: topic || "General Topic",
        questionCount,
        difficulty,
        summaryFormat: questionType as any,
        temperature: 0.2,
      },
    });

    if (response.success && response.result) {
      try {
        // Clean out possible markdown code blocks ```json ... ```
        const cleaned = response.result
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        const parsed: QuizQuestion[] = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
        } else {
          setError("The AI returned an invalid quiz structure. Please try again.");
        }
      } catch {
        setError("Could not parse AI-generated questions into quiz format. Please try again.");
      }
    } else {
      setError(response.error || "Failed to generate quiz questions.");
    }

    setIsGenerating(false);
  };

  const handleSelectAnswer = (option: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: option,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] && userAnswers[idx].trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        score++;
      }
    });
    return score;
  };

  const handleSaveToStudentZone = () => {
    try {
      const raw = localStorage.getItem("workonline_student_quizzes");
      const existing = raw ? JSON.parse(raw) : [];
      const newEntry = {
        id: "quiz-" + Date.now(),
        title: topic || "AI Quiz",
        totalQuestions: questions.length,
        score: isSubmitted ? calculateScore() : 0,
        difficulty,
        date: new Date().toLocaleDateString(),
        questions,
      };
      localStorage.setItem("workonline_student_quizzes", JSON.stringify([newEntry, ...existing]));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setError("Failed to save to Student Zone.");
    }
  };

  const currentQ = questions[currentIndex];
  const totalScore = isSubmitted ? calculateScore() : 0;
  const percentage = questions.length > 0 ? Math.round((totalScore / questions.length) * 100) : 0;

  return (
    <div className="text-white space-y-8/50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-[#777777]">
          <Link href="/" className="hover:text-[#F04452] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/ai-workspace" className="hover:text-[#F04452] transition-colors">
            AI Workspace
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#202124] font-medium">AI Quiz Generator</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
              <HelpCircle className="w-7 h-7 text-[#F04452]" />
              AI Quiz & Assessment Generator
            </h1>
            <p className="text-sm sm:text-base text-[#777777] mt-1">
              Generate self-grading quizzes directly from syllabus topics or uploaded textbooks to test conceptual mastery.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AiStatusBadge />
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
            <button onClick={() => setError(null)} className="text-xs text-rose-600 underline">
              Dismiss
            </button>
          </div>
        )}

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Saved to your Student Zone Quiz Tracker!</span>
          </div>
        )}

        {/* Quiz Setup Card */}
        {questions.length === 0 ? (
          <div className="liquid-glass-card rounded-2xl p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#202124] uppercase tracking-wider mb-2">
                  Topic or Subject
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Operating Systems: Paging vs Segmentation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#F04452]/30 text-sm text-[#202124] font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                    Upload Study PDF (Optional)
                  </label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isExtracting}
                    className="text-xs text-[#F04452] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isExtracting ? "Extracting..." : "Choose PDF"}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                  }}
                />
                <input
                  type="text"
                  readOnly
                  value={studyText ? `Extracted text (${studyText.length} characters)` : ""}
                  placeholder="Upload a PDF above to ground the quiz in your textbook..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/80 bg-white/20 text-xs text-[#777777] font-mono"
                />
              </div>
            </div>

            {/* Parameters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/60">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-2">Number of Questions</label>
                <div className="flex gap-2">
                  {[3, 5, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setQuestionCount(num)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                        questionCount === num
                          ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white border-blue-600"
                          : "bg-white text-[#202124] border-white/80 hover:bg-white/20"
                      }`}
                    >
                      {num} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-2">Difficulty Tier</label>
                <div className="flex gap-2">
                  {(["easy", "medium", "hard"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize border ${
                        difficulty === d
                          ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white border-blue-600"
                          : "bg-white text-[#202124] border-white/80 hover:bg-white/20"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-2">Question Type</label>
                <div className="flex gap-2">
                  {[
                    { id: "multiple_choice", label: "Multiple Choice" },
                    { id: "true_false", label: "True / False" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setQuestionType(t.id as any)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                        questionType === t.id
                          ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white border-blue-600"
                          : "bg-white text-[#202124] border-white/80 hover:bg-white/20"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating || isExtracting || (!topic.trim() && !studyText.trim())}
              className="w-full py-3 rounded-xl liquid-btn-primary font-semibold text-sm disabled:opacity-40 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? "Synthesizing AI Quiz..." : "Generate Interactive Quiz"}
            </button>
          </div>
        ) : (
          /* Active Interactive Quiz Runner */
          <div className="liquid-glass-card rounded-2xl p-6 shadow-sm space-y-6">
            {/* Quiz Top Action Bar */}
            <div className="flex items-center justify-between border-b border-white/80 pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-[#F04452] tracking-wider">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <h3 className="font-bold text-[#202124] text-base mt-0.5">{topic || "AI Generated Quiz"}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToStudentZone}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#F04452]/25 bg-red-500/10 text-[#D72638] hover:bg-red-500/15 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Quiz
                </button>
                <button
                  onClick={() => {
                    setQuestions([]);
                    setUserAnswers({});
                    setIsSubmitted(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/80 hover:bg-white/20 text-[#777777] flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  New Quiz
                </button>
              </div>
            </div>

            {/* Score Banner if submitted */}
            {isSubmitted && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs uppercase font-bold text-blue-300">Assessment Result</span>
                  <h4 className="text-xl font-bold">
                    You scored {totalScore} out of {questions.length} ({percentage}%)
                  </h4>
                  <p className="text-xs text-slate-300">
                    Review each question below to inspect correct answers and explanations.
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Award className="w-8 h-8 text-amber-400" />
                </div>
              </div>
            )}

            {/* Question Card */}
            {currentQ && (
              <div className="space-y-5">
                <div className="p-5 rounded-xl bg-white/20 border border-white/80">
                  <p className="text-base font-semibold text-[#202124] leading-relaxed">
                    {currentQ.question}
                  </p>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {(currentQ.options && currentQ.options.length > 0
                    ? currentQ.options
                    : ["True", "False"]
                  ).map((opt) => {
                    const isSelected = userAnswers[currentIndex] === opt;
                    const isCorrect = isSubmitted && opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
                    const isWrongSelection = isSubmitted && isSelected && !isCorrect;

                    let btnStyle = "border-white/80 hover:border-blue-400 bg-white text-[#202124]";

                    if (isSelected && !isSubmitted) {
                      btnStyle = "border-blue-600 bg-red-500/10/70 text-[#202124] font-semibold ring-2 ring-blue-500/20";
                    } else if (isCorrect) {
                      btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                    } else if (isWrongSelection) {
                      btnStyle = "border-rose-500 bg-rose-50 text-rose-900 line-through";
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectAnswer(opt)}
                        disabled={isSubmitted}
                        className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                        {isWrongSelection && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box (when submitted) */}
                {isSubmitted && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-[#F04452]/25/80 text-xs sm:text-sm text-[#202124] space-y-1">
                    <span className="font-bold">Explanation: </span>
                    <p className="leading-relaxed">{currentQ.explanation}</p>
                  </div>
                )}

                {/* Navigation & Submission Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-white/60">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-white/80 hover:bg-white/20 disabled:opacity-30 text-[#202124]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {currentIndex < questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      !isSubmitted && (
                        <button
                          onClick={() => setIsSubmitted(true)}
                          className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        >
                          Submit Quiz
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
