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
  Download,
  BookOpen,
  Save,
  Share2
} from "lucide-react";

export interface SemesterEntry {
  id: string;
  semesterName: string;
  sgpa: number | "";
  credits: number | "";
}

const PERCENTAGE_FORMULAS = [
  { id: "aicte", label: "AICTE / CBSE Standard (CGPA × 9.5)", factor: 9.5, offset: 0 },
  { id: "direct", label: "Direct Percentage (CGPA × 10)", factor: 10, offset: 0 },
  { id: "vtu", label: "VTU Karnataka ((CGPA - 0.75) × 10)", factor: 10, offset: 7.5 },
  { id: "mumbai", label: "Mumbai University (7.1 × CGPA + 11)", factor: 7.1, offset: -11 },
  { id: "custom", label: "Custom Formula", factor: 9.5, offset: 0 },
];

export function CgpaCalculatorSuite() {
  const [scale, setScale] = useState<"10" | "4">("10");
  const [semesters, setSemesters] = useState<SemesterEntry[]>([
    { id: "sem-1", semesterName: "Semester 1", sgpa: 8.4, credits: 22 },
    { id: "sem-2", semesterName: "Semester 2", sgpa: 8.7, credits: 24 },
    { id: "sem-3", semesterName: "Semester 3", sgpa: 9.1, credits: 23 },
    { id: "sem-4", semesterName: "Semester 4", sgpa: 8.9, credits: 21 },
  ]);

  const [formulaPreset, setFormulaPreset] = useState("aicte");
  const [customFactor, setCustomFactor] = useState<number>(9.5);
  const [customOffset, setCustomOffset] = useState<number>(0);
  const [savedNotification, setSavedNotification] = useState(false);

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem("workonline_cgpa_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.semesters) && parsed.semesters.length > 0) {
          setSemesters(parsed.semesters);
        }
        if (parsed.scale) setScale(parsed.scale);
        if (parsed.formulaPreset) setFormulaPreset(parsed.formulaPreset);
        if (parsed.customFactor) setCustomFactor(parsed.customFactor);
        if (parsed.customOffset) setCustomOffset(parsed.customOffset);
      } catch {
        // ignore
      }
    }
  }, []);

  const saveToLocalStorage = (sems: SemesterEntry[]) => {
    try {
      localStorage.setItem(
        "workonline_cgpa_data",
        JSON.stringify({
          semesters: sems,
          scale,
          formulaPreset,
          customFactor,
          customOffset,
        })
      );
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleAddSemester = () => {
    const nextNumber = semesters.length + 1;
    const newSem: SemesterEntry = {
      id: "sem-" + Date.now(),
      semesterName: `Semester ${nextNumber}`,
      sgpa: "",
      credits: 20,
    };
    const updated = [...semesters, newSem];
    setSemesters(updated);
    saveToLocalStorage(updated);
  };

  const handleRemoveSemester = (id: string) => {
    if (semesters.length <= 1) return;
    const updated = semesters.filter((s) => s.id !== id);
    setSemesters(updated);
    saveToLocalStorage(updated);
  };

  const handleUpdate = (
    id: string,
    field: "sgpa" | "credits" | "semesterName",
    val: any
  ) => {
    const maxSgpa = scale === "10" ? 10 : 4;
    let finalVal = val;

    if (field === "sgpa" && val !== "") {
      const num = parseFloat(val);
      if (isNaN(num)) finalVal = "";
      else finalVal = Math.min(maxSgpa, Math.max(0, num));
    } else if (field === "credits" && val !== "") {
      const num = parseFloat(val);
      if (isNaN(num)) finalVal = "";
      else finalVal = Math.max(0, num);
    }

    const updated = semesters.map((s) =>
      s.id === id ? { ...s, [field]: finalVal } : s
    );
    setSemesters(updated);
    saveToLocalStorage(updated);
  };

  const handleReset = () => {
    const defaultSems: SemesterEntry[] = [
      { id: "sem-1", semesterName: "Semester 1", sgpa: "", credits: 20 },
      { id: "sem-2", semesterName: "Semester 2", sgpa: "", credits: 20 },
    ];
    setSemesters(defaultSems);
    localStorage.removeItem("workonline_cgpa_data");
  };

  // Mathematical CGPA Calculation:
  // CGPA = Sum(SGPA * Credits) / Sum(Credits)
  const calculationResult = useMemo(() => {
    let totalWeightedPoints = 0;
    let totalCredits = 0;
    let validSemestersCount = 0;

    for (const sem of semesters) {
      const sgpaNum = typeof sem.sgpa === "number" ? sem.sgpa : parseFloat(String(sem.sgpa));
      const credNum = typeof sem.credits === "number" ? sem.credits : parseFloat(String(sem.credits));

      if (!isNaN(sgpaNum) && sgpaNum >= 0 && !isNaN(credNum) && credNum > 0) {
        totalWeightedPoints += sgpaNum * credNum;
        totalCredits += credNum;
        validSemestersCount++;
      }
    }

    const cgpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;

    // Percentage Calculation
    let activeFactor = customFactor;
    let activeOffset = customOffset;

    if (formulaPreset !== "custom") {
      const preset = PERCENTAGE_FORMULAS.find((f) => f.id === formulaPreset);
      if (preset) {
        activeFactor = preset.factor;
        activeOffset = preset.offset;
      }
    }

    let calculatedPercentage = cgpa * activeFactor - activeOffset;
    calculatedPercentage = Math.max(0, Math.min(100, calculatedPercentage));

    return {
      cgpa: cgpa > 0 ? cgpa.toFixed(2) : "0.00",
      numericCgpa: cgpa,
      totalCredits,
      totalWeightedPoints: totalWeightedPoints.toFixed(1),
      validSemestersCount,
      percentage: calculatedPercentage.toFixed(1),
    };
  }, [semesters, formulaPreset, customFactor, customOffset]);

  const maxScaleVal = scale === "10" ? 10 : 4;
  const cgpaNumber = calculationResult.numericCgpa;
  const progressPercent = (cgpaNumber / maxScaleVal) * 100;

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
              <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center text-[#F04452]">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Cumulative GPA (CGPA) Calculator
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
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#777777]" />
              <span>Reset</span>
            </button>
            <Link
              href="/student-zone/sgpa-calculator"
              className="liquid-btn-primary px-3.5 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <span>SGPA Calculator →</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Intro */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
            Credit-Weighted CGPA Calculator
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-3xl">
            Calculates your official cumulative grade point average using strict credit weighting:
            <code className="text-[#F04452] bg-red-500/10 px-1.5 py-0.5 rounded mx-1 font-mono text-xs">
              CGPA = Σ(SGPA × Credits) / Σ(Credits)
            </code>
            . Avoids erroneous simple arithmetic averaging when semesters have varying credit loads.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Semesters List */}
          <div className="lg:col-span-7 space-y-6">
            {/* Scale Selector */}
            <div className="liquid-glass-card rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#202124] uppercase tracking-wider block">
                  Grading Scale
                </span>
                <span className="text-[11px] text-[#777777]">
                  Select your university standard scale
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScale("10")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    scale === "10"
                      ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white shadow-xs"
                      : "bg-white/30 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  10.0 Scale
                </button>
                <button
                  onClick={() => setScale("4")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    scale === "4"
                      ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white shadow-xs"
                      : "bg-white/30 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  4.0 US Scale
                </button>
              </div>
            </div>

            {/* Semester Inputs Table */}
            <div className="liquid-glass-card rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-white/80 flex items-center justify-between bg-white/20">
                <span className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                  Semester Transcript ({semesters.length} Semesters)
                </span>
                <button
                  onClick={handleAddSemester}
                  className="liquid-btn-primary px-3 py-1 text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Semester
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-12 gap-3 text-[11px] font-bold text-[#777777] uppercase tracking-wider px-2">
                  <div className="col-span-5">Semester Name</div>
                  <div className="col-span-3">SGPA (Max {maxScaleVal})</div>
                  <div className="col-span-3">Credits</div>
                  <div className="col-span-1 text-right">Action</div>
                </div>

                {semesters.map((sem, index) => (
                  <div
                    key={sem.id}
                    className="grid grid-cols-12 gap-3 items-center p-2 rounded-lg bg-white/20 border border-white/80 hover:border-slate-300 transition-colors"
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={sem.semesterName}
                        onChange={(e) => handleUpdate(sem.id, "semesterName", e.target.value)}
                        placeholder={`Semester ${index + 1}`}
                        className="w-full text-xs px-2.5 py-1.5 rounded border border-white/80 bg-white font-medium text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        max={maxScaleVal}
                        step="0.01"
                        value={sem.sgpa}
                        onChange={(e) => handleUpdate(sem.id, "sgpa", e.target.value)}
                        placeholder={`0.00 - ${maxScaleVal}`}
                        className="w-full text-xs px-2.5 py-1.5 rounded border border-white/80 bg-white font-mono font-semibold text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={sem.credits}
                        onChange={(e) => handleUpdate(sem.id, "credits", e.target.value)}
                        placeholder="e.g. 22"
                        className="w-full text-xs px-2.5 py-1.5 rounded border border-white/80 bg-white font-mono text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                      />
                    </div>

                    <div className="col-span-1 text-right">
                      {semesters.length > 1 && (
                        <button
                          onClick={() => handleRemoveSemester(sem.id)}
                          className="text-[#777777] hover:text-rose-600 transition-colors p-1"
                          title="Remove semester"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-white/80 bg-white/20 flex items-center justify-between text-xs text-[#777777]">
                <span>
                  Entered credits: <strong>{calculationResult.totalCredits}</strong> across{" "}
                  <strong>{calculationResult.validSemestersCount}</strong> evaluated semesters.
                </span>
                <button
                  onClick={handleAddSemester}
                  className="text-[#F04452] hover:text-[#D72638] font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Another Semester
                </button>
              </div>
            </div>

            {/* Percentage Formula Configurator */}
            <div className="liquid-glass-card rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#F04452]" /> Institution Percentage Formula
                  </h3>
                  <p className="text-[11px] text-[#777777]">
                    Different universities apply different conversion standards. Select or customize yours.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-medium text-slate-600">Formula Preset</label>
                  <select
                    value={formulaPreset}
                    onChange={(e) => setFormulaPreset(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 bg-white focus:outline-none"
                  >
                    {PERCENTAGE_FORMULAS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formulaPreset === "custom" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">Multiplier Factor</label>
                      <input
                        type="number"
                        step="0.01"
                        value={customFactor}
                        onChange={(e) => setCustomFactor(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 bg-white font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">Offset (Minus)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={customOffset}
                        onChange={(e) => setCustomOffset(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 bg-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="floating-glass-canvas rounded-3xl shadow-xl p-6 space-y-6 sticky top-24">
              <div>
                <span className="text-[11px] font-bold text-[#777777] uppercase tracking-wider block mb-1">
                  Cumulative Grade Point Average
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[#202124] tracking-tight font-mono">
                    {calculationResult.cgpa}
                  </span>
                  <span className="text-base font-semibold text-[#777777]">
                    / {maxScaleVal}.0
                  </span>
                </div>
              </div>

              {/* Visual meter */}
              <div>
                <div className="h-3 w-full bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF737D] via-[#F04452] to-[#D72638] transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, progressPercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#777777] mt-1 font-mono">
                  <span>0.0</span>
                  <span>{(maxScaleVal * 0.5).toFixed(1)}</span>
                  <span>{maxScaleVal}.0</span>
                </div>
              </div>

              {/* Conversion Output */}
              <div className="p-4 rounded-xl bg-red-500/10 border border-[#F04452]/20 space-y-1">
                <span className="text-[11px] font-bold text-[#202124] uppercase tracking-wider">
                  Equivalent Percentage
                </span>
                <div className="text-3xl font-extrabold text-[#D72638] font-mono">
                  {calculationResult.percentage}%
                </div>
                <p className="text-[11px] text-[#F04452]">
                  Calculated based on selected institution multiplier.
                </p>
              </div>

              {/* Calculation Breakdown Stats */}
              <div className="space-y-2.5 pt-2 border-t border-white/60 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Quality Points:</span>
                  <span className="font-bold text-[#202124] font-mono">
                    {calculationResult.totalWeightedPoints}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Cumulative Credits:</span>
                  <span className="font-bold text-[#202124] font-mono">
                    {calculationResult.totalCredits}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Completed Semesters:</span>
                  <span className="font-bold text-[#202124]">
                    {calculationResult.validSemestersCount} of {semesters.length}
                  </span>
                </div>
              </div>

              {/* Formula Callout */}
              <div className="p-3 bg-white/20 rounded-xl border border-white/80 text-slate-600 text-xs leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-[#202124] mb-1">
                  <Info className="w-3.5 h-3.5 text-[#F04452]" /> Mathematical Formula
                </div>
                <p className="text-[11px] text-[#777777]">
                  CGPA = (S₁×C₁ + S₂×C₂ + ... + Sₙ×Cₙ) / (C₁ + C₂ + ... + Cₙ)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
