"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Mail,
  FileSpreadsheet,
  FileText,
  Clock,
  CheckSquare,
  QrCode,
  PenTool,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Plus,
  ListTodo,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface WorkToolItem {
  title: string;
  description: string;
  href: string;
  icon: any;
  badge: string;
  category: "Communication" | "Data & Analytics" | "Task & Time" | "Business Utilities";
}

const WORK_TOOLS: WorkToolItem[] = [
  {
    title: "Professional Email Composer",
    description:
      "Draft concise workplace emails with 6 tone presets (executive, polite, urgent, follow-up), prompt starters, and one-click clipboard copy.",
    href: "/work-zone/email-writer",
    icon: Mail,
    badge: "6 Tone Presets",
    category: "Communication",
  },
  {
    title: "Formal Business Letter Generator",
    description:
      "Generate formatted corporate correspondence: resignation letters, leave requests, promotions, and memos with instant DOCX & PDF downloads.",
    href: "/work-zone/business-letters",
    icon: FileText,
    badge: "DOCX Export",
    category: "Communication",
  },
  {
    title: "Excel Formula Assistant & Cheatsheet",
    description:
      "Look up, build, and test standard Excel formulas: VLOOKUP, INDEX/MATCH, XLOOKUP, nested IFs, and financial functions with syntax guides.",
    href: "/work-zone/excel-tools",
    icon: FileSpreadsheet,
    badge: "50+ Formulas",
    category: "Data & Analytics",
  },
  {
    title: "CSV & Data Analyzer",
    description:
      "Parse, inspect, clean, deduplicate, filter, and convert CSV and tabular data directly in your browser without uploading proprietary data.",
    href: "/work-zone/csv-tools",
    icon: FileSpreadsheet,
    badge: "Zero-Leak Sandbox",
    category: "Data & Analytics",
  },
  {
    title: "Meeting Minutes Generator",
    description:
      "Format structured executive meeting briefs with attendees, agenda discussion points, action items, assignees, and deadlines.",
    href: "/work-zone/meeting-minutes",
    icon: Clock,
    badge: "Action Item Matrix",
    category: "Communication",
  },
  {
    title: "Workplace Task & Priority Manager",
    description:
      "Organize daily deliverables with Kanban drag/status toggles, priority tags, due date reminders, and persistent local autosave.",
    href: "/work-zone/task-manager",
    icon: CheckSquare,
    badge: "Kanban Board",
    category: "Task & Time",
  },
  {
    title: "Daily Work Planner & Time-Blocker",
    description:
      "Schedule your workday in 30-minute productivity blocks, track deep-work hours, and align with daily deliverable goals.",
    href: "/work-zone/work-planner",
    icon: Calendar,
    badge: "Time-Blocking",
    category: "Task & Time",
  },
  {
    title: "Invoice & Billing Generator",
    description:
      "Generate clean client invoices with itemized line items, auto-calculated subtotal, tax rates, currency selection, and instant PDF download.",
    href: "/work-zone/invoice-generator",
    icon: FileText,
    badge: "Auto Calculate",
    category: "Business Utilities",
  },
  {
    title: "Business QR Code Generator",
    description:
      "Create high-DPI QR codes for URLs, WiFi credentials, vCards, phone numbers, and plain text with custom colors and logo embedding.",
    href: "/work-zone/qr-generator",
    icon: QrCode,
    badge: "High-DPI PNG/SVG",
    category: "Business Utilities",
  },
  {
    title: "Digital Signature Tool",
    description:
      "Draw or generate clean, transparent electronic signatures for workplace contracts, approvals, and documents.",
    href: "/work-zone/signature",
    icon: PenTool,
    badge: "Transparent PNG",
    category: "Business Utilities",
  },
  {
    title: "Text & Diff Utilities",
    description:
      "Word and character counters, reading time estimators, letter casing converters, extra whitespace cleaner, and text diff.",
    href: "/work-zone/text-utilities",
    icon: Sparkles,
    badge: "Word Count & Diff",
    category: "Business Utilities",
  },
];

