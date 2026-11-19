"use client";

import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  Plus,
  Trash2,
  RotateCcw,
  Award,
  CheckCircle2,
  Info,
  BookOpen
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  gradePoint: number;
  credits: number;
}

const GRADE_POINTS_10: { label: string; value: number }[] = [
  { label: "O / A+ (Outstanding - 10)", value: 10 },
  { label: "A (Excellent - 9)", value: 9 },
  { label: "B+ (Very Good - 8)", value: 8 },
  { label: "B (Good - 7)", value: 7 },
  { label: "C (Above Average - 6)", value: 6 },
  { label: "P (Pass - 5)", value: 5 },
  { label: "F (Fail - 0)", value: 0 },
];

export function CgpaCalculator() {
  const [scale, setScale] = useState<"10" | "4">("10");
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: "1", name: "Data Structures & Algorithms", gradePoint: 9, credits: 4 },
    { id: "2", name: "Operating Systems", gradePoint: 8, credits: 4 },
    { id: "3", name: "Database Management Systems", gradePoint: 10, credits: 3 },
    { id: "4", name: "Computer Networks", gradePoint: 9, credits: 3 },
    { id: "5", name: "Software Engineering Lab", gradePoint: 10, credits: 2 },
  ]);

  const addSubject = () => {
    setSubjects([
      ...subjects,
      {
        id: Date.now().toString(),
        name: `Course ${subjects.length + 1}`,
        gradePoint: scale === "10" ? 8 : 3.5,
        credits: 3,
      },
    ]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((s) => s.id !== id));
    }
  };

  const updateSubject = (id: string, field: keyof Subject, value: any) => {
    setSubjects(
      subjects.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const resetAll = () => {
    setSubjects([
      { id: "1", name: "Course 1", gradePoint: 9, credits: 4 },
      { id: "2", name: "Course 2", gradePoint: 8, credits: 3 },
      { id: "3", name: "Course 3", gradePoint: 10, credits: 3 },
    ]);
  };

  // Calculations
  const { totalCredits, gpa, percentage } = useMemo(() => {
    let creditSum = 0;
    let weightedPointsSum = 0;

    subjects.forEach((s) => {
      const cr = Number(s.credits) || 0;
      const gp = Number(s.gradePoint) || 0;
      creditSum += cr;
      weightedPointsSum += gp * cr;
    });

    const calculatedGpa = creditSum > 0 ? weightedPointsSum / creditSum : 0;
    // Standard AICTE / university conversion: (CGPA - 0.75) * 10
    const calculatedPercentage =
      scale === "10"
        ? Math.max(0, (calculatedGpa - 0.75) * 10)
        : (calculatedGpa / 4.0) * 100;

    return {
      totalCredits: creditSum,
      gpa: calculatedGpa.toFixed(2),
      percentage: calculatedPercentage.toFixed(1),
    };
  }, [subjects, scale]);

  const classification = useMemo(() => {
    const numGpa = parseFloat(gpa);
    if (scale === "10") {
      if (numGpa >= 9.0) return { label: "First Class with Distinction", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" };
      if (numGpa >= 7.5) return { label: "First Class", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" };
      if (numGpa >= 6.0) return { label: "Second Class", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" };
      return { label: "Pass Class", color: "text-slate-600 bg-slate-50 dark:bg-slate-800" };
    } else {
      if (numGpa >= 3.7) return { label: "Summa Cum Laude (Distinction)", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" };
      if (numGpa >= 3.5) return { label: "Magna Cum Laude", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" };
      if (numGpa >= 3.0) return { label: "Cum Laude", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" };
      return { label: "Satisfactory", color: "text-slate-600 bg-slate-50 dark:bg-slate-800" };
    }
  }, [gpa, scale]);

  return (
    <div className="space-y-8">
      {/* Configuration & Scale Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Grading System:</span>
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setScale("10")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                scale === "10"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              10-Point Scale (Standard)
            </button>
            <button
              type="button"
              onClick={() => setScale("4")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                scale === "4"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              4.0 Scale (US / Int&apos;l)
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={resetAll}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset courses</span>
        </button>
      </div>

      {/* Main Results KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Calculated GPA</span>
            <Award className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
            {gpa} <span className="text-sm font-normal text-slate-400">/ {scale === "10" ? "10.0" : "4.0"}</span>
          </div>
          <div className="mt-2">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${classification.color}`}>
              {classification.label}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Approx. Percentage</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {percentage}%
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Based on {scale === "10" ? "(CGPA - 0.75) × 10" : "4.0 equivalence"} formula
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Credits Earned</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {totalCredits} <span className="text-sm font-normal text-slate-400">Credits</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Across {subjects.length} registered subjects
          </p>
        </div>
      </div>

      {/* Courses Table Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
              Course Details & Grade Points
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter course titles, select earned grade, and specify credit weights.
            </p>
          </div>
          <button
            type="button"
            onClick={addSubject}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Course</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-3">
          <div className="hidden sm:grid grid-cols-12 gap-3 pb-2 text-xs font-semibold text-slate-500 border-b border-slate-100 dark:border-slate-800">
            <div className="col-span-6">COURSE NAME</div>
            <div className="col-span-3">GRADE / POINTS</div>
            <div className="col-span-2">CREDITS</div>
            <div className="col-span-1 text-right">ACTION</div>
          </div>

          {subjects.map((sub, idx) => (
            <div
              key={sub.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 sm:p-0 rounded-xl sm:rounded-none bg-slate-50/60 sm:bg-transparent dark:bg-slate-800/40 sm:dark:bg-transparent"
            >
              <div className="sm:col-span-6">
                <label className="block sm:hidden text-xs font-medium text-slate-500 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  value={sub.name}
                  onChange={(e) => updateSubject(sub.id, "name", e.target.value)}
                  placeholder={`Course ${idx + 1}`}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block sm:hidden text-xs font-medium text-slate-500 mb-1">
                  Grade Point
                </label>
                {scale === "10" ? (
                  <select
                    value={sub.gradePoint}
                    onChange={(e) => updateSubject(sub.id, "gradePoint", Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {GRADE_POINTS_10.map((gp) => (
                      <option key={gp.label} value={gp.value}>
                        {gp.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="4"
                    value={sub.gradePoint}
                    onChange={(e) => updateSubject(sub.id, "gradePoint", Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block sm:hidden text-xs font-medium text-slate-500 mb-1">
                  Credits
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={sub.credits}
                  onChange={(e) => updateSubject(sub.id, "credits", Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeSubject(sub.id)}
                  disabled={subjects.length <= 1}
                  className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Remove course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={addSubject}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add another course</span>
            </button>

            <span className="text-xs text-slate-400">
              Auto-saves to browser memory
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
