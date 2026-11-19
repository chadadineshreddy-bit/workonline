"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  Sun,
  Coffee,
  CheckSquare,
  Edit2
} from "lucide-react";

export interface PlannerBlock {
  id: string;
  title: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  priority: "High" | "Medium" | "Low";
  isBreak?: boolean;
  completed?: boolean;
}

const DEFAULT_SCHEDULE: PlannerBlock[] = [
  {
    id: "b1",
    title: "Morning Standup & Sprint Sync",
    startTime: "09:00",
    endTime: "09:30",
    priority: "High",
    completed: true,
  },
  {
    id: "b2",
    title: "Deep Work: Client-Side Security Audits",
    startTime: "09:45",
    endTime: "11:45",
    priority: "High",
    completed: true,
  },
  {
    id: "b3",
    title: "Coffee & Walk Break",
    startTime: "11:45",
    endTime: "12:00",
    priority: "Low",
    isBreak: true,
    completed: false,
  },
  {
    id: "b4",
    title: "Pull Request Reviews & API Benchmarking",
    startTime: "12:00",
    endTime: "13:30",
    priority: "Medium",
    completed: false,
  },
  {
    id: "b5",
    title: "Lunch Break",
    startTime: "13:30",
    endTime: "14:15",
    priority: "Low",
    isBreak: true,
    completed: false,
  },
  {
    id: "b6",
    title: "Stakeholder Demo & Roadmap Discussion",
    startTime: "14:30",
    endTime: "15:30",
    priority: "High",
    completed: false,
  },
  {
    id: "b7",
    title: "Documentation & Daily Wrap-up",
    startTime: "16:00",
    endTime: "17:00",
    priority: "Medium",
    completed: false,
  },
];

