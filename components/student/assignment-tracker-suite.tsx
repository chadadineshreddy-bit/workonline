"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  BookOpen,
  ArrowUpDown
} from "lucide-react";

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  priority: "Urgent" | "High" | "Medium" | "Low";
  status: "Not Started" | "In Progress" | "Completed";
}

const DEFAULT_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg-1",
    title: "Operating Systems Capstone Project: Thread Pool & Virtual Memory Manager",
    subject: "Operating Systems",
    description: "Implement a POSIX C thread-pool library with work-stealing queues and LRU page table simulator.",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    priority: "Urgent",
    status: "In Progress",
  },
  {
    id: "asg-2",
    title: "Database Normalization & Indexing Problem Set",
    subject: "DBMS",
    description: "Solve Boyce-Codd Normal Form decomposition exercises and analyze B+ tree seek costs.",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    priority: "High",
    status: "Not Started",
  },
  {
    id: "asg-3",
    title: "Discrete Math: Graph Coloring Proofs",
    subject: "Mathematics",
    description: "Write formal mathematical induction proofs for planar graph four-color theorem lemmas.",
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0], // Overdue test
    priority: "High",
    status: "Not Started",
  },
  {
    id: "asg-4",
    title: "Technical Seminar Presentation Slides",
    subject: "Seminar",
    description: "Prepare 15-minute presentation deck on Distributed Consensus Algorithms (Raft & Paxos).",
    dueDate: new Date(Date.now() + 86400000 * 9).toISOString().split("T")[0],
    priority: "Medium",
    status: "Completed",
  },
];

