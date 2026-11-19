"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export function FlashcardCreator() {
  const [cards, setCards] = useState<Flashcard[]>([
    {
      id: "1",
      front: "What is the Time Complexity of QuickSort in the average case?",
      back: "O(n log n). In the worst case (already sorted array with bad pivot), it degrades to O(n²).",
    },
    {
      id: "2",
      front: "What does the ACID acronym stand for in Database Systems?",
      back: "Atomicity, Consistency, Isolation, and Durability.",
    },
    {
      id: "3",
      front: "What is the primary difference between TCP and UDP?",
      back: "TCP is connection-oriented, ordered, and reliable with error checking. UDP is connectionless, faster, with no delivery guarantee.",
    },
    {
      id: "4",
      front: "In React, what problem does useCallback primarily solve?",
      back: "It memoizes function definitions between re-renders to prevent unnecessary child re-renders that rely on reference equality.",
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // New card inputs
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    setCards([
      ...cards,
      {
        id: Date.now().toString(),
        front: newFront.trim(),
        back: newBack.trim(),
      },
    ]);
    setNewFront("");
    setNewBack("");
  };

  const currentCard = cards[currentIndex] || cards[0];

  return (
    <div className="space-y-8">
      {/* Flashcard Active Study Viewer */}
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>
            Card <strong>{currentIndex + 1}</strong> of <strong>{cards.length}</strong>
          </span>
          <span className="text-blue-600 font-medium">Click card to reveal answer</span>
        </div>

        {/* The Card */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`min-h-[260px] p-8 sm:p-10 rounded-3xl cursor-pointer transition-all duration-300 flex flex-col justify-between text-center border shadow-lg ${
            isFlipped
              ? "bg-slate-900 text-white border-slate-800"
              : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span
              className={`px-2.5 py-0.5 rounded-full font-semibold ${
                isFlipped
                  ? "bg-blue-900/60 text-blue-300"
                  : "bg-blue-50 dark:bg-blue-950/60 text-blue-600"
              }`}
            >
              {isFlipped ? "Answer" : "Question"}
            </span>
            <RotateCw className="w-4 h-4 opacity-50" />
          </div>

          <div className="my-auto py-4">
            <p className="text-lg sm:text-xl font-bold leading-relaxed">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
          </div>

          <p className="text-[11px] opacity-60">
            {isFlipped ? "Click to flip back to question" : "Click to show answer"}
          </p>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            Flip Card
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add new card section */}
      <div className="max-w-xl mx-auto p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Add New Flashcard to Deck
        </h4>

        <form onSubmit={handleAddCard} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Front (Prompt / Question)
            </label>
            <input
              type="text"
              required
              value={newFront}
              onChange={(e) => setNewFront(e.target.value)}
              placeholder="e.g. What is Amdahl's Law?"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Back (Explanation / Answer)
            </label>
            <textarea
              rows={2}
              required
              value={newBack}
              onChange={(e) => setNewBack(e.target.value)}
              placeholder="e.g. Predicts theoretical speedup when using multiple processors..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
        </form>
      </div>
    </div>
  );
}