export function WorkPlannerSuite() {
  const [scheduleDate, setScheduleDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [blocks, setBlocks] = useState<PlannerBlock[]>(DEFAULT_SCHEDULE);

  // New task form state
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [priority, setPriority] = useState<PlannerBlock["priority"]>("Medium");
  const [isBreak, setIsBreak] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("workonline_daily_work_planner");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBlocks(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const saveBlocks = (updated: PlannerBlock[]) => {
    setBlocks(updated);
    try {
      localStorage.setItem("workonline_daily_work_planner", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Convert "HH:mm" to minutes from midnight
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  // Detect overlapping time blocks
  const overlaps = useMemo(() => {
    const overlappingIds = new Set<string>();
    for (let i = 0; i < blocks.length; i++) {
      const a = blocks[i];
      const startA = toMinutes(a.startTime);
      const endA = toMinutes(a.endTime);

      for (let j = i + 1; j < blocks.length; j++) {
        const b = blocks[j];
        const startB = toMinutes(b.startTime);
        const endB = toMinutes(b.endTime);

        // Check if interval [startA, endA) overlaps with [startB, endB)
        if (startA < endB && startB < endA) {
          overlappingIds.add(a.id);
          overlappingIds.add(b.id);
        }
      }
    }
    return overlappingIds;
  }, [blocks]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please provide a task or break title.");
      return;
    }

    if (toMinutes(endTime) <= toMinutes(startTime)) {
      alert("End time must be after start time.");
      return;
    }

    const newBlock: PlannerBlock = {
      id: "blk-" + Date.now(),
      title: title.trim(),
      startTime,
      endTime,
      priority,
      isBreak,
      completed: false,
    };

    const updated = [...blocks, newBlock].sort(
      (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
    );
    saveBlocks(updated);
    setTitle("");
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    saveBlocks(updated);
  };

  const handleToggleCompleted = (id: string) => {
    const updated = blocks.map((b) =>
      b.id === id ? { ...b, completed: !b.completed } : b
    );
    saveBlocks(updated);
  };

  // Daily statistics
  const metrics = useMemo(() => {
    let focusMinutes = 0;
    let completedMinutes = 0;
    let breakMinutes = 0;

    blocks.forEach((b) => {
      const dur = Math.max(0, toMinutes(b.endTime) - toMinutes(b.startTime));
      if (b.isBreak) {
        breakMinutes += dur;
      } else {
        focusMinutes += dur;
        if (b.completed) completedMinutes += dur;
      }
    });

    const totalMinutes = focusMinutes + breakMinutes;

    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      focusHours: (focusMinutes / 60).toFixed(1),
      completedHours: (completedMinutes / 60).toFixed(1),
      breakHours: (breakMinutes / 60).toFixed(1),
      completedCount: blocks.filter((b) => b.completed && !b.isBreak).length,
      totalCount: blocks.filter((b) => !b.isBreak).length,
    };
  }, [blocks]);

  return (
    <div className="text-white space-y-8">
      {/* Top Banner */}
      <div className="liquid-glass-pill p-3 px-6 mb-6 flex items-center justify-between print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/work-zone"
              className="text-xs font-semibold text-[#F04452] hover:text-[#D72638] flex items-center gap-1"
            >
              Work Zone <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <Sun className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Daily Work Planner & Time-Blocking
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdding(true)}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Block</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
              Daily Time-Blocking Schedule
            </h2>
            <p className="text-xs sm:text-sm text-[#777777] mt-1">
              Structure your workday into dedicated deep work slots and scheduled rest intervals with automatic overlap prevention.
            </p>
          </div>

          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/80 bg-white font-medium text-[#202124] self-start sm:self-auto"
          />
        </div>

        {/* Overlap Warning Alert */}
        {overlaps.size > 0 && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Schedule Overlap Detected:</strong> One or more scheduled task blocks have conflicting start and end times. Review highlighted entries below.
            </span>
          </div>
        )}

        {/* Daily Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-white/80 shadow-xs">
            <span className="text-[11px] font-bold text-[#777777] uppercase tracking-wider block">
              Scheduled Work
            </span>
            <span className="text-2xl font-black text-[#202124] font-mono">
              {metrics.focusHours}h
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-white/80 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">
              Completed Hours
            </span>
            <span className="text-2xl font-black text-emerald-600 font-mono">
              {metrics.completedHours}h
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-white/80 shadow-xs">
            <span className="text-[11px] font-bold text-teal-500 uppercase tracking-wider block">
              Break Time
            </span>
            <span className="text-2xl font-black text-teal-600 font-mono">
              {metrics.breakHours}h
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-white/80 shadow-xs">
            <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">
              Tasks Completed
            </span>
            <span className="text-2xl font-black text-[#F04452] font-mono">
              {metrics.completedCount} / {metrics.totalCount}
            </span>
          </div>
        </div>

        {/* Daily Timeline List */}
        <div className="liquid-glass-card rounded-2xl shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/60">
            <h3 className="text-sm font-bold text-[#202124]">
              Schedule Timeline ({blocks.length} Blocks)
            </h3>
            <button
              onClick={() => setIsAdding(true)}
              className="text-xs text-[#F04452] hover:text-[#D72638] font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Session
            </button>
          </div>

          <div className="space-y-3">
            {blocks.map((b) => {
              const hasConflict = overlaps.has(b.id);
              return (
                <div
                  key={b.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    hasConflict
                      ? "border-amber-400 bg-amber-50/40"
                      : b.isBreak
                      ? "border-teal-200 bg-teal-50/30"
                      : b.completed
                      ? "border-white/80 opacity-75 bg-white/20"
                      : "border-white/80 hover:border-white/80 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {!b.isBreak ? (
                      <button
                        onClick={() => handleToggleCompleted(b.id)}
                        className="text-[#777777] hover:text-emerald-600"
                      >
                        {b.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <div className="w-5 h-5 rounded border-2 border-white/80 hover:border-blue-500" />
                        )}
                      </button>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                        <Coffee className="w-3 h-3" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold text-[#202124] ${
                            b.completed ? "line-through text-[#777777]" : ""
                          }`}
                        >
                          {b.title}
                        </span>
                        {b.isBreak ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                            Rest Interval
                          </span>
                        ) : (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                              b.priority === "High"
                                ? "bg-rose-100 text-rose-800 border-rose-200"
                                : b.priority === "Medium"
                                ? "bg-red-500/15 text-[#D72638] border-[#F04452]/25"
                                : "bg-white/30 text-[#777777] border-white/80"
                            }`}
                          >
                            {b.priority}
                          </span>
                        )}
                        {hasConflict && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                            Overlap Conflict
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-[#777777] mt-1">
                        <Clock className="w-3 h-3 text-[#777777]" />
                        <span>
                          {b.startTime} – {b.endTime} (
                          {toMinutes(b.endTime) - toMinutes(b.startTime)} mins)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1 rounded hover:bg-rose-50 text-[#777777] hover:text-rose-600"
                      title="Delete block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {blocks.length === 0 && (
              <div className="text-center py-10 text-xs text-[#777777]">
                No blocks scheduled for today. Click &quot;Add Block&quot; to begin your day.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Block Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="liquid-glass-card rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#202124]">Add Schedule Block</h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#202124] block mb-1">
                  Task or Break Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design review / Walk & recharge"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#202124] block mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#202124] block mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-[#202124] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBreak}
                    onChange={(e) => setIsBreak(e.target.checked)}
                    className="rounded border-white/80 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Mark as Rest / Break Interval</span>
                </label>
              </div>

              {!isBreak && (
                <div>
                  <label className="text-xs font-medium text-[#202124] block mb-1">
                    Priority Tier
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3.5 py-2 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] shadow-xs"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