interface StoredTask {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in-progress" | "completed";
  dueDate: string;
}

export function WorkDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [stats, setStats] = useState({
    totalTasks: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    timeBlocks: 0,
  });
  const [topTasks, setTopTasks] = useState<StoredTask[]>([]);

  useEffect(() => {
    try {
      const rawTasks = localStorage.getItem("workonline_work_tasks");
      if (rawTasks) {
        const tasks: StoredTask[] = JSON.parse(rawTasks);
        const todayStr = new Date().toISOString().split("T")[0];
        let pendingCount = 0;
        let compCount = 0;
        let overCount = 0;

        tasks.forEach((t) => {
          if (t.status === "completed") {
            compCount++;
          } else {
            pendingCount++;
            if (t.dueDate && t.dueDate < todayStr) {
              overCount++;
            }
          }
        });

        setStats((prev) => ({
          ...prev,
          totalTasks: tasks.length,
          inProgress: pendingCount,
          completed: compCount,
          overdue: overCount,
        }));

        setTopTasks(tasks.filter((t) => t.status !== "completed").slice(0, 3));
      }

      const rawPlanner = localStorage.getItem("workonline_work_planner");
      if (rawPlanner) {
        const blocks = JSON.parse(rawPlanner);
        if (Array.isArray(blocks)) {
          setStats((prev) => ({ ...prev, timeBlocks: blocks.length }));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const categories = ["All", "Communication", "Data & Analytics", "Task & Time", "Business Utilities"];

  const filteredTools =
    selectedCategory === "All"
      ? WORK_TOOLS
      : WORK_TOOLS.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Hero Banner */}
      <section className="relative overflow-hidden rounded-[24px] bg-[#171114] border border-white/10 p-6 sm:p-10">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-[#DC2626]/30 text-[#FB7185] text-xs font-bold">
            <Briefcase className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>WorkOnline Employee Productivity Hub</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Work Smarter.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC2626] via-[#F43F5E] to-[#FB7185]">
              Execute Faster.
            </span>
          </h1>

          <p className="text-[#E2D4D6] text-xs sm:text-sm leading-relaxed max-w-2xl">
            Equip your daily workplace workflow with dedicated email composing, meeting minutes, Excel formula assistance, spreadsheet conversions, task management, and signature tools.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/work-zone/task-manager"
              className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#b91c1c] text-white font-medium text-xs inline-flex items-center gap-2 transition-colors shadow-sm shadow-[#DC2626]/30"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Manage Tasks
            </Link>
            <Link
              href="/work-zone/email-writer"
              className="px-4 py-2 rounded-xl bg-white/[0.045] hover:bg-white/[0.08] text-white border border-white/10 font-medium text-xs inline-flex items-center gap-2 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#DC2626]" />
              Draft Workplace Email
            </Link>
            <Link
              href="/work-zone/excel-tools"
              className="px-4 py-2 rounded-xl bg-white/[0.045] hover:bg-white/[0.08] text-white border border-white/10 font-medium text-xs inline-flex items-center gap-2 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#DC2626]" />
              Excel Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* Real Productivity Overview Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-[18px] bg-white/[0.045] border border-white/10 p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#9E8E93] uppercase tracking-wider">Active Tasks</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              {stats.inProgress}
            </p>
            <p className="text-[11px] text-[#9E8E93] mt-0.5">Deliverables pending</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center shrink-0">
            <ListTodo className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-[18px] bg-white/[0.045] border border-white/10 p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#9E8E93] uppercase tracking-wider">Completed Tasks</p>
            <p className="text-xl sm:text-2xl font-black text-[#FB7185] mt-1">
              {stats.completed}
            </p>
            <p className="text-[11px] text-[#9E8E93] mt-0.5">Tasks finished</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-[18px] bg-white/[0.045] border border-white/10 p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#9E8E93] uppercase tracking-wider">Overdue Alerts</p>
            <p className={`text-xl sm:text-2xl font-black mt-1 ${stats.overdue > 0 ? "text-[#F43F5E]" : "text-white"}`}>
              {stats.overdue}
            </p>
            <p className="text-[11px] text-[#9E8E93] mt-0.5">Past deadline</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stats.overdue > 0 ? "bg-red-500/20 border border-red-500/40 text-[#F43F5E]" : "bg-white/[0.03] border border-white/10 text-[#9E8E93]"}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-[18px] bg-white/[0.045] border border-white/10 p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#9E8E93] uppercase tracking-wider">Time Blocks</p>
            <p className="text-xl sm:text-2xl font-black text-[#FB7185] mt-1">
              {stats.timeBlocks}
            </p>
            <p className="text-[11px] text-[#9E8E93] mt-0.5">Scheduled hours</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Priority Focus Widget */}
      {topTasks.length > 0 ? (
        <div className="rounded-[20px] bg-white/[0.045] border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#DC2626]" />
              <h3 className="font-bold text-white text-sm">Priority Workplace Deliverables</h3>
            </div>
            <Link
              href="/work-zone/task-manager"
              className="text-xs font-semibold text-[#FB7185] hover:underline flex items-center gap-1 transition-colors"
            >
              View all in Task Manager <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topTasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#DC2626]/40 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      t.priority === "urgent"
                        ? "bg-red-500/20 text-[#F43F5E] border border-red-500/30"
                        : t.priority === "high"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-red-500/10 text-[#FB7185] border border-red-500/20"
                    }`}
                  >
                    {t.priority}
                  </span>
                  {t.dueDate && (
                    <span className="text-[10px] text-[#9E8E93] font-mono">
                      Due: {t.dueDate}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-semibold text-white line-clamp-1">{t.title}</h4>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[20px] bg-white/[0.045] border border-white/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-white text-sm">Organize Your Workplace Tasks & Deliverables</h3>
            <p className="text-xs text-[#9E8E93]">
              Track deliverables with Kanban board view, urgency tags, and overdue alerts right in your browser.
            </p>
          </div>
          <Link
            href="/work-zone/task-manager"
            className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#b91c1c] text-white font-medium text-xs inline-flex items-center gap-2 shrink-0 transition-colors shadow-sm shadow-[#DC2626]/30"
          >
            <Plus className="w-3.5 h-3.5" />
            Open Task Board
          </Link>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-base font-bold text-white">Workplace Tool Directory</h2>
          <p className="text-xs text-[#9E8E93] mt-0.5">
            Select a specialized utility designed for corporate productivity
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[#DC2626] text-white shadow-sm shadow-[#DC2626]/30"
                  : "bg-white/[0.045] text-[#E2D4D6] hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative rounded-[20px] bg-white/[0.045] border border-white/10 hover:border-[#DC2626]/40 p-5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center group-hover:scale-105 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-red-500/10 text-[#FB7185] border border-[#DC2626]/30">
                    {tool.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#FB7185] transition-colors flex items-center gap-1.5">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-[#E2D4D6] mt-1.5 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#FB7185]">
                <span>Open Tool</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Enterprise Privacy Banner */}
      <div className="rounded-[20px] bg-[#171114] border border-white/10 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-white">
              Enterprise-Grade Client-Side Privacy
            </h3>
            <p className="text-xs text-[#9E8E93] max-w-2xl leading-relaxed">
              All spreadsheet calculations, CSV parsing, draft email copy, meeting notes, invoices, and digital signatures are processed strictly inside your browser. No confidential workplace data is ever transferred to or stored on remote servers.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/[0.045] border border-white/10 text-[#FB7185]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#DC2626]" />
          Zero Server Uploads
        </div>
      </div>
    </div>
  );
}
