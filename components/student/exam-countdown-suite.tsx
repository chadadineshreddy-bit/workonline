"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  MapPin,
  ArrowUpDown,
  RotateCcw
} from "lucide-react";

export interface ExamItem {
  id: string;
  name: string;
  subject: string;
  dateTime: string; // ISO string or YYYY-MM-DDTHH:mm
  location?: string;
  syllabus?: string;
}

const DEFAULT_EXAMS: ExamItem[] = [
  {
    id: "ex-1",
    name: "Operating Systems Final Examination",
    subject: "Computer Science",
    dateTime: new Date(Date.now() + 86400000 * 3 + 3600000 * 4).toISOString().substring(0, 16),
    location: "Hall B - Room 204",
    syllabus: "Processes, Threads, CPU Scheduling, Deadlocks, Virtual Memory Paging, and File Systems",
  },
  {
    id: "ex-2",
    name: "Database Systems Midterm Test",
    subject: "DBMS",
    dateTime: new Date(Date.now() + 86400000 * 8 + 3600000 * 2).toISOString().substring(0, 16),
    location: "Main Auditorium",
    syllabus: "Relational Algebra, SQL DDL/DML, Normal Forms (1NF-BCNF), and B+ Tree Indexing",
  },
  {
    id: "ex-3",
    name: "Engineering Mathematics IV Exam",
    subject: "Mathematics",
    dateTime: new Date(Date.now() + 86400000 * 14).toISOString().substring(0, 16),
    location: "Science Block Rm 102",
    syllabus: "Complex Analysis, Probability Distributions, and Fourier Transforms",
  },
];

