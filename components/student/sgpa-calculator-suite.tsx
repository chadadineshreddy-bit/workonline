"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Plus,
  Trash2,
  RotateCcw,
  Award,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Info,
  Sliders,
  BookOpen
} from "lucide-react";

export interface SgpaSubject {
  id: string;
  name: string;
  credits: number | "";
  gradeKey: string;
  customGradePoint?: number;
}

interface GradeDef {
  key: string;
  label: string;
  point: number;
}

const GRADES_10: GradeDef[] = [
  { key: "O", label: "O (Outstanding - 10)", point: 10 },
  { key: "A+", label: "A+ (Excellent - 9)", point: 9 },
  { key: "A", label: "A (Very Good - 8)", point: 8 },
  { key: "B+", label: "B+ (Good - 7)", point: 7 },
  { key: "B", label: "B (Above Average - 6)", point: 6 },
  { key: "C", label: "C (Average - 5)", point: 5 },
  { key: "P", label: "P (Pass - 4)", point: 4 },
  { key: "F", label: "F (Fail - 0)", point: 0 },
];

const GRADES_4: GradeDef[] = [
  { key: "A", label: "A (4.0)", point: 4.0 },
  { key: "A-", label: "A- (3.7)", point: 3.7 },
  { key: "B+", label: "B+ (3.3)", point: 3.3 },
  { key: "B", label: "B (3.0)", point: 3.0 },
  { key: "B-", label: "B- (2.7)", point: 2.7 },
  { key: "C+", label: "C+ (2.3)", point: 2.3 },
  { key: "C", label: "C (2.0)", point: 2.0 },
  { key: "D", label: "D (1.0)", point: 1.0 },
  { key: "F", label: "F (0.0)", point: 0.0 },
];

