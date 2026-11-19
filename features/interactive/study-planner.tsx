"use client";

import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  BookOpen
} from "lucide-react";

interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  durationMins: number;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
}

export function StudyPlanner() {
  const [tasks, setTasks] = useState<StudyTask[]>([
    {
      id: "1",
      subject: "Operating Systems",
      topic: "Process Scheduling Algorithms & Virtual Memory Paging",
      durationMins: 90,
      priority: "High",
      completed: true,
    },
    {
      id: "2",
      subject: "Computer Networks",
      topic: "TCP 3-Way Handshake & Sliding Window Protocol",
      durationMins: 60,
      priority: "High",
      completed: false,
    },
    {
      id: "3",
      subject: "Database Systems",
      topic: "B+ Tree Indexing & 3NF Normalization",
      durationMins: 45,
      priority: "Medium",
      completed: false,
    },
    {
      id: "4",
      subject: "Algorithms",
      topic: "Dijkstra and Prim's Minimum Spanning Tree",
      durationMins: 75,
      priority: "High",
      completed: false,
    },
  ]);

  const [newSubject, setNewSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newDuration, setNewDuration] = useState(60);
  const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Low">("Medium");

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        subject: newSubject.trim() || "General",
        topic: newTopic.trim(),
        durationMins: Number(newDuration) || 45,
        priority: newPriority,
        completed: false,
      },
    ]);
    setNewTopic("");
    setNewSubject("");
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const totalHours = Math.round(tasks.reduce((sum, t) => sum + t.durationMins, 0) / 60);

  return (
    <div className="space-y-6">
      {/* Progress Stats */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Revision Progress
          </span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {progressPercent}% Done
            </span>
            <span className="text-xs text-slate-500">
              ({completedCount} of {tasks.length} topics finished)
            </span>
          </div>
        </div>

        <div className="sm:text-right">
          <span className="text-xs text-slate-400">Estimated Total Time</span>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            ~{totalHours} hrs planned
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Task Form */}
        <form
          onSubmit={addTask}
          className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Add Study Session
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Course / Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Distributed Systems"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Topic or Chapter
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Raft Consensus Algorithm"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Duration (Mins)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
        </form>

        {/* Task List */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Revision Schedule ({tasks.length} topics)
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="py-3 flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-medium ${
                        task.completed
                          ? "line-through text-slate-400 dark:text-slate-500"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {task.topic}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        {task.subject}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.durationMins}m
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          task.priority === "High"
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800"
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 transition-opacity shrink-0"
                  title="Delete topic"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
