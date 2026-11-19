"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Trash2,
  RotateCw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  Folder,
  Layers,
  Award,
  Edit2
} from "lucide-react";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered?: boolean;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  cards: Flashcard[];
}

const DEFAULT_DECKS: FlashcardDeck[] = [
  {
    id: "deck-1",
    title: "Operating Systems Core Concepts",
    subject: "Computer Science",
    cards: [
      {
        id: "c1",
        front: "What are the four Coffman conditions necessary for deadlock?",
        back: "1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait",
        mastered: true,
      },
      {
        id: "c2",
        front: "What is Belady's Anomaly and which page replacement algorithm experiences it?",
        back: "Belady's Anomaly occurs when allocating more page frames results in MORE page faults. It commonly affects the FIFO (First-In, First-Out) algorithm.",
        mastered: false,
      },
      {
        id: "c3",
        front: "What is the difference between a process and a thread?",
        back: "A process has its own address space, file handles, and memory map. Threads share the same address space and memory of their parent process while having independent program counters, registers, and stacks.",
        mastered: true,
      },
      {
        id: "c4",
        front: "Explain the purpose of the Translation Lookaside Buffer (TLB).",
        back: "The TLB is a high-speed associative hardware cache that stores recent virtual-to-physical page frame translations to eliminate redundant memory lookups.",
        mastered: false,
      },
      {
        id: "c5",
        front: "What is an atomic compare-and-swap (CAS) instruction?",
        back: "A hardware-level synchronization primitive that atomically compares memory contents with an expected value, and updates it only if equal. Used to build lock-free data structures.",
        mastered: false,
      },
    ],
  },
  {
    id: "deck-2",
    title: "Data Structures & Big-O Complexities",
    subject: "Algorithms",
    cards: [
      {
        id: "ds1",
        front: "What is the worst-case and average-case time complexity of QuickSort?",
        back: "Average Case: O(n log n)\nWorst Case: O(n²) (when chosen pivots are consistently extreme elements in sorted arrays).",
        mastered: true,
      },
      {
        id: "ds2",
        front: "How does a Hash Table achieve O(1) amortized lookup?",
        back: "By computing a hash code from the key, mapping it to a bucket index via modulus, and resolving collisions using separate chaining or open addressing.",
        mastered: false,
      },
      {
        id: "ds3",
        front: "What is an AVL Tree and what is its maximum balance factor?",
        back: "An AVL tree is a self-balancing binary search tree where the height difference between left and right subtrees (Balance Factor) of any node never exceeds ±1.",
        mastered: false,
      },
    ],
  },
];