export function SgpaCalculatorSuite() {
  const [scale, setScale] = useState<"10" | "4">("10");
  const [semesterTitle, setSemesterTitle] = useState("Semester 5");
  const [subjects, setSubjects] = useState<SgpaSubject[]>([
    { id: "sub-1", name: "Design & Analysis of Algorithms", credits: 4, gradeKey: "O" },
    { id: "sub-2", name: "Computer Networks & Protocols", credits: 4, gradeKey: "A+" },
    { id: "sub-3", name: "Database Management Systems", credits: 3, gradeKey: "A" },
    { id: "sub-4", name: "Formal Language & Automata Theory", credits: 4, gradeKey: "B+" },
    { id: "sub-5", name: "Web Technologies Laboratory", credits: 2, gradeKey: "O" },
  ]);

  const [savedNotification, setSavedNotification] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("workonline_sgpa_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
          setSubjects(parsed.subjects);
        }
        if (parsed.scale) setScale(parsed.scale);
        if (parsed.semesterTitle) setSemesterTitle(parsed.semesterTitle);
      } catch {
        // ignore
      }
    }
  }, []);

  const saveToLocalStorage = (subs: SgpaSubject[]) => {
    try {
      localStorage.setItem(
        "workonline_sgpa_data",
        JSON.stringify({
          subjects: subs,
          scale,
          semesterTitle,
        })
      );
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 2000);
    } catch {
      // ignore
    }
  };

  const activeGrades = scale === "10" ? GRADES_10 : GRADES_4;

  const handleAddSubject = () => {
    const newSub: SgpaSubject = {
      id: "sub-" + Date.now(),
      name: `Subject ${subjects.length + 1}`,
      credits: 3,
      gradeKey: scale === "10" ? "A+" : "A",
    };
    const updated = [...subjects, newSub];
    setSubjects(updated);
    saveToLocalStorage(updated);
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) return;
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    saveToLocalStorage(updated);
  };

  const handleUpdate = (id: string, field: keyof SgpaSubject, val: any) => {
    const updated = subjects.map((s) => (s.id === id ? { ...s, [field]: val } : s));
    setSubjects(updated);
    saveToLocalStorage(updated);
  };

  const handleReset = () => {
    const defaultSubs: SgpaSubject[] = [
      { id: "sub-1", name: "Subject 1", credits: 3, gradeKey: scale === "10" ? "O" : "A" },
      { id: "sub-2", name: "Subject 2", credits: 4, gradeKey: scale === "10" ? "A+" : "A" },
    ];
    setSubjects(defaultSubs);
    localStorage.removeItem("workonline_sgpa_data");
  };

  // SGPA = Sum(Grade Point * Credits) / Sum(Credits)
  const calculationResult = useMemo(() => {
    let totalQualityPoints = 0;
    let totalCredits = 0;
    let validSubjectCount = 0;

    for (const sub of subjects) {
      const credNum = typeof sub.credits === "number" ? sub.credits : parseFloat(String(sub.credits));
      const gradeDef = activeGrades.find((g) => g.key === sub.gradeKey);
      const gradePoint = gradeDef ? gradeDef.point : 0;

      if (!isNaN(credNum) && credNum > 0) {
        totalQualityPoints += gradePoint * credNum;
        totalCredits += credNum;
        validSubjectCount++;
      }
    }

    const sgpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
    const maxVal = scale === "10" ? 10 : 4;
    const percentage = scale === "10" ? sgpa * 9.5 : (sgpa / 4.0) * 100;

    return {
      sgpa: sgpa > 0 ? sgpa.toFixed(2) : "0.00",
      numericSgpa: sgpa,
      totalCredits,
      totalQualityPoints: totalQualityPoints.toFixed(1),
      validSubjectCount,
      percentage: Math.min(100, Math.max(0, percentage)).toFixed(1),
      maxVal,
    };
  }, [subjects, scale, activeGrades]);

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
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Semester GPA (SGPA) Calculator
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedNotification && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mr-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Auto-saved
              </span>
            )}
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#777777]" />
              <span>Reset</span>
            </button>
            <Link
              href="/student-zone/cgpa-calculator"
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-medium hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>CGPA Calculator →</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
            Semester Grade Point Average (SGPA)
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-3xl">
            Calculates your semester performance based on subject credit ratings and individual letter grades:
            <code className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mx-1 font-mono text-xs">
              SGPA = Σ(Grade Point × Subject Credits) / Σ(Credits)
            </code>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Subjects List */}
          <div className="lg:col-span-7 space-y-6">
            {/* Scale & Semester Title */}
            <div className="liquid-glass-card rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#777777] uppercase tracking-wider block">
                  Semester Label
                </label>
                <input
                  type="text"
                  value={semesterTitle}
                  onChange={(e) => setSemesterTitle(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-white/80 bg-white font-semibold text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#777777] font-medium">Grading System:</span>
                <button
                  onClick={() => setScale("10")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    scale === "10"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white/30 text-[#777777] hover:bg-slate-200"
                  }`}
                >
                  10-Point Scale
                </button>
                <button
                  onClick={() => setScale("4")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    scale === "4"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white/30 text-[#777777] hover:bg-slate-200"
                  }`}
                >
                  4.0 Scale
                </button>
              </div>
            </div>

            {/* Subjects Table */}
            <div className="liquid-glass-card rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-white/80 flex items-center justify-between bg-white/20">
                <span className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                  Course Subjects ({subjects.length})
                </span>
                <button
                  onClick={handleAddSubject}
                  className="px-3 py-1 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Course
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-12 gap-3 text-[11px] font-bold text-[#777777] uppercase tracking-wider px-2">
                  <div className="col-span-5">Subject / Course Name</div>
                  <div className="col-span-2">Credits</div>
                  <div className="col-span-4">Grade Received</div>
                  <div className="col-span-1 text-right">Del</div>
                </div>

                {subjects.map((sub, index) => {
                  const gradeDef = activeGrades.find((g) => g.key === sub.gradeKey);
                  return (
                    <div
                      key={sub.id}
                      className="grid grid-cols-12 gap-3 items-center p-2 rounded-lg bg-white/20 border border-white/80 hover:border-white/80 transition-colors"
                    >
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={sub.name}
                          onChange={(e) => handleUpdate(sub.id, "name", e.target.value)}
                          placeholder={`Subject ${index + 1}`}
                          className="w-full text-xs px-2.5 py-1.5 rounded border border-white/80 bg-white font-medium text-[#202124] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={sub.credits}
                          onChange={(e) =>
                            handleUpdate(sub.id, "credits", parseFloat(e.target.value) || "")
                          }
                          placeholder="e.g. 4"
                          className="w-full text-xs px-2.5 py-1.5 rounded border border-white/80 bg-white font-mono text-[#202124] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="col-span-4">
                        <select
                          value={sub.gradeKey}
                          onChange={(e) => handleUpdate(sub.id, "gradeKey", e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded border border-white/80 bg-white font-medium text-[#202124] focus:outline-none"
                        >
                          {activeGrades.map((g) => (
                            <option key={g.key} value={g.key}>
                              {g.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-1 text-right">
                        {subjects.length > 1 && (
                          <button
                            onClick={() => handleRemoveSubject(sub.id)}
                            className="text-[#777777] hover:text-rose-600 transition-colors p-1"
                            title="Remove course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-white/80 bg-white/20 flex items-center justify-between text-xs text-[#777777]">
                <span>
                  Total semester credits: <strong>{calculationResult.totalCredits}</strong>
                </span>
                <button
                  onClick={handleAddSubject}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Subject
                </button>
              </div>
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="floating-glass-canvas rounded-3xl shadow-xl p-6 space-y-6 sticky top-24">
              <div>
                <span className="text-[11px] font-bold text-[#777777] uppercase tracking-wider block mb-1">
                  {semesterTitle} SGPA
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[#202124] tracking-tight font-mono">
                    {calculationResult.sgpa}
                  </span>
                  <span className="text-base font-semibold text-[#777777]">
                    / {calculationResult.maxVal}.0
                  </span>
                </div>
              </div>

              {/* Meter */}
              <div>
                <div className="h-3 w-full bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500 rounded-full"
                    style={{
                      width: `${(calculationResult.numericSgpa / calculationResult.maxVal) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#777777] mt-1 font-mono">
                  <span>0.0</span>
                  <span>{(calculationResult.maxVal * 0.5).toFixed(1)}</span>
                  <span>{calculationResult.maxVal}.0</span>
                </div>
              </div>

              {/* Conversion percentage */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                  Approx. Semester Percentage
                </span>
                <div className="text-3xl font-extrabold text-emerald-700 font-mono">
                  {calculationResult.percentage}%
                </div>
                <p className="text-[11px] text-emerald-600">
                  {scale === "10" ? "Standard (SGPA × 9.5) estimation" : "Percentage relative to 4.0"}
                </p>
              </div>

              {/* Subject Breakdown list */}
              <div className="space-y-2 pt-2 border-t border-white/60 text-xs">
                <span className="font-bold text-[#202124] block text-[11px] uppercase tracking-wider">
                  Course Contribution Breakdown
                </span>
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
                  {subjects.map((sub) => {
                    const gradeDef = activeGrades.find((g) => g.key === sub.gradeKey);
                    const pts = (Number(sub.credits) || 0) * (gradeDef ? gradeDef.point : 0);
                    return (
                      <div key={sub.id} className="py-1.5 flex justify-between text-[#777777]">
                        <span className="truncate max-w-[180px]">{sub.name || "Subject"}</span>
                        <span className="font-mono text-[#202124]">
                          {sub.credits} cr × {gradeDef?.point} pt = <strong>{pts}</strong>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quality point total */}
              <div className="pt-2 border-t border-white/80 text-xs flex justify-between">
                <span className="text-[#777777]">Total Quality Points:</span>
                <span className="font-mono font-bold text-[#202124]">
                  {calculationResult.totalQualityPoints}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
