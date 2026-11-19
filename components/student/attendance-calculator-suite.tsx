"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Sliders,
  ChevronRight,
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  AlertCircle
} from "lucide-react";

interface SubjectAttendance {
  id: string;
  name: string;
  attended: number;
  total: number;
}

export function AttendanceCalculatorSuite() {
  const [activeTab, setActiveTab] = useState<"quick" | "subjects">("quick");

  // Single Quick Calculator state
  const [totalClasses, setTotalClasses] = useState<number | "">(48);
  const [attendedClasses, setAttendedClasses] = useState<number | "">(39);
  const [targetPercentage, setTargetPercentage] = useState<number>(75);

  // Subject-wise multi tracker state
  const [subjects, setSubjects] = useState<SubjectAttendance[]>([
    { id: "s1", name: "Data Structures & Algorithms", attended: 28, total: 32 },
    { id: "s2", name: "Computer Architecture", attended: 22, total: 30 },
    { id: "s3", name: "Database Systems", attended: 25, total: 28 },
    { id: "s4", name: "Discrete Mathematics", attended: 19, total: 26 },
  ]);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("workonline_attendance_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.totalClasses !== undefined) setTotalClasses(parsed.totalClasses);
        if (parsed.attendedClasses !== undefined) setAttendedClasses(parsed.attendedClasses);
        if (parsed.targetPercentage !== undefined) setTargetPercentage(parsed.targetPercentage);
        if (Array.isArray(parsed.subjects) && parsed.subjects.length > 0) setSubjects(parsed.subjects);
      } catch {
        // ignore
      }
    }
  }, []);

  const saveToLocalStorage = (
    tot: number | "",
    att: number | "",
    target: number,
    subs: SubjectAttendance[]
  ) => {
    try {
      localStorage.setItem(
        "workonline_attendance_data",
        JSON.stringify({
          totalClasses: tot,
          attendedClasses: att,
          targetPercentage: target,
          subjects: subs,
        })
      );
    } catch {
      // ignore
    }
  };

  // Quick stats calculation
  const quickStats = useMemo(() => {
    const tot = typeof totalClasses === "number" ? Math.max(0, totalClasses) : 0;
    let att = typeof attendedClasses === "number" ? Math.max(0, attendedClasses) : 0;
    const target = Math.max(1, Math.min(99, Number(targetPercentage) || 75));

    if (att > tot) {
      att = tot;
    }

    const missed = tot - att;

    if (tot === 0) {
      return {
        tot: 0,
        att: 0,
        missed: 0,
        percent: 0,
        formattedPercent: "0.0",
        isSafe: true,
        bunkable: 0,
        needed: 0,
        target,
      };
    }

    const percent = (att / tot) * 100;
    const isSafe = percent >= target;

    // How many classes can be safely missed:
    // (att) / (tot + x) >= target / 100
    // att >= (target/100)*(tot + x)
    // x <= (100*att - target*tot) / target
    let bunkable = 0;
    if (isSafe && target > 0) {
      bunkable = Math.floor((100 * att - target * tot) / target);
      if (bunkable < 0) bunkable = 0;
    }

    // How many classes need to be attended:
    // (att + y) / (tot + y) >= target / 100
    // 100*att + 100*y >= target*tot + target*y
    // y * (100 - target) >= target*tot - 100*att
    let needed = 0;
    if (!isSafe && target < 100) {
      needed = Math.ceil((target * tot - 100 * att) / (100 - target));
      if (needed < 0) needed = 0;
    }

    return {
      tot,
      att,
      missed,
      percent,
      formattedPercent: percent.toFixed(1),
      isSafe,
      bunkable,
      needed,
      target,
    };
  }, [totalClasses, attendedClasses, targetPercentage]);

  // Combined subject stats
  const combinedStats = useMemo(() => {
    let sumAtt = 0;
    let sumTot = 0;

    for (const sub of subjects) {
      const a = Math.max(0, Number(sub.attended) || 0);
      const t = Math.max(a, Number(sub.total) || 0);
      sumAtt += a;
      sumTot += t;
    }

    const target = Number(targetPercentage) || 75;
    const overallPercent = sumTot > 0 ? (sumAtt / sumTot) * 100 : 0;
    const isSafe = overallPercent >= target;

    let bunkable = 0;
    if (isSafe && target > 0 && sumTot > 0) {
      bunkable = Math.floor((100 * sumAtt - target * sumTot) / target);
      if (bunkable < 0) bunkable = 0;
    }

    let needed = 0;
    if (!isSafe && target < 100 && sumTot > 0) {
      needed = Math.ceil((target * sumTot - 100 * sumAtt) / (100 - target));
      if (needed < 0) needed = 0;
    }

    return {
      sumAtt,
      sumTot,
      overallPercent: overallPercent.toFixed(1),
      isSafe,
      bunkable,
      needed,
    };
  }, [subjects, targetPercentage]);

  const handleResetQuick = () => {
    setTotalClasses(0);
    setAttendedClasses(0);
    saveToLocalStorage(0, 0, targetPercentage, subjects);
  };

  const handleAddSubject = () => {
    const newSub: SubjectAttendance = {
      id: "sub-" + Date.now(),
      name: `Subject ${subjects.length + 1}`,
      attended: 0,
      total: 0,
    };
    const updated = [...subjects, newSub];
    setSubjects(updated);
    saveToLocalStorage(totalClasses, attendedClasses, targetPercentage, updated);
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) return;
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    saveToLocalStorage(totalClasses, attendedClasses, targetPercentage, updated);
  };

  const handleUpdateSubject = (
    id: string,
    field: "name" | "attended" | "total",
    val: any
  ) => {
    const updated = subjects.map((s) => {
      if (s.id === id) {
        if (field === "attended") {
          const num = Math.max(0, parseInt(val, 10) || 0);
          return { ...s, attended: num };
        }
        if (field === "total") {
          const num = Math.max(0, parseInt(val, 10) || 0);
          return { ...s, total: num };
        }
        return { ...s, [field]: val };
      }
      return s;
    });
    setSubjects(updated);
    saveToLocalStorage(totalClasses, attendedClasses, targetPercentage, updated);
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
              <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                <Clock className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Attendance Calculator & Bunk Planner
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetQuick}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#777777]" />
              <span>Reset</span>
            </button>
            <Link
              href="/student-zone/study-planner"
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-medium hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Study Planner →</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
            Class Attendance Calculator
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-3xl">
            Track conducted classes, compute percentage, and instantly know how many upcoming lectures you can safely miss or must attend to meet mandatory attendance criteria.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-white/80 mb-8 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("quick")}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "quick"
                ? "border-blue-600 text-[#F04452]"
                : "border-transparent text-[#777777] hover:text-[#202124]"
            }`}
          >
            <span>Overall Class Calculator</span>
          </button>
          <button
            onClick={() => setActiveTab("subjects")}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "subjects"
                ? "border-blue-600 text-[#F04452]"
                : "border-transparent text-[#777777] hover:text-[#202124]"
            }`}
          >
            <span>Subject-Wise Attendance Tracker ({subjects.length})</span>
          </button>
        </div>

        {/* TAB 1: Quick Single Calculator */}
        {activeTab === "quick" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="liquid-glass-card rounded-2xl p-6 shadow-xs space-y-5">
                <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#F04452]" /> Enter Class Attendance Numbers
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#202124] block mb-1">
                      Total Classes Conducted
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={totalClasses}
                      onChange={(e) => {
                        const val = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                        setTotalClasses(val);
                        saveToLocalStorage(val, attendedClasses, targetPercentage, subjects);
                      }}
                      placeholder="e.g. 48"
                      className="w-full text-sm px-3 py-2 rounded-lg border border-white/80 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#202124] block mb-1">
                      Classes Attended
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={typeof totalClasses === "number" ? totalClasses : 1000}
                      value={attendedClasses}
                      onChange={(e) => {
                        const val = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                        setAttendedClasses(val);
                        saveToLocalStorage(totalClasses, val, targetPercentage, subjects);
                      }}
                      placeholder="e.g. 39"
                      className="w-full text-sm px-3 py-2 rounded-lg border border-white/80 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                    />
                  </div>
                </div>

                {/* Target percentage selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-[#202124]">
                      Required Attendance Target: <strong className="text-[#F04452] font-mono">{targetPercentage}%</strong>
                    </label>
                    <div className="flex gap-1.5">
                      {[75, 80, 85, 90].map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setTargetPercentage(t);
                            saveToLocalStorage(totalClasses, attendedClasses, t, subjects);
                          }}
                          className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                            targetPercentage === t
                              ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white font-bold"
                              : "bg-white/30 text-[#777777] hover:bg-slate-200"
                          }`}
                        >
                          {t}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="1"
                    value={targetPercentage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setTargetPercentage(val);
                      saveToLocalStorage(totalClasses, attendedClasses, val, subjects);
                    }}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Derived Metrics Bar */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/60 text-center">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <span className="text-[10px] text-[#777777] uppercase tracking-wider block font-bold">
                      Classes Attended
                    </span>
                    <span className="text-base font-bold text-[#202124] font-mono">
                      {quickStats.att}
                    </span>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <span className="text-[10px] text-[#777777] uppercase tracking-wider block font-bold">
                      Classes Missed
                    </span>
                    <span className="text-base font-bold text-rose-600 font-mono">
                      {quickStats.missed}
                    </span>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <span className="text-[10px] text-[#777777] uppercase tracking-wider block font-bold">
                      Total Conducted
                    </span>
                    <span className="text-base font-bold text-[#202124] font-mono">
                      {quickStats.tot}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formula & Policy Note */}
              <div className="p-4 liquid-glass-card rounded-2xl text-xs text-[#777777] space-y-2">
                <span className="font-bold text-[#202124] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#F04452]" /> Attendance Calculation Rules
                </span>
                <p className="text-[11px] text-[#777777] leading-relaxed">
                  Formula: <code className="font-mono bg-white/30 px-1 py-0.5 rounded text-[#202124]">Percentage = (Attended / Total) × 100</code>.
                  Bunk tolerance calculates the maximum future classes that can be missed consecutively before dropping below {quickStats.target}%.
                </p>
              </div>
            </div>

            {/* Result Visual Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="floating-glass-canvas rounded-3xl shadow-xl p-6 space-y-6 sticky top-24">
                <div>
                  <span className="text-[11px] font-bold text-[#777777] uppercase tracking-wider block mb-1">
                    Current Attendance
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-5xl font-black tracking-tight font-mono ${
                        quickStats.isSafe ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {quickStats.formattedPercent}%
                    </span>
                    <span className="text-xs font-semibold text-[#777777]">
                      Target: {quickStats.target}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="h-3 w-full bg-white/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        quickStats.isSafe ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(100, quickStats.percent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#777777] mt-1 font-mono">
                    <span>0%</span>
                    <span className="text-[#F04452] font-bold">Target {quickStats.target}%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Strategic Advice Card */}
                {quickStats.tot === 0 ? (
                  <div className="p-4 rounded-xl bg-white/20 border border-white/80 text-xs text-[#777777]">
                    Enter your total conducted lectures to generate attendance analysis.
                  </div>
                ) : quickStats.isSafe ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Attendance Safe & On Track
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      You can safely miss up to{" "}
                      <strong className="text-emerald-950 font-bold text-sm underline">
                        {quickStats.bunkable}
                      </strong>{" "}
                      upcoming classes and still maintain at least {quickStats.target}% attendance.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600" /> Shortage Warning
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      You are currently below target. You must attend the next{" "}
                      <strong className="text-rose-950 font-bold text-sm underline">
                        {quickStats.needed}
                      </strong>{" "}
                      classes continuously without missing any to reach {quickStats.target}%.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Multi Subject Tracker */}
        {activeTab === "subjects" && (
          <div className="space-y-6">
            <div className="liquid-glass-card rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-white/80 flex items-center justify-between bg-white/20">
                <span className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                  Course Subject Breakdown
                </span>
                <button
                  onClick={handleAddSubject}
                  className="px-3 py-1 rounded-md bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Course
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-12 gap-3 text-[11px] font-bold text-[#777777] uppercase tracking-wider px-2">
                  <div className="col-span-5">Subject Name</div>
                  <div className="col-span-2">Attended</div>
                  <div className="col-span-2">Total Classes</div>
                  <div className="col-span-2 text-center">Status (%)</div>
                  <div className="col-span-1 text-right">Del</div>
                </div>

                {subjects.map((sub) => {
                  const subAtt = Math.max(0, sub.attended);
                  const subTot = Math.max(subAtt, sub.total);
                  const subPercent = subTot > 0 ? (subAtt / subTot) * 100 : 0;
                  const isSafe = subPercent >= targetPercentage;

                  return (
                    <div
                      key={sub.id}
                      className="grid grid-cols-12 gap-3 items-center p-2 rounded-lg bg-white/20 border border-white/80"
                    >
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={sub.name}
                          onChange={(e) => handleUpdateSubject(sub.id, "name", e.target.value)}
                          placeholder="Subject Name"
                          className="w-full text-xs px-2.5 py-1.5 rounded border border-white/80 bg-white font-medium text-[#202124] focus:outline-none"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          value={sub.attended}
                          onChange={(e) =>
                            handleUpdateSubject(sub.id, "attended", e.target.value)
                          }
                          className="w-full text-xs px-2.5 py-1.5 rounded border border-white/80 bg-white font-mono text-[#202124] focus:outline-none"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          value={sub.total}
                          onChange={(e) => handleUpdateSubject(sub.id, "total", e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded border border-white/80 bg-white font-mono text-[#202124] focus:outline-none"
                        />
                      </div>

                      <div className="col-span-2 text-center">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                            isSafe
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {subPercent.toFixed(1)}%
                        </span>
                      </div>

                      <div className="col-span-1 text-right">
                        {subjects.length > 1 && (
                          <button
                            onClick={() => handleRemoveSubject(sub.id)}
                            className="text-[#777777] hover:text-rose-600 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Combined bottom summary */}
              <div className="p-4 border-t border-white/80 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[#777777]">Total Across All Subjects:</span>
                  <span className="font-mono font-bold text-white ml-2 text-sm">
                    {combinedStats.sumAtt} / {combinedStats.sumTot} Classes ({combinedStats.overallPercent}%)
                  </span>
                </div>
                <div>
                  {combinedStats.isSafe ? (
                    <span className="text-emerald-400 font-semibold">
                      ✓ Safe: Can miss up to {combinedStats.bunkable} classes overall
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold">
                      ⚠ Need to attend next {combinedStats.needed} classes consecutively
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