export function AssignmentTrackerSuite() {
  const [assignments, setAssignments] = useState<Assignment[]>(DEFAULT_ASSIGNMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"dueDateAsc" | "dueDateDesc" | "priority">("dueDateAsc");

  // Modal / Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDueDate, setFormDueDate] = useState(() =>
    new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
  );
  const [formPriority, setFormPriority] = useState<Assignment["priority"]>("Medium");
  const [formStatus, setFormStatus] = useState<Assignment["status"]>("Not Started");

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("workonline_assignments");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAssignments(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const saveAssignments = (updated: Assignment[]) => {
    setAssignments(updated);
    try {
      localStorage.setItem("workonline_assignments", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleOpenNew = () => {
    setEditId(null);
    setFormTitle("");
    setFormSubject("");
    setFormDesc("");
    setFormDueDate(new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]);
    setFormPriority("Medium");
    setFormStatus("Not Started");
    setIsEditing(true);
  };

  const handleOpenEdit = (asg: Assignment) => {
    setEditId(asg.id);
    setFormTitle(asg.title);
    setFormSubject(asg.subject);
    setFormDesc(asg.description);
    setFormDueDate(asg.dueDate);
    setFormPriority(asg.priority);
    setFormStatus(asg.status);
    setIsEditing(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert("Please enter an assignment title.");
      return;
    }

    if (editId) {
      const updated = assignments.map((a) =>
        a.id === editId
          ? {
              ...a,
              title: formTitle.trim(),
              subject: formSubject.trim() || "General",
              description: formDesc.trim(),
              dueDate: formDueDate,
              priority: formPriority,
              status: formStatus,
            }
          : a
      );
      saveAssignments(updated);
    } else {
      const newAsg: Assignment = {
        id: "asg-" + Date.now(),
        title: formTitle.trim(),
        subject: formSubject.trim() || "General",
        description: formDesc.trim(),
        dueDate: formDueDate,
        priority: formPriority,
        status: formStatus,
      };
      saveAssignments([newAsg, ...assignments]);
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    const updated = assignments.filter((a) => a.id !== id);
    saveAssignments(updated);
  };

  const handleToggleStatus = (id: string) => {
    const updated = assignments.map((a) => {
      if (a.id === id) {
        const nextStatus: Assignment["status"] =
          a.status === "Completed"
            ? "Not Started"
            : a.status === "Not Started"
            ? "In Progress"
            : "Completed";
        return { ...a, status: nextStatus };
      }
      return a;
    });
    saveAssignments(updated);
  };

  // Helper date status
  const getDateStatus = (dueDate: string, status: Assignment["status"]) => {
    if (status === "Completed") return { label: "Completed", type: "completed" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"}`, type: "overdue" };
    }
    if (diffDays === 0) {
      return { label: "Due Today", type: "today" };
    }
    if (diffDays === 1) {
      return { label: "Due Tomorrow", type: "soon" };
    }
    return { label: `Due in ${diffDays} days`, type: "future" };
  };

  // Filtered & sorted
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((a) => {
        const matchesSearch =
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        const dateStat = getDateStatus(a.dueDate, a.status);

        if (statusFilter === "Completed") matchesStatus = a.status === "Completed";
        else if (statusFilter === "In Progress") matchesStatus = a.status === "In Progress";
        else if (statusFilter === "Not Started") matchesStatus = a.status === "Not Started";
        else if (statusFilter === "Overdue") matchesStatus = dateStat.type === "overdue";
        else if (statusFilter === "Pending") matchesStatus = a.status !== "Completed";

        const matchesPriority = priorityFilter === "All" || a.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === "dueDateAsc") {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === "dueDateDesc") {
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        }
        // Priority order: Urgent > High > Medium > Low
        const order = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return order[b.priority] - order[a.priority];
      });
  }, [assignments, searchQuery, statusFilter, priorityFilter, sortBy]);

  // Summary Metrics
  const metrics = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;

    assignments.forEach((a) => {
      if (a.status === "Completed") completed++;
      else {
        if (a.status === "In Progress") inProgress++;
        const stat = getDateStatus(a.dueDate, a.status);
        if (stat.type === "overdue") overdue++;
      }
    });

    return {
      total: assignments.length,
      completed,
      inProgress,
      overdue,
      pending: assignments.length - completed,
    };
  }, [assignments]);

  const getPriorityBadge = (p: Assignment["priority"]) => {
    switch (p) {
      case "Urgent":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "High":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Medium":
        return "bg-red-500/15 text-[#D72638] border-[#F04452]/25";
      default:
        return "bg-white/30 text-[#202124] border-white/80";
    }
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
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Assignment & Homework Tracker
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNew}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Assignment</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
            Academic Tasks & Assignments
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-3xl">
            Track coursework deadlines, project milestones, and exam submissions with automatic due date warnings and local persistence.
          </p>
        </div>

        {/* Dashboard Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-white/80 shadow-xs">
            <span className="text-[11px] font-bold text-[#777777] uppercase tracking-wider block">
              Total Tasks
            </span>
            <span className="text-2xl font-black text-[#202124] font-mono">{metrics.total}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-white/80 shadow-xs">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">
              In Progress
            </span>
            <span className="text-2xl font-black text-amber-600 font-mono">{metrics.inProgress}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-white/80 shadow-xs">
            <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">
              Overdue
            </span>
            <span className="text-2xl font-black text-rose-600 font-mono">{metrics.overdue}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-white/80 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">
              Completed
            </span>
            <span className="text-2xl font-black text-emerald-600 font-mono">{metrics.completed}</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="liquid-glass-card rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assignments or subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status pills */}
            <div className="flex gap-1">
              {["All", "Pending", "Overdue", "Completed"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                    statusFilter === st
                      ? "bg-slate-900 text-white font-bold"
                      : "bg-white/30 text-[#777777] hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 text-xs text-[#777777] ml-auto">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs px-2 py-1 rounded border border-white/80 bg-white"
              >
                <option value="dueDateAsc">Due Date (Earliest)</option>
                <option value="dueDateDesc">Due Date (Latest)</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-3">
          {filteredAssignments.map((asg) => {
            const dateStat = getDateStatus(asg.dueDate, asg.status);
            return (
              <div
                key={asg.id}
                className={`p-4 rounded-xl border bg-white shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  dateStat.type === "overdue"
                    ? "border-rose-300 bg-rose-50/20"
                    : asg.status === "Completed"
                    ? "border-white/80 opacity-75"
                    : "border-white/80 hover:border-white/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleStatus(asg.id)}
                    className="mt-0.5 text-[#777777] hover:text-emerald-600 transition-colors"
                    title="Click to toggle status"
                  >
                    {asg.status === "Completed" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <div className="w-5 h-5 rounded border-2 border-white/80 hover:border-blue-500" />
                    )}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#202124]">
                        {asg.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/30 text-[#202124]">
                        {asg.subject}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                          asg.priority
                        )}`}
                      >
                        {asg.priority}
                      </span>
                    </div>

                    {asg.description && (
                      <p className="text-xs text-[#777777] max-w-2xl leading-relaxed mb-2">
                        {asg.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px]">
                      <span
                        className={`font-semibold font-mono flex items-center gap-1 ${
                          dateStat.type === "overdue"
                            ? "text-rose-600"
                            : dateStat.type === "today"
                            ? "text-amber-600"
                            : "text-[#777777]"
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        {asg.dueDate} ({dateStat.label})
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[#777777] font-medium">Status: {asg.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 justify-end">
                  <button
                    onClick={() => handleOpenEdit(asg)}
                    className="p-1.5 rounded-lg border border-white/80 text-[#777777] hover:bg-white/30 transition-colors"
                    title="Edit assignment"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(asg.id)}
                    className="p-1.5 rounded-lg border border-white/80 text-[#777777] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete assignment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredAssignments.length === 0 && (
            <div className="text-center py-12 liquid-glass-card rounded-2xl text-xs text-[#777777]">
              No assignments match your criteria.
            </div>
          )}
        </div>
      </div>

      {/* Edit / Create Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="liquid-glass-card rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#202124]">
              {editId ? "Edit Assignment" : "Add New Assignment"}
            </h3>

            <form onSubmit={handleSaveForm} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#202124] block mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems Lab 3: Page Replacement"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#202124] block mb-1">
                    Subject / Course
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#202124] block mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#202124] block mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-white/80 bg-white"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#202124] block mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-white/80 bg-white"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#202124] block mb-1">
                  Description / Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Submission instructions, team members, deliverables..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] transition-colors shadow-xs"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
