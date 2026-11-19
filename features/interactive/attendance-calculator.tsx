"use client";

import React, { useState, useMemo } from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Sliders,
  ChevronRight
} from "lucide-react";

export function AttendanceCalculator() {
  const [attended, setAttended] = useState<number>(38);
  const [total, setTotal] = useState<number>(45);
  const [targetPercentage, setTargetPercentage] = useState<number>(75);

  const stats = useMemo(() => {
    const att = Math.max(0, Number(attended) || 0);
    const tot = Math.max(att, Number(total) || 0);
    const target = Number(targetPercentage) || 75;

    if (tot === 0) {
      return {
        percentage: 0,
        isSafe: true,
        bunkable: 0,
        needed: 0,
        status: "neutral",
      };
    }

    const currentPercent = (att / tot) * 100;
    const isSafe = currentPercent >= target;

    // How many classes can be safely missed:
    // (att) / (tot + x) >= target/100
    // att >= (target/100) * tot + (target/100) * x
    // x <= (att - (target/100) * tot) / (target/100)
    let bunkable = 0;
    if (isSafe && target > 0) {
      bunkable = Math.floor((att * 100 - target * tot) / target);
      if (bunkable < 0) bunkable = 0;
    }

    // How many classes need to be attended:
    // (att + y) / (tot + y) >= target/100
    // 100*att + 100*y >= target*tot + target*y
    // y * (100 - target) >= target*tot - 100*att
    let needed = 0;
    if (!isSafe && target < 100) {
      needed = Math.ceil((target * tot - 100 * att) / (100 - target));
      if (needed < 0) needed = 0;
    }

    return {
      percentage: currentPercent.toFixed(1),
      isSafe,
      bunkable,
      needed,
      status: isSafe ? "safe" : "danger",
    };
  }, [attended, total, targetPercentage]);

  return (
    <div className="space-y-8">
      {/* Target Setting Pill Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Target Threshold:
          </span>
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800">
            {[70, 75, 80, 85].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setTargetPercentage(p)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  targetPercentage === p
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setAttended(38);
            setTotal(45);
            setTargetPercentage(75);
          }}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset demo data</span>
        </button>
      </div>

      {/* Main KPI Status Banner */}
      <div
        className={`p-6 rounded-2xl border ${
          stats.isSafe
            ? "bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/60"
            : "bg-rose-50/70 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/60"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                stats.isSafe
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
              }`}
            >
              {stats.isSafe ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                  Current Standing
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    stats.isSafe
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300"
                  }`}
                >
                  {stats.isSafe ? "Above Target" : "Attendance Shortage"}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.percentage}% Attendance
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                {stats.isSafe ? (
                  <>
                    You are in the safe zone! You can safely miss up to{" "}
                    <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                      {stats.bunkable} more classes
                    </strong>{" "}
                    while remaining above your {targetPercentage}% requirement.
                  </>
                ) : (
                  <>
                    Warning: Attendance is below required threshold! You must attend the next{" "}
                    <strong className="text-rose-700 dark:text-rose-400 font-bold">
                      {stats.needed} consecutive classes
                    </strong>{" "}
                    to recover to {targetPercentage}%.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 min-w-[180px] text-center">
            <span className="text-xs text-slate-500">
              {stats.isSafe ? "Classes You Can Skip" : "Required Attendance"}
            </span>
            <div className="text-3xl font-black mt-1 text-slate-900 dark:text-white">
              {stats.isSafe ? stats.bunkable : stats.needed}
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              {stats.isSafe ? "Free Bunks Left" : "Classes To Attend"}
            </span>
          </div>
        </div>
      </div>

      {/* Inputs Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Classes Attended
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max={total}
              value={attended}
              onChange={(e) => setAttended(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-3 text-lg font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
              classes
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            Number of lectures, tutorials, or labs you have physically attended.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Total Classes Conducted
          </label>
          <div className="relative">
            <input
              type="number"
              min={attended}
              value={total}
              onChange={(e) => setTotal(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-3 text-lg font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
              total
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            Total number of classes held so far in the semester.
          </p>
        </div>
      </div>
    </div>
  );
}