export function ExamCountdownSuite() {
  const [exams, setExams] = useState<ExamItem[]>(DEFAULT_EXAMS);
  const [now, setNow] = useState<number>(Date.now());

  // Form / Modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [syllabus, setSyllabus] = useState("");

  // Live ticker updating every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("workonline_exam_countdown");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setExams(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const saveExams = (updated: ExamItem[]) => {
    setExams(updated);
    try {
      localStorage.setItem("workonline_exam_countdown", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setName("");
    setSubject("");
    const defaultDate = new Date(Date.now() + 86400000 * 5);
    setDateTime(defaultDate.toISOString().substring(0, 16));
    setLocation("");
    setSyllabus("");
    setIsEditing(true);
  };

  const handleOpenEdit = (exam: ExamItem) => {
    setEditId(exam.id);
    setName(exam.name);
    setSubject(exam.subject);
    setDateTime(exam.dateTime);
    setLocation(exam.location || "");
    setSyllabus(exam.syllabus || "");
    setIsEditing(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dateTime) {
      alert("Please provide the exam title and date.");
      return;
    }

    if (editId) {
      const updated = exams.map((ex) =>
        ex.id === editId
          ? {
              ...ex,
              name: name.trim(),
              subject: subject.trim() || "Academics",
              dateTime,
              location: location.trim(),
              syllabus: syllabus.trim(),
            }
          : ex
      );
      saveExams(updated);
    } else {
      const newEx: ExamItem = {
        id: "ex-" + Date.now(),
        name: name.trim(),
        subject: subject.trim() || "Academics",
        dateTime,
        location: location.trim(),
        syllabus: syllabus.trim(),
      };
      saveExams([...exams, newEx]);
    }
    setIsEditing(false);
  };

  const handleDeleteExam = (id: string) => {
    const updated = exams.filter((ex) => ex.id !== id);
    saveExams(updated);
  };

  // Helper calculation for countdown
  const getCountdown = (targetDateTime: string) => {
    const targetMs = new Date(targetDateTime).getTime();
    const diffMs = targetMs - now;

    if (diffMs <= 0) {
      const pastDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
      return {
        isPast: true,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        label: pastDays === 0 ? "Completed today" : `Completed ${pastDays} day${pastDays === 1 ? "" : "s"} ago`,
      };
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return {
      isPast: false,
      days,
      hours,
      minutes,
      seconds,
      label: `${days}d ${hours}h ${minutes}m ${seconds}s`,
    };
  };

  // Sort upcoming first
  const sortedExams = useMemo(() => {
    return [...exams].sort((a, b) => {
      return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
    });
  }, [exams]);

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
              <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                <Calendar className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Exam Countdown & Schedule Tracker
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Exam</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
            Upcoming Exam Countdowns
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-3xl">
            Live real-time count down to university semester finals, entrance assessments, and competitive tests.
          </p>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedExams.map((exam) => {
            const cd = getCountdown(exam.dateTime);
            const isCritical = !cd.isPast && cd.days < 3;
            const isApproaching = !cd.isPast && cd.days >= 3 && cd.days <= 7;

            return (
              <div
                key={exam.id}
                className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition-all ${
                  isCritical
                    ? "border-rose-300 ring-2 ring-rose-100 shadow-md"
                    : isApproaching
                    ? "border-amber-300"
                    : "border-white/80 hover:border-white/80"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/30 text-[#202124]">
                      {exam.subject}
                    </span>

                    {cd.isPast ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/30 text-[#777777]">
                        Past Exam
                      </span>
                    ) : isCritical ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Critical (&lt;3 Days)
                      </span>
                    ) : isApproaching ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        Approaching
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-[#D72638]">
                        Scheduled
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#202124] leading-snug">
                    {exam.name}
                  </h3>

                  {/* Countdown Numbers Grid */}
                  {!cd.isPast ? (
                    <div className="grid grid-cols-4 gap-2 my-4 text-center">
                      <div className="p-2 bg-white/20 rounded-xl border border-white/60">
                        <span className="text-xl font-black text-[#202124] font-mono block">
                          {cd.days}
                        </span>
                        <span className="text-[9px] font-semibold text-[#777777] uppercase">
                          Days
                        </span>
                      </div>
                      <div className="p-2 bg-white/20 rounded-xl border border-white/60">
                        <span className="text-xl font-black text-[#202124] font-mono block">
                          {cd.hours}
                        </span>
                        <span className="text-[9px] font-semibold text-[#777777] uppercase">
                          Hours
                        </span>
                      </div>
                      <div className="p-2 bg-white/20 rounded-xl border border-white/60">
                        <span className="text-xl font-black text-[#202124] font-mono block">
                          {cd.minutes}
                        </span>
                        <span className="text-[9px] font-semibold text-[#777777] uppercase">
                          Mins
                        </span>
                      </div>
                      <div className="p-2 bg-white/20 rounded-xl border border-white/60">
                        <span className="text-xl font-black text-[#F04452] font-mono block">
                          {cd.seconds}
                        </span>
                        <span className="text-[9px] font-semibold text-[#777777] uppercase">
                          Secs
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="my-4 p-3 rounded-xl bg-white/20 text-center text-xs text-[#777777] font-medium">
                      {cd.label}
                    </div>
                  )}

                  <div className="space-y-1 text-xs text-[#777777]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#777777] shrink-0" />
                      <span>{new Date(exam.dateTime).toLocaleString()}</span>
                    </div>

                    {exam.location && (
                      <div className="flex items-center gap-1.5 text-[#777777]">
                        <MapPin className="w-3.5 h-3.5 text-[#777777] shrink-0" />
                        <span className="truncate">{exam.location}</span>
                      </div>
                    )}
                  </div>

                  {exam.syllabus && (
                    <p className="text-[11px] text-[#777777] bg-white/20 p-2.5 rounded-lg mt-3 line-clamp-2 border border-white/60">
                      <strong className="text-[#202124]">Scope:</strong> {exam.syllabus}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/60 mt-4 text-xs">
                  <button
                    onClick={() => handleOpenEdit(exam)}
                    className="text-[#777777] hover:text-[#F04452] font-medium flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteExam(exam.id)}
                    className="text-[#777777] hover:text-rose-600 p-1"
                    title="Delete countdown"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {sortedExams.length === 0 && (
            <div className="col-span-full py-16 text-center text-[#777777] liquid-glass-card rounded-2xl text-xs">
              No exams added yet. Click &quot;Add Exam&quot; to start counting down.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="liquid-glass-card rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#202124]">
              {editId ? "Edit Examination" : "Add Examination"}
            </h3>

            <form onSubmit={handleSaveExam} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#202124] block mb-1">
                  Examination Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems Final"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#202124] block mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#202124] block mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-white/80 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#202124] block mb-1">
                  Exam Venue / Room (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hall 4, Seat 28"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#202124] block mb-1">
                  Syllabus / Notes Scope (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Chapters 1-5, Formula reference sheet allowed..."
                  value={syllabus}
                  onChange={(e) => setSyllabus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-white/80 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] shadow-xs"
                >
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
