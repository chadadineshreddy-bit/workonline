"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  Layers,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  Hourglass,
  FileCheck,
  CheckCircle2,
  HelpCircle,
  Hash
} from "lucide-react";

interface StudentToolItem {
  title: string;
  description: string;
  href: string;
  icon: any;
  badge: string;
  category: "Grades" | "Schedule" | "Revision" | "Productivity";
}

const STUDENT_TOOLS: StudentToolItem[] = [
  {
    title: "CGPA & SGPA Calculator",
    description:
      "Calculate your cumulative and semester Grade Point Average with customizable university credit points and letter-grade scale mappings.",
    href: "/student-zone/cgpa-calculator",
    icon: GraduationCap,
    badge: "Weighted Credits",
    category: "Grades",
  },
  {
    title: "Lecture Attendance Calculator",
    description:
      "Calculate exact bunk allowances or required future attendances to safely meet your university 75% or 85% attendance criteria.",
    href: "/student-zone/attendance-calculator",
    icon: Clock,
    badge: "Safe Bunk Margin",
    category: "Grades",
  },
  {
    title: "Weekly Study Timetable Planner",
    description:
      "Build a balanced weekly timetable distributing syllabus revisions, tutorial hours, breaks, and exam study sessions.",
    href: "/student-zone/study-planner",
    icon: Calendar,
    badge: "Auto Schedule",
    category: "Schedule",
  },
  {
    title: "Interactive Study Flashcards",
    description:
      "Craft digital active-recall decks with 3D flip card animations, spaced repetition intervals, mastery tags, and JSON deck import/export.",
    href: "/student-zone/flashcards",
    icon: Layers,
    badge: "Active Recall",
    category: "Revision",
  },
  {
    title: "Student Notes Binder",
    description:
      "Organized notebook workspace with subject tags, instant keyword search, rich markdown formatting, local autosave, and export.",
    href: "/student-zone/notes-manager",
    icon: BookOpen,
    badge: "Subject Binders",
    category: "Revision",
  },
  {
    title: "Pomodoro Study Interval Timer",
    description:
      "Laser focus timer featuring 25/5 and 50/10 intervals, ambient brown/white noise generator, session counter, and task checklists.",
    href: "/student-zone/study-timer",
    icon: Hourglass,
    badge: "Ambient Noise",
    category: "Productivity",
  },
  {
    title: "Assignment Due-Date Tracker",
    description:
      "Track project milestones, pending submissions, weighted course scores, and priority alerts sorted by urgent deadlines.",
    href: "/student-zone/assignment-tracker",
    icon: FileCheck,
    badge: "Deadline Priority",
    category: "Productivity",
  },
  {
    title: "Interactive Practice Quiz Generator",
    description:
      "Build self-testing multiple-choice or short-answer exam quizzes with automatic scoring, instant answer feedback, and review modes.",
    href: "/student-zone/quiz-generator",
    icon: HelpCircle,
    badge: "Self-Scoring",
    category: "Revision",
  },
  {
    title: "Semester SGPA Calculator",
    description:
      "Quick single-semester grade point average estimator with preset grading tables for engineering, medical, and arts colleges.",
    href: "/student-zone/sgpa-calculator",
    icon: Hash,
    badge: "Semester Focus",
    category: "Grades",
  },
  {
    title: "Academic Text & Essay Utility",
    description:
      "Live word counter, reading time estimator, character analyzer, and case converter tailored for essays and college application SOPs.",
    href: "/student-zone/text-tools",
    icon: Sparkles,
    badge: "Live Word Count",
    category: "Productivity",
  },
  {
    title: "Exam Countdown",
    description:
      "Real-time countdown ticker to final exams, entrance tests, and university midterms with venue and syllabus tracking.",
    href: "/student-zone/exam-countdown",
    icon: Calendar,
    badge: "Live Ticker",
    category: "Schedule",
  },
];

export function StudentDashboard() {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  const filteredTools =
    selectedFilter === "All"
      ? STUDENT_TOOLS
      : STUDENT_TOOLS.filter((t) => t.category === selectedFilter);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[24px] bg-[#171114] border border-white/10 p-6 sm:p-10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-[#DC2626]/30 text-[#FB7185] text-xs font-bold mb-4">
            <GraduationCap className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>WorkOnline Student Zone</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
            Academic Productivity{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#DC2626] via-[#F43F5E] to-[#FB7185]">
              Workspace.
            </span>
          </h1>
          <p className="mt-3 text-sm text-[#E2D4D6] leading-relaxed">
            A comprehensive toolkit for school, college, and university students. Calculate accurate credit-weighted GPAs, plan weekly study timetables, prevent attendance shortages, organize revision notes, and prepare with active recall flashcards.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-5 text-xs text-[#9E8E93] font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#DC2626]" />
              <span>Zero Server Uploads (100% Privacy)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#DC2626]" />
              <span>Instant Browser Calculations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#DC2626]" />
              <span>Persistent Local Study Storage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Quick Actions */}
      <div className="rounded-[20px] bg-white/[0.045] border border-white/10 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Popular Quick Actions
          </h2>
          <span className="text-[11px] text-[#9E8E93]">
            One-click academic calculators and daily study tools
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/student-zone/cgpa-calculator"
            className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#DC2626]/40 hover:bg-white/[0.06] transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#DC2626] group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate group-hover:text-[#FB7185] transition-colors">
                CGPA Calculator
              </span>
              <span className="text-[10px] text-[#9E8E93]">Weighted credits</span>
            </div>
          </Link>

          <Link
            href="/student-zone/attendance-calculator"
            className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#DC2626]/40 hover:bg-white/[0.06] transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#DC2626] group-hover:scale-105 transition-transform shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate group-hover:text-[#FB7185] transition-colors">
                Attendance Tracker
              </span>
              <span className="text-[10px] text-[#9E8E93]">Bunk allowance</span>
            </div>
          </Link>

          <Link
            href="/student-zone/study-planner"
            className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#DC2626]/40 hover:bg-white/[0.06] transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#DC2626] group-hover:scale-105 transition-transform shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate group-hover:text-[#FB7185] transition-colors">
                Study Timetable
              </span>
              <span className="text-[10px] text-[#9E8E93]">Non-overlapping</span>
            </div>
          </Link>

          <Link
            href="/student-zone/study-timer"
            className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#DC2626]/40 hover:bg-white/[0.06] transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#DC2626] group-hover:scale-105 transition-transform shrink-0">
              <Hourglass className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate group-hover:text-[#FB7185] transition-colors">
                Pomodoro Timer
              </span>
              <span className="text-[10px] text-[#9E8E93]">Focus intervals</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            All Academic Utilities ({STUDENT_TOOLS.length})
          </h2>
          <p className="text-xs text-[#9E8E93]">
            Select a category to filter your tools
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["All", "Grades", "Schedule", "Revision", "Productivity"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all ${
                selectedFilter === cat
                  ? "bg-[#DC2626] text-white shadow-sm shadow-[#DC2626]/30"
                  : "bg-white/[0.045] text-[#E2D4D6] hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-[20px] bg-white/[0.045] border border-white/10 hover:border-[#DC2626]/40 p-5 flex flex-col justify-between transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center group-hover:scale-105 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-red-500/10 text-[#FB7185] border border-[#DC2626]/30">
                    {tool.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-[#FB7185] transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-[#E2D4D6] leading-relaxed mt-2 line-clamp-2">
                  {tool.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#FB7185]">
                <span>Open Tool</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
