"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Printer,
  CheckCircle2,
  BookOpen,
  Edit2,
  AlertCircle,
  Save,
  Check
} from "lucide-react";

interface SubjectPlan {
  id: string;
  name: string;
  priority: "High" | "Medium" | "Low";
  examDate?: string;
}

export interface TimetableSession {
  id: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string;
  endTime: string;
  subjectName: string;
  isBreak?: boolean;
}

const DAYS_OF_WEEK: TimetableSession["day"][] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function StudyTimetableSuite() {
  // Config
  const [availableHoursPerDay, setAvailableHoursPerDay] = useState<number>(3);
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]);
  const [sessionDurationMins, setSessionDurationMins] = useState<number>(60);
  const [breakDurationMins, setBreakDurationMins] = useState<number>(10);
  const [startHour, setStartHour] = useState<string>("18:00"); // 6 PM default

  // Subjects
  const [subjects, setSubjects] = useState<SubjectPlan[]>([
    { id: "sub-1", name: "Operating Systems", priority: "High", examDate: "2026-11-28" },
    { id: "sub-2", name: "Computer Networks", priority: "High", examDate: "2026-12-02" },
    { id: "sub-3", name: "Database Engineering", priority: "Medium", examDate: "2026-12-10" },
    { id: "sub-4", name: "Discrete Mathematics", priority: "Medium", examDate: "2026-12-15" },
    { id: "sub-5", name: "Technical Writing", priority: "Low" },
  ]);

  // Timetable schedule
  const [timetable, setTimetable] = useState<TimetableSession[]>([]);
  const [savedNotification, setSavedNotification] = useState(false);

  // New subject inputs
  const [newSubName, setNewSubName] = useState("");
  const [newSubPriority, setNewSubPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newSubExam, setNewSubExam] = useState("");

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("workonline_study_timetable");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.timetable) && parsed.timetable.length > 0) {
          setTimetable(parsed.timetable);
        } else {
          generateSchedule(subjects, selectedDays, availableHoursPerDay, sessionDurationMins, breakDurationMins, startHour);
        }
        if (Array.isArray(parsed.subjects)) setSubjects(parsed.subjects);
        if (parsed.availableHoursPerDay) setAvailableHoursPerDay(parsed.availableHoursPerDay);
        if (parsed.sessionDurationMins) setSessionDurationMins(parsed.sessionDurationMins);
      } catch {
        generateSchedule(subjects, selectedDays, availableHoursPerDay, sessionDurationMins, breakDurationMins, startHour);
      }
    } else {
      generateSchedule(subjects, selectedDays, availableHoursPerDay, sessionDurationMins, breakDurationMins, startHour);
    }
  }, []);

  const saveToLocalStorage = (table: TimetableSession[], subs: SubjectPlan[]) => {
    try {
      localStorage.setItem(
        "workonline_study_timetable",
        JSON.stringify({
          timetable: table,
          subjects: subs,
          availableHoursPerDay,
          selectedDays,
          sessionDurationMins,
          breakDurationMins,
          startHour,
        })
      );
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 2000);
    } catch {
      // ignore
    }
  };

  // Deterministic timetable generation algorithm
  const generateSchedule = (
    currentSubs: SubjectPlan[],
    days: string[],
    hoursPerDay: number,
    durationMins: number,
    breakMins: number,
    startTimeStr: string
  ) => {
    if (currentSubs.length === 0 || days.length === 0) {
      setTimetable([]);
      return;
    }

    // Build weighted queue of subjects
    // High priority = 3 slots, Medium = 2 slots, Low = 1 slot
    const weightedPool: string[] = [];
    currentSubs.forEach((sub) => {
      const weight = sub.priority === "High" ? 3 : sub.priority === "Medium" ? 2 : 1;
      for (let i = 0; i < weight; i++) {
        weightedPool.push(sub.name);
      }
    });

    const newSchedule: TimetableSession[] = [];
    const totalMinutesAvailable = hoursPerDay * 60;
    const sessionPlusBreak = durationMins + breakMins;
    const sessionsPerDay = Math.floor(totalMinutesAvailable / sessionPlusBreak) || 1;

    let poolIndex = 0;

    days.forEach((dayName) => {
      const [startH, startM] = startTimeStr.split(":").map(Number);
      let currentMinutes = startH * 60 + startM;

      for (let s = 0; s < sessionsPerDay; s++) {
        const subName = weightedPool[poolIndex % weightedPool.length];
        poolIndex++;

        const endMinutes = currentMinutes + durationMins;

        const formatTime = (mins: number) => {
          const h = Math.floor(mins / 60) % 24;
          const m = mins % 60;
          return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        };

        newSchedule.push({
          id: `sess-${dayName}-${s}-${Date.now()}`,
          day: dayName as TimetableSession["day"],
          startTime: formatTime(currentMinutes),
          endTime: formatTime(endMinutes),
          subjectName: subName,
        });

        currentMinutes = endMinutes + breakMins;
      }
    });

    setTimetable(newSchedule);
    saveToLocalStorage(newSchedule, currentSubs);
  };

  const handleDayToggle = (day: string) => {
    const updated = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(updated);
  };

  const handleAddSubject = () => {
    if (!newSubName.trim()) return;
    const newSub: SubjectPlan = {
      id: "sub-" + Date.now(),
      name: newSubName.trim(),
      priority: newSubPriority,
      examDate: newSubExam || undefined,
    };
    const updated = [...subjects, newSub];
    setSubjects(updated);
    setNewSubName("");
    setNewSubExam("");
    saveToLocalStorage(timetable, updated);
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) return;
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    saveToLocalStorage(timetable, updated);
  };

  const handleDeleteSession = (id: string) => {
    const updated = timetable.filter((s) => s.id !== id);
    setTimetable(updated);
    saveToLocalStorage(updated, subjects);
  };

  const handlePrint = () => {
    window.print();
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
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Calendar className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Weekly Study Timetable Generator
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedNotification && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mr-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#777777]" />
              <span>Print Timetable</span>
            </button>
            <button
              onClick={() =>
                generateSchedule(
                  subjects,
                  selectedDays,
                  availableHoursPerDay,
                  sessionDurationMins,
                  breakDurationMins,
                  startHour
                )
              }
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Timetable</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8 print:hidden">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
            Non-Overlapping Study Timetable
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-3xl">
            Distribute study slots across weekdays according to course priority and exam urgency.
            Sessions are spaced with automatic breaks to avoid cognitive burnout.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-5 print:hidden">
            {/* Subject Manager */}
            <div className="liquid-glass-card rounded-2xl p-4 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#F04452]" /> Course Subjects ({subjects.length})
              </h3>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/20 border border-white/80 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#202124] block truncate max-w-[160px]">
                        {sub.name}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-[#777777]">
                        <span
                          className={`font-semibold ${
                            sub.priority === "High"
                              ? "text-rose-600"
                              : sub.priority === "Medium"
                              ? "text-amber-600"
                              : "text-[#F04452]"
                          }`}
                        >
                          {sub.priority} Priority
                        </span>
                        {sub.examDate && <span>• Exam: {sub.examDate}</span>}
                      </div>
                    </div>
                    {subjects.length > 1 && (
                      <button
                        onClick={() => handleRemoveSubject(sub.id)}
                        className="text-[#777777] hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Subject mini form */}
              <div className="pt-2 border-t border-white/60 space-y-2">
                <input
                  type="text"
                  placeholder="Subject name..."
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newSubPriority}
                    onChange={(e) => setNewSubPriority(e.target.value as any)}
                    className="text-xs px-2 py-1.5 rounded-lg border border-white/80 bg-white"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                  <input
                    type="date"
                    value={newSubExam}
                    onChange={(e) => setNewSubExam(e.target.value)}
                    className="text-xs px-2 py-1.5 rounded-lg border border-white/80 bg-white"
                  />
                </div>
                <button
                  onClick={handleAddSubject}
                  className="w-full py-1.5 bg-white/30 hover:bg-slate-200 text-[#202124] text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Course
                </button>
              </div>
            </div>

            {/* Timetable Parameters */}
            <div className="liquid-glass-card rounded-2xl p-4 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F04452]" /> Study Parameters
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-medium text-[#777777] block mb-1">
                    Study Hours Per Day: <strong className="text-[#202124]">{availableHoursPerDay} hrs</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={availableHoursPerDay}
                    onChange={(e) => setAvailableHoursPerDay(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-[#777777] block mb-1">
                      Session Length
                    </label>
                    <select
                      value={sessionDurationMins}
                      onChange={(e) => setSessionDurationMins(parseInt(e.target.value, 10))}
                      className="w-full text-xs px-2 py-1.5 rounded-lg border border-white/80 bg-white"
                    >
                      <option value={45}>45 mins</option>
                      <option value={60}>60 mins</option>
                      <option value={90}>90 mins</option>
                      <option value={120}>120 mins</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#777777] block mb-1">
                      Break Length
                    </label>
                    <select
                      value={breakDurationMins}
                      onChange={(e) => setBreakDurationMins(parseInt(e.target.value, 10))}
                      className="w-full text-xs px-2 py-1.5 rounded-lg border border-white/80 bg-white"
                    >
                      <option value={5}>5 mins</option>
                      <option value={10}>10 mins</option>
                      <option value={15}>15 mins</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#777777] block mb-1">
                    Daily Start Time
                  </label>
                  <input
                    type="time"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 bg-white"
                  />
                </div>

                {/* Days of week chips */}
                <div>
                  <label className="text-[11px] font-medium text-[#777777] block mb-1.5">
                    Active Study Days
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map((d) => {
                      const isSelected = selectedDays.includes(d);
                      return (
                        <button
                          key={d}
                          onClick={() => handleDayToggle(d)}
                          className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                            isSelected
                              ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white font-bold"
                              : "bg-white/30 text-[#777777] hover:bg-slate-200"
                          }`}
                        >
                          {d.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timetable Calendar Display */}
          <div className="lg:col-span-8 space-y-4">
            <div className="liquid-glass-card rounded-2xl shadow-md overflow-hidden p-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/80">
                <div>
                  <h3 className="text-base font-bold text-[#202124]">
                    Weekly Schedule ({timetable.length} Sessions)
                  </h3>
                  <p className="text-xs text-[#777777]">
                    Calculated non-overlapping study blocks with {breakDurationMins}-min recovery breaks
                  </p>
                </div>
              </div>

              {/* Day-by-Day Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DAYS_OF_WEEK.filter((d) => selectedDays.includes(d)).map((day) => {
                  const daySessions = timetable.filter((s) => s.day === day);
                  return (
                    <div
                      key={day}
                      className="border border-white/80 rounded-xl p-3 bg-white/20/60 flex flex-col"
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/80">
                        <span className="text-xs font-bold text-[#202124]">{day}</span>
                        <span className="text-[10px] text-[#777777] font-mono">
                          {daySessions.length} sessions
                        </span>
                      </div>

                      <div className="space-y-2 flex-1">
                        {daySessions.length === 0 ? (
                          <div className="text-[11px] text-[#777777] py-6 text-center">
                            Rest / Off Day
                          </div>
                        ) : (
                          daySessions.map((sess) => (
                            <div
                              key={sess.id}
                              className="p-2.5 rounded-lg liquid-glass-card shadow-2xs group relative hover:border-[#F04452]/30 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="text-xs font-semibold text-[#202124] truncate">
                                  {sess.subjectName}
                                </span>
                                <button
                                  onClick={() => handleDeleteSession(sess.id)}
                                  className="opacity-0 group-hover:opacity-100 text-[#777777] hover:text-rose-600 transition-opacity p-0.5"
                                  title="Remove session"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#F04452] mt-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>
                                  {sess.startTime} – {sess.endTime}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {timetable.length === 0 && (
                <div className="text-center py-12 text-xs text-[#777777]">
                  No sessions generated. Check your selected days and subjects.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
