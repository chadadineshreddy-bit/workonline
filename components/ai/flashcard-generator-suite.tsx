"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Upload,
  RotateCw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  Check,
  RotateCcw,
  BookOpen,
  Trash2,
  Plus
} from "lucide-react";
import { extractTextFromPdf, executeAiTask } from "@/lib/ai/ai-client";
import { AiStatusBadge } from "./ai-status-badge";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  known?: boolean;
}

export function FlashcardGeneratorSuite() {
  const [topic, setTopic] = useState("");
  const [studyMaterial, setStudyMaterial] = useState("");
  const [quantity, setQuantity] = useState<number>(8);

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setError(null);
    setIsExtracting(true);
    try {
      const extracted = await extractTextFromPdf(file);
      setStudyMaterial(extracted.totalText);
      if (!topic) setTopic(file.name.replace(/\.[^/.]+$/, ""));
    } catch (err: any) {
      setError("Failed to extract text from PDF: " + err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateCards = async () => {
    if (!topic.trim() && !studyMaterial.trim()) {
      setError("Please provide a topic or study material.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);

    const response = await executeAiTask({
      task: "generate_flashcards",
      prompt: studyMaterial.slice(0, 35000) || `Create study flashcards on: ${topic}`,
      options: {
        mode: topic || "Core Concepts",
        questionCount: quantity,
        temperature: 0.3,
      },
    });

    if (response.success && response.result) {
      try {
        const cleaned = response.result
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        const parsed: Flashcard[] = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setCards(parsed);
        } else {
          setError("The AI returned an invalid flashcard structure. Please try again.");
        }
      } catch {
        setError("Could not parse AI response into flashcards. Please try again.");
      }
    } else {
      setError(response.error || "Failed to generate flashcards.");
    }

    setIsGenerating(false);
  };

  const handleShuffle = () => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleMarkKnown = (known: boolean) => {
    setCards((prev) =>
      prev.map((c, i) => (i === currentIndex ? { ...c, known } : c))
    );
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((p) => p + 1);
      setIsFlipped(false);
    }
  };

  const handleDeleteCard = (idx: number) => {
    setCards((prev) => prev.filter((_, i) => i !== idx));
    if (currentIndex >= cards.length - 1) {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }
    setIsFlipped(false);
  };

  const handleSaveToStudentZone = () => {
    if (cards.length === 0) return;
    try {
      const raw = localStorage.getItem("workonline_student_flashcards");
      const existing = raw ? JSON.parse(raw) : [];
      const newDeck = {
        id: "deck-" + Date.now(),
        title: topic || "AI Study Deck",
        cardCount: cards.length,
        createdDate: new Date().toLocaleDateString(),
        cards,
      };
      localStorage.setItem("workonline_student_flashcards", JSON.stringify([newDeck, ...existing]));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setError("Failed to save to Student Zone.");
    }
  };

  const currentCard = cards[currentIndex];
  const knownCount = cards.filter((c) => c.known === true).length;

  return (
    <div className="text-white space-y-8/50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
          <span className="text-[#202124] font-medium">AI Flashcard Generator</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-[#F04452]" />
              AI Flashcard Deck Creator
            </h1>
            <p className="text-sm sm:text-base text-[#777777] mt-1">
              Generate active-recall question-and-answer study cards from study topics or uploaded PDFs.
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
            <span>Saved to your Student Zone Flashcards! Manage your deck under <Link href="/student-zone/flashcards" className="underline font-semibold">Flashcards</Link>.</span>
          </div>
        )}

        {/* Deck Configuration */}
        {cards.length === 0 ? (
          <div className="liquid-glass-card rounded-2xl p-6 shadow-sm space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#202124] uppercase tracking-wider mb-2">
                  Topic or Subject
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Organic Chemistry: Functional Groups & Reactions"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#F04452]/30 text-sm text-[#202124] font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                    Upload Study Material (PDF)
                  </label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isExtracting}
                    className="text-xs text-[#F04452] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isExtracting ? "Extracting..." : "Upload PDF"}
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
                  value={studyMaterial ? `Loaded text (${studyMaterial.length} characters)` : ""}
                  placeholder="Upload study PDF to extract cards from document..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/80 bg-white/20 text-xs text-[#777777] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-2">Number of Cards</label>
              <div className="flex gap-2">
                {[5, 8, 12, 16].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuantity(num)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                      quantity === num
                        ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white border-blue-600"
                        : "bg-white text-[#202124] border-white/80 hover:bg-white/20"
                    }`}
                  >
                    {num} Cards
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateCards}
              disabled={isGenerating || isExtracting || (!topic.trim() && !studyMaterial.trim())}
              className="w-full py-3 rounded-xl liquid-btn-primary font-semibold text-sm disabled:opacity-40 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? "Synthesizing Active Recall Cards..." : "Generate Flashcards Deck"}
            </button>
          </div>
        ) : (
          /* Interactive Flashcard Study Player */
          <div className="space-y-5">
            {/* Player Controls Bar */}
            <div className="flex items-center justify-between liquid-glass-card rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#202124]">
                  Card {currentIndex + 1} of {cards.length}
                </span>
                <span className="text-xs text-[#777777] font-mono">
                  ({knownCount} mastered)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShuffle}
                  className="px-2.5 py-1.5 rounded-lg border border-white/80 text-[#202124] hover:bg-white/20 text-xs font-medium flex items-center gap-1"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Shuffle
                </button>
                <button
                  onClick={handleSaveToStudentZone}
                  className="px-3 py-1.5 rounded-lg border border-[#F04452]/25 bg-red-500/10 text-[#D72638] hover:bg-red-500/15 text-xs font-medium flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Deck
                </button>
                <button
                  onClick={() => {
                    setCards([]);
                    setCurrentIndex(0);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-white/80 text-[#777777] hover:bg-white/20 text-xs font-medium"
                >
                  New Deck
                </button>
              </div>
            </div>

            {/* Flashcard 3D Card Box */}
            {currentCard && (
              <div
                onClick={() => setIsFlipped((prev) => !prev)}
                className="relative w-full h-[320px] rounded-3xl bg-white border-2 border-white/80 hover:border-[#F04452]/30 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between p-8 select-none"
              >
                <div className="flex items-center justify-between text-xs text-[#777777]">
                  <span className="uppercase font-semibold tracking-wider text-[#F04452]">
                    {isFlipped ? "Back (Answer / Explanation)" : "Front (Question / Concept)"}
                  </span>
                  <span className="text-[11px] bg-white/30 px-2 py-0.5 rounded-full text-[#777777]">
                    Click card to flip
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center text-center px-4">
                  <p className="text-lg sm:text-xl font-bold text-[#202124] leading-relaxed">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/60 text-xs text-[#777777]">
                  <span>Topic: {currentCard.category}</span>
                  <span className="flex items-center gap-1 text-[#777777]">
                    <RotateCw className="w-3.5 h-3.5" /> Tap space or card to flip
                  </span>
                </div>
              </div>
            )}

            {/* Action Bar: Mastery + Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkKnown(false)}
                  className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Needs Revision
                </button>
                <button
                  onClick={() => handleMarkKnown(true)}
                  className="px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Known & Mastered
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentIndex((p) => Math.max(0, p - 1));
                    setIsFlipped(false);
                  }}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl border border-white/80 text-[#202124] hover:bg-white/20 disabled:opacity-30 text-xs font-semibold flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => {
                    setCurrentIndex((p) => Math.min(cards.length - 1, p + 1));
                    setIsFlipped(false);
                  }}
                  disabled={currentIndex === cards.length - 1}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