export function FlashcardSuite() {
  const [decks, setDecks] = useState<FlashcardDeck[]>(DEFAULT_DECKS);
  const [activeDeckId, setActiveDeckId] = useState<string>("deck-1");
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // New card modal/form
  const [isAddingCard, setIsAddingCard] = useState<boolean>(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");

  // New deck modal/form
  const [isAddingDeck, setIsAddingDeck] = useState<boolean>(false);
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckSubject, setNewDeckSubject] = useState("");

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("workonline_flashcards");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDecks(parsed);
          setActiveDeckId(parsed[0].id);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const saveDecks = (updated: FlashcardDeck[]) => {
    setDecks(updated);
    try {
      localStorage.setItem("workonline_flashcards", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const activeDeck = decks.find((d) => d.id === activeDeckId) || decks[0];
  const cards = activeDeck?.cards || [];
  const currentCard = cards[currentCardIndex] || cards[0];

  // Navigation
  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    const updated = decks.map((d) => (d.id === activeDeckId ? { ...d, cards: shuffled } : d));
    saveDecks(updated);
    setCurrentCardIndex(0);
  };

  const handleToggleMastered = () => {
    if (!currentCard) return;
    const updatedCards = cards.map((c, i) =>
      i === currentCardIndex ? { ...c, mastered: !c.mastered } : c
    );
    const updated = decks.map((d) => (d.id === activeDeckId ? { ...d, cards: updatedCards } : d));
    saveDecks(updated);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: "card-" + Date.now(),
      front: newFront.trim(),
      back: newBack.trim(),
      mastered: false,
    };

    const updated = decks.map((d) =>
      d.id === activeDeckId ? { ...d, cards: [...d.cards, newCard] } : d
    );
    saveDecks(updated);
    setNewFront("");
    setNewBack("");
    setIsAddingCard(false);
  };

  const handleDeleteCard = (cardId: string) => {
    if (cards.length <= 1) {
      alert("A deck must retain at least one card.");
      return;
    }
    const updatedCards = cards.filter((c) => c.id !== cardId);
    const updated = decks.map((d) => (d.id === activeDeckId ? { ...d, cards: updatedCards } : d));
    saveDecks(updated);
    setIsFlipped(false);
    setCurrentCardIndex((prev) => Math.min(prev, updatedCards.length - 1));
  };

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckTitle.trim()) return;

    const newDeck: FlashcardDeck = {
      id: "deck-" + Date.now(),
      title: newDeckTitle.trim(),
      subject: newDeckSubject.trim() || "General",
      cards: [
        {
          id: "c-" + Date.now(),
          front: "Sample Question 1",
          back: "Sample Answer 1",
          mastered: false,
        },
      ],
    };

    const updated = [...decks, newDeck];
    saveDecks(updated);
    setActiveDeckId(newDeck.id);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setNewDeckTitle("");
    setNewDeckSubject("");
    setIsAddingDeck(false);
  };

  // Stats
  const masteredCount = cards.filter((c) => c.mastered).length;
  const masteryPercentage = cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0;

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
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Interactive Flashcards & Revision Decks
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingCard(true)}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#F04452]" />
              <span>Add Card</span>
            </button>
            <button
              onClick={() => setIsAddingDeck(true)}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-medium hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Folder className="w-3.5 h-3.5" />
              <span>New Deck</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
            Active Recall & Flashcard Decks
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-3xl">
            Retain formulas, key definitions, and exam concepts with spaced active recall. Click any card to flip between question and explanation.
          </p>
        </div>

        {/* Deck Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/80">
          {decks.map((deck) => {
            const isActive = deck.id === activeDeckId;
            return (
              <button
                key={deck.id}
                onClick={() => {
                  setActiveDeckId(deck.id);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "liquid-glass-card text-[#777777] hover:bg-white/30"
                }`}
              >
                <span>{deck.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    isActive ? "bg-slate-800 text-slate-300" : "bg-white/30 text-[#777777]"
                  }`}
                >
                  {deck.cards.length} cards
                </span>
              </button>
            );
          })}
        </div>

        {/* Study Arena */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Flashcard Arena */}
          <div className="lg:col-span-8 space-y-4">
            {/* Flashcard Box with 3D Flip style */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="liquid-glass-card rounded-2xl p-8 sm:p-12 min-h-[380px] shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between select-none relative group"
            >
              <div className="flex items-center justify-between text-xs text-[#777777]">
                <span className="font-mono">
                  Card {currentCardIndex + 1} of {cards.length}
                </span>
                <span className="font-semibold uppercase tracking-wider text-[11px] text-[#F04452]">
                  {isFlipped ? "Answer / Back" : "Question / Front"}
                </span>
              </div>

              {/* Card Text */}
              <div className="py-8 text-center">
                <p className="text-xl sm:text-2xl font-bold text-[#202124] leading-snug whitespace-pre-line font-serif">
                  {isFlipped ? currentCard?.back : currentCard?.front}
                </p>
                <span className="text-[11px] text-[#777777] mt-4 block">
                  (Click card to {isFlipped ? "see Question" : "flip for Answer"})
                </span>
              </div>

              {/* Footer status */}
              <div className="flex items-center justify-between pt-4 border-t border-white/60 text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleMastered();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    currentCard?.mastered
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-white/30 text-[#777777] hover:bg-slate-200"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{currentCard?.mastered ? "Mastered ✓" : "Mark as Mastered"}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentCard) handleDeleteCard(currentCard.id);
                  }}
                  className="text-[#777777] hover:text-rose-600 p-1"
                  title="Delete this card"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Navigation & Controls */}
            <div className="flex items-center justify-between liquid-glass-card rounded-2xl p-4 shadow-xs">
              <button
                onClick={handlePrev}
                className="px-4 py-2 rounded-lg border border-white/80 text-xs font-semibold text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-3.5 py-2 rounded-lg bg-white/30 hover:bg-slate-200 text-[#202124] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#F04452]" /> Flip Card
                </button>
                <button
                  onClick={handleShuffle}
                  className="px-3.5 py-2 rounded-lg bg-white/30 hover:bg-slate-200 text-[#202124] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Shuffle cards"
                >
                  <Shuffle className="w-3.5 h-3.5 text-amber-600" /> Shuffle
                </button>
              </div>

              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg liquid-btn-primary text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Deck Stats & Overview Column */}
          <div className="lg:col-span-4 space-y-5">
            <div className="liquid-glass-card rounded-2xl p-6 shadow-xs space-y-5">
              <div>
                <span className="text-[11px] font-bold text-[#777777] uppercase tracking-wider block mb-1">
                  Deck Mastery Progress
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-[#202124] font-mono">
                    {masteryPercentage}%
                  </span>
                  <span className="text-xs text-[#777777]">
                    ({masteredCount} of {cards.length} mastered)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="h-2.5 w-full bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${masteryPercentage}%` }}
                  />
                </div>
              </div>

              {/* Deck info */}
              <div className="pt-3 border-t border-white/60 space-y-2 text-xs">
                <div className="flex justify-between text-[#777777]">
                  <span>Subject:</span>
                  <span className="font-semibold text-[#202124]">{activeDeck?.subject}</span>
                </div>
                <div className="flex justify-between text-[#777777]">
                  <span>Total Cards:</span>
                  <span className="font-mono font-semibold text-[#202124]">{cards.length}</span>
                </div>
                <div className="flex justify-between text-[#777777]">
                  <span>Needs Review:</span>
                  <span className="font-mono font-semibold text-rose-600">
                    {cards.length - masteredCount}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsAddingCard(true)}
                className="w-full py-2 bg-white/30 hover:bg-slate-200 text-[#202124] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Card to Deck
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {isAddingCard && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="liquid-glass-card rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#202124]">
              Add Card to &quot;{activeDeck?.title}&quot;
            </h3>
            <form onSubmit={handleCreateCard} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#202124] block mb-1">
                  Front (Question / Prompt) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter the concept, formula, or question..."
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#202124] block mb-1">
                  Back (Answer / Explanation) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter the answer, derivation, or explanation..."
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCard(false)}
                  className="px-3.5 py-2 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] transition-colors shadow-xs"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Deck Modal */}
      {isAddingDeck && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="liquid-glass-card rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#202124]">Create New Flashcard Deck</h3>
            <form onSubmit={handleCreateDeck} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#202124] block mb-1">
                  Deck Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry Reactions"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#202124] block mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chemistry"
                  value={newDeckSubject}
                  onChange={(e) => setNewDeckSubject(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDeck(false)}
                  className="px-3.5 py-2 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] transition-colors shadow-xs"
                >
                  Create Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
