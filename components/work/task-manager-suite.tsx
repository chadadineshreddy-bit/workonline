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
  Kanban,
  List as ListIcon,
  ArrowRight,
  ArrowLeft,
  ChevronLeft
} from "lucide-react";

export interface WorkplaceTask {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "To Do" | "In Progress" | "Completed";
}

const DEFAULT_WORK_TASKS: WorkplaceTask[] = [
  {
    id: "wt-1",
    title: "Finalize SOC-2 Type II Client-Side Architecture Review",
    description: "Verify that all file transforms execute inside the local browser sandbox with zero network leaks.",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    priority: "Urgent",
    status: "In Progress",
  },
  {
    id: "wt-2",
    title: "Quarterly Revenue & Sprint Budget Presentation",
    description: "Prepare executive slide deck highlighting Q3 customer acquisition cost and lifetime value benchmarks.",
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
    priority: "High",
    status: "To Do",
  },
  {
    id: "wt-3",
    title: "Client SLA Agreement Renewal for Enterprise Accounts",
    description: "Review contract terms, uptime guarantees (99.95%), and premium support tier agreements.",
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0], // Overdue test
    priority: "High",
    status: "To Do",
  },
  {
    id: "wt-4",
    title: "Design System Dark Mode Contrast Audit",
    description: "Ensure all typography meets WCAG AA standards across desktop, tablet, and mobile breakpoints.",
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
    priority: "Medium",
    status: "Completed",
  },
];

export function TaskManagerSuite() {
  const [tasks, setTasks] = useState<WorkplaceTask[]>(DEFAULT_WORK_TASKS);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");

  // Form / Modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(() =>
    new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
  );
  const [priority, setPriority] = useState<WorkplaceTask["priority"]>("Medium");
  const [status, setStatus] = useState<WorkplaceTask["status"]>("To Do");

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("workonline_work_tasks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const saveTasks = (updated: WorkplaceTask[]) => {
    setTasks(updated);
    try {
      localStorage.setItem("workonline_work_tasks", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setTitle("");
    setDescription("");
    setDueDate(new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]);
    setPriority("Medium");
    setStatus("To Do");
    setIsEditing(true);
  };

  const handleOpenEdit = (task: WorkplaceTask) => {
    setEditId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setStatus(task.status);
    setIsEditing(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (editId) {
      const updated = tasks.map((t) =>
        t.id === editId
          ? {
              ...t,
              title: title.trim(),
              description: description.trim(),
              dueDate,
              priority,
              status,
            }
          : t
      );
      saveTasks(updated);
    } else {
      const newTask: WorkplaceTask = {
        id: "wt-" + Date.now(),
        title: title.trim(),
        description: description.trim(),
        dueDate,
        priority,
        status,
      };
      saveTasks([newTask, ...tasks]);
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  const handleAdvanceStatus = (id: string, currentStatus: WorkplaceTask["status"], forward: boolean) => {
    const sequence: WorkplaceTask["status"][] = ["To Do", "In Progress", "Completed"];
    const currentIdx = sequence.indexOf(currentStatus);
    const nextIdx = forward
      ? Math.min(sequence.length - 1, currentIdx + 1)
      : Math.max(0, currentIdx - 1);

    const updated = tasks.map((t) => (t.id === id ? { ...t, status: sequence[nextIdx] } : t));
    saveTasks(updated);
  };

  const isOverdue = (dDate: string, taskStatus: WorkplaceTask["status"]) => {
    if (taskStatus === "Completed") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dDate);
    target.setHours(0, 0, 0, 0);
    return target.getTime() < today.getTime();
  };

  // Filtered
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || t.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  // Real statistics based on actual stored tasks
  const stats = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;

    tasks.forEach((t) => {
      if (t.status === "Completed") completed++;
      else {
        if (t.status === "In Progress") inProgress++;
        if (isOverdue(t.dueDate, t.status)) overdue++;
      }
    });

    return {
      total: tasks.length,
      inProgress,
      completed,
      overdue,
      toDo: tasks.length - completed - inProgress,
    };
  }, [tasks]);

  const getPriorityBadge = (p: WorkplaceTask["priority"]) => {
    switch (p) {
      case "Urgent":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "High":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Medium":
        return "bg-red-500/20 text-[#FB7185] border-red-500/30";
      default:
        return "bg-white/10 text-[#E2D4D6] border-white/15";
    }
  };

  return (
    <div className="text-white space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#FB7185]">
            <Link href="/work-zone" className="hover:text-white transition-colors">
              Work Zone
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#9E8E93]" />
            <span className="text-[#E2D4D6]">Task Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Workplace Tasks & Projects
          </h1>
          <p className="text-xs sm:text-sm text-[#E2D4D6] mt-1">
            Organize deliverables, track sprint progress, and coordinate action items across Kanban columns and structured lists.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="inline-flex p-1 rounded-xl bg-white/[0.05] border border-white/12 shadow-sm">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === "kanban"
                  ? "bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-xs"
                  : "text-[#E2D4D6] hover:text-white"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-xs"
                  : "text-[#E2D4D6] hover:text-white"
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="liquid-btn-glass-crimson px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/30"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Real Task Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="liquid-glass-card p-4 rounded-2xl border border-white/12">
          <span className="text-[11px] font-bold text-[#E2D4D6] uppercase tracking-wider block">
            Active Tasks
          </span>
          <span className="text-2xl font-black text-white font-mono">{stats.total}</span>
        </div>
        <div className="liquid-glass-card p-4 rounded-2xl border border-white/12">
          <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
            In Progress
          </span>
          <span className="text-2xl font-black text-[#FB7185] font-mono">{stats.inProgress}</span>
        </div>
        <div className="liquid-glass-card p-4 rounded-2xl border border-white/12">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
            Overdue
          </span>
          <span className="text-2xl font-black text-rose-400 font-mono">{stats.overdue}</span>
        </div>
        <div className="liquid-glass-card p-4 rounded-2xl border border-white/12">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
            Completed
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono">{stats.completed}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="liquid-glass-card rounded-2xl p-4 border border-white/12 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-[#9E8E93] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex gap-1.5">
            {["All", "To Do", "In Progress", "Completed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  statusFilter === st
                    ? "bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-xs"
                    : "bg-white/5 text-[#E2D4D6] hover:bg-white/10 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#E2D4D6] ml-auto">
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/15 text-white focus:outline-none focus:border-[#DC2626]"
            >
              <option value="All" className="bg-[#171114] text-white">All</option>
              <option value="Urgent" className="bg-[#171114] text-white">Urgent</option>
              <option value="High" className="bg-[#171114] text-white">High</option>
              <option value="Medium" className="bg-[#171114] text-white">Medium</option>
              <option value="Low" className="bg-[#171114] text-white">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {(["To Do", "In Progress", "Completed"] as WorkplaceTask["status"][]).map((colStatus) => {
            const colTasks = filteredTasks.filter((t) => t.status === colStatus);
            return (
              <div
                key={colStatus}
                className="bg-[#100C0E]/90 border border-white/12 rounded-2xl p-4 flex flex-col min-h-[480px] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {colStatus}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#E2D4D6]">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((t) => {
                    const overdue = isOverdue(t.dueDate, t.status);
                    return (
                      <div
                        key={t.id}
                        className={`bg-[#171114] rounded-xl border p-4 shadow-md space-y-2.5 transition-all hover:border-[#DC2626]/40 hover:shadow-red-500/10 ${
                          overdue ? "border-rose-500/40 bg-rose-950/20" : "border-white/12"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-white leading-snug">
                            {t.title}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${getPriorityBadge(
                              t.priority
                            )}`}
                          >
                            {t.priority}
                          </span>
                        </div>

                        {t.description && (
                          <p className="text-[11px] text-[#E2D4D6] line-clamp-2 leading-relaxed">
                            {t.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px]">
                          <span
                            className={`font-mono font-semibold flex items-center gap-1 ${
                              overdue ? "text-rose-400 font-bold" : "text-[#9E8E93]"
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {t.dueDate} {overdue && "• Overdue"}
                          </span>

                          <div className="flex items-center gap-1">
                            {colStatus !== "To Do" && (
                              <button
                                onClick={() => handleAdvanceStatus(t.id, t.status, false)}
                                className="p-1 rounded hover:bg-white/10 text-[#E2D4D6] hover:text-white"
                                title="Move back"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEdit(t)}
                              className="p-1 rounded hover:bg-white/10 text-[#E2D4D6] hover:text-white"
                              title="Edit"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-1 rounded hover:bg-red-500/20 text-[#E2D4D6] hover:text-rose-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            {colStatus !== "Completed" && (
                              <button
                                onClick={() => handleAdvanceStatus(t.id, t.status, true)}
                                className="p-1 rounded hover:bg-white/10 text-[#FB7185] hover:text-white"
                                title="Move forward"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="text-center py-10 text-xs text-[#9E8E93]">
                      No tasks in {colStatus}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: LIST VIEW */}
      {viewMode === "list" && (
        <div className="liquid-glass-card rounded-2xl shadow-lg border border-white/12 divide-y divide-white/10 overflow-hidden">
          {filteredTasks.map((t) => {
            const overdue = isOverdue(t.dueDate, t.status);
            return (
              <div
                key={t.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  overdue ? "bg-rose-950/20" : "hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() =>
                      handleAdvanceStatus(
                        t.id,
                        t.status,
                        t.status !== "Completed"
                      )
                    }
                    className="mt-0.5 text-[#9E8E93] hover:text-emerald-400"
                  >
                    {t.status === "Completed" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <div className="w-5 h-5 rounded border-2 border-white/30 hover:border-[#DC2626]" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold text-white ${t.status === "Completed" ? "line-through text-[#9E8E93]" : ""}`}>
                        {t.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getPriorityBadge(
                          t.priority
                        )}`}
                      >
                        {t.priority}
                      </span>
                      <span className="text-[10px] text-[#9E8E93] font-medium">
                        Status: {t.status}
                      </span>
                    </div>
                    {t.description && (
                      <p className="text-xs text-[#E2D4D6] max-w-xl">{t.description}</p>
                    )}
                    <span className={`text-[11px] font-mono mt-1 block ${overdue ? "text-rose-400 font-bold" : "text-[#9E8E93]"}`}>
                      Due: {t.dueDate} {overdue && "• OVERDUE"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 rounded-lg border border-white/12 text-[#E2D4D6] hover:text-white hover:bg-white/10"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 rounded-lg border border-white/12 text-[#E2D4D6] hover:text-rose-400 hover:bg-red-500/10"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-xs text-[#9E8E93]">
              No tasks match your filter.
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#171114] border border-white/15 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-white">
            <h3 className="text-base font-bold text-white">
              {editId ? "Edit Task" : "Create New Workplace Task"}
            </h3>

            <form onSubmit={handleSaveTask} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#E2D4D6] block mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prepare Q4 API latency benchmarks"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-[#DC2626] font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#E2D4D6] block mb-1">
                  Description / Deliverables
                </label>
                <textarea
                  rows={3}
                  placeholder="Scope, ticket IDs, documentation links..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-[#DC2626] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#E2D4D6] block mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white focus:outline-none focus:border-[#DC2626]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#E2D4D6] block mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white focus:outline-none focus:border-[#DC2626]"
                  >
                    <option value="Low" className="bg-[#171114] text-white">Low</option>
                    <option value="Medium" className="bg-[#171114] text-white">Medium</option>
                    <option value="High" className="bg-[#171114] text-white">High</option>
                    <option value="Urgent" className="bg-[#171114] text-white">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#E2D4D6] block mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white focus:outline-none focus:border-[#DC2626]"
                >
                  <option value="To Do" className="bg-[#171114] text-white">To Do</option>
                  <option value="In Progress" className="bg-[#171114] text-white">In Progress</option>
                  <option value="Completed" className="bg-[#171114] text-white">Completed</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 rounded-xl border border-white/15 text-xs font-medium text-[#E2D4D6] hover:bg-white/10 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="liquid-btn-glass-crimson px-5 py-2 text-xs font-bold text-white shadow-md shadow-red-600/30"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
